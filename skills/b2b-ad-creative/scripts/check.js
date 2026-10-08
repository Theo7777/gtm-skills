// b2b-ad-creative quality check. Runs inside Figma after build.js and fill.js, before the user sees anything.
// Inputs: `client`, optional `allowFonts` (families that are genuinely the brand's own, e.g. ["Inter"]).
// Returns { passed, issues }: every issue must be fixed (or listed for the user) before showing the ads.
const BASIC = ["Inter", "Arial", "Helvetica", "Helvetica Neue", "Roboto", "SF Pro", "Times New Roman", "Open Sans"];
const allowed = new Set(allowFonts || []);
const page = figma.root.children.find((p) => p.name === "Ads – " + client);
if (!page) throw new Error("No page Ads – " + client);
const frames = page.findAll((n) => n.type === "FRAME" && n.parent && n.parent.type === "SECTION");
const issues = [];
const isPlainWhite = (paints) => paints.length === 1 && paints[0].type === "SOLID" && paints[0].visible !== false && (paints[0].opacity == null || paints[0].opacity === 1) && paints[0].color.r > 0.985 && paints[0].color.g > 0.985 && paints[0].color.b > 0.985;

for (const f of frames) {
  const add = (what) => issues.push(f.name + ": " + what);
  if (isPlainWhite(f.fills)) add("plain white background (use an off-white, tint, or gradient)");
  // Every ad needs a visual anchor beyond type: an image, real logo vectors, or product shapes.
  const images = f.findAll((n) => "fills" in n && Array.isArray(n.fills) && n.fills.some((p) => p.type === "IMAGE"));
  const vectors = f.findAll((n) => n.name.startsWith("Logo") && n.type !== "TEXT");
  const shapes = f.findAll((n) => ["Chore", "Outcome", "Chip", "Mini card", "Tags"].includes(n.name));
  if (!images.length && !vectors.length && !shapes.length) add("no visual: text only");
  for (const slot of f.findAll((n) => n.name.startsWith("Image · "))) {
    if (!slot.fills.some((p) => p.type === "IMAGE")) add("empty image slot " + slot.name.replace("Image · ", ""));
  }
  for (const t of f.findAll((n) => n.type === "TEXT")) {
    const fonts = t.fontName === figma.mixed ? t.getStyledTextSegments(["fontName"]).map((s) => s.fontName) : [t.fontName];
    for (const fn of fonts) if (BASIC.includes(fn.family) && !allowed.has(fn.family)) { add("basic font " + fn.family + " in " + t.name); break; }
    if (t.name === "Logo") add("typed logo instead of the real logo file");
    if (t.name.startsWith("Text tile")) add("text tile standing in for a logo");
    const b = t.absoluteBoundingBox, fb = f.absoluteBoundingBox;
    if (b && fb && t.parent === f && (b.x < fb.x || b.y < fb.y || b.x + b.width > fb.x + fb.width + 1 || b.y + b.height > fb.y + fb.height + 1)) add("text runs off the frame: " + t.name);
  }
  for (const tile of f.findAll((n) => n.name.startsWith("Text tile"))) add("text tile standing in for a logo: " + tile.name);
}
return { passed: issues.length === 0, frames: frames.length, issues };
