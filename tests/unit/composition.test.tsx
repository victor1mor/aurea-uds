// Teste da COMPOSIÇÃO — Parte I do PLANO-1.0.
//
// O que os testes de componente NÃO pegam: a peça montada. Cada componente daqui já é
// testado sozinho em `components.test.tsx`; o que se cobra aqui é o contrato da composição
// — as regiões que o `aurea.contract.json` declara e as invariantes que ele promete.
//
// A composição testada é a MESMA que o catálogo publica: o teste importa o módulo de
// conteúdo do bloco. Escrever a montagem outra vez aqui criaria a segunda fonte da verdade,
// e o teste passaria enquanto a página mostrasse outra coisa.
import {describe, test, expect} from "vitest";
import {fireEvent, render, screen, within} from "@testing-library/react";
// Sem AureaProvider de propósito: o bloco importa o `dist`, e o provider do `src` não
// alcançaria aquele contexto. Fora do provider os componentes usam os defaults em inglês,
// que é o que o catálogo publica (pure.tsx §i18n).
// @ts-expect-error — conteúdo do catálogo é .mjs sem tipos, e é de propósito: é código de
// consumidor, escrito como o consumidor escreve.
import {runSession, runActions, reviewCompare, reviewActions,
  resourceWorkbench, workbenchActions,
  analyticsWorkbench, analyticsActions, analyticsSeries,
  transactionFlow, transactionActions, transactionAmounts,
  deviceControl, deviceActions,
  mediaLibrary, mediaActions,
  visualBuilder, builderActions} from "../../apps/catalog/content/blocks/insight.mjs";
// Do `dist`, e não do `src`: é o MESMO módulo que o bloco importa, então a tabela de frases é a
// mesma instância. Comparar contra o `src` compararia duas cópias e passaria mesmo se o bloco
// tivesse escrito o texto à mão.
// @ts-expect-error — o `dist` do catálogo é consumido como o consumidor consome.
import {Status as StatusDoPacote} from "../../packages/react/dist/index.js";
import {createElement} from "react";
import contract from "../../packages/contracts/aurea.contract.json" with {type: "json"};

const RUN = contract.operationalPatterns.patterns.RunSession;
const REVIEW = contract.operationalPatterns.patterns.ReviewCompare;
const WORK = contract.operationalPatterns.patterns.ResourceWorkbench;
const ANALYTICS = contract.applicationPatterns.patterns.AnalyticsWorkbench;
const TX = contract.applicationPatterns.patterns.TransactionFlow;
const DEV = contract.applicationPatterns.patterns.DeviceControl;
const MEDIA = contract.applicationPatterns.patterns.MediaLibrary;
const BUILDER = contract.applicationPatterns.patterns.VisualBuilder;

describe("I1 · RunSession", () => {
  // Como cada região do contrato aparece no DOM. Três viram `role=group` nomeado; as outras
  // três já eram marco nomeado por conta própria — `turn_stream` é o `role=log` do
  // `MessageList`, `tool_panel` é a `<section>` do `InvocationPanel` e `actions` é o
  // `role=toolbar`. Nenhuma ganhou `<h3>`: título de nível fixo dentro de uma peça vira salto
  // de hierarquia na página que a hospeda, que é o defeito que o H.e pagou para aprender.
  const REGIAO = {session_header: "Run", checkpoint: "Checkpoint", receipt: "Receipt"};

  test("as seis regiões do contrato existem no DOM", () => {
    render(runSession("running"));
    // Esta igualdade é ARAME DE TROPEÇO, não cópia: se o contrato ganhar uma sétima região,
    // ela reprova e obriga alguém a decidir se a composição passa a mostrá-la. Sem ela, a
    // região nova entraria no contrato e a composição seguiria verde sem cobri-la.
    expect(RUN.regions).toEqual(["session_header", "turn_stream", "tool_panel", "checkpoint", "receipt", "actions"]);
    for (const [regiao, nome] of Object.entries(REGIAO))
      expect(screen.getByRole("group", {name: nome}), `região ${regiao}`).toBeInTheDocument();
    expect(screen.getByRole("log", {name: "Turns"})).toBeInTheDocument();     // turn_stream
    expect(screen.getByRole("region", {name: "write_file"})).toBeInTheDocument(); // tool_panel
    expect(screen.getByRole("toolbar", {name: "Run actions"})).toBeInTheDocument(); // actions
  });

  // "state is text and color" — contract.accessibility. Cor sozinha reprova (WCAG 1.4.1), e
  // é o defeito mais fácil de introduzir aqui: basta alguém trocar o rótulo por um ponto.
  test.each(RUN.states as string[])("%s: o estado sai em TEXTO", state => {
    const {container} = render(runSession(state));
    const rotulo = container.querySelector(".status-label");
    expect(rotulo?.textContent?.trim().length, `o estado ${state} não tem texto`).toBeGreaterThan(0);
  });

  // "interrupt does not erase receipt" e "cancel emits terminal receipt" — as duas valem
  // por CONSTRUÇÃO: o recibo existe desde o aceite. É por isso que se cobra nos nove.
  test.each(RUN.states as string[])("%s: o recibo continua lá", state => {
    render(runSession(state));
    const recibo = screen.getByRole("group", {name: "Receipt"});
    expect(within(recibo).getByText("run_8f21")).toBeInTheDocument();
  });

  test.each(["completed", "failed", "cancelled", "interrupted"])("%s: o recibo diz o desfecho", state => {
    render(runSession(state));
    expect(within(screen.getByRole("group", {name: "Receipt"})).getByText("Outcome")).toBeInTheDocument();
  });

  // A barra oferece EXATAMENTE o que a tabela de transições permite. Este é o teste que
  // reprova quem trocar a derivação por uma lista escrita à mão: basta a lista discordar
  // do contrato num estado.
  test.each(RUN.states as string[])("%s: a barra oferece só o que a transição permite", state => {
    const permitido = RUN.transitions
      .filter((t: {from: string; action: string}) => t.from === state && RUN.actions.includes(t.action) && !["approve", "reject"].includes(t.action))
      .map((t: {action: string}) => t.action);
    expect(runActions(state)).toEqual(permitido);
    render(runSession(state));
    const barra = screen.queryByRole("toolbar", {name: "Run actions"});
    if (!permitido.length) { expect(barra).toBeNull(); return; }
    const botoes = within(barra!).getAllByRole("button");
    expect(botoes).toHaveLength(permitido.length);
    // "actions have accessible names" — contract.accessibility. Sem isto, uma ação nova no
    // contrato entraria como botão SEM NOME e o resto do teste continuaria verde.
    for (const b of botoes) expect(b.textContent?.trim().length).toBeGreaterThan(0);
  });

  // "approval is explicit" — o portão aparece só no estado que o exige, e traz as duas
  // saídas. Aprovar não pode ser efeito colateral de continuar.
  test("a aprovação aparece só em waiting_approval, e com as duas saídas", () => {
    const {unmount} = render(runSession("waiting_approval"));
    const portao = screen.getByRole("region", {name: "Write to the repository"});
    expect(within(portao).getByRole("button", {name: "Approve"})).toBeInTheDocument();
    expect(within(portao).getByRole("button", {name: "Deny"})).toBeInTheDocument();
    unmount();
    for (const state of RUN.states.filter((s: string) => s !== "waiting_approval")) {
      const {unmount: u} = render(runSession(state));
      expect(screen.queryByRole("button", {name: "Approve"}), `${state} não pede aprovação`).toBeNull();
      u();
    }
  });
});

