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

## Examples

### With an error

Inside a Field with error, the whole group turns red and the field in the middle is named by the label and reads the message. Outside a Field, pass aria-invalid.

```tsx
<Field label="Website" error="Enter a full address">
  <InputGroup>
    <InputGroupAddon>https://</InputGroupAddon>
    <Input defaultValue="example" />
  </InputGroup>
</Field>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `string` | — | Takes the group out of 100%: "20rem" for a measure, "auto" for the content size. With it the group also stops growing in a row. |
| `aria-invalid` | `boolean \| "true" \| "false"` | — | Goes to the field in the middle (not to the box): the group turns red like the other fields, and a screen reader hears "invalid". Inside a Field with error it arrives on its own; a field that says its own aria-invalid keeps it. Web only. |
| `aria-labelledby` | `string` | — | Goes to the field in the middle (not to the box). Inside a Field it arrives on its own, pointing at the Field label; a field that sets its own aria-label or aria-labelledby keeps it. Web only. |
| `aria-describedby` | `string` | — | Goes to the field in the middle (not to the box), added to the one it already has. Inside a Field it arrives on its own, pointing at the hint and the error message. Web only. |
