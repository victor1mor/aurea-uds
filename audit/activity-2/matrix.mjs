// A MATRIZ DO §13 — capacidade contra capacidade, não nome contra nome.
//
// O `crossref.mjs` cruzou NOMES e parou onde tinha de parar: 59 capacidades existem dos dois
// lados e ficaram em `A_COMPARAR`, porque o §15 é explícito — *"a Aurea possuir um componente
// com o mesmo nome NÃO fecha o gap"*. Este arquivo é o passo seguinte.
//
// ─────────────────────────────────────────────────────────────────────────────────────────────
// A PRIMEIRA VERSÃO DESTE ARQUIVO ESTAVA ERRADA, e vale mais registrar isso do que escondê-lo.
//
// Ela fazia diferença de conjuntos sobre os valores dos nove inventários e concluía que a Aurea
// era **inferior em 59 de 59 capacidades**, e o `Button` inferior em **7 eixos**. Um `Button`
// com 13 variantes, 2 eixos, 5 tamanhos e 6 estados não é inferior a nada disso. O número era
// grande demais para ser verdade, e conferir a linha mostrou o que ele media:
//
//   variantes: a mui declarava `{variant, color, size, loadingPosition}` e o achatamento
//              transformava `color:primary` e `loadingPosition:center` em "variantes" que a
//              Aurea "não tinha" — sendo que uma é o EIXO DE TOM e a outra é outra prop.
//   estados:   a mui declara estado como PROSA (`descricao: "State class applied to the..."`),
//              e comparar isso com `hover` produz diferença que é de formato.
//   teclado:   a base-ui escreve "delega a ativação por Enter e Espaço" — que É `Enter`+`Space`,
//              ou seja, exatamente o que a Aurea declara. Saiu como divergência.
//   aria:      a Aurea usa `<button>` e `<input type=checkbox>` NATIVOS. Semântica implícita
//              não aparece como atributo, então "a Aurea não emite ARIA" lia-se como falta —
//              quando é a plataforma fazendo o trabalho, que é a escolha melhor.
//
// É a armadilha do §15 um nível abaixo: lá era "nome igual não é capacidade igual"; aqui é
// **"valor igual não é capacidade igual, e valor diferente não é capacidade diferente"**.
// ─────────────────────────────────────────────────────────────────────────────────────────────
//
// O que esta versão faz. Emite VEREDITO só onde os dois lados falam mesmo a mesma língua, e o
// resto vira `REQUER_LEITURA` com a evidência alinhada ao lado — que é trabalho de verdade
// entregue, não promessa: quem for comparar não precisa reabrir nove inventários.
//
//   EIXOS      veredito. Comparados por TIPO de eixo (aparência, tom, tamanho, orientação…),
//              via um mapa de apelidos conferido à mão, e por CARDINALIDADE — nunca por token.
//              `contained` e `solid` são o mesmo eixo com nomes diferentes; contar token faria
//              disso um gap.
//   ESTADOS    veredito, e SÓ das fontes medidas (`estadosData`): ali o valor é o literal do
//              `data-*`, um vocabulário fechado de verdade. A prosa das fontes ricas fica de fora
//              e é declarada como não-comparável, não omitida.
//   TECLADO    veredito quando a fonte lista TECLAS; prosa vira `REQUER_LEITURA`.
//   ARIA       nunca veredito. O lado da Aurea é MEDIDO no render (`AUREA-ARIA.json`), mas
//              semântica implícita de elemento nativo não aparece em atributo nenhum, então a
//              diferença não é legível por máquina.
//   ANATOMIA   nunca veredito: nome de parte interna é vocabulário de projeto.
//
// Rodar:  node audit/activity-2/matrix.mjs   (depende de scripts/measure-aurea-aria.mjs)
// Escreve: audit/activity-2/MATRIX.json

import fs from "node:fs";
import path from "node:path";

const AQUI = import.meta.dirname;
const RAIZ = path.join(AQUI, "..", "..");
const ler = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const crossref = ler(path.join(AQUI, "CROSSREF.json"));
const ariaMedida = ler(path.join(AQUI, "AUREA-ARIA.json")).componentes;

