# Synthesis template

The insights report is the reason this skill exists. The scrape gives a list. This step turns it into something a marketer can act on Monday morning.

Read every report produced in this run before writing. Write to `{output_dir}/{slug}/{YYYY-MM-DD}-{COUNTRY}-insights.md`, or `{YYYY-MM-DD}-insights.md` when several countries were run for the same slug.

## Rules

- Drop ads that are clearly not in the niche. Keyword search matches loosely. State how many you dropped and why in the caveats, and exclude them from every count.
- A transcript that is one short sentence in an unexpected language, or a bare "thanks for watching", is Whisper guessing at a video with no speech. Treat it as no transcript, keep the ad's metadata, and note it in the caveats.
- Quote hooks verbatim from the report. Never paraphrase a quote, never invent an ad.
- Every claim about the market points at a specific ad by number and page name.
- Longest-running is a proxy for profitable, not proof. Say so in the caveats and do not overclaim.
- Never state the user's own pricing in a creative recommendation.
- Match the brand context. A recommendation that ignores who the buyer is does not belong in the report.
- Plain language. Define any advertising term the first time it appears.
- Under about 1,200 words. Short beats thorough.

## Structure

```markdown
# Ad research insights: {niche}

**Date:** {YYYY-MM-DD}
**Countries:** {codes}
**Ads analysed:** {n} video ads, {m} transcribed
**Brand:** {brand name from context}

## Summary

Three to five sentences. What the market is saying, which angle dominates, and the biggest gap for {brand}.

## Longest-running ads

Top five by start date. For each:

- **Ad {n}: {page name}** (running since {date})
  Hook: "{verbatim hook}"
  Why it likely works: one sentence.

## Hook patterns

Group every hook into one of these types. Count each. Quote two examples per type that appears.

| Type | Count | Examples |
|------|-------|----------|
| Question | | |
| Direct callout of the viewer ("If you run a...") | | |
| Bold claim or number | | |
| Story opener | | |
| Product demo, straight in | | |
| Social proof | | |

One paragraph: what the count tells you.

## Angles

Which of these dominate, and which are missing:

- Pain: the cost of the problem
- Desire: the outcome the buyer wants
- Proof: results, numbers, testimonials
- Identity: who the buyer is or wants to be
- Objection: answering "but what about..."

## Offers and CTAs

Frequency of free trial, discount, guarantee, book a call, download, shop now, learn more. Note anything unusual.

## Format

Talking head, screen or product demo, user-generated style, voiceover over footage. Estimate length from transcript word count (about 150 words per minute).

## Gaps and opportunities for {brand}

Three to five angles, hook types, or offers the market is not using that fit the brand context. Tie each to a line in the brand context and to the competitor ads that leave the gap.

## Recommended tests

Three to five. Each in the form:

- **Test {n}: {name}**
  Creative: {hook type and angle}
  Audience: {who, from brand context}
  Offer: {CTA or offer}
  Derived from: Ad {n} ({page name})
  Hypothesis: {what we expect and why}

## Caveats

Sample size. Longest-running as a proxy. The Ad Library shows active ads only for most advertisers, so ads that were killed are invisible. Transcription errors on names and numbers. Anything specific to this run.
```
