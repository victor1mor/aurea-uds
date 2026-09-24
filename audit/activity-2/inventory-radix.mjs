// Inventário do §9 — `radix-ui/primitives`.
//
// Segunda das nove. Vem logo depois da `base-ui` de propósito: são a mesma FAMÍLIA de coisa
// (primitives headless de React), então a comparação entre as duas é direta e responde uma
// pergunta que a Aurea tem de responder — o motor que escolhemos cobre o que a origem cobre?
//
// ATENÇÃO À FIDELIDADE, QUE É MENOR AQUI, E ISSO É UM ACHADO EM SI (§184).
// A `base-ui` declara os próprios estados em 148 enums COM JSDoc por membro; um extrator lê tudo
// sem inferir nada. A `radix` escreve o estado inline no JSX:
//
//     data-state={context.open ? 'open' : 'closed'}
//
// Não há enum, não há documentação por membro, e o valor sai de um ternário. Dá para extrair o
// NOME do atributo e os literais do ternário, e é o que se faz aqui — mas o resultado é inferido,
// não declarado. Onde a `base-ui` entrega uma descrição, a `radix` entrega `INCONCLUSIVO`.
//
// Isso não é crítica: a `radix` é de 2020 e o costume de declarar estado legível por máquina veio
// depois. É informação para a Aurea, que está decidindo agora como declara o dela.
//
// Rodar:  node audit/activity-2/inventory-radix.mjs
// Escreve: audit/activity-2/INVENTORY-RADIX.json

import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {tecladoDe} from "./teclas.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const BASE = path.join(ROOT, "Referencia/radix-primitives-main/radix-primitives-main");
const SRC = path.join(BASE, "packages/react");

if (!fs.existsSync(SRC)) {
  console.error("Referencia/radix-primitives-main ausente. Ver audit/activity-2/02-FONTES.md.");
  process.exit(1);
}

const NA = "N/A";
const INC = "INCONCLUSIVO";
const unico = (a) => [...new Set(a)].sort();
const ler = (f) => fs.readFileSync(f, "utf8");

const dirs = (p) => fs.readdirSync(p, {withFileTypes: true})
  .filter((d) => d.isDirectory() && !d.name.startsWith(".")).map((d) => d.name).sort();

const TECLAS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Escape", "Home",
  "End", "PageUp", "PageDown", "Tab", "Backspace", "Delete"];

const PARES_CONTROLE = [["value", "defaultValue"], ["open", "defaultOpen"],
  ["checked", "defaultChecked"], ["pressed", "defaultPressed"]];

let commit = INC;
try {
  commit = execFileSync("git", ["-C", BASE, "rev-parse", "--short", "HEAD"], {encoding: "utf8"}).trim();
} catch { /* fica INCONCLUSIVO, que é o que o §9 manda escrever */ }

const registros = [];

