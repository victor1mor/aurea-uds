# CommandPalette

The command palette with the engine wired up: type, filter, run.

## Usage

```tsx
import {CommandPalette} from "@aurea-uds/react";
```

```tsx
<Button leadingIcon="magnifying-glass" kbd="⌘K" onClick={() => setOpen(true)}>Search</Button>

<CommandPalette open={open} onClose={() => setOpen(false)} items={[
  {id: "button", label: "Button", icon: "squares-four", group: "Components", run: () => go("/button")},
  {id: "close", label: "CloseButton", icon: "squares-four", group: "Components", run: () => go("/close-button")},
  {id: "theme", label: "Toggle theme", icon: "moon", kbd: "⌘T", group: "Actions", run: toggleTheme},
]} />
// Items with a group come together under its title; the line under the list teaches the keys.
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | REQUIRED. You own the state, as in Dialog and Drawer. Closed, it renders nothing at all. |
| `onClose` | `() => void` | — | REQUIRED. Fires on Escape and after a command is chosen — in that order: closing happens BEFORE the command runs, so a command that navigates does not leave the palette floating over the new screen. |
| `items` | `CommandItem[]` | — | REQUIRED. Commands as DATA ({id, label, icon?, kbd?, run}), never children — a list kept as children drifts out of sync with the filter, which is the same decision Combobox took. |
| `placeholder` | `string` | "Type a command…" | Also the accessible name of the input. |
| `label` | `string` | "Command palette" | Accessible name of the dialog. |
| `shortcuts` | `boolean` | true | The line under the list that teaches the keys: ↑ ↓ move, Enter open, Esc close. Each item may also say its group (item.group): items of the same group come together under its title. |
