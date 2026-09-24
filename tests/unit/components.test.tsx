import {describe, test, expect, vi, beforeEach, afterEach} from "vitest";
import {useState} from "react";
import {render, screen, within, fireEvent, act} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {DataState, AureaProvider, ptBR, AgentCard, AgentStatus, AgentInspector, InvocationPanel, TaskQueue, HumanApproval, ToolPermission, EventStream, TraceTimeline, HealthMatrix, ModelUsage, CostMeter, MemoryLedger, InterAgentMessage, AutomationCard, Toolbar, ToolbarButton, ToolbarSeparator, ButtonGroup, Button, Banner, ContextMenu, Combobox, MultiCombobox, DropdownMenu, FileInput, matchesAccept, TreeView, NotificationCenter, MediaPlayer, Carousel, Image, Gallery, Prose, Input, NumberField, SortableList, BlockEditor, spokenTime, MessageList, MessageComposer, Status, Sidebar, BottomNav, Topbar, AppShell, Badge, formatBadgeCount, Avatar, IconButton, Kbd, type NotificationItem, type ColumnDef, type UploadContext, type ChatMessage, type SidebarItem, NavList, type NavListItem, Separator, gridStateToParams, gridStateFromParams, screenStateToParams, screenStateFromParams, Alert, EmptyState, universalStates, stateSeverity, type UniversalState, useToast, type AureaToastType, Tabs} from "../../packages/react/src/index";
// Fase 9: os de dependência pesada moram em subpath próprio. O teste importa como o
// consumidor importa — se a fronteira estiver errada, ela quebra aqui primeiro.
import {DataGrid} from "../../packages/react/src/data-grid";
import {CodeEditor} from "../../packages/react/src/code-editor";
import {QRCode} from "../../packages/react/src/qrcode";
import {DependencyGraph} from "../../packages/react/src/graph";
import {EditorView} from "@codemirror/view";
import {axe} from "jest-axe";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

// Gate axe estrutural (auditoria 18/07, M8). O engine é o axe-core; no jsdom as
// regras de layout (color-contrast) são puladas automaticamente — o contraste foi
// verificado à parte na auditoria. Aqui pegam nome acessível, ARIA válida, papel,
// label e estrutura. Falha lista as violações de forma legível.
async function expectNoAxe(el: HTMLElement) {
  const {violations} = await axe(el);
  if (violations.length) {
    const msg = violations.map(v => `  ${v.id} (${v.nodes.length}): ${v.help}\n    ${v.nodes.map(n => n.target.join(" ")).join("\n    ")}`).join("\n");
    throw new Error(`axe encontrou ${violations.length} violação(ões):\n${msg}`);
  }
}

describe("Toolbar", () => {
  test("roving tabindex: só um botão é tabulável e as setas movem o foco", async () => {
    const user = userEvent.setup();
    wrap(
      <Toolbar label="Ações">
        <ToolbarButton>Um</ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton>Dois</ToolbarButton>
        <ToolbarButton>Três</ToolbarButton>
      </Toolbar>,
    );
    const bar = screen.getByRole("toolbar", {name: "Ações"});
    const botoes = within(bar).getAllByRole("button");

    // Tab entra na toolbar uma vez só (roving), não uma vez por botão.
    await user.tab();
    expect(botoes[0]).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(botoes[1]).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(botoes[2]).toHaveFocus();
  });

  test("usa o label inglês default quando não recebe um", () => {
    wrap(<Toolbar><ToolbarButton>Um</ToolbarButton></Toolbar>);
    expect(screen.getByRole("toolbar", {name: "Toolbar"})).toBeInTheDocument();
  });
});

