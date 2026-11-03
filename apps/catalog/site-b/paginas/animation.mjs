// ANIMATION no desenho B (aprovado em 26/10/2026). O texto é o do `animation.md`; a página arruma como o desenho: a tabela
// de "Built-in motion" vira a galeria de palcos — cada palco com a peça de VERDADE se mexendo —, a dos tokens ganha a
// bolinha que corre com o tempo de cada um, as duas curvas apostam corrida, e "Entering and leaving" mostra o balão como
// sai e com a regra do próprio texto.
//
// AS JANELAS PRESAS NO PALCO (o D-4, aprovado em 01/11/2026): a janela, a gaveta, o balão e o aviso são os da Aurea (a
// pele, as medidas, a entrada e a saída), presos num contêiner com `data-contained`; a MINIATURA a 70% é do site, para a
// janela de verdade caber no palco. A página é estática: quem abre e fecha é o `site-b/js/animation.js`, escrevendo os
// mesmos `data-starting-style` e `data-ending-style` do motor. Elas são demonstração (fora do leitor de tela e do Tab): o
// que se lê é o nome do cartão e a frase.
import {docsB} from "./docs-b/comum.mjs";

export default function animation(site, doc) {
  const g = docsB(site, doc, {arquivos: ["Example.tsx", "results.css", "app.css", "motion.ts", "FadeIn.tsx"]});
  const {h, A} = g;

  const pecas = [
    g.numero("120", "ms", "--duration-fast"),
    g.mono("cubic-bezier(0.2, 0, 0, 1)"),
    g.frase("No library", "plain CSS in the core"),
    g.amarela("reduce motion"),
  ];

  // ── BUILT-IN MOTION: um palco por linha da tabela ──────────────────────────────────────────────────────────────────
  const bi = g.secao("built-in-motion");
  const movimentos = g.achar(bi, "tabela");
  // A miniatura presa: o contêiner `data-contained` a 70% (o número é do site). `abrir` diz qual peça o botão abre.
  const mini = (abrir, ...filhos) => h("div", {className: "animation-mini", "data-contained": "", "data-janela": abrir, "aria-hidden": "true"}, ...filhos);
  const botaoFalso = texto => h("span", {className: "btn btn-tertiary btn-sm animation-ancora"}, texto);
  const janela = mini("dialog",
    h("div", {className: "dialog-backdrop", "data-fechada": ""}),
    h("div", {className: "dialog", "data-fechada": ""},
      h("div", {className: "dialog-header"}, h("div", {className: "dialog-heading"}, "Discard the draft?")),
      h("div", {className: "dialog-body"}, "Your changes are not saved yet."),
      h("div", {className: "dialog-footer"}, botaoFalso("Cancel"), h("span", {className: "btn btn-primary btn-sm"}, "Discard"))));
  const gaveta = mini("drawer",
    h("div", {className: "drawer drawer-right", "data-fechada": ""},
      h("div", {className: "dialog-header"}, h("div", {className: "dialog-heading"}, "Filters")),
      h("div", {className: "dialog-body"}, "Status, owner and date.")));
  // O balão do exemplo do `.md` (o título "Popover" e a frase), preso ao botão do palco.
  const balao = (extra = "") => mini("popover",
    h("div", {className: `animation-balao ${extra}`.trim()},
      h("div", {className: "popover", "data-fechada": ""}, h("div", {className: "popover-title"}, "Popover"), h("div", null, "It grows in and shrinks out.")),
      botaoFalso("Open popover")));
  const aviso = mini("toast",
    h("div", {className: "toast-stack"},
      h("div", {className: "toast", "data-fechada": ""},
        h("div", {className: "toast-content"}, h("span", {className: "toast-indicator"}, h(A.Icon, {name: "check-circle", weight: "fill"})),
          h("div", {className: "toast-text"}, h("div", {className: "toast-title"}, "Saved"), h("p", {className: "toast-description"}, "Your changes are stored."))))));
  // O palco de cada linha. Os que não abrem janela mostram a peça viva, que se usa ali mesmo.
  const palcos = {
    Button: () => [h("div", {key: "p", className: "animation-palco animation-palco-centro"}, h(A.Button, {variant: "primary"}, "Save"))],
    Dialog: () => [h("div", {key: "p", className: "animation-palco"}, janela), "dialog"],
    Drawer: () => [h("div", {key: "p", className: "animation-palco"}, gaveta), "drawer"],
    Popover: () => [h("div", {key: "p", className: "animation-palco"}, balao()), "popover"],
    Toast: () => [h("div", {key: "p", className: "animation-palco"}, aviso), "toast"],
    Accordion: () => [h("div", {key: "p", className: "animation-palco animation-palco-centro"},
      h(A.Accordion, {variant: "surface", className: "animation-acordeao", items: [{id: "ship", title: "Shipping", content: "Two to four working days."}]}))],
    Spinner: () => [h("div", {key: "p", className: "animation-palco animation-palco-centro animation-palco-baixo"},
      h(A.Spinner, {label: "Loading", size: "lg"}), h("div", {className: "animation-progresso"}, h(A.Progress, {label: "Loading the report"})))],
    Skeleton: () => [h("div", {key: "p", className: "animation-palco animation-palco-centro animation-palco-baixo"},
      h("div", {className: "animation-esqueleto", "aria-hidden": "true"}, h(A.Skeleton, {style: {inlineSize: "100%", blockSize: "var(--space-3)"}}),
        h(A.Skeleton, {style: {inlineSize: "70%", blockSize: "var(--space-3)"}}), h(A.Skeleton, {style: {inlineSize: "85%", blockSize: "var(--space-3)"}})))],
  };
  // Como o desenho (02/11/2026): o nome do cartão junta as peças com "·" ("Button · IconButton"); a linha das esperas vira
  // dois cartões, "Spinner · Progress" e "Skeleton" (com a frase do desenho); e o aviso se mostra com "Show".
  const nomeDoCartao = cel => g.textoDe(cel).replace(/ and /g, " · ").replace(/, /g, " · ");
  const ROTULO = {toast: "Show"};
  const frase = cel => {
    const t = g.pedacos(cel, g.k());
    if (typeof t[0] === "string") t[0] = t[0][0].toUpperCase() + t[0].slice(1);
    return [...t, "."];
  };
  const cartao = (n, chave, nome, texto) => {
    const [palco, abre] = palcos[chave]();
    const meio = chave === "Spinner" || chave === "Skeleton";
    return h("div", {key: n, className: `docb-caixa animation-movimento${meio ? " animation-movimento-meio" : ""}`},
      palco,
      h("div", {className: "animation-cabeca"}, h("b", null, nome),
        abre ? h(A.Button, {size: "md", variant: "tertiary", "data-abre": abre}, ROTULO[abre] ?? "Open") : null),
      h("p", null, ...texto));
  };
  const galeria = h("div", {key: "galeria", className: "animation-galeria"}, ...movimentos.linhas.flatMap((linha, n) => {
    const chave = g.textoDe(linha[0]).match(/^[A-Z][A-Za-z]*/)[0];
    if (chave === "Spinner") return [cartao(n, "Spinner", "Spinner · Progress", frase(linha[1])),
      cartao(`${n}s`, "Skeleton", "Skeleton", ["Pulses while the content loads."])];
    return [cartao(n, chave, nomeDoCartao(linha[0]), frase(linha[1]))];
  }));

  // A FAIXA "SIMULATE REDUCE MOTION" do desenho: On corta o movimento da página, como o sistema faria (a regra é do site,
  // `site-b/css/animation.css`); a frase da ponta diz o que acontece. Quem liga é o `site-b/js/animation.js`.
  const simulador = h("div", {key: "simula", className: "animation-simula", role: "group", "aria-label": "Simulate the system setting"},
    h("span", {className: "animation-simula-k"}, 'Simulate "reduce motion"'),
    h("span", {className: "segmented segmented-lg", "data-segment-style": "emphasis"},
      ...[["off", "Off"], ["on", "On"]].map(([v, rotulo]) => h("button", {key: v, type: "button", "data-an-reduz": v,
        className: v === "off" ? "active" : undefined, "aria-pressed": v === "off" ? "true" : "false"}, rotulo))),
    h("span", {className: "animation-simula-res", "aria-live": "polite", "data-an-reduz-frase": ""}, "the motion below plays"));

  // ── MOTION TOKENS: a tabela do `.md` com a bolinha que corre e o "Play" de cada linha ───────────────────────────────
  const mt = g.secao("motion-tokens");
  const tokens = g.achar(mt, "tabela");
  const pista = (tempo, curva) => h("span", {className: "animation-pista", "aria-hidden": "true"},
    h("span", {className: "animation-bola", style: {transitionDuration: tempo, transitionTimingFunction: curva}}));
  const tabelaTokens = h("div", {key: "tokens", className: "docb-tabela animation-tokens"},
    h(A.Table, {variant: "rows", striped: true, caption: "Motion tokens table"},
      h("thead", null, h("tr", null, ...tokens.cabecalho.map((c, j) => h("th", {key: j, scope: "col"}, ...g.pedacos(c, g.k()))),
        h("th", {key: "play", scope: "col"}, h("span", {className: "animation-escondido"}, "Try it")))),
      h("tbody", null, ...tokens.linhas.map((l, n) => {
        const nome = g.textoDe(l[0]);
        const duracao = nome.startsWith("--duration");
        // A duração anda na curva padrão; a curva anda em duas vezes a duração longa (560), para se ver a forma dela.
        const tempo = duracao ? `var(${nome})` : "calc(var(--duration-slow) * 2)";
        const curva = duracao ? "var(--ease-standard)" : `var(${nome})`;
        return h("tr", {key: n},
          h("td", null, ...g.pedacos(l[0], g.k())),
          h("td", null, h("span", {className: "animation-valor"}, ...g.pedacos(l[1], g.k()), pista(tempo, curva))),
          h("td", null, ...g.pedacos(l[2], g.k())),
          h("td", null, h(A.Button, {size: "md", variant: "tertiary", className: "animation-play", "aria-label": `Play ${nome}`}, "Play")));
      }))));
  const corrida = h("div", {key: "corrida", className: "docb-caixa animation-corrida"},
    h("div", {className: "animation-corrida-topo"}, h("b", null, "The two curves, side by side, at twice --duration-slow"),
      h(A.Button, {size: "md", variant: "primary", className: "animation-correr"}, "Race")),
    ...["--ease-standard", "--ease-emphasized"].map(c => h("div", {key: c, className: "animation-raia"}, h("code", null, c),
      pista("calc(var(--duration-slow) * 2)", `var(${c})`))));

  // ── ENTERING AND LEAVING: o balão como sai e com a regra do texto ───────────────────────────────────────────────────
  const el = g.secao("entering-and-leaving");
  const regra = el.blocos.find(b => b.tipo === "codigo");
  const doisBaloes = h("div", {key: "baloes", className: "docb-grade-2"},
    ...[["As shipped", "Grows in and shrinks out.", ""], ["With your rule", "Only fades.", "animation-so-esmaece"]].map(([titulo, texto, extra]) =>
      h("div", {key: titulo, className: "docb-caixa animation-movimento"},
        h("div", {className: "animation-palco"}, balao(extra)),
        h("div", {className: "animation-cabeca"}, h("b", null, titulo), h(A.Button, {size: "md", variant: "tertiary", "data-abre": "popover"}, "Open")),
        h("p", null, texto))));

  // ── REDUCED MOTION: os três grupos de regras em cartões ─────────────────────────────────────────────────────────────
  const rm = g.secao("reduced-motion");
  const grupos = g.achar(rm, "ul");
  const numeros = ["1", "7", "↔"];
  const cartoesRm = h("div", {key: "regras", className: "docb-grade-3"}, ...grupos.itens.map((it, n) => {
    const [forte, ...resto] = it;
    return h("div", {key: n, className: "docb-caixa animation-regra"}, h("span", {className: "animation-regra-n", "aria-hidden": "true"}, numeros[n]),
      h("b", null, forte.strong.replace(/\.$/, "")), h("p", null, ...g.pedacos(resto, `rm${n}`)));
  }));

  const partes = [
    g.doMd("built-in-motion", "Press play", g.blocos(bi.blocos, {troca: b => b === movimentos ? galeria : undefined})),
    g.doMd("motion-tokens", "Feel the timing", g.blocos(mt.blocos, {troca: b => b === tokens ? [tabelaTokens, corrida] : undefined})),
    g.doMd("entering-and-leaving", "data-starting-style · data-ending-style", g.blocos(el.blocos, {troca: b => b === regra ? [g.codigo(b), doisBaloes] : undefined})),
    g.doMd("reduced-motion", "prefers-reduced-motion", g.blocos(rm.blocos, {troca: b => b === grupos ? cartoesRm : undefined})),
    g.doMd("react-native", "useReduceMotion()"),
    g.doMd("next-steps", "Keep going", [g.proximos(g.secao("next-steps"), [["paint-brush", "teal", "Target state attributes."],
      ["hexagon", "orange", "See every token."], ["eye", "blue", "How Aurea serves low vision."]])]),
  ];
  return g.pagina({pecas, antes: [...g.blocos(g.intro), simulador], partes});
}
