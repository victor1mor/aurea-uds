// GAR-01 e GAR-06 (07/10/2026) · o cabeçalho e o rodapé de SITE, como VARIAÇÕES de peças que já
// existem (regra do Victor: componente não se exclui; peça nova entra como variação).
//   GAR-01: o `Topbar` passou a se chamar `Header` (nome de mercado) e ganhou `items`, `current`,
//           `actions`, `maxWidth` e o `menuId` do painel do celular. O `Topbar` continua, igual
//           (o nativo está no `native-header-nome.test.tsx`).
//   GAR-06: a `Section` ganhou `variant="footer"`.
// O que o React emite; o efeito no navegador (altura, cor do atual, painel do celular, colunas)
// é medido no `tests/visual/site-gar01-06.spec.ts`.
// Provado contra o defeito: na 0.22.0 não há `Header` para importar, a `Section` ignora `variant`
// e não há `<footer>`.
import {render} from "@testing-library/react";
import {renderToStaticMarkup} from "react-dom/server";
import type {ReactElement} from "react";
import {describe, expect, test} from "vitest";
import {AureaProvider, Header, Section, Topbar} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);
const ITENS = [
  {id: "inicio", label: "Início", href: "/"},
  {id: "motos", label: "Motos", href: "/motos"},
  {id: "carros", label: "Carros", href: "/carros"},
];

describe("GAR-01 · o nome: Header, e o Topbar continua", () => {
  // A marcação do `Topbar` de ANTES (0.22.0), escrita aqui de propósito: quem já usa não pode ver
  // diferença nenhuma.
  test("o Topbar sai igual ao de antes, e igual ao Header", () => {
    const antes = '<header class="topbar topbar-floating"><div class="brand">X</div>filho</header>';
    expect(renderToStaticMarkup(<Topbar brand="X">filho</Topbar>)).toBe(antes);
    expect(renderToStaticMarkup(<Header brand="X">filho</Header>)).toBe(antes);
  });
  test("o Topbar aceita as props novas do Header", () => {
    const um = renderToStaticMarkup(<Topbar items={ITENS} current="motos" />);
    expect(um).toBe(renderToStaticMarkup(<Header items={ITENS} current="motos" />));
  });
});

