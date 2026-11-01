# v0.52.1

The docs layout with the pill keeps its gap from 768, DataList wraps long words, and SegmentedControl gets two tall sizes.

Two fixes and two new sizes, all on the web.

## Fixed

- **`AppShell layout="docs"` with the pill**, from 768 to 1023 wide: the sidebar no longer touches the edge of the window. The columns sit 16 from the edges, lined up with the capsule, as they already did from 1024.
- **`DataList`**: a long word that does not fit (a long code name, for example) now wraps inside its cell instead of spilling out and making a narrow page scroll sideways.

## New

- **`SegmentedControl size="lg"` and `size="xl"`** — a 44 and a 48 capsule, for a switch that sits in a tall bar. `sm` (34) and `md` (40) stay as they were.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.52.1 @aurea-uds/core@0.52.1 @aurea-uds/fonts@0.52.1 @aurea-uds/icons@0.52.1
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.52.1
```
