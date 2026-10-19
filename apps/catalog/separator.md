# Separator

Separator is the rule between things: a full-width hairline, or a 1px column between items in a row. It is what a sidebar puts between sections and what a row of actions puts between groups.

## Usage

```tsx
import {Separator} from "@aurea-uds/react";
```

```tsx
<Card>
  <Stack>
    <p>Account</p>
    <Separator />
    <p>Billing</p>
  </Stack>
</Card>
```

- It is a native <hr> and ships NO JavaScript. The role comes from the element, not from an attribute — an <hr> already carries role="separator" implicitly, and writing it would be redundant ARIA. The APG's own warning is that no ARIA beats bad ARIA.

- aria-orientation appears ONLY on the vertical one. The separator role already defaults to horizontal, so writing it there would repeat the platform out loud for nothing.

- It draws with `background` on a 1px box, not with `border` — the thickness then does not depend on which border side someone wrote, and one class serves both orientations.

- The vertical one stretches to the tallest sibling AND carries a floor: inside a parent with no height of its own it would otherwise measure zero and disappear while still existing in the DOM. There is a test for exactly that case.

- Inside a Toolbar use ToolbarSeparator instead — that one takes part in the roving tabindex the engine manages. This one is for everything else.

## Examples

### Between items in a row

The vertical rule stretches to the tallest sibling. Useful between counts, authors, timestamps — the places a bullet would go.

```tsx
<Cluster>
  <span>12 open</span>
  <Separator orientation="vertical" />
  <span>4 closed</span>
  <Separator orientation="vertical" />
  <span>updated today</span>
</Cluster>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `Responsive<'horizontal' \| 'vertical'>` | horizontal | Horizontal is a full-width hairline; vertical is a 1px column that stretches to the tallest sibling, with a floor so it cannot measure zero inside a flex row. BEHAVIOURAL and not visual: the resolved value goes to the engine, which publishes data-orientation and, in the vertical case, aria-orientation — the horizontal one is role="separator"'s implicit default and announcing it would be noise. This is why the component is client-side: an attribute cannot come from a CSS class. |
| `className` | `string` | — | Merged onto the separator element. |
| `spacing` | `"none" \| "tight" \| "normal" \| "loose"` | "none" | The space on both sides of the line, in the same three steps as the layout primitives' gap. On a vertical separator the space goes to the sides. |
