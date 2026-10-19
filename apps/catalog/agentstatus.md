# AgentStatus

The state of an agent, in one fixed vocabulary.

## Usage

```tsx
import {AgentStatus} from "@aurea-uds/react";
```

```tsx
<AgentStatus state="running" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `state` | `"idle" \| "thinking" \| "running" \| "paused" \| "error" \| "completed"` | "idle" | The six states come measured from the reference, not invented here. Each maps to a Status variant instead of a loose colour: the reference writes `text-yellow-500` inside the component, and colour inside a component is what this design system forbids. |
| `label` | `ReactNode` | — | Overrides the built-in wording. The default is translated; replace it when your domain calls the state something else. |
| `className` | `string` | — | On the status element. |
