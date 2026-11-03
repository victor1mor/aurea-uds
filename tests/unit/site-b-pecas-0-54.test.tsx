// O SITE B, AS PEÇAS DA 0.54.0 (02/11/2026). Cada uma aprovada pela imagem em 01/11/2026, uma por vez, e construída depois
// do "pode começar a fazer todas agora". Todas são VARIAÇÃO: sem a prop nova, a peça sai igual a antes — e cada bloco cobra
// as duas coisas, a variação e o de sempre.
import {fireEvent, render} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, it} from "vitest";
import {RadioGroup} from "../../packages/react/src/inputs-client.js";
import {Checkbox, KPI, Radio} from "../../packages/react/src/markup.js";
import {CommandPalette, NavList, Stepper} from "../../packages/react/src/navigation-client.js";
import {Toggle, Toolbar} from "../../packages/react/src/actions.js";
import {Accordion} from "../../packages/react/src/disclosure.js";
import {Table} from "../../packages/react/src/data-display-client.js";
import {SegmentedControl} from "../../packages/react/src/inputs-client.js";
import {CodeBlock} from "../../packages/react/src/code-client.js";
import {Alert} from "../../packages/react/src/feedback-client.js";
import {Card} from "../../packages/react/src/markup.js";

const raiz = join(__dirname, "..", "..");
const core = readFileSync(join(raiz, "packages/core/src/aurea.css"), "utf8");
const regra = (seletor: string) => {
  const i = core.indexOf(seletor + " {");
  return i < 0 ? "" : core.slice(i, core.indexOf("}", i));
};

describe("RadioGroup variant=\"card\": o cartão de escolha na web (item 1)", () => {
  it("as opções vão dentro de `.radio-group-cards`; sem a variação, o grupo de sempre", () => {
    const {container} = render(<>
      <RadioGroup label="A" variant="card" defaultValue="a"><Radio value="a" label="A" /><Radio value="b" label="B" /></RadioGroup>
      <RadioGroup label="B" defaultValue="a"><Radio value="a" label="A" /></RadioGroup></>);
    const [card, lista] = [...container.querySelectorAll(".radio-group")];
    expect(card.querySelectorAll(":scope > .radio-group-cards > .radio")).toHaveLength(2);
    expect(lista.querySelector(".radio-group-cards")).toBeNull();
    expect(lista.querySelector(":scope > .radio")).not.toBeNull();
  });
  it("`indicatorPlacement=\"none\"` só tira a bolinha no cartão", () => {
    const {container} = render(<>
      <RadioGroup label="A" variant="card" indicatorPlacement="none"><Radio value="a" label="A" /></RadioGroup>
      <RadioGroup label="B" indicatorPlacement="none"><Radio value="a" label="A" /></RadioGroup></>);
    const [card, lista] = [...container.querySelectorAll(".radio-group")];
    expect(card.classList.contains("radio-group-indicator-none")).toBe(true);
    expect(lista.classList.contains("radio-group-indicator-none")).toBe(false);
    expect(regra(".radio-group-indicator-none > .radio-group-cards > .radio > .control-mark")).toContain("display:none");
  });
  it("o escolhido sobe 4 com a `--shadow-lg` e a cor da aba; o foco é o do cartão inteiro, uma linha só", () => {
    const escolhido = regra(".radio-group-cards > .radio:has(input:checked)");
    for (const parte of ["background:var(--segment)", "box-shadow:var(--shadow-lg)", "translate:0 calc(-1 * var(--space-1))"])
      expect(escolhido).toContain(parte);
    expect(regra(".radio-group-cards > .radio")).toContain("border-radius:var(--radius-card)");
    expect(regra(".radio-group-cards > .radio:has(input:focus-visible)")).toContain("outline:var(--focus-width) solid var(--focus-strong)");
    expect(regra(".radio-group-cards > .radio input:focus-visible + .control-mark")).toContain("outline:none");
    expect(core).toMatch(/prefers-reduced-motion:reduce\) \{ \.radio-group-cards > \.radio:has\(input:checked\) \{ translate:none; \}/);
  });
});

