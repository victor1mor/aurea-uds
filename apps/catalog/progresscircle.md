# ProgressCircle

ProgressCircle shows progress as a ring that fills from the top. Without a value it spins, because nobody knows how much is left. It needs a label, like every progress bar.

## Usage

```tsx
import {ProgressCircle} from "@aurea-uds/react";
```

```tsx
<ProgressCircle label="Uploading" value={60} size="sm" />
<ProgressCircle label="Uploading" value={60} />
<ProgressCircle label="Uploading" value={60} size="lg" />
```

- role="progressbar" with aria-valuenow, min and max; indeterminate leaves the values out.

- Three sizes from the reference library: 20, 28 and 36.

- The same tones as Progress, with the brand yellow by default.

- With reduced motion, the indeterminate ring turns slower.

## Examples

### Tones and no value

The tone says how it is going; without a value, it spins.

```tsx
<ProgressCircle label="Backup" value={100} tone="success" />
<ProgressCircle label="Storage" value={92} tone="warning" />
<ProgressCircle label="Loading" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | REQUIRED. What is in progress ("Uploading the file"). |
| `value` | `number` | — | From min to max. Left out, the ring spins: nobody knows how much is left. |
| `min` | `number` | 0 | The start. |
| `max` | `number` | 100 | The end. |
| `size` | `"sm" \| "md" \| "lg"` | "md" | 20, 28, 36 — the reference library's ring: a 4 stroke on a 36 frame, round cap. |
| `tone` | `"brand" \| "neutral" \| "success" \| "warning" \| "danger" \| "info"` | "brand" | The fill colour, the same tones as Progress. |
| `className` | `string` | — | Added to the ring. |
