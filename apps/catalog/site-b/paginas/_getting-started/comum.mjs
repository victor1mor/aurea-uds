// AS PEÇAS COMUNS DAS PÁGINAS DA GETTING STARTED NO DESENHO B (02/11/2026): Quick Start, Design Principles, Frameworks,
// Showcase, Roadmap, Colors e Theming. Esta pasta não é página (o gerador só lê os `.mjs` soltos em `paginas/`): é o que
// as sete repetem — a abertura no palco, as seções com o olho e o título, o texto do `.md` arrumado, o bloco de código com
// o nome do arquivo, a chave de segmentos, os quatro links e o "Next". O arranjo está em `site-b/css/getting-started.css`,
// com as classes `gs-`; o comportamento comum (a chave de segmentos, o índice que some com a seção), em
// `site-b/js/getting-started.js`.
//
// O texto continua vindo do `.md` (o "Copy Markdown" copia o arquivo): a página pega os blocos de cada seção pelo título.

export function ferramentas(site) {
  const {h, Fragment, A} = site;

  // As seções do `.md`, pelo título (h2 e h3): {id, rotulo, tipo, blocos}. `antes` são os blocos antes do primeiro título.
  const secoes = doc => {
    const lista = [], antes = [];
    let atual = null;
    for (const b of doc.blocos) {
      if (b.tipo === "h2" || b.tipo === "h3") { atual = {id: b.id, rotulo: b.rotulo, tipo: b.tipo, texto: b.texto, blocos: []}; lista.push(atual); }
      else (atual ? atual.blocos : antes).push(b);
    }
    const por = rotulo => {
      const s = lista.find(x => x.rotulo === rotulo);
      if (!s) throw new Error(`content/docs/${doc.nome}.md: a página B procura a seção "${rotulo}", e ela não existe`);
      return s;
    };
    return {lista, antes, por};
  };

  // O nome do arquivo na cabeça do bloco de código, quando a página não diz outro.
  const ARQUIVO = {bash: "Terminal", sh: "Terminal", css: "styles.css", tsx: "App.tsx", ts: "index.ts", html: "index.html", json: "package.json", js: "index.js"};
  // O bloco de código do desenho (ITEM 6, aprovado com "ícone + nome"): a cabeça com o nome do arquivo e o "Copy" escrito.
  // Sem cores e sem número de linha, como o desenho.
  const codigo = (texto, arquivo, lingua = "tsx", extra = {}) => h(A.CodeBlock, {filename: arquivo || ARQUIVO[lingua] || "Code", copyable: true,
    language: lingua, className: "gs-codigo", ...extra}, texto);

  const p = (texto, chave, extra = {}) => h("p", {key: chave, className: "intro-p gs-p", ...extra}, ...site.pedacos(texto, `${chave}-`));
  // Os blocos de uma seção, com a pele do desenho. `arquivos`: o nome de cada bloco de código, na ordem; `pular`: os tipos
  // que a página desenha por conta própria (a tabela de uma seção que vira cartões, por exemplo).
  const corpo = (blocos, {arquivos = [], chave = "b", pular = [], tabela = null} = {}) => {
    let k = 0;
    return blocos.filter(b => !pular.includes(b.tipo)).map((b, n) => {
      const id = `${chave}${n}`;
      if (b.tipo === "p") return p(b.texto, id);
      if (b.tipo === "ul" || b.tipo === "ol") return h(b.tipo, {key: id, className: `gs-lista gs-${b.tipo}`},
        ...b.itens.map((it, j) => h("li", {key: j}, h("span", null, ...site.pedacos(it, `${id}-${j}-`)))));
      if (b.tipo === "codigo") return h(Fragment, {key: id}, codigo(b.codigo, arquivos[k++], b.lingua));
      if (b.tipo === "tabela") return tabela ? tabela(b, id) : tabelaB(b, id);
      return null;
    });
  };
  // A tabela do desenho: a `Table` da Aurea em linhas (`variant="rows"`), na caixa do cartão. A legenda é o nome da região
  // que rola (o mesmo cuidado do `docPage`).
  const tabelaB = (b, chave, legenda = "Table") => h("div", {key: chave, className: "gs-tabela"},
    h(A.Table, {variant: "rows", caption: legenda},
      h("thead", null, h("tr", null, ...b.cabecalho.map((c, j) => h("th", {key: j, scope: "col"}, ...site.pedacos(c, `${chave}h${j}`))))),
      h("tbody", null, ...b.linhas.map((l, j) => h("tr", {key: j}, ...l.map((c, i) => h("td", {key: i}, ...site.pedacos(c, `${chave}r${j}c${i}`))))))));

  // A ABERTURA: o palco da Introduction (o texto à esquerda, as quatro peças que flutuam à direita). `pecas`: os quatro
  // desenhos, na ordem das posições do desenho (que são as da Introduction: intro-peca-1 a 4).
  const FUNDOS = ["0.8", "1.4", "1.8", "1.1"];
  const grupoDe = doc => (site.DOCS.find(g => g.paginas.includes(doc.nome)) || {label: "Overview"}).label;
  const abertura = (doc, pecas, {classe = ""} = {}) => h("section", {className: `intro-palco gs-palco ${classe}`.trim(), "aria-labelledby": "gs-h1", "data-palco": ""},
    h("div", {className: "intro-palco-texto"},
      h("span", {className: "intro-trilha"}, "Getting Started ", h("span", {"aria-hidden": "true"}, "/"), " ", h("b", null, grupoDe(doc))),
      h("h1", {className: "intro-h1", id: "gs-h1"}, doc.title),
      h("p", {className: "intro-lede"}, doc.description),
      h("div", {className: "intro-acoes"}, site.acoesDaPagina(true, "md"))),
    h("div", {className: "intro-pecas", "aria-hidden": "true"},
      ...pecas.map((peca, n) => h("div", {key: n, className: `intro-peca intro-peca-${n + 1}`, "data-fundo": FUNDOS[n]},
        h("div", {className: "intro-boia"}, peca)))));
  // A peça que flutua: o cartão da Introduction (a cor da peça erguida, `--shadow-md`).
  const cartao = (filhos, classe = "") => h(A.Card, {className: `intro-cartao ${classe}`.trim()}, ...[].concat(filhos));
  const capsula = (filhos, classe = "") => cartao(filhos, `intro-cartao-capsula ${classe}`.trim());
  const numerao = (n, forte, fraco) => cartao([h("span", {key: "n", className: "gs-numerao"}, n),
    h("span", {key: "t", className: "intro-mini"}, h("b", null, forte), h("br"), fraco)]);
  const amarela = texto => h("span", {className: "gs-amarela"}, texto);

  // A SEÇÃO: o olho (código, amarelo) e o título de 34 → 36 (o `--text-4xl` da Introduction).
  const secao = (id, olho, titulo, ...filhos) => h("section", {key: id, className: "intro-sec gs-sec", id, "data-gs-sec": id},
    olho ? h("p", {className: "intro-olho"}, olho) : null,
    titulo != null ? h("h2", {className: "intro-h2"}, titulo) : null, ...filhos);

  // A CHAVE DE SEGMENTOS: a pele da `SegmentedControl` (o escolhido erguido, sem o fio — `selectedStyle="neutral"`, ITEM 3),
  // com botões de ligar: a página não hidrata a peça, e o `getting-started.js` move o escolhido. `data-gs-chave`: o nome da
  // escolha; cada botão leva `data-valor`.
  const chave = (nome, rotulo, opcoes, ativo, {tamanho = "lg", cheia = false, quebra = false, classe = ""} = {}) =>
    h("span", {className: ["segmented", tamanho && `segmented-${tamanho}`, cheia && "segmented-full", quebra && "segmented-wrap", "gs-chave", classe].filter(Boolean).join(" "),
      "data-segment-style": "neutral", role: "group", "aria-label": rotulo, "data-gs-chave": nome},
      ...opcoes.map(o => { const [valor, texto] = Array.isArray(o) ? o : [o, o];
        return h("button", {key: valor, type: "button", "data-valor": valor, className: valor === ativo ? "active" : undefined,
          "aria-pressed": valor === ativo ? "true" : "false"}, texto); }));
  const rotuloK = texto => h("span", {className: "gs-k"}, texto);

  // OS QUATRO LINKS ("What's next", "Next steps"): o cartão clicável que sobe (`Card interactive lift`, ITEM 7), com o
  // ladrilho na cor, o nome, a frase e a seta.
  const links = itens => h("div", {className: "gs-links"}, ...itens.map(([nome, href, icone, cor, frase]) =>
    h(A.Card, {key: nome, variant: "interactive", lift: true, className: "gs-link", render: h("a", {href})},
      site.blocoDeTile(icone, cor), h("span", {className: "gs-link-texto"}, h("b", null, nome), h("span", null, frase)),
      h(A.Icon, {name: "arrow-right", size: "sm", className: "gs-link-seta"}))));
  // Os links de uma lista do `.md` ("- [Nome](./x.html): frase."), com o ícone e a cor que a página dá a cada um.
  const linksDaLista = (lista, enfeites) => links(lista.itens.map((it, n) => {
    const link = it.find(x => x.link !== undefined);
    const resto = it.filter(x => x !== link).map(x => x.t ?? x.code ?? "").join("").replace(/^\s*:\s*/, "");
    const frase = resto ? resto[0].toUpperCase() + resto.slice(1) : "";
    return [link.link, link.href, ...(enfeites[n] || ["arrow-right", "blue"]), frase];
  }));

  // O "NEXT" do fim, o da Introduction.
  const proxima = doc => {
    const {next} = site.vizinhos("start", doc.arquivo);
    return next ? h("a", {className: "intro-proxima", href: next.href},
      h("div", null, h("span", {className: "intro-proxima-k"}, "Next"), h("b", null, next.name), h("p", null, next.summary || "")),
      h("span", {className: "intro-proxima-seta"}, h(A.Icon, {name: "arrow-right"}))) : null;
  };

  // A página inteira: a abertura, o corpo e o texto do "Copy Markdown".
  const pagina = (doc, abertura_, ...corpo_) => h(Fragment, null, abertura_, h("div", {className: "intro-corpo gs-corpo", "data-gs-pagina": doc.nome}, ...corpo_, proxima(doc)),
    site.textoParaCopiar(site.paraTexto(doc.texto)));

  return {secoes, codigo, p, corpo, tabelaB, abertura, cartao, capsula, numerao, amarela, secao, chave, rotuloK, links, linksDaLista, proxima, pagina};
}
