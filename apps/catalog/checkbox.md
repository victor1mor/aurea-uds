# Checkbox

Checkbox is a yes-or-no that waits: it changes a value the form will submit later. A Switch applies immediately — that is the whole difference, and it decides which one you want. The label is required and lives inside the <label>, so the entire row is the target, not a 16px box.

## Usage

```tsx
import {Checkbox} from "@aurea-uds/react";
```

```tsx
<Checkbox label="Public workspace"
  description="Anyone with the link can read it." />
```

- The label is part of the target: clicking the words toggles it, which matters on a phone.

- description adds a second line for the consequence, without inflating the label.

- labelHidden keeps the name for the screen reader and takes it off screen — for a selection column.

- indeterminate is supported by the native input for a partially selected group.

- Checkbox waits for submit; Switch applies now. Pick by the moment of effect, not by the look.

## Examples

### A list of options

Many-of-many. Each one is independent — for one-of-many use Radio.

```tsx
<Checkbox label="Email" defaultChecked />
<Checkbox label="Push" />
<Checkbox label="Weekly digest" defaultChecked />
```

### Hidden label

A table selection column: the per-row name stays for the reader, off screen, so the column stays narrow.

```tsx
<Checkbox label="Select Analyst" labelHidden />
```

### Disabled

Unavailable but still readable — the reason belongs somewhere on the screen.

```tsx
<Checkbox label="Audit log" disabled />
<Checkbox label="SSO" defaultChecked disabled />
```

### Sizes

The system's size step — sm, md and lg, the same scale as the fields beside it. md is the default.

```tsx
<Checkbox label="Compact rows" defaultChecked size="sm" />
<Checkbox label="Comfortable rows" defaultChecked />
<Checkbox label="Spacious rows" defaultChecked size="lg" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | REQUIRED, and inside the <label>: the whole row is the target, not just the 16px box. |
| `labelHidden` | `boolean` | false | Keeps the label in the DOM but out of sight — for a table selection column. |
| `description` | `ReactNode` | — | Second line under the label, for the consequence of ticking it. |
| `checked / defaultChecked` | `boolean` | — | Controlled or uncontrolled. For a third state use indeterminate on the input. |
| `size` | `Responsive<FieldSize>` | md | The system's size step. It is not the HTML size attribute, which does not exist on a checkbox anyway. |