describe("Checkbox variant=\"pill\": a cápsula do \"Mark as done\" (item 4)", () => {
  it("a cápsula, 44 por padrão e 36 com `size=\"md\"`; sem a variação, a caixa de sempre", () => {
    const {container} = render(<><Checkbox variant="pill" label="A" /><Checkbox variant="pill" size="md" label="B" />
      <Checkbox label="C" /></>);
    const [a, b, c] = [...container.querySelectorAll(".checkbox")];
    expect(a.classList.contains("checkbox-pill")).toBe(true);
    expect(a.classList.contains("checkbox-pill-md")).toBe(false);
    expect(b.classList.contains("checkbox-pill-md")).toBe(true);
    expect(c.classList.contains("checkbox-pill")).toBe(false);
    expect(regra(".checkbox.checkbox-pill")).toContain("--pill-h:var(--target-min)");
    expect(regra(".checkbox.checkbox-pill-md")).toContain("--pill-h:var(--control-h-md)");
  });
  it("`tone=\"success\"` pinta a marcada de feito: o verde a 18% e o `--success-400`", () => {
    const {container} = render(<Checkbox variant="pill" tone="success" label="A" defaultChecked />);
    expect(container.querySelector(".checkbox")!.getAttribute("data-tone")).toBe("success");
    expect(regra('.checkbox-pill[data-tone="success"]:has(input:checked)')).toContain("color-mix(in oklab,var(--success-400) 18%,transparent)");
  });
  it("o foco é o da cápsula, uma linha só", () => {
    expect(regra(".checkbox-pill:has(input:focus-visible)")).toContain("outline:var(--focus-width) solid var(--focus-strong)");
    expect(regra(".checkbox.checkbox-pill input:focus-visible + .control-mark,.checkbox.checkbox-pill input:focus-visible:checked + .control-mark")).toContain("outline:none");
  });
});

