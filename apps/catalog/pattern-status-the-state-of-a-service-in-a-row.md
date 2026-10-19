# The state of a service, in a row

A coloured dot plus a word. The word is mandatory: colour alone fails for a third of readers, and green and amber are the pair people confuse most.

## Usage

```tsx
import {Status} from "@aurea-uds/react";
```

```tsx
<Status variant="online">Running</Status>
<Status variant="offline">Stopped</Status>
<Status>Unknown</Status>
```
