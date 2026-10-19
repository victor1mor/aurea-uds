# Every command on one keystroke

The palette is the keyboard route to anything the application can do. The field takes focus on open and the list narrows as you type, so the whole interaction is one gesture — never a menu you have to find first.

## Usage

```tsx
import {CommandPaletteShell, Kbd} from "@aurea-uds/react";
```

```tsx
<CommandPaletteShell open={open} query={query} onQueryChange={setQuery}>
  <div className="menu">
    <button className="menu-item" type="button">Go to Button<Kbd>G B</Kbd></button>
    <button className="menu-item" type="button">Toggle theme<Kbd>T</Kbd></button>
    <button className="menu-item" type="button">Open settings<Kbd>,</Kbd></button>
  </div>
</CommandPaletteShell>
```