// ── O ESTADO DE LEITURA, que é a única coisa aqui que NÃO se recalcula ────────────────────────
// Tudo neste arquivo é derivado: rodar de novo reconstrói o veredito de máquina do zero. O que
// NÃO pode ser derivado é a LEITURA HUMANA de cada célula — e sem um lugar para guardá-la, uma
// sessão que lesse 63 células e acabasse os tokens perderia as 63.
//
// A chave é `<capacidade>·<eixo>`, nunca o índice da linha: a ordem das linhas muda quando uma
// fonte entra na tabela FONTES, e indexar célula por posição já produziu um diff falso de 30
// células em 26/08/2026.
//
// E o derivado é SEMPRE `PENDING`, inclusive onde a máquina já emitiu veredito. O veredito não é
// a leitura, é a evidência de ENTRADA dela — duas células marcadas `AUREA_INFERIOR` pela máquina
// (`input·orientacao`, `drawer·aparencia`) foram desmentidas pela leitura. Derivar o estado do
// veredito faria essas duas nascerem erradas e ninguém as releria.
//
// `AUREA_MATRIX_FIXTURE` aponta o mecanismo para OUTRO diretório: lê `MATRIX-ESTADO.json` de lá
// e escreve `MATRIX.json` lá. Existe por causa do §1b do protocolo — "nenhum extrator novo entra
// na cadeia sem um fixture/controle conhecido que prove que ele não está omitindo informação
// silenciosamente". É o único jeito de o teste rodar a cadeia INTEIRA, duas vezes, com um estado
// de controle no meio, sem tocar no estado real nem no MATRIX.json versionado. Fora do teste a
// variável não existe e o caminho é o de sempre.
const FIXTURE = process.env.AUREA_MATRIX_FIXTURE || null;
const SAIDA = path.join(FIXTURE ?? AQUI, "MATRIX.json");
const ARQ_ESTADO = path.join(FIXTURE ?? AQUI, "MATRIX-ESTADO.json");
const ESTADOS = new Set(["PENDING", "IN_REVIEW", "CONFIRMED", "EQUIVALENT", "AUREA_SUPERA",
  "AUREA_INFERIOR", "N/A", "INCONCLUSIVE"]);
const estadoMao = fs.existsSync(ARQ_ESTADO) ? (ler(ARQ_ESTADO).celulas ?? {}) : {};
for (const [k, v] of Object.entries(estadoMao)) {
  if (!ESTADOS.has(v?.estado)) {
    throw new Error(`MATRIX-ESTADO.json: a célula \`${k}\` tem estado \`${v?.estado}\`, que não ` +
      `está no vocabulário fechado (${[...ESTADOS].join(" · ")}).`);
  }
  for (const campo of ["porque", "em"]) {
    if (!v[campo]) {
      throw new Error(`MATRIX-ESTADO.json: a célula \`${k}\` está sem \`${campo}\`. Estado sem ` +
        `razão e sem data é opinião anônima — a leitura tem de deixar rastro de por quê e quando.`);
    }
  }
}
const chavesVistas = new Set();
const desatualizadas = [];

import {CHAVE, eixoCanon, eixosDe, eixosAurea} from "./eixos.mjs";
import {normalizarLista} from "./aria.mjs";
const SINONIMOS = {
  "dropdown-menu": "menu", dropdown: "menu", "menu-bar": "menubar", sheet: "drawer",
  modal: "dialog", segmented: "segmented-control", "toggle-button": "toggle",
  snackbar: "toast", toaster: "toast", sonner: "toast",
  "text-field": "input", textfield: "input", "text-area": "textarea", "input-otp": "otp-field",
  "number-input": "number-field", "data-table": "data-grid", datagrid: "data-grid",
  "circular-progress": "progress-circle", "linear-progress": "progress", "progress-bar": "progress",
  "app-bar": "topbar", appbar: "topbar", navbar: "topbar", header: "topbar",
  autocomplete: "combobox", "multi-select": "multi-combobox", multiselect: "multi-combobox",
  "file-upload": "file-input", dropzone: "file-input", "tree-view": "tree", treeview: "tree",
  "tree-select": "tree", empty: "empty-state", "keyboard-key": "kbd",
  "radio-group": "radio", "checkbox-group": "checkbox", "switch-group": "switch",
  "loading-skeleton": "skeleton", range: "slider", "native-select": "select",
  "password-toggle-field": "password-toggle", "password-input": "password-toggle",
  "one-time-password-field": "otp-field", "preview-card": "hover-card",
  // A ficha se chama `OTPField`: sem minúscula antes do `F`, a normalização por camelCase dá
  // `otpfield` e a linha saía com `fichaAurea: null` — a Aurea aparecia como se não tivesse o
  // componente. Medido em 22/08/2026.
  otpfield: "otp-field", qrcode: "qr-code", datalist: "data-list", datagrid: "data-grid",
  emptystate: "empty-state", codeblock: "code-block", codeeditor: "code-editor",
  hovercard: "hover-card", buttongroup: "button-group", togglegroup: "toggle-group",
  iconbutton: "icon-button", contextmenu: "context-menu", fileinput: "file-input",
  numberfield: "number-field", multicombobox: "multi-combobox", inputgroup: "input-group",
  passwordfield: "password-toggle", searchfield: "search-field", treeview: "tree",
  aspectratio: "aspect-ratio", avatargroup: "avatar-group", tableofcontents: "toc",
};
const canon = (k) => SINONIMOS[k] ?? k;


