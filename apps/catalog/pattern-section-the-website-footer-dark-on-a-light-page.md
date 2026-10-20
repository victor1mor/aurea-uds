# The website footer, dark on a light page

variant="footer" turns the band into the footer: brand, link columns and the legal line, already inside a Container. It keeps the band's theme, so a dark footer on a light page is theme="dark". On a phone everything stacks.

## Usage

```tsx
import {Section} from "@aurea-uds/react";
```

```tsx
<Section
  variant="footer"
  theme="dark"
  spacing="sm"
  brand={<strong>Acme</strong>}
  links={columns}
  legal="© 2026 Acme. All rights reserved."
  navLabel="Footer"
/>
```
