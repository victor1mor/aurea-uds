# Card

Floating surface that groups related content.

## Usage

```tsx
import {Card} from "@aurea-uds/react";
```

```tsx
<Card>
  <Card.Header>
    <Card.Title>A floating surface</Card.Title>
    <Card.Description>Radius 22px, no line, no shadow stack.</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>The parts are optional: a card can hold anything.</p>
  </Card.Content>
  <Card.Footer>
    <Button variant="primary">Save</Button>
    <Button>Cancel</Button>
  </Card.Footer>
</Card>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `base \| raised \| interactive \| inset \| outline \| selected \| danger \| contrast` | base | Which surface it is. `interactive` is the only one that answers the pointer, so use it only when the whole card really is a target; `inset` recesses instead of floating, which is what a panel inside a card wants. `contrast` stands out from the screen in both themes: in the light theme it is the dark theme's card, with no outline; in the dark theme it is the regular card with a yellow outline. Inside it the whole dark theme applies (data-theme="dark" on the card), so every child adjusts by itself. Do not use it in a list of choices: in the dark theme its outline is close to `selected`. `outline` has no fill of its own — it takes the colour of whatever it sits on — and keeps only the line around it: the big showcase box of a documentation home page. |
| `children` | `ReactNode` | — | The content. Padding comes from --card-pad and the 22px radius from --radius-card; neither is a prop, because the floating surface is the identity of the system. |
| `render` | `ReactElement` | — | The ELEMENT the card renders as, with the Aurea surface merged into it. Required when variant is "interactive": a card that is a target has to be a real target — <button> for an action, <a href> for navigation — and only you know which. tabIndex on a <div> would give focus with no role, no key and no accessible name. |
| `accent` | `brand \| success \| info \| warning \| danger` | — | A colour stroke on the top edge, --accent-width (4) tall, in the tone's FILL colour, the same in both themes. It is decoration: the card's own title says the subject, so the stroke carries no information of its own. The other sides keep the regular 1px border, and the stroke wins over `selected`, `danger` and the `contrast` outline. |
| `padding` | `"normal" \| "none"` | "normal" | none removes the inner padding so media bleeds to the edge; the 22 radius stays and clips the media. |
| `orientation` | `"vertical" \| "horizontal"` | "vertical" | `horizontal` is the list mode: Card.Media on the left at thumbnail width (96, --space-24) and the content beside it. |
| `Card.Media` | `component` | — | The card's media part. Vertical, as first child, it bleeds to the top and side edges; horizontal, it sits on the left inside the padding, with the house's concentric radius (ADR-0033). |
| `Card.Header` | `component` | — | The header: the title and the description, together. 12 between the parts. |
| `Card.Title` | `component` | — | The card's title — an h3, 14/24 medium, as the reference. 12 between the parts. |
| `Card.Description` | `component` | — | The line under the title, 14/20 muted. 12 between the parts. |
| `Card.Content` | `component` | — | The body: a column with 4 between the items. 12 between the parts. |
| `Card.Footer` | `component` | — | The footer: a row (the buttons), 8 between them. 12 between the parts. |
