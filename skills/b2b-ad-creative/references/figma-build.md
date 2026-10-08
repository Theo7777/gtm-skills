# Figma build

Everything runs through `figma_execute` on the figma-console MCP (Desktop Bridge plugin running in Figma Desktop). The official Figma MCP has no `figma_execute` or `figma_set_image_fill`, so this needs figma-console. Pass `timeout: 30000` on every call. Plugin API rules that bite: colours are 0 to 1, every font must be loaded before text is set, and only what you `return` comes back.

## What it makes, and why it stays editable

- A page `Ads – <Client>`, one Section per format, frames named `<CODE>-<nn> · <slug> · <W>x<H>`. Rerunning replaces frames with the same name, so the spec can be edited and rebuilt.
- **Brand colours are Figma variables** in a collection `Brand – <Client>` (dark, brand, onBrand, accent, onAccent, light, ink, muted, white). `brand` is the highlight on light backgrounds and `accent` the highlight on dark ones, so emphasis stays readable on both. Every solid fill is bound to one, so changing the accent in the Variables panel recolours every ad. Gradients cannot bind variables; they use the same hex values and are named `Gradient`.
- **Type is local text styles**, `<Client>/<Role> <size>` (for example `Acme/Headline 72`). Change a style's font once and every text using it follows.
- **Text is live text.** Accent phrases are range colours inside the same text layer, so the words stay editable.
- **Pills, tags, chips, and lists are auto-layout frames**: edit the label and the shape resizes.
- **Images sit on named rectangles** (`Image · screenshot`, `Image · background-photo`, `Image · lifestyle-photo`, `Image · customer-logo-3`, `Image · logo-light`), filled in step 2. Swap any image with Figma's image fill.

## 1. Build

The builder lives in `scripts/build.js` and the image filler in `scripts/fill.js`. Neither is pasted into the chat: Figma fetches them, with the campaign's `spec.json` and `fill.json`, from a small local server.

**Start the server** (background), pointing at the campaign's `ads/` folder. Ports 9228–9232 are the free ones the Desktop Bridge allows:

```bash
python3 scripts/serve_assets.py 9231 "<project folder>/ads/<date>-<slug>"
```

**Write `ads/spec.json`** (`fonts.fallbacks` optional: your chosen match if the brand font is not installed):

```json
{
  "client": "Acme",
  "colours": { "dark": "#0F2240", "brand": "#1F6FEB", "onBrand": "#FFFFFF", "accent": "#3CC29A", "onAccent": "#0F2240", "light": "#EEF3F8", "ink": "#0B1220", "muted": "#6B7A90", "white": "#FFFFFF" },
  "fonts": { "display": "Montserrat", "body": "Inter" },
  "logo": { "mode": "image", "ratio": 3 },
  "sizes": [[1080, 1080], [1080, 1350]],
  "frames": [
    { "code": "TE", "n": 1, "slug": "productivity", "variant": "dark", "quote": "Since adopting Acme, we have seen productivity increase by 20–30%.", "emphasis": "productivity increase by 20–30%", "name": "Alex Example", "role": "Head of Operations, Example Ltd" },
    { "code": "VL", "n": 1, "slug": "trusted", "variant": "light", "headline": "Trusted by 1,000+ finance teams", "emphasis": "finance teams", "subline": "Close the books in days, not weeks.", "cta": "Book a demo", "logos": 6, "logosLabel": "Trusted by:", "logoStrip": true },
    { "code": "PA", "n": 1, "slug": "close-faster", "variant": "bleed", "headline": "Close the month without the spreadsheet chase", "cta": "See it in action" },
    { "code": "BA", "n": 1, "slug": "month-end", "variant": "list", "headline": "How month-end feels:", "beforeLabel": "Without Acme", "afterLabel": "With Acme", "before": ["Chasing receipts", "Copying into Excel", "Fixing formulas"], "after": ["Approve"] },
    { "code": "IB", "n": 1, "slug": "capacity", "variant": "tags", "headline": "Your next 20% of capacity is already on the team.", "subline": "Acme automates the admin around every close.", "tags": ["Receipts", "Approvals", "Reconciliation"], "cta": "See the workflow", "stat": "+20%" },
    { "code": "IP", "n": 1, "slug": "case-result", "variant": "result", "headline": "Example Ltd cuts month-end by 40% with Acme", "emphasis": "by 40%", "chips": ["Finance"], "card": "progress" }
  ]
}
```

Colours: `brand` is the highlight on light backgrounds and `accent` the highlight on dark ones. `logo.mode` is `image` (slots `logo-dark` and `logo-light`, filled with the real logo in step 2; `ratio` is its width over height) or, only when no logo file exists, `text`. Each frame's fields are listed in its format file. If a large set times out (30 seconds), split `frames` across two runs.

**Run it** with `figma_execute`, `timeout: 30000`:

```javascript
const base = "http://localhost:9231/";
const v = "?v=" + Date.now();   // Figma caches fetches; the timestamp forces fresh files
const spec = await (await fetch(base + "spec.json" + v)).json();
const src = await (await fetch(base + "skill/build.js" + v)).text();
return await new Function("figma", "spec", "return (async () => {" + src + "\n})();")(figma, spec);
```

It returns the frames built, every image slot by key, and `fontNotes`. A brand font that fell back to Inter is not installed on this machine: say so in the report. The builder never switches the open page (that call can hang in the Desktop Bridge), so tell the user to open the `Ads – <Client>` page.

