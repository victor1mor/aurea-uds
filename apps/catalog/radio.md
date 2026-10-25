# Radio

Radio is one-of-many: the options share a name, and choosing one releases the other. What groups them is the name attribute — without it every radio is its own group and two can be on at once, which is the most common bug with this control.

## Usage

```tsx
import {Radio} from "@aurea-uds/react";
```

```tsx
<Radio name="billing" label="Monthly" defaultChecked />
<Radio name="billing" label="Yearly" />
<Radio name="billing" label="Lifetime" />
```

- The shared name is what makes a group. Same name, one choice; different names, no group at all.

- The label is inside the <label>, so the words are part of the target.

- Native keyboard: the arrows move within the set and Tab leaves it — the browser's own behaviour.

- One of the options should start selected; a group with nothing chosen has no default to submit.

- For two options that apply immediately, consider SegmentedControl or Switch instead.

## Examples

### With a description

The muted line under each name, as the Checkbox has. For a named group with an error, use RadioGroup.

```tsx
<Radio name="plan" label="Basic" description="For one person" defaultChecked />
<Radio name="plan" label="Pro" description="For a small team" />
```

### With a disabled option

The unavailable choice keeps its place, so the list never reorders under the arrows.

```tsx
<Radio name="region" label="Europe" defaultChecked />
<Radio name="region" label="South America" disabled />
```

### Inside a Field

The Field names the question; each Radio names an answer.

```tsx
<Field label="Visibility" hint="Who can open this workspace">
  <div className="stack">…radios…</div>
</Field>
```

### Sizes

The system's size step — sm, md and lg, the same scale as the fields beside it. md is the default.

```tsx
<Radio name="size" label="Small" size="sm" />
<Radio name="size" label="Medium" defaultChecked />
<Radio name="size" label="Large" size="lg" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | REQUIRED. One radio per option, all sharing the same name. |
| `labelHidden` | `boolean` | false | Keeps the label in the DOM but out of sight, as the Checkbox does — for a row of bare controls, where the group names them. |
| `description` | `ReactNode` | — | A muted line under the label, as the Checkbox and the reference — then the label is set in bold. |
| `name` | `string` | — | What groups the set. Without it every radio is its own group and two can be on. |
| `checked / defaultChecked` | `boolean` | — | Controlled or uncontrolled. |
| `disabled` | `boolean` | false | Native disabled; the option keeps its place in the list. |
| `size` | `Responsive<FieldSize>` | md | The system's size step. |
