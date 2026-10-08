// b2b-ad-creative exporter. Runs inside Figma: exports every ad frame on the client's page as PNG
// and posts it to the local asset server, which saves it in <ads folder>/exports/.
// Inputs: `client`, `base` (the server), optional `scale` (1 = actual size), optional `prefix` (frame name filter).
const page = figma.root.children.find((p) => p.name === "Ads – " + client);
if (!page) throw new Error("No page Ads – " + client);
const frames = page.findAll((n) => n.type === "FRAME" && n.parent && n.parent.type === "SECTION" && (!prefix || n.name.startsWith(prefix)));
const saved = [];
for (const f of frames) {
  const bytes = await f.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: scale || 1 } });
  const file = f.name.replace(/ · /g, "_").replace(/[^A-Za-z0-9_.-]+/g, "-") + ".png";
  const res = await fetch(base + "upload/" + file, { method: "POST", body: bytes });
  saved.push(file + (res.ok ? "" : " (failed " + res.status + ")"));
}
return { saved };
