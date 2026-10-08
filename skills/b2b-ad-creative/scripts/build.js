// b2b-ad-creative builder. Runs inside Figma through the figma-console Desktop Bridge.
// `spec` is passed in (the campaign's spec.json); see references/figma-build.md for its shape.
// Builds every frame in the spec on the page "Ads – <client>", replacing frames with the same name.
// Returns { page, frames, imageSlots, fontNotes }.
const FORMAT_NAMES = { BA: "Before and after", PA: "Product in action", TE: "Testimonial", VL: "Value prop with logos", IB: "ICP background", IP: "Headline and ICP photo" };
const M = 72, GAP = 120;
const slots = [], fontNotes = [], built = [];

function rgb(h) {
  const n = parseInt(h.replace("#", ""), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}
const SHADOW_SOFT = [{ type: "DROP_SHADOW", color: { r: 0.06, g: 0.09, b: 0.16, a: 0.12 }, offset: { x: 0, y: 4 }, radius: 12, spread: 0, visible: true, blendMode: "NORMAL" }];
const SHADOW = [{ type: "DROP_SHADOW", color: { r: 0.06, g: 0.09, b: 0.16, a: 0.18 }, offset: { x: 0, y: 16 }, radius: 40, spread: 0, visible: true, blendMode: "NORMAL" }];

// ---------- page ----------
await figma.loadAllPagesAsync();
const pageName = "Ads – " + spec.client;
let page = figma.root.children.find((p) => p.name === pageName);
if (!page) { page = figma.createPage(); page.name = pageName; }
// Never switch pages: setCurrentPageAsync can hang in the Desktop Bridge. Build onto the page node directly.
await figma.loadFontAsync({ family: "Inter", style: "Regular" });   // new text nodes start in Inter Regular

// ---------- brand variables ----------
const collectionName = "Brand – " + spec.client;
let collection = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === collectionName);
if (!collection) collection = figma.variables.createVariableCollection(collectionName);
const modeId = collection.modes[0].modeId;
const existingVars = (await figma.variables.getLocalVariablesAsync("COLOR")).filter((v) => v.variableCollectionId === collection.id);
const V = {};
for (const [key, value] of Object.entries(spec.colours)) {
  let v = existingVars.find((x) => x.name === key);
  if (!v) v = figma.variables.createVariable(key, collection, "COLOR");
  v.setValueForMode(modeId, Object.assign(rgb(value), { a: 1 }));
  V[key] = v;
}
function paint(key, opacity) {
  const base = { type: "SOLID", color: rgb(spec.colours[key]), opacity: opacity == null ? 1 : opacity };
  return figma.variables.setBoundVariableForPaint(base, "color", V[key]);
}
// Figma ignores the opacity of a variable-bound paint when it is first assigned to a node.
// Reassigning a copy of the node's own paints keeps it, so see-through tints survive.
function setPaints(node, prop, paints) {
  node[prop] = paints;
  if (!paints.some((p) => p.opacity != null && p.opacity < 1)) return;
  const copy = JSON.parse(JSON.stringify(node[prop]));
  copy.forEach((c, i) => { if (paints[i] && paints[i].opacity != null) c.opacity = paints[i].opacity; });
  node[prop] = copy;
}
function gradient(stops, transform) {
  return { type: "GRADIENT_LINEAR", gradientTransform: transform, gradientStops: stops.map(([position, key, a]) => ({ position, color: Object.assign(rgb(spec.colours[key]), { a }) })) };
}
const VERTICAL = [[0, 1, 0], [-1, 0, 1]], HORIZONTAL = [[1, 0, 0], [0, 1, 0]];

