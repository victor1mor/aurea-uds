import {readFileSync} from "node:fs";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {
  AspectRatio, AureaProvider, Button, Collapsible, Field, Input, InputGroup, InputGroupAddon,
  Label, Menubar, PasswordField, Separator, Toggle, ToggleGroup,
} from "../../packages/react/src/index";

// Lote das capacidades que o MOTOR já entregava e a Aurea não expunha. A triagem da ATIVIDADE-2
// mediu: oito gaps verificados da fila já têm primitive no `@base-ui/react`, que já é dependência
// de runtime. Custo em dependência nova: zero.
//
// O que se cobra aqui é o CONTRATO, não a renderização — teste de fumaça passa em componente
// quebrado. Cada um foi rodado contra a ausência: sem a implementação, o arquivo nem importa.
const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);
const css = readFileSync("packages/core/src/aurea.css", "utf8");

async function semViolacao(el: Element) {
  const {violations} = await axe(el);
  if (!violations.length) return;
  throw new Error("axe: " + violations.map(v => `${v.id} (${v.nodes.length}): ${v.help}`).join("; "));
}

// ── Separator ──────────────────────────────────────────────────────────────

test("Separator: anuncia o papel e o EIXO — uma <div> nua não diz nada ao leitor de tela", () => {
  const {container} = wrap(<><Separator /><Separator orientation="vertical" /></>);
  // `hr` e não `[role="separator"]`: o componente É um <hr>, cujo papel de separador é NATIVO —
  // mais forte do que uma <div> com o atributo, que é o que este teste nasceu para impedir. O
  // motor calcula a orientação e publica os atributos SOBRE esse <hr> (`render`), e o `role`
  // redundante que ele escreveria por padrão é removido de propósito. O que o teste cobra
  // continua sendo o mesmo — papel e EIXO.
  const [h, v] = [...container.querySelectorAll("hr")];
  expect(h).toBeTruthy();
  expect(v).toBeTruthy();
  // horizontal é o default do ARIA e o motor pode omitir; vertical NUNCA pode ser omitido,
  // senão o leitor de tela anuncia uma divisão de linha onde há uma divisão de coluna.
  expect(v.getAttribute("aria-orientation")).toBe("vertical");
});

// A razão de o componente existir: a linha já era resolvida em `.toolbar-sep` e `.menu-sep`, e
// este seria o terceiro lugar. Se alguém voltar a escrever a cor da linha num deles, são dois
// lugares para mudar de novo — que é o defeito que o CLAUDE.md manda perguntar antes de repetir.
test("a linha do sistema mora num lugar só", () => {
  const corpo = (sel: string) =>
    new RegExp(`(^|[,}])[^{}]*\\${sel}\\b[^{]*\\{([^}]*)\\}`, "m").exec(css)?.[2] ?? "";
  expect(corpo(".separator")).toContain("--border");
  for (const local of [".toolbar-sep", ".menu-sep"]) {
    expect(corpo(local), `${local} existe`).not.toBe("");
  }
});

// ── Collapsible ────────────────────────────────────────────────────────────

test("Collapsible: o gatilho diz se está aberto, e o clique muda isso", async () => {
  const user = userEvent.setup();
  wrap(<Collapsible trigger="Opções avançadas">conteúdo</Collapsible>);
  const gatilho = screen.getByRole("button", {name: /Opções avançadas/});
  expect(gatilho).toHaveAttribute("aria-expanded", "false");
  await user.click(gatilho);
  expect(gatilho).toHaveAttribute("aria-expanded", "true");
});

test("Collapsible: o gatilho aponta para o painel que ele controla", () => {
  wrap(<Collapsible trigger="Detalhes" defaultOpen>conteúdo</Collapsible>);
  const gatilho = screen.getByRole("button", {name: /Detalhes/});
  const alvo = gatilho.getAttribute("aria-controls");
  expect(alvo, "sem aria-controls o leitor de tela não sabe o que abriu").toBeTruthy();
  expect(document.getElementById(alvo!)).toBeTruthy();
});

