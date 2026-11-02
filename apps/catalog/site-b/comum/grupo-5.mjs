// AS FERRAMENTAS COMUNS DO GRUPO 5 DO SITE B (02/11/2026): RTL, Accessibility, LLMs.txt, Agent Skills e AGENTS.md. Fica
// fora de `paginas/` porque não é página (o gerador carrega como página todo `.mjs` daquela pasta). O arranjo está em
// `site-b/css/grupo-5.css` (as classes `g5-`), e o desenho é o mesmo da Introduction (`intro-palco`, `intro-sec`…).
import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

// O tamanho de um texto como o desenho escreve: KB de 1000 bytes (uma casa abaixo de 10) e as linhas.
export const bytesDe = texto => Buffer.byteLength(texto, "utf8");
export const linhasDe = texto => texto.replace(/\n$/, "").split("\n").length;
export const kb = bytes => { const k = bytes / 1000; return `${k < 10 ? k.toFixed(1) : Math.round(k)} KB`; };
export const tamanho = texto => `${kb(bytesDe(texto))} · ${linhasDe(texto).toLocaleString("en-US")} lines`;

// A skill e as notas para o AGENTS.md: o `aurea-agents.md` é o corpo da skill sem o cabeçalho — a MESMA conta que o gerador
// faz ao escrever o arquivo (`build-catalog.mjs`, "aurea-agents.md").
export const lerSkill = () => readFileSync(join(RAIZ, "skills/aurea-uds/SKILL.md"), "utf8").replace(/\r\n/g, "\n");
export const notasDosAgentes = () => lerSkill().replace(/^---\n[\s\S]*?\n---\n+/, "");
// O `llms.txt`, montado com a MESMA receita do gerador (`build-catalog.mjs`, "OS ARQUIVOS PARA ASSISTENTES DE IA"): o
// índice só usa o nome, o endereço e o resumo de cada página, que já existem quando as páginas são montadas — o arquivo
// é escrito depois delas, então não dá para lê-lo do disco sem pegar o da montagem anterior. O `site-b/js/llms-txt.js`
// confere na página publicada (lê o arquivo de verdade e corrige o número, se a receita um dia divergir).
export function indiceLlms(site) {
  const {SITE, docs, fichas, alfabetico, slug, patterns, blocks, archetypeIds, recipeTitle, releases} = site;
  const e = (arquivo, nome, resumo) => ({arquivo, nome, resumo});
  const grupos = [
    ["Getting Started", docs.map(d => e(d.arquivo, d.title, d.description))],
    ["Components", alfabetico(fichas.filter(f => f.kind !== "hook")).map(f => e(`${slug(f.name)}.html`, f.name, f.summary))],
    ["Hooks", alfabetico(fichas.filter(f => f.kind === "hook")).map(f => e(`${slug(f.name)}.html`, f.name, f.summary))],
    ["Patterns", patterns.map(p => e(`${p.slug}.html`, `${p.component} · ${p.name}`, p.description))],
    ["Blocks", blocks.map(b => e(`${b.slug}.html`, b.name, b.description))],
    ["Recipes", archetypeIds.map(id => e(`recipe-${slug(id)}.html`, recipeTitle(id), null))],
    ["Releases", releases.map(r => e(r.arquivo, r.title, r.description))],
  ];
  return [
    "# Aurea UDS",
    "> A design system with one look for the web (React and plain CSS) and for React Native, made to be read by people with low vision.",
    `Every page below is Markdown. The whole documentation in one file: ${SITE}/llms-full.txt. Notes for AI coding agents: ${SITE}/aurea-agents.md.`,
    ...grupos.map(([grupo, lista]) => [`## ${grupo}`, ...lista.map(x =>
      `- [${x.nome}](${SITE}/${x.arquivo.replace(/\.html$/, ".md")})${x.resumo ? `: ${x.resumo.replace(/\s+/g, " ")}` : ""}`)].join("\n")),
  ].join("\n\n") + "\n";
}
// "Como começa": as primeiras linhas, e as reticências quando há mais.
export const comeco = (texto, n) => { const l = texto.split("\n"); return l.length > n ? `${l.slice(0, n).join("\n").trimEnd()}\n…` : texto; };

