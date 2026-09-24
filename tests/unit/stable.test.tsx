import {useState} from "react";
import {render, screen, waitFor, act} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {vi} from "vitest";
import {
  AureaProvider, useAureaTheme, Accordion, Avatar, Breadcrumb, Button, CodeBlock, Combobox, CommandPaletteShell, CommandPalette,
  DataList, EmptyState, Field, Form, Icon, Input, LogStream, MediaPlayerShell, Progress, Radio,
  SegmentedControl, Switch, Tabs, Timeline,
} from "../../packages/react/src/index";

// Os 15 componentes que se declaravam `Stable` na ficha e não tinham UM teste (auditoria de
// 26/07/2026, achados M7 e M8). "Stable" sem teste é um rótulo que engana quem consome — e
// era o caso de 15 dos 59 marcados assim.
//
// Cada teste aqui exige o CONTRATO do componente, não que ele "renderize": semântica, nome
// acessível, comportamento de teclado. Teste de fumaça passa em componente quebrado.
const wrap = (ui: React.ReactNode) => render(<AureaProvider><main>{ui}</main></AureaProvider>);

async function semViolacao(el: Element) {
  const {violations} = await axe(el);
  if (!violations.length) return;
  throw new Error("axe: " + violations
    .map(v => v.id + " (" + v.nodes.length + "): " + v.help).join("; "));
}

// Usa <details>/<summary> nativo, e isso é a escolha certa: abre sem JS, tem estado próprio e
// o navegador já anuncia expandido/recolhido. Por isso o teste exige a SEMÂNTICA nativa em vez
// de aria-expanded — que aqui seria redundante — e não testa o toggle: o comportamento é do
// motor, não nosso (AUREA.md §2.2). O jsdom, aliás, não implementa o toggle de details.
test("Accordion: usa disclosure nativo, um por item", async () => {
  const {container} = wrap(<Accordion items={[
    {id: "a", title: "Primeiro", content: <p>Um</p>},
    {id: "b", title: "Segundo", content: <p>Dois</p>},
  ]} />);
  const detalhes = container.querySelectorAll("details");
  expect(detalhes).toHaveLength(2);
  for (const d of detalhes) expect(d.querySelector("summary")).not.toBeNull();
  expect(container).toHaveTextContent("Primeiro");
  expect(container).toHaveTextContent("Um");
  await semViolacao(container);
});

test("Avatar: imagem tem alt; sem imagem, a inicial não vira ruído de leitor de tela", async () => {
  const {container} = wrap(<>
    <Avatar src="/foto.png" alt="Ana Lima" />
    <Avatar fallback="AL" />
  </>);
  expect(screen.getByRole("img", {name: "Ana Lima"})).toBeInTheDocument();
  // o fallback é decorativo: quem identifica a pessoa é o texto ao lado, não as iniciais
  expect(screen.queryByRole("img", {name: "AL"})).toBeNull();
  await semViolacao(container);
});

test("Breadcrumb: é navegação nomeada e marca a página atual", async () => {
  const {container} = wrap(<Breadcrumb items={[
    {label: "Início", href: "#i"}, {label: "Componentes", href: "#c"}, {label: "Button"},
  ]} />);
  const nav = screen.getByRole("navigation");
  expect(nav).toHaveAccessibleName();
  // o último item não é link e precisa se anunciar como atual
  expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent("Button");
  await semViolacao(container);
});

test("CodeBlock: o código é legível como texto e o botão de copiar tem nome", async () => {
  const {container} = wrap(<CodeBlock language="tsx" copyable>{'const a = 1;'}</CodeBlock>);
  expect(container).toHaveTextContent("const a = 1;");
  expect(screen.getByRole("button")).toHaveAccessibleName();
  await semViolacao(container);
});

