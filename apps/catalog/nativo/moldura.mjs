// A MOLDURA DO NATIVO NO SITE (bloco 1, o 5-A — 23/10/2026): o que o app do Victor faz em volta das peças, aqui feito
// para o navegador — o provedor do `@aurea-uds/native` com o tema, as fontes e os ícones.
//
// AS FONTES. O nativo escolhe o peso pelo NOME da família ("Inter SemiBold"), nunca pelo `fontWeight` (ADR-0039: no
// aparelho, pedir 600 por `fontWeight` devolve o Regular sintetizado). No navegador, cada nome abaixo é um `@font-face`
// da folha `assets/native-fonts.css` (o gerador a escreve) apontando para o MESMO arquivo da web com o peso fixo — o
// navegador prende o eixo de peso da fonte variável no valor do descritor. Um arquivo serve vários nomes e baixa uma vez.
//
// OS ÍCONES. O nativo recebe o desenho de cada ícone por um registro (`criarRegistroDeIcones`): só os que os exemplos do
// site usam entram (`ICONES_DO_SITE`), porque o pacote inteiro de ícones tem 17 MB.
import {createElement as h} from "react";
import {AureaProvider, criarRegistroDeIcones} from "../../../packages/native/dist/index.js";
import {ICONES_DO_SITE} from "./icones.mjs";

// O nome é UMA palavra ("Aurea-Inter-600"): o `react-native-web` escreve o `font-family` sem aspas, e um nome com número
// solto ("Aurea Inter 600") é CSS inválido — o navegador descartava a regra e o texto caía na fonte do sistema (medido).
// Cada face: o nome, o arquivo da web (o `@aurea-uds/fonts`, os mesmos do `catalog.css`) e o peso que o arquivo fixa.
const ARQUIVO = {Inter: "inter-variable-normal.woff2", Sora: "sora-variable-normal.woff2"};
const faces = [];
const pesos = (familia, lista) => Object.fromEntries(lista.map((p) => {
  const nome = `Aurea-${familia}-${p}`;
  const arquivo = p === "400i" ? "inter-variable-italic.woff2"
    : familia === "PlexMono" ? `ibm-plex-mono-${p}-normal.woff2` : ARQUIVO[familia];
  if (!faces.some((f) => f.nome === nome)) faces.push({nome, arquivo, peso: p.replace("i", "")});
  return [p, nome];
}));
export const FONTES_NO_NAVEGADOR = {
  ui: pesos("Inter", ["400", "500", "600", "700", "800", "400i"]),
  editorial: pesos("Inter", ["400", "500", "600", "700", "800", "400i"]),
  heading: pesos("Sora", ["400", "500", "600", "700", "800"]),
  code: pesos("PlexMono", ["400", "500", "600"]),
};
export const FACES = faces;

// O registro ANOTA todo nome pedido que não tem (o `Icon` do nativo não desenha nada quando falta, e só avisa no console):
// a montagem do site lê `ICONES_QUE_FALTAM` depois de desenhar e para com a lista — a lista do site se completa medida.
export const ICONES_QUE_FALTAM = new Set();
const NAO_E_ICONE = new Set(["then", "constructor", "toJSON", "valueOf", "toString"]);
const registro = new Proxy(criarRegistroDeIcones(ICONES_DO_SITE), {
  get(alvo, chave) {
    const v = alvo[chave];
    if (v === undefined && typeof chave === "string" && /^[a-z0-9-]+$/.test(chave) && !NAO_E_ICONE.has(chave)) ICONES_QUE_FALTAM.add(chave);
    return v;
  },
});

// `tema`: "light" ou "dark" — o do site, que a parte viva lê do `<html data-theme>`.
export function Moldura({tema, children}) {
  return h(AureaProvider, {theme: tema, fontFamilies: FONTES_NO_NAVEGADOR, icons: registro}, children);
}
