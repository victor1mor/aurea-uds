# ListBox

ListBox is a standalone list of options: icons, descriptions and sections, with none, one or many chosen. With no selection it is a list of actions. It is the list a Select opens, without the trigger around it.

## Usage

```tsx
import {ListBox} from "@aurea-uds/react";
```

```tsx
<ListBox label="Plan" defaultValue={["pro"]} items={[
  {id: "free", label: "Free", description: "For trying it out", icon: "leaf"},
  {id: "pro", label: "Pro", description: "For a small team", icon: "rocket-launch"},
  {id: "team", label: "Team", description: "For the whole company", icon: "buildings"},
]} />
```

- One tab stop. Arrows, Home and End move; Space and Enter choose; a letter jumps to the next option starting with it.

- selectionMode: single (the default), multiple (Space toggles) or none (onAction).

- Sections are groups named by their title. Disabled options are skipped by the arrows.

- The chosen option shows a check at the end; a danger option is written in the danger colour.

## Examples

### Sections, many chosen

Space toggles each option. A disabled one keeps its place.

```tsx
<ListBox label="Columns" selectionMode="multiple" defaultValue={["name", "status"]} items={[
  {title: "Basic", items: [{id: "name", label: "Name"}, {id: "status", label: "Status"}]},
  {title: "Dates", items: [{id: "created", label: "Created"}, {id: "due", label: "Due", disabled: true}]},
]} />
```

### Actions

With no selection, an option is an action. The dangerous one says so in colour and in words.

```tsx
<ListBox label="File" selectionMode="none" onAction={run} items={[
  {id: "rename", label: "Rename", icon: "pencil-simple"},
  {id: "share", label: "Share", icon: "share-network"},
  {id: "delete", label: "Delete file", icon: "trash", danger: true},
]} />
```

### Sections, descriptions and shortcuts

Each item with a line under its name and the key that fires it at the end, and a line between the sections, as in every sectioned list of the reference.

```tsx
<ListBox label="File actions" selectionMode="none" items={[
  {title: "Actions", items: [
    {id: "new", label: "New file", description: "Create a new file", icon: "plus-square", kbd: "⌘N"},
    {id: "edit", label: "Edit file", description: "Make changes", icon: "pencil-simple", kbd: "⌘E"}]},
  {title: "Danger zone", items: [
    {id: "delete", label: "Delete file", description: "Move to trash", icon: "trash", kbd: "⌘⇧D", danger: true}]},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | REQUIRED. The list's name for screen readers. |
| `items` | `(ListBoxItem \| ListBoxSection)[]` | — | Options ({id, label, description?, icon?, disabled?, danger?, textValue?, kbd?}) and sections ({title, items}). kbd shows the item's shortcut at the end of the row, as the reference — display only; the app binds the key. |
| `selectionMode` | `none \| single \| multiple` | single | none turns it into a list of actions (onAction). |
| `value / defaultValue` | `string[]` | — | The ids of the chosen options. |
| `onValueChange` | `(value: string[]) => void` | — | Called with the new list of ids. |
| `onAction` | `(id: string) => void` | — | Called when an option is activated (Enter, Space or click). |
