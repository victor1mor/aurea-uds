# MessageComposer

Input surface for composing a message.

## Usage

```tsx
import {MessageComposer} from "@aurea-uds/react";
```

```tsx
<MessageComposer
  icon="chat"
  placeholder="Message the team…"
  onSend={text => send(text)}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `onSend` | `(text: string, details?: {files: File[]; replyToId?: string; editingId?: string}) => void` | — | Called with the trimmed text, then the field clears itself. Empty or whitespace-only never sends, and the send button stays disabled until there is something to send. The second argument exists only when attach, replyTo or editing is in use, so a call checked as onSend(text) still is exactly that. |
| `placeholder` | `string` | — | Hint inside the field. It is not the name — a placeholder disappears the moment you type. |
| `label` | `string` | "Message" | Accessible name of the input, which is what a screen reader reads. |
| `icon` | `IconName` | — | Glyph inside the field, before the text. |
| `sendLabel` | `string` | "Send" | Accessible name of the send button, which shows only an icon. |
| `disabled` | `boolean` | false | Disables the field and the button together. |
| `attach` | `boolean \| {accept?: string; maxSize?: number; multiple?: boolean}` | — | A paperclip inside the field opens the file picker. The chosen files sit above the field, inside the same frame, with FileInput's row (.file-item: name, size, a thumbnail for images, remove) and FileInput's filter and messages. Uploading is the app's: the files go out in onSend. With a file, an empty text can be sent. Hidden while editing. |
| `replyTo` | `{id: string; author?: ReactNode; body: ReactNode} \| null` | — | The message being answered, shown above the field as a quote (who, and its first line). The field takes focus. The id goes out in onSend as replyToId. |
| `onCancelReply` | `() => void` | — | The X on the quote, and Escape in the field. The app clears replyTo. |
| `editing` | `{id: string; body: string} \| null` | — | Edit mode: the old text fills the field, Send becomes Save, and the id goes out in onSend as editingId. When editing ends, the field is cleared — the old text does not stay as a draft. |
| `onCancelEdit` | `() => void` | — | The X on the quote, and Escape in the field. The app clears editing. |
| `className` | `string` | — | On the <form>. |
