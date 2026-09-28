#!/usr/bin/env python3
"""
deep-ad-research: scrape the Meta Ad Library, download video ads, transcribe
them with OpenAI Whisper, and write a markdown report sorted longest-running first.

Usage:
  python3 run_research.py --check
  python3 run_research.py --keyword "meal kit delivery" --limit 20 --country GB
  python3 run_research.py --advertiser "Nike" --limit 30 --country US
  python3 run_research.py --keyword "running shoes" --no-transcribe

Outputs (relative to the directory you run from, unless --output-dir is set):
  ./ad-research/<slug>/YYYY-MM-DD-<COUNTRY>.md
  ./ad-research/<slug>/YYYY-MM-DD-<COUNTRY>-raw.json

Keys are read from the environment, then .local.env and .env in the current
directory, then ~/.deep-ad-research.env. Pass --env-file to use another file.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
except ImportError:
    print("Missing dependency: requests. Install it with:  pip3 install requests", file=sys.stderr)
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────

APIFY_ACTOR = "XtaWFhbtfxyzqrFmd"  # curious_coder/facebook-ads-library-scraper
WHISPER_MAX_BYTES = 25 * 1024 * 1024  # OpenAI rejects uploads over 25 MB
DEFAULT_OUTPUT_DIR = Path("ad-research")

APIFY_HELP = "Get a token at https://console.apify.com/account/integrations and set APIFY_TOKEN."
OPENAI_HELP = "Get a key at https://platform.openai.com/api-keys and set OPENAI_API_KEY."


def load_env_files(explicit_file: str | None = None) -> None:
    """Load KEY=VALUE lines into the environment without overriding real env vars."""
    if explicit_file:
        candidates = [Path(explicit_file)]
    else:
        cwd = Path.cwd()
        candidates = [cwd / ".local.env", cwd / ".env", Path.home() / ".deep-ad-research.env"]

    for env_file in candidates:
        if not env_file.exists():
            continue
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip().strip("'\""))


# ── Helpers ───────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def apify_run(input_payload: dict, token: str) -> list[dict]:
    """Start an Apify actor run, poll until it finishes, and return the dataset items."""
    print("[Apify] Starting actor run...")
    run_resp = requests.post(
        f"https://api.apify.com/v2/acts/{APIFY_ACTOR}/runs?token={token}",
        json=input_payload,
        timeout=30,
    )
    run_resp.raise_for_status()
    run_id = run_resp.json()["data"]["id"]
    print(f"[Apify] Run started: {run_id}")

    while True:
        status_resp = requests.get(
            f"https://api.apify.com/v2/actor-runs/{run_id}?token={token}",
            timeout=15,
        )
        status = status_resp.json()["data"]["status"]
        print(f"[Apify] Status: {status}")
        if status in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"):
            break
        time.sleep(5)

    if status != "SUCCEEDED":
        print(f"[Apify] Run ended with status {status}. Check the run at https://console.apify.com/actors/runs/{run_id}", file=sys.stderr)
        sys.exit(1)

    items_resp = requests.get(
        f"https://api.apify.com/v2/actor-runs/{run_id}/dataset/items?token={token}&limit=200",
        timeout=30,
    )
    items_resp.raise_for_status()
    return items_resp.json()


def normalise_date(raw_date) -> str:
    """Return YYYY-MM-DD from a Unix timestamp or ISO string. Empty string if unknown."""
    if raw_date is None or raw_date == "":
        return ""
    if isinstance(raw_date, (int, float)):
        try:
            return datetime.fromtimestamp(raw_date, tz=timezone.utc).strftime("%Y-%m-%d")
        except (OverflowError, OSError, ValueError):
            return str(raw_date)
    return str(raw_date)[:10]


def extract_video_ads(items: list[dict]) -> list[dict]:
    """Keep only ads that have a video URL. Sort oldest start date first."""
    ads = []
    for item in items:
        snap = item.get("snapshot", {})

        # Most page scrapes put the video in snapshot.videos[]
        video_url = None
        for vid in snap.get("videos") or []:
            if vid and (vid.get("video_hd_url") or vid.get("video_sd_url")):
                video_url = vid.get("video_hd_url") or vid.get("video_sd_url")
                break

        # Some results put it at the top level of the snapshot
        if not video_url:
            video_url = (
                snap.get("video_hd_url")
                or snap.get("video_sd_url")
                or snap.get("watermarked_video_hd_url")
            )

        # Carousel ads keep one video per card
        if not video_url:
            for card in snap.get("cards") or []:
                if card and (card.get("video_hd_url") or card.get("video_sd_url")):
                    video_url = card.get("video_hd_url") or card.get("video_sd_url")
                    break

        if not video_url:
            continue

        raw_date = item.get("startDate") or item.get("start_date") or item.get("ad_delivery_start_time")

        ads.append({
            "id": item.get("ad_archive_id", ""),
            "page_name": snap.get("page_name", "Unknown"),
            "page_url": snap.get("page_profile_uri", ""),
            "start_date": normalise_date(raw_date),
            "body": (snap.get("body") or {}).get("text", "") or snap.get("caption", ""),
            "cta_text": snap.get("cta_text", ""),
            "video_url": video_url,
        })

    # Oldest first. An ad that has run for months is one the advertiser keeps paying for.
    ads.sort(key=lambda a: a["start_date"] or "9999-99-99")
    return ads


def download_video(url: str, dest: Path) -> bool:
    """Stream a video to disk. Returns True on success."""
    try:
        resp = requests.get(url, stream=True, timeout=60)
        resp.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"  [!] Download failed: {e}", file=sys.stderr)
        return False


def shrink_for_whisper(video_path: Path) -> Path | None:
    """If the video is over Whisper's limit, extract the audio with ffmpeg. Returns the path to upload, or None."""
    if video_path.stat().st_size <= WHISPER_MAX_BYTES:
        return video_path

    if not shutil.which("ffmpeg"):
        return None

    audio_path = video_path.with_suffix(".mp3")
    result = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(video_path), "-vn", "-b:a", "64k", str(audio_path)],
        capture_output=True,
    )
    if result.returncode != 0 or not audio_path.exists():
        return None
    return audio_path


