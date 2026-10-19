# CostMeter

Spend against a ceiling, with the soft and hard limits kept apart.

## Usage

```tsx
import {CostMeter} from "@aurea-uds/react";
```

```tsx
<CostMeter spent={84.2} limit={100} softLimit={80} period="This month" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `spent` | `number` | — | Amount spent in the period. Costs below one cent are printed with up to six decimals: two fixed decimals, which is what the reference formatter uses, would print "$0.00" for a real spend of $0.004 and blank out the number in the very component built to watch it. |
| `limit` | `number` | — | The hard ceiling — the one that blocks. Without it there is no meter and no bar, only the amount. Measured from LiteLLM, the 2026 market standard for LLM cost control. |
| `softLimit` | `number` | — | The threshold that only warns. Absent, there is no warning state: deriving one at 80% of the limit would be an invented number, and an alert firing at a threshold nobody configured is noise wearing the clothes of a policy. Crossing it does NOT repaint the bar — measured: in the dark theme --warning-400 IS the brand yellow, the same value as --primary, so a warning bar would be indistinguishable from a normal one. The soft limit speaks in words, through the Alert; colour is kept for the hard limit, where red separates in both themes. |
| `segments` | `CostSegment[]` | — | Optional breakdown of the amount — input, output, cache — rendered as a DataList. |
| `period` | `ReactNode` | "Spent" | What the amount refers to, shown beside it: "This month", "Last 24h". |
| `currency` | `string` | "USD" | ISO currency code. |
| `locale` | `string` | "en-US" | Passed to Intl.NumberFormat. Fixed by default for the same reason as in ModelUsage: deterministic output across machines. |
| `label` | `string` | "Cost" | Accessible name of the region and of the meter. |
| `className` | `string` | — | On the card. |
