# Dialog

Modal surface that interrupts for a focused task.

## Usage

```tsx
import {Dialog} from "@aurea-uds/react";
```

```tsx
<Button variant="danger" onClick={() => setOpen(true)}>Delete project</Button>

<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Delete project"
  icon="trash"
  iconTone="danger"
  footer={<><Button variant="tertiary" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="danger" onClick={remove}>Delete</Button></>}
>
  This removes every component and token in it. It cannot be undone.
</Dialog>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled, always. The dialog never closes itself; it asks, through onClose, and you decide. Two sources for one piece of state is how a dialog gets stuck open. |
| `title` | `ReactNode` | — | Rendered as the <h2> in the header and used as the accessible name. Required: a modal with no name announces only "dialog". |
| `children` | `ReactNode` | — | The body. It is the part that scrolls; the header and footer stay put. |
| `footer` | `ReactNode` | — | The actions row. Leave it out and the footer is not rendered at all, rather than rendered empty. |
| `onClose` | `() => void` | — | Called by Escape, by the backdrop, and by the close button — one exit for the three, so a dialog cannot be dismissable one way and not another. |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| "full"` | "md" | The width: the reference library's four — xs 320, sm 384, md 448 (the default) and lg 512 —, xl (1024, the --breakpoint-lg token) for a wide detail view, and full: the screen minus the usual margin, keeping the 22 radius. |
| `dismissible` | `boolean` | true | false keeps the dialog open during an operation: no Escape, no click outside, and the close button is DISABLED rather than hidden, so the header does not move mid-operation. |
| `icon` | `IconName` | — | An icon in a 40 circle above the title, as in the reference library. Decorative: the title says what the dialog is. |
| `iconTone` | `"neutral" \| "brand" \| "info" \| "success" \| "warning" \| "danger"` | "neutral" | The circle's colour: the state colours (the *-bg fill and the -400 glyph, ADR-0061), or brand — the light yellow wash with the yellow-as-text glyph. |
| `placement` | `"auto" \| "center" \| "top" \| "bottom"` | "auto" | Where the dialog sits. auto, the reference library's default: at the BOTTOM on a phone (below 640, where the thumb reaches) and in the middle from 640 up. |
