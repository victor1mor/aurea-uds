import {test, expect} from "@playwright/test";
import {readFileSync} from "node:fs";

// G-A11Y-04, segunda metade — o teclado que o MOTOR entrega.
//
// A primeira metade cobriu os três componentes que SÃO elemento nativo, e achou que as fichas
// declaravam menos do que o navegador entrega. A matriz do §13 deixou oito capacidades cujo
// teclado a `radix` declara mais rico que a ficha da Aurea — e essas vêm do motor, não do
// elemento. A pergunta é a mesma e a régua tem de ser a mesma: **medir**, e nunca copiar o
// teclado de uma referência para a nossa ficha porque ela declara mais.
//
// O banco é `apps/keyboard-probe`, uma aplicação de verdade: o catálogo é
// `renderToStaticMarkup` e efeito não roda lá, mas teclado de motor É efeito — roving tabindex,
// captura de tecla, foco gerido. Medir no catálogo mediria HTML parado.
//
// COMO ele decide que uma tecla "faz alguma coisa": ele não sabe o que cada componente deveria
// fazer, e não deve saber. Ele fotografa o estado observável ANTES e DEPOIS — quem está focado,
// os `aria-*` e os `data-*` de tudo dentro do banco, e o valor dos campos — e compara. Isso pega
// foco que anda, painel que abre, seleção que muda e item que fica ativo, sem uma lista do que
// esperar por componente. Uma lista dessas seria eu escrevendo a resposta antes da medição.
//
// O que ele NÃO decide: se a diferença é DEFEITO. `Accordion` da Aurea é `<details>/<summary>`
// nativo — a `radix` navega entre cabeçalhos com seta porque implementa roving focus, e o
// `<details>` não faz isso. Isso é diferença de CAPACIDADE, para o `03-GAPS.md`, não erro de
// ficha. O teste cobra uma coisa só, que é a do gap: **a ficha não pode declarar menos do que
// o componente entrega**, e não pode declarar tecla que não faz nada.

const APP = "/apps/keyboard-probe/out/index.html";
const ficha = (n: string) =>
  JSON.parse(readFileSync(`packages/contracts/registry/${n}.json`, "utf8"));

// Toda tecla plausível, não só as declaradas: uma que a ficha esqueceu não estaria na lista.
const CANDIDATAS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
  "Home", "End", "PageUp", "PageDown", "Enter", " ", "Escape"];
const NOME = (k: string) => k === " " ? "Space" : k;

