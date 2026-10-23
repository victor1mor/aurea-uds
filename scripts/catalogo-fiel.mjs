// O CATÁLOGO FIEL — a trava do bloco 1 (23/10/2026).
//
// O Victor, no site: "que todos os componentes sem exceção, tudo que está no npm, estão mostrando e funcionando no
// site, um catálogo 100% fiel, como vai me provar?". Esta é a prova que se mede, e não a que se promete:
//   1. todo nome que o pacote da web exporta (componente e gancho) tem ficha e página;
//   2. todo valor de variação da ficha (`variants`, `sizes` e cada eixo de `axes`) aparece no CÓDIGO de um exemplo da
//      página do componente — ou é o valor padrão (o exemplo sem a prop já o mostra), ou aparece numa página de padrão
//      (`content/patterns/<Nome>.mjs`) do mesmo componente.
// O terceiro pedaço — todo exemplo acende sem erro — é o `parte-viva.spec.ts`, no navegador.
//
// Medido na 0.42.0, antes dos exemplos novos: 839 valores, 473 sem exemplo, em 70 componentes. O `build-catalog.mjs`
// chama esta função e PARA quando falta alguma coisa; a página `saude.html` mostra os números.
//
// Uso solto: `node scripts/catalogo-fiel.mjs` (imprime o relatório; sai com 1 se falta algo).
import {readdirSync, readFileSync, existsSync} from "node:fs";
import {join, resolve} from "node:path";
import {pathToFileURL} from "node:url";

// A linha-modelo da tabela das rodadas da `saude.html`: o gerador a escreve, e a publicação (`saude-rodadas.mjs`) a copia
// para cada rodada da CI trocando estes textos.
export const MODELO_DA_RODADA = {data: "__DATA__", commit: "__COMMIT__", resultado: "__RESULTADO__", trabalhos: "__TRABALHOS__"};

// Um componente com dois nomes mostra os exemplos UMA vez, na página do nome principal (as fichas dizem isso no
// `summary`; a trava confere que continuam dizendo, e não aceita o apelido sem a frase).
export const APELIDOS = {Chip: "Badge", Topbar: "Header"};

// `tone` e `variant` (e o `color` do texto) são o MESMO eixo com dois nomes: o do nativo e o antigo da web. Um valor
// mostrado por um deles vale para o outro.
const MESMO_EIXO = ["tone", "variant", "color"];

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// O valor aparece no código como o consumidor o escreveria: `prop="v"`, `prop={"v"}`, `prop={v}` (número) ou, num
// objeto de props, `prop: "v"`. Um valor booleano conta com a prop escrita.
export function aparece(codigo, prop, valor) {
  const p = esc(prop), v = esc(valor);
  if (valor === true || valor === false || valor === "true" || valor === "false") return new RegExp(`\\b${p}\\b`).test(codigo);
  return new RegExp(`\\b${p}\\s*=\\s*\\{?\\s*["'\`]${v}["'\`]`).test(codigo)
    || new RegExp(`\\b${p}\\s*=\\s*\\{\\s*${v}\\s*\\}`).test(codigo)
    || new RegExp(`\\b${p}\\s*:\\s*["'\`]${v}["'\`]`).test(codigo);
}

