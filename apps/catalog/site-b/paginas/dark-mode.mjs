// DARK MODE no desenho B (aprovado em 26/10/2026). O texto é o do `dark-mode.md`; a página arruma como o desenho: os dois
// modos do `ThemeToggle` em cartões, VIVOS (trocam o tema da página inteira), o caminho de "Saving the choice" em quatro
// passos e a parte escura numa página clara com as peças de verdade (`Section theme="dark"` e `Card variant="contrast"`).
import {docsB} from "./docs-b/comum.mjs";

export default function darkMode(site, doc) {
  const g = docsB(site, doc, {arquivos: ["index.html", "Toolbar.tsx", "App.tsx", "App.tsx", "Terminal", "app/layout.tsx",
    "ThemeButtons.tsx", "index.html", "styles.css", "App.tsx"]});
  const {h, A} = g;

  // A ABERTURA: a lua e o sol, o atributo de hoje, "No flash" e o "system".
  const ladrilho = (tema, icone) => h("span", {className: "dark-mode-ladrilho", "data-theme": tema}, h(A.Icon, {name: icone, weight: "fill"}));
  const pecas = [
    g.cartao([h("span", {key: "l"}, ladrilho("light", "moon")), h("span", {key: "s"}, ladrilho("dark", "sun"))]),
    g.amarela(h("span", {key: "e", className: "intro-so-escuro"}, "data-theme=\"dark\""), h("span", {key: "c", className: "intro-so-claro"}, "data-theme=\"light\"")),
    g.frase("No flash", "the theme is in the markup"),
    g.mono("\"system\""),
  ];

  // THE THEME SWITCH: a tabela dos modos vira dois cartões, cada um com a peça VIVA no meio. A redonda é ligada pelo
  // `site-b/js/dark-mode.js` (ela passa pela chave de três posições do topo, que grava a escolha); a de três posições é
  // um lugar `data-site-theme-switch`, que a parte viva do site acende (a mesma chave do topo).
  const sw = g.secao("the-theme-switch");
  const modos = g.achar(sw, "tabela");
  const pecaDoModo = modo => modo === "light-dark"
    ? h("div", {className: "dark-mode-alterna"}, h(A.ThemeToggle, {size: "xl"}))
    : h("div", {"data-site-theme-switch": ""}, h(A.ThemeToggle, {mode: "light-dark-system"}));
  const cartoesDosModos = h("div", {key: "modos", className: "docb-grade-2"}, ...modos.linhas.map(([nome, texto]) => {
    const modo = g.textoDe(nome);
    return h("div", {key: modo, className: "docb-caixa dark-mode-modo"},
      h("p", {className: "docb-rotulo"}, "Mode"),
      h("code", {className: "dark-mode-nome"}, modo),
      h("div", {className: "dark-mode-palco"}, pecaDoModo(modo)),
      h("p", {className: "dark-mode-texto"}, ...g.pedacos(texto, `m-${modo}`)));
  }));
  const naoGrava = g.achar(sw, "p", "ThemeToggle changes the theme");

  // SAVING THE CHOICE: os quatro passos do desenho, entre o primeiro parágrafo e o resto.
  const sv = g.secao("saving-the-choice");
  const passos = [["The person chooses", "light · dark · system"], ["You hear it", "onThemePreferenceChange"],
    ["You save it", "localStorage.setItem(\"theme\", …)"], ["Next visit", "defaultTheme={saved ?? \"system\"}"]];
  const caminho = h("ol", {key: "passos", className: "docb-grade-4 dark-mode-passos"}, ...passos.map(([titulo, codigo], n) =>
    h("li", {key: titulo, className: "docb-caixa dark-mode-passo"}, h("span", {className: "docb-bolinha"}, n + 1), h("b", null, titulo), h("code", null, codigo))));
  const primeiroDeSv = sv.blocos.find(b => b.tipo === "p");

  // NEXT.JS: o "Leave theme…" é a nota do desenho.
  const nx = g.secao("next-js-with-next-themes");
  const deixe = g.achar(nx, "p", "Leave ");

  // A DARK PART IN A LIGHT PAGE: a faixa e o cartão de verdade, numa caixa clara (no tema escuro também).
  const parte = h("div", {key: "parte", className: "docb-grade-2 dark-mode-partes"},
    h("div", {className: "dark-mode-parte", "data-theme": "light"}, h("b", null, "Section theme=\"dark\""),
      h("div", {className: "dark-mode-recorte"}, h(A.Section, {theme: "dark", spacing: "sm", className: "dark-mode-faixa"}, h("p", null, "A dark band in a light page.")))),
    h("div", {className: "dark-mode-parte", "data-theme": "light"}, h("b", null, "Card variant=\"contrast\""),
      h(A.Card, {variant: "contrast", className: "dark-mode-contraste"}, "The dark theme inside one card.")));

  // STYLING FOR BOTH THEMES: o "Avoid fixed colors." é o aviso do desenho, com a primeira frase de título.
  const st = g.secao("styling-for-both-themes");
  const evite = g.achar(st, "p", "Avoid fixed colors.");
  const [primeiro, ...resto] = evite.texto;
  const corte = primeiro.t.indexOf(". ") + 1;
  const avisoEvite = h(A.Alert, {key: "evite", variant: "warning", className: "intro-nota docb-aviso", title: primeiro.t.slice(0, corte)},
    ...g.pedacos([{t: primeiro.t.slice(corte + 1)}, ...resto], "evite"));

  // READING THE THEME: os três parágrafos depois da tabela são a lista do desenho.
  const rd = g.secao("reading-the-theme");
  const tabelaRd = rd.blocos.findIndex(b => b.tipo === "tabela");
  const depoisRd = rd.blocos.slice(tabelaRd + 1);

  const partes = [
    g.doMd("the-theme-switch", "ThemeToggle", g.blocos(sw.blocos, {troca: b => b === modos ? cartoesDosModos
      : b === naoGrava ? g.aviso(b, "info") : undefined})),
    g.doMd("with-aureaprovider", "Own the theme"),
    g.doMd("reading-the-theme", "useAureaTheme()", [...g.blocos(rd.blocos.slice(0, tabelaRd + 1), {legenda: rd.rotulo}),
      h("ul", {key: "lista", className: "docb-lista"}, ...depoisRd.map((b, n) => h("li", {key: n}, h("span", null, ...g.pedacos(b.texto, `rd${n}`)))))]),
    g.doMd("saving-the-choice", "Your app's job", g.blocos(sv.blocos, {troca: b => b === primeiroDeSv ? [g.p(b), caminho] : undefined})),
    g.doMd("next-js-with-next-themes", "Server rendering", g.blocos(nx.blocos, {troca: b => b === deixe ? g.aviso(b, "info") : undefined})),
    g.doMd("plain-html", "No React"),
    g.doMd("a-dark-part-in-a-light-page", "Any element", [parte, ...g.blocos(g.secao("a-dark-part-in-a-light-page").blocos)]),
    g.doMd("styling-for-both-themes", "Use the roles", g.blocos(st.blocos, {troca: b => b === evite ? avisoEvite : undefined})),
    g.doMd("in-react-native", "The device"),
  ];
  // Antes das seções: o texto do começo, com a caixa de exemplo fora (o código dela fica; as peças vivas estão na seção).
  return g.pagina({pecas, partes});
}
