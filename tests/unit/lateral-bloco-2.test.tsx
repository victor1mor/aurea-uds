// O BLOCO 2 (0.44.0) — a lateral inteira: o que faltava das quinze laterais aprovadas pelo Victor em 21/10/2026 (item 107),
// as alternativas do item atual (item 101) e o 2-A (o item 102 e o achado 13 do item 106). O que o React desenha e o estado;
// a medida (a cápsula, a largura da trilha, o fio a 16, a lateral solta até o topo) é do `tests/visual/lateral-bloco-2.spec.ts`.
// Provado contra o defeito: com a `Sidebar` e o `AppShell` da 0.43.0 (`navigation-client.tsx` e `layout-client.tsx` do
// `main`), reprovam 16 de 17 — passa só o de controle "sem as props novas, a lateral de sempre".
import {act, fireEvent, render, screen} from "@testing-library/react";
import {AppShell, AureaProvider, BottomNav, IconButton, Kbd, Sidebar, useSidebar, type SidebarEntry} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);
const ITENS: SidebarEntry[] = [
  {id: "home", label: "Home", icon: "house", href: "#home"},
  {id: "tasks", label: "Tasks", icon: "check-square", href: "#tasks"},
];
const ctrlB = (alvo: EventTarget = window) => act(() => { alvo.dispatchEvent(new KeyboardEvent("keydown", {key: "b", ctrlKey: true, bubbles: true})); });

describe("bloco 2 · sem nada novo, a lateral é a de sempre (controle)", () => {
  test("sem as props novas, nenhuma classe nova e a lista numa só", () => {
    const {container} = wrap(<Sidebar items={ITENS} current="tasks" />);
    const aside = container.querySelector("aside.sidebar")!;
    expect(aside.className).toBe("sidebar");
    expect(aside.querySelectorAll("ul.sidebar-list")).toHaveLength(1);
  });
  test("o AppShell sem sidebarCollapsible não põe provedor: o Sidebar.Toggle não desenha nada", () => {
    const {container} = wrap(<AppShell brand={<b>A</b>} navItems={ITENS}><Sidebar.Toggle /></AppShell>);
    expect(container.querySelector(".sidebar-collapse-trigger")).toBeNull();
  });
});

describe("4-E · a divisória e a foto do item", () => {
  test("\"separator\" parte a lista em duas, com o vão entre elas", () => {
    const {container} = wrap(<Sidebar items={[...ITENS, "separator", {id: "help", label: "Help", icon: "lifebuoy", href: "#help"}]} />);
    const listas = container.querySelectorAll("nav.sidebar-nav > ul.sidebar-list");
    expect(listas).toHaveLength(2);
    expect(listas[0].nextElementSibling).toHaveClass("sidebar-separator");
    expect(container.querySelector(".sidebar-separator")).toHaveAttribute("aria-hidden", "true");
  });
  test("avatar toma o lugar do ícone, e fica na trilha", () => {
    const item: SidebarEntry = {id: "catalog", label: "Catalog", avatar: {fallback: "CA"}, icon: "folder", href: "#c", badge: <Kbd>⌘1</Kbd>};
    for (const collapsed of [false, true]) {
      const {container, unmount} = wrap(<Sidebar collapsed={collapsed} items={[item]} />);
      const linha = container.querySelector(".sidebar-item")!;
      expect(linha.querySelector(".sidebar-avatar")?.textContent).toBe("CA");
      expect(linha.querySelector("svg.icon")).toBeNull();
      unmount();
    }
  });
  test("a barra de baixo, com a mesma lista, ignora a divisória", () => {
    const {container} = wrap(<BottomNav items={[...ITENS, "separator", {id: "x", label: "X", icon: "gear", href: "#x"}]} />);
    expect(container.querySelectorAll(".bottom-nav-item")).toHaveLength(3);
  });
});

