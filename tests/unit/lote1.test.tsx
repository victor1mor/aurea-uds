import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {
  AureaProvider, HoverCard, Icon, NumberField, OTPField, Spinner, Toggle,
} from "../../packages/react/src/index";

// Lote 1 do BUILDING.md — os cinco em que o Base UI entrega o comportamento e a Aurea entrega
// a pele. O que se testa aqui é o CONTRATO que a nossa camada promete, não o motor: o motor tem
// os testes dele. Ou seja: o nome acessível existe, o estado é anunciado, e as decisões que
// TOMAMOS (rótulo obrigatório sem texto visível, papel do spinner, `length` do OTP) valem.

const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);

async function semViolacao(el: Element) {
  const {violations} = await axe(el);
  if (violations.length) throw new Error("axe: " + violations.map(v => v.id).join(", "));
}

describe("Toggle", () => {
  test("anuncia o estado por aria-pressed, e o motor o mantém", async () => {
    wrap(<Toggle icon="favorite" label="Favourite" />);
    const b = screen.getByRole("button", {name: "Favourite"});
    // aria-pressed é o que faz um botão de dois estados EXISTIR para leitor de tela; sem ele
    // é um botão comum que muda de cor.
    expect(b).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(b);
    expect(b).toHaveAttribute("aria-pressed", "true");
  });

  test("com texto visível, o texto É o nome — não duplica com label", () => {
    wrap(<Toggle label="ignorado">Bold</Toggle>);
    expect(screen.getByRole("button", {name: "Bold"})).toBeInTheDocument();
  });

  test("desabilitado não alterna", async () => {
    wrap(<Toggle icon="pin" label="Pin" disabled />);
    const b = screen.getByRole("button", {name: "Pin"});
    await userEvent.click(b);
    expect(b).toHaveAttribute("aria-pressed", "false");
  });

  // AUD-0003 (12/08/2026). O cabeçalho deste arquivo já dizia que "rótulo obrigatório sem texto
  // visível" era testado aqui, e NÃO era: os três testes acima passam `label`, então nenhum
  // exercia a ausência. `label` era opcional no tipo e `<Toggle icon="x"/>` compilava, produzindo
  // um botão focável sem nome nenhum.
  //
  // Este teste não prova o tipo porque os testes não entram no tsconfig do pacote. As invariantes
  // de tipo vivem ao lado de ToggleProps, no source que o build compila; esta tabela é o
  // contrapeso runtime para consumidor JavaScript e para estruturas que o tipo aceita.
  test.each([
    ["false", false],
    ["array vazio", []],
    ["Fragment vazio", <></>],
    ["texto vazio", ""],
    ["ícone decorativo", <Icon name="checkmark" />],
    ["elemento aria-hidden", <span aria-hidden="true">Oculto</span>],
  ])("AUD-0003: children %s sem label avisa alto", (_caso, children) => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    const semNome = {icon: "checkmark", children} as unknown as React.ComponentProps<typeof Toggle>;
    const {unmount} = wrap(<Toggle {...semNome} />);
    expect(erro).toHaveBeenCalledWith(expect.stringContaining("nome acessível"));
    // e o botão realmente está anônimo — é o dano que o aviso denuncia
    expect(screen.getByRole("button")).toHaveAccessibleName("");
    unmount();
    erro.mockRestore();
  });

  test("com label e sem children, o nome vem do label — o caso legítimo do ícone-only", () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    wrap(<Toggle icon="favorite" label="Favourite" />);
    expect(screen.getByRole("button", {name: "Favourite"})).toBeInTheDocument();
    // o aviso NÃO pode disparar aqui, senão ele viraria ruído que ninguém lê
    expect(erro).not.toHaveBeenCalled();
    erro.mockRestore();
  });

  test("texto aninhado continua sendo o nome e não dispara o aviso", () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    wrap(<Toggle><strong>Bold</strong></Toggle>);
    expect(screen.getByRole("button", {name: "Bold"})).toBeInTheDocument();
    expect(erro).not.toHaveBeenCalled();
    erro.mockRestore();
  });

  test.each(["", "   "])("label vazio ou só espaço também denuncia o botão anônimo", label => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    const {unmount} = wrap(<Toggle icon="favorite" label={label} />);
    expect(erro).toHaveBeenCalledWith(expect.stringContaining("nome acessível"));
    expect(screen.getByRole("button")).toHaveAccessibleName("");
    unmount();
    erro.mockRestore();
  });
});

