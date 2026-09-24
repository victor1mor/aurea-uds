import {useState} from "react";
import {render, screen, waitFor} from "@testing-library/react";
import {vi} from "vitest";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {AccessGate, AureaProvider, Button, ConfirmDialog, Dialog, Drawer, Popover, Tooltip} from "../../packages/react/src/index";

// Os quatro overlays são o que o README vende por "focus trap, Escape, focus restoration,
// scroll lock" — e eram os únicos componentes da biblioteca com ZERO teste (auditoria de
// 26/07/2026, achado A7). É a pior lacuna possível: o valor deles é comportamento invisível
// em screenshot, que quebra em silêncio numa atualização do Base UI. A varredura do catálogo
// roda axe nas 169 páginas, mas sempre no estado inicial — nenhuma página estática abre um
// overlay, então nada nunca auditou um overlay ABERTO.
//
// Cada asserção aqui foi escrita contra o que o motor REALMENTE faz, medido em 30/07/2026,
// não contra o que eu esperava que ele fizesse. Duas expectativas minhas caíram no caminho:
// o Base UI 1.6 não usa `aria-modal`, e o jsdom não sabe conter Tab.
// O fixture tem <main> de propósito: sem nenhum landmark, o axe acusa `region` ("todo
// conteúdo deve estar num landmark") contra a PÁGINA e não contra o overlay, e a falha
// diria mais sobre o teste que sobre o componente.
const wrap = (ui: React.ReactNode) =>
  render(<AureaProvider><main>{ui}</main></AureaProvider>);

// Mesmo helper de components.test.tsx: o jest-axe.d.ts do repo é mínimo de propósito e não
// tipa `toHaveNoViolations` (arrastaria @types/jest). A mensagem traz id e nó — senão a falha
// vira "1 violação" e ninguém sabe onde.
async function semViolacao(el: Element, desligar: string[] = []) {
  const regras = Object.fromEntries(desligar.map(r => [r, {enabled: false}]));
  const {violations} = await axe(el, desligar.length ? {rules: regras} : undefined);
  if (!violations.length) return;
  const detalhe = violations
    .map(v => "  " + v.id + " (" + v.nodes.length + "): " + v.help +
      "\n    " + v.nodes.map(n => n.target.join(" ")).join("\n    "))
    .join("\n");
  throw new Error("axe encontrou " + violations.length + " violação(ões):\n" + detalhe);
}

// Dialog e Drawer são controlados: sem estado real, onClose não fecha nada e a restauração
// de foco não dá para observar.
function DialogPalco({tipo}: {tipo: "dialog" | "drawer"}) {
  const [open, setOpen] = useState(false);
  const O = tipo === "dialog" ? Dialog : Drawer;
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir</Button>
      <O open={open} title="Título do overlay" onClose={() => setOpen(false)}>
        <p>Corpo</p>
        <Button>Ação de dentro</Button>
      </O>
    </>
  );
}

