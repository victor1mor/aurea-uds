// A ROADMAP NO DESENHO B (aprovado em 26/10/2026; o caminho, em 01/11/2026): a abertura no palco; as duas promessas
// (0.x e 1.0) em cartões; o que já está feito; «Before 1.0» com o `Stepper variant="path"` (o ITEM 5 — as pontas «0.x» e
// «1.0» não clicam; cada etapa escolhe o que o quadro de baixo explica); o que não se vai construir; e o pedido. O texto
// é o do `roadmap.md`, seção por seção. O comportamento (a etapa escolhida, Previous e Next) está em `site-b/js/roadmap.js`.
import {ferramentas} from "./_getting-started/comum.mjs";

export default function roadmap(site, doc) {
  const {h, A} = site;
  const g = ferramentas(site);
  const sec = g.secoes(doc);
  const s = rotulo => sec.por(rotulo);
  const primeiro = (rotulo, tipo) => s(rotulo).blocos.find(b => b.tipo === tipo);
  // Um item do .md em "**Título.** O resto": o título (sem o ponto final) e o resto.
  const partes = item => {
    const forte = item.find(x => x.strong !== undefined);
    const resto = item.filter(x => x !== forte);
    if (resto[0]?.t) resto[0] = {t: resto[0].t.replace(/^\s+/, "")};
    return {titulo: forte ? forte.strong.replace(/\.$/, "") : "", resto};
  };

  const abertura = g.abertura(doc, [
    g.capsula(g.amarela("0.x"), "rm-peca-zero"),
    g.numerao("6", "steps", "before 1.0"),
    g.cartao([h("span", {key: "k", className: "intro-mini"}, "No dates"),
      h("span", {key: "t", className: "intro-mini intro-forte"}, "Each step ships when it is done and checked.")], "gs-coluna rm-peca-datas"),
    g.capsula(h("span", {className: "gs-mono"}, "1.0 · SemVer"), "rm-peca-semver")]);

  // AS DUAS PROMESSAS: a de hoje no fundo do palco (`Card variant="inset"`), a 1.0 no cartão.
  const versao = (v, titulo, ...filhos) => h("div", {className: "rm-versao-topo"}, h("span", {className: "rm-versao", "data-v": v}, v), h("b", null, titulo), ...filhos);
  const promessas = g.secao("promises", "Two promises", "0.x today, 1.0 next.",
    h("div", {className: "gs-grade-2"},
      h(A.Card, {variant: "inset", className: "rm-promessa", id: s("What 0.x means").id}, versao("0.x", s("What 0.x means").rotulo),
        ...g.corpo(s("What 0.x means").blocos, {chave: "zx"})),
      h(A.Card, {className: "rm-promessa", id: s("What 1.0 will promise").id}, versao("1.0", s("What 1.0 will promise").rotulo),
        ...g.corpo(s("What 1.0 will promise").blocos, {chave: "um"}))));
  // Os títulos do .md continuam no endereço: as duas seções de cima moram nos cartões, com os ids delas.
  const feito = g.secao(s("Already in place").id, "Shipped", "Already in place",
    h("div", {className: "gs-grade-2 rm-feitos"}, ...primeiro("Already in place", "ul").itens.map((it, n) => h(A.Card, {key: n, className: "rm-feito"},
      site.blocoDeTile("check", "green", "rm-feito-tile"), h("span", null, ...site.pedacos(it, `f${n}`))))));

  // «BEFORE 1.0»: o caminho, e o quadro da etapa escolhida (as seis estão nele; só a escolhida aparece).
  const etapas = primeiro("Before 1.0", "ol").itens.map(partes);
  const caminho = g.secao(s("Before 1.0").id, "The road", "Before 1.0",
    h("div", {className: "rm-caminho"},
      h(A.Stepper, {variant: "path", label: "The six steps before 1.0", startContent: "0.x", endContent: "1.0",
        items: etapas.map((e, n) => ({label: `Step ${n + 1}: ${e.titulo}`, state: n === 0 ? "active" : "default", onClick: () => {}}))})),
    h(A.Card, {className: "rm-etapa", "data-rm-etapa": ""},
      h("span", {className: "rm-etapa-n", "aria-hidden": "true", "data-rm-numero": ""}, "01"),
      h("div", {className: "rm-etapa-texto", "aria-live": "polite"},
        ...etapas.map((e, n) => h("div", {key: n, "data-rm-texto": n, hidden: n !== 0 ? true : undefined},
          h("b", null, `${e.titulo}.`), h("p", null, ...site.pedacos(e.resto, `e${n}`)))),
        h("div", {className: "rm-etapa-nav"},
          h(A.Button, {variant: "tertiary", size: "md", type: "button", "data-rm-ir": "-1"}, "Previous"),
          h(A.Button, {variant: "tertiary", size: "md", type: "button", "data-rm-ir": "1"}, "Next")))));

  const nao = g.secao(s("Decided not to build").id, "On purpose", "Decided not to build",
    h("div", {className: "intro-grade-3 rm-naos"}, ...primeiro("Decided not to build", "ul").itens.map(partes).map((e, n) => h(A.Card, {key: n, className: "rm-nao"},
      site.blocoDeTile("x", "red", "rm-nao-tile"), h("b", null, e.titulo), h("p", null, ...site.pedacos(e.resto, `n${n}`))))));

  // O PEDIDO: o texto do .md sem o link, e o link vira o botão primário.
  const pedido = primeiro("Ask for something", "p").texto;
  const link = pedido.find(x => x.link !== undefined);
  const k = pedido.indexOf(link);
  const semLink = pedido.filter(x => x !== link).map((x, n) => n === k && x.t ? {t: x.t.replace(/^\.\s*/, "")} : x);
  const pedir = g.secao(s("Ask for something").id, "Your turn", "Ask for something",
    h(A.Card, {variant: "inset", className: "rm-pedido"}, h("p", {className: "intro-p gs-p"}, ...site.pedacos(semLink, "ped")),
      h(A.Button, {size: "lg", variant: "primary", href: link.href, trailingIcon: "arrow-up-right"}, link.link)));

  const node = g.pagina(doc, abertura,
    ...g.corpo(sec.antes, {chave: "a"}),
    promessas, feito, caminho, nao, pedir);
  const toc = [{id: "promises", label: "0.x today, 1.0 next"}, {id: s("Already in place").id, label: "Already in place"},
    {id: s("Before 1.0").id, label: "Before 1.0"}, {id: s("Decided not to build").id, label: "Decided not to build"},
    {id: s("Ask for something").id, label: "Ask for something"}];
  return {node, toc};
}
