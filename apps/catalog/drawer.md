# Drawer

Panel that slides in from a screen edge.

## Usage

```tsx
import {Drawer} from "@aurea-uds/react";
```

```tsx
<Button onClick={() => setOpen(true)}>Edit member</Button>

<Drawer open={open} onClose={() => setOpen(false)} title="Edit member" side="right"
  footer={<Button variant="primary">Save</Button>}>
  <Field label="Name"><Input defaultValue="Analyst" /></Field>
</Drawer>

// On a phone, the panel that rises from the bottom (swipe down to close):
<Drawer open={open} onClose={() => setOpen(false)} title="Filters" side="bottom">…</Drawer>
```

## Examples

### Sides

Which edge the panel comes from. bottom is the sheet that rises on a phone, with a 32 corner.

```tsx
<Drawer open={open} onClose={close} title="Side right" side="right">…</Drawer>
<Drawer open={open} onClose={close} title="Side left" side="left">…</Drawer>
<Drawer open={open} onClose={close} title="Side top" side="top">…</Drawer>
<Drawer open={open} onClose={close} title="Side bottom" side="bottom">…</Drawer>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled, same contract as Dialog. |
| `title` | `ReactNode` | — | The <h2> in the header, and the accessible name. |
| `children` | `ReactNode` | — | The panel body. |
| `footer` | `ReactNode` | — | The actions row, at the end, with 8 between the buttons. Left out, there is no footer. |
| `onClose` | `() => void` | — | Escape, backdrop and close button all route here. |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | right | The edge it slides from — all four, as in the reference library; bottom is the panel that rises on a phone. left/right are PHYSICAL sides. The side ones are 320 wide on a phone and 384 from 640 up (never more than 85% of the screen), with the 22 corner on the inner side; top and bottom take the full width and up to 85% of the height, with the 32 sheet corner and the 36 × 4 handle. A swipe toward its edge closes it. The default is right (the reference library's is bottom). |
