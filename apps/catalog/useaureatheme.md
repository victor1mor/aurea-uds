# useAureaTheme

Read theme and density straight from the document, and set them — for a host that owns the <html> attributes.

## Usage

```tsx
import {useAureaTheme} from "@aurea-uds/react";
```

```tsx
const {theme, density, setTheme, setDensity, toggleTheme} = useAureaTheme();

// Lê direto do <html> e acompanha quem mudar o atributo por fora.
// Use este quando a APLICAÇÃO é dona do data-theme; use useTheme quando
// quem guarda a escolha é o AureaProvider.
<IconButton
  icon={theme === "light" ? "moon" : "sun"}
  label={theme === "light" ? "Switch to dark" : "Switch to light"}
  onClick={toggleTheme}
/>
```
