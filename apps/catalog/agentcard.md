# AgentCard

Who an agent is, what state it is in, and what it can do.

## Usage

```tsx
import {AgentCard} from "@aurea-uds/react";
```

```tsx
<AgentCard
  name="Curator"
  model="opus-5"
  state="running"
  description="Keeps the reference library tidy."
  capabilities={[{name: "search", icon: "magnifying-glass"}, {name: "summarise"}]}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | Required. Also feeds the avatar fallback, so a card never shows an empty circle. |
| `description` | `ReactNode` | — | One line about what the agent is for. |
| `avatarSrc` | `string` | — | Optional portrait; without it the initials stand in. |
| `model` | `string` | — | Which model is behind it, shown as secondary text. A string and not an enum: the list changes faster than this library ships. |
| `state` | `AgentState` | — | Renders an AgentStatus in the header. Omit it and the header simply has no state. |
| `capabilities` | `AgentCapability[]` | — | What the agent can do, as pills. `description` becomes the tooltip; the icon is optional. |
| `actions` | `ReactNode` | — | Your buttons, in the footer. The reference dispatches actions by STRING (`onAction(action: string)`), which trades the compiler for a verbal agreement — here whoever builds the button already knows what it does. |
| `className` | `string` | — | On the card. |
