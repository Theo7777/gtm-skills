---
name: deep-ad-research
description: Research what video ads are working in any niche. Scrapes the Meta Ad Library for competitor or keyword ads through Apify, transcribes them with OpenAI Whisper, sorts longest-running first, then writes an insights report on hook patterns, angles, offers, and what it means for your brand. Use when the user wants to see what competitors run on Facebook or Instagram, or which ad hooks and angles dominate a market. Trigger phrases include "research competitor ads", "what ads are working in my niche", "Meta ad library research", "spy on competitor ads", "what is [competitor] running", and "deep ad research".
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
metadata:
  version: 2.0.0
  source: mine
  author: Theo Ohene
---

# Deep ad research

Finds the video ads competitors keep paying for, gets the words out of them, and turns the pile into a plan.

The core idea: an advertiser only keeps running an ad that makes money. Sort the Ad Library by start date and the oldest active ads are the ones to study. This skill scrapes them, transcribes them, and then reads the whole set against your brand context to say what to test next.

Reference files, read when the step needs them:

- `references/context-questions.md` – what to ask when no brand context exists, and what to save
- `references/synthesis-template.md` – the structure and rules for the insights report
- `references/apify-actor.md` – the scraper's input and output shape, for debugging

## Setup

The script needs API keys of your own. Nothing is hard-coded, and nothing is spent until the keys are present.

| Service | What it does here | Env var | Where to get it | Rough cost |
|---|---|---|---|---|
| Apify | Runs the `curious_coder/facebook-ads-library-scraper` actor, which reads the Meta Ad Library | `APIFY_TOKEN` | https://console.apify.com/account/integrations (Settings, then API and Integrations) | About $0.75 per 1,000 ads scraped. Apify's free plan includes a small monthly credit, enough for several runs. |
| OpenAI | Transcribes each video with the Whisper API (`whisper-1`) | `OPENAI_API_KEY` | https://platform.openai.com/api-keys (billing must be enabled) | About $0.006 per minute of video. A 20-ad run is usually under a dollar. |

Only `APIFY_TOKEN` is required. Without `OPENAI_API_KEY` the skill can still run a metadata-only scan with `--no-transcribe`, which skips hooks and transcripts.

Also needed:

- Python 3.9 or later, and the `requests` package: `pip3 install -r requirements.txt`
- `ffmpeg` (optional): lets videos over Whisper's 25 MB upload limit be transcribed from their audio. On macOS, `brew install ffmpeg`.

### Setting the keys

Pick one. The script reads them in this order and never overrides a value already set:

1. **Shell export**, for the current session:
   ```bash
   export APIFY_TOKEN="your-apify-token"
   export OPENAI_API_KEY="your-openai-key"
   ```
2. **A `.local.env` or `.env` file** in the folder you run the research from:
   ```
   APIFY_TOKEN=your-apify-token
   OPENAI_API_KEY=your-openai-key
   ```
3. **`~/.deep-ad-research.env`**, one file for every project, same format.
4. **`--env-file <path>`** on the command line, to point at any other file instead.

Add `.env` and `.local.env` to the `.gitignore` of any project you run this from, so the keys never reach a repository. This skill's own `.gitignore` already excludes both.

## Before you start

1. Run the setup check. Find the script relative to this file; never assume a home directory path.
   ```bash
   python3 "<directory containing this SKILL.md>/scripts/run_research.py" --check
   ```
   It reports whether `APIFY_TOKEN` and `OPENAI_API_KEY` are set, whether `ffmpeg` is installed, and where to get each key. If it exits non-zero, show the user the output and point them at the Setup section. Only go on when both keys are present, or the user chooses `--no-transcribe` with just the Apify token.
2. Check for shared GTM context. Look for `.agents/product-marketing.md` first, then `.claude/product-marketing.md`. Older setups may name it `product-marketing-context.md` in either folder; read that if it is the only one. If found, read it, summarise in two lines what you already know, and only ask for what is missing.
3. Also check `./ad-research/brand-context.md`, which this skill writes on an earlier run.
4. If no context exists, suggest running the `gtm-context` skill once so future tasks start with context. Never block on it. Ask the questions in `references/context-questions.md`, five at most, one at a time:
   1. What the product is and who buys it
   2. Competitors or search terms to research
   3. Countries
   4. How many ads per search (default 20)
   5. Transcribe or not (default yes)
5. Fill anything left unanswered with a sensible default and list it under "Assumptions" when you report back.

After the answers, offer once to save the brand answers to `./ad-research/brand-context.md` so future runs skip straight to the research questions.

## Workflow

### Step 1: Run the research

One run per keyword or advertiser, per country. Show the user each command before running it, with the rough cost when there are several runs.

