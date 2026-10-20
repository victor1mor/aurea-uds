# MediaEmbed

A third-party video page (YouTube, Vimeo) inside the Aurea frame, loaded only when asked for.

## Usage

```tsx
import {MediaEmbed} from "@aurea-uds/react";
```

```tsx
<MediaEmbed
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="Official trailer"
  poster="/trailers/cover.jpg"
  href="https://www.youtube.com/watch?v=VIDEO_ID"
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | — | The provider's EMBED address, e.g. https://www.youtube.com/embed/<id>. Any other <iframe> attribute is accepted and forwarded, and wins over the defaults. |
| `title` | `string` | — | Required. The accessible name of the frame — an unnamed iframe fails axe, so the type refuses to compile without it. |
| `poster` | `string` | — | Still image for the facade. With it, nothing from the provider loads until the play button is pressed; without it, the frame loads lazily right away. |
| `ratio` | `string` | 16/9 | Box proportion in CSS syntax. Reserved before anything loads, so the page does not jump. |
| `href` | `string` | — | The video on its own site. Shown as a link under the frame — the way out when the owner blocks embedding, which the page cannot detect. |
| `autoplay` | `boolean` | true | With a poster, start playing after the click by adding autoplay=1 to the address (YouTube and Vimeo read the same key). The person already asked to play. |
