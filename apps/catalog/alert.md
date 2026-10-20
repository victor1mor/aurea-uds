# Alert

Inline message that stays in context.

## Usage

```tsx
import {Alert} from "@aurea-uds/react";
```

```tsx
<Alert variant="info" title="Heads up">Contextual information.</Alert>
<Alert variant="danger" title="Upload failed">The file exceeds 10 MB.</Alert>
<Alert title="You have 2 credits left" action={<Button variant="tertiary">Upgrade</Button>}>
  Get a paid plan for more credits
</Alert>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `info \| success \| warning \| danger \| accent` | info | Tone and, with it, the live region: `danger` renders role="alert", which interrupts the screen reader; the others render role="status", which waits for a pause. `accent` is the reference library's accent, in Aurea's link colour. The state colour paints the icon and the title, on the card surface. Colour is never the only signal — what carries the meaning is the text. |
| `title` | `ReactNode` | — | Rendered as a <strong> above the body. Optional on purpose: a one-line alert reads better without one. |
| `children` | `ReactNode` | — | The message. An Alert stays in the reading flow, in context — a page-width warning is a Banner and a transient one is a Toast. |
| `state` | `waiting_user \| waiting_approval \| waiting_dependency \| offline \| stale \| partial \| degraded` | — | Universal state (Part J) — an axis of its own alongside `variant`, because the two answer different questions: `variant` is how serious this is, `state` is what is happening. Merging them would put “out of date” next to “danger” and force the caller to pick one. It sets `data-state`, derives the severity when no `variant` is given — waiting states inform, the rest warn, and none of the seven is `danger`, because in all seven the screen still works — and supplies the message when there are no children. |
| `icon` | `IconName` | — | Overrides the glyph. The icon is a FUNCTION of the variant by default, because a system that makes you remember which glyph means "danger" ends up with four answers to the same question. |
| `action` | `ReactNode` | — | The alert's button (Upgrade, Undo), as the reference: after the text and before the X, in the middle; on a phone (below 640) it goes under the text, in the same column. |
| `onDismiss` | `() => void` | — | Shows the X (the CloseButton) and is called when it is pressed. |
