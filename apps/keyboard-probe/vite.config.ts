import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// Mesma configuração do `proof-client`, e pelas mesmas duas razões: `base: "./"` porque o
// servidor do Playwright serve a RAIZ do repositório, e `outDir: "out"` porque `dist/` aqui é
// saída commitada e gateada — esta é descartável e está no .gitignore.
export default defineConfig({
  plugins: [react()],
  base: "./",
  // Três páginas: o banco de teclado; desde 03/10/2026 (AN-01), o da moldura (`shell.html`); e desde
  // 04/10/2026 (Lote H), o da conversa, da galeria e da árvore (`lote-h.html`); desde 10/10/2026
  // (ADR-0064), o do mapa de rede (`rede.html`); e desde a rodada 2 (ADR-0065), o do mapa que se arruma
  // (`rede2.html`).
  build: {outDir: "out", emptyOutDir: true, rollupOptions: {input: {index: "index.html", shell: "shell.html", "lote-h": "lote-h.html", rede: "rede.html", rede2: "rede2.html"}}},
});
