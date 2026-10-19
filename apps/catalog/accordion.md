# Accordion

Accordion stacks questions that open to show their answer. One opens at a time, like the reference's: opening one closes the other. It is built on the browser's own <details>, so it opens without JavaScript.

## Usage

```tsx
import {Accordion} from "@aurea-uds/react";
```

```tsx
<Accordion items={[
  {id: "ship", title: "How do I install it?", content: "Install the packages…"},
  {id: "theme", title: "Can I change the colours?", content: "Every visual value is a token…"},
]} />
```

- No box around it: a hairline between the items, none after the last.

- The question has 16 on every side; the arrow at the end turns when it opens.

- The hover highlight is a capsule — Aurea's corner on the reference's measures.

- multiple lets several stay open; defaultValue opens items from the start.

- variant="surface" puts it in a card. A disabled item is announced and skipped by Tab.

## Examples

### Surface

In a card, with the line at 94% and the hover on the neutral fill.

```tsx
<Accordion variant="surface" items={items} />
```

### Several open

multiple keeps each item independent.

```tsx
<Accordion multiple defaultValue={["ship", "native"]} items={items} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{id: string; title: ReactNode; content: ReactNode}>` | — | The sections. Built on native <details>/<summary>, so opening, closing, keyboard and find-in-page come from the browser and the component ships no JavaScript at all. Several can be open at once: exclusivity would need the `name` attribute, and hiding what someone just opened is rarely what they wanted. |
| `variant` | `default \| surface` | default | surface puts the items in a card, with the line at 94% and the neutral hover. |
| `multiple` | `boolean` | false | Lets several items stay open. Without it, opening one closes the other, as in the reference. |
| `defaultValue` | `string[]` | — | The ids of the items that start open. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin. |
