# Label

The field label on its own, for when you are not using Field.

## Usage

```tsx
import {Label} from "@aurea-uds/react";
```

```tsx
<Label htmlFor="workspace">Workspace</Label>
<Input id="workspace" defaultValue="acme" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `htmlFor` | `string` | — | The id of the control this labels. Without it the label names nothing — use Field when you want that wiring done for you. |
