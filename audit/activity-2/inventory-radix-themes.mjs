// INVENTÁRIO DO §9 — Radix Themes, a camada ESTILIZADA.
//
// Por que ela é fonte separada da `radix` que já foi inventariada em [`06`]: aquela é a de
// **primitives** — comportamento, teclado, ARIA, sem aparência nenhuma. Esta é a camada que a
// Radix publica com PELE, e é ela que tem `variant`, `size`, `color` e `radius`. As duas têm o
// mesmo dono e respondem a perguntas diferentes; tratar como uma só perderia exatamente o eixo
// que a Aurea precisa comparar.
//
// MÉTODO: os `*.props.d.ts` do pacote declaram cada eixo com valores, default e `responsive` —
// é declaração, não inferência. Alguns componentes reexportam a definição de um `_internal`
// compartilhado (o `Button` vem de `base-button.props`), então o extrator SEGUE o reexport; sem
// isso o botão sairia sem eixo nenhum, que é o mesmo "extrator erra para menos" que já custou
// quatro voltas nesta auditoria.
//
// Rodar:  node audit/activity-2/inventory-radix-themes.mjs [caminho-do-pacote]
// Escreve: audit/activity-2/INVENTORY-RADIX-THEMES.json

import fs from "node:fs";
import path from "node:path";

const AQUI = import.meta.dirname;
const BASE = process.argv[2] ?? "/tmp/ext2/themes";
const COMP = path.join(BASE, "dist/esm/components");
if (!fs.existsSync(COMP)) {
  console.error(`@radix-ui/themes não está em ${BASE}.\n` +
    `  mkdir -p ${BASE} && cd $(dirname ${BASE}) && npm pack @radix-ui/themes &&\n` +
    `  tar xzf radix-ui-themes-*.tgz -C $(basename ${BASE}) --strip-components=1`);
  process.exit(1);
}
const ler = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return ""; } };

/** Os eixos de um `*.props.d.ts`: nome, valores, default, e se aceita objeto responsivo. */
function eixosDe(dts) {
  const out = {};
  for (const m of dts.matchAll(
    /(\w+):\s*\{\s*type:\s*"enum";[\s\S]*?values:\s*readonly \[([^\]]*)\];([\s\S]*?)\n    \}/g)) {
    const valores = [...m[2].matchAll(/"([^"]+)"/g)].map(x => x[1]);
    if (!valores.length) continue;
    const padrao = /default:\s*"([^"]+)"/.exec(m[3]);
    out[m[1]] = {valores, padrao: padrao ? padrao[1] : null,
      responsivo: /responsive:\s*true/.test(m[3])};
  }
  const booleanos = [...dts.matchAll(/(\w+):\s*\{\s*type:\s*"boolean"/g)].map(x => x[1]);
  return {enums: out, booleanos: [...new Set(booleanos)].sort()};
}

/** Segue o reexport para o `_internal` quando o arquivo do componente só reexporta. */
function dtsDe(nome) {
  const proprio = path.join(COMP, `${nome}.props.d.ts`);
  const src = ler(proprio);
  if (Object.keys(eixosDe(src).enums).length) return {src, de: `${nome}.props`};
  const js = ler(path.join(COMP, `${nome}.props.js`));
  const re = /from"\.\/([^"]+)\.js"/.exec(js) || /from"\.\/([^"]+)\.js"/.exec(src);
  if (!re) return {src, de: `${nome}.props`};
  const alvo = path.join(COMP, `${re[1]}.d.ts`);
  return fs.existsSync(alvo) ? {src: ler(alvo), de: re[1]} : {src, de: `${nome}.props`};
}

const componentes = [];
for (const f of fs.readdirSync(COMP).filter(f => f.endsWith(".props.d.ts")).sort()) {
  const nome = f.replace(".props.d.ts", "");
  const {src, de} = dtsDe(nome);
  const {enums, booleanos} = eixosDe(src);
  componentes.push({
    nome, definicaoEm: de,
    eixos: Object.fromEntries(Object.entries(enums).map(([k, v]) => [k, v.valores])),
    padroes: Object.fromEntries(Object.entries(enums).filter(([, v]) => v.padrao)
      .map(([k, v]) => [k, v.padrao])),
    // `responsive` é capacidade e não enfeite: um eixo responsivo aceita
    // `size={{initial:"1", md:"3"}}`, que é um grau de liberdade que a Aurea não tem em nenhum.
    eixosResponsivos: Object.entries(enums).filter(([, v]) => v.responsivo).map(([k]) => k).sort(),
    booleanos,
  });
}

const todosEixos = [...new Set(componentes.flatMap(c => Object.keys(c.eixos)))].sort();
const responsivos = componentes.filter(c => c.eixosResponsivos.length);
const out = {
  _gerado: "node audit/activity-2/inventory-radix-themes.mjs",
  _oQueE: "A camada ESTILIZADA da Radix — a de primitives já foi inventariada em 06-INVENTARIO-" +
    "RADIX.md e responde outra pergunta. Aquela tem comportamento e nenhuma aparência; esta tem " +
    "variant/size/color/radius. Tratar as duas como uma só perderia o eixo a comparar.",
  _metodo: "Os *.props.d.ts declaram cada eixo com valores, default e `responsive`. O extrator " +
    "SEGUE o reexport para `_internal` quando o componente não define os próprios — sem isso o " +
    "Button sairia sem eixo nenhum.",
  fonte: "Radix Themes", medidoEm: new Date().toISOString().slice(0, 10),
  versao: JSON.parse(ler(path.join(BASE, "package.json"))).version,
  licenca: "MIT",
  totais: {
    componentes: componentes.length,
    comEixo: componentes.filter(c => Object.keys(c.eixos).length).length,
    comEixoResponsivo: responsivos.length,
    nomesDeEixo: todosEixos,
  },
  componentes,
};
fs.writeFileSync(path.join(AQUI, "INVENTORY-RADIX-THEMES.json"), JSON.stringify(out, null, 2) + "\n");

console.log(`Radix Themes ${out.versao} — inventário do §9 (camada estilizada):`);
console.log(`  ${out.totais.componentes} componentes · ${out.totais.comEixo} com eixo declarado`);
console.log(`  ${out.totais.comEixoResponsivo} com pelo menos um eixo RESPONSIVO`);
console.log(`  eixos: ${todosEixos.join(", ")}`);
