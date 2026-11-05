# Education

Lessons, assessment and progress: progress is readable without relying on color and media always has captions or a transcript.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Button, Progress, DataList, Stepper, Accordion, RadioGroup, Radio, Alert} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Accordion, Alert, Button, Card, DataList, Heading, Progress, Radio, RadioGroup, Separator, Status, Stepper} from "@aurea-uds/react";

export function Lesson({lessons, parts, question}) {
  const [done, setDone] = useState(2);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const right = answer === question.correct;

  return (
    <Card>
      <header>
        <Heading level={3}>Lesson {done + 1} · {lessons[done]}</Heading> <Status variant="info">In progress</Status>
        <Button variant="primary" disabled={!checked || !right}
          onClick={() => { setDone(d => d + 1); setAnswer(""); setChecked(false); }}>Mark as complete</Button>
      </header>
      <Separator />

      <Stepper label="Lessons" items={lessons.map((l, i) => ({label: l, state: i < done ? "done" : i === done ? "active" : "default"}))} />
      <Accordion variant="surface" defaultValue={[parts[0].id]} items={parts} />
      <RadioGroup label={question.text} value={answer} onValueChange={v => { setAnswer(v); setChecked(false); }}>
        {question.options.map(o => <Radio key={o.value} value={o.value} label={o.label} />)}
      </RadioGroup>
      <Button appearance="soft" tone="brand" disabled={!answer} onClick={() => setChecked(true)}>Check the answer</Button>
      {checked && <Alert variant={right ? "success" : "warning"} title={right ? "Right" : "Not quite"}>{question.why}</Alert>}

      <div>
        <Progress value={done / lessons.length * 100} label="Module progress" showLabel />
      </div>
    </Card>
  );
}
```
