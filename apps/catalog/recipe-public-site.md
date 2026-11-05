# Public site

Landing, docs, blog and portfolio: public content that reads without login and converts whoever arrives.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Button, DataList, Badge, SegmentedControl, Field, Input, Alert} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Alert, Badge, Button, Card, Field, Heading, Input, SegmentedControl, Text} from "@aurea-uds/react";

export function HomePage({plans, subscribe}) {
  const [period, setPeriod] = useState("monthly");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  return (
    <>
      <section>
        <Badge tone="primary">New</Badge>
        <Heading level={1}>Ship the interface, not the argument about it.</Heading>
        <Text tone="muted">One system, two themes, three densities.</Text>
        <Button variant="primary" trailingIcon="arrow-right" href="/start">Get started</Button>
        <Button appearance="soft" tone="brand" href="/docs">Read the docs</Button>
      </section>

      <section>
        <SegmentedControl label="Billing" value={period} onChange={setPeriod}
          items={[{value: "monthly", label: "Monthly"}, {value: "yearly", label: "Yearly · 2 months free"}]} />
        {plans.map(p => (
          <Card key={p.name}>
            <strong>{p.name}</strong> {p.recommended && <Badge tone="primary">Recommended</Badge>}
            <Text type="h3" numeric>{period === "monthly" ? p.monthly : p.yearly}</Text>
            <Button variant={p.recommended ? "primary" : "secondary"} href="/start">Start trial</Button>
          </Card>
        ))}
      </section>

      <section>
        {done ? <Alert variant="success" title="You are on the list">We will write once a month.</Alert> : (
          <>
            <Field label="Email" error={error}>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={error ? "true" : undefined} />
            </Field>
            <Button variant="primary" onClick={async () => {
              if (!email.includes("@")) return setError("Type an email like name@example.com.");
              await subscribe(email); setDone(true);
            }}>Subscribe</Button>
          </>
        )}
      </section>
    </>
  );
}
```
