# CheckboxGroup

CheckboxGroup is a set of checkboxes under one label, with a description and an error. It keeps the list of what is checked: each Checkbox inside says its own value, and the group hands it the checked state and the change.

## Usage

```tsx
import {CheckboxGroup, Checkbox} from "@aurea-uds/react";
```

```tsx
<CheckboxGroup label="Your interests" description="Choose all that apply" name="interests">
  <Checkbox label="Coding" value="coding" description="Building software" />
  <Checkbox label="Design" value="design" description="Creating interfaces" />
  <Checkbox label="Writing" value="writing" description="Content creation" />
</CheckboxGroup>
```

- role="group" named by the label; the description and the error are read with it.

- value / defaultValue / onValueChange work on the list of checked values.

- name and disabled reach every checkbox; with an error, each one is marked invalid.

- Each checkbox keeps its own description, aligned with its text.

## Examples

### With an error

The error closes the group, and every checkbox is marked invalid.

```tsx
<CheckboxGroup label="Notifications" required error="Pick at least one channel">
  <Checkbox label="E-mail" value="email" />
  <Checkbox label="SMS" value="sms" />
</CheckboxGroup>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | REQUIRED. The group's name. |
| `description` | `ReactNode` | — | Help text under the label, read by screen readers with the group. |
| `error` | `ReactNode` | — | The error at the end; each checkbox gets aria-invalid. |
| `value / defaultValue` | `string[]` | — | The values of the checked boxes. Each Checkbox inside says its own value. |
| `onValueChange` | `(value: string[]) => void` | — | Called with the new list. |
| `name` | `string` | — | The name of every checkbox, for the form. |
| `disabled` | `boolean` | false | Disables every checkbox inside. |
| `required` | `boolean` | false | The red asterisk after the label, like Field. |
