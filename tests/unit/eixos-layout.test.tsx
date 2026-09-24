import {readFileSync} from "node:fs";
import {render, screen} from "@testing-library/react";
import {
  AureaProvider, Button, ButtonGroup, Field, Input, InputGroup, InputGroupAddon, Menubar, Tabs,
} from "../../packages/react/src/index";

// G-AXIS-01. Três eixos que existem na referência e faltavam em componente que já existe aqui:
// orientação do `Field`, alinhamento em BLOCO do `InputGroupAddon`, orientação do `ButtonGroup`.
// Achados no inventário do §9 da `shadcn`, e a `kibo` apontou o mesmo lugar por outro caminho —
// `button-group` e `input-group` são os dois componentes com mais variantes de composição lá.
//
// A fonte do core, não o dist: o dist é cópia gerada, e teste que lê a cópia passa enquanto a
// fonte está errada.
const css = readFileSync("packages/core/src/aurea.css", "utf8");
const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);

// Regra do sistema, a mesma do `size`: o valor PADRÃO não emite classe. Sem isto passam a existir
// dois jeitos de escrever o mesmo layout, e um deles fica sem pele.
test("o valor padrão de cada eixo não emite classe", () => {
  const {container} = wrap(<>
    <Field label="A"><Input aria-label="a" /></Field>
    <ButtonGroup label="g"><Button>x</Button></ButtonGroup>
    <InputGroup><InputGroupAddon>@</InputGroupAddon><Input aria-label="b" /></InputGroup>
  </>);
  // `.field` e não `label`: o contêiner do Field é uma <div>, e não um <label>, desde o
  // AUD-0001 — hint e erro dentro do <label> entravam no NOME acessível, e um filho que traz
  // <label> próprio produzia <label> dentro de <label>. O que este teste mede — eixo no padrão
  // não emite classe — é o mesmo; o seletor é que estava preso à estrutura antiga.
  expect(container.querySelector(".field")!.className).toBe("field");
  // `.btn-group` e não o primeiro `[role="group"]` da árvore: o Field também é um grupo quando
  // o filho traz o próprio nome (aqui, `aria-label`), então o seletor genérico pegava o Field.
  expect(container.querySelector(".btn-group")!.className).toBe("btn-group");
  expect(css).not.toContain(".field-vertical");
  expect(css).not.toContain(".btn-group-horizontal");
});

// ── Field horizontal ───────────────────────────────────────────────────────

test("Field horizontal emite a classe do sistema", () => {
  const {container} = wrap(
    <Field label="Fuso" orientation="horizontal"><Input aria-label="f" /></Field>);
  expect(container.querySelector(".field")!.className).toBe("field field-horizontal");
});

// A parte que decide o desenho, e a razão de ser GRADE e não `flex-direction:row`: numa linha, a
// mensagem de erro viraria uma terceira coluna ao lado do controle. Ela fala do VALOR, então tem
// de cair embaixo do controle — coluna 2.
test("na horizontal o erro cai embaixo do controle, não ao lado do rótulo", () => {
  const bloco = regraDe(".field-horizontal");
  expect(bloco, ".field-horizontal não existe no core").not.toBe("");
  expect(bloco, "linha não resolve o erro; grade resolve").toContain("display:grid");
  const naoRotulo = regraDe(".field-horizontal>*:not(.label)");
  expect(naoRotulo, "tudo que não é rótulo vai para a coluna 2").toContain("grid-column:2");
  expect(regraDe(".field-horizontal>.label")).toContain("grid-column:1");
});

// O consumidor precisa alinhar VÁRIAS linhas entre si; sem um valor comum, cada campo escolheria
// a própria largura de rótulo e a coluna ficaria serrilhada.
test("a largura da coluna do rótulo é ajustável por token", () => {
  expect(regraDe(".field-horizontal")).toContain("--field-label-width");
});

// ── InputGroupAddon em bloco ───────────────────────────────────────────────

