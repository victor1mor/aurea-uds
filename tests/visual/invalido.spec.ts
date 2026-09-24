import {test, expect} from "@playwright/test";
import {readdirSync, readFileSync} from "node:fs";

// G-STATE-02 — todo controle de formulário que pode ser INVÁLIDO tem de se mostrar inválido.
//
// Até 28/08/2026 a Aurea pintava `invalid` em `.input`, `.textarea` e `.select` e em mais nada.
// Um checkbox obrigatório reprovado — "aceite os termos", o caso de validação mais comum que
// existe num formulário — não tinha estado visual nenhum. Hoje o estado vale para as SEIS
// superfícies de campo do sistema, declaradas num bloco só do core ("INVÁLIDO — um vocabulário
// só"), e os dois gates deste arquivo são o que impede a família de voltar a se partir.
//
// NENHUM DOS DOIS LÊ CSS. Os dois injetam `aria-invalid="true"` no controle REAL das páginas
// construídas e comparam a aparência computada antes e depois. Ler a folha diria quais seletores
// existem; medir diz se o estado CHEGA AO DESENHO — e a diferença não é teórica: das três falhas
// que o cartão achou, DUAS eram regra que existia e não pintava (a que perdia empate de ordem
// para `:checked`, e a do campo dentro de um `.input-group`, cuja borda o grupo zera).
//
// E varre o catálogo em vez de montar réplicas: uma réplica escrita à mão diverge do componente
// no dia em que ele muda, e aí o gate passa a proteger um HTML que não existe mais. Assim ele
// também alcança de graça qualquer controle novo.
//
// A regra é a do §131 — linguagem de estado consistente. Um vocabulário que vale para três
// controles e não vale para os outros cinco não é vocabulário, é exceção.

const PAGES = readdirSync("apps/catalog").filter((f) => f.endsWith(".html"));

// ORÇAMENTO DE TEMPO, e ele é DERIVADO do trabalho — não é um número escolhido a esmo.
//
// Este gate navega TODAS as páginas construídas do catálogo e rodava nos 30s do padrão do
// Playwright. Isso nunca foi uma decisão: era o default nunca revisado, e o gate vinha passando
// só porque a margem ainda dava. Em 28/08/2026 ela acabou — o `G-API-02` acrescentou três
// patterns, o catálogo foi de 329 para 332 páginas, e o teste morreu com
// "Test timeout of 30000ms exceeded" num `page.goto`.
//
// E o modo de falhar é o pior possível, o mesmo que o `G-GATE-02` já pagou uma vez: um gate que
// estoura o relógio parece defeito da página que ele estava visitando no momento. Aqui apontou
// para `tabs.html`, que o cartão tinha acabado de mexer — a acusação mais plausível possível, e
// falsa. A página serve em 200 e pesa 60 KB, um terço do `patterns.html`, que passa.
//
// O irmão que faz a MESMA varredura já tinha resolvido isto: `catalog-sweep.spec.ts` configura
// 15 minutos, e `geometry.spec.ts` 8. Eram três os que não configuravam nada — este, o
// `invalido` e o `ordem-de-foco` —, e os outros dois passaram nesta rodada por margem, não por
// estarem certos. Corrigidos os três juntos: "quem mais tem esse problema?" com a resposta já
// escrita na porta ao lado.
//
// O orçamento CRESCE COM AS PÁGINAS de propósito. Um número fixo volta a expirar no dia em que
// alguém acrescentar patterns, e o próximo a pagar não vai saber por quê. A ASSERÇÃO não mudou:
// isto é tempo para fazer o trabalho que o gate sempre teve, não tolerância a defeito.
// Este visita cada página DUAS vezes (antes e depois de injetar `aria-invalid`), daí o dobro.
test.describe.configure({timeout: Math.max(2 * 60 * 1000, PAGES.length * 2000)});

// Controle que NÃO tem estado inválido, com o motivo. Lista curta e revisável, no mesmo espírito
// do `TECLADO_SEM_MEDICAO` do check 30: ausência declarada é diferente de ausência silenciosa.
const SEM_INVALIDO: Record<string, string> = {
  range: "um <input type=range> está sempre dentro de [min,max] por construção — não há valor " +
    "inválido a mostrar",
  "media-seek": "é a barra de progresso do player, não um campo de formulário",
  color: "o seletor de cor nativo sempre devolve uma cor válida",
};

