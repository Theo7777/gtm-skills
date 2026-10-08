# ICP background (IB)

A full-bleed photo of someone who looks like the buyer, at work, with a dark brand overlay and a bold message on top. Feels like a magazine ad for the buyer's own job. Examples: `references/examples/icp-background/`.

## Anatomy

1. **Photo**, full bleed: the ICP at work in their real setting (an office meeting, on a site, at a desk with paperwork). Subject in the right half, looking at their work, not the camera.
2. **Overlay**: brand dark colour, solid on the left fading to clear on the right (or bottom to top), so text reads and the person shows.
3. **Logo** top left, small, white.
4. **Headline**: uppercase, heavy weight, white, 2–4 lines ("GOOD ONBOARDING SHOULD FEEL HUMAN."). An optional second line in the accent colour ("WITHOUT THE PANIC.").
5. **Divider**: a short accent bar (64×6) under the headline.
6. **Subline**: one or two lines in the accent colour or white.
7. **Tags**: 2–4 white pills with dark text naming what it does ("Evidence", "Access", "Reviews").
8. **CTA pill** bottom left, accent fill, dark text.
9. **Optional stat badge** bottom right, accent pill ("+20%"), only with a sourced number.

## Grid

| | 1080×1080 | 1080×1350 |
| --- | --- | --- |
| Margin | 72 | 72 |
| Logo | top 64, height 36 | top 72, height 40 |
| Headline | top 220, 72–84px, width 620 | top 300, 80–92px |
| Tags | under subline, gap 12 | gap 14 |
| CTA | bottom 72, height 64 | bottom 88 |

## Variants

- **tags:** headline, subline, tags, CTA (default; Vaultline, Avenlo).
- **proof:** headline, a sourced customer result as the subline, a stat badge.
- **two-tone headline:** first line white, second line accent ("AUDIT READY. WITHOUT THE PANIC." – Vaultline).

## Image prompt

Write to `prompts.md`, then generate at the frame size:

> Photorealistic, candid editorial photo of a [role, seniority] at work in [setting typical for the industry, city, time of day]. [What they are doing with their hands, a real task]. Shot on a 35mm lens, natural window light, shallow depth of field. Subject on the right third of the frame, the left half calm and darker for text. Muted, desaturated colours with [brand dark colour] tones. No text, no logos, no screens with readable content, no watermark.

Generated people are illustrative: never caption them as a named customer.
