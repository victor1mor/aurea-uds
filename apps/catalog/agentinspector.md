# AgentInspector

The detail of one agent: configuration, tools, instructions.

## Usage

```tsx
import {AgentInspector} from "@aurea-uds/react";
```

```tsx
<AgentInspector
  title="Curator"
  sections={[{label: "Configuration", items: [{term: "Model", value: "opus-5"}]}]}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | — | Names the panel, and names the region for a screen reader when it is a string. |
| `sections` | `Array<{ label: string; items: Array<{ term: string; value: ReactNode }> }>` | — | Labelled groups of term and value, each one a DataList — the anatomy of the reference's DetailsView, using the component that already exists here. |
| `children` | `ReactNode` | — | Free body under the sections, for inspecting what the record did not foresee. |
| `className` | `string` | — | On the panel. |
