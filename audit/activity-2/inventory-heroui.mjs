// INVENTÁRIO DO §9 — HeroUI, a primeira das fontes EXTERNAS do §3.
//
// Correção de registro antes de tudo: eu havia escrito nos relatórios que as sete fontes externas
// "exigem rede", como se isso fosse impedimento. Fui conferir em 22/08/2026 e **a rede funciona**
// neste ambiente. O que faltava era fazer, não poder.
//
// MÉTODO, e por que ele não é raspar o site. As nove locais foram medidas no CÓDIGO; medir a
// externa pela prosa da documentação produziria uma coluna que não se compara com as outras — e o
// §15 já ensinou que comparar coisas de naturezas diferentes inventa paridade. Então a HeroUI
// entra pelos pacotes publicados (`npm pack`), que é código, e pelo MESMO tipo de campo.
//
// DOIS pacotes, e isto é o achado do método: `@heroui/react` tem os componentes e `@heroui/styles`
// tem os EIXOS (`tv({variants:{...}})`, tailwind-variants). Medir só o primeiro concluiria que a
// HeroUI não tem variante nenhuma — é a armadilha do "extrator erra para menos" que esta auditoria
// já pagou três vezes. O `@heroui/styles` publica o **fonte TypeScript**, então os eixos saem
// declarados, não inferidos.
//
// Rodar:  node audit/activity-2/inventory-heroui.mjs [caminho-dos-pacotes]
// Escreve: audit/activity-2/INVENTORY-HEROUI.json

import fs from "node:fs";
import path from "node:path";
import {atributosData} from "./data-attrs.mjs";

const AQUI = import.meta.dirname;
const BASE = process.argv[2] ?? "/tmp/ext";
const REACT = path.join(BASE, "react");
const STYLES = path.join(BASE, "styles");

for (const [nome, p] of [["@heroui/react", REACT], ["@heroui/styles", STYLES]]) {
  if (!fs.existsSync(p)) {
    console.error(`${nome} não está em ${p}.\n` +
      `  mkdir -p ${BASE}/react ${BASE}/styles && cd ${BASE} &&\n` +
      `  npm pack @heroui/react && tar xzf heroui-react-*.tgz -C react --strip-components=1 &&\n` +
      `  npm pack @heroui/styles && tar xzf heroui-styles-*.tgz -C styles --strip-components=1\n` +
      `  (os dois tarballs extraem para \`package/\` — extrair os dois no mesmo lugar MISTURA os\n` +
      `   dois pacotes, e foi o que aconteceu na primeira tentativa: o package.json vinha de um e\n` +
      `   os arquivos do outro. Por isso o --strip-components com destino separado.)`);
    process.exit(1);
  }
}

const versao = (p) => JSON.parse(fs.readFileSync(path.join(p, "package.json"), "utf8")).version;
const ler = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return ""; } };
const dirs = (p) => { try { return fs.readdirSync(p, {withFileTypes: true})
  .filter(d => d.isDirectory()).map(d => d.name).sort(); } catch { return []; } };

/** Os eixos declarados no `tv({...})` de um componente. Parser de CHAVES equilibradas e não de
 *  indentação: o `eixosCva` do inventário da shadcn já teve o defeito de depender de recuo e
 *  perdeu as variantes do Alert inteiro. */
