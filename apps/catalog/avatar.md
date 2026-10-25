# Avatar

Represents a user or entity with image or initials.

## Usage

```tsx
import {Avatar} from "@aurea-uds/react";
```

```tsx
<Avatar fallback="AU" />
<Avatar fallback="VM" size="lg" />
<Avatar fallback="B" tone="info" emphasis="soft" />
<Avatar fallback={<Icon name="floppy-disk" />} tone="warning" emphasis="soft" />
```

## Examples

### Tones

The colour of the fallback, with soft emphasis: the tone tints the circle and the letters stay readable.

```tsx
<Avatar fallback="AU" emphasis="soft" tone="neutral" />
<Avatar fallback="AU" emphasis="soft" tone="brand" />
<Avatar fallback="AU" emphasis="soft" tone="info" />
<Avatar fallback="AU" emphasis="soft" tone="success" />
<Avatar fallback="AU" emphasis="soft" tone="warning" />
<Avatar fallback="AU" emphasis="soft" tone="danger" />
```

### Sizes

Three sizes from the control scale.

```tsx
<Avatar fallback="AU" size="sm" />
<Avatar fallback="AU" size="md" />
<Avatar fallback="AU" size="lg" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | — | The picture. A broken URL falls back instead of showing the browser's broken-image glyph — measured, it did not before. |
| `alt` | `string` | "" | Empty by default, because an avatar usually sits beside the name it stands for and repeating it is noise. Fill it when the avatar is the only identification. |
| `fallback` | `ReactNode` | — | What shows with no src, or when src fails: initials, an icon, anything. Without it the circle is empty, which is a legitimate placeholder. |
| `size` | `sm \| md \| lg` | md | Token scale, not pixels. It shares --control-h-* with the controls, so an avatar next to a button of the same size lines up by construction, and density reaches it. |
| `tone` | `"neutral" \| "brand" \| "danger" \| "success" \| "warning" \| "info"` | "neutral" | The colour of the fallback letter or icon — what it means (the reference's color). |
| `emphasis` | `"default" \| "soft"` | "default" | soft drops the ring and gives the tone's light background, as the reference's soft avatar (the yellow floppy disk of its showcase). |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin — your class wins on a tie. |
