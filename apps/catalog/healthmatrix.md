# HealthMatrix

What is up, in a grid.

## Usage

```tsx
import {HealthMatrix} from "@aurea-uds/react";
```

```tsx
<HealthMatrix entries={[
  {id: "1", name: "API", state: "operational"},
  {id: "2", name: "Workers", state: "degraded"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `entries` | `HealthEntry[]` | — | Five states, the standard status-page vocabulary measured from the reference: operational, degraded, down, maintenance, unknown. Each cell carries a Status, so the state is a word and not only a colour. |
| `label` | `string` | "Health" | Accessible name of the grid. |
| `className` | `string` | — | On the grid. |