describe("Button — API do exemplar", () => {
  test("href vira <a>: botão que navega é link, e o leitor anuncia como link", () => {
    wrap(<Button href="/docs" variant="outline">Docs</Button>);
    const el = screen.getByRole("link", {name: "Docs"});
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/docs");
    expect(el).toHaveClass("btn", "btn-outline");
  });

  test("href + disabled: sem href e com aria-disabled (link não tem disabled)", () => {
    wrap(<Button href="/docs" disabled>Docs</Button>);
    const el = screen.getByText("Docs").closest("a")!;
    expect(el).not.toHaveAttribute("href");
    expect(el).toHaveAttribute("aria-disabled", "true");
  });

  test("pressed é ESTADO (aria-pressed), não variante", () => {
    wrap(<><Button pressed>Bold</Button><Button pressed={false}>Italic</Button></>);
    expect(screen.getByRole("button", {name: "Bold", pressed: true})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Italic", pressed: false})).toBeInTheDocument();
  });

  test("kbd mostra a tecla E a anuncia (aria-keyshortcuts)", () => {
    wrap(<Button kbd="⌘K">Command</Button>);
    const el = screen.getByRole("button", {name: /Command/});
    expect(el).toHaveAttribute("aria-keyshortcuts", "⌘K");
    expect(within(el).getByText("⌘K").tagName).toBe("KBD");
  });

  test("fullWidth só acrescenta a classe de largura — não troca a forma", () => {
    wrap(<Button fullWidth>Continue</Button>);
    expect(screen.getByRole("button", {name: "Continue"})).toHaveClass("btn-block");
  });

  test("loading bloqueia e marca aria-busy, mantendo o rótulo", () => {
    wrap(<Button loading>Publishing…</Button>);
    const el = screen.getByRole("button", {name: "Publishing…"});
    expect(el).toBeDisabled();
    expect(el).toHaveAttribute("aria-busy", "true");
  });

  test("as cinco alturas e as onze variantes viram classe, e md/secondary não sujam o markup", () => {
    wrap(<><Button size="xs" variant="link-danger">A</Button><Button>B</Button></>);
    expect(screen.getByRole("button", {name: "A"})).toHaveClass("btn-xs", "btn-link-danger");
    expect(screen.getByRole("button", {name: "B"}).className).toBe("btn btn-secondary");
  });

  test("Kbd é <kbd> de verdade, dentro ou fora do botão", () => {
    wrap(<Kbd>Esc</Kbd>);
    expect(screen.getByText("Esc").tagName).toBe("KBD");
  });

  test("sem violação de axe nas variantes novas", async () => {
    const {container} = wrap(<>
      <Button variant="danger-outline">Delete</Button>
      <Button variant="link-primary">Upgrade</Button>
      <Button pressed kbd="⌘K">Bold</Button>
      <Button href="/x">Go</Button>
    </>);
    await expectNoAxe(container);
  });
});

describe("ButtonGroup", () => {
  test("é um group rotulado e mantém cada botão tabulável", async () => {
    const user = userEvent.setup();
    wrap(
      <ButtonGroup label="Formato">
        <Button>Um</Button>
        <Button>Dois</Button>
      </ButtonGroup>,
    );
    const grupo = screen.getByRole("group", {name: "Formato"});
    const botoes = within(grupo).getAllByRole("button");

    // Diferente da Toolbar: sem roving, Tab passa por todos.
    await user.tab();
    expect(botoes[0]).toHaveFocus();
    await user.tab();
    expect(botoes[1]).toHaveFocus();
  });
});

describe("Button", () => {
  // O default do HTML é type=submit: um "Cancelar" dentro de <form> dispararia a
  // ação principal (auditoria, ALTO 1). O default do Button é type=button.
  test("não submete formulário por default; type=submit explícito submete", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    wrap(<form onSubmit={onSubmit}><Button>Cancelar</Button><Button type="submit">Salvar</Button></form>);

    await user.click(screen.getByRole("button", {name: "Cancelar"}));
    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", {name: "Salvar"}));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});

describe("Button nav + IconButton", () => {
  test("variant nav: o item ATUAL é marcado por aria-current (não uma classe 'ativa')", () => {
    wrap(
      <nav aria-label="Main">
        <Button variant="nav">Docs</Button>
        <Button variant="nav" aria-current="page">Patterns</Button>
      </nav>,
    );
    // o traço amarelo é ::after do [aria-current] — o que o teste trava é a semântica:
    // o leitor de tela chega no item atual por aria-current, e só um o tem.
    const atual = screen.getByRole("button", {current: "page"});
    expect(atual).toHaveTextContent("Patterns");
    expect(atual).toHaveClass("btn-nav");
    expect(screen.getByRole("button", {name: "Docs"})).not.toHaveAttribute("aria-current");
  });

  test("IconButton é ghost por default — ícone-ação solto não tem caixa", () => {
    wrap(<IconButton label="Open menu" icon="menu" />);
    const btn = screen.getByRole("button", {name: "Open menu"});
    expect(btn).toHaveClass("btn-ghost");
    expect(btn).not.toHaveClass("btn-secondary");
  });

  test("mas aceita variant quando o consumidor quer a caixa", () => {
    wrap(<IconButton label="Filter" icon="filter" variant="secondary" />);
    expect(screen.getByRole("button", {name: "Filter"})).toHaveClass("btn-secondary");
  });
});

describe("Banner", () => {
  test("dispensa e usa role=alert só no variant danger", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const {rerender} = wrap(<Banner title="Aviso">corpo</Banner>);
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(
      <AureaProvider>
        <Banner variant="danger" title="Erro" onDismiss={onDismiss}>corpo</Banner>
      </AureaProvider>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByRole("button", {name: "Close"}));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

describe("ContextMenu", () => {
  test("abre no botão direito, dispara o item e fecha no Escape", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    wrap(
      <ContextMenu label="Ações" items={[{label: "Duplicar", onClick}, "separator", {label: "Excluir"}]}>
        <div>área</div>
      </ContextMenu>,
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.pointer({keys: "[MouseRight]", target: screen.getByText("área")});
    const menu = await screen.findByRole("menu", {name: "Ações"});
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(2);

    await user.click(within(menu).getByRole("menuitem", {name: "Duplicar"}));
    expect(onClick).toHaveBeenCalledOnce();

    await user.pointer({keys: "[MouseRight]", target: screen.getByText("área")});
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  test("item disabled não dispara", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    wrap(
      <ContextMenu items={[{label: "Bloqueado", onClick, disabled: true}]}>
        <div>área</div>
      </ContextMenu>,
    );
    await user.pointer({keys: "[MouseRight]", target: screen.getByText("área")});
    const menu = await screen.findByRole("menu");
    await user.click(within(menu).getByRole("menuitem", {name: "Bloqueado"}));
    expect(onClick).not.toHaveBeenCalled();
  });

  test("gatilho é focável por teclado e abre no contextmenu (Shift+F10/Menu)", async () => {
    const user = userEvent.setup();
    wrap(
      <ContextMenu label="Ações" items={[{label: "Duplicar"}]}>
        <div>área</div>
      </ContextMenu>,
    );
    // sem tabIndex no gatilho, o teclado nunca alcançaria o menu.
    await user.tab();
    const trigger = screen.getByText("área").closest("[aria-haspopup]") as HTMLElement;
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-label", "Ações");

    // Shift+F10 / tecla Menu chegam ao DOM como evento contextmenu sobre o foco.
    fireEvent.contextMenu(trigger);
    expect(await screen.findByRole("menu", {name: "Ações"})).toBeInTheDocument();
  });
});

describe("DropdownMenu", () => {
  test("abre pelo trigger e fecha no Escape", async () => {
    const user = userEvent.setup();
    wrap(<DropdownMenu trigger={<Button>Abrir</Button>} items={[{label: "Item A"}]} />);
    await user.click(screen.getByRole("button", {name: "Abrir"}));
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  // ── G-API-02: as cinco formas de item que o motor entregava e a Aurea não passava adiante. ──
  //
  // Cada teste aqui prova COMPORTAMENTO, não presença de markup: o papel ARIA que o leitor de
  // tela vai anunciar, e o efeito de operar o item. Um menu que renderiza `role="menuitem"` onde
  // deveria haver `menuitemcheckbox` mente para quem não enxerga, e nenhuma inspeção de classe
  // pegaria isso.
  const abre = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole("button", {name: "Abrir"}));
    return screen.findByRole("menu");
  };

  test("a forma ANTIGA continua válida, byte por byte", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    wrap(<DropdownMenu trigger={<Button>Abrir</Button>}
      items={[{label: "Item A", onClick}, "separator", {label: "Item B", disabled: true}]} />);
    const menu = await abre(user);
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(2);
    await user.click(within(menu).getByRole("menuitem", {name: "Item A"}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  test("`checkbox`: o papel é menuitemcheckbox e o estado é anunciado", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    wrap(<DropdownMenu trigger={<Button>Abrir</Button>} items={[
      {kind: "checkbox", label: "Barra lateral", defaultChecked: true, onCheckedChange},
      {kind: "checkbox", label: "Régua"},
    ]} />);
    const menu = await abre(user);
    const itens = within(menu).getAllByRole("menuitemcheckbox");
    expect(itens).toHaveLength(2);
    expect(itens[0]).toHaveAttribute("aria-checked", "true");
    expect(itens[1]).toHaveAttribute("aria-checked", "false");

    await user.click(itens[0]);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  test("`radiogroup`: papéis de rádio, um só marcado, e o rótulo NOMEIA o grupo", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    wrap(<DropdownMenu trigger={<Button>Abrir</Button>} items={[{
      kind: "radiogroup", label: "Ordenar por", defaultValue: "nome", onValueChange,
      items: [{value: "nome", label: "Nome"}, {value: "data", label: "Data"}],
    }]} />);
    const menu = await abre(user);
    const radios = within(menu).getAllByRole("menuitemradio");
    expect(radios).toHaveLength(2);
    expect(radios.filter((r) => r.getAttribute("aria-checked") === "true")).toHaveLength(1);
    // o rótulo é do GRUPO: ele nomeia o conjunto e não é um item operável
    expect(within(menu).getByRole("group", {name: "Ordenar por"})).toBeInTheDocument();
    expect(within(menu).queryByRole("menuitem", {name: "Ordenar por"})).not.toBeInTheDocument();

    await user.click(radios[1]);
    expect(onValueChange).toHaveBeenLastCalledWith("data");
  });

  test("`group`: rotula uma seção sem virar item", async () => {
    const user = userEvent.setup();
    wrap(<DropdownMenu trigger={<Button>Abrir</Button>} items={[
      {kind: "group", label: "Arquivo", items: [{label: "Abrir"}, {label: "Salvar"}]},
    ]} />);
    const menu = await abre(user);
    const grupo = within(menu).getByRole("group", {name: "Arquivo"});
    expect(within(grupo).getAllByRole("menuitem")).toHaveLength(2);
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(2);   // o rótulo não conta
  });

  test("`submenu`: o gatilho anuncia que abre outro menu, e abre", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    wrap(<DropdownMenu trigger={<Button>Abrir</Button>} items={[
      {label: "Solto"},
      {kind: "submenu", label: "Exportar", items: [{label: "PDF", onClick}, {label: "CSV"}]},
    ]} />);
    const menu = await abre(user);
    const gatilho = within(menu).getByRole("menuitem", {name: /Exportar/});
    expect(gatilho).toHaveAttribute("aria-haspopup", "menu");
    expect(gatilho).toHaveAttribute("aria-expanded", "false");

    // ABRE POR TECLADO, e não por clique, e a escolha é medida: o `SubmenuTrigger` do Base UI
    // abre ao REPOUSAR o ponteiro, e repouso de ponteiro não existe em jsdom — o clique não
    // abria e o teste acusava o componente de um defeito do ambiente. `ArrowRight` é a tecla que
    // a APG define para entrar num submenu, então medir por ela é medir o caminho certo.
    gatilho.focus();
    await user.keyboard("{ArrowRight}");
    // o submenu é uma segunda superfície `role="menu"`, não itens colados na primeira
    const menus = await screen.findAllByRole("menu");
    expect(menus.length).toBeGreaterThan(1);
    expect(gatilho).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("menuitem", {name: "PDF"}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  test("`link`: é um <a href> de verdade, e não um item que finge navegar", async () => {
    const user = userEvent.setup();
    wrap(<DropdownMenu trigger={<Button>Abrir</Button>} items={[
      {kind: "link", label: "Documentação", href: "/docs", target: "_blank", rel: "noreferrer"},
    ]} />);
    const menu = await abre(user);
    const item = within(menu).getByRole("menuitem", {name: "Documentação"});
    expect(item.tagName).toBe("A");
    expect(item).toHaveAttribute("href", "/docs");
    expect(item).toHaveAttribute("target", "_blank");
  });

  // A UNIÃO VALE PARA OS TRÊS MENUS, e é por isso que o renderizador é um só. Corrigir só o
  // `DropdownMenu` seria o patch local que o CLAUDE.md proíbe.
  test("o ContextMenu recebe as mesmas formas", async () => {
    const user = userEvent.setup();
    wrap(<ContextMenu label="Ações" items={[
      {kind: "checkbox", label: "Fixar", defaultChecked: true},
      {kind: "group", label: "Mover", items: [{label: "Para cima"}]},
    ]}><span>alvo</span></ContextMenu>);
    await user.pointer({target: screen.getByText("alvo"), keys: "[MouseRight]"});
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitemcheckbox", {name: "Fixar"}))
      .toHaveAttribute("aria-checked", "true");
    expect(within(menu).getByRole("group", {name: "Mover"})).toBeInTheDocument();
  });
});

const FRUTAS = [
  {value: "maca", label: "Maçã"},
  {value: "banana", label: "Banana"},
  {value: "laranja", label: "Laranja"},
];

describe("Combobox", () => {
  test("filtra ao digitar e seleciona pelo teclado", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    wrap(<Combobox items={FRUTAS} label="Fruta" onValueChange={onValueChange} />);

    const input = screen.getByRole("combobox", {name: "Fruta"});
    await user.click(input);
    await user.keyboard("lar");

    const lista = await screen.findByRole("listbox");
    const opcoes = within(lista).getAllByRole("option");
    expect(opcoes).toHaveLength(1);
    expect(opcoes[0]).toHaveTextContent("Laranja");

    await user.keyboard("{ArrowDown}{Enter}");
    // UM argumento, e a asserção mudou junto com a API. Ela pedia `expect.anything()` num
    // segundo parâmetro que a assinatura pública nunca declarou: era o `eventDetails` do motor
    // vazando, e o teste tinha sido escrito contra o comportamento observado em vez do contrato.
    // Ver `soOValor` em pure.tsx — sete sítios tinham o mesmo vazamento.
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({value: "laranja"}));
    expect(onValueChange.mock.calls.at(-1)!).toHaveLength(1);
  });

  // Regressão: com Combobox.Label o input ficava SEM nome acessível e o label
  // era colado no trigger, sobrescrevendo o "Open list" dele.
  test("o input tem o nome do label e o trigger mantém o próprio", () => {
    wrap(<Combobox items={FRUTAS} label="Fruta" />);
    expect(screen.getByRole("combobox", {name: "Fruta"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Open list"})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "Fruta"})).not.toBeInTheDocument();
  });

  test("mostra o texto de vazio quando nada casa", async () => {
    const user = userEvent.setup();
    wrap(<Combobox items={FRUTAS} label="Fruta" />);
    await user.click(screen.getByRole("combobox", {name: "Fruta"}));
    await user.keyboard("zzz");
    expect(await screen.findByText("No results")).toBeInTheDocument();
  });

  test("aceita strings customizadas do AureaProvider", async () => {
    const user = userEvent.setup();
    render(
      <AureaProvider strings={{comboboxEmpty: "No results"}}>
        <Combobox items={FRUTAS} label="Fruit" />
      </AureaProvider>,
    );
    await user.click(screen.getByRole("combobox", {name: "Fruit"}));
    await user.keyboard("zzz");
    expect(await screen.findByText("No results")).toBeInTheDocument();
  });

  // O teste não é "o input tem disabled": é que a LISTA não abre. `disabled` no Input em vez de
  // na Root passaria na primeira asserção e falharia na segunda — campo travado que ainda abre
  // não está travado. Provado contra o defeito em 13/08/2026.
  test("disabled desliga o campo E o botão que abre a lista", async () => {
    const user = userEvent.setup();
    wrap(<Combobox items={FRUTAS} label="Fruta" disabled />);
    expect(screen.getByRole("combobox", {name: "Fruta"})).toBeDisabled();
    const abrir = screen.getByRole("button", {name: "Open list"});
    expect(abrir).toBeDisabled();
    await user.click(abrir);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

const GRUPOS = [
  {label: "Cítricas", items: [{value: "laranja", label: "Laranja"}]},
  {label: "Outras", items: [{value: "maca", label: "Maçã"}, {value: "banana", label: "Banana"}]},
];

// ── G-API-02: `Combobox` — opções agrupadas e o vazio que se escreve ───────────────────────
//
// O `Combobox` de seleção única recebia `ComboboxOption[]` e nada mais: agrupar era impossível, e
// o texto do vazio era fixo. As duas capacidades já existiam no motor (`Group`/`GroupLabel`/
// `Collection`, e `Empty` aceitando qualquer conteúdo) e a Aurea não passava adiante — o mesmo
// padrão dos outros quatro sítios do cartão.
//
// O TESTE QUE IMPORTA É O DO FILTRO. Renderizar `role="group"` é fácil e prova pouco; o que a
// pendência de pesquisa do HANDOFF perguntava é se o FILTRO DO MOTOR atravessa o agrupamento —
// se digitar esconde item DENTRO do grupo e faz sumir o grupo que ficou vazio. Medido aqui, e é
// o que autoriza dizer que a capacidade chegou inteira.
describe("Combobox agrupado (G-API-02)", () => {
  test("agrupa, e cada grupo é nomeado pelo próprio rótulo", async () => {
    const user = userEvent.setup();
    wrap(<Combobox items={GRUPOS} label="Frutas" />);

    await user.click(screen.getByRole("combobox", {name: "Frutas"}));
    expect(await screen.findByRole("group", {name: "Cítricas"})).toBeInTheDocument();
    expect(within(screen.getByRole("group", {name: "Outras"})).getByRole("option", {name: "Maçã"})).toBeInTheDocument();
  });

  test("o filtro do motor atravessa o grupo: esconde o item e some com o grupo vazio", async () => {
    const user = userEvent.setup();
    wrap(<Combobox items={GRUPOS} label="Frutas" />);

    const campo = screen.getByRole("combobox", {name: "Frutas"});
    await user.click(campo);
    expect(await screen.findByRole("group", {name: "Cítricas"})).toBeInTheDocument();

    await user.type(campo, "ban");
    // "Banana" está em Outras. O grupo Cítricas ficou sem candidato e o motor o DESCARTA —
    // não o renderiza vazio. É o `filteredItems` reconstruindo `{...grupo, items: filtrados}`.
    expect(screen.queryByRole("group", {name: "Cítricas"})).not.toBeInTheDocument();
    expect(screen.getByRole("group", {name: "Outras"})).toBeInTheDocument();
    expect(screen.getByRole("option", {name: "Banana"})).toBeInTheDocument();
    expect(screen.queryByRole("option", {name: "Maçã"})).not.toBeInTheDocument();
  });

  test("escolher dentro de um grupo devolve a opção, não o grupo", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    wrap(<Combobox items={GRUPOS} label="Frutas" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("combobox", {name: "Frutas"}));
    await user.click(await screen.findByRole("option", {name: "Laranja"}));

    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({value: "laranja"}));
    expect(onValueChange.mock.calls.at(-1)!).toHaveLength(1);
  });

  test("plano continua plano — nenhum grupo aparece onde não há grupo", async () => {
    const user = userEvent.setup();
    wrap(<Combobox items={[{value: "a", label: "Alfa"}, {value: "b", label: "Beta"}]} label="Letras" />);

    await user.click(screen.getByRole("combobox", {name: "Letras"}));
    expect(await screen.findByRole("option", {name: "Alfa"})).toBeInTheDocument();
    // ESCOPADO À LISTA de propósito: um `queryByRole("group")` solto reprova sempre, porque o
    // INVÓLUCRO DO CAMPO (`.combobox-group`, o `InputGroup` do motor) também é `role="group"`.
    // A primeira versão deste teste acusava o componente por causa disso — era a régua, não o
    // desenho. A pergunta é se a LISTA tem seções, e é na lista que se olha.
    expect(within(screen.getByRole("listbox")).queryByRole("group")).not.toBeInTheDocument();
  });

  test("`empty` escreve o vazio; sem ele, vale a string do provider", async () => {
    const user = userEvent.setup();
    // o campo é capturado UMA vez: depois de abrir, uma segunda consulta por papel+nome não o
    // reencontra — o motor reescreve os atributos do invólucro ao abrir.
    const {unmount} = render(<AureaProvider><Combobox items={GRUPOS} label="Frutas" /></AureaProvider>);
    const campo = screen.getByRole("combobox", {name: "Frutas"});
    await user.click(campo);
    await user.type(campo, "zzz");
    expect(await screen.findByText("No results")).toBeInTheDocument();
    unmount();

    render(<AureaProvider><Combobox items={GRUPOS} label="Frutas" empty="Nenhuma fruta com esse nome" /></AureaProvider>);
    const campo2 = screen.getByRole("combobox", {name: "Frutas"});
    await user.click(campo2);
    await user.type(campo2, "zzz");
    expect(await screen.findByText("Nenhuma fruta com esse nome")).toBeInTheDocument();
  });
});

describe("MultiCombobox", () => {
  test("seleciona vários e cada escolha vira chip removível", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    wrap(<MultiCombobox items={FRUTAS} label="Frutas" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("combobox", {name: "Frutas"}));
    const lista = await screen.findByRole("listbox");
    await user.click(within(lista).getByRole("option", {name: "Maçã"}));
    await user.click(within(lista).getByRole("option", {name: "Banana"}));

    // último onValueChange traz o array acumulado (multi mantém o popup aberto).
    expect(onValueChange).toHaveBeenLastCalledWith(
      [expect.objectContaining({value: "maca"}), expect.objectContaining({value: "banana"})],
    );
    expect(onValueChange.mock.calls.at(-1)!).toHaveLength(1);   // sem o eventDetails do motor
    // uma chip com botão de remover por seleção.
    expect(screen.getByRole("button", {name: "Remove Maçã"})).toBeInTheDocument();

    await user.click(screen.getByRole("button", {name: "Remove Banana"}));
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({value: "maca"})]);
  });

  test("agrupa as opções com rótulo de grupo", async () => {
    const user = userEvent.setup();
    wrap(<MultiCombobox items={GRUPOS} label="Frutas" />);

    await user.click(screen.getByRole("combobox", {name: "Frutas"}));
    // cada ComboboxOptGroup rende um role="group" nomeado pelo GroupLabel.
    expect(await screen.findByRole("group", {name: "Cítricas"})).toBeInTheDocument();
    expect(screen.getByRole("group", {name: "Outras"})).toBeInTheDocument();
    expect(within(screen.getByRole("group", {name: "Cítricas"})).getByRole("option", {name: "Laranja"})).toBeInTheDocument();
  });

  test("com onInputChange desliga o filtro interno e repassa a busca", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    // items já chegam filtrados pelo consumidor; o Base UI não pode re-filtrar.
    wrap(<MultiCombobox items={FRUTAS} label="Frutas" onInputChange={onInputChange} />);

    await user.click(screen.getByRole("combobox", {name: "Frutas"}));
    await user.keyboard("z");
    expect(onInputChange).toHaveBeenLastCalledWith("z");
    // "z" não casa nenhuma label, mas sem filtro interno todas seguem visíveis.
    expect(within(await screen.findByRole("listbox")).getAllByRole("option")).toHaveLength(3);
  });

  // Aqui o chip é o caminho a mais: um campo travado que ainda deixa REMOVER o que já está
  // escolhido continua editável. O `disabled` da Root é quem alcança o ChipRemove.
  test("disabled desliga o campo, o botão e a remoção dos chips", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    wrap(<MultiCombobox items={FRUTAS} label="Frutas" value={[FRUTAS[0]]}
      onValueChange={onValueChange} disabled />);
    expect(screen.getByRole("combobox", {name: "Frutas"})).toBeDisabled();
    const abrir = screen.getByRole("button", {name: "Open list"});
    expect(abrir).toBeDisabled();
    await user.click(abrir);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    // O ChipRemove não usa o atributo `disabled` nativo: o Base UI o mantém no DOM com
    // aria-disabled para não sumir do leitor de tela. Por isso o que se cobra aqui é o EFEITO —
    // clicar não pode remover —, e não a presença do atributo.
    const remover = screen.getByRole("button", {name: `Remove ${FRUTAS[0].label}`});
    expect(remover).toHaveAttribute("aria-disabled", "true");
    await user.click(remover);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

const png = (name: string, size = 4) =>
  new File([new Uint8Array(size)], name, {type: "image/png"});

describe("FileInput", () => {
  // A validação é fronteira de confiança: o accept nativo só filtra o seletor,
  // então matchesAccept precisa valer sozinho. Extensão, grupo e MIME exato.
  test("matchesAccept valida extensão, grupo de tipo e MIME exato", () => {
    expect(matchesAccept({name: "a.json", type: "application/json"}, ".json")).toBe(true);
    expect(matchesAccept({name: "a.png", type: "image/png"}, "image/*")).toBe(true);
    expect(matchesAccept({name: "a.png", type: "image/png"}, "application/json")).toBe(false);
    expect(matchesAccept({name: "a.pdf", type: ""}, ".pdf")).toBe(true); // MIME vazio, casa por extensão
    expect(matchesAccept({name: "a.png", type: "image/png"}, undefined)).toBe(true); // sem accept = tudo
  });

  test("seleciona vários, lista os arquivos e remove um", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    const {container} = wrap(
      <FileInput label="Anexos" multiple onFilesChange={onFilesChange} />,
    );
    const input = container.querySelector("input[type=file]") as HTMLInputElement;

    await user.upload(input, [png("um.png"), png("dois.png")]);
    expect(onFilesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({name: "um.png"}),
      expect.objectContaining({name: "dois.png"}),
    ]);
    const lista = screen.getByRole("list");
    expect(within(lista).getAllByRole("listitem")).toHaveLength(2);

    await user.click(screen.getByRole("button", {name: "Remove um.png"}));
    expect(onFilesChange).toHaveBeenLastCalledWith([expect.objectContaining({name: "dois.png"})]);
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(1);
  });

  test("arrastar-soltar rejeita arquivo grande, anuncia e não o adiciona", () => {
    const onFilesChange = vi.fn();
    // tipo passa (image/*), mas o tamanho estoura o maxSize → rejeitado de verdade.
    wrap(<FileInput label="Anexos" accept="image/*" maxSize={1000} onFilesChange={onFilesChange} />);
    const zone = screen.getByText(/Drag files/i).closest("label") as HTMLLabelElement;

    fireEvent.drop(zone, {dataTransfer: {files: [png("grande.png", 2000)], types: ["Files"]}});

    expect(onFilesChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText(/File exceeds the size limit: grande\.png/, {selector: ".field-error"})).toBeInTheDocument();
    // o motivo entra na região aria-live para o leitor de tela.
    expect(screen.getByRole("status")).toHaveTextContent("File exceeds the size limit: grande.png");
  });

  // G-STATE-02 — a rejeição é o INVÁLIDO deste campo, e até 28/08/2026 ela só existia como texto
  // solto embaixo da zona: o componente sabia que o arquivo tinha sido recusado e não marcava o
  // campo. Quem usa leitor de tela não ouvia "inválido", e quem enxerga não via a zona mudar.
  test("arquivo rejeitado marca o campo como inválido e liga o motivo ao controle", () => {
    const {container} = wrap(<FileInput label="Anexos" accept="image/*" maxSize={1000} />);
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    const zone = screen.getByText(/Drag files/i).closest("label") as HTMLLabelElement;
    expect(input).not.toHaveAttribute("aria-invalid");

    fireEvent.drop(zone, {dataTransfer: {files: [png("grande.png", 2000)], types: ["Files"]}});

    expect(input).toHaveAttribute("aria-invalid", "true");
    // O motivo DESCREVE o campo em vez de virar parte do nome — o mesmo idioma do `Field`. É uma
    // descrição POR REJEIÇÃO (aria-describedby aceita lista), e não um bloco só: soltar cinco
    // arquivos ruins de uma vez dá cinco motivos, e juntá-los num parágrafo perde qual é de qual.
    const descrito = (input.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
    expect(descrito).toHaveLength(1);
    expect(document.getElementById(descrito[0])).toHaveTextContent(
      "File exceeds the size limit: grande.png");

    // E o inválido SAI quando um arquivo bom entra: estado que só acende é decoração.
    fireEvent.change(input, {target: {files: [png("ok.png", 10)]}});
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  // Upload real (Fase 5): a UI recebe a função de envio; o transporte é do consumidor.
  // Mock = promessa deferida por arquivo, dirigida pelo teste (resolve/fail/abort).
  type Handle = {file: File; ctx: UploadContext; resolve: () => void; fail: () => void};
  const deferredUpload = (calls: Handle[]) => (file: File, ctx: UploadContext) =>
    new Promise<void>((resolve, reject) => {
      // consumidor real rejeita ao abortar; espelhamos isso para o cancelar funcionar.
      ctx.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      calls.push({file, ctx, resolve: () => resolve(), fail: () => reject(new Error("falhou"))});
    });

  test("envia por arquivo com progresso real e marca concluído", async () => {
    const user = userEvent.setup();
    const calls: Handle[] = [];
    const {container} = wrap(<FileInput label="Anexos" upload={deferredUpload(calls)} />);
    await user.upload(container.querySelector("input[type=file]") as HTMLInputElement, [png("um.png")]);

    // envio começa sozinho: uma barra de progresso APG por arquivo.
    expect(calls).toHaveLength(1);
    const barra = screen.getByRole("progressbar", {name: "Uploading um.png"});
    expect(barra).toHaveAttribute("aria-valuenow", "0");

    // progresso REAL: o onProgress do consumidor reflete no aria-valuenow (0..1 → 0..100).
    act(() => calls[0].ctx.onProgress(0.5));
    expect(screen.getByRole("progressbar", {name: "Uploading um.png"})).toHaveAttribute("aria-valuenow", "50");

    await act(async () => { calls[0].resolve(); });
    // concluído: barra some, sobra o tamanho + remover; a conclusão é anunciada.
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Remove um.png"})).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Upload complete: um.png");
  });

  test("cancelar aborta a requisição e habilita o retry", async () => {
    const user = userEvent.setup();
    const calls: Handle[] = [];
    const {container} = wrap(<FileInput label="Anexos" upload={deferredUpload(calls)} />);
    await user.upload(container.querySelector("input[type=file]") as HTMLInputElement, [png("um.png")]);

    await user.click(screen.getByRole("button", {name: "Cancel upload um.png"}));
    // o AbortSignal do contrato de fato abortou (é o que corta a requisição do consumidor).
    expect(calls[0].ctx.signal.aborted).toBe(true);
    // cancelado ≠ falhou: mostra o estado e um botão para tentar de novo.
    expect(await screen.findByRole("button", {name: "Retry upload um.png"})).toBeInTheDocument();
    expect(screen.getByText("Upload canceled", {selector: ".field-error"})).toBeInTheDocument();
  });

  test("erro num arquivo não derruba a fila; retry reenvia", async () => {
    const user = userEvent.setup();
    const calls: Handle[] = [];
    const {container} = wrap(<FileInput label="Anexos" multiple upload={deferredUpload(calls)} />);
    await user.upload(container.querySelector("input[type=file]") as HTMLInputElement, [png("um.png"), png("dois.png")]);
    expect(calls).toHaveLength(2);

    // dois.png falha; um.png segue e conclui — a falha de um não afeta o outro.
    await act(async () => { calls[1].fail(); });
    await act(async () => { calls[0].resolve(); });
    expect(screen.getByRole("button", {name: "Remove um.png"})).toBeInTheDocument(); // concluído
    expect(screen.getByText("Upload failed", {selector: ".field-error"})).toBeInTheDocument();

    // retry reenvia SÓ o que falhou: nova chamada de upload para dois.png.
    await user.click(screen.getByRole("button", {name: "Retry upload dois.png"}));
    expect(calls).toHaveLength(3);
    expect(calls[2].file.name).toBe("dois.png");
    expect(screen.getByRole("progressbar", {name: "Uploading dois.png"})).toBeInTheDocument();
  });

  test("desmontar aborta os envios em voo", async () => {
    const user = userEvent.setup();
    const calls: Handle[] = [];
    const {container, unmount} = wrap(<FileInput label="Anexos" upload={deferredUpload(calls)} />);
    await user.upload(container.querySelector("input[type=file]") as HTMLInputElement, [png("um.png")]);
    expect(calls).toHaveLength(1);
    expect(calls[0].ctx.signal.aborted).toBe(false);

    // sem o abort, a requisição e as closures sobreviveriam à tela.
    unmount();
    expect(calls[0].ctx.signal.aborted).toBe(true);
  });
});

const ARVORE: import("../../packages/react/src/index").TreeNode[] = [
  {id: "src", label: "src", icon: "folder", children: [
    {id: "index", label: "index.tsx", icon: "document"},
    {id: "comp", label: "components", icon: "folder", children: [
      {id: "button", label: "Button.tsx", icon: "document"},
    ]},
  ]},
  {id: "readme", label: "README.md", icon: "document"},
];

describe("TreeView", () => {
  test("role=tree/treeitem, expande e colapsa com as setas", async () => {
    const user = userEvent.setup();
    wrap(<TreeView items={ARVORE} label="Arquivos" />);
    const tree = screen.getByRole("tree", {name: "Arquivos"});
    // colapsado: só os dois nós de nível 1 aparecem.
    expect(within(tree).getAllByRole("treeitem")).toHaveLength(2);

    // roving: Tab entra uma vez e cai no primeiro nó.
    await user.tab();
    const src = within(tree).getByRole("treeitem", {name: "src"});
    expect(src).toHaveFocus();
    expect(src).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("{ArrowRight}"); // expande
    expect(src).toHaveAttribute("aria-expanded", "true");
    expect(within(tree).getByRole("treeitem", {name: "index.tsx"})).toBeInTheDocument();

    await user.keyboard("{ArrowRight}"); // move para o primeiro filho
    expect(within(tree).getByRole("treeitem", {name: "index.tsx"})).toHaveFocus();

    await user.keyboard("{ArrowLeft}"); // volta ao pai
    expect(src).toHaveFocus();
    await user.keyboard("{ArrowLeft}"); // colapsa o pai
    expect(src).toHaveAttribute("aria-expanded", "false");
    expect(within(tree).queryByRole("treeitem", {name: "index.tsx"})).not.toBeInTheDocument();
  });

  test("Enter seleciona o nó e dispara onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    wrap(<TreeView items={ARVORE} label="Arquivos" defaultExpandedIds={["src"]} onSelect={onSelect} />);
    const tree = screen.getByRole("tree");

    await user.tab();
    await user.keyboard("{ArrowDown}{Enter}"); // desce para index.tsx e seleciona
    const index = within(tree).getByRole("treeitem", {name: "index.tsx"});
    expect(index).toHaveAttribute("aria-selected", "true");
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({id: "index"}));
  });

  test("roving: só um nó é tabulável; Home/End vão aos extremos", async () => {
    const user = userEvent.setup();
    wrap(<TreeView items={ARVORE} label="Arquivos" defaultExpandedIds={["src", "comp"]} />);
    const tree = screen.getByRole("tree");
    const tabaveis = within(tree).getAllByRole("treeitem").filter(i => i.getAttribute("tabindex") === "0");
    expect(tabaveis).toHaveLength(1);

    await user.tab();
    await user.keyboard("{End}");
    expect(within(tree).getByRole("treeitem", {name: "README.md"})).toHaveFocus();
    await user.keyboard("{Home}");
    expect(within(tree).getByRole("treeitem", {name: "src"})).toHaveFocus();
  });

  test("tab stop se recupera quando o nó ativo sai dos dados", () => {
    const {rerender} = wrap(<TreeView items={[{id: "a", label: "Alfa"}]} />);
    // troca total de dados: o ativo ("a") não existe mais — sem reconciliar, a
    // árvore inteira ficaria tabIndex=-1 e sumiria da ordem do Tab.
    rerender(<AureaProvider><TreeView items={[{id: "b", label: "Beta"}]} /></AureaProvider>);
    expect(screen.getByRole("treeitem", {name: "Beta"})).toHaveAttribute("tabindex", "0");
  });
});

const AGENTES = [
  {id: "m", nome: "Messenger", execucoes: 48},
  {id: "a", nome: "Analyst", execucoes: 12},
  {id: "c", nome: "Curator", execucoes: 31},
  {id: "r", nome: "Writer", execucoes: 5},
  {id: "v", nome: "Reviewer", execucoes: 20},
];
const COLUNAS: ColumnDef<(typeof AGENTES)[number], any>[] = [
  {accessorKey: "nome", header: "Nome"},
  {accessorKey: "execucoes", header: "Execuções"},
];

describe("DataGrid", () => {
  // linhas de dados (sem o header row). O papel é `grid` e não `table` desde o `G-A11Y-07`:
  // a APG manda usar `grid` quando as células têm widgets operáveis, e as deste têm — e foi essa
  // troca que tornou `aria-selected` VÁLIDO na linha, que em `role=table` não é.
  const grade = () => screen.getByRole("grid");
  const linhas = () => within(grade()).getAllByRole("row").slice(1);
  const celulas = (linha: HTMLElement) =>
    within(linha).getAllByRole((r) => r === "gridcell" || r === "columnheader");

  test("ordena ao clicar no cabeçalho e move o aria-sort junto", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} label="Agentes" />);
    expect(screen.getByRole("region", {name: "Agentes"})).toBeInTheDocument();
    expect(linhas()[0]).toHaveTextContent("Messenger"); // ordem dos dados

    const nome = screen.getByRole("button", {name: "Nome"});
    await user.click(nome);
    expect(linhas()[0]).toHaveTextContent("Analyst"); // asc
    expect(nome.closest("th")).toHaveAttribute("aria-sort", "ascending");

    await user.click(nome);
    expect(linhas()[0]).toHaveTextContent("Writer"); // desc (W é o último alfabético)
    expect(nome.closest("th")).toHaveAttribute("aria-sort", "descending");

    await user.click(nome); // 3º clique volta à ordem natural, sem aria-sort
    expect(linhas()[0]).toHaveTextContent("Messenger");
    expect(nome.closest("th")).not.toHaveAttribute("aria-sort");
  });

  test("seleciona todas e desmarca uma, emitindo as linhas originais", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} selectable onSelectionChange={onSelectionChange} />);

    await user.click(screen.getByRole("checkbox", {name: "Select all rows"}));
    expect(onSelectionChange).toHaveBeenLastCalledWith(AGENTES);

    await user.click(screen.getAllByRole("checkbox", {name: "Select row"})[0]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(AGENTES.slice(1));
    // com seleção parcial, o "todas" fica indeterminate (estado misto real do DOM).
    expect((screen.getByRole("checkbox", {name: "Select all rows"}) as HTMLInputElement).indeterminate).toBe(true);
  });

  test("filtro global estreita as linhas e mostra o vazio quando nada casa", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} filterable />);
    const busca = screen.getByRole("searchbox", {name: "Filter"});

    await user.type(busca, "cur");
    expect(linhas()).toHaveLength(1);
    expect(linhas()[0]).toHaveTextContent("Curator");

    await user.clear(busca);
    await user.type(busca, "zzz");
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  test("pagina com o Pagination reusado", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} pageSize={2} />);
    expect(linhas()).toHaveLength(2);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Previous"})).toBeDisabled();

    await user.click(screen.getByRole("button", {name: "Next"}));
    expect(linhas()[0]).toHaveTextContent("Curator"); // página 2 começa no 3º dado

    await user.click(screen.getByRole("button", {name: "Next"}));
    expect(linhas()).toHaveLength(1); // 5 linhas em páginas de 2
    expect(screen.getByRole("button", {name: "Next"})).toBeDisabled();
  });

  // ── G-A11Y-07: o TECLADO DE GRADE. ──────────────────────────────────────────────────────────
  //
  // A ficha declarava `role: "grid"` e quatro setas, e em 27/08/2026 a medição no navegador achou
  // as quatro INERTES — `<table>` puro, sem `onKeyDown` e sem `tabIndex` em célula. Estes testes
  // cobram o comportamento, não a existência da regra: cada um aperta a tecla e olha onde o foco
  // FOI PARAR. É a mesma régua do `teclado-motor.spec.ts`, que existe porque ficha escrita de
  // memória foi o defeito original.
  const foco = () => document.activeElement as HTMLElement;
  const posicao = () => {
    const c = foco().closest("th,td") as HTMLTableCellElement;
    return {r: (c.parentElement as HTMLTableRowElement).rowIndex, c: c.cellIndex};
  };

  test("a grade é UMA parada de Tab, e o Tab entra na célula que tem o roving", async () => {
    const user = userEvent.setup();
    wrap(<><button type="button">antes</button>
      <DataGrid data={AGENTES} columns={COLUNAS} label="Agentes" selectable /></>);
    screen.getByRole("button", {name: "antes"}).focus();

    await user.tab();
    expect(posicao()).toEqual({r: 0, c: 0});   // a primeira célula do cabeçalho

    // e SAIR é uma tecla só: nem o botão de ordenar nem o checkbox de seleção são paradas
    // próprias. Uma grade de 5 linhas com seleção daria 12 paradas de Tab sem isso.
    await user.tab();
    expect(foco().closest("table")).toBeNull();
  });

  test("as setas andam pelas células, e param nas bordas em vez de dar a volta", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} label="Agentes" />);
    (grade().rows[0].cells[0] as HTMLElement).focus();

    await user.keyboard("{ArrowRight}");
    expect(posicao()).toEqual({r: 0, c: 1});
    await user.keyboard("{ArrowDown}");
    expect(posicao()).toEqual({r: 1, c: 1});
    await user.keyboard("{ArrowLeft}");
    expect(posicao()).toEqual({r: 1, c: 0});
    await user.keyboard("{ArrowUp}");
    expect(posicao()).toEqual({r: 0, c: 0});

    // borda: a APG não pede volta ao início, e dar a volta faria a pessoa perder a referência
    await user.keyboard("{ArrowUp}{ArrowLeft}");
    expect(posicao()).toEqual({r: 0, c: 0});
  });

  test("Home/End na linha, Ctrl+Home/Ctrl+End na grade inteira", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} label="Agentes" />);
    (grade().rows[2].cells[0] as HTMLElement).focus();

    await user.keyboard("{End}");
    expect(posicao()).toEqual({r: 2, c: 1});      // fim da LINHA, não da grade
    await user.keyboard("{Home}");
    expect(posicao()).toEqual({r: 2, c: 0});

    await user.keyboard("{Control>}{End}{/Control}");
    expect(posicao()).toEqual({r: AGENTES.length, c: 1});
    await user.keyboard("{Control>}{Home}{/Control}");
    expect(posicao()).toEqual({r: 0, c: 0});
  });

  test("PageDown/PageUp saltam e param no fim, sem sair da grade", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} label="Agentes" />);
    (grade().rows[0].cells[0] as HTMLElement).focus();

    await user.keyboard("{PageDown}");            // salto de 10 em 5 linhas: para na última
    expect(posicao()).toEqual({r: AGENTES.length, c: 0});
    await user.keyboard("{PageUp}");
    expect(posicao()).toEqual({r: 0, c: 0});
  });

  test("Enter entra no widget da célula, Escape volta — e o widget FUNCIONA lá dentro",
    async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      wrap(<DataGrid data={AGENTES} columns={COLUNAS} selectable
        onSelectionChange={onSelectionChange} getRowId={(r: (typeof AGENTES)[number]) => r.id} />);
      (grade().rows[1].cells[0] as HTMLElement).focus();   // a célula do checkbox da 1ª linha

      await user.keyboard("{Enter}");
      expect(foco().tagName).toBe("INPUT");
      // o teclado agora é do WIDGET: `Space` marca, e a grade não intercepta
      await user.keyboard(" ");
      expect(onSelectionChange).toHaveBeenLastCalledWith([AGENTES[0]]);

      await user.keyboard("{Escape}");
      expect(posicao()).toEqual({r: 1, c: 0});
    });

  test("F2 é o outro caminho para dentro, e ordena de dentro do cabeçalho", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} label="Agentes" />);
    (grade().rows[0].cells[0] as HTMLElement).focus();

    await user.keyboard("{F2}");
    expect(foco()).toBe(screen.getByRole("button", {name: "Nome"}));
    await user.keyboard("{Enter}");
    expect(linhas()[0]).toHaveTextContent("Analyst");    // ordenou de verdade
  });

  test("dentro do widget, as setas são DELE — a grade não rouba a tecla", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} label="Agentes" />);
    (grade().rows[0].cells[0] as HTMLElement).focus();
    await user.keyboard("{F2}");
    const botao = foco();

    await user.keyboard("{ArrowRight}");
    expect(foco()).toBe(botao);   // continua no botão: a seta não moveu a célula
  });

  test("`aria-selected` na linha existe SÓ quando a grade é selecionável", async () => {
    const user = userEvent.setup();
    const {unmount} = wrap(<DataGrid data={AGENTES} columns={COLUNAS} selectable
      getRowId={(r: (typeof AGENTES)[number]) => r.id} />);
    expect(linhas()[0]).toHaveAttribute("aria-selected", "false");
    await user.click(screen.getAllByRole("checkbox", {name: "Select row"})[0]);
    expect(linhas()[0]).toHaveAttribute("aria-selected", "true");
    unmount();

    // sem seleção, anunciar `aria-selected="false"` em toda linha é declarar um estado que a
    // grade não tem.
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} />);
    expect(linhas()[0]).not.toHaveAttribute("aria-selected");
  });

  // A INVARIANTE DO ROVING: a célula focada É a parada de Tab. Uma só, e a mesma.
  //
  // Este teste nasceu errado e a medição o corrigiu, o que vale registrar: a primeira versão
  // CONTAVA quantas células tinham `tabindex="0"` e exigia 1 — e passava verde com o defeito
  // presente, porque a contagem dava 1 tanto com a parada na célula certa quanto com ela numa
  // célula qualquer. O estado vazio é onde isso aparecia: filtrando até não sobrar nada e
  // descendo para a linha do vazio, o foco ia para o `<td>` e a parada ficava no `<th>` —
  // então sair da grade e voltar devolvia a pessoa ao cabeçalho, não a onde ela estava.
  test("a parada de Tab é sempre a célula FOCADA, inclusive na linha de vazio", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} filterable />);
    await user.type(screen.getByRole("searchbox", {name: "Filter"}), "zzz");
    expect(screen.getByText("No results")).toBeInTheDocument();

    (grade().rows[0].cells[0] as HTMLElement).focus();
    await user.keyboard("{ArrowDown}");
    expect(foco()).toHaveClass("datagrid-empty");

    const parada = [...grade().querySelectorAll("th,td")]
      .filter((c) => c.getAttribute("tabindex") === "0");
    expect(parada, "mais de uma parada de Tab, ou nenhuma").toHaveLength(1);
    expect(parada[0], "a parada de Tab não é a célula focada: sair e voltar leva a pessoa " +
      "para outro lugar").toBe(foco());
  });

  test("sem getRowId, trocar os dados limpa a seleção (não transfere por índice)", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const {rerender} = wrap(<DataGrid data={AGENTES} columns={COLUNAS} selectable onSelectionChange={onSelectionChange} />);
    await user.click(screen.getAllByRole("checkbox", {name: "Select row"})[0]);
    expect(onSelectionChange).toHaveBeenLastCalledWith([AGENTES[0]]);

    // reordena: sem id estável a seleção por índice marcaria OUTRO registro.
    rerender(<AureaProvider><DataGrid data={[...AGENTES].reverse()} columns={COLUNAS} selectable onSelectionChange={onSelectionChange} /></AureaProvider>);
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    const marcados = screen.getAllByRole("checkbox", {name: "Select row"}).filter(c => (c as HTMLInputElement).checked);
    expect(marcados).toHaveLength(0);
  });

  test("com getRowId, a seleção segue o registro certo após reordenação", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const {rerender} = wrap(<DataGrid data={AGENTES} columns={COLUNAS} selectable getRowId={r => r.id} onSelectionChange={onSelectionChange} />);
    await user.click(screen.getAllByRole("checkbox", {name: "Select row"})[0]); // Messenger
    expect(onSelectionChange).toHaveBeenLastCalledWith([AGENTES[0]]);

    rerender(<AureaProvider><DataGrid data={[...AGENTES].reverse()} columns={COLUNAS} selectable getRowId={r => r.id} onSelectionChange={onSelectionChange} /></AureaProvider>);
    // o registro selecionado (Messenger) agora é a ÚLTIMA linha — e segue marcado.
    const caixas = screen.getAllByRole("checkbox", {name: "Select row"});
    expect((caixas[caixas.length - 1] as HTMLInputElement).checked).toBe(true);
    expect(caixas.filter(c => (c as HTMLInputElement).checked)).toHaveLength(1);
  });
});

