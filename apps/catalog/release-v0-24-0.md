# v0.24.0

Comparison tables: sticky header and first column, a two-item mobile fit, a "differences only" switch, and styling for groups and best values.

`Table` gains four switches for comparison pages, plus styling for grouped rows and highlighted best values. A grouped spec sheet joins the catalog as a pattern. Nothing was removed or renamed, and no dependency was added.

## New

- **[`Table`](./table.html) `stickyHeader`**: the header stays at the top of the table box, which gets a maximum height (`--table-max-h`, 60vh) and scrolls inside. Same name and mechanism as `DataGrid`. It sticks to the box, not to the page, because the box also scrolls sideways.
- **`stickyFirstColumn`**: the first column (each row's name) stays in place when scrolling sideways, with an opaque background and a thin line at its end. With both switches, the corner sits on top.
- **`fit`**: removes the 720 minimum width, so two items fit on a 360-wide phone without scrolling sideways. Which two items to show is up to the site (for example with a `Select`).
- **`differencesOnly`**: hides the rows marked as identical (`<tr data-same>`). The site provides the toggle.
- **Comparison markup styling**, with no props: a group band is `<th scope="rowgroup" colSpan>` at the start of each `<tbody>` (styled like the header); the row name is `<th scope="row">`; the best value is `<td data-best>`, in bold. Mark it with a text label too (a `Badge` in the cell), because color alone is not enough. The `Table` entry declares the `best` and `same` states.
- **Catalog patterns**: a spec sheet in groups (a `Card` per group with a title and a `DataList`, in a `Grid` that stacks on phones), and three `Table` patterns: comparison with groups and best value, two items on a phone, and "differences only".

## Changed

- **`<th scope="row">` in the table body** no longer uses the header styling (small uppercase text on the header background). It is now body text in medium weight.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.24.0 @aurea-uds/core@0.24.0 @aurea-uds/fonts@0.24.0 @aurea-uds/icons@0.24.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.24.0
```
