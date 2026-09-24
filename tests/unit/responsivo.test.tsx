import {render} from "@testing-library/react";
import {AureaProvider, Avatar, Button, ButtonGroup, Checkbox, Field, Icon, Input, InputGroup, InputGroupAddon, SearchField, Spinner, Switch} from "../../packages/react/src/index";
import {classesResponsivas, ehResponsivo, valorBase} from "../../packages/react/src/pure";
import {readFileSync} from "node:fs";

// G-AXIS-04 — a abstração compartilhada do eixo responsivo.
//
// A decisão do Victor: a Aurea tem os DOIS mecanismos, e a API diz explicitamente a QUE um valor
// responde. Este arquivo cobra a parte que é computação — que classe sai de que valor — e a
// promessa que sustenta tudo: **valor simples não muda nada**.
//
// A parte que é LAYOUT está em `tests/visual/responsivo.multi-motor.spec.ts`, no navegador e nos
// três motores. Aqui, jsdom não faz `@container`, então "passou" só diria que a string está certa.

const css = readFileSync("packages/core/src/aurea.css", "utf8");
const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

test("valor simples continua emitindo a classe do componente — nada muda", () => {
  // É a promessa que torna a mudança aditiva: nenhum consumidor troca de classe, nenhuma baseline
  // se mexe. Se este teste cair, a migração deixou de ser aditiva e virou quebra.
  const {container} = wrap(<><Button size="sm">a</Button><Button>b</Button></>);
  const [sm, md] = [...container.querySelectorAll("button")];
  expect(sm.className).toContain("btn-sm");
  expect(sm.className).not.toContain("size-sm");
  expect(md.className, "o degrau padrão não emite classe de tamanho").not.toMatch(/btn-(xs|sm|lg|xl)/);
});

test("valor responsivo entra pela camada GENÉRICA, não pela classe do componente", () => {
  // As duas coisas juntas importam: se `btn-lg` saísse junto de `size-xs`, ele venceria a camada
  // responsiva (é declaração da mesma especificidade, mais adiante na folha) e o valor por ponto
  // nunca apareceria.
  const {container} = wrap(
    <Button size={{base: "xs", viewport: {md: "lg"}}}>a</Button>);
  const c = container.querySelector("button")!.className;
  expect(c).toContain("size-xs");
  expect(c).toContain("vp-md:size-lg");
  expect(c, "classe do componente venceria a camada").not.toMatch(/btn-(xs|sm|lg|xl)/);
});

test("o prefixo diz o MENSURÁVEL, e é isso que tira a ambiguidade de `md`", () => {
  const vp = classesResponsivas("size", {base: "sm", viewport: {md: "lg"}});
  const ct = classesResponsivas("size", {base: "sm", container: {md: "lg"}});
  expect(vp).toBe("size-sm vp-md:size-lg");
  expect(ct).toBe("size-sm ct-md:size-lg");
  // mesmo ponto, mesmo número de pixels, mensuráveis diferentes — uma escala só
  expect(css).toContain("@media (min-width:768px)");
  expect(css).toContain("@container aurea (min-width:768px)");
});

test("toda classe que a abstração emite existe no core", () => {
  // O `log-warn` do G-CSS-01 outra vez: classe sem regra não quebra, ela SOME. Aqui isso seria
  // pior, porque some só num ponto da escala — a página parece certa até alguém redimensionar.
  const PONTOS_VP = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const;
  const PONTOS_CT = ["2xs", "xs", "sm", "md", "lg"] as const;
  const PASSOS = ["xs", "sm", "md", "lg", "xl"] as const;
  const orfas: string[] = [];
  for (const p of PASSOS) {
    if (!css.includes(`.size-${p} {`)) orfas.push(`size-${p}`);
    for (const b of PONTOS_VP) if (!css.includes(`.vp-${b}\\:size-${p}`)) orfas.push(`vp-${b}:size-${p}`);
    for (const b of PONTOS_CT) if (!css.includes(`.ct-${b}\\:size-${p}`)) orfas.push(`ct-${b}:size-${p}`);
  }
  expect(orfas, `sem regra no core: ${orfas.slice(0, 8).join(", ")}`).toEqual([]);
});

