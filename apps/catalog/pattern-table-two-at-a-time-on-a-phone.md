# Two at a time on a phone

On a narrow screen the page shows two items, picked with two selects above the table, and `fit` drops the 720px minimum so the two fit with no sideways scroll. Which two is the page's choice; the table only has to fit.

## Usage

```tsx
import {Table, Field, Select, Badge} from "@aurea-uds/react";
```

```tsx
<Field label="Compare"><Select value={a} onValueChange={setA}>…</Select></Field>
<Field label="With"><Select value={b} onValueChange={setB}>…</Select></Field>
<Table caption="Compare models" fit>…two columns…</Table>
```
