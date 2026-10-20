# Docs · CMS

Content authoring: edit, version, publish. Draft and published are distinct, visible states.

## Usage

```tsx
import {Card, Badge, Field, Input, Textarea, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <Badge variant="warning">Draft</Badge>
  <Field label="Title"><Input defaultValue="Measuring instead of counting" /></Field>
  <Field label="Body" hint="Markdown."><Textarea rows={3} /></Field>
  <Button variant="ghost">Save draft</Button>
  <Button variant="primary">Publish</Button>
</Card>
```