test("Collapsible: desabilitado não abre", async () => {
  const user = userEvent.setup();
  wrap(<Collapsible trigger="Bloqueado" disabled>conteúdo</Collapsible>);
  const gatilho = screen.getByRole("button", {name: /Bloqueado/});
  await user.click(gatilho);
  expect(gatilho).toHaveAttribute("aria-expanded", "false");
});

test("Collapsible: sem violação de axe, aberto e fechado", async () => {
  // DUAS MONTAGENS e não um `rerender`: trocar `defaultOpen` num Collapsible NÃO CONTROLADO
  // depois de montado é exatamente o que o Base UI 1.6 avisa em voz alta, e o `setup.ts` desta
  // suíte transforma grito do motor em reprovação — com razão. O que o teste quer é axe limpo
  // nos dois estados, e duas instâncias entregam isso sem usar a API de um jeito que a
  // documentação do motor desaconselha.
  // e a primeira SAI antes de a segunda entrar: cada `wrap` traz o próprio <main>, e dois
  // <main> no mesmo documento é `landmark-no-duplicate-main` no axe — reprovação do banco, não
  // do componente.
  const primeiro = wrap(<Collapsible trigger="A">conteúdo</Collapsible>);
  await semViolacao(primeiro.container);
  primeiro.unmount();
  const segundo = wrap(<Collapsible trigger="A" defaultOpen>conteúdo</Collapsible>);
  await semViolacao(segundo.container);
});

// ── ToggleGroup ────────────────────────────────────────────────────────────

// O ponto do componente: os filhos compartilham UM estado. Sem `value` chegando ao motor, o
// grupo renderiza igualzinho e não funciona — o `Toggle` da Aurea não repassava `value`, e o
// defeito apareceu ao escrever o exemplo do catálogo, não aqui. Este teste é o que impede que
// volte: se alguém tirar o repasse, a asserção de `aria-pressed` cai.
test("ToggleGroup: o estado é do GRUPO, e chega a quem escuta", async () => {
  const user = userEvent.setup();
  const visto: string[][] = [];
  wrap(
    <ToggleGroup label="Estilo" multiple defaultValue={["bold"]} onValueChange={(v) => visto.push(v)}>
      <Toggle value="bold">Negrito</Toggle>
      <Toggle value="italic">Itálico</Toggle>
    </ToggleGroup>,
  );
  expect(screen.getByRole("button", {name: "Negrito"})).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", {name: "Itálico"})).toHaveAttribute("aria-pressed", "false");
  await user.click(screen.getByRole("button", {name: "Itálico"}));
  expect(visto.at(-1)).toEqual(expect.arrayContaining(["bold", "italic"]));
});

// `multiple` é o que separa isto do SegmentedControl, que é escolha única e obrigatória.
test("ToggleGroup: sem `multiple`, ligar um desliga o outro", async () => {
  const user = userEvent.setup();
  wrap(
    <ToggleGroup label="Alinhamento" defaultValue={["left"]}>
      <Toggle value="left">Esquerda</Toggle>
      <Toggle value="center">Centro</Toggle>
    </ToggleGroup>,
  );
  await user.click(screen.getByRole("button", {name: "Centro"}));
  expect(screen.getByRole("button", {name: "Esquerda"})).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("button", {name: "Centro"})).toHaveAttribute("aria-pressed", "true");
});

// Roving tabindex: o grupo é UMA parada de tabulação e a seta anda por dentro. É o que o motor
// entrega e a razão de não ser um <div> com botões soltos.
test("ToggleGroup: uma parada de tabulação, e a seta anda por dentro", async () => {
  const user = userEvent.setup();
  wrap(
    <ToggleGroup label="Estilo">
      <Toggle value="a">A</Toggle>
      <Toggle value="b">B</Toggle>
    </ToggleGroup>,
  );
  const [a, b] = [screen.getByRole("button", {name: "A"}), screen.getByRole("button", {name: "B"})];
  await user.tab();
  expect(document.activeElement).toBe(a);
  expect(b.getAttribute("tabindex")).toBe("-1");
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(b);
});

