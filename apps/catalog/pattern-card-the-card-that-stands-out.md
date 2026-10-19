# The card that stands out

The main card of a screen. In the light theme it is the dark theme's card; in the dark theme, the regular card (the yellow outline went with the lines in 0.34.0). Inside it the whole dark theme applies, so text, badges and buttons adjust by themselves. Not for a list of choices: in the dark theme its outline is close to `selected`.

## Usage

```tsx
import {Card, Badge} from "@aurea-uds/react";
```

```tsx
<Card variant="contrast">
  <div className="cluster" style={{justifyContent:"space-between"}}>
    <strong>Main vehicle</strong>
    <Badge size="xs" variant="success">UP TO DATE</Badge>
  </div>
  <p>18,420 km</p>
</Card>
```