// ---------- fonts and text styles ----------
const WEIGHTS = { regular: ["Regular"], medium: ["Medium", "Regular"], semibold: ["SemiBold", "Semi Bold", "Medium"], bold: ["Bold"], heavy: ["ExtraBold", "Extra Bold", "Black", "Bold"] };
const ROLES = {
  "Display": ["display", "heavy", 104, -1.5, "ORIGINAL"],
  "Display Caps": ["display", "heavy", 102, -0.5, "UPPER"],
  "Headline": ["display", "bold", 110, -1, "ORIGINAL"],
  "Body": ["body", "regular", 140, 0, "ORIGINAL"],
  "Label": ["body", "semibold", 120, 0, "ORIGINAL"],
  "Quote mark": ["display", "bold", 100, 0, "ORIGINAL"],
};
// Only ever load a style that is installed: loadFontAsync on a missing style of an
// installed family (for example "Inter SemiBold"; Inter calls it "Semi Bold") hangs instead of failing.
const installed = new Set((await figma.listAvailableFontsAsync()).map((f) => f.fontName.family + "|" + f.fontName.style));
const DESIGNED_FALLBACKS = ["Plus Jakarta Sans", "Figtree", "Manrope", "DM Sans", "Outfit", "Satoshi"];
const BASIC_FACES = ["Inter", "Arial", "Helvetica", "Helvetica Neue", "Roboto", "SF Pro", "SF Pro Text", "SF Pro Display", "Times New Roman", "Open Sans"];
const fontCache = {};
async function font(familyKey, weight) {
  const cacheKey = familyKey + weight;
  if (fontCache[cacheKey]) return fontCache[cacheKey];
  // Brand font first, then the spec's chosen match, then designed typefaces. Never a default face
  // (Inter, Arial, Helvetica, Roboto, system) unless it is genuinely the brand's own font.
  const brand = spec.fonts[familyKey];
  const candidates = [brand, ...(spec.fonts.fallbacks || []), ...DESIGNED_FALLBACKS];
  for (const family of candidates) {
    const style = WEIGHTS[weight].find((st) => installed.has(family + "|" + st));
    if (!style) continue;
    if (family !== brand && BASIC_FACES.includes(family)) continue;
    await figma.loadFontAsync({ family, style });
    if (family !== brand) fontNotes.push(brand + " " + weight + " not installed, used " + family + " " + style);
    return (fontCache[cacheKey] = { family, style });
  }
  throw new Error("No designed font installed for " + familyKey + " " + weight + ". Install the brand font or one of: " + DESIGNED_FALLBACKS.join(", "));
}
const allStyles = await figma.getLocalTextStylesAsync();
const styleCache = {};
async function styleFor(role, size) {
  const name = spec.client + "/" + role + " " + size;
  if (styleCache[name]) return styleCache[name];
  let s = allStyles.find((x) => x.name === name);
  if (!s) { s = figma.createTextStyle(); s.name = name; allStyles.push(s); }
  const [familyKey, weight, lineHeight, tracking, textCase] = ROLES[role];
  s.fontName = await font(familyKey, weight);
  s.fontSize = size;
  s.lineHeight = { unit: "PERCENT", value: lineHeight };
  s.letterSpacing = { unit: "PERCENT", value: tracking };
  s.textCase = textCase;
  return (styleCache[name] = s);
}

// ---------- building blocks ----------
async function text(parent, o) {
  const s = await styleFor(o.role, o.size);
  const t = figma.createText();
  t.name = o.name;
  await t.setTextStyleIdAsync(s.id);
  t.characters = o.chars;
  setPaints(t, "fills", [paint(o.colour, o.opacity)]);
  t.textAlignHorizontal = o.align || "LEFT";
  if (o.width) { t.textAutoResize = "HEIGHT"; t.resize(o.width, t.height); } else { t.textAutoResize = "WIDTH_AND_HEIGHT"; }
  if (o.emphasis) {
    const i = o.chars.indexOf(o.emphasis);
    if (i >= 0) {
      t.setRangeFills(i, i + o.emphasis.length, [paint(o.emphasisColour || "accent")]);
      if (o.emphasisBold) t.setRangeFontName(i, i + o.emphasis.length, await font(ROLES[o.role][0], "heavy"));
    }
  }
  parent.appendChild(t);
  if (o.x != null) t.x = o.x;
  if (o.y != null) t.y = o.y;
  return t;
}
function centre(node, width) { node.x = Math.round((width - node.width) / 2); return node; }

function box(parent, o) {
  const f = figma.createFrame();
  f.name = o.name;
  f.resize(o.w, o.h);
  f.cornerRadius = o.radius || 0;
  setPaints(f, "fills", o.fills || []);
  f.clipsContent = o.clip !== false;
  if (o.effects) f.effects = o.effects;
  parent.appendChild(f);
  f.x = o.x; f.y = o.y;
  return f;
}