Plugin API traps the builder already handles: Figma ignores the opacity of a variable-bound paint on first assignment (the builder reassigns a copy), Figma caches fetched files (the loader adds a timestamp), and loading a font style that does not exist in an installed family hangs instead of failing (only installed styles are loaded).

## 2. Fill the images

Put the files in `ads/assets/` (photos as JPEG: `sips -s format jpeg -s formatOptions 85 photo.png --out photo.jpg`), then write `ads/fill.json`:

```json
{
  "client": "Acme",
  "images":   [{ "key": "screenshot", "file": "assets/screenshot.jpg", "mode": "FILL", "keepRatio": true },
               { "key": "after", "file": "assets/product.jpg", "mode": "FILL", "keepRatio": true },
               { "key": "customer-logo", "file": "assets/customer-logo-on-dark.png", "mode": "FIT" },
               { "key": "background-photo", "file": "assets/ib-photo.jpg", "mode": "FILL" },
               { "key": "lifestyle-photo", "file": "assets/ip-team.jpg", "mode": "FILL", "frame": "IP-01" }],
  "svgRows":  [{ "keyPrefix": "customer-logo-", "file": "assets/customer-logos.svg", "name": "Logos · customers" }],
  "svgs":     [{ "key": "logo-dark", "file": "assets/logo.svg" }, { "key": "logo-light", "file": "assets/logo-white.svg" }]
}
```

- `images`: one upload, applied to every slot with that key across all frames, or only frames whose name starts with `frame`. `keepRatio` (screenshots) resizes the slot to the image's shape so nothing is cropped.
- `svgRows`: one SVG containing several logos replaces a whole row of slots, as editable vectors, aligned to the top of the row under its label.
- `svgs`: a single SVG (usually the client's logo) replaces each slot with that key.
- `textTiles`: last resort, only when no logo file exists anywhere: an editable text tile named "replace with logo", listed for the user.

Run with `figma_execute`, `timeout: 30000`:

```javascript
const base = "http://localhost:9231/";
const v = "?v=" + Date.now();
const plan = await (await fetch(base + "fill.json" + v)).json();
const src = await (await fetch(base + "skill/fill.js" + v)).text();
return await new Function("figma", "plan", "base", "return (async () => {" + src + "\n})();")(figma, plan, base);
```

It returns counts and any `missing` keys. Do not use `figma.createImageAsync(url)` (Figma rejects the domain), and there is no `TextDecoder` in the plugin.

**If the local server cannot run:** shrink the image (`sips -s format jpeg -s formatOptions 75 --resampleHeightWidthMax 1200`), base64 it, and call `figma_set_image_fill` with `nodeIds`, `imageData` (no `data:` prefix), and `scaleMode`.

## 3. Check, then export

**Build, fill, and check in one call** once `spec.json` and `fill.json` exist:

```javascript
const base = "http://localhost:9231/";
const v = "?v=" + Date.now();
const run = async (file, names, args) => new Function("figma", ...names, "return (async () => {" + (await (await fetch(base + "skill/" + file + v)).text()) + "\n})();")(figma, ...args);
const spec = await (await fetch(base + "spec.json" + v)).json();
const plan = await (await fetch(base + "fill.json" + v)).json();
const built = await run("build.js", ["spec"], [spec]);
const filled = await run("fill.js", ["plan", "base"], [plan, base]);
const check = await run("check.js", ["client", "allowFonts"], [spec.client, spec.fonts.allow || []]);
return { frames: built.frames.length, fontNotes: built.fontNotes, filled, check };
```

`check` lists every frame with an empty image slot, a basic font, a plain white background, a typed logo or text tile, no visual, or text running off the frame. Fix them all before the user sees the set. `spec.fonts.allow` lists default faces that are genuinely the client's brand font (for example `["Inter"]`); otherwise they are flagged.

Then screenshot each frame (`figma_capture_screenshot`) and compare with `references/examples/<format>/`. For targeted fixes:

```javascript
const frame = await figma.getNodeByIdAsync("FRAME_ID");
const h = frame.findOne((n) => n.name === "Headline");
await figma.loadFontAsync(h.fontName);
h.characters = "Shorter headline";
return { fixed: h.id };
```

**Export** every frame as PNG into `ads/exports/` (the asset server saves uploads there):

```javascript
const base = "http://localhost:9231/";
const src = await (await fetch(base + "skill/export.js?v=" + Date.now())).text();
return await new Function("figma", "client", "base", "scale", "prefix", "return (async () => {" + src + "\n})();")(figma, "Acme", base, 1, null);
```

## 4. Adding or changing ads later

Edit `spec.json` in the campaign folder and rerun the build: frames with the same name are rebuilt, new ones are added, the variables and text styles are reused. Then refill the images for the rebuilt frames.

## 5. Size check

Both sizes come from the same spec. If 1080×1350 looks empty, raise the headline size or the photo height for that frame only, by hand in Figma: the spec stays the shared starting point.

## 6. If Figma is not connected

Do not build. Save `copy.md`, `spec.json`, `prompts.md`, the assets, and `to-confirm.md`, tell the user Figma was not changed, and give the fix:

- `figma_get_status` missing: the figma-console MCP is not installed (see Setup in `SKILL.md`).
- Present but not connected: open Figma Desktop on the target file and run the Desktop Bridge plugin (Plugins, Development).

The spec is plain data, so the build can run later in either Claude Code or Codex.
