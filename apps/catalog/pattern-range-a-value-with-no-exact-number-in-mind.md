# A value with no exact number in mind

A slider is for approximate values — volume, opacity, a threshold nobody types. When the exact figure matters, a NumberField is honest and a slider is guesswork with a nice handle.

## Usage

```tsx
import {Range, Field} from "@aurea-uds/react";
```

```tsx
<Field label="Similarity threshold" hint="Higher matches fewer, more confident results">
  <Range min={0} max={100} defaultValue={72} />
</Field>
```
