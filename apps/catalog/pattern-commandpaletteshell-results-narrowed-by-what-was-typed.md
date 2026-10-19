# Results narrowed by what was typed

Filtering is the consumer's job, not the shell's: it holds `query` and decides what matches. Keeping it outside is what lets the same palette search components, files or an API — the shell never assumes the shape of what it is searching.

## Usage

```tsx
import {CommandPaletteShell, Kbd} from "@aurea-uds/react";
```

```tsx
const shown = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

<CommandPaletteShell open={open} query={query} onQueryChange={setQuery}>
  <div className="menu">
    {shown.map(c => (
      <button key={c.id} className="menu-item" type="button" onClick={c.run}>{c.label}</button>
    ))}
  </div>
</CommandPaletteShell>
```
