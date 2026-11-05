// A PÁGINA "RTL" NO DESENHO B (02/11/2026, o grupo 5). O texto é o do `content/docs/rtl.md`; a página o arruma como o
// desenho aprovado: o palco, a caixa que espelha (as peças DE VERDADE dentro de um `dir`), os cartões do "dir" e do
// "direction", o que fica no lugar, a tabela e os links. O clique da chave ltr | rtl é o `site-b/js/rtl.js`.
import {ferramentas} from "../comum/grupo-5.mjs";
import {gradeDoSite} from "../comum/grade-montagem.mjs";

export default function rtl(site, doc) {
  const {h, A, blocosDe, bloco, codigo, secao, palco, peca, aviso, links, proxima, segmentos, pagina} = ferramentas(site, doc);
  const [intro] = blocosDe("_abertura");
  const ligar = blocosDe("turn-it-on");
  const lista = ligar.find(b => b.tipo === "ol");
  const [codigoApp, depois] = [ligar.find(b => b.tipo === "codigo"), ligar.filter(b => b.tipo === "p")];
  const timeline = ligar.filter(b => b.tipo === "codigo")[1];
  const [ajusteDir, ajusteDirection] = blocosDe("what-each-setting-does");
  const ficam = blocosDe("what-stays-in-place").find(b => b.tipo === "ul");
  const css = blocosDe("your-own-css");
  const tabela = css.find(b => b.tipo === "tabela");
  const [limite] = blocosDe("known-limit");
  const [nativo] = blocosDe("react-native");
  // O começo do texto sem o espaço da frente, com a primeira letra maiúscula (o resto de uma frase do `.md` que virou título).
  const aparar = pecas => {
    const [p0, ...demais] = pecas;
    if (p0?.t === undefined) return pecas;
    const t = p0.t.replace(/^\s+/, "");
    return [{t: t.charAt(0).toUpperCase() + t.slice(1)}, ...demais];
  };
  // O parágrafo do `.md` começa pelo título do cartão ("The `dir` attribute drives the CSS."); o cartão mostra o que vem
  // depois dele. Se a frase sumir do `.md`, a montagem para — e o cartão não sai com o título repetido.
  const resto = (b, frase) => {
    const k = b.texto.findIndex(p => p.t !== undefined && p.t.includes(frase));
    if (k < 0) throw new Error(`content/docs/rtl.md: o site B procura "${frase}" e não acha`);
    return aparar([{t: b.texto[k].t.slice(b.texto[k].t.indexOf(frase) + frase.length)}, ...b.texto.slice(k + 1)]);
  };

  // A CAIXA QUE ESPELHA: o mesmo arranjo nos dois sentidos, com as peças da Aurea — a lista, a trilha, o título, o texto,
  // a barra, a linha do tempo, a caixa de marcar e os dois botões. As setas dos botões trocam "à mão" (as duas estão na
  // página; a do outro sentido fica escondida), como o texto ensina.
  const espelho = h("div", {className: "rtl-espelho"},
    h("div", {className: "rtl-espelho-topo"},
      segmentos({rotulo: "Direction", chave: "rtl-sentido", ativo: "ltr", itens: [["ltr", "ltr"], ["rtl", "rtl"]]}),
      h("code", {"aria-live": "polite"}, '<div dir="', h("span", {"data-rtl-sentido": ""}, "ltr"), '">')),
    h("div", {className: "rtl-espelho-ui", dir: "ltr", "data-rtl-caixa": ""},
      h("div", {className: "rtl-espelho-lado"},
        h(A.NavList, {items: [{id: "o", label: "Overview", current: true}, {id: "r", label: "Reports"}, {id: "m", label: "Members"},
          {id: "s", label: "Settings"}], "aria-label": "Example navigation"})),
      h("div", {className: "rtl-espelho-miolo"},
        h(A.Breadcrumb, {label: "Example breadcrumb", items: [{label: "Home", href: "#see-it-mirror"}, {label: "Reports", href: "#see-it-mirror"}, {label: "Weekly"}]}),
        h("p", {className: "rtl-espelho-titulo"}, "Weekly report"),
        h("p", {className: "rtl-espelho-texto"}, "Text starts where the reading starts. The padding, the margins and the place of each piece follow it."),
        h(A.Progress, {value: 62, label: "Weekly report progress"}),
        h(A.Timeline, {items: [{title: "Created", time: "10:02"}, {title: "Reviewed", time: "11:40"}]}),
        h(A.Checkbox, {label: "Notify the team", defaultChecked: true}),
        h("div", {className: "rtl-espelho-botoes"},
          h(A.Button, {variant: "primary", size: "lg", leadingIcon: "plus", type: "button"}, "Add"),
          // Os dois "Next", um por sentido: a seta é escolhida pelo app (`arrow-right` ou `arrow-left`), e o do outro sentido
          // fica escondido.
          h(A.Button, {variant: "tertiary", size: "lg", trailingIcon: "arrow-right", type: "button", className: "rtl-so-ltr"}, "Next"),
          h(A.Button, {variant: "tertiary", size: "lg", trailingIcon: "arrow-left", type: "button", className: "rtl-so-rtl"}, "Next")))));

  const node = pagina("rtl-b",
    palco("Handbook", [peca.amarela('dir="rtl"'), peca.mono('direction="rtl"'), peca.numero("2", "settings", "and that is all"), peca.mono("margin-inline-start")]),
    bloco(intro, "a"),
    secao("see-it-mirror", "Flip it", "See it mirror",
      h("p", {className: "intro-p g5-p"}, "The box below is built with Aurea's own pieces, inside a ", h("code", null, "div"), " with a ", h("code", null, "dir"), ". Switch the direction:"),
      espelho,
      h("p", {className: "intro-p g5-p"}, "The check mark keeps its shape in both directions. The arrow of the Next button is swapped by hand, as you would choose ",
        h("code", null, "caret-left"), " instead of ", h("code", null, "caret-right"), ": Aurea does not flip glyphs for you.")),
    secao("turn-it-on", "Two places", "Turn it on",
      bloco(lista, "l"),
      codigo(codigoApp.codigo, {arquivo: "App.tsx", lingua: codigoApp.lingua}),
      bloco(depois[0], "d"),
      codigo(timeline.codigo, {arquivo: "Timeline.tsx", lingua: timeline.lingua})),
    secao("what-each-setting-does", "CSS and behavior", "What each setting does",
      h("div", {className: "g5-grade-2"},
        h(A.Card, {className: "g5-cartao"}, h("code", {className: "rtl-ajuste"}, "dir"), h("b", null, "Drives the CSS"),
          h("p", null, ...site.pedacos(resto(ajusteDir, "drives the CSS."), "x"))),
        h(A.Card, {className: "g5-cartao"}, h("code", {className: "rtl-ajuste"}, "direction"), h("b", null, "Drives behavior"),
          h("p", null, ...site.pedacos(resto(ajusteDirection, "drives behavior."), "y"))))),
    secao("what-stays-in-place", "On purpose", "What stays in place",
      h("div", {className: "g5-grade-4"}, ...[
        ["The check mark", h(A.Checkbox, {label: "Checked", labelHidden: true, defaultChecked: true, tabIndex: -1})],
        ["The Spinner", h(A.Spinner, {decorative: true})],
        ["Drawer sides", h("span", {className: "rtl-gaveta"}, h("span", {className: "rtl-gaveta-folha"}), h("code", null, 'side="left"'))],
        ["Icons", h("span", {className: "rtl-icones"}, h(A.Icon, {name: "caret-left"}), h("code", null, "caret-left"), h(A.Icon, {name: "caret-right"}))],
      ].map(([titulo, desenho], n) => h(A.Card, {key: titulo, className: "rtl-fica"},
        h("div", {className: "rtl-fica-desenho", inert: true}, desenho), h("b", null, titulo),
        h("p", null, ...site.pedacos(aparar(ficam.itens[n].filter(p => p.strong === undefined)), `f${n}`)))))),
    secao("your-own-css", "Start and end", "Your own CSS",
      bloco(css[0], "c"),
      // A `DataGrid` (S-02, 05/11/2026).
      gradeDoSite({label: "Your own CSS table", className: "rtl-tabela",
        cabecalho: tabela.cabecalho.map((c) => typeof c === "string" ? c.replace(/`/g, "") : c.map((p) => p.t ?? p.code ?? p.link ?? p.strong ?? "").join("")),
        linhas: tabela.linhas.map((l, k) => l.map((c, j) => site.pedacos(c, `td${k}${j}`)))}),
      codigo(css.find(b => b.tipo === "codigo").codigo, {arquivo: "order.css", lingua: "css"})),
    secao("known-limit", "Honest", "Known limit",
      aviso("warning", "warning", "Six rules still use :dir(rtl).", ...site.pedacos(resto(limite, "selector:"), "k"))),
    secao("react-native", "Native", "React Native", bloco(nativo, "n")),
    secao("next-steps", "Keep going", "Next steps",
      links([["Styling", "The rest of the CSS rules.", "paint-brush", "teal", "./docs-styling.html"],
        ["Icons", "Choose the right arrow glyphs.", "shapes", "orange", "./docs-icons.html"],
        ["Accessibility", "Keyboard and screen reader support.", "eye", "blue", "./docs-accessibility.html"]])),
    proxima());
  const toc = [["see-it-mirror", "See it mirror"], ["turn-it-on", "Turn it on"], ["what-each-setting-does", "What each setting does"],
    ["what-stays-in-place", "What stays in place"], ["your-own-css", "Your own CSS"], ["known-limit", "Known limit"],
    ["react-native", "React Native"], ["next-steps", "Next steps"]].map(([id, label]) => ({id, label}));
  return {node, toc};
}
