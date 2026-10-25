# ConfirmDialog

Alert dialog for a decision that cannot be taken back.

## Usage

```tsx
import {ConfirmDialog} from "@aurea-uds/react";
```

```tsx
<Button variant="danger" onClick={() => setOpen(true)}>Delete article</Button>

<ConfirmDialog
  open={open}
  title="Delete this article?"
  description="It leaves the site immediately, and this cannot be undone."
  confirmLabel="Delete"
  destructive
  icon="trash"
  onConfirm={() => { remove(); setOpen(false); }}
  onCancel={() => setOpen(false)}
/>
```

## Examples

### Placement

The same four places as Dialog: auto (bottom on a phone, centre from 640 up), bottom, center and top.

```tsx
<ConfirmDialog open={open} title="Placement auto" description="This confirmation opens at auto." placement="auto" onConfirm={confirm} onCancel={close} />
<ConfirmDialog open={open} title="Placement bottom" description="This confirmation opens at bottom." placement="bottom" onConfirm={confirm} onCancel={close} />
<ConfirmDialog open={open} title="Placement center" description="This confirmation opens at center." placement="center" onConfirm={confirm} onCancel={close} />
<ConfirmDialog open={open} title="Placement top" description="This confirmation opens at top." placement="top" onConfirm={confirm} onCancel={close} />
```

### Icon tones

The colour of the circle behind the icon. destructive picks danger on its own.

```tsx
<ConfirmDialog open={open} title="Icon tone neutral" description="The circle behind the icon is neutral." icon="info" iconTone="neutral" onConfirm={confirm} onCancel={close} />
<ConfirmDialog open={open} title="Icon tone brand" description="The circle behind the icon is brand." icon="info" iconTone="brand" onConfirm={confirm} onCancel={close} />
<ConfirmDialog open={open} title="Icon tone info" description="The circle behind the icon is info." icon="info" iconTone="info" onConfirm={confirm} onCancel={close} />
<ConfirmDialog open={open} title="Icon tone success" description="The circle behind the icon is success." icon="info" iconTone="success" onConfirm={confirm} onCancel={close} />
<ConfirmDialog open={open} title="Icon tone warning" description="The circle behind the icon is warning." icon="info" iconTone="warning" onConfirm={confirm} onCancel={close} />
<ConfirmDialog open={open} title="Icon tone danger" description="The circle behind the icon is danger." icon="info" iconTone="danger" onConfirm={confirm} onCancel={close} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | REQUIRED. You own the state, as in Dialog and Drawer. |
| `title` | `ReactNode` | — | REQUIRED. The question, in the words of the thing at stake — "Delete this article?", not "Are you sure?". |
| `description` | `ReactNode` | — | REQUIRED, and it is a prop rather than children because it is the node behind aria-describedby: only what goes through it gets announced. Say what is lost and whether it comes back. |
| `confirmLabel` | `string` | "Continue" | Name the action, not the agreement: "Delete" tells the reader what the button does; "OK" makes them remember the title. |
| `cancelLabel` | `string` | "Cancel" | The way out. It is the focused control when the dialog opens. |
| `destructive` | `boolean` | false | Turns the confirm button danger. Use it when the action destroys data — not for merely important ones, or the colour stops meaning anything. |
| `onConfirm` | `() => void` | — | REQUIRED. Fires only on the confirm button. Nothing else in this dialog can reach it. |
| `onCancel` | `() => void` | — | REQUIRED. Fires on the cancel button and on Escape. A click outside does NOT close this dialog — that is the difference from Dialog, and it is why an accidental click cannot answer for the user. |
| `icon` | `IconName` | — | An icon in a 40 circle above the title, as in the reference library's alert dialog. |
| `iconTone` | `"neutral" \| "brand" \| "info" \| "success" \| "warning" \| "danger"` | destructive ? "danger" : "neutral" | The circle's colour. Left out, it follows destructive. |
| `placement` | `"auto" \| "center" \| "top" \| "bottom"` | "auto" | Where it sits; auto is at the bottom on a phone and in the middle from 640 up. |
