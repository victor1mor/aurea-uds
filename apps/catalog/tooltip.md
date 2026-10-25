# Tooltip

Brief label revealed on hover or focus.

## Usage

```tsx
import {Tooltip} from "@aurea-uds/react";
```

```tsx
<Tooltip content="Copy to clipboard" side="top">
  <IconButton icon="copy" label="Copy" />
</Tooltip>

// with the arrow; on plain text the trigger becomes focusable by itself
<Tooltip content="Monthly recurring revenue" arrow>
  <span>MRR</span>
</Tooltip>
```

## Examples

### Sides

Which side of the trigger it opens on. When there is no room on that side, it flips to the opposite one.

```tsx
<Tooltip content="Opens on the top" side="top"><Button variant="outline">Side top</Button></Tooltip>
<Tooltip content="Opens on the right" side="right"><Button variant="outline">Side right</Button></Tooltip>
<Tooltip content="Opens on the bottom" side="bottom"><Button variant="outline">Side bottom</Button></Tooltip>
<Tooltip content="Opens on the left" side="left"><Button variant="outline">Side left</Button></Tooltip>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactElement` | — | The trigger, as a single element. It receives aria-describedby pointing at the popup — that reference is what makes the hint exist for a screen reader instead of only for the eye. When the element is not focusable on its own (a <span>, a Badge), it becomes focusable, as a button — as in the reference library — so the tip opens from the keyboard too. |
| `content` | `ReactNode` | — | The hint. Short, and never the only place the information lives: a tooltip is a description, and it must hold nothing focusable. |
| `side` | `top \| right \| bottom \| left` | top | Preferred side; it flips when there is no room. |
| `arrow` | `boolean` | false | The arrow, off by default as in the reference library. Our own curve, 12 × 6, with the surface fill and the border line. |
| `delay` | `number` | 1500 | Milliseconds the pointer rests before it opens — the reference library's 1.5 s (the engine's own is 0.6 s). From the keyboard it opens at once, and once one is open its neighbours open without waiting. |
| `closeDelay` | `number` | 500 | Milliseconds before it closes after the pointer leaves — the reference library's 0.5 s. |
