# Waiting for a source

The state a player spends more time in than anyone plans for. Saying nothing reads as broken; the frame with a placeholder says the surface is ready and the source is not, which is the fact the reader needs while they wait.

## Usage

```tsx
import {MediaPlayerShell, Spinner} from "@aurea-uds/react";
```

```tsx
<MediaPlayerShell>
  <div className="media-placeholder">
    <Spinner />
    <strong>Connecting…</strong>
  </div>
</MediaPlayerShell>
```
