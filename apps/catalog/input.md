# Input

Input is the control and nothing else: one line of value, in a pill. It adds no state, and every native attribute passes through — type, required, pattern, autoComplete and inputMode behave exactly as the platform behaves. One exception, and it is deliberate: `size` is the system step (sm/md/lg), not the HTML character count. Width is CSS. The label, the hint and the error belong to Field.

## Usage

```tsx
import {Input} from "@aurea-uds/react";
```

```tsx
<Card>
  <Field label="Project name"><Input variant="secondary" placeholder="Aurea" /></Field>
</Card>
```

- Native attributes pass through: type, required, pattern, min, max, step, autoComplete, inputMode.

- `size` is ours, not the HTML attribute: sm, md, lg — the same steps as Button.

- type="date", "time", "color" and "file" use the browser's own widget — themed by tokens, not rebuilt.

- No internal state: controlled or uncontrolled is your call, as in plain React.

- The focus ring is the system's, and it never relies on colour alone.

- Pair with Field for the label; alone it is a control with no name, which is a bug.

## Examples

### Sizes

Three steps, and they are the SAME steps as the button: a sm field and a sm button on one row measure the same, in all three densities. md is the default and needs no prop.

```tsx
<Input size="sm" placeholder="Small" />
<Input placeholder="Medium (default)" />
<Input size="lg" placeholder="Large" />
```

### Text

The plain case. The placeholder is an example of the value, never a stand-in for the label.

```tsx
<Field label="Full name"><Input placeholder="Ada Lovelace" /></Field>
```

### Types

Email, password and number, all native — the keyboard on a phone changes with the type.

```tsx
<Input type="email" autoComplete="email" />
<Input type="password" autoComplete="current-password" />
<Input type="number" min={1} max={99} />
```

### Date and time

The browser's own picker, wearing our tokens. Rebuilding a calendar would mean rebuilding every locale with it.

```tsx
<Field label="Starts"><Input type="date" /></Field>
<Field label="At"><Input type="time" /></Field>
```

### Formatting a plate or a document

formatOnBlur normalises the value after focus leaves — it never masks while you type. A live mask makes the screen reader announce what was typed while the field shows something else; the US federal design system ships its input mask with a recorded WCAG 2.1 AA failure, and one of the references dropped masked date fields for the same reason. Type and paste freely; the formatted text becomes the field's own value, so there is nothing painted over it and nothing hidden from a form.

```tsx
const plate = v => {
  const raw = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return raw.length > 3 ? `${raw.slice(0, 3)}-${raw.slice(3, 7)}` : raw;
};

<Field label="Plate" hint="Type it however you like — it tidies up when you leave">
  <Input formatOnBlur={plate} defaultValue="ABC-1D23" />
</Field>
```

### Disabled and read-only

Disabled is not submitted and is skipped by the keyboard; read-only is submitted and still reachable.

```tsx
<Input defaultValue="Pro" disabled />
<Input defaultValue="acme-42" readOnly />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `string` | text | Native type. date, time, color and file use the browser's own widget, themed by tokens. |
| `value / defaultValue` | `string \| number` | — | Controlled or uncontrolled, as in plain React. The component adds no state of its own. |
| `placeholder` | `string` | — | An example of the value, never a substitute for the label. |
| `disabled` | `boolean` | false | Native disabled: skipped by the keyboard and not submitted. |
| `formatOnBlur` | `(value: string) => string` | — | Normalises the value AFTER focus leaves the field — a licence plate, a document number, a phone. It deliberately does not mask while you type: another design system ships its input mask with a recorded WCAG 2.1 AA failure, one of the references dropped masked date fields because the text leaks between sections, and a live mask makes the screen reader announce what was typed while the field shows something else. Aurea supplies the moment; the format stays yours, because plates and documents are country rules. The formatted text becomes the element's own value — nothing is painted over it — and your onChange is called with it, so controlled fields work. |
| `className` | `string` | — | Extra classes on the field. Every native attribute of the element passes through: name, required, autoComplete, pattern, min/max, and the rest. |
| `size` | `Responsive<FieldSize>` | md | The system's size step (sm/md/lg), NOT the HTML size attribute — that one is a width in characters and it is deliberately shadowed here, because two meanings for one prop name is worse than losing the native one. |
| `variant` | `primary \| secondary` | primary | secondary is the neutral fill with no visible border, for a field inside a card. |
