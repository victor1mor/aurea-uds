// Inventário do §9 — `base-ui`, o motor que a Aurea já usa.
//
// O §9 pede, para CADA item, cerca de trinta e oito campos: anatomia, subcomponentes, variantes,
// estados, props, eventos, composição, controlado/não-controlado, teclado, foco, ARIA, touch,
// motion, RTL, i18n, theming, tokens, dependências, licença, proveniência. E é explícito sobre
// lacuna: campo que não se aplica é `N/A`, campo que não deu para determinar é `INCONCLUSIVO`,
// **nunca em branco**.
//
// Por que extrair em vez de transcrever: são 47 primitives. Transcrever à mão seria copiar mil e
// oitocentos campos, e a primeira coisa a acontecer seria amostragem — que o §10 proíbe. A fonte
// é regular o bastante para ser lida:
//
//   anatomia/subcomponentes   `index.parts.ts`, que é a lista oficial de peças
//   estados                   148 arquivos `*DataAttributes.ts`, cada um um enum COM JSDOC
//   props / eventos           `export interface <X>Props`
//   controlado/não            os pares `value`/`defaultValue`, `open`/`defaultOpen`, …
//   ARIA                      `role:` e `aria-*` literais no fonte da peça
//   teclado                   literais de tecla NA peça, mais a quem ela delega
//
// O que o extrator NÃO decide, e por isso sai como `INCONCLUSIVO` ou vazio para leitura humana:
// se a peça serve à Aurea, o que dela entra, e o que fica de fora. Isso é o passo 3 do
// BUILDING.md e não se automatiza.
//
// Rodar:  node audit/activity-2/inventory-baseui.mjs
// Escreve: audit/activity-2/INVENTORY-BASE-UI.json

import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "../..");
const BASE = path.join(ROOT, "Referencia/base-ui-master/base-ui-master");
const SRC = path.join(BASE, "packages/react/src");
const DOCS = path.join(BASE, "docs/src/app/(docs)/react/components");

if (!fs.existsSync(SRC)) {
  console.error(`Referencia/base-ui-master ausente. Ver audit/activity-2/02-FONTES.md.`);
  process.exit(1);
}

const NA = "N/A";
const INC = "INCONCLUSIVO";

const dirs = (p) => fs.existsSync(p)
  ? fs.readdirSync(p, {withFileTypes: true}).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];

/** Todo arquivo .ts/.tsx sob `p`, sem teste nem spec — teste não é superfície pública. */
function fontes(p) {
  const out = [];
  const anda = (d) => {
    for (const e of fs.readdirSync(d, {withFileTypes: true})) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) anda(full);
      else if (/\.tsx?$/.test(e.name) && !/\.(test|spec)\./.test(e.name)) out.push(full);
    }
  };
  anda(p);
  return out;
}

const ler = (f) => fs.readFileSync(f, "utf8");
const unico = (a) => [...new Set(a)].sort();

/** `{ nome, atributo, descrição }` de cada membro de um enum de data-attributes.
 *
 *  Duas formas de membro, e ignorar a segunda estragava a primeira: além de
 *  `open = 'data-open'`, a base-ui reaproveita enums entre peças com
 *  `open = CommonPopupDataAttributes.open`. A regex só casava a forma literal, então o JSDoc de
 *  cada membro reaproveitado ficava órfão e era engolido pela descrição do membro SEGUINTE — o
 *  `data-uncentered` do Select saía com a descrição de quatro estados grudada. */
function estadosDe(texto, arquivo) {
  const out = [];
  const re = /(?:\/\*\*([\s\S]*?)\*\/\s*)?([A-Za-z_$][\w$]*)\s*=\s*(?:'([^']+)'|([A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*))\s*,/g;
  let m;
  while ((m = re.exec(texto))) {
    const doc = (m[1] ?? "")
      .split("\n").map((l) => l.replace(/^\s*\*?\s?/, "").trim())
      .filter((l) => l && !l.startsWith("@")).join(" ").trim();
    const atributo = m[3] ?? ENUMS.get(m[4]) ?? `(herda de ${m[4]}, não resolvido)`;
    out.push({nome: m[2], atributo, herdadoDe: m[4] ?? NA,
              descricao: doc || INC, declaradoEm: arquivo});
  }
  return out;
}

