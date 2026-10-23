# KPI

Single headline metric with optional delta.

## Usage

```tsx
import {KPI} from "@aurea-uds/react";
```

```tsx
<KPI label="Revenue" value="$48.2k" trend="+12% vs last month" />
```

## Examples

### Tones

What the change means, apart from its direction: a cost going up is bad news, so the tone is set by you, not guessed.

```tsx
<KPI label="Revenue" value="$48.2k" trend="+12% vs last month" direction="up" tone="neutral" />
<KPI label="Revenue" value="$48.2k" trend="+12% vs last month" direction="up" tone="success" />
<KPI label="Revenue" value="$48.2k" trend="+12% vs last month" direction="up" tone="danger" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | What is being measured. Sits above the number, in muted text. |
| `value` | `ReactNode` | — | The number itself, already formatted — the component does not format. |
| `trend` | `ReactNode` | — | The change, as a node and not a number: the sign, the unit and the wording belong to the domain, not to a card. |
| `direction` | `up \| down \| flat` | — | Where the number went. Draws the arrow (trend-up, trend-down, minus), colours the trend and puts a word in front of it for screen readers — so the direction never depends on colour alone. |
| `tone` | `success \| danger \| neutral` | from direction | The colour of the trend. By default up is success, down is danger and flat is neutral; set it when going up is bad (cost, errors). Without direction it paints nothing: colour never travels alone. |
| `directionLabel` | `string` | Up / Down / No change | The word a screen reader hears before the trend. English by default, like every built-in label of the web package; pass it in the language of the page. |
| `variant` | `card \| plain` | card | `plain` drops the card: the number sits inside a card that already exists, instead of a box inside a box. |
