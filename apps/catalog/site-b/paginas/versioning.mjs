// A PÁGINA "VERSIONING" NO DESENHO B (lote 090, 20/11/2026; o 1.0-E, decidido pelo Victor em 19/11/2026).
// O texto é o do `content/docs/versioning.md`, seção por seção; a página o arruma com as peças que a Roadmap já usa: o
// palco com as peças que flutuam, os três números em cartões, as duas notas lado a lado, o que quebra (o aviso vermelho)
// e o que não quebra (o visto verde), e os dois passos de um nome que sai. O arranjo está em `site-b/css/versioning.css`.
// O lote 107 (26/11/2026, a ADR-0095, a regra de estabilidade da 1.0): o que é público e o que não é (cartões com
// ladrilho, como o que quebra), os quatro passos de um nome que sai e a nota dos consertos de versões antigas.
import {ferramentas} from "./_getting-started/comum.mjs";

export default function versioning(site, doc) {
  const {h, A} = site;
  const g = ferramentas(site);
  const sec = g.secoes(doc);
  const s = rotulo => sec.por(rotulo);
  const primeiro = (rotulo, tipo) => {
    const b = s(rotulo).blocos.find(x => x.tipo === tipo);
    if (!b) throw new Error(`content/docs/versioning.md: a página B procura um "${tipo}" na seção "${rotulo}", e não acha`);
    return b;
  };
  // A primeira letra maiúscula: no .md, o item continua a frase ("something new"); no cartão, ela começa sozinha.
  const maiuscula = pecas => pecas[0]?.t ? [{t: pecas[0].t.charAt(0).toUpperCase() + pecas[0].t.slice(1)}, ...pecas.slice(1)] : pecas;
  // O item da lista do .md termina em ";" (a lista continua); no cartão, ele termina em ponto.
  const ponto = pecas => {
    const u = pecas[pecas.length - 1];
    return u?.t?.endsWith(";") ? [...pecas.slice(0, -1), {t: `${u.t.slice(0, -1)}.`}] : pecas;
  };
  // Um item do .md em "**Título** — o resto": o título e o resto, sem o travessão da frente.
  const partes = item => {
    const forte = item.find(x => x.strong !== undefined);
    const resto = item.filter(x => x !== forte);
    if (resto[0]?.t) resto[0] = {t: resto[0].t.replace(/^\s*[—:]\s*/, "")};
    return {titulo: forte ? forte.strong : "", resto: maiuscula(resto)};
  };

  const abertura = g.abertura(doc, [
    g.capsula(g.amarela("major.minor.patch"), "vs-peca-semver"),
    g.numerao("7", "packages", "one version"),
    g.cartao([h("span", {key: "k", className: "intro-mini"}, "Old names"),
      h("span", {key: "t", className: "intro-mini intro-forte"}, "Kept six months at least, removed in a major.")], "gs-coluna vs-peca-nomes"),
    g.capsula(h("span", {className: "gs-mono"}, "1.0 · SemVer"))]);

  // OS TRÊS NÚMEROS: a cápsula do número (a de "major" no amarelo) e o que ele quer dizer.
  const numeros = g.secao(s("What each number means").id, "Three numbers", "What each number means",
    h("div", {className: "intro-grade-3 vs-numeros"}, ...primeiro("What each number means", "ul").itens.map(partes).map((e, n) =>
      h(A.Card, {key: n, className: "vs-numero"},
        h("span", {className: "vs-versao", "data-v": e.titulo.toLowerCase()}, e.titulo.toLowerCase()),
        h("p", null, ...site.pedacos(e.resto, `nu${n}`))))));

  // AS DUAS NOTAS: o que vale antes da 1.0 (no fundo do palco) e os consertos das versões antigas (no cartão).
  const nota = (rotulo, chave, variant) => h(A.Card, {variant, className: "vs-nota", id: s(rotulo).id}, h("b", null, s(rotulo).rotulo),
    ...g.corpo(s(rotulo).blocos, {chave}));
  const notas = g.secao("scope", "Scope", "When the rules apply",
    h("div", {className: "gs-grade-2"}, nota("Before 1.0", "an", "inset"), nota("Fixes for older versions", "fx")));

  // O QUE É PÚBLICO, O QUE NÃO É, O QUE QUEBRA e O QUE NÃO QUEBRA: o texto antes da lista, um cartão por item, com o
  // ladrilho, e o texto depois da lista (o do selo, no "What is public").
  const lista = (rotulo, olho, icone, cor, chave) => {
    const blocos = s(rotulo).blocos;
    const i = blocos.indexOf(primeiro(rotulo, "ul"));
    return g.secao(s(rotulo).id, olho, rotulo,
      ...g.corpo(blocos.slice(0, i), {chave}),
      h("div", {className: "gs-grade-2 vs-itens"}, ...blocos[i].itens.map((it, n) => h(A.Card, {key: n, className: "vs-item"},
        site.blocoDeTile(icone, cor, "vs-item-tile"), h("span", null, ...site.pedacos(ponto(maiuscula(it)), `${chave}${n}`))))),
      ...g.corpo(blocos.slice(i + 1), {chave: `${chave}d`}));
  };
  const publico = lista("What is public", "Protected", "shield-check", "blue", "pu");
  const naoPublico = lista("What is not public", "Can change anytime", "wrench", "teal", "np");
  const quebra = lista("What is a breaking change", "Major only", "warning", "red", "qb");
  const naoQuebra = lista("What is not a breaking change", "Minor or patch", "check", "green", "nq");

  // OS PASSOS DE UM NOME QUE SAI: o número grande e o texto, dois por fila; depois, o texto do nome que fica.
  const passos = g.secao(s("How old names leave").id, "Deprecation", "How old names leave",
    h("div", {className: "gs-grade-2 vs-passos"}, ...primeiro("How old names leave", "ol").itens.map((it, n) =>
      h(A.Card, {key: n, className: "vs-passo"},
        h("span", {className: "vs-passo-n", "aria-hidden": "true"}, String(n + 1).padStart(2, "0")),
        h("p", null, ...site.pedacos(it, `pa${n}`))))),
    ...g.corpo(s("How old names leave").blocos, {chave: "pd", pular: ["ol"]}));

  const node = g.pagina(doc, abertura,
    ...g.corpo(sec.antes, {chave: "a"}),
    numeros, notas, publico, naoPublico, quebra, naoQuebra, passos);
  const toc = [{id: s("What each number means").id, label: "What each number means"}, {id: "scope", label: "When the rules apply"},
    {id: s("What is public").id, label: "What is public"}, {id: s("What is not public").id, label: "What is not public"},
    {id: s("What is a breaking change").id, label: "What is a breaking change"},
    {id: s("What is not a breaking change").id, label: "What is not a breaking change"},
    {id: s("How old names leave").id, label: "How old names leave"}];
  return {node, toc};
}
