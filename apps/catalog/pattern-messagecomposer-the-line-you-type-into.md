# The line you type into

One field and one send. The icon is optional and the field does not reserve space for one that is not there — a defect this component actually shipped with, and the reason the InputGroup exists.

## Usage

```tsx
import {MessageComposer} from "@aurea-uds/react";
```

```tsx
<MessageComposer
  label="Message"
  placeholder="Message the team…"
  sendLabel="Send"
  onSend={text => post(text)}
/>
```
