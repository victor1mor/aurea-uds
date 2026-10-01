// Aurea — monta `site-dist/`, a pasta que vai para aureauds.dev (Cloudflare, `wrangler deploy`).
//
// O site é o CATÁLOGO GERADO (`apps/catalog`, feito por `scripts/build-catalog.mjs`), que já está
// commitado e é cobrado pela CI ("Falhar se dist desatualizado"). Aqui não se constrói nada: só se
// copia o que o navegador precisa — as páginas, `assets/` e `embeds/` — e se deixa de fora o que é
// fonte (`content/`, `live/`, `node_modules/`, `package.json`). 01/10/2026, Fase 1 do site.
//
// A TRAVA DESTE PASSO: nenhuma página pode puxar recurso de FORA (script, folha, imagem, vídeo ou
// moldura de outro endereço). O site é feito só com a Aurea, servido do próprio domínio. A trava das
// IMPORTAÇÕES (só a Aurea e as dependências que o `@aurea-uds/react` declara) é o check 45 do
// `validate.py`, que roda antes, na CI.
import {cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync} from "node:fs";
import {dirname, join, relative} from "node:path";
import {fileURLToPath} from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const origem = join(raiz, "apps", "catalog");
const destino = join(raiz, "site-dist");

/** Recurso de outro endereço numa página ou folha (o mesmo do check 45): o que a trava recusa. Link (<a href>) não conta. */
export function recursosExternos(texto) {
  const achados = [];
  const tag = /<(script|link|img|iframe|source|video|audio|embed|object)\b[^>]*?\b(src|href|data)\s*=\s*["']\s*(https?:)?\/\/[^"']+/gi;
  const css = /url\(\s*["']?\s*(https?:)?\/\/[^)"']+/gi;
  const imp = /@import\s+(url\()?\s*["']?\s*(https?:)?\/\//gi;
  const mod = /(\bfrom\s*|\bimport\(\s*)["']\s*(https?:)?\/\/[^"']+/gi;
  for (const re of [tag, css, imp, mod]) for (const m of texto.matchAll(re)) achados.push(m[0].slice(0, 120));
  return achados;
}

function arquivos(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(p) : [p];
  });
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  rmSync(destino, {recursive: true, force: true});
  mkdirSync(destino, {recursive: true});
  for (const n of readdirSync(origem).filter((n) => n.endsWith(".html"))) cpSync(join(origem, n), join(destino, n));
  for (const d of ["assets", "embeds"]) cpSync(join(origem, d), join(destino, d), {recursive: true});

  const todos = arquivos(destino);
  const maus = [];
  for (const f of todos.filter((f) => /\.(html|css)$/.test(f))) {
    for (const a of recursosExternos(readFileSync(f, "utf8"))) maus.push(`${relative(destino, f)}: ${a}`);
  }
  if (maus.length) {
    console.error(`montar-site: ${maus.length} recurso(s) de fora da Aurea — o site é servido só do próprio domínio:\n  ` + maus.slice(0, 10).join("\n  "));
    process.exit(1);
  }
  if (!todos.some((f) => relative(destino, f) === "index.html")) {
    console.error("montar-site: sem index.html — a raiz do site sairia vazia");
    process.exit(1);
  }
  console.log(`montar-site: ${todos.length} arquivos em site-dist/`);
}
