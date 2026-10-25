# FileInput

FileInput collects files by click or by drop, refuses what does not fit before anything is sent, and — when you give it an upload function — runs the real transfer with progress, cancel and retry. The type and size checks run on the DROP too, not only in the picker dialog, which is where most implementations let the wrong file through.

## Usage

```tsx
import {FileInput} from "@aurea-uds/react";
```

```tsx
<FileInput label="Attachments" hint="PDF or PNG, up to 5 MB"
  accept=".pdf,.png" maxSize={5 * 1024 * 1024} multiple
  onFilesChange={setFiles} />
```

- accept and maxSize are enforced on drop as well as on pick — the dialog filter is not a guarantee.

- A refused file says why, in words: wrong type or over the limit, from the i18n dictionary.

- upload() drives real progress per file, with cancel and retry, and announces the outcome.

- Added and removed files are announced through a live region, so the list is never silent.

- A restored item shows its receipt and offers removal, never a retry button that would fail.

- The previews show the RESTING states; progress, pause and retry only move in a real app.

## Examples

### Real upload

With upload() it owns progress, cancel and retry for each file.

```tsx
<FileInput label="Import" accept=".csv" maxSize={2000000}
  upload={async (file, {onProgress, signal}) => {
    await put(file, {onProgress, signal});
  }} />
```

### A queue that survived the page

initialQueue restores the receipt of what failed — and offers no retry, because a file that came back from storage has no bytes to send.

```tsx
<FileInput
  label="Attachments"
  initialQueue={[
    {id: "f0", name: "contacts.csv", bytes: 84210, status: "error", progress: 0.42},
  ]}
  onQueueChange={save} />
```

### One file only

Without multiple, a new pick replaces the previous file instead of stacking.

```tsx
<FileInput label="Avatar" accept="image/png,image/jpeg" maxSize={512000} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `accept` | `string` | — | MIME types or extensions, checked on drop too — not only in the picker dialog. |
| `maxSize` | `number` | — | Limit in bytes. Over it the file is refused with a readable message, not silently. |
| `multiple` | `boolean` | false | More than one file per pick. |
| `onFilesChange` | `(files: File[]) => void` | — | Fires with the accepted list, after filtering by type and size. |
| `upload` | `(ctx: UploadContext) => Promise<void>` | — | Real upload with progress, cancel and retry. Without it the component only collects files. |
| `label` | `string` | — | Names the drop zone. |
| `hint` | `ReactNode` | — | What is accepted, in words, beside the zone. |
| `initialQueue` | `FileQueueItem[]` | — | Restores a queue you persisted earlier — id, name, bytes, status and progress, all plain data. It is INITIAL and not controlled, and the word is literal: a `File` does not come back from storage, so a restored item has the record and not the bytes. It can be shown and removed, never re-sent, and the Retry button is hidden on it rather than offered and broken. An item restored with an ACTIVE status (pending, uploading, paused) is normalised to `canceled`, because without the bytes it is neither uploading nor able to: before 2026-08-12 it showed inert Pause/Resume/Cancel buttons and counted as in-flight, which held the receipt back forever (AUD-0006). Ids you pass are respected and new ids skip them, so `f0` from a restored queue no longer collides with the first file added (AUD-0002). |
| `onQueueChange` | `(queue: FileQueueItem[]) => void` | — | Fires on every change to the queue, in serialisable form. Where you persist it — local storage, a server, nowhere — is yours, the same boundary the grid draws for its URL state. |
| `preview` | `boolean` | false | Shows a thumbnail for image files, in the same slot the document icon occupies — the row does not change height because of it. Only images: generating an object URL for a 40 MB PDF shows nothing. The URL is revoked whenever the item LEAVES the queue — removed, replaced in single mode, or replaced by a name conflict — and any survivor is revoked on unmount. The browser holds the bytes until someone says otherwise, and until 2026-08-12 only the remove path revoked (AUD-0009). |
| `checksum` | `boolean` | false | Computes SHA-256 of each file with the Web Crypto API — no dependency — shows the first eight digits and puts the whole value in the queue. Opt-in and not the default for two measured reasons: `crypto.subtle` only exists in a secure context (https or localhost), and the digest needs the WHOLE file in memory, because Web Crypto has no streaming hash. If your `upload` resolves with `{checksum}`, the two are compared and a mismatch fails the item: bytes that differ are not a detail. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin — your class wins on a tie. |
| `id` | `string` | — | Id of the focusable control, which is what a <label htmlFor> has to point at. Generated when you do not pass one. |
