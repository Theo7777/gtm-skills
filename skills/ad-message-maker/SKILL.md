---
name: ad-message-maker
description: Turn a business into three static ad variations built as editable frames in Figma. Same hero photo and layout, three different messages (pain, desire, proof), so you test the message and not the design. Reads the shared GTM context or whatever the project folder already has, and asks five questions only when there is none. Works in Claude Code and Codex with the figma-console MCP; without Figma it still writes the copy and image prompt. Use when the user wants static ads for a product or service, or wants to test messages. Trigger phrases include "ad in Figma", "3 ad variations", "hero ad", "figma ad", "ad creative in figma", "test three messages", and "ad message maker".
allowed-tools: Read, Write, Bash, Glob, Grep, mcp__figma-console__figma_get_status, mcp__figma-console__figma_execute, mcp__figma-console__figma_set_image_fill, mcp__figma-console__figma_capture_screenshot
metadata:
  version: 2.0.0
  source: mine
  author: Theo Ohene
---

# Ad message maker

One hero photo. One layout. Three messages. You get three editable ad frames in Figma, named `01 Pain`, `02 Desire`, `03 Proof`, plus the paired platform copy for each. The user makes one decision: "go" on the copy table.

Tools are named bare here (`figma_execute`). Find them in your host's MCP tool list under the `figma-console` server.

## What you get

- A Section in the open Figma file named `Ads – <brand>` containing three frames at the chosen size (1080x1080 by default, 1080x1350 on request).
- Each frame: hero photo, dark gradients top and bottom, headline, two or three value pills, brand lockup, CTA line. All layers editable.
- `./ads/YYYY-MM-DD-<slug>/` with `hero.png`, `prompt.txt`, and `copy.md`.

## Setup

Two optional pieces: Figma (to build the frames) and an image generator (for the hero photo). The skill runs without either; it just delivers less.

### Figma: the figma-console MCP and its Desktop Bridge plugin

The build relies on the community **Figma Console MCP** (`figma-console-mcp`, by Southleft), not the official Figma MCP server. It uses four of its tools: `figma_get_status`, `figma_execute` (runs Plugin API JavaScript inside Figma), `figma_set_image_fill`, and `figma_capture_screenshot`. The official Figma MCP does not expose these tools, so the build script in `references/figma-build.md` will not run on it as written.

You need:

- **Figma Desktop.** The browser version cannot run the bridge plugin.
- **Node.js 18 or later**, so `npx` can start the server.
- **A Figma personal access token.** In Figma, open Settings, then Security, then Personal access tokens. It starts with `figd_`. Give it read access to file content, file versions, and variables, and read and write access to comments.

Install the MCP server:

- **Claude Code**
  ```bash
  claude mcp add figma-console -s user -e FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN -- npx -y figma-console-mcp@latest
  ```
- **Codex**, in `~/.codex/config.toml`:
  ```toml
  [mcp_servers.figma-console]
  command = "npx"
  args = ["-y", "figma-console-mcp@latest"]
  env = { FIGMA_ACCESS_TOKEN = "figd_YOUR_TOKEN" }
  ```
- **Cursor or another MCP host**: the same `npx -y figma-console-mcp@latest` command with `FIGMA_ACCESS_TOKEN` in its env block.

Install and run the Desktop Bridge plugin once per machine:

1. Start your host once after adding the server, so the package downloads.
2. In Figma Desktop, go to Plugins, then Development, then Import plugin from manifest, and pick `~/.figma-console-mcp/plugin/manifest.json`.
3. Open the Figma file you want the ads in and run the Desktop Bridge plugin. It connects to the MCP server over a local WebSocket. Leave it running while the skill builds.

Check the connection by asking your agent to call `figma_get_status`. It should report a connected file. If the plugin path or menu names have moved, follow the current instructions at https://github.com/southleft/figma-console-mcp.

**File and frame structure.** Any Figma design file works; a blank page is easiest. The skill builds on the current page and needs nothing set up in advance. It finds or creates one Section named `Ads – <brand>`, places it to the right of anything already on the page, and puts every frame inside it. Running again adds three more frames to the right of the existing ones. It never moves or deletes anything it did not create. Brand fonts must be installed on the machine running Figma, or the text falls back to Inter.

**If Figma is not connected.** The skill does not stop. It still gathers context, writes the copy table, and generates the hero photo, then saves `copy.md`, `prompt.txt`, and `hero.png` to the output folder and says plainly that no frames were built. Once Figma is connected, ask it to build from that folder.

### Hero image: Codex image tool or OpenAI Images API

`scripts/generate_image.py` picks a backend automatically:

