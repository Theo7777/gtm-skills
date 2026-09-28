---
name: icp-scoring
description: Score a list of target accounts against an ICP using a fit gate and weighted buying signals, then band them A Hot / B Warm / C Nurture / D Monitor with a recommended action and the reasons behind every score. Accepts a pasted list, a CSV, or a spreadsheet export. Use when the user asks to score accounts, prioritise a target list, rank prospects, qualify leads against the ICP, tier accounts, or apply ICP or signal scoring.
metadata:
  version: 2.0.0
  source: mine
  author: Theo Ohene
---

# ICP account scoring

Score accounts so the user knows where to focus, and show the working so they can trust or challenge every score.

Arguments passed: $ARGUMENTS

## Before you start

1. Check for `.agents/product-marketing.md`, then `.claude/product-marketing.md`. This is the shared GTM context file written by the `gtm-context` skill.
2. If it exists, read the ICP section: target company type, size, geography, buyer roles, disqualifiers, and any buying signals already listed. Only ask for what is missing.
3. If it does not exist, also check for an ICP file in the project (for example `icp.md`). If there is still nothing, suggest running `gtm-context`, but do not block. Ask up to five questions and flag your assumptions in the output:
   - Who is a fit (industry, size, geography, business model)?
   - Who is never a fit?
   - Who is the buyer, by role?
   - What events suggest an account is ready to buy now?
   - Where is the account list (paste, CSV path, or spreadsheet)?

Inputs needed:
1. The ICP definition (who is a fit, who is not)
2. The list of accounts to score
3. Optionally, which signals count as High, Medium, or Low for this ICP

## Workflow

1. **Load the list.** Accept pasted names, a CSV, or a spreadsheet export. Find the company name and domain columns; if they are unclear, show the headers and ask which to use. Deduplicate by domain (or by normalised name when there is no domain). Report the count loaded, duplicates removed, and rows skipped for missing data.
2. **Confirm the rubric.** Write out the fit criteria and the signal list with weights. If signal weights are not defined in the context file, propose a High/Medium/Low list for this ICP (see `references/scoring-rubric.md` for a starter library) and confirm it before scoring. Once confirmed, keep it fixed for the whole list.
3. **Check scope.** For more than 50 accounts, say how many web lookups this needs and offer to score a sample of 10 first. Ask before using any paid enrichment tool.
4. **Apply the fit gate.** Mark each account Fit, Not a fit, or Unclear against the criteria, with one line on why.
5. **Find signals.** Research each Fit or Unclear account for signals from the last 90 days. Record the date and source URL for each.
6. **Score and band.** Add up points, apply the gate, assign the band, and write the reason.
7. **Deliver** the table, the rubric used, and a short summary. Offer a CSV version.

## Scoring rules

- Each signal scores points: High = 10, Medium = 5, Low = 2.
- Count each distinct signal once. Two articles about the same funding round are one signal.
- Fit gate: if the account is not a fit for the ICP, the final band is "D. Monitor" regardless of points. Unclear fit is scored normally but flagged for review.
- Bands:
  - A. Hot: 20+ points
  - B. Warm: 10 to 19 points
  - C. Nurture: 4 to 9 points
  - D. Monitor: under 4 points, or not a fit
- Only count signals from the last 90 days. Cite a source for each.
- Do not invent signals. Mark anything you cannot verify, and do not score it.

## What each band means

- A. Hot: personalised outreach, events, demos
- B. Warm: targeted campaigns plus selective direct outreach
- C. Nurture: nurture with content, monitor for stronger signals
- D. Monitor: monitor only

## Output format

**1. Scoring key** (so anyone can check the maths)

| Signal | Weight | Points |
|---|---|---|
| Raised a funding round | High | 10 |
| ... | ... | ... |

Plus the fit criteria, the 90-day window with its start and end dates, and any assumptions.

**2. Scored accounts**, sorted by score, highest first:

| Account | ICP fit | Signals found (date, source) | Points | Band | Why this band | Recommended action |
|---|---|---|---|---|---|---|

"Why this band" is one plain sentence, for example: "Fit; hiring a Head of Growth (High, 10) plus new pricing page (Medium, 5) = 15, so Warm."

**3. Summary**: count per band, the top three accounts to act on this week, accounts flagged Unclear or unverified, and any ICP gaps the list exposed (for example many near-misses on company size).

If the user supplied a CSV, offer to save `[original-name]-scored.csv` next to it with added columns: `icp_fit`, `fit_reason`, `signals`, `points`, `band`, `band_reason`, `action`.

## Quality checklist

- [ ] Context file checked; assumptions listed if it was missing
- [ ] Rubric shown and confirmed before scoring
- [ ] Duplicates removed and the count reported
- [ ] Every signal has a date inside the 90-day window and a source
- [ ] Not-a-fit accounts are band D whatever their points
- [ ] Every account has a one-line reason for its band
- [ ] Points add up correctly for every row
- [ ] Unverified items are flagged and not scored

## Writing back to the context file

If scoring shows the ICP needs sharpening (for example a new disqualifier, or a signal that keeps predicting fit), suggest the edit to the context file's ICP section and ask before writing. Never change it silently.
