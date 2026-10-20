# A wide range you drag instead of clicking forty times

Opacity 0–100, a width in pixels: ranges where the steppers are the wrong instrument. `scrubbable` adds a handle that changes the value as you pull it — the gesture every drawing tool has in a numeric field. It is opt-in and strictly additive: the buttons, the arrow keys and Home/End are untouched, and the handle is hidden from assistive technology because dragging is a pointer gesture with no keyboard equivalent to promise. Use `scrubDirection="vertical"` when the fields are stacked, as in a width/height pair.

## Usage

```tsx
import {NumberField} from "@aurea-uds/react";
```

```tsx
<NumberField label="Opacity" defaultValue={80} min={0} max={100} scrubbable />
```