// ── A MEDIÇÃO, UMA SÓ, EM DOIS MODOS ─────────────────────────────────────────────────────────
//
// Ser uma só é decisão, não economia. A função roda DENTRO da página (o Playwright a serializa,
// então ela não pode fechar sobre nada daqui), e é exatamente por isso que a tentação é escrever
// duas: uma que varre tudo e outra que mira um seletor. Duas cópias divergem, e a que divergir
// passa a proteger outra coisa — foi assim que cinco extratores desta auditoria acabaram medindo
// `data-*` com cinco réguas diferentes, duas delas dando o resultado oposto das outras três.
//
//   sel === null   varre todo controle de formulário da página   → o gate da varredura
//   sel !== null   mede só o que casa com o seletor              → o gate de ficha × desenho
function medir({ignorar, sel}: {ignorar: Record<string, string>; sel: string | null}) {
  const ruins: string[] = [];
  let total = 0;
  // AS TRANSIÇÕES SÃO DESLIGADAS ANTES DE MEDIR, e isto custou a sétima cegueira de instrumento
  // desta auditoria — a que quase virou uma conclusão falsa e alarmante.
  //
  // `.input` tem `transition`, e `getComputedStyle` logo depois de mudar o atributo lê o valor no
  // INSTANTE ZERO da interpolação: a cor ainda é a antiga, mas serializada como `oklab(...)` em
  // vez de `oklch(...)`. Comparando as duas strings, "mudou" — e um controle que NÃO pinta
  // parecia pintar.
  //
  // A primeira versão deste gate concluiu por aí que estava tudo bem. A conferência mostrou o
  // contrário do contrário: com a transição desligada, o input vai para `rgb(255,113,128)` (que é
  // `--danger-400`, correto) e o checkbox não sai do lugar. O defeito era dos marcáveis, e não do
  // sistema inteiro — que foi a conclusão que o instrumento cru sugeria.
  const semTransicao = document.createElement("style");
  semTransicao.textContent =
    "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(semTransicao);
  const props = ["borderColor", "outlineColor", "backgroundColor", "color", "boxShadow"];

  for (const c of document.querySelectorAll<HTMLElement>(
    sel ?? "input:not([type=hidden]), select, textarea")) {
    const r = c.getBoundingClientRect();
    const cs = getComputedStyle(c);
    // O controle pode ser invisível de propósito e ainda ser o controle: o `<input>` do checkbox
    // é `opacity:0` e quem desenha é o `.control-mark` irmão. O que exclui de verdade é estar
    // fora do documento ou desabilitado.
    if (cs.display === "none" || (c as HTMLInputElement).disabled) continue;
    // Controle que JÁ está inválido não muda ao ficar inválido — e o catálogo demonstra o estado
    // de propósito. Acusá-lo é acusar a demonstração de funcionar. (Oitava cegueira desta série:
    // o `.select` de `pattern-input-settings-row` já vinha vermelho.)
    if (c.hasAttribute("aria-invalid")) continue;
    // ESPELHO DE FORMULÁRIO, e é a nona cegueira. A base-ui renderiza, ao lado do campo que a
    // pessoa usa, um segundo `<input>` de 1×1px com `clip-path:inset(50%)`, `tabindex="-1"` e
    // `aria-hidden="true"`, só para o `<form>` submeter o valor com o tipo certo — é o
    // `-hidden-input` do `OTPField` e o `type=number` escondido do `NumberField`. Ele não está na
    // árvore de acessibilidade, ninguém o vê e ninguém o foca; cobrar dele um estado VISUAL é
    // cobrar aparência de quem não tem aparência. Sem esta linha o gate acusava
    // `input[type=number]` e `input[type=text]` sem classe nenhuma — e a "correção" seria pintar
    // um pixel invisível.
    if (c.getAttribute("aria-hidden") === "true") continue;
    if (r.width === 0 && r.height === 0 && cs.opacity !== "0") continue;

    const classes = (c.className || "").trim().split(/\s+/).filter(Boolean);
    if (classes.some((k) => k in ignorar) || (c.getAttribute("type") ?? "") in ignorar) continue;

    // QUEM DESENHA pode não ser quem carrega o atributo, e são TRÊS parentescos diferentes:
    //
    //   o próprio controle   `.input`, `.textarea`, `.select` — ele tem a borda
    //   o IRMÃO              o `.control-mark` do checkbox, o `.switch-track` do switch
    //   um ANCESTRAL         o `.input-group`, o `.combobox-multi`, o `.dropzone` — o filho abre
    //                        mão da moldura (`border:0`) porque quem desenha é o grupo
    //
    // O ancestral vai a QUATRO níveis e não a um: o `.combobox-chip-input` fica dentro de
    // `.combobox-chips` dentro de `.combobox-multi`, e olhar só o pai imediato acusava um campo
    // que hoje pinta. O limite existe para o gate não subir até o `<body>` e aceitar qualquer
    // reação de página como prova.
    const olhar: Element[] = [c];
    if (c.nextElementSibling) olhar.push(c.nextElementSibling);
    if (c.previousElementSibling) olhar.push(c.previousElementSibling);
    for (let a = c.parentElement, n = 0; a && n < 4 && a !== document.body;
      a = a.parentElement, n++) olhar.push(a);
    const foto = () => olhar.map((e) => props.map((p) =>
      getComputedStyle(e)[p as never]).join("|")).join("~");

    // OS DOIS ESTADOS do marcável, porque o defeito só aparecia num deles. A regra do inválido do
    // switch empatava em especificidade com `input:checked + .switch-track` e perdia por ORDEM: o
    // switch DESLIGADO pintava e o LIGADO não.
    //
    // Medir só o estado que a página traz é medir o que o catálogo escolheu demonstrar, e isso
    // não é hipótese: das 9 páginas do catálogo que têm `.switch`, 2 têm TODOS os switches
    // desligados. Nelas um gate de um estado só passaria verde com o defeito presente — e quem
    // LIGASSE o switch na página perderia a marca de erro. Contado com:
    //   for f in apps/catalog/*.html; do grep -q 'class="switch"' $f &&
    //     ! grep -q 'role="switch" checked' $f && echo $f; done
    const marcavel = c instanceof HTMLInputElement &&
      (c.type === "checkbox" || c.type === "radio");
    const estados = marcavel ? [false, true] : [null];
    const original = marcavel ? (c as HTMLInputElement).checked : null;
    let falhou = false;
    for (const e of estados) {
      if (e !== null) (c as HTMLInputElement).checked = e;
      const antes = foto();
      c.setAttribute("aria-invalid", "true");
      if (antes === foto()) falhou = true;
      c.removeAttribute("aria-invalid");
    }
    if (original !== null) (c as HTMLInputElement).checked = original;

    total++;
    if (falhou) {
      ruins.push(classes.length ? "." + classes.join(".")
        : `${c.tagName.toLowerCase()}[type=${c.getAttribute("type") ?? "text"}]`);
    }
  }
  semTransicao.remove();
  // `total` é resposta própria, e não um detalhe do relatório: uma página SEM controle nenhum não
  // é a mesma coisa que uma página cujo controle não pinta. Confundir as duas é como uma ficha
  // mentirosa passaria despercebida — e é o que aconteceu com `Combobox` e `MultiCombobox`, cujas
  // páginas não têm componente (G-LAB-01).
  return {ruins: [...new Set(ruins)], quantosFalham: ruins.length, total};
}

