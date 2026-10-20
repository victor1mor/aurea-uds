# Destructive confirmation

The pause before something irreversible. The title asks the question, the body says what is lost, and the confirming button carries the danger tone — never the cancel.

## Usage

```tsx
import {Dialog, Button} from "@aurea-uds/react";
```

```tsx
const [open, setOpen] = useState(false);

<Button appearance="outline" tone="danger" onClick={() => setOpen(true)}>Delete project</Button>

<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Delete this project?"
  footer={<>
    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    <Button appearance="solid" tone="danger" onClick={remove}>Delete</Button>
  </>}
>
  Every run, dataset and share link goes with it. This cannot be undone.
</Dialog>
```