describe("I2 · ReviewCompare", () => {
  // Como cada região do contrato aparece no DOM. As cinco são `role=group` nomeado, e
  // nenhuma ganhou `<h3>` pelo mesmo motivo do I1: título de nível fixo dentro de uma peça
  // vira salto de hierarquia na página que a hospeda.
  const REGIAO = {source: "Change", comparison: "Comparison", decision: "Decision",
    test_result: "Test result", receipt: "Receipt"};

  // `applied` é o ÚNICO dos nove estados em que as cinco coexistem: o apply já escreveu o
  // recibo e o rollback ainda parte daqui. Em qualquer outro faltaria pelo menos uma.
  test("as cinco regiões do contrato existem no DOM", () => {
    render(reviewCompare("applied"));
    // Arame de tropeço, como no I1: região nova no contrato reprova aqui e obriga alguém a
    // decidir se a composição passa a mostrá-la, em vez de seguir verde sem cobri-la.
    expect(REVIEW.regions).toEqual(["source", "comparison", "decision", "test_result", "receipt"]);
    for (const [regiao, nome] of Object.entries(REGIAO))
      expect(screen.getByRole("group", {name: nome}), `região ${regiao}`).toBeInTheDocument();
  });

  test.each(REVIEW.states as string[])("%s: o estado sai em TEXTO", state => {
    const {container} = render(reviewCompare(state));
    const rotulo = container.querySelector(".status-label");
    expect(rotulo?.textContent?.trim().length, `o estado ${state} não tem texto`).toBeGreaterThan(0);
  });

  // "diff has textual additions and deletions" — contract.accessibility. É a cláusula em que
  // as duas referências reprovam (Langfuse pinta a linha, Kibo deixa o Shiki consumir o
  // marcador), então é a que mais precisa de gate: sem ele, a primeira pessoa que trocar o
  // `+`/`-` por uma classe de cor passa.
  test("adições e remoções são TEXTO, e o resumo é contado do próprio diff", () => {
    const {container} = render(reviewCompare("applied"));
    const linhas = (container.querySelector(".code-block")?.textContent ?? "").split("\n");
    const mais = linhas.filter(l => l.startsWith("+"));
    const menos = linhas.filter(l => l.startsWith("-"));
    expect(mais.length, "nenhuma adição marcada em texto").toBeGreaterThan(0);
    expect(menos.length, "nenhuma remoção marcada em texto").toBeGreaterThan(0);
    // Linha "nua" é linha que só a cor distinguiria: ou é contexto (espaço), ou é + ou -.
    for (const l of linhas) expect(["", " ", "+", "-"], `linha sem marcador: ${l}`).toContain(l.slice(0, 1));
    // Os números vêm do DOM, não do módulo: um resumo escrito à mão que discorde do diff
    // reprova aqui, que é o achado I1 desta auditoria em escala de duas linhas.
    expect(screen.getByText(`${mais.length} added · ${menos.length} removed`)).toBeInTheDocument();
  });

  // A decisão oferece EXATAMENTE o que a tabela de transições permite. Diferente do I1, nada
  // é excluído: o `ReviewCompare` não tem região `actions`, então `decision` é onde toda ação
  // de pessoa mora.
  test.each(REVIEW.states as string[])("%s: a decisão oferece só o que a transição permite", state => {
    const permitido = REVIEW.transitions
      .filter((t: {from: string; action: string}) => t.from === state && REVIEW.actions.includes(t.action))
      .map((t: {action: string}) => t.action);
    expect(reviewActions(state)).toEqual(permitido);
    render(reviewCompare(state));
    const barra = screen.queryByRole("toolbar", {name: "Review decision"});
    if (!permitido.length) { expect(barra).toBeNull(); return; }
    const botoes = within(barra!).getAllByRole("button");
    expect(botoes).toHaveLength(permitido.length);
    for (const b of botoes) expect(b.textContent?.trim().length).toBeGreaterThan(0);
  });

  // "preview before mutation" + "apply records receipt": o recibo NASCE do apply. Antes dele
  // não houve mutação, e recibo de coisa que não aconteceu é registro falso — que é pior que
  // registro ausente, porque parece prova.
  test.each(REVIEW.states as string[])("%s: o recibo existe se e só se houve mutação", state => {
    render(reviewCompare(state));
    const recibo = screen.queryByRole("group", {name: "Receipt"});
    if (["applied", "rolled_back"].includes(state)) expect(recibo, `${state} mutou e não tem recibo`).toBeInTheDocument();
    else expect(recibo, `${state} não mutou e tem recibo`).toBeNull();
  });

  // "rollback targets the receipt" — a reversão APONTA para o recibo, não o apaga.
  test("rolled_back: o recibo continua lá, e a reversão aponta para ele", () => {
    render(reviewCompare("rolled_back"));
    const recibo = screen.getByRole("group", {name: "Receipt"});
    // O registro do `apply` sobrevive à reversão, E a reversão o cita pelo id. As duas
    // asserções são a cláusula inteira: apagar a primeira quebra "apply records receipt",
    // apagar a segunda quebra "rollback targets the receipt".
    expect(within(recibo).getByText(/^chg_4b7a · applied/)).toBeInTheDocument();
    expect(within(recibo).getByText(/restores chg_4b7a/)).toBeInTheDocument();
  });

  // "test result is announced" — quem anuncia é o papel, não a cor. `danger` vira `alert`
  // sozinho no `Alert`, que é o que separa "3 de 24 falharam" de "24 passaram".
  test.each([["testing", "status"], ["applied", "status"], ["failed", "alert"]])(
    "%s: o resultado dos testes é anunciado com role=%s", (state, papel) => {
      render(reviewCompare(state));
      const regiao = screen.getByRole("group", {name: "Test result"});
      expect(within(regiao).getByRole(papel)).toBeInTheDocument();
    });

  test.each(["idle", "previewing", "changed", "rejected"])("%s: não há resultado de teste ainda", state => {
    render(reviewCompare(state));
    expect(screen.queryByRole("group", {name: "Test result"})).toBeNull();
  });
});

