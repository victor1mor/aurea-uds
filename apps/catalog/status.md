# Status

Status shows the operational condition of a thing — online, busy, offline. It is not a Badge: a Badge is a short metadata pill, Status says what state something is in, as a coloured dot plus a readable label.

## Usage

```tsx
import {Status} from "@aurea-uds/react";
```

```tsx
<Status variant="online">Online</Status>
<Status variant="busy">Busy</Status>
<Status variant="away">Away</Status>
<Status variant="offline">Offline</Status>
```

- The colour is never the only signal — the label states the condition (WCAG 1.4.1); the dot is decorative.

- offline is a hollow dot, so it never collapses onto neutral in the light theme.

- Operational names (online/busy/away) and semantic names (success/warning/danger) map to the same theme-aware tokens.

## Examples

### Status vs Badge

A Badge is a pill of metadata; a Status is a state on the line.

```tsx
<Status variant="online">Deployed</Status>
<Badge variant="success">v1.7.0</Badge>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `neutral \| online \| offline \| busy \| away \| running \| success \| warning \| danger \| info` | neutral | Which condition, and therefore which dot. The operational names (online/busy/away) and the semantic ones (success/warning/danger) map to the same theme-aware tokens — pick the vocabulary of your domain. |
| `children` | `ReactNode` | — | The label, and it is not optional in practice: it is what carries the meaning when the colour cannot. |
| `state` | `waiting_user \| waiting_approval \| waiting_dependency \| offline \| stale \| partial \| degraded` | — | Universal state (Part J) — an axis of its own alongside `variant`: the variant is the colour of the dot, the state is the condition. It sets `data-state` and, when no `variant` is given, derives one: `offline` keeps the hollow dot it has always had, the other six fall back to severity. With no children the label comes from the shared string table, so the same condition reads the same on every screen. |
