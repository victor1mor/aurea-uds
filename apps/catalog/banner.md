# Banner

Prominent message spanning a wide region.

## Usage

```tsx
import {Banner} from "@aurea-uds/react";
```

```tsx
<Banner variant="success" title="Saved" icon="check" onDismiss={() => setShown(false)}>
  Your changes are live.
</Banner>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `info \| success \| warning \| danger` | info | Tone, and the same live-region rule as Alert: `danger` is role="alert", the rest role="status". |
| `title` | `ReactNode` | — | Rendered as a <strong> above the body. |
| `icon` | `IconName` | — | Glyph in the leading column. Leave it out and the column still holds its place — an empty span keeps the three-column grid — so banners stacked together stay aligned. |
| `onDismiss` | `() => void` | — | Passing it is what draws the close button. Without it the banner cannot be dismissed, which is the right default for something the reader has to see. |
| `children` | `ReactNode` | — | The body, under the title. |
| `state` | `waiting_user \| waiting_approval \| waiting_dependency \| offline \| stale \| partial \| degraded` | — | Universal state (Part J) — same axis and same derivation as on Alert: `variant` is severity, `state` is the condition. It sets `data-state`, picks the severity when no `variant` is given, and supplies the message when there are no children. A banner is the page-width place to say “no connection” or “working with reduced capability”, which is why it carries the same vocabulary as the inline alert instead of a second one. |