test("ToggleGroup: o grupo tem nome acessível, e sem violação de axe", async () => {
  const {container} = wrap(
    <ToggleGroup label="Estilo do texto">
      <Toggle value="a">A</Toggle>
    </ToggleGroup>,
  );
  expect(screen.getByRole("group", {name: "Estilo do texto"})).toBeTruthy();
  await semViolacao(container);
});

// ── Menubar ────────────────────────────────────────────────────────────────

const MENUS = [
  {label: "Arquivo", items: [{label: "Novo"}, "separator" as const, {label: "Sair"}]},
  {label: "Editar", items: [{label: "Desfazer"}]},
];

test("Menubar: é um menubar de verdade, com gatilhos que anunciam menu", () => {
  wrap(<Menubar label="Principal" menus={MENUS} />);
  expect(screen.getByRole("menubar", {name: "Principal"})).toBeTruthy();
  const arquivo = screen.getByRole("menuitem", {name: "Arquivo"});
  expect(arquivo).toHaveAttribute("aria-haspopup", "menu");
  expect(arquivo).toHaveAttribute("aria-expanded", "false");
});

// O motivo de o componente existir, e o que o separa de três DropdownMenu soltos: com um menu
// ABERTO, a seta lateral passa para o VIZINHO. Se cada gatilho fosse independente, a seta lateral
// não faria nada — é o que este teste reprova.
//
// Abre por TECLADO, e não por clique, por limitação medida do ambiente: o motor abre o gatilho do
// menubar por evento de ponteiro, que o jsdom não entrega pelo `user.click` (conferido em
// 21/08/2026 — depois do clique o `aria-expanded` continua `false`; depois do Enter vira `true` e
// o popup existe no DOM). A abertura por ponteiro é do domínio da suíte de navegador; aqui se
// cobra o contrato de teclado, que é o que a APG exige de um menubar de qualquer forma.
test("Menubar: com um menu aberto, a seta passa para o vizinho", async () => {
  const user = userEvent.setup();
  wrap(<Menubar label="Principal" menus={MENUS} />);
  const [arquivo, editar] = [
    screen.getByRole("menuitem", {name: "Arquivo"}),
    screen.getByRole("menuitem", {name: "Editar"}),
  ];
  arquivo.focus();
  await user.keyboard("{Enter}");
  expect(arquivo).toHaveAttribute("aria-expanded", "true");
  await user.keyboard("{ArrowRight}");
  expect(editar).toHaveAttribute("aria-expanded", "true");
  expect(arquivo).toHaveAttribute("aria-expanded", "false");
});

test("Menubar: um menu desabilitado não abre", async () => {
  const user = userEvent.setup();
  wrap(<Menubar label="Principal" menus={[{...MENUS[0], disabled: true}]} />);
  const arquivo = screen.getByRole("menuitem", {name: "Arquivo"});
  expect(arquivo).toHaveAttribute("aria-disabled", "true");
  arquivo.focus();
  await user.keyboard("{Enter}");
  expect(arquivo).toHaveAttribute("aria-expanded", "false");
});

test("Menubar: sem violação de axe", async () => {
  const {container} = wrap(<Menubar label="Principal" menus={MENUS} />);
  await semViolacao(container);
});

// ── o estado que a pele desenha, o contrato declara ────────────────────────

// A ATIVIDADE-2 mediu: de 15 atributos `data-*` que o core estilizava, oito não eram declarados
// por ficha nenhuma. O check 27 do validador é a trava; este teste guarda o caso que mais
// importa, porque é uma distinção que se perde fácil.
//
// `highlighted` NÃO é `hover` e NÃO é `focus`. É o item apontado pelo TECLADO enquanto o foco
// continua no campo — num combobox, o foco nunca sai do input, e mesmo assim há um item
// "apontado". O motor distingue os três de propósito; quem escrever `:hover` no lugar quebra a
// navegação por seta para quem não usa mouse.
test("o item apontado pelo teclado tem estado próprio, e o core o pinta", () => {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "");
  expect(semComentario).toMatch(/\[data-highlighted\]/);
  // e não pode ser trocado por hover: as duas regras existem, e são regras diferentes
  expect(semComentario).toMatch(/\.menu-item:hover/);
});

