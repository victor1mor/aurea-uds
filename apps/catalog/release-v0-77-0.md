# v0.77.0

Tabs, SegmentedControl and Sidebar items can be disabled, and tabs and segments respond to the pointer.

## Added

- **`disabled` on a `Tabs` item.** The tab is dimmed and cannot be chosen; the arrow keys still reach it. React Native already had it.
- **`disabled` on a `SegmentedControl` item**, on the web and in React Native. Only that segment is unavailable. On the web the arrow keys skip it; with `href`, it renders as a `<button aria-disabled>`. In React Native, screen readers announce it as unavailable, and `disabled` on the control still dims every segment.
- **`disabled` on a `Sidebar` item.** It renders as a `<button aria-disabled>`: it does not navigate or run its press, and it stays in the Tab order.

## Changed

- **With the pointer over a tab or a segment that is not chosen, its label takes the text color**, as the `Sidebar` items already did. Pointer devices only.

## Site

- **New examples** on the [Tabs](./tabs.html), [SegmentedControl](./segmentedcontrol.html) and [Sidebar](./sidebar.html) pages show an unavailable item.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.77.0 @aurea-uds/core@0.77.0 @aurea-uds/fonts@0.77.0 @aurea-uds/icons@0.77.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.77.0
```
