# Icon

Icon primitive rendered from a sprite.

## Usage

```tsx
import {Icon} from "@aurea-uds/react";
```

```tsx
<Icon name="magnifying-glass" />
<Icon name="plus" size="lg" />
<Icon name="check" size="xl" />
```

## Examples

### Weights

regular is the line icon; bold is heavier for small sizes; fill is the solid shape the chosen item uses.

```tsx
<Icon name="star" weight="regular" />
<Icon name="star" weight="bold" />
<Icon name="star" weight="fill" />
```

### Sizes

From the icon scale; the icon follows the text size when no size is given.

```tsx
<Icon name="star" size="sm" />
<Icon name="star" size="md" />
<Icon name="star" size="lg" />
<Icon name="star" size="xl" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `IconName \| AureaIconComponent` | — | The glyph id, resolved against the sprite as #i-<name>. A name with no glyph renders nothing visible and throws nothing — check it against the catalogue. It also takes the app's OWN drawing — a component that returns its <svg> and receives the Aurea class and size, inheriting the colour (currentColor) — for a glyph the set does not have, or the app's logo, with no sprite of its own. A drawing has no fill weight. |
| `size` | `sm \| md \| lg \| xl` | md | Token scale. It follows the text it sits next to. |
| `spriteUrl` | `string` | — | LOCAL override of where the glyphs come from. The normal way is to set it once on AureaProvider; this is for the rare page carrying two sprites. |
| `weight` | `"regular" \| "fill" \| "bold"` | "regular" | fill draws the filled shape of the glyph — the one the selected item uses (ADR-0053). bold draws the thick stroke, only for the glyphs drawn in it (today, x — the CloseButton's); the others stay regular. An app's own glyph stays regular. |