// ── validação: o erro só aparece depois de a pessoa mexer ──────────────────

// A ATIVIDADE-2 achou isto medindo os 68 estados do motor contra os nossos: a base-ui tem
// `dirty`, `touched`, `valid` e `invalid`; a Aurea só tinha `invalid`. Sem `touched` não dá para
// escrever a regra que todo formulário quer — não pinte o erro antes de a pessoa ter mexido no
// campo — e é por isso que as bibliotecas carregam um estado `touched` em JavaScript.
//
// A resposta escolhida não foi um estado nosso: foi `:user-invalid`, que é a resposta da
// PLATAFORMA e faz exatamente isso sem uma linha de JS, no exemplo vanilla inclusive.
//
// O teste guarda a regra, e a segunda asserção é a que importa: `:invalid` CRU pintaria o
// formulário inteiro de vermelho antes do primeiro caractere digitado. Se alguém trocar um pelo
// outro "porque é mais simples", isto reprova.
test("validação nativa pinta com :user-invalid, e nunca com :invalid cru", () => {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "");
  expect(semComentario).toMatch(/\.input:user-invalid/);
  expect(semComentario).not.toMatch(/\.(input|select|textarea):invalid\b/);
});

// O terceiro campo da família tinha ficado de fora da regra de `aria-invalid`: um select marcado
// como inválido pela aplicação não mostrava nada. É a pergunta "quem mais tem esse problema?".
test("os três campos da família marcam inválido, não só dois", () => {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const campo of ["input", "textarea", "select"]) {
    expect(semComentario, `${campo} sem regra de aria-invalid`)
      .toMatch(new RegExp(`\\.${campo}\\[aria-invalid`));
  }
});

// ── PasswordField ──────────────────────────────────────────────────────────

// Gap achado pela comparação de FAMÍLIA de primitives (base-ui × radix), não pela triagem por
// nome: `password-toggle-field` na radix e `password-input` no Shark UI são a mesma capacidade
// com nomes que não casam, então a evidência ficou dividida e caiu abaixo do corte.
//
// As duas referências convergem na anatomia, e é o que se cobra aqui.
test("PasswordField: esconde por padrão, e o botão troca o tipo do campo", async () => {
  const user = userEvent.setup();
  const {container} = wrap(<PasswordField defaultValue="segredo" aria-label="Senha" />);
  const campo = container.querySelector("input")!;
  expect(campo.type).toBe("password");
  await user.click(screen.getByRole("button"));
  expect(campo.type).toBe("text");
  expect(campo.value, "trocar o tipo não pode perder o valor digitado").toBe("segredo");
});

// O rótulo QUE MUDA é o anúncio. Sem ele, o leitor de tela ouve "botão" e não sabe o que faz.
test("PasswordField: o botão diz o que faz, e muda quando o estado muda", async () => {
  const user = userEvent.setup();
  wrap(<PasswordField aria-label="Senha" />);
  expect(screen.getByRole("button", {name: /show password/i})).toBeTruthy();
  await user.click(screen.getByRole("button"));
  expect(screen.getByRole("button", {name: /hide password/i})).toBeTruthy();
});

// `aria-pressed` JUNTO com o rótulo que muda faz o leitor dizer a mesma coisa duas vezes
// ("Mostrar senha, não pressionado"). Nenhuma das duas referências faz isso, e este teste é o que
// impede alguém de "melhorar" acrescentando.
test("PasswordField: o botão aponta para o campo, e NÃO usa aria-pressed", () => {
  const {container} = wrap(<PasswordField aria-label="Senha" />);
  const botao = screen.getByRole("button");
  const campo = container.querySelector("input")!;
  expect(botao.getAttribute("aria-controls")).toBe(campo.id);
  expect(botao.hasAttribute("aria-pressed")).toBe(false);
});

