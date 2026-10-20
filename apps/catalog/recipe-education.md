# Education

Lessons, assessment and progress: progress is readable without relying on color and media always has captions or a transcript.

## Usage

```tsx
import {Card, Progress, Accordion, Badge, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <Progress value={60} label="Module progress" />
  <Badge variant="success">3 of 5 lessons</Badge>
  <Accordion items={[
    {id: "l1", title: "Lesson 1 · Tokens", content: "Every visual value has a name."},
    {id: "l2", title: "Lesson 2 · Density", content: "What density governs, and what it does not."},
  ]} />
  <Button variant="primary">Continue</Button>
</Card>
```
