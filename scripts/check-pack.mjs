// GATE DE TARBALL — o critério 26 do QUALITY.md, e a condição 1 da ADR-0010.
//
// Publicar é definitivo: versão é imutável e `deprecate` é o único desfazer. O que entra no
// tarball é a única parte disso que ainda dá para controlar antes, e até hoje era conferência
// à mão (`npm pack --dry-run`, lido por um humano uma vez, na Fase 9).
//
// Quem decide o conteúdo do tarball não é este script: é o npm, lendo `files`, `.npmignore`,
// `.gitignore` e as regras dele (LICENSE e README entram sempre; `node_modules` nunca). Por
// isso o gate CHAMA o npm em vez de reimplementar essa lógica — reimplementar seria assinar
// embaixo de um comportamento que muda com a versão do npm.
//
// O baseline é versionado, no idioma dos outros deste repositório (raw-px-baseline,
// core-boundary): pode mudar, mas a mudança aparece no diff e alguém tem de aprová-la.
//
//   node scripts/check-pack.mjs          verifica
//   node scripts/check-pack.mjs --write  regrava o baseline
import {execSync} from "node:child_process";
import {readFileSync, writeFileSync, existsSync, mkdtempSync, readdirSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = join(root, "scripts/package-files.json");
const PACOTES = ["contracts", "core", "fonts", "icons", "native", "react", "tokens"];
// `execSync` e não `execFileSync`: no Windows o npm é um `.cmd`, e desde a correção do
// CVE-2024-27980 o Node recusa executar `.cmd`/`.bat` sem shell (EINVAL). Passar `shell:true`
// para o execFileSync resolve mas emite DEP0190. O comando é uma constante — não há entrada
// de fora para o shell interpretar.
const CMD = "npm pack --dry-run --json";

// ── uma dobra, e só uma: os 5146 arquivos gerados de `@aurea-uds/native/icons` ──────────
// Acrescentada em 02/09/2026, no Lote 0 do NATIVE.md. Listar um a um poria ~5000 linhas neste
// baseline, e o custo não é o tamanho do arquivo: é que uma versão nova do Carbon viraria um diff
// de milhares de linhas que ninguém lê de verdade — e um baseline que ninguém lê não é gate, é
// carimbo. A garantia não se perde, ela muda de lugar e FICA MELHOR:
//
//   • aqui continua valendo o que este gate faz bem — arquivo INESPERADO fora de `icons/` reprova,
//     e a CONTAGEM de `icons/` reprova quando muda;
//   • o **check 38** do validador cobra o conteúdo, e com um critério mais forte do que uma lista
//     congelada: o conjunto de nomes tem de ser IGUAL ao do sprite da web, cada `.js` precisa do
//     `.d.ts` par, e o barril precisa listar todos. Um ícone específico que sumisse do tarball
//     teria sumido do disco, e é lá que ele é pego.
//
// Vale só para este prefixo, e só neste pacote. Qualquer outro caminho continua listado.
const DOBRA = {"@aurea-uds/native": "icons/"};

const medido = {};
for (const p of PACOTES) {
  const nome = `@aurea-uds/${p}`;
  const dir = join(root, "packages", p);
  const saida = execSync(CMD, {cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"]});
  const [info] = JSON.parse(saida);
  const arquivos = info.files.map(f => f.path).sort();
  const prefixo = DOBRA[nome];
  medido[nome] = prefixo
    ? [...arquivos.filter(f => !f.startsWith(prefixo)),
       `${prefixo}* (${arquivos.filter(f => f.startsWith(prefixo)).length} arquivos gerados)`]
    : arquivos;
}

if (process.argv.includes("--write")) {
  const doc = existsSync(BASE) ? JSON.parse(readFileSync(BASE, "utf8")) : {};
  doc._porque = "O que CADA pacote publicaria. Publicar e' definitivo, entao o conteudo do tarball nao pode ser surpresa. Gerado chamando `npm pack --dry-run` — quem decide o conteudo e' o npm, e o gate le a decisao dele em vez de reimplementa-la. Um arquivo novo (ou um que sumiu) reprova ate' alguem regravar este baseline de proposito.";
  doc._como_regerar = "node scripts/check-pack.mjs --write";
  doc._regra = "Fora de dist/, so' entra o que o npm poe sozinho (LICENSE, README, package.json), o NOTICE do Carbon (obrigacao da Apache-2.0), o JSON de tokens em src/ (a origem DTCG e' o produto, nao um resto de build) e os binarios do pacote de fontes — os woff2 do alvo web e os ttf do alvo nativo, que o React Native exige porque nao le woff2. Os 5146 arquivos gerados de `native/icons` entram DOBRADOS numa linha com a contagem: o conteudo deles e' cobrado pelo check 38 do validador, contra o sprite da web, que e' criterio mais forte que uma lista congelada.";
  doc.pacotes = medido;
  writeFileSync(BASE, JSON.stringify(doc, null, 2) + "\n", "utf8");
  console.log("pack: baseline regravado —", Object.entries(medido).map(([k, v]) => `${k.split("/")[1]}:${v.length}`).join(" "));
  process.exit(0);
}

if (!existsSync(BASE)) {
  console.error("pack: falta scripts/package-files.json — rode 'node scripts/check-pack.mjs --write'");
  process.exit(1);
}

const erros = [];
const base = JSON.parse(readFileSync(BASE, "utf8")).pacotes ?? {};
for (const [nome, arquivos] of Object.entries(medido)) {
  const esperado = base[nome];
  if (!esperado) { erros.push(`${nome}: pacote novo, sem baseline`); continue; }
  const sobrou = arquivos.filter(f => !esperado.includes(f));
  const faltou = esperado.filter(f => !arquivos.includes(f));
  if (sobrou.length) erros.push(`${nome}: ${sobrou.length} arquivo(s) que o baseline nao previa — ${sobrou.join(", ")}`);
  if (faltou.length) erros.push(`${nome}: ${faltou.length} arquivo(s) sumiram do tarball — ${faltou.join(", ")}`);
}
for (const nome of Object.keys(base)) {
  if (!medido[nome]) erros.push(`${nome}: esta' no baseline e nao foi medido`);
}

// A regra que a ADR-0010 escreveu por extenso, cobrada aqui: nada de fonte compilavel viaja.
// Nao substitui o baseline — pega a classe do defeito quando o baseline for regravado no
// automatico por alguem com pressa.
const PROIBIDO = /(^|\/)(src\/.*\.(tsx?|mjs|css)|node_modules\/|\.env|.*\.map)$/;
for (const [nome, arquivos] of Object.entries(medido)) {
  const maus = arquivos.filter(f => PROIBIDO.test(f));
  if (maus.length) erros.push(`${nome}: fonte/artefato que nao devia ser publicado — ${maus.join(", ")}`);
}

// ── nenhum protocolo `workspace:` sobrevive ao tarball ─────────────────────
// Achado em 03/09/2026, ao escrever o app de smoke test do Lote 0. O `@aurea-uds/native` e' o
// PRIMEIRO pacote publicavel desta casa com dependencia de outro pacote do workspace, entao este
// caminho e' novo — e ele tem uma armadilha medida:
//
//     npm  pack -> "@aurea-uds/tokens": "workspace:^"    <- NAO INSTALA EM NINGUEM
//     pnpm pack -> "@aurea-uds/tokens": "^0.6.0"         <- correto
//
// O `workspace:` e' protocolo do pnpm; fora dele nao e' versao valida. Publicado assim, o pacote
// quebra na instalacao de todo consumidor — e o baseline acima NAO pegaria, porque ele mede a
// LISTA DE ARQUIVOS e o defeito esta' DENTRO do package.json.
//
// Entao o gate mede o artefato de verdade: empacota com `pnpm pack` e le o package.json que saiu.
// So' para os pacotes que tem dependencia de workspace — hoje um.
const tmp = mkdtempSync(join(tmpdir(), "aurea-pack-"));
try {
  for (const p of PACOTES) {
    const nome = `@aurea-uds/${p}`;
    const dir = join(root, "packages", p);
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    const campos = ["dependencies", "peerDependencies", "optionalDependencies"];
    const temWorkspace = campos.some(c => Object.values(pkg[c] ?? {}).some(v => String(v).startsWith("workspace:")));
    if (!temWorkspace) continue;

    execSync(`pnpm pack --pack-destination "${tmp}"`, {cwd: dir, stdio: ["ignore", "ignore", "ignore"]});
    const tgz = readdirSync(tmp).find(f => f.startsWith(`aurea-uds-${p}-`));
    if (!tgz) { erros.push(`${nome}: pnpm pack nao gerou tarball para conferir o workspace:`); continue; }
    execSync(`tar xzf "${join(tmp, tgz)}" -C "${tmp}" package/package.json`, {stdio: ["ignore", "ignore", "ignore"]});
    const empacotado = JSON.parse(readFileSync(join(tmp, "package", "package.json"), "utf8"));
    const vazou = campos.flatMap(c => Object.entries(empacotado[c] ?? {})
      .filter(([, v]) => String(v).startsWith("workspace:"))
      .map(([k, v]) => `${c}.${k}="${v}"`));
    if (vazou.length) {
      erros.push(`${nome}: o tarball leva protocolo \`workspace:\` — ${vazou.join(", ")}. `
        + `Isso nao e' versao valida fora do pnpm e QUEBRA a instalacao de todo consumidor. `
        + `Publique com \`pnpm publish\`, nunca \`npm publish\`.`);
    }
    rmSync(join(tmp, "package"), {recursive: true, force: true});
  }
} finally {
  rmSync(tmp, {recursive: true, force: true});
}

if (erros.length) {
  console.error("pack: FALHOU\n- " + erros.join("\n- "));
  process.exit(1);
}
console.log("pack: OK —", Object.entries(medido).map(([k, v]) => `${k.split("/")[1]}:${v.length}`).join(" "));
