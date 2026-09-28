---
name: gtm-context
description: Builds and maintains the shared GTM context file (the "GTM brain") at .agents/product-marketing.md that every other skill in this pack reads, so the user never has to explain their product, customer, and positioning twice. Use at the start of any new project, or when the user asks to "set up context", "set up the GTM brain", "create a product marketing context", "describe my product", "who is my ICP", "update our positioning file", "add this to our context", or shares a website, docs, or repo and wants the foundations captured. Also use to update one section, reconcile conflicting information, or migrate an older context file. Reads and extends an existing product-marketing file rather than overwriting it.
metadata:
  version: 1.0.0
  source: mine
  author: Theo Ohene
---

# GTM context

This skill builds and maintains one file: `.agents/product-marketing.md`. It holds the product, customer, positioning, messaging, proof, and voice decisions that every other skill in the pack reads before asking questions.

One good file saves the same five questions being asked in every skill. It also keeps copy, ads, and outreach consistent, because they all draw on the same source.

## Before you start

Look for an existing file, in this order:

1. `.agents/product-marketing.md` (canonical location)
2. `.claude/product-marketing.md`
3. `.agents/product-marketing-context.md` or `.claude/product-marketing-context.md` (older filename)

Then:

- **Canonical file exists:** read it, summarise what it covers in five lines or fewer, list the gaps, and ask which to fill. Never overwrite it.
- **Only an older location exists:** read it, then offer to move it to `.agents/product-marketing.md`. Move only on a yes. If the user says no, update it where it is.
- **Nothing exists:** go to the fresh start workflow below.

The file may have been created by another skill pack, such as Corey Haines's product-marketing skill. Keep its headings exactly as they are and add any missing sections from this template after them. The heading map below shows how the two line up.

## Compatibility with existing files

Other skills search the file by heading, so headings must stay stable. When extending a file:

- Keep every existing heading and its wording, including title case and ampersands.
- Put new content under the matching existing heading where one exists.
- Add sections the file lacks at the end, before the changelog, using the headings in `references/template.md`.
- Never delete content. Move superseded content to the changelog with a date.

| This template | Equivalent heading in older or third-party files |
|---|---|
| Product overview | Product Overview |
| Target audience | Target Audience |
| Personas | Personas |
| Jobs to be done and triggers | Target Audience (jobs), Switching Dynamics |
| Problems and pain points | Problems & Pain Points |
| Competitive alternatives | Competitive Landscape |
| Differentiation | Differentiation |
| Positioning statement | none, add it |
| Messaging building blocks | none, add it |
| Proof points | Proof Points |
| Objections | Objections |
| Customer language | Customer Language |
| Brand voice | Brand Voice |
| Channels | none, add it |
| Goals | Goals |
| Open questions and assumptions | none, add it |
| Changelog | Changelog |

## What the file covers

The full template, with prompts under each heading, is in `references/template.md`. In short:

1. **Product overview:** one-liner, primary anchor (category, use case, or competitive alternative), product type, and business model and pricing.
2. **Target audience:** ideal customer profile with the use case, buyer and user roles, and anti-persona.
3. **Personas:** for B2B, what each buying role cares about.
4. **Jobs to be done and triggers:** job statements, the events that start a search, and the four switching forces.
5. **Problems and pain points:** the core problem, its cost, and the emotional tension.
6. **Competitive alternatives:** what customers use today, including doing nothing, and the problem with each.
7. **Differentiation:** what you do differently and why that is better.
8. **Positioning statement:** one short paragraph built from the sections above.
9. **Messaging building blocks:** problem, product, audience, why better, benefits with proof, and how it works.
10. **Proof points:** customers, stats, and quotes, each with a source.
11. **Objections:** the top objections and the answer to each.
12. **Customer language:** verbatim phrases, words to use, words to avoid, and a glossary.
13. **Brand voice:** tone, style rules, and personality.
14. **Channels:** where the audience is reached today and what is working.
15. **Goals:** the business goal and the main conversion action.
16. **Open questions and assumptions:** everything unconfirmed.
17. **Changelog:** dated notes of what changed.

The top of the file carries a `last_updated: YYYY-MM-DD` line.

## Which skills read which sections