// A SEGUNDA família, e a razão de ela existir no teste: foi ao aplicar aqui que apareceu o
// defeito da primeira camada — `--step-px` carregava o padding do BOTÃO (15px no md) e o campo
// usa 13px. Altura e corpo de texto são compartilhados entre famílias; padding não é. Um teste
// só sobre o botão nunca teria mostrado isso.
test("a família de CAMPO usa a mesma camada, com a medida dela", () => {
  const {container} = wrap(<>
    <Input aria-label="a" size="sm" />
    <Input aria-label="b" size={{base: "sm", container: {md: "lg"}}} />
  </>);
  const [simples, resp] = [...container.querySelectorAll("input")];
  expect(simples.className, "valor simples: a classe de antes").toContain("input-sm");
  expect(simples.className).not.toContain("size-sm");
  expect(resp.className).toContain("size-sm");
  expect(resp.className).toContain("ct-md:size-lg");
  expect(resp.className, "a classe do componente venceria a camada").not.toMatch(/input-(sm|lg)/);
  // e a medida própria da família está na tabela, não presumida do botão
  expect(css).toContain("--step-field-px");
  expect(css).toContain("--step-select-pe");
});

// Peça INTERNA que decide por comparação (o glifo do SearchField, o botão de olho do
// PasswordField, os dois do Combobox): comparar o valor CRU faria um responsivo cair sempre no
// ramo default, e em silêncio. São quatro lugares — um que ficasse para trás daria um botão de
// tamanho errado só no caso responsivo, que é a espécie de defeito que ninguém acha.
test("composto com valor responsivo ainda dimensiona a peça interna", () => {
  const {container} = wrap(
    <SearchField aria-label="s" size={{base: "sm", viewport: {md: "lg"}}} />);
  const icone = container.querySelector(".input-group-addon .icon")!;
  // `getAttribute` e não `.className`: num <svg> o `className` é um SVGAnimatedString, não uma
  // string — a asserção passaria a comparar contra um objeto e falharia dizendo a coisa errada.
  expect(icone.getAttribute("class"), "o glifo tem de seguir o valor BASE").toContain("icon-sm");
});

test("os ajudantes da abstração", () => {
  expect(valorBase("sm")).toBe("sm");
  expect(valorBase({base: "xs", viewport: {md: "lg"}})).toBe("xs");
  expect(valorBase(undefined)).toBeUndefined();
  expect(ehResponsivo("sm")).toBe(false);
  expect(ehResponsivo({base: "xs", container: {md: "lg"}})).toBe(true);
  expect(classesResponsivas("size", "sm"), "valor simples não usa a camada").toBe("");
  expect(classesResponsivas("size", undefined)).toBe("");
});

// A camada é GENÉRICA de propósito: `size` é o primeiro eixo, não o único previsto. Se ela
// dependesse do nome do componente, a expansão para os outros eixos seria N implementações.
test("a camada não conhece o componente — o eixo é parâmetro", () => {
  expect(classesResponsivas("densidade", {base: "a", viewport: {sm: "b"}}))
    .toBe("densidade-a vp-sm:densidade-b");
});

// ── AS TRÊS FAMÍLIAS RESTANTES (22/08/2026) ────────────────────────────────────────────────────
// Fechar `size` em 18 de 18 exigiu MEDIR cada família antes de generalizar, e a medição derrubou
// a premissa de que havia uma escala só. Documento: `audit/activity-2/18-G-AXIS-04-FAMILIAS.md`.

test("cada família emite a PRÓPRIA classe no valor simples — a pele não é a do botão", () => {
  // Três bases diferentes, e a generalização preguiçosa (`btn-sm` para todo mundo) morre aqui.
  const {container} = wrap(<>
    <Checkbox label="a" size="sm"/><Switch label="b" size="lg"/>
    <Avatar fallback="AB" size="sm"/><Icon name="add" size="xl"/><Spinner size="lg" decorative/>
  </>);
  expect(container.querySelector(".control-mark")!.className).toContain("control-mark-sm");
  expect(container.querySelector(".switch-track")!.className).toContain("switch-track-lg");
  expect(container.querySelector(".avatar")!.className).toContain("avatar-sm");
  expect(container.querySelector(".icon")!.getAttribute("class")).toContain("icon-xl");
  expect(container.querySelector(".spinner")!.className).toContain("spinner-lg");
});

