# v0.48.0

Two finishes you can choose — a glow under the primary button and a soft ring around tinted pieces — and a blurred header you can read over anything.

Two new finishes, off unless you ask for them, and a fix to the blurred header. Read "Look and feel" if you use `Header` with `blurred`.

## Look and feel

- **`Header` with `blurred`** is no longer transparent: it is the card colour at 72%, with the colours behind it a little more vivid. Transparent, the header text sat straight on whatever scrolled underneath and could drop to 1.83:1 over a yellow block in dark mode; now it never goes below 9:1. When the browser cannot blur, or the system asks for reduced transparency, the header is the solid card colour (it was the page colour).

## New

- **`glow`** on `Button` and `IconButton` (web and React Native) and `ToolbarButton` (web): a soft glow in the primary button's own colour at 40%, under it. Focus is still the ring. On any other button it draws nothing.
- **`ring`** on `Button`, `IconButton`, `Badge` and `Chip` (web and React Native) and `ToolbarButton` (web): around a tinted piece — a badge that is not solid, a `soft` or outline button (on React Native, `outline`) — its tone at 30%, inside the edge, so the size never changes.
- **`data-glow="true"` and `data-ring="true"` on a container** (or on `<html>`) turn a finish on for everything inside. A piece with its own prop wins, so `glow={false}` or `ring={false}` takes one out.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.48.0 @aurea-uds/core@0.48.0 @aurea-uds/fonts@0.48.0 @aurea-uds/icons@0.48.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.48.0
```