// O <pre> é `overflow:auto` no core, ou seja, região ROLÁVEL sem nada focável dentro. Sem o
// tabIndex, código mais largo que a caixa é inalcançável por teclado — axe
// `scrollable-region-focusable`, que reprovou o catálogo em 10/08/2026 assim que uma linha de
// import ficou comprida. O jsdom não tem layout, então quem cobra aqui é o ATRIBUTO; a
// violação em si o `catalog-sweep` cobra na página de verdade, nos dois temas.
test("CodeBlock: o <pre> é alcançável por teclado, com e sem copiar", () => {
  for (const copyable of [true, false]) {
    const {container, unmount} = wrap(<CodeBlock language="tsx" copyable={copyable}>{'const a = 1;'}</CodeBlock>);
    expect(container.querySelector("pre.code-block"), `copyable=${copyable}`).toHaveAttribute("tabindex", "0");
    unmount();
  }
});

test("CommandPaletteShell: o campo de busca é rotulado", async () => {
  const {container} = wrap(
    <CommandPaletteShell open query="" onQueryChange={() => {}}>
      <p>Resultados</p>
    </CommandPaletteShell>,
  );
  // SearchField é input[type=search], então o papel é searchbox e não textbox
  expect(screen.getByRole("searchbox")).toHaveAccessibleName();
  expect(screen.getByRole("dialog")).toHaveAccessibleName();
  await semViolacao(container);
});

test("DataList: par termo/valor usa dl, não tabela improvisada", async () => {
  const {container} = wrap(<DataList items={[
    {term: "Plano", value: "Pro"}, {term: "Assentos", value: "12"},
  ]} />);
  expect(container.querySelectorAll("dt")).toHaveLength(2);
  expect(container.querySelectorAll("dd")).toHaveLength(2);
  await semViolacao(container);
});

test("EmptyState: o título entra na hierarquia no nível que o consumidor manda", async () => {
  const {container} = wrap(
    <EmptyState titleAs="h2" title="Nada aqui" description="Tente outro filtro."
      action={<Button>Limpar</Button>} />,
  );
  // titleAs existe porque um h3 fixo criava salto de nível na página — foi o achado A5 da
  // auditoria de 26/07. O teste tranca o motivo.
  expect(screen.getByRole("heading", {level: 2, name: "Nada aqui"})).toBeInTheDocument();
  await semViolacao(container);
});

// AUD-0001 (achado A12 reaberto em 12/08/2026). O comentário do componente afirmava desde 30/07
// que hint e erro eram descrição e não nome — e a marcação os mantinha dentro do `<label>`.
// Quem deixou passar foi ESTE teste: ele pedia `/E-mail/`, e essa regex casa com
// "E-mail Usamos para entrar Endereço inválido" inteirinho. As asserções abaixo são EXATAS de
// propósito; com a versão antiga do Field, as três primeiras reprovam.
test("Field: o nome é SÓ o rótulo — hint e erro DESCREVEM, nunca nomeiam", async () => {
  const {container} = wrap(
    <Field label="E-mail" hint="Usamos para entrar" error="Endereço inválido">
      <Input defaultValue="x" />
    </Field>,
  );
  const campo = screen.getByRole("textbox", {name: "E-mail"});
  expect(campo).toHaveAccessibleName("E-mail");
  expect(campo).toHaveAccessibleDescription("Usamos para entrar Endereço inválido");
  expect(campo).toHaveAttribute("aria-invalid", "true");
  // ligação de VERDADE: o <label> aponta para o id que o controle realmente tem. Sem esta
  // asserção, um `htmlFor` apontando para id inexistente passaria — e a ficha prometia o id.
  expect(campo.id).toBeTruthy();
  expect(container.querySelector<HTMLLabelElement>("label[for]")?.htmlFor).toBe(campo.id);
  // e o contêiner deixou de ser <label>: era ele que grudava hint e erro no nome
  expect(container.querySelector(".field")?.tagName).toBe("DIV");
  await semViolacao(container);
});

