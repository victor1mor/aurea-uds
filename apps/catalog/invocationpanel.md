# InvocationPanel

One execution: what was asked, the steps, what came out.

## Usage

```tsx
import {InvocationPanel} from "@aurea-uds/react";
```

```tsx
<InvocationPanel
  title="Summarise the changelog"
  input="Summarise the last 20 entries."
  steps={[{id: "1", label: "read", detail: "20 entries", state: "done"}]}
  output="Three themes: performance, a11y, packaging."
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | — | Names the panel, and names the region for a screen reader when it is a string. |
| `input` | `ReactNode` | — | What was asked. Yours to format — a prompt, a form, a payload. |
| `steps` | `InvocationStep[]` | — | What happened in between. A step with `content` becomes a native <details>: folding is platform behaviour, with keyboard and ARIA already in it, where the reference spends a library Collapsible to arrive at the same place. |
| `output` | `ReactNode` | — | What came out. |
| `running` | `boolean` | false | Marks `aria-busy` on the whole region. The reference animates the label with a shimmer instead — decoration a screen reader cannot reach and that reduced-motion would have to undo. |
| `className` | `string` | — | On the panel. |