test("o degrau BASE não é `md` em toda família — o do Spinner é `sm`", () => {
  // Foi a presunção de que `md` é sempre a base que produziu os dois defeitos da família de campo.
  // Aqui ela é parâmetro, e o teste cobra os dois lados: `sm` não emite classe, `md` emite.
  const {container} = wrap(<><Spinner decorative/><Spinner size="sm" decorative/><Spinner size="md" decorative/></>);
  const [padrao, sm, md] = [...container.querySelectorAll(".spinner")];
  expect(padrao.className, "o padrão do spinner JÁ é o sm").not.toMatch(/spinner-(sm|md|lg)/);
  expect(sm.className, "`sm` é a base: não emite classe").not.toMatch(/spinner-(sm|md|lg)/);
  expect(md.className).toContain("spinner-md");
});

test("valor responsivo entra pela camada genérica nas três famílias", () => {
  const {container} = wrap(<>
    <Checkbox label="a" size={{base: "sm", container: {sm: "lg"}}}/>
    <Avatar fallback="AB" size={{base: "sm", viewport: {lg: "lg"}}}/>
    <Icon name="add" size={{base: "sm", container: {md: "xl"}}}/>
  </>);
  const mark = container.querySelector(".control-mark")!.className;
  expect(mark).toContain("size-sm");
  expect(mark).toContain("ct-sm:size-lg");
  expect(mark, "a classe do componente venceria a camada").not.toMatch(/control-mark-(sm|lg)/);
  expect(container.querySelector(".avatar")!.className).toContain("vp-lg:size-lg");
  const icone = container.querySelector(".icon")!.getAttribute("class")!;
  expect(icone).toContain("ct-md:size-xl");
  expect(icone).not.toMatch(/icon-(sm|lg|xl)/);
});

test("o passo do glifo é OUTRA escala, e a folha não confunde as duas", () => {
  // A medição de 22/08: `.icon` aparece dentro de um `.btn` em 323 das 327 páginas do catálogo.
  // Se o glifo lesse `--step-h`, todo ícone dentro de botão responsivo mudaria de tamanho sozinho.
  expect(css, "o glifo tem variável própria").toMatch(/\.icon \{[^}]*var\(--step-icon,var\(--icon-md\)\)/);
  expect(css, "e NÃO pode ler a altura de controle").not.toMatch(/\.icon \{[^}]*--step-h/);
  // E a marcação/identidade leem a MESMA grandeza do botão, porque a medição diz que é a mesma —
  // o que muda é a razão, e a razão fica no componente.
  expect(css).toMatch(/\.control-mark \{[^}]*calc\(var\(--step-h,var\(--control-h-md\)\) \/ 2\)/);
  expect(css).toMatch(/\.avatar \{[^}]*var\(--step-h,var\(--control-h-md\)\)/);
});

test("toda variável de passo é registrada como NÃO-HERDÁVEL", () => {
  // É o que impede o vazamento acima, e é regra de folha, não de componente: uma família nova que
  // esqueça disto volta a vazar. `syntax:"*"` não é detalhe — com sintaxe tipada o `@property`
  // exige `initial-value`, o fallback de `var()` nunca dispara e o core inteiro quebra.
  for (const v of ["--step-h", "--step-fs", "--step-gap", "--step-px", "--step-field-px",
                   "--step-select-pe", "--step-icon", "--step-qr", "--step-avatar-fs"]) {
    expect(css, `${v} sem registro herda e vaza para dentro dos filhos`)
      .toContain(`@property ${v} { syntax:"*"; inherits:false; }`);
  }
});

// ── O EIXO `orientation` (22/08/2026) ──────────────────────────────────────────────────────────
// Mesmo mecanismo, outra natureza: um passo de `size` é um conjunto de MEDIDAS e cabe numa
// variável; um de `orientation` é um conjunto de REGRAS, e por isso a camada emite regra por
// ponto. Custo medido em `audit/activity-2/19-ORIENTACAO-CUSTO.md`.

