// 0.32.0, passo 4 (navegação) · abas secundárias, paginação da referência, Accordion da referência,
// a lateral à direita com a coluna do AppShell, e a paleta com grupos e atalhos.
// O que o React emite e o comportamento; a medida (aba 32, número 32, pergunta com 16) é do
// `skin.spec.ts`.
// Provado contra o defeito: na 0.31.0 a paginação era "Anterior · 3 / 12 · Próxima" (sem números nem
// links), o Accordion abria vários e tinha o marcador do navegador, não havia `placement` nem `aside`,
// e a paleta não agrupava — o teste do filtro DENTRO dos grupos é o defeito de 13/08/2026: dar a cada
// grupo a sua fatia devolvia todos os itens com qualquer busca.
import {render, fireEvent, within, act} from "@testing-library/react";
import {vi} from "vitest";
import {Accordion, AppShell, AureaProvider, CommandPalette, Pagination, Sidebar, Tabs, ptBR} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode, strings?: typeof ptBR) => render(<AureaProvider strings={strings}>{ui}</AureaProvider>);

describe("Tabs variant=secondary", () => {
  test("a lista leva a classe secundária; sem a prop, a de sempre", () => {
    const abas = [{id: "a", label: "A", content: "a"}, {id: "b", label: "B", content: "b"}];
    const {getAllByRole, rerender} = wrap(<Tabs tabs={abas} value="a" onChange={() => {}} variant="secondary" />);
    expect(getAllByRole("tablist")[0]).toHaveClass("tabs", "tabs-secondary");
    rerender(<AureaProvider><Tabs tabs={abas} value="a" onChange={() => {}} /></AureaProvider>);
    expect(getAllByRole("tablist")[0].className).toBe("tabs");
  });
});

describe("Pagination", () => {
  test("o padrão são os números, com reticências, e a atual marcada", () => {
    const {getByRole, container} = wrap(<Pagination page={5} total={12} onPageChange={() => {}} />);
    const nav = getByRole("navigation", {name: "Pagination"});
    const textos = [...nav.querySelectorAll(".pagination-content > li")].map(li => li.textContent);
    expect(textos).toEqual(["Previous", "1", "…", "4", "5", "6", "…", "12", "Next"]);
    const atual = getByRole("button", {name: "Page 5"});
    expect(atual).toHaveAttribute("aria-current", "page");
    expect(atual).toHaveClass("active");
    expect(container.querySelectorAll(".pagination-ellipsis[aria-hidden=true]")).toHaveLength(2);
  });
  test("poucas páginas: todas, sem reticências; nas pontas, o anterior/próxima desliga", () => {
    const {getByRole, container} = wrap(<Pagination page={1} total={5} onPageChange={() => {}} />);
    expect(container.querySelectorAll(".pagination-ellipsis")).toHaveLength(0);
    expect(getByRole("button", {name: "Previous"})).toBeDisabled();
  });
  test("clicar num número chama onPageChange com ele", () => {
    const ir = vi.fn();
    const {getByRole} = wrap(<Pagination page={2} total={5} onPageChange={ir} />);
    fireEvent.click(getByRole("button", {name: "Page 4"}));
    expect(ir).toHaveBeenCalledWith(4);
    fireEvent.click(getByRole("button", {name: "Next"}));
    expect(ir).toHaveBeenLastCalledWith(3);
  });
  test("com href, as páginas são LINKS de verdade (GAR-18)", () => {
    const {getByRole} = wrap(<Pagination page={2} total={5} href={p => `?page=${p}`} />);
    expect(getByRole("link", {name: "Page 3"})).toHaveAttribute("href", "?page=3");
    expect(getByRole("link", {name: "Page 2"})).toHaveAttribute("aria-current", "page");
    expect(getByRole("link", {name: "Next"})).toHaveAttribute("href", "?page=3");
  });
  test("simple: só anterior e próxima; summary aparece à esquerda", () => {
    const {getByRole, container} = wrap(<Pagination page={1} total={10} variant="simple" summary="1 a 5 de 50" onPageChange={() => {}} />);
    expect(container.querySelectorAll(".pagination-content > li")).toHaveLength(2);
    expect(container.querySelector(".pagination-summary")!.textContent).toBe("1 a 5 de 50");
    expect(getByRole("button", {name: "Next"})).toBeEnabled();
  });
  test("compact: o desenho de antes continua", () => {
    const {container} = wrap(<Pagination page={3} total={12} variant="compact" onPageChange={() => {}} />);
    expect(container.querySelector(".badge")!.textContent).toBe("3 / 12");
  });
  test("o nome do número segue a língua (ptBR: \"Página 3\")", () => {
    const {getByRole} = wrap(<Pagination page={3} total={5} onPageChange={() => {}} />, ptBR);
    expect(getByRole("button", {name: "Página 3"})).toHaveAttribute("aria-current", "page");
  });
});