1. **Codex CLI.** If a `codex` binary is on your PATH (or the `CODEX_BIN` env var points at one), it runs `codex exec` and asks Codex to use its built-in image tool. No API key needed; it uses your Codex sign-in.
2. **OpenAI Images API.** Otherwise, if `OPENAI_API_KEY` is set, it calls the OpenAI Images API with the `gpt-image-2` model. Get a key at https://platform.openai.com/api-keys (billing must be enabled). Each image is billed per generation; check OpenAI's pricing page for the current rate.
3. **Neither.** The script exits with code 2 and the frames use a brand-colour gradient instead of a photo.

Set the key with `export OPENAI_API_KEY="your-openai-key"` in your shell, or add `OPENAI_API_KEY=your-openai-key` to a `.env` file that your shell or host loads. The script reads only the environment; it does not open `.env` files itself. Keep `.env` in your project's `.gitignore`.

The API path needs `pip3 install requests`. `Pillow` is optional and lets the script crop the image to the exact frame size. Run `python3 <skill dir>/scripts/generate_image.py --out "$PWD/x.png" --prompt test --dry-run` to see which backend it would use, without spending anything.

## Before you start

### Step 0: Figma preflight (do not block on it)

Call `figma_get_status` with `probe: true`. Note whether it is connected and which file is open. If it is not connected, keep going with intake and add one line to your next message: "Figma is not connected. Open Figma Desktop, open the file you want the ads in, and run the Desktop Bridge plugin. I will build once it is up." Never claim frames were created if they were not.

If the user pasted a Figma URL, treat that file as the target and refuse to build into any other file.

### Step 1: Context, or five questions

Check for shared GTM context first. Look for `.agents/product-marketing.md`, then `.claude/product-marketing.md`. If either exists, read it and take the product, audience, pain, desired outcome, proof, and offer from it.

Then scan the current folder for anything the context file does not cover, especially brand details. Use Glob for the usual suspects, then skim what turns up:

- `README*`, `*.md` in the top two levels
- `*brand*`, `*design*`, `DESIGN.md`, `*style*`
- `*context*`, `*positioning*`, `*messaging*`, `*icp*`, `*persona*`
- `docs/`, `context/`, `brand/`, `marketing/`
- existing ad copy, landing page copy, app store listings

Pull out: product one-liner, who it is for, the biggest pain it removes, the desired outcome, one true proof point, the offer or CTA, brand colours, font, logo path, country, and any hero photo already on disk.

If you have product, audience, pain, and offer, say in two lines what you used and move on. Fill anything else from the defaults table.

If context comes up short, suggest running the `gtm-context` skill for next time, but do not wait for it. Ask these five in one message:

1. What is the product and who is it for? One sentence each.
2. What is the biggest pain it removes?
3. One true proof point (a number, a customer result, a review line)?
4. What is the offer or CTA? (free trial, download, book a call)
5. Brand colours, font, logo PNG path, any photo you want used, and size if not 1080x1080?

Do not ask follow-ups. Use defaults for anything skipped, and list them as assumptions in the report.

| Field | Default |
|---|---|
| Country | UK |
| CTA | Get started |
| Font | Inter |
| Lockup | Brand name as text |
| Photo | Generate one |
| Size | 1080x1080 |
| Colours | Primary `#1A1A1A`, dark `#0A0A0A` |

## Workflow

### Step 2: Copy table, then one "go"

Read `references/angles.md`. Write three variations and present them in one message with the image prompt. Ask for "go" or edits. This is the only stop.

**Table** (one row per angle):

| # | Angle | Headline (max 8 words) | Pills (2 or 3, max 3 words each) | CTA line |
|---|---|---|---|---|

**Paired platform copy** under the table, per variation, with character counts:

- Hook line (under 60 chars): the emotional stop
- Explainer (under 120 chars): what the product is, on its own
- Support line (under 255 chars): proof or the biggest objection answered
- Testing: one line on what this variation checks

These limits fit every major feed placement. If the user names a platform with tighter limits, trim to fit.

**Image prompt**: built from `references/image-prompt.md`. Show it in full so the user can tweak it in the same reply.

Write `copy.md` and `prompt.txt` to the output folder once the user says go.

### Step 3: Hero image

Skip this step if the user supplied a photo. Copy it to `hero.png` in the output folder and continue.

Work out which host you are in:

- **A tool named `image_gen` is in your tool list.** You are in Codex. Call it directly with the prompt and the size. Copy the result from `~/.codex/generated_images/` to `<output folder>/hero.png`. Do not run the script.
- **No `image_gen` tool.** Run the script from the project folder:

```bash
python3 <skill dir>/scripts/generate_image.py \
  --out "$PWD/ads/YYYY-MM-DD-<slug>/hero.png" \
  --prompt-file "$PWD/ads/YYYY-MM-DD-<slug>/prompt.txt" \
  --size 1080x1080
```

