# Figma build

Everything here runs through `figma_execute` on the figma-console MCP (`figma-console-mcp`, with the Desktop Bridge plugin running in Figma Desktop; setup is in `SKILL.md`). The official Figma MCP server does not have `figma_execute` or `figma_set_image_fill`, so these scripts need figma-console. The Plugin API rules that bite: colours are 0 to 1 not 0 to 255, every font must be loaded with `await figma.loadFontAsync` before text is set, and only what you `return` comes back to you. Pass `timeout: 30000` on every call in this file; the default is five seconds and the build takes longer.

## 1. Build script

Copy the whole script. Edit only the `spec` block. Run it once.

```javascript
// ====== EDIT ONLY THIS BLOCK ======
const spec = {
  brand: "Acme",
  size: { width: 1080, height: 1080 },       // or { width: 1080, height: 1350 }
  colours: { primary: "#1A1A1A", dark: "#0A0A0A" },
  font: "Inter",                             // brand font family; falls back to Inter per style
  background: "photo",                       // "photo" (filled in step 2) or "gradient"
  logo: "text",                              // "text" (brand name) or "image" (PNG filled in step 2)
  cta: "Start your free trial",
  variations: [
    { name: "01 Pain",   headline: "Your Sunday, gone. Again. On receipts.",      pills: ["Snap every receipt", "Sorts your expenses", "Ready for tax"] },
    { name: "02 Desire", headline: "Books done before the kettle boils.",          pills: ["Snap every receipt", "Sorts your expenses", "Ready for tax"] },
    { name: "03 Proof",  headline: "Ten minutes a month. That's the whole job.",   pills: ["Snap every receipt", "Ready for tax", "Cancel anytime"] },
  ],
};
// ====== END EDIT BLOCK ======

const W = spec.size.width, H = spec.size.height;
const MARGIN = 80, GAP = 120, PAD = 80;
const WHITE = { r: 1, g: 1, b: 1 }, BLACK = { r: 0, g: 0, b: 0 };

function hex(h) {
  const n = parseInt(h.replace("#", ""), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

// Brand font per style, Inter if that style is missing.
async function font(style) {
  const want = { family: spec.font, style };
  try { await figma.loadFontAsync(want); return want; }
  catch (e) { const fb = { family: "Inter", style }; await figma.loadFontAsync(fb); return fb; }
}
const bold = await font("Bold");
const medium = await font("Medium");

const shadow = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.4 }, offset: { x: 0, y: 2 }, radius: 8, spread: 0, visible: true, blendMode: "NORMAL" }];

// Vertical gradient, top to bottom. The transform is the part that goes wrong if derived; keep it.
function verticalGradient(topAlpha, bottomAlpha) {
  return {
    type: "GRADIENT_LINEAR",
    gradientTransform: [[0, 1, 0], [-1, 0, 1]],
    gradientStops: [
      { position: 0, color: { r: 0, g: 0, b: 0, a: topAlpha } },
      { position: 1, color: { r: 0, g: 0, b: 0, a: bottomAlpha } },
    ],
  };
}

function brandGradient() {
  const a = hex(spec.colours.primary), b = hex(spec.colours.dark);
  return {
    type: "GRADIENT_LINEAR",
    gradientTransform: [[0, 1, 0], [-1, 0, 1]],
    gradientStops: [
      { position: 0, color: { ...a, a: 1 } },
      { position: 1, color: { ...b, a: 1 } },
    ],
  };
}

function rect(name, x, y, w, h, fills) {
  const r = figma.createRectangle();
  r.name = name; r.x = x; r.y = y; r.resize(w, h); r.fills = fills;
  return r;
}

function text(name, chars, f, size, colour, opts = {}) {
  const t = figma.createText();
  t.name = name;
  t.fontName = f;
  t.characters = chars;
  t.fontSize = size;
  t.fills = [{ type: "SOLID", color: colour, opacity: opts.opacity ?? 1 }];
  if (opts.lineHeight) t.lineHeight = { unit: "PERCENT", value: opts.lineHeight };
  if (opts.width) { t.textAutoResize = "HEIGHT"; t.resize(opts.width, 10); }
  else t.textAutoResize = "WIDTH_AND_HEIGHT";
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.shadow) t.effects = shadow;
  return t;
}

function pill(label) {
  const p = figma.createFrame();
  p.name = "Pill";
  p.layoutMode = "HORIZONTAL";
  p.primaryAxisSizingMode = "AUTO";
  p.counterAxisSizingMode = "AUTO";
  p.paddingTop = 12; p.paddingBottom = 12; p.paddingLeft = 20; p.paddingRight = 20;
  p.cornerRadius = 999;
  p.fills = [{ type: "SOLID", color: WHITE, opacity: 0.9 }];
  p.appendChild(text("Label", label, medium, 22, hex(spec.colours.dark)));
  return p;
}

// Find or create the Section, placed clear of existing content.
const sectionName = `Ads – ${spec.brand}`;
let section = figma.currentPage.findOne(n => n.type === "SECTION" && n.name === sectionName);
let startX = PAD;
if (!section) {
  let maxRight = 0;
  for (const c of figma.currentPage.children) maxRight = Math.max(maxRight, c.x + c.width);
  section = figma.createSection();
  section.name = sectionName;
  section.x = maxRight + 200;
  section.y = 0;
} else {
  for (const c of section.children) startX = Math.max(startX, c.x + c.width + GAP);
}

const frameIds = [], backgroundIds = [], logoIds = [];

spec.variations.forEach((v, i) => {
  const frame = figma.createFrame();
  frame.name = v.name;
  frame.resize(W, H);
  frame.clipsContent = true;
  frame.fills = [{ type: "SOLID", color: hex(spec.colours.dark) }];
  section.appendChild(frame);
  frame.x = startX + i * (W + GAP);
  frame.y = PAD;

  // Background: solid placeholder for the photo, or the brand gradient.
  const bgFill = spec.background === "gradient" ? [brandGradient()] : [{ type: "SOLID", color: hex(spec.colours.dark) }];
  const bg = rect("Background", 0, 0, W, H, bgFill);
  frame.appendChild(bg);
  backgroundIds.push(bg.id);

  // Overlays for legibility. 44% of height each.
  const oh = Math.round(H * 0.44);
  frame.appendChild(rect("Overlay Top", 0, 0, W, oh, [verticalGradient(0.7, 0)]));
  frame.appendChild(rect("Overlay Bottom", 0, H - oh, W, oh, [verticalGradient(0, 0.75)]));

  // Headline, top left.
  const headline = text("Headline", v.headline, bold, 64, WHITE, { width: W - MARGIN * 2, lineHeight: 108, shadow: true });
  frame.appendChild(headline);
  headline.x = MARGIN; headline.y = MARGIN;

  // Lockup, bottom left. CTA, bottom right, sharing the baseline.
  let lockup;
  if (spec.logo === "image") {
    lockup = rect("Logo", MARGIN, 0, 220, 64, [{ type: "SOLID", color: WHITE, opacity: 0.15 }]);
    frame.appendChild(lockup);
    logoIds.push(lockup.id);
  } else {
    lockup = text("Brand", spec.brand, bold, 28, WHITE, { shadow: true });
    frame.appendChild(lockup);
  }
  lockup.x = MARGIN;
  lockup.y = H - MARGIN - lockup.height;

  const cta = text("CTA", spec.cta, medium, 20, WHITE, { opacity: 0.85, shadow: true });
  frame.appendChild(cta);
  cta.x = W - MARGIN - cta.width;
  cta.y = lockup.y + lockup.height - cta.height;

  // Pills, stacked above the lockup.
  const stack = figma.createFrame();
  stack.name = "Pills";
  stack.layoutMode = "VERTICAL";
  stack.primaryAxisSizingMode = "AUTO";
  stack.counterAxisSizingMode = "AUTO";
  stack.itemSpacing = 12;
  stack.fills = [];
  for (const label of v.pills.slice(0, 3)) stack.appendChild(pill(label));
  frame.appendChild(stack);
  stack.x = MARGIN;
  stack.y = lockup.y - 32 - stack.height;

  frameIds.push(frame.id);
});

// Size the Section to its contents.
let right = 0, bottom = 0;
for (const c of section.children) { right = Math.max(right, c.x + c.width); bottom = Math.max(bottom, c.y + c.height); }
section.resizeWithoutConstraints(right + PAD, bottom + PAD);

return {
  sectionId: section.id,
  sectionName,
  frameIds,
  backgroundIds,
  logoIds,
  fontUsed: bold.family,
};
```

