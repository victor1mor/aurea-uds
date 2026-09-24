// A VARREDURA das props elegíveis a eixo responsivo — G-AXIS-04, a etapa depois da prova.
//
// O Victor foi explícito sobre a fonte: *"não quero limitar isso aos 47 casos da Radix: a Radix é
// evidência da necessidade, não teto da Aurea."* Então a varredura sai da NOSSA superfície
// publicada (`api-surface.json`, derivada da emissão do compilador), não da lista dela.
//
// O CRITÉRIO, e ele é o que impede isto de virar opinião: uma prop é elegível quando o seu valor é
// uma escolha de APRESENTAÇÃO que uma quantidade diferente de espaço poderia razoavelmente mudar.
// Não é elegível quando é:
//   • SEMÂNTICA — `tone`, `variant`, `kind`: o significado não muda porque a caixa encolheu.
//   • ESTRUTURA DE DOCUMENTO — `titleAs`: nível de cabeçalho é hierarquia, não espaço.
//   • EIXO GLOBAL DA APLICAÇÃO — `theme`, `density`, `direction`: já são globais por desenho, e
//     um valor por contêiner os quebraria (dois temas na mesma tela).
//   • POSIÇÃO DE SOBREPOSIÇÃO — `side` de popover/menu/tooltip: o motor JÁ vira sozinho quando
//     falta espaço. Um eixo responsivo aqui competiria com ele.
//
// Rodar:  node scripts/sweep-responsivo.mjs [--json]
import {readFileSync} from "node:fs";

const surface = JSON.parse(readFileSync("packages/contracts/api-surface.json", "utf8"));

// A regra por NOME de prop, com o motivo escrito. Prop que aparecer e não estiver aqui sai como
// `NAO_TRIADA` — nunca some em silêncio, que é a regra do §9 aplicada a este inventário.
const REGRA = {
  size:        ["ELEGIVEL", "escala de apresentação: menos espaço pede degrau menor"],
  orientation: ["ELEGIVEL", "empilhar ou enfileirar é a decisão de espaço mais direta que existe"],
  align:       ["ELEGIVEL", "adorno em linha cabe numa caixa larga e não numa estreita (G-AXIS-01)"],
  variant:     ["SEMANTICA", "o significado não muda porque a caixa encolheu"],
  tone:        ["SEMANTICA", "idem: perigo continua perigo em 320px"],
  appearance:  ["SEMANTICA", "preenchido vs contorno é hierarquia visual, não espaço"],
  kind:        ["SEMANTICA", "vídeo não vira áudio por falta de largura"],
  titleAs:     ["ESTRUTURA", "nível de cabeçalho é hierarquia do documento"],
  theme:       ["GLOBAL", "eixo da aplicação; por contêiner daria dois temas na mesma tela"],
  defaultTheme:["GLOBAL", "idem"],
  density:     ["GLOBAL", "já é um eixo global por desenho"],
  defaultDensity:["GLOBAL", "idem"],
  direction:   ["GLOBAL", "direção do documento, não do contêiner"],
  side:        ["MOTOR", "o posicionador do Base UI já vira sozinho quando falta espaço"],
};


// EXCLUÍDOS POR DECISÃO. `x/y` incompleto tem de dizer se o resto é FILA ou é ESCOLHA — senão a
// próxima sessão reabre o que já foi decidido, e o §9 manda que nada fique numa lacuna silenciosa.
//
// ESTAVA com cinco de `orientation` aqui, por medição: o motor honra o `aria-orientation`, e CSS
// não escreve atributo. O Victor recusou o teto em 22/08/2026 — *"CSS-first é uma estratégia de
// engenharia, não uma religião"* — e autorizou a sincronização semântica. Com o resolvedor de
// runtime da ADR-0047, os cinco voltaram e `orientation` fechou em 8 de 8.
//
// A lista fica, vazia, de propósito: exclusão por decisão precisa continuar tendo lugar, e o
// próximo eixo que esbarrar num limite entra aqui com o motivo medido em vez de sumir.
const EXCLUIDO = {};

const linhas = [];
for (const [, m] of Object.entries(surface.modules)) {
  for (const c of m.components ?? []) {
    for (const p of c.props) {
      if (!p.values || p.values.length < 2) continue;
      const [estado, porque] = REGRA[p.name] ?? ["NAO_TRIADA", "prop nova — triar antes de crescer"];
      linhas.push({componente: c.name, prop: p.name, valores: p.values, estado, porque,
        jaResponsivo: String(p.type).startsWith("Responsive<")});
    }
  }
}

const eleg = linhas.filter((l) => l.estado === "ELEGIVEL");
const feito = eleg.filter((l) => l.jaResponsivo);
const conta = (e) => linhas.filter((l) => l.estado === e).length;

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({
    _gerado: "node scripts/sweep-responsivo.mjs",
    _criterio: "apresentação que o espaço poderia mudar; ver o cabeçalho do script",
    totais: {unioesLiterais: linhas.length, elegiveis: eleg.length,
      jaResponsivas: feito.length, faltam: eleg.length - feito.length,
      naoTriadas: conta("NAO_TRIADA")},
    linhas,
  }, null, 2));
} else {
  console.log(`superfície: ${linhas.length} props de união literal\n`);
  for (const e of ["ELEGIVEL", "SEMANTICA", "ESTRUTURA", "GLOBAL", "MOTOR", "NAO_TRIADA"]) {
    const n = conta(e);
    if (n) console.log(`  ${e.padEnd(11)} ${String(n).padStart(3)}`);
  }
  const naFila = eleg.filter((l) => !l.jaResponsivo && !EXCLUIDO[`${l.prop}.${l.componente}`]).length;
  console.log(`\nELEGÍVEIS — ${feito.length} de ${eleg.length} já aceitam valor responsivo ` +
    `(${naFila} na fila, ${eleg.length - feito.length - naFila} excluídos por decisão):`);
  const porProp = {};
  for (const l of eleg) (porProp[l.prop] ??= []).push(l);
  for (const [prop, ls] of Object.entries(porProp)) {
    const ok = ls.filter((l) => l.jaResponsivo).length;
    console.log(`\n  ${prop} (${ok}/${ls.length}) — ${REGRA[prop][1]}`);
    for (const l of ls.sort((a, b) => a.componente.localeCompare(b.componente))) {
      // `·` é FILA, `✕` é DECISÃO. Sem essa distinção, um `3/8` lido daqui a duas sessões vira
      // cinco tarefas fantasma — e reabrir decisão registrada é o que o CLAUDE.md proíbe.
      const marca = l.jaResponsivo ? "✔" : EXCLUIDO[`${l.prop}.${l.componente}`] ? "✕" : "·";
      console.log(`    ${marca} ${l.componente}`);
    }
  }
  const excluidos = Object.entries(EXCLUIDO);
  if (excluidos.length) {
    console.log("\nEXCLUÍDOS POR DECISÃO — não são fila, e o motivo está medido:");
    for (const [k, porque] of excluidos) console.log(`    ${k.padEnd(24)} ${porque}`);
  }
  if (conta("NAO_TRIADA")) {
    console.log("\nNÃO TRIADAS (prop nova entrou sem decisão):");
    for (const l of linhas.filter((l) => l.estado === "NAO_TRIADA"))
      console.log(`    ${l.componente}.${l.prop}`);
  }
}
