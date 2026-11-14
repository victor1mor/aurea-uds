// As setas numa página da direita para a esquerda (13/11/2026, a Fase 1): o `Breadcrumb`, a `Pagination`, a `NavList`,
// o `Carousel`, o submenu, a `InterAgentMessage` e a `DataGrid` desenhavam a seta sempre para o mesmo lado, apontando
// contra a leitura. A referência gira o separador da trilha e as setas da paginação nessa escrita; aqui o ícone sai pela
// direção do provedor (`direction="rtl"`), como o grupo que dobra da `Sidebar`. Da esquerda para a direita nada muda.
// Provado contra o defeito: no código de antes (a 0.68.0) os sete testes da direita para a esquerda reprovam (a seta é a
// mesma da esquerda para a direita); os da esquerda para a direita passam nos dois — são a guarda de que nada mudou ali.
import {render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {AureaProvider, Breadcrumb, Button, Carousel, DropdownMenu, InterAgentMessage, NavList, Pagination} from "../../packages/react/src/index";
import {DataGrid} from "../../packages/react/src/data-grid";

type Direcao = "ltr" | "rtl";
const montar = (direction: Direcao, no: React.ReactNode) => render(<AureaProvider direction={direction}>{no}</AureaProvider>);
/** O nome do desenho de cada seta (o `<use>` do ícone), na ordem do documento. */
const desenhos = (raiz: ParentNode, seletor: string) =>
  [...raiz.querySelectorAll(`${seletor} use`)].map((u) => (u.getAttribute("href") ?? "").split("#").pop());
const desenhoDoBotao = (nome: string) => desenhos(screen.getByRole("button", {name: nome}), ":scope");

const CASOS: Array<{peca: string; desenhar: (d: Direcao) => string[] | Promise<string[]>; ltr: string[]; rtl: string[]}> = [
  {peca: "Breadcrumb", ltr: ["i-caret-right", "i-caret-right"], rtl: ["i-caret-left", "i-caret-left"],
    desenhar: (d) => desenhos(montar(d, <Breadcrumb items={[{label: "Home", href: "#"}, {label: "Reports", href: "#"}, {label: "Sales"}]} />).container, ".breadcrumb")},
  // anterior e próxima: as duas trocam de lado
  {peca: "Pagination", ltr: ["i-caret-left", "i-caret-right"], rtl: ["i-caret-right", "i-caret-left"],
    desenhar: (d) => desenhos(montar(d, <Pagination page={3} total={6} onPageChange={() => {}} />).container, ".pagination-nav-icon")},
  {peca: "NavList", ltr: ["i-caret-right"], rtl: ["i-caret-left"],
    desenhar: (d) => desenhos(montar(d, <NavList items={[{id: "a", label: "Account", href: "#"}]} />).container, ".nav-list-chevron")},
  {peca: "Carousel", ltr: ["i-caret-left", "i-caret-right"], rtl: ["i-caret-right", "i-caret-left"],
    desenhar: (d) => { montar(d, <Carousel label="Photos"><div>1</div><div>2</div></Carousel>);
      return [...desenhoDoBotao("Previous slide"), ...desenhoDoBotao("Next slide")]; }},
  {peca: "InterAgentMessage", ltr: ["i-arrow-right"], rtl: ["i-arrow-left"],
    desenhar: (d) => desenhos(montar(d, <InterAgentMessage messages={[{id: "1", from: "Analyst", to: "Writer", body: "Ready"}]} />).container, ".agent-message-arrow")},
  {peca: "DataGrid", ltr: ["i-caret-right"], rtl: ["i-caret-left"],
    desenhar: (d) => { montar(d, <DataGrid label="People" data={[{name: "Ana"}]} columns={[{accessorKey: "name", header: "Name"}]} renderDetail={() => "x"} />);
      return desenhoDoBotao("Details"); }},
  // o submenu só existe com o menu aberto
  {peca: "submenu", ltr: ["i-caret-right"], rtl: ["i-caret-left"],
    desenhar: async (d) => {
      const user = userEvent.setup();
      montar(d, <DropdownMenu trigger={<Button>Open</Button>} items={[{kind: "submenu", label: "Export", items: [{label: "PDF"}]}]} />);
      await user.click(screen.getByRole("button", {name: "Open"}));
      const menu = await screen.findByRole("menu");
      return desenhos(within(menu).getByRole("menuitem", {name: /Export/}), ".menu-seta");
    }},
];

describe("as setas apontam para onde se lê", () => {
  for (const {peca, desenhar, ltr, rtl} of CASOS) {
    it(`${peca}: da direita para a esquerda, a seta vira`, async () => {
      expect(await desenhar("rtl")).toEqual(rtl);
    });
    it(`${peca}: da esquerda para a direita, continua como era`, async () => {
      expect(await desenhar("ltr")).toEqual(ltr);
    });
  }
});
