# ModelUsage

Consumption split by model: which one took how much.

## Usage

```tsx
import {ModelUsage} from "@aurea-uds/react";
```

```tsx
<ModelUsage metric="tokens" entries={[
  {id: "1", model: "opus", provider: "anthropic", tokens: 1_840_000},
  {id: "2", model: "haiku", provider: "anthropic", tokens: 620_000},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `entries` | `ModelUsageEntry[]` | — | One row per model: model, optional provider, and the three measures (tokens, cost, requests). Rows are sorted descending by the active metric, on a copy — the caller's array is not mutated. |
| `metric` | `"tokens" \| "cost" \| "requests"` | "tokens" | Which measure the bars compare. The reference exposes the same choice as four tabs because each one is a separate query in its product; here the data arrives ready and the dimension is a prop. |
| `currency` | `string` | "USD" | ISO currency code, used only when metric is "cost". |
| `locale` | `string` | "en-US" | Passed to Intl.NumberFormat. The default is fixed on purpose: a locale read from the environment would make the rendered text differ between a developer machine and CI, and the catalogue is rendered ahead of time. |
| `label` | `string` | "Model usage" | Accessible name of the region. |
| `className` | `string` | — | On the card. |
