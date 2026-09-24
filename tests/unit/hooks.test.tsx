import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AureaProvider, Button, Icon, ptBR, useAureaStrings, useSpriteUrl, useToast,
} from "../../packages/react/src/index";

// Os três hooks públicos da biblioteca. Eles existiam, funcionavam e **não estavam declarados em
// lugar nenhum** — sem ficha, sem página, sem exemplo. Não era buraco do toast: era uma espécie
// de superfície que o registry não modelava (G-DX-01 da ATIVIDADE-2).
//
// O caso mais caro era o `useToast`: o catálogo já CITAVA o toast para explicar o `Alert`
// ("an Alert stays put; a Toast would vanish") e não tinha para onde apontar.
//
// O que se cobra aqui é o contrato de cada um, não a existência. Hook que só existe passa em
// qualquer teste.

// ── useToast ───────────────────────────────────────────────────────────────

function Disparador({tipo}: {tipo?: "success" | "danger"}) {
  const toast = useToast();
  return <Button onClick={() => toast.add({title: "Salvo", description: "Tudo certo", type: tipo})}>
    Salvar
  </Button>;
}

test("useToast: o aviso aparece depois da ação, e não antes", async () => {
  const user = userEvent.setup();
  render(<AureaProvider><main><Disparador /></main></AureaProvider>);
  expect(screen.queryByText("Salvo"), "toast não pode existir antes de alguém pedir").toBeNull();
  await user.click(screen.getByRole("button", {name: "Salvar"}));
  expect(await screen.findByText("Salvo")).toBeTruthy();
  expect(screen.getByText("Tudo certo")).toBeTruthy();
});

// O aviso é uma região viva: ele é ANUNCIADO sem roubar o foco de quem está trabalhando. Um
// toast que puxa o foco interrompe a tarefa em curso, e é o erro clássico do componente.
test("useToast: anuncia sem roubar o foco", async () => {
  const user = userEvent.setup();
  render(<AureaProvider><main><Disparador /></main></AureaProvider>);
  const gatilho = screen.getByRole("button", {name: "Salvar"});
  await user.click(gatilho);
  await screen.findByText("Salvo");
  expect(document.activeElement, "o foco tem de continuar em quem disparou").toBe(gatilho);
});

test("useToast: o tipo chega ao DOM, para a pele saber o que pintar", async () => {
  const user = userEvent.setup();
  const {container} = render(<AureaProvider><main><Disparador tipo="danger" /></main></AureaProvider>);
  await user.click(screen.getByRole("button", {name: "Salvar"}));
  await screen.findByText("Salvo");
  expect(container.ownerDocument.querySelector(".toast-danger")).not.toBeNull();
});

// ── useAureaStrings ────────────────────────────────────────────────────────

function MostraTexto() {
  const s = useAureaStrings();
  return <p data-testid="texto">{s.loading}</p>;
}

test("useAureaStrings: devolve o dicionário QUE O PROVIDER está usando", () => {
  const {rerender} = render(<AureaProvider><MostraTexto /></AureaProvider>);
  expect(screen.getByTestId("texto").textContent).toBe("Loading");
  rerender(<AureaProvider strings={ptBR}><MostraTexto /></AureaProvider>);
  expect(screen.getByTestId("texto").textContent, "trocar o dicionário tem de chegar ao hook")
    .toBe("Carregando");
});

// A razão de o hook ser público: quem escreve um componente próprio sobre a Aurea traduz os
// rótulos DELE pelo mesmo dicionário, em vez de manter uma segunda tabela de idiomas.
test("useAureaStrings: aceita dicionário parcial, e o resto continua vindo do padrão", () => {
  render(<AureaProvider strings={{loading: "Só um instante"}}><MostraTexto /></AureaProvider>);
  expect(screen.getByTestId("texto").textContent).toBe("Só um instante");
});

// ── useSpriteUrl ───────────────────────────────────────────────────────────

function MostraSprite() {
  const url = useSpriteUrl();
  return <p data-testid="sprite">{url}</p>;
}

test("useSpriteUrl: devolve de onde o provider carrega os glifos", () => {
  const {rerender} = render(<AureaProvider><MostraSprite /></AureaProvider>);
  expect(screen.getByTestId("sprite").textContent).toBe("/aurea-icons.svg");
  rerender(<AureaProvider spriteUrl="/cdn/aurea.svg"><MostraSprite /></AureaProvider>);
  expect(screen.getByTestId("sprite").textContent).toBe("/cdn/aurea.svg");
});

// E o valor que o hook devolve é o MESMO que o `Icon` usa. Se os dois divergirem, quem monta um
// glifo à mão aponta para um sprite e o componente aponta para outro.
test("useSpriteUrl: é a mesma origem que o Icon usa", () => {
  const {container} = render(
    <AureaProvider spriteUrl="/cdn/aurea.svg">
      <MostraSprite />
      <Icon name="checkmark" />
    </AureaProvider>,
  );
  const doHook = screen.getByTestId("sprite").textContent;
  const doIcone = container.querySelector("use")?.getAttribute("href");
  // O `i-` é a convenção de id DENTRO do sprite, e é do `Icon`; o hook devolve só a origem. O
  // que este teste amarra é a ORIGEM ser a mesma nos dois, que é o que quebraria se um lado
  // passasse a ler outro contexto.
  expect(doIcone).toBe(`${doHook}#i-checkmark`);
  expect(doIcone!.startsWith(doHook!)).toBe(true);
});