function stack(parent, o) {
  const f = figma.createFrame();
  f.name = o.name;
  setPaints(f, "fills", o.fills || []);
  f.layoutMode = o.direction || "HORIZONTAL";
  f.itemSpacing = o.gap == null ? 12 : o.gap;
  f.paddingLeft = f.paddingRight = o.padX || 0;
  f.paddingTop = f.paddingBottom = o.padY || 0;
  f.cornerRadius = o.radius || 0;
  if (o.effects) f.effects = o.effects;
  parent.appendChild(f);
  if (o.width) {
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "AUTO";
    if (o.wrap) { f.layoutWrap = "WRAP"; f.counterAxisSpacing = o.gap == null ? 12 : o.gap; }
    f.resize(o.width, f.height || 10);
  } else {
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "AUTO";
  }
  f.counterAxisAlignItems = f.layoutMode === "VERTICAL" ? "MIN" : "CENTER";   // lists line up on the left
  f.x = o.x || 0; f.y = o.y || 0;
  return f;
}

async function pill(parent, o) {
  const f = stack(parent, { name: o.name, fills: [paint(o.fill, o.fillOpacity)], padX: o.padX || 26, padY: o.padY || 14, radius: o.radius == null ? 999 : o.radius, x: o.x, y: o.y, effects: o.effects });
  if (o.icon) box(f, { name: "Icon", w: o.size + 8, h: o.size + 8, radius: 8, fills: [paint(o.icon)], x: 0, y: 0 });
  if (o.mark) await text(f, { name: "Mark", chars: o.mark, role: "Label", size: o.size || 24, colour: o.markColour || o.colour });
  await text(f, { name: "Label", chars: o.label, role: o.role || "Label", size: o.size || 24, colour: o.colour });
  return f;
}

let currentFrame = null;
function imageSlot(parent, o) {
  const r = figma.createRectangle();
  r.name = "Image · " + o.key;
  r.resize(o.w, o.h);
  r.cornerRadius = o.radius || 0;
  setPaints(r, "fills", [paint(o.fill || "muted", o.opacity == null ? 0.25 : o.opacity)]);
  if (o.effects) r.effects = o.effects;
  parent.appendChild(r);
  r.x = o.x; r.y = o.y;
  slots.push({ id: r.id, key: o.key, frame: currentFrame.name, scaleMode: o.fit || "FILL" });
  return r;
}

async function logo(parent, o) {
  const tone = o.tone || "dark";
  if (spec.logo.mode === "image") {
    const w = Math.round(o.h * (spec.logo.ratio || 3));
    const r = imageSlot(parent, { key: "logo-" + tone, x: o.x, y: o.y, w, h: o.h, opacity: 0, fit: "FIT" });
    if (o.align === "centre") centre(r, o.frameW);
    if (o.align === "right") r.x = o.frameW - M - w;
    return r;
  }
  const t = await text(parent, { name: "Logo", chars: spec.logo.text, role: "Headline", size: Math.round(o.h * 0.8), colour: tone === "light" ? "white" : "ink", x: o.x, y: o.y });
  if (o.align === "centre") centre(t, o.frameW);
  if (o.align === "right") t.x = o.frameW - M - t.width;
  return t;
}

function tall(H) { return H > 1150; }