const TECLAS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Escape", "Home",
  "End", "PageUp", "PageDown", "Tab", "Backspace", "Delete", "Space"];

// A primeira versão contava literal de tecla dentro da pasta do primitive e deu 13 de 47 — número
// que não bate com quem já usou um Select ou um Menu da base-ui. A causa não era o extrator estar
// errado: é ARQUITETURA DELA. O contrato de teclado não mora no componente, mora em internals
// compartilhados, e cada primitive DELEGA. Isso é o §184 na prática ("o que torna esta biblioteca
// forte?") e é lição direta para a Aurea, cujo §22 diz a mesma coisa: mecanismo repetido vira
// primitive, não cópia. Então o campo TECLADO passa a registrar as duas coisas — o que a peça
// trata e a quem ela delega.
const DELEGACOES = {
  useListNavigation: "navegação por seta (floating-ui-react/useListNavigation)",
  useTypeahead: "digitar-para-achar (floating-ui-react/useTypeahead)",
  useDismiss: "fechar por Escape e clique fora (floating-ui-react/useDismiss)",
  useFocusTrap: "prisão de foco",
  CompositeRoot: "roving tabindex (internals/composite)",
  CompositeItem: "roving tabindex (internals/composite)",
  useRovingTabindex: "roving tabindex",
  useButton: "ativação por Enter e Espaço (internals/useButton)",
};

const PARES_CONTROLE = [["value", "defaultValue"], ["open", "defaultOpen"],
  ["checked", "defaultChecked"], ["pressed", "defaultPressed"], ["selected", "defaultSelected"],
  ["expanded", "defaultExpanded"]];

// Os enums comuns (`CommonPopupDataAttributes`, `TransitionStatusDataAttributes`) moram em
// arquivos compartilhados e são reaproveitados por dezenas de peças. Sem resolvê-los, metade dos
// estados sairia como "(herda de X.y)" — verdadeiro e inútil, porque o nome do atributo é
// exatamente o que quem escreve CSS precisa saber.
const ENUMS = new Map();   // "Enum.membro" -> "data-alguma-coisa"
{
  const todos = [];
  const anda = (d) => {
    for (const e of fs.readdirSync(d, {withFileTypes: true})) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) anda(full);
      else if (/\.ts$/.test(e.name) && !/\.(test|spec)\./.test(e.name)) todos.push(full);
    }
  };
  anda(SRC);
  const referencias = new Map();   // "Enum.membro" -> "OutroEnum.membro"
  for (const f of todos) {
    const t = ler(f);
    for (const bloco of t.matchAll(/export\s+enum\s+(\w+)\s*\{([\s\S]*?)\n\}/g)) {
      for (const membro of bloco[2].matchAll(/([A-Za-z_$][\w$]*)\s*=\s*(?:'([^']+)'|([A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*))/g)) {
        const chave = `${bloco[1]}.${membro[1]}`;
        if (membro[2]) ENUMS.set(chave, membro[2]);
        else referencias.set(chave, membro[3]);
      }
    }
  }
  // Um enum comum pode apontar para outro (`CommonPopupDataAttributes.startingStyle` é
  // `TransitionStatusDataAttributes.startingStyle`). Resolve a cadeia até parar de render.
  for (let volta = 0; volta < 5; volta++) {
    let mudou = false;
    for (const [de, para] of referencias) {
      if (ENUMS.has(de)) continue;
      const alvo = ENUMS.get(para);
      if (alvo) { ENUMS.set(de, alvo); mudou = true; }
    }
    if (!mudou) break;
  }
}

const registros = [];

