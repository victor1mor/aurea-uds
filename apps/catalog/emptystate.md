# EmptyState

Placeholder for an empty or zero-result view.

## Usage

```tsx
import {EmptyState} from "@aurea-uds/react";
```

```tsx
<EmptyState
  titleAs="h2"
  title="No results"
  description="Try a different filter."
  action={<Button variant="primary" leadingIcon="plus">New project</Button>}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | — | What is not here. Required: an empty state without a sentence is a blank area. |
| `titleAs` | `h2 \| h3 \| h4 \| p` | h3 | The heading level belongs to the DOCUMENT, not to the component. Frozen at h3, an empty state at the top of a page jumps h1 → h3 and axe fails heading-order. Pass `p` when it is not a heading at all. |
| `description` | `ReactNode` | — | One line on why it is empty, or on what fills it. |
| `action` | `ReactNode` | — | The way out — usually a Button. An empty state with nothing to do next is a dead end. |
| `icon` | `IconName` | — | Glyph above the title, rendered at size xl. Defaults to `document--blank`. |
| `state` | `waiting_user \| waiting_approval \| waiting_dependency \| offline \| stale \| partial \| degraded` | — | Universal state (Part J). It derives no colour on purpose — an empty view is already neutral, and colouring it would be an alarm where there is only absence. What it does is set `data-state` and supply the default description, so “no connection” is not seven different sentences on seven screens. |
