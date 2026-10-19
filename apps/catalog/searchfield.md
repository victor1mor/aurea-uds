# SearchField

SearchField is an Input that carries the search glyph inside the pill. The icon is decorative — the accessible name still comes from the label, because a magnifier is not a word. Everything else is the native input: type, value, events.

## Usage

```tsx
import {SearchField} from "@aurea-uds/react";
```

```tsx
<SearchField size="sm" />
<SearchField />
<SearchField size="lg" />
```

- The glyph is inside the field and aria-hidden: decoration cannot be the accessible name.

- Native input underneath — value, onChange, onKeyDown and the rest behave as you expect.

- The icon is swappable (filter, catalog) for a field that filters rather than searches.

- For search that opens a list of results as you type, compose it with Combobox.

- Pair with a scope Select when the same query can run over different sets.

## Examples

### Plain search

One field, one placeholder saying what is searchable.

```tsx
<Field label="Search"><SearchField placeholder="Search components…" /></Field>
```

### Filter row

Search plus scope: the pair that heads most collections.

```tsx
<SearchField placeholder="Filter rows…" />
<Select aria-label="Category" defaultValue="all"><option value="all">All categories</option></Select>
```

### As a filter

Same control, different glyph: what it does to the list is filter, not search.

```tsx
<SearchField icon="funnel" placeholder="Filter by name…" />
```

### With an action

When the query costs something to run, give it an explicit button as well as Enter.

```tsx
<SearchField placeholder="Search the archive…" />
<Button variant="primary">Search</Button>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `IconName` | search | The glyph inside the field. Decorative — the accessible name comes from the label. |
| `placeholder` | `string` | — | What can be searched, e.g. "Search components…". |
| `value / defaultValue` | `string` | — | Controlled or uncontrolled. |
| `size` | `Responsive<FieldSize>` | md | The system's size step. The glyph shrinks with it. |
| `width` | `string` | — | The field width: "20rem" or "auto". Without it, 100% of the line as always. `size` changes height and type, never width. |
