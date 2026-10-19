# Walking a long result set

The current page is announced, not just highlighted. Previous and Next keep their labels for screen readers even when they show only a chevron — a nameless arrow is a dead end.

## Usage

```tsx
import {Pagination} from "@aurea-uds/react";
```

```tsx
const [page, setPage] = useState(1);

<Pagination page={page} total={12} onPageChange={setPage} />
```
