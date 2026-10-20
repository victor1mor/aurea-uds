# AccessGate

Hides an action the user cannot take, or shows it inert with the reason.

## Usage

```tsx
import {AccessGate} from "@aurea-uds/react";
```

```tsx
<AccessGate allowed={can("publish")}>
  <Button variant="primary">Publish</Button>
</AccessGate>

<AccessGate allowed={can("publish")} mode="disable" reason="Only an editor can publish">
  <Button variant="primary">Publish</Button>
</AccessGate>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `allowed` | `boolean` | — | REQUIRED, and it is an ANSWER, not a question: Aurea holds no rules, roles or policies. You decide, from whatever your app uses, and pass the result. THIS IS NOT SECURITY — hiding a button stops nobody from calling the API. The server is what refuses; this only avoids offering what would be refused. |
| `children` | `ReactElement` | — | REQUIRED. A single element — the action being gated. When allowed, it comes through untouched, with no wrapper. |
| `mode` | `hide \| disable` | hide | hide removes the action from the DOM, which is what an authorization library does and the right default when the action would mean nothing to this user. disable keeps it visible and inert, for when they should know it exists — an admin-panel kit is the reference that lets you pick, and the pick is the whole reason this component exists. |
| `reason` | `ReactNode` | — | REQUIRED when mode is disable, and the type enforces it: an action that says "no" without saying why is worse than one that is simply absent. It is shown in a Tooltip on the inert control. |
| `fallback` | `ReactNode` | — | Only in hide mode: what takes the place of the action. Use it for a read-only rendering of the same information, not for a second "you cannot do this" message. |