// PLANO-1.0 Parte F, F1 e F2. O que estes testes travam não é "a prop existe" — é
// que o estado controlado MANDA. O defeito que eles pegam é o mais fácil de
// escrever sem perceber: manter o estado interno como reserva, de modo que a tela
// anda sozinha e o modo controlado parece funcionar até o consumidor tentar
// recusar uma mudança (validar, confirmar, esperar o servidor).
describe("DataGrid controlado (F1) e dados do servidor (F2)", () => {
  const linhas = () => within(screen.getByRole("grid")).getAllByRole("row").slice(1);

  test("ordenação controlada: avisa e NÃO se move sozinha", async () => {
    const user = userEvent.setup();
    const onSortingChange = vi.fn();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} sorting={[]} onSortingChange={onSortingChange} />);

    await user.click(screen.getByRole("button", {name: "Nome"}));
    expect(onSortingChange).toHaveBeenCalledWith([{id: "nome", desc: false}]);
    // o pai não devolveu a nova ordenação, então a grade fica onde estava.
    expect(linhas()[0]).toHaveTextContent("Messenger");
    expect(screen.getByRole("button", {name: "Nome"}).closest("th")).not.toHaveAttribute("aria-sort");
  });

  test("ordenação controlada: quando o pai devolve, a grade obedece", () => {
    const {rerender} = wrap(<DataGrid data={AGENTES} columns={COLUNAS} sorting={[]} onSortingChange={vi.fn()} />);
    expect(linhas()[0]).toHaveTextContent("Messenger");

    rerender(<AureaProvider><DataGrid data={AGENTES} columns={COLUNAS} sorting={[{id: "nome", desc: false}]} onSortingChange={vi.fn()} /></AureaProvider>);
    expect(linhas()[0]).toHaveTextContent("Analyst");
    expect(screen.getByRole("button", {name: "Nome"}).closest("th")).toHaveAttribute("aria-sort", "ascending");
  });

  test("página controlada: 1-based na nossa API, e não vira sozinha", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} pageSize={2} page={1} onPageChange={onPageChange} />);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", {name: "Next"}));
    expect(onPageChange).toHaveBeenCalledWith(2); // 2, não o índice 1 do motor
    expect(linhas()[0]).toHaveTextContent("Messenger"); // segue na página 1
  });

  test("filtro controlado: o campo mostra o valor de fora e avisa a digitação", async () => {
    const user = userEvent.setup();
    const onGlobalFilterChange = vi.fn();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} filterable globalFilter="cur" onGlobalFilterChange={onGlobalFilterChange} />);
    expect(linhas()).toHaveLength(1);
    expect(screen.getByRole("searchbox", {name: "Filter"})).toHaveValue("cur");

    await user.type(screen.getByRole("searchbox", {name: "Filter"}), "a");
    expect(onGlobalFilterChange).toHaveBeenCalledWith("cura");
    expect(linhas()).toHaveLength(1); // o pai não devolveu: nada muda
  });

  test("seleção controlada por id, e ela atravessa a troca de dados", () => {
    const onRowSelectionChange = vi.fn();
    const {rerender} = wrap(<DataGrid data={AGENTES} columns={COLUNAS} selectable getRowId={r => r.id} rowSelection={{m: true}} onRowSelectionChange={onRowSelectionChange} />);
    const marcadas = () => screen.getAllByRole("checkbox", {name: "Select row"}).filter(c => (c as HTMLInputElement).checked);
    expect(marcadas()).toHaveLength(1);

    // outra página de dados, mesmo id selecionado: continua marcado.
    rerender(<AureaProvider><DataGrid data={[...AGENTES].reverse()} columns={COLUNAS} selectable getRowId={r => r.id} rowSelection={{m: true}} onRowSelectionChange={onRowSelectionChange} /></AureaProvider>);
    expect(marcadas()).toHaveLength(1);
  });

  test("F2 — manualPagination conta as páginas por rowCount e não fatia os dados", () => {
    const pagina = AGENTES.slice(0, 2); // o servidor mandou UMA página de 2
    wrap(<DataGrid data={pagina} columns={COLUNAS} pageSize={2} manualPagination rowCount={5} />);
    expect(linhas()).toHaveLength(2);
    expect(screen.getByText("1 / 3")).toBeInTheDocument(); // ceil(5/2), do servidor
  });

  test("F2 — sem rowCount a paginação some: o limite declarado na ficha", () => {
    const pagina = AGENTES.slice(0, 2);
    wrap(<DataGrid data={pagina} columns={COLUNAS} pageSize={2} manualPagination />);
    expect(linhas()).toHaveLength(2);
    expect(screen.queryByRole("button", {name: "Next"})).not.toBeInTheDocument();
  });

  test("F2 — manualSorting não reordena em memória; só avisa", async () => {
    const user = userEvent.setup();
    const onSortingChange = vi.fn();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} manualSorting onSortingChange={onSortingChange} />);

    await user.click(screen.getByRole("button", {name: "Nome"}));
    expect(onSortingChange).toHaveBeenCalledWith([{id: "nome", desc: false}]);
    expect(linhas()[0]).toHaveTextContent("Messenger"); // quem ordena é o servidor
    // e o cabeçalho AINDA marca o eixo, senão o leitor de tela não sabe de nada.
    expect(screen.getByRole("button", {name: "Nome"}).closest("th")).toHaveAttribute("aria-sort", "ascending");
  });

  test("F2 — manualFiltering não estreita em memória", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} filterable manualFiltering />);
    await user.type(screen.getByRole("searchbox", {name: "Filter"}), "zzz");
    expect(linhas()).toHaveLength(AGENTES.length); // nada some: o servidor decide
  });

  test("o modo interno segue sendo o default — nenhuma prop nova, nenhum comportamento novo", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} />);
    await user.click(screen.getByRole("button", {name: "Nome"}));
    expect(linhas()[0]).toHaveTextContent("Analyst"); // ordenou sozinha, como antes
  });
});

// PLANO-1.0 Parte F, F3. A linha de filtro é do cabeçalho, e a faceta é um
// MultiCombobox — não um popover novo. O que estes testes travam é a lógica que
// NÃO vem de graça do motor: o filterFn "valor da célula ∈ selecionados", a
// contagem por opção no rótulo, e a opção de contagem zero que só sobrevive
// quando o consumidor declara as opções.
const TAREFAS = [
  {id: "1", titulo: "Migrar índice", estado: "aberto"},
  {id: "2", titulo: "Revisar contrato", estado: "aberto"},
  {id: "3", titulo: "Publicar pacote", estado: "feito"},
];
const COLS_TAREFA: ColumnDef<(typeof TAREFAS)[number], any>[] = [
  {accessorKey: "titulo", header: "Título"},
  {accessorKey: "estado", header: "Estado"},
];

describe("DataGrid — filtro por coluna e por faceta (F3)", () => {
  const linhas = () => within(screen.getByRole("grid")).getAllByRole("row").filter(r => within(r).queryAllByRole("cell").length > 0);

  test("sem a prop `filters` nada muda: não existe linha de filtro", () => {
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  test("filtro de texto por coluna estreita só pela coluna dele", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} filters={[{column: "titulo", label: "Título"}]} />);
    expect(linhas()).toHaveLength(3);

    await user.type(screen.getByRole("textbox", {name: "Filter Título"}), "contrato");
    expect(linhas()).toHaveLength(1);

    // "aberto" existe na coluna estado e NÃO na coluna título: filtro de coluna
    // não é filtro global, e é isso que separa o F3 do que já havia.
    await user.clear(screen.getByRole("textbox", {name: "Filter Título"}));
    await user.type(screen.getByRole("textbox", {name: "Filter Título"}), "aberto");
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  test("faceta: opções vêm dos dados, com a contagem no rótulo, e filtram", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} filters={[{column: "estado", label: "Estado", facet: true}]} />);

    await user.click(screen.getByRole("combobox", {name: "Filter Estado"}));
    const lista = await screen.findByRole("listbox");
    expect(within(lista).getByRole("option", {name: "aberto (2)"})).toBeInTheDocument();
    expect(within(lista).getByRole("option", {name: "feito (1)"})).toBeInTheDocument();

    await user.click(within(lista).getByRole("option", {name: "feito (1)"}));
    // Fecha antes de medir, e o motivo é real: com o popup aberto o resto da
    // página sai da árvore de acessibilidade, então consultar a tabela POR PAPEL
    // devolve vazio — a linha existe, o leitor de tela é que não a alcança. Medir
    // com o popup aberto mediria o estado errado.
    await user.keyboard("{Escape}");
    expect(linhas()).toHaveLength(1);
    expect(linhas()[0]).toHaveTextContent("Publicar pacote");
  });

  test("faceta com `options` declaradas mantém o valor que nenhuma linha tem", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} filters={[{column: "estado", label: "Estado", facet: true, options: [
      {value: "aberto", label: "Aberto"}, {value: "feito", label: "Feito"}, {value: "cancelado", label: "Cancelado"},
    ]}]} />);

    await user.click(screen.getByRole("combobox", {name: "Filter Estado"}));
    const lista = await screen.findByRole("listbox");
    // sem contagem, porque não há nenhuma — mas a opção EXISTE, que é a diferença
    // entre "não há nenhum cancelado" e "cancelado não existe".
    expect(within(lista).getByRole("option", {name: "Cancelado"})).toBeInTheDocument();
    expect(within(lista).getByRole("option", {name: "Aberto (2)"})).toBeInTheDocument();
  });

  test("o filterFn da faceta compara o valor da célula com o ARRAY selecionado", () => {
    // vai direto pelo estado controlado: é a lógica que nenhum filterFn de
    // fábrica do motor faz, então é a que precisa de trava própria.
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} filters={[{column: "estado", label: "Estado", facet: true}]}
      columnFilters={[{id: "estado", value: ["aberto"]}]} onColumnFiltersChange={vi.fn()} />);
    expect(linhas()).toHaveLength(2);
  });

  test("columnFilters controlado: avisa e não se move sozinho", async () => {
    const user = userEvent.setup();
    const onColumnFiltersChange = vi.fn();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} filters={[{column: "titulo", label: "Título"}]}
      columnFilters={[]} onColumnFiltersChange={onColumnFiltersChange} />);

    await user.type(screen.getByRole("textbox", {name: "Filter Título"}), "c");
    expect(onColumnFiltersChange).toHaveBeenCalledWith([{id: "titulo", value: "c"}]);
    expect(linhas()).toHaveLength(3); // o pai não devolveu: nada estreita
  });
});

// PLANO-1.0 Parte F, F4. As duas funções são só o FORMATO — a grade não escreve
// na URL. O que estes testes travam é a ida e a volta, e o que acontece com o que
// NÃO é da grade na mesma busca.
describe("Estado da grade na URL (F4)", () => {
  const FILTROS = [{column: "estado", label: "Estado", facet: true}, {column: "titulo", label: "Título"}];

  test("ida e volta devolve o mesmo estado", () => {
    const estado = {
      sorting: [{id: "titulo", desc: true}],
      globalFilter: "migrar",
      columnFilters: [{id: "estado", value: ["aberto"]}, {id: "titulo", value: "índice"}],
      page: 3,
    };
    const params = gridStateToParams(estado);
    expect(gridStateFromParams(params, FILTROS)).toEqual(estado);
  });

  test("o formato é legível — é um link que alguém vai colar num chat", () => {
    const params = gridStateToParams({sorting: [{id: "titulo", desc: true}, {id: "estado", desc: false}],
      globalFilter: "x", page: 2, columnFilters: [{id: "estado", value: ["aberto", "feito"]}]});
    expect(decodeURIComponent(params.toString()))
      .toBe("sort=-titulo,estado&q=x&page=2&f.estado=aberto&f.estado=feito");
  });

  test("estado vazio não escreve nada, e a página 1 não vai junto", () => {
    expect(gridStateToParams({}).toString()).toBe("");
    expect(gridStateToParams({page: 1}).toString()).toBe("");
    expect(gridStateToParams({sorting: [], columnFilters: [], globalFilter: ""}).toString()).toBe("");
  });

  test("`into` preserva o que não é da grade e limpa o que é", () => {
    const antes = new URLSearchParams("tab=logs&q=velho&sort=-antigo&f.estado=aberto&ref=email");
    const depois = gridStateToParams({globalFilter: "novo"}, antes);
    expect(depois.get("tab")).toBe("logs");   // não é nosso: fica
    expect(depois.get("ref")).toBe("email");  // idem
    expect(depois.get("q")).toBe("novo");     // nosso: substituído
    expect(depois.get("sort")).toBeNull();    // nosso e ausente do estado: sai
    expect(depois.get("f.estado")).toBeNull();
  });

  test("volta ignora lixo: página não numérica, sort vazio", () => {
    expect(gridStateFromParams(new URLSearchParams("page=abc&sort=&q="))).toEqual({});
    expect(gridStateFromParams(new URLSearchParams("page=0"))).toEqual({});
  });

  test("sem `filters`, uma faceta de um valor só volta como TEXTO — o limite declarado", () => {
    const params = gridStateToParams({columnFilters: [{id: "estado", value: ["aberto"]}]});
    expect(gridStateFromParams(params)).toEqual({columnFilters: [{id: "estado", value: "aberto"}]});
    expect(gridStateFromParams(params, FILTROS)).toEqual({columnFilters: [{id: "estado", value: ["aberto"]}]});
  });

  test("o estado que veio da URL move a grade de verdade", () => {
    const vindo = gridStateFromParams(new URLSearchParams("sort=-titulo&f.estado=aberto"), FILTROS);
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} filters={FILTROS}
      sorting={vindo.sorting} columnFilters={vindo.columnFilters}
      onSortingChange={vi.fn()} onColumnFiltersChange={vi.fn()} />);

    const linhas = within(screen.getByRole("grid")).getAllByRole("row").filter(r => within(r).queryAllByRole("cell").length > 0);
    expect(linhas).toHaveLength(2);                       // só os "aberto"
    expect(linhas[0]).toHaveTextContent("Revisar contrato"); // e em ordem decrescente
  });
});

// PLANO-1.0 Parte G, G1 e G2. A fila é DADO serializável, e pausar HTTP não é
// pausar: é abortar com intenção declarada, para poder retomar de onde parou.
describe("FileInput — fila que sobrevive e pausa (G1, G2)", () => {
  const arquivo = (nome: string, tamanho = 10) =>
    new File([new Uint8Array(tamanho)], nome, {type: "text/plain"});

  test("G1 — cada mudança da fila sai em forma serializável", async () => {
    const user = userEvent.setup();
    const onQueueChange = vi.fn();
    wrap(<FileInput multiple label="Arquivos" onQueueChange={onQueueChange} />);

    await user.upload(screen.getByLabelText("Arquivos"), [arquivo("a.txt", 5), arquivo("b.txt", 7)]);
    const fila = onQueueChange.mock.lastCall![0];
    expect(fila).toHaveLength(2);
    expect(fila[0]).toMatchObject({name: "a.txt", bytes: 5, status: "pending", progress: 0});
    // serializável de verdade: sem File, sem função, sem ciclo.
    expect(() => JSON.stringify(fila)).not.toThrow();
  });

  test("G1 — a fila volta de `initialQueue`, e o item restaurado NÃO oferece repetir", () => {
    wrap(<FileInput multiple label="Arquivos" upload={vi.fn()} initialQueue={[
      {id: "x1", name: "antigo.pdf", bytes: 2048, status: "error", progress: 0.4},
    ]} />);
    expect(screen.getByText("antigo.pdf")).toBeInTheDocument();
    // os bytes não voltam de um armazenamento: um botão "repetir" aqui só falharia.
    expect(screen.queryByRole("button", {name: /Retry upload/})).not.toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Remove/})).toBeInTheDocument();
  });

  // AUD-0002 (12/08/2026): o contador de ids sempre começava em zero, e os ids restaurados vêm do
  // consumidor. Restaurar `f0` e escolher um arquivo novo dava o MESMO id aos dois.
  test("AUD-0002 — id novo não colide com restaurado, e remover o novo preserva os dois", async () => {
    const user = userEvent.setup();
    const onQueueChange = vi.fn();
    wrap(<FileInput multiple label="Arquivos" onQueueChange={onQueueChange} initialQueue={[
      {id: "f0", name: "antes-0.txt", bytes: 10, status: "done", progress: 1},
      {id: "f1", name: "antes-1.txt", bytes: 20, status: "done", progress: 1},
    ]} />);
    await user.upload(screen.getByLabelText("Arquivos"), arquivo("novo.txt", 5));

    const fila = onQueueChange.mock.lastCall![0] as Array<{id: string; name: string}>;
    expect(fila).toHaveLength(3);
    // o defeito em uma linha: três itens, dois ids. `remove` e `patch` filtram por id.
    expect(new Set(fila.map(f => f.id)).size).toBe(3);

    await user.click(screen.getByRole("button", {name: /Remove novo\.txt/}));
    const depois = onQueueChange.mock.lastCall![0] as Array<{name: string}>;
    expect(depois.map(f => f.name)).toEqual(["antes-0.txt", "antes-1.txt"]);
  });

  // AUD-0006: item restaurado não tem `File` nem controller, então Pausar/Retomar/Cancelar não
  // faziam nada, e ele contava como "em voo" — o recibo, que só aparece com a fila parada, nunca
  // vinha. Os três estados ativos no mesmo teste, porque a regra tem de valer para os três.
  test("AUD-0006 — estado ativo restaurado vira terminal: sem botão inerte e sem travar o recibo", () => {
    wrap(<FileInput multiple label="Arquivos" upload={vi.fn()} initialQueue={[
      {id: "a", name: "subindo.bin", bytes: 100, status: "uploading", progress: 0.5},
      {id: "b", name: "pausado.bin", bytes: 100, status: "paused", progress: 0.3},
      {id: "c", name: "esperando.bin", bytes: 100, status: "pending", progress: 0},
    ]} />);
    expect(screen.queryByRole("button", {name: /Pause upload/})).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name: /Resume upload/})).not.toBeInTheDocument();
    // e o recibo aparece, que é a prova de que `emVoo` zerou
    expect(screen.getByText("Receipt")).toBeInTheDocument();
    // os três seguem removíveis — é a única ação que um item sem bytes pode oferecer
    expect(screen.getAllByRole("button", {name: /Remove/})).toHaveLength(3);
  });

  test("G2 — pausar guarda o progresso, e retomar continua de onde parou", async () => {
    const user = userEvent.setup();
    let avancar: ((f: number) => void) | undefined;
    let retomadoDe: number | undefined;
    const upload = vi.fn((_f: File, ctx: UploadContext) => new Promise<void>((_res, rej) => {
      retomadoDe = ctx.resumeFrom;
      avancar = ctx.onProgress;
      ctx.signal.addEventListener("abort", () => rej(new Error("abort")));
    }));
    wrap(<FileInput label="Arquivos" upload={upload} />);
    await user.upload(screen.getByLabelText("Arquivos"), arquivo("g.bin"));

    act(() => avancar!(0.4));
    await user.click(screen.getByRole("button", {name: /Pause upload g.bin/}));
    // dentro do ITEM: "Paused" também aparece no anúncio sr-only, e comparar os dois
    // como se fossem um só é o erro de escopo que esta sessão já cometeu três vezes.
    expect(await within(screen.getByRole("listitem")).findByText(/40%/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", {name: /Resume upload g.bin/}));
    // o transporte é do consumidor, então o que ele recebe é o NÚMERO de onde continuar.
    expect(retomadoDe).toBe(0.4);
  });

  test("G2 — pausado não é cancelado: o estado diz qual dos dois foi", async () => {
    const user = userEvent.setup();
    const upload = vi.fn((_f: File, ctx: UploadContext) => new Promise<void>((_res, rej) => {
      ctx.signal.addEventListener("abort", () => rej(new Error("abort")));
    }));
    const onQueueChange = vi.fn();
    wrap(<FileInput label="Arquivos" upload={upload} onQueueChange={onQueueChange} />);
    await user.upload(screen.getByLabelText("Arquivos"), arquivo("c.bin"));

    await user.click(screen.getByRole("button", {name: /Cancel upload/}));
    expect(await screen.findByText("Upload canceled")).toBeInTheDocument();
    expect(onQueueChange.mock.lastCall![0][0].status).toBe("canceled");
  });

  test("G2 — a ação de conjunto pausa todos, e a regra é a mesma do item", async () => {
    const user = userEvent.setup();
    const upload = vi.fn((_f: File, ctx: UploadContext) => new Promise<void>((_res, rej) => {
      ctx.signal.addEventListener("abort", () => rej(new Error("abort")));
    }));
    const onQueueChange = vi.fn();
    wrap(<FileInput multiple label="Arquivos" upload={upload} onQueueChange={onQueueChange} />);
    await user.upload(screen.getByLabelText("Arquivos"), [arquivo("1.bin"), arquivo("2.bin")]);

    await user.click(screen.getByRole("button", {name: "Pause upload"})); // o do conjunto
    await within(screen.getAllByRole("listitem")[0]).findByText(/0%/);
    expect(onQueueChange.mock.lastCall![0].every((i: {status: string}) => i.status === "paused")).toBe(true);
    expect(screen.getByRole("button", {name: "Resume upload"})).toBeInTheDocument();
  });
});

// PLANO-1.0 Parte G, G3 e G4.
describe("FileInput — prévia e soma de verificação (G3, G4)", () => {
  const imagem = (nome = "foto.png") => new File([new Uint8Array(4)], nome, {type: "image/png"});
  const texto = (nome = "nota.txt") => new File([new Uint8Array(4)], nome, {type: "text/plain"});

  beforeEach(() => {
    // jsdom não implementa URL de objeto: o que importa medir é que criamos UMA e
    // REVOGAMOS a mesma — vazamento de blob é o defeito clássico desta prévia.
    (URL as unknown as {createObjectURL: unknown}).createObjectURL = vi.fn(() => "blob:fake");
    (URL as unknown as {revokeObjectURL: unknown}).revokeObjectURL = vi.fn();
  });

  test("G3 — só imagem ganha miniatura; o resto fica com o ícone", async () => {
    const user = userEvent.setup();
    wrap(<FileInput multiple preview label="Arquivos" />);
    await user.upload(screen.getByLabelText("Arquivos"), [imagem(), texto()]);

    const itens = screen.getAllByRole("listitem");
    expect(within(itens[0]).getByRole("presentation", {hidden: true}) ?? within(itens[0]).container).toBeDefined();
    expect(itens[0].querySelector("img")).not.toBeNull();
    expect(itens[1].querySelector("img")).toBeNull();
  });

  test("G3 — remover REVOGA a URL do blob, senão o navegador segura os bytes", async () => {
    const user = userEvent.setup();
    wrap(<FileInput preview label="Arquivos" />);
    await user.upload(screen.getByLabelText("Arquivos"), imagem());
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", {name: /Remove/}));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake");
  });

  test("G3 — desmontar revoga a prévia que continua na fila", async () => {
    const user = userEvent.setup();
    const {unmount} = wrap(<FileInput preview label="Arquivos" />);
    await user.upload(screen.getByLabelText("Arquivos"), imagem());

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake");
  });

  // AUD-0009 (12/08/2026): o `remove` revogava a prévia e os DOIS outros caminhos que tiram um item
  // da lista — a troca em modo single e o "substituir" do conflito — não revogavam nada. A correção
  // foi na raiz, no `emit`, e estes dois testes existem para provar que ela cobre os dois caminhos:
  // é a pergunta "quem MAIS tem esse problema?" virada em asserção.
  test("AUD-0009 — trocar o arquivo em modo single revoga a prévia substituída na hora", async () => {
    const user = userEvent.setup();
    let n = 0;
    (URL as unknown as {createObjectURL: unknown}).createObjectURL = vi.fn(() => `blob:${++n}`);
    wrap(<FileInput preview label="Arquivos" />);
    const campo = screen.getByLabelText("Arquivos");
    await user.upload(campo, imagem("primeira.png"));
    await user.upload(campo, imagem("segunda.png"));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:1");
    // e só a que saiu: revogar a que está na tela apagaria a miniatura visível
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:2");
  });

  test("AUD-0009 — 'substituir' no conflito revoga a prévia do item substituído", async () => {
    const user = userEvent.setup();
    let n = 0;
    (URL as unknown as {createObjectURL: unknown}).createObjectURL = vi.fn(() => `blob:${++n}`);
    wrap(<FileInput multiple preview label="Arquivos" />);
    const campo = screen.getByLabelText("Arquivos");
    await user.upload(campo, imagem("mesma.png"));
    await user.upload(campo, imagem("mesma.png"));
    await user.click(screen.getByRole("button", {name: "Replace"}));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:1");
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:2");
  });

  test("G4 — sem `checksum` nada é calculado: ler o arquivo inteiro não é default", async () => {
    const user = userEvent.setup();
    const onQueueChange = vi.fn();
    wrap(<FileInput label="Arquivos" onQueueChange={onQueueChange} />);
    await user.upload(screen.getByLabelText("Arquivos"), texto());
    expect(onQueueChange.mock.lastCall![0][0].checksum).toBeUndefined();
  });

  test("G4 — soma divergente do servidor é ERRO, não detalhe", async () => {
    const user = userEvent.setup();
    // jsdom não traz `crypto.subtle`; o que se mede aqui é a COMPARAÇÃO, não o SHA-256.
    vi.stubGlobal("crypto", {subtle: {digest: async () => new Uint8Array(32).fill(1).buffer}});
    // o servidor devolve uma soma que não é a nossa: os bytes que chegaram lá não são
    // os que saíram daqui.
    const upload = vi.fn(async () => ({checksum: "0".repeat(64)}));
    wrap(<FileInput checksum label="Arquivos" upload={upload} />);
    await user.upload(screen.getByLabelText("Arquivos"), texto());

    // dentro da FILA: o recibo do G6 também lista o arquivo, e "listitem" sozinho
    // passou a casar com os dois assim que ele nasceu.
    const item = await vi.waitFor(() => document.querySelector(".file-list li")!);
    expect(within(item as HTMLElement).getByText(/different bytes/)).toBeInTheDocument();
  });

  test("G4 — servidor que não devolve soma não reprova nada", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("crypto", {subtle: {digest: async () => new Uint8Array(32).fill(1).buffer}});
    const upload = vi.fn(async () => {});
    const onQueueChange = vi.fn();
    wrap(<FileInput checksum label="Arquivos" upload={upload} onQueueChange={onQueueChange} />);
    await user.upload(screen.getByLabelText("Arquivos"), texto());

    await vi.waitFor(() => expect(onQueueChange.mock.lastCall![0][0].status).toBe("done"));
    expect(within(document.querySelector(".file-list li") as HTMLElement).queryByText(/different bytes/)).toBeNull();
  });
});

// PLANO-1.0 Parte H, grupo H.a. As três são composição — o que se trava aqui é o
// CONTRATO: o vocabulário fixo dos seis estados, e o que cada peça promete emitir.
describe("Camada operacional — identidade de agente (H.a)", () => {
  test("os seis estados têm rótulo próprio, e o rótulo é traduzível", () => {
    const {rerender} = wrap(<AgentStatus state="thinking" />);
    expect(screen.getByText("Thinking")).toBeInTheDocument();

    rerender(<AureaProvider strings={ptBR}><AgentStatus state="thinking" /></AureaProvider>);
    expect(screen.getByText("Pensando")).toBeInTheDocument();
  });

  test("o estado vira VARIANTE do Status, não cor solta no componente", () => {
    const {container, rerender} = wrap(<AgentStatus state="error" />);
    // a classe é a do Status; nenhuma cor é escrita pelo AgentStatus.
    expect(container.querySelector(".status")).toHaveClass("status-danger");
    expect(container.querySelector('[style*="color"]')).toBeNull();

    rerender(<AureaProvider><AgentStatus state="completed" /></AureaProvider>);
    expect(container.querySelector(".status")).toHaveClass("status-success");
  });

  test("o rótulo pode ser trocado sem perder o estado legível por máquina", () => {
    const {container} = wrap(<AgentStatus state="running" label="Rodando o lote 3" />);
    expect(screen.getByText("Rodando o lote 3")).toBeInTheDocument();
    expect(container.querySelector('[data-state="running"]')).not.toBeNull();
  });

  test("o cartão mostra nome, modelo, estado e capacidades — e as ações são NÓ, não string", async () => {
    const user = userEvent.setup();
    const aoParar = vi.fn();
    wrap(<AgentCard name="Curator" model="opus-5" state="paused" description="Arruma a biblioteca."
      capabilities={[{name: "search"}, {name: "summarise"}]}
      actions={<button onClick={aoParar}>Stop</button>} />);

    expect(screen.getByText("Curator")).toBeInTheDocument();
    expect(screen.getByText("opus-5")).toBeInTheDocument();
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    await user.click(screen.getByRole("button", {name: "Stop"}));
    expect(aoParar).toHaveBeenCalled(); // sem despacho por string no meio
  });

  test("sem estado o cartão não inventa um", () => {
    wrap(<AgentCard name="Writer" />);
    expect(screen.queryByText("Idle")).not.toBeInTheDocument();
  });

  test("o inspetor é região nomeada, com seções rotuladas", () => {
    wrap(<AgentInspector title="Curator" sections={[
      {label: "Configuration", items: [{term: "Model", value: "opus-5"}]},
      {label: "Tools", items: [{term: "search", value: "read-only"}]},
    ]}><p>Livre</p></AgentInspector>);

    expect(screen.getByRole("region", {name: "Curator"})).toBeInTheDocument();
    // `group` nomeado, e não título: o componente não sabe a que profundidade a página o
    // colocou, e nível fixo vira salto de hierarquia (medido no catálogo em 09/08/2026).
    expect(screen.getByRole("group", {name: "Configuration"})).toBeInTheDocument();
    expect(screen.queryAllByRole("heading")).toHaveLength(0);
    expect(screen.getByText("opus-5")).toBeInTheDocument();
    expect(screen.getByText("Livre")).toBeInTheDocument(); // o corpo livre entra
  });
});

