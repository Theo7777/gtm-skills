// b2b-ad-creative image filler. Runs inside Figma after build.js.
// `plan` (the campaign's fill.json) says which file goes into which named slot, on every frame of the page:
//   { "client": "Acme",
//     "images":   [{ "key": "screenshot", "file": "assets/screenshot.jpg", "mode": "FILL", "frame": "PA-01", "keepRatio": true }],
//                  // frame (optional): only frames whose name starts with it
//                  // keepRatio (screenshots): resize the slot to the image's shape, top-left fixed, so nothing is cropped
//     "svgRows":  [{ "keyPrefix": "customer-logo-", "file": "assets/customer-logos.svg", "name": "Logos · customers" }],
//     "svgs":     [{ "key": "logo-light", "file": "assets/logo-white.svg" }],
//     "textTiles":[{ "key": "customer-logo", "label": "Desk Plants" }] }
// Files are fetched from the local asset server (scripts/serve_assets.py) at `base`.

const page = figma.root.children.find((p) => p.name === "Ads – " + plan.client);
if (!page) throw new Error("No page Ads – " + plan.client + ". Run build.js first.");
const frames = page.findAll((n) => n.type === "FRAME" && n.parent && n.parent.type === "SECTION");
const report = { images: 0, svgRows: 0, svgs: 0, textTiles: 0, missing: [] };

const bust = "?v=" + Date.now();   // Figma caches fetches
async function bytesOf(file) {
  const res = await fetch(base + file + bust);
  if (!res.ok) throw new Error("Could not fetch " + file + " (" + res.status + ")");
  return new Uint8Array(await res.arrayBuffer());
}
async function textOf(file) {
  const res = await fetch(base + file + bust);
  if (!res.ok) throw new Error("Could not fetch " + file + " (" + res.status + ")");
  return res.text();
}
function slots(frame, key) { return frame.findAll((n) => n.name === "Image · " + key); }

// Images: one upload, applied to every slot with that key.
for (const item of plan.images || []) {
  const image = figma.createImage(await bytesOf(item.file));
  const size = item.keepRatio ? await image.getSizeAsync() : null;
  let count = 0;
  for (const f of frames.filter((fr) => !item.frame || fr.name.startsWith(item.frame))) for (const s of slots(f, item.key)) {
    if (size) s.resize(s.width, Math.round(s.width * size.height / size.width));
    s.fills = [{ type: "IMAGE", imageHash: image.hash, scaleMode: item.mode || "FILL" }];
    count++;
  }
  if (!count) report.missing.push(item.key);
  report.images += count;
}

// Placing an SVG as editable vectors, scaled to fit a box and centred in it.
// Placing an SVG as editable vectors, scaled to fit a box: centred, or top-left for logo rows.
function place(svg, parent, box, name, alignTop) {
  const v = figma.createNodeFromSvg(svg);
  v.name = name;
  v.rescale(Math.min(box.w / v.width, box.h / v.height));
  parent.appendChild(v);
  v.x = alignTop ? box.x : box.x + (box.w - v.width) / 2;
  v.y = alignTop ? box.y : box.y + (box.h - v.height) / 2;
  return v;
}

// A row of logos supplied as one SVG replaces all slots that start with keyPrefix.
for (const row of plan.svgRows || []) {
  const svg = await textOf(row.file);
  for (const f of frames) {
    const cells = f.findAll((n) => n.name.startsWith("Image · " + row.keyPrefix));
    if (!cells.length) continue;
    const x0 = Math.min(...cells.map((c) => c.x)), y0 = Math.min(...cells.map((c) => c.y));
    const x1 = Math.max(...cells.map((c) => c.x + c.width)), y1 = Math.max(...cells.map((c) => c.y + c.height));
    place(svg, cells[0].parent, { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, row.name || "Logos", true);
    cells.forEach((c) => c.remove());
    report.svgRows++;
  }
}

// Single SVGs (a logo) replace each slot with that key.
for (const item of plan.svgs || []) {
  const svg = await textOf(item.file);
  for (const f of frames) for (const s of slots(f, item.key)) {
    place(svg, s.parent, { x: s.x, y: s.y, w: s.width, h: s.height }, "Logo · " + item.key);
    s.remove();
    report.svgs++;
  }
}

// A text tile stands in where no logo file exists, so the gap is visible and editable.
for (const item of plan.textTiles || []) {
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  for (const f of frames) for (const s of slots(f, item.key)) {
    const tile = figma.createFrame();
    tile.name = "Text tile · " + item.label + " (replace with logo)";
    tile.resize(s.width, s.height);
    tile.cornerRadius = s.cornerRadius;
    tile.fills = s.fills;
    tile.layoutMode = "HORIZONTAL";
    tile.primaryAxisSizingMode = "FIXED"; tile.counterAxisSizingMode = "FIXED";
    tile.primaryAxisAlignItems = "CENTER"; tile.counterAxisAlignItems = "CENTER";
    const t = figma.createText();
    t.fontName = { family: "Inter", style: "Bold" };
    t.characters = item.label;
    t.fontSize = Math.round(s.height * 0.24);
    t.fills = [{ type: "SOLID", color: { r: 0.09, g: 0.12, b: 0.2 } }];
    tile.appendChild(t);
    s.parent.insertChild(s.parent.children.indexOf(s), tile);
    tile.x = s.x; tile.y = s.y;
    s.remove();
    report.textTiles++;
  }
}
return report;
