# Context questions

Ask these only for what the existing context does not already answer. One question at a time. Wait for each answer before asking the next.

## Sources to check before asking

In this order:

1. `.agents/product-marketing.md` in the current project, then `.claude/product-marketing.md`. This is the shared GTM context file written by the `gtm-context` skill. Older setups may name it `product-marketing-context.md`. Covers product, audience, competitors, and voice.
2. `./ad-research/brand-context.md`. Written by this skill on an earlier run.

If either exists, read it, summarise in two lines what you already know, and ask only the research questions (3 to 5 below) plus anything missing.

If neither exists, suggest running `gtm-context` once, but do not wait for it. Ask the five questions below at most, and flag anything you had to assume.

## The questions

### 1. Product and buyer

"What is the product or brand, in a sentence or two, and who buys it?"

Why it matters: the synthesis step judges every competitor ad against this buyer. Without it the report is a list, not advice.

### 2. What to research

"Who are your main competitors, or what would a customer type into a search when looking for something like yours? Give me names, Facebook page URLs, or search terms."

Decides the mode:
- Names or page URLs go to advertiser mode, one run per advertiser. A full Facebook page URL is more reliable than a guessed one.
- Search terms go to keyword mode, one run per term per country.

If the user gives both, run both. Keep the total under about six runs unless they ask for more.

### 3. Countries

"Which countries? Your home market first. One to three is usual."

Two-letter codes: GB, US, CA, AU, DE, FR, and so on. Every country is a separate Apify run, so cost scales with this answer.

### 4. How many ads

"How many ads per search? Twenty is the default and usually enough, since the signal is which ads have run longest, not volume."

Accept any number. Over 50 gets slow and rarely adds insight.

### 5. Transcribe

"Transcribe the videos? Yes is the default. It costs about $0.006 per minute of video, so 20 ads is usually under a dollar. No gives a faster metadata-only scan without hooks."

## After the questions

Offer once: "Shall I save the brand answers to `ad-research/brand-context.md` so next time I only ask what to research?"

If yes, write this file:

```markdown
# Brand context for ad research

**Product:** {one or two sentences}
**Buyer:** {who pays and why}
**Known competitors:** {names or URLs, comma separated}
**Home market:** {country code}
**Last updated:** {YYYY-MM-DD}
```

Do not save the per-run answers (keyword, ad count, transcribe). Those change every time.
