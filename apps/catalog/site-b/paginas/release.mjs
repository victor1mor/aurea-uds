// A NOTA DE UMA VERSÃO NO SITE B (02/11/2026). Sem desenho próprio: segue a lista (`releases-*`) e a página de
// componente — o palco com a versão, a data, os selos do que mudou e a caixa de atualizar ao lado; o texto da nota num
// cartão; e o anterior e o próximo. O texto do "Copy Markdown" é o da página de hoje (`site.releasePage`, com o "Update").
import {abertura, achar, anteriorProximo} from "./_grupo-1.mjs";

export const dataLonga = d => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric", timeZone: "UTC"});
export const dataCurta = d => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", {month: "short", day: "numeric", timeZone: "UTC"});
const comparar = (a, b) => { const x = a.split(".").map(Number), y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };

// OS SELOS DO QUE MUDOU, lidos dos títulos da própria nota (nada escrito à mão): o que pode quebrar no vermelho, o novo no
// verde, o que mudou de aparência ou de jeito no azul, o conserto no neutro.
const TIPOS = [[/^(breaking|⚠|may break)/i, "Breaking", "danger"], [/^(new|added)/i, "New", "success"],
  [/^(look and feel|changed)/i, "Look and feel", "info"], [/^fixed/i, "Fixed", "neutral"]];
export function seloDaNota(site, r) {
  const {h, A} = site;
  const achados = [];
  for (const b of r.blocos.filter(b => b.tipo === "h2")) for (const [re, rotulo, tom] of TIPOS) {
    if (!re.test(b.rotulo) || achados.some(a => a.tom === tom)) continue;
    achados.push({tom, rotulo: tom === "info" && /^changed/i.test(b.rotulo) ? "Changed" : rotulo});
  }
  return achados.length ? h("div", {className: "rel-selos"}, ...achados.map(a => h(A.Badge, {key: a.tom, tone: a.tom, size: "lg"}, a.rotulo))) : null;
}

// A CAIXA DE ATUALIZAR: Web | Native e o comando nos quatro gerenciadores (o `CodeBlock` com abas, o mesmo da Quick Start).
const gerenciadores = pacotes => [["npm", `npm i ${pacotes}`], ["pnpm", `pnpm add ${pacotes}`], ["yarn", `yarn add ${pacotes}`],
  ["bun", `bun add ${pacotes}`]].map(([label, code]) => ({label, code}));
export function caixaDeAtualizar(site, r) {
  const {h, A} = site;
  const web = ["react", "core", "fonts", "icons"].map(p => `@aurea-uds/${p}@${r.versao}`).join(" ");
  const nativo = comparar(r.versao, "0.7.0") >= 0 ? `@aurea-uds/native@${r.versao}` : null;
  return h("div", {className: "rel-atualizar", "data-g1-paineis": ""},
    h("div", {className: "rel-atualizar-topo"}, h("p", {className: "comp-rotulo"}, "Update"),
      nativo ? h("div", {"data-g1-escolha": ""}, h(A.SegmentedControl, {label: "Platform", size: "lg", selectedStyle: "emphasis", value: "Web",
        items: [{value: "Web", label: "Web"}, {value: "Native", label: "Native"}]})) : null),
    h("div", {"data-g1-painel": "Web"}, h(A.CodeBlock, {language: "bash", copyable: true, tabs: gerenciadores(web)})),
    nativo ? h("div", {"data-g1-painel": "Native", hidden: true}, h(A.CodeBlock, {language: "bash", copyable: true, tabs: gerenciadores(nativo)})) : null);
}

export default function release(site, r) {
  const {h, Fragment, A, REPO} = site;
  const markdown = achar(site.releasePage(r).node, e => e.props?.id === "page-markdown");
  const doc = site.docPage(r, {area: "releases"});
  const prosa = achar(doc.node, e => e.type === A.Prose);
  const {prev, next} = site.vizinhos("releases", r.arquivo);
  const ultima = site.releases[0]?.versao === r.versao;
  const node = h("div", {className: "g1-b rel-b"},
    abertura(site, {
      trilha: ["Releases", `v${r.versao}`], titulo: r.title, lede: r.description, classe: "rel-palco rel-palco-nota",
      acoes: h(Fragment, null, site.acoesDaPagina(false, "md"),
        h(A.Button, {size: "lg", variant: "tertiary", leadingIcon: "arrow-up-right", href: `${REPO}/blob/main/CHANGELOG.md`, target: "_blank", rel: "noreferrer"}, "Changelog on GitHub")),
      selos: h(Fragment, null,
        ultima ? h(A.Badge, {variant: "primary", emphasis: "solid", size: "lg"}, "Latest") : null,
        h(A.Badge, {size: "lg", className: "g1-selo-mono"}, h("time", {dateTime: r.date}, dataLonga(r.date)))),
      extra: seloDaNota(site, r),
      lado: caixaDeAtualizar(site, r),
    }),
    h(A.Card, {className: "rel-nota"}, prosa),
    anteriorProximo(site, prev, next),
    markdown);
  return {node, toc: doc.toc};
}