// ---------- formats ----------
async function beforeAfter(f, d, W, H) {
  setPaints(f, "fills", [paint("light")]);
  const top = tall(H) ? 96 : 72;
  await text(f, { name: "Headline", chars: d.headline, role: "Headline", size: tall(H) ? 72 : 64, colour: "ink", x: M, y: top, width: W - 2 * M, align: "CENTER", emphasis: d.emphasis, emphasisColour: "brand" });
  const panelTop = tall(H) ? 300 : 250, panelH = H - panelTop - (tall(H) ? 150 : 130), panelW = (W - 2 * M - 24) / 2;
  const before = box(f, { name: "Before", x: M, y: panelTop, w: panelW, h: panelH, radius: 28, fills: [paint("muted", 0.14)] });
  const after = box(f, { name: "After", x: M + panelW + 24, y: panelTop, w: panelW, h: panelH, radius: 28, fills: [paint("brand")] });
  centre(await text(before, { name: "Label", chars: d.beforeLabel || "Before", role: "Headline", size: 36, colour: "muted", y: 34 }), panelW);
  centre(await text(after, { name: "Label", chars: d.afterLabel || "After", role: "Headline", size: 36, colour: "onBrand", y: 34 }), panelW);
  if (d.variant === "list") {
    // The before side looks like a mess: chores as cards, slightly tilted and offset, each crossed out,
    // spread down the whole panel.
    const step = (panelH - 150) / Math.max(d.before.length, 1);
    for (let i = 0; i < d.before.length; i++) {
      const card = await pill(before, { name: "Chore", label: d.before[i], mark: "✕", markColour: "muted", fill: "white", colour: "muted", size: 24, radius: 14, padX: 20, padY: 16, x: 24 + (i % 2 ? 40 : 0), y: 112 + Math.round(i * step), effects: SHADOW_SOFT });
      card.rotation = i % 2 ? -3 : 2.5;
    }
    // The after side is calm: one outcome, then the product doing it.
    const outcome = await pill(after, { name: "Outcome", label: (d.after && d.after[0]) || "Done", mark: "✓", markColour: "brand", fill: "white", colour: "ink", size: 24, radius: 14, padX: 20, padY: 14, x: 24, y: 104, effects: SHADOW_SOFT });
    // Wider than the panel so it bleeds off the right edge; fill.json keepRatio sets its height from the image.
    imageSlot(after, { key: "after", x: 24, y: outcome.y + outcome.height + 24, w: Math.round(panelW * 1.35), h: panelH, radius: 16, fill: "white", opacity: 0.25, effects: SHADOW });
  } else {
    const fit = d.variant === "metaphor" ? "FIT" : "FILL";
    imageSlot(before, { key: "before", x: 28, y: 110, w: panelW - 56, h: panelH - 140, radius: 20, fit });
    imageSlot(after, { key: "after", x: 28, y: 110, w: panelW - 56, h: panelH - 140, radius: 20, fill: "white", opacity: 0.3, fit });
  }
  await logo(f, { x: 0, y: H - (tall(H) ? 64 : 56) - 40, h: 40, tone: "dark", align: "centre", frameW: W });
}

async function productInAction(f, d, W, H) {
  if (d.variant === "dark-quote") {
    f.fills = [paint("dark")];
    const h = await text(f, { name: "Headline", chars: d.headline, role: "Headline", size: tall(H) ? 72 : 64, colour: "white", x: M, y: tall(H) ? 120 : 96, width: W - 2 * M, align: "CENTER" });
    if (d.attribution) centre(await text(f, { name: "Attribution", chars: d.attribution, role: "Body", size: 28, colour: "white", opacity: 0.8, y: h.y + h.height + 16 }), W);
    imageSlot(f, { key: "screenshot", x: 120, y: tall(H) ? 520 : 400, w: W - 240, h: tall(H) ? 560 : 480, radius: 24, fill: "white", opacity: 0.12, effects: SHADOW });
    if (d.rating) await pill(f, { name: "Rating", label: d.rating, fill: "white", colour: "ink", size: 22, x: M, y: H - 72 - 56 });
    await logo(f, { x: 0, y: H - 72 - 44, h: 44, tone: "light", align: "right", frameW: W });
    return;
  }
  f.fills = [gradient([[0, "light", 1], [1, "white", 1]], VERTICAL)];
  await logo(f, { x: M, y: tall(H) ? 72 : 64, h: tall(H) ? 52 : 48, tone: "dark" });
  const h = await text(f, { name: "Headline", chars: d.headline, role: "Headline", size: tall(H) ? 84 : 72, colour: "ink", x: M, y: tall(H) ? 190 : 170, width: W - 2 * M - 40, emphasis: d.emphasis, emphasisColour: "brand" });
  let y = h.y + h.height + 32;
  if (d.cta) { const c = await pill(f, { name: "CTA", label: d.cta, fill: "brand", colour: "onBrand", size: 26, x: M, y }); y = c.y + c.height + 32; }
  if (d.variant === "centred") {
    imageSlot(f, { key: "screenshot", x: M, y: Math.max(y, H * 0.45), w: W - 2 * M, h: H - Math.max(y, H * 0.45) - M, radius: 24, fill: "white", opacity: 1, effects: SHADOW });
  } else {
    const top = Math.max(y + 16, tall(H) ? 640 : 520);
    imageSlot(f, { key: "screenshot", x: 180, y: top, w: W - 180 + 60, h: H - top + 60, radius: 24, fill: "white", opacity: 1, effects: SHADOW });
  }
}

