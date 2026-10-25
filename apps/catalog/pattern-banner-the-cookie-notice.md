# The cookie notice

variant="consent" asks before setting cookies that are not necessary: reject them, accept all, or choose by category in a window. Rejecting is as easy to see as accepting — same weight, same place —, the optional categories start off, and after the choice the confirmation takes the focus. Put the notice at the top of the page, before the skip link, and do not fix it to the screen. To change the choice later, show it again from a link in the footer, with value set to what you stored.

## Usage

```tsx
import {Banner, Dialog, Switch, Link} from "@aurea-uds/react";
```

```tsx
<Banner
  variant="consent"
  categories={[
    {id: "necessary", label: "Necessary", description: "Sign-in, the cart, your cookie choice.", required: true},
    {id: "analytics", label: "Analytics", description: "Visits counted without saying who you are."},
    {id: "marketing", label: "Marketing", description: "Ads for what you saw here, on other sites."},
  ]}
  value={stored}
  onConsent={(choice) => store(choice)}
  onDismiss={() => setShown(false)}
>
  <p>We use necessary cookies to make this site work and, if you allow it, others to measure visits and show ads. <Link href="/privacy">Privacy policy</Link>.</p>
</Banner>
```