def transcribe_whisper(video_path: Path, api_key: str) -> str:
    """Transcribe a video with the OpenAI Whisper API. Returns text, or a bracketed note on failure."""
    upload_path = shrink_for_whisper(video_path)
    if upload_path is None:
        return "[Skipped: video over 25 MB, install ffmpeg to transcribe]"

    mime = "audio/mpeg" if upload_path.suffix == ".mp3" else "video/mp4"
    try:
        with open(upload_path, "rb") as f:
            resp = requests.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {api_key}"},
                files={"file": (upload_path.name, f, mime)},
                data={"model": "whisper-1", "response_format": "text"},
                timeout=120,
            )
        if resp.status_code == 200:
            return resp.text.strip()
        return f"[Whisper error {resp.status_code}: {resp.text[:200]}]"
    except Exception as e:
        return f"[Whisper exception: {e}]"


def extract_hook(transcript: str) -> str:
    """Return the first 25 words. The opening line is what stops the scroll."""
    words = transcript.split()
    if len(words) <= 25:
        return transcript
    return " ".join(words[:25]) + "..."


def build_markdown(niche: str, country: str, ads: list[dict], transcripts: dict) -> str:
    date_str = datetime.now().strftime("%Y-%m-%d")
    lines = [
        f"# Ad research: {niche}",
        f"**Date:** {date_str}  ",
        f"**Country:** {country}  ",
        f"**Total video ads found:** {len(ads)}  ",
        "**Sorted:** oldest start date first (longest-running is the best available proxy for profitable)",
        "",
        "---",
        "",
    ]

    for i, ad in enumerate(ads, 1):
        transcript = transcripts.get(ad["id"], "[Not transcribed]")
        hook = extract_hook(transcript) if transcript and not transcript.startswith("[") else "none"
        ad_link = f"https://www.facebook.com/ads/library/?id={ad['id']}" if ad["id"] else ""

        lines += [
            f"## Ad {i}: {ad['page_name']}",
            f"- **Page:** [{ad['page_name']}]({ad['page_url']})",
            f"- **Ad Library link:** {ad_link or 'none'}",
            f"- **Start date:** {ad['start_date'] or 'Unknown'}",
            f"- **CTA:** {ad['cta_text'] or 'none'}",
            f"- **Ad copy:** {ad['body'] or 'none'}",
            "",
            "### Hook",
            f"> {hook}",
            "",
            "### Full transcript",
            "```",
            transcript,
            "```",
            "",
            "---",
            "",
        ]

    return "\n".join(lines)


