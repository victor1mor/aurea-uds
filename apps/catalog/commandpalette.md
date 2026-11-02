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

## Examples

### Large

size="lg" is the site search: a 1024 window, a 64 field with Esc inside, the filters you pass, group titles with their count, items with a tinted icon circle and a description, the preview of the active item beside the list (it goes below 1240), and your footer next to the keys.

```tsx
<CommandPalette size="lg" open={open} onClose={close} items={[
  {id: "button", label: "Button", description: "The action a person takes.", icon: "cursor-click", tone: "blue", group: "Components", run},
  {id: "theme", label: "Theming", description: "Brands, themes and densities.", icon: "palette", tone: "green", group: "Getting Started", run},
]} preview={(item) => <Preview item={item} />} footer={<PlatformSwitch />} />
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
| `size` | `"md" \| "lg"` | "md" | lg is the large search: a window as wide as --breakpoint-lg (1024), a 64 field (the magnifier, 18 letters and Esc inside), group titles in uppercase code font with their count, 50 items with the icon in a 40 circle, the title and a cut description, and ↵ on the active row. |
| `items[].description / items[].tone` | `string / BadgeCategory` | — | With lg: the second line of the item (muted, cut), and the category color of its icon circle (the Badge colors); without tone, the circle is neutral. |
| `filters` | `ReactNode` | — | With lg: what goes under the field — the filters the app draws (a ToggleGroup, for example). |
| `preview` | `(item: CommandItem) => ReactNode` | — | With lg: the preview of the active item, beside the list, on --fill-1 with radius 22. It goes when the window is under 1240 wide. |
| `footer` | `ReactNode` | — | With lg: what goes in the foot, next to the key hints. |
