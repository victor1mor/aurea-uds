import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// O RUNTIME DAS PRÉVIAS (18/08/2026). Até aqui o catálogo era HTML morto — medido antes de escrever
// uma linha: zero `createRoot` em `assets/catalog.js`. Este bundle é o que HIDRATA as prévias.
//
// `apps/catalog` virou pacote do workspace só para isto. A alternativa era chamar o binário do
// `proof-client` por caminho (`apps/proof-client/node_modules/.bin/vite`), e um build que aponta
// para dentro do `node_modules` de OUTRO pacote quebra na primeira vez que aquele pacote mudar de
// dependência. As versões aqui são as MESMAS do `proof-client`, de propósito: dois Vite diferentes
// no mesmo repositório é divergência esperando acontecer.
//
// `outDir: "assets"` com `emptyOutDir: false`: o `catalog.css` e o `catalog.js` já moram lá e são
// escritos pelo gerador. Limpar a pasta apagaria os dois.
//
// Nome de arquivo FIXO, sem hash: o gerador escreve `<script src="../assets/live.js">` nas páginas.
// E um ÚNICO IIFE clássico, não módulos repartidos. O catálogo promete abrir direto do disco;
// Chromium bloqueia `type="module"` em `file://` por CORS, mesmo quando todos os arquivos são
// locais. O formato IIFE força o bundle único e conserva o enxerto progressivo sem servidor,
// manifesto, dependência ou segundo runtime.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    // ponytail: 520 kB é o teto do runtime único medido em 512 kB. Se passar, gere IIFEs clássicos
    // por componente; aumentar este número esconderia custo de parse sem resolver o suporte a file://.
    chunkSizeWarningLimit: 520,
    outDir: "assets",
    emptyOutDir: false,
    rollupOptions: {
      input: "live/main.tsx",
      output: {
        format: "iife",
        name: "AureaCatalogLive",
        entryFileNames: "live.js",
        assetFileNames: "live-[name][extname]",
      },
    },
  },
});