describe("Stepper variant=\"path\" e \"bar\": o caminho que escolhe (item 5) e a barra em partes (D-1)", () => {
  const itens = [{label: "Um", onClick: () => {}}, {label: "Dois", state: "active" as const, onClick: () => {}}, {label: "Três", onClick: () => {}}];
  it("path: as pontas são itens da lista que não clicam; as colunas contam as etapas e as pontas", () => {
    const {container} = render(<Stepper variant="path" startContent="0.x" endContent="1.0" items={itens} />);
    const lista = container.querySelector(".stepper-path > .stepper") as HTMLElement;
    expect(lista.style.getPropertyValue("--stepper-cols")).toBe("5");
    const [ini, fim] = [lista.firstElementChild!, lista.lastElementChild!];
    expect(ini.className).toBe("step-end step-end-start");
    expect(fim.className).toBe("step-end");
    expect(ini.querySelector("button, a")).toBeNull();
    expect(lista.querySelector(".step-active")!.getAttribute("aria-current")).toBe("step");
  });
  it("bar: cada etapa é o link dela, o nome só para o leitor de tela; a contagem é anunciada", () => {
    const {container} = render(<Stepper variant="bar" startContent="Your setup" endContent="1 of 2 done"
      items={[{label: "Install, done", state: "done", href: "#a"}, {label: "Styles", href: "#b"}]} />);
    const partes = [...container.querySelectorAll(".stepper-bar .step > a.step-trigger")];
    expect(partes.map((a) => a.getAttribute("href"))).toEqual(["#a", "#b"]);
    expect(partes[0].querySelector(".sr-only")!.textContent).toBe("Install, done");
    expect(container.querySelector(".stepper-bar-label")!.textContent).toBe("Your setup");
    expect(container.querySelector(".stepper-bar-count")!.getAttribute("role")).toBe("status");
    expect(regra(".stepper-bar > .stepper > .step-done > .step-trigger")).toContain("background:var(--success-400)");
  });
  it("sem variante, o Stepper de sempre: sem invólucro e sem pontas", () => {
    const {container} = render(<Stepper startContent="x" items={itens} />);
    expect(container.firstElementChild!.className).toBe("stepper");
    expect(container.querySelector(".step-end")).toBeNull();
  });
  it("a bolinha de 50, a escolhida invertida e maior; estreito, 4 por linha sem trilho", () => {
    expect(regra(".stepper-path > .stepper > .step-active .step-dot")).toContain("background:var(--foreground)");
    expect(core).toMatch(/@container \(max-width:30rem\) \{\s*\.stepper-path > \.stepper \{ grid-template-columns:repeat\(4,minmax\(0,1fr\)\); \}/);
  });
});

describe("SegmentedControl: o ícone, o 2xl, a quebra e em pé (itens 3 e 8)", () => {
  const itens = [{value: "a", label: "A", icon: "house" as const}, {value: "b", label: "B", icon: "bell" as const}];
  it("o escolhido leva a forma cheia do ícone; o outro, a regular", () => {
    const {container} = render(<SegmentedControl label="x" value="a" items={itens} />);
    const usos = [...container.querySelectorAll(".segmented button use")].map((u) => u.getAttribute("href")!.split("#")[1]);
    expect(usos).toEqual(["i-house-fill", "i-bell"]);
  });
  it("as classes das variações; sem elas, a chave de sempre", () => {
    const {container} = render(<>
      <SegmentedControl label="1" value="a" items={itens} size="2xl" wrap />
      <SegmentedControl label="2" value="a" items={itens} orientation="vertical" />
      <SegmentedControl label="3" value="a" items={[{value: "a", label: "A"}]} /></>);
    const [a, b, c] = [...container.querySelectorAll(".segmented")];
    expect(a.className).toContain("segmented-2xl");
    expect(a.className).toContain("segmented-wrap");
    expect(b.className).toContain("segmented-vertical");
    expect(b.getAttribute("aria-orientation")).toBe("vertical");
    expect(c.className).toBe("segmented");
    expect(c.querySelector(".icon")).toBeNull();
  });
  it("o 2xl tem 48 e o ícone de 20; a quebra e o em pé têm o canto do cartão", () => {
    expect(regra(".segmented-2xl :is(button,a)")).toContain("min-block-size:var(--space-12)");
    expect(regra(".segmented-2xl :is(button,a) > .icon")).toContain("inline-size:var(--icon-md)");
    expect(regra(".segmented-wrap")).toContain("border-radius:var(--radius-card)");
    expect(regra(".segmented-vertical")).toContain("flex-direction:column");
  });
});

describe("CodeBlock filename: a cabeça do arquivo (item 6)", () => {
  it("o nome do arquivo e o Copy ESCRITO, com o ícone antes; sem `filename`, o botão só de ícone de sempre", () => {
    const {container} = render(<><CodeBlock filename="terminal" copyable>pnpm add x</CodeBlock><CodeBlock copyable>y</CodeBlock></>);
    const [com, sem] = [...container.querySelectorAll(".code-block-wrap")];
    expect(com.classList.contains("code-block-file")).toBe(true);
    expect(com.querySelector(".code-block-title")!.textContent).toBe("terminal");
    const botao = com.querySelector(".code-block-head > button.copy-code-text")!;
    expect(botao.textContent).toBe("CopyCopied");
    expect(botao.querySelector(".icon")).not.toBeNull();
    expect(sem.querySelector(".code-block-head")).toBeNull();
    expect(sem.querySelector("button.copy-code.btn-icon")).not.toBeNull();
  });
  it("sem `copyable`, só a cabeça com o nome; a linha longa desce", () => {
    const {container} = render(<CodeBlock filename="a.ts">z</CodeBlock>);
    expect(container.querySelector(".code-block-file .code-block-title")!.textContent).toBe("a.ts");
    expect(container.querySelector("button")).toBeNull();
    expect(regra(".code-block-wrap.code-block-file > .code-block")).toContain("white-space:pre-wrap");
  });
});

describe("CommandPalette size=\"lg\": a busca grande (item 2 e D-2)", () => {
  const itens = [{id: "a", label: "Button", description: "The action", icon: "house" as const, tone: "blue" as const, group: "Components", run: () => {}},
    {id: "b", label: "Card", group: "Components", run: () => {}}];
  it("o campo com a lupa e o Esc, os filtros, a contagem do grupo, o círculo tingido e a descrição; o pé do app", () => {
    render(<CommandPalette open onClose={() => {}} size="lg" items={itens} filters={<span data-f>f</span>}
      preview={(i) => <span data-p>{i.label}</span>} footer={<span data-pe>pe</span>} />);
    const caixa = document.querySelector(".command-palette.command-palette-lg")!;
    expect(caixa.querySelector(".command-field > .command-input")).not.toBeNull();
    expect(caixa.querySelector(".command-field > kbd")!.textContent).toBe("Esc");
    expect(caixa.querySelector(".command-filters [data-f]")).not.toBeNull();
    expect(caixa.querySelector(".command-group-count")!.textContent).toBe("2");
    expect(caixa.querySelector('.command-item-tile[data-tone="blue"] .icon')).not.toBeNull();
    expect(caixa.querySelector(".command-item-description")!.textContent).toBe("The action");
    expect(caixa.querySelector(".command-foot [data-pe]")).not.toBeNull();
  });
  it("sem `lg`, a paleta de sempre: o campo `.input`, sem círculo, sem contagem; os encaixes não aparecem", () => {
    render(<CommandPalette open onClose={() => {}} items={itens} filters={<span data-f2>f</span>} footer={<span data-pe2>pe</span>} />);
    const caixa = [...document.querySelectorAll(".command-palette")].find((c) => !c.classList.contains("command-palette-lg"))!;
    expect(caixa.querySelector("input.input")).not.toBeNull();
    expect(caixa.querySelector(".command-item-tile, .command-group-count, [data-f2], [data-pe2]")).toBeNull();
    expect(regra(".command-body-plain,.command-foot-plain")).toContain("display:contents");
  });
});

describe("NavList size=\"lg\" e Toggle xl: o menu do celular (item 10)", () => {
  it("a lista grande: o círculo tingido; a linha atual com o selo no lugar da seta", () => {
    const {container} = render(<NavList size="lg" currentLabel="You are here" items={[
      {id: "a", label: "A", icon: "house", tone: "green", href: "#a"}, {id: "b", label: "B", icon: "bell", href: "#b", current: true}]} />);
    const [a, b] = [...container.querySelectorAll(".nav-list-lg .nav-list-row")];
    expect(a.querySelector('.nav-list-tile[data-tone="green"] .icon')).not.toBeNull();
    expect(a.querySelector(".nav-list-chevron")).not.toBeNull();
    expect(b.getAttribute("aria-current")).toBe("page");
    expect(b.querySelector(".nav-list-chevron")).toBeNull();
    expect(b.querySelector(".nav-list-here")!.textContent).toBe("You are here");
  });
  it("sem `lg`, a lista de sempre: o ícone solto, sem círculo", () => {
    const {container} = render(<NavList items={[{id: "a", label: "A", icon: "house", tone: "green", href: "#a"}]} />);
    expect(container.querySelector(".nav-list-lg, .nav-list-tile")).toBeNull();
    expect(container.querySelector(".nav-list-row > .icon")).not.toBeNull();
  });
  it("o Toggle xl é o botão de 50 (`btn-xl`)", () => {
    const {container} = render(<Toggle size="xl">Aurea</Toggle>);
    expect(container.querySelector("button")!.className).toContain("btn-xl");
  });
});

describe("Toggle area e as janelas presas (D-3, D-5, D-6, D-4)", () => {
  it("a área: sem a altura do botão; `pill` em cápsula; sem `area`, o toggle de sempre", () => {
    const {container} = render(<><Toggle area variant="ghost" label="A"><span /></Toggle><Toggle area="pill">B</Toggle><Toggle>C</Toggle></>);
    const [a, b, c] = [...container.querySelectorAll("button")];
    expect(a.className).toContain("toggle-area");
    expect(a.className).not.toContain("btn-icon");
    expect(b.className).toContain("toggle-area-pill");
    expect(c.className).not.toContain("toggle-area");
    expect(regra(".btn.toggle.toggle-area.btn-tertiary")).toContain("--area-on:var(--primary)");
  });
  it("as janelas presas: dentro de `[data-contained]`, a posição é a do contêiner", () => {
    expect(regra("[data-contained] :is(.dialog-backdrop,.dialog,.drawer,.toast-stack)")).toContain("position:absolute");
    expect(regra("[data-contained]")).toContain("position:relative");
  });
});

describe("Accordion de lado, KPI amarelo com barras, Table em cápsulas, Toolbar amarela (D-7.1, 7.3, 7.6, 7.7)", () => {
  it("o acordeão de lado: o invólucro mede o contêiner; o aberto não fecha pelo clique", () => {
    const {container} = render(<Accordion orientation="horizontal" defaultValue={["a"]}
      items={[{id: "a", title: "A", content: "a"}, {id: "b", title: "B", content: "b"}]} />);
    expect(container.querySelector(".accordion-horizontal-frame > .accordion.accordion-horizontal")).not.toBeNull();
    const aberto = container.querySelector("details[open] > summary") as HTMLElement;
    aberto.click();
    expect((aberto.parentElement as HTMLDetailsElement).open).toBe(true);
    expect(regra(".accordion-horizontal > .accordion-item[open]")).toContain("flex:1 1 0");
  });
  it("o KPI amarelo e as barras: rádios nativos, a escolhida é a última; o clique escolhe outra; sem clique no código", () => {
    const {container} = render(<KPI variant="brand" label="Revenue" value="$48k"
      bars={[{label: "May", value: "$44k", amount: 44}, {label: "Jun", value: "$48k", amount: 48}]} />);
    expect(container.querySelector(".kpi.kpi-brand")).not.toBeNull();
    const radios = [...container.querySelectorAll(".kpi-bar > .kpi-bar-input[type=radio]")] as HTMLInputElement[];
    expect(radios.map((r) => r.checked)).toEqual([false, true]);
    expect(radios.map((r) => r.getAttribute("aria-label"))).toEqual(["May · $44k", "Jun · $48k"]);
    expect(container.querySelector("fieldset.kpi-bars-wrap > legend")!.textContent).toBe("Revenue");
    (container.querySelectorAll(".kpi-bar")[0] as HTMLLabelElement).click();
    expect(radios.map((r) => r.checked)).toEqual([true, false]);
    expect(regra(".kpi-brand .kpi-bar:has(> input:checked) .kpi-bar-fill,.kpi-brand .kpi-bar:hover .kpi-bar-fill")).toContain("var(--control-thumb)");
    expect(readFileSync(join(raiz, "packages/react/src/markup.tsx"), "utf8")).not.toMatch(/onClick=\{/);
  });
  it("a tabela em cápsulas e a barra amarela; sem as variações, as de sempre", () => {
    const {container} = render(<><Table variant="rows"><tbody><tr><td>a</td></tr></tbody></Table><Table><tbody><tr><td>b</td></tr></tbody></Table>
      <Toolbar tone="brand" label="s" /><Toolbar label="t" /></>);
    const [rows, normal] = [...container.querySelectorAll("table")];
    expect(rows.className).toContain("table-rows");
    expect(normal.className).not.toContain("table-rows");
    const [brand, comum] = [...container.querySelectorAll(".toolbar")];
    expect(brand.className).toContain("toolbar-brand");
    expect(comum.className).not.toContain("toolbar-brand");
    expect(regra(".toolbar-brand .btn")).toContain("--btn-bg:var(--control-thumb)");
  });
});

// `selectedStyle="emphasis"` (o site B, 02/11/2026, a "C" na imagem): a cápsula erguida, a letra do destaque e sem fio.
// Provado contra o defeito: sem a regra, o `emphasis` caía no geral dos estilos (sem fio) com a letra do `--seg-fg`
// indefinido — e o teste da regra reprova.
describe("SegmentedControl selectedStyle=\"emphasis\"", () => {
  it("escreve o estilo na cápsula, e a folha pinta a letra do destaque sem o fio", () => {
    const {container} = render(<SegmentedControl selectedStyle="emphasis" label="View" value="a" items={[{value: "a", label: "A"}, {value: "b", label: "B"}]}/>);
    expect(container.querySelector("[data-segment-style]")?.getAttribute("data-segment-style")).toBe("emphasis");
    const linha = core.split("\n").find(l => l.includes('.segmented[data-segment-style="emphasis"]) :is(button,a).active'));
    expect(linha).toBeDefined();
    expect(linha).toContain("--seg-fg:var(--primary-emphasis)");
    expect(linha).toContain("--seg-shadow:var(--shadow-sm)");
  });
});

// `Alert appearance="soft"` (o site B, 02/11/2026, a "B" na imagem). Provado contra o defeito: sem a classe, o alerta sai
// com o fundo do cartão — o teste da classe reprova; sem a regra, o da folha.
describe("Alert appearance=\"soft\"", () => {
  it("põe a classe só com soft, e a folha pinta o fundo do tom a 14% sem sombra", () => {
    const {container} = render(<><Alert appearance="soft" variant="success" title="T">Corpo</Alert><Alert variant="success">Corpo</Alert></>);
    const [suave, cartao] = Array.from(container.querySelectorAll(".alert"));
    expect(suave.className).toContain("alert-soft");
    expect(cartao.className).not.toContain("alert-soft");
    const linha = core.split("\n").find(l => l.startsWith(".alert.alert-soft"));
    expect(linha).toContain("background:color-mix(in oklab, var(--alert-tone) 14%, transparent)");
    expect(linha).toContain("box-shadow:none");
    // Na Ember, o cartão de sempre (o Victor, 02/11/2026: "Ember no cartão"): TODA regra do soft leva a guarda dela.
    const regras = core.split("\n").filter(l => l.startsWith(".alert.alert-soft"));
    expect(regras.length).toBe(3);
    for (const r of regras) expect(r).toContain(':where(:not([data-brand="ember"],[data-brand="ember"] *))');
  });
});

// `Card fill="brand"` (o site B, 02/11/2026, a "B" na imagem). Provado contra o defeito: sem a classe, o cartão sai na cor
// de cartão — o teste da classe reprova; sem a regra, o da folha.
describe("Card fill=\"brand\"", () => {
  it("põe a classe só com fill, e a folha pinta o amarelo com a tinta, também no texto de apoio", () => {
    const {container} = render(<><Card fill="brand">A</Card><Card>B</Card></>);
    const [cheio, comum] = Array.from(container.querySelectorAll(".card"));
    expect(cheio.className).toContain("card-fill-brand");
    expect(comum.className).not.toContain("card-fill-brand");
    const regra = core.split("\n").findIndex(l => l.startsWith(".card.card-fill-brand:where"));
    const corpo = core.split("\n").slice(regra, regra + 2).join(" ");
    expect(corpo).toContain("background:var(--primary)");
    expect(corpo).toContain("--muted-foreground:var(--primary-foreground)");
    // Na Ember, o cartão comum (o Victor, 02/11/2026: "Ember no cartão comum"): TODA regra do fill leva a guarda dela.
    const regras = core.split("\n").filter(l => l.startsWith(".card.card-fill-brand"));
    expect(regras.length).toBe(2);
    for (const r of regras) expect(r).toContain(':where(:not([data-brand="ember"],[data-brand="ember"] *))');
  });
});

// `Table striped` (o site B, 02/11/2026, a "B" na imagem). Provado contra o defeito: sem a classe, a tabela sai sem faixas
// — o teste da classe reprova; sem as regras, o da folha.
describe("Table striped", () => {
  it("põe a classe só com striped, e a folha pinta as linhas ímpares nos dois arranjos", () => {
    const corpo = <tbody><tr><td>a</td></tr><tr><td>b</td></tr></tbody>;
    const {container} = render(<><Table striped caption="A">{corpo}</Table><Table caption="B">{corpo}</Table></>);
    const [com, sem] = Array.from(container.querySelectorAll("table"));
    expect(com.className).toContain("table-striped");
    expect(sem.className).not.toContain("table-striped");
    expect(core).toContain(".table.table-striped:not(.table-rows) tbody tr:nth-child(odd) > :is(td,th) { background:color-mix(in oklab, var(--foreground) 6%, var(--card)); }");
    expect(core).toContain(".table.table-striped.table-rows tbody tr:nth-child(odd) > :is(td,th) { background:var(--fill-1); }");
  });
});

// `CodeBlock previewLayout="stacked"` (ADR-0089, 02/11/2026: "preciso que seja fiel a referencia", "Com degradê").
// Provado contra o defeito: sem a variação, a caixa sai com as abas (o tablist) — o primeiro teste reprova; sem a
// troca de estado, o botão não abre — o segundo; o degradê fora da regra recolhida — o terceiro.
describe("CodeBlock previewLayout=\"stacked\"", () => {
  const longo = "import {Button} from \"@aurea-uds/react\";\n\nexport function Example() {\n  return (\n    <Button>Save</Button>\n  );\n}";
  it("empilha a peça e o código, sem abas, e recolhe o código com mais de 5 linhas", () => {
    const {container} = render(<CodeBlock preview={<span>peça</span>} previewLayout="stacked" copyable>{longo}</CodeBlock>);
    const caixa = container.querySelector(".demo")!;
    expect(caixa.className).toContain("demo-stacked");
    expect(container.querySelector("[role=tablist]")).toBeNull();
    expect(caixa.hasAttribute("data-collapsed")).toBe(true);
    expect(container.querySelector(".demo-stacked-toggle")?.textContent).toBe("Expand code");
  });
  it("o botão abre e recolhe, e o código curto não tem botão", () => {
    const {container} = render(<><CodeBlock preview={<span>a</span>} previewLayout="stacked">{longo}</CodeBlock>
      <CodeBlock preview={<span>b</span>} previewLayout="stacked">{"<Button>Save</Button>"}</CodeBlock></>);
    const [caixa, curta] = Array.from(container.querySelectorAll(".demo"));
    const botao = caixa.querySelector<HTMLButtonElement>(".demo-stacked-toggle")!;
    fireEvent.click(botao);
    expect(caixa.hasAttribute("data-expanded")).toBe(true);
    expect(caixa.hasAttribute("data-collapsed")).toBe(false);
    expect(botao.getAttribute("aria-expanded")).toBe("true");
    expect(botao.textContent).toBe("Collapse code");
    expect(curta.querySelector(".demo-stacked-toggle")).toBeNull();
    expect(curta.hasAttribute("data-collapsed")).toBe(false);
  });
  it("sem a prop, a caixa de sempre (as abas); o degradê mora só na regra recolhida", () => {
    const {container} = render(<CodeBlock preview={<span>c</span>}>{longo}</CodeBlock>);
    expect(container.querySelector("[role=tablist]")).not.toBeNull();
    // O seletor de cada degradê do core: só o brand-gradient (ADR-0084) e a caixa recolhida (ADR-0089).
    const semComentario = core.replace(/\/\*[\s\S]*?\*\//g, "");
    const seletores = [...semComentario.matchAll(/gradient\(/g)].map(m => {
      const abre = semComentario.lastIndexOf("{", m.index!);
      return semComentario.slice(Math.max(semComentario.lastIndexOf("}", abre), semComentario.lastIndexOf("{", abre - 1)) + 1, abre).trim();
    });
    expect(seletores.some(s => s.startsWith(".demo.demo-stacked[data-collapsed] > .demo-code .code-block-wrap"))).toBe(true);
    for (const s of seletores) expect(s.includes('data-current-style="brand-gradient"') || s.startsWith(".demo.demo-stacked[data-collapsed]")).toBe(true);
  });
});
