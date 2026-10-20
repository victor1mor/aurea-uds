# v0.2.0

React Server Components support, 27 new components including a new AI and Agents category, a server-backed DataGrid, universal states and five breaking changes.

The headline: `@aurea-uds/react` now works in React Server Components. In v0.1.0, importing `Button` inside a server component crashed the render; that is fixed. This release also adds 27 components (16 of them in a new AI and Agents category), turns `DataGrid` into a server-backed grid and names seven universal states. Nothing was removed from the JavaScript API, but five changes can break an upgrade; read them first.

## New

### React Server Components

- **`"use client"` where it is needed.** 21 of the 24 modules carry the directive; the main entry point, `disclosure` and a new `pure` module do not. `import { Button } from "@aurea-uds/react"` inside a server component now works.
- **Importable from a server component**: `cx`, `defaultStrings`, `ptBR`, `defaultSpriteUrl`, `AureaStrings`, `gridStateToParams`, `gridStateFromParams`, `GridState`, `universalStates`, `stateSeverity` and `UniversalState`.

### Components

- **AI and Agents, a new category with 16 components**: `AgentCard`, `AgentInspector`, `AgentStatus`, `AutomationCard`, `CostMeter`, `DependencyGraph`, `EventStream`, `HealthMatrix`, `HumanApproval`, `InterAgentMessage`, `InvocationPanel`, `MemoryLedger`, `ModelUsage`, `TaskQueue`, `ToolPermission` and `TraceTimeline`. They cover an agent's identity and state, approvals, spend, queues, traces and the dependency canvas.
- **[`Chart`](./chart.html), [`ChartTooltip`](./charttooltip.html) and [`ChartLegend`](./chartlegend.html)**: a sized, named surface that hosts a Recharts chart in Aurea tokens, with its tooltip and legend.
- **[`Calendar`](./calendar.html)**: a month grid for picking a day, a range or several days.
- **[`NumberField`](./numberfield.html)**: a numeric field with decrease and increase controls.
- **[`OTPField`](./otpfield.html)**: one box per character, for a verification code typed or pasted.
- **[`AvatarGroup`](./avatargroup.html)**: an overlapping stack of avatars, with a count for the ones that do not fit.
- **[`HoverCard`](./hovercard.html)**: a rich preview that opens when the pointer rests, and whose content can be reached.
- **[`Spinner`](./spinner.html)**: an activity indicator for a wait with no known end.
- **[`Stepper`](./stepper.html)**: progress through numbered steps, for a task with a fixed order.
- **[`Toggle`](./toggle.html)**: a two-state button that stays pressed, for a setting you flip in place.

### Optional engines

- **Three new subpaths, each with an optional peer dependency**: `@aurea-uds/react/chart` (`recharts@^3.10.1`), `@aurea-uds/react/calendar` (`react-day-picker@^10.0.1`) and `@aurea-uds/react/graph` (`@xyflow/react@^12.11.2`). Importing from the main entry point never pulls these engines into your bundle. `@base-ui/react` remains the only runtime dependency, at `^1.6.0`.

### DataGrid

- **[`DataGrid`](./datagrid.html) controlled mode**: `sorting` / `onSortingChange`, `globalFilter` / `onGlobalFilterChange`, `page` / `onPageChange` (1-based, like `Pagination`) and `rowSelection` / `onRowSelectionChange`. Without them the grid keeps its internal state, so existing code is unchanged.
- **Server-side data**: `manualSorting`, `manualFiltering`, `manualPagination` and `rowCount`.
- **Filtering per column**: `filters` and `columnFilters` / `onColumnFiltersChange`, with the filter row aligned to its columns in the header.
- **Bulk actions, sticky header and columns**: `bulkActions` (a `Toolbar` with arrow-key navigation), `stickyHeader`, `hideableColumns` with `columnVisibility`, and `resizableColumns` with `columnSizing`. The resize handle responds to arrow keys.
- **States, detail and export**: `state` and `stateMessage` (loading keeps the rows you are reading), a row detail panel (`renderDetail`, `detailRowId`), and `onExport`, which tells you the scope while the file itself stays yours.
- **URL state**: `gridStateToParams` / `gridStateFromParams`. They only convert; the grid never writes to the URL.

### Universal states

- **Seven named conditions**: `waiting_user`, `waiting_approval`, `waiting_dependency`, `offline`, `stale`, `partial` and `degraded`. A `state` prop with this vocabulary is available on `Status`, `Alert`, `Banner`, `EmptyState` and `DataGrid`, and marks `data-state` in the DOM. It is its own axis, separate from `variant`.

### FileInput

