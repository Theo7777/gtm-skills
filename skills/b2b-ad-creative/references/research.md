# B2B SaaS static ad patterns: research notes

Researched 2026-10-01. Use as background for the format files, not as proof: every claim is labelled sourced, reported (vendor content), or inferred. Refresh it when the LinkedIn or Meta ad library can be browsed in a real browser (both blocked automated access).


**Access note:** LinkedIn Ad Library and Meta Ad Library both blocked automated fetches (LinkedIn returned HTTP 403; Meta returned a connection error). No ads were viewed directly in either library. Findings below come from adfolio.design (partially — it rate-limited after one fetch, HTTP 429, so only its metadata/description was captured, not the gallery itself), company case-study pages, and several swipe-file/breakdown blogs (addogs.ai, godesignguru.com, moda.app, vibemyad.com, saashero.net). These blogs are vendor content, not primary ad-library data — treat their specific claims as **reported, not verified**, and their numeric performance stats as unconfirmed. Where I had no sourced example, I've marked the entry **(inferred)** from general design convention rather than invented as fact.

## 1. Before and after

**Common ground:** vertical or horizontal split down the centre, same visual grammar on both sides so only the content changes (same UI chrome, same icon style). Headline sits above or across the divider, short enough to read in under 2 seconds. Example sourced: Cognism ad literally labelled "Before: 6% open rate / After: 60% open rate" — numbers only, no narrative copy. SaaS Hero's "spreadsheet retirement" example: cramped, error-filled spreadsheet left vs clean pipeline view right.
**Proportions (inferred):** headline band ~15–20% of canvas height, split body ~70%, thin CTA/logo footer ~10%.
**Variation axes:** metaphor object (bicycle vs motorbike, spreadsheet vs dashboard) vs literal UI before/after; horizontal split vs vertical split; numbers-only vs numbers-plus-caption; chaos-vs-calm colour contrast (desaturated/red "before", brand-colour "after").
**Copy patterns:** label pairs ("Before / After", "Without X / With X"), often just 2–6 words per side. Example: Cognism "Before: 6% open rate / After: 60% open rate."
**Mistakes to avoid:** making the "after" side too busy (undoes the contrast); using different UI styles on each side so it reads as two unrelated ads; burying the stat in small type.

## 2. Product in action

**Common ground:** short headline above a rounded-corner product screenshot, screenshot bled off the bottom or right edge to feel "real" rather than framed. Soft gradient (2–3 colour, e.g. blue-to-purple, teal-to-cyan) behind the UI to add depth without competing with it. Sourced: Grammarly (correction chip "their→there"), Figma (live cursors), Intercom ("See Fin in Action" — real chat UI), Outreach (audio-wave visual on purple gradient).
**Proportions (inferred):** headline ~20–30% of canvas height at top, screenshot fills remaining ~70–80% and overflows the frame edge; 8–12px corner radius is the B2B-conservative norm (more conservative than consumer-app roundness).
**Variation axes:** full UI vs single zoomed-in interaction (one chip/tooltip, not the whole dashboard); light vs dark gradient; screenshot bleeding bottom vs right vs both; product shown mid-action (cursor, typing state) vs static state.
**Copy patterns:** benefit-led, often naming the specific feature. Intercom: "Take the load off with chatbots that resolve 33%" (of common issues). Leapwork: "Ensure continuity with every D365 update thanks to Leapwork's test automation."
**Mistakes to avoid:** cramming the entire app dashboard in (illegible at feed size); screenshot and gradient fighting for attention; stale/generic-looking UI that reads as a stock mockup.

## 3. Testimonial

**Common ground:** the quote is the hero — occupies roughly half the canvas — with the measurable result inside the quote visually emphasised (bold, colour highlight, or larger type on just the number/outcome phrase). Name, role, company logo or headshot sit as a small, clearly secondary block beneath. Sourced pattern: WorkMotion card (headshot + stars + logo + quote); Slack executive quote with name/title/logo; Grüns/ARMRA (consumer but same mechanic) bold outcome words within the quote.
**Proportions (inferred):** quote block ~50–60% of canvas, attribution block ~15%, surrounding whitespace/background ~25–30%.
**Variation axes:** headshot present vs logo-only; quote as full sentence vs fragment with bolded result; card-on-colour-field vs card-on-photo; star rating included vs omitted.
**Copy patterns:** lead with the number inside natural speech, not a separate stat line. Pattern example (format, not a verified direct quote): "[Quote emphasising a %, hours-saved, or revenue figure] — Name, Title, Company" with logo bottom-right.
**Mistakes to avoid:** unverifiable or vague praise ("great tool!"); logo and headshot both competing for the same visual weight; quote too long to read at a glance (one sentence, not a paragraph).

## 4. Value proposition plus 4–8 customer logos

