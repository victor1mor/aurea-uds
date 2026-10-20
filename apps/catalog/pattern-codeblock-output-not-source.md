# Output, not source

`language="text"` is the default for a reason: not everything in a block is code. A stack trace or a command's output is quoted verbatim, and pretending it is a language would colour tokens that are not tokens.

## Usage

```tsx
import {CodeBlock} from "@aurea-uds/react";
```

```tsx
<CodeBlock>{stderr}</CodeBlock>
```
