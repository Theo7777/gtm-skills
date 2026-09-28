---
name: positioning-messaging
description: Positioning and messaging for B2B products and websites, worked top-down from positioning to messaging to copy. Use when the user asks for website copy, homepage messaging, a hero section, benefit sections, a value proposition, a positioning statement, messaging building blocks, or landing page copy, or says things like "what do we even say we are", "who is this for", "why are we better", "rewrite our homepage", or "audit this page". Also use when reviewing or auditing existing website copy. Covers strategic foundations, full homepage copy (hero to footer), and individual sections.
metadata:
  version: 2.0.0
  source: mine
  author: Theo Ohene
---

# Positioning and messaging

This skill produces clear B2B product messaging grounded in positioning. It works at two levels: strategic (positioning and messaging building blocks) and executional (copy for websites and assets).

Its main job is to prevent the most common failure: jumping to clever copy before the strategic foundations are settled.

## Before you start

1. Check for a shared context file: first `.agents/product-marketing.md`, then `.claude/product-marketing.md`. Older setups may use `product-marketing-context.md` in either folder.
2. If one exists, read it and pull the critical three from it:
   - **What it does:** the product and category anchor, or product overview section.
   - **Who it is for:** the target customer or target audience section, including the use case.
   - **How it is different:** competitive alternatives, their problems, and differentiation.
   Also use its positioning statement, messaging building blocks, proof, objections, voice rules, and words to avoid. Only ask for what is missing or specific to this task.
3. If no file exists, suggest running `gtm-context` once so every GTM skill can share the same foundations. Do not block on it. Proceed with the questions below.
4. Ask no more than five questions in total. Anything still unanswered becomes a flagged assumption.

## Mode detection

**Foundation mode.** The user has not defined their positioning. Walk them through the critical three, then produce messaging or copy.

**Execution mode.** Positioning is already defined, or there is enough context to infer it (context file, uploaded docs, project knowledge, or conversation history). Write copy directly.

If the user asks for copy but the critical three are missing, use foundation mode anyway. Explain in one line why: copy written without positioning tends to be generic and gets rewritten later.

## The critical three

Before writing any copy, you need clarity on these three. If any are missing, ask for them one at a time so the user can focus on each answer.

**Question 1: What does your product do?**

Always share the three anchor patterns so the user has context to answer clearly:

> Describe your product using one of these patterns:
>
> - **Product category:** "[Product] is a [category]", for example "Attio is a CRM"
> - **Use case:** "[Product] is for [activity]", for example "Calendly is for scheduling meetings over email"
> - **Competitive alternative:** "[Product] replaces [alternative]", for example "Slack is an email replacement"
>
> Which pattern fits best, and how would you complete it?

**Question 2: Who is it for?**

> Describe your target audience, including the specific activity or workflow they are trying to do (the use case). The more specific, the stronger the messaging.
>
> Example: "Sales teams in mid-market SaaS companies who are manually enriching CRM data."

**Question 3: How is it different?**

> What would your customers use if your product did not exist (the competitive alternative)? And what is the main problem with that alternative that your product solves?
>
> Example: "They would use Clay, but Clay has a steep learning curve and is built for technical users. We are easier to use out of the box."

For all other inputs (specific benefits, proof points, how it works, and social proof), make reasonable assumptions from the available context and flag them clearly so the user can correct them. You may use up to two further questions for these if an answer would change the copy materially.

## Positioning framework

Use this framework to evaluate and guide every messaging decision.

### The hierarchy

**Positioning** leads to **messaging**, which leads to **copy**.

Positioning is the strategic choice of who to target and how to differentiate. Messaging translates positioning into audience-specific building blocks. Copy is the exact words for a specific asset. Always work top-down.

### The two positioning choices

**Choice 1: target segment.** It must include a use case (the functional activity the product supports). Demographics and firmographics refine the segment but cannot replace the use case.

