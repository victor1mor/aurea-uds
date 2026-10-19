# A detail already unfolded

`defaultOpen` starts unfolded but leaves the reader in charge of folding it back. Use it when the content is the point of the screen and the fold is a courtesy, not a filter.

## Usage

```tsx
import {Collapsible, DataList} from "@aurea-uds/react";
```

```tsx
<Collapsible trigger="Run details" defaultOpen>
  <DataList items={[
    {term: "Started", value: "09:12:04"},
    {term: "Duration", value: "1m 48s"},
    {term: "Exit code", value: "0"},
  ]} />
</Collapsible>
```
