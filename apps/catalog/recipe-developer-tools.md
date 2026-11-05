# Developer tools

Dev IDE/platform: workspace, files, editor, terminal, tests, builds and artifacts. Every output correlates; a dangerous command shows its scope.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Button, TreeView, DataList, CodeBlock, CodeEditor, LogStream} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Button, Card, CodeBlock, DataList, Heading, LogStream, Separator, Status, TreeView} from "@aurea-uds/react";
import {CodeEditor} from "@aurea-uds/react/code-editor";

export function Workbench({files, tree, runTests}) {
  const [open, setOpen] = useState(Object.keys(files)[0]);
  const [editing, setEditing] = useState(false);
  const [lines, setLines] = useState([]);

  return (
    <Card>
      <header>
        <Heading level={3}>{open}</Heading> <Status variant={editing ? "warning" : "success"}>{editing ? "Editing" : "Saved"}</Status>
        <Button variant="secondary" onClick={() => setEditing(e => !e)}>{editing ? "Done" : "Edit"}</Button>
        <Button variant="primary" leadingIcon="play" onClick={async () => setLines(l => [...l, ...await runTests()])}>Run tests</Button>
      </header>
      <Separator />

      <Card variant="inset">
        {editing
          ? <CodeEditor key={open} defaultValue={files[open]} ariaLabel={`Edit ${open}`} />
          : <CodeBlock key={open} filename={open} copyable lineNumbers>{files[open]}</CodeBlock>}
      </Card>
      <Card variant="outline"><LogStream lines={lines} /></Card>

      <div>
        <TreeView label="Files" items={tree} selectedId={open} onSelect={node => files[node.id] && setOpen(node.id)} />
        <DataList items={[{term: "Lines", value: files[open].split("\n").length}]} />
      </div>
    </Card>
  );
}
```