for (const nome of dirs(SRC)) {
  const dir = path.join(SRC, nome);
  const arquivos = fontes(dir);
  if (!arquivos.length) continue;

  const todoTexto = arquivos.map(ler).join("\n");
  const rel = (f) => path.relative(SRC, f);

  // ── anatomia / subcomponentes ────────────────────────────────────────────
  const partsFile = path.join(dir, "index.parts.ts");
  let partes = [];
  let formaExport = INC;
  if (fs.existsSync(partsFile)) {
    partes = [...ler(partsFile).matchAll(/export\s*\{\s*\w+\s+as\s+(\w+)\s*\}/g)].map((m) => m[1]);
    formaExport = "namespace (index.parts.ts)";
  } else {
    const idx = path.join(dir, "index.ts");
    if (fs.existsSync(idx)) {
      const t = ler(idx);
      const diretos = [...t.matchAll(/export\s*\{\s*([A-Z]\w*)\s*\}/g)].map((m) => m[1]);
      if (diretos.length) { partes = diretos; formaExport = "export direto (index.ts)"; }
      else if (/export \* as/.test(t)) formaExport = "namespace";
    }
  }

  // ── estados, do enum de data-attributes ──────────────────────────────────
  const estados = [];
  for (const f of arquivos.filter((f) => /DataAttributes\.ts$/.test(f))) {
    estados.push(...estadosDe(ler(f), rel(f)));
  }

  // ── props e eventos, das interfaces ──────────────────────────────────────
  const props = {};
  for (const f of arquivos) {
    const t = ler(f);
    for (const m of t.matchAll(/export\s+interface\s+(\w*Props)(?:<[^>]*>)?[^{]*\{/g)) {
      const abre = t.indexOf("{", m.index + m[0].length - 1);
      let d = 0, fim = t.length;
      for (let j = abre; j < t.length; j++) {
        if (t[j] === "{") d++;
        else if (t[j] === "}") { d--; if (!d) { fim = j; break; } }
      }
      const corpo = t.slice(abre + 1, fim);
      const nomes = unico([...corpo.matchAll(/^\s*(?:readonly\s+)?([a-zA-Z_$][\w$]*)\??\s*:/gm)].map((x) => x[1]));
      if (nomes.length) props[m[1]] = nomes;
    }
  }
  const todasProps = unico(Object.values(props).flat());
  const eventos = todasProps.filter((p) => /^on[A-Z]/.test(p));

  // ── controlado / não-controlado ──────────────────────────────────────────
  const controle = PARES_CONTROLE
    .filter(([c, u]) => todasProps.includes(c) && todasProps.includes(u))
    .map(([c, u]) => `${c} / ${u}`);

  // ── ARIA, teclado, foco, ponteiro, movimento, direção ────────────────────
  const papeis = unico([...todoTexto.matchAll(/role:\s*'([a-z]+)'/g)].map((m) => m[1]));
  const arias = unico([...todoTexto.matchAll(/'(aria-[a-z]+)'/g)].map((m) => m[1]));
  const teclas = TECLAS.filter((k) => todoTexto.includes(`'${k}'`))
    .concat(/key === ' '|=== ' '/.test(todoTexto) ? ["Space"] : []);
  const delegado = Object.entries(DELEGACOES)
    .filter(([sim]) => new RegExp(`\\b${sim}\\b`).test(todoTexto)).map(([, desc]) => desc);
  const foco = unico([
    /focus\(\)/.test(todoTexto) && "move o foco",
    /FocusGuard|focusGuard/.test(todoTexto) && "guardas de foco",
    /restoreFocus|returnFocus/.test(todoTexto) && "devolve o foco",
    /tabIndex/.test(todoTexto) && "controla tabIndex (roving)",
  ].filter(Boolean));
  const ponteiro = unico([...todoTexto.matchAll(/on(Pointer\w+|Touch\w+|Mouse\w+)/g)].map((m) => m[1]));
  const movimento = unico([
    /useAnimationsFinished|transitionStatus|data-starting-style|data-ending-style/.test(todoTexto) && "ciclo de entrada/saída observado",
    /@keyframes|animation/.test(todoTexto) && "animação",
  ].filter(Boolean));
  const direcao = /useDirection|DirectionProvider|'rtl'/.test(todoTexto) ? "lê a direção do documento" : NA;
  const locale = /toLocaleString|Intl\.|locale/.test(todoTexto) ? "usa Intl / locale" : NA;

  // ── documentação publicada pelo próprio projeto ──────────────────────────
  const docDir = path.join(DOCS, nome);
  const temDoc = fs.existsSync(path.join(docDir, "page.mdx"));
  const demos = fs.existsSync(path.join(docDir, "demos")) ? dirs(path.join(docDir, "demos")) : [];

  // ── hooks e dependências ─────────────────────────────────────────────────
  const hooks = unico([...todoTexto.matchAll(/export\s+(?:declare\s+)?(?:function|const)\s+(use[A-Z]\w*)/g)].map((m) => m[1]));
  const deps = unico([...todoTexto.matchAll(/from\s+'((?:@floating-ui|@base-ui)[^']*)'/g)].map((m) => m[1]));

  registros.push({
    // §9, na ordem em que a ordem pede. Campo vazio é proibido.
    NOME: nome,
    CATEGORIA: temDoc ? "documentado como componente" : "interno / utilitário do pacote",
    FAMILIA: "base-ui react",
    PRIMITIVE: true,
    COMPONENTE: partes.length > 1 ? "composto" : "peça única",
    SUBCOMPONENTES: partes.length ? partes : NA,
    ANATOMIA: partes.length ? partes.join(" › ") : NA,
    FORMA_DE_EXPORT: formaExport,
    VARIANTES: NA,          // headless: variante é decisão de pele, e a pele é de quem consome
    TAMANHOS: NA,           // idem
    DENSIDADES: NA,         // idem
    ORIENTACOES: todasProps.includes("orientation") ? ["horizontal", "vertical"] : NA,
    // A PROVENIÊNCIA da orientação, e por que ela existe. `todasProps` é o ACHATAMENTO de
    // `props`, que é keyed por interface — então uma prop de SUB-PEÇA vira prop do componente.
    // Medido em 27/08/2026, lendo a célula `select·orientacao`: a base-ui declara `orientation`
    // só em `SelectSeparator`, o traço entre grupos da lista. O Select não tem orientação, e a
    // matriz reportava que ela faltava à Aurea. Idem `combobox` e `autocomplete` (o Separator
    // deles) e `scroll-area` (a Scrollbar) — QUATRO das treze.
    //
    // `ORIENTACOES` continua sendo a união, porque estreitá-la faria o extrator errar para menos
    // quando a raiz não for identificável. O que entra é a proveniência, para a leitura decidir.
    ORIENTACAO_DECLARADA_EM: Object.entries(props)
      .filter(([, ps]) => ps.includes("orientation")).map(([i]) => i).sort(),
    ESTADOS: estados.length ? estados : NA,
    PROPS_RELEVANTES: Object.keys(props).length ? props : NA,
    EVENTOS: eventos.length ? eventos : NA,
    COMPOSICAO: partes.length > 1 ? "peças compostas pelo consumidor" : "peça única",
    // `render` não aparece nas interfaces das peças: vem de `BaseUIComponentProps`, que quase
    // todas estendem. Procurar só a prop declarada dava N/A para o Select inteiro, que é falso.
    SLOTS: (todasProps.includes("render") || /BaseUIComponentProps/.test(todoTexto))
      ? "prop `render` (substitui o elemento renderizado), via BaseUIComponentProps" : NA,
    CONTROLLED_UNCONTROLLED: controle.length ? controle : NA,
    TECLADO: (teclas.length || delegado.length)
      ? {trataDiretamente: teclas.length ? unico(teclas) : NA,
         delegaA: delegado.length ? unico(delegado) : NA}
      : NA,
    FOCO: foco.length ? foco : NA,
    ARIA: {papeis: papeis.length ? papeis : NA, atributos: arias.length ? arias : NA},
    TOUCH: ponteiro.length ? ponteiro : NA,
    RESPONSIVIDADE: NA,     // headless: não desenha, logo não reflui
    MOTION: movimento.length ? movimento : NA,
    RTL: direcao,
    I18N: locale,
    THEMING: NA,            // headless
    TOKENS: NA,             // headless
    EXEMPLOS: demos.length ? demos : NA,
    DEMOS: demos.length,
    BLOCKS_RELACIONADOS: NA,
    PATTERNS_RELACIONADOS: NA,
    TEMPLATES_RELACIONADOS: NA,
    HOOKS: hooks.length ? hooks : NA,
    UTILITIES: NA,
    DEPENDENCIAS: deps.length ? deps : NA,
    LICENCA: "MIT",
    PROVENIENCIA: INC,      // preenchido abaixo, do git
    OBSERVACOES: "",        // leitura humana: o passo 3 do BUILDING.md não se automatiza
    _arquivos: arquivos.length,
  });
}

// proveniência: uma vez, do próprio clone
let commit = INC;
try {
  commit = execFileSync("git", ["-C", BASE, "rev-parse", "--short", "HEAD"], {encoding: "utf8"}).trim();
} catch { /* sem git: fica INCONCLUSIVO, que é o que o §9 manda escrever */ }
for (const r of registros) r.PROVENIENCIA = `mui/base-ui @ ${commit}`;

const comDoc = registros.filter((r) => r.CATEGORIA.startsWith("documentado"));
const out = {
  _gerado: "node audit/activity-2/inventory-baseui.mjs",
  _escopo: "Inventário do §9 da ATIVIDADE-2 para a base-ui. Os campos MECÂNICOS estão completos " +
    "para os 47 primitives, sem amostra. O campo OBSERVACOES é leitura humana e nasce vazio: " +
    "'o que dela entra na Aurea' é o passo 3 do BUILDING.md e não se automatiza.",
  _naoLacuna: "§9: campo que não se aplica sai como N/A, campo indeterminado como INCONCLUSIVO. " +
    "Nenhum campo sai em branco, exceto OBSERVACOES, que é o espaço reservado à leitura.",
  proveniencia: `mui/base-ui @ ${commit}`,
  licenca: "MIT",
  totais: {
    primitives: registros.length,
    documentadosPeloProjeto: comDoc.length,
    internos: registros.length - comDoc.length,
    estadosDeclarados: registros.reduce((s, r) => s + (Array.isArray(r.ESTADOS) ? r.ESTADOS.length : 0), 0),
    comAnatomiaComposta: registros.filter((r) => r.COMPONENTE === "composto").length,
    comParControlado: registros.filter((r) => r.CONTROLLED_UNCONTROLLED !== NA).length,
    comContratoDeTeclado: registros.filter((r) => r.TECLADO !== NA).length,
    tecladoSomenteDelegado: registros.filter((r) => r.TECLADO !== NA && r.TECLADO.trataDiretamente === NA).length,
    demosPublicadas: registros.reduce((s, r) => s + r.DEMOS, 0),
  },
  itens: registros,
};

fs.writeFileSync(path.join(import.meta.dirname, "INVENTORY-BASE-UI.json"), JSON.stringify(out, null, 2) + "\n");
const t = out.totais;
console.log(`inventory-baseui: ${t.primitives} primitives (${t.documentadosPeloProjeto} documentados, ` +
  `${t.internos} internos) · ${t.estadosDeclarados} estados declarados · ` +
  `${t.comAnatomiaComposta} de anatomia composta · ${t.comParControlado} com par controlado/não · ` +
  `${t.comContratoDeTeclado} com contrato de teclado (${t.tecladoSomenteDelegado} só por delegação) · ` +
  `${t.demosPublicadas} demos`);
