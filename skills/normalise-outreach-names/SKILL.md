---
name: normalise-outreach-names
description: Normalise first names and company names in an outreach list so template merge fields read naturally. Strips emoji, credentials, honorifics, and legal suffixes, shortens companies to the name a person would say aloud, and enforces a caps policy (no ALL CAPS unless it is a true acronym or the brand styles itself that way everywhere). Use before any CSV goes into an email tool or enrichment table, or when the user says "normalise names", "clean up the company names", "fix the first names", or "the merge fields look wrong".
metadata:
  version: 2.0.0
  source: mine
  author: Theo Ohene
---

# Normalise outreach names

A merge field is a promise that a human wrote this. "Hey NORTHWIND LTD" breaks it instantly. Every list gets these rules before it touches a template.

## Before you start

This skill works on a list, so it rarely needs the shared context file. If `.agents/product-marketing.md` (or `.claude/product-marketing.md`) exists, check it for a "words to use" or brand list that should override the defaults below.

Confirm, in one message:

1. Which file, and which columns hold the person's name and the company name.
2. Whether to reuse a caps-OK list from earlier runs (look for `caps-ok.txt` next to the CSV).

If the answers are obvious from the file, proceed and state your assumptions.

## Workflow

1. Read the CSV and identify the name and company columns.
2. Add `First name` and `Company clean` columns. Never overwrite the originals.
3. Apply the first name rules, then the company rules, then the caps policy.
4. Verify any unfamiliar all-caps names (see the caps policy).
5. Print the diff and run the say-aloud test before writing the file.

## First names

1. Strip emoji and symbols, then anything after a comma (credentials: "Priya Shah, CPMM" becomes Priya).
2. Drop honorifics (Dr, Mr, Mrs, Ms, Prof): "Dr Tom Hale" becomes Tom.
3. Take the first token. If it is a bare initial, take the next token: "J Arun Mehta" becomes Arun.
4. ALL-CAPS names get sentence case ("OKAFOR" becomes Okafor), but short initialism names stay ("MJ").
5. If the first name is still unusable (a company name, a single letter, or empty), leave it blank and flag the row. Never guess.

## Company names

1. Strip emoji, ® and ™.
2. Drop trailing parentheticals and taglines: "Brightloop (brightloop.io)" becomes Brightloop; "Fleetwise - Logistics Software" becomes Fleetwise; "Castly.io: Live Shopping Platform" becomes Castly.io. Exception: "(previously X)" – drop the bracket and keep the current name ("paydo (previously QuickPay)" becomes paydo).
3. Strip legal suffixes, repeatedly if stacked: Inc, Inc., LLC, Ltd, Limited, PLC, LLP, GmbH, GmbH & Co. KG, Pte Ltd, Sdn Bhd, AG, Corp, Co. "Hartmann Tierfutter GmbH & Co. KG" becomes Hartmann Tierfutter.
4. **The say-aloud test decides length.** The merge field holds the name a person would say across a table, not the registered name: Clearpath, not Clearpath Technologies; Easy Move, not Easy Move Removals & Storage. Drop generic trailing descriptors (Technologies, Software, Solutions, AI) when the remaining stem is distinctive. Keep them when the stem becomes ambiguous (a three-letter stem that matches a famous bank or brand) or when it is how people say the name (Ada Health, Street Soccer USA).
5. Never use "your company" instead of a name. It is the biggest template tell. For a genuinely unsayable name, rephrase the template around "your team".
6. **Never "correct" a brand that styles itself lowercase.** If the source is lowercase and the brand writes itself that way, trust it.

## The caps policy

ALL CAPS is banned in merge fields unless one of these holds:

- **True acronym** (the letters stand for something), and always AI, UK, USA, and TM.
- **Verified brand styling**: the company writes itself in caps everywhere. Its website header, LinkedIn page name, and logo agree.

When an all-caps name is not on the caps-OK list and is not obviously an acronym, check before deciding. Fetch the company site or LinkedIn page and see how it writes its own name. One check per name. Add verified names to `caps-ok.txt` so the next run skips the check.

If you can't verify it, use sentence case. "Quick question about Northwind" reads fine. "NORTHWIND" mid-sentence reads like shouting.

## Watch for casing traps

Python's `str.capitalize()` lowercases everything after the first character. It turns "AI" into "Ai", "TM" into "Tm", and "1VALET" into "1valet" (digit first). Title-case word by word, apply the caps-OK list afterwards, and read the diff before writing.

## Output format

- The same CSV with two new columns: `First name` and `Company clean`.
- A short summary: rows changed, rows flagged for review (with the reason), and any names added to `caps-ok.txt`.

## Quality checklist

- [ ] Original columns untouched.
- [ ] No emoji, credentials, honorifics, or legal suffixes left.
- [ ] No ALL CAPS unless it is an acronym or verified brand styling.
- [ ] No "Ai", "Tm", or other casing-trap damage.
- [ ] Lowercase brands left lowercase.
- [ ] Three cleaned companies read aloud inside "quick question about {company}" sound like a person talking, not a legal filing or a shout.
- [ ] Blank or doubtful first names flagged, not guessed.
