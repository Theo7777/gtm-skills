#!/usr/bin/env python3
"""Generate one hero image for ad-message-maker.

Picks a backend automatically:

  1. Codex CLI, if a `codex` binary is on PATH (or CODEX_BIN points at one).
     Runs `codex exec` once and asks Codex to use its built-in image tool.
     No API key needed.
  2. OpenAI Images API, if OPENAI_API_KEY is set. Uses gpt-image-2.
  3. Otherwise exits with code 2 and a one-line reason.

Do not run this from inside a Codex session. Codex should call its image
tool directly; a nested `codex exec` cannot write files out of its sandbox.

Usage:

    python3 generate_image.py --out "$PWD/ads/2026-09-10-acme/hero.png" \
        --prompt-file "$PWD/ads/2026-09-10-acme/prompt.txt" --size 1080x1080

    python3 generate_image.py --out ... --prompt "Photorealistic candid shot of ..."

`--out` must be an absolute path inside the current working directory, because
the Codex sandbox only writes inside the folder it was started in.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

DEFAULT_SIZE = "1080x1080"
API_MODEL = "gpt-image-2"
DEFAULT_TIMEOUT_SECONDS = 600


def parse_size(value: str) -> tuple[int, int]:
    try:
        width, height = value.lower().split("x")
        return int(width), int(height)
    except ValueError:
        raise SystemExit(f"--size must look like 1080x1080, got {value!r}")


def read_prompt(args: argparse.Namespace) -> str:
    if args.prompt:
        return args.prompt.strip()
    path = Path(args.prompt_file)
    if not path.exists():
        raise SystemExit(f"prompt file not found: {path}")
    return path.read_text().strip()


def check_out_path(out: Path, cwd: Path) -> None:
    if not out.is_absolute():
        raise SystemExit("--out must be an absolute path")
    try:
        out.relative_to(cwd)
    except ValueError:
        raise SystemExit(f"--out must be inside the current folder ({cwd}) so the Codex sandbox can write it")
    out.parent.mkdir(parents=True, exist_ok=True)


def find_codex() -> str | None:
    candidate = os.environ.get("CODEX_BIN") or shutil.which("codex")
    if candidate and Path(candidate).exists():
        return candidate
    return None


def api_size_for(width: int, height: int) -> str:
    # The API only offers a few sizes. Pick the one with the closest aspect.
    return "1024x1536" if height > width else "1024x1024"


def normalise(out: Path, width: int, height: int) -> str:
    """Resize and centre-crop to the requested size if Pillow is installed."""
    try:
        from PIL import Image
    except ImportError:
        return "Pillow not installed, left image at its generated size (Figma FILL will scale it)"

    with Image.open(out) as im:
        im = im.convert("RGB")
        src_w, src_h = im.size
        if (src_w, src_h) == (width, height):
            im.save(out, "PNG", optimize=True)
            return f"already {width}x{height}"
        scale = max(width / src_w, height / src_h)
        resized = im.resize((round(src_w * scale), round(src_h * scale)), Image.Resampling.LANCZOS)
        left = (resized.width - width) // 2
        top = (resized.height - height) // 2
        resized.crop((left, top, left + width, top + height)).save(out, "PNG", optimize=True)
        return f"resized to {width}x{height}"


def generate_via_codex(codex_bin: str, prompt: str, out: Path, cwd: Path, width: int, height: int, timeout: int) -> None:
    with tempfile.TemporaryDirectory(prefix="ad-message-maker-") as tmp:
        prompt_path = Path(tmp) / "prompt.txt"
        prompt_path.write_text(prompt)

        instruction = (
            "Use the built-in image generation tool (the $imagegen skill), not any API fallback.\n\n"
            f"Generate exactly one photorealistic image from the prompt in {prompt_path}. "
            "Use the file contents as the prompt verbatim. Do not paraphrase or extend it. "
            f"Target size {width}x{height} or the closest the tool supports.\n\n"
            f"Save the result as {out}. If the tool writes it somewhere else, copy it to that exact path. "
            "Do not overwrite any other file. Do not reuse an earlier image.\n\n"
            "If the image tool is unavailable or fails, stop and report the failure. Do not use an API key.\n\n"
            "Finish with one line confirming the file exists at the expected path."
        )

        # --skip-git-repo-check: the project folder is rarely a Codex "trusted" dir.
        # stdin=DEVNULL: without it codex exec waits on stdin forever when run from a script.
        cmd = [
            codex_bin, "exec",
            "--cd", str(cwd),
            "--sandbox", "workspace-write",
            "--skip-git-repo-check",
            "--add-dir", str(Path.home() / ".codex"),
            instruction,
        ]
        print(f"[generate_image] codex exec in {cwd}", file=sys.stderr)
        result = subprocess.run(
            cmd, cwd=str(cwd), timeout=timeout, capture_output=True, text=True, stdin=subprocess.DEVNULL
        )

    if result.returncode != 0:
        raise SystemExit(
            f"codex exec failed (exit {result.returncode})\n"
            f"stdout tail:\n{result.stdout[-1500:]}\nstderr tail:\n{result.stderr[-1500:]}"
        )
    if not out.exists() or out.stat().st_size == 0:
        raise SystemExit(f"codex exec finished but no image landed at {out}")


def generate_via_api(prompt: str, out: Path, width: int, height: int) -> None:
    try:
        import requests
    except ImportError:
        raise SystemExit("the API path needs the requests package: pip install requests")

    response = requests.post(
        "https://api.openai.com/v1/images/generations",
        headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}", "Content-Type": "application/json"},
        json={"model": API_MODEL, "prompt": prompt, "size": api_size_for(width, height), "n": 1},
        timeout=300,
    )
    if response.status_code >= 400:
        raise SystemExit(f"OpenAI image generation failed ({response.status_code}): {response.text[:500]}")

    data = response.json()["data"][0]
    if data.get("b64_json"):
        out.write_bytes(base64.b64decode(data["b64_json"]))
    elif data.get("url"):
        image = requests.get(data["url"], timeout=300)
        image.raise_for_status()
        out.write_bytes(image.content)
    else:
        raise SystemExit(f"OpenAI response had no image data: {list(data.keys())}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate one hero image for ad-message-maker.")
    parser.add_argument("--out", required=True, help="Absolute output path inside the current folder.")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--prompt", help="Prompt text.")
    source.add_argument("--prompt-file", help="Path to a file holding the prompt.")
    parser.add_argument("--size", default=DEFAULT_SIZE, help="WIDTHxHEIGHT, default 1080x1080.")
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT_SECONDS, help="Seconds to wait for Codex.")
    parser.add_argument("--dry-run", action="store_true", help="Show the chosen backend and exit.")
    args = parser.parse_args()

    cwd = Path.cwd().resolve()
    out = Path(args.out).expanduser()
    width, height = parse_size(args.size)
    prompt = read_prompt(args)
    codex_bin = find_codex()
    has_api_key = bool(os.environ.get("OPENAI_API_KEY"))

    if codex_bin:
        backend = "codex"
    elif has_api_key:
        backend = "openai-api"
    else:
        backend = None

    if args.dry_run:
        print(json.dumps({
            "backend": backend,
            "codex_bin": codex_bin,
            "openai_api_key": has_api_key,
            "out": str(out),
            "size": f"{width}x{height}",
            "prompt_chars": len(prompt),
        }, indent=2))
        return 0

    if backend is None:
        print("No image backend: install the Codex CLI or set OPENAI_API_KEY. Use a gradient background instead.", file=sys.stderr)
        return 2

    check_out_path(out, cwd)

    if backend == "codex":
        generate_via_codex(codex_bin, prompt, out, cwd, width, height, args.timeout)
    else:
        generate_via_api(prompt, out, width, height)

    note = normalise(out, width, height)
    print(f"[generate_image] wrote {out} ({out.stat().st_size} bytes, {note})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