**Common ground:** headline stating the value prop at top, logo row/grid beneath, CTA at the bottom not competing with the logos. Sourced: ClickUp ("Bring your teams together & get more done" over Samsung/IBM/Booking.com logos, "join 800,000+ teams" proof line); Deel (Uber, Avis, Booking.com logos for instant reassurance); Stripe (logo cluster of recognisable Fortune 500 names + single CTA).
**Proportions (inferred):** headline ~30–40% of canvas height, logo grid ~35–45% (one row of 4 or two rows of 3–4), CTA/footer ~15–20%.
**Variation axes:** logos in a straight row vs grid; greyscale vs full-colour logos; logo wall alone vs logo wall + one proof stat ("join 800,000+ teams"); solid colour field vs subtle texture background.
**Copy patterns:** value prop stated plainly, proof number optional add-on. ClickUp: "Bring your teams together & get more done." Asana-style equivalent (pattern, not a verified exact ad): headline + "Trusted by [logo row]."
**Mistakes to avoid:** too many logos shrinking each past legibility (keep to 4–8); mixing logo styles/qualities; logos outranking the headline in visual weight.

## 5. ICP background

No directly sourced example matched every element (photo of buyer at work, dark overlay, pill tags, stat badge) — LinkedIn/Meta libraries were unreachable and the reachable swipe-file blogs didn't break this composite down. Description below is **(inferred)** from general B2B SaaS convention (common in HR/fintech/dev-tool ads), not a confirmed current example.
**Common ground (inferred):** full-bleed photo of a realistic buyer persona at work (not glossy stock), dark brand-colour gradient overlay (usually bottom-up or diagonal) to guarantee text contrast, bold headline in the lower third, 1–3 small pill-shaped feature tags, CTA button, optional small stat badge in a corner.
**Proportions (inferred):** photo fills 100% of canvas; overlay darkens roughly the bottom 40–50%; headline sits in that darkened zone at ~15–20% of canvas height; pills and CTA together ~10%.
**Variation axes:** overlay direction (bottom-up vs diagonal vs full-wash); photo of individual vs team/office scene; pill tags as feature list vs none; stat badge present vs absent.
**Copy patterns (inferred, pattern not verified quote):** short identity-plus-pain headline ("Built for finance teams who hate spreadsheets") with role-specific subline.
**Mistakes to avoid:** insufficient overlay contrast (text unreadable in-feed at small size); stock photography that looks staged; too many pill tags cluttering the lower third.

## 6. Headline plus smaller ICP photo with floating UI chips

Sourced anchor: Asana's Accor case study — confirmed via asana.com/case-study/accor, the real result is "50% reduction in meetings and emails" (plus a 96% efficiency figure). Could not confirm this exact stat appeared as a static ad, since both ad libraries were blocked; the visual description is **(inferred)** from Asana's known case-study-ad style.
**Common ground (inferred):** big stat-led headline at top ("[Customer] reduces [metric] by [%] with [Product]"), smaller photo of the customer/workplace below or beside it, 2–4 small floating product-UI cards (task cards, status pills, progress rings) overlapping the photo's edges to show the product without a full screenshot.
**Proportions (inferred):** headline ~35–45% of canvas height, photo ~40–50%, UI chips overlapping photo edges (each roughly 10–15% of canvas width).
**Variation axes:** one big stat vs two smaller stats; photo of a person vs an office/product-in-use scene; number of floating chips (2 vs 4); chips showing real UI vs abstracted icons.
**Copy pattern (real, verified):** "Accor reduces meetings and emails by 50% with Asana" — Asana.
**Mistakes to avoid:** chips so small they read as decoration rather than product proof; stat and photo competing in size so neither wins; using a stat without a named, attributable customer (reads as unverifiable).

## LinkedIn vs Meta for B2B statics

From moda.app's own sample analysis (reported, not independently verified by me): Meta ads for B2B skew toward **zero text in the image** (55/60 sampled) with the argument carried in primary text, and favour photography of people. LinkedIn ads do the opposite — 47/60 carried the headline inside the image, and typography cards/screenshots were common. LinkedIn copy runs longer and more professional in tone; Meta favours punchier, scroll-stopping visuals. Both platforms reward single-message, single-CTA static ads; formats don't transfer directly between platforms without re-export per aspect ratio (LinkedIn 1200×1200 or 1200×628; Meta 1:1 or 4:5).

## Performance evidence, labelled

- **Reported by vendor (adfolio.design, via search snippet, not independently verified):** plain single-image statics got 0.42% CTR vs 0.24% for video in their sample — unclear sample size/method.
- **Reported by vendor (moda.app):** longest-running Meta B2B ads had zero on-image text; "person-first" layouts survived roughly twice as long as scene-based ones. Longevity used as a performance proxy, not actual click/conversion data — the source explicitly says neither library shows spend or results.
- **Opinion/convention, not data:** LinkedIn video reportedly outperforms static on engagement by 20–30% per one marketing-agency blog (searchlab.nl) — single-source claim, unverified.
- No proven (first-party, controlled-test) performance data was found for any of the six formats in this research pass.