// O outro lado do AUD-0001: controle que TRAZ rótulo próprio. Antes, o contêiner `<label>` do
// Field produzia `<label>` dentro de `<label>` — HTML inválido — e o nome do switch virava a
// concatenação dos dois rótulos.
test("Field + Switch: um nome por controle, e nenhum <label> dentro de <label>", async () => {
  const {container} = wrap(
    <Field label="Notificações" hint="Só as urgentes">
      <Switch label="Ativo" defaultChecked />
    </Field>,
  );
  expect(container.querySelector("label label")).toBeNull();
  const sw = screen.getByRole("switch", {name: "Ativo"});
  expect(sw).toHaveAccessibleName("Ativo");
  expect(sw).toHaveAccessibleDescription("Só as urgentes");
  // o Field passa a ser o GRUPO nomeado — que é o que a ficha dele sempre declarou
  expect(screen.getByRole("group", {name: "Notificações"})).toBeInTheDocument();
  await semViolacao(container);
});

// Vários filhos: é o uso que o catálogo já faz (um rótulo, várias respostas). Aqui `htmlFor`
// apontaria para um id que não existe, então a forma certa é grupo nomeado.
test("Field com vários filhos: grupo nomeado, sem htmlFor apontando para o vazio", async () => {
  const {container} = wrap(
    <Field label="Visibilidade" error="Escolha uma">
      <Radio name="vis" label="Privado" />
      <Radio name="vis" label="Público" />
    </Field>,
  );
  const grupo = screen.getByRole("group", {name: "Visibilidade"});
  expect(grupo).toHaveAccessibleDescription("Escolha uma");
  expect(container.querySelector("label[for]")).toBeNull();
  expect(screen.getAllByRole("radio")).toHaveLength(2);
  await semViolacao(container);
});

test("Field trata Fragment de um controle como um, e Fragment com vários como grupo", async () => {
  const {container} = wrap(<>
    <Field label="E-mail" hint="Usamos para entrar"><><Input /></></Field>
    <Field label="Visibilidade" error="Escolha uma"><><Radio name="vis" label="Privado" /><Radio name="vis" label="Público" /></></Field>
  </>);
  const campo = screen.getByRole("textbox", {name: "E-mail"});
  expect(campo).toHaveAccessibleDescription("Usamos para entrar");
  expect(container.querySelector<HTMLLabelElement>("label[for]")?.htmlFor).toBe(campo.id);
  const grupo = screen.getByRole("group", {name: "Visibilidade"});
  expect(grupo).toHaveAccessibleDescription("Escolha uma");
  expect(grupo.querySelector("label[for]")).toBeNull();
  await semViolacao(container);
});

test("Field não presume que componente arbitrário repassa id e ARIA ao controle interno", async () => {
  function WrapperDeLayout() {
    return <div><Input aria-label="Busca interna" /></div>;
  }
  const {container} = wrap(
    <Field label="Filtros" error="Revise os filtros">
      <WrapperDeLayout />
    </Field>,
  );
  const grupo = screen.getByRole("group", {name: "Filtros"});
  expect(grupo).toHaveAccessibleDescription("Revise os filtros");
  expect(container.querySelector("label[for]")).toBeNull();
  expect(screen.getByRole("textbox", {name: "Busca interna"})).toBeInTheDocument();
  await semViolacao(container);
});

test("Field trata aria-label próprio como nome do controle e nomeia o conjunto sem segundo label", async () => {
  const {container} = wrap(
    <Field label="Conta" hint="Use a conta corporativa">
      <Input aria-label="E-mail corporativo" />
    </Field>,
  );
  const grupo = screen.getByRole("group", {name: "Conta"});
  const campo = screen.getByRole("textbox", {name: "E-mail corporativo"});
  expect(campo).toHaveAccessibleDescription("Use a conta corporativa");
  expect(grupo.querySelector("label[for]")).toBeNull();
  await semViolacao(container);
});

// Combobox destrincha uma lista FIXA de props, então tudo que o Field clonava nele era
// descartado em silêncio — o input não recebia aria-invalid nem aria-describedby.
test("Field + Combobox: a injeção alcança o input, que é o nó focal", async () => {
  const {container} = wrap(
    <Field label="Responsável" error="Escolha alguém">
      <Combobox items={[{value: "a", label: "Ana"}]} />
    </Field>,
  );
  const entrada = screen.getByRole("combobox");
  expect(entrada).toHaveAccessibleName("Responsável");
  expect(entrada).toHaveAccessibleDescription("Escolha alguém");
  expect(entrada).toHaveAttribute("aria-invalid", "true");
  await semViolacao(container);
});

