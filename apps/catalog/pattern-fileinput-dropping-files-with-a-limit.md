# Dropping files with a limit

The limits are written before the mistake, not after it: type and size are on the field, so the refusal never surprises. Dropping and clicking reach the same input, because a drop zone that is not also a button is unusable by keyboard.

## Usage

```tsx
import {FileInput} from "@aurea-uds/react";
```

```tsx
<FileInput
  label="Attachments"
  hint="PDF or PNG, up to 5 MB each"
  accept=".pdf,.png"
  maxSize={5 * 1024 * 1024}
  multiple
  onFilesChange={setFiles}
/>
```
