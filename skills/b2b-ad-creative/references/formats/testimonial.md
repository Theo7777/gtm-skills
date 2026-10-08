# Testimonial (TE)

A real customer in their own words, big enough to read in the feed. Examples: `references/examples/testimonial/`. A strong default is a dark brand-colour layout with large quote marks, the key phrase in the accent colour, and the customer's logo beside their name and role.

## Anatomy

1. **Logo** top centre, small.
2. **Quote marks**: large, in the accent colour at 20–40% opacity, top left and bottom right.
3. **Quote**: 44–56px, left aligned, the payoff phrase in the accent colour and bold ("Our Friday handover went from two hours to **twenty minutes**.").
4. **Attribution**, bottom left: the customer's real logo straight on the background (white or reversed version on dark, no box), or a round headshot; then the name (accent, bold) and role and company. A white tile behind the logo (`logoTile: true`) only when no light version can be made.

## Grid

| | 1080×1080 | 1080×1350 |
| --- | --- | --- |
| Margin | 80 | 80 |
| Logo | top 64, height 44 | top 72, height 48 |
| Quote | top 200, width 920, 44–56px | top 260, 52–60px |
| Attribution | bottom 96, logo tile 160×100 or headshot 96 | bottom 120 |

## Variants

- **dark:** dark brand background, light text (default; Pennywork, Bravio).
- **light:** light or cream background, dark text, accent emphasis.
- **headshot:** a round headshot instead of the company logo (Bravio). Only with a photo the client already publishes.
- **photo:** the customer's photo fills the top half, the quote sits on an accent banner below. Only with a photo the client already publishes.

## Copy rules

- Verbatim quote from the client's site or case study, with the URL in `copy.md`.
- Must be a real, attributed quote. If none exists, do not build this format; flag it.
- Trim with an ellipsis; never reword. Up to 30 words.
- Name, role, and company exactly as the client publishes them.

## Avoid

- Generic praise ("Great tool, highly recommend").
- A generated face next to a real quote.
