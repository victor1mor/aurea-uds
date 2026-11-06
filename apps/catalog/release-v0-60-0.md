# v0.60.0

Selected segments and tabs stay visible in Windows high contrast; code stays left-to-right on right-to-left pages.

## Changed

- **Windows high contrast:** the selected segment of `SegmentedControl` and the selected tab of `Tabs` are painted with the system highlight colour (`Highlight` and `HighlightText`). Before, the system replaced their background and they looked like the others. The status dot of `Badge` keeps the system text colour instead of disappearing. Web only.
- **Right-to-left pages:** `CodeBlock` keeps the code left-to-right, with the line numbers before it, like every code editor. The frame around it still follows the page direction, and the code leaves room for the copy button on that side. Web only.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.60.0 @aurea-uds/core@0.60.0 @aurea-uds/fonts@0.60.0 @aurea-uds/icons@0.60.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.60.0
```
