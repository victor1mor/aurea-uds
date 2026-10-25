// O `assets/live-motores.js` (21/10/2026) — a parte viva das páginas cujo exemplo usa motor pesado: os gráficos
// (Recharts), o editor de código (CodeMirror), a grade (TanStack Table), o mapa de rede (React Flow) e o QR. É o
// `live.js` mais os `_starters-motores.mjs`; a página carrega um OU o outro, nunca os dois (o gerador escolhe).
import startersLeves from "../content/_starters.mjs";
import startersMotores from "../content/_starters-motores.mjs";
import receitas from "../content/_recipes.mjs";
import {ligar, type Extras} from "./vivo";

// Os padrões e os blocos TODOS, com os de motor pesado (bloco 1, o 3-C/3-D).
const padroes = import.meta.glob<Extras["padroes"] extends Record<string, infer T> | undefined ? T : never>(
  "../content/patterns/*.mjs", {import: "default", eager: true});
const blocos = import.meta.glob<Extras["blocos"] extends Record<string, infer T> | undefined ? T : never>(
  "../content/blocks/*.mjs", {import: "default", eager: true});

ligar({...startersLeves, ...startersMotores}, {padroes, blocos, receitas});