for (const nome of dirs(SRC)) {
  const dirSrc = path.join(SRC, nome, "src");
  if (!fs.existsSync(dirSrc)) continue;
  const arquivos = fs.readdirSync(dirSrc)
    .filter((f) => /\.tsx?$/.test(f) && !/\.(test|stories)\./.test(f))
    .map((f) => path.join(dirSrc, f));
  if (!arquivos.length) continue;
  const texto = arquivos.map(ler).join("\n");

  // ── anatomia: os apelidos curtos do index.ts (Root, Trigger, Content, …) ──
  // A `radix` exporta cada peça DUAS vezes — `SelectTrigger` e `Trigger`. O apelido curto é o
  // que a documentação dela usa e o que corresponde à peça; o longo é o mesmo objeto.
  const idx = path.join(dirSrc, "index.ts");
  let partes = [];
  if (fs.existsSync(idx)) {
    const t = ler(idx);
    const bloco = /export\s*\{([\s\S]*?)\}/.exec(t)?.[1] ?? "";
    // O prefixo longo é o MESMO objeto do apelido curto — `SelectTrigger` e `Trigger`. Filtrar
    // por `nome` cru não funcionava: `nome` é "select" e o export é "SelectTrigger", então a
    // comparação de prefixo falhava na maiúscula e a anatomia saía com cada peça duas vezes.
    const Pascal = nome.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
    partes = unico(bloco.split(",").map((x) => x.trim().split(/\s+as\s+/).pop().trim())
      .filter((x) => /^[A-Z][A-Za-z]*$/.test(x))
      .filter((x) => x === Pascal || !x.startsWith(Pascal)));
  }

  // ── estados: `data-x` no JSX, e os literais do ternário quando houver ─────
  const estados = [];
  for (const m of texto.matchAll(/data-([a-z][a-z-]*)=\{([^}]*)\}/g)) {
    if (/^radix-/.test(m[1])) continue;                       // marcador interno, não é estado
    const valores = unico([...m[2].matchAll(/'([a-z-]+)'/g)].map((x) => x[1]));
    estados.push({atributo: `data-${m[1]}`, valores: valores.length ? valores : INC,
                  descricao: INC});                            // a radix não documenta por membro
  }
  for (const m of texto.matchAll(/'data-([a-z][a-z-]*)'/g)) {
    if (/^radix-/.test(m[1])) continue;
    estados.push({atributo: `data-${m[1]}`, valores: INC, descricao: INC});
  }
  const estadosUnicos = [];
  const vistos = new Set();
  for (const e of estados) {
    const chave = e.atributo + JSON.stringify(e.valores);
    if (!vistos.has(chave)) { vistos.add(chave); estadosUnicos.push(e); }
  }

  // ── props e eventos ──────────────────────────────────────────────────────
  const props = {};
  for (const m of texto.matchAll(/interface\s+(\w*Props)(?:<[^>]*>)?[^{]*\{([\s\S]*?)\n\}/g)) {
    const nomes = unico([...m[2].matchAll(/^\s*(?:readonly\s+)?([a-zA-Z_$][\w$]*)\??\s*:/gm)].map((x) => x[1]));
    if (nomes.length) props[m[1]] = nomes;
  }
  const todasProps = unico(Object.values(props).flat());

  const papeis = unico([...texto.matchAll(/role=['"]([a-z]+)['"]/g)].map((m) => m[1]));
  const arias = unico([...texto.matchAll(/(aria-[a-z]+)=/g)].map((m) => m[1]));

  const _tec = tecladoDe(texto);

  registros.push({
    NOME: nome,
    CATEGORIA: INC,                 // a radix não classifica por família no código
    FAMILIA: "radix primitives",
    PRIMITIVE: true,
    COMPONENTE: partes.length > 1 ? "composto" : "peça única",
    SUBCOMPONENTES: partes.length ? partes : NA,
    ANATOMIA: partes.length ? partes.join(" › ") : NA,
    VARIANTES: NA,                  // headless
    TAMANHOS: NA,
    DENSIDADES: NA,
    ORIENTACOES: todasProps.includes("orientation") ? ["horizontal", "vertical"] : NA,
    ESTADOS: estadosUnicos.length ? estadosUnicos : NA,
    PROPS_RELEVANTES: Object.keys(props).length ? props : NA,
    EVENTOS: todasProps.filter((p) => /^on[A-Z]/.test(p)).length
      ? todasProps.filter((p) => /^on[A-Z]/.test(p)) : NA,
    COMPOSICAO: partes.length > 1 ? "peças compostas pelo consumidor" : "peça única",
    SLOTS: /asChild/.test(texto) ? "prop `asChild` (funde no filho)" : NA,
    CONTROLLED_UNCONTROLLED: PARES_CONTROLE
      .filter(([c, u]) => todasProps.includes(c) && todasProps.includes(u))
      .map(([c, u]) => `${c} / ${u}`).length
      ? PARES_CONTROLE.filter(([c, u]) => todasProps.includes(c) && todasProps.includes(u))
        .map(([c, u]) => `${c} / ${u}`) : NA,
    // O MESMO extrator para todas as fontes — ver o cabeçalho de `teclas.mjs`. O campo antes
    // media "a string aparece em algum lugar do arquivo", e o pior caso disso não era ruído: a
    // radix trata `Enter` no checkbox e no radio para BLOQUEÁ-LA (`preventDefault`, como manda a
    // WAI-ARIA), e a matriz reportava que faltava à Aurea uma tecla que a referência proíbe.
    // `TECLADO` é a UNIÃO de tratadas e citadas — estreitá-la faria o extrator errar para MENOS,
    // e o menu da radix é a prova: ele DELEGA quase todo o teclado a `RovingFocusGroup` e
    // `useTypeahead`, que moram em outros pacotes, então só `Tab` e `Space` aparecem como
    // comparação no arquivo dele. As outras nove ficam em `TECLADO_SO_CITADA`, e a leitura da
    // célula decide. O que muda é a PROVENIÊNCIA ao lado, nunca a cobertura.
    TECLADO: [..._tec.tratadas, ..._tec.citadas].length
      ? TECLAS.filter((k) => _tec.tratadas.includes(k) || _tec.citadas.includes(k)) : NA,
    TECLADO_SUPRIMIDO: _tec.suprimidas,
    TECLADO_SO_CITADA: _tec.citadas,
    FOCO: unico([
      /focus\(\)/.test(texto) && "move o foco",
      /FocusScope|focusScope/.test(texto) && "escopo de foco",
      /tabIndex/.test(texto) && "controla tabIndex (roving)",
    ].filter(Boolean)),
    ARIA: {papeis: papeis.length ? papeis : NA, atributos: arias.length ? arias : NA},
    TOUCH: unico([...texto.matchAll(/on(Pointer\w+|Touch\w+)/g)].map((m) => m[1])),
    RESPONSIVIDADE: NA,
    MOTION: /data-state/.test(texto) ? "estado exposto para CSS animar" : NA,
    RTL: /dir=|useDirection|'rtl'/.test(texto) ? "lê a direção" : NA,
    I18N: /Intl\.|locale/.test(texto) ? "usa Intl / locale" : NA,
    THEMING: NA,
    TOKENS: NA,
    EXEMPLOS: NA,                   // as stories foram excluídas da leitura
    DEMOS: 0,
    BLOCKS_RELACIONADOS: NA,
    PATTERNS_RELACIONADOS: NA,
    TEMPLATES_RELACIONADOS: NA,
    HOOKS: unico([...texto.matchAll(/export\s+(?:function|const)\s+(use[A-Z]\w*)/g)].map((m) => m[1])),
    UTILITIES: NA,
    DEPENDENCIAS: unico([...texto.matchAll(/from\s+'(@radix-ui\/[^']+)'/g)].map((m) => m[1])),
    LICENCA: "MIT",
    PROVENIENCIA: `radix-ui/primitives @ ${commit}`,
    OBSERVACOES: "",
    _fidelidade: "estados INFERIDOS de JSX inline, não declarados — ver o cabeçalho do extrator",
  });
}

const out = {
  _gerado: "node audit/activity-2/inventory-radix.mjs",
  _fidelidade: "MENOR que a do inventário da base-ui, e de propósito: a radix escreve o estado " +
    "inline no JSX (`data-state={open ? 'open' : 'closed'}`), sem enum e sem documentação por " +
    "membro. O nome do atributo e os literais do ternário são extraíveis; a DESCRIÇÃO não " +
    "existe na fonte, e sai INCONCLUSIVO em vez de inventada.",
  proveniencia: `radix-ui/primitives @ ${commit}`,
  licenca: "MIT",
  totais: {
    primitives: registros.length,
    comAnatomiaComposta: registros.filter((r) => r.COMPONENTE === "composto").length,
    comParControlado: registros.filter((r) => r.CONTROLLED_UNCONTROLLED !== NA).length,
    comContratoDeTeclado: registros.filter((r) => r.TECLADO !== NA).length,
    atributosDeEstadoDistintos: new Set(registros.flatMap((r) =>
      Array.isArray(r.ESTADOS) ? r.ESTADOS.map((e) => e.atributo) : [])).size,
    comAsChild: registros.filter((r) => r.SLOTS !== NA).length,
  },
  itens: registros,
};
fs.writeFileSync(path.join(import.meta.dirname, "INVENTORY-RADIX.json"), JSON.stringify(out, null, 2) + "\n");
const t = out.totais;
console.log(`inventory-radix: ${t.primitives} primitives · ${t.comAnatomiaComposta} de anatomia composta · ` +
  `${t.atributosDeEstadoDistintos} atributos de estado distintos · ${t.comParControlado} com par ` +
  `controlado/não · ${t.comContratoDeTeclado} com teclado no próprio fonte · ${t.comAsChild} com asChild`);