// PLANO-1.0 Parte H, grupo H.b.
describe("Camada operacional — execução (H.b)", () => {
  const passos = [
    {id: "1", label: "read", detail: "20 entries", state: "done" as const},
    {id: "2", label: "write", state: "error" as const, content: <p>Permission denied</p>},
  ];

  test("o passo com corpo é <details> nativo — dobrar é da plataforma, não nosso", () => {
    const {container} = wrap(<InvocationPanel title="Run" steps={passos} />);
    const dobras = container.querySelectorAll("details");
    expect(dobras).toHaveLength(1);          // só o que tem corpo
    expect(dobras[0].querySelector("summary")).not.toBeNull();
    expect(screen.getByText("Permission denied")).toBeInTheDocument();
  });

  test("rodando marca aria-busy na REGIÃO, e não anima o rótulo", () => {
    const {container, rerender} = wrap(<InvocationPanel title="Run" running steps={passos} />);
    expect(screen.getByRole("region", {name: "Run"})).toHaveAttribute("aria-busy", "true");
    // nada de animação em cima do texto: o leitor de tela não alcança shimmer.
    expect(container.querySelector('[class*="shimmer"]')).toBeNull();

    rerender(<AureaProvider><InvocationPanel title="Run" steps={passos} /></AureaProvider>);
    expect(screen.getByRole("region", {name: "Run"})).not.toHaveAttribute("aria-busy");
  });

  test("entrada e saída são rotuladas, e existem só quando há o que mostrar", () => {
    const {rerender} = wrap(<InvocationPanel title="Run" input="pergunta" output="resposta" />);
    // `group` nomeado pelo rótulo, e nenhum título de nível fixo — ver o AgentInspector acima.
    expect(screen.getByRole("group", {name: "Input"})).toBeInTheDocument();
    expect(screen.getByRole("group", {name: "Output"})).toBeInTheDocument();
    expect(screen.queryAllByRole("heading")).toHaveLength(0);

    rerender(<AureaProvider><InvocationPanel title="Run" input="pergunta" /></AureaProvider>);
    expect(screen.queryByRole("group", {name: "Output"})).not.toBeInTheDocument();
  });

  test("a fila mostra os seis estados com o rótulo traduzível", () => {
    const {rerender} = wrap(<TaskQueue tasks={[{id: "1", title: "Indexar", state: "blocked"}]} />);
    expect(screen.getByText("Blocked")).toBeInTheDocument();

    rerender(<AureaProvider strings={ptBR}><TaskQueue tasks={[{id: "1", title: "Indexar", state: "blocked"}]} /></AureaProvider>);
    expect(screen.getByText("Bloqueada")).toBeInTheDocument();
  });

  test("a barra só existe RODANDO — fila parada em 0% diria que travou", () => {
    const {container, rerender} = wrap(<TaskQueue tasks={[{id: "1", title: "X", state: "queued", progress: 0}]} />);
    expect(container.querySelector(".progress")).toBeNull();

    rerender(<AureaProvider><TaskQueue tasks={[{id: "1", title: "X", state: "running", progress: 0.4}]} /></AureaProvider>);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
  });

  test("repetir aparece só no que FALHOU, e só quando há o que fazer", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    wrap(<TaskQueue onRetry={onRetry} tasks={[
      {id: "1", title: "Ok", state: "completed"},
      {id: "2", title: "Ruim", state: "failed"},
    ]} />);

    const botoes = screen.getAllByRole("button", {name: /Retry upload/});
    expect(botoes).toHaveLength(1);
    await user.click(botoes[0]);
    expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({id: "2"}));
  });

  test("sem onRetry a falha é relatada e não vira botão morto", () => {
    wrap(<TaskQueue tasks={[{id: "2", title: "Ruim", state: "failed"}]} />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});

// PLANO-1.0 Parte H, grupo H.c. As duas decisões têm TEMPOS diferentes: aprovar é
// sobre esta ação, permitir é sobre todas as próximas. A referência junta as duas num
// componente só, e é assim que se concede permissão permanente sem perceber.
describe("Camada operacional — governança da ação (H.c)", () => {
  test("negar vem ANTES de aprovar na ordem de tabulação", () => {
    wrap(<HumanApproval title="Apagar" onApprove={vi.fn()} onDeny={vi.fn()} />);
    const botoes = screen.getAllByRole("button").map(b => b.textContent);
    expect(botoes).toEqual(["Deny", "Approve"]);
  });

  test("decidido, o par de botões vira o RESULTADO — não some", () => {
    const {rerender} = wrap(<HumanApproval title="Apagar" onApprove={vi.fn()} onDeny={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(2);

    rerender(<AureaProvider><HumanApproval title="Apagar" decision="denied" /></AureaProvider>);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    // sumir apagaria o rastro do que a pessoa escolheu.
    expect(screen.getByRole("status")).toHaveTextContent("Denied");
  });

  test("os parâmetros vão como DADO, não como prosa", () => {
    wrap(<HumanApproval title="Apagar" details={[{term: "Table", value: "invoices"}, {term: "Rows", value: "12"}]} />);
    expect(screen.getByText("Table")).toBeInTheDocument();
    expect(screen.getByText("invoices")).toBeInTheDocument();
  });

  test("o risco alto se anuncia, e o baixo não grita", () => {
    const {container, rerender} = wrap(<HumanApproval title="X" risk="high" />);
    expect(container.querySelector(".badge")).toHaveClass("badge-danger");

    rerender(<AureaProvider><HumanApproval title="X" risk="low" /></AureaProvider>);
    expect(container.querySelector(".badge")).not.toHaveClass("badge-danger");
  });

  test("a permissão é radiogroup de verdade, com o escopo no nome acessível", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    wrap(<ToolPermission onChange={onChange} tools={[
      {id: "t1", name: "read", scope: "/docs", permission: "ask"},
    ]} />);

    // o nome acessível carrega o ESCOPO: conceder /etc achando que é /docs é o defeito.
    const grupo = screen.getByRole("radiogroup", {name: "read /docs"});
    expect(within(grupo).getAllByRole("radio")).toHaveLength(3);

    await user.click(within(grupo).getByRole("radio", {name: "Always"}));
    expect(onChange).toHaveBeenCalledWith("t1", "always");
  });

  test("cada ferramenta tem o seu grupo — a escolha de uma não move a outra", () => {
    wrap(<ToolPermission tools={[
      {id: "t1", name: "read", permission: "always"},
      {id: "t2", name: "shell", permission: "never"},
    ]} />);
    expect(screen.getByRole("radio", {name: "Always", checked: true})).toBeInTheDocument();
    expect(screen.getByRole("radio", {name: "Never", checked: true})).toBeInTheDocument();
  });
});

// PLANO-1.0 Parte H, grupo H.d. As três são de OBSERVAÇÃO, e cada uma se separa de
// algo que já existe por um motivo que não é aparência.
describe("Camada operacional — observação (H.d)", () => {
  test("EventStream é `feed`, e não `log`: o evento tem estrutura, a linha de log é texto", () => {
    wrap(<EventStream events={[{id: "1", title: "Começou", time: "10:02"}]} />);
    expect(screen.getByRole("feed", {name: "Events"})).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAccessibleName("Começou");
  });

  test("eventos seguidos do mesmo grupo entram sob um rótulo só, e cada grupo é um feed NOMEADO", () => {
    wrap(<EventStream events={[
      {id: "1", title: "A", group: "Hoje"}, {id: "2", title: "B", group: "Hoje"},
      {id: "3", title: "C", group: "Ontem"},
    ]} />);
    // `feed` só aceita `article` como filho (APG): o rótulo do grupo fica FORA dele, e o nome
    // do grupo vira o nome acessível do feed daquele grupo.
    expect(screen.getAllByRole("feed")).toHaveLength(2);
    expect(screen.getByRole("feed", {name: "Hoje"}).querySelectorAll("article")).toHaveLength(2);
    expect(screen.getAllByRole("article")).toHaveLength(3);
    // e NENHUM título: componente não sabe a que profundidade está na página, então não fixa nível.
    expect(screen.queryAllByRole("heading")).toHaveLength(0);
  });

  test("seguir o fim é OPT-IN — sem ele quem lê o meio não é arrastado", () => {
    const rolar = vi.fn();
    Element.prototype.scrollIntoView = rolar;
    const {rerender} = wrap(<EventStream events={[{id: "1", title: "A"}]} />);
    expect(rolar).not.toHaveBeenCalled();

    rerender(<AureaProvider><EventStream follow events={[{id: "1", title: "A"}, {id: "2", title: "B"}]} /></AureaProvider>);
    expect(rolar).toHaveBeenCalled();
  });

  test("a barra do rastro é METER e diz a duração em número", () => {
    wrap(<TraceTimeline spans={[{id: "1", label: "invoke", start: 0, end: 900}]} />);
    const barra = screen.getByRole("meter", {name: "invoke"});
    // largura sozinha não é lida por ninguém: o valor tem de estar no atributo.
    expect(barra).toHaveAttribute("aria-valuenow", "900");
    expect(barra).toHaveAttribute("aria-valuetext", "900");
  });

  test("o span aninhado é posicionado pela JANELA, não pela ordem", () => {
    const {container} = wrap(<TraceTimeline spans={[
      {id: "1", label: "a", start: 0, end: 100},
      {id: "2", label: "b", start: 50, end: 100, depth: 1},
    ]} />);
    const barras = container.querySelectorAll(".trace-bar");
    // o segundo começa na metade da janela e ocupa a outra metade.
    expect((barras[1] as HTMLElement).style.insetInlineStart).toBe("50%");
    expect((barras[1] as HTMLElement).style.inlineSize).toBe("50%");
  });

  test("o `kind` do span é TEXTO — a referência pinta onze categorias em onze cores", () => {
    wrap(<TraceTimeline spans={[{id: "1", label: "call", start: 0, end: 10, kind: "tool"}]} />);
    expect(screen.getByText(/tool/)).toBeInTheDocument();
  });

  test("os cinco estados de saúde saem por PALAVRA, não só por cor", () => {
    wrap(<HealthMatrix entries={[
      {id: "1", name: "API", state: "operational"},
      {id: "2", name: "Search", state: "down"},
      {id: "3", name: "Billing", state: "maintenance"},
    ]} />);
    expect(screen.getByText("Operational")).toBeInTheDocument();
    expect(screen.getByText("Down")).toBeInTheDocument();
    expect(screen.getByText("Maintenance")).toBeInTheDocument();
  });
});

// PLANO-1.0 Parte H, grupo H.e. As duas primeiras parecem a mesma coisa na referência
// (`ModelUsageChart` e `ModelCostTable` mostram ambas modelo × tokens × custo) e se
// separam por PAPEL: fatia de uma soma × fração de um teto que vem de fora.
describe("Camada operacional — custo e memória (H.e)", () => {
  test("ModelUsage ordena decrescente e a barra é FATIA DA SOMA — o teto é o total", () => {
    wrap(<ModelUsage entries={[
      {id: "1", model: "haiku", tokens: 100},
      {id: "2", model: "sonnet", tokens: 900},
    ]} />);
    const barras = screen.getAllByRole("meter");
    // ordem: o maior primeiro, e o array de quem chamou não foi mexido.
    expect(barras[0]).toHaveAccessibleName("sonnet");
    expect(barras[0]).toHaveAttribute("aria-valuemax", "1000");
    expect(barras[0]).toHaveAttribute("aria-valuenow", "900");
  });

  test("ModelUsage NÃO muda o array de quem chamou", () => {
    const entradas = [{id: "1", model: "haiku", tokens: 100}, {id: "2", model: "sonnet", tokens: 900}];
    wrap(<ModelUsage entries={entradas} />);
    expect(entradas.map(e => e.model)).toEqual(["haiku", "sonnet"]);
  });

  test("custo abaixo de um centavo NÃO vira $0.00 — é onde o número mentiria", () => {
    const {rerender} = wrap(<ModelUsage metric="cost" entries={[{id: "1", model: "haiku", cost: 0.004}]} />);
    expect(screen.getByRole("meter", {name: "haiku"})).toHaveAttribute("aria-valuetext", "$0.004");
    // e acima de um centavo volta às duas casas de sempre.
    rerender(<AureaProvider><ModelUsage metric="cost" entries={[{id: "1", model: "haiku", cost: 12.5}]} /></AureaProvider>);
    expect(screen.getByRole("meter", {name: "haiku"})).toHaveAttribute("aria-valuetext", "$12.50");
  });

  test("CostMeter: sem `limit` não há medidor nenhum — não se inventa teto", () => {
    wrap(<CostMeter spent={40} />);
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("CostMeter: sem `softLimit` não existe aviso — 80% seria número inventado", () => {
    wrap(<CostMeter spent={85} limit={100} />);
    expect(screen.getByRole("meter")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("CostMeter: o limite brando avisa, o rígido bloqueia — são dois limiares", () => {
    const {container, rerender} = wrap(<CostMeter spent={85} limit={100} softLimit={80} />);
    expect(container.querySelector(".cost-meter")).toHaveAttribute("data-state", "near");
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<AureaProvider><CostMeter spent={100} limit={100} softLimit={80} /></AureaProvider>);
    expect(container.querySelector(".cost-meter")).toHaveAttribute("data-state", "over");
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  test("CostMeter estourado: `aria-valuenow` grampeia no teto, o gasto verdadeiro vai no texto", () => {
    wrap(<CostMeter spent={140} limit={100} label="Budget" />);
    const medidor = screen.getByRole("meter", {name: "Budget"});
    // valor fora da faixa é inválido em ARIA — mas o número honesto não pode sumir.
    expect(medidor).toHaveAttribute("aria-valuenow", "100");
    expect(medidor).toHaveAttribute("aria-valuetext", "$140.00 / $100.00");
  });

  test("MemoryLedger é APENDE-SÓ: esquecer registra o lançamento, não apaga a linha", () => {
    wrap(<MemoryLedger records={[
      {id: "1", content: "Prefere tema escuro", scope: "semantic", operation: "added"},
      {id: "2", content: "Endereço antigo", scope: "episodic", operation: "forgotten"},
    ]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Endereço antigo")).toBeInTheDocument();
    expect(screen.getByText("Forgotten")).toBeInTheDocument();
  });

  test("a procedência é dobrável e nativa — só aparece quando existe", () => {
    const {container} = wrap(<MemoryLedger records={[
      {id: "1", content: "Sem origem", scope: "procedural", operation: "recalled"},
      {id: "2", content: "Com origem", scope: "semantic", operation: "added",
       source: "conversation", details: [{term: "Turn", value: "12"}]},
    ]} />);
    expect(container.querySelectorAll("details")).toHaveLength(1);
    expect(screen.getByText("Where this came from")).toBeInTheDocument();
  });
});

// PLANO-1.0 Parte H, grupo H.f. Fecha a camada operacional.
describe("Camada operacional — relação (H.f)", () => {
  test("InterAgentMessage: a DIREÇÃO é o dado, e ela sobrevive à seta decorativa", () => {
    wrap(<InterAgentMessage messages={[
      {id: "1", from: "Curator", to: "Writer", body: "segue o resumo", kind: "handoff"},
    ]} />);
    // o Icon é sempre aria-hidden, então sem o grupo nomeado sairia "Curator Writer" e a
    // direção — que é o que este componente existe para dizer — se perderia no meio.
    expect(screen.getByRole("group", {name: "Curator to Writer"})).toBeInTheDocument();
    expect(screen.getByText("Handoff")).toBeInTheDocument();
  });

  test("sem destinatário é DIFUSÃO, e ela é dita por palavra — não fica em branco", () => {
    wrap(<InterAgentMessage messages={[
      {id: "1", from: "Orchestrator", body: "parem tudo", kind: "broadcast"},
    ]} />);
    expect(screen.getByRole("group", {name: "Orchestrator to all agents"})).toBeInTheDocument();
    expect(screen.getByText("all agents")).toBeInTheDocument();
  });

  test("a razão do encaminhamento é dobrável, e só existe quando existe", () => {
    const {container, rerender} = wrap(<InterAgentMessage messages={[
      {id: "1", from: "A", to: "B", body: "x"},
    ]} />);
    expect(container.querySelectorAll("details")).toHaveLength(0);

    rerender(<AureaProvider><InterAgentMessage messages={[
      {id: "1", from: "A", to: "B", body: "x", reason: "melhor pontuação de intenção"},
    ]} /></AureaProvider>);
    expect(container.querySelectorAll("details")).toHaveLength(1);
    expect(screen.getByText("Why it went this way")).toBeInTheDocument();
  });

  test("AutomationCard é QUANDO/ENTÃO, e o par sai como termo e valor", () => {
    wrap(<AutomationCard name="Nightly reindex" trigger="Every day at 02:00" action="Run the indexer" />);
    expect(screen.getByText("When")).toBeInTheDocument();
    expect(screen.getByText("Every day at 02:00")).toBeInTheDocument();
    expect(screen.getByText("Then")).toBeInTheDocument();
    expect(screen.getByText("Run the indexer")).toBeInTheDocument();
  });

  test("sem `onToggle` NÃO nasce interruptor — controle que não faz nada não entra", () => {
    const {rerender} = wrap(<AutomationCard name="R" trigger="t" action="a" enabled />);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();

    const alternar = vi.fn();
    rerender(<AureaProvider><AutomationCard name="R" trigger="t" action="a" enabled onToggle={alternar} /></AureaProvider>);
    const chave = screen.getByRole("switch", {name: "Enabled"});
    expect(chave).toBeChecked();
    fireEvent.click(chave);
    expect(alternar).toHaveBeenCalledWith(false);
  });

  test("regra desligada CONTINUA no lugar — quem precisa religar tem de achá-la", () => {
    const {container} = wrap(<AutomationCard name="Nightly reindex" trigger="t" action="a"
      onToggle={() => {}} lastResult="failure" lastRun="yesterday" />);
    expect(screen.getByText("Nightly reindex")).toBeInTheDocument();
    expect(container.querySelector(".automation")).not.toHaveAttribute("data-enabled");
    // e o resultado sai por PALAVRA, como os cinco estados do HealthMatrix.
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});

// H14 — o grafo. Vem do subpath, como o consumidor importa: se a fronteira estiver errada,
// ela quebra aqui primeiro.
describe("DependencyGraph — o grafo (H14)", () => {
  const cadeia = {
    nodes: [{id: "a", label: "Ingest", kind: "source"}, {id: "b", label: "Embed"}, {id: "c", label: "Answer"}],
    edges: [{from: "a", to: "b"}, {from: "b", to: "c"}],
  };

  test("o nó é BOTÃO de verdade quando dá para selecionar — nó de canvas não existe para o teclado", () => {
    const escolher = vi.fn();
    const {container} = wrap(<DependencyGraph {...cadeia} selectedId="b" onSelect={escolher} />);
    // Consulta por SELETOR e não por papel, e o motivo é do ambiente: até medir, o motor
    // mantém o nó fora da árvore de acessibilidade, então `getByRole` não o acha no jsdom —
    // que não faz layout. O que se afirma aqui é a ESTRUTURA (é `<button>`, tem `aria-pressed`,
    // o clique chega); que ele é alcançável de verdade, quem prova é o navegador.
    const no = container.querySelector<HTMLButtonElement>(".graph-node[data-selected] button.graph-node-body");
    expect(no).toBeTruthy();
    expect(no).toHaveAttribute("aria-pressed", "true");
    expect(no!.textContent).toContain("Embed");
    fireEvent.click(no!);
    expect(escolher).toHaveBeenCalledWith("b");
  });

  test("sem `onSelect` NÃO nasce botão: controle que não faz nada não entra", () => {
    // Seletor, não papel, pelo motivo do teste acima — e aqui isso importa em dobro: com
    // `queryByRole` este teste passaria mesmo COM o botão presente, porque o papel não é
    // consultável neste ambiente. Teste que passa por acidente é cobertura de mentira.
    const {container} = wrap(<DependencyGraph {...cadeia} />);
    expect(container.querySelector("button.graph-node-body")).toBeNull();
    expect(container.querySelectorAll("span.graph-node-body")).toHaveLength(3);
    expect(screen.getByText("Embed")).toBeInTheDocument();
  });

  test("o layout em camadas põe cada nó na profundidade do caminho mais longo", () => {
    const {container} = wrap(<DependencyGraph {...cadeia} />);
    // o motor escreve a posição no `transform` do nó. Três nós em cadeia = três colunas.
    const x = [...container.querySelectorAll<HTMLElement>(".react-flow__node")]
      .map(n => Number(/translate\((-?[\d.]+)px/.exec(n.style.transform)?.[1] ?? 0));
    expect(x).toHaveLength(3);
    expect(x[1]).toBeGreaterThan(x[0]);
    expect(x[2]).toBeGreaterThan(x[1]);
  });

  test("`x`/`y` de quem chama VENCEM o layout automático", () => {
    const {container} = wrap(<DependencyGraph
      nodes={[{id: "a", label: "A", x: 500, y: 40}, {id: "b", label: "B"}]}
      edges={[{from: "a", to: "b"}]} />);
    const primeiro = container.querySelector<HTMLElement>(".react-flow__node");
    expect(primeiro!.style.transform).toContain("500px");
  });

  test("CICLO no dado não trava o navegador", () => {
    // grafo de dependências com ciclo é defeito do dado; laço infinito seria defeito nosso.
    const {container} = wrap(<DependencyGraph
      nodes={[{id: "a", label: "A"}, {id: "b", label: "B"}]}
      edges={[{from: "a", to: "b"}, {from: "b", to: "a"}]} />);
    expect(container.querySelectorAll(".react-flow__node")).toHaveLength(2);
  });

  test("as alças só existem quando o grafo é conectável — alça de mentira promete arraste", () => {
    const {container, rerender} = wrap(<DependencyGraph {...cadeia} />);
    expect(container.querySelectorAll(".react-flow__handle.connectable")).toHaveLength(0);

    rerender(<AureaProvider><DependencyGraph {...cadeia} connectable onConnect={() => {}} /></AureaProvider>);
    expect(container.querySelectorAll(".react-flow__handle.connectable").length).toBeGreaterThan(0);
  });
});

// PLANO-1.0 Parte G, G5 e G6.
describe("FileInput — conflito e recibo (G5, G6)", () => {
  const arq = (nome: string, n = 4) => new File([new Uint8Array(n)], nome, {type: "text/plain"});
  const naFila = () => [...document.querySelectorAll(".file-list li .file-name")].map(e => e.textContent);

  test("G5 — nome repetido NÃO entra sozinho: aparece a escolha", async () => {
    const user = userEvent.setup();
    wrap(<FileInput multiple label="Arquivos" />);
    await user.upload(screen.getByLabelText("Arquivos"), arq("nota.txt", 4));
    await user.upload(screen.getByLabelText("Arquivos"), arq("nota.txt", 9));

    expect(screen.getByRole("alert")).toHaveTextContent("already in the queue");
    expect(naFila()).toEqual(["nota.txt"]); // o segundo ficou esperando decisão
  });

  test("G5 — substituir troca o arquivo; manter os dois deixa dois; pular não faz nada", async () => {
    const user = userEvent.setup();
    wrap(<FileInput multiple label="Arquivos" />);
    await user.upload(screen.getByLabelText("Arquivos"), arq("a.txt", 4));

    await user.upload(screen.getByLabelText("Arquivos"), arq("a.txt", 9));
    await user.click(screen.getByRole("button", {name: "Replace"}));
    expect(naFila()).toEqual(["a.txt"]);
    expect(screen.getByText("9 B")).toBeInTheDocument(); // é o novo, não o velho

    await user.upload(screen.getByLabelText("Arquivos"), arq("a.txt", 12));
    await user.click(screen.getByRole("button", {name: "Keep both"}));
    expect(naFila()).toEqual(["a.txt", "a.txt"]);

    await user.upload(screen.getByLabelText("Arquivos"), arq("a.txt", 20));
    await user.click(screen.getByRole("button", {name: "Skip"}));
    expect(naFila()).toEqual(["a.txt", "a.txt"]);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("G6 — um TERMINADO ao lado de um EM VOO ainda não é recibo", async () => {
    const user = userEvent.setup();
    // dois arquivos, e só o primeiro termina: recibo de fila que ainda anda é mentira,
    // e um teste com um arquivo só não pega esse defeito — a lista fica vazia dos dois
    // jeitos e passa por acidente.
    const terminadores: Array<() => void> = [];
    const upload = vi.fn(() => new Promise<void>(res => {terminadores.push(res)}));
    wrap(<FileInput multiple label="Arquivos" upload={upload} />);
    await user.upload(screen.getByLabelText("Arquivos"), [arq("um.bin"), arq("dois.bin")]);

    await act(async () => {terminadores[0](); await Promise.resolve()});
    expect(screen.queryByText("Receipt")).not.toBeInTheDocument(); // um já subiu, o outro não

    await act(async () => {terminadores[1](); await Promise.resolve()});
    expect(await screen.findByText("Receipt")).toBeInTheDocument();
  });

  test("G6 — o recibo diz o que aconteceu, quando, e sai como texto puro", async () => {
    const user = userEvent.setup();
    const escrito = vi.fn();
    vi.stubGlobal("navigator", {...navigator, clipboard: {writeText: escrito}});
    const upload = vi.fn(async () => {});
    wrap(<FileInput label="Arquivos" upload={upload} onQueueChange={vi.fn()} />);
    await user.upload(screen.getByLabelText("Arquivos"), arq("ok.bin"));
    await screen.findByText("Receipt");

    await user.click(screen.getByRole("button", {name: "Copy receipt"}));
    const texto = escrito.mock.lastCall![0] as string;
    expect(texto).toContain("ok.bin");
    expect(texto).toContain("done");
    expect(texto).toMatch(/\d{4}-\d{2}-\d{2}T/); // o "quando", em ISO
    expect(texto).not.toContain("<"); // texto puro: o destino é um chamado, não HTML
  });
});

// PLANO-1.0 Parte F, F10. O botão DIZ o escopo. "Exportar" sozinho esconde a
// pergunta que importa: exportar o quê — tudo, ou o que está na tela?
describe("DataGrid — exportação com escopo visível (F10)", () => {
  test("sem filtro nem seleção, o rótulo conta tudo", () => {
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} onExport={vi.fn()} />);
    expect(screen.getByRole("button", {name: "Export 3 rows"})).toBeInTheDocument();
  });

  test("filtrou: o rótulo diz FILTRADAS e o callback recebe só essas", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} filterable onExport={onExport} />);
    await user.type(screen.getByRole("searchbox", {name: "Filter"}), "aberto");

    const botao = screen.getByRole("button", {name: "Export 2 filtered rows"});
    await user.click(botao);
    expect(onExport).toHaveBeenCalledWith([TAREFAS[0], TAREFAS[1]], {count: 2, filtered: true, selected: false});
  });

  test("marcou: seleção manda sobre filtro — é o que a pessoa acabou de fazer", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} selectable getRowId={r => r.id} onExport={onExport} />);
    await user.click(screen.getAllByRole("checkbox", {name: "Select row"})[2]);

    await user.click(screen.getByRole("button", {name: "Export 1 selected rows"}));
    expect(onExport).toHaveBeenCalledWith([TAREFAS[2]], {count: 1, filtered: false, selected: true});
  });

  test("a grade não gera arquivo — ela entrega as linhas e o escopo, e para aí", () => {
    const onExport = vi.fn();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} onExport={onExport} />);
    // nenhuma âncora de download, nenhum blob: formato e transporte são do consumidor.
    expect(document.querySelectorAll("a[download]")).toHaveLength(0);
  });

  test("um controle sozinho não ganha embrulho; dois ganham", () => {
    const {container, rerender} = wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} onExport={vi.fn()} />);
    expect(container.querySelector(".datagrid > .cluster")).toBeNull();

    rerender(<AureaProvider><DataGrid data={TAREFAS} columns={COLS_TAREFA} filterable onExport={vi.fn()} /></AureaProvider>);
    expect(container.querySelector(".datagrid > .cluster")).not.toBeNull();
  });
});

// PLANO-1.0 Parte F, F9. O gatilho é um BOTÃO por linha, não a linha clicável:
// linha não é foco de teclado, e transformá-la em alvo exige inventar papel, tabindex
// e tecla — um <button> já é as três coisas.
describe("DataGrid — painel de detalhe da linha (F9)", () => {
  const detalhe = (r: (typeof TAREFAS)[number]) => <p>Detalhe de {r.titulo}</p>;

  test("sem `renderDetail` não há coluna nova nem painel", () => {
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} />);
    expect(screen.queryAllByRole("button", {name: "Details"})).toHaveLength(0);
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  test("abre ao lado da lista — e a lista continua na tela", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} renderDetail={detalhe} />);
    const botoes = screen.getAllByRole("button", {name: "Details"});
    expect(botoes[0]).toHaveAttribute("aria-expanded", "false");

    await user.click(botoes[0]);
    expect(screen.getByRole("complementary", {name: "Row detail"})).toHaveTextContent("Detalhe de Migrar índice");
    // o ponto do item: sem sair da lista.
    expect(within(screen.getByRole("grid")).getAllByRole("row").length).toBeGreaterThan(1);
    expect(screen.getAllByRole("button", {name: "Details"})[0]).toHaveAttribute("aria-expanded", "true");
  });

  test("o mesmo botão fecha, e o X também", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} renderDetail={detalhe} />);
    await user.click(screen.getAllByRole("button", {name: "Details"})[0]);
    await user.click(screen.getAllByRole("button", {name: "Details"})[0]);
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();

    await user.click(screen.getAllByRole("button", {name: "Details"})[1]);
    expect(screen.getByRole("complementary")).toHaveTextContent("Revisar contrato");
    await user.click(screen.getByRole("button", {name: "Close"}));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  test("a linha aberta pode vir de fora, e o embrulho só existe com o painel", () => {
    const {container} = wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} getRowId={r => r.id}
      renderDetail={detalhe} detailRowId="2" onDetailRowIdChange={vi.fn()} />);
    expect(screen.getByRole("complementary")).toHaveTextContent("Revisar contrato");
    expect(container.querySelector(".datagrid-split")).not.toBeNull();
  });

  test("fechado, a marcação é a de sempre — quem não usa o painel não muda", () => {
    const {container} = wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} renderDetail={detalhe} />);
    expect(container.querySelector(".datagrid-split")).toBeNull();
  });
});

