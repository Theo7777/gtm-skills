# deep-ad-research

A Claude Code skill that finds the video ads your competitors keep paying for, transcribes them, and tells you what to test next.

Advertisers kill ads that lose money. So the ads that have been running longest in the Meta Ad Library are, in practice, the ones that work. This skill pulls them for any search term or competitor, gets the words out of every video with Whisper, sorts the set longest-running first, and then writes an insights report against your brand: which hooks dominate, which angles nobody is using, and three to five tests worth running.

It is brand-agnostic. It reads your product context if you have one, and asks for it if you do not.

## Install

This skill ships as a folder in a skills pack. Copy the `deep-ad-research` folder into your skills directory, either for every project:

```bash
cp -R deep-ad-research ~/.claude/skills/deep-ad-research
```

or for one project:

```bash
cp -R deep-ad-research .claude/skills/deep-ad-research
```

Install the one Python dependency (Python 3.9 or later):

```bash
pip3 install -r ~/.claude/skills/deep-ad-research/requirements.txt
```

## Setup

You bring your own API keys. None are stored in the skill.

| Service | Used for | Env var | Get a key | Rough cost |
|---|---|---|---|---|
| Apify | Scraping the Meta Ad Library with the `curious_coder/facebook-ads-library-scraper` actor | `APIFY_TOKEN` | https://console.apify.com/account/integrations | About $0.75 per 1,000 results. The free plan includes a small monthly credit. |
| OpenAI | Transcribing videos with Whisper (`whisper-1`) | `OPENAI_API_KEY` | https://platform.openai.com/api-keys | About $0.006 per minute of video |

`OPENAI_API_KEY` is optional if you only want a metadata scan with `--no-transcribe`.

Set them one of these ways. The script checks them in this order and never overrides a value already set:

1. Export them in your shell: `export APIFY_TOKEN="..."` and `export OPENAI_API_KEY="..."`
2. A `.local.env` or `.env` file in the project you run from
3. `~/.deep-ad-research.env`, shared by every project
4. `--env-file <path>` to point at any other file

A `.env` file looks like this:

```
APIFY_TOKEN=your-apify-token
OPENAI_API_KEY=your-openai-key
```

Keep `.env` out of git. This skill's `.gitignore` already excludes `.env` and `.local.env`; add the same lines to your project's `.gitignore`.

Then confirm everything is wired up:

```bash
python3 ~/.claude/skills/deep-ad-research/scripts/run_research.py --check
```

`ffmpeg` is optional. With it installed, videos over Whisper's 25 MB limit still get transcribed.

## Use

In Claude Code, in the project you want the reports saved to:

> research competitor ads for meal kit delivery in the UK

> what ads is {competitor} running right now

> deep ad research on "plumber software", US and GB, 30 ads each

The skill checks your keys, reads the shared GTM context file (`.agents/product-marketing.md`, then `.claude/product-marketing.md`, written by the `gtm-context` skill) if it exists, and otherwise asks five short questions: what you sell and to whom, who to research, which countries, how many ads, and whether to transcribe. It offers to save the brand answers so it only asks about the research next time.

## What you get

```
ad-research/
  meal-kit-delivery/
    2026-09-10-GB.md            one section per ad: page, link, start date, CTA, copy, hook, transcript
    2026-09-10-GB-raw.json      the same ads as data
    2026-09-10-GB-insights.md   the synthesis
  brand-context.md              saved brand answers, if you said yes
```

The insights file has a fixed shape: summary, the five longest-running ads and why they likely work, a count of hook types with verbatim examples, which angles dominate and which are missing, offers and CTAs, formats, gaps for your brand, recommended tests as creative × audience × offer, and caveats. Every claim points at a numbered ad in the report.

## How it works

1. Builds a Meta Ad Library search URL (keyword mode) or takes a Facebook page URL (advertiser mode) and hands it to the `curious_coder/facebook-ads-library-scraper` actor on Apify.
2. Keeps only ads with a video URL and sorts them by start date, oldest first.
3. Downloads each video to a temporary folder and sends it to Whisper. The first 25 words of the transcript become the hook.
4. Writes the markdown report and raw JSON.
5. Claude reads the reports and writes the insights file following `references/synthesis-template.md`.

You can also run the script on its own:

```bash
python3 scripts/run_research.py --keyword "meal kit delivery" --country GB --limit 20
python3 scripts/run_research.py --advertiser "https://www.facebook.com/{competitor-page}" --country GB
python3 scripts/run_research.py --keyword "running shoes" --no-transcribe   # no OpenAI key needed
```

## Limitations

- Video ads only. Image and text ads are dropped because there is nothing to transcribe.
- Keyword search matches loosely. The Ad Library returns any ad containing the words in any order, so some results will be off-topic. The insights report ignores those and says how many it skipped.
- The Ad Library shows active ads for most advertisers, so ads that were already killed are invisible. The set is biased toward survivors.
- Longest-running is a proxy for profitable, not proof. Large brands can afford to run weak ads.
- Advertiser mode guesses the Facebook page URL from the name. Pass the full URL when the guess is wrong.
- Results are filtered to one country per run in both modes. Use `--country ALL` to see a global brand's full set.
- Whisper invents a short line, often in another language, when a video has no speech. The insights step treats those as untranscribed.
- Whisper mishears brand names and numbers. Check the transcript before quoting one in public.

## Licence

MIT. See `LICENSE`.
