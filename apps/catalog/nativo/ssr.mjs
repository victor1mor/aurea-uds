// O NATIVO DESENHADO NA MONTAGEM DO SITE (bloco 1, o 5-A — 23/10/2026).
//
// O estático é o piso do site (ver `live/vivo.tsx`): a página sai do gerador com a prévia já desenhada, e a parte viva
// acende por cima. Para o nativo, o desenho vem do `react-native-web` — e o `@aurea-uds/native` importa `react-native`,
// que o Node não sabe trocar. Por isso este arquivo é montado pelo Vite para o Node (`vite.nativo-ssr.config.ts`, a
// mesma troca das bancadas do nativo), e o `build-catalog.mjs` importa o resultado (`.nativo/ssr.mjs`).
//
// Cada exemplo sai nos DOIS temas, e o CSS do site mostra o do tema da página: o nativo resolve a cor em JavaScript (hex,
// ADR-0027), então um desenho só serviria a um tema até a parte viva acender.
import {createElement as h} from "react";
import {renderToStaticMarkup, renderToString} from "react-dom/server";
import {AppRegistry} from "react-native-web";
import {FACES, ICONES_QUE_FALTAM, Moldura} from "./moldura.mjs";
import {resolverTokens} from "../../../packages/native/dist/index.js";

export {FACES, ICONES_QUE_FALTAM};

// O FUNDO DO APP em cada tema — o que a caixinha de exemplo das páginas do nativo pinta (decisão do Victor, 24/10/2026:
// "A caixinha de exemplo das páginas do nativo usa o fundo do próprio app"). Lido do token, para seguir o app sozinho.
export const fundoDoApp = (tema) => resolverTokens(tema, "comfortable").color.background;

const modulos = import.meta.glob(["../content/native/*.mjs"], {import: "default", eager: true});
export const conteudo = Object.fromEntries(Object.entries(modulos)
  .map(([caminho, c]) => [caminho.split("/").pop().replace(/\.mjs$/, ""), c]));

let n = 0;
export function desenhar(nome, indice, tema) {
  const ex = conteudo[nome]?.examples?.[indice];
  if (!ex) throw new Error(`nativo: ${nome} não tem o exemplo ${indice}`);
  const chave = `aurea-nativo-${n++}`;
  AppRegistry.registerComponent(chave, () => () => h(Moldura, {tema}, ex.render()));
  const {element, getStyleElement} = AppRegistry.getApplication(chave, {});
  const html = renderToString(element);
  const css = renderToStaticMarkup(getStyleElement());
  return {html, css};
}

// A folha do `react-native-web` depois de TODOS os desenhos (ela acumula: as classes são as mesmas que a parte viva gera,
// porque o nome de cada uma é o resumo da regra). Só as regras das peças: a folha dele traz também uma limpeza GLOBAL
// (`body{margin:0}`, `html{…}`, `input…`) que mexeria no site inteiro — essa fica de fora.
export function folha() {
  AppRegistry.registerComponent("aurea-nativo-folha", () => () => null);
  const {getStyleElement} = AppRegistry.getApplication("aurea-nativo-folha", {});
  const css = renderToStaticMarkup(getStyleElement()).replace(/^<style[^>]*>/, "").replace(/<\/style>$/, "");
  return css.split("\n").filter((regra) => regra.startsWith(".") || regra.startsWith("@")).join("\n");
}
