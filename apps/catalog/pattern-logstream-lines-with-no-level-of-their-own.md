# Lines with no level of their own

Program output is not levelled, and forcing a level on it would be inventing information. The three cells stay in place even when two are empty — that is what keeps the message in its own track instead of sliding left.

## Usage

```tsx
import {LogStream} from "@aurea-uds/react";
```

```tsx
<LogStream lines={stdout.map(text => ({text}))} />
```
