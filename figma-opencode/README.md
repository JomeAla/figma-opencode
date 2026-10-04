# OpenCode Builder

A Figma plugin that builds **mobile app** and **web app** UI sections directly on the Figma desktop canvas, one piece at a time.

Instead of generating an entire design in a single run (which can be slow or crash the plugin), OpenCode Builder gives you a panel of buttons. Each button adds exactly one section - a navbar, a hero, a card, a bottom nav, and so on - so you can assemble a screen incrementally and stay in control.

## Features

- **Mobile panel** - Status Bar, Top Bar, Search Bar, Hero, Section Title, Card, List Item, 2-Column Grid, Bottom Navigation, Floating Action Button
- **Web panel** - Navbar, Hero, Logo Cloud, Feature Grid, Pricing, Testimonial, CTA Banner, Footer
- **System panel** - create local color + text styles, and clear generated frames
- Everything is built with **Auto Layout**, real text, and named layers
- Sections are appended to a root frame called `OpenCode - Mobile` (390px) or `OpenCode - Web` (1440px)

## Install in Figma Desktop

1. Open the **Figma desktop app** (not the browser).
2. Open any design file.
3. Go to **Menu -> Plugins -> Development -> Import plugin from manifest...**
4. Select `figma-opencode/manifest.json`.
5. Run it from **Menu -> Plugins -> Development -> OpenCode Builder**.

The panel appears on the right. Click a button to drop that section onto the canvas.

## Project structure

```
figma-opencode/
  manifest.json   Plugin manifest (entry points, permissions)
  code.js         Plugin main thread - builds the layers
  ui.html         The panel UI (tabs + buttons)
  README.md
```

No build step and no dependencies - the plugin loads directly from source.

## Usage tips

- Click **System -> Create Color & Text Styles** first to get reusable tokens in your Local styles.
- Add sections in visual order (Top Bar, then Hero, then Card, ...). New sections stack onto the existing root frame.
- **System -> Clear Generated Frames** removes the plugin-created root frames without touching the rest of your file.
- Every generated section is a normal Figma frame - edit it freely, or detach and rename as you like.

## Extending

Each button maps to a builder in `code.js`:

- Add a builder function (e.g. `mobileTabs()`).
- Register it in the `BUILDERS` object with a key like `"mobile.tabs"`.
- Add a matching `<button data-action="mobile.tabs">` in `ui.html`.

The dispatcher sends `{ type: "create", action }` from the UI to the plugin, and `code.js` calls the right builder.
