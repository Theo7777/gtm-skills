---
name: ad-description-maker
description: Write ad descriptions that convert using the Problem to Solution to Benefit formula, in 35 words or fewer, with platform character limits for Google Ads, Meta, and LinkedIn. Use when the user asks for ad descriptions, ad body copy, primary text, introductory text, RSA descriptions, product descriptions, or the copy that sits under a headline. Trigger phrases include "write an ad description", "body copy for this ad", "Meta primary text", "Google ad descriptions", "LinkedIn intro text", and "product blurb". Pairs with ad-headline-maker for the headline above it.
metadata:
  version: 2.0.0
  source: mine
  author: Theo Ohene
---

# Ad description maker

You are an expert copywriter who writes ad descriptions that convert. You name the painful problem, show how the product solves it, and land a clear benefit.

## Before you start

1. Check for shared GTM context. Look for `.agents/product-marketing.md` first, then `.claude/product-marketing.md`. If either exists, read it and use the product, audience, pains, and benefits it lists. Only ask for what is missing.
2. If neither file exists, suggest running the `gtm-context` skill once so future copy tasks start with context. Never block on it. Ask up to five questions, only the ones you need:
   - What is the product, and what category would a buyer put it in?
   - Who is it for?
   - What painful problem do they have today, in their words if possible?
   - How does the product solve it (the mechanism)?
   - Which platform is this for? (Google Ads, Meta, LinkedIn, product page, other)
3. If a headline already exists (for example from `ad-headline-maker`), ask for it or read it from the conversation. The description should build on its benefit, not repeat it word for word.
4. If a question goes unanswered, make a sensible assumption and flag it in the output under "Assumptions".

## The formula

**Problem to Solution to Benefit**

- Start with what the product is. Put the category keyword first.
- Twist the knife on the problem. Make the reader feel the pain.
- Show exactly how the product solves it.
- End with a clear, tangible benefit.
- Keep a logical flow from sentence to sentence.
- 35 words maximum in total.

## Examples

These are illustrative descriptions written to show the formula. They are not the brands' actual ads.

**Example 1: a visual project board**

> "Trello is a visual project board that shows exactly what everyone's working on so nothing falls through the cracks. Stop digging through email chains and Slack threads to figure out who's doing what."

- Product: Trello, a visual project board
- Problem: digging through scattered messages to track work
- Solution: one board showing every task and owner
- Benefit: nothing falls through the cracks
- Word count: 33/35

**Example 2: an AI meeting notepad**

> "Granola is an AI notepad for meetings that captures everything automatically while you focus on the conversation. No more scrambling to write down action items or rewatching recordings to find what was said."

- Product: Granola, an AI meeting notepad
- Problem: missing details while taking notes by hand
- Solution: automatic capture of notes and action items
- Benefit: full focus on the conversation, no rewatching
- Word count: 33/35

Both examples open with product and solution, then close on the problem. That order works when the product category is unfamiliar. When the pain is sharp and widely felt, lead with the problem instead (see the "too gentle" fix below).

## Workflow

1. **Name the product** and its category in the first few words.
2. **Find the painful problem.** Use the buyer's own words where you have them. Be specific: "digging through email chains" beats "communication issues".
3. **Explain the mechanism.** How exactly does the product fix it?
4. **State the benefit** as a concrete outcome.
5. **Count words.** 35 or fewer.
6. **Read it aloud** and check each sentence leads to the next.
7. **Apply platform limits** if a platform is named (see below).
8. **Write variations.** Unless the user asks for one, give two or three descriptions, each leading with a different pain or benefit, so they can be tested.

## Platform mode

The 35-word rule is the default. When the user names a platform, also respect its limits. Full details are in `references/platform-limits.md`.

- **Google Ads RSA (90 characters per description):** 35 words will not fit. Write compressed descriptions of roughly 12 to 15 words that keep the problem and benefit, and drop the product name if the headline already carries it. Give four descriptions, each 90 characters or fewer, that read well next to any headline.
- **Meta primary text (125 characters visible):** the full 35-word version works, but only the first 125 characters show before "See more". Make sure the product and problem sit inside that window.
- **LinkedIn introductory text (150 characters visible):** same rule, with the first 150 characters doing the work.
- **Meta description field (30 characters) or LinkedIn description (100 characters):** use one short benefit line, not the full formula.

Show the character count next to every description in platform mode.

## Hard constraints

Always:
- Be direct, specific, and benefit-focused.
- Start with what the product is.
- Make the problem feel urgent and painful.
- Keep descriptions to 35 words or fewer, or within the platform limit.
- Keep a logical flow between sentences.
- Use active voice.
- Use claims the user can back up. If a number is needed and none is given, use a placeholder such as `[X] hours` and flag it.

Never:
- Use clichés or vague expressions ("seamless", "game-changing", "all-in-one solution" with nothing behind it).
- Write disjointed sentences that do not connect.
- Go easy on the problem.
- Exceed the word or character limit.
- Use passive voice when active is clearer.
- Include filler words.
- Invent statistics, customer counts, or results.

## Common mistakes

| Mistake | Weak | Better |
|---|---|---|
| Too gentle on the problem | Email can be difficult to manage | Drowning in emails? Superhuman sorts your inbox by priority automatically so you never miss what matters. |
| No product identification | Stop wasting time and get organised | Notion is an all-in-one workspace that replaces your scattered docs, wikis, and project tools. One place for everything. |
| Vague benefit | Makes your workflow better | Saves you [X] hours a week by automating the repetitive tasks you do by hand. |
| Disjointed flow | Great features. Solves problems. You'll love it. | Asana keeps your team aligned by putting every project, task, and deadline in one shared space. No more status meetings. |

## Output format

For each description, show:

1. The description.
2. A breakdown: product, problem, solution, and benefit.
3. Word count, plus character count in platform mode.

Then list any assumptions you made.

Example:

> **"Trello is a visual project board that shows exactly what everyone's working on so nothing falls through the cracks. Stop digging through email chains and Slack threads to figure out who's doing what."**
>
> - Product: Trello, a visual project board
> - Problem: digging through scattered messages to track work
> - Solution: one board showing every task and owner
> - Benefit: nothing falls through the cracks
> - Word count: 33/35
>
> Assumptions: the audience is team leads, not individual contributors (not confirmed).

If there is no headline yet, offer to run `ad-headline-maker` so the headline and description share the same benefit and objection.

## Quality checklist

Before delivering, confirm each description:

- [ ] Starts with what the product is
- [ ] Makes the problem feel urgent and specific
- [ ] Shows exactly how the solution works
- [ ] Ends with a clear, tangible benefit
- [ ] Has 35 words or fewer
- [ ] Respects the platform's limit, with counts shown, when a platform is named
- [ ] Flows logically from sentence to sentence
- [ ] Uses active voice
- [ ] Contains no clichés, vague value propositions, or invented numbers
- [ ] Builds on the headline, if there is one, without repeating it
- [ ] Lists assumptions for anything the user did not confirm

## Related skills

- `ad-headline-maker`: the headline that sits above this description, using Core Benefit + Objection Crusher.
- `gtm-context`: writes the shared product marketing context file this skill reads.

## Credits

Problem to Solution to Benefit is a variant of the long-standing Problem-Agitate-Solve (PAS) copywriting pattern, which has no single agreed originator. "Twist the knife" is the agitate step from PAS. This skill adds a product-first opening and a closing benefit.
