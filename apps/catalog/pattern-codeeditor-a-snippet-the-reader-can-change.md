# A snippet the reader can change

An editor, not a code block: the reader types. Use it where the change is the point — a query, a config, a rule — and use CodeBlock everywhere else, because a read-only editor costs a bundle it does not earn.

## Usage

```tsx
import {CodeEditor} from "@aurea-uds/react";
```

```tsx
<CodeEditor defaultValue={`select count(*)
from runs
where status = 'failed'`} />
```
