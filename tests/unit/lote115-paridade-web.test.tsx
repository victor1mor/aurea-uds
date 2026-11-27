// O lote 115 (27/11/2026) · a paridade web × nativo, a regra do Victor de 24/11/2026: a web ganha o que o nativo tem.
//   · `Timeline` — `icon`, `tone`, `trailing` e `between` no item (no nativo desde a R-18, 02/10/2026): a moldura de 40
//     com o glifo de 20 no lugar do ponto, o tom com o vocabulário do `Badge`, o valor à direita do título e o texto entre
//     um item e o próximo (no último não aparece).
//   · `Combobox` — `description` e `disabled` na opção (no nativo desde a R-14, 01/10/2026).
// Provado contra o defeito: com o código de antes, a `Timeline` ignorava as quatro chaves (só desenhava título, descrição e
// hora) e o `Combobox` desenhava só o rótulo, com toda opção escolhível.
import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, it} from "vitest";
import {Timeline} from "../../packages/react/src/markup.js";
import {AureaProvider, Combobox} from "../../packages/react/src/index";

const raiz = join(__dirname, "..", "..");
const core = readFileSync(join(raiz, "packages/core/src/aurea.css"), "utf8");
const regra = (seletor: string) => {
  const i = core.indexOf(seletor + " {");
  return i < 0 ? "" : core.slice(i, core.indexOf("}", i));
};

const HISTORICO = [
  {title: "Report sent", icon: <svg data-testid="g1" />, tone: "success" as const, trailing: "$1,240", between: "6 days later"},
  {title: "Approved", trailing: "Paid", between: "não aparece: é o último"},
];

describe("Timeline da web · icon, tone, trailing e between", () => {
  it("o item com `icon` troca o ponto pela moldura, com o tom; o sem ícone fica com o ponto", () => {
    const {container} = render(<Timeline items={HISTORICO} />);
    const moldura = container.querySelector(".timeline-icon")!;
    expect(moldura).not.toBeNull();
    expect(moldura.getAttribute("data-tone")).toBe("success");
    expect(moldura.getAttribute("aria-hidden")).toBe("true");
    expect(moldura.querySelector("[data-testid=g1]")).not.toBeNull();
    expect(container.querySelectorAll(".timeline-dot")).toHaveLength(1);
    // Com uma moldura na lista, a lista ganha a coluna de 40.
    expect(container.querySelector("ol")!.className).toContain("timeline-has-icons");
  });
  it("sem nenhum `icon`, a lista de sempre", () => {
    const {container} = render(<Timeline items={[{title: "A"}, {title: "B"}]} />);
    expect(container.querySelector("ol")!.className).toBe("timeline");
    expect(container.querySelector(".timeline-icon")).toBeNull();
  });
  it("`trailing` vai à direita do título, na mesma linha", () => {
    const {container} = render(<Timeline items={HISTORICO} />);
    const linhas = container.querySelectorAll(".timeline-title-row");
    expect(linhas).toHaveLength(2);
    expect(linhas[0].querySelector("strong")!.textContent).toBe("Report sent");
    expect(linhas[0].querySelector(".timeline-trailing")!.textContent).toBe("$1,240");
  });
  it("`between` aparece entre os itens, e nunca no último", () => {
    const {container} = render(<Timeline items={HISTORICO} />);
    const entre = container.querySelectorAll(".timeline-between");
    expect(entre).toHaveLength(1);
    expect(entre[0].textContent).toBe("6 days later");
  });
  it("a folha: moldura de 40 com o glifo de 20, o fundo do tom opaco, e o ponto no centro da coluna", () => {
    const m = regra(".timeline-icon");
    expect(m).toContain("inline-size:var(--space-10)");
    expect(m).toContain("background:var(--muted)");
    // O `primary` (o único tom sem fundo opaco em token) se mistura com a cor do cartão: o trilho não aparece através dele.
    expect(regra('.timeline-icon[data-tone="primary"]')).toContain("var(--surface-1)");
    expect(regra(".timeline-icon > .icon,.timeline-icon > svg")).toContain("var(--icon-md)");
    expect(regra('.timeline-icon[data-tone="success"]')).toContain("var(--success-bg)");
    expect(regra(".timeline-has-icons > li > .timeline-dot")).toContain("(var(--space-10) - var(--space-3)) / 2");
  });
});

const PLANOS = [
  {value: "free", label: "Free", description: "One project"},
  {value: "enterprise", label: "Enterprise", description: "Talk to sales", disabled: true},
  {value: "team", label: "Team"},
];

const abrir = async () => {
  const user = userEvent.setup();
  render(<AureaProvider><Combobox label="Plan" items={PLANOS} /></AureaProvider>);
  await user.click(screen.getByRole("combobox", {name: "Plan"}));
  const opcoes = within(await screen.findByRole("listbox")).getAllByRole("option");
  return Object.fromEntries(opcoes.map((o) => [o.querySelector("[id$='-l']")?.textContent ?? o.textContent, o]));
};

describe("Combobox da web · description e disabled na opção", () => {
  it("a opção com `description` ganha a segunda linha, ligada como descrição; a sem ela fica como era", async () => {
    const o = await abrir();
    const free = o["Free"];
    expect(free.getAttribute("aria-describedby")).toBeTruthy();
    expect(document.getElementById(free.getAttribute("aria-describedby")!)!.textContent).toBe("One project");
    expect(document.getElementById(free.getAttribute("aria-labelledby")!)!.textContent).toBe("Free");
    expect(free.querySelector(".menu-item-description")).not.toBeNull();
    expect(o["Team"].querySelector(".menu-item-description")).toBeNull();
    // A coluna do check continua (a A-01): o item tem os dois filhos.
    expect(free.children).toHaveLength(2);
  });
  it("a opção com `disabled` sai desativada; as outras não", async () => {
    const o = await abrir();
    expect(o["Enterprise"].getAttribute("aria-disabled")).toBe("true");
    expect(o["Free"].getAttribute("aria-disabled")).not.toBe("true");
  });
  // Achado do lote 117 (27/11/2026), medido no navegador: com o mouse em cima, a opção desativada acendia
  // (`data-highlighted`, o fundo do acendido). Provado contra o defeito: sem o `preventBaseUIHandler`, este teste reprova.
  it("a opção desativada não acende com o mouse; a comum acende", async () => {
    const o = await abrir();
    fireEvent.mouseMove(o["Team"]);
    await waitFor(() => expect(o["Team"].hasAttribute("data-highlighted")).toBe(true));
    fireEvent.mouseMove(o["Enterprise"]);
    await new Promise((r) => setTimeout(r, 50));
    expect(o["Enterprise"].hasAttribute("data-highlighted")).toBe(false);
  });
});