for (const tipo of ["dialog", "drawer"] as const) {
  describe(`${tipo} — comportamento de overlay modal`, () => {
    test("abre, e o foco entra", async () => {
      const u = userEvent.setup();
      wrap(<DialogPalco tipo={tipo} />);
      await u.click(screen.getByRole("button", {name: "Abrir"}));
      const caixa = await screen.findByRole("dialog");
      await waitFor(() => expect(caixa.contains(document.activeElement)).toBe(true));
    });

    test("esconde o resto da página da tecnologia assistiva, e tem nome acessível", async () => {
      const u = userEvent.setup();
      const {baseElement} = wrap(<DialogPalco tipo={tipo} />);
      await u.click(screen.getByRole("button", {name: "Abrir"}));
      const caixa = await screen.findByRole("dialog");
      // O Base UI 1.6 NÃO usa aria-modal — ele marca o irmão do portal com aria-hidden, que é
      // o mecanismo moderno e o que de fato torna o overlay modal. Asserir aria-modal seria
      // testar uma implementação que o motor não escolheu.
      const forasteiros = [...baseElement.querySelectorAll(":scope > div")]
        .filter(d => !d.hasAttribute("data-base-ui-portal") && !d.contains(caixa));
      expect(forasteiros.length, "não achei o irmão do portal para conferir").toBeGreaterThan(0);
      for (const d of forasteiros) expect(d).toHaveAttribute("aria-hidden", "true");
      // nome acessível: sem ele o leitor de tela anuncia "diálogo" e nada mais
      expect(caixa).toHaveAccessibleName("Título do overlay");
    });

    test("Escape fecha e devolve o foco ao disparador", async () => {
      const u = userEvent.setup();
      wrap(<DialogPalco tipo={tipo} />);
      const disparador = screen.getByRole("button", {name: "Abrir"});
      await u.click(disparador);
      await screen.findByRole("dialog");
      await u.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      // devolver o foco é o que permite continuar navegando de teclado sem se perder
      await waitFor(() => expect(document.activeElement).toBe(disparador));
    });

    // LIMITE DECLARADO: contenção real de Tab NÃO é provada aqui. O jsdom não implementa
    // `inert` nem respeita aria-hidden na ordem de tabulação — medido: o Tab sai da caixa
    // mesmo com o trap correto. Provar isso pede navegador com React montado, e o catálogo é
    // HTML estático sem JS. Fica como pendência para quando houver fixture interativo.
    // O que dá para exigir aqui é que a caixa TENHA onde prender o foco.
    test("a caixa tem focáveis próprios para prender o foco", async () => {
      const u = userEvent.setup();
      wrap(<DialogPalco tipo={tipo} />);
      await u.click(screen.getByRole("button", {name: "Abrir"}));
      const caixa = await screen.findByRole("dialog");
      expect(caixa.querySelectorAll("button").length,
        "sem focável dentro, não há o que prender").toBeGreaterThan(1);
    });

    test("axe não acha violação com o overlay ABERTO", async () => {
      const u = userEvent.setup();
      wrap(<DialogPalco tipo={tipo} />);
      await u.click(screen.getByRole("button", {name: "Abrir"}));
      await screen.findByRole("dialog");
      // document.body: o overlay vai para um portal, fora do container do render
      await semViolacao(document.body);
    });
  });
}

describe("popover — comportamento", () => {
  const palco = () => wrap(
    <Popover trigger={<Button>Abrir popover</Button>} title="Opções">
      <p>Conteúdo</p>
      <Button>Dentro</Button>
    </Popover>,
  );

  test("abre no clique e o foco entra", async () => {
    const u = userEvent.setup();
    palco();
    await u.click(screen.getByRole("button", {name: "Abrir popover"}));
    const caixa = await screen.findByRole("dialog");
    await waitFor(() => expect(caixa.contains(document.activeElement)).toBe(true));
  });

  test("Escape fecha e devolve o foco ao disparador", async () => {
    const u = userEvent.setup();
    palco();
    const disparador = screen.getByRole("button", {name: "Abrir popover"});
    await u.click(disparador);
    await screen.findByRole("dialog");
    await u.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(disparador));
  });

  test("axe não acha violação com o popover aberto", async () => {
    const u = userEvent.setup();
    palco();
    await u.click(screen.getByRole("button", {name: "Abrir popover"}));
    await screen.findByRole("dialog");
    await semViolacao(document.body);
  });
});