test("Icon: é decorativo por padrão — sai do leitor de tela", async () => {
  const {container} = wrap(<Icon name="add" />);
  const svg = container.querySelector("svg");
  // ícone que repete o rótulo do botão e é anunciado gera leitura dobrada
  expect(svg).toHaveAttribute("aria-hidden", "true");
  await semViolacao(container);
});

test("LogStream: as linhas são legíveis em ordem", async () => {
  const {container} = wrap(<LogStream lines={[
    {time: "09:00", level: "info", text: "subiu"},
    {time: "09:01", level: "error", text: "caiu"},
  ]} />);
  expect(container).toHaveTextContent("subiu");
  expect(container).toHaveTextContent("caiu");
  await semViolacao(container);
});

test("MediaPlayerShell: repassa props ao elemento raiz", async () => {
  const {container} = wrap(<MediaPlayerShell data-teste="ok"><p>conteúdo</p></MediaPlayerShell>);
  // era um dos que descartavam props em silêncio até a Fase 3 (achado A9)
  expect(container.querySelector('[data-teste="ok"]')).not.toBeNull();
  await semViolacao(container);
});

test("Progress: expõe valor, mínimo e máximo", async () => {
  const {container} = wrap(<Progress value={64} label="Enviando" />);
  const barra = screen.getByRole("progressbar");
  expect(barra).toHaveAttribute("aria-valuenow", "64");
  expect(barra).toHaveAttribute("aria-valuemin", "0");
  expect(barra).toHaveAttribute("aria-valuemax", "100");
  expect(barra).toHaveAccessibleName("Enviando");
  await semViolacao(container);
});

// Pega o defeito da Parte E: o grampo valia só para o DESENHO, e o `aria-valuenow` saía cru.
// Quem enxerga via a barra parar em 100%; quem usa leitor de tela ouvia "150 de 100". A
// asserção do preenchimento vai junto porque o defeito inverso — grampear o ARIA e esquecer a
// largura — passaria num teste que só olha o atributo.
test("Progress: valor fora de 0..100 é grampeado no ARIA e no desenho", () => {
  for (const [valor, esperado] of [[150, "100"], [-10, "0"]] as const) {
    const {container} = wrap(<Progress value={valor} />);
    expect(container.querySelector('[role="progressbar"]')).toHaveAttribute("aria-valuenow", esperado);
    expect(container.querySelector(".progress > span")).toHaveStyle({width: `${esperado}%`});
  }
});

// SegmentedControl — o achado M20 fechou aqui (Parte C, 07/08/2026), e o teste virou do avesso.
// ANTES ele trancava o defeito: `role="group"` com N `aria-pressed`, que descreve N alternâncias
// independentes e nunca anuncia "1 de 2". AGORA ele tranca o padrão APG de radiogroup — e a
// asserção que importa é a do TECLADO, porque é ela que separa "trocamos o nome do papel" de
// "entregamos o padrão". Decisão registrada na ADR-0016.
function PalcoSegmented() {
  const [v, setV] = useState("dia");
  return <SegmentedControl label="Período" value={v} onChange={setV}
    items={[{value: "dia", label: "Dia"}, {value: "mes", label: "Mês"}]} />;
}
const marcados = () => screen.getAllByRole("radio")
  .filter(b => b.getAttribute("aria-checked") === "true").map(b => b.textContent);

test("SegmentedControl: é um radiogroup nomeado, e só um item marcado por vez", async () => {
  const u = userEvent.setup();
  const {container} = wrap(<PalcoSegmented />);
  expect(screen.getByRole("radiogroup")).toHaveAccessibleName("Período");
  // e NENHUM aria-pressed sobrou: os dois modelos juntos seriam pior que qualquer um deles
  expect(container.querySelectorAll("[aria-pressed]")).toHaveLength(0);
  expect(marcados()).toEqual(["Dia"]);
  await u.click(screen.getByRole("radio", {name: "Mês"}));
  expect(marcados()).toEqual(["Mês"]);
  await semViolacao(container);
});