const FONTES = [
  ["base-ui",      "INVENTORY-BASE-UI.json",      "itens",       "rico"],
  ["radix",        "INVENTORY-RADIX.json",        "itens",       "rico"],
  ["mui",          "INVENTORY-MUI.json",          "itens",       "rico"],
  ["untitled-ui",  "INVENTORY-UNTITLED.json",     "itens",       "rico"],
  ["shadcn-ui",    "INVENTORY-SHADCN.json",       "componentes", "medido"],
  ["kibo",         "INVENTORY-KIBO.json",         "componentes", "medido"],
  ["reui",         "INVENTORY-REUI.json",         "componentes", "medido"],
  ["shark-ui",     "INVENTORY-SHARK.json",        "componentes", "medido"],
  ["media-chrome", "INVENTORY-MEDIA-CHROME.json", null,          "medido"],
  // As duas EXTERNAS, que a matriz não via. Elas foram inventariadas em 22/08/2026 e a lista
  // aqui é fixa — então ficaram de fora sem ninguém notar, porque lista fixa não reclama do que
  // falta. Achado ao recalcular a matriz em 26/08: `ls INVENTORY-*.json` traz 17 arquivos e a
  // tabela citava 9.
  ["heroui",       "INVENTORY-HEROUI.json",       "componentes", "medido"],
  ["radix-themes", "INVENTORY-RADIX-THEMES.json", "componentes", "medido"],
];

// CONTROLE DA TABELA: todo INVENTORY-*.json de CÓDIGO tem de estar acima. Os de DOCUMENTAÇÃO
// (INVENTORY-DOCS-*.json) NÃO entram — eles medem outra coisa (páginas, seções, prosa), e cruzar
// naturezas diferentes é a armadilha do §15, que já fez esta matriz concluir "inferior em 59 de
// 59". Eles anotam capacidade em `22-INVENTARIO-DOCS.md`; a matriz compara código com código.
{
  const declarados = new Set(FONTES.map(([, arq]) => arq));
  const noDisco = fs.readdirSync(AQUI)
    .filter((f) => /^INVENTORY-(?!DOCS-).+\.json$/.test(f));
  const esquecidos = noDisco.filter((f) => !declarados.has(f));
  if (esquecidos.length) {
    throw new Error(`a matriz ignora ${esquecidos.length} inventário(s) de código: ` +
      `${esquecidos.join(", ")}\n  A lista FONTES é fixa e não reclama do que falta — por isso ` +
      `este controle existe. Acrescente à tabela, ou explique aqui por que a fonte não entra.`);
  }
}

const fontes = {};
for (const [nome, arq, campo, esquema] of FONTES) {
  const caminho = path.join(AQUI, arq);
  if (!fs.existsSync(caminho)) { fontes[nome] = {esquema, itens: null}; continue; }
  const d = ler(caminho);
  const bruto = campo ? d[campo] : (d.itens ?? d.componentes ?? []);
  const itens = new Map();
  for (const it of (Array.isArray(bruto) ? bruto : Object.values(bruto ?? {})))
    itens.set(canon(CHAVE(it.NOME ?? it.nome ?? "")), it);
  fontes[nome] = {esquema, itens};
}


// ── o lado da Aurea ───────────────────────────────────────────────────────────
const regDir = path.join(RAIZ, "packages/contracts/registry");
const aurea = new Map();
for (const f of fs.readdirSync(regDir).filter((f) => f.endsWith(".json"))) {
  const ficha = ler(path.join(regDir, f));
  aurea.set(canon(CHAVE(ficha.name)), ficha);
}
for (const [de, para] of [["range", "slider"], ["dropdown-menu", "menu"]])
  if (aurea.has(de) && !aurea.has(para)) aurea.set(para, aurea.get(de));


