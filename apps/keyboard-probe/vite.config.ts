import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// Mesma configuração do `proof-client`, e pelas mesmas duas razões: `base: "./"` porque o
// servidor do Playwright serve a RAIZ do repositório, e `outDir: "out"` porque `dist/` aqui é
// saída commitada e gateada — esta é descartável e está no .gitignore.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {outDir: "out", emptyOutDir: true},
});
