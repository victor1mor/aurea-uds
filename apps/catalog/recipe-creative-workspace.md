# Creative workspace

Canvas, assets, versions and comments: every canvas operation has an outline alternative and versions compare and restore.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Button, RadioGroup, Radio, DataList, Image, ColorSwatch, MessageList, MessageComposer} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Button, Card, ColorSwatch, DataList, Heading, Image, MessageComposer, MessageList, Radio, RadioGroup, Separator, Status} from "@aurea-uds/react";

export function Review({art, versions, initialComments, approve}) {
  const [version, setVersion] = useState(versions[0].id);
  const [comments, setComments] = useState(initialComments);
  const [approved, setApproved] = useState(null);
  const v = versions.find(x => x.id === version);

  return (
    <Card>
      <header>
        <Heading level={3}>{art.name}</Heading> <Status variant={approved ? "success" : "warning"}>{approved ? "Approved" : "In review"}</Status>
        <Button variant="primary" onClick={async () => { await approve(version); setApproved(version); }}>Approve {version}</Button>
      </header>
      <Separator />

      <Image src={v.src} alt={`${art.name}, ${v.label}`} ratio="16/9" />
      <ColorSwatch label="Palette" name="palette" options={art.palette} showLabels />
      <MessageList label={`Comments on ${version}`} messages={comments[version]} />
      <MessageComposer label={`Comment on ${version}`}
        onSend={body => setComments(c => ({...c, [version]: [...c[version], {id: crypto.randomUUID(), author: "You", body}]}))} />

      <div>
        <RadioGroup label="Version" labelHidden value={version} onValueChange={setVersion}>
          {versions.map(x => <Radio key={x.id} value={x.id} label={x.label} description={x.time} />)}
        </RadioGroup>
        <DataList items={[{term: "Size", value: art.size}, {term: "Format", value: art.format}]} />
      </div>
    </Card>
  );
}
```
