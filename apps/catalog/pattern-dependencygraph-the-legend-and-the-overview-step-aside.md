# The legend and the overview step aside

On a large map the legend and the overview cover the devices in the bottom corners. With legendCollapsible the legend gets a Legend button that stays in its corner: open, the list rises above it; closed, only the button is left. With minimapToggle the overview gets a button beside the zoom buttons, at the top. Both start open; defaultLegendOpen and defaultMinimapOpen start them closed.

## Usage

```tsx
import {DependencyGraph} from "@aurea-uds/react";
```

```tsx
<DependencyGraph
  orientation="vertical"
  layout="layered"
  rootId="internet"
  edgeShape="step"
  controls
  legend
  legendCollapsible       // the Legend button, in the bottom-left corner
  minimap
  minimapToggle           // the overview button, beside the zoom buttons
  defaultMinimapOpen={false}
  nodes={nodes}
  edges={edges}
/>
```
