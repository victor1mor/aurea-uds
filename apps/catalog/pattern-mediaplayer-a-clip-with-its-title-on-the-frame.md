# A clip with its title on the frame

Title and subtitle ride on the player instead of above it, so the frame is self-contained wherever it is embedded. Every control is reachable by keyboard and announced from the string dictionary, which is what makes the player translatable.

## Usage

```tsx
import {MediaPlayer} from "@aurea-uds/react";
```

```tsx
<MediaPlayer
  kind="video"
  title="Aurea in ninety seconds"
  subtitle="Product tour · 1:30"
  poster="/poster.jpg"
  src="/tour.mp4"
/>
```