function eixosDoTv(src) {
  const i = src.indexOf("variants:");
  if (i < 0) return {eixos: {}, padroes: {}};
  let j = src.indexOf("{", i), prof = 0, fim = j;
  for (; fim < src.length; fim++) {
    if (src[fim] === "{") prof++;
    else if (src[fim] === "}") { prof--; if (prof === 0) break; }
  }
  const bloco = src.slice(j + 1, fim);
  const eixos = {};
  // cada eixo é `nome: { chave: "...", ... }` no primeiro nível do bloco
  let k = 0;
  while (k < bloco.length) {
    const m = /([A-Za-z_$][\w$]*)\s*:\s*\{/g;
    m.lastIndex = k;
    const achou = m.exec(bloco);
    if (!achou) break;
    let p2 = 0, f2 = m.lastIndex - 1;
    for (; f2 < bloco.length; f2++) {
      if (bloco[f2] === "{") p2++;
      else if (bloco[f2] === "}") { p2--; if (p2 === 0) break; }
    }
    const dentro = bloco.slice(m.lastIndex, f2);
    // `^\s*` e não `^`: sem o espaço, o PRIMEIRO valor de cada eixo se perdia, porque ele vem
    // depois da quebra de linha que segue a chave. Medido em 22/08/2026 contra o fonte do botão
    // lido a olho: saíam `size: [md, sm]` sem `lg`, `variant` sem `danger`, e o eixo
    // `isIconOnly` — que só tem um valor — sumia inteiro. Quarta vez nesta auditoria que um
    // extrator erra PARA MENOS; por isso o controle logo abaixo.
    const valores = [...dentro.matchAll(/(?:^\s*|[,{]\s*)"?([A-Za-z0-9_-]+)"?\s*:/g)].map(x => x[1]);
    if (valores.length) eixos[achou[1]] = [...new Set(valores)].sort();
    k = f2 + 1;
  }
  const pad = {};
  const dp = /defaultVariants:\s*\{([^}]*)\}/.exec(src);
  if (dp) for (const m of dp[1].matchAll(/"?([A-Za-z0-9_-]+)"?\s*:\s*"?([A-Za-z0-9_-]+)"?/g))
    pad[m[1]] = m[2];
  return {eixos, padroes: pad};
}

// CONTROLE do parser, contra um arquivo lido a olho. `button.styles.ts` foi aberto e conferido
// linha a linha em 22/08/2026; se o parser discordar dele, ele está errado — e a primeira versão
// discordava. Um extrator sem controle relata o que consegue ler e chama isso de medição.
const CONTROLE = {
  arquivo: "button/button.styles.ts",
  eixos: {
    fullWidth: ["false", "true"],
    isIconOnly: ["true"],
    size: ["lg", "md", "sm"],
    variant: ["danger", "danger-soft", "ghost", "outline", "primary", "secondary", "tertiary"],
  },
};
{
  const {eixos} = eixosDoTv(ler(path.join(STYLES, "src/components", CONTROLE.arquivo)));
  const esperado = JSON.stringify(CONTROLE.eixos);
  const medido = JSON.stringify(Object.fromEntries(
    Object.keys(CONTROLE.eixos).map(k => [k, eixos[k] ?? null])));
  if (medido !== esperado) {
    console.error(`o parser discorda do controle (${CONTROLE.arquivo}):\n  esperado ${esperado}\n  medido   ${medido}`);
    process.exit(1);
  }
}

/** O CSS publicado do componente, em `@heroui/styles/dist/components/<nome>.css`. É onde mora a
 *  metade REAGIDA da HeroUI (`[data-entering=true]`, `[data-hovered]`…): o pacote react traz o
 *  comportamento, o pacote styles traz a reação. Ausente é vazio, não erro — nem todo componente
 *  publica CSS próprio, e isso já está declarado em `temEstilo`. */
function lerCssPublicado(nome) {
  const p = path.join(STYLES, "dist/components", `${nome}.css`);
  return fs.existsSync(p) ? ler(p) : "";
}

const componentes = [];
for (const nome of dirs(path.join(REACT, "dist/components"))) {
  const dirR = path.join(REACT, "dist/components", nome);
  const arquivos = fs.readdirSync(dirR).filter(f => f.endsWith(".js"));
  const js = arquivos.map(f => ler(path.join(dirR, f))).join("\n");
  const dts = fs.readdirSync(dirR).filter(f => f.endsWith(".d.ts"))
    .map(f => ler(path.join(dirR, f))).join("\n");

  // o motor: a HeroUI é construída sobre react-aria-components, e dizer QUAL primitive é o que
  // permite comparar custo de dependência com a aposta da Aurea na Base UI
  const primitives = [...new Set([...js.matchAll(/react-aria-components\/([A-Za-z]+)/g)]
    .map(m => m[1]))].sort();
  const radix = [...new Set([...js.matchAll(/@radix-ui\/react-([a-z-]+)/g)].map(m => m[1]))].sort();

  // os eixos vêm do PACOTE DE ESTILOS, não daqui — ver o cabeçalho
  const estilo = path.join(STYLES, "src/components", nome);
  const arqEstilo = fs.existsSync(estilo)
    ? fs.readdirSync(estilo).filter(f => f.endsWith(".styles.ts")) : [];
  const {eixos, padroes} = eixosDoTv(arqEstilo.map(f => ler(path.join(estilo, f))).join("\n"));

  const exporta = [...new Set([...dts.matchAll(/export\s+(?:declare\s+)?const\s+([A-Z][\w$]*)/g)]
    .map(m => m[1]))].sort();
  const subcomponentes = [...new Set([...dts.matchAll(/\b([A-Z][\w$]*)\s*:\s*\(/g)].map(m => m[1]))].sort();
  // O MESMO extrator das outras quatro fontes medidas — ver o cabeçalho de `data-attrs.mjs`.
  // O regex anterior aqui era `/data-\[?([a-z][a-z-]*)\]?/`, sem exigir `=` nem `]`: casava com
  // qualquer coisa depois de `data-`, inclusive PROSA EM COMENTÁRIO — foi assim que `entering` e
  // `exiting` entraram, de um `// \`Tooltip\` drop \`data-entering\`` no fonte do tooltip.
  //
  // E lê os DOIS pacotes. A HeroUI põe o comportamento em `@heroui/react` e a reação em
  // `@heroui/styles`: `.select__popover[data-entering=true]` mora no CSS, e só no CSS. Medir só o
  // JS perderia toda a metade REAGIDA desta fonte — 0 reagidos contra 42 da shadcn seria um
  // número implausível, e implausível é o sinal de instrumento quebrado.
  const cssDoComponente = arqEstilo.map(f => ler(path.join(estilo, f))).join("\n") +
    "\n" + lerCssPublicado(nome);
  const {emitidos: estadosEmitidos, reagidos: estadosReagidos, todos: estadosData} =
    (() => {
      const a = atributosData(js), b = atributosData(cssDoComponente);
      const u = (x, y) => [...new Set([...x, ...y])].sort();
      return {emitidos: u(a.emitidos, b.emitidos), reagidos: u(a.reagidos, b.reagidos),
              todos: u(a.todos, b.todos)};
    })();
  const ariaEmitidos = [...new Set([...js.matchAll(/"(aria-[a-z]+)"/g)].map(m => m[1]))].sort();

  componentes.push({
    nome, exporta, subcomponentes,
    eixos, padroesDeEixo: padroes,
    variantes: eixos.variant ?? [], tamanhos: eixos.size ?? [],
    // `temEstilo` separado: componente sem arquivo de estilo não é componente sem eixo, é
    // componente cujo eixo mora noutro lugar — e a diferença tem de aparecer no JSON.
    temEstilo: arqEstilo.length > 0,
    primitivesReactAria: primitives, primitivesRadix: radix,
    estadosData, estadosEmitidos, estadosReagidos, ariaEmitidos,
    linhas: js.split("\n").length,
  });
}

const semEstilo = componentes.filter(c => !c.temEstilo).map(c => c.nome);
const out = {
  _gerado: "node audit/activity-2/inventory-heroui.mjs",
  _metodo: "npm pack de @heroui/react e @heroui/styles. Os eixos saem do FONTE TypeScript do " +
    "pacote de estilos (tv({variants})), porque o pacote de componentes não os declara — medir " +
    "só ele concluiria que a HeroUI não tem variante nenhuma.",
  _escopo: "Superfície publicada. Teclado e ARIA vêm de react-aria-components e NÃO estão " +
    "medidos aqui: eles moram no motor, num terceiro pacote, e afirmá-los sem medir seria o " +
    "mesmo erro que a matriz do §13 cometeu na primeira versão.",
  fonte: "HeroUI", medidoEm: new Date().toISOString().slice(0, 10),
  licenca: "Apache-2.0 (LICENSE no pacote @heroui/react)",
  versoes: {"@heroui/react": versao(REACT), "@heroui/styles": versao(STYLES)},
  totais: {
    componentes: componentes.length,
    comEixoDeclarado: componentes.filter(c => Object.keys(c.eixos).length).length,
    semArquivoDeEstilo: semEstilo.length,
    sobreReactAria: componentes.filter(c => c.primitivesReactAria.length).length,
    sobreRadix: componentes.filter(c => c.primitivesRadix.length).length,
    eixosDistintos: [...new Set(componentes.flatMap(c => Object.keys(c.eixos)))].sort(),
  },
  semArquivoDeEstilo: semEstilo,
  componentes,
};
fs.writeFileSync(path.join(AQUI, "INVENTORY-HEROUI.json"), JSON.stringify(out, null, 2) + "\n");

console.log(`HeroUI ${out.versoes["@heroui/react"]} — inventário do §9 (superfície publicada):`);
console.log(`  ${out.totais.componentes} componentes`);
console.log(`  ${out.totais.comEixoDeclarado} com eixo declarado no pacote de estilos`);
console.log(`  ${out.totais.semArquivoDeEstilo} sem arquivo de estilo próprio`);
console.log(`  ${out.totais.sobreReactAria} sobre react-aria-components · ${out.totais.sobreRadix} sobre radix`);
console.log(`  eixos distintos: ${out.totais.eixosDistintos.join(", ")}`);
