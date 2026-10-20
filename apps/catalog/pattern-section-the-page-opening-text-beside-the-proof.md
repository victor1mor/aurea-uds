# The page opening, text beside the proof

variant="hero" is the opening of a page: an eyebrow, the title (the page's h1), a line of text, the buttons, and the image beside it. The title grows with the width of the band, not of the window — 36, then 60 from 768 and 72 from 1024 — and the image sits beside the text from 1024; below that, it goes under. The image takes the width of its column: size it in the app.

## Usage

```tsx
import {Section, Badge, Button, Image} from "@aurea-uds/react";
```

```tsx
<Section
  variant="hero"
  eyebrow={<Badge tone="primary" emphasis="flat">New in 2.0</Badge>}
  title="Plan the week in one screen"
  description="Tasks, people and dates side by side, on the web and on the phone."
  actions={<>
    <Button variant="primary" href="/start">Get started</Button>
    <Button variant="outline" href="/tour">Take the tour</Button>
  </>}
  media={<Image src="/week.png" alt="The app's week view" ratio="4/3" />}
/>
```
