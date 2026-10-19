# DataList

Key/value or item list for structured data.

## Usage

```tsx
import {DataList} from "@aurea-uds/react";
```

```tsx
<DataList items={[
  {term: "Plan", value: "Pro"},
  {term: "Seats", value: "12"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{term: ReactNode; value: ReactNode}>` | — | Term and value pairs, rendered as a real <dl>. The pairing is in the markup, so it survives with the stylesheet off and reads correctly to a screen reader. |
