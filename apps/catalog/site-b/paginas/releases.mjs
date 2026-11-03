// "ALL RELEASES" NO SITE B (o desenho `releases-*`, 02/11/2026): o palco com a última versão e as cápsulas que flutuam; a
// última versão num cartão grande, com a caixa de atualizar (Web | Native e o gerenciador); e todas as versões por mês,
// com a busca e o "Show all" de cada mês. O texto do "Copy Markdown" é o da página de hoje (`site.releasesPage`).
import {abertura, achar, buscaDaLista, vazioDaBusca, pecasQueFlutuam} from "./_grupo-1.mjs";
import {seloDaNota, dataLonga, dataCurta, caixaDeAtualizar} from "./release.mjs";

const PRIMEIRAS = 8;

export default function releases(site) {
  const {h, Fragment, A, REPO, releases: todas} = site;
  const markdown = achar(site.releasesPage().node, e => e.props?.id === "page-markdown");
  const ultima = todas[0];
  // As linhas: cada versão, e a que saiu dentro de outra no lugar dela, levando à seção da nota de quem a publicou.
  const linhas = todas.flatMap(r => [{versao: r.versao, date: r.date, resumo: r.description, href: `./${r.arquivo}`, busca: r},
    ...r.incluidas.map(i => ({versao: i.versao, date: r.date, resumo: `Released inside v${r.versao}.`, href: `./${r.arquivo}#${i.id}`, dentro: r.versao}))]);
  const meses = [];
  for (const l of linhas) {
    const chave = l.date.slice(0, 7);
    let m = meses.find(x => x.chave === chave);
    if (!m) meses.push(m = {chave, linhas: []});
    m.linhas.push(l);
  }
  const nomeDoMes = chave => new Date(`${chave}-15T12:00:00Z`).toLocaleDateString("en-US", {year: "numeric", month: "long", timeZone: "UTC"});
  const primeiraData = todas.length ? todas[todas.length - 1].date : null;
  const cabeca = abertura(site, {
    trilha: ["Releases", "Overview"], titulo: "All Releases", ponteiro: true, classe: "rel-palco",
    lede: "Every update to Aurea: what is new, what changed, what was fixed and what may break. All seven packages are released together, with the same version number.",
    acoes: h(Fragment, null, site.acoesDaPagina(false, "md"),
      h(A.Button, {size: "lg", variant: "tertiary", leadingIcon: "arrow-up-right", href: `${REPO}/blob/main/CHANGELOG.md`, target: "_blank", rel: "noreferrer"}, "Changelog on GitHub")),
    lado: pecasQueFlutuam(site, [
      h("span", {className: "g1-numerao rel-numerao"}, h("b", null, ultima ? `v${ultima.versao}` : "—"), "latest"),
      h("span", {className: "g1-capsula"}, h("span", {className: "g1-capsula-num"}, todas.length),
        primeiraData ? `releases since ${new Date(`${primeiraData}T12:00:00Z`).toLocaleDateString("en-US", {month: "long", day: "numeric", timeZone: "UTC"})}` : "releases"),
      h("span", {className: "g1-capsula"}, "7 packages · one version")]),
  });
  const node = h("div", {className: "g1-b g1-largo rel-b"},
    cabeca,
    ultima ? h("section", {className: "rel-ultima-sec", "aria-labelledby": "latest-release"},
      h("p", {className: "intro-olho", id: "latest-release"}, "Latest release"),
      h(A.Card, {className: "rel-ultima"},
        h("div", {className: "rel-ultima-texto"},
          h("div", {className: "rel-ultima-topo"},
            h("h2", {className: "rel-versao"}, `v${ultima.versao}`),
            h(A.Badge, {variant: "primary", emphasis: "solid", size: "lg"}, "New"),
            h("time", {className: "rel-data", dateTime: ultima.date}, dataLonga(ultima.date))),
          h("p", {className: "rel-ultima-resumo"}, ultima.description),
          seloDaNota(site, ultima),
          h(A.Link, {href: `./${ultima.arquivo}`, className: "rel-ler"}, "Read full release notes", h(A.Icon, {name: "arrow-right", size: "sm"}))),
        caixaDeAtualizar(site, ultima))) : null,
    h("section", {className: "rel-todas", "aria-labelledby": "all-releases", "data-g1-lista": "", "data-g1-frase": "No release mentions"},
      h("p", {className: "intro-olho"}, "All releases"),
      h("h2", {className: "intro-h2", id: "all-releases"}, "Newest first."),
      buscaDaLista(site, {rotulo: "Find a release", dica: "Find a release — try “BottomNav”, “native” or “0.3”", total: linhas.length, chave: "g1"}),
      ...meses.map(m => h("section", {key: m.chave, className: "g1-grupo rel-mes", id: `m-${m.chave}`, "data-g1-grupo": "", "aria-labelledby": `m-${m.chave}-h`},
        h("div", {className: "g1-grupo-topo"},
          h("span", {className: "g1-grupo-num", "aria-hidden": "true"}, m.chave.slice(5)),
          h("h3", {id: `m-${m.chave}-h`}, nomeDoMes(m.chave)),
          h("span", {className: "g1-grupo-conta"}, `${m.linhas.length} release${m.linhas.length > 1 ? "s" : ""}`)),
        h("div", {className: "rel-linhas"}, ...m.linhas.map((l, k) => h(A.Card, {key: l.versao, variant: "interactive", lift: true, className: "rel-linha",
          render: h("a", {href: l.href}), "data-g1-item": "", "data-mais": k >= PRIMEIRAS ? "" : undefined,
          "data-busca": `v${l.versao} ${l.resumo} ${l.busca ? l.busca.texto : ""}`.toLowerCase()},
          h("span", {className: "rel-pilula", "data-ultima": l.versao === ultima?.versao ? "" : undefined}, `v${l.versao}`),
          h("time", {className: "rel-curta", dateTime: l.date}, dataCurta(l.date)),
          h("span", {className: "rel-resumo"}, l.resumo),
          h(A.Icon, {name: "arrow-right", size: "sm", className: "rel-seta"})))),
        m.linhas.length > PRIMEIRAS ? h("div", {className: "g1-mais"},
          h(A.Button, {variant: "tertiary", size: "lg", type: "button", trailingIcon: "caret-down", "data-g1-mais": "", "aria-expanded": "false"},
            `Show all ${m.linhas.length}`)) : null)),
      vazioDaBusca(site, {chave: "g1", titulo: "No release found", texto: "Try a component name, a version number or a shorter word."})),
    markdown);
  return {node, toc: []};
}