test("PasswordField: sem violação de axe, escondido e visível", async () => {
  const user = userEvent.setup();
  const {container} = wrap(<Field label="Senha"><PasswordField /></Field>);
  await semViolacao(container);
  await user.click(screen.getByRole("button"));
  await semViolacao(container);
});

// ── Label e AspectRatio ────────────────────────────────────────────────────

test("Label: liga-se ao controle, que é a única razão de ele existir", () => {
  wrap(<><Label htmlFor="cx">Workspace</Label><input id="cx" /></>);
  expect(screen.getByLabelText("Workspace")).toBeTruthy();
});

test("AspectRatio: a proporção vai para o CSS, não para um padding calculado", () => {
  const {container} = wrap(<AspectRatio ratio={16 / 9}><span>x</span></AspectRatio>);
  const caixa = container.querySelector(".aspect-ratio") as HTMLElement;
  // O navegador serializa `aspect-ratio: 1.777…` como `1.777… / 1`, que é a forma canônica da
  // propriedade. Comparar com o número cru reprovaria por causa da serialização, não do valor.
  expect(caixa.style.aspectRatio.startsWith(String(16 / 9))).toBe(true);
  // `min-width:0` é o que impede a caixa de estourar a coluna de um grid — o defeito que quem
  // escreve isso à mão esquece.
  expect(css.replace(/\/\*[\s\S]*?\*\//g, "")).toMatch(/\.aspect-ratio\s*\{[^}]*min-inline-size:0/);
});

// ── a matriz aparência × tom do botão ──────────────────────────────────────

// O enum de variante do botão é o PRODUTO CARTESIANO de dois eixos — aparência (solid, outline,
// ghost, link) e tom (neutral, brand, danger) — achatado num só. Decompondo contra o eixo que o
// `DIRECTION.md` §5 já declara como direção, duas células estavam vazias: o tom de marca existia
// em `solid` e em `link`, e não existia em `outline` nem em `ghost`. A Aurea não tinha o botão de
// ação secundária mais comum do mercado.
//
// Este teste é a matriz escrita. Se alguém acrescentar um tom novo e esquecer uma aparência, a
// célula vazia aparece aqui — que é o custo do modelo achatado, registrado em `G-API-01`.
test.each([
  ["solid", {neutral: "secondary", brand: "primary", danger: "danger"}],
  ["outline", {neutral: "outline", brand: "primary-outline", danger: "danger-outline"}],
  ["ghost", {neutral: "ghost", brand: "primary-ghost", danger: "danger-ghost"}],
  ["link", {neutral: "link", brand: "link-primary", danger: "link-danger"}],
] as const)("aparência %s: existe nos três tons, e cada um tem pele", (_aparencia, tons) => {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const [tom, variante] of Object.entries(tons)) {
    const {container} = wrap(<Button variant={variante as never}>x</Button>);
    expect(container.querySelector(`.btn-${variante}`), `${variante} não emitiu classe`).not.toBeNull();
    expect(semComentario, `.btn-${variante} (tom ${tom}) sem regra no core`)
      .toMatch(new RegExp(`\\.btn-${variante}\\s*[,{]`));
  }
});

// ── InputGroup ─────────────────────────────────────────────────────────────

// §21 na prática: eu já tinha resolvido "coisa grudada no campo" DUAS vezes localmente —
// `.input-wrap` para o glifo do SearchField, `.input-wrap-end` para o botão do PasswordField — e
// a terceira seria a hora de parar. Três referências têm o componente geral.
//
// A anatomia que converge nelas, e que este teste cobra: a MOLDURA é do grupo, e o controle de
// dentro abre mão da dele. Sem isso o adorno flutua sobre o campo em vez de morar dentro dele, e
// aparecem duas bordas concêntricas.
test("InputGroup: a moldura é do grupo, e o controle de dentro abre mão da dele", () => {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const regra = (sel: string) =>
    [...semComentario.matchAll(new RegExp(`(?:^|[,}])[^{}]*\\${sel}[^{]*\\{([^}]*)\\}`, "gm"))]
      .map((m) => m[1]).join(" ");
  expect(regra(".input-group"), "o grupo precisa de borda").toMatch(/border:1px solid/);
  expect(regra(".input-group>.input"), "o campo de dentro precisa perder a borda").toMatch(/border:0/);
});

// O foco é do CONTROLE, mas o anel tem de aparecer na MOLDURA: o contorno do input de dentro
// ficaria escondido atrás da borda do grupo, e quem navega por teclado não veria onde está.
test("InputGroup: o anel de foco aparece na moldura, não no campo escondido", () => {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "");
  expect(semComentario).toMatch(/\.input-group:focus-within\s*\{[^}]*outline:/);
  expect(semComentario).toMatch(/\.input-group>\.input:focus-visible[^{]*\{[^}]*outline:none/);
});

test("InputGroup: o adorno não rouba o rótulo do campo", () => {
  const {container} = wrap(
    <InputGroup>
      <InputGroupAddon>https://</InputGroupAddon>
      <Input aria-label="Domínio" />
    </InputGroup>,
  );
  expect(screen.getByLabelText("Domínio")).toBeTruthy();
  expect(container.querySelector(".input-group-addon-start")).not.toBeNull();
});

// O adorno já sobreviveu a DUAS migrações de API, e este teste pegou as duas: `start|end` →
// quatro valores lógicos (21/08, G-API-01), e o enum achatado → dois eixos (22/08, ADR-0048).
// Cada valor de cada eixo tem de ter regra própria no core; sem isso a classe sai e não pinta.
test.each([["start"], ["end"], ["inline"], ["block"]] as const)(
  "InputGroupAddon: o valor %s tem regra própria no core", (valor) => {
    expect(css.replace(/\/\*[\s\S]*?\*\//g, ""))
      .toMatch(new RegExp(`\\.input-group-addon-${valor}[.\\s]`));
  });

// A consolidação inteira, guardada. Havia TRÊS consumidores do mecanismo local — SearchField,
// PasswordField e MessageComposer — e agora há um mecanismo só. Se alguém ressuscitar o
// `.input-wrap`, voltam a existir dois jeitos de grudar coisa num campo, e volta com ele o
// defeito que a consolidação matou: o vão de 40px que aparecia mesmo sem ícone.
test("os três consumidores usam o grupo, e o mecanismo antigo não existe mais", () => {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "");
  expect(semComentario).not.toMatch(/\.input-wrap/);
  const {container} = wrap(<PasswordField aria-label="Senha" />);
  expect(container.querySelector(".input-group")).not.toBeNull();
});

// ── a barra de rolagem ──────────────────────────────────────────────────────

// A Aurea ESCONDIA a barra em `.sidebar` e `.toc`. Região que rola sem barra visível não avisa
// que rola e não dá o que arrastar — é um controle removido, não uma escolha de estilo. Este
// teste guarda os dois lados: a barra existe, e ela não volta a sumir.
test("nenhuma região do core esconde a própria barra de rolagem", () => {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "");
  expect(semComentario, "scrollbar-width:none tira a barra do Firefox e do Chrome")
    .not.toMatch(/scrollbar-width:\s*none/);
  expect(semComentario, "::-webkit-scrollbar de largura zero tira a barra do Safari")
    .not.toMatch(/::-webkit-scrollbar\s*\{[^}]*(inline-size|width):\s*0/);
});

// Os dois caminhos são necessários e a razão está medida: `scrollbar-color` só chegou ao Safari
// na 26.2, e o `::-webkit-scrollbar` só chegou ao Firefox na 153. Um sozinho deixa um navegador
// grande de fora, e é por isso que a asserção cobra os DOIS.
test("a barra segue o tema nos dois caminhos, o padrão e o do webkit", () => {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "");
  expect(semComentario).toMatch(/scrollbar-color:\s*var\(--border-strong\)/);
  expect(semComentario).toMatch(/::-webkit-scrollbar-thumb[^{]*\{[^}]*background:\s*var\(--border-strong\)/);
});
