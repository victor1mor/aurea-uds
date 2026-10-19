# Who this person is, without leaving the sentence

A name in running text is an identifier, not an identity. The card answers "who?" in place, and the profile page it previews stays one click away — the preview is a shortcut, never the only route.

## Usage

```tsx
import {HoverCard, Avatar, Badge} from "@aurea-uds/react";
```

```tsx
<HoverCard trigger={<a href="/people/analyst">Analyst</a>}>
  <div className="cluster">
    <Avatar fallback="AN" />
    <div>
      <strong>Analyst</strong>
      <p className="muted">Data · joined March 2026</p>
    </div>
  </div>
  <Badge variant="success">Available</Badge>
</HoverCard>
```
