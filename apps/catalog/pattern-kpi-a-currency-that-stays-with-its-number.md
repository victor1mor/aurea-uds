# A currency that stays with its number

In a narrow column, an ordinary space lets the currency symbol sit on one line and the number on the next. Join them with a no-break space (U+00A0) and they wrap together. `Intl.NumberFormat` with `style: "currency"` already puts one there.

## Usage

```tsx
import {KPI} from "@aurea-uds/react";
```

```tsx
<KPI label="Revenue" value={"R$\u00a012,400"} trend="+8% vs last month" />
```
