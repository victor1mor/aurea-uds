# LogStream

Live-appending stream of log lines.

## Usage

```tsx
import {LogStream} from "@aurea-uds/react";
```

```tsx
<LogStream lines={[
  {time: "09:14:02", text: "build started"},
  {time: "09:14:07", level: "warn", text: "2 baselines missing for linux"},
  {time: "09:14:09", level: "error", text: "exit 1"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `lines` | `Array<{time?: string; level?: string; text: string}>` | — | The lines. The container is role="log" with aria-live="polite", so lines added after mount are announced as they arrive and the ones already there are not re-read. `level` becomes the .log-<level> class. |
