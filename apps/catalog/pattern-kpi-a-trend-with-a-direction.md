# A trend with a direction

`direction` draws the arrow, colours the trend and gives screen readers a word before it — up is success and down is danger by default. When going up is bad news, `tone` turns it around. The trend text stays the domain's own words.

## Usage

```tsx
import {KPI} from "@aurea-uds/react";
```

```tsx
<KPI label="Revenue" value="$12,400" trend="+8% this month" direction="up" />
<KPI label="Churn" value="2.1%" trend="−0.3pt" direction="down" tone="success" />
<KPI label="Support cost" value="$3,200" trend="+12%" direction="up" tone="danger" />
<KPI label="Active seats" value="148" trend="same as last month" direction="flat" />
```
