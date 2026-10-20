# CommandPaletteShell

Overlay shell for a searchable command palette.

## Usage

```tsx
import {CommandPaletteShell} from "@aurea-uds/react";
```

```tsx
<CommandPaletteShell open={open} query={query} onQueryChange={setQuery}>
  <div className="menu">
    <button className="menu-item" type="button">Go to Button</button>
    <button className="menu-item" type="button">Toggle theme</button>
  </div>
</CommandPaletteShell>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled. Closed it renders null, so nothing is left in the DOM to be tabbed into. |
| `query` | `string` | — | The value of the search field. Controlled, because the filtering is yours. |
| `onQueryChange` | `(value: string) => void` | — | Every keystroke. |
| `onClose` | `() => void` | — | Called when the dialog asks to close — Escape, or a click outside. Without it the dialog stays open until `open` changes. |
| `label` | `string` | "Command palette" | The name of the dialog. |
| `children` | `ReactNode` | — | The results, rendered by you. The shell owns the surface and the field; matching is domain knowledge and does not belong to a design system. |