test("orientação simples continua emitindo a classe do componente", () => {
  const {container} = wrap(<>
    <ButtonGroup label="a" orientation="vertical"><Button>x</Button></ButtonGroup>
    <ButtonGroup label="b"><Button>x</Button></ButtonGroup>
  </>);
  const [vert, horiz] = [...container.querySelectorAll(".btn-group")];
  expect(vert.className).toContain("btn-group-vertical");
  expect(vert.className).not.toContain("ct-");
  expect(horiz.className, "horizontal é o desenho de partida e não emite classe")
    .not.toContain("btn-group-vertical");
});

test("o degrau base do Field é `vertical`, e o do resto é `horizontal`", () => {
  // Terceiro caso de base que não é o óbvio, depois do Spinner. Presumir base universal já
  // custou dois defeitos nesta atividade.
  const {container} = wrap(<>
    <Field label="a"><Input/></Field>
    <Field label="b" orientation="horizontal"><Input/></Field>
  </>);
  const [padrao, horiz] = [...container.querySelectorAll(".field")];
  expect(padrao.className, "vertical é a base do Field: não emite classe").not.toMatch(/field-(horizontal|vertical)/);
  expect(horiz.className).toContain("field-horizontal");
});

test("orientação responsiva entra pela camada, com a família de classe do COMPONENTE", () => {
  // Diferença real para o `size`: lá a família é uma só (`size-lg`), porque os degraus são
  // valores compartilhados. Aqui as regras são de cada componente — um `btn-group` vertical não
  // se parece com um `field` horizontal —, então a família é a do componente.
  const {container} = wrap(<>
    <ButtonGroup label="a" orientation={{base: "horizontal", container: {sm: "vertical"}}}><Button>x</Button></ButtonGroup>
    <Field label="b" orientation={{base: "vertical", viewport: {lg: "horizontal"}}}><Input/></Field>
  </>);
  const g = container.querySelector(".btn-group")!.className;
  expect(g).toContain("ct-sm:btn-group-vertical");
  expect(g, "a classe do componente venceria a camada").not.toMatch(/(^| )btn-group-vertical( |$)/);
  expect(container.querySelector(".field")!.className).toContain("vp-lg:field-horizontal");
});

test("a camada carrega a regra de orientação e a dos DESCENDENTES dela", () => {
  // Quatro das regras de orientação alcançam filhos. Se a camada só copiasse a regra do
  // componente, o `Field` responsivo viraria grid sem ninguém dizer em que coluna cada peça vai.
  expect(css).toMatch(/\.ct-sm\\:field-horizontal \{[^}]*display:grid/);
  expect(css).toMatch(/\.ct-sm\\:field-horizontal>\.label \{[^}]*grid-column:1/);
  expect(css).toMatch(/\.ct-sm\\:field-horizontal>\*:not\(\.label\) \{[^}]*grid-column:2/);
});

test("a camada NÃO oferece o eixo onde a orientação é anunciada e o CSS não pode acompanhar", () => {
  // Medido no banco de prova: o motor honra o `aria-orientation` — no Tabs horizontal,
  // ArrowDown/ArrowUp ficam parados. Desenhar em coluna por CSS e continuar anunciando
  // `horizontal` seria a API prometendo teclado que não existe. Cartão G-AXIS-06.
  for (const proibida of ["tabs-vertical", "menubar-vertical", "toolbar-vertical",
                          "toggle-group-vertical", "separator-vertical"]) {
    expect(css, `${proibida} na camada responsiva é orientação visual sem a semântica junto`)
      .not.toMatch(new RegExp(`\\.(vp|ct)-[a-z0-9]+\\\\:${proibida}`));
  }
  // e as três que SÃO oferecidas continuam lá, senão este teste passaria por vacuidade
  for (const permitida of ["btn-group-vertical", "range-vertical", "field-horizontal"])
    expect(css).toMatch(new RegExp(`\\.(vp|ct)-[a-z0-9]+\\\\:${permitida}`));
});

// ── O EIXO `layout` do adorno de campo (22/08/2026) ────────────────────────────────────────────
// Triagem em `21-G-AXIS-07-ALIGN.md`; a separação em dois eixos, na ADR-0048. O que autorizou o
// eixo, em um número: com o adorno em LINHA, a 200px de caixa sobram 48% da largura para o campo;
// com ele em FAIXA, 99%. O que a ADR separou: `side` decide a ordem no DOM e NÃO é responsivo;
// `layout` é geometria e é.

