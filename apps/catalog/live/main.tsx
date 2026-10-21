// O `assets/live.js` — a parte viva LEVE das prévias: as molduras e as caixas de toda página de componente cujo exemplo
// não usa motor pesado. A lógica mora no `vivo.tsx`; o `motores.tsx` é o mesmo com os motores (o `live-motores.js`).
//
// Os exemplos de partida entram desde 21/10/2026 (antes ficavam de fora: com os motores, o `_starters.mjs`
// acrescentava 1,15 MB). Os de motor pesado moram no `_starters-motores.mjs` e só entram no outro arquivo — medido
// (gzip): 436 KB este, 1,16 MB os dois juntos.
import startersLeves from "../content/_starters.mjs";
import {ligar} from "./vivo";

ligar(startersLeves);
