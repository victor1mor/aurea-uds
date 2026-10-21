import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// A PARTE VIVA COM OS MOTORES (21/10/2026) — `assets/live-motores.js`, carregado SÓ nas páginas cujo exemplo usa motor
// pesado (os gráficos, o editor, a grade, o mapa, o QR: `content/_starters-motores.mjs`). As mesmas regras do
// `vite.config.ts`: nome FIXO (o gerador escreve `<script src="./assets/live-motores.js">`), IIFE clássico (o site abre
// direto do disco, e `file://` bloqueia `type="module"`), e `emptyOutDir: false`.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    // Medido em 21/10/2026: 3,78 MB cru, 1,16 MB em gzip. É o preço dos cinco motores, e só nas páginas deles.
    chunkSizeWarningLimit: 3900,
    outDir: "assets",
    emptyOutDir: false,
    rollupOptions: {
      input: "live/motores.tsx",
      output: {
        format: "iife",
        name: "AureaCatalogLiveMotores",
        entryFileNames: "live-motores.js",
        assetFileNames: "live-motores-[name][extname]",
      },
    },
  },
});
