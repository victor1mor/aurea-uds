# The shortcut column of a menu

A menu that lists its shortcuts teaches the keyboard without a separate page. The keys sit at the end of the row so the labels stay left-aligned and scannable — the shortcut is the second read, never the first.

## Usage

```tsx
import {Card, Kbd} from "@aurea-uds/react";
```

```tsx
<div className="menu">
  <button className="menu-item" type="button">New run<Kbd>N</Kbd></button>
  <button className="menu-item" type="button">Search<Kbd>/</Kbd></button>
</div>
```
