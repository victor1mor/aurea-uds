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

- indicator="plus" and size="lg" make the FAQ row: a plus that turns into ×, 60 tall.

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

### Plus, large

indicator="plus" swaps the arrow for a plus in a circle, which turns into a yellow × when the item opens; size="lg" is the 60-tall row with body-size text. One accordion per question, as in a FAQ.

```tsx
<Accordion variant="surface" indicator="plus" size="lg" defaultValue={["ship"]} items={[item]} />
```

### On its side

orientation="horizontal" stands the items side by side, each a card; a closed one is 104 wide and the open one takes the rest. One is always open. The height is the parent's; under a 47.5rem container it becomes the upright accordion.

```tsx
<div style={{blockSize: "20rem"}}>
  <Accordion orientation="horizontal" defaultValue={["ship"]} items={items} />
</div>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{id: string; title: ReactNode; content: ReactNode}>` | — | The sections. Built on native <details>/<summary>, so opening, closing, keyboard and find-in-page come from the browser and the component ships no JavaScript at all. Several can be open at once: exclusivity would need the `name` attribute, and hiding what someone just opened is rarely what they wanted. |
| `variant` | `default \| surface` | default | surface puts the items in a card, with the line at 94% and the neutral hover. |
| `multiple` | `boolean` | false | Lets several items stay open. Without it, opening one closes the other, as in the reference. |
| `defaultValue` | `string[]` | — | The ids of the items that start open. |
| `indicator` | `chevron \| plus` | chevron | How opening is drawn: the arrow at the end, or a plus in a circle that turns 45° into a yellow × when the item opens (the FAQ of this site). |
| `size` | `md \| lg` | md | lg is the 60-tall row with body-size (16) text, 22 from the edge, for questions that stand alone. |
| `orientation` | `"vertical" \| "horizontal"` | "vertical" | horizontal is the accordion on its side: the items stand side by side, 12 apart, each a card (radius 22); a closed one is 104 wide and the open one takes the rest of the row. One open at a time, and the open one does not close on click. The height is the parent's. Under a 47.5rem container it becomes the upright accordion. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin. |
