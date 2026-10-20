# Advanced options, folded away

The defaults are enough for most people, so the rest starts closed. Folding is not hiding: the summary line says what is inside, so nobody has to open it to find out.

## Usage

```tsx
import {Accordion} from "@aurea-uds/react";
```

```tsx
<Accordion items={[
  {id: "retry", title: "Retries and timeouts", content: <RetryForm />},
  {id: "net", title: "Network and proxy", content: <NetworkForm />},
]} />
```
