# useToast

Raise a transient notification from anywhere inside AureaProvider.

## Usage

```tsx
import {useToast} from "@aurea-uds/react";
```

```tsx
const toast = useToast();

<Button onClick={() => toast.add({title: "Saved", type: "success"})}>
  Save
</Button>

// with a line under the title and an action
toast.add({title: "Conversation deleted", actionProps: {children: "Undo", onClick: restore}});

// a promise: spins while it runs, then success or error
toast.promise(send(), {loading: "Sending…", success: "Sent", error: "Could not send"});

// where the stack lives (the default is the bottom middle)
<AureaProvider toastPlacement="top-end">…</AureaProvider>
```
