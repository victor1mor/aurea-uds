# Table header bar

Search on one side, actions on the other — the bar that heads a collection.

## Usage

```tsx
import {Card, SearchField, Toolbar, IconButton} from "@aurea-uds/react";
```

```tsx
<div className="cluster" style={{justifyContent: "space-between"}}>
  <SearchField placeholder="Filter rows…" />
  <Toolbar label="Table actions">
    <IconButton icon="funnel" label="Filter" />
    <IconButton icon="download" label="Export" />
  </Toolbar>
</div>
```
