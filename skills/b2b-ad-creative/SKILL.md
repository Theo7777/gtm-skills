---
name: b2b-ad-creative
description: Static ads for B2B SaaS, software, and apps. Builds a launch set as fully editable Figma frames, in the client's own brand, from six proven formats - before and after, product in action (rounded screenshot under a headline), testimonial quote, value proposition with 4-8 customer logos, ICP photo background with tags, and headline over a smaller ICP lifestyle photo with floating product chips. Pulls brand colours, fonts, logos, testimonials, and product screenshots from the client's website and context, generates ICP photos when needed, and builds 1080x1080 and 1080x1350 frames where every text, logo, shape, and image layer stays editable. Works in Claude Code and Codex with the figma-console MCP. Use when a campaign is starting, or when the user says "B2B ads", "launch ads for [client]", "make ads in Figma", "testimonial ad", "before and after ad", "product ad", "logo ad", "value prop ad", "ICP ad", "SaaS ads", "software ads", or "ad set for [client]". Not for ecommerce or DTC product ads.
metadata:
  version: 1.0.0
  source: mine
  author: Theo Ohene
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, AskUserQuestion, mcp__figma-console__figma_get_status, mcp__figma-console__figma_execute, mcp__figma-console__figma_set_image_fill, mcp__figma-console__figma_capture_screenshot
---

# B2B ad creative

Static ads for B2B SaaS, software, and apps. Most ad creative skills are built for ecommerce and DTC brands – product shots, offers, lifestyle images. This one is built for software, where the ad has to show a product people can't hold, prove it with real customers, and speak to a buyer sitting at their desk.

It builds a launch set of static ads that look like the best B2B SaaS brands made them, in your brand. Everything is built in Figma, so you can change any word, colour, logo, or image afterwards.

**Output:** a Figma page `Ads – <Client>` with one Section per format, frames named `<CODE>-<nn> · <slug> · <size>`, brand colours as Figma variables and type as text styles (change the accent once, every ad updates). Plus a campaign folder with the copy, sources, the build spec (so it can be rebuilt), and a "to confirm" list.

**Rules first:** nothing from another client or brand goes into these ads. Every claim, quote, number, and logo has a source.

## Setup

The skill needs Figma Desktop and one MCP server of the user's own. Nothing is hard-coded, and nothing is spent until an image is generated.

| Tool | What it does here | How to connect | Cost |
|---|---|---|---|
| Figma Desktop | Holds the ads as editable frames | https://www.figma.com/downloads/ (the browser version cannot run the bridge plugin) | Free plan works |
| figma-console MCP | Lets the agent create frames, variables, text styles, and image fills in the open file | Follow https://github.com/southleft/figma-console-mcp: create a Figma personal access token, add the server (`npx -y figma-console-mcp@latest` with `FIGMA_ACCESS_TOKEN` set), then import and run its Desktop Bridge plugin in Figma (Plugins, Development) | Free |
| Image backend (optional) | Generates ICP photos for the IB and IP formats | The Codex CLI (`codex` on your PATH), or `OPENAI_API_KEY` set in your environment | Codex: within your plan. OpenAI API: billed per image |
| Python 3 | Runs the local asset server and the image script | Standard library only, nothing to install | Free |

In Claude Code, the MCP can be added in one line:

```bash
claude mcp add figma-console -s user -e FIGMA_ACCESS_TOKEN=<your token> -- npx -y figma-console-mcp@latest
```

In Codex, the MCP is declared in `agents/openai.yaml`; add the same server to your Codex config as the figma-console README shows.

The official Figma MCP is not enough: it has no `figma_execute` or `figma_set_image_fill`, so it cannot build frames. Without an image backend, the IB and IP formats use a flat brand-colour background or a photo the user supplies. Without Figma connected, the skill still writes the copy and the build spec, and the build runs later (see Step 0).

## The bar

`references/examples/<format>/` holds reference ads for fictional brands. **They set the minimum standard, and the first generation must meet it**: the user should never see a draft that looks basic. Before showing anything, open the examples for each format next to your screenshots and compare. If yours is plainer, fix it first. The examples are image-model renders, so match their hierarchy, colour discipline, and finish, not effects Figma shapes cannot make (3D objects, painted light).

