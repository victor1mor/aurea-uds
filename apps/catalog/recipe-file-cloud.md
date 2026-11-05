# Files · cloud

Browse, transfer and restore files with verifiable integrity.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, TreeView, DataList, Progress, Button, DataGrid, FileInput} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Button, Card, Code, DataList, FileInput, Heading, Progress, Separator, Status, TreeView} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";

export function Files({folders, initialFiles, put}) {
  const [folder, setFolder] = useState(folders[0].id);
  const [files, setFiles] = useState(initialFiles);
  const [selected, setSelected] = useState(null);
  const inFolder = files.filter(f => f.folder === folder);
  const file = files.find(f => f.id === selected);

  return (
    <Card>
      <header><Heading level={3}>{folder}</Heading> <Status variant="success">All synced</Status></header>
      <Separator />

      <DataGrid label="Files" data={inFolder} getRowId={f => f.id}
        columns={[
          {accessorKey: "name", header: "Name", cell: ({row}) => <Button variant="link" onClick={() => setSelected(row.original.id)}>{row.original.name}</Button>},
          {accessorKey: "size", header: "Size"},
          {accessorKey: "state", header: "State", cell: ({getValue}) => <Status variant={variant[getValue()]}>{label[getValue()]}</Status>},
        ]} />
      <Card variant="outline">
        <FileInput label="Add files" multiple maxSize={10_000_000}
          upload={async (f, {onProgress, signal}) => {
            await put(f, {onProgress, signal});
            setFiles(all => [...all, {id: crypto.randomUUID(), folder, name: f.name, state: "uploaded"}]);
          }} />
      </Card>

      <div>
        <TreeView label="Folders" items={folders} selectedId={folder} onSelect={n => setFolder(n.id)} />
        {file && <DataList items={[{term: "Size", value: file.size}, {term: "Checksum", value: <Code>{file.sum}</Code>}]} />}
        {file?.state === "transferring" && <Progress value={file.progress} label="Transferring" showLabel />}
      </div>
    </Card>
  );
}
```
