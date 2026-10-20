# MediaPlayerShell

Layout shell hosting a media player and its chrome.

## Usage

```tsx
import {MediaPlayerShell} from "@aurea-uds/react";
```

```tsx
<MediaPlayerShell role="group" aria-label="Camera 3">
  <div className="media-viewport">
    <div className="media-placeholder"><Icon name="video-camera" /><strong>Standing by</strong></div>
  </div>
  <div className="media-overlay-title">
    <div><strong>Camera 3</strong><span>Loading dock</span></div>
    <Badge variant="danger">on air</Badge>
  </div>
  <div className="media-controls">
    <div className="media-control-row">
      <div className="media-control-group">
        <button className="media-control" type="button" aria-label="Play"><Icon name="play" /></button>
        {/* sem barra de busca: ao vivo não tem para onde voltar */}
        <span className="media-time">LIVE</span>
      </div>
      <div className="media-control-group">
        <button className="media-control" type="button" aria-label="Mute"><Icon name="speaker-high" /></button>
        <button className="media-control" type="button" aria-label="Full screen"><Icon name="arrows-out" /></button>
      </div>
    </div>
  </div>
</MediaPlayerShell>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | The chrome you compose, hosted by the frame. What the frame gives you is worth naming, because rebuilding it by hand is where players go wrong: the dark canvas that stays dark in both themes, overflow clipping so nothing escapes the rounded corner, an isolated stacking context so .media-overlay-title and .media-controls layer above the picture without z-index fights, and a fixed aspect-ratio so the page does not jump before the media has measured itself. Slots it is built for: .media-viewport (picture or placeholder), .media-overlay-title, .media-controls. Use it when the default chrome would be WRONG — a live stream has no duration and nothing to seek, so a seek bar there is a control that lies. For a player that plays, use MediaPlayer. |
| `className` | `string` | — | On the surface. Every other div attribute passes through. |