// PLANO-1.0 Parte F, F8. O aviso é TEXTO, não cor: "mostrando dados que podem estar
// desatualizados" é o que uma pessoa lê e um leitor de tela anuncia. E carregar não
// apaga o que já estava na tela.
describe("DataGrid — carregando, obsoleto, parcial e erro (F8)", () => {
  const linhas = () => within(screen.getByRole("grid")).getAllByRole("row").filter(r => within(r).queryAllByRole("cell").length > 0);

  test("sem `state` nada aparece — a grade de sempre não muda", () => {
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("region", {name: "Table"})).not.toHaveAttribute("aria-busy");
  });

  test("obsoleto: diz por escrito que o dado é velho, e NÃO esconde o dado", () => {
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} state="stale" />);
    expect(screen.getByRole("status")).toHaveTextContent("may be out of date");
    expect(linhas()).toHaveLength(3); // o dado velho continua lá, rotulado
  });

  test("parcial e erro têm recado próprio, e o erro INTERROMPE o leitor de tela", () => {
    const {rerender} = wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} state="partial" />);
    expect(screen.getByRole("status")).toHaveTextContent("incomplete");

    rerender(<AureaProvider><DataGrid data={TAREFAS} columns={COLS_TAREFA} state="error" /></AureaProvider>);
    // danger vira role="alert": erro de carga não espera a próxima pausa da leitura.
    expect(screen.getByRole("alert")).toHaveTextContent("could not be loaded");
  });

  test("o recado pode vir de fora, porque só o consumidor sabe o que falhou", () => {
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} state="error" stateMessage="The billing service is down." />);
    expect(screen.getByRole("alert")).toHaveTextContent("The billing service is down.");
  });

  test("carregando com dado na tela NÃO apaga o dado — só marca aria-busy", () => {
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} state="loading" />);
    expect(screen.getByRole("region", {name: "Table"})).toHaveAttribute("aria-busy", "true");
    expect(linhas()).toHaveLength(3);
    expect(document.querySelectorAll(".datagrid-skeleton")).toHaveLength(0);
  });

  test("carregando SEM dado mostra esqueleto, uma célula por coluna", () => {
    wrap(<DataGrid data={[]} columns={COLS_TAREFA} state="loading" pageSize={4} />);
    expect(screen.queryByText("No results")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".datagrid-skeleton")).toHaveLength(8); // 4 linhas × 2 colunas
  });
});

// PLANO-1.0 Parte F, F7. Os dois estados são MAPAS serializáveis — é isso que
// torna a escolha persistível, e a persistência é do consumidor, como no F4.
describe("DataGrid — colunas ocultáveis e redimensionáveis (F7)", () => {
  const cabecalhos = () => within(screen.getByRole("grid")).getAllByRole("columnheader").map(th => th.textContent);

  test("esconder uma coluna tira a coluna inteira, cabeçalho e células", async () => {
    const user = userEvent.setup();
    const onColumnVisibilityChange = vi.fn();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} hideableColumns onColumnVisibilityChange={onColumnVisibilityChange} />);
    expect(cabecalhos()).toHaveLength(2);

    await user.click(screen.getByRole("combobox", {name: "Columns"}));
    const lista = await screen.findByRole("listbox");
    await user.click(within(lista).getByRole("option", {name: "Estado"}));
    await user.keyboard("{Escape}");

    expect(onColumnVisibilityChange).toHaveBeenLastCalledWith({titulo: true, estado: false});
    expect(cabecalhos()).toHaveLength(1);
    expect(screen.queryByText("aberto")).not.toBeInTheDocument();
  });

  test("a busca sozinha não ganha embrulho — quem já usa `filterable` não muda de aparência", () => {
    const {container, rerender} = wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} filterable />);
    expect(container.querySelector(".datagrid > .cluster")).toBeNull();

    // com o seletor de colunas ao lado, aí sim os dois entram numa linha.
    rerender(<AureaProvider><DataGrid data={TAREFAS} columns={COLS_TAREFA} filterable hideableColumns /></AureaProvider>);
    expect(container.querySelector(".datagrid > .cluster")).not.toBeNull();
  });

  test("visibilidade controlada: o mapa de fora manda", () => {
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} hideableColumns
      columnVisibility={{estado: false}} onColumnVisibilityChange={vi.fn()} />);
    expect(cabecalhos()).toEqual(["Título"]);
  });

  test("sem `resizableColumns` não há alça — e com ela há uma por coluna", () => {
    const {rerender} = wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} />);
    expect(screen.queryAllByRole("button", {name: /Resize column/})).toHaveLength(0);

    rerender(<AureaProvider><DataGrid data={TAREFAS} columns={COLS_TAREFA} resizableColumns /></AureaProvider>);
    expect(screen.getAllByRole("button", {name: /Resize column/})).toHaveLength(2);
  });

  test("a alça responde ao TECLADO — o motor só entrega o arrasto", async () => {
    const user = userEvent.setup();
    const onColumnSizingChange = vi.fn();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} resizableColumns onColumnSizingChange={onColumnSizingChange} />);

    const alca = screen.getAllByRole("button", {name: /Resize column/})[0];
    alca.focus();
    await user.keyboard("{ArrowRight}");
    expect(onColumnSizingChange).toHaveBeenLastCalledWith({titulo: 166}); // 150 + 16
    await user.keyboard("{ArrowLeft}");
    expect(onColumnSizingChange).toHaveBeenLastCalledWith({titulo: 150}); // 166 - 16: a segunda tecla parte do tamanho NOVO
  });

  test("a largura controlada chega ao cabeçalho", () => {
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} resizableColumns
      columnSizing={{titulo: 320}} onColumnSizingChange={vi.fn()} />);
    expect(within(screen.getByRole("grid")).getAllByRole("columnheader")[0]).toHaveStyle({width: "320px"});
  });
});

// PLANO-1.0 Parte F, F6. O comportamento é de CSS e está travado no skin.spec, que
// rola de verdade e mede. Aqui trava-se só o contrato do React: a prop liga a classe,
// e sem a prop ela não aparece — senão toda grade pagaria o teto de altura.
describe("DataGrid — cabeçalho fixo (F6)", () => {
  test("a prop liga a classe, e sem ela a grade não muda", () => {
    const {container, rerender} = wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} />);
    expect(container.querySelector(".datagrid")).not.toHaveClass("datagrid-sticky");

    rerender(<AureaProvider><DataGrid data={TAREFAS} columns={COLS_TAREFA} stickyHeader /></AureaProvider>);
    expect(container.querySelector(".datagrid")).toHaveClass("datagrid-sticky");
  });
});

// PLANO-1.0 Parte F, F5. A barra só existe quando há o que fazer E o que fazer
// sobre o quê. O que estes testes travam é o contrato da ação: ela recebe as
// linhas ORIGINAIS e um jeito de limpar — sem isso o consumidor teria de rastrear
// a seleção por fora, que é justamente o que a barra existe para evitar.
describe("DataGrid — ação em lote (F5)", () => {
  const marcarPrimeira = async (user: ReturnType<typeof userEvent.setup>) =>
    user.click(screen.getAllByRole("checkbox", {name: "Select row"})[0]);

  test("sem `bulkActions` não há barra, mesmo com linha marcada", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} selectable getRowId={r => r.id} />);
    await marcarPrimeira(user);
    expect(screen.queryByRole("toolbar", {name: "Bulk actions"})).not.toBeInTheDocument();
  });

  test("com ações mas sem seleção, também não — a barra é o estado, não a decoração", () => {
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} selectable getRowId={r => r.id}
      bulkActions={[{id: "del", label: "Delete", onAction: vi.fn()}]} />);
    expect(screen.queryByRole("toolbar", {name: "Bulk actions"})).not.toBeInTheDocument();
  });

  test("a barra aparece com a contagem e a ação recebe as linhas originais", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} selectable getRowId={r => r.id}
      bulkActions={[{id: "del", label: "Delete", icon: "trash-can", onAction}]} />);

    await marcarPrimeira(user);
    const barra = screen.getByRole("toolbar", {name: "Bulk actions"});
    expect(within(barra).getByText("1 selected")).toBeInTheDocument();

    await user.click(within(barra).getByRole("button", {name: "Delete"}));
    expect(onAction).toHaveBeenCalledWith([TAREFAS[0]], expect.any(Function));
  });

  test("limpar esvazia a seleção e some com a barra", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} selectable getRowId={r => r.id}
      onSelectionChange={onSelectionChange} bulkActions={[{id: "del", label: "Delete", onAction: vi.fn()}]} />);

    await marcarPrimeira(user);
    await user.click(screen.getByRole("button", {name: "Clear selection"}));
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole("toolbar", {name: "Bulk actions"})).not.toBeInTheDocument();
  });

  test("a ação também recebe o jeito de limpar, e ele funciona", async () => {
    const user = userEvent.setup();
    let limpar: (() => void) | undefined;
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} selectable getRowId={r => r.id}
      bulkActions={[{id: "arch", label: "Archive", onAction: (_rows, clear) => {limpar = clear}}]} />);

    await marcarPrimeira(user);
    await user.click(screen.getByRole("button", {name: "Archive"}));
    expect(limpar).toBeTypeOf("function");
    act(() => limpar!());
    expect(screen.queryByRole("toolbar", {name: "Bulk actions"})).not.toBeInTheDocument();
  });

  test("o filtro não desmarca o que ficou escondido — a contagem segue", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} selectable getRowId={r => r.id} filterable
      bulkActions={[{id: "del", label: "Delete", onAction: vi.fn()}]} />);

    await marcarPrimeira(user); // "Migrar índice"
    await user.type(screen.getByRole("searchbox", {name: "Filter"}), "publicar");
    // a linha marcada sumiu da tela, e continua marcada: agir em lote sobre o que o
    // filtro escondeu é o que o consumidor pediu ao marcar antes de filtrar.
    expect(within(screen.getByRole("toolbar", {name: "Bulk actions"})).getByText("1 selected")).toBeInTheDocument();
  });
});

const NOTIFS: NotificationItem[] = [
  {id: "a", title: "Deploy concluído", time: "agora", group: "Hoje", read: false},
  {id: "b", title: "Nova mensagem", time: "14:20", group: "Hoje", read: false},
  {id: "c", title: "Backup semanal", time: "seg", group: "Anteriores", read: true},
];

describe("NotificationCenter", () => {
  test("count no gatilho, agrupa por tempo e marca não lidas para o leitor", async () => {
    const user = userEvent.setup();
    // gatilho traz a contagem de não lidas no nome acessível (o badge visual é aria-hidden).
    wrap(<NotificationCenter items={NOTIFS} onItemClick={vi.fn()} />);
    await user.click(screen.getByRole("button", {name: "Notifications (2)"}));

    // cada group vira um <ul> nomeado pelo rótulo de tempo.
    const hoje = await screen.findByRole("list", {name: "Hoje"});
    expect(screen.getByRole("list", {name: "Anteriores"})).toBeInTheDocument();
    expect(within(hoje).getAllByRole("listitem")).toHaveLength(2);

    // não lida ganha o prefixo sr-only; a lida não.
    expect(within(hoje).getByRole("button", {name: /Deploy concluído/})).toHaveAccessibleName(/Unread/);
    expect(screen.getByRole("button", {name: /Backup semanal/})).not.toHaveAccessibleName(/Unread/);
  });

  test("dispara onItemClick no item e onMarkAllRead no botão do cabeçalho", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    const onMarkAllRead = vi.fn();
    wrap(<NotificationCenter items={NOTIFS} onItemClick={onItemClick} onMarkAllRead={onMarkAllRead} />);
    await user.click(screen.getByRole("button", {name: "Notifications (2)"}));

    await user.click(await screen.findByRole("button", {name: "Mark all as read"}));
    expect(onMarkAllRead).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", {name: /Deploy concluído/}));
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({id: "a"}));
  });

  test("sem itens mostra o estado vazio e o gatilho não leva contagem", async () => {
    const user = userEvent.setup();
    wrap(<NotificationCenter items={[]} />);
    await user.click(screen.getByRole("button", {name: "Notifications"}));
    expect(await screen.findByText("No notifications")).toBeInTheDocument();
  });

  test("chegadas consecutivas de mesmo tamanho ainda mutam o anunciador", () => {
    const at = (extra: NotificationItem[]) => <AureaProvider><NotificationCenter items={[...NOTIFS, ...extra]} /></AureaProvider>;
    const {container, rerender} = render(at([]));
    const region = () => container.querySelector('[role="status"]') as HTMLElement;

    rerender(at([{id: "d", title: "Um"}]));
    const primeiro = region().textContent;
    expect(primeiro).toContain("1 new notifications");

    // 2ª chegada de MESMO tamanho: sem o nonce, o texto seria idêntico, o DOM não
    // mutaria e o leitor silenciaria o anúncio (auditoria, MÉDIO 4).
    rerender(at([{id: "d", title: "Um"}, {id: "e", title: "Dois"}]));
    expect(region().textContent).not.toBe(primeiro);
    expect(region().textContent).toContain("1 new notifications");
  });
});

describe("MediaPlayer", () => {
  // O motor de mídia é do browser — o jsdom não implementa play()/pause() (lançam
  // "Not implemented"). Mockar espelha a decisão do ROADMAP: testar o NOSSO handler,
  // não o widget nativo. currentTime/muted/duration o jsdom trata como propriedades.
  let play: ReturnType<typeof vi.spyOn>, pause: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined as never);
    pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });
  afterEach(() => { play.mockRestore(); pause.mockRestore(); });

  const getVideo = (c: HTMLElement) => c.querySelector("video") as HTMLVideoElement;

  // O tempo por extenso do aria-valuetext é caminho de formatação — testa sozinho.
  test("spokenTime formata singular/plural de minutos e segundos", () => {
    expect(spokenTime(0)).toBe("0 seconds");
    expect(spokenTime(1)).toBe("1 second");
    expect(spokenTime(61)).toBe("1 minute and 1 second");
    expect(spokenTime(120)).toBe("2 minutes");
    expect(spokenTime(754)).toBe("12 minutes and 34 seconds");
  });

  test("play/pause: o botão aciona o motor nativo e o rótulo/ícone segue o evento de mídia", async () => {
    const user = userEvent.setup();
    const {container} = wrap(<MediaPlayer src="/clipe.mp4" title="Clipe" />);
    const video = getVideo(container);

    await user.click(screen.getByRole("button", {name: "Play"}));
    expect(play).toHaveBeenCalledOnce();

    // o estado espelha o EVENTO play (não o clique) — é assim que sincroniza com
    // mudanças externas (controles nativos, autoplay). fireEvent dispara o evento.
    fireEvent.play(video);
    await user.click(screen.getByRole("button", {name: "Pause"}));
    expect(pause).toHaveBeenCalledOnce();
    fireEvent.pause(video);
    expect(screen.getByRole("button", {name: "Play"})).toBeInTheDocument();
  });

  test("seek: a barra é um slider com aria-valuetext de tempo legível e move o currentTime", () => {
    const {container} = wrap(<MediaPlayer src="/clipe.mp4" title="Clipe" />);
    const video = getVideo(container);
    // duration é readonly no jsdom; definir + disparar durationChange simula metadata.
    Object.defineProperty(video, "duration", {configurable: true, value: 754});
    fireEvent.durationChange(video);

    const slider = screen.getByRole("slider", {name: "Seek"});
    expect(slider).toHaveAttribute("max", "754");
    fireEvent.change(slider, {target: {value: "256"}});
    expect(video.currentTime).toBe(256);
    // o número cru viraria "256"; o aria-valuetext lê o tempo por extenso.
    expect(slider).toHaveAttribute("aria-valuetext", "4 minutes and 16 seconds of 12 minutes and 34 seconds");
  });

  test("mute: alterna o estado do elemento e troca rótulo e ícone", async () => {
    const user = userEvent.setup();
    const {container} = wrap(<MediaPlayer src="/clipe.mp4" title="Clipe" />);
    const video = getVideo(container);
    await user.click(screen.getByRole("button", {name: "Mute"}));
    expect(video.muted).toBe(true);
    expect(screen.getByRole("button", {name: "Unmute"})).toBeInTheDocument();
  });

  test("handler externo compõe com o interno (onPlay não silencia o estado)", () => {
    const onPlay = vi.fn();
    const {container} = wrap(<MediaPlayer src="/clipe.mp4" title="Clipe" onPlay={onPlay} />);
    fireEvent.play(getVideo(container));
    // os dois acontecem: o consumidor é notificado E o botão vira "Pause".
    expect(onPlay).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", {name: "Pause"})).toBeInTheDocument();
  });

  // AUD-0005 (12/08/2026): `onClick` é destrinchado das props para poder ser COMPOSTO com o
  // togglePlay no vídeo, e no ramo de áudio nunca era recomposto — o callback desaparecia. O tipo
  // promete `onClick` nos dois modos, então o áudio estava mentindo. Os dois modos no mesmo teste
  // de propósito: a correção do áudio não pode custar a composição do vídeo.
  test("AUD-0005: onClick chega ao áudio, e o vídeo continua compondo com o play", async () => {
    const user = userEvent.setup();
    const noAudio = vi.fn();
    const {container: cA} = wrap(<MediaPlayer kind="audio" src="/faixa.mp3" title="Faixa" onClick={noAudio} />);
    const audio = cA.querySelector("audio")!;
    await user.click(audio);
    expect(noAudio).toHaveBeenCalledOnce();

    const noVideo = vi.fn();
    const {container: cV} = wrap(<MediaPlayer src="/clipe.mp4" title="Clipe" onClick={noVideo} />);
    await user.click(getVideo(cV));
    expect(noVideo).toHaveBeenCalledOnce();
  });
});

// SortableList (L3). A trava do item é de ACESSIBILIDADE: "sem caminho por teclado, não fecha".
// Então é o teclado que este bloco cobra, e não o arrasto — arrastar é PointerEvent com captura e
// medida de caixa, coisas que o jsdom não faz; o que dá para provar sem navegador é o protocolo.
describe("SortableList — arrastar precisa de alternativa sem arrastar (L3)", () => {
  const INICIAL = [{id: "a", label: "Draft"}, {id: "b", label: "In review"}, {id: "c", label: "Published"}];
  // Lista de verdade: o componente é CONTROLADO, então sem alguém guardando a ordem o teste
  // provaria só que o callback dispara, e não que a lista anda.
  function Palco({onReorder}: {onReorder?: (f: number, t: number) => void} = {}) {
    const [items, setItems] = useState(INICIAL);
    return <SortableList label="Stages" items={items} onReorder={(f, t) => {
      onReorder?.(f, t);
      setItems(prev => {const n = [...prev]; n.splice(t, 0, ...n.splice(f, 1)); return n;});
    }} />;
  }
  const rotulos = () => screen.getAllByRole("listitem").map(li => li.textContent?.replace("Reorder", ""));

  test("a alça é botão de verdade e está na ordem do Tab", async () => {
    const user = userEvent.setup();
    wrap(<Palco />);
    const alcas = screen.getAllByRole("button", {name: /Reorder/});
    expect(alcas).toHaveLength(3);
    await user.tab();
    expect(alcas[0]).toHaveFocus();
  });

  test("Espaço pega, seta move a lista de verdade, e o foco segue o item", async () => {
    const user = userEvent.setup();
    const espiao = vi.fn();
    wrap(<Palco onReorder={espiao} />);
    expect(rotulos()).toEqual(["Draft", "In review", "Published"]);
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("status")).toHaveTextContent("Picked up: 1 of 3");
    await user.keyboard("{ArrowDown}");
    expect(espiao).toHaveBeenCalledWith(0, 1);
    expect(rotulos()).toEqual(["In review", "Draft", "Published"]);
    expect(screen.getByRole("status")).toHaveTextContent("Moved: 2 of 3");
    // O foco tem de SEGUIR o item que se moveu — senão a próxima seta move o vizinho.
    expect(screen.getAllByRole("button", {name: /Reorder/})[1]).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("status")).toHaveTextContent("Dropped: 2 of 3");
  });

  test("Esc devolve o item ao lugar de onde saiu", async () => {
    const user = userEvent.setup();
    wrap(<Palco />);
    await user.tab();
    await user.keyboard(" {ArrowDown}{ArrowDown}");
    expect(rotulos()).toEqual(["In review", "Published", "Draft"]);
    await user.keyboard("{Escape}");
    expect(rotulos()).toEqual(["Draft", "In review", "Published"]);
    expect(screen.getByRole("status")).toHaveTextContent("Put back: 1 of 3");
  });

  test("as setas não fazem nada com o item SOLTO — elas não sequestram a navegação", async () => {
    const user = userEvent.setup();
    const espiao = vi.fn();
    wrap(<Palco onReorder={espiao} />);
    await user.tab();
    await user.keyboard("{ArrowDown}{ArrowUp}");
    expect(espiao).not.toHaveBeenCalled();
  });

  test("nas pontas a seta não empurra para fora da lista", async () => {
    const user = userEvent.setup();
    const espiao = vi.fn();
    wrap(<Palco onReorder={espiao} />);
    await user.tab();
    await user.keyboard(" {ArrowUp}");
    expect(espiao).not.toHaveBeenCalled();
    expect(rotulos()).toEqual(["Draft", "In review", "Published"]);
  });

  test("cada alça se anuncia com o rótulo da linha, sem o consumidor repetir o texto", () => {
    wrap(<Palco />);
    expect(screen.getByRole("button", {name: "Reorder In review"})).toBeInTheDocument();
  });

  test("axe não acha violação na lista, nas alças nem na região viva", async () => {
    const {container} = wrap(<Palco />);
    await expectNoAxe(container);
  });
});

