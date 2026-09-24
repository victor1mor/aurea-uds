import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// `base: "./"` para o HTML sair com caminho RELATIVO: o servidor do Playwright serve a raiz do
// repositório, e um `/assets/…` absoluto procuraria os arquivos no lugar errado.
// `outDir: "out"` e não `dist`: `dist/` neste repositório é saída COMMITADA e gateada
// (`dist == build`); esta aqui é descartável e está no .gitignore, junto com a do proof-server.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {outDir: "out", emptyOutDir: true},
});
