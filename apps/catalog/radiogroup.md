# RadioGroup

RadioGroup is a set of radio options under one label, with a description and an error. It keeps the chosen value: each option says its own value, and the group hands it the checked state, the shared name and the change. The options are native radios, so Tab enters on the chosen one and the arrows move and choose.

## Usage

```tsx
import {RadioGroup, Radio} from "@aurea-uds/react";
```

```tsx
<RadioGroup label="Plan" description="You can change it later" name="plan" defaultValue="pro">
  <Radio value="basic" label="Basic" description="For one person" />
  <Radio value="pro" label="Pro" description="For a small team" />
  <Radio value="business" label="Business" description="For the whole company" />
</RadioGroup>
```

- role="radiogroup" named by the label; the description and the error are read with it.

- value / defaultValue / onValueChange, the same names as the native RadioGroup.

- orientation: vertical (16 before each option) or horizontal (16 between them), as the reference.

- Each option can carry a description; with an error, every option is marked invalid.

## Examples

### Horizontal

The options in a row, 16 apart.

```tsx
<RadioGroup label="Size" orientation="horizontal" defaultValue="m">
  <Radio value="s" label="Small" />
  <Radio value="m" label="Medium" />
  <Radio value="l" label="Large" />
</RadioGroup>
```

### Disabled

No option can be chosen.

```tsx
<RadioGroup label="Delivery" disabled defaultValue="standard">
  <Radio value="standard" label="Standard" />
  <Radio value="express" label="Express" />
</RadioGroup>
```

### With an error

The error closes the group, and every option is marked invalid.

```tsx
<RadioGroup label="Payment" required error="Choose how to pay">
  <Radio value="card" label="Card" />
  <Radio value="pix" label="Pix" />
</RadioGroup>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | REQUIRED. The group's visible name — what the screen reader announces for the group. |
| `labelHidden` | `boolean` | false | Keeps the group name in the DOM but out of sight, as the Checkbox does: the options start at the top, without the 16 that separated them from the name. |
| `description` | `ReactNode` | — | A line under the label, joined to the group by aria-describedby. |
| `error` | `ReactNode` | — | The error at the end; marks every option invalid. |
| `value / defaultValue` | `string` | — | The chosen option's value: controlled, or where it starts. |
| `onValueChange` | `(value: string) => void` | — | Called with the value of the option chosen. |
| `name` | `string` | the group's own | The name of every option, for a form. |
| `orientation` | `"vertical" \| "horizontal"` | "vertical" | vertical stacks the options with 16 before each; horizontal puts them in a row with 16 between them, as the reference. |
| `disabled` | `boolean` | false | No option can be chosen. |
| `invalid` | `boolean` | false | Paints every option invalid, as the native invalid; error already does it. |
| `required` | `boolean` | false | The asterisk on the label, and required on the options. |
| `RadioGroup.Item` | `component` | — | The option: the Radio (value, label, description, disabled). |
