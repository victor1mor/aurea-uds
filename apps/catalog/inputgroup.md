# InputGroup

The box that looks like a field and holds the control plus whatever is glued to it.

## Usage

```tsx
import {InputGroup} from "@aurea-uds/react";
```

```tsx
<InputGroup>
  <InputGroupAddon>https://</InputGroupAddon>
  <Input placeholder="acme.dev" />
</InputGroup>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `string` | — | Takes the group out of 100%: "20rem" for a measure, "auto" for the content size. With it the group also stops growing in a row. |
