# v0.38.0

The legend and the overview of DependencyGraph can step aside, so they no longer cover the devices in the bottom corners.

On a large map, the legend and the overview of [DependencyGraph](./dependencygraph.html) covered the devices in the bottom corners, and nothing could tuck them away. Now each one has a button.

## Added

- **`legendCollapsible`** gives the legend a **Legend** button that stays in the bottom-left corner. Open, the list rises above it; closed, only the button is left. `defaultLegendOpen={false}` starts it closed.
- **`minimapToggle`** gives the overview an **Overview** button beside the zoom buttons, at the top. The overview stays in its corner and only shows and hides. `defaultMinimapOpen={false}` starts it hidden. Without `controls`, the button stands alone in the top corner.

Both buttons tell screen readers whether they are open (`aria-expanded`) and point to what they open (`aria-controls`). Without the new props, nothing changes.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.38.0 @aurea-uds/core@0.38.0 @aurea-uds/fonts@0.38.0 @aurea-uds/icons@0.38.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.38.0
```
