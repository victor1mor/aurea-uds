# A step that can be skipped

`optional` says out loud what a greyed-out label only implies. Marking it is what lets a reader decide to move on, instead of hunting for the field they think they missed.

## Usage

```tsx
import {Stepper} from "@aurea-uds/react";
```

```tsx
<Stepper label="Onboarding" items={[
  {label: "Account", state: "done"},
  {label: "Team", state: "done", optional: "Skipped"},
  {label: "Import data", state: "active", optional: "Optional"},
  {label: "Finish"},
]} />
```