- **[`FileInput`](./fileinput.html) became a transfer queue**: new type `FileQueueItem` and new props `initialQueue`, `onQueueChange`, `preview` and `checksum`.
- **Pausing is no longer canceling**: `UploadContext` includes `resumeFrom`, and `UploadFn` may resolve with `{checksum?: string}` to compare against the local checksum. Returning nothing still works.

### Layout and provider

- **[`AureaProvider`](./aureaprovider.html) `portalContainer`**: where every popup in the library mounts (dialogs, drawers, tooltips, popovers, menus, combobox lists, toasts). Without it, popups still go to `document.body`.
- **[`Sidebar`](./sidebar.html) takes navigation as data**: `items`, `current`, `collapsed` and `label`. The current item gets `aria-current="page"`. `children` still works.
- **[`AppShell`](./appshell.html) `sidebarCollapsed`**, controlled by you, narrows the sidebar column to the new token `--sidebar-rail` (`5.5rem`).
- **Every component now publishes its props contract**, including `Sidebar`, `Topbar`, `Status` and `QRCode`.

### CSS custom properties

- **Seven properties to tune components**, each defaulting to the previous value: `--datagrid-max-h` (`60vh`), `--datagrid-detail-w` (`20rem`), `--chart-h` (`220px`), `--log-h` (`240px`), `--media-h` (`360px`), `--media-ar` (`16/9`, which prevents layout shift in the media player) and `--qr-size` (`10rem`).
- **Token descriptions**: every theme and density token now says when to use it. No token was removed and no value changed.

## Changed

- **[`AppShell`](./appshell.html) collapses to one column at 767px instead of 820px.** Between 768px and 820px the sidebar column now stays.
- **[`MediaPlayer`](./mediaplayer.html) compacts by its own width**, through a container query instead of a viewport query.
- **`Sidebar` emits list semantics** (`role="list"` and `role="listitem"`) when given `items`.
- **The [`CodeBlock`](./codeblock.html) `<pre>` is focusable**, so code wider than its box can be scrolled by keyboard.
- **`Icon` inside `AvatarGroup` and similar wrappers is `aria-hidden`**, with the accessible name on the group.
- **Six legacy breakpoints were removed** (`1366`, `821`, `820`, `800`, `640`, `400`) in favor of the standard scale.

## Fixed

- **[`Progress`](./progress.html) announced the wrong number**: `aria-valuenow` now reports the clamped percentage, not the raw `value`.
- **[`LogStream`](./logstream.html) put the message in the narrow level column, and `level` painted nothing.** Both are fixed.
- **The navigation drawer could not be reached by keyboard in Safari.** The shell now moves focus to the first item on open and back to the trigger on close, in every browser. The drawer is not modal.
- **`import "@aurea-uds/core/css"` failed type-checking** (TS2882). `@aurea-uds/core` and `@aurea-uds/fonts` now declare types for their `./css` subpath.
- **[`ToolbarGroup`](./toolbargroup.html) used a raw `4px` gap** and ignored density. It now uses `--space-1`.

## Breaking changes

- **The core stylesheet no longer styles bare `<table>` elements.** Five unclassed rules reached every table on the page, including your own. They are now scoped to `.table, .table-wrap table`. If you relied on them, add `class="table"`. Aurea's `Table` and `DataGrid` are unaffected.
- **[`Avatar`](./avatar.html) `size` is a scale**, `"sm" | "md" | "lg"` (default `"md"`), instead of a number. It follows the control heights and density. The default avatar is 4px smaller (36px instead of 40px at comfortable density). Replace `size={48}` with `size="lg"`.
- **[`QRCode`](./qrcode.html) `size` is a scale**, `"sm" | "md" | "lg"` (`7.5rem`, `10rem`, `15rem`, quiet zone included). `md` is the same 160px as before. For any other size, set `--qr-size` in CSS.
- **[`SegmentedControl`](./segmentedcontrol.html) is a radio group.** Options are `role="radio"` with `aria-checked` instead of buttons with `aria-pressed`; the group is one tab stop, and the arrow keys (plus `Home` / `End`) move and select. The props and the `.active` class are unchanged, but CSS or tests that look for `aria-pressed` or the `button` role must be updated.
- **Fourteen unused classes were removed from the core stylesheet**: `.accordion-item`, `.accordion-panel`, `.accordion-trigger`, `.copied`, `.doc-sidebar`, `.media-library-row`, `.mobile-nav-backdrop`, `.mobile-nav-close`, `.mobile-nav-toggle`, `.operational-grid`, `.overlay`, `.pattern-toolbar`, `.time-display` and `.universal-grid`. No component used them; hand-written markup with these names loses its styling. The `Accordion` component is unaffected.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.2.0 @aurea-uds/core@0.2.0 @aurea-uds/fonts@0.2.0 @aurea-uds/icons@0.2.0
```
