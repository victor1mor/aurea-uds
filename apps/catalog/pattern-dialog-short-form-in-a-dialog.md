# Short form in a dialog

A dialog is the right home for a form only when it is short enough to fit without scrolling. The primary action repeats the verb of the title, so the user never has to re-read what they are confirming.

## Usage

```tsx
import {Dialog, Field, Input, Button} from "@aurea-uds/react";
```

```tsx
<Dialog
  open={open}
  onClose={close}
  title="Invite a teammate"
  footer={<>
    <Button variant="ghost" onClick={close}>Cancel</Button>
    <Button variant="primary" type="submit" form="invite">Send invite</Button>
  </>}
>
  <form id="invite" onSubmit={send}>
    <Field label="Email" hint="They get access to this workspace only">
      <Input type="email" name="email" required />
    </Field>
  </form>
</Dialog>
```