test("SegmentedControl: um só ponto de tabulação, e a seta move E seleciona", async () => {
  const u = userEvent.setup();
  wrap(<PalcoSegmented />);
  // roving tabindex: o grupo inteiro é UMA parada de Tab, não uma por opção
  const tabulaveis = screen.getAllByRole("radio").filter(r => r.getAttribute("tabindex") !== "-1");
  expect(tabulaveis, "num radiogroup só o item marcado é tabulável").toHaveLength(1);
  expect(tabulaveis[0]).toHaveTextContent("Dia");
  await u.tab();
  expect(screen.getByRole("radio", {name: "Dia"})).toHaveFocus();
  // no padrão APG a seta não só move o foco: ela TROCA a escolha
  await u.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", {name: "Mês"})).toHaveFocus();
  expect(marcados(), "a seta seleciona, não só navega").toEqual(["Mês"]);
});

test("Tabs: aba e painel se referenciam, e a seta navega", async () => {
  const u = userEvent.setup();
  function Palco() {
    const [v, setV] = useState("um");
    return <Tabs label="Seções" value={v} onChange={setV} tabs={[
      {id: "um", label: "Um", content: <p>Painel um</p>},
      {id: "dois", label: "Dois", content: <p>Painel dois</p>},
    ]} />;
  }
  const {container} = wrap(<Palco />);
  const aba = screen.getByRole("tab", {name: "Um"});
  expect(aba).toHaveAttribute("aria-selected", "true");
  const painel = screen.getByRole("tabpanel");
  // a ligação aba↔painel é o que faz o leitor de tela saber o que a aba controla
  expect(aba).toHaveAttribute("aria-controls", painel.id);
  aba.focus();
  await u.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", {name: "Dois"})).toHaveAttribute("aria-selected", "true");
  await semViolacao(container);
});