**Choice 2: differentiation.** Four elements, in this order:
1. Competitive alternative (what they use today)
2. Problem with that alternative
3. How you differ (features and capabilities)
4. Why your way is better (benefits and outcomes)

**Unique value = the customer's problem + a differentiated way of solving it.**

### Positioning anchors

Primary anchors are required. They let prospects classify the product in their heads.

| Anchor type | Pattern | When to use |
|---|---|---|
| Product category | "[Product] is a [category]" | Mature markets with known categories |
| Use case | "[Product] is for [activity]" | Immature markets without a named category |
| Competitive alternative | "[Product] replaces [alternative]" | Universally known, disliked alternatives |

Secondary anchors (company type, department, and desired outcome) add precision. Layer primary and secondary anchors for maximum clarity.

### Product type and comparator

| Product type | Position against |
|---|---|
| 10x better in an existing category | Current category leaders |
| New way or new category | Old workflows, tools, and processes |
| Vertical solution | Horizontal tools not built for the audience |
| Buy versus build | Internal processes or homegrown tools |

### Feature, capability, and benefit

Treat these as mutually exclusive terms:
- **Feature:** a technical aspect of the product (what it has).
- **Capability:** a new ability the product unlocks (what you can now do).
- **Benefit:** a measurable or emotional outcome (what you gain).

Lead with capabilities and benefits. Use features as proof points.

## Messaging building blocks

Before writing copy for any asset, define or confirm these blocks.

**Top level (required)**
1. **Problem you solve:** the specific pain for the primary audience.
2. **What your product is:** a clear description using a primary anchor.
3. **Who it is for:** specific enough for the right audience to self-select.
4. **Why it is better:** differentiated value against the competitive alternative.

**Supporting blocks**
- **Two to three benefits:** each addresses a specific pain, with proof points.
- **Two to three use cases or personas:** how different segments use the product.
- **How it works:** three clear steps.
- **Social proof:** logos, quotes, or data.

If the user has not provided these, infer them from context and present them for confirmation before writing copy.

## Workflow

### Foundation mode

1. **Gather the critical three.** Ask one question at a time, using the wording above.
2. **Choose the primary anchor.** Based on market maturity, recommend category, use case, or competitive alternative. State the recommendation and why.
3. **Name the competitive alternative and its problem.** If not stated, infer it and flag it.
4. **Draft the messaging building blocks.** Present all top-level and supporting blocks for confirmation.
5. **Write copy** once the blocks are confirmed or corrected.
6. **Offer to save.** If there is no context file, or the file lacks positioning or building blocks, offer to add them to `.agents/product-marketing.md` so other skills can reuse them.

### Execution mode

1. **Confirm the critical three** are present. If any are ambiguous, state your interpretation and proceed.
2. **Infer the messaging building blocks** from available context. Flag assumptions.
3. **Write copy** for the requested asset or section, using `references/landing-page-sections.md` for website and landing page sections. Include a brief rationale for each section.
4. **Run the quality checklist** against the output before presenting it.

### Output rules

- Produce **one strong recommendation with rationale**, not several variants. Give alternatives only if the user asks.
- Always explain the strategic reasoning behind copy choices in two to three sentences per section.
- When writing multiple sections, keep a **running narrative**: each section reinforces the hero's core value proposition.

## Writing rules

**Always:**
- Start with clarity. If a visitor cannot tell what the product does in five seconds, rewrite.
- Use a primary positioning anchor before layering benefits or outcomes.
- Be specific: name the audience, the category or use case, and the pain.
- Use active voice and strong verbs. Cut weak verb and adverb pairings.
- Use British English spelling (optimise, organise, colour) and the Oxford comma.
- Use sentence case for all headings and subheadings.
- Keep sentences under 25 words and paragraphs under 100 words.
- Connect every claim to a problem, capability, or outcome within one logical step.
- Follow any voice rules and words to avoid in the context file. They override these defaults where they conflict.

