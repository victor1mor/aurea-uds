import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// A BUSCA DO SITE (13/10/2026, ADR-0067) — `assets/search.js`, carregado em TODA página.
//
// Configuração à parte porque um IIFE é um arquivo só por montagem: o `vite.config.ts` monta o
// `live.js` (as prévias dentro das molduras) e este, a busca. As mesmas regras daquele: nome FIXO
// (o gerador escreve `<script src="./assets/search.js">`), IIFE clássico (o site abre direto do disco,
// e `file://` bloqueia `type="module"`), e `emptyOutDir: false` (a pasta já tem o `catalog.css`,
// o `catalog.js`, o `search-index.js` e o `live.js`).
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "assets",
    emptyOutDir: false,
    rollupOptions: {
      input: "live/busca.tsx",
      output: {
        format: "iife",
        name: "AureaSiteSearch",
        entryFileNames: "search.js",
        assetFileNames: "search-[name][extname]",
      },
    },
  },
});
