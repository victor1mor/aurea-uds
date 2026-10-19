# Nothing matched

The one state a palette must not skip. A list that simply vanishes reads as a broken palette; EmptyState says the search ran and found nothing, which is a different fact and the one the reader needs.

## Usage

```tsx
import {CommandPaletteShell, EmptyState} from "@aurea-uds/react";
```

```tsx
<CommandPaletteShell open={open} query={query} onQueryChange={setQuery}>
  {shown.length
    ? <div className="menu">{shown.map(renderCommand)}</div>
    : <EmptyState icon="magnifying-glass" title="No command matches" description="Try a shorter word." />}
</CommandPaletteShell>
```
