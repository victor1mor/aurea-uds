# AvatarGroup

Overlapping stack of avatars, with a count for the ones that do not fit.

## Usage

```tsx
import {AvatarGroup} from "@aurea-uds/react";
```

```tsx
<AvatarGroup max={3} total={9} label="Reviewers">
  <Avatar fallback="AM" />
  <Avatar fallback="CT" />
  <Avatar fallback="RS" />
  <Avatar fallback="JP" />
</AvatarGroup>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | none | REQUIRED. The Avatar elements. They overlap in source order. |
| `max` | `number` | none | How many to show. The rest become a single count. Without it, every avatar is shown. |
| `total` | `number` | the number of children | Use when the real total lives on the server and only a page of avatars was sent. |
| `label` | `string` | none | Whose faces these are. A row of portraits with no name says nothing. |
| `size` | `sm \| md \| lg` | md | Size of the count bubble, so it matches the avatars beside it — pass the same value you passed them. The scale is Avatar's. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin — your class wins on a tie. |