// Onde começar em cada banco, e o que a ficha se chama. `Escape` só é cobrada onde há algo a
// fechar; num banco sem sobreposição ela legitimamente não faz nada e não é falta.
//
// `de` é o índice do elemento em que a medição COMEÇA, e ele não é zero por acaso: partindo do
// primeiro item, `Home` não tem para onde ir e `Space` num rádio já marcado não muda nada — as
// duas sairiam como "tecla inerte". Medido: era o que produzia as reprovações do `Tabs` e do
// `Radio`. Começar do meio dá espaço para a tecla agir nos dois sentidos.
//
// `deTambem` é uma SEGUNDA posição de partida, medida no mesmo teste, e a união das duas é o
// resultado. Ele existe porque uma posição só não alcança tudo em componente com BORDA: numa
// grade, começar no canto deixa `ArrowLeft` e `Home` sem para onde ir; começar no meio da coluna
// zero deixa as mesmas duas paradas. Nenhuma das duas é inércia do componente — é inércia da
// posição, e a diferença importa porque o relatório de "declarada sem efeito" é o que informa a
// `keyboardNote` da ficha. Com duas partidas, o DataGrid mede 9 das 13 declaradas em vez de 7.
//
// `prepara` põe o banco num estado REALISTA antes de medir, e ele também não é zelo: o OTPField
// vazio prende o foco na primeira caixa por construção — é onde você tem de digitar —, e ali
// nenhuma seta anda. Com dois dígitos digitados, `ArrowLeft`/`ArrowRight`/`Backspace` andam
// perfeitamente. Medido em 22/08/2026, e foi a terceira cegueira do probe, não do componente:
// medir um campo pristino é medir um estado em que quase nada pode acontecer.
const BANCOS: Array<{probe: string; foco: string; de?: number; deTambem?: number; fecha?: boolean; abreComContexto?: boolean;
  preparaTeclas?: string[]; efeitoForaDoDOM?: string; digitaTexto?: boolean;
  esperaMs?: number; prepara?: string}> = [
  {probe: "Accordion",    foco: "summary",              de: 1},
  {probe: "Checkbox",     foco: "input[type=checkbox]", de: 1},
  {probe: "Radio",        foco: "input[type=radio]",    de: 1},
  {probe: "Tabs",         foco: '[role="tab"]',         de: 1},
  {probe: "DropdownMenu", foco: "button", fecha: true},
  // Desde 24/09/2026 o Select é o do Base UI com a pele da casa: o foco é o gatilho (<button>),
  // e a lista abre como a do DropdownMenu. Antes era o <select> nativo e morava no teclado-nativo.
  {probe: "Select",       foco: "button", fecha: true},
  {probe: "OTPField",     foco: "input",                de: 0, prepara: "12"},
  // Entrou em 27/08/2026 ao ler a célula `data-grid·teclado`: era o único cujo `a11y.keyboard`
  // não tinha `keyboardNote`, ou seja, quatro setas declaradas SEM medição no navegador atrás. A
  // medição achou as quatro INERTES, e o `G-A11Y-07` implementou a grade da APG em 28/08.
  //
  // O ALVO MUDOU JUNTO, e a história dele é a de duas cegueiras seguidas. Primeiro foi
  // `tbody tr`, que não é focalizável: o `.focus()` não movia nada, a medição seguia com o foco
  // no `<body>` e TODAS as teclas saíam inertes — foi assim que este banco "provou" o que
  // acabou sendo verdade, mas pela razão errada. A asserção de foco existe por causa disso.
  // Depois foi `.table-wrap`, que tinha `tabIndex={0}` só para a rolagem ser alcançável — foco
  // de CONTÊINER, que não navega nada. Hoje o alvo é a célula, que é onde a grade da APG põe o
  // foco, e o `.table-wrap` nem tem mais `tabIndex`: a grade inteira é UMA parada de Tab.
  //
  // `de: 3` é a primeira célula do CORPO (a do checkbox de seleção), e a escolha é medida: da
  // linha de cabeçalho, `ArrowUp` e `PageUp` não têm para onde ir e sairiam como "tecla inerte"
  // — o mesmo motivo pelo qual os outros bancos não começam do zero. Do corpo, as duas andam.
  //
  // `:is(th,td)` E NÃO `th,td`: o gate monta `${raiz} ${foco}`, e a vírgula de uma lista de
  // seletores QUEBRA o escopo — `[data-probe="X"] th, td` quer dizer "os th deste banco, e
  // TODOS os td da página". A terceira medição deste banco morreu exatamente aí, e a asserção de
  // foco pegou: o `.focus()` pousou fora da seção. `:is()` mantém a lista dentro do descendente.
  {probe: "DataGrid",     foco: ":is(th,td)",          de: 3, deTambem: 4},
  // Segunda leva, 27/08/2026 — as fichas que declaravam teclado sem medição e que o banco
  // alcança sem infraestrutura nova. Ver o check 30 do validate.py.
  {probe: "Switch",       foco: "input[type=checkbox]"},
  {probe: "Toggle",       foco: "button"},
  {probe: "ToggleGroup",  foco: "button",              de: 1},
  {probe: "Toolbar",      foco: "button",              de: 1},
  {probe: "Button",       foco: "button"},
  {probe: "MediaEmbed",   foco: "button"},
  {probe: "SegmentedControl", foco: "button",          de: 1},
  {probe: "Collapsible",  foco: "button"},
  {probe: "NumberField",  foco: "input", digitaTexto: true},
  {probe: "SearchField",  foco: "input", digitaTexto: true},
  {probe: "PasswordField", foco: "input", digitaTexto: true},
  {probe: "Combobox",     foco: "input", digitaTexto: true},
  {probe: "Stepper",      foco: "button",              de: 1},
  // As sete de 27/08: declaravam `a11y.keyboard` SEM `keyboardNote`, isto é, sem navegador
  // atrás. O `DataGrid` provou que a suspeita não era excessiva.
  // O banco monta o Calendar com \`mode="single"\`: sem \`mode\`, o react-day-picker desenha os
  // dias como texto em <td> e não há botão nenhum para focar.
  {probe: "Calendar",     foco: "td button",           de: 8},
  // `preparaTeclas` em vez de `de`, e a razão é do componente: o `TreeView` guarda o item ATIVO
  // em estado PRÓPRIO (`active`, inicializado com `items[0].id`) e o handler calcula o vizinho a
  // partir DELE, não de `document.activeElement`.
  //
  // Focar o segundo item pelo DOM deixa o estado apontando para o primeiro: `ArrowDown` "anda"
  // para onde o foco já está, e a foto não vê nada — era isso que fazia três setas saírem
  // inertes num componente que as implementa. Mas `de: 0` perde `Home` e `ArrowUp`, que no
  // primeiro item não têm para onde ir. As duas escolhas perdem metade da medição.
  //
  // A saída é preparar pelo FLUXO DO PRÓPRIO COMPONENTE: uma seta para baixo antes de medir move
  // o foco E o estado juntos, e a medição começa no meio com os dois de acordo. Medido em
  // 27/08/2026.
  {probe: "TreeView",     foco: "[role=\"treeitem\"]",  de: 0, preparaTeclas: ["ArrowDown"]},
  // O `FileInput` é `<input type=file>` nativo: `Enter` e `Space` abrem o SELETOR DE ARQUIVOS DO
  // SISTEMA, que é chrome do sistema operacional e não existe no DOM. As duas teclas funcionam, e
  // nenhuma foto do documento pode prová-lo — é o mesmo caso do `Enter` no `<select>` fechado que
  // o comentário do fim deste arquivo descreve. A ausência é DECLARADA, com motivo, no lugar de
  // virar acusação contra ficha correta.
  {probe: "FileInput",    foco: "input[type=file]",
   efeitoForaDoDOM: "Enter e Space abrem o seletor de arquivos do sistema, fora do DOM"},
  {probe: "Sidebar",      foco: ".sidebar-item",        de: 1},
  {probe: "ContextMenu",  foco: "button", fecha: true, abreComContexto: true},
  {probe: "IconButton",   foco: "button",               de: 1},
  // ── A leva de 29/08/2026 ──────────────────────────────────────────────────────────────
  // O merge das duas linhagens trouxe vinte fichas de um lado onde o check 30 não existia:
  // teclado declarado, nenhuma medição atrás. Estes dezesseis são os que o banco alcança sem
  // infraestrutura nova. Os quatro que sobraram (BlockEditor, CodeEditor, CommandPalette,
  // ConfirmDialog) estão na lista de dívida do check 30, com o motivo de cada um.
  //
  // Vários deles declaram SÓ `Tab`/`Shift+Tab`, e isso não é descuido da ficha: são listas de
  // links e campos de texto, onde o teclado É a ordem do documento. O comentário abaixo, sobre
  // por que `Tab` sai da conta dos dois lados, é o que torna a medição deles honesta em vez de
  // vazia — o que ela estabelece é que não há teclado de MOTOR a medir, e a nota diz isso.
  {probe: "Input",      foco: "input",              de: 1, digitaTexto: true},
  {probe: "Textarea",   foco: "textarea",           digitaTexto: true},
  {probe: "Field",      foco: "input",              digitaTexto: true},
  // `Enter` num formulário submete, e submeter recarregaria a página e apagaria a foto — o
  // `onSubmit` do Form já chama `preventDefault`, e o banco conta a submissão.
  {probe: "Form",       foco: "input",              digitaTexto: true},
  {probe: "Pagination", foco: "button",             de: 1},
  {probe: "NavList",    foco: ".nav-list-row",      de: 1},
  {probe: "BottomNav",  foco: ".bottom-nav-item",   de: 1},
  // A alça é o que recebe o foco no protocolo de arraste por teclado (`useReorder`), e a ORDEM
  // dos itens é o efeito observável: a foto guarda o índice de cada nó.
  // `preparaTeclas` pela mesma razão do TreeView, e medida em 29/08/2026: o protocolo de
  // arraste por teclado tem DOIS tempos — `Space` pega o item, e só então as setas o movem.
  // Medir de um punho solto mede o primeiro tempo e declara os outros inertes: `ArrowUp`,
  // `ArrowDown` e `Escape` saíam sem efeito num componente que implementa os três.
  {probe: "SortableList", foco: ".sortable-handle", de: 1, preparaTeclas: ["Space"]},
  // A região rolável é que tem `tabindex=0` e é dona das setas; os pontos e as duas setas de
  // ponteiro são outra parada de foco.
  // `esperaMs` alto porque a rolagem é SUAVE: a seta rola o trilho de verdade (medido em
  // 29/08/2026 — `scrollLeft` foi de 0 a 1228), e o que a foto vê é o `aria-current` dos
  // pontos, que só se move quando o `onScroll` assenta.
  //
  // TENTADO E DESCARTADO: `preparaTeclas` com duas setas, para medir do meio como fazem os
  // bancos com `de`. Não mudou nada — as esperas de 80ms do preparo não chegam para uma
  // rolagem suave, então a referência continuava sendo a da primeira lâmina. Fica registrado
  // para quem vier: o caminho é dar ao preparo a mesma espera do banco, não repetir a tecla.
  {probe: "Carousel",   foco: ".carousel-track", esperaMs: 1200},
  {probe: "Gallery",    foco: ".gallery-tile",      de: 0},
  {probe: "AutomationCard", foco: "input[role=\"switch\"]"},
  // Os três de `agents` abrem o detalhe num `<details>/<summary>` nativo, o mesmo idioma do
  // Accordion — o teclado é o da plataforma, e é isso que a medição tem de confirmar.
  {probe: "InterAgentMessage", foco: "summary"},
  {probe: "InvocationPanel",   foco: "summary"},
  {probe: "MemoryLedger",      foco: "summary"},
  // A escolha de três vias é um SegmentedControl, que é o radiogroup do motor (ADR-0016): a
  // medição aqui prova a mesma coisa que a do SegmentedControl, mas pelo caminho do consumidor.
  {probe: "ToolPermission", foco: "button[role=\"radio\"]", de: 1},
  {probe: "DependencyGraph", foco: ".graph-node-body", de: 0},
  // Segundo dono do `useReorder` (item N1): mesmo protocolo de dois tempos do SortableList,
  // mesma preparação. `de: 2` é a alça do segundo bloco — do primeiro, `ArrowUp` não teria
  // para onde ir. Os punhos e os botões de remover se alternam no DOM, daí o índice par.
  {probe: "BlockEditor", foco: ".block-handle", de: 1, preparaTeclas: ["Space"]},
  // O documento do CodeMirror é um `contenteditable`, e é ele que recebe a tecla — o
  // `.cm-scroller` tem `tabindex=-1` e é só rolagem. `digitaTexto` pela mesma razão dos
  // campos: a barra de espaço DIGITA aqui, então ela não distingue nada.
  //
  // LIMITE DECLARADO: `Ctrl+Z` e `Ctrl+Shift+Z`, que esta ficha declara, ficam fora — o probe
  // pressiona tecla SEM modificador, de propósito, e é o mesmo limite que o `F2` e o
  // `Control+Home` do DataGrid têm. O que sobra a medir é `Home` e `End`.
  {probe: "CodeEditor", foco: ".cm-content", digitaTexto: true},
];

