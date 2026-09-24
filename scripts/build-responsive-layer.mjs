// GERA a camada responsiva do core (G-AXIS-04) dentro de `packages/core/src/aurea.css`,
// entre marcadores. Roda antes do build-core.
//
// POR QUE GERADA, e não escrita à mão. A camada é passos × pontos × famílias: 5 × 13 × N. Com
// UMA família ela já tinha 65 corpos de regra; acrescentar a família de campo levaria cada corpo
// a carregar mais três variáveis, em 65 lugares. Escrever isso à mão é garantir que a próxima
// família não seja acrescentada — e o Victor foi explícito: *"não quero 47 adaptações manuais
// independentes"*. A tabela abaixo é a fonte única; o CSS é consequência dela.
//
// O DEFEITO QUE ELA CORRIGE, e que só apareceu ao aplicar à segunda família: `--step-px` carregava
// o padding do BOTÃO (15px no md) e o campo usa 13px. A primeira versão da camada tratava a escala
// como universal, e não é — altura e corpo de texto são compartilhados, padding não. Cada família
// que tiver medida própria ganha variável própria AQUI, num lugar só.
//
// Rodar:  node scripts/build-responsive-layer.mjs   (o build já chama)
import {readFileSync, writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ALVO = join(root, "packages/core/src/aurea.css");
const INI = "/* >>> camada responsiva — GERADA por scripts/build-responsive-layer.mjs <<< */";
const FIM = "/* <<< fim da camada responsiva >>> */";

// ── A TABELA. Os valores são os que as classes de tamanho JÁ produziam, um a um: mudar aqui muda
// o desenho, e a suíte de geometria e as baselines de pixel cobram isso.
//
// TRÊS ESCALAS, e não uma. Medido em 22/08/2026 antes de generalizar (`18-G-AXIS-04-FAMILIAS.md`):
//   controle  `--control-h-*`  varia com densidade   botão, campo, marcação, identidade
//   glifo     `--icon-*`       NÃO varia             Icon, Spinner
//   QR        rem cru          NÃO varia             QRCode, sozinho
// A família de MARCAÇÃO e a de IDENTIDADE saem da MESMA grandeza do botão — o que muda é a razão
// aplicada a ela, e a razão mora no componente, não aqui. Por isso elas não ganham variável nova:
// leem `--step-h`. A de GLIFO ganha, porque `--icon-*` é outra escala.
//
// `null` = este degrau não tem valor para esta variável, e a variável não é emitida. A escala de
// glifo começa em `sm` (não existe `--icon-xs`) e a de QR só tem três degraus: emitir um valor
// inventado ali seria desenhar por simetria, que é exatamente o que esta atividade proíbe.
const PASSOS = {
  //        altura              corpo             gap    botão   campo            select (fim)          glifo         QR        avatar (corpo)
  xs: {h: "--control-h-xs", fs: "--text-xs",   gap: "6px",  px: "10px", fpx: "var(--space-3)", spe: "var(--space-8)", icon: null,      qr: null,      avfs: null},
  sm: {h: "--control-h-sm", fs: "--text-sm",   gap: "8px",  px: "12px", fpx: "var(--space-3)", spe: "var(--space-8)", icon: "--icon-sm", qr: "7.5rem",  avfs: "var(--text-xs)"},
  md: {h: "--control-h-md", fs: "--text-sm",   gap: "8px",  px: "15px", fpx: "13px",           spe: "38px",           icon: "--icon-md", qr: "10rem",   avfs: null},
  lg: {h: "--control-h-lg", fs: "--text-base", gap: "8px",  px: "20px", fpx: "var(--space-4)", spe: "calc(var(--space-10) + var(--space-1))", icon: "--icon-lg", qr: "15rem", avfs: null},
  xl: {h: "--control-h-xl", fs: "--text-base", gap: "10px", px: "26px", fpx: "var(--space-4)", spe: "calc(var(--space-10) + var(--space-1))", icon: "--icon-xl", qr: null,    avfs: null},
};

// TODA variável de passo é REGISTRADA como não-herdável. Sem isto, `.size-lg` num botão desce
// para o `<svg class="icon">` de dentro dele — e são 327 páginas do catálogo com um ícone dentro
// de um botão (medido, não estimado). `syntax:"*"` é o que permite continuar usando o fallback
// de `var()`: propriedade registrada com sintaxe tipada exige `initial-value`, e aí o fallback
// NUNCA dispara, o que quebraria todo o core. Provado nos três motores em `.prova`.
const VARIAVEIS = ["--step-h", "--step-fs", "--step-gap", "--step-px", "--step-field-px",
                   "--step-select-pe", "--step-icon", "--step-qr", "--step-avatar-fs"];

// ── A TABELA DOS EIXOS CUJA UNIDADE É REGRA. Chamava-se ORIENTACAO até 22/08/2026, quando o
// `align` do InputGroupAddon entrou pela mesma porta e o nome passou a mentir: o que reúne
// estas entradas não é o eixo, é a NATUREZA do passo — regra, e não medida.
//
// Outro eixo, e — medido — outra natureza que a do `size`: um passo de `size` é um
// conjunto de MEDIDAS, e por isso cabe numa variável; um passo de `orientation` é um conjunto de
// REGRAS, e elas não são uniformes. Cinco dos oito colapsam em `flex-direction:column`, mas o
// Separator troca a grandeza do risco, o Range troca `writing-mode`, e o Tabs e o Field trocam o
// `display` inteiro para `grid`. Quatro alcançam DESCENDENTES.
//
// POR QUE REGRA POR PONTO, e não variável como no `size`. A conta em bytes CRUS dizia variável
// (+2,0% contra +13,2%). A conta em bytes GZIPADOS — que é o que o consumidor baixa — diz que a
// diferença inteira entre os dois desenhos é de **838 bytes**: +1.020 B contra +182 B. Doze
// cópias quase idênticas da mesma regra é o melhor caso que existe para o gzip. E 838 bytes na
// rede não pagam 14 regras reescritas e ~20 variáveis novas, com a superfície de regressão que
// vem junto. Medição inteira em `audit/activity-2/19-ORIENTACAO-CUSTO.md`.
//
// Consequência boa: **nenhuma regra existente muda**. Estes corpos são os que já estão no core,
// palavra por palavra — o gerador só os re-emite sob seletor prefixado. Mudou aqui sem mudar lá,
// os dois discordam e a regressão é visual; o controle no fim deste arquivo reprova isso.
//
// TRÊS E NÃO OITO, e o recorte é medido. `orientation` existe em oito componentes, mas em quatro
// deles ela carrega SEMÂNTICA DE TECLADO: o `aria-orientation` decide que par de setas move o
// foco. Medido no banco de prova em 22/08/2026, no Tabs horizontal:
//
//     ArrowRight  Um → Dois    MOVEU        ArrowDown  Um → Um   parado
//     ArrowLeft   Um → Três    MOVEU        ArrowUp    Um → Um   parado
//
// O motor HONRA o que é anunciado. Uma lista de abas que o CSS desenha em coluna continuaria
// anunciando `horizontal`, e Baixo/Cima continuariam mortos — a API anunciando uma coisa e
// entregando outra, que é exatamente o que o Victor chamou de dívida de infraestrutura. CSS não
// muda atributo, e sincronizar por JavaScript seria observar largura, que a decisão do G-AXIS-04
// proíbe quando o CSS resolve — e aqui ele NÃO resolve.
//
// A regra que ficou, aplicada uniformemente: **o eixo responsivo de orientação só é oferecido
// onde a orientação ANUNCIADA não pode divergir da visual** — ou porque o componente não anuncia
// nenhuma (`ButtonGroup` é `role="group"` sem `aria-orientation`; `Field` é um `<label>`), ou
// porque quem a anuncia é o próprio CSS (`Range`: `writing-mode` no `<input type=range>` nativo,
// provado nos três motores no G-AXIS-03).
//
// Ficam de fora, com o motivo registrado no cartão `G-AXIS-06`: Tabs, Menubar, Toolbar e
// ToggleGroup (roving focus) e Separator (anuncia `aria-orientation` e não pode acompanhar).
// Quando houver como sincronizar a semântica, cada um é UMA LINHA nesta tabela — a camada, o
// controle e o gate já cobrem a forma.
// O valor BASE de cada um. Tem de casar com o 3º argumento de `peleDoEixo` no componente React —
// é o mesmo fato dito nos dois lugares, e o teste unitário do degrau base cobra o lado de lá.
// O valor BASE de cada um. Tem de casar com o 3º argumento de `peleDoEixo` no componente React.
// `input-group-addon` não tem base: as QUATRO faixas têm regra estática própria, e o componente
// sempre emite classe — então nenhum corpo aqui é reconstrução, e todos são conferíveis.
const EIXO_REGRA_BASE = {"btn-group": "horizontal", "range": "horizontal", "field": "vertical"};

const EIXO_REGRA = {
  "btn-group": {vertical:   "flex-direction:column; align-items:stretch;",
                horizontal: "flex-direction:row; align-items:center;"},
  "range":     {vertical:   "writing-mode:vertical-rl; direction:rtl; inline-size:var(--range-vertical-size,10rem); width:auto;",
                horizontal: "writing-mode:horizontal-tb; direction:inherit; inline-size:auto; width:100%;"},
  "field":     {horizontal: "display:grid; grid-template-columns:minmax(0,var(--field-label-width,12rem)) minmax(0,1fr); align-items:center; column-gap:var(--space-4); row-gap:var(--space-1);",
                vertical:   "display:flex; flex-direction:column; gap:7px;"},
  // O ADORNO DE CAMPO — só a GEOMETRIA. O `align` antigo achatava duas dimensões independentes
  // (ordem lógica + geometria) e virou dois eixos em 22/08/2026: `side` é ESTRUTURAL e decide a
  // posição no DOM, então não entra aqui; `layout` é geometria e é o que responde a espaço.
  // Ver a ADR-0048 e o `G-A11Y-06`.
  "input-group-addon": {
    "inline": "inline-size:auto; justify-content:normal;",
    "block":  "inline-size:100%; justify-content:flex-start;"},
};

// E os DESCENDENTES. O seletor deles é `.<base>-<valor> <filho>`, e não `.<base>-<valor>`.
const EIXO_REGRA_FILHOS = {
  // O adorno tem recuo diferente por LADO, e o lado é uma classe estática — então a regra é
  // COMPOSTA (`&`), não descendente: `.ct-sm\\:…-inline.…-start`. Sem isso, a camada responsiva
  // repõe a geometria e perde o recuo, que é o tipo de meia-correção que passa despercebida.
  "input-group-addon": {
    "inline": [["&.input-group-addon-start", "padding-inline:var(--space-3);"],
               ["&.input-group-addon-end", "padding-inline-end:var(--space-1);"]],
    "block":  [["&.input-group-addon-start", "padding:var(--space-2) var(--space-3) 0;"],
               ["&.input-group-addon-end", "padding:0 var(--space-3) var(--space-2);"]]},
  "field": {horizontal: [[">.label", "grid-column:1; flex-direction:column; align-items:flex-start; justify-content:center; gap:var(--space-05);"],
                         [">*:not(.label)", "grid-column:2;"]],
            // A VOLTA precisa desfazer o que a ida fez no filho. `grid-column` num item de flex é
            // ignorado, então só o desenho do rótulo tem de voltar ao de `.label`.
            vertical:   [[">.label", "flex-direction:row; align-items:stretch; justify-content:space-between; gap:12px;"]]},
};

// O VALOR BASE PRECISA DE CORPO PRÓPRIO, e descobrir isso custou um teste vermelho nos três
// motores. A camada emitia regra só para o valor NÃO-base, o que deixava a orientação viajar num
// sentido só: um `ButtonGroup` horizontal virava coluna no estreito, mas um declarado
// `base:"vertical"` nunca voltava a linha no largo.
//
// E o sentido que faltava é o PRINCIPAL. `@media`/`@container` são `min-width`: o desenho natural
// é mobile-first — empilhado por padrão, enfileirado quando sobra espaço. Sem corpo para o valor
// base, justamente esse não funcionava.
//
// O corpo do valor base NÃO é cópia de uma regra estática: ele RECONSTRÓI o que a regra de base
// do componente faz no eixo (`.btn-group` nem declara `flex-direction`, porque `row` é o inicial).
// Por isso o controle de texto do fim deste arquivo confere só os corpos não-base, e a volta é
// provada onde importa: no navegador, comparando o computado do responsivo com o do estático.

// Um corpo de orientação, para um ponto: a regra do componente mais as dos descendentes dele.
const eixoCorpo = (prefixo, ponto) => Object.entries(EIXO_REGRA).flatMap(([base, valores]) =>
  Object.entries(valores).map(([valor, decls]) => {
    const sel = `.${prefixo}-${ponto}\\:${base}-${valor}`;
    // três formas: `&x` compõe na MESMA classe, `>x` é filho direto, o resto é descendente
    const filhos = (EIXO_REGRA_FILHOS[base]?.[valor] ?? []).map(([f, d]) =>
      f.startsWith("&") ? ` ${sel}${f.slice(1)} { ${d} }`
      : ` ${sel}${f.startsWith(">") ? "" : " "}${f} { ${d} }`).join("");
    return (decls ? `${sel} { ${decls} }` : "") + filhos;
  })).join(" ");

// Os pontos saem da ESCALA DE TOKENS, não de uma lista escrita aqui: uma escala só para os dois
// mensuráveis é o que impede `md` de significar duas coisas, e ler dos tokens é o que garante que
// ela continue sendo uma só. `@media`/`@container` não leem `var()`, daí o literal.
const tokens = readFileSync(join(root, "packages/tokens/dist/aurea.tokens.css"), "utf8");
const ESCALA = Object.fromEntries([...tokens.matchAll(/--breakpoint-([a-z0-9]+):(\d+)px/g)]
  .map((m) => [m[1], Number(m[2])]));
const ORDEM = Object.entries(ESCALA).sort((a, b) => a[1] - b[1]);
// O container consulta um SUBCONJUNTO: contêiner de 1280px é raro o bastante para não valer
// regra, e ponto que ninguém usa é peso morto na folha. Cresce por medição, não por simetria.
const ATE_CONTAINER = 1024;

const corpo = (p) => {
  const v = PASSOS[p];
  const pares = [
    ["--step-h", `var(${v.h})`], ["--step-fs", `var(${v.fs})`], ["--step-gap", v.gap],
    ["--step-px", v.px], ["--step-field-px", v.fpx], ["--step-select-pe", v.spe],
    ["--step-icon", v.icon && `var(${v.icon})`], ["--step-qr", v.qr], ["--step-avatar-fs", v.avfs],
  ];
  return pares.filter(([, valor]) => valor).map(([nome, valor]) => `${nome}:${valor}`).join(";");
};
const bloco = (prefixo, ponto) => Object.keys(PASSOS)
  .map((p) => `.${prefixo}-${ponto}\\:size-${p}{${corpo(p)}}`).join(" ");

const linhas = [
  "/* As variáveis de passo NÃO HERDAM. Ver o comentário de VARIAVEIS no gerador: um ícone dentro",
  "   de um botão responsivo herdaria o passo do botão e mudaria de tamanho sozinho. */",
  ...VARIAVEIS.map((n) => `@property ${n} { syntax:\"*\"; inherits:false; }`),
  "",
  "/* o passo de escala, genérico: qualquer peça que leia `--step-*` obedece. `md` também tem",
  "   classe, porque um responsivo precisa poder dizer `md` como valor base. */",
  ...Object.keys(PASSOS).map((p) => `.size-${p} { ${corpo(p)}; }`),
  "",
  "/* CONTÊINER NOMEADO. Sem nome, `@container` casa com o ancestral mais próximo que for contêiner",
  "   — inclusive um que outra pessoa declarou por outro motivo. `inline-size` e não `size`:",
  "   consultar o eixo de bloco exige altura contida, que quase nenhum layout de página tem. */",
  ".container-scope { container:aurea / inline-size; }",
  "",
  "/* por VIEWPORT — a decisão depende do tamanho da APLICAÇÃO */",
  ...ORDEM.map(([n, px]) => `@media (min-width:${px}px) { ${bloco("vp", n)} ${eixoCorpo("vp", n)} }`),
  "",
  "/* por CONTAINER — o componente responde ao ESPAÇO EM QUE FOI COLOCADO */",
  ...ORDEM.filter(([, px]) => px <= ATE_CONTAINER)
    .map(([n, px]) => `@container aurea (min-width:${px}px) { ${bloco("ct", n)} ${eixoCorpo("ct", n)} }`),
];

// ── A ESCALA, TAMBÉM PARA O TYPESCRIPT ────────────────────────────────────────────────────────
// O `G-AXIS-06` trouxe um resolvedor de runtime (`matchMedia` e `ResizeObserver`), e com ele a
// ameaça de o mesmo número existir em quatro lugares: no CSS, no tipo, no `matchMedia` e na
// comparação de largura do observer. O Victor foi explícito — UMA fonte de verdade, e nada de
// `if (width >= 768)` espalhado.
//
// Então a mesma leitura dos tokens que gera a camada gera também o módulo que o resolvedor
// importa. Arquivo GERADO: editar à mão é o defeito que ele existe para não repetir, e o check
// do validate.py reprova a divergência.
//
// `.tsx` sem JSX pela mesma razão do `pure.tsx`: os checks 11, 19 e 26 varrem `src/*.tsx`, e um
// `.ts` aqui seria um arquivo que gate nenhum enxerga.
const ESCALA_TS = join(root, "packages/react/src/escala.tsx");
const nomes = ORDEM.map(([n]) => n);
const nomesContainer = ORDEM.filter(([, px]) => px <= ATE_CONTAINER).map(([n]) => n);
const uniao = (ns) => ns.map((n) => `"${n}"`).join("|");
writeFileSync(ESCALA_TS, `// GERADO por scripts/build-responsive-layer.mjs — não editar à mão.
//
// A escala canônica, lida de \`packages/tokens/dist/aurea.tokens.css\`. É a MESMA leitura que
// gera as \`@media\`/\`@container\` do core, e é por isso que o resolvedor de runtime e o CSS
// não podem discordar: não há dois números, há um.
//
// Sem \`"use client"\`: é dado, e um componente de servidor precisa dos tipos.

/** Os pontos da escala, em pixels. UMA escala para os dois mensuráveis — o prefixo da classe
 *  (\`vp-\` / \`ct-\`) é que diz de quê são os pixels. */
export const ESCALA={${ORDEM.map(([n, px]) => `"${n}":${px}`).join(",")}} as const;

/** O subconjunto que o CONTAINER consulta. Contêiner de 1280px é raro o bastante para não valer
 *  regra, e ponto que ninguém usa é peso morto na folha. Cresce por medição. */
export const ESCALA_CONTAINER={${ORDEM.filter(([, px]) => px <= ATE_CONTAINER).map(([n, px]) => `"${n}":${px}`).join(",")}} as const;

export type Breakpoint=${uniao(nomes)};
export type ContainerBreakpoint=${uniao(nomesContainer)};

/** Os pontos do maior para o menor. A resolução percorre nesta ordem e para no primeiro que
 *  couber, que é a semântica de \`min-width\`: o último ponto atingido vence. */
export const PONTOS_DESC:ReadonlyArray<Breakpoint>=[${[...ORDEM].reverse().map(([n]) => `"${n}"`).join(",")}];
export const PONTOS_CONTAINER_DESC:ReadonlyArray<ContainerBreakpoint>=[${[...ORDEM.filter(([, px]) => px <= ATE_CONTAINER)].reverse().map(([n]) => `"${n}"`).join(",")}];
`, "utf8");

const src = readFileSync(ALVO, "utf8");

// ── O CONTROLE. A tabela de orientação COPIA os corpos que já estão no core, e cópia que ninguém
// confronta é divergência esperando acontecer: alguém ajusta a regra estática, a camada continua
// com a antiga, e o mesmo componente desenha diferente conforme o valor seja simples ou
// responsivo. O gerador FALHA se as duas discordarem — antes de escrever, não depois de alguém
// notar na tela.
//
// O `.field-horizontal>.label` do core é `.field-horizontal>.label`, e o da camada é
// `.<prefixo>:field-horizontal>.label`: o que se compara é o CORPO, normalizado por espaço.
const norm = (t) => t.replace(/\s+/g, " ").trim().replace(/;$/, "");
const estatico = (sel) => {
  const i = src.indexOf(INI);
  const antes = src.slice(0, i);                       // só o core escrito à mão
  const m = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([^}]*)\\}").exec(antes);
  return m ? norm(m[1]) : null;
};
const divergencias = [];
for (const [base, valores] of Object.entries(EIXO_REGRA)) {
  for (const [valor, decls] of Object.entries(valores)) {
    // o Toolbar ainda casa por atributo no core; a classe é a que este build passa a produzir
    // O corpo do valor BASE reconstrói o desenho de partida em vez de copiar uma regra: não há
    // `.btn-group-horizontal` no core, porque horizontal é o que `.btn-group` já faz. Conferir
    // texto aqui não teria contra o que conferir; quem prova a volta é o teste de navegador, que
    // compara o computado do responsivo com o do estático.
    if (valor === EIXO_REGRA_BASE[base]) continue;
    // Corpo VAZIO = este valor não tem geometria própria; ele existe para marcar o estado e para
    // as regras compostas se pendurarem. Não há regra estática correspondente, e cobrar uma
    // faria o gerador exigir CSS oco só para ter o que conferir.
    if (!decls) continue;
    const sel = `.${base}-${valor}`;
    const core = estatico(sel);
    if (core === null) { divergencias.push(`${sel}: não achei a regra estática no core`); continue; }
    if (core !== norm(decls)) divergencias.push(`${sel}:\n    core:   ${core}\n    tabela: ${norm(decls)}`);
    for (const [filho, d] of EIXO_REGRA_FILHOS[base]?.[valor] ?? []) {
      const fsel = filho.startsWith("&") ? `${sel}${filho.slice(1)}`
        : `${sel}${filho.startsWith(">") ? "" : " "}${filho}`;
      const fcore = estatico(fsel);
      if (fcore === null) { divergencias.push(`${fsel}: não achei a regra estática no core`); continue; }
      if (fcore !== norm(d)) divergencias.push(`${fsel}:\n    core:   ${fcore}\n    tabela: ${norm(d)}`);
    }
  }
}
if (divergencias.length) {
  throw new Error("a tabela de EIXO_REGRA discorda do core — os dois desenham diferente:\n  " +
    divergencias.join("\n  ") + "\n\nCorrija a tabela em scripts/build-responsive-layer.mjs, " +
    "ou a regra em packages/core/src/aurea.css. Os dois têm de dizer a mesma coisa.");
}
const i = src.indexOf(INI), j = src.indexOf(FIM);
if (i < 0 || j < 0) throw new Error(`marcadores da camada responsiva não achados em ${ALVO}`);
const novo = src.slice(0, i + INI.length) + "\n" + linhas.join("\n") + "\n" + src.slice(j);
if (novo !== src) writeFileSync(ALVO, novo);
const regrasDeEixo = Object.values(EIXO_REGRA).reduce((n, v) => n + Object.keys(v).length, 0);
console.log(`build-responsive-layer: ${Object.keys(PASSOS).length} passos e ${regrasDeEixo} regras ` +
  `de eixo × ${ORDEM.length} pontos de viewport + ` +
  `${ORDEM.filter(([, p]) => p <= ATE_CONTAINER).length} de container`);
