import {test, expect} from "@playwright/test";
import {readFileSync} from "node:fs";

// Achado ao medir o GAR-08 (06/10/2026): o cartão clicável costuma ser um `<a>` (o `render` do
// `Card`), e TODO o texto dele saía sublinhado — o sublinhado padrão do navegador. Quem mais tem o
// problema: o item de menu que é link (`DropdownMenu` com `href`, o `LinkItem` do motor), que sai
// `<a class="menu-item">`. Os outros alvos que viram link já tiravam o sublinhado.
//
// Aqui cada classe que a Aurea põe num `<a>` é medida no navegador, com a folha publicada: o
// sublinhado tem de ser `none`. Provado contra o defeito: com a folha de antes (sem o
// `text-decoration:none` no `.card-interactive` e no `.menu-item`), os dois reprovam.
const ALVOS: Array<[string, string]> = [
  ["cartão clicável", `<a class="card card-interactive" href="#x"><h3>Título</h3><p>Resumo</p></a>`],
  ["item de menu (LinkItem)", `<a class="menu-item" href="#x">Abrir a página</a>`],
  ["botão-link", `<a class="btn btn-primary" href="#x">Entrar</a>`],
  ["item da lateral", `<a class="sidebar-item" href="#x">Início</a>`],
  ["linha do NavList", `<a class="nav-list-row" href="#x">Perfil</a>`],
  ["item da barra de baixo", `<a class="bottom-nav-item" href="#x">Gastos</a>`],
  ["trilha", `<nav class="breadcrumb"><a href="#x">Início</a></nav>`],
  ["índice da página", `<nav class="toc"><a href="#x">Seção</a></nav>`],
];

test("nenhum alvo da Aurea que vira link sai sublinhado", async ({page: p, baseURL}) => {
  const url = `${baseURL}/__link-sem-sublinhado`;
  await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="dark"><head>
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body>${ALVOS.map(([nome, html]) => `<div data-nome="${nome}">${html}</div>`).join("")}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  const medidas = await p.$$eval("[data-nome]", (caixas) => caixas.map((c) => {
    const a = c.querySelector("a")!;
    // O sublinhado de um link vale para os filhos também: mede-se o próprio `<a>` e o texto de dentro.
    const filho = a.querySelector("h3,p") as HTMLElement | null;
    return {nome: (c as HTMLElement).dataset.nome, link: getComputedStyle(a).textDecorationLine,
      dentro: filho ? getComputedStyle(filho).textDecorationLine : "none"};
  }));
  for (const m of medidas) expect([m.link, m.dentro], m.nome).toEqual(["none", "none"]);
});

// O `LinkItem` do menu emite exatamente a classe medida acima — se um dia trocar de classe, esta
// linha reprova antes de o sublinhado voltar em silêncio.
test("o item de menu que é link sai com a classe medida", () => {
  const fonte = readFileSync("packages/react/src/overlays.tsx", "utf8");
  expect(fonte).toMatch(/<BaseMenu\.LinkItem[^>]*className="menu-item"/);
});