// A intenção deste bloco não mudou com a ADR-0048 — as quatro combinações continuam existindo e
// continuam tendo desenho. O que mudou é que elas deixaram de ser um enum achatado e passaram a
// ser o produto de dois eixos, e a asserção acompanha a estrutura nova sem afrouxar.
test.each([["start", "inline"], ["end", "inline"], ["start", "block"], ["end", "block"]] as const)(
  "side=%s layout=%s emite as duas classes e o core as pinta", (side, layout) => {
    const {container} = wrap(
      <InputGroup><Input aria-label="x" /><InputGroupAddon side={side} layout={layout}>ok</InputGroupAddon></InputGroup>);
    const cls = container.querySelector("span.input-group-addon")!.className;
    expect(cls).toContain(`input-group-addon-${side}`);
    expect(cls).toContain(`input-group-addon-${layout}`);
    // o recuo é do PAR, e mora numa regra composta — se ela sumir, o adorno perde o respiro
    expect(regraDe(`.input-group-addon-${layout}.input-group-addon-${side}`),
      `o core não pinta o par ${layout}/${side}`).not.toBe("");
  });

// O que faz o adorno em bloco EXISTIR: ele ocupa a linha inteira. Sem isto ele fica ao lado do
// campo e o eixo não é eixo nenhum.
test("o layout em bloco ocupa a linha inteira", () => {
  expect(regraDe(".input-group-addon-block")).toContain("inline-size:100%");
});

// E a razão de tudo isto: NENHUM `order`. Era ele que reordenava o desenho sem reordenar o
// documento, e é por isso que a correção teve de ser estrutural em vez de cosmética.
test("o adorno não posiciona por `order` — a ordem é a do DOM", () => {
  for (const c of ["start", "end", "inline", "block"]) {
    expect(regraDe(`.input-group-addon-${c}`), `.input-group-addon-${c} voltou a usar order`)
      .not.toContain("order:");
  }
});

// E a quebra de linha é CONDICIONAL. Ligar `flex-wrap` no `.input-group` inteiro mudaria o
// comportamento de todo grupo que já existe: o que hoje transborda passaria a quebrar.
test("o grupo pode quebrar linha, e quem quebra é o adorno de 100%", () => {
  // ESTE TESTE MUDOU DE FORMA em 22/08/2026, e a preocupação que ele guardava continua guardada.
  //
  // Antes ele cobrava que `.input-group` NÃO tivesse `flex-wrap`, porque ligar a quebra no grupo
  // inteiro faria o que hoje transborda passar a quebrar. A ADR-0048 tirou a quebra do `:has()`
  // — que enxerga a CLASSE e não a geometria efetiva, e por isso não acompanhava `layout`
  // responsivo — e passou a quebrar pelo adorno de 100%, que é consequência da largura dele.
  //
  // O que impede a regressão temida não é mais a ausência de `flex-wrap`: é a base ZERO do
  // controle. Com `flex:1 1 auto`, a base resolve para o `width:100%` que o campo já tem e ele
  // sozinho enche a linha; com `flex:1 1 0`, ele cresce no que sobra e os adornos ficam ao lado.
  // Medido: sem essa troca, os dois adornos caíam para a linha de baixo num contêiner de 900px.
  expect(regraDe(".input-group "), "o grupo precisa poder quebrar para o adorno em faixa existir")
    .toContain("flex-wrap:wrap");
  expect(regraDe(".input-group>.input,.input-group>.select,.input-group>.textarea"),
    "sem base zero, o campo enche a linha sozinho e empurra todo adorno para baixo")
    .toContain("flex:1 1 0");
  expect(regraDe(".input-group-addon-block"), "quem quebra a linha é o adorno, pela largura dele")
    .toContain("inline-size:100%");
  // e o grupo NÃO pode mais condicionar geometria por `:has()`, que foi a causa do defeito
  const porHas = css.match(/\.input-group:has\([^)]*\)[^{]*\{([^}]*)\}/g) ?? [];
  for (const regra of porHas) {
    expect(regra, `condição por :has() voltou a decidir geometria: ${regra.slice(0, 90)}`)
      .not.toMatch(/flex-wrap|flex:|inline-size|align-items/);
  }
});

