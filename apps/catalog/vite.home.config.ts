import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// O INÍCIO DO SITE (15/10/2026) — `assets/home.js`, carregado SÓ no `index.html`: o `search.js` mais a vitrine
// "Components" viva (`live/inicio.tsx`). Separado para as outras páginas não baixarem as peças da vitrine. As regras
// são as do `vite.search.config.ts`: nome fixo, IIFE clássico e `emptyOutDir: false`.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "assets",
    emptyOutDir: false,
    rollupOptions: {
      input: "live/inicio.tsx",
      output: {
        format: "iife",
        name: "AureaSiteHome",
        entryFileNames: "home.js",
        assetFileNames: "home-[name][extname]",
      },
    },
  },
});
