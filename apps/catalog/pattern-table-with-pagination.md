# With pagination

The full collection composition: filter above, selection in the first column, pagination below.

## Usage

```tsx
import {Table, Checkbox, SearchField, Pagination} from "@aurea-uds/react";
```

```tsx
<SearchField placeholder="Filter members…" />
<Table caption="Members">…</Table>
<Pagination page={1} total={3} onPageChange={setPage} />
```
