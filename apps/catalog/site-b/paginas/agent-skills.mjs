// A PÁGINA "Agent Skills" NO DESENHO B (02/11/2026, o grupo 5). O texto é o do `content/docs/agent-skills.md`; a página o
// arruma como o desenho aprovado: onde a skill vai, em cartões de escolha (`RadioGroup variant="card"`, o item 1, com a
// bolinha), o comando que muda com a escolha (`CodeBlock filename`, o item 6), os gatilhos (`TagGroup`), os pedidos com
// "Copy", o que vem dentro e a pasta, com o começo do `SKILL.md` lido do arquivo. O clique é o `site-b/js/agent-skills.js`.
import {ferramentas, lerSkill, tamanho, comeco} from "../comum/grupo-5.mjs";

export default function agentSkills(site, doc) {
  const {h, A, blocosDe, bloco, codigo, secao, palco, peca, proxima, pagina} = ferramentas(site, doc);
  const abertura = blocosDe("_abertura");
  const instalar = blocosDe("installation");
  const [comandoProjeto, comandoUsuario] = instalar.filter(b => b.tipo === "codigo").map(b => b.codigo);
  const quemInstala = instalar.find(b => b.tipo === "p");
  const uso = blocosDe("usage");
  const pedidos = uso.find(b => b.tipo === "ul");
  const dentro = blocosDe("what-s-included").find(b => b.tipo === "ul");
  const estrutura = blocosDe("structure");
  const skill = lerSkill();
  if (!comandoUsuario || comandoUsuario !== `${comandoProjeto} -g`) throw new Error("content/docs/agent-skills.md: os dois comandos de instalar mudaram");

  // Os pedidos do `.md` ("build a settings page with Aurea components;") como o desenho os escreve: frase inteira.
  const frase = pecas => {
    const t = pecas.map(p => p.t ?? p.code ?? p.link ?? "").join("").trim().replace(/[;.]$/, "");
    return `${t.charAt(0).toUpperCase()}${t.slice(1)}.`;
  };
  // O que vem dentro: o item do `.md` partido no primeiro ":" ou "," — antes, o título; depois, o texto.
  const partir = (pecas, k) => {
    const i = pecas.findIndex(p => p.t !== undefined && /[:,]/.test(p.t));
    if (i < 0) throw new Error(`content/docs/agent-skills.md: o item ${k + 1} de "What's included" não tem ":" nem ","`);
    const t = pecas[i].t, corte = t.search(/[:,]/);
    const depois = t.slice(corte + 1).replace(/^\s+/, "");
    return [[...pecas.slice(0, i), {t: t.slice(0, corte)}], [{t: depois.charAt(0).toUpperCase() + depois.slice(1)}, ...pecas.slice(i + 1)]];
  };
  const DENTRO = [["gear", "green"], ["palette", "orange"], ["eye", "blue"], ["book-open", "pink"]];

  const node = pagina("skills-b",
    palco("UI for Agents", [peca.amarela("SKILL.md"), peca.monoLongo(comandoProjeto), peca.frase("Loads itself", "when the task calls for it"), peca.mono("-g")]),
    ...abertura.map((b, n) => bloco(b, `a${n}`)),
    secao("installation", "One command", "Installation",
      h("p", {className: "intro-p g5-p"}, ...site.pedacos(quemInstala.texto, "q"), " Choose where it goes:"),
      h(A.RadioGroup, {variant: "card", orientation: "horizontal", label: "Install scope", labelHidden: true, defaultValue: "project",
        name: "skills-onde", className: "skills-onde", "data-skills-onde": ""},
        h(A.RadioGroup.Item, {value: "project", label: "The project", description: "The default. Next to your code, so the whole team gets it."}),
        h(A.RadioGroup.Item, {value: "user", label: "Your user, with -g", description: "For you, in every project."})),
      // O comando da escolha: o texto do bloco troca (o "Copy" copia o que está escrito), e os dois vêm do `.md`.
      h("div", {"data-skills-comando": "", "data-projeto": comandoProjeto, "data-usuario": comandoUsuario},
        codigo(comandoProjeto, {arquivo: "Terminal", lingua: "bash"}))),
    secao("usage", "No setup to call it", "Usage",
      h("p", {className: "intro-p g5-p"}, "The assistant finds the skill on its own when the work involves Aurea:"),
      h(A.TagGroup, {label: "What makes the assistant load the skill", labelHidden: true, size: "lg", className: "skills-gatilhos",
        items: ["@aurea-uds/react", "@aurea-uds/core", "@aurea-uds/native", "Aurea components, tokens or themes"].map((label, n) => ({id: `g${n}`, label}))}),
      bloco(uso.filter(b => b.tipo === "p")[1], "e"),
      h("div", {className: "skills-pedidos"}, ...pedidos.itens.map((it, n) => {
        const texto = frase(it);
        return h("div", {key: n, className: "skills-pedido"},
          h("span", {className: "skills-pedido-icone"}, h(A.Icon, {name: "chat-circle"})),
          h("span", {className: "skills-pedido-texto"}, texto),
          h(A.Button, {variant: "secondary", size: "md", type: "button", "data-copiar": texto, "aria-label": `Copy the request: ${texto}`}, "Copy"));
      }))),
    secao("what-s-included", "Inside the file", "What's included",
      h("div", {className: "g5-grade-2"}, ...dentro.itens.map((it, n) => {
        const [titulo, texto] = partir(it, n);
        return h(A.Card, {key: n, className: "skills-dentro"}, site.blocoDeTile(DENTRO[n][0], DENTRO[n][1], "intro-tile-sm"),
          h("div", null, h("b", null, ...site.pedacos(titulo, `t${n}`)), h("p", null, ...site.pedacos(texto, `x${n}`))));
      }))),
    secao("structure", "One file", "Structure",
      h("div", {className: "skills-pasta"},
        h(A.Card, {className: "skills-arvore"},
          h("ul", {className: "skills-arvore-lista", "aria-label": "Folder structure"},
            h("li", null, h("span", {className: "skills-arvore-linha"}, h(A.Icon, {name: "folder"}), "skills/aurea-uds/"),
              h("ul", null, h("li", null, h("span", {className: "skills-arvore-linha"}, h(A.Icon, {name: "file-text"}), "SKILL.md"))))),
          h("p", null, `${tamanho(skill)}. `, ...site.pedacos(estrutura.find(b => b.tipo === "p").texto, "r").map((p, k) => k === 0 && typeof p === "string" ? p.replace(/^The file is in/, "In") : p))),
        codigo(comeco(skill, 16), {arquivo: "SKILL.md · how it starts", lingua: "markdown", className: "skills-comeco"}))),
    proxima());
  const toc = [["installation", "Installation"], ["usage", "Usage"], ["what-s-included", "What's included"], ["structure", "Structure"]]
    .map(([id, label]) => ({id, label}));
  return {node, toc};
}