export function ferramentas(site, doc) {
  const {h, Fragment, A, pedacos, linhaMd} = site;
  // Os blocos do `.md` de cada seção (pelo id do título h2); antes do primeiro título, "_abertura".
  const secoes = {_abertura: []};
  let atual = "_abertura";
  for (const b of doc.blocos) {
    if (b.tipo === "h2") { atual = b.id; secoes[atual] = []; continue; }
    secoes[atual].push(b);
  }
  const blocosDe = id => {
    if (!secoes[id]) throw new Error(`content/docs/${doc.nome}.md: falta a seção "${id}" que a página do site B usa`);
    return secoes[id];
  };
  const md = (texto, chave) => linhaMd(texto, chave);
  // Um bloco do `.md` no desenho B: o parágrafo, as listas e o código (a cabeça do arquivo, o item 6).
  const bloco = (b, chave, arquivo) => {
    if (b.tipo === "p") return h("p", {key: chave, className: "intro-p g5-p"}, ...pedacos(b.texto, chave));
    if (b.tipo === "ul" || b.tipo === "ol") return h(b.tipo, {key: chave, className: `g5-${b.tipo}`},
      ...b.itens.map((it, k) => h("li", {key: k}, h("span", null, ...pedacos(it, `${chave}-${k}`)))));
    if (b.tipo === "h3") return h("h3", {key: chave, id: b.id, className: "g5-h3"}, ...pedacos(b.texto, chave));
    if (b.tipo === "codigo") return codigo(b.codigo, {arquivo: arquivo ?? "Terminal", lingua: b.lingua, chave});
    throw new Error(`content/docs/${doc.nome}.md: bloco "${b.tipo}" sem desenho no site B`);
  };
  // O bloco de arquivo: o `CodeBlock` com a cabeça do arquivo e o "Copy" escrito (o item 6, aprovado em 01/11/2026).
  const codigo = (texto, {arquivo, lingua = "text", chave, ...resto} = {}) => h(A.CodeBlock, {key: chave, filename: arquivo, copyable: true,
    language: lingua, className: `g5-codigo ${resto.className ?? ""}`.trim()}, texto);
  // A seção do desenho B: o olho (mono, maiúsculas) e o título, como a Introduction — sem o número.
  const secao = (id, olho, titulo, ...filhos) => h("section", {className: "intro-sec g5-sec", id, key: id, "aria-labelledby": `${id}-h`},
    h("p", {className: "intro-olho"}, olho), h("h2", {className: "intro-h2 g5-h2", id: `${id}-h`}, titulo), ...filhos);
  // A ABERTURA: o palco da Introduction, com a trilha, o título, o texto, as ações e quatro peças que flutuam.
  const palco = (grupo, pecas) => h("section", {className: "intro-palco", "aria-labelledby": "intro-h1", "data-palco": ""},
    h("div", {className: "intro-palco-texto"},
      h("span", {className: "intro-trilha"}, "Getting Started ", h("span", {"aria-hidden": "true"}, "/"), " ", h("b", null, grupo)),
      h("h1", {className: "intro-h1", id: "intro-h1"}, doc.title),
      h("p", {className: "intro-lede"}, doc.description),
      h("div", {className: "intro-acoes"}, site.acoesDaPagina(true, "md"))),
    h("div", {className: "intro-pecas", "aria-hidden": "true"},
      ...pecas.map((p, n) => h("div", {key: n, className: `intro-peca intro-peca-${n + 1}`, "data-fundo": ["0.8", "1.4", "1.8", "1.1"][n]},
        h("div", {className: "intro-boia"}, p)))));
  // As quatro formas de peça do palco: a cápsula amarela em mono; a cápsula com texto em mono; o número grande com a
  // legenda; e o nome com a frase.
  const peca = {
    amarela: (texto, extra) => h(A.Card, {className: "intro-cartao intro-cartao-capsula"}, h("span", {className: `g5-chipy ${extra ?? ""}`.trim()}, texto)),
    mono: texto => h(A.Card, {className: "intro-cartao intro-cartao-capsula g5-capsula-mono"}, h("span", null, texto)),
    // O comando longo: o mesmo texto em mono, num cartão que quebra a linha (na cápsula ele passaria por cima do título).
    monoLongo: texto => h(A.Card, {className: "intro-cartao g5-mono-longo"}, h("span", null, texto)),
    numero: (n, forte, fraco) => h(A.Card, {className: "intro-cartao"}, h("span", {className: "g5-numerao"}, n),
      h("span", {className: "intro-mini"}, h("b", null, forte), h("br"), fraco)),
    frase: (forte, fraco) => h(A.Card, {className: "intro-cartao g5-frase"}, h("span", {className: "intro-mini intro-forte"}, forte),
      h("span", {className: "intro-mini"}, fraco)),
  };
  // O aviso: o `Alert` com o ícone e, quando há, o título.
  const aviso = (variant, icon, titulo, ...filhos) => h(A.Alert, {variant, icon, title: titulo || undefined, className: "intro-nota g5-aviso"}, ...filhos);
  // Os cartões-link (o "Next steps"): o `Card` clicável que sobe (`lift`, o item 7), com o ladrilho de cor.
  const links = itens => h("div", {className: "g5-links"}, ...itens.map(([titulo, texto, icone, cor, href]) =>
    h(A.Card, {key: titulo, variant: "interactive", lift: true, className: "g5-link", render: h("a", {href})},
      site.blocoDeTile(icone, cor, "intro-tile-sm"), h("span", {className: "g5-link-texto"}, h("b", null, titulo), h("span", null, texto)),
      h(A.Icon, {name: "arrow-right", size: "sm", className: "g5-link-seta"}))));
  // O "Next" do pé, o da Introduction; quando a área acaba, o próximo passo que o desenho mostra.
  const proxima = (fora = null) => {
    const next = site.vizinhos("start", doc.arquivo).next ?? fora;
    return next ? h("a", {className: "intro-proxima", href: next.href},
      h("div", null, h("span", {className: "intro-proxima-k"}, "Next"), h("b", null, next.name), h("p", null, next.summary || "")),
      h("span", {className: "intro-proxima-seta"}, h(A.Icon, {name: "arrow-right"}))) : null;
  };
  // A CHAVE DE SEGMENTOS da página: a pele da `SegmentedControl` com botões de ligar (`aria-pressed`) — a mesma saída do
  // "Grid | List" da All Components: a página não hidrata a peça, e o grupo de botões funciona sem React. Quem troca é o
  // `site-b/js/<página>.js`, pelo `data-g5-chave`.
  const segmentos = ({rotulo, itens, ativo, chave, vertical = false, tamanho = "lg"}) => h("div", {
    className: ["segmented", `segmented-${tamanho}`, vertical ? "segmented-vertical" : null, "g5-segmentos"].filter(Boolean).join(" "),
    "data-segment-style": "neutral", role: "group", "aria-label": rotulo, "data-g5-chave": chave},
    ...itens.map(([valor, texto]) => h("button", {key: valor, type: "button", "data-valor": valor, className: valor === ativo ? "active" : undefined,
      "aria-pressed": valor === ativo ? "true" : "false"}, texto)));
  // O corpo: o texto de abertura do `.md`, as seções, o "Next" e o texto do "Copy Markdown" (o `.md` puro).
  const pagina = (classe, abertura, ...corpo) => h(Fragment, null, abertura,
    h("div", {className: `intro-corpo g5 ${classe}`}, ...corpo), site.textoParaCopiar(site.paraTexto(doc.texto)));
  return {h, Fragment, A, md, blocosDe, bloco, codigo, secao, palco, peca, aviso, links, proxima, segmentos, pagina};
}