describe("I3 · ResourceWorkbench", () => {
  // Duas das seis NÃO são `role=group`: `source` é o `role=tree` do `TreeView` e `collection` é
  // o `role=table` do `Table`. Marco dentro de marco só acrescenta um nível para atravessar —
  // mesma escolha que o I1 fez com o `role=log` do `MessageList`.
  const REGIAO = {preview: "Preview", transfer_queue: "Transfer queue", provenance: "Provenance"};
  const COM_FILA = ["transferring", "paused", "verifying", "conflict", "completed", "failed"];

  test("as seis regiões do contrato existem no DOM", () => {
    render(resourceWorkbench("transferring"));
    expect(WORK.regions).toEqual(["source", "collection", "preview", "transfer_queue", "provenance", "actions"]);
    for (const [regiao, nome] of Object.entries(REGIAO))
      expect(screen.getByRole("group", {name: nome}), `região ${regiao}`).toBeInTheDocument();
    expect(screen.getByRole("tree", {name: "Workspace"})).toBeInTheDocument();        // source
    expect(screen.getByRole("table", {name: "Resources"})).toBeInTheDocument();       // collection
    expect(screen.getByRole("toolbar", {name: "Workbench actions"})).toBeInTheDocument(); // actions
  });

  test.each(WORK.states as string[])("%s: o estado sai em TEXTO", state => {
    const {container} = render(resourceWorkbench(state));
    const rotulo = container.querySelector(".status-label");
    expect(rotulo?.textContent?.trim().length, `o estado ${state} não tem texto`).toBeGreaterThan(0);
  });

  test.each(WORK.states as string[])("%s: as ações saem só da tabela de transições", state => {
    const permitido = WORK.transitions
      .filter((t: {from: string; action: string}) => t.from === state && WORK.actions.includes(t.action))
      .map((t: {action: string}) => t.action);
    expect(workbenchActions(state)).toEqual(permitido);
    render(resourceWorkbench(state));
    const barra = screen.queryByRole("toolbar", {name: "Workbench actions"});
    if (!permitido.length) { expect(barra).toBeNull(); return; }
    const botoes = within(barra!).getAllByRole("button");
    expect(botoes).toHaveLength(permitido.length);
    for (const b of botoes) expect(b.textContent?.trim().length).toBeGreaterThan(0);
  });

  // "progress announces percent and phase" — contract.accessibility. A barra sozinha é DESENHO:
  // quem lê por leitor de tela precisa da frase. E o número tem de ser UM — se o texto e o
  // `aria-valuenow` puderem divergir, a tela passa a contar duas histórias sobre o mesmo envio.
  test.each(COM_FILA)("%s: a fila anuncia fase e porcentagem, e o número é um só", state => {
    render(resourceWorkbench(state));
    const fila = screen.getByRole("group", {name: "Transfer queue"});
    const pct = within(fila).getByRole("progressbar").getAttribute("aria-valuenow");
    const frase = within(fila).getByText(/ · \d+%$/).textContent ?? "";
    const [fase, numero] = frase.split(" · ");
    expect(fase.trim().length, "a fila não diz a FASE em texto").toBeGreaterThan(0);
    expect(numero.replace("%", ""), "o texto e a barra discordam do progresso").toBe(pct);
  });

  test.each(["idle", "discovering"])("%s: sem nada em voo, a fila diz isso em palavra", state => {
    render(resourceWorkbench(state));
    const fila = screen.getByRole("group", {name: "Transfer queue"});
    expect(within(fila).queryByRole("progressbar")).toBeNull();
    expect(within(fila).getByText(/nothing in flight/i)).toBeInTheDocument();
  });

  // "conflict requires preview" — o conflito se explica NA PRÉVIA, ao lado do que chegou, e não
  // como um recado solto: quem escolhe precisa ver o que está prestes a sobrescrever.
  test("conflict: a prévia explica o conflito, e a saída é alcançável por teclado", () => {
    const {unmount} = render(resourceWorkbench("conflict"));
    const previa = screen.getByRole("group", {name: "Preview"});
    expect(within(previa).getByText(/Name already taken/)).toBeInTheDocument();
    // "conflict actions are keyboard reachable": `<button>` de verdade, não um div clicável.
    const resolver = within(screen.getByRole("toolbar", {name: "Workbench actions"})).getByRole("button", {name: "Resolve"});
    expect(resolver.tagName).toBe("BUTTON");
    unmount();
    for (const state of WORK.states.filter((s: string) => s !== "conflict")) {
      const {unmount: u} = render(resourceWorkbench(state));
      expect(screen.queryByText(/Name already taken/), `${state} não tem conflito`).toBeNull();
      u();
    }
  });

  // "restore keeps provenance" — a procedência não depende de estado nenhum. O `restore` está em
  // `actions` SEM transição (terceiro órfão da série, depois do `fork` do I1), então o que dá
  // para cobrar é o que a cláusula garante: a procedência sobrevive a tudo, inclusive ao fim.
  test.each(WORK.states as string[])("%s: a procedência continua lá", state => {
    render(resourceWorkbench(state));
    const proc = screen.getByRole("group", {name: "Provenance"});
    expect(within(proc).getByText(/^sha256 /)).toBeInTheDocument();
    expect(within(proc).getByText(/Shared workspace/)).toBeInTheDocument();
  });

  // "resume validates checksum" — a soma é o que o `resume` confere, então ela precisa estar na
  // tela ANTES de alguém retomar. Cobrar isso é cobrar que os dois coexistam em `paused`.
  test("paused: a soma de verificação está visível no mesmo momento em que Resume é oferecido", () => {
    render(resourceWorkbench("paused"));
    expect(workbenchActions("paused")).toContain("resume");
    expect(within(screen.getByRole("toolbar", {name: "Workbench actions"})).getByRole("button", {name: "Resume"})).toBeInTheDocument();
    expect(within(screen.getByRole("group", {name: "Provenance"})).getByText(/^sha256 /)).toBeInTheDocument();
  });
});

