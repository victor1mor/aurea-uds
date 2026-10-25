import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {defineDoNativo, resolveDoNativo} from "./vite.nativo-ssr.config";

// A PARTE VIVA DO NATIVO (bloco 1, o 5-A — 23/10/2026) — `assets/live-nativo.js`, carregado SÓ nas páginas do nativo.
// As mesmas regras do `vite.config.ts` (nome FIXO, IIFE clássico porque o site abre direto do disco, `emptyOutDir:
// false`) e a troca do `react-native` pelo `react-native-web` do `vite.nativo-ssr.config.ts`.
export default defineConfig({
  plugins: [react()],
  base: "./",
  define: defineDoNativo,
  resolve: resolveDoNativo,
  build: {
    chunkSizeWarningLimit: 1800,
    outDir: "assets",
    emptyOutDir: false,
    rollupOptions: {
      input: "live/nativo.tsx",
      output: {
        format: "iife",
        name: "AureaCatalogLiveNativo",
        entryFileNames: "live-nativo.js",
        assetFileNames: "live-nativo-[name][extname]",
      },
    },
  },
});
