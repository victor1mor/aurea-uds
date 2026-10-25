# DataGrid

Interactive grid with navigation, sort and selection.

## Usage

```tsx
import {DataGrid} from "@aurea-uds/react/data-grid";
```

```tsx
<DataGrid
  label="Members"
  filterable
  data={[{name: "Messenger", role: "Owner"}, {name: "Analyst", role: "Editor"}]}
  columns={[
    {accessorKey: "name", header: "Name"},
    {accessorKey: "role", header: "Role"},
  ]}
/>
```

## Examples

### Every state

loading and error replace the rows; the other states keep the rows you already had and put the notice above them.

```tsx
<DataGrid label="Members, loading" data={members} columns={columns} state="loading" />
<DataGrid label="Members, error" data={members} columns={columns} state="error" />
<DataGrid label="Members, stale" data={members} columns={columns} state="stale" />
<DataGrid label="Members, partial" data={members} columns={columns} state="partial" />
<DataGrid label="Members, degraded" data={members} columns={columns} state="degraded" />
<DataGrid label="Members, offline" data={members} columns={columns} state="offline" />
<DataGrid label="Members, waiting_user" data={members} columns={columns} state="waiting_user" />
<DataGrid label="Members, waiting_approval" data={members} columns={columns} state="waiting_approval" />
<DataGrid label="Members, waiting_dependency" data={members} columns={columns} state="waiting_dependency" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `T[]` | — | The rows. Sorted, filtered and paged in memory by default; pass the `manual*` flags when the server already did that work and `data` is a single page. |
| `columns` | `Array<ColumnDef<T, any>>` | — | TanStack Table column definitions, re-exported from this subpath so you do not add the dependency yourself. |
| `getRowId` | `(row: T, index: number) => string` | — | Pass it whenever `selectable` is on. Without a stable id TanStack keys selection by INDEX, so replacing or reordering `data` makes a checkbox follow the position and tick a different record. The grid covers the safe half on its own — it clears the selection when `data` changes — but only an id makes selection survive the change. |
| `selectable` | `boolean` | false | Adds the checkbox column, header included. |
| `onSelectionChange` | `(rows: T[]) => void` | — | Receives the ORIGINAL rows, taken before filtering and paging — so a selection does not vanish because you typed in the filter. Under `manualPagination` it can only hand you rows from the page in memory; use `onRowSelectionChange` there, which gives ids. |
| `sorting` | `SortingState` | — | Controlled sort. Passing it hands the decision to you: the grid stops moving on its own and only reports through `onSortingChange`, so you can validate, confirm or wait for a request before letting it change. |
| `onSortingChange` | `(sorting: SortingState) => void` | — | Fires on every header click, controlled or not. Alone it does not make the grid controlled — `sorting` does. |
| `globalFilter` | `string` | — | Controlled value of the search field. Same rule as `sorting`: with it, typing reports and nothing narrows until you say so. |
| `onGlobalFilterChange` | `(filter: string) => void` | — | Fires on every keystroke in the search field. |
| `page` | `number` | — | Controlled page, 1-based — the same counting the visible Pagination uses, not the engine's 0-based index. A position in a list, not a dimension. |
| `onPageChange` | `(page: number) => void` | — | Receives the 1-based page the reader asked for. |
| `rowSelection` | `RowSelectionState` | — | Controlled selection, keyed by row id — so it survives paging and reloading, which a list of rows cannot. Pair it with `getRowId`. |
| `onRowSelectionChange` | `(selection: RowSelectionState) => void` | — | The id map, every time it changes. This is the selection API for server-side data; `onSelectionChange` is the convenience one for a set held in memory. |
| `manualSorting` | `boolean` | false | The server sorted. The grid stops sorting in memory but still marks the sorted column with `aria-sort`, so the reader is told what changed. |
| `manualFiltering` | `boolean` | false | The server filtered. Typing reports and nothing is hidden locally. |
| `manualPagination` | `boolean` | false | The server paged, and `data` is one page. Requires `rowCount`: without it there is no way to know how many pages exist and the pagination disappears from the screen. |
| `bulkActions` | `Array<{ id: string; label: string; icon?: string; onAction: (rows: T[], clear: () => void) => void }>` | — | Turns a selection into something you can act on: a toolbar appears with the count, the actions, and a way to clear. `onAction` receives the ORIGINAL rows — taken before filtering, so acting on what the filter hid is still possible — and the `clear` function, so an action can drop the selection once it has run. No bar is drawn without a selection: it is the state, not decoration. |
| `filters` | `Array<{ column: string; label: string; facet?: boolean; options?: Array<{ value: string; label: string }> }>` | — | Adds a filter row inside the table header, one control per declared column, aligned with the column because the table is what aligns it. `facet: true` gives a multi-select built from the values present in the data, each option carrying its count. Declare `options` when a value must stay on the list even with no rows behind it — the difference between "no cancelled ones" and "cancelled does not exist". |
| `columnFilters` | `ColumnFiltersState` | — | Controlled per-column filters, same rule as `sorting`: with it, typing and picking report and nothing narrows until you say so. To put it in the address bar, `gridStateToParams` and `gridStateFromParams` are the format — imported from the package root, not from this subpath, because the code that reads a URL runs on the server and this subpath is client-only. The grid never writes the URL itself: only you know whether a change should push a history entry or replace one. |
| `onColumnFiltersChange` | `(filters: ColumnFiltersState) => void` | — | Fires whenever a column filter changes, controlled or not. |
| `rowCount` | `number` | — | Total rows on the server, used to compute the page count under `manualPagination`. A count, not a dimension. |
| `stickyHeader` | `boolean` | false | Pins the header — and the filter row with it — while the body scrolls. It also gives the scroll box a height, because it has to: the wrapper is the scroll container, and a box with no ceiling never scrolls inside itself, so the header would never have anything to detach from. The ceiling is `--datagrid-max-h` (60vh by default), set in CSS rather than as a prop — only the page knows how much screen it can spare, and a height is not a number this library accepts as an API. |
| `hideableColumns` | `boolean` | false | Adds a picker that turns columns on and off — the same multi-select the facet filter uses, because choosing several from a list is that component. When it is the only control, the search field keeps the full width it always had; the two only share a row when both are there. |
| `columnVisibility` | `VisibilityState` | — | Controlled map of column id to visible. It is a plain serialisable object, which is what makes the choice persistable — where it is persisted (local storage, user profile, the URL) is yours to decide, exactly as in F4. |
| `onColumnVisibilityChange` | `(visibility: VisibilityState) => void` | — | Fires whenever a column is shown or hidden. |
| `resizableColumns` | `boolean` | false | Adds a drag handle at the trailing edge of each header cell. The handle is a real button and answers the ARROW KEYS as well — 16px a press — because the engine only gives dragging, and a column you can only resize with a mouse is a feature that excludes people. |
| `columnSizing` | `ColumnSizingState` | — | Controlled map of column id to width in pixels. Serialisable, same rule as `columnVisibility`. |
| `onColumnSizingChange` | `(sizing: ColumnSizingState) => void` | — | Fires while dragging and on each arrow key. |
| `state` | `"loading" \| "error" \| "waiting_user" \| "waiting_approval" \| "waiting_dependency" \| "offline" \| "stale" \| "partial" \| "degraded"` | — | Says out loud what is going on with the data. `stale` and `partial` keep the rows on screen and label them, because a table showing old data without saying so is worse than an empty one. `error` uses `role="alert"` so it interrupts a screen reader; the other two use `role="status"` and wait for the next pause. `loading` never blanks rows that are already there — reloading is no reason to take away what someone was reading — and only draws skeleton rows when there is nothing to show. Since Part J the seven universal states are accepted here too, under the names the contract gives them — `stale` and `partial` already had them, which is why nothing was renamed. `loading` and `error` stay specific to this grid on purpose: in all seven universal states the screen still works, and with no rows at all it does not. The grid keeps its own three sentences because they talk about rows, and more specific wins over more general; the shared wording covers the four it did not have. |
| `stateMessage` | `string` | — | Replaces the built-in sentence. Only you know what actually failed: "the billing service is down" beats "the rows could not be loaded". |
| `renderDetail` | `(row: T) => ReactNode` | — | Adds a trailing column with a Details button per row, and opens what you return in a panel BESIDE the list — the list stays on screen, which is the point. The trigger is a button and not a clickable row: a row is not a focus target, and turning it into one means inventing a role, a tabindex and a key that a button already is. Closed, the markup is exactly what it was without this prop. |
| `detailRowId` | `string \| null` | — | Controlled id of the row whose panel is open. Same rule as every other axis here. |
| `onDetailRowIdChange` | `(id: string \| null) => void` | — | Fires when a panel opens or closes. |
| `onExport` | `(rows: T[], scope: { count: number; filtered: boolean; selected: boolean }) => void` | — | Draws a button whose LABEL states the scope — "Export 47 filtered rows", never a bare "Export", because the bare word hides the question that matters. Precedence follows what the person just did: a selection wins over a filter, a filter wins over everything. The grid produces no file: format, encoding and transport are yours, the same boundary the upload queue draws. |
| `filterable` | `boolean` | false | Draws the search field that filters across every column. |
| `pageSize` | `number` | — | Rows per page; passing it is what turns pagination on. A count of rows, not a dimension — there is nothing to measure here. |
| `label` | `string` | "Table" | Accessible name of the scrollable region around the table. That region is focusable on purpose, so a table wider than the screen can be scrolled with the arrow keys — the same wrapper the plain Table uses. Cell-by-cell arrow navigation is the APG grid pattern and this component does NOT implement it: it is a table with interactive controls in it, which is what the header buttons and the checkboxes are. |
| `className` | `string` | — | On the grid wrapper. |