async function testimonial(f, d, W, H) {
  const dark = d.variant !== "light";
  f.fills = [paint(dark ? "dark" : "light")];
  const ink = dark ? "white" : "ink";
  if (d.variant === "photo") {
    imageSlot(f, { key: "customer-photo", x: 0, y: 0, w: W, h: Math.round(H * 0.55) });
    const band = box(f, { name: "Quote band", x: 0, y: Math.round(H * 0.55), w: W, h: H - Math.round(H * 0.55), fills: [paint("accent")] });
    await text(band, { name: "Quote", chars: "“" + d.quote + "”", role: "Headline", size: 44, colour: "onAccent", x: M, y: 56, width: W - 2 * M, align: "CENTER" });
    centre(await text(band, { name: "Attribution", chars: "– " + d.name + ", " + d.role, role: "Label", size: 26, colour: "onAccent", y: band.height - 100 }), W);
    return;
  }
  await logo(f, { x: 0, y: tall(H) ? 72 : 64, h: tall(H) ? 48 : 44, tone: dark ? "light" : "dark", align: "centre", frameW: W });
  const hi = dark ? "accent" : "brand";
  const baseY = H - (tall(H) ? 120 : 96) - 110;
  const q = await text(f, { name: "Quote", chars: d.quote, role: "Headline", size: tall(H) ? 72 : 64, colour: ink, x: M + 20, y: 0, width: W - 2 * M - 40, emphasis: d.emphasis, emphasisColour: hi, emphasisBold: true });
  q.y = Math.round((150 + baseY) / 2 - q.height / 2);   // centred between the logo and the attribution
  const open = await text(f, { name: "Quote mark open", chars: "“", role: "Quote mark", size: 260, colour: hi, opacity: 0.35, x: M - 12, y: q.y - 150 });
  const close = await text(f, { name: "Quote mark close", chars: "”", role: "Quote mark", size: 260, colour: hi, opacity: 0.35, x: W - M - 120, y: q.y + q.height - 60 });
  f.insertChild(1, open); f.insertChild(1, close);   // behind the quote
  const media = d.variant === "headshot"
    ? imageSlot(f, { key: "headshot", x: M + 20, y: baseY, w: 110, h: 110, radius: 55 })
    : imageSlot(f, { key: "customer-logo", x: M + 20, y: baseY, w: 180, h: 110, radius: 12, fill: "white", opacity: d.logoTile ? 1 : 0, fit: "FIT" });   // logoTile: a white tile, only when no light version of the logo exists
  const nx = media.x + media.width + 32;
  const n = await text(f, { name: "Name", chars: d.name, role: "Label", size: 32, colour: hi, x: nx, y: baseY + 12 });
  await text(f, { name: "Role", chars: d.role, role: "Body", size: 24, colour: ink, opacity: 0.85, x: nx, y: n.y + n.height + 8, width: W - nx - M });
}