Non-negotiable, every ad, first time:

1. **A designed typeface.** The client's own font, installed; otherwise a designed match (Plus Jakarta Sans, Figtree, Manrope, DM Sans, Outfit, Satoshi). Never Arial, Helvetica, Roboto, system fonts, or Inter unless one of them is genuinely the client's brand font. The builder enforces this.
2. **A visual in every ad.** A real product screenshot, real logos, a photo, or product chips and cards. Never a text-only ad.
3. **Real logos.** The client's logo file (colour on light, white or reversed on dark) and real customer logos. Never a typed name, never a logo in a white box on a dark ad.
4. **No plain white backgrounds.** An off-white, a brand tint, or a soft gradient.
5. **Contrast with a point.** Before and after shows a real mess against the product; highlights mark the payoff, not filler.
6. **Proof is real.** Quotes verbatim and attributed, numbers sourced, logo labels word for word from the site.
7. **The check passes.** `scripts/check.js` (step 7) finds empty image slots, basic fonts, plain white, typed logos, and text off the frame. Zero issues before the user sees the set, or each remaining one explained.

## The six formats

| Code | Format | Image | Read |
| --- | --- | --- | --- |
| BA | Before and after | Optional (UI or metaphor objects) | `references/formats/before-after.md` |
| PA | Product in action | Product screenshot, rounded corners | `references/formats/product-in-action.md` |
| TE | Testimonial | Customer logo or headshot | `references/formats/testimonial.md` |
| VL | Value proposition with logos | 4–8 customer logos | `references/formats/value-prop-logos.md` |
| IB | ICP background | Generated photo, full bleed | `references/formats/icp-background.md` |
| IP | Headline and ICP photo | Generated photo, inset, with product chips | `references/formats/headline-icp-photo.md` |

Each format file has the anatomy, the layout grid for both sizes, the copy rules, the variation axes, and the reference ads in `references/examples/`. Look at the examples before writing copy for a format.

## Step 0: Figma preflight

Call `figma_get_status`. Connected: carry on. Missing or not connected: say so, keep going with copy and assets, and build later (see `references/figma-build.md`, section 6). Never block the copy on Figma.

## Step 1: load the context

Look for shared GTM context: `.agents/product-marketing.md` first, then `.claude/product-marketing.md`. If either exists, read the product, buyer, messaging, and proof it lists, and any brand assets folder it points to. If neither exists, suggest running the `gtm-context` skill once, but never block on it. Ask up to five questions, only the ones you need:

1. What is the product, and what is the website URL?
2. Who is the buyer (role, company type)?
3. What is the one result customers get?
4. Any proof to use: testimonials with numbers, customer logos, stats?
5. Any brand kit (logo files, fonts, colours) or product screenshots?

## Step 2: fill gaps from their website

Only for what Step 1 did not answer. Follow `references/brand-from-website.md`: colours, fonts, logo, customer logos from their "trusted by" section, testimonials and case-study results with their URLs, product screenshots, and ICP roles.

Show the brand tokens you found (hex values, fonts, logo file) and wait for a yes before building on them.

**Fonts: the client's own, installed before building.** If the client supplied font files (brand kit), install them (`cp <files> ~/Library/Fonts/`, then restart Figma) and check with `figma.listAvailableFontsAsync()`. If they did not, pick the closest installed or free Google Font yourself, say which and why, and carry on (the user can switch: every text uses the client's text styles). Never take font files from the client's website: web fonts are licensed for their site, not for us. Never fall back to Inter silently.

**Logos: real files, never typed names.** The client's logo in a dark and a light version (SVG from their site header, or their brand kit). Customer logos from the client's site; if a customer's logo is missing there, from that customer's own site or press kit. For a dark background, use the logo's white or reversed version; if only a dark-lettered version exists, recolour its dark parts to white and keep its colours (see `brand-from-website.md`). A typed name stands in only when no file exists anywhere, and goes on the to-confirm list.

## Step 3: ask what to make

Unless the request already says, ask with AskUserQuestion:

