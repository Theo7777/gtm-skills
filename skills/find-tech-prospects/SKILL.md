---
name: find-tech-prospects
description: Build a prospect list from a technology signal. Finds companies that run a named tool (TheirStack technographics), filters them by how long they have had it, how recently it was seen, and how confident the detection is, then finds the right people at each company with a work email (Apollo) and writes the list to a CSV. Can also load the list into lemlist as a draft campaign. Use when the user says "find companies using X", "who runs X", "prospects on a competitor's tool", "technographic list", "find people at companies using", "switch campaign", or names a tool plus the kind of company they sell to.
metadata:
  version: 1.0.0
  source: mine
  author: Theo Ohene
---

# Find tech prospects

One technology in, one clean prospect list out. Every row carries the reason it is there: the company runs a tool that matters to what the user sells, and the list says how strong that evidence is.

This skill spends paid credits and handles real people's names and work emails. The safety rules below are part of the job, so read them before the first API call.

## Before you start

1. Check for `.agents/product-marketing.md`, then `.claude/product-marketing.md`. This is the shared GTM context file written by the `gtm-context` skill.
2. If it exists, read what the user sells, the ICP (company type, size, geography), the buyer roles, the competitors, and the disqualifiers. Only ask for what is missing.
3. If it does not exist, suggest running `gtm-context` for next time, but do not block. Ask the questions under Inputs in one message and flag your assumptions in the report.
4. Read `references/api-traps.md` before touching TheirStack or Apollo. Most of the traps fail quietly.

## Setup

The skill needs two connected tools of the user's own. Nothing is hard-coded, and nothing is spent until the user approves an estimate.

| Tool | What it does here | How to connect | Cost |
|---|---|---|---|
| TheirStack | Finds companies by the technology they use | The TheirStack MCP connector, signed in to the user's account (https://theirstack.com) | 3 credits per company returned. Looking up a technology in the catalogue is free. |
| Apollo | Finds people at those companies and reveals work emails | The Apollo MCP connector, signed in to the user's account (https://apollo.io) | About one credit per email revealed. Searching people is free on plans that allow it. |
| lemlist (optional) | Holds the list as a draft campaign | The lemlist MCP connector | Free if every enrichment flag stays off |

If TheirStack or Apollo is not connected, say which one is missing and stop. Do not substitute a web search for technographic data: it cannot show when a tool was first or last seen.

## Inputs

Collect these in one message, not one question at a time. Take what you can from the context file and ask only for the rest.

1. **The technology, and why it matters.** Which tool should the target companies run? And what is its relation to what the user sells:
   - *Replace*: the user's product displaces it.
   - *Complement*: the user's product works alongside it or integrates with it.
   - *Indicator*: running it suggests a need, a maturity level, or a budget.
2. **The signal.** Three settings, each with a default:
   - *How long they have had it.* Any length (default), new adopters only (first seen in the last 6 months), or established users only (first seen 12 months ago or more). For a Replace play, established users are usually better: new adopters have just bought.
   - *How recently it was seen.* Default: seen in the last 12 months. Older than that, the company may have moved off it.
   - *Confidence.* Default: high only. Medium gives a longer, noisier list. Low is rarely worth a send.
3. **Which companies.** Countries, employee range, and anything to exclude (industries, existing customers, a suppression list of domains).
4. **Who they are sending to.** Job titles or functions, seniority, and whether the person must sit in the same country as the company. One person per company or several.
5. **How many prospects, and where the list goes.** CSV only (default), or CSV plus a lemlist draft campaign. Any other sequencer takes the CSV as an import.

If the user asks for phone numbers or personal emails, say this skill collects work emails only.

## How TheirStack knows

TheirStack detects technologies mainly from the text of job adverts. That shapes how the signal should be read:

- **First seen** is the earliest advert that mentioned the tool. The company may have used it for longer, so tenure is a minimum, never an exact figure.
- **Last seen** is the most recent mention. A company that has stopped hiring shows an old date even if it still runs the tool.
- **Confidence** reflects how many adverts mention the tool and how it ranks against similar tools at that company. It says nothing about recency. High confidence on a signal last seen three years ago is a stale signal.
- Agencies, consultancies, and recruiters mention tools they run for clients. Exclude them unless they are the ICP.

Say how the tool was detected whenever the evidence is shown to the user or used in copy. "Your job adverts mention it" is accurate. "I saw you use it" claims more than the data shows.

## Workflow

Stop at each step marked **Stop**.

### 1. Find the technology slug (free)

Search the TheirStack keyword catalogue for the tool name with `keyword_type: "technology"`. Names collide, so show the match with its category and company count and confirm it if there is any doubt. If the tool is not in the catalogue, say so and stop. Do not swap in a near match.

### 2. Estimate the cost. Stop.

Check both balances: TheirStack's credit balance, and Apollo's profile with credit usage included.

Work out the estimate and show it:

- Companies to pull = prospects wanted × 1.5, rounded up. Fallout is normal: some companies have nobody matching the role, and some people have no findable email.
- TheirStack cost = companies × 3 credits.
- Apollo cost = about one credit per email revealed.

Wait for a yes before spending anything. If either balance is too low for the run, say so and offer a smaller list.

### 3. Find the companies (TheirStack)

