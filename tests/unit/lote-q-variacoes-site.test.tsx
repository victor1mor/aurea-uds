// 0.32.0, passo 11 · as VARIANTES que o site novo usa (o Victor, 13/10/2026: "não edite componente nosso,
// deve sempre criar novas variações"):
//   `Sidebar variant="plain"` — a lateral sem caixa (o "On this page" da documentação da referência);
//   `Sidebar scrollbar` — o padrão passou a ser a barra clara que só aparece com o ponteiro em cima (o
//   Victor: "pode alterar o atual para ser claro e sumir a rolagem"); `visible` é o desenho de antes;
//   `AppShell asideVariant` e `sidebarScrollbar` — as duas, pelo shell;
//   `Card variant="outline"` — o cartão da cor de onde está, só com a linha em volta.
// O que o React emite. A pintura (fundo, borda, a barra parada e com o ponteiro) é do `catalog-sweep.spec.ts`
// e do `engine-batch.test.tsx`, que lê as regras do core.
// Provado contra o defeito: na primeira versão desta sessão o "sem caixa" era o PADRÃO da coluna da direita
// (todo `aside` perdia a caixa). Os testes de "sem a prop, nada muda" reprovam nela.
import {render} from "@testing-library/react";
import {AppShell, AureaProvider, Card, Sidebar} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

describe("Sidebar variant=plain e scrollbar", () => {
  test("plain leva a própria classe; sem a prop, a flutuante de sempre", () => {
    const {container, rerender} = wrap(<Sidebar variant="plain" aria-label="Lado">x</Sidebar>);
    expect(container.querySelector("aside")).toHaveClass("sidebar", "sidebar-plain");
    rerender(<AureaProvider><Sidebar aria-label="Lado">x</Sidebar></AureaProvider>);
    expect(container.querySelector("aside")!.className).toBe("sidebar");
  });
  test("scrollbar=visible leva a classe do desenho de antes; o padrão (hover) é a regra da própria .sidebar", () => {
    const {container, rerender} = wrap(<Sidebar scrollbar="visible" aria-label="Lado">x</Sidebar>);
    expect(container.querySelector("aside")).toHaveClass("sidebar", "sidebar-scrollbar-visible");
    rerender(<AureaProvider><Sidebar scrollbar="hover" aria-label="Lado">x</Sidebar></AureaProvider>);
    expect(container.querySelector("aside")!.className).toBe("sidebar");
  });
});

describe("AppShell asideVariant e sidebarScrollbar", () => {
  test("asideVariant=plain tira a caixa SÓ da coluna da direita", () => {
    const {getByRole, container} = wrap(<AppShell brand="Aurea" aside={<p>sumário</p>} asideVariant="plain">conteúdo</AppShell>);
    expect(getByRole("complementary", {name: "On this page"})).toHaveClass("app-shell-aside", "sidebar-plain");
    expect(container.querySelector("#aurea-shell-nav")).not.toHaveClass("sidebar-plain");
  });
  test("sem asideVariant, a coluna da direita segue a da esquerda, como antes", () => {
    const {getByRole} = wrap(<AppShell brand="Aurea" sidebarVariant="flush" aside={<p>sumário</p>}>conteúdo</AppShell>);
    const lado = getByRole("complementary", {name: "On this page"});
    expect(lado).toHaveClass("sidebar-flush");
    expect(lado).not.toHaveClass("sidebar-plain");
  });
  test("sidebarScrollbar=visible vai para a lateral da esquerda; sem ele, a barra padrão (clara, ao passar)", () => {
    const {container, rerender} = wrap(<AppShell brand="Aurea" sidebarScrollbar="visible">conteúdo</AppShell>);
    expect(container.querySelector("#aurea-shell-nav")).toHaveClass("sidebar-scrollbar-visible");
    rerender(<AureaProvider><AppShell brand="Aurea">conteúdo</AppShell></AureaProvider>);
    expect(container.querySelector("#aurea-shell-nav")).not.toHaveClass("sidebar-scrollbar-visible");
  });
});

describe("Card variant=outline", () => {
  test("leva a classe card-outline; o padrão continua o base", () => {
    const {container, rerender} = wrap(<Card variant="outline" data-testid="c">x</Card>);
    expect(container.querySelector("[data-testid=c]")).toHaveClass("card", "card-outline");
    rerender(<AureaProvider><Card data-testid="c">x</Card></AureaProvider>);
    expect(container.querySelector("[data-testid=c]")!.className).toBe("card");
  });
});