describe("GAR-01 · o cabeçalho de site", () => {
  test("sem `items`, nada de navegação nem de menu", () => {
    const {container} = wrap(<Header brand="Aurea" />);
    expect(container.querySelector("nav")).toBeNull();
    expect(container.querySelector("details")).toBeNull();
    expect(container.querySelector("header")).not.toHaveClass("topbar-site");
  });
  test("os links saem num <nav> com nome, e só o atual leva aria-current", () => {
    const {container} = wrap(<Header items={ITENS} current="motos" navLabel="Principal" />);
    const nav = container.querySelector(".topbar-nav")!;
    expect(nav.tagName).toBe("NAV");
    expect(nav.getAttribute("aria-label")).toBe("Principal");
    const links = [...nav.querySelectorAll("a")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/", "/motos", "/carros"]);
    expect(links.map((a) => a.getAttribute("aria-current"))).toEqual([null, "page", null]);
  });
  // O painel do celular é um POPOVER (opção "B" do Victor, 07/10/2026), e não mais o `<details>` da
  // primeira versão: com o `<details>` nem o Esc nem o toque fora fechavam. Provado contra a
  // primeira versão: lá não há `button[popovertarget]` nem `nav[popover]`, e estes testes reprovam.
  test("o menu do celular é um botão que abre um popover nomeado, com os mesmos links", () => {
    const {container} = wrap(<Header items={ITENS} current="carros" menuLabel="Abrir menu" />);
    expect(container.querySelector("details")).toBeNull();
    const botao = container.querySelector("button.topbar-menu-toggle")!;
    expect(botao.getAttribute("type")).toBe("button");
    expect(botao.getAttribute("aria-label")).toBe("Abrir menu");
    const painel = container.querySelector("nav.topbar-menu-panel")!;
    expect(painel.getAttribute("popover")).toBe("auto");
    expect(botao.getAttribute("popovertarget")).toBe(painel.id);
    expect([...painel.querySelectorAll("a")].map((a) => a.textContent)).toEqual(["Início", "Motos", "Carros"]);
    expect(painel.querySelector('[aria-current="page"]')!.textContent).toBe("Carros");
  });
  test("os nomes padrão são Main e Menu, e o id do painel é aurea-header-menu", () => {
    const {container} = wrap(<Header items={ITENS} />);
    expect(container.querySelector(".topbar-nav")!.getAttribute("aria-label")).toBe("Main");
    expect(container.querySelector(".topbar-menu-toggle")!.getAttribute("aria-label")).toBe("Menu");
    expect(container.querySelector(".topbar-menu-panel")!.id).toBe("aurea-header-menu");
  });
  test("`menuId` troca o id do painel e o alvo do botão juntos", () => {
    const {container} = wrap(<Header items={ITENS} menuId="menu-secundario" />);
    expect(container.querySelector(".topbar-menu-panel")!.id).toBe("menu-secundario");
    expect(container.querySelector(".topbar-menu-toggle")!.getAttribute("popovertarget")).toBe("menu-secundario");
  });
  test("`render` leva o link do roteador, com a pele e o estado de atual", () => {
    const Link = (p: {to: string; className?: string; children?: React.ReactNode}) =>
      <a data-roteador={p.to} className={p.className} aria-current={(p as {"aria-current"?: "page"})["aria-current"]}>{p.children}</a>;
    const itens = [{id: "a", label: "A", render: <Link to="/a" /> as ReactElement}, {id: "b", label: "B", render: <Link to="/b" />}];
    const {container} = wrap(<Header items={itens} current="b" />);
    const b = container.querySelector('.topbar-nav [data-roteador="/b"]')!;
    expect(b).toHaveClass("topbar-link");
    expect(b.getAttribute("aria-current")).toBe("page");
    expect(b.textContent).toBe("B");
  });
  test("`actions` fica num grupo próprio, depois dos links", () => {
    const {container} = wrap(<Header items={ITENS} actions={<button type="button">Entrar</button>} />);
    const filhos = [...container.querySelector("header")!.children].map((e) => e.className);
    expect(filhos.indexOf("topbar-actions")).toBeGreaterThan(filhos.indexOf("topbar-nav"));
  });
  test("`maxWidth` põe o miolo num Container da mesma escala", () => {
    const {container} = wrap(<Header items={ITENS} maxWidth="lg" />);
    expect(container.querySelector("header")).toHaveClass("topbar-contained");
    expect(container.querySelector("header > div")!.className).toBe("container container-lg topbar-inner");
    const xl = wrap(<Header items={ITENS} maxWidth="xl" />).container;
    expect(xl.querySelector("header > div")!.className).toBe("container topbar-inner");
  });
  // A pele do item é a MESMA na barra e no painel: o atual é o atual nos dois.
  test("o item da barra e o do painel têm a mesma pele", () => {
    const {container} = wrap(<Header items={ITENS} current="inicio" />);
    const barra = container.querySelector(".topbar-nav a")!.outerHTML;
    const painel = container.querySelector(".topbar-menu-panel a")!.outerHTML;
    expect(barra).toBe(painel);
  });
  // 14/10/2026 · `itemsJustify="start"`: os links colados na marca, como a página inicial da referência. O padrão
  // ("end") não muda a marcação; a posição na tela se mede no `catalog-sweep.spec.ts` (o topo do Início).
  test("`itemsJustify=\"start\"` marca a barra; o padrão e a barra sem links não", () => {
    expect(wrap(<Header items={ITENS} itemsJustify="start" />).container.querySelector("header")).toHaveClass("topbar-items-start");
    expect(wrap(<Header items={ITENS} />).container.querySelector("header")!.className).toBe("topbar topbar-floating topbar-site");
    expect(wrap(<Header itemsJustify="start">x</Header>).container.querySelector("header")!.className).toBe("topbar topbar-floating");
  });
  // 15/10/2026 · o topo da página inicial da referência: `size="sm"` (56), `blurred` (o fundo que embaça, só na `flush`)
  // e `menuActions` (o que só o menu do celular leva). O padrão não muda a marcação; a medida é do `catalog-sweep.spec.ts`.
  test("`size=\"sm\"` e `blurred` marcam a barra; `blurred` só vale na `flush`", () => {
    const h = (ui: ReactElement) => wrap(ui).container.querySelector("header")!;
    expect(h(<Header variant="flush" items={ITENS} size="sm" blurred />)).toHaveClass("topbar-sm", "topbar-blurred");
    expect(h(<Header items={ITENS} blurred />)).not.toHaveClass("topbar-blurred");
    expect(h(<Header variant="flush" items={ITENS} />).className).toBe("topbar topbar-flush topbar-site");
  });
  test("`menuActions` entra no painel do celular, depois dos links, e não na barra", () => {
    const {container} = wrap(<Header items={ITENS} actions={<button type="button">Busca</button>} menuActions={<a href="/gh">GitHub</a>} />);
    const painel = container.querySelector(".topbar-menu-panel")!;
    expect(painel.querySelector(".topbar-menu-actions a")!.textContent).toBe("GitHub");
    expect(painel.lastElementChild).toHaveClass("topbar-menu-actions");
    expect(container.querySelector(".topbar-actions")!.textContent).toBe("Busca");
    expect(wrap(<Header items={ITENS} />).container.querySelector(".topbar-menu-actions")).toBeNull();
  });
});

describe("GAR-06 · o rodapé de site (Section variant=\"footer\")", () => {
  const COLUNAS = [
    {title: "Produto", items: [{id: "precos", label: "Preços", href: "/precos"}]},
    {title: "Empresa", items: [{id: "sobre", label: "Sobre", href: "/sobre"}, {id: "vagas", label: "Vagas", href: "/vagas"}]},
  ];
  test("a Section comum continua sendo <section>, sem nada do rodapé", () => {
    const {container} = wrap(<Section>x</Section>);
    expect(container.querySelector("section")!.className).toBe("section");
    expect(container.querySelector("footer")).toBeNull();
  });
  test("é um <footer>, com o tema, o fundo e o respiro da faixa", () => {
    const {container} = wrap(<Section variant="footer" theme="dark" surface="card" spacing="sm" />);
    const f = container.querySelector("footer")!;
    expect(f.getAttribute("data-theme")).toBe("dark");
    expect(f.className).toBe("section section-card section-spacing-sm section-footer");
    expect(f.querySelector(":scope > .container")).not.toBeNull();
  });
  test("marca, colunas com título e links, e a linha legal", () => {
    const {container} = wrap(<Section variant="footer" brand={<strong>Acme</strong>} links={COLUNAS}
      legal="© 2026 Acme" navLabel="Rodapé" />);
    expect(container.querySelector(".section-footer-brand")!.textContent).toBe("Acme");
    const nav = container.querySelector("nav.section-footer-nav")!;
    expect(nav.getAttribute("aria-label")).toBe("Rodapé");
    expect([...nav.querySelectorAll("h2")].map((t) => t.textContent)).toEqual(["Produto", "Empresa"]);
    expect([...nav.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual(["/precos", "/sobre", "/vagas"]);
    expect(container.querySelector(".section-footer-legal")!.textContent).toBe("© 2026 Acme");
  });
  test("o nome padrão da navegação do rodapé é Footer, e o miolo é xl", () => {
    const {container} = wrap(<Section variant="footer" links={COLUNAS} />);
    expect(container.querySelector("nav")!.getAttribute("aria-label")).toBe("Footer");
    expect(container.querySelector("footer > div")!.className).toBe("container");
  });
  // 15/10/2026 · `layout="inline"`: o rodapé de UMA linha da página inicial da referência — a frase legal, os links sem os
  // títulos das colunas, e o que vier dentro. A marca não entra. O padrão (`columns`) não muda.
  test("`layout=\"inline\"`: uma linha com a frase, os links sem título e os filhos; sem a marca", () => {
    const {container} = wrap(<Section variant="footer" layout="inline" brand="Marca" links={COLUNAS} legal="© 2026 X"><a href="/gh">GitHub</a></Section>);
    const rodape = container.querySelector("footer")!;
    expect(rodape).toHaveClass("section-footer", "section-footer-inline");
    expect(rodape.querySelector(".section-footer-line > p")!.textContent).toBe("© 2026 X");
    expect([...rodape.querySelectorAll("nav a")].map((a) => a.textContent)).toEqual(["Preços", "Sobre", "Vagas"]);
    expect(rodape.querySelector("h2")).toBeNull();
    expect(rodape.textContent).not.toContain("Marca");
    expect(rodape.querySelector(".section-footer-line > a")!.textContent).toBe("GitHub");
    expect(wrap(<Section variant="footer" links={COLUNAS} />).container.querySelector(".section-footer-inline")).toBeNull();
  });
});
