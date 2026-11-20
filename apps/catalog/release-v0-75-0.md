# v0.75.0

The selected underline starts with the text, secondary tabs underline edge to edge, and six inner dividers come back.

## Changed

- **The underline of the selected item starts 16 from the edge (`--space-4`), together with the text** — `SegmentedControl`, the `CodeBlock` tabs, the selected `Gallery` tile and the site sidebar. It used to start at 15.
- **Secondary `Tabs` (horizontal) underline the whole tab, edge to edge.** Native too.
- **Six inner dividers get the light line back** (the text color at 10%): the `hr`, the table rows and the quote bar in `Prose`; below the `NotificationCenter` header; above the legal row of `Section variant="footer"`; and above the actions of the `Header` mobile menu.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.75.0 @aurea-uds/core@0.75.0 @aurea-uds/fonts@0.75.0 @aurea-uds/icons@0.75.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.75.0
```