/** A fotografia do estado observável do banco. Genérica de propósito — ver o cabeçalho. */
const FOTO = `(sel) => {
  const raiz = document.querySelector(sel);
  const ativo = document.activeElement;
  // O ÍNDICE, e não só tag/classe/texto: as quatro caixas do OTPField são <input> irmãos com a
  // MESMA classe e sem texto, então a impressão digital antiga era idêntica para as quatro — e a
  // seta, que anda entre elas, saía como "não faz nada". Medido em 22/08/2026: quatro das cinco
  // reprovações da primeira execução eram esta cegueira, não defeito de componente.
  const todos = [...document.querySelectorAll("*")];
  const partes = [
    "foco:" + (ativo ? todos.indexOf(ativo) + ":" + ativo.tagName + "#" + (ativo.id || "") +
      "." + (ativo.className || "") + "|" + (ativo.textContent || "").slice(0, 20) : "nenhum"),
  ];
  // A RAIZ ENTRA NA FOTO, e isto custou uma volta: \`querySelectorAll("*")\` NÃO devolve o
  // próprio elemento. O banco do IconButton marcava \`data-ativado\` na seção, e a foto não via —
  // Enter num <button> com onClick saía como tecla inerte. Medido em 27/08/2026.
  for (const el of [raiz, ...raiz.querySelectorAll("*")]) {
    for (const a of el.attributes) {
      // data-starting-style e data-ending-style são marcadores de ANIMAÇÃO do motor: aparecem
      // e somem sozinhos enquanto o painel monta, sem tecla nenhuma. Medido em 22/08/2026 —
      // eram eles que faziam o Tabs "responder" a Escape, Enter e às setas. Marcador
      // transitório não é estado, e uma foto que os inclui fotografa o relógio.
      // (sem crase neste bloco: ele vive dentro de um template literal.)
      if ((a.name.startsWith("aria-") || a.name.startsWith("data-")) &&
          !/^data-(starting|ending)-style$/.test(a.name)) partes.push(el.tagName + a.name + "=" + a.value);
    }
    if ("value" in el) partes.push(el.tagName + ":v=" + el.value);
    if ("checked" in el) partes.push(el.tagName + ":c=" + el.checked);
    if (el.tagName === "DETAILS") partes.push("open=" + el.open);
  }
  // o popup do menu vive num PORTAL, fora do banco — sem isto, abrir o menu não conta como mudança
  partes.push("popups:" + document.querySelectorAll('[role="menu"],[role="listbox"],[role="dialog"]').length);
  return partes.join("~");
}`;