const norm = (s) => String(s).toLowerCase().replace(/^\[|\]$/g, "")
  .replace(/^data-/, "").replace(/=.*$/, "").replace(/["']/g, "").trim();
// `data-*` que NÃO é estado: anatomia e eixo. Conferido no fonte da shadcn e da shark, um a
// um, em 22/08/2026 — os cinco primeiros aparecem em quase todo componente das duas.
const NAO_E_ESTADO = new Set(["slot", "variant", "size", "side", "placement", "orientation",
  "align", "position", "state", "sidebar", "collapsible", "layout", "radius", "color"]);
const TECLA = /^(arrow(up|down|left|right)|home|end|enter|space|escape|esc|tab|page(up|down)|delete|backspace|[a-z0-9])$/i;

const V = {COBRE: "AUREA_COBRE", INFERIOR: "AUREA_INFERIOR", SO_AUREA: "SO_AUREA",
  LEITURA: "REQUER_LEITURA", INCONCLUSIVO: "INCONCLUSIVO", NA: "N/A"};

const linhas = [];
for (const l of crossref.linhas.filter((x) => x.estado === "A_COMPARAR")) {
  const ficha = aurea.get(l.capacidade);
  const meus = ficha ? eixosAurea(ficha) : {eixos: {}, naoMapeados: []};

  // ── EIXOS: veredito por TIPO, e por cardinalidade dentro do tipo ────────────
  const delasPorTipo = {};      // tipo -> {fonte: [valores]}
  const naoMapeadosDelas = {};
  // Proveniência da ORIENTAÇÃO: qual interface da referência declara a prop. `todasProps` do
  // inventário da base-ui é o achatamento das props de TODAS as peças, então `orientation` de um
  // `SelectSeparator` virava orientação do `Select` — e a matriz reportava que ela faltava à
  // Aurea. Medido em 27/08/2026: quatro de treze eram sub-peça. A proveniência não decide o
  // veredito; ela deixa a leitura decidir sem reabrir o fonte da referência.
  const orientacaoDeclaradaEm = {};
  for (const f of l.refs) {
    const src = fontes[f]; const it = src?.itens?.get(l.capacidade);
    if (!it) continue;
    const {eixos, naoMapeados} = eixosDe(it, src.esquema);
    if (naoMapeados.length) naoMapeadosDelas[f] = naoMapeados;
    for (const [t, v] of Object.entries(eixos)) (delasPorTipo[t] ??= {})[f] = v;
    if (Array.isArray(it.ORIENTACAO_DECLARADA_EM) && it.ORIENTACAO_DECLARADA_EM.length)
      orientacaoDeclaradaEm[f] = it.ORIENTACAO_DECLARADA_EM;
  }
  const tipos = [...new Set([...Object.keys(delasPorTipo), ...Object.keys(meus.eixos)])].sort();
  const eixos = {};
  for (const t of tipos) {
    const porFonte = delasPorTipo[t] ?? {};
    const maxDelas = Math.max(0, ...Object.values(porFonte).map((v) => new Set(v).size));
    const meu = [...new Set(meus.eixos[t] ?? [])];
    // O veredito só é AUTOMÁTICO quando a Aurea não tem o eixo INTEIRO — aí não há vocabulário
    // a interpretar, a dimensão não existe. Tendo os dois, a contagem NÃO decide, e isto foi
    // medido: a shadcn declara 8 "tamanhos" de botão porque conta `icon`, `icon-sm`, `icon-lg` e
    // `icon-xs`, que na Aurea são um COMPONENTE à parte (`IconButton`) vezes os 5 degraus — 8 > 5
    // diria "inferior" sobre um sistema que tem mais. A mui declara 7 "cores" contando `inherit`,
    // que não é tom nenhum. Diferença de um ou dois valores é ruído de nomenclatura, não gap.
    eixos[t] = {
      veredito: !Object.keys(porFonte).length ? (meu.length ? V.SO_AUREA : V.NA)
        : !meu.length ? V.INFERIOR                       // o eixo INTEIRO falta: isto é medível
        : V.LEITURA,                                     // os dois têm: contar token não decide
      aureaTem: meu.length, referenciaMaior: maxDelas,
      aurea: meu.sort(), porFonte,
      _regra: "INFERIOR só quando a Aurea não tem o eixo. Tendo, a contagem é evidência: " +
        "`contained` ≡ `solid`, e `icon-sm` da shadcn é o IconButton da Aurea, não um tamanho.",
      ...(t === "orientacao" && Object.keys(orientacaoDeclaradaEm).length
        ? {declaradaEm: orientacaoDeclaradaEm,
           _proveniencia: "a interface da referência que declara a prop. Se for `*SeparatorProps` " +
             "ou `*ScrollbarProps`, a orientação é da SUB-PEÇA e não do componente — quatro de " +
             "treze itens da base-ui são esse caso."}
        : {}),
    };
  }

  // ── ESTADOS: só as fontes medidas, onde o valor é o literal do data-* ───────
  const estadosDelas = {}, prosa = [], semValor = [];
  const emitidosDelas = new Set();
  for (const f of l.refs) {
    const src = fontes[f]; const it = src?.itens?.get(l.capacidade);
    if (!it) continue;
    if (src.esquema === "medido") {
      // `estadosData` colhe TODO `data-*` do fonte, e a maioria não é estado: `data-slot` marca
      // anatomia, `data-variant`/`data-size`/`data-side` são os EIXOS. Sem este filtro a linha
      // do `Card` reportava que faltavam os "estados" `slot` e `variant` — medido em 22/08/2026,
      // e era a razão de `estados` acusar em 40 das 59 capacidades.
      const v = (it.estadosData ?? []).map(norm).filter((x) => x && !NAO_E_ESTADO.has(x));
      if (v.length) estadosDelas[f] = [...new Set(v)].sort();
      for (const e of (it.estadosEmitidos ?? []).map(norm)) emitidosDelas.add(e);
      // `data-state` sem valor medido não diz QUAL estado: é inconclusivo, não um estado a menos.
      if ((it.estadosData ?? []).map(norm).includes("state")) semValor.push(f);
    } else if (it.ESTADOS && it.ESTADOS !== "N/A") prosa.push(f);
  }
  const uniaoEstados = [...new Set(Object.values(estadosDelas).flat())].sort();
  const meusEstados = [...new Set((ficha?.states ?? []).map(norm))].sort();
  const faltamEstados = uniaoEstados.filter((s) => !meusEstados.includes(s));
  // PROVENIÊNCIA, que é o que o extrator compartilhado passou a permitir dizer: das que faltam,
  // quais a referência de fato EMITE, e quais ela só REAGE. `data-nested` do dialog da shark só
  // aparece em variante — quem emite é o `vaul` embaixo. Contado como "eles têm e a Aurea não",
  // vira um gap que não existe. Não decide o veredito: informa a leitura da célula.
  const soReagidos = faltamEstados.filter((e) => !emitidosDelas.has(e));
  const estados = {
    veredito: !uniaoEstados.length ? (prosa.length ? V.LEITURA : V.INCONCLUSIVO)
      : faltamEstados.length ? V.INFERIOR : V.COBRE,
    aurea: meusEstados, porFonte: estadosDelas, soNasReferencias: faltamEstados,
    dasQueFaltamSoReagidas: soReagidos,
    prosaNaoComparavel: prosa, dataStateSemValorMedido: semValor,
    _regra: "só `estadosData` das fontes medidas: ali o valor é o literal do data-*. A prosa das " +
      "fontes ricas fica de fora e está listada em `prosaNaoComparavel`.",
    _proveniencia: "`dasQueFaltamSoReagidas` são as que NENHUMA referência emite — as classes " +
      "delas reagem, mas quem põe o atributo é o motor embaixo (Ark UI, react-aria, vaul). " +
      "Evidência mais fraca que emitir, e a leitura da célula precisa saber a diferença.",
  };

  // ── TECLADO: veredito só quando a fonte lista TECLAS ────────────────────────
  const teclasDelas = {}, teclaProsa = [];
  // Proveniência do TECLADO, e ela inverte o sentido de células inteiras. A radix trata `Enter`
  // no checkbox e no radio para BLOQUEÁ-LA (`preventDefault`, como a WAI-ARIA manda) — o campo
  // antigo lia isso como suporte, e a matriz reportava que faltava à Aurea uma tecla que a
  // referência PROÍBE. `soCitada` é o outro lado: tecla que aparece no arquivo sem comparação,
  // quase sempre porque a referência delega a outro pacote. Ver `teclas.mjs`.
  const suprimidasDelas = new Set(), soCitadasDelas = new Set();
  for (const f of l.refs) {
    const src = fontes[f]; const it = src?.itens?.get(l.capacidade);
    if (!it) continue;
    for (const k of (it.TECLADO_SUPRIMIDO ?? [])) suprimidasDelas.add(norm(k));
    for (const k of (it.TECLADO_SO_CITADA ?? [])) soCitadasDelas.add(norm(k));
    const bruto = src.esquema === "medido" ? it.teclas : it.TECLADO;
    const arr = Array.isArray(bruto) ? bruto : (bruto && bruto !== "N/A" ? [bruto] : []);
    const teclas = arr.map(String).map(norm).filter((k) => TECLA.test(k));
    if (teclas.length) teclasDelas[f] = [...new Set(teclas)].sort();
    else if (arr.length) teclaProsa.push(f);
  }
  const uniaoTeclas = [...new Set(Object.values(teclasDelas).flat())].sort();
  const minhasTeclas = [...new Set((ficha?.a11y?.keyboard ?? []).map(norm))].sort();
  const faltamTeclas = uniaoTeclas.filter((k) => !minhasTeclas.includes(k));
  const teclado = {
    veredito: !uniaoTeclas.length ? (teclaProsa.length ? V.LEITURA : V.INCONCLUSIVO)
      : faltamTeclas.length ? V.INFERIOR : V.COBRE,
    aurea: minhasTeclas, porFonte: teclasDelas, soNasReferencias: faltamTeclas,
    dasQueFaltamSuprimidasNaReferencia: faltamTeclas.filter((k) => suprimidasDelas.has(k)),
    dasQueFaltamSoCitadas: faltamTeclas.filter((k) => soCitadasDelas.has(k)),
    _proveniencia: "`suprimidasNaReferencia` são teclas que a referência trata para BLOQUEAR — " +
      "contá-las como falta inverte o sentido. `soCitadas` aparecem no arquivo sem comparação, " +
      "quase sempre porque a referência delega o teclado a outro pacote.",
    prosaNaoComparavel: teclaProsa,
  };

  // ── ARIA: NUNCA veredito, sempre evidência ─────────────────────────────────
  const ariaDelas = {}, ariaRuido = {};
  for (const f of l.refs) {
    const src = fontes[f]; const it = src?.itens?.get(l.capacidade);
    if (!it) continue;
    // `ARIA` das fontes ricas alterna entre objeto `{papeis, atributos}`, lista e a string
    // "N/A" — três formatos no mesmo campo. Ler sem checar o formato estourou aqui em
    // 22/08/2026; o extrator erra para menos, e este é o menos.
    const lst = (x) => Array.isArray(x) ? x.map(String) : [];
    const b = src.esquema === "medido" ? lst(it.ariaEmitidos)
      : [...lst(it.ARIA?.papeis).map((p) => `role:${p}`), ...lst(it.ARIA?.atributos)];
    // UMA RÉGUA SÓ. Sete extratores mediam ARIA de sete jeitos, e quatro guardavam o nome SEM o
    // prefixo: `label` da shadcn e `aria-label` da radix são o MESMO atributo, e a matriz os
    // comparava como vocabulários diferentes. `normalizarLista` põe os dois na forma `aria-*`,
    // separa os papéis (que o lado medido da Aurea guarda como `role:x` na mesma lista) e manda
    // o que não é ARIA para `naoReconhecidos` — foi assim que `react-aria-components`, o nome do
    // pacote da heroui, aparecia como o atributo `aria-components` em 12 células.
    const norm2 = normalizarLista(b);
    const v = [...norm2.atributos, ...norm2.papeis.map((p) => `role:${p}`)];
    if (v.length) ariaDelas[f] = v.sort();
    for (const x of norm2.naoReconhecidos) (ariaRuido[f] ??= []).push(x);
  }
  const aria = {
    veredito: V.LEITURA,
    aureaMedida: (() => {
      const n = normalizarLista(ariaMedida[ficha?.name]?.aria ?? []);
      const v = [...n.atributos, ...n.papeis.map((p) => `role:${p}`)].sort();
      return v.length ? v : null;
    })(),
    porFonte: ariaDelas,
    ruidoDoExtrator: Object.keys(ariaRuido).length ? ariaRuido : undefined,
    _porQueNuncaVeredito: "a Aurea usa elemento NATIVO onde dá (<button>, <input type=checkbox>), " +
      "e semântica implícita não aparece como atributo. Lista vazia aqui pode ser a plataforma " +
      "fazendo o trabalho — que é a escolha melhor — ou falta. Só o olho separa.",
  };

  // ── ANATOMIA: evidência ────────────────────────────────────────────────────
  const anatomiaDelas = {};
  for (const f of l.refs) {
    const src = fontes[f]; const it = src?.itens?.get(l.capacidade);
    if (!it) continue;
    const b = src.esquema === "medido" ? it.subcomponentes : it.SUBCOMPONENTES;
    const v = (Array.isArray(b) ? b : []).map(String);
    if (v.length) anatomiaDelas[f] = [...new Set(v)].sort();
  }
  const anatomia = {veredito: V.LEITURA, porFonte: anatomiaDelas,
    _porQueNuncaVeredito: "nome de parte interna é vocabulário de projeto: `startIcon` da mui e " +
      "`leadingIcon` da Aurea são a mesma peça, e comparar strings faria disso um gap."};

  const todos = {...eixos, estados, teclado, aria, anatomia};

  // ── MESCLA do estado de leitura. O veredito de máquina fica intocado ao lado ─
  // As duas camadas convivem de propósito: `veredito` é o que a máquina mede, `estado` é o que
  // uma pessoa leu. Sobrescrever um com o outro apagaria a evidência que a leitura precisa ler.
  const contaEstado = {};
  for (const [eixo, cel] of Object.entries(todos)) {
    const chave = `${l.capacidade}·${eixo}`;
    chavesVistas.add(chave);
    const mao = estadoMao[chave];
    cel.estado = mao?.estado ?? "PENDING";
    cel._estadoOrigem = mao ? "MATRIX-ESTADO.json" : "derivado (ninguém leu ainda)";
    if (mao) {
      cel.estadoPorque = mao.porque;
      cel.estadoEm = mao.em;
      // A evidência pode se mover POR BAIXO de uma decisão já tomada: fonte nova na tabela,
      // extrator corrigido, ficha da Aurea alterada. Quando isso acontece, a leitura foi feita
      // contra outro dado — e continuar exibindo o estado como se nada tivesse mudado seria
      // exatamente o silêncio que o §9 proíbe.
      if (mao.veredictoNaEpoca && mao.veredictoNaEpoca !== cel.veredito) {
        cel._estadoDesatualizado = `lido contra o veredito \`${mao.veredictoNaEpoca}\`; ` +
          `hoje a máquina diz \`${cel.veredito}\` — a evidência mudou sob a decisão, releia`;
        desatualizadas.push(`${chave}: ${mao.veredictoNaEpoca} → ${cel.veredito}`);
      }
    }
    contaEstado[cel.estado] = (contaEstado[cel.estado] ?? 0) + 1;
  }

  const inferiores = Object.entries(todos).filter(([, v]) => v.veredito === V.INFERIOR).map(([k]) => k);
  linhas.push({
    capacidade: l.capacidade, fichaAurea: ficha?.name ?? null,
    refs: l.refs, quantasRefs: l.quantasRefs,
    veredito: inferiores.length ? V.INFERIOR
      : Object.values(todos).some((v) => v.veredito === V.COBRE) ? V.COBRE : V.LEITURA,
    eixosInferiores: inferiores,
    celulasPorEstado: contaEstado,
    celulasPendentes: contaEstado.PENDING ?? 0,
    propsNaoMapeadasNasReferencias: naoMapeadosDelas,
    propsNaoMapeadasNaAurea: meus.naoMapeados,
    comparacao: todos,
  });
}

linhas.sort((a, b) => b.eixosInferiores.length - a.eixosInferiores.length
  || b.quantasRefs - a.quantasRefs || a.capacidade.localeCompare(b.capacidade));

const conta = (v) => linhas.filter((l) => l.veredito === v).length;

// ── CONTROLE DAS ÓRFÃS ────────────────────────────────────────────────────────
// Uma célula com estado escrito à mão cuja capacidade/eixo a matriz não produz mais. Acontece
// quando uma capacidade sai do CROSSREF, quando o mapa de apelidos de eixo muda, ou quando a
// chave foi digitada errada. Silêncio aqui é o pior caso possível: a leitura foi feita, o
// arquivo ainda a mostra, e a matriz não a usa. Ela SAI no JSON, sai no console, e o check 29
// do validate.py reprova.
const orfas = Object.keys(estadoMao).filter((k) => !chavesVistas.has(k)).sort();

const totalCelulas = linhas.reduce((n, l) => n + Object.keys(l.comparacao).length, 0);
const porEstado = {};
for (const l of linhas) for (const c of Object.values(l.comparacao))
  porEstado[c.estado] = (porEstado[c.estado] ?? 0) + 1;
const out = {
  _gerado: "node audit/activity-2/matrix.mjs",
  _oQueEIsto: "A matriz do §13: capacidade contra capacidade. Emite VEREDITO só onde os dois " +
    "lados falam a mesma língua (eixos por tipo e cardinalidade; estados como literal de data-*; " +
    "teclado quando há teclas). O resto é `REQUER_LEITURA` com a evidência das nove referências " +
    "alinhada ao lado — para que a comparação humana não precise reabrir nove inventários.",
  _oQueNaoE: "Não é veredito sobre semântica, e não é sobre TOKENS. `contained` da mui e `solid` " +
    "da Aurea são o mesmo eixo com outro nome; contar token faria disso um gap. A primeira " +
    "versão deste arquivo fazia exatamente isso e concluiu que a Aurea era inferior em 59 de 59 " +
    "— o cabeçalho do fonte registra por quê.",
  _duasCamadas: "Cada célula carrega DUAS coisas: `veredito`, que a máquina recalcula do zero a " +
    "cada execução, e `estado`, que é a LEITURA HUMANA e vem de MATRIX-ESTADO.json. Uma não " +
    "deriva da outra — duas células que a máquina mediu como `AUREA_INFERIOR` foram desmentidas " +
    "pela leitura. Por isso o derivado é sempre `PENDING`: o veredito é a evidência de entrada.",
  totais: {
    capacidadesComparadas: linhas.length,
    aureaInferiorEmAlgumEixo: conta(V.INFERIOR),
    semInferioridadeMedida: conta(V.COBRE),
    soRequerLeitura: conta(V.LEITURA),
  },
  leitura: {
    celulas: totalCelulas,
    porEstado,
    lidas: totalCelulas - (porEstado.PENDING ?? 0),
    pendentes: porEstado.PENDING ?? 0,
    estadoDesatualizado: desatualizadas,
    orfas,
    _orfa: "célula com estado à mão que a matriz não produz mais — chave errada, capacidade " +
      "removida ou eixo renomeado. O check 29 do validate.py reprova enquanto houver uma.",
  },
  linhas,
};
fs.writeFileSync(SAIDA, JSON.stringify(out, null, 2) + "\n");

// O PLACAR DA LEITURA É GERADO, e é assim porque a alternativa falhou por escrito. O
// `25-LEITURA-COMPLETA.md` trazia a tabela de estados à mão, e o commit que fechou o `G-A11Y-11`
// mudou uma célula sem mexer no documento: o placar publicado passou a dizer 128/44 enquanto o
// arquivo dizia 129/43. Ninguém notou até a próxima leitura conferir.
//
// É exatamente o que o CLAUDE.md proíbe — "nunca escrever contagem à mão em nenhum doc" —, e a
// razão de o `STATE.md` já ser gerado. Aqui vale a mesma regra: quem conta é quem tem os dados.
// O check 31 do validate.py reprova se o bloco estiver velho.
const DOC = path.join(FIXTURE ?? AQUI, "25-LEITURA-COMPLETA.md");
export const ABRE = "<!-- PLACAR:INICIO — gerado por matrix.mjs; não editar à mão -->";
export const FECHA = "<!-- PLACAR:FIM -->";
const LEGENDA = {
  EQUIVALENT: "a capacidade está servida — muitas vezes por outra decomposição",
  "N/A": "a comparação não se aplica, e cada uma diz por quê",
  AUREA_INFERIOR: "falta medida, e cada uma tem cartão",
  INCONCLUSIVE: "lida, e o que falta MEDIR está escrito",
  AUREA_SUPERA: "a Aurea entrega mais, com o argumento e não com a contagem",
  PENDING: "ninguém leu ainda",
  IN_REVIEW: "alguém está lendo agora",
  CONFIRMED: "lida, e o veredito de máquina se confirmou",
};
export function placar(porEstado, total) {
  const linhas = Object.entries(porEstado).sort((a, b) => b[1] - a[1])
    .map(([e, n]) => `| \`${e}\` | **${n}** | ${LEGENDA[e] ?? ""} |`);
  return [ABRE, "", `**${total} de ${total} células** têm estado, razão e data.`, "",
    "| estado | células | |", "|---|---:|---|", ...linhas, "", FECHA].join("\n");
}
if (fs.existsSync(DOC)) {
  const doc = fs.readFileSync(DOC, "utf8");
  const i = doc.indexOf(ABRE), j = doc.indexOf(FECHA);
  if (i >= 0 && j > i) {
    const novo = doc.slice(0, i) + placar(porEstado, totalCelulas) + doc.slice(j + FECHA.length);
    if (novo !== doc) { fs.writeFileSync(DOC, novo); console.log("placar do 25-LEITURA regerado"); }
  }
}

console.log("MATRIZ DO §13:");
console.log(`  ${out.totais.capacidadesComparadas} capacidades comparadas`);
console.log(`  ${out.totais.aureaInferiorEmAlgumEixo} com inferioridade MEDIDA em pelo menos um eixo`);
console.log(`  ${out.totais.semInferioridadeMedida} sem inferioridade medida`);
console.log(`  ${out.totais.soRequerLeitura} sem eixo comparável — só leitura\n`);
console.log("as inferioridades medidas, uma a uma:");
for (const l of linhas.filter((x) => x.eixosInferiores.length)) {
  console.log(`  ${l.capacidade.padEnd(18)} ${l.eixosInferiores.join(", ")}`);
}

console.log("\nLEITURA (MATRIX-ESTADO.json — sobrevive a cada execução):");
console.log(`  ${out.leitura.lidas} de ${out.leitura.celulas} células lidas · ` +
  `${out.leitura.pendentes} pendentes`);
for (const [e, n] of Object.entries(porEstado).sort((a, b) => b[1] - a[1]))
  console.log(`    ${String(n).padStart(4)}  ${e}`);
if (desatualizadas.length) {
  console.log(`\n  ⚠ ${desatualizadas.length} leitura(s) com a evidência mudada por baixo:`);
  for (const d of desatualizadas) console.log(`      ${d}`);
}
if (orfas.length) {
  console.log(`\n  ⚠ ${orfas.length} célula(s) ÓRFÃ(S) em MATRIX-ESTADO.json — estado escrito ` +
    `à mão para célula que a matriz não produz mais:`);
  for (const o of orfas) console.log(`      ${o}`);
  console.log("      (o check 29 do validate.py reprova enquanto houver uma)");
  process.exitCode = 1;
}