test("layout simples continua emitindo a classe da geometria, e o lado é classe à parte", () => {
  const {container} = wrap(<>
    <InputGroup><InputGroupAddon>a</InputGroupAddon><Input/></InputGroup>
    <InputGroup><InputGroupAddon side="end" layout="block">b</InputGroupAddon><Input/></InputGroup>
  </>);
  const [padrao, bloco] = [...container.querySelectorAll(".input-group-addon")];
  expect(padrao.className).toContain("input-group-addon-start");
  expect(padrao.className).toContain("input-group-addon-inline");
  expect(bloco.className).toContain("input-group-addon-end");
  expect(bloco.className).toContain("input-group-addon-block");
  // e o que NÃO pode mais existir: o enum achatado, que misturava as duas dimensões
  expect(container.innerHTML).not.toMatch(/input-group-addon-(inline|block)-(start|end)/);
});

test("o grupo põe o adorno `start` ANTES do controle no DOM, mesmo escrito depois", () => {
  // É o coração da correção estrutural: sem isto, separar os eixos não impediria ninguém de
  // escrever o adorno no lugar errado e o desenho voltaria a divergir da tabulação.
  const {container} = wrap(
    <InputGroup>
      <Input aria-label="campo"/>
      <InputGroupAddon side="start"><button>antes</button></InputGroupAddon>
      <InputGroupAddon side="end"><button>depois</button></InputGroupAddon>
    </InputGroup>);
  const ordem = [...container.querySelector(".input-group")!.children]
    .map((c) => c.className.includes("addon") ? c.className.match(/addon-(start|end)/)![1] : "controle");
  expect(ordem, "o adorno `start` foi escrito depois do campo e tem de sair antes dele")
    .toEqual(["start", "controle", "end"]);
});

test("dois adornos do mesmo lado preservam a ordem em que foram escritos", () => {
  const {container} = wrap(
    <InputGroup>
      <Input aria-label="campo"/>
      <InputGroupAddon side="end"><button>um</button></InputGroupAddon>
      <InputGroupAddon side="end"><button>dois</button></InputGroupAddon>
    </InputGroup>);
  const textos = [...container.querySelectorAll(".input-group-addon button")].map((b) => b.textContent);
  expect(textos, "ordenar por lado não pode embaralhar dentro do lado").toEqual(["um", "dois"]);
});

test("layout responsivo entra pela camada, e `side` NÃO aceita valor responsivo", () => {
  const {container} = wrap(
    <InputGroup>
      <InputGroupAddon side="start" layout={{base: "block", container: {sm: "inline"}}}>https://</InputGroupAddon>
      <Input/>
    </InputGroup>);
  const c = container.querySelector(".input-group-addon")!.className;
  expect(c).toContain("input-group-addon-block");
  expect(c).toContain("ct-sm:input-group-addon-inline");
  expect(c, "o lado é estrutural e não muda por largura").toContain("input-group-addon-start");
  // `side` responsivo nem compila: `AddonSide` não é `Responsive<AddonSide>`. O gate que impede
  // isso de virar capacidade genérica está no check 12c, e a razão está na ADR-0048.
});

test("a camada carrega as DUAS geometrias, com o recuo de cada lado junto", () => {
  for (const geo of ["inline", "block"]) {
    expect(css, `a geometria ${geo} não chegou à camada responsiva`)
      .toMatch(new RegExp(`\\.(vp|ct)-[a-z0-9]+\\\\:input-group-addon-${geo}`));
    expect(css, `o recuo do lado não acompanhou a geometria ${geo} na camada`)
      .toMatch(new RegExp(`\\.(vp|ct)-[a-z0-9]+\\\\:input-group-addon-${geo}\\.input-group-addon-start`));
  }
  // e o core não pode mais ter `order` no adorno: é o mecanismo que produzia a divergência
  expect(css, "o adorno voltou a posicionar por `order`").not.toMatch(/\.input-group-addon[^{]*\{[^}]*order:/);
});
