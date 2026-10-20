# Media · streaming

An audio/video library with queue, playlists, tracks and chapters. A library action doesn't interrupt what's playing.

## Usage

```tsx
import {MediaPlayer, Table, Badge} from "@aurea-uds/react";
```

```tsx
<MediaPlayer kind="audio" src="/media/ep-14.mp3" title="Episode 14" subtitle="Season 2" />
<Table caption="Up next">
  <thead><tr><th>Track</th><th>Length</th></tr></thead>
  <tbody><tr><td>Episode 15 <Badge>queued</Badge></td><td>41:02</td></tr></tbody>
</Table>
```