// ── ButtonGroup vertical ───────────────────────────────────────────────────

test("ButtonGroup vertical emite a classe, e os botões medem igual", () => {
  const {container} = wrap(
    <ButtonGroup label="g" orientation="vertical"><Button>um</Button><Button>dois mais longo</Button></ButtonGroup>);
  expect(container.querySelector('[role="group"]')!.className).toBe("btn-group btn-group-vertical");
  const r = regraDe(".btn-group-vertical");
  expect(r).toContain("flex-direction:column");
  // sem `stretch` cada botão teria a largura do próprio rótulo, e a coluna sairia serrilhada
  expect(r, "botões de larguras diferentes é o defeito que um grupo vertical não pode ter")
    .toContain("align-items:stretch");
});

// `role="group"` não navega por seta, então anunciar orientação seria prometer teclado que não
// existe. O `Toolbar` e o `ToggleGroup` anunciam porque navegam.
test("o grupo NÃO anuncia orientação: ele não navega por seta", () => {
  const {container} = wrap(<ButtonGroup label="g" orientation="vertical"><Button>x</Button></ButtonGroup>);
  expect(container.querySelector('[role="group"]')!.getAttribute("aria-orientation")).toBeNull();
});

// ── a migração não pode ter deixado consumidor para trás ───────────────────
// Este teste já pegou UMA renomeação (21/08, quando `align` foi de `start|end` para os quatro
// valores lógicos) e agora guarda a segunda: o enum achatado morreu, e classe sem regra não
// quebra nada — só some, e ninguém vê.
test("nenhuma classe do enum achatado sobrou no core nem no catálogo", () => {
  for (const morta of ["inline-start", "inline-end", "block-start", "block-end"]) {
    expect(css.includes(`.input-group-addon-${morta}`), `input-group-addon-${morta} ficou no core`)
      .toBe(false);
  }
  const starters = readFileSync("apps/catalog/content/_starters.mjs", "utf8");
  expect(starters, "starter ainda usa o enum achatado").not.toMatch(/align[=:]\s*"?(inline|block)-/);
});

/** O corpo da PRIMEIRA regra cujo seletor é exatamente `sel`. Comentário fora antes de olhar:
 *  o `validate.py` já teve o defeito de ler uma classe de dentro de um comentário CSS. */
function regraDe(sel: string): string {
  const limpo = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const bloco of limpo.split("}")) {
    const i = bloco.indexOf("{");
    if (i < 0) continue;
    if (bloco.slice(0, i).trim() === sel.trim()) return bloco.slice(i + 1);
  }
  return "";
}

// ── G-AXIS-03: a família da ORIENTAÇÃO ─────────────────────────────────────
//
// A matriz do §13 achou ONZE capacidades sem eixo de orientação, e foi o padrão mais forte que
// ela produziu — não são onze itens soltos, é uma família. Duas delas eram a MESMA coisa que o
// `G-CAP-24` e o `G-CAP-25` já tinham ensinado: **o motor entrega e o React não expõe**.
// Medido no `@base-ui/react` 1.6.0: `tabs`, `menubar`, `slider`, `accordion` e `toggle-group`
// declaram `orientation`. Destes, a Aurea usa o motor em `Tabs`, `Menubar` e `ToggleGroup` — o
// `Range` é `<input type=range>` nativo e o `Accordion` é `<details>`, então neles a vertical é
// construção, não exposição, e fica no `03-GAPS.md` como capacidade a decidir.

