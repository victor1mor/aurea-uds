// O `assets/live-motores.js` (21/10/2026) — a parte viva das páginas cujo exemplo usa motor pesado: os gráficos
// (Recharts), o editor de código (CodeMirror), a grade (TanStack Table), o mapa de rede (React Flow) e o QR. É o
// `live.js` mais os `_starters-motores.mjs`; a página carrega um OU o outro, nunca os dois (o gerador escolhe).
import startersLeves from "../content/_starters.mjs";
import startersMotores from "../content/_starters-motores.mjs";
import {ligar} from "./vivo";

ligar({...startersLeves, ...startersMotores});
