# useTheme

Read the current theme and switch it, from anywhere inside AureaProvider.

## Usage

```tsx
import {useTheme} from "@aurea-uds/react";
```

```tsx
const {theme, toggleTheme} = useTheme();

<IconButton
  icon={theme === "light" ? "moon" : "sun"}
  label={theme === "light" ? "Switch to dark" : "Switch to light"}
  onClick={toggleTheme}
/>
```