async function valuePropLogos(f, d, W, H) {
  const dark = d.variant === "dark";
  // Never a plain white background: a light brand tint fading to off-white.
  if (dark) setPaints(f, "fills", [paint("dark")]);
  else f.fills = [gradient([[0, "white", 1], [1, "light", 1]], VERTICAL)];
  const ink = dark ? "white" : "ink";
  await logo(f, { x: 0, y: tall(H) ? 72 : 64, h: 48, tone: dark ? "light" : "dark", align: "right", frameW: W });
  const h = await text(f, { name: "Headline", chars: d.headline, role: "Display", size: tall(H) ? 92 : 84, colour: ink, x: M + 8, y: tall(H) ? 190 : 150, width: W - 2 * M - 60, emphasis: d.emphasis, emphasisColour: dark ? "accent" : "brand" });
  let y = h.y + h.height + 24;
  if (d.subline) { const s = await text(f, { name: "Subline", chars: d.subline, role: "Body", size: 32, colour: dark ? "white" : "muted", x: M + 8, y, width: W - 2 * M - 60 }); y = s.y + s.height + 32; }
  if (d.cta) await pill(f, { name: "CTA", label: d.cta, fill: dark ? "accent" : "brand", colour: dark ? "onAccent" : "onBrand", size: 26, x: M + 8, y });
  const count = Math.min(Math.max(d.logos || 8, 4), 8);
  if (d.variant === "integrations") {
    const row = stack(f, { name: "Integrations", gap: 28, x: M, y: H - (tall(H) ? 120 : 96) - 130 });
    for (let i = 1; i <= Math.min(count, 5); i++) {
      const tile = box(row, { name: "Tile", w: 130, h: 130, radius: 32, fills: [paint("white")], effects: SHADOW, clip: true, x: 0, y: 0 });
      imageSlot(tile, { key: "integration-" + i, x: 25, y: 25, w: 80, h: 80, opacity: 0, fit: "FIT" });
    }
    centre(row, W);
    return;
  }
  // logoStrip: the site gives its logos as one strip, so reserve a single row the width of the ad.
  const cols = d.logoStrip ? count : 4, rows = d.logoStrip ? 1 : Math.ceil(count / cols), cellW = (W - 2 * M - (cols - 1) * 24) / cols, cellH = 80;
  const gridTop = H - (tall(H) ? 120 : 96) - rows * cellH - (rows - 1) * 40;
  // The site's own words above its logos ("Trusted by:", "Used by teams at"), verbatim.
  if (d.logosLabel) await text(f, { name: "Logos label", chars: d.logosLabel, role: "Body", size: 26, colour: dark ? "white" : "muted", opacity: 0.85, x: M, y: gridTop - 52 });
  for (let i = 0; i < count; i++) {
    imageSlot(f, { key: "customer-logo-" + (i + 1), x: M + (i % cols) * (cellW + 24), y: gridTop + Math.floor(i / cols) * (cellH + 40), w: cellW, h: cellH, opacity: 0, fit: "FIT" });
  }
}

async function icpBackground(f, d, W, H) {
  setPaints(f, "fills", [paint("dark")]);   // under the photo, so a missing image is never plain white
  imageSlot(f, { key: "background-photo", x: 0, y: 0, w: W, h: H });
  const overlay = figma.createRectangle();
  overlay.name = "Overlay";
  overlay.resize(W, H);
  overlay.fills = [gradient([[0, "dark", 0.94], [0.55, "dark", 0.6], [1, "dark", 0.12]], HORIZONTAL)];
  f.appendChild(overlay);
  await logo(f, { x: M, y: tall(H) ? 72 : 64, h: tall(H) ? 40 : 36, tone: "light" });
  const h = await text(f, { name: "Headline", chars: d.headline, role: "Display Caps", size: tall(H) ? 88 : 78, colour: "white", x: M, y: tall(H) ? 300 : 220, width: 640 });
  let y = h.y + h.height + 8;
  if (d.headline2) { const h2 = await text(f, { name: "Headline accent", chars: d.headline2, role: "Display Caps", size: tall(H) ? 88 : 78, colour: "accent", x: M, y, width: 640 }); y = h2.y + h2.height + 8; }
  box(f, { name: "Divider", x: M, y: y + 24, w: 64, h: 6, radius: 3, fills: [paint("accent")] });
  y += 60;
  if (d.subline) { const s = await text(f, { name: "Subline", chars: d.subline, role: "Body", size: 30, colour: "accent", x: M, y, width: 600 }); y = s.y + s.height + 32; }
  if (d.tags && d.tags.length) {
    const row = stack(f, { name: "Tags", gap: 12, x: M, y, width: 620, wrap: true });
    for (const tag of d.tags) await pill(row, { name: "Tag", label: tag, fill: "white", colour: "ink", size: 22, padX: 22, padY: 12 });
  }
  const cta = await pill(f, { name: "CTA", label: d.cta || "Learn more", fill: "accent", colour: "onAccent", size: 26, x: M, y: 0 });
  cta.y = H - (tall(H) ? 88 : 72) - cta.height;
  if (d.stat) { const s = await pill(f, { name: "Stat", label: d.stat, fill: "accent", colour: "onAccent", size: 34, padX: 30, padY: 16, x: 0, y: 0 }); s.x = W - M - s.width; s.y = cta.y - 40; }
}

