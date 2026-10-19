# Who is on this run

Overlapping faces plus a count for the rest. The cutoff exists because a row of twelve avatars stops being information and becomes texture — the number carries what the faces no longer can.

## Usage

```tsx
import {AvatarGroup, Avatar} from "@aurea-uds/react";
```

```tsx
<AvatarGroup max={3} total={9} label="Participants">
  <Avatar fallback="ME" alt="Messenger" />
  <Avatar fallback="AN" alt="Analyst" />
  <Avatar fallback="CU" alt="Curator" />
  <Avatar fallback="WR" alt="Writer" />
</AvatarGroup>
```
