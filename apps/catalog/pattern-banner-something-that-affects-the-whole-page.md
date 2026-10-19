# Something that affects the whole page

A banner spans the region it is about; an alert sits inside it. Dismissible only when the message is genuinely optional — a banner about degraded service that can be closed is a banner nobody sees twice.

## Usage

```tsx
import {Banner} from "@aurea-uds/react";
```

```tsx
<Banner variant="warning" title="Reduced capacity">
  Runs are queueing. Scheduled jobs may start late until 18:00 UTC.
</Banner>
```
