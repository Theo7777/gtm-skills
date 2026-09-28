# Hero image prompt

One photo, shared by all three frames. It has to leave room for text at the top and bottom, and it must look like a real place the audience recognises, not a stock library.

## Template

Fill every bracket from the context or the user's answers. Keep the structure; it is what stops the model producing a smiling stock model.

```
Photorealistic candid shot of a {audience person: role, rough age, build} in {country}, wearing {realistic, slightly worn clothing for the role}.
{What they are doing, mid-task, both hands occupied, not looking at camera.}
Setting: {a specific, everyday location for that role in that country, with two or three giveaway details}.
Visible authentic detail: {two or three props or kit that only someone in that role would have}.
{Lighting: overcast daylight, window light, golden hour, or workshop strip light}, shot from {angle}, shallow depth of field with the person in sharp focus.
Composition: subject in the middle third of the frame, clear space above and below for text overlays. Candid documentary style, not posed.
{Aspect: "Square 1:1 crop" for 1080x1080, "4:5 portrait crop" for 1080x1350}. Photorealistic.
No text, no logos, no brand names, no watermarks. {Negative constraints: what would make it look like the wrong country or a stock photo.}
```

## Filling the brackets well

- **Country cues** matter more than anything. For the UK: terraced houses, UK double sockets, right-hand drive, slate roofs, wooden fence panels, small vans not pickups. Write the equivalent giveaways for whatever country the audience is in, and list the wrong-country tells in the negative constraints.
- **Mid-task** beats posed every time. Hands busy. Eyes on the work.
- **Slightly worn** clothing and kit. Stock-clean is the tell.
- **Middle third** so the top and bottom gradients never sit over a face.
- **No text in the scene**. Signs, labels, and screens produce gibberish.
- For a desk-based or consumer product, the same rules apply: a real kitchen table, a real laptop with a closed lid or blurred screen, a real mug, a real cardigan.

## Example (UK plumber, 1:1)

```
Photorealistic candid shot of a British plumber in his mid-30s, light stubble, stocky build, wearing a worn navy work polo and dark work trousers.
Lying on his back under a kitchen sink tightening a copper pipe fitting with slip-joint pliers, both hands occupied, focused on the work, not looking at camera.
Setting: a typical UK kitchen with white tiled splashback, UK double sockets on the wall, wooden cupboard doors.
Visible authentic detail: copper pipes, isolation valves, a flexi tap connector, the U-bend clearly visible.
Overcast daylight from a nearby window, shot from ground level looking slightly up, shallow depth of field with the plumber in sharp focus.
Composition: subject in the middle third of the frame, clear space above and below for text overlays. Candid documentary style, not posed.
Square 1:1 crop. Photorealistic.
No text, no logos, no brand names, no watermarks. No white PEX piping, no garbage disposal, no American sockets, no American-style taps.
```

## Check the result (four lines)

Open the image with the Read tool and answer each:

1. Do the people look real? No plastic skin, no stock-model grin, clothes slightly worn.
2. Are hands, tools, and objects intact? No extra fingers, melted kit, or warped edges.
3. Does the scene match the business and the country? Right setting, right props, no wrong-country tells.
4. Is there any baked-in text, logo, or watermark? There must be none.

All four pass: use it. Any fail: add the specific fix to the negative constraints and regenerate once. Two images maximum, then use the better one and note the flaw in the report.
