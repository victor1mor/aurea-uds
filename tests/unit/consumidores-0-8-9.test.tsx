import {render, screen} from "@testing-library/react";
import {AppShell, AureaProvider, Field, Input, Sidebar} from "../../packages/react/src/index";

// A 0.8.9 conserta as DUAS regressões que a 0.8.8 criou num app real (24/09/2026). A escala de
// letras nova (ADR-0049) não inventou defeito: ela expôs dois que já estavam na fila, a A-03 e a
// C-10, e a correção é a deles. Cada `expect` aqui REPROVAVA na 0.8.8.

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

// A-03 · quem usava a lista declarativa tinha de aninhar um Sidebar no Sidebar do shell: duas
// caixas, e com a letra maior a de dentro cortava o texto.
describe("A-03 · a lista da lateral entra pelo AppShell", () => {
  const ITENS = [{id: "todos", label: "Todos os itens", badge: "12"}, {id: "relatorios", label: "Relatórios", badge: "3"}];

  test("navItems vira a lista do Sidebar do shell — UMA lateral, não duas", () => {
    const {container} = wrap(<AppShell brand="A" navItems={ITENS} currentNavId="relatorios">conteúdo</AppShell>);
    expect(container.querySelectorAll("aside.sidebar")).toHaveLength(1);
    expect(container.querySelectorAll("aside.sidebar aside.sidebar")).toHaveLength(0);
    const atual = screen.getByRole("button", {name: /Relatórios/, hidden: true});
    expect(atual).toHaveAttribute("aria-current", "page");
    expect(atual.closest("aside")).toHaveAttribute("id", "aurea-shell-nav");
  });

  test("navLabel nomeia a navegação; navigation continua valendo e vem depois da lista", () => {
    const {container} = wrap(<AppShell brand="A" navItems={ITENS} navLabel="Categorias"
      navigation={<p>Rodapé da lateral</p>}>conteúdo</AppShell>);
    expect(screen.getByRole("navigation", {name: "Categorias", hidden: true})).toBeInTheDocument();
    const aside = container.querySelector("aside.sidebar")!;
    expect(aside.lastElementChild).toHaveTextContent("Rodapé da lateral");
  });

  test("sem navItems, o AppShell é o de antes: só navigation", () => {
    const {container} = wrap(<AppShell brand="A" navigation={<Sidebar items={ITENS} />}>x</AppShell>);
    expect(container.querySelectorAll("aside.sidebar aside.sidebar")).toHaveLength(1);   // o aninhamento continua possível
    expect(container.querySelector("#aurea-shell-nav > nav.sidebar-nav")).toBeNull();
  });
});

// C-10 · no Field horizontal a coluna do rótulo era 192px fixos, sem prop. Num telefone o campo
// ficava com 85px e o valor escolhido sumia.
describe("C-10 · Field horizontal com largura de rótulo", () => {
  const campo = (props: Record<string, unknown>) => {
    const {container} = wrap(<Field label="Ordenar" orientation="horizontal" {...props}><Input /></Field>);
    return container.querySelector<HTMLElement>(".field")!;
  };

  test('labelWidth="auto" faz a coluna do tamanho do rótulo', () => {
    expect(campo({labelWidth: "auto"}).style.getPropertyValue("--field-label-width")).toBe("max-content");
  });

  test("uma medida CSS vale como veio", () => {
    expect(campo({labelWidth: "8rem"}).style.getPropertyValue("--field-label-width")).toBe("8rem");
  });

  test("sem a prop, nada é escrito — os 12rem do core continuam o padrão", () => {
    expect(campo({}).style.getPropertyValue("--field-label-width")).toBe("");
  });

  test("o style do consumidor não se perde", () => {
    const f = campo({labelWidth: "auto", style: {marginTop: "4px"}});
    expect(f.style.marginTop).toBe("4px");
    expect(f.style.getPropertyValue("--field-label-width")).toBe("max-content");
  });
});