test("Tabs e Menubar aceitam orientação, e o padrão não emite classe", () => {
  const {container} = wrap(<>
    <Tabs label="t" value="a" onChange={() => {}} tabs={[{id: "a", label: "A", content: "a"}]} />
    <Menubar label="m" menus={[{label: "Arquivo", items: [{label: "Novo"}]}]} />
  </>);
  expect(container.querySelector(".tabs")!.className).toBe("tabs");
  expect(container.querySelector(".menubar")!.className).toBe("menubar");
  expect(css).not.toContain(".tabs-horizontal");
  expect(css).not.toContain(".menubar-horizontal");
});

test("Tabs vertical: o motor publica o eixo e o core o pinta", () => {
  // Este teste cobrava a CLASSE (`tabs tabs-vertical`) até 22/08/2026. O `G-AXIS-06` mudou o
  // mecanismo por decisão do Victor: a pele passou a reagir ao `data-orientation` que o MOTOR
  // publica, para não haver duas fontes de verdade. A asserção foi reescrita preservando a
  // INTENÇÃO — a vertical continua desenhando em grade e em coluna, e continua sendo cobrada —,
  // e não afrouxada: o que se confere agora é o mesmo desenho, pelo seletor que o produz.
  const {container} = wrap(
    <Tabs label="t" orientation="vertical" value="a" onChange={() => {}}
      tabs={[{id: "a", label: "A", content: "a"}, {id: "b", label: "B", content: "b"}]} />);
  expect(container.querySelector(".tabs")!.getAttribute("data-orientation"),
    "sem o atributo do motor, nada do desenho vertical se aplica").toBe("vertical");
  expect(container.querySelector('.tabs-root[data-orientation="vertical"]'),
    "a RAIZ precisa do eixo: é ela que vira grade, e a lista sozinha não sabe onde o painel fica")
    .not.toBeNull();
  // grade e não linha: com `flex-direction:row` o painel herdaria a altura da lista, e uma aba
  // com muito conteúdo esticaria a coluna de rótulos junto
  const raiz = regraDe('.tabs-root[data-orientation="vertical"]');
  expect(raiz, "a raiz vertical não existe no core").not.toBe("");
  expect(raiz, "linha não resolve; grade resolve").toContain("display:grid");
  const lista = regraDe('.tabs[data-orientation="vertical"]');
  expect(lista).toContain("flex-direction:column");
  // sem `stretch` cada aba teria a largura do próprio rótulo, e a coluna sairia serrilhada
  expect(lista, "coluna de abas de larguras diferentes é o defeito").toContain("align-items:stretch");
});

// Ao contrário do `ButtonGroup`, aqui o `aria-orientation` SAI — e sai do motor. A lista de abas
// navega por seta, então anunciar a orientação é prometer teclado que existe de verdade.
test("a lista de abas ANUNCIA a orientação: ela navega por seta", () => {
  const {container} = wrap(
    <Tabs label="t" orientation="vertical" value="a" onChange={() => {}}
      tabs={[{id: "a", label: "A", content: "a"}]} />);
  expect(container.querySelector('[role="tablist"]')!.getAttribute("aria-orientation"))
    .toBe("vertical");
});

test("Menubar vertical: o motor publica o eixo, e o core alinha os gatilhos", () => {
  const {container} = wrap(
    <Menubar label="m" orientation="vertical"
      menus={[{label: "Arquivo", items: [{label: "Novo"}]}, {label: "Editar", items: [{label: "Desfazer"}]}]} />);
  // idem: o eixo vem do motor desde o G-AXIS-06, e a intenção cobrada é a mesma de antes.
  expect(container.querySelector(".menubar")!.getAttribute("data-orientation")).toBe("vertical");
  const r = regraDe('.menubar[data-orientation="vertical"]');
  expect(r, "a regra vertical do menubar não existe no core").not.toBe("");
  expect(r).toContain("flex-direction:column");
  expect(r, "gatilhos de larguras diferentes é o mesmo serrilhado do grupo vertical")
    .toContain("align-items:stretch");
});
