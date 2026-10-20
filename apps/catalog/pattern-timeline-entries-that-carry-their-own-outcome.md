# Entries that carry their own outcome

`title` takes a node, so an entry can say what it was and how it went in one line. This is the difference between a log the reader has to interpret and an audit trail they can scan.

## Usage

```tsx
import {Timeline, Status} from "@aurea-uds/react";
```

```tsx
<Timeline items={[
  {title: <>Deploy <Status variant="success">succeeded</Status></>, time: "03:14"},
  {title: <>Rollback <Status variant="warning">manual</Status></>, time: "04:02"},
]} />
```