// L6 — máscara no campo. A decisão é PESQUISADA: não se mascara enquanto se digita (o USWDS
// publica o dele com reprovação de WCAG 2.1 AA registrada; o MUI abandonou máscara nos campos de
// data na v6 e guardou um vídeo chamado `masked-input-bad-ux.mp4` explicando por quê; e máscara ao
// vivo descasa o que o leitor de tela anuncia do que o campo mostra). A Aurea entrega o MOMENTO —
// formatar quando o foco sai — e o formato continua sendo do consumidor, porque placa e documento
// são regra de país.
describe("máscara no campo: formata quando o foco sai, e o valor mora no DOM (L6)", () => {
  const placa = (v: string) => {
    const cru = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return cru.length > 3 ? `${cru.slice(0, 3)}-${cru.slice(3, 7)}` : cru;
  };

  test("digitar NÃO é interrompido: a formatação só acontece ao sair do campo", async () => {
    const user = userEvent.setup();
    wrap(<><Input aria-label="Plate" formatOnBlur={placa} /><button>fora</button></>);
    const campo = screen.getByRole("textbox");
    await user.type(campo, "abc1d23");
    // Enquanto se digita, o que está no campo é EXATAMENTE o que a pessoa digitou — é isto que a
    // máscara ao vivo quebra, e é o defeito que a pesquisa registra.
    expect(campo).toHaveValue("abc1d23");
    await user.tab();
    expect(campo).toHaveValue("ABC-1D23");
  });

  // A TRAVA DO ITEM: valor mascarado CONTINUA NO DOM. Quem pintasse a máscara por cima — num
  // <span> sobreposto, num ::after, num data-attribute — passaria numa inspeção visual e
  // reprovaria aqui: o valor do elemento é o valor.
  test("o texto formatado é o valor do ELEMENTO, não algo desenhado por cima", async () => {
    const user = userEvent.setup();
    const {container} = wrap(<><Input aria-label="Plate" formatOnBlur={placa} /><button>fora</button></>);
    await user.type(screen.getByRole("textbox"), "abc1d23");
    await user.tab();
    const campo = container.querySelector("input") as HTMLInputElement;
    expect(campo.value).toBe("ABC-1D23");
    // e nada foi pintado por cima para simular o formato
    expect(container.querySelector("[data-mask]")).toBeNull();
    expect(container.textContent).not.toContain("ABC-1D23");
  });

  test("campo controlado recebe o texto formatado pelo onChange", async () => {
    const user = userEvent.setup();
    function Controlado() {
      const [v, setV] = useState("");
      return <><Input aria-label="Plate" value={v} onChange={e => setV(e.target.value)} formatOnBlur={placa} /><button>fora</button></>;
    }
    wrap(<Controlado />);
    await user.type(screen.getByRole("textbox"), "xyz9876");
    await user.tab();
    expect(screen.getByRole("textbox")).toHaveValue("XYZ-9876");
  });

  test("sem `formatOnBlur`, o onBlur do consumidor continua chegando", async () => {
    const user = userEvent.setup();
    const saiu = vi.fn();
    wrap(<><Input aria-label="Plain" onBlur={saiu} /><button>fora</button></>);
    await user.click(screen.getByRole("textbox"));
    await user.tab();
    expect(saiu).toHaveBeenCalledOnce();
  });

  // MOEDA: sem componente novo e sem biblioteca. O motor formata pelo Intl da plataforma, no
  // blur, e mantém o valor CRU num input escondido — que é a mesma trava, do lado do número.
  test("NumberField formata moeda pelo Intl e guarda o número cru no DOM", async () => {
    const user = userEvent.setup();
    const {container} = wrap(
      <NumberField label="Price" name="preco" defaultValue={1234.5}
        format={{style: "currency", currency: "BRL"}} locale="pt-BR" />);
    const visivel = screen.getByRole("textbox", {name: "Price"}) as HTMLInputElement;
    // O que se vê é moeda formatada — e a formatação vem do Intl, não de uma tabela nossa.
    expect(visivel.value).toContain("1.234,50");
    const esperado = new Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(1234.5);
    expect(visivel.value.replace(/ /g, " ")).toBe(esperado.replace(/ /g, " "));
    // E o valor CRU continua no DOM, no campo que o formulário envia.
    const escondido = container.querySelector('input[name="preco"]') as HTMLInputElement;
    expect(escondido).not.toBeNull();
    expect(escondido.value).toBe("1234.5");
    // Digitar não é interrompido: o motor formata no blur, como o campo de texto acima.
    await user.click(visivel);
    await user.keyboard("{Control>}a{/Control}99");
    expect(visivel.value).toBe("99");
  });
});

// Prose (L5). O componente é uma linha, e o que importa dele é CSS — por isso a prova de verdade
// (que a pele não vaza para fora de `.prose`) mora no skin.spec, onde há navegador. Aqui fica o
// contrato mínimo: ele não mexe no que recebe.
describe("Prose — a pele do texto, e nada além (L5)", () => {
  test("embrulha sem reescrever: os elementos do parser chegam intactos", () => {
    const {container} = wrap(
      <Prose>
        <h2>The joke tax</h2>
        <p>A paragraph with <a href="#">a link</a>.</p>
        <table><tbody><tr><td>cell</td></tr></tbody></table>
      </Prose>);
    const caixa = container.querySelector(".prose")!;
    // Nenhuma classe nossa nos filhos: quem estiliza é o seletor descendente, não o componente.
    expect(caixa.querySelector("h2")).not.toHaveAttribute("class");
    expect(caixa.querySelector("table")).not.toHaveAttribute("class");
    expect(screen.getByRole("heading", {level: 2, name: "The joke tax"})).toBeInTheDocument();
    expect(screen.getByRole("link", {name: "a link"})).toBeInTheDocument();
  });

  test("a classe do consumidor soma, não substitui", () => {
    const {container} = wrap(<Prose className="minha">texto</Prose>);
    expect(container.querySelector("div")).toHaveClass("prose", "minha");
  });
});