test("Timeline: os eventos são uma lista, não divs soltas", async () => {
  const {container} = wrap(<Timeline items={[
    {title: "Criado", time: "09:00"}, {title: "Enviado", time: "14:20", description: "por Ana"},
  ]} />);
  expect(container).toHaveTextContent("Criado");
  expect(container).toHaveTextContent("por Ana");
  await semViolacao(container);
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// M7 — useAureaTheme. O hook lê o DOM, não um estado próprio, e é isso que o teste cobra: quem
// manda no tema pode ser outro (next-themes, script no <head>, o window.Aurea de sempre), e o
// React tem de acompanhar. Provado contra o defeito em 13/08/2026: trocar o
// `useSyncExternalStore` por `useState` faz o terceiro teste reprovar.
describe("useAureaTheme — o React acompanha quem manda no <html>", () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.density;
  });

  function Palco() {
    const {theme, density, setTheme, setDensity, toggleTheme} = useAureaTheme();
    return (
      <>
        <span data-lido>{theme ?? "desconhecido"}</span>
        <span data-densidade>{density ?? "desconhecida"}</span>
        <button onClick={() => setTheme("light")}>claro</button>
        <button onClick={() => setDensity("compact")}>compacto</button>
        <button onClick={toggleTheme}>alternar</button>
      </>
    );
  }

  test("lê o que já está no <html>", () => {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.dataset.density = "spacious";
    render(<AureaProvider><Palco /></AureaProvider>);
    expect(document.querySelector("[data-lido]")).toHaveTextContent("dark");
    expect(document.querySelector("[data-densidade]")).toHaveTextContent("spacious");
  });

  test("escreve no <html>, que é onde os tokens olham", async () => {
    const u = userEvent.setup();
    render(<AureaProvider><Palco /></AureaProvider>);
    await u.click(screen.getByRole("button", {name: "claro"}));
    expect(document.documentElement.dataset.theme).toBe("light");
    await u.click(screen.getByRole("button", {name: "compacto"}));
    expect(document.documentElement.dataset.density).toBe("compact");
  });

  // O defeito que este pega: se o hook guardasse o valor em `useState`, uma troca feita POR FORA
  // — que é o caso normal quando o consumidor usa next-themes — deixaria o React desatualizado,
  // e o botão de tema desenharia o ícone errado.
  test("quem troca por fora também é acompanhado", async () => {
    document.documentElement.dataset.theme = "dark";
    render(<AureaProvider><Palco /></AureaProvider>);
    expect(document.querySelector("[data-lido]")).toHaveTextContent("dark");
    await act(async () => { document.documentElement.dataset.theme = "light"; });
    await waitFor(() =>
      expect(document.querySelector("[data-lido]"), "o hook lê o DOM, não um estado próprio")
        .toHaveTextContent("light"));
  });

  test("sem ninguém ter escolhido, o tema é desconhecido — e alternar leva ao escuro", async () => {
    const u = userEvent.setup();
    render(<AureaProvider><Palco /></AureaProvider>);
    expect(document.querySelector("[data-lido]"), "no servidor e antes da escolha, null")
      .toHaveTextContent("desconhecido");
    await u.click(screen.getByRole("button", {name: "alternar"}));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// M1 — Form. A regra: a Aurea EXIBE o erro, o consumidor DECIDE o que é erro. Nenhuma biblioteca
// de formulário entrou, e o motor já fazia essa divisão — `errors` é, no tipo dele, "erros
// retornados externamente, tipicamente depois do envio por um servidor ou action".
describe("Form — exibe o erro, não decide o erro", () => {
  test("erro externo chega ao campo pelo name, e é anunciado", async () => {
    render(
      <AureaProvider>
        <Form errors={{email: "Já existe uma conta com este e-mail"}}>
          <Field label="E-mail" name="email"><Input name="email" type="email" /></Field>
          <Field label="Apelido" name="apelido"><Input name="apelido" /></Field>
        </Form>
      </AureaProvider>,
    );
    const campo = screen.getByLabelText("E-mail");
    await waitFor(() => expect(campo).toHaveAttribute("aria-invalid", "true"));
    expect(screen.getByText("Já existe uma conta com este e-mail")).toBeInTheDocument();
    const descrito = campo.getAttribute("aria-describedby");
    expect(descrito, "sem describedby o leitor de tela não lê o motivo").toBeTruthy();
    expect(screen.getByLabelText("Apelido"), "o outro campo fica limpo")
      .not.toHaveAttribute("aria-invalid", "true");
  });

  test("sem name, o Field é exatamente o de antes", () => {
    render(<AureaProvider><Field label="Nome"><Input /></Field></AureaProvider>);
    const campo = screen.getByLabelText("Nome");
    expect(campo).not.toHaveAttribute("aria-invalid");
    expect(document.querySelector(".field-error")).toBeNull();
  });

  test("enviar entrega os valores já coletados", async () => {
    const u = userEvent.setup();
    const enviou = vi.fn();
    render(
      <AureaProvider>
        <Form onSubmit={enviou}>
          <Field label="Nome" name="nome"><Input name="nome" defaultValue="Analyst" /></Field>
          <Button type="submit">Salvar</Button>
        </Form>
      </AureaProvider>,
    );
    await u.click(screen.getByRole("button", {name: "Salvar"}));
    await waitFor(() => expect(enviou).toHaveBeenCalled());
    expect(enviou.mock.calls[0][0]).toMatchObject({nome: "Analyst"});
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// M6 — CommandPalette. A casca continua existindo para quem compõe a própria; este é o par com
// motor, no precedente do MediaPlayer/MediaPlayerShell. Sem dependência nova: o autocomplete do
// Base UI reusa as MESMAS peças do combobox que o Combobox daqui já usa.
describe("CommandPalette — a paleta com motor", () => {
  const COMANDOS = (feito: string[]) => [
    {id: "btn", label: "Go to Button", run: () => feito.push("btn")},
    {id: "bdg", label: "Go to Badge", run: () => feito.push("bdg")},
    {id: "thm", label: "Toggle theme", kbd: "⌘T", run: () => feito.push("thm")},
  ];

  test("filtra ao digitar", async () => {
    const u = userEvent.setup();
    render(<AureaProvider><main>
      <CommandPalette open onClose={() => {}} items={COMANDOS([])} />
    </main></AureaProvider>);
    await u.type(screen.getByRole("combobox"), "the");
    expect(screen.getAllByRole("option").map(o => o.textContent)).toEqual(["Toggle theme⌘T"]);
  });

  // A regra que separa este componente de uma lista: escolher EXECUTA e FECHA, nessa ordem. Se
  // fechar depois de executar, um comando que navega deixa a paleta aberta sobre a tela nova.
  test("escolher pelo teclado executa o comando e fecha", async () => {
    const u = userEvent.setup();
    const feito: string[] = [];
    render(<AureaProvider><main>
      <CommandPalette open onClose={() => feito.push("fechou")} items={COMANDOS(feito)} />
    </main></AureaProvider>);
    await u.type(screen.getByRole("combobox"), "theme");
    await u.keyboard("{ArrowDown}{Enter}");
    expect(feito, "fecha ANTES de executar").toEqual(["fechou", "thm"]);
  });

  test("Escape fecha — é o teclado que se tenta primeiro", async () => {
    const u = userEvent.setup();
    const feito: string[] = [];
    render(<AureaProvider><main>
      <CommandPalette open onClose={() => feito.push("fechou")} items={COMANDOS(feito)} />
    </main></AureaProvider>);
    await u.keyboard("{Escape}");
    expect(feito).toEqual(["fechou"]);
  });

  // LIMITE REGISTRADO, não esquecimento: a v1 não agrupa. O `Autocomplete.Root` não consome a
  // estrutura agrupada, e dar a cada grupo a sua fatia de itens passa por cima do filtro —
  // medido. Este teste trava o que se escolheu: a lista é plana e o filtro FUNCIONA.
  test("a lista é plana, e é o filtro que manda", async () => {
    const u = userEvent.setup();
    render(<AureaProvider><main>
      <CommandPalette open onClose={() => {}} items={COMANDOS([])} />
    </main></AureaProvider>);
    expect(screen.getAllByRole("option")).toHaveLength(3);
    await u.type(screen.getByRole("combobox"), "go to");
    expect(screen.getAllByRole("option").map(o => o.textContent))
      .toEqual(["Go to Button", "Go to Badge"]);
  });

  test("nada casou: diz em palavras, do dicionário", async () => {
    const u = userEvent.setup();
    render(<AureaProvider><main>
      <CommandPalette open onClose={() => {}} items={COMANDOS([])} />
    </main></AureaProvider>);
    await u.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  // O gate de axe do catalogo pegou duas violacoes aqui em 14/08/2026: sem a composicao
  // Portal>Positioner>Popup do motor, um `role="combobox"` com `aria-expanded="true"` fica SEM
  // `aria-controls` (obrigatorio) e a lista fica sem nome. Este teste traz a cobranca para perto
  // do codigo, em vez de esperar seis minutos de varredura para descobrir.
  test("sem violação de axe com a paleta aberta", async () => {
    // `portalContainer` DENTRO do <main>, mesmo precedente do teste da Tooltip em overlays: o
    // popup vai para o portal, e um portal em `document.body` deixa a lista fora de qualquer
    // landmark — o axe acusaria `region` contra o FIXTURE, e a falha diria mais sobre o teste
    // que sobre o componente.
    function Palco() {
      const [ancora, setAncora] = useState<HTMLElement | null>(null);
      return (
        <AureaProvider portalContainer={ancora}>
          <main>
            <CommandPalette open onClose={() => {}} items={COMANDOS([])} />
            <div ref={setAncora} />
          </main>
        </AureaProvider>
      );
    }
    const {container} = render(<Palco />);
    const inp = screen.getByRole("combobox");
    expect(inp, "combobox expandido exige aria-controls").toHaveAttribute("aria-controls");
    const {violations} = await axe(document.body);
    expect(violations.map(v => v.id)).toEqual([]);
    expect(container).toBeTruthy();
  });

  test("fechada não renderiza nada", () => {
    render(<AureaProvider><main>
      <CommandPalette open={false} onClose={() => {}} items={COMANDOS([])} />
    </main></AureaProvider>);
    expect(document.querySelector(".command-overlay")).toBeNull();
  });
});
