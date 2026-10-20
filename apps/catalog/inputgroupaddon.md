# InputGroupAddon

What sits glued to the control inside an InputGroup: a glyph, a prefix, a button.

## Usage

```tsx
import {InputGroupAddon} from "@aurea-uds/react";
```

```tsx
<InputGroupAddon side="start" layout="inline"><Icon name="magnifying-glass" /></InputGroupAddon>
<InputGroupAddon side="end" layout="inline">.00</InputGroupAddon>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `side` | `AddonSide` | start | Which end of the group the addon is glued to. It is LOGICAL, not physical: in RTL "start" is the right-hand side. |
| `layout` | `Responsive<AddonLayout>` | inline | "block" puts the addon on its own line above or below the control instead of beside it — the shape a filter bar takes when it runs out of width. Responsive, so it can be inline on a wide screen and block on a narrow one. |