**Never:**
- Lead with benefits alone. Benefits without an anchor leave visitors wondering what the product is.
- Invent a category using jargon prospects will not recognise.
- Use vague qualifiers such as "powerful", "seamless", "revolutionary", or "cutting-edge".
- Use emojis, exclamation marks, or hyperbolic language.
- Use em dashes. Use en dashes only where appropriate.
- Use the reframe structure that rejects one thing to introduce another ("Not X, it's Y"). State what things are directly.
- Write "Helps you to", "Enables you to", or "Allows you to". Use direct action instead.
- Write headers that could describe any product. Every header must be specific to this product.

## Output format

### Positioning and messaging building blocks

```
**Problem:** [specific pain]
**Product:** [primary anchor description]
**Audience:** [who, with use case]
**Competitive alternative:** [what they use today] (problem: [its main problem])
**Why better:** [differentiated value]

**Benefits:**
1. [Benefit]: [proof point]
2. [Benefit]: [proof point]
3. [Benefit]: [proof point]

**Assumptions to confirm:** [anything inferred rather than stated]
```

### Website copy

Present each section with its copy, followed by a two to three sentence rationale.

```
## Hero

**Header:** [header copy]
**Subheader:** [subheader copy]
**CTA:** [button text]

Rationale: [which anchor, why this lead, what competitive alternative is implied]
```

### Individual assets (headlines, value propositions, and descriptions)

Present the copy, then a brief breakdown of which positioning elements are at work and why.

### Audits of existing copy

Score the page against the quality checklist, quote the lines that fail, and give a rewrite for each failing line. Lead with the single biggest problem.

## Quality checklist

Before delivering any copy, check:

- [ ] **Five-second test:** can a stranger tell what the product does immediately?
- [ ] **Audience clarity:** is it obvious who this is for?
- [ ] **Anchor present:** does the copy include a primary positioning anchor (category, use case, or competitive alternative)?
- [ ] **Differentiation clear:** is it obvious why this beats the alternative?
- [ ] **Proof present:** are claims backed by features, stats, or outcomes?
- [ ] **Specificity:** could this copy describe a competitor? If yes, it is too generic. Rewrite.
- [ ] **Brevity:** does every sentence earn its place?
- [ ] **No vague marketing speak:** does anything trigger a "that sounds like fluff" reflex?
- [ ] **Narrative continuity:** do sections reinforce each other, building from the hero's core claim?
- [ ] **Assumptions flagged:** is every inferred input labelled as an assumption?
- [ ] **Style compliance:** British English, Oxford comma, sentence case headings, no emojis, no em dashes, and active voice.

## Related skills

- `gtm-context`: builds the shared context file this skill reads.
- `jtbd-research`: finds real customer language and competitive alternatives when the user does not know them.
- `ad-headline-maker` and `ad-description-maker`: turn the finished messaging into ad copy.

## Credits

Built on April Dunford-style positioning (Obviously Awesome), Fletch PMM's positioning and messaging framework, and Julian Shapiro's landing page guide.

- **April Dunford, Obviously Awesome:** starting from the competitive alternative, deriving differentiated value from what the alternative fails to do, and using the market category as the frame of reference that helps buyers make sense of a product.
- **Fletch PMM (Anthony Pierri and Robert Kaminski):** the two positioning choices (segment with a use case, and differentiation), primary and secondary positioning anchors, positioning against a comparator by product type, feature versus capability versus benefit, messaging building blocks, and the homepage section structure in `references/landing-page-sections.md`.
- **Julian Shapiro, landing page guide:** the hero header formula "[core benefit]. [objection crusher]", the principle that the header and subheader must say what the product does on their own, and pairing each feature with the objection it handles.

The mode detection, question wording, writing rules, and quality checklist are Theo Ohene's own synthesis. Any errors in applying these frameworks are his, not the authors'.
