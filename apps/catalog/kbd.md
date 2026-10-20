# Kbd

A keyboard key or shortcut, shown as the user would press it. Renders the <kbd> element.

## Usage

```tsx
import {Kbd} from "@aurea-uds/react";
```

```tsx
Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search.
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | The key or combination, written the way the platform writes it (⌘K, Ctrl+K). |
| `className` | `string` | — | Extra classes. Inside a Button it inherits the button's colour automatically. |
