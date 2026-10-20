# Spinner

Indeterminate activity indicator for a wait with no known end.

## Usage

```tsx
import {Spinner} from "@aurea-uds/react";
```

```tsx
<Spinner size="sm" />
<Spinner label="Loading results" />
<Spinner size="lg" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | "md" | 16, 24, 32, 40 — the reference library's scale. The component default is md, 24; the bare glyph inside a button stays 16. |
| `label` | `string` | the provider's "Loading" | What is being waited for. Announced by screen readers. |
| `decorative` | `boolean` | false | Hides it from assistive tech. Use only inside a control that already announces the wait — a Button with `loading` does. |