describe("4-D · a ação e o grupo que dobra", () => {
  const acao = <IconButton icon="dots-three" label="Tasks options" size="xs" />;
  test("a ação mora ao lado do link, nunca dentro; recolhida, some", () => {
    const {container, rerender} = wrap(<Sidebar items={[{id: "t", label: "Tasks", icon: "check-square", href: "#t", action: acao}]} />);
    const li = container.querySelector("li.sidebar-item-with-action")!;
    const link = li.querySelector("a.sidebar-item")!;
    const botao = screen.getByRole("button", {name: "Tasks options"});
    expect(link.contains(botao)).toBe(false);
    expect(li.querySelector(":scope > .sidebar-item-action")?.contains(botao)).toBe(true);
    rerender(<AureaProvider><Sidebar collapsed items={[{id: "t", label: "Tasks", icon: "check-square", href: "#t", action: acao}]} /></AureaProvider>);
    expect(screen.queryByRole("button", {name: "Tasks options"})).toBeNull();
  });
  test("o grupo com collapsible vira botão com aria-expanded, e a lista fica com hidden quando fecha", () => {
    wrap(<Sidebar items={[{id: "file", label: "File", collapsible: true, action: <IconButton icon="plus" label="Add to File" size="xs" />,
      items: [{id: "s", label: "Store", icon: "storefront", href: "#s"}]}]} />);
    const nome = screen.getByRole("button", {name: "File"});
    expect(nome).toHaveAttribute("aria-expanded", "true");
    const lista = document.getElementById(nome.getAttribute("aria-controls")!)!;
    expect(lista.hidden).toBe(false);
    expect(screen.getByRole("button", {name: "Add to File"})).toBeInTheDocument();
    fireEvent.click(nome);
    expect(nome).toHaveAttribute("aria-expanded", "false");
    expect(lista.hidden).toBe(true);
  });
  test("defaultOpen={false} começa fechado", () => {
    wrap(<Sidebar items={[{id: "a", label: "Archive", collapsible: true, defaultOpen: false, items: [{id: "o", label: "Old", href: "#o"}]}]} />);
    expect(screen.getByRole("button", {name: "Archive"})).toHaveAttribute("aria-expanded", "false");
  });
});

describe("2-A · a sublista some na trilha (o achado 13 do item 106)", () => {
  test("recolhida, o subitem sem ícone não vira botão vazio: a sublista não é desenhada", () => {
    const pai: SidebarEntry = {id: "r", label: "Reports", icon: "chart-bar", href: "#r", items: [{id: "m", label: "Monthly", href: "#m"}]};
    const aberta = wrap(<Sidebar items={[pai]} />);
    expect(aberta.container.querySelector(".sidebar-sub")).not.toBeNull();
    aberta.unmount();
    const {container} = wrap(<Sidebar collapsed items={[pai]} />);
    expect(container.querySelector(".sidebar-sub")).toBeNull();
    expect(container.querySelectorAll(".sidebar-item")).toHaveLength(1);
  });
});

describe("4-A e 4-H · o jeito de recolher e o item atual", () => {
  test("collapsible e indicator viram classes da caixa; o padrão não põe nenhuma", () => {
    const {container} = wrap(<>
      <Sidebar collapsible="capsule" collapsed items={ITENS} label="a" />
      <Sidebar collapsible="offcanvas" collapsed items={ITENS} label="b" />
      <Sidebar indicator="segment-dot" items={ITENS} current="tasks" label="c" />
    </>);
    const [a, b, c] = container.querySelectorAll("aside");
    expect(a).toHaveClass("sidebar-collapsed", "sidebar-collapse-capsule");
    expect(b).toHaveClass("sidebar-collapsed", "sidebar-collapse-offcanvas");
    expect(c).toHaveClass("sidebar-indicator-segment-dot");
  });
});

