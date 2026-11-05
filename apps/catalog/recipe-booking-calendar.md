# Booking · calendar

Book a time slot: availability, customer details, payment and confirmation.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Heading, Badge, Calendar, RadioGroup, Radio, Field, Input, DataList, Button, Alert} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Alert, Badge, Button, Card, DataList, Field, Heading, Input, Radio, RadioGroup, Separator} from "@aurea-uds/react";
import {Calendar} from "@aurea-uds/react/calendar";

export function Booking({slotsFor, timeZone, today}) {
  const [day, setDay] = useState(new Date(2026, 10, 12));
  const [time, setTime] = useState(slotsFor(day)[0]);
  const [name, setName] = useState("");
  const [booked, setBooked] = useState(false);

  return (
    <Card>
      <header>
        <Heading level={3}>Book a 30-minute demo</Heading> <Badge tone="info">{timeZone}</Badge>
      </header>
      <Separator />

      {booked && <Alert variant="success" title="You are booked">{format(day)} at {time}.</Alert>}

      <Calendar mode="single" label="Day" selected={day}
        onSelect={d => { setDay(d); setTime(slotsFor(d)[0]); }}
        disabled={[{before: today}, {dayOfWeek: [0, 6]}]} />
      <RadioGroup label={`Free on ${format(day)}`} variant="card" value={time} onValueChange={setTime}>
        {slotsFor(day).map(t => <Radio key={t} value={t} label={t} description="30 min" />)}
      </RadioGroup>
      <Field label="Your name"><Input value={name} onChange={e => setName(e.target.value)} /></Field>

      <div>
        <DataList items={[{term: "Day", value: format(day)}, {term: "Time", value: time}]} />
      </div>
      <Separator />
      <footer>
        <Button variant="primary" disabled={!name || booked} onClick={() => setBooked(true)}>Confirm booking</Button>
      </footer>
    </Card>
  );
}
```