Search companies with the technology slug, the country codes, the employee range, and a requirement that the domain exists. Expand the technology slug so each row carries `technologies_found` with the confidence and dates. Apply the signal settings in the request using `tech_filters`, so stale rows are never paid for:

- confidence → `confidence_or`
- seen recently → `last_date_found_gte`
- established users → `first_date_found_lte`
- new adopters → `first_date_found_gte`

Set `limit` to the number of companies in the approved estimate. Never page past it without asking.

Then check every returned row against the same settings, because the filters are not a guarantee. Drop anything that fails, plus agencies, recruiters, and any domain on the user's exclusion list. Report how many were dropped and why.

### 4. Find the people (Apollo)

Search people at the returned domains with the titles and seniority from the inputs. If the user gave a role description rather than exact titles, or the plan blocks people search, route through Apollo's prospect-finding agent instead and pass the user's own words. See `references/api-traps.md`.

Pick one person per company unless the user asked for more. Prefer the most senior match in the requested function.

Reveal work emails only for the people chosen, in batches of 10 at most. Leave phone reveal, personal email reveal, and waterfall enrichment off.

### 5. Check the titles and the emails

**Titles.** If nobody at a company matches the requested seniority, do not quietly accept a junior substitute and do not pad the list to hit the number. Mark the row as off-spec and let the user decide.

**Catch-all domains.** An address can be marked verified on a domain that accepts any address at all. Check the catch-all fields on each contact and flag every warning. On a small list, recommend dropping them: two bounces in 10 sends is a 20% bounce rate, which damages a young sending domain.

**Location.** If the person sits outside the target countries but the company is inside them, flag it rather than drop it.

### 6. Write the CSV. Stop.

Save `prospects-[technology]-[YYYY-MM-DD].csv` in the project folder with these columns:

```
first_name,last_name,title,company,domain,email,email_status,catch_all,
person_country,company_country,employee_count,
tech,tech_confidence,tech_first_seen,tech_last_seen,months_since_first_seen,
linkedin_url,notes
```

Before saving, make sure the file cannot be committed. If the folder is a git repository, check `.gitignore` for a rule that covers the file and add one if there is none:

```
# Real prospect lists (names and work emails). Keep out of version control.
prospects*.csv
```

Then show the user the list and the report (see Reporting back). Nothing goes to lemlist, or anywhere else, before they approve.

### 7. Load into lemlist (optional)

Only if the user asked for it, and only after they approve the list.

1. Create the campaign as a draft, or add to a draft the user names.
2. Add the leads with every enrichment flag off. The emails are already known, and each flag costs credits.
3. Send the company domain alongside the company name, and put `tech`, `tech_last_seen`, and `tech_confidence` in custom variables so the copy can use them.
4. Confirm the campaign is a draft by listing campaigns. Do not launch it, and do not assign a sender. Mailbox choice is the user's decision.

For the message itself, hand over to the `cold-outreach` skill with the signal `uses-relevant-tech-stack`.

## Safety rules

- **Spend only what was approved.** One estimate, one yes. Ask again before pulling a second batch or revealing more emails.
- **Never launch or send.** The furthest this skill goes is a draft campaign with no sender.
- **Never commit prospect data.** Names and work emails stay out of version control and out of any shared or public location.
- **Work emails only.** No personal emails, no phone numbers.
- **Respect exclusions.** Remove the user's customers, competitors they named, and any suppression or unsubscribe list before revealing emails, so no credits go on people who must not be contacted.
- **Do not invent evidence.** Every row's signal comes from TheirStack's fields. If a field is empty, leave it empty.
- **The user owns compliance.** Cold outreach rules differ by country (for example GDPR and PECR in the UK and EU, CAN-SPAM in the US). Remind the user once that they need a lawful basis and a working opt-out before sending.

## Reporting back

Give the user:

- the CSV path, and the lemlist campaign name if one was created,
- a table of prospects with title, company, size, confidence, first seen, and last seen,
- the signal settings used, and how many companies each one removed,
- every caveat in plain words: off-spec titles, catch-all emails, people outside the target countries, companies with nobody findable,
- credits spent per tool against the estimate, and the balances left,
- what is still theirs to do before sending: pick a sender, check the copy, and confirm their opt-out.

## Judgement calls

- A list of 10 is a copy test. Say it is too small to read results from.
- Prefer a shorter clean list to a padded one. Ask before lowering the count or loosening the signal.
- If strict settings return too few companies, loosen one setting at a time and say which. Widen the date window before dropping to medium confidence.
- For a Replace play, tenure helps the message: a company three years into a tool has a different problem from one three months in. Pass `months_since_first_seen` through so the copy can reflect it, and call it "at least" that long.

## Quality checklist

- [ ] Context file checked; assumptions listed if it was missing
- [ ] Technology slug confirmed against the catalogue
- [ ] Cost estimate shown and approved before any credits were spent
- [ ] Every row meets the confidence, first-seen, and last-seen settings
- [ ] Agencies, recruiters, and excluded domains removed
- [ ] Off-spec titles and catch-all emails flagged, not hidden
- [ ] CSV is covered by `.gitignore`
- [ ] No phone numbers or personal emails collected
- [ ] Nothing launched; any lemlist campaign is a draft with no sender
- [ ] Credits spent reported against the estimate

## Files in this skill

- `references/api-traps.md`: how TheirStack, Apollo, and lemlist behave in practice, including large responses, plan limits, and approval prompts.
