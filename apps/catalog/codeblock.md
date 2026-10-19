# CodeBlock

Read-only syntax-highlighted code display.

## Usage

```tsx
import {CodeBlock} from "@aurea-uds/react";
```

```tsx
<CodeBlock language="tsx" copyable>
  {'import {Button} from "@aurea-uds/react";'}
</CodeBlock>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `string` | — | The code, as a string and not as nodes: it goes verbatim inside <code>, so whitespace and line breaks are yours to control. |
| `language` | `string` | text | Written to data-language, which is what labels the block. It does not highlight — the component is a display, not a parser. |
| `copyable` | `boolean` | false | Draws the copy button. The copying itself lives in the core's aurea.js, so React and plain HTML share one implementation instead of two that drift. |
| `preview` | `ReactNode` | — | The live example of the code. With it, the block becomes the example box of Aurea's site: the Preview \| Code tabs (a segmented control across the width; arrows, Home and End move between them), the preview on the recessed surface and the code without a frame. |
| `className` | `string` | — | Lands on the outer element either way — on the <pre> when plain, on the wrapper when copyable. |
