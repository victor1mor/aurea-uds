# v0.79.0

Tooltip corners are 12; OTPField digits use the text font; upright MediaEmbed posters show whole; Ember fields in high contrast are outlined in orange.

## Added

- **`--tooltip-radius`** (12 px): the corner of the tooltip, a token of its own. The `--radius-*` scale does not change.

## Changed

- **`Tooltip` corners are 12 px** (they were 10). The `Chart` hover card keeps its corner.
- **`OTPField` digits use the text font** on the web (`--font-ui`; they used the code font). React Native already did. Size and weight do not change.
- **An upright `MediaEmbed` poster shows whole.** A poster taller than it is wide (a video shot upright) is no longer cropped: it is shown entire, with a blurred copy of it filling the frame behind. Landscape posters still fill the frame.
- **In high contrast, Ember fields are outlined in Ember orange** (`--primary`), on the web (`data-contrast="high"`) and in React Native (`highContrast`). Cards and buttons keep the gray outline. Other brands do not change.
- **The `Toast` description is 14 px in React Native** (it was 16), the same as on the web. The title stays 16.

## Removed

- **The unused `.health-cell.warn`, `.bad` and `.off` rules.** `HealthMatrix` never produced these classes, so the component does not change. If you wrote them by hand, the cells now look like every other cell.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.79.0 @aurea-uds/core@0.79.0 @aurea-uds/fonts@0.79.0 @aurea-uds/icons@0.79.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.79.0
```