const semAspas = (s) => String(s ?? "").trim().replace(/^["'`]|["'`]$/g, "");

export async function medirCatalogo(raiz) {
  const C = join(raiz, "apps/catalog/content");
  const imp = async (f) => (await import(pathToFileURL(f).href)).default;
  const content = {};
  for (const f of readdirSync(C).filter((f) => f.endsWith(".mjs") && !f.startsWith("_"))) content[f.slice(0, -4)] = await imp(join(C, f));
  const starters = {...(await imp(join(C, "_starters.mjs"))), ...(await imp(join(C, "_starters-motores.mjs")))};
  const padroes = {};
  for (const f of readdirSync(join(C, "patterns")).filter((f) => f.endsWith(".mjs"))) padroes[f.slice(0, -4)] = await imp(join(C, "patterns", f));
  const R = join(raiz, "packages/contracts/registry");
  const fichas = readdirSync(R).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(R, f), "utf8")));

  const codigoDaPagina = (nome) => {
    const c = content[nome];
    return [...(c?.examples || []), starters[nome] || {}, ...(starters[nome]?.examples || [])].map((e) => e.code || "").join("\n");
  };
  const codigoDosPadroes = (nome) => (padroes[nome] || []).map((p) => p.code || "").join("\n");

  const erros = [];
  // 1. o que o pacote exporta tem ficha e página
  const web = await import(pathToFileURL(join(raiz, "packages/react/dist/index.js")).href);
  const nomes = new Set(fichas.map((f) => f.name));
  const exportados = Object.keys(web).filter((n) => /^use[A-Z]/.test(n)
    || (/^[A-Z]/.test(n) && (typeof web[n] === "function" || (web[n] && typeof web[n] === "object" && "$$typeof" in web[n]))));
  const hooks = existsSync(join(C, "_hooks.mjs")) ? (await imp(join(C, "_hooks.mjs"))).map((g) => g.name) : [];
  // Um gancho tem página pela lista dos ganchos (`_hooks.mjs`) ou por ficha própria (`useTheme`, `useDensity`…).
  const semPagina = exportados.filter((n) => !nomes.has(n) && !(/^use[A-Z]/.test(n) && hooks.includes(n)));

  // 2. cada valor de variação em exemplo
  let total = 0, naPagina = 0, porPadrao = 0, emPadrao = 0;
  const faltam = {};
  for (const f of fichas) {
    if (!f.platforms?.web || f.platforms.web === "planned") continue;
    const dono = APELIDOS[f.name];
    if (dono && !new RegExp(`\\b${dono}\\b`).test(f.summary || "")) erros.push(`${f.name}: é apelido de ${dono}, e o summary da ficha não diz`);
    const eixos = {...(f.axes || {})};
    if (f.variants?.length) eixos[f.variantProp || "variant"] = f.variants;
    if (f.sizes?.length) eixos[f.sizeProp || "size"] = f.sizes;
    const pagina = codigoDaPagina(dono || f.name), padrao = codigoDosPadroes(dono || f.name);
    const padraoDa = Object.fromEntries((Array.isArray(f.props) ? f.props : []).map((p) => [p.name, semAspas(p.default)]));
    for (const [prop, valores] of Object.entries(eixos)) {
      if (!Array.isArray(valores)) continue;
      const nomesDoEixo = MESMO_EIXO.includes(prop)
        ? [prop, ...Object.keys(eixos).filter((o) => o !== prop && MESMO_EIXO.includes(o) && eixos[o].some((x) => valores.includes(x)))]
        : [prop];
      for (const v of valores) {
        total++;
        if (nomesDoEixo.some((n) => aparece(pagina, n, v))) naPagina++;
        else if (padraoDa[prop] === String(v)) porPadrao++;
        else if (nomesDoEixo.some((n) => aparece(padrao, n, v))) emPadrao++;
        else (faltam[f.name] ??= []).push(`${prop}=${v}`);
      }
    }
  }
  const nFaltam = Object.values(faltam).reduce((a, l) => a + l.length, 0);
  if (semPagina.length) erros.push(`${semPagina.length} nome(s) exportado(s) sem ficha nem página: ${semPagina.join(", ")}`);
  if (nFaltam) erros.push(`${nFaltam} valor(es) de variação sem exemplo, em ${Object.keys(faltam).length} componente(s): `
    + Object.entries(faltam).map(([n, l]) => `${n} (${l.join(", ")})`).join("; "));
  return {
    web: {exportados: exportados.length, semPagina, valores: total, naPagina, porPadrao, emPadrao, faltam},
    erros,
  };
}

// Rodado solto: o relatório e a saída 1 se falta algo.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const r = await medirCatalogo(resolve(import.meta.dirname, ".."));
  const {faltam, ...resto} = r.web;
  console.log(JSON.stringify({...resto, faltam: Object.values(faltam).reduce((a, l) => a + l.length, 0)}, null, 1));
  for (const [n, l] of Object.entries(faltam).sort((a, b) => b[1].length - a[1].length)) console.log(`${n.padEnd(22)} ${l.length}  ${l.join(" ")}`);
  if (r.erros.length) { for (const e of r.erros) console.error(`catalogo-fiel: ${e.slice(0, 300)}`); process.exit(1); }
  console.log("catalogo-fiel: OK");
}