# ── Setup check ───────────────────────────────────────────────────────────────

def run_check() -> int:
    """Print what is and is not configured. Returns 0 when research can run."""
    apify_ok = bool(os.environ.get("APIFY_TOKEN"))
    openai_ok = bool(os.environ.get("OPENAI_API_KEY"))
    ffmpeg_ok = bool(shutil.which("ffmpeg"))

    def mark(ok: bool) -> str:
        return "OK     " if ok else "MISSING"

    print("deep-ad-research setup check")
    print(f"  {mark(apify_ok)}  APIFY_TOKEN      required for scraping. {'' if apify_ok else APIFY_HELP}")
    print(f"  {mark(openai_ok)}  OPENAI_API_KEY   required for transcription. {'' if openai_ok else OPENAI_HELP}")
    print(f"  {mark(ffmpeg_ok)}  ffmpeg           optional, lets videos over 25 MB be transcribed.")
    print(f"  OK       requests         installed")
    print()
    print("Keys are read from the environment, then .local.env and .env in the current directory,")
    print("then ~/.deep-ad-research.env.")

    if not apify_ok:
        print("\nCannot run: APIFY_TOKEN is missing.")
        return 1
    if not openai_ok:
        print("\nScraping will work. Transcription will not until OPENAI_API_KEY is set. Use --no-transcribe to skip it.")
        return 1
    print("\nReady.")
    return 0


# ── Main ──────────────────────────────────────────────────────────────────────

def build_apify_input(args) -> dict:
    """Build the actor payload. Keyword mode searches the Ad Library; advertiser mode scrapes a page."""
    if args.keyword:
        encoded = args.keyword.replace(" ", "+")
        search_url = (
            "https://www.facebook.com/ads/library/"
            f"?active_status=active&ad_type=all&country={args.country}"
            f"&q={encoded}&search_type=keyword_unordered"
        )
        return {
            "urls": [{"url": search_url}],
            "count": max(args.limit, 10),
            "scrapeAdDetails": True,
            "scrapePageAds.activeStatus": "active",
            "scrapePageAds.countryCode": args.country,
            "scrapePageAds.sortBy": "impressions_desc",
            "scrapePageAds.period": "",
        }

    # Advertiser mode. A full Facebook page URL is more reliable than a guessed one.
    if args.advertiser.startswith("http"):
        page_url = args.advertiser
    else:
        slug = args.advertiser.lower().replace(" ", "").replace(".", "")
        page_url = f"https://www.facebook.com/{slug}"
        print(f"[Note] Guessed page URL {page_url}. Pass the full Facebook page URL if this is wrong.")
    # Country applies here too, so a global brand only shows the ads it runs in your market.
    return {
        "urls": [{"url": page_url}],
        "count": max(args.limit, 10),
        "scrapeAdDetails": True,
        "scrapePageAds.activeStatus": "all",
        "scrapePageAds.countryCode": args.country,
        "scrapePageAds.sortBy": "impressions_desc",
        "scrapePageAds.period": "",
    }