| Skill | Sections it relies on |
|---|---|
| `positioning-messaging` | Product overview, Target audience, Competitive alternatives, Differentiation, Positioning statement, Messaging building blocks, Proof points, Objections, Customer language, Brand voice |
| `jtbd-research` | Target audience, Jobs to be done and triggers, Competitive alternatives, Customer language (and offers to add findings back) |
| `icp-scoring` | Target audience (including anti-persona), Jobs to be done and triggers, Goals |
| `cold-outreach` | Product overview, Target audience, Jobs to be done and triggers, Proof points, Objections, Brand voice, Customer language |
| `ad-headline-maker` | Differentiation, Messaging building blocks, Proof points, Objections, Customer language, Brand voice, Channels |
| `ad-description-maker` | Problems and pain points, Messaging building blocks, Proof points, Customer language, Brand voice, Channels |
| `linkedin-connection-analysis` | Target audience, Personas, Goals |

If a section is empty, those skills ask for it. Prioritise filling the sections the user's next task depends on.

## Workflow

### Fresh start

1. **Offer an auto-draft first.** Ask for whatever the user has: a website URL, pitch deck, sales docs, call notes, or the product repo. Drafting from sources is faster and more accurate than an interview from nothing.
2. **Draft from sources.** Read the homepage, pricing, about, and customer pages; the README and any docs in a repo; and any files the user shares. Fill every section you can. Mark anything inferred from marketing copy rather than stated as fact with `(assumption)`.
3. **Show the gaps.** List the empty or weak sections, most important first. The critical three matter most: what it does, who it is for, and how it differs.
4. **Interview in batches.** Ask three to five related questions at a time, grouped by theme (for example, customer and use case, then alternatives and differentiation, then proof and voice). Never ask 30 questions in a row. Push for verbatim customer words, examples, and numbers.
5. **Stop when it is useful.** A file with the critical three, proof, and voice rules is enough to start. Put everything else under open questions and assumptions.
6. **Confirm and save.** Show the draft, ask what needs correcting, then write `.agents/product-marketing.md` with today's date on the `last_updated` line and a first changelog entry.
7. **Summarise.** Show the summary described under output format.

If the user has no sources, skip steps 1 and 2 and start the batched interview.

### Updating one section

1. Read the whole file first, since a change in one section often affects others.
2. Update only the section the user named. Keep its heading unchanged.
3. Check related sections for knock-on effects. For example, a new audience may change personas, objections, and messaging building blocks. List those as suggestions and change them only on a yes.
4. Update `last_updated` and add a changelog line saying what changed and why.

### Conflicting information

When new input contradicts the file, or two sources disagree (for example, the website says "for enterprises" and the user says "for startups"):

1. Do not silently pick one.
2. Show both versions side by side, with where each came from.
3. Ask which is current. If the user is unsure, record both under open questions and assumptions and mark the section `(conflict: unresolved)`.
4. Once resolved, update the section and log the old version in the changelog.

## Writing rules for the file

- Be specific enough to act on. "Heads of RevOps at 50 to 200 person B2B SaaS companies" beats "B2B companies".
- Quote customers verbatim where possible and note the source.
- Give every stat and quote a source. Unsourced proof goes under open questions and assumptions.
- Mark every inference with `(assumption)`.
- Keep it short. Aim for a file a person can read in five minutes.
- Use British English, the Oxford comma, sentence case headings (except where preserving existing headings), and no em dashes or emojis.

## Output format

After saving or updating, show:

```
Saved to .agents/product-marketing.md (last_updated: YYYY-MM-DD)

Filled: [sections]
Updated this session: [sections]
Assumptions to confirm: [count], top three: [list]
Still empty: [sections]
Conflicts unresolved: [list or none]

Suggested next step: [the skill that fits the user's goal, for example positioning-messaging]
```

## Quality checklist

- [ ] Checked all three locations before creating anything.
- [ ] Did not overwrite or delete existing content or rename existing headings.
- [ ] The critical three (product anchor, audience with use case, and differentiation) are filled or flagged.
- [ ] Every inference carries `(assumption)` and appears under open questions and assumptions.
- [ ] Every stat and quote has a source.
- [ ] Conflicts are shown to the user, not resolved silently.
- [ ] Questions were asked in batches of three to five.
- [ ] `last_updated` and the changelog are current.
- [ ] The file contains no secrets, credentials, or personal data about individual customers beyond what they have published.

## Credits

The idea of one shared product marketing context file that other skills read, and the `.agents/product-marketing.md` location, follow Corey Haines's marketingskills pack, which this skill is designed to stay compatible with. The section design, including positioning statement, messaging building blocks, channels, and open questions, is Theo Ohene's own and matches the `positioning-messaging` skill.
