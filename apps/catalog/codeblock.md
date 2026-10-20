# CodeBlock

Read-only code display, with line numbers and syntax colors when you pass the highlighter.

## Usage

```tsx
import {CodeBlock} from "@aurea-uds/react";
```

```tsx
import {CodeBlock} from "@aurea-uds/react";
import {highlightCode} from "@aurea-uds/react/code-highlight";

<CodeBlock language="tsx" copyable lineNumbers highlight={highlightCode}>
  {code}
</CodeBlock>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `string` | — | The code, as a string and not as nodes: it goes verbatim inside <code>, so whitespace and line breaks are yours to control. |
| `language` | `string` | text | Written to data-language, which labels the block, and handed to `highlight`, which picks the grammar by it: tsx, ts, jsx, js, css, html, json and bash. |
| `copyable` | `boolean` | false | Draws the copy button. The copying itself lives in the core's aurea.js, so React and plain HTML share one implementation instead of two that drift. |
| `preview` | `ReactNode` | — | The live example of the code. With it, the block becomes the example box of Aurea's site: the Preview \| Code tabs (a segmented control across the width; arrows, Home and End move between them), the preview on the recessed surface and the code without a frame. |
| `lineNumbers` | `boolean` | false | Shows the number of each line on the left, in a 16px column 24px from the code. The column grows with the digits of the last line, so it does not jump at line 100. The number is drawing: it is not in the copied text and not read by screen readers. |
| `highlight` | `CodeHighlighter` | — | Colors the code. Pass `highlightCode` from `@aurea-uds/react/code-highlight`; its grammars are optional peers (@lezer/javascript, @lezer/css, @lezer/html, @lezer/json, @codemirror/legacy-modes). A language it does not know comes back plain. The colors are the same as the CodeEditor's, mixed 20% with the text so each one reads at 4.5:1 or more on the block. |
| `className` | `string` | — | Lands on the outer element either way — on the <pre> when plain, on the wrapper when copyable. |
