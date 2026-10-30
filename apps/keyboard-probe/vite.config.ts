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
  // (`rede2.html`); e desde 17/10/2026 (MNT-27), o das faixas (`rede4.html`); e desde 19/10/2026 (lote U), o do aviso de
  // cookies, da abertura e do Chip (`lote-u.html`); e desde 21/10/2026 (MNT-31), o da legenda e do minimapa (`rede5.html`);
  // e desde 25/10/2026 (o bloco 2), o da lateral: as quinze laterais, o item atual e a lateral solta (`lateral.html`); e
  // desde 27/10/2026 (as cores, passo A — ADR-0083), o da paleta: as peças que a paleta da 1.0 toca (`paleta.html`).
  // E o dos estilos (o passo B — ADR-0084): as peças em todos os estilos novos (`estilos.html`). E desde 30/10/2026 (MNT-36,
  // ADR-0087), o da lateral de contraste, com o botão de recolher do shell (`contraste.html`). E o da ponta da barra de cima
  // (MNT-37): o `topbarActions` com a chave de tema (`ponta.html`).
  build: {outDir: "out", emptyOutDir: true, rollupOptions: {input: {index: "index.html", shell: "shell.html", "lote-h": "lote-h.html", rede: "rede.html", rede2: "rede2.html", rede3: "rede3.html", rede4: "rede4.html", rede5: "rede5.html", "lote-u": "lote-u.html", lateral: "lateral.html", paleta: "paleta.html", estilos: "estilos.html", contraste: "contraste.html", ponta: "ponta.html"}}},
});