async function headlineIcpPhoto(f, d, W, H) {
  const light = d.variant === "light";
  f.fills = [paint(light ? "light" : "dark")];
  await logo(f, { x: 0, y: tall(H) ? 64 : 56, h: tall(H) ? 48 : 44, tone: light ? "dark" : "light", align: "centre", frameW: W });
  await text(f, { name: "Headline", chars: d.headline, role: "Headline", size: tall(H) ? 76 : 66, colour: light ? "ink" : "white", x: M, y: tall(H) ? 180 : 150, width: W - 2 * M, align: "CENTER", emphasis: d.emphasis, emphasisColour: light ? "brand" : "accent" });
  const px = Math.round(W * 0.34), py = Math.round(H * (tall(H) ? 0.52 : 0.5));
  imageSlot(f, { key: "lifestyle-photo", x: px, y: py, w: W - px + 40, h: H - py + 40, radius: 24 });
  let y = py + 70;
  for (const label of d.chips || []) {
    const chip = await pill(f, { name: "Chip", label, fill: "white", colour: "ink", size: 24, radius: 14, padX: 18, padY: 14, icon: "brand", x: px - 120, y, effects: SHADOW });
    y = chip.y + chip.height + 20;
  }
  const card = box(f, { name: "Mini card", x: px - 150, y, w: 300, h: 150, radius: 18, fills: [paint("white")], effects: SHADOW });
  if (d.card === "progress") {
    box(card, { name: "Track", x: 24, y: 96, w: 252, h: 18, radius: 9, fills: [paint("muted", 0.2)] });
    box(card, { name: "Progress", x: 24, y: 96, w: 160, h: 18, radius: 9, fills: [paint("brand")] });
    box(card, { name: "Avatar", x: 24, y: 28, w: 44, h: 44, radius: 22, fills: [paint("muted", 0.35)] });
  } else {
    for (let i = 0; i < 3; i++) {
      box(card, { name: "Dot", x: 24, y: 30 + i * 36, w: 18, h: 18, radius: 9, fills: [paint(i === 0 ? "accent" : "muted", i === 0 ? 1 : 0.35)] });
      box(card, { name: "Row", x: 56, y: 32 + i * 36, w: 180 - i * 30, h: 14, radius: 7, fills: [paint("muted", 0.25)] });
    }
  }
}

const BUILDERS = { BA: beforeAfter, PA: productInAction, TE: testimonial, VL: valuePropLogos, IB: icpBackground, IP: headlineIcpPhoto };

// ---------- sections and frames ----------
let sectionY = Math.max(0, ...page.children.filter((n) => n.type === "SECTION" && !n.name.startsWith(spec.client + " · ")).map((n) => n.y + n.height + 200));
for (const code of Object.keys(FORMAT_NAMES)) {
  const frames = spec.frames.filter((fr) => fr.code === code);
  if (!frames.length) continue;
  const sectionName = code + " · " + FORMAT_NAMES[code];
  let section = page.children.find((n) => n.type === "SECTION" && n.name === sectionName);
  if (!section) { section = figma.createSection(); page.appendChild(section); section.name = sectionName; section.x = 0; section.y = sectionY; }
  let x = 120, tallest = 0;
  for (const d of frames) {
    for (const [W, H] of spec.sizes) {
      const name = code + "-" + String(d.n).padStart(2, "0") + " · " + d.slug + " · " + W + "x" + H;
      const old = section.children.find((n) => n.name === name);
      if (old) old.remove();
      const f = figma.createFrame();
      f.name = name;
      f.resize(W, H);
      f.clipsContent = true;
      section.appendChild(f);
      f.x = x; f.y = 160;
      currentFrame = f;
      await BUILDERS[code](f, d, W, H);
      built.push({ id: f.id, name });
      x += W + GAP;
      tallest = Math.max(tallest, H);
    }
  }
  section.resizeWithoutConstraints(Math.max(section.width, x), Math.max(section.height, tallest + 280));
  sectionY = section.y + section.height + 200;
}

return { page: page.name, frames: built, imageSlots: slots, fontNotes: [...new Set(fontNotes)] };
