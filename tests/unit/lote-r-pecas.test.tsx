// 15/10/2026 · o passo 4 do lote (o Victor: "A, B, C, pode"): as peças que a vitrine da referência usa e a Aurea não
// tinha, como VARIAÇÕES das peças da casa. O que o React emite; a medida (vãos, cores, tamanhos) é dos testes de navegador.
// Provado contra o defeito: na 0.32.0 não há `RadioGroup` na web, nem `description` no `Radio`/`Switch`, nem `groupSize`
// no `OTPField`, nem `Card.Header…Footer`, nem `action` no `Alert`, nem `kbd` no item da `ListBox`, nem `tone` no `Avatar`.
import {fireEvent, render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, test, vi} from "vitest";
import {Alert, AureaProvider, Avatar, Card, ListBox, OTPField, Radio, RadioGroup, Switch} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);

describe("RadioGroup (web)", () => {
  test("um grupo de opções com nome, descrição e as opções nativas com o mesmo nome", async () => {
    const {container} = wrap(<RadioGroup label="Plano" description="Escolha um" defaultValue="pro">
      <RadioGroup.Item value="basico" label="Básico" description="Para começar" />
      <Radio value="pro" label="Pro" />
    </RadioGroup>);
    const grupo = screen.getByRole("radiogroup", {name: "Plano"});
    expect(grupo).toHaveAccessibleDescription("Escolha um");
    const [basico, pro] = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(basico.name).toBe(pro.name);
    expect(basico.name).not.toBe("");
    expect(pro).toBeChecked();
    expect((await axe(container)).violations.map((v) => v.id)).toEqual([]);
  });
  test("escolher avisa com o valor; controlado, quem manda é o valor de fora", () => {
    const aviso = vi.fn();
    wrap(<RadioGroup label="Plano" value="pro" onValueChange={aviso}><Radio value="basico" label="Básico" /><Radio value="pro" label="Pro" /></RadioGroup>);
    fireEvent.click(screen.getByRole("radio", {name: "Básico"}));
    expect(aviso).toHaveBeenCalledWith("basico");
    expect(screen.getByRole("radio", {name: "Pro"})).toBeChecked();
  });
  test("horizontal põe as opções numa linha; com erro, todas inválidas", () => {
    const {container} = wrap(<RadioGroup label="Plano" orientation="horizontal" error="Escolha um"><Radio value="a" label="A" /><Radio value="b" label="B" /></RadioGroup>);
    expect(container.querySelector(".radio-group")).toHaveClass("radio-group-horizontal");
    expect(container.querySelectorAll(".radio-group-items > .radio")).toHaveLength(2);
    expect(screen.getAllByRole("radio").every((r) => r.getAttribute("aria-invalid") === "true")).toBe(true);
  });
});

describe("description no Radio e no Switch", () => {
  test("com descrição, o nome em destaque e a linha apagada; sem ela, a marcação de antes", () => {
    const {container} = wrap(<><Switch label="Avisos" description="Receber no celular" /><Switch label="Só" /><Radio label="R" description="d" /></>);
    const [com, sem] = [...container.querySelectorAll(".switch")];
    expect(com.querySelector("strong")!.textContent).toBe("Avisos");
    expect(com.querySelector(".muted")!.textContent).toBe("Receber no celular");
    expect(sem.querySelector("strong")).toBeNull();
    expect(container.querySelector(".radio .muted")!.textContent).toBe("d");
  });
});

describe("OTPField com tracinho e fundo neutro", () => {
  test("`groupSize` põe o tracinho a cada N caixas, e não no fim", () => {
    const {container} = wrap(<OTPField length={6} groupSize={3} label="Código" />);
    const filhos = [...container.querySelector(".otp-field")!.children].map((e) => e.classList.contains("otp-separator") ? "-" : "#");
    expect(filhos.join("")).toBe("###-###");
  });
  test("`variant=\"secondary\"` dá às caixas o fundo neutro; sem as props, a marcação de antes", () => {
    const {container} = wrap(<><OTPField length={4} variant="secondary" label="a" /><OTPField length={4} label="b" /></>);
    const [sec, prim] = [...container.querySelectorAll(".otp-field")];
    expect(sec.querySelectorAll(".otp-slot.input-secondary")).toHaveLength(4);
    expect(prim.querySelector(".input-secondary, .otp-separator")).toBeNull();
  });
});

describe("as partes do Card", () => {
  test("cabeçalho com título (h3) e descrição, conteúdo e rodapé", () => {
    const {container} = wrap(<Card><Card.Header><Card.Title>Criar conta</Card.Title><Card.Description>Sete dias grátis</Card.Description></Card.Header>
      <Card.Content>x</Card.Content><Card.Footer><button type="button">Ok</button></Card.Footer></Card>);
    expect(screen.getByRole("heading", {level: 3, name: "Criar conta"})).toHaveClass("card-title");
    expect(container.querySelector(".card > .card-header > p.card-description")!.textContent).toBe("Sete dias grátis");
    expect(container.querySelector(".card > .card-content")).not.toBeNull();
    expect(container.querySelector(".card > .card-footer button")).not.toBeNull();
  });
});

describe("Alert com action", () => {
  test("o botão entra depois do texto e antes do X; sem `action`, a marcação de antes", () => {
    const {container} = wrap(<><Alert title="2 créditos" action={<button type="button">Upgrade</button>} onDismiss={() => {}}>Plano pago</Alert><Alert title="t">c</Alert></>);
    const [com, sem] = [...container.querySelectorAll(".alert")];
    expect(com).toHaveClass("alert-has-action");
    expect([...com.children].map((e) => e.className || e.tagName)).toContain("alert-action");
    const ordem = [...com.children].map((e) => e.classList.contains("alert-action") ? "acao" : e.classList.contains("close-button") ? "x" : e.tagName);
    expect(ordem.indexOf("acao")).toBeLessThan(ordem.indexOf("x"));
    expect(sem).not.toHaveClass("alert-has-action");
  });
});

describe("ListBox com atalho", () => {
  test("o `kbd` do item sai no fim da linha", () => {
    const {container} = wrap(<ListBox label="Ações" selectionMode="none" items={[{id: "n", label: "Novo", kbd: "⌘N"}, {id: "e", label: "Editar"}]} />);
    const [novo, editar] = [...container.querySelectorAll(".list-box-item")];
    expect(novo.lastElementChild).toHaveClass("list-box-item-kbd");
    expect(novo.querySelector("kbd")!.textContent).toBe("⌘N");
    expect(editar.querySelector("kbd")).toBeNull();
  });
});

describe("Avatar com tom e soft", () => {
  test("o tom e o `soft` saem como classe; sem eles, a marcação de antes", () => {
    const {container} = wrap(<><Avatar tone="warning" emphasis="soft" fallback="D" /><Avatar fallback="A" /></>);
    const [cor, comum] = [...container.querySelectorAll(".avatar")];
    expect(cor).toHaveClass("avatar-tone-warning", "avatar-soft");
    expect(comum.className).toBe("avatar");
  });
});
