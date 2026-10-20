# MediaPlayer

Video/audio player with full controls.

## Usage

```tsx
import {MediaPlayer} from "@aurea-uds/react";
```

```tsx
<MediaPlayer
  kind="audio"
  src="/media/episode-14.mp3"
  title="Episode 14"
  subtitle="Measuring instead of counting"
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | — | The media. Any <video> attribute is accepted and forwarded. |
| `kind` | `video \| audio` | video | Audio swaps the picture for a placeholder with the title, and drops the full-screen button — there is nothing to enlarge. |
| `title` | `ReactNode` | — | Shown over the video and used as the accessible name of the control group when it is a string. It deliberately shadows the HTML title attribute: a tooltip on a player is not what you want. |
| `subtitle` | `ReactNode` | — | Second line under the title. |
| `poster` | `string` | — | Still frame before playback. Video only. |
| `children` | `ReactNode` | — | Where <track> elements go. Captions are read from the element's textTracks, so the CC button appears only when a track actually exists. |
| `onPlay` | `(e: SyntheticEvent) => void` | — | Your media handlers are COMPOSED with the internal ones, never replacing them — the same holds for onPause, onEnded, onTimeUpdate, onLoadedMetadata, onDurationChange, onProgress and onVolumeChange. An external onPlay that replaced ours would leave the button reading "Play" during playback. |