describe("Spinner", () => {
  test("quem espera ouve que está esperando", async () => {
    const {container} = wrap(<Spinner label="Loading results" />);
    expect(screen.getByRole("status", {name: "Loading results"})).toBeInTheDocument();
    await semViolacao(container);
  });

  test("sem rótulo, usa o do provider — nunca fica mudo", () => {
    wrap(<Spinner />);
    expect(screen.getByRole("status", {name: "Loading"})).toBeInTheDocument();
  });

  test("decorativo some da árvore: dentro de um controle que já anuncia, dois anúncios é ruído", () => {
    wrap(<Spinner decorative />);
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("NumberField", () => {
  // MEDIDO em 31/07/2026, e contraria o que eu tinha escrito na ficha: o motor NÃO usa
  // `role="spinbutton"`. Ele renderiza `type="text"` com `inputMode="numeric"` e
  // `aria-roledescription="Number field"` — escolha deliberada, porque o input numérico nativo
  // traz setas minúsculas, alteração por roda do mouse e nenhuma leitura de locale. A ficha foi
  // corrigida pelo medido, não o contrário.
  test("é um campo de texto numérico com nome, e as setas movem o valor", async () => {
    wrap(<NumberField defaultValue={1} min={0} max={3} label="Quantity" />);
    const f = screen.getByRole("textbox", {name: "Quantity"});
    f.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(f).toHaveValue("2");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(f).toHaveValue("0");
  });

  test("os dois controles têm nome — um botão só com sinal não se anuncia", () => {
    wrap(<NumberField defaultValue={1} label="Quantity" />);
    expect(screen.getByRole("button", {name: "Increase"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Decrease"})).toBeInTheDocument();
  });

  test("respeita o limite: não passa do max", async () => {
    wrap(<NumberField defaultValue={3} max={3} label="Quantity" />);
    const f = screen.getByRole("textbox", {name: "Quantity"});
    f.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(f).toHaveValue("3");
  });
});

describe("OTPField", () => {
  test("uma caixa por dígito, e o número de caixas é o length", () => {
    const {container} = wrap(<OTPField length={6} label="Verification code" />);
    expect(container.querySelectorAll(".otp-slot")).toHaveLength(6);
  });

  test("digitar avança sozinho para a próxima caixa", async () => {
    const {container} = wrap(<OTPField length={4} label="Code" />);
    const slots = [...container.querySelectorAll<HTMLInputElement>(".otp-slot")];
    slots[0].focus();
    await userEvent.keyboard("12");
    expect(slots[0]).toHaveValue("1");
    expect(slots[1]).toHaveValue("2");
  });

  test("o grupo tem nome acessível — seis campos anônimos não dizem para que servem", () => {
    const {container} = wrap(<OTPField length={4} label="Verification code" />);
    expect(container.querySelector(".otp-field")).toHaveAttribute("aria-label", "Verification code");
  });
});

describe("HoverCard", () => {
  // O conteúdo vive num portal e só existe ao repousar o ponteiro. O que se pode exigir sem
  // simular hover é o que a nossa camada promete: o disparador continua sendo o elemento que
  // o consumidor passou, com a semântica dele intacta.
  test("o disparador é o elemento do consumidor, não um wrapper nosso", () => {
    wrap(<HoverCard trigger={<a href="#curator">Curator</a>}><strong>Curator</strong></HoverCard>);
    const l = screen.getByRole("link", {name: "Curator"});
    expect(l).toHaveAttribute("href", "#curator");
  });

  test("fechado não deixa a prévia no documento", () => {
    wrap(<HoverCard trigger={<a href="#c">C</a>}><strong>Prévia</strong></HoverCard>);
    expect(screen.queryByText("Prévia")).toBeNull();
  });
});