Check `fontUsed` in the result. If you asked for a brand font and got Inter, the font is not installed on this machine. Say so in the report.

## 2. Image fill, two steps

Shrink first, so the websocket payload stays small:

```bash
sips -s format jpeg -s formatOptions 80 --resampleHeightWidthMax 1350 hero.png --out hero-fill.jpg
base64 -i hero-fill.jpg -o hero-fill.b64
```

`sips` and `base64 -i/-o` are the macOS forms. On Linux, use ImageMagick (`convert hero.png -resize 1350x1350 -quality 80 hero-fill.jpg`) and `base64 -w0 hero-fill.jpg > hero-fill.b64`.

Call `figma_set_image_fill`:

- `nodeIds`: the `backgroundIds` from step 1
- `imageData`: contents of `hero-fill.b64` (no `data:image/jpeg;base64,` prefix)
- `scaleMode`: `"FILL"`

Read the response for `imageHash`. It may also say "0 nodes" or similar; that is a known quirk and does not mean the hash failed to register. If the fills did apply, you are done. If they did not but you have a hash, bind it:

```javascript
const hash = "PASTE_IMAGE_HASH";
const ids = ["PASTE", "BACKGROUND", "IDS"];
const done = [];
for (const id of ids) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) continue;
  n.fills = [{ type: "IMAGE", imageHash: hash, scaleMode: "FILL" }];
  done.push(id);
}
return { filled: done };
```

If the response has no hash and the fills did not apply, the payload was probably too large. Shrink to 1080 max and 70 quality and try once more. Still nothing: delete the three frames, rerun the build with `background: "gradient"`, and report it.

Logo PNG: same two steps against `logoIds` with `scaleMode: "FIT"`.

## 3. Check and fix

`figma_capture_screenshot` with each frame ID. Then a targeted fix, for example:

```javascript
// Move the pills up 60px on frame 2 and shorten its headline.
const frame = await figma.getNodeByIdAsync("FRAME_ID");
const pills = frame.findOne(n => n.name === "Pills");
pills.y -= 60;
const h = frame.findOne(n => n.name === "Headline");
await figma.loadFontAsync(h.fontName);
h.characters = "Shorter headline here";
return { fixed: [pills.id, h.id] };
```

Two rounds, then stop and note what is left.

## 4. If Figma is not connected

Do not build. Write `copy.md` and `prompt.txt` (and `hero.png` if it was generated) to the output folder, tell the user Figma was not modified, and give the fix:

- `figma_get_status` tool missing entirely: the figma-console MCP is not installed. Point the user at the Setup section of `SKILL.md`.
- Tool present but not connected: open Figma Desktop on the target file and run the Desktop Bridge plugin (Plugins, then Development).

The spec block above is plain data, so the user can also rebuild later by asking the agent to run it once Figma is connected.