describe("Accordion", () => {
  const ITENS = [{id: "a", title: "Pergunta A", content: "Resposta A"}, {id: "b", title: "Pergunta B", content: "Resposta B"},
    {id: "c", title: "Pergunta C", content: "Resposta C", disabled: true}];
  test("um de cada vez: todos os itens com o MESMO `name`", () => {
    const {container} = wrap(<Accordion items={ITENS} />);
    const nomes = [...container.querySelectorAll("details")].map(d => d.getAttribute("name"));
    expect(new Set(nomes).size).toBe(1);
    expect(nomes[0]).toBeTruthy();
  });
  test("`multiple`: sem `name`, vários abertos", () => {
    const {container} = wrap(<Accordion items={ITENS} multiple />);
    for (const d of container.querySelectorAll("details")) expect(d.hasAttribute("name")).toBe(false);
  });
  test("`defaultValue` abre; a seta é do componente; `surface` leva a classe", () => {
    const {container} = wrap(<Accordion items={ITENS} defaultValue={["b"]} variant="surface" />);
    const [a, b] = container.querySelectorAll("details");
    expect(a.open).toBe(false);
    expect(b.open).toBe(true);
    expect(container.querySelectorAll(".accordion-chevron")).toHaveLength(3);
    expect(container.querySelector(".accordion")).toHaveClass("accordion-surface");
  });
  test("o item desligado é anunciado e sai do Tab", () => {
    const {container} = wrap(<Accordion items={ITENS} />);
    const s = container.querySelectorAll("summary")[2];
    expect(s).toHaveAttribute("aria-disabled", "true");
    expect(s).toHaveAttribute("tabindex", "-1");
  });
});

describe("Sidebar placement e a coluna da direita do AppShell", () => {
  test("placement=right leva a classe e o atributo", () => {
    const {container} = wrap(<Sidebar placement="right" aria-label="Lado">x</Sidebar>);
    const a = container.querySelector("aside")!;
    expect(a).toHaveClass("sidebar", "sidebar-right");
    expect(a).toHaveAttribute("data-placement", "right");
  });
  test("AppShell com `aside`: uma região complementar com o nome \"On this page\"", () => {
    const {getByRole, container} = wrap(<AppShell brand="Aurea" aside={<p>sumário</p>}>conteúdo</AppShell>);
    const lado = getByRole("complementary", {name: "On this page"});
    expect(lado).toHaveClass("app-shell-aside", "sidebar-right");
    expect(container.querySelector(".app-shell")).toHaveClass("app-shell-with-aside");
  });
  test("sem `aside`, nada muda", () => {
    const {container} = wrap(<AppShell brand="Aurea">conteúdo</AppShell>);
    expect(container.querySelector(".app-shell-aside")).toBeNull();
    expect(container.querySelector(".app-shell")).not.toHaveClass("app-shell-with-aside");
  });
});

describe("CommandPalette com grupos e atalhos", () => {
  const ITENS = [
    {id: "b", label: "Button", group: "Components", run: () => {}},
    {id: "cb", label: "CloseButton", group: "Components", run: () => {}},
    {id: "t", label: "Theme", group: "Pages", run: () => {}},
    {id: "tk", label: "--btn-bg", group: "Tokens", run: () => {}},
  ];
  test("os títulos dos grupos aparecem, na ordem em que o grupo aparece", () => {
    const {getByRole} = wrap(<CommandPalette open onClose={() => {}} items={ITENS} />);
    const dialogo = getByRole("dialog");
    const titulos = [...dialogo.querySelectorAll(".command-group-label")].map(e => e.textContent);
    expect(titulos).toEqual(["Components", "Pages", "Tokens"]);
  });
  test("o filtro vale DENTRO dos grupos (o defeito de 13/08/2026)", async () => {
    const {getByRole} = wrap(<CommandPalette open onClose={() => {}} items={ITENS} />);
    const campo = getByRole("combobox");
    await act(async () => { fireEvent.change(campo, {target: {value: "the"}}); });
    const dialogo = getByRole("dialog");
    const opcoes = within(dialogo).getAllByRole("option").map(o => o.textContent);
    expect(opcoes).toEqual(["Theme"]);
    const titulos = [...dialogo.querySelectorAll(".command-group-label")].map(e => e.textContent);
    expect(titulos).toEqual(["Pages"]);
  });
  test("a linha de atalhos descreve o campo, e some com shortcuts={false}", () => {
    // `document`, e não o `container`: desde 14/10/2026 a paleta mora na janela do motor, que vai para o portal.
    const {getByRole, rerender} = wrap(<CommandPalette open onClose={() => {}} items={ITENS} />, ptBR);
    const linha = document.querySelector(".command-shortcuts")!;
    expect(linha.textContent).toContain("mover");
    expect(getByRole("combobox").getAttribute("aria-describedby")).toContain(linha.id);
    rerender(<AureaProvider strings={ptBR}><CommandPalette open onClose={() => {}} items={ITENS} shortcuts={false} /></AureaProvider>);
    expect(document.querySelector(".command-shortcuts")).toBeNull();
  });
  test("sem `group` em nenhum item, a lista é a de sempre (sem título)", () => {
    const {getByRole} = wrap(<CommandPalette open onClose={() => {}} items={ITENS.map(({group: _g, ...i}) => i)} />);
    expect(getByRole("dialog").querySelectorAll(".command-group-label")).toHaveLength(0);
  });
});

// Duas paginações na mesma página eram dois marcos com o mesmo nome — o axe da varredura acusou na
// página do catálogo (0.32.0). `label` dá a cada uma o seu.
describe("Pagination label", () => {
  test("o nome do marco vem de `label`; sem ele, a frase de sempre", () => {
    const {getByRole, rerender} = wrap(<Pagination label="Pedidos" page={2} total={6} onPageChange={() => {}} />);
    expect(getByRole("navigation", {name: "Pedidos"})).toHaveClass("pagination");
    rerender(<AureaProvider><Pagination variant="compact" label="Registros" page={2} total={6} onPageChange={() => {}} /></AureaProvider>);
    expect(getByRole("navigation", {name: "Registros"})).toBeTruthy();
    rerender(<AureaProvider><Pagination page={2} total={6} onPageChange={() => {}} /></AureaProvider>);
    expect(getByRole("navigation", {name: "Pagination"})).toBeTruthy();
  });
});