describe("4-B · o estado solto: Sidebar.Provider, Sidebar.Toggle, useSidebar e o Ctrl+B", () => {
  function Estado() { const s = useSidebar(); return <output>{s ? String(s.collapsed) : "fora"}</output>; }
  test("o botão e o Ctrl+B recolhem e abrem; o botão aponta para a lateral", () => {
    const {container} = wrap(<Sidebar.Provider><Sidebar items={ITENS} /><Sidebar.Toggle /><Estado /></Sidebar.Provider>);
    const aside = container.querySelector("aside")!;
    const botao = container.querySelector(".sidebar-collapse-trigger")!;
    expect(botao).toHaveAttribute("aria-controls", aside.id);
    expect(botao).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(botao);
    expect(aside).toHaveClass("sidebar-collapsed");
    expect(screen.getByRole("status").textContent).toBe("true");
    ctrlB();
    expect(aside).not.toHaveClass("sidebar-collapsed");
  });
  test("o Ctrl+B não age onde se digita (a divergência da referência), nem com shortcut={false}", () => {
    const {container} = wrap(<Sidebar.Provider><Sidebar items={ITENS} /><input aria-label="Note" /></Sidebar.Provider>);
    const aside = container.querySelector("aside")!;
    ctrlB(screen.getByRole("textbox", {name: "Note"}));
    expect(aside).not.toHaveClass("sidebar-collapsed");
    const outro = wrap(<Sidebar.Provider shortcut={false}><Sidebar items={ITENS} label="x" /></Sidebar.Provider>);
    ctrlB();
    expect(outro.container.querySelector("aside")).not.toHaveClass("sidebar-collapsed");
  });
  test("o Sidebar.Toggle como linha e o useSidebar fora de um provedor", () => {
    wrap(<><Sidebar.Provider><Sidebar items={ITENS} footer={<Sidebar.Toggle variant="item" />} /></Sidebar.Provider><Estado /></>);
    expect(screen.getByRole("button", {name: "Collapse sidebar"})).toHaveClass("sidebar-item", "sidebar-toggle-item");
    expect(screen.getByRole("status").textContent).toBe("fora");
  });
  test("a marca com a ação: o botão de recolher dentro da lateral", () => {
    const {container} = wrap(<Sidebar.Provider><Sidebar items={ITENS} header={<Sidebar.Brand logo="A" name="Acme" action={<Sidebar.Toggle />} />} /></Sidebar.Provider>);
    expect(container.querySelector(".sidebar-brand-with-action .sidebar-collapse-trigger")).not.toBeNull();
  });
});

describe("4-B · o AppShell usa o mesmo provedor", () => {
  test("sidebarCollapsible com o jeito; sidebarToggle=\"none\" tira o botão da junção; o Sidebar.Toggle de dentro manda", () => {
    const {container} = wrap(<AppShell brand={<b>A</b>} navItems={ITENS} sidebarCollapsible="capsule" sidebarToggle="none" sidebarIndicator="subtle">
      <Sidebar.Toggle />
    </AppShell>);
    const aside = container.querySelector("aside.sidebar")!;
    expect(aside).toHaveClass("sidebar-collapse-capsule", "sidebar-indicator-subtle");
    expect(container.querySelector(".sidebar-toggle-slot")).toBeNull();
    fireEvent.click(container.querySelector(".sidebar-collapse-trigger")!);
    expect(aside).toHaveClass("sidebar-collapsed");
    ctrlB();
    expect(aside).not.toHaveClass("sidebar-collapsed");
  });
});

describe("4-F e 4-G · a trilha das seções e o painel", () => {
  const SECOES: SidebarEntry[] = [
    {id: "s1", label: "Home", icon: "house", items: [{id: "orders", label: "Orders", icon: "receipt", href: "#o"}]},
    {id: "s2", label: "Dashboard", icon: "chart-bar", items: [{id: "analytics", label: "Analytics", icon: "chart-line", href: "#a"}]},
  ];
  test("docked: a seção da página atual leva aria-current=\"true\", e escolher outra troca a lista do painel", () => {
    const {container} = wrap(<Sidebar panel="docked" items={SECOES} current="orders" label="Sections" />);
    const painel = container.querySelector(".sidebar-panel")!;
    expect(painel.textContent).toContain("Orders");
    const casa = screen.getByRole("button", {name: "Home"});
    expect(casa).toHaveAttribute("aria-current", "true");
    expect(casa).toHaveAttribute("aria-controls", painel.id);
    fireEvent.click(screen.getByRole("button", {name: "Dashboard"}));
    expect(painel.textContent).toContain("Analytics");
  });
  test("overlay: o painel não fica na tela; o ícone abre a lista numa janelinha", async () => {
    const {container} = wrap(<Sidebar panel="overlay" items={SECOES} current="orders" label="Sections" />);
    expect(container.querySelector(".sidebar-panel")).toBeNull();
    fireEvent.click(screen.getByRole("button", {name: "Dashboard"}));
    expect(await screen.findByRole("link", {name: "Analytics"})).toBeInTheDocument();
    expect(document.querySelector(".sidebar-flyout")).not.toBeNull();
  });
});