def main():
    parser = argparse.ArgumentParser(description="Meta Ad Library research pipeline")
    parser.add_argument("--keyword", help="Search term customers would use, e.g. 'meal kit delivery'")
    parser.add_argument("--advertiser", help="Competitor page name or full Facebook page URL")
    parser.add_argument("--limit", type=int, default=20, help="Max ads to pull (default: 20)")
    parser.add_argument("--country", default="GB", help="Two-letter country code, or ALL for every market (default: GB)")
    parser.add_argument("--no-transcribe", action="store_true", help="Skip Whisper transcription")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR), help="Where reports go (default: ./ad-research)")
    parser.add_argument("--env-file", help="Path to a KEY=VALUE file with APIFY_TOKEN and OPENAI_API_KEY")
    parser.add_argument("--check", action="store_true", help="Check keys and dependencies, then exit")
    args = parser.parse_args()

    load_env_files(args.env_file)

    if args.check:
        sys.exit(run_check())

    if not args.keyword and not args.advertiser:
        print("Error: provide --keyword or --advertiser", file=sys.stderr)
        sys.exit(1)

    apify_token = os.environ.get("APIFY_TOKEN", "")
    openai_key = os.environ.get("OPENAI_API_KEY", "")
    if not apify_token:
        print(f"Error: APIFY_TOKEN is not set. {APIFY_HELP}", file=sys.stderr)
        sys.exit(1)
    if not args.no_transcribe and not openai_key:
        print(f"Error: OPENAI_API_KEY is not set. {OPENAI_HELP} Or pass --no-transcribe.", file=sys.stderr)
        sys.exit(1)

    niche = args.keyword or args.advertiser
    if niche.startswith("http"):
        niche_slug = slugify(niche.rstrip("/").split("/")[-1])
    else:
        niche_slug = slugify(niche)

    country = args.country.upper()
    apify_input = build_apify_input(args)

    print(f"\n[1/4] Scraping Meta Ad Library for: '{niche}' ({country})")
    items = apify_run(apify_input, apify_token)
    print(f"[1/4] Retrieved {len(items)} ads total")

    print("\n[2/4] Filtering to video ads...")
    ads = extract_video_ads(items)
    print(f"[2/4] Found {len(ads)} video ads (sorted oldest first)")

    # The actor ignores counts under 10, so trim to what the user asked for.
    if len(ads) > args.limit:
        ads = ads[:args.limit]
        print(f"[2/4] Keeping the {args.limit} longest-running")

    if not ads:
        print("No video ads found. Try a different keyword, another country, or a higher --limit.")
        sys.exit(0)

    transcripts = {}
    if args.no_transcribe:
        print("\n[3/4] Skipping transcription (--no-transcribe)")
    else:
        print(f"\n[3/4] Downloading and transcribing {len(ads)} videos...")
        with tempfile.TemporaryDirectory() as tmpdir:
            for i, ad in enumerate(ads, 1):
                print(f"  [{i}/{len(ads)}] {ad['page_name']} (started {ad['start_date'] or 'unknown'})")
                video_path = Path(tmpdir) / f"ad_{ad['id'] or i}.mp4"
                if download_video(ad["video_url"], video_path):
                    transcript = transcribe_whisper(video_path, openai_key)
                    transcripts[ad["id"]] = transcript
                    print(f"    Hook: {extract_hook(transcript)}")
                else:
                    transcripts[ad["id"]] = "[Download failed]"

    print("\n[4/4] Writing research report...")
    output_dir = Path(args.output_dir) / niche_slug
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y-%m-%d")
    report_path = output_dir / f"{date_str}-{country}.md"
    raw_path = output_dir / f"{date_str}-{country}-raw.json"

    report_path.write_text(build_markdown(niche, country, ads, transcripts), encoding="utf-8")
    raw_path.write_text(json.dumps(ads, indent=2, default=str), encoding="utf-8")

    transcribed = sum(1 for t in transcripts.values() if not t.startswith("["))
    print(f"\nDone. {len(ads)} video ads, {transcribed} transcribed.")
    print(f"   Report:   {report_path}")
    print(f"   Raw data: {raw_path}")


if __name__ == "__main__":
    main()
