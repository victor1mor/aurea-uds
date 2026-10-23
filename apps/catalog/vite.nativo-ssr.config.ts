import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {fileURLToPath} from "node:url";

// O NATIVO NO SITE (bloco 1, o 5-A — 23/10/2026; o Victor, 14:56: "Pode: o site usa o react-native-web, o
// react-native-svg e o react-native-safe-area-context para mostrar o nativo"). Duas montagens usam esta troca: a do
// desenho na montagem do site (`--ssr`, abaixo: `.nativo/ssr.mjs`, que o `build-catalog.mjs` importa) e a parte viva das
// páginas do nativo (`vite.nativo.config.ts`). A troca é a das bancadas do nativo: `react-native` vira `react-native-web`,
// e as extensões `.web.*` vêm primeiro, que é como o `react-native-svg` escolhe a versão do navegador.
const aqui = fileURLToPath(new URL(".", import.meta.url));
export const resolveDoNativo = {
  alias: [
    {find: /^react-native$/, replacement: "react-native-web"},
    {find: /^@react-native\/assets-registry\/registry$/, replacement: `${aqui}nativo/registro-de-assets.js`},
  ],
  dedupe: ["react", "react-dom", "react-native-web", "react-native-svg", "react-native-safe-area-context"],
  extensions: [".web.mjs", ".web.js", ".web.ts", ".web.tsx", ".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
};
export const defineDoNativo = {__DEV__: "false", "process.env.NODE_ENV": JSON.stringify("production"), global: "globalThis"};

export default defineConfig({
  plugins: [react()],
  define: defineDoNativo,
  resolve: resolveDoNativo,
  // tudo dentro do arquivo: o Node não teria a troca do `react-native` para o que ficasse de fora
  ssr: {noExternal: true, target: "node"},
  build: {
    ssr: "nativo/ssr.mjs",
    outDir: ".nativo",
    emptyOutDir: true,
    rollupOptions: {output: {format: "es", entryFileNames: "ssr.mjs"}},
  },
});
