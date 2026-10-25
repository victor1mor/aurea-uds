# PasswordField

A password field with a show/hide control that announces what it does.

## Usage

```tsx
import {PasswordField} from "@aurea-uds/react";
```

```tsx
<Field label="Password">
  <PasswordField autoComplete="new-password" />
</Field>
```

## Examples

### Sizes

The control sizes; the show/hide button keeps a 44 target on touch at every size.

```tsx
<PasswordField aria-label="Password" size="sm" />
<PasswordField aria-label="Password" size="md" />
<PasswordField aria-label="Password" size="lg" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `Responsive<FieldSize>` | md | The system's size step. It also picks the size of the show/hide button, so the two never disagree. |
| `defaultVisible` | `boolean` | false | Starts with the password showing. Uncontrolled — the component owns the state from there, because the toggle is a gesture, not application state. |
