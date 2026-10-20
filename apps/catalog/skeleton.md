# Skeleton

Placeholder shown while content loads.

## Usage

```tsx
import {Skeleton} from "@aurea-uds/react";
```

```tsx
<Skeleton style={{height: "0.875rem", width: "70%"}} />
<Skeleton style={{height: "0.875rem", width: "90%"}} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `animation` | `"pulse" \| "none"` | "pulse" | the reference library's pulse, or none. Its shimmer is a gradient, which Aurea does not have. With reduced motion requested by the system, it never pulses. |
| `className` | `string` | — | Where the shape comes from. There is no size prop on purpose: a skeleton stands in for one specific piece of content, and only the page knows how big that is. |
| `style` | `CSSProperties` | — | The usual way to give it width and height for a one-off. Every other div attribute passes through as well. |
