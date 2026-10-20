# Developer tools

Dev IDE/platform: workspace, files, editor, terminal, tests, builds and artifacts. Every output correlates; a dangerous command shows its scope.

## Usage

```tsx
import {TreeView, CodeBlock, LogStream} from "@aurea-uds/react";
```

```tsx
<TreeView label="Files" defaultExpandedIds={["src"]} items={tree} onSelect={open} />
<CodeBlock language="tsx" copyable>{source}</CodeBlock>
<LogStream lines={terminal} />
```
