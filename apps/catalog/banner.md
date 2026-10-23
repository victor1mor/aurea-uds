# Banner

Prominent message spanning a wide region. variant="consent" is the cookie notice, with the preferences window.

## Usage

```tsx
import {Banner} from "@aurea-uds/react";
```

```tsx
<Banner variant="success" title="Saved" icon="check" onDismiss={() => setShown(false)}>
  Your changes are live.
</Banner>
```

## Examples

### Variants

The same live-region rule as Alert: danger interrupts, the others wait. The cookie notice, consent, has a page of its own on the site.

```tsx
<Banner variant="info">A info banner.</Banner>
<Banner variant="success">A success banner.</Banner>
<Banner variant="warning">A warning banner.</Banner>
<Banner variant="danger">A danger banner.</Banner>
```

### Every state

The condition, apart from the severity. Without a variant, the state picks it; without children, it supplies the message.

```tsx
<Banner state="stale" />
<Banner state="partial" />
<Banner state="degraded" />
<Banner state="offline" />
<Banner state="waiting_user" />
<Banner state="waiting_approval" />
<Banner state="waiting_dependency" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `info \| success \| warning \| danger \| consent` | info | Tone, and the same live-region rule as Alert: `danger` is role="alert", the rest role="status". `consent` is the cookie notice: a region named by its h2, the text, and three buttons of the SAME weight — reject the non-essential, accept all, choose — then the confirmation, which takes the focus. Put it at the top of the page, before the skip link, and do not fix it to the screen. |
| `title` | `ReactNode` | — | Rendered as a <strong> above the body. On consent it is the h2 that names the region; without it, the strings' consentTitle. |
| `icon` | `IconName` | — | Glyph in the leading column. Leave it out and the column still holds its place — an empty span keeps the three-column grid — so banners stacked together stay aligned. |
| `onDismiss` | `() => void` | — | Passing it is what draws the close button. Without it the banner cannot be dismissed, which is the right default for something the reader has to see. On consent it is the "Hide this message" button of the confirmation; without it the notice hides itself. |
| `children` | `ReactNode` | — | The body, under the title. |
| `state` | `waiting_user \| waiting_approval \| waiting_dependency \| offline \| stale \| partial \| degraded` | — | Universal state (Part J) — same axis and same derivation as on Alert: `variant` is severity, `state` is the condition. It sets `data-state`, picks the severity when no `variant` is given, and supplies the message when there are no children. A banner is the page-width place to say “no connection” or “working with reduced capability”, which is why it carries the same vocabulary as the inline alert instead of a second one. |
| `categories` | `ConsentCategory[]` | [] | Only on consent: the categories of the preferences window, in order — {id, label, description?, required?}. Required ones are always on and have no switch; the others start OFF. |
| `value` | `ConsentChoice` | — | Only on consent: the choice already stored, {[id]: boolean}, so the person can come back and change it — show the notice again from a "Cookie settings" link. Without it, only the required categories are on. |
| `onConsent` | `(choice: ConsentChoice, action: "accept-all" \| "reject" \| "custom") => void` | — | Only on consent: the choice made, for the app to store and obey. Required categories always come as true. |