describe("tooltip — comportamento", () => {
  const palco = () => wrap(
    <Tooltip content="Explicação curta"><Button>Com dica</Button></Tooltip>,
  );

  // Tooltip NÃO prende foco e NÃO é modal: ela descreve o disparador. O que ela precisa é
  // aparecer no foco de teclado (não só no hover), sair no Escape, e existir para quem não vê.
  test("aparece ao focar por teclado, e o leitor de tela a alcança", async () => {
    const u = userEvent.setup();
    palco();
    await u.tab();
    const disparador = screen.getByRole("button", {name: /Com dica/});
    expect(disparador).toHaveFocus();
    const dica = await screen.findByRole("tooltip");
    expect(dica).toHaveTextContent("Explicação curta");
    // O que faz a dica EXISTIR para quem não vê: aria-describedby do disparador → id do
    // popup. Medido em 30/07/2026: não havia nem role nem id nem describedby — a dica era
    // decoração visual. Esta asserção é o contrato que faltava.
    expect(dica.id, "o popup da dica precisa de id").toBeTruthy();
    expect(disparador.getAttribute("aria-describedby"),
      "o disparador não descreve a dica").toBe(dica.id);
  });

  // O Sidebar já nomeia cada destino com `id`. O Base UI também registra o trigger por id; se o
  // wrapper deixar o id interno dele divergir do id que o filho põe no DOM, a dica abre e fecha
  // na mesma microtask porque o motor não encontra o trigger ativo.
  test("filho com id próprio continua registrado como o trigger da dica", async () => {
    const u = userEvent.setup();
    wrap(<Tooltip content="Inbox"><Button id="sidebar-inbox">Inbox</Button></Tooltip>);
    await u.tab();
    expect(screen.getByRole("button", {name: "Inbox"})).toHaveAttribute("id", "sidebar-inbox");
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Inbox");
  });

  test("Escape fecha sem tirar o foco do disparador", async () => {
    const u = userEvent.setup();
    palco();
    await u.tab();
    await screen.findByRole("tooltip");
    await u.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    expect(screen.getByRole("button", {name: /Com dica/})).toHaveFocus();
  });

  // `region` desligado AQUI, com motivo, e agora com uma saída — ver o teste seguinte.
  // É regra de best-practice sobre estrutura de PÁGINA ("todo conteúdo num landmark"), e por
  // DEFAULT o popup vive num portal no nível do body: é o que permite empilhar e posicionar
  // sem herdar `overflow` nem `transform` de ninguém. Medido em 30/07/2026: acusa mesmo com
  // <main> no fixture, então não é artefato de teste. Não é WCAG A/AA.
  test("axe não acha violação com a tooltip aberta (portal no body, o default)", async () => {
    const u = userEvent.setup();
    palco();
    await u.tab();
    await screen.findByRole("tooltip");
    await semViolacao(document.body, ["region"]);
  });

  // ── achado B7, fechado na Parte C do PLANO-1.0 (07/08/2026) ──────────────────────────────
  // A auditoria escreveu que "a única forma de satisfazer seria o consumidor montar o portal
  // dentro do landmark dele" — e esse era o defeito de verdade: ele NÃO TINHA essa forma. O
  // `container` do Base UI nunca foi exposto, então a única saída possível estava fechada.
  // Agora ela existe, entra pelo provider uma vez (`portalContainer`), e este teste roda o axe
  // com a regra `region` LIGADA. Se o container parar de ser repassado, ele reprova — que é o
  // que separa "expusemos uma prop" de "a prop faz alguma coisa".
  test("com portalContainer dentro do landmark, o axe passa com `region` LIGADA", async () => {
    const u = userEvent.setup();
    function Palco() {
      // callback ref via estado: no primeiro render o nó ainda não existe, e sem o re-render
      // o provider receberia `null` — ou seja, o default. O teste passaria sem provar nada.
      const [ancora, setAncora] = useState<HTMLElement | null>(null);
      return (
        <AureaProvider portalContainer={ancora}>
          <main>
            <Tooltip content="Explicação curta"><Button>Com dica</Button></Tooltip>
            <div ref={setAncora} />
          </main>
        </AureaProvider>
      );
    }
    render(<Palco />);
    await u.tab();
    const dica = await screen.findByRole("tooltip");
    expect(dica.closest("main"), "o popup tem de estar DENTRO do landmark").not.toBeNull();
    await semViolacao(document.body);   // sem desligar nada
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// M5 — ConfirmDialog. O que estes testes cobram NÃO é aparência: é que a decisão não possa ser
// tomada por acidente. Provados contra o defeito em 13/08/2026 — trocar o `AlertDialog` por
// `Dialog` no componente faz o primeiro reprovar, e tirar o `initialFocus` faz o terceiro.
function ConfirmPalco({destructive}: {destructive?: boolean} = {}) {
  const [open, setOpen] = useState(false);
  const [feito, setFeito] = useState("nada");
  return (
    <>
      <Button onClick={() => setOpen(true)}>Apagar</Button>
      <span data-resultado>{feito}</span>
      <ConfirmDialog
        open={open}
        title="Apagar este artigo?"
        description="Isto não pode ser desfeito."
        confirmLabel="Apagar"
        destructive={destructive}
        onConfirm={() => { setFeito("confirmou"); setOpen(false); }}
        onCancel={() => { setFeito("cancelou"); setOpen(false); }}
      />
    </>
  );
}

describe("ConfirmDialog — a decisão não se toma por acidente", () => {
  // O defeito que o componente existe para impedir. Num `Dialog` comum o clique no backdrop
  // fecha, e fechar sem escolher é o mesmo que ter cancelado sem querer — só que sem o usuário
  // saber que respondeu. O AlertDialog do Base UI não expõe `disablePointerDismissal` porque
  // não fecha por fora; este teste é o que garante que ninguém troque o motor de volta.
  test("clicar fora NÃO fecha e NÃO responde pelo usuário", async () => {
    const u = userEvent.setup();
    wrap(<ConfirmPalco />);
    await u.click(screen.getByRole("button", {name: "Apagar"}));
    const caixa = await screen.findByRole("alertdialog");
    const fundo = document.querySelector(".dialog-backdrop");
    expect(fundo, "o alerta desenha o mesmo backdrop do Dialog").not.toBeNull();
    await u.click(fundo as Element);
    expect(screen.queryByRole("alertdialog"), "continua aberto").not.toBeNull();
    expect(document.querySelector("[data-resultado]")).toHaveTextContent("nada");
    expect(caixa).toBeInTheDocument();
  });

  test("o papel é alertdialog, e a descrição é o que o leitor de tela anuncia", async () => {
    const u = userEvent.setup();
    wrap(<ConfirmPalco />);
    await u.click(screen.getByRole("button", {name: "Apagar"}));
    const caixa = await screen.findByRole("alertdialog", {name: "Apagar este artigo?"});
    const descrito = caixa.getAttribute("aria-describedby");
    expect(descrito, "sem aria-describedby a frase que diz o que se perde não é anunciada").toBeTruthy();
    expect(document.getElementById(descrito as string)).toHaveTextContent("Isto não pode ser desfeito.");
  });

  // Enter por reflexo tem de cancelar. Sem `initialFocus` no botão seguro, o motor deixa o foco
  // no primeiro focável e o reflexo APAGA.
  test("o foco abre no botão seguro, então Enter por reflexo cancela", async () => {
    const u = userEvent.setup();
    wrap(<ConfirmPalco destructive />);
    await u.click(screen.getByRole("button", {name: "Apagar"}));
    await screen.findByRole("alertdialog");
    await waitFor(() =>
      expect(document.activeElement, "o foco tem de nascer no Cancelar")
        .toBe(screen.getByRole("button", {name: "Cancel"})));
    await u.keyboard("{Enter}");
    await waitFor(() => expect(document.querySelector("[data-resultado]")).toHaveTextContent("cancelou"));
  });

  test("confirmar só acontece pelo botão de confirmar", async () => {
    const u = userEvent.setup();
    wrap(<ConfirmPalco destructive />);
    await u.click(screen.getByRole("button", {name: "Apagar"}));
    await screen.findByRole("alertdialog");
    const confirmar = screen.getByRole("button", {name: "Apagar", hidden: false});
    expect(confirmar.className, "destructive pinta o botão de ação, não o de fuga").toContain("btn-danger");
    await u.click(confirmar);
    await waitFor(() => expect(document.querySelector("[data-resultado]")).toHaveTextContent("confirmou"));
  });

  test("Escape cancela — a saída pelo teclado existe", async () => {
    const u = userEvent.setup();
    wrap(<ConfirmPalco />);
    await u.click(screen.getByRole("button", {name: "Apagar"}));
    await screen.findByRole("alertdialog");
    await u.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector("[data-resultado]")).toHaveTextContent("cancelou"));
  });

  test("sem violação de axe com o alerta aberto", async () => {
    const u = userEvent.setup();
    wrap(<ConfirmPalco destructive />);
    await u.click(screen.getByRole("button", {name: "Apagar"}));
    await screen.findByRole("alertdialog");
    await semViolacao(document.body);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// M4 — a explicação de POR QUE não dá tem de alcançar quem usa teclado. Não nasceu componente
// nenhum: portão de permissão é `{pode ? a : b}` no consumidor, e NENHUMA das cinco referências
// tem um (medido). O que faltava era isto, e é medível.
describe("M4 — ação indisponível com o motivo alcançável", () => {
  // O DEFEITO, medido em 13/08/2026: `disabled` tira o botão da ordem de foco. Quem navega por
  // teclado não chega nele, então a dica pendurada ali não é lida por ninguém. O embrulho de
  // <span> que o MUI documenta resolve o ponteiro e não resolve isto — o span nasce tabIndex -1.
  test("disabled: o foco NÃO chega, então a explicação não chega", async () => {
    const u = userEvent.setup();
    wrap(<><Button>Antes</Button>
      <Tooltip content="Você não tem permissão"><Button disabled>Publicar</Button></Tooltip></>);
    await u.tab();
    await u.tab();
    expect(document.activeElement, "o botão desabilitado fica fora da ordem de foco")
      .not.toBe(screen.getByRole("button", {name: "Publicar"}));
    expect(screen.queryByRole("tooltip"), "e sem foco não há dica").toBeNull();
  });

  test("aria-disabled: o foco chega, a dica abre e o clique não faz nada", async () => {
    const u = userEvent.setup();
    const clicou = vi.fn();
    wrap(<Tooltip content="Você não tem permissão">
      <Button aria-disabled onClick={clicou}>Publicar</Button>
    </Tooltip>);
    const botao = screen.getByRole("button", {name: "Publicar"});
    await u.tab();
    expect(document.activeElement, "inerte, mas alcançável").toBe(botao);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Você não tem permissão");
    expect(botao).toHaveAttribute("aria-disabled", "true");
    expect((botao as HTMLButtonElement).disabled, "não é `disabled`, senão o foco não chegaria")
      .toBe(false);
    await u.click(botao);
    expect(clicou, "inerte quer dizer que ativar não faz nada").not.toHaveBeenCalled();
  });
});

// AccessGate — o portão. Nasceu de PESQUISA (o padrão existe: `Can` do CASL, `useCanAccess` do
// react-admin, `AccessGate` dos guias de painel), não da pasta de referências, que não tem
// nenhum. O que se cobra aqui é a escolha entre sumir e aparecer inerte COM motivo.
describe("AccessGate — sumir ou aparecer inerte, com o motivo", () => {
  test("permitido: entrega o filho intacto, sem embrulho", () => {
    const clicou = vi.fn();
    wrap(<AccessGate allowed><Button onClick={clicou}>Publicar</Button></AccessGate>);
    const b = screen.getByRole("button", {name: "Publicar"});
    expect(b).not.toHaveAttribute("aria-disabled");
    b.click();
    expect(clicou).toHaveBeenCalled();
  });

  test("negado, modo esconder: o botão não existe no DOM", () => {
    wrap(<AccessGate allowed={false}><Button>Publicar</Button></AccessGate>);
    expect(screen.queryByRole("button", {name: "Publicar"})).toBeNull();
  });

  test("negado, modo esconder com fallback: mostra o que veio no lugar", () => {
    wrap(<AccessGate allowed={false} fallback={<span>Somente leitura</span>}>
      <Button>Publicar</Button></AccessGate>);
    expect(screen.queryByRole("button", {name: "Publicar"})).toBeNull();
    expect(screen.getByText("Somente leitura")).toBeInTheDocument();
  });

  // O que separa este componente de um `&&`: o modo desabilitar tem de deixar o motivo
  // ALCANÇÁVEL. Se o portão puser `disabled` em vez de `aria-disabled`, o foco não chega e a
  // explicação morre — é o defeito que o M4 mediu, e este teste é o que o pega.
  test("negado, modo desabilitar: inerte, focável, com o motivo lido pelo teclado", async () => {
    const u = userEvent.setup();
    const clicou = vi.fn();
    wrap(<AccessGate allowed={false} mode="disable" reason="Só quem edita pode publicar">
      <Button onClick={clicou}>Publicar</Button></AccessGate>);
    const b = screen.getByRole("button", {name: "Publicar"});
    expect(b, "a ação continua visível — some o poder, não a informação").toBeInTheDocument();
    expect(b).toHaveAttribute("aria-disabled", "true");
    expect((b as HTMLButtonElement).disabled, "não pode ser `disabled`, senão o foco não chega")
      .toBe(false);
    await u.tab();
    expect(document.activeElement).toBe(b);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Só quem edita pode publicar");
    await u.click(b);
    expect(clicou, "e a ação não acontece").not.toHaveBeenCalled();
  });
});
