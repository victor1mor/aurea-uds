# The facts about one record

A definition list is the honest markup for "this thing has these properties". Every value here belongs to the same run; nothing on the list compares it to another run.

## Usage

```tsx
import {DataList} from "@aurea-uds/react";
```

```tsx
<DataList items={[
  {term: "Status", value: "Succeeded"},
  {term: "Started", value: "21 Aug 2026, 09:12"},
  {term: "Duration", value: "1m 48s"},
  {term: "Triggered by", value: "Curator"},
]} />
```
