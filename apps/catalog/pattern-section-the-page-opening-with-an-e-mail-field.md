# The page opening with an e-mail field

actions takes anything: here, the e-mail field with its button, inside a form. The field keeps its name for the screen reader (aria-label), because the placeholder is not a label.

## Usage

```tsx
import {Section, InputGroup, Input, Button} from "@aurea-uds/react";
```

```tsx
<Section
  variant="hero"
  title="Get the monthly notes"
  description="One e-mail a month with what changed. No spam."
  actions={
    <form onSubmit={subscribe}>
      <InputGroup>
        <Input type="email" name="email" autoComplete="email" aria-label="E-mail address" placeholder="you@example.com" required />
        <InputGroupAddon side="end" layout="inline">
          <Button type="submit" variant="primary" size="sm">Subscribe</Button>
        </InputGroupAddon>
      </InputGroup>
    </form>
  }
/>
```