test("todo controle de formulário se mostra inválido, em toda página do catálogo",
  async ({page}) => {
    const semMarca = new Map<string, string>();   // classe do controle -> página de exemplo

    for (const f of PAGES) {
      await page.goto(`/apps/catalog/${f}`);
      const {ruins} = await page.evaluate(medir, {ignorar: SEM_INVALIDO, sel: null});
      for (const r of ruins) if (!semMarca.has(r)) semMarca.set(r, f);
    }

    const resumo = [...semMarca.entries()].map(([k, p]) => `  ${k}  (p.ex. ${p})`).join("\n");
    expect(semMarca.size, `controle de formulário que NÃO se mostra inválido:\n${resumo}\n\n` +
      `\`invalid\` é estado de CAMPO, e a Aurea o declara para a família inteira num bloco só — ` +
      `procure por "INVÁLIDO — um vocabulário só" em \`packages/core/src/aurea.css\`.\n` +
      `Acrescente a superfície que falta A ESSE BLOCO, e escolha o alvo pelo parentesco: o ` +
      `próprio controle quando ele tem a borda, o IRMÃO que desenha quando o \`<input>\` é ` +
      `\`opacity:0\` (\`.control-mark\`, \`.switch-track\`), o ANCESTRAL quando o filho abre mão ` +
      `da moldura (\`.input-group\`, \`.combobox-multi\`, \`.dropzone\`). Sempre pelos dois ` +
      `caminhos — \`[aria-invalid="true"]\` E \`:user-invalid\`.\n` +
      `NÃO escreva a regra perto do componente: espalhada, ela perde empate de ordem para a ` +
      `\`:checked\` dele sem avisar, que foi exatamente o defeito que este gate pegou duas ` +
      `vezes.\n` +
      `Se o controle legitimamente não tem estado inválido, declare-o em SEM_INVALIDO com o ` +
      `motivo.`).toBe(0);
  });

