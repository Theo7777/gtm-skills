# Brand and proof from the client's website

Use only for what the shared context and the user did not already answer. Save raw finds to `ads/<date>-<slug>/brand-pull.md` with a URL for every item.

## 1. Pages to read

The homepage, then any of: `/customers`, `/case-studies`, `/testimonials`, `/about`, `/product` or `/features`, `/pricing`. Use WebFetch (or the Firecrawl skill if installed) for text, and a headless browser for screenshots.

## 2. What to take

| Item | Where it usually is | How |
| --- | --- | --- |
| Colours | CSS variables (`--primary`, `--brand`), buttons, the hero background | Take the button colour as **accent**, the darkest brand colour as **dark**, the page background as **light**. Check contrast: accent text on dark needs 4.5:1, or use accent only for shapes |
| Fonts | `font-family` on headings and body, Google Fonts or Fontshare links | Check they are installed before building. Missing: ask the user to install the client's licensed files or choose a substitute. Do not download web font files from the site |
| Logo | Header `<img>` or inline `<svg>` (often both a colour and a white version on the page, e.g. header and footer) | Prefer SVG; strip `class` attributes and keep the `xmlns`. Save `logo.svg` and `logo-white.svg` |
| Customer logos | "Trusted by", "Our customers", logo marquees, case-study pages | Only logos the client already shows. Keep the file, the page URL, and **the label above them, word for word** ("Trusted by:"). A single SVG strip of several logos is fine (`svgRows`). A testimonial's company logo: the case-study page first, then the company's own site |
| Testimonials | Quote blocks, case studies, review widgets | Verbatim, with name, role, company, and URL. Prefer quotes with a specific outcome, but any clear, attributed quote works |
| Case-study results | Case-study headlines and stat callouts | The number, what it measures, the customer, and the URL |
| Product screenshots | Hero images, feature sections, `/product` | Download the largest version. Note which feature each shows |
| ICP | Who the copy addresses, job titles in testimonials | Role, seniority, setting (office, site, home), industry |

## 3. Downloading

```bash
mkdir -p ads/assets
curl -sL "<image url>" -o ads/assets/<name>.<ext>
file ads/assets/<name>.<ext>        # confirm it is really an image
```

For a page screenshot: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1440,900 --screenshot=ads/assets/<name>.png <url>`.

## 4. Logos on dark backgrounds

Use the white or reversed version when one exists. If only a version with dark lettering exists, recolour just the dark parts to white and keep the brand colours:

```python
from PIL import Image
im = Image.open("logo.png").convert("RGBA"); px = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if a and max(r, g, b) < 90: px[x, y] = (255, 255, 255, a)
im.crop(im.getbbox()).save("logo-on-dark.png")
```

Look at the result on the ad's dark colour before using it.

## 5. Show the user before saving

Show the tokens (hex values with names, fonts, logo files) and the proof list. Brand tokens and proof stay in the campaign folder. Add them to the shared context file only if the user asks.