The script uses `codex exec` if the Codex CLI is installed, otherwise the OpenAI Images API if `OPENAI_API_KEY` is set, otherwise exits with a one-line reason. If no image lands, set `background: "gradient"` in the build spec and tell the user the photo step was skipped and why.

Open the image with the Read tool and check it against the four lines at the bottom of `references/image-prompt.md`. If it fails, regenerate once with the fix added to the prompt. Two images maximum.

### Step 4: Build in Figma

Skip to Step 7 if Figma is not connected.

Read `references/figma-build.md`. Copy the build script, edit only the `spec` block at the top, and run it with `figma_execute` and `timeout: 30000`.

The script finds or creates the Section `Ads – <brand>`, adds the three frames to the right of anything already in it, and returns `{ sectionId, frameIds, backgroundIds, logoIds }`. Keep those IDs.

### Step 5: Image fill (two steps)

Only when `background` is `"photo"`.

1. Shrink the photo so the payload stays small:
   ```bash
   sips -s format jpeg -s formatOptions 80 --resampleHeightWidthMax 1350 hero.png --out hero-fill.jpg
   ```
   `sips` is macOS only. On other systems, use Pillow or ImageMagick to make a JPEG at quality 80, longest side 1350.
2. Call `figma_set_image_fill` with `nodeIds` = the three `backgroundIds`, `scaleMode: "FILL"`, and `imageData` = the base64 of `hero-fill.jpg` (no data-URL prefix). Read the response: it should contain an `imageHash`, and it may say "0 nodes" even when the hash registered. Do not treat "0 nodes" as failure.
3. Run the bind script from `references/figma-build.md` with that hash so all three backgrounds get `{ type: "IMAGE", imageHash, scaleMode: "FILL" }`.

If the response carries no `imageHash` at all, rerun the build with `background: "gradient"` after deleting the frames you just made, and say so in the report.

Logo PNG supplied: same two steps against `logoIds` with `scaleMode: "FIT"`.

### Step 6: Check and fix (two rounds maximum)

Call `figma_capture_screenshot` for each frame ID. Look for:

- Headline clipped or running past three lines
- Headline or pills sitting over a face
- Pills overlapping the lockup or CTA
- White text on a bright patch with no gradient behind it
- Wrong font (fell back to Inter without you noticing)

Fix with a targeted `figma_execute` (move the pills, shorten a headline, deepen an overlay). Screenshot again. Stop after two rounds and note anything left.

### Step 7: Report

Follow the output format below.

## Output format

Tell the user, in this order:

- Figma file name and the Section name
- The three frame IDs with their angle names
- Which image was used (path) or "gradient background, no photo"
- Output folder path
- The copy table again, so it is in the final message
- One line: what the test is checking (which message stops the scroll)
- Assumptions and any proof point marked "needs checking"
- "Select the Section in Figma and press Cmd+Shift+E (Ctrl+Shift+E on Windows) to export PNGs."

If Figma was never connected, say plainly that no frames were built, list the files in the output folder, and give the one-line fix from Setup.

`copy.md` holds the copy table and the paired platform copy with character counts. `prompt.txt` holds the final image prompt.

## Rules

- British English. En dashes only, never em dashes.
- No banned SaaS words (list in `references/angles.md`).
- Headlines: max eight words, max three lines on canvas.
- Pills: two or three, max three words each.
- Never leave loose nodes on the page. Everything lives inside the Section.
- Never delete or move anything you did not create.
- Never claim Figma changes that did not happen.
- Claims must be true. If a proof point is unverified, mark it "needs checking" in the report.

## Quality checklist

- [ ] Shared context file checked before asking anything; five questions at most
- [ ] Each variation carries one angle only, and the three could not be confused
- [ ] Headlines eight words or fewer; pills two or three, three words or fewer each
- [ ] Hook under 60, explainer under 120, support under 255 characters, with counts shown
- [ ] The user said "go" before any file was written or anything was built
- [ ] Image checked against the four-line test; two generations at most
- [ ] All frames sit inside the `Ads – <brand>` Section; nothing else on the page touched
- [ ] Screenshots reviewed; two fix rounds at most
- [ ] Report matches what actually happened in Figma
- [ ] No banned words, no em dashes, no exclamation marks

## References

| File | Read when |
|---|---|
| `references/angles.md` | Writing the copy table |
| `references/image-prompt.md` | Building the photo prompt and checking the result |
| `references/figma-build.md` | Building, filling, and fixing the frames |
| `scripts/generate_image.py` | Generating the photo outside Codex |

## Related skills

- `gtm-context` – writes the shared context file this skill reads first
- `positioning-messaging` – sharpen the pain, desire, and proof before writing the ads
- `ad-headline-maker` and `ad-description-maker` – more headline and body copy options for the winning angle
- `jtbd-research` – find the customer's own words for the pain and desire angles