describe("I4 · AnalyticsWorkbench", () => {
  // OITO regiões, e duas delas já são marco nomeado por conta própria: `visualization` é o
  // `role=group` do próprio `Chart` (ele se nomeia com `label`) e `data_table` é o
  // `role=region` do `DataGrid`. As outras seis são `role=group` nomeado.
  const REGIAO = {kpis: ["group", "Indicators"], time_range: ["group", "Time range"],
    filters: ["group", "Filters"], segments: ["group", "Segments"],
    visualization: ["group", "Runs per day"], data_table: ["region", "Runs per day, as numbers"],
    annotations: ["group", "Annotations"], export: ["group", "Export"]};

  test("as oito regiões do contrato existem no DOM", () => {
    render(analyticsWorkbench("ready"));
    expect(ANALYTICS.regions).toEqual(["kpis", "time_range", "filters", "segments",
      "visualization", "data_table", "annotations", "export"]);
    for (const [regiao, [papel, nome]] of Object.entries(REGIAO))
      expect(screen.getByRole(papel, {name: nome}), `região ${regiao}`).toBeInTheDocument();
  });

  test.each(ANALYTICS.states as string[])("%s: o estado sai em TEXTO", state => {
    const {container} = render(analyticsWorkbench(state));
    const rotulo = container.querySelector(".status-label");
    expect(rotulo?.textContent?.trim().length, `o estado ${state} não tem texto`).toBeGreaterThan(0);
  });

  // SETE das oito ações não têm transição, e isso NÃO é buraco de contrato: mudar o período
  // não muda o estado da tela, refaz a consulta. Sobra `refresh`. O teste cobra a derivação do
  // mesmo jeito — o que muda é que a resposta certa é quase sempre "nenhuma".
  test.each(ANALYTICS.states as string[])("%s: só as ações que a transição permite", state => {
    const permitido = ANALYTICS.transitions
      .filter((t: {from: string; action: string}) => t.from === state && ANALYTICS.actions.includes(t.action))
      .map((t: {action: string}) => t.action);
    expect(analyticsActions(state)).toEqual(permitido);
    render(analyticsWorkbench(state));
    const faixa = screen.getByRole("group", {name: "Time range"});
    const refresh = within(faixa).queryByRole("button", {name: "Refresh"});
    if (permitido.includes("refresh")) expect(refresh).toBeInTheDocument();
    else expect(refresh, `${state} não permite refresh`).toBeNull();
  });

  // "visualization always has a tabular alternative" — e alternativa quer dizer O MESMO DADO.
  // Uma tabela com 2 das 7 linhas é resumo: quem não enxerga a curva ficaria com menos, que é o
  // defeito inteiro. Por isso a contagem é contra os pontos da série, não contra um número fixo.
  test("a alternativa tabular tem a série inteira, e a série é uma COLUNA", () => {
    render(analyticsWorkbench("ready"));
    const tabela = screen.getByRole("region", {name: "Runs per day, as numbers"});
    expect(within(tabela).getByRole("columnheader", {name: new RegExp(analyticsSeries.nome, "i")})).toBeInTheDocument();
    // +1 do cabeçalho. Cortar linha para caber na caixa reprova aqui — quem limita a altura é
    // `--datagrid-max-h`, e a caixa rola; o DADO não encolhe.
    expect(within(tabela).getAllByRole("row")).toHaveLength(analyticsSeries.pontos.length + 1);
  });

  // "updates are announced without stealing focus" — duas metades, e as duas se cobram. Anunciar
  // é PAPEL (`role=status`, ou `alert` quando é falha); não roubar foco é o foco continuar onde
  // estava. Um `autoFocus` no recado passaria na primeira metade e quebraria a segunda.
  test.each(["loading", "empty", "refreshing", "partial", "stale", "error"])("%s: anuncia sem roubar o foco", state => {
    render(analyticsWorkbench(state));
    const papel = state === "error" ? "alert" : "status";
    const recado = screen.getAllByRole(papel);
    expect(recado.length, `${state} não anuncia`).toBeGreaterThan(0);
    expect(recado.some(r => (r.textContent ?? "").trim().length > 0), "anúncio vazio").toBe(true);
    expect(document.activeElement, "algo roubou o foco").toBe(document.body);
  });

  test("ready: nada é anunciado — não há novidade para contar", () => {
    render(analyticsWorkbench("ready"));
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  // A prova de que o reúso da Parte J é REAL e não citação: a frase dos dois estados universais
  // tem de ser byte a byte a que o `Status` publica sozinho. Se alguém escrever o texto à mão no
  // bloco, isto reprova — e escrever à mão é o que faz a mesma condição aparecer com dois nomes
  // em duas telas, que é o defeito que a ADR-0018 existe para fechar.
  test.each(["partial", "stale"])("%s: a frase vem do vocabulário, não do bloco", state => {
    const {container, unmount} = render(analyticsWorkbench(state));
    const doBloco = container.querySelector(".status-label")?.textContent;
    unmount();
    const {container: sozinho} = render(createElement(StatusDoPacote, {state}));
    expect(doBloco).toBe(sozinho.querySelector(".status-label")?.textContent);
    expect(doBloco?.trim().length).toBeGreaterThan(0);
  });

  // "export records scope and freshness" — os dois no RÓTULO do botão, porque quem clica precisa
  // saber o que vai sair ANTES de sair. Recibo depois chega tarde.
  test("o botão de exportar diz o escopo E a atualidade", () => {
    render(analyticsWorkbench("ready"));
    const botao = within(screen.getByRole("group", {name: "Export"})).getByRole("button");
    const texto = botao.textContent ?? "";
    expect(texto, "o rótulo não diz o escopo").toMatch(/\d+\s*d\b|\d+ days/i);
    expect(texto, "o rótulo não diz a atualidade").toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("I5 · TransactionFlow", () => {
  // Como cada região do contrato aparece no DOM. As sete são `role=group` nomeado; nenhuma
  // ganhou `<h3>`, pelo mesmo motivo dos quatro anteriores.
  const REGIAO = {items: "Items", amounts: "Amounts", payment: "Payment", review: "Review",
    status: "Status", receipt: "Receipt", reversal: "Reversal"};
  // NENHUM estado tem as sete, e é medição e não desculpa: `review` é o que se lê ANTES do
  // commit, `receipt` e `reversal` só existem DEPOIS dele. As duas metades não coexistem porque
  // a transação ou ainda não aconteceu ou já aconteceu. `settled` é o máximo — seis — e é o
  // estado que a página publica. A sétima é cobrada no estado em que ela existe.
  const SEIS = ["items", "amounts", "payment", "status", "receipt", "reversal"];
  // LIMITE DE FERRAMENTA, medido em 11/08/2026: `Intl.NumberFormat` com `currencyDisplay:"code"`
  // separa o código do número por espaço NÃO-QUEBRÁVEL (U+00A0), e está certo — "USD" e "199.74"
  // não devem cair em linhas diferentes. O `getByText` normaliza o texto DO DOM e não o esperado,
  // então o matcher precisa trocar o NBSP por espaço. Comparar contra um literal escrito à mão
  // resolveria o erro e desfaria o teste: o número tem de vir da mesma função que a tela usa.
  const semNbsp = (s: string) => s.replace(/ /g, " ");

  test("as sete regiões do contrato existem, e a divisão é medida", () => {
    // Arame de tropeço, como nos quatro anteriores: região nova no contrato reprova aqui e
    // obriga alguém a decidir se a composição passa a mostrá-la.
    expect(TX.regions).toEqual(["items", "amounts", "payment", "review", "status", "receipt", "reversal"]);
    const {unmount} = render(transactionFlow("settled"));
    for (const chave of SEIS)
      expect(screen.getByRole("group", {name: REGIAO[chave as keyof typeof REGIAO]}), `região ${chave}`).toBeInTheDocument();
    expect(screen.queryByRole("group", {name: "Review"}), "settled não revisa: já aconteceu").toBeNull();
    unmount();
    // A sétima, no estado em que ela existe — e ali as outras duas não existem.
    render(transactionFlow("requires_action"));
    expect(screen.getByRole("group", {name: "Review"})).toBeInTheDocument();
    expect(screen.queryByRole("group", {name: "Receipt"})).toBeNull();
    expect(screen.queryByRole("group", {name: "Reversal"})).toBeNull();
  });

  // "totals and errors are textual" — contract.accessibility. Cor sozinha reprova (WCAG 1.4.1).
  test.each(TX.states as string[])("%s: o estado sai em TEXTO", state => {
    const {container} = render(transactionFlow(state));
    const rotulo = container.querySelector(".status-label");
    expect(rotulo?.textContent?.trim().length, `o estado ${state} não tem texto`).toBeGreaterThan(0);
  });

  // O TOTAL É SOMADO. Este é o teste que reprova quem escrever o número ao lado dos números que
  // ele soma — que é o que a referência madura faz: o `checkout` do MUI tem `$144.97` literal em
  // dois arquivos, mais os quatro preços que deveriam somar nele. Aqui a conta é em INTEIRO
  // (não existe decimal nativo em JavaScript) e o DOM é comparado contra ela.
  test.each(TX.states as string[])("%s: o total é a soma dos itens mais as taxas", state => {
    const somaItens = transactionAmounts.items.reduce((t: number, i: {cents: number}) => t + i.cents, 0);
    const somaTaxas = transactionAmounts.fees.reduce((t: number, f: {cents: number}) => t + f.cents, 0);
    expect(transactionAmounts.subtotal).toBe(somaItens);
    // E cada linha é quantidade × unitário — a conta que o rótulo mostra tem de ser a que o valor
    // diz. Anatomia do `order-summary` do tool-ui (`lineTotal = unitPrice * quantity`), e é o que
    // impede "2 seats" ao lado de um número que ninguém sabe se é o assento ou os dois.
    for (const i of transactionAmounts.items as Array<{qty: number; unit: number; cents: number}>)
      expect(i.cents, 'linha que não é quantidade × unitário').toBe(i.qty * i.unit);
    expect(transactionAmounts.total).toBe(somaItens + somaTaxas);
    render(transactionFlow(state));
    const amounts = screen.getByRole("group", {name: "Amounts"});
    expect(within(amounts).getByText(semNbsp(transactionAmounts.format(transactionAmounts.total)))).toBeInTheDocument();
    expect(within(amounts).getByText(semNbsp(transactionAmounts.format(transactionAmounts.subtotal)))).toBeInTheDocument();
  });

  // "amount currency fees and consequences appear before commit". As quatro coisas, e a moeda
  // por CÓDIGO: "$" é ambíguo entre quatro moedas, e a cláusula pede a moeda, não o símbolo.
  test.each(["draft", "pending", "processing", "requires_action"])("%s: valor, moeda, taxa e consequência antes do commit", state => {
    render(transactionFlow(state));
    const amounts = screen.getByRole("group", {name: "Amounts"});
    expect(within(amounts).getAllByText(new RegExp(transactionAmounts.currency)).length,
      "a moeda não aparece").toBeGreaterThan(0);
    for (const f of transactionAmounts.fees)
      expect(within(amounts).getByText(f.label), "a taxa não aparece").toBeInTheDocument();
    // A consequência tem de trazer o MESMO total formatado — frase sem número, ou com um número
    // escrito à mão, reprova aqui.
    const revisao = screen.getByRole("group", {name: "Review"});
    expect(revisao.textContent, "a consequência não diz o total").toContain(transactionAmounts.format(transactionAmounts.total));
  });

  // "immutable receipt follows every terminal result" — os quatro terminais do contrato, mais o
  // `disputed`, que parte de `settled` e herda o recibo dele.
  test.each([...(TX.terminalStates as string[]), "disputed"])("%s: o recibo existe e traz a chave de idempotência", state => {
    render(transactionFlow(state));
    const recibo = screen.getByRole("group", {name: "Receipt"});
    // "idempotent submission prevents duplicates": sem a chave no recibo, um duplo clique não
    // tem resposta. É a única linha que responde "fui cobrado duas vezes?".
    expect(within(recibo).getByText(/idempotency key/i)).toBeInTheDocument();
    expect(within(recibo).getByText(/^idem_/)).toBeInTheDocument();
  });

  test.each(["draft", "pending", "processing", "requires_action"])("%s: NÃO há recibo — nada aconteceu ainda", state => {
    render(transactionFlow(state));
    expect(screen.queryByRole("group", {name: "Receipt"}), "recibo de coisa que não aconteceu").toBeNull();
  });

  // "reversal and dispute preserve the original transaction" — o estorno APONTA para o recibo
  // original em vez de apagá-lo, mesmo desenho que o `rollback` do I2.
  test.each(["refunded", "disputed"])("%s: a reversão aponta para o recibo original, que continua lá", state => {
    render(transactionFlow(state));
    expect(within(screen.getByRole("group", {name: "Receipt"})).getByText(/rcp_5d81/)).toBeInTheDocument();
    expect(within(screen.getByRole("group", {name: "Reversal"})).getByText(/rcp_5d81/),
      "a reversão não aponta para o recibo").toBeInTheDocument();
  });

  // A derivação, e o arame que impede uma ação de desaparecer da tela: este contrato não tem
  // região `actions`, então cada ação mora na região que ela afeta — `refund` em `reversal`,
  // `cancel`/`authorize` em `review`. A soma dos botões das DUAS barras tem de ser a derivação
  // inteira. Ação nova no contrato que não caiba em nenhuma das duas reprova aqui.
  test.each(TX.states as string[])("%s: as ações são as da transição, e todas têm casa", state => {
    const permitido = TX.transitions
      .filter((t: {from: string; action: string}) => t.from === state && TX.actions.includes(t.action))
      .map((t: {action: string}) => t.action);
    expect(transactionActions(state)).toEqual(permitido);
    render(transactionFlow(state));
    const barras = screen.queryAllByRole("toolbar");
    const botoes = barras.flatMap(b => within(b).getAllByRole("button"));
    expect(botoes, `${state} perdeu ou inventou ação`).toHaveLength(permitido.length);
    // "actions have accessible names": ação nova entraria como botão SEM NOME e o resto do
    // teste continuaria verde.
    for (const b of botoes) expect(b.textContent?.trim().length).toBeGreaterThan(0);
    // E o estorno mora na região da reversão, nunca na da revisão: um "Refund" ao lado de
    // "will be charged" oferece a saída errada no momento errado.
    if (permitido.includes("refund"))
      expect(within(screen.getByRole("group", {name: "Reversal"})).getByRole("button", {name: "Refund"})).toBeInTheDocument();
  });

  // "status updates use live regions" — e o `Status` NÃO é uma: é um `<span class=status>`.
  // Quem anuncia é o `Alert` (`role=status`, e `role=alert` quando é falha). Trocar o Alert por
  // um `<div>` com a pele reprova aqui, como reprovou no I4.
  test.each((TX.states as string[]).filter(s => s !== TX.initialState))("%s: a atualização é anunciada por PAPEL", state => {
    render(transactionFlow(state));
    const papel = state === "failed" ? "alert" : "status";
    const anuncio = screen.getAllByRole(papel);
    expect(anuncio.length, `${state} não anuncia`).toBeGreaterThan(0);
    expect(anuncio.some(a => (a.textContent ?? "").trim().length > 0), "anúncio vazio").toBe(true);
    expect(document.activeElement, "algo roubou o foco").toBe(document.body);
  });

  test("draft: nada é anunciado — é o estado inicial, nada aconteceu", () => {
    expect(TX.initialState).toBe("draft");
    render(transactionFlow("draft"));
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  // A prova de que o reúso da Parte J é real: `requires_action` É o `waiting_user` universal, e
  // a frase tem de ser byte a byte a que o `Status` publica sozinho. Texto à mão aqui reprova.
  test("requires_action: a frase vem do vocabulário, não do bloco", () => {
    const {container, unmount} = render(transactionFlow("requires_action"));
    const doBloco = container.querySelector(".status-label")?.textContent;
    unmount();
    const {container: sozinho} = render(createElement(StatusDoPacote, {state: "waiting_user"}));
    expect(doBloco).toBe(sozinho.querySelector(".status-label")?.textContent);
    expect(doBloco?.trim().length).toBeGreaterThan(0);
  });

  // A composição NÃO pede segredo financeiro. Não é preferência de desenho: sob o PCI DSS 4.0.1
  // o campo de cartão é do provedor (iframe ou redirecionamento), e a referência que tinha a
  // anatomia — o template `checkout` do MUI — pede número, CVV, validade e nome no próprio
  // formulário. Este teste reprova quem trouxer isso para dentro.
  test.each(TX.states as string[])("%s: nenhum campo de dado financeiro na composição", state => {
    const {container} = render(transactionFlow(state));
    expect(container.querySelectorAll("input, textarea, select"),
      "a Aurea não coleta dado de cartão: o campo é do provedor").toHaveLength(0);
    const texto = container.textContent ?? "";
    expect(texto, "número de cartão na tela").not.toMatch(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/);
    expect(texto, "CVV na tela").not.toMatch(/\bcvv\b|\bcvc\b/i);
  });
});

describe("I6 · DeviceControl", () => {
  // Seis `role=group` nomeado; `fleet` é o `role=list` do próprio `HealthMatrix`, nomeado pelo
  // `label` — mesma escolha do `TreeView` no I3 e do `Chart` no I4.
  const REGIAO = {device_detail: "Device", telemetry: "Telemetry", commands: "Commands",
    calibration: "Calibration", alerts: "Alerts", audit: "Audit"};

  test("as sete regiões do contrato existem no DOM", () => {
    // Arame de tropeço, como nos cinco anteriores.
    expect(DEV.regions).toEqual(["fleet", "device_detail", "telemetry", "commands", "calibration", "alerts", "audit"]);
    render(deviceControl("alert"));
    for (const [regiao, nome] of Object.entries(REGIAO))
      expect(screen.getByRole("group", {name: nome}), `região ${regiao}`).toBeInTheDocument();
    expect(screen.getByRole("list", {name: "Fleet"})).toBeInTheDocument(); // fleet
  });

  // Este contrato NÃO tem estado terminal, e o teste registra isso: um dispositivo não termina.
  test("o contrato não tem estado terminal — e é por isso que não há recibo aqui", () => {
    expect(DEV.terminalStates).toEqual([]);
    expect(DEV.initialState).toBe("unknown");
  });

  // "status is text and color" — cor sozinha reprova (WCAG 1.4.1).
  test.each(DEV.states as string[])("%s: o estado sai em TEXTO", state => {
    const {container} = render(deviceControl(state));
    const rotulo = container.querySelector(".status-label");
    expect(rotulo?.textContent?.trim().length, `o estado ${state} não tem texto`).toBeGreaterThan(0);
  });

  // "telemetry timestamp and confidence are visible" — as DUAS coisas, em toda leitura, em todos
  // os estados. Uma leitura sem hora é um número sem validade; sem qualidade, é um número sem
  // aviso de que pode estar velho.
  test.each(DEV.states as string[])("%s: toda leitura diz a hora E a qualidade", state => {
    render(deviceControl(state));
    const tele = screen.getByRole("group", {name: "Telemetry"});
    const valores = [...tele.querySelectorAll("dd")];
    expect(valores.length, "nenhuma leitura na telemetria").toBeGreaterThan(0);
    for (const v of valores) {
      expect(v.textContent, "leitura sem hora").toMatch(/\d{1,2}:\d{2}(:\d{2})?/);
      // O vocabulário é o do domínio (OPC UA), não um inventado aqui: Good · Uncertain · Bad.
      expect(v.textContent, "leitura sem qualidade do dado").toMatch(/\b(Good|Uncertain|Bad)\b/);
    }
  });

  // Parado ou fora do ar, o valor é o ÚLTIMO utilizável — então a qualidade NÃO pode dizer `Good`.
  // É a distinção que o padrão faz (`UncertainLastUsableValue`) e é a que evita o operador agir
  // sobre um número congelado achando que é de agora.
  test.each(["offline", "updating"])("%s: a leitura congelada não se apresenta como Good", state => {
    render(deviceControl(state));
    const tele = screen.getByRole("group", {name: "Telemetry"});
    for (const v of tele.querySelectorAll("dd")) {
      expect(v.textContent, "número congelado anunciado como bom").not.toMatch(/\bGood\b/);
      expect(v.textContent).toMatch(/\bUncertain\b/);
    }
  });

  // "live telemetry can be paused" — e o controle diz em que sentido está. Botão que só diz
  // "Pause" não conta a quem chegou agora que o fluxo já está parado.
  test.each(DEV.states as string[])("%s: o fluxo ao vivo tem controle, e ele diz o sentido", state => {
    render(deviceControl(state));
    const tele = screen.getByRole("group", {name: "Telemetry"});
    const botao = within(tele).getByRole("button");
    const parado = ["offline", "updating"].includes(state);
    expect(botao.textContent, `${state}: o controle não diz o sentido`)
      .toMatch(parado ? /resume live/i : /pause live/i);
  });

  // "critical alerts do not rely on sound" — em tela, o equivalente é papel que ANUNCIA mais
  // texto que carrega o número. `Alert` `danger` é `role="alert"` sozinho.
  test.each(["alert", "error"])("%s: o alerta crítico anuncia por papel, com o número no texto", state => {
    render(deviceControl(state));
    const alerta = screen.getByRole("alert");
    expect(alerta.textContent, "alerta sem o limite").toMatch(/threshold/i);
    expect(alerta.textContent, "alerta sem a leitura que o disparou").toMatch(/\d/);
  });

  test("degraded: o aviso é warning e NÃO interrompe o leitor de tela", () => {
    render(deviceControl("degraded"));
    expect(screen.queryByRole("alert"), "aviso não crítico não deve usar role=alert").toBeNull();
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
  });

  // "commands show target scope and expected effect" — os dois em TEXTO, e antes do botão. Um
  // comando cujo alcance só se descobre depois de clicar não tem escopo, tem susto.
  test.each(DEV.states as string[])("%s: o comando diz o escopo e o efeito antes de qualquer botão", state => {
    const {container} = render(deviceControl(state));
    const cmd = screen.getByRole("group", {name: "Commands"});
    expect(cmd.textContent, "sem escopo").toMatch(/scope:/i);
    expect(cmd.textContent, "sem efeito esperado").toMatch(/effect:/i);
    const botao = within(cmd).queryAllByRole("button")[0];
    if (botao) {
      const texto = cmd.textContent ?? "";
      expect(texto.indexOf("Scope:"), "o botão vem antes do escopo no DOM")
        .toBeLessThan(texto.indexOf(botao.textContent ?? ""));
    }
    expect(container.querySelectorAll("[role=group][aria-label=Commands]")).toHaveLength(1);
  });

  // "calibration retains defaults and rollback" — o default fica escrito ao lado do valor atual,
  // e a volta é um botão que existe SEMPRE, inclusive quando o equipamento não responde.
  test.each(DEV.states as string[])("%s: a calibração mostra o default e mantém a volta", state => {
    render(deviceControl(state));
    const cal = screen.getByRole("group", {name: "Calibration"});
    // O VALOR do default, não a palavra: a primeira versão deste teste cobrava `/default/i` e
    // passava com o hint apagado, porque o botão se chama "Revert to default". Trava que o próprio
    // rótulo do botão satisfaz não é trava — foi a prova contra o defeito que a pegou.
    expect(cal.textContent, "o valor do default não está escrito").toMatch(/default\s*[+-]?\d/i);
    expect(within(cal).getByRole("button", {name: /revert to default/i})).toBeInTheDocument();
  });

  // "controls expose current value and unit" — o controle tem nome acessível E a unidade nele.
  // Um slider chamado "offset" não diz se 0.4 é grau, bar ou por cento.
  test.each(["online", "degraded", "calibrating", "alert"])("%s: o controle diz o valor e a unidade", state => {
    render(deviceControl(state));
    const cal = screen.getByRole("group", {name: "Calibration"});
    const slider = within(cal).getByRole("slider");
    expect(slider.getAttribute("aria-label"), "controle sem unidade no nome").toMatch(/celsius|°c/i);
    expect(cal.textContent, "o valor atual não aparece").toMatch(/now\s*[+-]?\d/i);
  });

  // A derivação, e o arame que impede uma ação de desaparecer: cada ação mora na região que ela
  // afeta (`acknowledge` em `alerts`, `update` em `commands`, `calibrate` em `calibration`), então
  // a soma dos botões das barras tem de ser a derivação inteira.
  test.each(DEV.states as string[])("%s: as ações são as da transição, e todas têm casa", state => {
    const permitido = DEV.transitions
      .filter((t: {from: string; action: string}) => t.from === state && DEV.actions.includes(t.action))
      .map((t: {action: string}) => t.action);
    expect(deviceActions(state)).toEqual(permitido);
    render(deviceControl(state));
    const botoes = screen.queryAllByRole("toolbar").flatMap(b => within(b).getAllByRole("button"));
    expect(botoes, `${state} perdeu ou inventou ação`).toHaveLength(permitido.length);
    for (const b of botoes) expect(b.textContent?.trim().length).toBeGreaterThan(0);
    if (permitido.includes("acknowledge"))
      expect(within(screen.getByRole("group", {name: "Alerts"})).getByRole("button", {name: /acknowledge/i})).toBeInTheDocument();
    if (permitido.includes("calibrate"))
      expect(within(screen.getByRole("group", {name: "Calibration"})).getByRole("button", {name: /calibrate/i})).toBeInTheDocument();
  });

  // "unsafe actions require gated confirmation" — o portão aparece onde o comando inseguro EXISTE,
  // e traz escopo e volta, não um sim/não. Mesmo desenho do I1.
  test("online: a atualização de firmware passa por portão, com escopo e rollback", () => {
    const {unmount} = render(deviceControl("online"));
    const portao = screen.getByRole("region", {name: /update firmware/i});
    expect(within(portao).getByText(/scope/i), "portão sem escopo").toBeInTheDocument();
    expect(within(portao).getByText(/rollback/i), "portão sem volta").toBeInTheDocument();
    expect(within(portao).getByText(/high risk/i), "portão sem o risco declarado").toBeInTheDocument();
    unmount();
    for (const state of (DEV.states as string[]).filter(s => s !== "online")) {
      const {unmount: u} = render(deviceControl(state));
      expect(screen.queryByRole("region", {name: /update firmware/i}),
        `${state} não oferece atualização, então não abre portão`).toBeNull();
      u();
    }
  });

  // A frota diz o estado de cada dispositivo em texto — e o selecionado se identifica sem cor.
  test("a frota nomeia o selecionado e dá estado em texto a todos", () => {
    render(deviceControl("alert"));
    const frota = screen.getByRole("list", {name: "Fleet"});
    const celulas = within(frota).getAllByRole("listitem");
    expect(celulas).toHaveLength(3);
    for (const c of celulas)
      expect(c.querySelector(".status-label")?.textContent?.trim().length, "célula sem estado em texto").toBeGreaterThan(0);
    expect(within(frota).getByText(/selected/i), "não se sabe qual está selecionado").toBeInTheDocument();
  });
});

describe("I7 · MediaLibrary", () => {
  // Sete `role=group` nomeado; `player` é o `role=group` do próprio `MediaPlayer`, nomeado pelo
  // `title` — mesma escolha do `HealthMatrix` no I6 e do `Chart` no I4.
  const REGIAO = {library: "Library", item_detail: "Item detail", queue: "Queue",
    tracks: "Tracks", chapters: "Chapters", history: "History", actions: "Actions"};

  test("as oito regiões do contrato existem no DOM", () => {
    expect(MEDIA.regions).toEqual(["library", "item_detail", "player", "queue", "tracks", "chapters", "history", "actions"]);
    render(mediaLibrary("ready"));
    for (const [regiao, nome] of Object.entries(REGIAO))
      expect(screen.getByRole("group", {name: nome}), `região ${regiao}`).toBeInTheDocument();
    expect(screen.getByRole("group", {name: "Episode 14"}), "região player").toBeInTheDocument();
  });

  test.each(MEDIA.states as string[])("%s: o estado sai em TEXTO", state => {
    const {container} = render(mediaLibrary(state));
    const rotulo = container.querySelector(".status-label");
    expect(rotulo?.textContent?.trim().length, `o estado ${state} não tem texto`).toBeGreaterThan(0);
  });

  // "library queue playback and item detail share ONE selection" — este é o teste central do item.
  // Três strings escritas à mão que combinam hoje é o achado I1 desta auditoria a uma renomeação de
  // distância; aqui o mesmo valor tem de aparecer nos três lugares.
  test.each((MEDIA.states as string[]).filter(s => s !== "empty"))("%s: a seleção é UMA, e os três lugares concordam", state => {
    render(mediaLibrary(state));
    const galeria = screen.getByRole("group", {name: "Library"});
    const marcado = within(galeria).getByRole("button", {current: true});
    const titulo = marcado.querySelector("strong")?.textContent?.trim();
    expect(titulo?.length, "nada marcado na galeria").toBeGreaterThan(0);
    // o player se nomeia pelo item selecionado…
    expect(screen.getByRole("group", {name: titulo!}), "o player não é o item selecionado").toBeInTheDocument();
    // …e o detalhe fala do mesmo item: o meta do crachá marcado aparece inteiro no detalhe.
    const meta = marcado.querySelector(".hint")?.textContent?.replace(/ · selected$/, "").trim();
    expect(meta?.length, "crachá marcado sem meta").toBeGreaterThan(0);
    expect(within(screen.getByRole("group", {name: "Item detail"})).getByText(meta!),
      "o detalhe não é do item marcado na galeria").toBeInTheDocument();
  });

  // "gallery selection works by keyboard" — e a medição que decidiu isto está no bloco: o
  // `.card-interactive` do core tem `cursor:pointer` e `:hover` e NADA de foco, porque um `<div>`
  // nunca recebe Tab. Este teste reprova o dia em que alguém trocar o `<button>` pelo `Card`.
  test("todo item da galeria é alcançável por teclado, e o marcado se diz em texto", () => {
    render(mediaLibrary("ready"));
    const galeria = screen.getByRole("group", {name: "Library"});
    const tiles = within(galeria).getAllByRole("button");
    expect(tiles.length).toBe(3);
    for (const t of tiles) {
      expect(t.tagName, "tile que não é botão não recebe foco").toBe("BUTTON");
      expect(t.getAttribute("type"), "botão sem type dentro de form envia o form").toBe("button");
    }
    expect(within(galeria).getAllByRole("button", {current: true}), "nenhum ou vários marcados").toHaveLength(1);
    expect(within(galeria).getByText(/selected/i), "a marca não está em texto").toBeInTheDocument();
  });

  // "all transport controls have names and state" — o transporte é do PLAYER, e o teste cobra que
  // ele existe com nome. A segunda metade é a que impede o defeito do I1: nenhuma outra região
  // repete play/pause, porque o mesmo botão em dois lugares são duas verdades sobre quem controla.
  test("o transporte tem nome, e ele existe em UM lugar só", () => {
    render(mediaLibrary("ready"));
    const player = screen.getByRole("group", {name: "Episode 14"});
    const transporte = within(player).getAllByRole("button").map(b => b.getAttribute("aria-label") ?? b.textContent ?? "");
    expect(transporte.some(n => /play|pause/i.test(n)), "o player não tem controle de play/pause").toBe(true);
    // fora do player, nenhum botão de transporte
    for (const nome of Object.values(REGIAO)) {
      const regiao = screen.getByRole("group", {name: nome});
      for (const b of within(regiao).queryAllByRole("button")) {
        const rotulo = (b.getAttribute("aria-label") ?? b.textContent ?? "").trim();
        expect(/^(play|pause|stop)$/i.test(rotulo), `${nome} duplica o transporte: "${rotulo}"`).toBe(false);
      }
    }
  });

  // "bulk organize never interrupts playback" — nenhuma ação de organizar a fila é de transporte.
  test("as ações da fila organizam e não tocam na reprodução", () => {
    render(mediaLibrary("ready"));
    const fila = screen.getByRole("group", {name: "Queue"});
    const botoes = within(fila).getAllByRole("button");
    expect(botoes.length).toBeGreaterThan(0);
    for (const b of botoes)
      expect(b.textContent ?? "", "ação de fila que interrompe a reprodução").not.toMatch(/play|pause|stop/i);
  });

  // "chapters tracks captions quality and devices are OPTIONAL capabilities" — o que existe se
  // declara. Região vazia faz o consumidor procurar o que não está lá.
  test("as capacidades opcionais dizem o que existe", () => {
    render(mediaLibrary("ready"));
    const cap = screen.getByRole("group", {name: "Chapters"});
    expect(within(cap).getAllByText(/\d+:\d+/).length, "capítulos sem tempo").toBeGreaterThan(0);
    const faixas = screen.getByRole("group", {name: "Tracks"});
    expect(faixas.textContent, "faixas de áudio não declaradas").toMatch(/audio/i);
    // "captions transcript and audio description are discoverable"
    expect(faixas.textContent, "legenda não declarada").toMatch(/captions/i);
    expect(faixas.textContent, "transcrição não declarada").toMatch(/transcript/i);
  });

  // "resume position and history are EXPLICIT" — o número em `item_detail`, o quando em `history`.
  // "continue de onde parou" não é posição, é promessa.
  test("a retomada é um número, e o histórico diz quando", () => {
    render(mediaLibrary("ready"));
    // O VALOR, não o rótulo: a primeira versão cobrava `/resume at/i` e passava com o valor
    // trocado por "where you left off", que é exatamente a promessa que a cláusula recusa. Segunda
    // vez nesta sessão que cobrei a palavra em vez do número (a outra foi o `default` no I6) — a
    // prova contra o defeito pegou as duas.
    const detalhe = screen.getByRole("group", {name: "Item detail"});
    const rotulo = [...detalhe.querySelectorAll("dt")].find(d => /resume at/i.test(d.textContent ?? ""));
    expect(rotulo, "o detalhe não diz onde parou").toBeTruthy();
    expect(rotulo!.nextElementSibling?.textContent?.trim(), "a retomada não é uma posição, é uma promessa")
      .toMatch(/^\d+:\d+$/);
    const hist = screen.getByRole("group", {name: "History"});
    expect(hist.textContent, "histórico sem a posição").toMatch(/\d+:\d+/);
    expect(hist.textContent, "histórico sem quando").toMatch(/ago|yesterday|\d{1,2}:\d{2}/i);
    // "autoplay never surprises" — dito em texto, não subentendido.
    expect(hist.textContent, "não se diz o que o autoplay faz").toMatch(/autoplay/i);
  });

  test.each(MEDIA.states as string[])("%s: as ações são as da transição", state => {
    const permitido = MEDIA.transitions
      .filter((t: {from: string; action: string}) => t.from === state && MEDIA.actions.includes(t.action))
      .map((t: {action: string}) => t.action);
    expect(mediaActions(state)).toEqual(permitido);
  });

  // `offline` aqui É o universal — e no I6, com o mesmo nome, NÃO era: lá o dispositivo caiu, aqui
  // a nossa conexão caiu. A frase tem de ser a que o `Status` publica sozinho.
  test("offline: a frase vem do vocabulário, e no I6 o mesmo nome não é universal", () => {
    const {container, unmount} = render(mediaLibrary("offline"));
    const doBloco = container.querySelector(".status-label")?.textContent;
    unmount();
    const {container: sozinho} = render(createElement(StatusDoPacote, {state: "offline"}));
    expect(doBloco).toBe(sozinho.querySelector(".status-label")?.textContent);
    // o mesmo nome no I6 traz rótulo próprio, porque o dono é outro
    const {container: dev} = render(deviceControl("offline"));
    expect(dev.querySelector(".status-label")?.textContent).not.toBe(doBloco);
  });

  test("empty: o player cede lugar ao vazio, e a galeria não finge ter item", () => {
    render(mediaLibrary("empty"));
    expect(screen.getByRole("group", {name: "Player"})).toBeInTheDocument();
    expect(screen.queryByRole("group", {name: "Episode 14"}), "player montado sem nada para tocar").toBeNull();
  });
});

describe("I8 · VisualBuilder", () => {
  const REGIAO = {palette: "Palette", outline: "Outline", inspector: "Inspector",
    variables: "Variables", run_history: "Run history", actions: "Actions"};

  test("as sete regiões do contrato existem no DOM", () => {
    expect(BUILDER.regions).toEqual(["palette", "canvas", "outline", "inspector", "variables", "run_history", "actions"]);
    render(visualBuilder("idle"));
    for (const [regiao, nome] of Object.entries(REGIAO))
      expect(screen.getByRole("group", {name: nome}), `região ${regiao}`).toBeInTheDocument();
    expect(screen.getByRole("group", {name: "Canvas"}), "região canvas").toBeInTheDocument();
  });

  // O alerta de validação NÃO é região — e é por isso que a página publica `idle`: `invalid` mostra
  // as mesmas sete mais 56px de alerta, e com ele a composição rolava.
  test("o alerta de validação não é uma região do contrato", () => {
    expect(BUILDER.regions).not.toContain("alerts");
  });

  test.each(BUILDER.states as string[])("%s: o estado sai em TEXTO", state => {
    const {container} = render(visualBuilder(state));
    const rotulo = container.querySelector(".status-label");
    expect(rotulo?.textContent?.trim().length, `o estado ${state} não tem texto`).toBeGreaterThan(0);
  });

  // "canvas has an EQUIVALENT ordered outline" — e equivalente quer dizer os mesmos nós, na mesma
  // ordem. Duas listas escritas à mão que combinam hoje discordam na primeira edição: este teste
  // reprova quem escrever o outline separado do canvas.
  test.each(BUILDER.states as string[])("%s: o outline tem os mesmos nós do canvas, na ordem", state => {
    const {container} = render(visualBuilder(state));
    const doCanvas = [...container.querySelectorAll(".graph-node-label")].map(n => n.textContent?.trim());
    const doOutline = [...screen.getByRole("group", {name: "Outline"}).querySelectorAll("li > span")]
      .map(n => n.textContent?.trim());
    expect(doCanvas.length, "o canvas não desenhou nó nenhum").toBeGreaterThan(0);
    expect(doOutline, "o outline não é equivalente ao canvas").toEqual(doCanvas);
  });

  // "connect and move actions have NON-DRAG alternatives" — as três, e todas alcançáveis por
  // teclado: acrescentar na paleta, mover no outline, conectar no inspector.
  test("acrescentar, mover e conectar existem SEM arrastar", async () => {
    render(visualBuilder("idle"));
    // add
    const paleta = screen.getByRole("group", {name: "Palette"});
    expect(within(paleta).getAllByRole("button").length, "paleta sem botão: quem não arrasta não constrói")
      .toBeGreaterThan(0);
    // move — e a cobrança é a REGRA, não "existe algum botão": todo nó menos o primeiro sobe, todo
    // nó menos o último desce. A primeira versão deste teste contava botões e passava com metade
    // das setas apagadas; quem pegou foi a prova contra o defeito. Terceira vez nesta sessão que
    // uma trava minha cobrava presença em vez da regra (as outras: `default` no I6, `Resume at` no
    // I7) — o padrão do erro é sempre esse, e agora está registrado.
    const outline = screen.getByRole("group", {name: "Outline"});
    const nomes = [...outline.querySelectorAll("li > span")].map(s => s.textContent!.trim());
    expect(nomes.length, "outline vazio").toBeGreaterThan(1);
    nomes.forEach((nome, i) => {
      if (i > 0) expect(within(outline).getByRole("button", {name: `Move ${nome} up`}),
        `${nome} não pode subir sem arrastar`).toBeInTheDocument();
      if (i < nomes.length - 1) expect(within(outline).getByRole("button", {name: `Move ${nome} down`}),
        `${nome} não pode descer sem arrastar`).toBeInTheDocument();
    });
    // e o primeiro não sobe, o último não desce — botão que não faz nada é pior que ausência
    expect(within(outline).queryByRole("button", {name: `Move ${nomes[0]} up`}),
      "o primeiro nó não tem para onde subir").toBeNull();
    expect(within(outline).queryByRole("button", {name: `Move ${nomes[nomes.length - 1]} down`}),
      "o último nó não tem para onde descer").toBeNull();
    // connect
    const inspetor = screen.getByRole("group", {name: "Inspector"});
    const conectar = within(inspetor).getByRole("combobox");
    expect(conectar.getAttribute("aria-label"), "conectar sem nome acessível").toMatch(/connect/i);
    // Desde 24/09/2026 o `Select` abre uma lista da Aurea, que só existe aberta — o <select> nativo
    // deixava as <option> no DOM o tempo todo. Abrir é o que a pessoa faz para ver os destinos.
    fireEvent.click(conectar);
    expect((await screen.findAllByRole("option")).length, "conectar sem destino").toBeGreaterThan(0);
  });

  // "nodes and ports have accessible names" — nó sem nome é um retângulo para quem usa leitor.
  test("todo nó do canvas tem nome", () => {
    const {container} = render(visualBuilder("idle"));
    const nos = [...container.querySelectorAll(".graph-node-label")];
    expect(nos.length).toBe(3);
    for (const n of nos) expect(n.textContent?.trim().length).toBeGreaterThan(0);
  });

  // "credentials are REFERENCED never exposed" — a mesma regra que o I5 aplicou ao cartão. Máscara
  // não conta: valor mascarado continua no DOM. O que aparece é a referência e onde ela mora.
  test.each(BUILDER.states as string[])("%s: segredo aparece como referência, nunca como valor", state => {
    render(visualBuilder(state));
    const vars = screen.getByRole("group", {name: "Variables"});
    const rotulos = [...vars.querySelectorAll("dt")];
    const segredo = rotulos.find(d => /secret|password|token|key/i.test(d.textContent ?? ""));
    expect(segredo, "nenhuma variável sensível no exemplo — o caso não estaria coberto").toBeTruthy();
    const valor = segredo!.nextElementSibling?.textContent ?? "";
    expect(valor, "o segredo não se declara como referência").toMatch(/ref|vault|secret/i);
    // Nem valor, nem máscara: máscara é valor com fita adesiva, e continua no DOM. A varredura é
    // nos VALORES das variáveis, não no `textContent` do container — este último concatena a página
    // inteira sem espaço e casa qualquer padrão longo por acidente. Primeira versão deste teste
    // reprovou por isso, e o defeito era do teste.
    for (const dd of vars.querySelectorAll("dd")) {
      const v = dd.textContent ?? "";
      expect(v, "valor mascarado continua sendo valor no DOM").not.toMatch(/[•*]{3,}/);
      expect(v, "algo com cara de segredo em claro no valor").not.toMatch(/^[A-Za-z0-9+/]{24,}={0,2}$/);
    }
  });

  // "validation errors link to NODES" — a mensagem nomeia um nó, e o nó nomeado EXISTE. Erro que
  // aponta para um nó que não está na tela manda a pessoa procurar o que não há.
  test("invalid: o erro nomeia um nó que existe no canvas e no outline", () => {
    const {container} = render(visualBuilder("invalid"));
    const erro = screen.getByRole("alert");
    const nos = [...container.querySelectorAll(".graph-node-label")].map(n => n.textContent!.trim());
    const citado = nos.filter(n => (erro.textContent ?? "").includes(n));
    expect(citado.length, `o erro não nomeia nenhum nó existente (nós: ${nos.join(", ")})`).toBeGreaterThan(0);
    const outline = screen.getByRole("group", {name: "Outline"});
    expect(within(outline).getByText(citado[0]), "o nó citado não está no outline").toBeInTheDocument();
  });

  test.each((BUILDER.states as string[]).filter(s => s !== "invalid"))("%s: sem alerta, porque não há problema", state => {
    render(visualBuilder(state));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  // "undo redo and versioning cover STRUCTURAL edits" — os dois existem sempre, ao lado do que a
  // tabela permite. E a derivação é o resto da barra: nem a mais, nem a menos.
  test.each(BUILDER.states as string[])("%s: undo e redo sempre, e o resto é a transição", state => {
    const permitido = BUILDER.transitions
      .filter((t: {from: string; action: string}) => t.from === state && BUILDER.actions.includes(t.action))
      .map((t: {action: string}) => t.action);
    expect(builderActions(state)).toEqual(permitido);
    render(visualBuilder(state));
    const barra = screen.getByRole("toolbar", {name: "Builder actions"});
    const botoes = within(barra).getAllByRole("button").map(b => b.textContent?.trim());
    expect(botoes, "desfazer sumiu").toContain("Undo");
    expect(botoes, "refazer sumiu").toContain("Redo");
    expect(botoes.length, `${state} perdeu ou inventou ação`).toBe(permitido.length + 2);
  });
});
