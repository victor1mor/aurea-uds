# useDeslize

Slides the selected item of SegmentedControl and Tabs from the previous position to the new one, copying its paint onto a passing indicator; instant under reduced motion.

## Usage

```tsx
import {useDeslize} from "@aurea-uds/react";
```

```tsx
const fila = useRef(null);
useDeslize(fila, ".active", valor);

// Na troca, o escolhido desliza do item de antes até o novo, com o tempo dos tokens;
// em repouso, ele continua se pintando como sempre. Com "reduzir movimento", troca de uma vez.
<div ref={fila} className="segmented">{/* os itens, o escolhido com .active */}</div>
```