// ── O outro lado: a FICHA e o DESENHO têm de concordar sobre `invalid`. ───────────────────────
//
// O gate de cima prova que o desenho existe. Este prova que o CONTRATO diz a verdade sobre ele, e
// nas duas direções — porque as duas apareceram medidas, não imaginadas:
//
//   declara e não pinta   o `InputGroup` prometia `invalid` na ficha desde que foi escrito. O
//                         grupo zera a borda do filho (`border:0`), então a regra que existia
//                         pintava um elemento sem borda: o contrato prometia o que o desenho não
//                         entregava, e nada reprovava.
//   pinta e não declara   `Checkbox`, `Radio`, `Switch`, `NumberField`, `OTPField`, `SearchField`
//                         e `FileInput` passaram a pintar hoje. Capacidade que existe e não está
//                         na ficha não é encontrável por quem usa a Aurea — e o §13 monta a
//                         matriz A PARTIR DA FICHA, então ela entraria na comparação como falta.
//                         Dois deles, `OTPField` e `SearchField`, nem estavam no cartão:
//                         apareceram quando o gate mediu.
//
// O SELETOR É EXPLÍCITO POR COMPONENTE, e isso não é preciosismo — é a décima cegueira desta
// série. A primeira versão perguntava "algum controle desta página pinta?", e a resposta foi
// `Label` PINTA — porque a página do `Label` tem um `.input` dentro, que é o único jeito de
// demonstrar um rótulo. O gate media o VIZINHO, como o probe de teclado media a aba do banco
// anterior. Uma página de catálogo demonstra o componente NO MEIO de outros; só um seletor
// nomeado separa "o controle deste componente" de "um controle que aparece nesta página".
const ALVO: Record<string, string> = {
  Checkbox: ".checkbox input", Radio: ".radio input", Switch: ".switch input",
  Input: ".input", Textarea: ".textarea", Select: ".select",
  InputGroup: ".input-group > .input, .input-group > .select, .input-group > .textarea",
  NumberField: ".number-field-input", OTPField: ".otp-slot",
  PasswordField: 'input[type="password"]', SearchField: 'input[type="search"]',
  FileInput: 'input[type="file"]',
  Combobox: ".combobox-group > .input", MultiCombobox: ".combobox-chip-input",
  Range: ".range",
};

// TRÊS COMPONENTES NÃO TÊM DEMONSTRAÇÃO NA PÁGINA DELES: o catálogo escreve "Interactive — see
// the code." no lugar do preview, nas TRÊS de três demonstrações de cada um. Medido em
// 28/08/2026. Enquanto isso não se resolve, eles são medidos no PADRÃO que os usa de verdade — e
// o desvio fica escrito aqui, em código, em vez de virar um silêncio.
//
// A causa é maior que este gate e está registrada como `G-LAB-01`: o catálogo inteiro é markup
// ESTÁTICO (`renderToStaticMarkup` no build, e 8.472 bytes de comportamento vanilla na página —
// nenhum React, nenhuma hidratação), então nenhum preview abre, filtra ou digita. Um `Combobox`,
// que só existe enquanto se digita nele, não tem imagem nenhuma — foi por isso que virou
// placeholder. É o que o COMPONENT LAB resolve, e este mapa some quando ele existir.
const PAGINA: Record<string, string> = {
  Combobox: "pattern-combobox-picking-one-out-of-many",
  MultiCombobox: "pattern-multicombobox-labelling-something-with-several-tags",
  FileInput: "pattern-fileinput-dropping-files-with-a-limit",
};

