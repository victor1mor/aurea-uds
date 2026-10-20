# The tail of a running job

Time, level and message in three fixed tracks, so the eye can find the level column without reading the lines. It is a live region: a line that arrives while the reader is elsewhere is announced, not silently appended.

## Usage

```tsx
import {LogStream} from "@aurea-uds/react";
```

```tsx
<LogStream lines={[
  {time: "14:32:01", level: "info", text: "task#4821 accepted"},
  {time: "14:32:02", level: "info", text: "model loaded"},
  {time: "14:32:04", level: "warn", text: "external tool requires approval"},
  {time: "14:32:08", level: "error", text: "scope invoke:external denied"},
]} />
```