// Gallery (L2). O que se prova aqui é o que a extração do bloco I7 prometeu: ladrilho alcançável
// por teclado, seleção que vem de fora, e ampliar usando o diálogo que já existe.
describe("Gallery — o que era bloco virou peça (L2)", () => {
  const FOTOS = [
    {id: "front", src: "data:,a", alt: "Front", caption: "Front"},
    {id: "back", src: "data:,b", alt: "Back"},
    {id: "use", src: "data:,c", alt: "In use"},
  ];

  // O DEFEITO MEDIDO EM 11/08/2026, no I7: o `.card-interactive` do core tem cursor e hover e
  // NADA de foco — uma <div> com cursor de mão não recebe Tab. Por isso o ladrilho é <button>.
  test("o ladrilho é botão de verdade, e o teclado o alcança", async () => {
    const user = userEvent.setup();
    const escolheu = vi.fn();
    wrap(<Gallery label="Photos" items={FOTOS} onSelect={escolheu} />);
    const botoes = screen.getAllByRole("button");
    expect(botoes).toHaveLength(3);
    await user.tab();
    expect(botoes[0]).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(escolheu).toHaveBeenCalledWith("front");
  });

  // Um <button> que não faz nada é alvo de foco que engana quem navega por teclado — e o axe não
  // pega, porque o botão é válido. Sem `onSelect` e sem `zoom`, os ladrilhos são conteúdo.
  test("sem o que fazer ao clicar, o ladrilho NÃO é botão", () => {
    const {container} = wrap(<Gallery label="Photos" items={FOTOS} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(container.querySelectorAll(".gallery-item")).toHaveLength(3);
    expect(container.querySelectorAll("img.image")).toHaveLength(3);
  });

  test("o selecionado vem de FORA e se marca com aria-current e a linguagem da casa", () => {
    const {container} = wrap(<Gallery label="Photos" items={FOTOS} selected="back" onSelect={() => {}} />);
    const marcados = container.querySelectorAll('[aria-current="true"]');
    expect(marcados).toHaveLength(1);
    expect(marcados[0]).toHaveAccessibleName("Back");
    // `.is-selected` é a MESMA classe da aba ativa e do item de lateral: a galeria não inventa
    // uma segunda maneira de dizer "este está escolhido".
    expect(marcados[0]).toHaveClass("is-selected");
  });

  // A trava do item, escrita no PLANO-1.0: ampliar imagem é diálogo, e diálogo já existe.
  test("ampliar abre o Dialog da casa, com a foto inteira e nome acessível", async () => {
    const user = userEvent.setup();
    wrap(<Gallery label="Photos" items={FOTOS} zoom />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getAllByRole("button")[0]);
    const dialogo = await screen.findByRole("dialog");
    // O nome vem da legenda; sem legenda, do alt. Diálogo sem nome é violação de axe.
    expect(dialogo).toHaveAccessibleName("Front");
    // `contain` e não `cover`: cortar a imagem que a pessoa pediu para VER é o oposto do pedido.
    expect(within(dialogo).getByRole("img", {name: "Front"})).toHaveClass("image-contain");
  });

  test("sem `zoom` não existe diálogo nenhum montado", async () => {
    const user = userEvent.setup();
    wrap(<Gallery label="Photos" items={FOTOS} onSelect={() => {}} />);
    await user.click(screen.getAllByRole("button")[0]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("axe não acha violação na lista, nos ladrilhos nem nas legendas", async () => {
    const {container} = wrap(<Gallery label="Product photos" items={FOTOS} selected="back" onSelect={() => {}} />);
    await expectNoAxe(container);
  });
});

// Image (L4). O que se prova aqui é o que o jsdom sabe responder: qual atributo saiu, qual classe
// saiu, e o que sobra quando o `src` quebra. O efeito visual da caixa reservada é do CSS e se mede
// no navegador, na pele.
describe("Image — a caixa é reservada antes do byte (L4)", () => {
  const UM_PIXEL = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='2' height='1'/>";

  test("a proporção vai inline, que é o que reserva a caixa", () => {
    const {container} = wrap(<Image src={UM_PIXEL} alt="Front" ratio="16/9" />);
    const img = container.querySelector("img")!;
    expect(img.style.aspectRatio).toBe("16/9");
    expect(img).toHaveClass("image");
  });

  // O DEFEITO MEDIDO EM 15/08/2026, e este teste é o que o pega: a regra do core tinha
  // `aspect-ratio:var(--image-ratio,auto)`, e o fallback `auto` vence o `auto <width>/<height>`
  // que o navegador deriva dos atributos. Uma imagem com `width`/`height` e sem `ratio` media
  // 400×0 — a regra contra o salto de layout produzindo o salto. Sem prop, ninguém declara nada.
  test("sem `ratio` NÃO se declara proporção — quem sabe é o width/height do elemento", () => {
    const {container} = wrap(<Image src={UM_PIXEL} alt="Front" width={300} height={200} />);
    const img = container.querySelector("img")!;
    expect(img.style.aspectRatio).toBe("");
    expect(img).toHaveAttribute("width", "300");
    expect(img).toHaveAttribute("height", "200");
  });

  test("lazy e async por default, e o consumidor sobrescreve", () => {
    const {container: a} = wrap(<Image src={UM_PIXEL} alt="Front" />);
    expect(a.querySelector("img")).toHaveAttribute("loading", "lazy");
    expect(a.querySelector("img")).toHaveAttribute("decoding", "async");
    const {container: b} = wrap(<Image src={UM_PIXEL} alt="Hero" loading="eager" />);
    expect(b.querySelector("img")).toHaveAttribute("loading", "eager");
  });

  // O DEFEITO QUE ESTE TESTE GUARDA é medido e é desta casa: em 31/07/2026 o `Avatar` com `src`
  // quebrado NÃO caía no fallback — mostrava o glifo de imagem partida do navegador, e o `alt`
  // sumia com ele. Aqui o texto alternativo sobrevive, com papel de imagem.
  test("`src` quebrado cai numa caixa nomeada, e o alt sobrevive", () => {
    const {container} = wrap(<Image src="/nao-existe.jpg" alt="The product, from the front" ratio="16/9" />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    const caixa = screen.getByRole("img", {name: "The product, from the front"});
    expect(caixa).toHaveClass("image-broken");
    // A caixa quebrada reserva o MESMO espaço: sem isto a página salta justamente no caso de erro.
    expect((caixa as HTMLElement).style.aspectRatio).toBe("16/9");
  });

  test("o onError do consumidor continua sendo chamado", () => {
    const meu = vi.fn();
    const {container} = wrap(<Image src="/nao-existe.jpg" alt="Front" onError={meu} />);
    fireEvent.error(container.querySelector("img")!);
    expect(meu).toHaveBeenCalledOnce();
  });

  // O cuidado medido do item: um consumidor já usa o <Image> do framework dele. `render` troca o
  // elemento sem perder a nossa pele nem a caixa reservada.
  test("`render` troca o elemento e mantém pele e proporção", () => {
    const Outro = (p: React.ImgHTMLAttributes<HTMLImageElement>) => <img data-framework="" {...p} />;
    const {container} = wrap(<Image src={UM_PIXEL} alt="Front" ratio="4/5" render={<Outro />} />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("data-framework");
    expect(img).toHaveClass("image");
    expect(img.style.aspectRatio).toBe("4/5");
  });
});

// Carousel (L1). O jsdom não faz layout — toda medida sai zero —, então o que se prova aqui é o
// que NÃO depende de pixel: a numeração dos slides, o alcance por teclado e o cálculo do
// deslocamento, este último com as caixas ditadas à mão. O comportamento que depende de layout
// (encaixe, seta desabilitada na ponta) é do contêiner nativo e se mede no navegador.
describe("Carousel — o contêiner de rolagem É o motor (L1)", () => {
  // Caixa mínima que basta ao componente: ele só lê `left` e `right`.
  const caixa = (left: number, right: number) =>
    ({left, right, top: 0, bottom: 0, width: right - left, height: 0, x: left, y: 0,
      toJSON() {}}) as DOMRect;
  // Três slides de 300px numa janela de 300px, ditados sobre o DOM que o jsdom não mede.
  const comLayout = (trilho: HTMLElement) => {
    trilho.getBoundingClientRect = () => caixa(0, 300);
    [...trilho.children].forEach((f, i) =>
      ((f as HTMLElement).getBoundingClientRect = () => caixa(i * 300, i * 300 + 300)));
  };
  const tres = [<div key="a">A</div>, <div key="b">B</div>, <div key="c">C</div>];

  test("cada slide se anuncia numerado, e quem conta é o componente", () => {
    wrap(<Carousel label="Product photos">{tres}</Carousel>);
    expect(screen.getByRole("region", {name: "Product photos"}))
      .toHaveAttribute("aria-roledescription", "carousel");
    // A conta ser do componente é o ponto de embrulhar o filho: com sete peças, como na
    // referência, o "Slide 3 de 8" fica com o consumidor — que é onde ele desatualiza.
    expect(screen.getAllByRole("group").map(s => s.getAttribute("aria-label")))
      .toEqual(["Slide 1 of 3", "Slide 2 of 3", "Slide 3 of 3"]);
  });

  // Regra `scrollable-region-focusable` do axe: conteúdo que rola tem de ser alcançável por
  // teclado. É também de onde vêm as setas de rolagem — sem interceptar tecla nenhuma.
  test("a faixa é alcançável por teclado", () => {
    const {container} = wrap(<Carousel label="Photos">{tres}</Carousel>);
    expect(container.querySelector(".carousel-track")).toHaveAttribute("tabindex", "0");
  });

  test("o ponto rola até o slide dele, medindo pela borda inicial", async () => {
    const user = userEvent.setup();
    const {container} = wrap(<Carousel label="Photos">{tres}</Carousel>);
    const trilho = container.querySelector(".carousel-track") as HTMLElement;
    const rolou = vi.fn();
    trilho.scrollBy = rolou as never;
    comLayout(trilho);
    await user.click(screen.getByRole("button", {name: "Slide 3"}));
    expect(rolou).toHaveBeenCalledWith({left: 600});
  });

  // Em RTL o `scrollLeft` é NEGATIVO e a borda inicial é a DIREITA. Sem o ramo, um carrossel em
  // árabe rolaria para o lado errado e nasceria com as setas no estado trocado.
  test("em RTL o deslocamento é medido pela borda direita", async () => {
    const user = userEvent.setup();
    const {container} = wrap(<div dir="rtl"><Carousel label="Photos">{tres}</Carousel></div>);
    const trilho = container.querySelector(".carousel-track") as HTMLElement;
    const rolou = vi.fn();
    trilho.scrollBy = rolou as never;
    trilho.getBoundingClientRect = () => caixa(0, 300);
    // Espelhado: o slide 3 está à ESQUERDA de tudo, e alinhar as bordas direitas pede -600.
    [...trilho.children].forEach((f, i) =>
      ((f as HTMLElement).getBoundingClientRect = () => caixa(-i * 300, 300 - i * 300)));
    await user.click(screen.getByRole("button", {name: "Slide 3"}));
    expect(rolou).toHaveBeenCalledWith({left: -600});
  });

  test("controls e indicators desligam sem levar a faixa junto", () => {
    const {container} = wrap(<Carousel label="Photos" controls={false} indicators={false}>{tres}</Carousel>);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(container.querySelectorAll(".carousel-slide")).toHaveLength(3);
  });

  test("axe não acha violação na região, nos slides nem nos controles", async () => {
    const {container} = wrap(<Carousel label="Product photos">{tres}</Carousel>);
    await expectNoAxe(container);
  });
});

// AUD-0004 (12/08/2026): `Button` com `href` vira `<a>`, e `<a>` não tem `disabled`. O ramo
// desabilitado tirava o `href` e punha `aria-disabled` — mas deixava o `onClick` do consumidor
// passar intacto, então o "link desabilitado" continuava executando a ação. O ramo de `<button>`
// nunca teve o defeito (o `disabled` nativo barra o evento), e por isso o teste cobre os dois: a
// correção não pode ter desligado o caminho que funcionava.
describe("Button/IconButton: link desabilitado não executa a ação (AUD-0004)", () => {
  test("href + disabled não dispara onClick, e href + loading também não", async () => {
    const user = userEvent.setup();
    const desabilitado = vi.fn(), carregando = vi.fn();
    wrap(<><Button href="/ir" disabled onClick={desabilitado}>Ir</Button>
      <Button href="/ir" loading onClick={carregando}>Carregar</Button></>);
    await user.click(screen.getByText("Ir"));
    await user.click(screen.getByText("Carregar"));
    expect(desabilitado).not.toHaveBeenCalled();
    expect(carregando).not.toHaveBeenCalled();
  });

  test("href desabilitado também não entrega onClickCapture", async () => {
    const user = userEvent.setup();
    const desabilitado = vi.fn(), carregando = vi.fn();
    wrap(<><Button href="/ir" disabled onClickCapture={desabilitado}>Ir</Button>
      <Button href="/ir" loading onClickCapture={carregando}>Carregar</Button></>);
    await user.click(screen.getByText("Ir"));
    await user.click(screen.getByText("Carregar"));
    expect(desabilitado).not.toHaveBeenCalled();
    expect(carregando).not.toHaveBeenCalled();
  });

  test("href desabilitado não deixa props desmentirem aria-disabled", () => {
    wrap(<Button href="/ir" disabled aria-disabled={false}>Ir</Button>);
    expect(screen.getByText("Ir").closest("a")).toHaveAttribute("aria-disabled", "true");
  });

  test("IconButton herda a correção — ele é um Button por dentro", async () => {
    const user = userEvent.setup();
    const espia = vi.fn();
    wrap(<IconButton href="/ir" disabled icon="close" label="Fechar" onClick={espia} />);
    // por rótulo, e não por papel: sem `href` o `<a>` NÃO é um link (papel genérico) nem é
    // focável. É o comportamento documentado do ramo desabilitado — `<a>` não tem `disabled` —,
    // e foi este teste que me obrigou a olhar: eu tinha pedido `role="link"` e ele não existe.
    await user.click(screen.getByLabelText("Fechar"));
    expect(espia).not.toHaveBeenCalled();
  });

  test("link HABILITADO continua chamando o handler — a correção não pode cegar o caso normal", async () => {
    const user = userEvent.setup();
    const espia = vi.fn();
    wrap(<Button href="/ir" onClick={espia}>Ir</Button>);
    await user.click(screen.getByRole("link", {name: "Ir"}));
    expect(espia).toHaveBeenCalledOnce();
  });
});

describe("CodeEditor", () => {
  // O motor de edição é do CodeMirror (como o vídeo é do browser no MediaPlayer):
  // testamos o NOSSO — montagem, o tema Aurea aplicado por token, o onChange ligado
  // ao doc e o readOnly. A edição via teclado (contenteditable) é do CodeMirror.
  const editor = (c: HTMLElement) => c.querySelector(".cm-editor") as HTMLElement;

  test("monta, reflete o defaultValue e tem nome acessível", () => {
    const {container} = wrap(<CodeEditor defaultValue="const x = 1" />);
    expect(editor(container)).toBeInTheDocument();
    expect(container.querySelector(".cm-content")?.textContent).toContain("const x = 1");
    // aria-label default vem da i18n; o contenteditable é o textbox.
    expect(screen.getByRole("textbox", {name: "Code editor"})).toBeInTheDocument();
  });

  test("tema Aurea aplica e usa só token (sem cor hardcoded)", () => {
    wrap(<CodeEditor defaultValue="x" />);
    // O EditorView.theme injeta um StyleModule com as regras — os valores citam os
    // var(--*) verbatim. Prova que o tema aplica E que é token-based, não cor crua.
    const css = Array.from(document.querySelectorAll("style")).map(s => s.textContent).join("");
    expect(css).toContain("var(--surface-inset)");
    expect(css).toContain("var(--font-code)");
    // e nenhuma cor hex/rgb crua nas regras .cm-* do nosso tema (as do CM base ficam
    // no fallback; as NOSSAS são todas var(--*)).
  });

  test("onChange dispara com o texto ao editar o doc", () => {
    const onChange = vi.fn();
    const {container} = wrap(<CodeEditor defaultValue="" onChange={onChange} />);
    // findFromDOM é API pública do CM — dispara uma transação de edição determinística
    // (sem depender de input de contenteditable no jsdom, que é flaky).
    const view = EditorView.findFromDOM(editor(container))!;
    act(() => { view.dispatch({changes: {from: 0, insert: "abc"}}); });
    expect(onChange).toHaveBeenCalledWith("abc");
  });

  test("readOnly desabilita a edição", () => {
    const {container} = wrap(<CodeEditor defaultValue="x" readOnly />);
    expect(container.querySelector(".cm-content")?.getAttribute("contenteditable")).toBe("false");
  });
});

describe("Chat", () => {
  const MSGS: ChatMessage[] = [
    {id: "1", author: "Analyst", time: "14:36", body: "Divergência detectada.", avatar: {fallback: "A"}, status: {label: "Entregue", variant: "success"}},
    {id: "2", author: "Você", time: "lido", body: "Ok, revisando."},
  ];

  test("log de conversa nomeado com autor/hora/estado (role=log, aria-live)", () => {
    wrap(<MessageList messages={MSGS} />);
    // o container das mensagens É a live region — anúncio de chegada vem daqui.
    const log = screen.getByRole("log", {name: "Conversation"});
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(within(log).getByText("Analyst")).toBeInTheDocument();  // autor
    expect(within(log).getByText("14:36")).toBeInTheDocument();     // hora
    expect(within(log).getByText("Entregue")).toBeInTheDocument();  // estado (Badge + status-dot)
  });

  test("chegada: nova mensagem entra na MESMA live region (não remonta)", () => {
    const {rerender} = wrap(<MessageList messages={MSGS} />);
    const log = screen.getByRole("log");
    expect(within(log).queryByText("Chegou agora")).toBeNull();
    rerender(<AureaProvider><MessageList messages={[...MSGS, {id: "3", author: "Curator", body: "Chegou agora"}]} /></AureaProvider>);
    // a região persiste (mesmo nó) → o leitor anuncia só a mutação, não relê tudo.
    expect(screen.getByRole("log")).toBe(log);
    expect(within(log).getByText("Chegou agora")).toBeInTheDocument();
  });

  test("composer: desabilita vazio, Enter envia o texto aparado e limpa", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    wrap(<MessageComposer onSend={onSend} />);
    const input = screen.getByRole("textbox", {name: "Message"});
    expect(screen.getByRole("button", {name: "Send"})).toBeDisabled();  // vazio → sem envio
    await user.type(input, "  oi  {Enter}");
    expect(onSend).toHaveBeenCalledWith("oi");   // aparado, sem espaços
    expect(onSend).toHaveBeenCalledOnce();
    expect(input).toHaveValue("");               // limpou após enviar
  });
});

describe("QRCode", () => {
  test("é uma imagem com nome acessível e desenha módulos de verdade", () => {
    const {container} = wrap(<QRCode value="https://aureauds.dev" />);
    expect(screen.getByRole("img", {name: "QR code: https://aureauds.dev"})).toBeInTheDocument();
    // a matriz virou dots redondos — não veio vazia.
    expect(container.querySelectorAll("circle.qr-mod").length).toBeGreaterThan(0);
  });

  test("label custom sobrepõe o nome default", () => {
    wrap(<QRCode value="x" label="Escaneie para pagar" />);
    expect(screen.getByRole("img", {name: "Escaneie para pagar"})).toBeInTheDocument();
  });

  test("ecc não é ornamento: 'high' nunca gera um símbolo menor que 'low'", () => {
    // prova que a opção chega à lib — mais correção de erro nunca encolhe a matriz.
    const side = (ecc: "low" | "high") => {
      const {container, unmount} = wrap(<QRCode value="hello world" ecc={ecc} />);
      const vb = Number(container.querySelector("svg")!.getAttribute("viewBox")!.split(" ")[3]);
      unmount(); return vb;
    };
    expect(side("high")).toBeGreaterThanOrEqual(side("low"));
  });

  // B6 do PLANO-1.0: `size` era número e virava atributo width/height no SVG — o consumidor
  // que quisesse outro tamanho escrevia pixel cru. Agora é escala, e o valor mora no core.
  test("tamanho é escala de token, e nada de width/height no SVG", () => {
    const {container} = wrap(<QRCode value="x" size="lg" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("class")).toBe("qrcode qrcode-lg");
    expect(svg.getAttribute("width"), "o tamanho vem do CSS, não do atributo").toBeNull();
    expect(svg.getAttribute("height")).toBeNull();
    const {container: padrao} = wrap(<QRCode value="x" />);
    expect(padrao.querySelector("svg")!.getAttribute("class"), "md não emite classe").toBe("qrcode");
  });

  test("não tem violações axe", async () => {
    const {container} = wrap(<QRCode value="https://aureauds.dev" />);
    await expectNoAxe(container);
  });
});

describe("Status", () => {
  test("ponto colorido pela variante, rótulo legível e ponto fora do leitor de tela", () => {
    const {container} = wrap(<Status variant="online">Online</Status>);
    // quem diz o estado é o TEXTO — a cor é reforço, não o sinal (WCAG 1.4.1).
    expect(screen.getByText("Online")).toHaveClass("status-label");
    expect(container.querySelector(".status")).toHaveClass("status-online");
    expect(container.querySelector(".status-dot")).toHaveAttribute("aria-hidden", "true");
  });

  test("neutral não emite classe de variante", () => {
    const {container} = wrap(<Status>Idle</Status>);
    expect(container.querySelector(".status")!.className).toBe("status");
  });

  test("não tem violações axe", async () => {
    const {container} = wrap(<Status variant="busy">Busy</Status>);
    await expectNoAxe(container);
  });
});

// B1 do PLANO-1.0 (06/08/2026). A lateral era um <aside> vazio: item, grupo, aninhamento e
// item atual só existiam como chrome do catálogo, ou seja, fora da API pública. Estes testes
// cobram a lista que ela ganhou — e o caso que mais barato seria quebrar é o do trilho.
// A LATERAL FLUTUA POR PADRÃO — é a identidade desta casa. Em 18/08/2026 estes testes travavam o
// padrão INVERTIDO, e travar não é o mesmo que estar certo: eles passaram verdes enquanto as 106
// páginas do catálogo perdiam o flutuante. O Victor separou as duas coisas em 20/08/2026 — ter a
// variante é uma coisa, usá-la nas nossas páginas é outra. O que estes testes travam agora é o
// PADRÃO CERTO: se alguém inverter de novo, quem instalar recebe o desenho que ele recusou.
describe("Sidebar — flutuante por padrão, rente como variante", () => {
  const UM: SidebarItem[] = [{id: "a", label: "A", href: "#"}];

  test("o padrão é FLUTUANTE, e não escreve classe de variante", () => {
    const {container} = wrap(<Sidebar label="R" items={UM} />);
    const aside = container.querySelector("aside")!;
    expect(aside).toHaveClass("sidebar");
    // o default não carrega classe: `sidebar-floating` seria classe morta no core
    expect(aside.className).not.toContain("sidebar-floating");
    expect(aside).not.toHaveClass("sidebar-flush");
  });

  test("variant=flush pede a classe — é a única exceção à caixa flutuante", () => {
    const {container} = wrap(<Sidebar label="F" variant="flush" items={UM} />);
    expect(container.querySelector("aside")).toHaveClass("sidebar-flush");
  });

  // A PROVA CONTRA O DEFEITO DE 18/08: a variante existia e o shell não sabia pedir, então ela era
  // enfeite para quem monta pelo caminho normal. Sem esta trava o defeito volta calado.
  test("o AppShell repassa a variante — e sem ela a lateral flutua", () => {
    const {container: comFlush} = wrap(
      <AppShell brand="A" navigation={<nav aria-label="N" />} sidebarVariant="flush" />);
    expect(comFlush.querySelector("aside")).toHaveClass("sidebar-flush");
    const {container: padrao} = wrap(<AppShell brand="A" navigation={<nav aria-label="N" />} />);
    expect(padrao.querySelector("aside")).not.toHaveClass("sidebar-flush");
  });

  // A variante não pode atropelar o recolhido: as duas coisas são eixos diferentes.
  // NO TRILHO O NOME SÓ EXISTE NO TOOLTIP. Recolhida, o rótulo vira `.sr-only`: leitor de tela
  // ouve, e quem ENXERGA fica com um ícone mudo. É o que o `NavButton` da referência resolve.
  test("recolhida, cada item ganha tooltip — expandida, não", () => {
    const {container: trilho} = wrap(<Sidebar label="T" collapsed items={UM} />);
    expect(trilho.querySelector(".sidebar-item")).toHaveAttribute("aria-describedby");
    const {container: aberta} = wrap(<Sidebar label="A" items={UM} />);
    expect(aberta.querySelector(".sidebar-item")).not.toHaveAttribute("aria-describedby");
  });

  test("flush e collapsed convivem", () => {
    const {container} = wrap(<Sidebar label="FC" variant="flush" collapsed items={UM} />);
    const aside = container.querySelector("aside")!;
    expect(aside).toHaveClass("sidebar-flush");
    expect(aside).toHaveClass("sidebar-collapsed");
  });
});

describe("Sidebar — a lista", () => {
  const ITENS: SidebarItem[] = [
    {id: "mail", label: "Mail", items: [
      {id: "inbox", label: "Inbox", icon: "email", href: "/inbox", items: [
        {id: "unread", label: "Unread", href: "/inbox/unread"}]},
      {id: "archive", label: "Archive", href: "/archive"}]},
  ];

  test("com `items` o <nav> é nosso e vem nomeado; com children, é do consumidor", () => {
    const {container} = wrap(<Sidebar items={[{id: "a", label: "A", href: "#"}]} />);
    expect(within(container.querySelector("aside")!)
      .getByRole("navigation", {name: "Sidebar"})).toBeInTheDocument();
    const {container: proprio} = wrap(<Sidebar><nav aria-label="Main">menu</nav></Sidebar>);
    expect(proprio.querySelectorAll("nav")).toHaveLength(1);
    expect(proprio.querySelector(".sidebar-nav"), "sem items não inventamos <nav>").toBeNull();
  });

  test("um formato só: sem href o item é GRUPO; com href e filhos é PAI com sublista", () => {
    const {container} = wrap(<Sidebar items={ITENS} />);
    // "Mail" tem filhos e não navega: vira cabeçalho, não link nem botão
    expect(screen.queryByRole("link", {name: "Mail"})).toBeNull();
    expect(screen.queryByRole("button", {name: "Mail"})).toBeNull();
    const rotulo = container.querySelector(".sidebar-group-label")!;
    expect(rotulo).toHaveTextContent("Mail");
    // e a lista do grupo é nomeada por ele — senão o grupo é só um estilo
    expect(container.querySelector(`ul[aria-labelledby="${rotulo.id}"]`)).toBeInTheDocument();
    // "Inbox" navega E tem sublista
    expect(screen.getByRole("link", {name: "Inbox"})).toBeInTheDocument();
    expect(container.querySelector(".sidebar-sub")).toBeInTheDocument();
    expect(screen.getByRole("link", {name: "Unread"})).toBeInTheDocument();
  });

  test("só o item atual leva aria-current=page — é dele que sai a pele também", () => {
    const {container} = wrap(<Sidebar items={ITENS} current="inbox" />);
    const marcados = container.querySelectorAll("[aria-current]");
    expect(marcados).toHaveLength(1);
    expect(marcados[0]).toHaveAttribute("aria-current", "page");
    expect(marcados[0]).toHaveTextContent("Inbox");
  });

  test("item sem href é <button> e dispara onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    wrap(<Sidebar items={[{id: "act", label: "Compose", onClick}]} />);
    await user.click(screen.getByRole("button", {name: "Compose"}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  // O defeito clássico do trilho de ícones: esconder o rótulo com display:none passa no olho
  // e deixa uma coluna de ícones anônimos para quem usa leitor de tela.
  test("recolhida, o rótulo sai da TELA e não do DOM", () => {
    const {container} = wrap(
      <Sidebar collapsed items={[{id: "i", label: "Inbox", icon: "email", href: "#", badge: "9"}]} />);
    expect(container.querySelector(".sidebar")).toHaveClass("sidebar-collapsed");
    const rotulo = container.querySelector(".sidebar-label")!;
    expect(rotulo).toHaveClass("sr-only");
    expect(rotulo).toHaveTextContent("Inbox");
    expect(screen.getByRole("link", {name: /Inbox/}), "o link continua nomeado").toBeInTheDocument();
  });

  test("não tem violações axe", async () => {
    const {container} = wrap(<Sidebar items={ITENS} current="inbox" />);
    await expectNoAxe(container);
  });
});

// O Badge reescrito (17/08/2026). O antigo era uma forma, um tamanho e seis cores; estes testes
// cobram as capacidades novas, e sobretudo as três que erram em silêncio se alguém as mexer: o
// contador que some em zero, o `aria-hidden` do sobreposto e o uso de sempre continuar intacto.
describe("Badge — chip e sobreposto", () => {
  test("o uso de sempre não mudou: children é o conteúdo, e a classe é a mesma", () => {
    const {container} = wrap(<Badge variant="primary">12</Badge>);
    const b = container.querySelector(".badge")!;
    expect(b).toHaveClass("badge", "badge-primary");
    expect(b).toHaveTextContent("12");
    expect(b.className).not.toMatch(/badge-(soft|md)/);
  });

  test.each([
    [5, 99, "5"],
    [99, 99, "99"],
    [100, 99, "99+"],
    [1000, 999, "999+"],
  ])("count=%s com max=%s mostra %s", (count, max, esperado) => {
    expect(formatBadgeCount(count, max)).toBe(esperado);
    const {container} = wrap(<Badge count={count} max={max} />);
    expect(container.querySelector(".badge")).toHaveTextContent(esperado);
  });

  // Caixa de entrada zerada não merece uma marca. É o `showZero` da MUI, e o padrão é esconder.
  test("count=0 some no sobreposto, e aparece com showZero", () => {
    const {container: some} = wrap(<Badge anchor="top-end" count={0}><button>Inbox</button></Badge>);
    expect(some.querySelector(".badge")).toBeNull();
    const {container: mostra} = wrap(
      <Badge anchor="top-end" count={0} showZero><button>Inbox</button></Badge>);
    expect(mostra.querySelector(".badge")).toHaveTextContent("0");
  });

  test("invisible esconde o sobreposto sem tirar o filho do lugar", () => {
    const {container} = wrap(<Badge anchor="top-end" count={3} invisible><button>Inbox</button></Badge>);
    expect(container.querySelector(".badge")).toBeNull();
    expect(screen.getByRole("button", {name: "Inbox"})).toBeInTheDocument();
  });

  // A regra de acessibilidade que a documentação da MUI e as três fontes lidas em 17/08/2026
  // dizem igual: o número é DECORAÇÃO, e o sentido dele mora no nome de quem é decorado.
  test("o sobreposto é aria-hidden — o número vai para o nome do pai", () => {
    const {container} = wrap(
      <Badge anchor="top-end" count={8}>
        <button aria-label="Inbox, 8 unread messages">Inbox</button>
      </Badge>);
    expect(container.querySelector(".badge")).toHaveAttribute("aria-hidden", "true");
    // e o botão continua sendo anunciado por si, sem o "8" solto grudado nele
    expect(screen.getByRole("button", {name: "Inbox, 8 unread messages"})).toBeInTheDocument();
  });

  test("anchorShape=circle marca a classe do recuo — é o overlap da MUI", () => {
    const {container} = wrap(
      <Badge anchor="bottom-end" anchorShape="circle" dot><Avatar name="Ana" /></Badge>);
    const b = container.querySelector(".badge")!;
    expect(b).toHaveClass("badge-on-circle", "badge-at-bottom-end", "badge-is-dot");
    expect(b).toBeEmptyDOMElement();
  });

  test("os acessórios do chip entram na ordem, e a imagem leva alt", () => {
    const {container} = wrap(
      <Badge dot image="/a.png" imageAlt="Ana" leading={<i data-x="l" />} trailing={<i data-x="t" />}>
        Ana
      </Badge>);
    const b = container.querySelector(".badge")!;
    expect(b.querySelector(".badge-dot")).toBeInTheDocument();
    expect(b.querySelector("img.badge-image")).toHaveAttribute("alt", "Ana");
    expect([...b.children].map(c => c.className || c.tagName)).toEqual(
      expect.arrayContaining(["badge-dot", "badge-image"]));
  });

  test.each(["solid", "outline"] as const)("emphasis=%s marca a classe", (emphasis) => {
    const {container} = wrap(<Badge variant="danger" emphasis={emphasis}>x</Badge>);
    expect(container.querySelector(".badge")).toHaveClass(`badge-${emphasis}`);
  });

  test.each(["sm", "lg"] as const)("size=%s marca a classe; md não marca nada", (size) => {
    const {container} = wrap(<Badge size={size}>x</Badge>);
    expect(container.querySelector(".badge")).toHaveClass(`badge-${size}`);
    const {container: medio} = wrap(<Badge size="md">x</Badge>);
    expect(medio.querySelector(".badge")!.className.trim()).toBe("badge");
  });

  test("não tem violações axe, chip e sobreposto", async () => {
    const {container} = wrap(<>
      <Badge variant="success" emphasis="solid" dot>Ready</Badge>
      <Badge anchor="top-end" count={8}><button aria-label="Inbox, 8 unread">Inbox</button></Badge>
    </>);
    await expectNoAxe(container);
  });
});

// A lacuna estrutural do CONSUMIDOR-1 §4.1 (17/08/2026). O que estes testes cobram é
// justamente o que separa uma barra inferior de uma fileira de botões bonita: o landmark, o
// item ser LINK, e o atual sair de `aria-current` — que é de onde a pele também sai.
describe("BottomNav — a barra de aplicativo", () => {
  const ITENS: SidebarItem[] = [
    {id: "home", label: "Home", icon: "home", href: "/"},
    {id: "rides", label: "Rides", icon: "meter", href: "/rides", badge: "3"},
    {id: "me", label: "Profile", icon: "user", href: "/me"},
  ];

  test("é um <nav> nomeado com links, e só o atual leva aria-current=page", () => {
    const {container} = wrap(<BottomNav items={ITENS} current="rides" />);
    expect(screen.getByRole("navigation", {name: "Main"})).toHaveClass("bottom-nav");
    expect(screen.getAllByRole("link")).toHaveLength(3);
    const marcados = container.querySelectorAll("[aria-current]");
    expect(marcados).toHaveLength(1);
    expect(marcados[0]).toHaveAttribute("aria-current", "page");
    expect(marcados[0]).toHaveTextContent("Rides");
  });

  // Aba troca painel; barra inferior troca de página. Se um dia alguém "melhorar" isto para
  // role=tablist, o leitor de tela passa a prometer setas que não levam a lugar nenhum.
  test("NÃO é tablist — nem lista de abas, nem aba", () => {
    wrap(<BottomNav items={ITENS} current="home" />);
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });

  test("item sem href é <button> e dispara onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    wrap(<BottomNav items={[{id: "new", label: "Add", onClick}]} />);
    await user.click(screen.getByRole("button", {name: "Add"}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  // O tipo é o do Sidebar de propósito — uma lista só serve às duas peles. O que a lateral
  // aninha, a barra ACHATA: nível dois dentro de um alvo de toque não existe.
  test("a mesma lista do Sidebar serve, e a sublista é ignorada", () => {
    const {container} = wrap(<BottomNav items={[
      {id: "mail", label: "Mail", href: "/mail", items: [{id: "unread", label: "Unread", href: "/u"}]},
    ]} />);
    expect(screen.getByRole("link", {name: "Mail"})).toBeInTheDocument();
    expect(screen.queryByRole("link", {name: "Unread"})).toBeNull();
    expect(container.querySelectorAll(".bottom-nav-item")).toHaveLength(1);
  });

  // ── A GRAMÁTICA DE 20/08/2026 ────────────────────────────────────────────────────
  // Estes testes trocaram junto com o componente, e o que eles cobram agora é o ACHADO da
  // auditoria de UI/UX, não o comportamento antigo: a variante muda a FORMA do indicador e
  // mais nada. Antes, `pill` escondia o rótulo dos inativos e `dock` escondia todos — e havia
  // um teste aqui garantindo que escondesse. Era controle protegendo o defeito.
  const INDICADORES = ["none","subtle","pill","circle","circle-raised","circle-bold",
    "circle-outline"] as const;

  // A REGRESSÃO QUE ESTE TESTE PEGA é a que a auditoria achou (itens 6 e 7): rótulo sumindo
  // conforme a variante. Sete formas, zero rótulo escondido — nem da tela, nem do DOM.
  test.each(INDICADORES)("indicator=%s não esconde rótulo nenhum", (indicator) => {
    const {container} = wrap(<BottomNav indicator={indicator} items={ITENS} current="rides" />);
    expect(container.querySelector("nav")).toHaveClass(`bottom-nav-ind-${indicator}`);
    expect(container.querySelectorAll(".bottom-nav-label.sr-only")).toHaveLength(0);
    for (const nome of ["Home", "Rides", "Profile"]) {
      expect(screen.getByRole("link", {name: new RegExp(nome)})).toBeInTheDocument();
    }
  });

  // E os dois eixos são INDEPENDENTES: o layout não decide o indicador nem o contrário. Sem
  // esta prova, "são dois eixos" é prosa — foi exatamente assim que as quatro variantes antigas
  // viraram quatro componentes disfarçados.
  test.each([
    ["floating", "circle"] as const,
    ["edge", "circle"] as const,
    ["floating", "none"] as const,
    ["edge", "none"] as const,
  ])("variant=%s com indicator=%s: as duas classes saem juntas", (variant, indicator) => {
    const {container} = wrap(<BottomNav variant={variant} indicator={indicator} items={ITENS} current="rides" />);
    const nav = container.querySelector("nav")!;
    expect(nav).toHaveClass(`bottom-nav-ind-${indicator}`);
    expect(nav.classList.contains("bottom-nav-edge")).toBe(variant === "edge");
  });

  // OS QUATRO NOMES ANTIGOS CONTINUAM VALENDO (ADR-0032: assinatura publicada não se quebra em
  // silêncio). Quem escreveu `variant="surface"` em 17/08 continua recebendo barra flutuante com
  // realce redondo no ícone — e agora com o rótulo que `pill` e `dock` escondiam.
  test.each([
    ["flat", false, "none"] as const,
    ["surface", true, "circle"] as const,
    ["pill", true, "pill"] as const,
    ["dock", true, "circle"] as const,
  ])("o nome legado %s mapeia para o par novo", (legado, flutua, indicador) => {
    const {container} = wrap(<BottomNav variant={legado} items={ITENS} current="rides" />);
    const nav = container.querySelector("nav")!;
    expect(nav).toHaveClass(`bottom-nav-ind-${indicador}`);
    expect(nav.classList.contains("bottom-nav-edge")).toBe(!flutua);
    expect(container.querySelectorAll(".bottom-nav-label.sr-only")).toHaveLength(0);
  });

  test("o padrão é flutuante, marcado só pela cor", () => {
    const {container} = wrap(<BottomNav items={ITENS} current="rides" />);
    const nav = container.querySelector("nav")!;
    expect(nav).toHaveClass("bottom-nav-ind-none");
    expect(nav).not.toHaveClass("bottom-nav-edge");
  });

  // O contador vive na caixa do ÍCONE, e essa caixa existe SEMPRE — é ela que leva o realce
  // do item atual na `surface`. Sem contador ela continua lá, vazia.
  test("o contador mora na caixa do ícone, e a caixa existe com ou sem ele", () => {
    const {container} = wrap(<BottomNav items={ITENS} current="rides" />);
    expect(container.querySelectorAll(".bottom-nav-mark")).toHaveLength(3);
    const comContador = container.querySelector(".bottom-nav-item[aria-current] .bottom-nav-mark")!;
    expect(comContador.querySelector(".bottom-nav-badge")).toHaveTextContent("3");
    // e o contador NÃO é irmão do rótulo — se voltar a ser, ele volta a cobrir o nome
    expect(container.querySelector(".bottom-nav-label + .bottom-nav-badge")).toBeNull();
  });

  test("badge vazio vira ponto: sem texto, e ainda assim renderizado", () => {
    const {container} = wrap(
      <BottomNav items={[{id: "a", label: "Updates", icon: "home", href: "#", badge: ""}]} />);
    const ponto = container.querySelector(".bottom-nav-badge")!;
    expect(ponto).toBeInTheDocument();
    expect(ponto).toBeEmptyDOMElement();
  });

  test.each(["flat", "surface", "pill", "dock"] as const)("não tem violações axe · %s", async (variant) => {
    const {container} = wrap(<BottomNav variant={variant} items={ITENS} current="home" />);
    await expectNoAxe(container);
  });
});

// A LINHA DE LISTA TOCÁVEL — §4.3 do CONSUMIDOR-1 (18/08/2026), a última lacuna do
// consumidor real. O que estes testes cobram é o que separa esta lista de uma lateral deitada:
// ela NÃO é landmark, NÃO tem item corrente, e o valor da direita é um nó qualquer — é por isso
// que Badge e Status compõem aqui sem que este componente saiba deles.
// A RÉGUA (18/08/2026). Faltava por completo: só havia `.prose hr` e o `ToolbarSeparator`, os dois
// presos ao contexto. O que estes testes cobram é o que separa marcação honesta de ARIA decorativo.
describe("Separator — a régua entre coisas", () => {
  test("é um <hr>, e o papel vem do elemento — não de um atributo escrito", () => {
    const {container} = wrap(<Separator />);
    const r = screen.getByRole("separator");
    expect(r.tagName).toBe("HR");
    // ARIA redundante é pior que ARIA nenhuma (aviso do próprio APG): o `<hr>` JÁ é separator.
    expect(r).not.toHaveAttribute("role");
    expect(container.querySelector(".separator")).toBe(r);
  });

  // O papel `separator` já tem orientação HORIZONTAL por padrão. Escrever isso seria repetir o
  // padrão em voz alta sem acrescentar nada.
  test("horizontal NÃO escreve aria-orientation", () => {
    wrap(<Separator />);
    expect(screen.getByRole("separator")).not.toHaveAttribute("aria-orientation");
  });

  test("vertical escreve aria-orientation e leva a classe", () => {
    wrap(<Separator orientation="vertical" />);
    const r = screen.getByRole("separator");
    expect(r).toHaveAttribute("aria-orientation", "vertical");
    expect(r).toHaveClass("separator-vertical");
  });

  test("não é focável — régua não recebe foco", () => {
    wrap(<Separator />);
    expect(screen.getByRole("separator")).not.toHaveAttribute("tabindex");
  });
});

describe("NavList — a linha de lista tocável", () => {
  const ITENS: NavListItem[] = [
    {id: "profile", label: "Profile", description: "Name, photo", icon: "user", href: "/me"},
    {id: "alerts", label: "Notifications", value: "On", icon: "notification", href: "/alerts"},
    {id: "plan", label: "Plan", value: "Free", href: "/plan"},
  ];

  test("é um <ul> de links, e cada linha tem a seta", () => {
    const {container} = wrap(<NavList items={ITENS} />);
    expect(container.querySelector("ul")).toHaveClass("nav-list");
    expect(container.querySelectorAll("li")).toHaveLength(3);
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(container.querySelectorAll(".nav-list-chevron")).toHaveLength(3);
  });

  // A DISTINÇÃO INTEIRA contra Sidebar e BottomNav mora aqui. Se um dia alguém "melhorar" isto
  // para <nav>, a tela de ajustes passa a ter um terceiro landmark que não leva a lugar novo; e
  // `aria-current` prometeria uma página corrente numa lista em que se entra e se volta.
  test("NÃO é landmark e NÃO marca item corrente", () => {
    const {container} = wrap(<NavList items={ITENS} />);
    expect(container.querySelector("nav")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(container.querySelectorAll("[aria-current]")).toHaveLength(0);
  });

  test("o rótulo vem PRIMEIRO no nome acessível, e a segunda linha e o valor entram depois", () => {
    wrap(<NavList items={ITENS} />);
    // WCAG 2.5.3 Label in Name: o que se vê primeiro é o que se ouve primeiro.
    expect(screen.getByRole("link", {name: /^Profile/})).toBeInTheDocument();
    expect(screen.getByRole("link", {name: /^Notifications/})).toHaveTextContent("On");
  });

  test("linha sem href é <button> e dispara onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    wrap(<NavList items={[{id: "sair", label: "Sign out", onClick}]} />);
    await user.click(screen.getByRole("button", {name: "Sign out"}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  // `:disabled` tira da ordem de foco e quem usa teclado nunca descobre que a linha existe — a
  // medição está escrita no core, ao lado de `.btn:disabled`. Então: focável, inerte, e anunciada.
  test("linha desabilitada continua FOCÁVEL, e não dispara", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    wrap(<NavList items={[{id: "beta", label: "Beta", href: "/beta", disabled: true, onClick}]} />);
    const linha = screen.getByRole("button", {name: "Beta"});
    expect(linha).toHaveAttribute("aria-disabled", "true");
    expect(linha).not.toHaveAttribute("disabled");
    await user.click(linha);
    expect(onClick).not.toHaveBeenCalled();
  });

  // `disabled` com `href` NÃO pode virar link: link desabilitado não existe em HTML.
  test("desabilitada com href deixa de ser link", () => {
    wrap(<NavList items={[{id: "beta", label: "Beta", href: "/beta", disabled: true}]} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  test("o valor da direita aceita um NÓ, não só texto — é como Badge compõe aqui", () => {
    const {container} = wrap(<NavList items={[
      {id: "inbox", label: "Inbox", href: "/in", value: <Badge size="xs">4</Badge>},
    ]} />);
    expect(container.querySelector(".nav-list-value .badge")).toBeInTheDocument();
  });

  // Achado OLHANDO o catálogo em 18/08/2026: "Sign out" saiu com seta, e seta promete que a linha
  // ABRE algo. O §4.3 pede "a seta que NAVEGA" — então ela é do DESTINO, não da linha.
  test("a seta é do DESTINO: linha de ação não tem seta", () => {
    const {container} = wrap(<NavList items={[
      {id: "abre", label: "Profile", href: "/me"},
      {id: "age", label: "Sign out", onClick: () => {}},
    ]} />);
    expect(container.querySelectorAll(".nav-list-row")).toHaveLength(2);
    expect(container.querySelectorAll(".nav-list-chevron")).toHaveLength(1);
    expect(screen.getByRole("link", {name: "Profile"}).querySelector(".nav-list-chevron"))
      .toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Sign out"}).querySelector(".nav-list-chevron"))
      .toBeNull();
  });

  test("segunda linha e valor são opcionais, e a linha sem eles não os inventa", () => {
    const {container} = wrap(<NavList items={[{id: "so", label: "About", href: "/about"}]} />);
    expect(container.querySelectorAll(".nav-list-description")).toHaveLength(0);
    expect(container.querySelectorAll(".nav-list-value")).toHaveLength(0);
  });
});

describe("Sidebar / Topbar / AppShell", () => {
  test("Sidebar é um <aside> que só embrulha a navegação do consumidor", () => {
    const {container} = wrap(<Sidebar><nav aria-label="Main">menu</nav></Sidebar>);
    const aside = container.querySelector("aside.sidebar") as HTMLElement;
    expect(within(aside).getByRole("navigation", {name: "Main"})).toBeInTheDocument();
    // a marca não mora mais aqui — ela subiu pro topo.
    expect(aside.querySelector(".brand")).toBeNull();
  });

  test("Topbar é um <header> e é ele quem carrega a marca", () => {
    const {container} = wrap(<Topbar brand="Aurea"><span>ações</span></Topbar>);
    const header = container.querySelector("header.topbar") as HTMLElement;
    expect(within(header).getByText("Aurea")).toHaveClass("brand");
    expect(header).toHaveTextContent("ações");
  });

  test("as 3 peles do topo saem em classe própria; floating é o default", () => {
    const {container: padrao} = wrap(<Topbar brand="A" />);
    expect(padrao.querySelector(".topbar")).toHaveClass("topbar-floating");
    for (const v of ["floating", "flush", "pill"] as const) {
      const {container} = wrap(<Topbar variant={v} brand="A" />);
      expect(container.querySelector(".topbar")).toHaveClass(`topbar-${v}`);
    }
  });

  // A lateral se encaixa ABAIXO do topo, e o `flush` não tem folga em cima — por isso o
  // shell precisa marcar a variante: sem essa classe a lateral fica com um vão errado.
  test("topbarVariant=flush marca o shell e repassa a pele pro topo", () => {
    const {container} = wrap(
      <AppShell brand="Aurea" navigation={<nav />} topbarVariant="flush">c</AppShell>,
    );
    expect(container.querySelector(".app-shell")).toHaveClass("app-shell-flush");
    expect(container.querySelector(".topbar")).toHaveClass("topbar-flush");
  });

  test("sem topbarVariant o shell não ganha modificador", () => {
    const {container} = wrap(<AppShell brand="Aurea" navigation={<nav />}>c</AppShell>);
    expect(container.querySelector(".app-shell")).not.toHaveClass("app-shell-flush");
    expect(container.querySelector(".topbar")).toHaveClass("topbar-floating");
  });

  // Trava o arranjo escolhido: topo, lateral e conteúdo são IRMÃOS diretos do shell —
  // é isso que deixa o topo atravessar a largura toda em vez de ficar preso ao lado da
  // lateral. Se alguém reaninhar (ex.: voltar o .app-main), este teste quebra.
  test("AppShell: topo atravessa a largura; lateral e conteúdo são irmãos dele", () => {
    const {container} = wrap(
      <AppShell brand="Aurea" navigation={<nav aria-label="Main" />} topbar={<span>bar</span>}>
        conteúdo
      </AppShell>,
    );
    expect(container.querySelector(".app-shell > header.topbar > .brand")).toHaveTextContent("Aurea");
    expect(container.querySelector(".app-shell > header.topbar")).toHaveTextContent("bar");
    expect(container.querySelector(".app-shell > aside.sidebar")).toBeInTheDocument();
    expect(container.querySelector(".app-shell > main.content")).toHaveTextContent("conteúdo");
    // o topo vem ANTES da lateral na ordem do DOM (leitura e tabulação seguem o desenho), e
    // desde 21/08/2026 o link de pular vem antes de tudo: o WCAG 2.2 SC 2.4.1 não pede que ele
    // exista, pede que dê para CHEGAR nele antes da navegação repetida. Um link correto no fim
    // do documento não bypassa nada. O contrato de ordem é o mesmo — só ganhou um degrau na
    // frente. Ver `G-A11Y-03` e o teste dedicado em `apresentacao.test.tsx`.
    const filhos = [...container.querySelector(".app-shell")!.children].map(e => e.tagName);
    expect(filhos).toEqual(["A", "HEADER", "ASIDE", "MAIN"]);
  });

  test("sem prop topbar o <header> continua saindo — ele é a casa da marca", () => {
    const {container} = wrap(<AppShell brand="Aurea" navigation={<nav />}>c</AppShell>);
    expect(container.querySelector("header.topbar > .brand")).toHaveTextContent("Aurea");
  });

  test("não tem violações axe", async () => {
    const {container} = wrap(
      <AppShell brand="Aurea" navigation={<nav aria-label="Main"><a href="#c">Components</a></nav>} topbar={<span>bar</span>}>
        conteúdo
      </AppShell>,
    );
    await expectNoAxe(container);
  });
});

describe("axe (a11y estrutural)", () => {
  test("DataGrid não tem violações", async () => {
    const {container} = wrap(<DataGrid data={AGENTES} columns={COLUNAS} label="Agentes" selectable filterable />);
    await expectNoAxe(container);
  });

  test("TreeView não tem violações", async () => {
    const {container} = wrap(<TreeView items={ARVORE} label="Arquivos" defaultExpandedIds={["src"]} />);
    await expectNoAxe(container);
  });

  // MediaPlayer fica FORA do axe: o <video> trava o axe-core no jsdom (ele inspeciona
  // props de mídia que o jsdom stuba e nunca resolve). A a11y do player — rótulos de
  // botão que trocam de estado e o slider com aria-valuetext — já é coberta pelos
  // testes de interação acima.
  test("FileInput não tem violações", async () => {
    const {container} = wrap(<FileInput label="Anexos" hint="PNG até 2 MB" multiple />);
    await expectNoAxe(container);
  });

  test("Chat (MessageList + MessageComposer) não tem violações", async () => {
    const {container} = wrap(
      <>
        <MessageList label="Canal" messages={[
          {id: "1", author: "Analyst", time: "14:36", avatar: {fallback: "A"}, body: "Olá.", status: {label: "Entregue", variant: "success"}},
        ]} />
        <MessageComposer onSend={() => {}} placeholder="Escreva…" />
      </>,
    );
    await expectNoAxe(container);
  });
});


// ── G-API-02: `Tabs` — ativação automática × manual, e o laço do foco ──────────────────────
//
// O motor sempre teve `activateOnFocus`; a Aurea passava `true` FIXO no JSX, então a escolha
// existia e não chegava a ninguém. E não é preferência: a APG nomeia os dois padrões e diz
// quando cada um serve — automática quando trocar de painel é barato, MANUAL quando custa (uma
// busca de rede por aba, um render pesado). Sem a saída, atravessar cinco abas por teclado
// dispara cinco carregamentos.
//
// Os testes medem o EFEITO, não a prop: o `Tabs` da Aurea é controlado, então "o painel trocou"
// é `onChange` ter sido chamado. Contar `aria-selected` no DOM não serviria — quem manda no
// selecionado é o `value` que o pai passa, e ele não muda sozinho num teste.
describe("Tabs — ativação e laço do foco (G-API-02)", () => {
  const abas = [
    {id: "a", label: "Alpha", content: "conteudo a"},
    {id: "b", label: "Beta", content: "conteudo b"},
    {id: "c", label: "Gama", content: "conteudo c"},
  ];

  test("padrão: a seta move o foco E troca a aba — o comportamento de sempre, intacto", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    wrap(<Tabs label="Seções" value="a" onChange={onChange} tabs={abas} />);

    await user.click(screen.getByRole("tab", {name: "Alpha"}));
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", {name: "Beta"})).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith("b");
  });

  // ESTE é o teste que o cartão existe para tornar possível. Com o JSX antigo — `activateOnFocus`
  // literal, sem prop — ele reprova: a seta chamaria `onChange` e a asserção de `not.toHaveBeenCalled`
  // cairia. Provado contra o defeito, não só passando no estado atual.
  test("activateOnFocus={false}: a seta move o foco e NÃO troca a aba; Enter é que troca", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    wrap(<Tabs label="Seções" value="a" onChange={onChange} tabs={abas} activateOnFocus={false} />);

    // clicar na aba JÁ selecionada não emite mudança — o motor só avisa quando o valor muda de
    // verdade, e a primeira versão deste teste presumiu o contrário e reprovou. Medido, não
    // presumido: é o que deixa o `onChange` limpo para a asserção que importa, logo abaixo.
    await user.click(screen.getByRole("tab", {name: "Alpha"}));
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", {name: "Beta"})).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();     // ← o foco andou, o painel ficou

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("b");  // ← e a ativação manual funciona
  });

  test("loopFocus={false}: na última aba a seta NÃO dá a volta", async () => {
    const user = userEvent.setup();
    wrap(<Tabs label="Seções" value="c" onChange={() => {}} tabs={abas} loopFocus={false} />);

    await user.click(screen.getByRole("tab", {name: "Gama"}));
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", {name: "Gama"})).toHaveFocus();
  });

  test("loopFocus padrão: na última aba a seta volta para a primeira", async () => {
    const user = userEvent.setup();
    wrap(<Tabs label="Seções" value="c" onChange={() => {}} tabs={abas} />);

    await user.click(screen.getByRole("tab", {name: "Gama"}));
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", {name: "Alpha"})).toHaveFocus();
  });
});


// ── G-API-02: `NumberField` — a alça de arrasto ────────────────────────────────────────────
//
// O `ScrubArea` do motor estava fora da API, e este arquivo até registrava a recusa: "gesto que
// ninguém descobre sozinho e que não tem equivalente por teclado". As duas metades eram verdade e
// a conclusão não era — nenhuma delas é argumento contra OFERECER o gesto, só contra IMPÔ-LO.
//
// Por isso a metade mais importante destes testes não é o arraste: é provar que ligar a alça NÃO
// TIRA NADA. O teclado continua inteiro, os botões continuam lá, e a alça é invisível para quem
// não usa ponteiro. Uma capacidade aditiva que degradasse a acessível seria pior que a ausência.
describe("NumberField — alça de arrasto (G-API-02)", () => {
  const alca = () => document.querySelector(".number-field-scrub") as HTMLElement | null;
  const arrasta = (el: HTMLElement, delta: {movementX?: number; movementY?: number}) => {
    fireEvent.pointerDown(el, {pointerId: 1, button: 0, clientX: 0, clientY: 0});
    fireEvent.pointerMove(document, {pointerId: 1, movementX: 0, movementY: 0, ...delta});
    fireEvent.pointerUp(document, {pointerId: 1});
  };

  test("padrão: não há alça — ninguém acorda com um campo diferente", () => {
    wrap(<NumberField label="Quantidade" defaultValue={10} />);
    expect(alca()).toBeNull();
  });

  // O TESTE DA CAPACIDADE. Sem `scrubbable` não existe alça e ele reprova na primeira linha —
  // é a prova negativa embutida.
  test("scrubbable: arrastar a alça muda o valor", () => {
    const onValueChange = vi.fn();
    wrap(<NumberField label="Quantidade" defaultValue={10} onValueChange={onValueChange} scrubbable />);

    const el = alca();
    expect(el).not.toBeNull();
    arrasta(el!, {movementX: 20});

    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls.at(-1)![0]).toBeGreaterThan(10);
  });

  test("scrubDirection='vertical': puxar para CIMA aumenta, e a pele recebe o eixo", () => {
    const onValueChange = vi.fn();
    wrap(<NumberField label="Quantidade" defaultValue={10} onValueChange={onValueChange}
                      scrubbable scrubDirection="vertical" />);

    const el = alca()!;
    // o eixo sai como CLASSE porque o motor não publica atributo para ele — se um dia publicar,
    // esta asserção é o lugar onde a mudança aparece.
    expect(el).toHaveClass("number-field-scrub-vertical");

    arrasta(el, {movementY: -20});                      // para cima
    expect(onValueChange.mock.calls.at(-1)![0]).toBeGreaterThan(10);
  });

  test("o arraste respeita min e max — a alça não fura o limite", () => {
    const onValueChange = vi.fn();
    wrap(<NumberField label="Quantidade" defaultValue={9} min={0} max={10}
                      onValueChange={onValueChange} scrubbable />);

    arrasta(alca()!, {movementX: 400});
    expect(onValueChange.mock.calls.at(-1)![0]).toBe(10);
  });

  // ── as três asserções que provam que a alça SOMA, e não substitui ─────────────────────────
  test("a alça é invisível para a tecnologia assistiva e não é parada de Tab", () => {
    wrap(<NumberField label="Quantidade" defaultValue={10} scrubbable />);

    const el = alca()!;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el.getAttribute("tabindex")).toBeNull();
  });

  test("com a alça ligada, o teclado continua inteiro", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    wrap(<NumberField label="Quantidade" defaultValue={10} onValueChange={onValueChange} scrubbable />);

    await user.click(screen.getByLabelText("Quantidade"));
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenLastCalledWith(11);
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(onValueChange).toHaveBeenLastCalledWith(9);
  });

  test("com a alça ligada, os dois botões continuam lá e continuam nomeados", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    wrap(<NumberField label="Quantidade" defaultValue={10} onValueChange={onValueChange} scrubbable />);

    await user.click(screen.getByRole("button", {name: "Increase"}));
    expect(onValueChange).toHaveBeenLastCalledWith(11);
    await user.click(screen.getByRole("button", {name: "Decrease"}));
    expect(onValueChange).toHaveBeenLastCalledWith(10);
  });
});

describe("i18n baseline", () => {
  // O default do produto é inglês; pt-BR segue disponível via strings={ptBR}.
  test("default é inglês, e strings={ptBR} restaura o português", () => {
    const {unmount} = render(<AureaProvider><FileInput label="Anexos" /></AureaProvider>);
    expect(screen.getByText(/Drag files/i)).toBeInTheDocument();
    unmount();

    render(<AureaProvider strings={ptBR}><FileInput label="Anexos" /></AureaProvider>);
    expect(screen.getByText(/Arraste arquivos/i)).toBeInTheDocument();
  });
});

// ── Estados universais — PLANO-1.0 Parte J ─────────────────────────────────────
// O que estes testes cobram NÃO é que os componentes tenham uma prop nova: é que a
// mesma condição diga a mesma coisa em todos eles. Um estado universal que
// significasse coisas diferentes em cada componente seria o defeito que a parte
// existe para impedir, com aparência de cobertura.
describe("estados universais (Parte J)", () => {
  test("são SETE, e os nomes são os do contrato", () => {
    // A lista não se reescreve aqui — ela vem do `pure.tsx`. O que se cobra é que os
    // sete nomes do contrato estejam TODOS lá: tirar um da união reprova nomeando qual.
    expect([...universalStates].sort()).toEqual(
      ["degraded", "offline", "partial", "stale",
       "waiting_approval", "waiting_dependency", "waiting_user"].sort());
  });

  test("nenhum dos sete chega a `danger` — nos sete a tela ainda serve", () => {
    for (const s of universalStates)
      expect(stateSeverity(s)).toBe(s.startsWith("waiting_") ? "info" : "warning");
  });

  test("Status: marca o DOM, deriva a cor e traz o rótulo quando não há filho", () => {
    const {container} = wrap(<Status state="stale" />);
    const el = container.querySelector(".status")!;
    expect(el).toHaveAttribute("data-state", "stale");
    expect(el).toHaveClass("status-warning");
    expect(screen.getByText(/may be out of date/i)).toHaveClass("status-label");
  });

  test("Status: `offline` mantém o ponto vazado que já tinha, não vira aviso", () => {
    const {container} = wrap(<Status state="offline" />);
    expect(container.querySelector(".status")).toHaveClass("status-offline");
  });

  test("Status: a variante explícita VENCE a derivada, e o filho vence a string", () => {
    // Só o consumidor sabe se aquele "esperando" dele é grave.
    const {container} = wrap(<Status state="waiting_approval" variant="danger">Blocked</Status>);
    const el = container.querySelector(".status")!;
    expect(el).toHaveClass("status-danger");
    expect(el).toHaveAttribute("data-state", "waiting_approval");
    expect(screen.getByText("Blocked")).toBeInTheDocument();
  });

  test("Alert: esperar INFORMA, e não interrompe o leitor de tela", () => {
    wrap(<Alert state="waiting_approval" />);
    const el = screen.getByRole("status");
    expect(el).toHaveClass("alert-info");
    expect(el).toHaveAttribute("data-state", "waiting_approval");
    expect(el).toHaveTextContent(/waiting for approval/i);
  });

  test("Alert: NENHUM dos sete emite role=alert", () => {
    // `role="alert"` interrompe quem está lendo. Interromper por "dado talvez velho" é
    // gastar a única interrupção que o leitor de tela tem numa condição que não pede ação.
    for (const s of universalStates) {
      const {container, unmount} = wrap(<Alert state={s} />);
      expect(container.querySelector('[role="alert"]')).toBeNull();
      unmount();
    }
  });

  test("EmptyState: não pinta nada, e a descrição padrão é a compartilhada", () => {
    const {container} = wrap(<EmptyState title="Nothing here" state="offline" />);
    const el = container.querySelector(".empty-state")!;
    expect(el).toHaveAttribute("data-state", "offline");
    expect(el.className).toBe("empty-state");  // ausência não vira alarme
    expect(screen.getByText(/no connection/i)).toBeInTheDocument();
  });

  test("EmptyState: a descrição do consumidor vence a padrão", () => {
    wrap(<EmptyState title="x" state="offline" description="Try again in a minute." />);
    expect(screen.getByText("Try again in a minute.")).toBeInTheDocument();
    expect(screen.queryByText(/no connection/i)).toBeNull();
  });

  test("DataGrid: o marcador vai na GRADE, não no recado", () => {
    const {container} = wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} state="degraded" />);
    expect(container.querySelector(".datagrid")).toHaveAttribute("data-state", "degraded");
    expect(screen.getByRole("status")).toHaveTextContent(/reduced capability/i);
  });

  test("DataGrid: `loading` marca a grade mesmo sem recado nenhum", () => {
    // É o defeito que o check 30 achou na primeira execução: com `loading` não existe
    // Alert, e o estado não chegava ao DOM por lugar nenhum. Sem esta asserção, mover o
    // marcador de volta para o recado passaria despercebido.
    const {container} = wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} state="loading" />);
    expect(container.querySelector(".datagrid")).toHaveAttribute("data-state", "loading");
  });

  test("DataGrid: a frase DA GRADE vence a universal, porque fala de linhas", () => {
    wrap(<DataGrid data={TAREFAS} columns={COLS_TAREFA} state="partial" />);
    expect(screen.getByRole("status")).toHaveTextContent(/rows could not be loaded/i);
  });

  test("o vocabulário é UM: trocar o idioma troca a frase em todos de uma vez", () => {
    // Esta é a asserção que prova a parte inteira. Se cada componente tivesse a sua
    // string, este teste passaria com uma delas e falharia com a outra.
    render(<AureaProvider strings={ptBR}>
      <Status state="degraded" /><Alert state="degraded" />
      <EmptyState title="x" state="degraded" />
    </AureaProvider>);
    expect(screen.getAllByText(/capacidade reduzida/i)).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// M3 — DataState. O que se cobra é a REGRA que toda tela erra: dado velho não some da tela.
describe("DataState — as quatro caras da mesma tela", () => {
  const wrapDS = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

  test("sem estado: entrega o conteúdo e não anuncia nada", () => {
    wrapDS(<DataState><p>120 linhas</p></DataState>);
    expect(screen.getByText("120 linhas")).toBeInTheDocument();
    expect(document.querySelector(".data-state")).not.toHaveAttribute("aria-busy");
  });

  // aria-busy é o que manda a tecnologia assistiva ESPERAR em vez de anunciar meia atualização.
  // Sem ele o esqueleto vira ruído — e o Skeleton já é aria-hidden, então quem fala é a região.
  test("carregando: esqueleto, conteúdo fora, e a região marcada como ocupada", () => {
    wrapDS(<DataState state="loading"><p>120 linhas</p></DataState>);
    expect(screen.queryByText("120 linhas")).toBeNull();
    expect(document.querySelector(".data-state")).toHaveAttribute("aria-busy", "true");
    expect(document.querySelector(".skeleton")).toBeInTheDocument();
  });

  test("carregando com children função: o conteúdo nem é calculado", () => {
    const calculou = vi.fn(() => <p>caro</p>);
    wrapDS(<DataState state="loading">{calculou}</DataState>);
    expect(calculou).not.toHaveBeenCalled();
  });

  test("erro: alerta com a frase do consumidor quando ela existe", () => {
    wrapDS(<DataState state="error" message="O serviço de cobrança está fora"><p>x</p></DataState>);
    expect(screen.getByRole("alert")).toHaveTextContent("O serviço de cobrança está fora");
    expect(screen.queryByText("x")).toBeNull();
  });

  test("vazio: estado vazio, e vazio não é erro", () => {
    wrapDS(<DataState state="empty" emptyTitle="Nenhuma fatura"><p>x</p></DataState>);
    expect(screen.getByText("Nenhuma fatura")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText("x")).toBeNull();
  });

  // A REGRA, e o defeito que ela pega: `stale` não é `loading`. Trocar o conteúdo por um
  // esqueleto quando o dado só está velho é esconder informação que a pessoa já tinha.
  test("stale e partial MANTÊM o conteúdo e põem o aviso junto", () => {
    for (const st of ["stale", "partial", "degraded"] as const) {
      const {unmount} = wrapDS(<DataState state={st}><p>120 linhas</p></DataState>);
      expect(screen.getByText("120 linhas"), `${st} não pode esconder o conteúdo`).toBeInTheDocument();
      expect(document.querySelector(".alert"), `${st} tem de avisar`).toBeInTheDocument();
      unmount();
    }
  });

  test("sem violação de axe em cada uma das caras", async () => {
    for (const st of [undefined, "loading", "error", "empty", "stale"] as const) {
      const {container, unmount} = wrapDS(<DataState state={st}><p>120 linhas</p></DataState>);
      const {violations} = await axe(container);
      expect(violations.map(v => v.id), `estado ${st}`).toEqual([]);
      unmount();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// M2 — o formato deixou de ser só da grade. Estas funções NÃO gerenciam a URL (isso é do
// consumidor, e do `nuqs` se ele quiser um gerenciador): elas só dizem como o estado vira busca.
describe("screenState — o formato de uma TELA na URL", () => {
  test("ida e volta sem perda, com grade e tela juntas", () => {
    const estado = {
      tab: "faturas", view: "grid", detail: "inv-9",
      sorting: [{id: "valor", desc: true}], globalFilter: "acme", page: 3,
      columnFilters: [{id: "estado", value: ["pago", "aberto"]}],
    };
    const params = screenStateToParams(estado);
    const volta = screenStateFromParams(params, [{column: "estado", facet: true}]);
    expect(volta).toEqual(estado);
  });

  test("o que está no default não suja o link", () => {
    const params = screenStateToParams({page: 1});
    expect(params.toString(), "página 1 e chaves vazias ficam fora").toBe("");
  });

  // O defeito que este pega: serializar a tela apagando o que não é dela. Uma URL real carrega
  // `ref`, `utm_*` e companhia, e perder isso quebra atribuição de campanha e link compartilhado.
  test("preserva o que não é deste formato, e limpa o que é", () => {
    const antes = new URLSearchParams("ref=email&utm_source=news&tab=antiga&q=velho");
    const params = screenStateToParams({tab: "nova"}, antes);
    expect(params.get("ref"), "o que não é nosso fica").toBe("email");
    expect(params.get("utm_source")).toBe("news");
    expect(params.get("tab"), "o que é nosso é substituído").toBe("nova");
    expect(params.get("q"), "e o que saiu do estado sai da URL também").toBeNull();
  });

  test("o formato da grade continua valendo igual — nada quebrou", () => {
    const params = screenStateToParams({sorting: [{id: "nome", desc: true}], tab: "t"});
    expect(params.get("sort")).toBe("-nome");
    expect(gridStateFromParams(params).sorting).toEqual([{id: "nome", desc: true}]);
  });
});

// BlockEditor (N1). A decisão do item está na ADR-0025: a Aurea entrega a MOLDURA e o motor de
// texto rico fica com o consumidor. Então o que este bloco cobra é a moldura — ordem por teclado,
// remoção, nome acessível e a razão medida de o componente existir em vez de virar prop da
// SortableList. Formatação (negrito, itálico) não é testada aqui porque não é nossa.
describe("BlockEditor — a moldura dos blocos, e o teclado que a torna usável (N1)", () => {
  const INICIAL = [
    {id: "a", kind: "Heading", children: <h2>The joke tax</h2>},
    // O rótulo é do CONSUMIDOR e não da moldura: o conteúdo do bloco é dele, e o axe abaixo
    // reprovaria um textarea anônimo — corretamente. Num portal de verdade isto é um `Field`.
    {id: "b", kind: "Text", children: <textarea aria-label="Paragraph" defaultValue="The king came up with a plan." />},
    // A figura é a razão medida de este componente existir: conteúdo de FLUXO não cabe no
    // <span> da SortableList.
    {id: "c", kind: "Image", children: <figure><img src="/k.png" alt="The king" /><figcaption>The king</figcaption></figure>},
  ];
  function Palco({onReorder, onRemove}: {onReorder?: (f: number, t: number) => void; onRemove?: boolean} = {}) {
    const [blocks, setBlocks] = useState(INICIAL);
    return <BlockEditor label="Article" blocks={blocks}
      onReorder={(f, t) => {
        onReorder?.(f, t);
        setBlocks(prev => {const n = [...prev]; n.splice(t, 0, ...n.splice(f, 1)); return n;});
      }}
      onRemove={onRemove ? i => setBlocks(prev => prev.filter((_, n) => n !== i)) : undefined} />;
  }
  const tipos = () => screen.getAllByRole("listitem").map(li => li.querySelector(".block-body")?.firstElementChild?.tagName);

  test("Espaço pega, seta move a lista de verdade, e o foco segue o bloco", async () => {
    const user = userEvent.setup();
    const espiao = vi.fn();
    wrap(<Palco onReorder={espiao} />);
    expect(tipos()).toEqual(["H2", "TEXTAREA", "FIGURE"]);
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("status")).toHaveTextContent("Picked up: 1 of 3");
    await user.keyboard("{ArrowDown}");
    expect(espiao).toHaveBeenCalledWith(0, 1);
    expect(tipos()).toEqual(["TEXTAREA", "H2", "FIGURE"]);
    // O foco tem de SEGUIR o bloco que se moveu — senão a próxima seta move o vizinho. É a mesma
    // asserção do L3, e aqui ela vale como prova de que a extração do `useReorder` não perdeu nada.
    expect(screen.getAllByRole("button", {name: /Reorder/})[1]).toHaveFocus();
  });

  test("Esc devolve o bloco ao lugar de onde saiu", async () => {
    const user = userEvent.setup();
    wrap(<Palco />);
    await user.tab();
    await user.keyboard(" {ArrowDown}{ArrowDown}");
    expect(tipos()).toEqual(["TEXTAREA", "FIGURE", "H2"]);
    await user.keyboard("{Escape}");
    expect(tipos()).toEqual(["H2", "TEXTAREA", "FIGURE"]);
    expect(screen.getByRole("status")).toHaveTextContent("Put back: 1 of 3");
  });

  test("as setas não fazem nada com o bloco SOLTO — o editor não sequestra a navegação", async () => {
    const user = userEvent.setup();
    const espiao = vi.fn();
    wrap(<Palco onReorder={espiao} />);
    await user.tab();
    await user.keyboard("{ArrowDown}{ArrowUp}");
    expect(espiao).not.toHaveBeenCalled();
  });

  test("o nome do controle carrega o TIPO e a POSIÇÃO do bloco", () => {
    wrap(<Palco />);
    expect(screen.getByRole("button", {name: "Reorder Image 3 of 3"})).toBeInTheDocument();
  });

  test("sem kind o bloco cai num rótulo genérico, e não em nome vazio", () => {
    wrap(<BlockEditor label="Article" blocks={[{id: "x", children: <p>Solto</p>}]} onReorder={() => {}} />);
    expect(screen.getByRole("button", {name: "Reorder Block 1 of 1"})).toBeInTheDocument();
  });

  // A regra que a Gallery mediu no L2: botão inerte é alvo de foco que engana quem usa teclado.
  test("sem onRemove NÃO nasce botão de remover", () => {
    wrap(<Palco />);
    expect(screen.queryByRole("button", {name: /Remove block/})).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  test("com onRemove o bloco sai, e o botão diz QUAL bloco remove", async () => {
    const user = userEvent.setup();
    wrap(<Palco onRemove />);
    await user.click(screen.getByRole("button", {name: "Remove block Text 2 of 3"}));
    expect(tipos()).toEqual(["H2", "FIGURE"]);
  });

  // A RAZÃO MEDIDA DE O COMPONENTE EXISTIR. O <span> da SortableList só aceita conteúdo de frase;
  // uma <figure> ali dentro é marcação inválida que o navegador reescreve, e o bloco de imagem com
  // legenda — que é literalmente o que o item N1 pede — deixaria de funcionar.
  test("o corpo do bloco aceita conteúdo de FLUXO sem o navegador reescrever a marcação", () => {
    wrap(<Palco />);
    const figura = screen.getByRole("figure");
    expect(figura.closest("li")).toBeInTheDocument();
    expect(figura.parentElement).toHaveClass("block-body");
    expect(figura.querySelector("figcaption")).toHaveTextContent("The king");
  });

  test("axe não acha violação nos blocos, nos controles nem na região viva", async () => {
    const {container} = wrap(<Palco onRemove />);
    await expectNoAxe(container);
  });
});

describe("Toast — o tipo tem de chegar à pele (16/08/2026)", () => {
  // POR QUE ESTE ARQUIVO NÃO TINHA NADA DE TOAST ATÉ HOJE, e o que isso custou: o
  // `AureaToastType` é público desde sempre e o `system.tsx` emite `toast-${t.type}` — mas
  // as quatro classes NÃO EXISTIAM no core. O tipo não pintava nada, e nenhum gate viu: o
  // check 18 só enxerga classe LITERAL, e classe por template é o ponto cego dele (o mesmo
  // que já tinha deixado passar o `log-${level}`).
  //
  // Este teste cobre a metade que é NOSSA — que o tipo vira classe. A outra metade (que a
  // classe FAZ alguma coisa) é do `skin.spec`, porque efeito de CSS não existe no jsdom.
  // O comportamento da fila é do Base UI e não se retesta aqui, pelo precedente do lote 4.
  function Disparo({type}: {type?: AureaToastType}) {
    const toast = useToast();
    return <Button onClick={() => toast.add({title: "Saved", description: "Two files.", type})}>go</Button>;
  }

  test.each(["info", "success", "warning", "danger"] as const)(
    "type=%s vira a classe toast-%s, e não some no caminho", async tipo => {
      const user = userEvent.setup();
      wrap(<Disparo type={tipo} />);
      await user.click(screen.getByRole("button", {name: "go"}));
      const toast = document.querySelector(".toast");
      expect(toast, "o toast não montou — o viewport vem do AureaProvider").not.toBeNull();
      expect(toast).toHaveClass(`toast-${tipo}`);
    });

  test("sem type não inventa classe: só `.toast`", async () => {
    const user = userEvent.setup();
    wrap(<Disparo />);
    await user.click(screen.getByRole("button", {name: "go"}));
    const toast = document.querySelector(".toast")!;
    expect([...toast.classList].filter(c => c.startsWith("toast-"))).toEqual([]);
  });
});
