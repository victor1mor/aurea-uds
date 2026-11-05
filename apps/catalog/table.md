# Table

Presents rows and columns of data — also a comparison table: groups of rows, the row's name pinned while scrolling sideways, the header pinned while scrolling down, the best value marked and a 'differences only' switch. Every cell has tabular figures, so price and year columns line up.

## Usage

```tsx
import {Table} from "@aurea-uds/react";
```

```tsx
<Table caption="Team">
  <thead><tr><th>Name</th><th>Role</th></tr></thead>
  <tbody>
    <tr><td>Messenger</td><td>Owner</td></tr>
    <tr><td>Analyst</td><td>Editor</td></tr>
  </tbody>
</Table>
```

## Examples

### Rows

variant="rows" drops the frame: each row is a capsule, 4 apart, grey on hover; the row the app marked with data-selected is yellow. It fits the width.

```tsx
<Table variant="rows" caption="Members">
  <thead><tr><th>Name</th><th>Role</th></tr></thead>
  <tbody>
    <tr><td>Messenger</td><td>Owner</td></tr>
    <tr data-selected=""><td>Analyst</td><td>Editor</td></tr>
    <tr><td>Curator</td><td>Viewer</td></tr>
  </tbody>
</Table>
```

### Striped

striped gives every other body row a fill — the 1st, the 3rd — so the eye can follow a row across a wide table. It works with both variants; in rows, the striped row takes the 16 corner.

```tsx
<Table variant="rows" striped caption="The three attributes">
  <thead><tr><th>Attribute</th><th>Values</th></tr></thead>
  <tbody>
    <tr><td>data-theme</td><td>light, dark</td></tr>
    <tr><td>data-density</td><td>compact, comfortable, spacious</td></tr>
    <tr><td>data-brand</td><td>ember, sun, honey…</td></tr>
  </tbody>
</Table>
```

### Dividers

dividers draws a light line between the body rows, none after the last — the frame stays and nothing moves. Without it, the rows are told apart by the white of the cells alone.

```tsx
<Table dividers caption="Team, with dividers">
  <thead><tr><th>Name</th><th>Role</th></tr></thead>
  <tbody>
    <tr><td>Messenger</td><td>Owner</td></tr>
    <tr><td>Analyst</td><td>Editor</td></tr>
    <tr><td>Curator</td><td>Viewer</td></tr>
  </tbody>
</Table>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `caption` | `ReactNode` | — | Rendered as a real <caption>, and when it is a string it also becomes the accessible name of the scroll region around the table. Without it the region falls back to "Table". |
| `stickyHeader` | `boolean` | false | The header stays at the top of the table's box while the body scrolls inside it — the same name and mechanism as DataGrid. The box gets a ceiling, `--table-max-h` (60vh by default), set in CSS: a box with no ceiling never scrolls inside itself. It pins to the box, not to the page: the box also scrolls sideways, and a sticky element only sticks to its nearest scroll container. |
| `stickyFirstColumn` | `boolean` | false | The first column — the name of each row — stays put while the table scrolls sideways, on an opaque background so the rest slides under it, with a hairline at its end. With stickyHeader too, the corner stays above both. |
| `fit` | `boolean` | false | The table fits its box, without the 720px minimum that makes a wide table scroll sideways. This is what lets a comparison of TWO items fit a 360px phone with no sideways scroll; which two is the page's choice (a Select above the table). |
| `differencesOnly` | `boolean` | false | The 'differences only' view — hides the rows the page marked as identical with <tr data-same>. The table does not compare cells itself; the page knows which rows are equal and owns the switch. |
| `dividers` | `boolean` | false | A light line between the body rows, none after the last — the frame stays. The line is the text color at 10%, the same light line as the outline card, and no measurement changes: the cell's bottom border already exists and only gains a color. A named exception to the no-line rule, drawn only when the app asks for it. No effect with variant="rows", and the Ember brand stays without it. |
| `variant` | `"default" \| "rows"` | "default" | rows drops the frame: each row is a 54 capsule, 4 apart; --fill-1 on hover; a row with data-selected (the one the app marked) the yellow at 14%. The head in uppercase code font, muted, without fill or column dividers. It fits the width. |
| `striped` | `boolean` | false | Gives every other body row a fill — the 1st, the 3rd and so on — so the eye can follow a row across a wide table. Works with both variants; in rows, the striped rows take the 16 corner. It is a fill, not a line. |
| `children` | `ReactNode` | — | The <thead> and <tbody>, written by you. This is the presentational table; the one that sorts, filters and pages is DataGrid. |
| `className` | `string` | — | On the <table>. The wrapper around it is focusable (tabIndex 0) so a table wider than the screen can be scrolled with the keyboard, not only by dragging. |