```bash
# Keyword mode: what a customer would search for
python3 "<skill-dir>/scripts/run_research.py" \
  --keyword "{search term}" --country {CODE} --limit {n} --output-dir ./ad-research

# Advertiser mode: a competitor's page. A full Facebook page URL is more reliable than a name.
python3 "<skill-dir>/scripts/run_research.py" \
  --advertiser "{name or https://www.facebook.com/page}" --country {CODE} --limit {n} --output-dir ./ad-research

# Metadata-only scan, no OpenAI key needed
python3 "<skill-dir>/scripts/run_research.py" \
  --keyword "{search term}" --country {CODE} --no-transcribe --output-dir ./ad-research
```

The script prints four stages: scrape, filter to video, download and transcribe, write. Each run writes:

- `./ad-research/{slug}/{YYYY-MM-DD}-{COUNTRY}.md` – one section per ad: page, Ad Library link, start date, CTA, ad copy, hook, full transcript
- `./ad-research/{slug}/{YYYY-MM-DD}-{COUNTRY}-raw.json` – the same ads as data

If a run finds no video ads, say so and suggest a broader term, another country, or a higher limit. Do not retry the same run.

### Step 2: Synthesise

Read every report this run produced. Then write the insights file following `references/synthesis-template.md` exactly:

- Single country: `./ad-research/{slug}/{YYYY-MM-DD}-{COUNTRY}-insights.md`
- Several countries for one slug: `./ad-research/{slug}/{YYYY-MM-DD}-insights.md`

The template's rules are not optional. Quote hooks verbatim, point every claim at a numbered ad, never invent an ad, never put the user's pricing in a recommendation, and tie each opportunity to the brand context.

### Step 3: Report back

Tell the user, in this order:

1. Where the reports and the insights file are
2. How many ads were found and how many transcribed
3. The three longest-running ads, with page name, start date, and hook
4. The three strongest test ideas from the insights file
5. Rough cost of the run, using the figures in Setup
6. Assumptions, if any context was missing

Then stop. Do not offer to write ad scripts unless asked.

## Output format

Files on disk:

```
ad-research/
  {slug}/
    {YYYY-MM-DD}-{COUNTRY}.md            one section per ad
    {YYYY-MM-DD}-{COUNTRY}-raw.json      the same ads as data
    {YYYY-MM-DD}-{COUNTRY}-insights.md   the synthesis
  brand-context.md                       saved brand answers, if the user said yes
```

The insights file follows `references/synthesis-template.md`: summary, longest-running ads, hook pattern counts, angles, offers and CTAs, format, gaps and opportunities, recommended tests written as creative × audience × offer, and caveats.

The chat reply follows the six-point order in Step 3.

## Notes

- **Sorting.** Oldest start date first. Longest-running is a proxy for profitable, not proof. A big brand can afford to run a weak ad for months.
- **Active ads only.** For most advertisers the Ad Library shows what is running now. Ads that were killed are invisible, which biases the set toward survivors.
- **Country applies in both modes.** Advertiser mode only returns the ads that page runs in the chosen country. Pass `--country ALL` for a global brand's full set.
- **Advertiser mode guesses the page URL** from the name by stripping spaces and dots. If results look wrong, pass the full Facebook page URL.
- **Keyword mode matches loosely.** The Ad Library returns any ad whose text contains the words, in any order, so a search for "project management software" can surface unrelated advertisers. Expect some noise. The synthesis step drops off-topic ads and says how many it dropped.
- **Video only.** Image and text ads are dropped. Transcripts are what make the synthesis possible.
- **Videos over 25 MB** are transcribed by extracting audio with `ffmpeg` when it is installed, and skipped with a note when it is not.

## Quality checklist

Before reporting back:

- [ ] Setup check passed, or the user knowingly chose `--no-transcribe`
- [ ] Every command was shown to the user before it ran
- [ ] Every hook in the insights file is quoted verbatim from a report
- [ ] Every market claim points at a numbered ad and page name
- [ ] Off-topic ads and silent-video transcripts are excluded and counted in the caveats
- [ ] No invented ads, and none of the user's own pricing in a recommendation
- [ ] Each recommended test names creative, audience, and offer, tied to the brand context
- [ ] Longest-running is described as a proxy, not proof
- [ ] Insights file under about 1,200 words
- [ ] British English, no em dashes, no exclamation marks

## Related skills

- `gtm-context` – writes the shared context file this skill reads first
- `positioning-messaging` – turns the gaps this report finds into a sharper message
- `ad-headline-maker` and `ad-description-maker` – write the copy for the tests this report recommends
- `jtbd-research` – checks the angles against what buyers actually say