1. **Which formats?** "All six" or pick (multi-select).
2. **Sizes?** 1080×1080, 1080×1350, or both (default both).
3. **Variations per format?** 2 (default) or 3.

## Step 4: write the copy, then stop

For each chosen format, write a copy table: variation, what changes (the variation axis from the format file), every text field, and the source for every claim. Rules in `references/copy-rules.md`. In short:

- Testimonials are **verbatim quotes** from the client's website, case studies, or reviews, with the URL. A quote with a number is a bonus, not a requirement. No real quote: say so and skip the testimonial rather than invent or paraphrase one.
- Logos come only from the client's own site or a list they gave. Each one is listed for the user to confirm.
- Numbers come from a source, never from a guess.

Then show the table and the "to confirm" list, and wait for a go. The user will edit the words; that is the cheapest moment to do it.

## Step 5: get the images

- **Product screenshots (PA, and BA when it shows UI):** in order of preference, a screenshot the user or the client provides, a product image from their website, a headless-browser screenshot of a public product page. If none exists, build an illustrative UI in Figma from editable shapes (floating chips and cards) and list it as "illustrative, not a real screen" for the user. Never generate a fake product screen with an image model.
- **ICP photos (IB, IP):** generate with `scripts/generate_image.py` (Codex image tool first, then the OpenAI Images API), using the prompt rules in the format file. In Codex, call the built-in image tool directly instead of the script. Generated people are never presented as real customers.
- **Logos:** SVG where the site has it (it comes into Figma as editable vectors), otherwise PNG.

Save everything under `ads/<YYYY-MM-DD>-<slug>/assets/` in the current project folder.

## Step 6: build in Figma

Follow `references/figma-build.md`: it sets up the brand variables and text styles once, then builds every frame from a spec with one builder per format. Everything stays a native, editable Figma layer: text is text, chips and pills are auto-layout frames, logos and photos are image fills on named rectangles.

## Step 7: check and fix, before showing anything

1. Run `scripts/check.js` (see `references/figma-build.md`, section 3). Fix every issue it lists.
2. `figma_capture_screenshot` each frame and compare with `references/examples/<format>/`. Look for anything plainer than the bar, clipped text, weak contrast on photos, stretched logos, and empty space that makes an ad look unfinished.
3. Fix with targeted `figma_execute` calls or a rebuild. Up to three rounds; then list anything left, with why.

Only then show the user.

## Step 8: save and hand over

In `ads/<YYYY-MM-DD>-<slug>/`: `copy.md` (every frame's words and sources), `spec.json` and `fill.json` (so the set can be rebuilt or extended), `prompts.md` (image prompts), and `to-confirm.md`. Export PNGs with `scripts/export.js` (they land in `exports/`). Report: the Figma page, the frames built, the check result, what was generated versus sourced, and the to-confirm list.

## Design rules

- **Never a plain white background.** Use an off-white, a light brand tint, or a soft gradient.
- **Flat colour by default, gradients sparingly.** Most ads in a set use a flat brand colour, an off-white, or a light tint. At most one in four uses a gradient, and it is a soft two-tone blend, never swirls or glowing waves. Flat backgrounds keep every colour bound to a brand variable, and the product and headline do the work.
- **Logo rows carry the site's own label** above them ("Trusted by:", "Used by teams at"), word for word.
- **Screenshots keep their shape:** never cropped through the middle; they bleed off an edge instead.
- **Before and after must show the contrast,** not two lists: a messy before (crossed-out, tilted chores) against a calm after with the product in it.

## Variation, not repetition

Two ads of the same format must differ on a stated axis (dark vs light, list vs metaphor, logo vs headshot, different proof point), not just different words. Across the set, use at least two background treatments so the feed does not see the same ad six times.

## Reference ads

`references/examples/<format>/` holds ads for fictional brands, made as references for this skill. They show the standard to hit. Take the layout ideas, never their words. See `references/examples/README.md` for what each one teaches.

## Codex

Works the same in Codex: the figma-console MCP is listed in `agents/openai.yaml`, and Codex generates ICP photos with its own image tool.
