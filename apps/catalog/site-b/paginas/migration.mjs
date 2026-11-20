// A PÁGINA "MIGRATION" NO DESENHO B (lote 091, 20/11/2026; a área Migration, decidida pelo Victor em 17/10/2026 "na 1.0",
// com a lista do 1.0-A levantada em 19/11/2026). O texto é o do `content/docs/migration.md`, seção por seção; a página o
// arruma com as peças da Versioning: o palco com as peças que flutuam, os três passos em cartões numerados, a tabela do que
// sai, o bloco de código do `pressed` ao `Toggle`, a nota do amarelo e os nomes antigos que ficam (o visto verde). O
// arranjo está em `site-b/css/migration.css`.
import {ferramentas} from "./_getting-started/comum.mjs";

export default function migration(site, doc) {
  const {h, A} = site;
  const g = ferramentas(site);
  const sec = g.secoes(doc);
  const s = rotulo => sec.por(rotulo);
  const primeiro = (rotulo, tipo) => {
    const b = s(rotulo).blocos.find(x => x.tipo === tipo);
    if (!b) throw new Error(`content/docs/migration.md: a página B procura um "${tipo}" na seção "${rotulo}", e não acha`);
    return b;
  };
  // A primeira letra maiúscula: no .md, o item continua a frase ("the old name of"); no cartão, ela começa sozinha.
  const maiuscula = pecas => pecas[0]?.t ? [{t: pecas[0].t.charAt(0).toUpperCase() + pecas[0].t.slice(1)}, ...pecas.slice(1)] : pecas;
  // O item da lista do .md termina em ";" (a lista continua); no cartão, ele termina em ponto.
  const ponto = pecas => {
    const u = pecas[pecas.length - 1];
    return u?.t?.endsWith(";") ? [...pecas.slice(0, -1), {t: `${u.t.slice(0, -1)}.`}] : pecas;
  };

  // Quantos nomes saem: as linhas da tabela, contadas, e não escritas à mão.
  const quantos = primeiro("What leaves in 1.0", "tabela").linhas.length;
  const abertura = g.abertura(doc, [
    g.capsula(g.amarela("0.x → 1.0"), "mg-peca-versao"),
    g.numerao(String(quantos), "old names", "leave in 1.0"),
    g.cartao([h("span", {key: "k", className: "intro-mini"}, "Works today"),
      h("span", {key: "t", className: "intro-mini intro-forte"}, "Every old name still works in 0.x.")], "gs-coluna mg-peca-hoje"),
    g.capsula(h("span", {className: "gs-mono"}, "pressed → Toggle"))]);

  // OS TRÊS PASSOS: o número grande e o texto, um cartão por passo.
  const passos = g.secao(s("Before you upgrade").id, "Checklist", "Before you upgrade",
    h("div", {className: "intro-grade-3 mg-passos"}, ...primeiro("Before you upgrade", "ol").itens.map((it, n) =>
      h(A.Card, {key: n, className: "mg-passo"},
        h("span", {className: "mg-passo-n", "aria-hidden": "true"}, String(n + 1).padStart(2, "0")),
        h("p", null, ...site.pedacos(it, `pa${n}`))))));

  // O QUE SAI: a tabela do .md, na grade do site.
  const saem = g.secao(s("What leaves in 1.0").id, "Removed in 1.0", "What leaves in 1.0",
    ...g.corpo(s("What leaves in 1.0").blocos, {chave: "sa"}));

  // DO PRESSED AO TOGGLE: a frase e o bloco de código.
  const toggle = g.secao(s("From pressed to Toggle").id, "Example", "From pressed to Toggle",
    ...g.corpo(s("From pressed to Toggle").blocos, {chave: "tg", arquivos: ["App.tsx"]}));

  // A COR DO AMARELO: a nota no fundo do palco.
  const amarelo = g.secao(s("The yellow text color").id, "Tokens", "The yellow text color",
    h(A.Card, {variant: "inset", className: "mg-nota"}, ...g.corpo(s("The yellow text color").blocos, {chave: "am"})));

  // OS NOMES ANTIGOS QUE FICAM: a frase de abertura e um cartão por nome, com o visto verde.
  const ficam = g.secao(s("Old names that stay").id, "Kept", "Old names that stay",
    ...g.corpo(s("Old names that stay").blocos, {chave: "fi", pular: ["ul"]}),
    h("div", {className: "gs-grade-2 mg-itens"}, ...primeiro("Old names that stay", "ul").itens.map((it, n) => h(A.Card, {key: n, className: "mg-item"},
      site.blocoDeTile("check", "green", "mg-item-tile"), h("span", null, ...site.pedacos(ponto(maiuscula(it)), `fi${n}`))))));

  const depois = g.secao(s("After 1.0").id, "Versioning", "After 1.0", ...g.corpo(s("After 1.0").blocos, {chave: "de"}));

  const node = g.pagina(doc, abertura,
    ...g.corpo(sec.antes, {chave: "a"}),
    passos, saem, toggle, amarelo, ficam, depois);
  const toc = ["Before you upgrade", "What leaves in 1.0", "From pressed to Toggle", "The yellow text color", "Old names that stay", "After 1.0"]
    .map(rotulo => ({id: s(rotulo).id, label: rotulo}));
  return {node, toc};
}
