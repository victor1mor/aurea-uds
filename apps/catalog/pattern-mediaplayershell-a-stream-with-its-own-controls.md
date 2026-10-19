# A stream with its own controls

The frame gives the surface, the aspect ratio and the dark canvas that holds in both themes; everything inside is yours. This is the shape to reach for when the engine is not a <video> — a remote screen, a canvas, a live socket.

## Usage

```tsx
import {MediaPlayerShell, Badge, Icon} from "@aurea-uds/react";
```

```tsx
<MediaPlayerShell>
  <div className="media-overlay-title">
    <div><strong>Studio A</strong><span>1080p · 30 fps</span></div>
    <Badge variant="danger">on air</Badge>
  </div>
  <div className="media-controls">
    <div className="media-control-row">
      <button type="button" className="media-control" aria-label="Stop"><Icon name="stop" /></button>
      <button type="button" className="media-control" aria-label="Mute"><Icon name="speaker-high" /></button>
    </div>
  </div>
</MediaPlayerShell>
```
