// A PÁGINA "Accessibility" NO DESENHO B (02/11/2026, o grupo 5). O texto é o do `content/docs/accessibility.md`
// (corrigido: a Aurea MUDA com o "aumentar contraste" do sistema desde a 0.45.0); a página o arruma como o desenho
// aprovado: as nove áreas em cartões-link, as três fontes, as razões de contraste CALCULADAS dos tokens (como a peça
// "Text" da Introduction), as três concessões com as medidas, e as demonstrações com as peças de verdade — o foco com o
// Tab, a área de toque, e o texto a 200% numa JANELA PRÓPRIA (um `iframe` com a raiz no tamanho escolhido: as peças medem
// em `rem`, então só crescer a letra de uma caixa não mostraria o que a varredura mede). O clique é o
// `site-b/js/accessibility.js`.
import {ferramentas} from "../comum/grupo-5.mjs";

export default function accessibility(site, doc) {
  const {h, A, blocosDe, bloco, codigo, secao, palco, peca, aviso, proxima, pagina} = ferramentas(site, doc);
  const {tokensDoc, hexDoToken, contrasteEntre} = site;
  const [intro] = blocosDe("_abertura");
  const relance = blocosDe("at-a-glance").find(b => b.tipo === "tabela");
  const tipo = blocosDe("readable-type");
  const contraste = blocosDe("contrast");
  const foco = blocosDe("focus"), toque = blocosDe("touch-targets"), teclado = blocosDe("keyboard");
  const leitores = blocosDe("screen-readers"), movimento = blocosDe("motion"), forcadas = blocosDe("forced-colours");
  const reflow = blocosDe("text-size-and-reflow"), rtl = blocosDe("right-to-left"), app = blocosDe("what-stays-with-your-app");

  // AS RAZÕES, calculadas dos tokens de hoje (a fórmula da WCAG), e não escritas à mão.
  const hex = t => hexDoToken(t);
  const AMARELO = hex(tokensDoc.base["brand-yellow"]), TINTA = hex(tokensDoc.base["brand-yellow-ink"]);
  const TEXTO = hex(tokensDoc.theme.light.foreground), PAGINA = hex(tokensDoc.theme.light.background);
  const razao = (a, b) => `${contrasteEntre(a, b).toFixed(2)} : 1`;

  // O `contrast` do `.md` em duas partes, como o desenho: "Measured, not assumed" e "Known trade-offs" (as duas h3).
  const k3 = contraste.findIndex(b => b.tipo === "h3" && b.id === "known-trade-offs");
  if (k3 < 0) throw new Error("content/docs/accessibility.md: falta o \"### Known trade-offs\"");
  const medido = contraste.slice(1, k3), concessoes = contraste.slice(k3 + 1);
  const listaMedida = medido.find(b => b.tipo === "ul");
  // O item do amarelo vira o primeiro cartão de razão; a lista mostra os outros.
  const semAmarelo = {...listaMedida, itens: listaMedida.itens.filter(it => !it.some(p => p.code === "brand-yellow-ink"))};
  const [abreConcessoes, c1, c2, c3, passa, aaInteiro] = concessoes;
  // O parágrafo de uma concessão sem o título em negrito ("**1. Field boundaries.**"), que vai para o h3.
  const semTitulo = b => { const [, ...resto] = b.texto; const [p0, ...demais] = resto; return [{t: p0.t.replace(/^\s+/, "")}, ...demais]; };
  const titulo = b => b.texto[0].strong.replace(/^\d+\.\s*/, "").replace(/\.$/, "");
  // Corta um texto numa frase: [antes, a partir dela].
  const cortar = (pecas, frase) => {
    const i = pecas.findIndex(p => p.t !== undefined && p.t.includes(frase));
    if (i < 0) throw new Error(`content/docs/accessibility.md: o site B procura "${frase}" e não acha`);
    const j = pecas[i].t.indexOf(frase);
    return [[...pecas.slice(0, i), {t: pecas[i].t.slice(0, j).trimEnd()}], [{t: pecas[i].t.slice(j)}, ...pecas.slice(i + 1)]];
  };
  const [c2a, c2b] = cortar(semTitulo(c2), "What still protects them");

  const IDS = ["readable-type", "contrast", "focus", "touch-targets", "keyboard", "screen-readers", "motion", "forced-colours", "text-size-and-reflow"];
  if (relance.linhas.length !== IDS.length) throw new Error("content/docs/accessibility.md: a tabela \"At a glance\" mudou de tamanho");
  const LIMITES = [["WCAG 1.4.11 asks for", 3, true], ["Fields, dark theme", 1.34], ["Controls, dark theme", 1.92],
    ["Fields in a white surface, light", 1.21], ["Controls in a white surface, light", 1.49], ["A field on the page, light (with a shadow)", 1.09]];
  const sr = leitores.filter(b => b.tipo === "codigo");
  const kLingua = leitores.findIndex(b => b.tipo === "h3");

  // A caixa da demonstração (o palco do site com o rótulo em mono).
  const caixa = (rotulo, extra, ...filhos) => h("div", {className: "acc-caixa", ...extra}, h("p", {className: "g5-rotulo"}, rotulo), ...filhos);
  // O cartão de reflow: o que a janela própria mostra (e o que aparece sem o script).
  const cartaoReflow = h(A.Card, {className: "acc-reflow-cartao"},
    h("h4", null, "Weekly report"), h("p", null, "Sent every Monday at 9:00 to the twelve people in the team."),
    h("div", {className: "acc-reflow-botoes"}, h(A.Button, {variant: "primary", type: "button"}, "Edit"), h(A.Button, {variant: "secondary", type: "button"}, "Pause")));

  const node = pagina("acc-b",
    palco("Handbook", [
      h(A.Card, {className: "intro-cartao"}, h("span", {className: "acc-aa"}, "Aa"),
        h("span", {className: "intro-mini"}, h("b", null, razao(TINTA, AMARELO)), h("br"), "ink on the yellow")),
      peca.numero("44", "px targets", "touch and native"),
      peca.amarela("2px focus ring", "acc-anel-peca"),
      h(A.Card, {className: "intro-cartao intro-cartao-capsula acc-capsula"}, h("span", null, "200% text, no sideways scroll"))]),
    bloco(intro, "a"),
    secao("at-a-glance", "Nine areas", "At a glance",
      h("div", {className: "acc-relance"}, ...relance.linhas.map((l, n) => h(A.Card, {key: n, variant: "interactive", lift: true, className: "acc-area",
        render: h("a", {href: `#${IDS[n]}`})},
        h("b", null, ...site.pedacos(l[0], `a${n}`)), h("span", {className: "acc-area-faz"}, ...site.pedacos(l[1], `w${n}`)),
        h("span", {className: "acc-area-quem"}, h(A.Icon, {name: "check-circle", size: "sm"}), h("span", null, ...site.pedacos(l[2], `c${n}`))))))),
    secao("readable-type", "Inter · Sora · IBM Plex Mono", "Readable type",
      h("div", {className: "acc-fontes"}, ...[
        ["Text", "Inter", "inter", "A typeface drawn for screens. Its optical size covers 14 to 32 pixels: more open in small text, a little tighter in large text."],
        ["Titles · h1 to h6", "Sora", "sora", "Every title, from `h1` to `h6`."],
        ["Code and values", "Plex", "plex", "Every digit has the same width: the figure of a KPI, or a number marked `numeric`."],
      ].map(([rotulo, nome, fonte, texto], n) => h(A.Card, {key: nome, className: "acc-fonte"}, h("span", {className: "g5-rotulo"}, rotulo),
        h("span", {className: "acc-fonte-nome", "data-fonte": fonte}, nome), h("p", null, ...site.linhaMd(texto, `f${n}`))))),
      h("p", {className: "intro-p g5-p"}, ...site.linhaMd("All three ship in `@aurea-uds/fonts` as WOFF2 for the web. Other numbers that are read in columns, in tables, also use digits of the same width, in Inter, so the columns line up:", "t")),
      h("div", {className: "g5-grade-2"}, ...[["digits of the same width", "tabular"], ["proportional digits", "proporcional"]].map(([rotulo, jeito]) =>
        h(A.Card, {key: jeito, className: "acc-digitos"}, h("span", {className: "g5-rotulo"}, rotulo),
          h("span", {className: "acc-digitos-coluna", "data-jeito": jeito}, h("span", null, "1,111.10"), h("span", null, "8,888.80"), h("span", null, "4,071.95"))))),
      bloco(tipo.filter(b => b.tipo === "p").at(-1), "s")),
    secao("contrast", "Measured, not assumed", "Contrast",
      bloco(medido.find(b => b.tipo === "p"), "m"),
      bloco(semAmarelo, "l"),
      h("div", {className: "acc-razoes"},
        h(A.Card, {className: "acc-razao"}, h("span", {className: "acc-amostra acc-amostra-amarela"}, "Save"), h("b", null, razao(TINTA, AMARELO)),
          h("p", null, "Text on the brand yellow is the ink, ", h("code", null, TINTA.toUpperCase()), ", in both themes.")),
        h(A.Card, {className: "acc-razao"}, h("span", {className: "acc-amostra", "data-theme": "light"},
          h(A.Button, {variant: "secondary", type: "button", tabIndex: -1, className: "acc-anel"}, "Focus")), h("b", null, razao(TEXTO, PAGINA)),
          h("p", null, "The light theme's focus ring on the page.")),
        h(A.Card, {className: "acc-razao"}, h("span", {className: "acc-amostra", "data-theme": "light"},
          h(A.Button, {variant: "primary", type: "button", tabIndex: -1, className: "acc-anel"}, "Save")), h("b", null, razao(TEXTO, AMARELO)),
          h("p", null, "The same ring around the yellow button.")))),
    secao("known-trade-offs", "Written down, with the numbers", "Known trade-offs",
      bloco(abreConcessoes, "k"),
      h(A.Card, {className: "acc-concessao"},
        h("h3", null, h("span", {className: "acc-concessao-n"}, "1"), titulo(c1)), h("p", null, ...site.pedacos(semTitulo(c1), "c1")),
        h("div", {className: "acc-limites", role: "group", "aria-label": "Measured boundaries against 3 to 1"},
          ...LIMITES.map(([rotulo, valor, regua]) => h(A.Progress, {key: rotulo, label: rotulo, detail: `${valor.toFixed(2)} : 1`,
            value: Math.round(valor / 3 * 100), tone: regua ? "success" : "warning", size: "lg", showLabel: true})))),
      h(A.Card, {className: "acc-concessao"},
        h("h3", null, h("span", {className: "acc-concessao-n"}, "2"), titulo(c2)), h("p", null, ...site.pedacos(c2a, "c2a")),
        h("div", {className: "acc-parecidas", "aria-hidden": "true"}, h("span", null, "Il", h("small", null, "I · l")), h("span", null, "0O", h("small", null, "0 · O"))),
        h("p", null, ...site.pedacos(c2b, "c2b"))),
      h(A.Card, {className: "acc-concessao"},
        h("h3", null, h("span", {className: "acc-concessao-n"}, "3"), titulo(c3)), h("p", null, ...site.pedacos(semTitulo(c3), "c3")),
        h("div", {className: "acc-marcas", inert: true, "data-theme": "light"},
          h("span", null, h(A.Switch, {label: "On", labelHidden: true, defaultChecked: true, size: "lg"}), `white on yellow · ${razao("#ffffff", AMARELO)}`),
          h("span", null, h(A.Input, {"aria-label": "Field", defaultValue: "", readOnly: true, className: "acc-campo-anel"}), `field focus · ${razao(AMARELO, PAGINA)}`))),
      aviso("success", "check-circle", null, ...site.pedacos(passa.texto, "ok")),
      aviso("warning", "warning", null, ...site.pedacos(aaInteiro.texto, "aa"))),
    secao("focus", "One line, always", "Focus",
      bloco(foco[0], "f0"),
      caixa("Press Tab to move through these", {role: "group", "aria-label": "Try the focus with Tab", "data-acc-foco": ""},
        h("div", {className: "acc-foco-pecas"},
          h(A.Button, {variant: "primary", type: "button"}, "Save"),
          h(A.Input, {"aria-label": "Email", defaultValue: "you@company.com", readOnly: true, "data-acc-campo": "", className: "acc-foco-campo"}),
          h(A.Link, {href: "#focus"}, "A link"),
          h(A.Button, {variant: "secondary", size: "md", type: "button", "aria-pressed": "false", "data-acc-invalido": ""}, "Make the field invalid"))),
      ...foco.slice(1).map((b, n) => bloco(b, `f${n + 1}`))),
    secao("touch-targets", "--target-min · 2.75rem", "Touch targets",
      bloco(toque[0], "t0"),
      caixa("A small remove button keeps its drawing", {"data-acc-toque": "", "data-mostrar": "true"},
        h("div", {className: "acc-toque-pecas"},
          h(A.TagGroup, {label: "Tags", labelHidden: true, size: "lg", variant: "surface", items: [{id: "design", label: "Design"}], onRemove: () => {}}),
          h(A.Button, {variant: "secondary", size: "md", type: "button", "aria-pressed": "true", "data-acc-area": ""}, "Hide the 44px hit area"))),
      ...toque.slice(1).map((b, n) => bloco(b, `t${n + 1}`))),
    secao("keyboard", "Base UI", "Keyboard", ...teclado.map((b, n) => bloco(b, `k${n}`))),
    secao("screen-readers", "Names, states, descriptions", "Screen readers",
      ...leitores.slice(0, kLingua).map((b, n) => b.tipo === "codigo" ? codigo(b.codigo, {arquivo: "Form.tsx", lingua: b.lingua, chave: `s${n}`}) : bloco(b, `s${n}`)),
      ...leitores.slice(kLingua).map((b, n) => b.tipo === "codigo" ? codigo(b.codigo, {arquivo: "App.tsx", lingua: b.lingua, chave: `l${n}`}) : bloco(b, `l${n}`))),
    secao("motion", "Less movement", "Motion",
      ...movimento.map((b, n) => b.tipo === "codigo" ? codigo(b.codigo, {arquivo: "FadeIn.tsx", lingua: b.lingua, chave: `m${n}`}) : bloco(b, `m${n}`))),
    secao("forced-colours", "forced-colors: active", "Forced colours", ...forcadas.map((b, n) => bloco(b, `fc${n}`))),
    secao("text-size-and-reflow", "200%", "Text size and reflow",
      h("p", {className: "intro-p g5-p"}, ...site.pedacos(reflow[0].texto, "r"), " Try the size:"),
      h("div", {className: "acc-reflow", "data-acc-reflow": ""},
        h("div", {className: "acc-reflow-topo"}, h("b", {"data-acc-tamanho": ""}, "100%"),
          h("span", null, "The card wraps; it never scrolls sideways.")),
        h(A.Slider, {label: "Text size", labelHidden: true, min: 100, max: 200, step: 10, defaultValue: 100, className: "acc-reflow-regua"}),
        // A janela própria: o script a cria com este cartão dentro e a folha do site; sem o script, o cartão fica aqui.
        h("div", {className: "acc-reflow-janela", "data-acc-janela": ""}, cartaoReflow))),
    secao("right-to-left", "Mirrored", "Right-to-left", ...rtl.map((b, n) => bloco(b, `rt${n}`))),
    secao("what-stays-with-your-app", "Your part", "What stays with your app", ...app.map((b, n) => bloco(b, `y${n}`))),
    proxima());
  const toc = [["at-a-glance", "At a glance"], ["readable-type", "Readable type"], ["contrast", "Contrast"], ["known-trade-offs", "Known trade-offs"],
    ["focus", "Focus"], ["touch-targets", "Touch targets"], ["keyboard", "Keyboard"], ["screen-readers", "Screen readers"], ["motion", "Motion"],
    ["forced-colours", "Forced colours"], ["text-size-and-reflow", "Text size and reflow"], ["right-to-left", "Right-to-left"],
    ["what-stays-with-your-app", "What stays with your app"]].map(([id, label]) => ({id, label}));
  return {node, toc};
}
