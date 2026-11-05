// A PÁGINA "LLMs.txt" NO DESENHO B (02/11/2026, o grupo 5). O texto é o do `content/docs/llms-txt.md`; a página o arruma
// como o desenho aprovado: os três arquivos em cartões de escolha (`RadioGroup variant="card"`, o item 1), o começo do
// escolhido num bloco de arquivo (`CodeBlock filename`, o item 6), a troca de `.html` por `.md`, e a pergunta "How does
// your tool read?" com a chave em pé (`orientation="vertical"`, o item 3, `selectedStyle="emphasis"`). Os TAMANHOS dos
// arquivos são contados na montagem (o `llms.txt` pela receita do gerador; o `aurea-agents.md` pela skill); o do
// `llms-full.txt` só existe depois de todas as páginas, então quem o conta é o `site-b/js/llms-txt.js`, lendo o arquivo.
import {ferramentas, indiceLlms, notasDosAgentes, tamanho, comeco} from "../comum/grupo-5.mjs";

export default function llmsTxt(site, doc) {
  const {h, Fragment, A, blocosDe, bloco, secao, palco, peca, aviso, proxima, segmentos, pagina} = ferramentas(site, doc);
  const {SITE} = site;
  const [intro] = blocosDe("_abertura");
  const arquivos = blocosDe("available-files");
  const lista = arquivos.find(b => b.tipo === "ul");
  const comoMd = arquivos.find(b => b.tipo === "p");
  const integracao = blocosDe("integration");
  const prompt = integracao.filter(b => b.tipo === "p").at(-1);
  const [contribuir] = blocosDe("contributing");

  // O começo de cada arquivo. O do `llms-full.txt` é a primeira página dele, a Introduction — o mesmo texto do "Copy
  // Markdown" dela.
  const indice = indiceLlms(site), notas = notasDosAgentes();
  const introducao = site.docs.find(d => d.nome === "introduction");
  const cheio = `<page url="${SITE}/getting-started.html">\n${site.paraTexto(introducao.texto).trim()}\n</page>\n`;
  // A descrição do cartão: o texto do item da lista depois do link e dos dois-pontos, até o "See …" (o link para outra
  // página não pode morar dentro do cartão, que é um rótulo de escolha; ele vai na frase de baixo).
  const descricao = itens => {
    const depois = itens.slice(itens.findIndex(p => p.link !== undefined) + 1);
    const corte = depois.findIndex(p => p.t !== undefined && / See $/.test(p.t));
    const ate = corte < 0 ? depois : [...depois.slice(0, corte), {t: depois[corte].t.replace(/ See $/, "")}];
    const t = ate[0].t.replace(/^:\s*/, "");
    return [{t: t.charAt(0).toUpperCase() + t.slice(1)}, ...ate.slice(1)];
  };
  const ARQUIVOS = [
    {valor: "llms", nome: "llms.txt", texto: indice, linhas: 14},
    {valor: "full", nome: "llms-full.txt", texto: null, comeco: cheio, linhas: 14},
    {valor: "agents", nome: "aurea-agents.md", texto: notas, linhas: 14},
  ].map((a, n) => ({...a, url: `${SITE}/${a.nome}`, item: lista.itens[n],
    // Sem o arquivo na montagem (o llms-full.txt), o selo diz o que ele é; a página publicada troca pelo tamanho.
    selo: a.texto ? tamanho(a.texto) : "the whole site"}));
  for (const a of ARQUIVOS) if (!a.item.some(p => p.link === a.nome)) throw new Error(`content/docs/llms-txt.md: o item de "${a.nome}" mudou de lugar`);

  const cartoes = h(A.RadioGroup, {variant: "card", orientation: "horizontal", label: "Files", labelHidden: true, defaultValue: "llms",
    name: "llms-arquivo", className: "llms-cartoes", "data-llms-arquivos": ""},
    ...ARQUIVOS.map(a => h(A.RadioGroup.Item, {key: a.valor, value: a.valor,
      label: h("span", {className: "llms-cartao-topo"}, h("code", null, a.nome),
        // O selo neutro e o amarelo, um de cada vez: o do cartão escolhido é o amarelo (o desenho).
        h(A.Badge, {size: "sm", className: "llms-selo llms-selo-neutro", "data-llms-tamanho": a.valor}, a.selo),
        h(A.Badge, {size: "sm", tone: "primary", emphasis: "solid", className: "llms-selo llms-selo-escolhido", "data-llms-tamanho": a.valor}, a.selo)),
      description: h(Fragment, null, ...site.pedacos(descricao(a.item), `d${a.valor}`))})));
  const espiadas = ARQUIVOS.map(a => h(A.CodeBlock, {key: a.valor, language: "text", className: "llms-espiada",
    filename: h("span", {className: "llms-espiada-cabeca"},
      h("code", null, `${SITE}/`, h("wbr"), a.nome), h("span", {className: "llms-espiada-meta", "data-llms-tamanho": a.valor}, a.selo),
      h("span", {className: "llms-espiada-acoes"},
        h(A.Button, {variant: "tertiary", size: "md", type: "button", "data-copiar": a.url, "aria-label": `Copy the address of ${a.nome}`}, "Copy address"),
        h(A.Button, {variant: "ghost", size: "md", href: a.url, trailingIcon: "arrow-up-right"}, "Open")))},
  comeco(a.texto ?? a.comeco, a.linhas)));
  // O `CodeBlock` não repassa o `hidden`: a caixa de cada arquivo vai num invólucro que esconde.
  const espiada = h("div", {className: "llms-espiadas g5-codigo"},
    ...espiadas.map((e, n) => h("div", {key: n, hidden: n !== 0 ? true : undefined, "data-llms-espiada": ARQUIVOS[n].valor}, e)));

  const PAGINAS = ["button", "docs-theming", "recipe-agent-ai", "usetoast", "block-stats-row"];
  const USOS = [
    ["idx", "Reads from an address", "llms.txt", "Give it the index. It reads one line per page and opens only the pages it needs."],
    ["full", "Loads a whole file into its context", "llms-full.txt", "Give it the full text. The full file is large."],
    ["small", "Has a small context window", "llms.txt", "When the context window is small, give the index, and let the assistant open only the pages it needs."],
  ];
  const host = SITE.replace(/^https?:\/\//, "");

  const node = pagina("llms-b",
    palco("UI for Agents", [peca.amarela("llms.txt"), peca.numero("3", "files", "index · full · rules"), peca.mono(".html → .md"),
      peca.frase("Copy Prompt", "a ready setup text")]),
    bloco(intro, "a"),
    secao("available-files", "Three files", "Available files",
      h("p", {className: "intro-p g5-p"}, "Choose a file to see how it starts:"),
      cartoes, espiada,
      h("p", {className: "intro-p g5-p"}, "The rules file is explained on ", h(A.Link, {href: "./docs-agents-md.html"}, "AGENTS.md"), ".")),
    secao("every-page-as-markdown", "Next to the HTML", "Every page as Markdown",
      h("p", {className: "intro-p g5-p"}, ...site.pedacos(comoMd.texto, "m"), " Choose a page:"),
      h("div", {className: "toggle-group toggle-group-detached llms-paginas", role: "group", "aria-label": "Page", "data-pressed-style": "contrast",
        "data-llms-paginas": ""},
        ...PAGINAS.map((p, n) => h("button", {key: p, type: "button", className: "btn btn-tertiary toggle", "data-valor": p,
          "aria-pressed": n === 0 ? "true" : "false", "data-pressed": n === 0 ? "" : undefined}, h("code", null, p)))),
      h("div", {className: "llms-conversao", "aria-live": "polite"},
        h("code", {className: "llms-conversao-de"}, `${host}/`, h("span", {"data-llms-pagina": ""}, PAGINAS[0]), ".html"),
        h(A.Icon, {name: "arrow-right", className: "llms-conversao-seta"}),
        h("code", {className: "llms-conversao-para"}, `${host}/`, h("span", {"data-llms-pagina": ""}, PAGINAS[0]), ".md"))),
    secao("integration", "Give it an address", "Integration",
      h("p", {className: "intro-p g5-p"}, "Most assistants can read documentation from an address. Which one to give depends on your tool:"),
      h("div", {className: "llms-qual"},
        h(A.Card, {className: "llms-qual-pergunta"}, h("b", {id: "llms-qual-h"}, "How does your tool read?"),
          segmentos({rotulo: "Your tool", chave: "llms-uso", ativo: "idx", vertical: true, tamanho: "md", itens: USOS.map(([v, t]) => [v, t])})),
        h("div", {className: "llms-qual-resposta", "aria-live": "polite"},
          ...USOS.map(([v, , arquivo, porque], n) => h("div", {key: v, hidden: n !== 0 ? true : undefined, "data-llms-uso": v},
            h("div", {className: "llms-endereco"}, h("code", null, `${SITE}/`, h("wbr"), arquivo),
              h(A.Button, {variant: "tertiary", size: "md", type: "button", "data-copiar": `${SITE}/${arquivo}`, "aria-label": `Copy the address of ${arquivo}`}, "Copy")),
            h("p", null, porque))))),
      aviso("info", "sparkle", "Copy Prompt", ...site.pedacos(prompt.texto, "cp"))),
    secao("contributing", "Wrong answer?", "Contributing",
      h("p", {className: "intro-p g5-p"}, ...site.pedacos(contribuir.texto.map(p => p.link !== undefined ? {t: p.link} : p), "c")),
      h("div", {className: "llms-issue"}, h(A.Button, {size: "lg", variant: "primary", href: `${site.REPO}/issues`, ...site.NOVA_ABA, trailingIcon: "arrow-up-right"}, "Open an issue"))),
    proxima());
  const toc = [["available-files", "Available files"], ["every-page-as-markdown", "Every page as Markdown"], ["integration", "Integration"],
    ["contributing", "Contributing"]].map(([id, label]) => ({id, label}));
  return {node, toc};
}
