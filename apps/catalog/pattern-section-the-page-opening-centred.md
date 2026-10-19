# The page opening, centred

align="center" puts everything on the middle line, with the image (if any) under the text. What comes inside the Section goes after the buttons: a short note, a link.

## Usage

```tsx
import {Section, Badge, Button} from "@aurea-uds/react";
```

```tsx
<Section
  variant="hero"
  align="center"
  eyebrow={<Badge tone="primary" emphasis="flat">Version 2.0 is out</Badge>}
  title="One design system. Web and native."
  description="The same look on both sides, made for people who see little."
  actions={<>
    <Button variant="primary" href="/start">Get started</Button>
    <Button variant="outline" href="/components">View components</Button>
  </>}
>
  <Link href="/github">Open source on GitHub</Link>
</Section>
```
