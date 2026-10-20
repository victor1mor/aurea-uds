# HoverCard

Rich preview that opens when the pointer rests on a link, and whose content can be reached.

## Usage

```tsx
import {HoverCard} from "@aurea-uds/react";
```

```tsx
<HoverCard trigger={<Button variant="link" href="#curator">Curator</Button>}>
  <strong>Curator</strong>
  <p className="muted">Reviews and files what comes in.</p>
</HoverCard>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `ReactElement` | none | REQUIRED. The element the pointer rests on, usually a link or a name. |
| `children` | `ReactNode` | none | The preview. Never put anything essential here: pointer rest is not available to keyboard-only or touch users. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | "bottom" | Preferred side. The engine flips it when there is no room. |
