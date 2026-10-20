# Collapsible

One section that opens and closes, with the open state owned by the app.

## Usage

```tsx
import {Collapsible} from "@aurea-uds/react";
```

```tsx
<Collapsible trigger="Advanced options" defaultOpen>
  <p>Everything here is optional.</p>
</Collapsible>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `ReactNode` | — | What you click to open and close. It becomes the button, and the chevron is added in front of it. |
| `children` | `ReactNode` | — | The panel's content. It stays in the DOM when closed, so in-page search still finds it. |
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | false | Starts open without controlling it. Do not switch this after mount on an uncontrolled Collapsible — the engine warns about it in as many words. |
| `onOpenChange` | `(open: boolean) => void` | — | Fires with the new state, from the trigger or from the keyboard. |
| `disabled` | `boolean` | false | The trigger stays focusable and inert, so keyboard users still find out the section exists. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin — your class wins on a tie. |
