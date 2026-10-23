# Field

Field is the label, the help text and the error of a control, bound together. It gives one unnamed control a real <label for> and a matching id, so clicking the label focuses it and the screen reader gets a precise name. Field organises; Input is the control. That distinction is why they are two components.

## Usage

```tsx
import {Field, Input} from "@aurea-uds/react";
```

```tsx
<Field label="E-mail" required><Input type="email" /></Field>
```

- One unnamed native control or documented Aurea control gets a real <label for> and a matching id; arbitrary wrappers become groups.

- hint and error are descriptions via aria-describedby; they never become the accessible name.

- error also marks the focal control invalid — a red field alone tells a colour-blind user nothing.

- A child with its own accessible name (label or ARIA), or several children, makes Field a named group instead of adding a second label.

- The label is required by the type. A field with no label is not a field, it is a box.

## Examples

### With hint

Label, control and help in one block. The hint explains, it does not repeat the label.

```tsx
<Field label="Email" hint="We never share it.">
  <Input type="email" placeholder="you@example.com" />
</Field>
```

### With error

The error joins the hint in the accessible description and marks the control invalid. Never colour alone.

```tsx
<Field label="Workspace slug" error="Already taken.">
  <Input defaultValue="aurea" />
</Field>
```

### Any control

A single unnamed control gets a real label; a control with its own accessible name stays named by itself inside the Field group.

```tsx
<Field label="Region"><Select>…</Select></Field>
<Field label="Notes"><Textarea rows={3} /></Field>
<Field label="Volume"><Range defaultValue={60} /></Field>
```

### Required and disabled

State belongs to the control, not to the wrapper: Field only shows what the control already is.

```tsx
<Field label="Name" hint="Required"><Input required /></Field>
<Field label="Plan"><Input defaultValue="Pro" disabled /></Field>
```

### Label beside the control

orientation="horizontal" puts the label to the left of the control — the settings-form row. The error still falls under the control, because it talks about the value.

```tsx
<Field label="Display name" orientation="horizontal"><Input defaultValue="Ana Prado" /></Field>
<Field label="Handle" orientation="horizontal" error="Already taken."><Input defaultValue="ana" /></Field>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | REQUIRED. This is the accessible NAME of the control, and nothing else is. Clicking it focuses the control — Field wires htmlFor to the id it gives the child, so there is no id to keep in sync. |
| `hint` | `ReactNode` | — | Help text beside the label. Announced as DESCRIPTION via aria-describedby — it is deliberately outside the name, so a screen reader says "E-mail" and not "E-mail we use it to sign you in". |
| `error` | `ReactNode` | — | Shown below the control when the value is rejected, and joined to hint in the description. Also sets aria-invalid on the control: a red border alone says nothing to a colour-blind or blind user. |
| `id` | `string` | auto | The id of the CONTROL, not of the wrapper — it is what htmlFor points at. Omit it and Field generates one. An id already declared on the child wins over this. |
| `children` | `ReactNode` | — | The control. Field owns the name for a single child that does not name itself: Input, Select, Textarea, Range, Combobox, MultiCombobox. Pass a control that carries its own label, aria-label or aria-labelledby (including Switch, Checkbox and Radio), or several children, and Field becomes a named group instead — see a11y.apg. Controls with a label of their own and their own layout (NumberField, OTPField, SegmentedControl, Toggle) are not Field children. |
| `name` | `string` | — | Ties this field to a key in the Form's errors. With it, the child becomes the form's control and receives aria-invalid plus the message id; without it, Field behaves exactly as it did before — the addition is deliberately additive, because this component's semantics were paid for with an audit (AUD-0001) and are not touched to add a feature. |
| `orientation` | `Responsive<FieldOrientation>` | vertical | Label to the left of the control instead of above it — the settings-form row. It is a GRID and not a flex row on purpose: in a row the error message would become a third column beside the control, and it talks about the VALUE, so it has to fall under the control. |
| `labelWidth` | `"auto" \| string` | — | Width of the label column when orientation is horizontal. "auto" sizes it to the label; any CSS length fixes it. Without it the column is the --field-label-width token (12rem), which on a 375px phone leaves a Combobox no room for its value. |
| `description` | `ReactNode` | — | Help text that needs a sentence: it sits under the control and does not share the label's line. `hint` stays a short note beside the label. It is the reference library's Description and the `description` Checkbox already has. Joins aria-describedby in screen order: hint, description, error. |
| `required` | `boolean` | false | The red asterisk after the label (hidden from screen readers) and required on the control — which is what announces it. |
