// 4-C (23/10/2026) — a lateral com o topo e o pé fixos, o desenho das quinze laterais aprovadas pelo Victor (item 107)
// e o PV-15 de um segundo app. O que o React desenha; a medida e o "só o meio rola" são do
// `tests/visual/sidebar-topo-pe.spec.ts`.
// Provado contra o defeito: com a `Sidebar` da 0.40.1, `header` e `footer` não existiam (iam parar como atributo da
// `<aside>`) e as partes (`Sidebar.Brand`, `Sidebar.User`, `Sidebar.Nav`, `Sidebar.Show`) eram `undefined`.
import {render} from "@testing-library/react";
import {AureaProvider, Avatar, IconButton, Sidebar} from "../../packages/react/src/index";

const ITENS = [{id: "a", label: "Dashboard", icon: "house" as const}, {id: "b", label: "Reports", icon: "file-text" as const}];
const PE = [{id: "s", label: "Support", icon: "lifebuoy" as const}, {id: "g", label: "Settings", icon: "gear" as const}];
const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

const completa = (collapsed = false) => (
  <Sidebar items={ITENS} current="a" collapsed={collapsed}
    header={<>
      <Sidebar.Brand logo="P" name="Acme Plans" description="Workspace" />
      <Sidebar.Show when="expanded"><input aria-label="Search" /></Sidebar.Show>
      <Sidebar.Show when="collapsed"><IconButton icon="magnifying-glass" label="Search" /></Sidebar.Show>
    </>}
    footer={<>
      <Sidebar.Nav items={PE} label="More" />
      <Sidebar.User avatar={<Avatar fallback="KM" alt="" />} name="Kate Moore" description="Admin"
        action={<IconButton icon="sign-out" label="Log out" size="sm" />} />
    </>}>
    <p>conteúdo do meio</p>
  </Sidebar>
);

describe("4-C · a Sidebar sem topo e pé continua a de sempre", () => {
  test("o mesmo HTML: a lista e o conteúdo direto na caixa, sem o meio nem a classe nova", () => {
    const {container} = wrap(<Sidebar items={ITENS} current="a"><p>extra</p></Sidebar>);
    const aside = container.querySelector("aside.sidebar")!;
    expect(aside).not.toHaveClass("sidebar-with-parts");
    expect([...aside.children].map((e) => e.tagName.toLowerCase() + (e.className ? "." + e.className : ""))).toEqual(["nav.sidebar-nav", "p"]);
    expect(aside.querySelector(".sidebar-body, .sidebar-header, .sidebar-footer")).toBeNull();
  });
});

describe("4-C · o topo e o pé fixos", () => {
  test("a ordem é topo, meio (a lista e os filhos) e pé; e a caixa ganha a classe que prende os dois", () => {
    const {container} = wrap(completa());
    const aside = container.querySelector("aside.sidebar")!;
    expect(aside).toHaveClass("sidebar-with-parts");
    expect([...aside.children].map((e) => e.className)).toEqual(["sidebar-header", "sidebar-body", "sidebar-footer"]);
    const meio = aside.querySelector(".sidebar-body")!;
    expect(meio.querySelector(":scope > nav.sidebar-nav")).not.toBeNull();
    expect(meio.textContent).toContain("conteúdo do meio");
  });
  test("só o topo, ou só o pé, também prende", () => {
    const so = (props: object) => wrap(<Sidebar items={ITENS} {...props} />).container.querySelector("aside")!;
    expect([...so({header: <span>t</span>}).children].map((e) => e.className)).toEqual(["sidebar-header", "sidebar-body"]);
    expect([...so({footer: <span>p</span>}).children].map((e) => e.className)).toEqual(["sidebar-body", "sidebar-footer"]);
  });
});

describe("4-C · as partes", () => {
  test("Sidebar.Brand: o logo (escondido do leitor de tela), o nome e o subtítulo; `plain` troca a classe", () => {
    const {container} = wrap(<Sidebar header={<Sidebar.Brand logo="P" name="Acme Plans" description="Workspace" />} />);
    const marca = container.querySelector(".sidebar-brand")!;
    expect(marca.querySelector(".sidebar-brand-logo")).toHaveAttribute("aria-hidden", "true");
    expect(marca.querySelector(".sidebar-brand-name")!.textContent).toBe("Acme Plans");
    expect(marca.querySelector(".sidebar-brand-description")!.textContent).toBe("Workspace");
    expect(marca).not.toHaveClass("sidebar-brand-plain");
    const solta = wrap(<Sidebar header={<Sidebar.Brand variant="plain" logo="★" name="Acme" />} />).container.querySelector(".sidebar-brand")!;
    expect(solta).toHaveClass("sidebar-brand-plain");
    expect(solta.querySelector(".sidebar-brand-description")).toBeNull();
  });
  test("Sidebar.User: a foto, o nome, o papel e a ação, na caixinha", () => {
    const {container, getByRole} = wrap(completa());
    const pessoa = container.querySelector(".sidebar-user")!;
    expect(pessoa.querySelector(".avatar")).not.toBeNull();
    expect(pessoa.querySelector(".sidebar-user-name")!.textContent).toBe("Kate Moore");
    expect(pessoa.querySelector(".sidebar-user-description")!.textContent).toBe("Admin");
    expect(pessoa.contains(getByRole("button", {name: "Log out"}))).toBe(true);
  });
  test("Sidebar.Nav: uma segunda lista com a pele da lateral e o nome dela, que não repete o da principal", () => {
    const {getByRole, getAllByRole} = wrap(completa());
    const mais = getByRole("navigation", {name: "More"});
    expect(mais).toHaveClass("sidebar-nav");
    expect(mais.querySelectorAll(".sidebar-item")).toHaveLength(2);
    const nomes = getAllByRole("navigation").map((n) => n.getAttribute("aria-label"));
    expect(new Set(nomes).size).toBe(nomes.length);
  });
  test("Sidebar.Show: aberta, a busca; recolhida, a lupa", () => {
    const aberta = wrap(completa(false));
    expect(aberta.queryByRole("textbox", {name: "Search"})).not.toBeNull();
    expect(aberta.queryByRole("button", {name: "Search"})).toBeNull();
    aberta.unmount();
    const recolhida = wrap(completa(true));
    expect(recolhida.queryByRole("textbox", {name: "Search"})).toBeNull();
    expect(recolhida.queryByRole("button", {name: "Search"})).not.toBeNull();
  });
  test("recolhida: o nome da marca, o da pessoa e os rótulos da lista do pé vão para o leitor de tela, não somem", () => {
    const {container} = wrap(completa(true));
    expect(container.querySelector(".sidebar-brand-text")).toHaveClass("sr-only");
    expect(container.querySelector(".sidebar-user-text")).toHaveClass("sr-only");
    const rotulos = [...container.querySelectorAll(".sidebar-footer .sidebar-label")];
    expect(rotulos).toHaveLength(2);
    for (const r of rotulos) expect(r).toHaveClass("sr-only");
    expect(container.querySelector(".sidebar-brand-text")!.textContent).toContain("Acme Plans");
  });
});
