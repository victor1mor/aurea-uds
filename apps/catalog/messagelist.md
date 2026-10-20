# MessageList

Scrolling list of conversation messages.

## Usage

```tsx
import {MessageList} from "@aurea-uds/react";
```

```tsx
<MessageList messages={[
  {id: "1", author: "Analyst", time: "09:12", body: "The sweep is green.", avatar: {fallback: "AN"}},
  {id: "2", author: "You", time: "09:14", body: "Shipping it.", status: {label: "sent", variant: "success"}},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `messages` | `ChatMessage[]` | — | The conversation, as data: {id, body, author?, time?, avatar?, status?}. Transport and state are yours; this renders. A message may also carry direction ("incoming" \| "outgoing"), forwardedFrom, replyTo {id, author?, body}, attachments [{id, kind: "image" \| "video" \| "file", src?, alt?, name?, bytes?, duration?, href?}], edited and day. Photos and videos become an album in the Gallery (zoom included); files become FileInput's row, with a download link when href is given. A day separator appears whenever day changes from one message to the next; its text is the app's. |
| `hasMoreBefore` | `boolean` | false | There are older messages above. A row at the top (the measure of the reference library's load-more table row) calls onReachStart when it enters the screen. |
| `onReachStart` | `() => void` | — | Load older messages. When they arrive on top, the message that was at the top of the screen stays exactly where it was. Turns the window on. |
| `loadingBefore` | `boolean` | false | Older messages are on their way: the top row shows the Spinner, the list is aria-busy, and onReachStart is not called again until it ends. |
| `hasMoreAfter` | `boolean` | false | There are newer messages below that the app dropped to keep its window small (about a thousand). The bottom row calls onReachEnd. |
| `onReachEnd` | `() => void` | — | Bring newer messages back. Turns the window on. |
| `loadingAfter` | `boolean` | false | Newer messages are on their way: the bottom row shows the Spinner. |
| `onOpenAttachment` | `(message: ChatMessage, attachment: MessageAttachment) => void` | — | Called when a photo or video of an album is clicked, instead of the built-in zoom — for a player, or the app's own viewer. |
| `label` | `string` | "Conversation" | Accessible name of the log region. Name it when a page holds more than one conversation. |
| `className` | `string` | — | On the container, which is also the live region. |