// Componente de campo que legitimamente NÃO tem `invalid`, com o motivo — mesma disciplina do
// `SEM_INVALIDO` e do `TECLADO_SEM_MEDICAO`: ausência declarada não é ausência silenciosa.
const FICHA_SEM_INVALIDO: Record<string, string> = {
  Label: "é o rótulo, não o controle — quem fica inválido é o campo que ele nomeia",
  InputGroupAddon: "é o adorno (ícone, texto, botão) dentro do grupo; a moldura que pinta é a " +
    "do `InputGroup`",
  Field: "é o INVÓLUCRO que propaga: recebe `error` e põe `aria-invalid` + `aria-describedby` no " +
    "controle filho. Quem pinta é o filho, e é isso que se quer",
  SegmentedControl: "escolhe entre opções mutuamente exclusivas e sempre tem uma escolhida — não " +
    "há valor inválido a mostrar",
  Range: "um <input type=range> está sempre dentro de [min,max] por construção",
  Calendar: "a grade só oferece datas que existem; o campo que pode receber uma data inválida é " +
    "o `Input` que a acompanha, e ele pinta",
  // Os dois de 29/08/2026, e os dois vieram da outra linhagem sem passar por aqui.
  Form: "é o INVÓLUCRO que distribui: recebe `errors` e o motor os entrega aos campos pela chave " +
    "`name`. Quem pinta é o campo, exatamente como no `Field` — e a ficha dele declarava " +
    "`invalid` sem nada desenhar, que é a ficha prometendo o que não existe",
  BlockEditor: "edita a ORDEM e a presença de blocos, não um valor: não há entrada a validar. O " +
    "estado que ele tem é `grabbed`, do arraste por teclado",
};

// O escopo é a categoria `Inputs` do registry, e é fechado de propósito: `invalid` é estado de
// CAMPO. Varrer as 92 fichas acusaria o `Table` por causa do `.input` de filtro que aparece na
// página dele, que não é um controle do `Table`.
const FICHAS: {name: string; states?: string[]}[] =
  readdirSync("packages/contracts/registry").filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(`packages/contracts/registry/${f}`, "utf8")))
    .filter((d) => d.category === "Inputs");

test("a ficha e o desenho concordam sobre `invalid`, campo por campo", async ({page}) => {
  const mentindo: string[] = [], calando: string[] = [], semAlvo: string[] = [];

  for (const ficha of FICHAS) {
    const declara = (ficha.states ?? []).includes("invalid");
    const motivo = FICHA_SEM_INVALIDO[ficha.name];
    const sel = ALVO[ficha.name];
    if (!sel) {
      // Sem seletor E sem motivo, o campo não está sendo medido por ninguém — que é exatamente o
      // estado que esta auditoria trata como falha, e não como silêncio.
      if (!motivo) semAlvo.push(`  ${ficha.name} — não tem seletor em ALVO nem motivo em ` +
        `FICHA_SEM_INVALIDO: ninguém está medindo este campo`);
      continue;
    }
    await page.goto(`/apps/catalog/${PAGINA[ficha.name] ?? ficha.name.toLowerCase()}.html`);
    const {quantosFalham, total} = await page.evaluate(medir, {ignorar: {}, sel});

    if (total === 0) {
      semAlvo.push(`  ${ficha.name} — o seletor \`${sel}\` não casou com nada na página: ou a ` +
        `classe mudou, ou o componente deixou de ser demonstrado`);
      continue;
    }
    const pinta = quantosFalham === 0;
    if (declara && !pinta) {
      mentindo.push(`  ${ficha.name}  (${total - quantosFalham}/${total} pintam)`);
    }
    if (pinta && !declara) calando.push(`  ${ficha.name}` + (motivo
      ? `  — está em FICHA_SEM_INVALIDO com o motivo "${motivo}", e hoje pinta: releia` : ""));
  }

  const partes = [
    mentindo.length && `A ficha DECLARA \`invalid\` e o componente NÃO pinta — o contrato promete ` +
      `o que o desenho não entrega:\n${mentindo.join("\n")}`,
    calando.length && `O componente PINTA \`invalid\` e a ficha NÃO declara — a capacidade existe ` +
      `e não é encontrável, e o §13 monta a matriz a partir da ficha:\n${calando.join("\n")}`,
    semAlvo.length && `Campo que ninguém está medindo:\n${semAlvo.join("\n")}`,
  ].filter(Boolean);

  expect(partes.length, `ficha e desenho discordam sobre \`invalid\`:\n\n${partes.join("\n\n")}\n\n` +
    `Corrija o LADO CERTO: se o componente deve pintar, acrescente a superfície ao bloco ` +
    `"INVÁLIDO — um vocabulário só" de \`packages/core/src/aurea.css\`; se ele legitimamente não ` +
    `tem o estado, tire \`invalid\` da ficha e declare o motivo em FICHA_SEM_INVALIDO.`).toBe(0);
});
