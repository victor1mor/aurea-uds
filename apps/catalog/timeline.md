# Timeline

Chronological sequence of events.

## Usage

```tsx
import {Timeline} from "@aurea-uds/react";
```

```tsx
<Timeline items={[
  {title: "Created", description: "by Curator", time: "09:00"},
  {title: "Shipped", time: "14:20"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{title: ReactNode; description?: ReactNode; time?: ReactNode}>` | — | The events, rendered as an <ol> because the order IS the information. `time` is a node, so an absolute date and a relative one are equally welcome. |
