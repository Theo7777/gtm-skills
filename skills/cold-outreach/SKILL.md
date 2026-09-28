---
name: cold-outreach
description: Write one signal-driven cold email, LinkedIn connect note, or LinkedIn message for a named person. Takes what you sell, who you're writing to, and one reason to reach out now (from a library of 41 signals, or your own trigger), and returns a short message built on Hook, Why, Objection, CTA. Use when the user says "cold email for", "write outreach to", "LinkedIn connect note for", "LinkedIn message for", "signal email", or names a person, a company, and a reason to reach out. For multi-step sequences, use an email sequence skill instead.
metadata:
  version: 2.0.0
  source: mine
  author: Theo Ohene
---

# Cold outreach

One person, one signal, one ask. The recipient should feel the message was written only for them, and should be able to answer it from their phone in one line.

## Before you start

1. Look for the shared GTM context file: first `.agents/product-marketing.md`, then `.claude/product-marketing.md`. The pack's `gtm-context` skill writes it, and it's compatible with the product-marketing-context format.
2. If it exists, read it and take the sender details from it: who you target, company size, value proposition, social proof, product facts, and words to avoid. Only ask for what's missing.
3. If the user names a profile, or you run outreach for several offers, read it from `profiles/` (see `profiles/_template.md`). A profile overrides the context file where they differ.
4. If neither exists, suggest running `gtm-context` for next time, but don't block. Ask up to five questions in one message, then write, and flag any assumptions under the message.

## Files in this skill

- `references/knowledge-base.md`: writing principles, tone, and example emails. Read it before writing.
- `references/signals.md`: the 41 signals grouped by type, with strength and the extra context to ask for.
- `profiles/_template.md`: optional per-offer profile for people running several offers.

## Inputs

Collect these before writing. Ask for anything missing in one message, not one question at a time.

1. **Message type:** email (default), linkedin-connect, or linkedin-message.
2. **Sender:** target industry, company size, value proposition, and social proof. Take these from the context file or profile when available.
3. **Recipient:** first name, job title, and company.
4. **Signal:** match the reason for reaching out to one signal in `references/signals.md`. If the signal has an "Ask for context" line and the user hasn't supplied that detail, ask for it. If nothing fits, treat it as a custom signal and use the user's own description.
5. **Screenshot or link (optional):** extract only the facts that serve this signal: names, tools, numbers, dates, quotes, and pains. Two to four sentences, no interpretation. Use that as the signal context.

## Workflow

1. Run the "Before you start" checks and gather inputs.
2. Pick the signal and note its strength. A high signal can carry the hook alone. A low signal needs a second observation alongside it, or a softer ask.
3. Write the hook first, from the signal. Run the swap test on it before writing the rest.
4. Write the Why, add an objection handle only if one obviously stands in the way, then write one CTA.
5. Check every claim against the sender's social proof and the signal context. Cut anything that doesn't trace back.
6. Run the quality checklist, then return the message in the output format.

## Writing the email

Follow `references/knowledge-base.md`. The non-negotiables:

1. Structure is Hook, Why, Objection handle (only if needed), CTA. Each section is one or two sentences.
2. Open on the signal. The first line could only be about this person or this company.
3. Casual-professional tone: contractions, peer-to-peer, no corporate speak, no "I hope this finds you well".
4. Hedge and stay tentative: "Would this be useful?" beats "This will help you". "It seems like" beats a flat claim.
5. One CTA, answerable with yes or no.
6. Weave in social proof only where it fits naturally. Never force it, never invent it.
7. Sign off with the sender's name from the context file or profile, or `[Your Name]` if there isn't one.
8. Subject line: short, specific, and personal to the recipient. Never "Quick question".

## Writing a LinkedIn connect note

Under 300 characters including spaces. First name only. One hook (signal, company, or role), one line of relevance, and a soft ask such as "Would be good to connect". No pitch, no formal greeting.

## Writing a LinkedIn message

Under 500 characters including spaces. Two or three short sentences. Reference the signal, give one value proposition, and end with one easy question. Write like a short message to a colleague. First name only, no sign-off. Include social proof only if it fits in a clause.

## Typography

- British English.
- Never em dashes. Rewrite the sentence or use a comma.
- Write ranges with "to": "three to five days".
- Spell out one to nine, digits for 10 and above.
- Always use % with numerals: "42%".
- No emojis, no exclamation marks.

## Output format

For email:

```
SUBJECT: [subject line]
---
[body]
```

For LinkedIn types, output only the text, with no subject or labels.

After the message, add:

- One line with the word count (email) or character count (LinkedIn), so the user can see it's within limits.
- The signal used, by its id from `signals.md` or "custom".
- Any assumptions you made, if you wrote without a context file or with missing inputs.

## Quality checklist

- [ ] Swap test: replace the company name with a competitor's. If the message still works, the hook is generic. Rewrite it.
- [ ] Email body under 120 words. Connect note under 300 characters. LinkedIn message under 500 characters.
- [ ] The signal is referenced in the first line.
- [ ] Exactly one ask, answerable with yes or no.
- [ ] No fake personalisation: nothing implies you know more than the signal shows.
- [ ] Every claim traces to the sender's social proof or the signal context. Nothing else.
- [ ] Read aloud, it sounds like a person rather than a sequence.
- [ ] Typography rules above are met.

## Credits

- The signal library is inspired by Common Room's signals library (https://www.commonroom.io/resources/signals/).
- The writing principles in the knowledge base, including the claim, warrant, evidence, impact structure, are based on Za-zu's cold email handbook (https://za-zu.com/docs/handbook/cold-email/intro).
