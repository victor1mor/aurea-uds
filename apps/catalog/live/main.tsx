// O `assets/live.js` — a parte viva LEVE das prévias: as molduras e as caixas de toda página de componente cujo exemplo
// não usa motor pesado. A lógica mora no `vivo.tsx`; o `motores.tsx` é o mesmo com os motores (o `live-motores.js`).
//
// Os exemplos de partida entram desde 21/10/2026 (antes ficavam de fora: com os motores, o `_starters.mjs`
// acrescentava 1,15 MB). Os de motor pesado moram no `_starters-motores.mjs` e só entram no outro arquivo — medido
// (gzip): 436 KB este, 1,16 MB os dois juntos.
import startersLeves from "../content/_starters.mjs";
import receitas from "../content/_recipes.mjs";
import {ligar, type Extras} from "./vivo";

// Os padrões e os blocos (bloco 1, o 3-C/3-D), MENOS os que usam motor pesado — esses acendem com o `live-motores.js`. A
// lista de fora é conferida pelo gerador contra os imports de cada arquivo (`ARQUIVOS_COM_MOTOR`, no `build-catalog.mjs`).
const padroes = import.meta.glob<Extras["padroes"] extends Record<string, infer T> | undefined ? T : never>(
  ["../content/patterns/*.mjs", "!../content/patterns/Chart.mjs", "!../content/patterns/ChartLegend.mjs",
    "!../content/patterns/ChartTooltip.mjs", "!../content/patterns/CodeEditor.mjs", "!../content/patterns/DataGrid.mjs",
    "!../content/patterns/DependencyGraph.mjs", "!../content/patterns/QRCode.mjs"], {import: "default", eager: true});
const blocos = import.meta.glob<Extras["blocos"] extends Record<string, infer T> | undefined ? T : never>(
  ["../content/blocks/*.mjs", "!../content/blocks/insight.mjs"], {import: "default", eager: true});

ligar(startersLeves, {padroes, blocos, receitas});
