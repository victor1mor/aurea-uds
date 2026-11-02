// A PÁGINA "AGENTS.md" NO DESENHO B (02/11/2026, o grupo 5). O texto é o do `content/docs/agents-md.md`; a página o
// arruma como o desenho aprovado: duas perguntas montam o comando (o `CodeBlock filename`, o item 6), a pasta antes e
// depois dele, o que o arquivo traz com o começo dele (lido na montagem, o mesmo `aurea-agents.md` que o site publica), a
// escolha entre a skill e o arquivo, e o aviso. O clique é o `site-b/js/agents-md.js`.
import {ferramentas, notasDosAgentes, linhasDe, comeco} from "../comum/grupo-5.mjs";

export default function agentsMd(site, doc) {
  const {h, A, blocosDe, bloco, codigo, secao, palco, peca, aviso, proxima, segmentos, pagina} = ferramentas(site, doc);
  const [intro] = blocosDe("_abertura");
  const uso = blocosDe("usage");
  const [criar, somar] = uso.filter(b => b.tipo === "codigo").map(b => b.codigo);
  const nomeOutro = uso.filter(b => b.tipo === "p").at(-1);
  const contem = blocosDe("what-it-contains");
  const itens = contem.find(b => b.tipo === "ul");
  const [manter] = blocosDe("keeping-it-current");
  const notas = notasDosAgentes();
  // O comando sem o fim ("-o AGENTS.md" ou ">> AGENTS.md"): os dois do `.md` têm de começar igual.
  const base = criar.replace(/ -o AGENTS\.md$/, "");
  if (somar !== `${base} >> AGENTS.md`) throw new Error("content/docs/agents-md.md: os dois comandos de baixar mudaram");
  // O aviso: a primeira frase vira o título, como no desenho.
  const t0 = manter.texto[0].t, ponto = t0.indexOf(". ");

  // Antes e depois do comando (a pasta do projeto): o script troca a lista com as duas escolhas.
  const linha = (nome, nota, nova) => h("li", {className: nova ? "agents-pasta-nova" : undefined}, h("code", null, nome),
    nota ? h("small", null, nota) : null);

  const node = pagina("agents-b",
    palco("UI for Agents", [peca.amarela("AGENTS.md"), peca.numero(String(linhasDe(notas)), "lines", "aurea-agents.md"), peca.mono(">> AGENTS.md"),
      peca.frase("Web or React Native?", "it asks first")]),
    bloco(intro, "a"),
    secao("usage", "Download it", "Usage",
      h("div", {className: "g5-grade-2"},
        h(A.Card, {className: "agents-pergunta"}, h("p", {className: "g5-rotulo"}, "Your project already has an AGENTS.md?"),
          segmentos({rotulo: "Existing file", chave: "agents-modo", ativo: "new", itens: [["new", "No, create it"], ["append", "Yes, add to the end"]]})),
        h(A.Card, {className: "agents-pergunta"}, h("p", {className: "g5-rotulo"}, "The name your assistant reads"),
          segmentos({rotulo: "File name", chave: "agents-nome", ativo: "AGENTS.md", itens: [["AGENTS.md", "AGENTS.md"], ["CLAUDE.md", "CLAUDE.md"]]}))),
      h("div", {"data-agents-comando": "", "data-base": base}, codigo(criar, {arquivo: "Terminal", lingua: "bash"})),
      h("div", {className: "agents-pasta", "aria-live": "polite"},
        h("div", null, h("p", {className: "g5-rotulo"}, "Your project, before"),
          h("ul", {"data-agents-antes": ""}, linha("package.json"), linha("src/"))),
        h("div", null, h("p", {className: "g5-rotulo"}, "After the command"),
          h("ul", {"data-agents-depois": ""}, linha("package.json"), linha("src/"), linha("AGENTS.md", "new · the Aurea rules", true)))),
      bloco(nomeOutro, "o")),
    secao("what-it-contains", `${linhasDe(notas)} lines`, "What it contains",
      h("ol", {className: "agents-contem"}, ...itens.itens.map((it, n) => h("li", {key: n}, h("span", null, ...site.pedacos(it, `c${n}`))))),
      codigo(comeco(notas, 16), {arquivo: "aurea-agents.md · how it starts", lingua: "markdown", className: "agents-comeco"})),
    secao("skill-or-file", "The same text", "Skill or file?",
      h("p", {className: "intro-p g5-p"}, "It is the same text as the ", h(A.Link, {href: "./docs-agent-skills.html"}, "Aurea skill"), "."),
      h("div", {className: "g5-grade-2"},
        h(A.Card, {className: "g5-cartao"}, h(A.Badge, {className: "agents-quando"}, "Your assistant supports skills"), h("b", null, "Use the skill"),
          h("p", null, "It loads on its own when the work involves Aurea. See ", h(A.Link, {href: "./docs-agent-skills.html"}, "Agent Skills"), ".")),
        h(A.Card, {className: "g5-cartao"}, h(A.Badge, {className: "agents-quando"}, "It does not"), h("b", null, "Use this file"),
          h("p", null, "Put it at the root of the project, as AGENTS.md or the name your assistant reads.")))),
    secao("keeping-it-current", "After an upgrade", "Keeping it current",
      aviso("warning", "warning", t0.slice(0, ponto + 1), t0.slice(ponto + 2), ...site.pedacos(manter.texto.slice(1), "k"))),
    proxima({name: "Components", href: "./components.html", summary: "Every component, with its props table."}));
  const toc = [["usage", "Usage"], ["what-it-contains", "What it contains"], ["skill-or-file", "Skill or file?"], ["keeping-it-current", "Keeping it current"]]
    .map(([id, label]) => ({id, label}));
  return {node, toc};
}
