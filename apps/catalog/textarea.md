# Textarea

Textarea is the control for text that runs long: several lines, resizable by the user, with the same skin as Input. Same rule as Input — no state of its own, every native attribute passes through, and the label belongs to Field.

## Usage

```tsx
import {Textarea, Field} from "@aurea-uds/react";
```

```tsx
<Textarea size="sm" />
<Textarea />
<Textarea size="lg" />
```

- rows sets the visible height; the user can still drag it taller and we do not fight that.

- Native attributes pass through: maxLength, required, readOnly, spellCheck, wrap.

- Same radius family as the other surfaces — a text area is not a pill, it is a panel of text.

- For code use CodeEditor: it brings a language, gutters and highlighting, which a textarea has not.

## Examples

### With hint

Three visible lines and a note about what belongs there.

```tsx
<Field label="Description" hint="Shown to every member.">
  <Textarea rows={3} />
</Field>
```

### With a limit

maxLength is enforced by the browser; say the number in the hint so it is not a surprise.

```tsx
<Field label="Summary" hint="Up to 140 characters">
  <Textarea rows={2} maxLength={140} />
</Field>
```

### With error

Rejected content: the message is the accessible description and marks the field invalid; the label stays the name.

```tsx
<Field label="Reason" error="Tell us a bit more."><Textarea rows={2} /></Field>
```

### Read-only

Selectable and copyable, not editable — for a log or a generated snippet you must not lose.

```tsx
<Textarea rows={3} readOnly defaultValue={log} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | `number` | 2 | Visible height in lines. The user can still resize it; the field does not fight that. |
| `value / defaultValue` | `string` | — | Controlled or uncontrolled. |
| `placeholder` | `string` | — | An example of the content, not the label. |
| `disabled` | `boolean` | false | Native disabled. |
| `className` | `string` | — | Extra classes. Every native attribute of the element passes through: name, required, autoComplete, pattern, min/max, and the rest. |
| `size` | `Responsive<FieldSize>` | md | The system's size step, NOT the HTML rows/cols. Height still grows with the content. |
| `variant` | `primary \| secondary` | primary | secondary is the neutral fill with no visible border, for a field inside a card. |