for (const banco of BANCOS) {
  test(`${banco.probe}: a ficha declara todo o teclado que o motor entrega`, async ({page}) => {
    // O ORÇAMENTO SAI DA CONTA, não de um número redondo. Cada tecla candidata custa uma
    // recarga mais duas esperas de `esperaMs`, e as duas partidas dobram isso. Com o padrão
    // de 30s o banco do `Carousel` — que precisa de 1,2s por espera porque a rolagem é suave —
    // estourava, e o relatório dizia "timeout" onde a causa era o orçamento fixo. É o mesmo
    // defeito que os três gates de varredura tinham em 28/08/2026: teto de tempo escrito à mão
    // que a população passou por baixo.
    const espera = banco.esperaMs ?? 120;
    const nPartidas = banco.deTambem === undefined ? 1 : 2;
    test.setTimeout(Math.max(30_000, CANDIDATAS.length * nPartidas * (2 * espera + 1_500)));
    const erros: string[] = [];
    page.on("pageerror", e => erros.push(String(e)));
    await page.goto(APP);
    const raiz = `[data-probe="${banco.probe}"]`;
    await expect(page.locator(raiz)).toBeVisible();
    await page.locator(`${raiz} ${banco.foco}`).nth(banco.de ?? 0).focus();

    // O FOCO TEM DE POUSAR DENTRO DO BANCO, e isto é gate, não zelo.
    //
    // Medido em 27/08/2026, ao acrescentar sete bancos: o seletor `foco` do `FileInput` não
    // casava com nada, o `.focus()` não movia o foco, e a medição seguiu com o foco onde o banco
    // ANTERIOR o tinha deixado — numa aba do `Tabs`. As setas moviam AQUELAS abas, e o relatório
    // acusou o `FileInput` de responder a `ArrowLeft`, `ArrowRight` e `End`.
    //
    // É a mesma família do detector de foco que não excluía `display:none` e acusava o mesmo
    // elemento nas sete páginas: **um instrumento que erra em silêncio mede o vizinho.** Sem esta
    // asserção, um seletor errado não reprova — ele INVENTA um achado.
    const dentro = await page.evaluate((sel) => {
      const secao = document.querySelector(sel);
      const ativo = document.activeElement;
      return !!(secao && ativo && secao.contains(ativo));
    }, raiz);
    expect(dentro, `${banco.probe}: o seletor \`${banco.foco}\` não pôs o foco dentro do banco. ` +
      `A medição seguiria com o foco onde o banco ANTERIOR o deixou, e o resultado seria do ` +
      `vizinho. Corrija o seletor ou o \`de\`.`).toBe(true);

    const movem: string[] = [];
    const diffs: Record<string, string> = {};
    const partidas = [banco.de ?? 0, ...(banco.deTambem != null ? [banco.deTambem] : [])];
    for (const tecla of CANDIDATAS) {
     for (const partida of partidas) {
      if (movem.includes(NOME(tecla))) break;   // já provada numa partida: não repete o custo
      // recarrega entre teclas: sem isto a segunda tecla age sobre o estado que a primeira
      // deixou, e a medição vira uma sequência em vez de sete medições independentes.
      await page.goto(APP);
      await page.locator(`${raiz} ${banco.foco}`).nth(partida).focus();
      // O menu de contexto não abre por tecla no gatilho: abre com o botão direito. Medir sem
      // isto mede um menu fechado, e toda tecla sai inerte.
      if (banco.abreComContexto) {
        await page.locator(`${raiz} ${banco.foco}`).nth(partida).click({button: "right"});
        await page.waitForTimeout(150);
      }
      for (const k of banco.preparaTeclas ?? []) { await page.keyboard.press(k); await page.waitForTimeout(80); }
      if (banco.prepara) { await page.keyboard.type(banco.prepara); await page.waitForTimeout(80); }
      // deixa a montagem ASSENTAR antes da foto de referência: sem isto o "antes" é tirado com o
      // motor ainda animando, e a diferença que sobra é o relógio, não a tecla.
      // `esperaMs` vale para a foto de REFERÊNCIA também, e não é simetria de enfeite: o
      // `preparaTeclas` do Carousel rola com `scroll-behavior: smooth`, e uma referência tirada
      // antes de a rolagem assentar é a foto da posição ANTERIOR. Medindo dali, a tecla que
      // volta um passo parece não ter para onde ir.
      await page.waitForTimeout(Math.max(250, banco.esperaMs ?? 0));
      const antes = await page.evaluate(new Function("sel", `return (${FOTO})(sel)`) as never, raiz);
      await page.keyboard.press(tecla === " " ? "Space" : tecla);
      // 120ms cobre a animação de entrada de um motor. NÃO cobre rolagem NATIVA com
      // `scroll-behavior: smooth`, que é o caso do `Carousel`: a seta rola o trilho de
      // verdade (medido em 29/08/2026 — `scrollLeft` foi de 0 a 1228), mas o `aria-current`
      // dos pontos só muda quando o `onScroll` assenta, e isso chega DEPOIS da foto. As
      // quatro setas saíam inertes num componente que responde às quatro: cegueira do
      // instrumento, não do componente, e a quarta desta família.
      await page.waitForTimeout(banco.esperaMs ?? 120);
      const depois = await page.evaluate(new Function("sel", `return (${FOTO})(sel)`) as never, raiz);
      if (antes !== depois) {
        movem.push(NOME(tecla));
        // O QUE mudou, não só que mudou: uma foto genérica acusa qualquer diferença, e sem o
        // diff no relatório não dá para separar "a tecla agiu" de "o motor mexeu um atributo de
        // animação". Sem isto o teste vira oráculo, e oráculo não se audita.
        const a = new Set(antes.split("~")), d = depois.split("~").filter(x => !a.has(x));
        diffs[NOME(tecla)] = d.slice(0, 4).join(" · ") || "(só saiu coisa)";
      }
     }
    }
    console.log(`  [MEDIDO] ${banco.probe}: movem = ${movem.join(", ") || "(nenhuma)"}`);
    expect(erros, `o banco derrubou o React: ${erros.join(" · ")}`).toEqual([]);

    const declaradas = new Set<string>((ficha(banco.probe).a11y?.keyboard ?? [])
      .map((k: string) => k.replace(/^Shift\+/, "")));
    // `Tab` sai da conta dos dois lados: ele move o foco em QUALQUER lugar da página, então ele
    // nunca distingue um componente de outro — declarar ou não é decisão de documentação.
    // `digitaTexto` tira o `Space` da conta em banco cujo foco é um campo de TEXTO, e isso é
    // categoria, não conveniência: num `<input type=text>` a barra de espaço DIGITA um espaço e
    // muda o `value` — a foto vê mudança para qualquer tecla imprimível. Cobrar a ficha de
    // declarar `Space` no `SearchField` seria cobrá-la de declarar o alfabeto. Onde `Space` é
    // interação de verdade (abrir a lista de um combobox fechado, marcar uma caixa), o banco não
    // leva a marca. Medido em 27/08/2026.
    const esquecidas = movem.filter(k =>
      k !== "Tab" && !(banco.digitaTexto && k === "Space") && !declaradas.has(k));
    expect(esquecidas, `${banco.probe}: o motor responde a ${esquecidas.join(", ")} e a ficha não ` +
      `declara. A ficha é o contrato publicado — prometer menos produz gap falso na auditoria.\n` +
      esquecidas.map(k => `  ${k}: ${diffs[k]}`).join("\n"))
      .toEqual([]);

    // NÃO se cobra aqui o inverso — "a ficha declara tecla que não faz nada". A primeira versão
    // cobrava, e as quatro acusações que ela produziu eram todas falsas: além das duas cegueiras
    // já corrigidas acima, sobrou uma que NÃO tem correção genérica. `Enter` num `<select>`
    // fechado não faz nada mensurável; ele confirma a escolha com a lista ABERTA, e abrir a
    // lista nativa é chrome do sistema operacional, fora do alcance do DOM.
    //
    // Ou seja: **ausência de mudança observável não prova ausência de efeito.** Uma foto genérica
    // do DOM pode provar que uma tecla FAZ algo; não pode provar que ela não faz. Cobrar o
    // inverso seria pedir ao teste uma conclusão que o método dele não sustenta — e produziria
    // exatamente o que produziu: acusação contra ficha correta.
    //
    // O gate do elemento nativo (`teclado-nativo.spec.ts`) cobra os dois lados porque lá o efeito
    // é o VALOR do controle, que é sempre legível. Aqui não é, e a diferença está declarada.
    const semEfeitoObservavel = [...declaradas].filter(k =>
      CANDIDATAS.map(NOME).includes(k) && !movem.includes(k));
    if (semEfeitoObservavel.length) {
      console.log(`  ${banco.probe}: declaradas sem efeito observável nesta foto — ` +
        `${semEfeitoObservavel.join(", ")} (não é reprovação; ver o comentário acima)`);
    }

    // MAS o raciocínio acima é POR TECLA, e não se estende a TODAS de uma vez.
    //
    // As quatro acusações falsas que ele descreve têm a mesma forma: UMA tecla inerte no meio de
    // várias que funcionam — `Enter` entre as nove do `Select`, `ArrowRight` entre as seis do
    // `OTPField`. Um componente que trata teclado sempre tem alguma que se vê mexer.
    //
    // Zero de N é outra coisa. Não são N efeitos invisíveis independentes; é o componente não
    // ter teclado nenhum. Medido em 27/08/2026, ao acrescentar o banco do `DataGrid`: a ficha
    // declarava `role: "grid"`, `apg: "grid"` e as quatro setas, e as QUATRO saíram inertes. O
    // fonte confirmou — nenhum `onKeyDown`, nenhum `tabIndex` em célula, e o comentário do
    // próprio componente diz que ele renderiza `role=table`. A ficha prometia uma acessibilidade
    // que nunca existiu, e este gate imprimia isso como aviso.
    //
    // O limiar preserva as quatro falsas (todas com pelo menos uma tecla que anda) e pega o caso
    // em que a ficha inteira é ficção. Provado contra o defeito: com a ficha antiga do
    // `DataGrid`, reprova; com qualquer um dos outros sete bancos, passa.
    if (declaradas.size >= 2 && !banco.efeitoForaDoDOM) {
      expect(movem.length, `${banco.probe}: a ficha declara ${declaradas.size} teclas ` +
        `(${[...declaradas].join(", ")}) e NENHUMA move nada de observável. Uma tecla inerte numa ` +
        `foto é limitação do método; zero de ${declaradas.size} é o componente não ter teclado. ` +
        `Confira o fonte: se não há onKeyDown nem tabIndex, a ficha está prometendo acessibilidade ` +
        `que não existe — corrija a FICHA, ou implemente o teclado.`).toBeGreaterThan(0);
    } else if (banco.efeitoForaDoDOM && !movem.length) {
      // A isenção é declarada, não silenciosa: ela aparece no relatório toda vez.
      console.log(`  ${banco.probe}: limiar dispensado — ${banco.efeitoForaDoDOM}`);
    }
  });
}
