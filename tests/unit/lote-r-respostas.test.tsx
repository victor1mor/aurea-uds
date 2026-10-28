// 15/10/2026 · as respostas do Victor à bancada do lote R ("A sim, B sim, C sim e também faça como o deles o Ctrl K
// separado, D … pode"). O que o React emite; as MEDIDAS (o vão do ícone ao texto, a linha entre seções) são dos testes
// de navegador. Provado contra o defeito: antes desta rodada o `Switch` não tinha `indicatorPlacement` nem
// `labelHidden`, o `kbd` era um texto só (e o "Ctrl K" chegava ao leitor como DOIS atalhos), o `leadingIcon` não
// aceitava desenho, e a `CommandPaletteShell` não fechava por nenhum caminho.
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {describe, expect, test} from "vitest";
import {AureaProvider, Button, CommandPaletteShell, Radio, RadioGroup, SearchField, Switch} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);

describe("A — Switch com a chave no fim", () => {
  test("`indicatorPlacement=\"end\"` marca a classe; sem a prop, a marcação de antes", () => {
    const {container} = wrap(<><Switch label="Avisos" indicatorPlacement="end" /><Switch label="Outro" /></>);
    const [fim, comum] = [...container.querySelectorAll(".switch")];
    expect(fim).toHaveClass("switch-end");
    expect(comum.className).toBe("switch");
    // o campo continua logo antes da chave: o CSS do estado (`input:checked + .switch-track`) depende disso
    expect(fim.querySelector("input + .switch-track")).not.toBeNull();
  });
});

describe("labelHidden no Switch, no Radio e no RadioGroup", () => {
  test("o nome sai da tela e continua sendo o nome", async () => {
    const {container} = wrap(<>
      <Switch label="Modo escuro" labelHidden />
      <RadioGroup label="Plano" labelHidden orientation="horizontal" defaultValue="b">
        <Radio value="a" label="Opção A" labelHidden /><Radio value="b" label="Opção B" labelHidden />
      </RadioGroup>
    </>);
    expect(screen.getByRole("switch", {name: "Modo escuro"})).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", {name: "Plano"})).toBeInTheDocument();
    expect(screen.getByRole("radio", {name: "Opção A"})).toBeInTheDocument();
    expect(container.querySelector(".switch")).toHaveClass("switch-bare");
    expect(container.querySelector(".radio-group")).toHaveClass("radio-group-bare");
    expect(container.querySelectorAll(".radio.radio-bare")).toHaveLength(2);
    for (const nome of ["Modo escuro", "Plano", "Opção A"]) expect(screen.getByText(nome).closest(".sr-only"), nome).not.toBeNull();
    expect((await axe(container)).violations.map((v) => v.id)).toEqual([]);
  });
});

describe("o Ctrl K separado, como o da referência", () => {
  test("lista: uma caixinha por tecla, e o leitor recebe a COMBINAÇÃO", () => {
    wrap(<Button kbd={["Ctrl", "K"]}>Search</Button>);
    const botao = screen.getByRole("button", {name: /Search/});
    expect([...botao.querySelectorAll("kbd")].map((k) => k.textContent)).toEqual(["Ctrl", "K"]);
    expect(botao).toHaveAttribute("aria-keyshortcuts", "Control+K");
  });
  test("os símbolos do Mac viram os nomes da especificação; texto solto continua como veio", () => {
    wrap(<><Button kbd={["⌘", "⇧", "D"]}>Excluir</Button><Button kbd="⌘K">Abrir</Button></>);
    expect(screen.getByRole("button", {name: /Excluir/})).toHaveAttribute("aria-keyshortcuts", "Meta+Shift+D");
    const abrir = screen.getByRole("button", {name: /Abrir/});
    expect(abrir).toHaveAttribute("aria-keyshortcuts", "⌘K");
    expect(abrir.querySelectorAll("kbd")).toHaveLength(1);
  });
});

describe("D — o desenho do app no encaixe do ícone do Button", () => {
  test("`leadingIcon` aceita um componente que devolve o <svg>", () => {
    const Bolinha = (p: React.SVGProps<SVGSVGElement>) => <svg {...p} data-bolinha="" viewBox="0 0 16 16"><circle cx={8} cy={8} r={7} /></svg>;
    wrap(<Button leadingIcon={Bolinha}>Ember</Button>);
    const desenho = document.querySelector("[data-bolinha]")!;
    expect(desenho).toHaveClass("icon");
    expect(desenho).toHaveAttribute("aria-hidden", "true");
  });
});

describe("C — a CommandPaletteShell fecha", () => {
  const abrir = (avisos: string[]) => wrap(
    <CommandPaletteShell open query="" onQueryChange={() => {}} onClose={() => avisos.push("fechou")}>
      <button type="button">Resultado</button>
    </CommandPaletteShell>);
  test("o campo começa com o foco, e o Esc avisa", async () => {
    const u = userEvent.setup();
    const avisos: string[] = [];
    abrir(avisos);
    // o motor dá o foco inicial um instante depois de abrir
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("searchbox")));
    await u.keyboard("{Escape}");
    expect(avisos).toEqual(["fechou"]);
  });
  test("clicar fora avisa", async () => {
    const u = userEvent.setup();
    const avisos: string[] = [];
    abrir(avisos);
    await u.click(document.querySelector(".command-overlay")!);
    expect(avisos).toEqual(["fechou"]);
  });
  test("o Esc avisa também com o foco fora do campo", async () => {
    const u = userEvent.setup();
    const avisos: string[] = [];
    abrir(avisos);
    await u.click(screen.getByRole("button", {name: "Resultado"}));
    await u.keyboard("{Escape}");
    expect(avisos).toEqual(["fechou"]);
  });
});

describe("a busca tem a medida própria", () => {
  test("o `SearchField` leva a classe da busca, por cima do grupo", () => {
    const {container} = wrap(<SearchField aria-label="Buscar" />);
    expect(container.querySelector(".input-group")).toHaveClass("search-field");
  });
});

// 15/10/2026 — a camada das janelinhas mora no POSICIONADOR do motor (a classe `positioner`): na caixa de dentro ela não
// valia, e o topo fixo do site cortava a borda de cima da escolha de tema. Toda janelinha nova tem de levar a classe.
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
describe("toda janelinha leva a camada no posicionador", () => {
  test("cada `Base…Positioner` aberto tem `className`", () => {
    const dir = join(process.cwd(), "packages/react/src");
    const sem = readdirSync(dir).filter((f) => f.endsWith(".tsx")).flatMap((f) =>
      [...readFileSync(join(dir, f), "utf8").matchAll(/<Base\w+\.Positioner[^>]*>/g)].map((m) => m[0])
        .filter((t) => !/className=/.test(t)).map((t) => `${f}: ${t}`));
    expect(sem).toEqual([]);
  });
});
