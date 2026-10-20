# A step that failed

`state: "error"` keeps the failure in the sequence instead of replacing it with an alert somewhere else. The reader sees which step broke and how far they had got, which is the pair of facts they need to decide whether to fix or restart.

## Usage

```tsx
import {Stepper, Alert} from "@aurea-uds/react";
```

```tsx
<Stepper label="Deploy" items={[
  {label: "Build", state: "done"},
  {label: "Test", state: "error"},
  {label: "Release"},
]} />
<Alert variant="danger" title="Tests failed">Two suites did not pass.</Alert>
```
