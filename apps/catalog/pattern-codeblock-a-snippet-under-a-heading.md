# A snippet under a heading

The shape every documentation page repeats: a sentence that says what the code does, then the code. The block keeps its own horizontal scroll, so a long line never widens the page around it.

## Usage

```tsx
import {Card, CodeBlock} from "@aurea-uds/react";
```

```tsx
<Card>
  <h3>Set the theme from the server</h3>
  <p className="muted">Write it on the root element so the first paint is already right.</p>
  <CodeBlock language="tsx" copyable>{snippet}</CodeBlock>
</Card>
```
