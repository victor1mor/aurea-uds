// A PÁGINA INICIAL DO SITE B (`index.html`) — o desenho aprovado em 26/10/2026 ("inicio-B"), com as peças que a bancada de
// 01/11/2026 aprovou para ela (D-7.1 a D-7.7) e as cores de hoje (a paleta da 1.0 e as 13 marcas).
//
// Quatro partes, de cima para baixo: o PALCO (o texto e as sete peças que flutuam), as CINCO FAMÍLIAS (o acordeão de lado),
// o BARALHO de blocos e o FECHO com o "Try it here". As partes vivas moram em `apps/catalog/live/inicio-b.mjs`, o mesmo
// arquivo que o `home.js` usa: aqui elas saem prontas (sem JavaScript, a página já está inteira), e o `home.js` troca cada
// lugar marcado com `data-inicio` pela peça viva.
import {readFileSync} from "node:fs";
import {Baralho, Familias, PecasDoPalco, Teste} from "../../live/inicio-b.mjs";

const pacote = JSON.parse(readFileSync(new URL("../../../../package.json", import.meta.url), "utf8"));
// O logo do GitHub, o oficial (o mesmo arquivo que o gerador lê para o topo).
const DESENHO_GITHUB = readFileSync(new URL("../../marcas/github/GitHub_Invertocat_Black.svg", import.meta.url), "utf8").match(/ d="([^"]+)"/)[1];

export default function inicio(site) {
  const {h, Fragment, A, REPO, tokensDoc, hexDoToken, fichas, blocks} = site;
  const GitHub = props => h("svg", {...props, viewBox: "0 0 98 96", fill: "none"}, h("path", {d: DESENHO_GITHUB, className: "site-github-ink"}));

  // AS MARCAS do "Try it here": a cor e a tinta de cada uma, nos dois temas, tiradas dos TOKENS — fora de qualquer marca
  // ligada na página (o defeito das bolinhas da bancada, 01/11/2026). A padrão se chama "Aurea", como no desenho aprovado.
  const valor = t => {
    if (!t) return null;
    if (typeof t.$value === "string") { const nome = t.$value.slice(1, -1); return valor(tokensDoc.base[nome]); }
    return hexDoToken(t);
  };
  const corPadrao = valor(tokensDoc.base["brand-yellow"]), tintaPadrao = valor(tokensDoc.base["brand-yellow-ink"]);
  const marcas = [{id: "", label: "Aurea", light: {color: corPadrao, ink: tintaPadrao}, dark: {color: corPadrao, ink: tintaPadrao}},
    ...Object.keys(tokensDoc.brand).filter(id => !id.startsWith("$")).map(id => {
      const b = tokensDoc.brand[id];
      const doTema = tema => ({color: valor(b[tema]?.primary ?? b.dark.primary),
        ink: valor(b[tema]?.["primary-foreground"] ?? b.dark["primary-foreground"]) ?? tintaPadrao});
      return {id, label: id.charAt(0).toUpperCase() + id.slice(1), light: doTema("light"), dark: doTema("dark")};
    })];
  // O número de peças é o da All Components (as fichas da web, sem os hooks), e não o 138 escrito no desenho.
  const pecas = fichas.filter(f => f.kind !== "hook").length;

  // ── O PALCO ────────────────────────────────────────────────────────────────────────────────────────────────────
  const palco = h("section", {className: "inicio-palco", "aria-labelledby": "inicio-h1", "data-palco": ""},
    h("div", {className: "inicio-palco-texto"},
      // O selo do que mudou: a versão na cápsula amarela e o "What's new", como no desenho.
      h("a", {className: "inicio-novo", href: "./releases.html"},
        h(A.Badge, {tone: "primary", emphasis: "solid", className: "inicio-versao"}, `v${pacote.version}`),
        h("span", null, "What's new"), h(A.Icon, {name: "arrow-right", size: "sm"})),
      h("h1", {className: "inicio-h1", id: "inicio-h1"}, "One design system.", h("span", null, "Web and native, one look.")),
      h("p", {className: "inicio-lede"}, "Aurea is a design system with two outputs: the web, in React and CSS, and mobile, in React Native. The look is one, and it does not change from one side to the other — with contrast measured in every theme."),
      h("div", {className: "inicio-acoes"},
        h(A.Button, {variant: "primary", size: "xl", trailingIcon: "arrow-right", href: "./getting-started.html"}, "Get started"),
        h(A.Button, {variant: "tertiary", size: "xl", href: "./components.html"}, "View components"),
        h("a", {className: "inicio-gh", href: REPO, ...site.NOVA_ABA}, h(A.Icon, {name: GitHub, size: "sm"}), "Open source on GitHub"))),
    h("div", {className: "inicio-pecas"}, h(PecasDoPalco)));

  // ── AS CINCO FAMÍLIAS ──────────────────────────────────────────────────────────────────────────────────────────
  const familias = h("section", {className: "inicio-sec", "aria-labelledby": "inicio-fam-h"},
    h("div", {className: "inicio-sec-cabeca"},
      h("div", null, h("p", {className: "intro-olho"}, "Components"),
        h("h2", {className: "inicio-h2", id: "inicio-fam-h"}, `${pecas} pieces in five families.`, h("br"), "Open one.")),
      h("div", {className: "inicio-sec-lado"},
        h("p", {className: "inicio-sec-p"}, "Everything inside is live: type, slide, toggle. Each piece has its own page with the code."),
        h(A.Link, {href: "./components.html", className: "inicio-mais"}, "View all components →"))),
    h("div", {className: "inicio-familias-lugar", "data-inicio": "familias"}, h(Familias)));

  // ── O BARALHO ──────────────────────────────────────────────────────────────────────────────────────────────────
  const baralho = h("section", {className: "inicio-sec", "aria-labelledby": "inicio-blocos-h"},
    h("div", {"data-inicio": "baralho", "data-total": blocks.length}, h(Baralho, {total: blocks.length})));

  // ── O FECHO ────────────────────────────────────────────────────────────────────────────────────────────────────
  const fecho = h("section", {className: "inicio-sec", "aria-labelledby": "inicio-fim-h"},
    h("div", {className: "inicio-fim"},
      h("div", null,
        h("p", {className: "intro-olho"}, "Free and open source"),
        h("h2", {className: "inicio-h2", id: "inicio-fim-h"}, "Accessibility", h("br"), "you can measure."),
        h("p", {className: "inicio-sec-p inicio-fim-p"}, "Text at 4.5:1 or more in both themes. Controls you can hit at 44 px. A focus ring you can always see."),
        h("div", {className: "inicio-acoes"},
          h(A.Button, {variant: "primary", size: "xl", href: "./getting-started.html"}, "Get started"),
          h(A.Button, {variant: "tertiary", size: "xl", href: REPO, ...site.NOVA_ABA}, "Open on GitHub"))),
      h("div", {className: "inicio-teste-lugar", "data-inicio": "teste", "data-marcas": JSON.stringify(marcas)}, h(Teste, {marcas}))));

  return {node: h("div", {className: "inicio"}, palco, familias, baralho, fecho), toc: []};
}
