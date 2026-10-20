# usePortalContainer

The node every Aurea popup is mounted into, as configured once on AureaProvider.

## Usage

```tsx
import {usePortalContainer} from "@aurea-uds/react";
```

```tsx
// Configurado UMA vez, no provider — não é prop de componente.
<AureaProvider portalContainer={ref.current}>…</AureaProvider>

// E lido por quem monta um popup próprio, para cair no mesmo lugar:
const container = usePortalContainer();
```
