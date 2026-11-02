// O MOLDE DAS PÁGINAS DO HANDBOOK NO DESENHO B (02/11/2026): Dark Mode, Styling, Animation, Composition, Density e Icons.
//
// Mora numa pasta, e não ao lado das páginas: o gerador carrega como página todo `.mjs` de `site-b/paginas/`, e isto não
// é página. As seis usam o mesmo arranjo do desenho aprovado — a abertura no palco da Introduction (as quatro peças que
// flutuam), as seções com o olho e o título, o código com o nome do arquivo (o `CodeBlock filename`), a tabela em linhas
// (`Table variant="rows"`), os avisos, os cartões de "Next steps" e o "Next" do fim. O texto continua vindo do `.md`: cada
// página só escolhe o olho de cada seção, o nome de cada arquivo de código e o que o desenho põe no meio.

// O texto corrido de um bloco (para achar um parágrafo pelo começo).
const textoDe = lista => (lista || []).map(p => p.t ?? p.code ?? p.link ?? p.strong ?? "").join("");

export function docsB(site, doc, {arquivos = [], grupo = "Handbook"} = {}) {
  const {h, Fragment, A, pedacos} = site;
  // A introdução (antes do primeiro título) e as seções de `##`. O `###` fica dentro da seção dele.
  const intro = [], secoes = [];
  for (const b of doc.blocos) {
    if (b.tipo === "h2") secoes.push({id: b.id, rotulo: b.rotulo, texto: b.texto, blocos: []});
    else (secoes.length ? secoes[secoes.length - 1].blocos : intro).push(b);
  }
  // O nome de cada arquivo de código, na ordem em que o código aparece no `.md`. A conta tem de bater: código a mais ou a
  // menos no texto quer dizer que o desenho envelheceu, e a montagem para em vez de dar o nome errado a um bloco.
  const codigos = doc.blocos.filter(b => b.tipo === "codigo");
  if (codigos.length !== arquivos.length) {
    throw new Error(`site-b/paginas/${doc.nome}: o .md tem ${codigos.length} blocos de código e a página dá nome a ${arquivos.length}`);
  }
  const nomeDoArquivo = new Map(codigos.map((b, n) => [b, arquivos[n]]));
  let chave = 0;
  const k = () => `b${chave++}`;

  const secao = id => {
    const s = secoes.find(x => x.id === id);
    if (!s) throw new Error(`site-b/paginas/${doc.nome}: a seção "${id}" não está no .md (as que estão: ${secoes.map(x => x.id).join(", ")})`);
    return s;
  };
  // Acha um bloco da seção: pelo tipo e, num parágrafo, pelo começo do texto.
  const achar = (s, tipo, comeco = "") => {
    const b = s.blocos.find(x => x.tipo === tipo && (!comeco || textoDe(x.texto ?? x.itens?.[0]).startsWith(comeco)));
    if (!b) throw new Error(`site-b/paginas/${doc.nome}: não achei ${tipo} "${comeco}" na seção ${s.id}`);
    return b;
  };

  // ── Os blocos, no desenho B ──────────────────────────────────────────────────────────────────────────────────────
  const p = (b, extra = "") => h("p", {key: k(), className: `intro-p docb-p ${extra}`.trim()}, ...pedacos(b.texto, k()));
  const lista = b => h(b.tipo, {key: k(), className: b.tipo === "ol" ? "docb-lista docb-lista-n" : "docb-lista"},
    ...b.itens.map(it => h("li", {key: k()}, h("span", null, ...pedacos(it, k())))));
  // O código: o bloco com a cabeça do arquivo (a variação aprovada no item 6), sem cor e sem número de linha, como o desenho.
  const codigo = (b, extra = "") => h(A.CodeBlock, {key: k(), className: `docb-codigo ${extra}`.trim(), filename: nomeDoArquivo.get(b) ?? "Code",
    copyable: true, language: b.lingua}, b.codigo);
  // A tabela: a de linhas em cápsula (a variação aprovada no D-7.6), dentro do cartão do desenho. A legenda é o nome da
  // região (o leitor de tela), escondida da vista como no desenho.
  const celula = (tag, c, i) => h(tag, {key: i, ...(tag === "th" ? {scope: "col"} : {})}, ...pedacos(c, k()));
  const cabeca = b => h("thead", null, h("tr", null, ...b.cabecalho.map((c, j) => celula("th", c, j))));
  const corpo = b => h("tbody", null, ...b.linhas.map((l, j) => h("tr", {key: j}, ...l.map((c, i) => celula("td", c, i)))));
  const tabela = (b, legenda) => h("div", {key: k(), className: "docb-tabela"},
    h(A.Table, {variant: "rows", caption: legenda}, cabeca(b), corpo(b)));
  // O aviso: o `Alert` da Aurea, com o arranjo da Introduction (`intro-nota`).
  const aviso = (b, variant = "info", title) => h(A.Alert, {key: k(), variant, className: "intro-nota docb-aviso", ...(title ? {title} : {})},
    ...pedacos(b.texto, k()));
  // Um bloco qualquer, do jeito de sempre. A caixa de exemplo (`::: demo`) sai: o desenho mostra o código dela, e a seção
  // mostra as peças vivas no lugar.
  const bloco = (b, legenda) => b.tipo === "p" ? p(b)
    : b.tipo === "ul" || b.tipo === "ol" ? lista(b)
    : b.tipo === "codigo" ? codigo(b)
    : b.tipo === "tabela" ? tabela(b, legenda)
    : b.tipo === "h3" ? h("h3", {key: k(), id: b.id, className: "docb-h3"}, ...pedacos(b.texto, k()))
    : null;
  // Todos os blocos de uma lista; `troca(b)` devolve o que entra no lugar de um bloco (undefined = o de sempre).
  const blocos = (lista_, {troca, legenda} = {}) => lista_.map(b => {
    const t = troca?.(b);
    return t === undefined ? bloco(b, legenda) : t;
  });

  // ── As partes da página ──────────────────────────────────────────────────────────────────────────────────────────
  // A seção do desenho: o olho (a linha pequena em cima) e o título. Mesmo arranjo da Introduction.
  const sec = ({id, olho, titulo, filhos}) => h("section", {key: id, id, className: "intro-sec docb-sec", "aria-labelledby": `${id}-t`},
    olho ? h("p", {className: "intro-olho"}, olho) : null,
    h("h2", {className: "intro-h2", id: `${id}-t`}, titulo),
    ...filhos);
  // A seção que vem do `.md`, com o olho do desenho. `filhos` troca o miolo quando a página arruma o texto de outro jeito.
  const doMd = (id, olho, filhos) => {
    const s = secao(id);
    return {id, label: s.rotulo, node: sec({id, olho, titulo: h(Fragment, null, ...pedacos(s.texto, k())), filhos: filhos ?? blocos(s.blocos, {legenda: s.rotulo})})};
  };
  // Uma seção que só o desenho tem (o mapa do começo).
  const doDesenho = (id, label, olho, filhos) => ({id, label, node: sec({id, olho, titulo: label, filhos})});

  // Os cartões de "Next steps": cada item do `.md` é um link; o desenho mostra o nome, uma frase curta e o ladrilho.
  const proximos = (s, cartoes) => {
    const b = achar(s, "ul");
    const itens = b.itens.map(it => it.find(x => x.link !== undefined));
    if (itens.some(x => !x) || itens.length !== cartoes.length) throw new Error(`site-b/paginas/${doc.nome}: "Next steps" mudou no .md`);
    return h("div", {key: k(), className: "docb-links"}, ...itens.map((l, n) => {
      const [icone, cor, frase] = cartoes[n];
      return h(A.Card, {key: l.href, variant: "interactive", lift: true, className: "docb-link", render: h("a", {href: l.href})},
        site.blocoDeTile(icone, cor),
        h("span", {className: "docb-link-texto"}, h("b", null, l.link), h("span", null, frase)),
        h(A.Icon, {name: "arrow-right", className: "docb-link-seta"}));
    }));
  };

  // A abertura: o palco da Introduction, com a trilha, o título, a frase, as ações e as quatro peças que flutuam.
  const fundos = ["0.8", "1.4", "1.8", "1.1"];
  const abertura = pecas => h("section", {className: "intro-palco docb-palco", "aria-labelledby": "docb-h1", "data-palco": ""},
    h("div", {className: "intro-palco-texto"},
      h("span", {className: "intro-trilha"}, "Getting Started ", h("span", {"aria-hidden": "true"}, "/"), " ", h("b", null, grupo)),
      h("h1", {className: "intro-h1", id: "docb-h1"}, doc.title),
      h("p", {className: "intro-lede"}, doc.description),
      h("div", {className: "intro-acoes"}, site.acoesDaPagina(true, "md"))),
    h("div", {className: "intro-pecas", "aria-hidden": "true"}, ...pecas.map((peca, n) =>
      h("div", {key: n, className: `intro-peca intro-peca-${n + 1}`, "data-fundo": fundos[n]}, h("div", {className: "intro-boia"}, peca)))));

  // A página inteira: a abertura, o texto de antes das seções, as seções e o "Next".
  const pagina = ({pecas, antes, partes}) => {
    const {next} = site.vizinhos("start", doc.arquivo);
    const node = h(Fragment, null,
      abertura(pecas),
      h("div", {className: "intro-corpo docb-corpo"},
        ...(antes ?? blocos(intro)),
        ...partes.map(x => x.node),
        next ? h("a", {className: "intro-proxima", href: next.href},
          h("div", null, h("span", {className: "intro-proxima-k"}, "Next"), h("b", null, next.name), h("p", null, next.summary || "")),
          h("span", {className: "intro-proxima-seta"}, h(A.Icon, {name: "arrow-right"}))) : null),
      site.textoParaCopiar(site.paraTexto(doc.texto)));
    return {node, toc: partes.map(x => ({id: x.id, label: x.label}))};
  };

  // ── As peças pequenas do palco ───────────────────────────────────────────────────────────────────────────────────
  // O cartão que flutua; `capsula` para o de canto redondo do desenho.
  const cartao = (filhos, capsula = false) => h(A.Card, {className: `intro-cartao docb-cartao${capsula ? " intro-cartao-capsula" : ""}`}, ...[].concat(filhos));
  // O número grande com as duas linhas ao lado ("4 ways · from most to least preferred").
  const numero = (n, forte, fraco) => cartao([h("span", {key: "n", className: "docb-numero"}, n),
    h("span", {key: "t", className: "intro-mini"}, h("b", null, forte), h("br"), fraco)]);
  // O texto em fonte de código numa cápsula.
  const mono = texto => cartao(h("span", {className: "docb-mono"}, texto), true);
  // A etiqueta amarela numa cápsula (o "chipy" do desenho): o selo primário cheio da Aurea, no arranjo da Introduction.
  const amarela = (...filhos) => cartao(h(A.Badge, {variant: "primary", emphasis: "solid", size: "lg", className: "intro-razao docb-amarela"}, ...filhos), true);
  // A frase curta: o forte e o fraco lado a lado.
  const frase = (forte, fraco) => cartao([h("span", {key: "f", className: "intro-mini intro-forte"}, forte),
    fraco ? h("span", {key: "m", className: "intro-mini"}, fraco) : null]);

  return {h, Fragment, A, pedacos, intro, secoes, secao, achar, textoDe, p, lista, codigo, tabela, aviso, bloco, blocos, sec,
    doMd, doDesenho, proximos, pagina, cartao, numero, mono, amarela, frase, k};
}
