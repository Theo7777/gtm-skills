---
name: linkedin-connection-analysis
description: Turn a LinkedIn connections export (Connections.csv, with name, company, position, and date connected) into a simple prioritised network CRM for a stated goal, such as finding buyers, referrers, hires, investors, or advisers. Scores each person High/Medium/Low fit against the goal and the ICP, keeps only Medium and High, and sorts best fit to the top. Keeps personal data local by default. Use when the user shares a LinkedIn connections export, Connections.csv, or asks "who in my network can help with", "mine my LinkedIn connections", "warm intros", or "who should I reach out to first".
metadata:
  version: 2.0.0
  source: mine
  author: Theo Ohene
---

# LinkedIn connection analysis

Inputs needed:
1. The LinkedIn connections CSV (the `Connections.csv` file from LinkedIn's data export)
2. The goal to prioritise against

Arguments passed: $ARGUMENTS

If a file path was passed, treat it as the CSV. If the goal or the CSV is missing, ask for it before starting. If the user does not have the file yet, tell them how to get it: LinkedIn, Settings, Data privacy, Get a copy of your data, then choose Connections. It usually arrives by email within about 10 minutes.

## Before you start

1. Check for `.agents/product-marketing.md`, then `.claude/product-marketing.md`. This is the shared GTM context file written by the `gtm-context` skill.
2. If it exists, read the ICP, buyer roles, and target industries, and use them to judge fit when the goal is sales or partnerships. Only ask for what is missing.
3. If it does not exist, suggest running `gtm-context`, but do not block. Ask up to five questions and flag assumptions in the output:
   - What is the goal (for example sell to, get referrals from, hire, raise from, or get advice from)?
   - Which roles or seniority matter most?
   - Which industries or company types matter?
   - Are there specific target companies to match against?
   - Anyone or any company to exclude (current clients, competitors)?

## Privacy

This file holds personal data about real people.

- Process it locally. Do not upload it or send names, emails, or profile URLs to any external service (enrichment tools, CRMs, web search, or other APIs) without asking first and naming the service.
- Web search on company names is fine; do not search individuals by name unless the user asks.
- Leave email addresses out of the output unless the user asks for them. Most are blank anyway, because members control whether LinkedIn exports their email.
- Save outputs next to the source file, not in a shared or public folder, and never commit them to a git repo.

## Workflow

1. **Load the CSV.** The export starts with a few "Notes:" lines before the real header. Skip to the row that begins `First Name`. See `references/connections-csv.md` for columns and parsing notes. Report total connections loaded and rows with a blank company or position.
2. **Set the fit criteria.** Turn the goal plus the ICP into a short rubric: which roles, seniority, company types, and named companies make someone High, Medium, or Low. Show it in two or three lines before scoring.
3. **Pre-filter.** Drop rows with no company and no position, and anyone on the exclusion list. For very large exports (over 3,000 rows), do a first pass on Position and Company keywords, then judge the survivors individually.
4. **Score each person** on the data available: Position, Company, and Connected On.
5. **Build the CRM** with only Medium and High fit, sorted best fit to the top.
6. **Summarise** and offer next steps.

## Build the CRM

Build a simple, prioritised network CRM for the goal. For each person, fill only what the data supports:

- **Fit to the goal**: High / Medium / Low, plus one line on why they are relevant
- **Relevant company**: do they work somewhere that matters to the goal (an ICP company, a named target, or a company that sells to the ICP)?
- **Suggested next step**: ask directly, ask for an intro, or re-warm first (for connections older than about two years)

## Rules

- Only include Medium and High fit. Drop Low fit so the list stays usable.
- Do not invent facts about anyone. If unsure, mark Medium and say why briefly.
- Sort highest fit to the top. Within a fit level, put people at named target companies first, then more senior roles, then more recent connections.
- Position and Company are what the person last set on their profile at export time; flag that they may be out of date.

## Output format

A short header, then the table:

```
Goal: [goal] | Loaded: [n] connections | High: [n] | Medium: [n] | Dropped: [n]
Rubric: [two or three lines]
```

| Name | Company | Position | Fit | Why relevant | Next step | Date connected |
|---|---|---|---|---|---|---|

Then a summary: companies with several relevant connections (useful for multi-threading), the top five people to contact this week, and any gaps (for example no one at the target companies).

If the list is long or the user wants a file, save it as a markdown or CSV file next to the source CSV (for example `Connections-prioritised.csv`).

## Quality checklist

- [ ] Notes lines skipped and the real header found
- [ ] Context file checked; ICP used where the goal is commercial
- [ ] Rubric shown before scoring
- [ ] Only Medium and High fit in the table, sorted correctly
- [ ] Every row has a one-line reason grounded in Position or Company
- [ ] No personal data sent to an external service without asking
- [ ] Emails excluded unless requested
- [ ] Nothing invented about any person
