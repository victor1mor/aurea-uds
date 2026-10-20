# CodeEditor

Editable code surface.

## Usage

```tsx
import {CodeEditor} from "@aurea-uds/react/code-editor";
```

```tsx
import {javascript} from "@codemirror/lang-javascript";

<CodeEditor
  defaultValue={'const total = items.reduce((n, i) => n + i.price, 0);'}
  extensions={[javascript()]}
  onChange={setSource}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `defaultValue` | `string` | "" | The starting document. Uncontrolled: it is read on mount and never again, so typing does not fight a re-render. |
| `onChange` | `(value: string) => void` | — | Fires on every document change. Held through a ref, which is why replacing the handler does not tear down the editor and lose the undo history. |
| `extensions` | `Extension[]` | — | Where your language goes. No language is bundled on purpose — pass @codemirror/lang-* and the weight, and the choice, stay yours. |
| `readOnly` | `boolean` | false | Reconfigured through a CodeMirror Compartment, so toggling it keeps the document, the selection and the history intact. |
| `ariaLabel` | `string` | "Code editor" | Accessible name of the editing area. It goes on the contenteditable itself, which is the element that takes focus. |
| `className` | `string` | — | On the host element that CodeMirror mounts into. |
