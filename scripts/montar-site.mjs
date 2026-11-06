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
import {createHash} from "node:crypto";
import {cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync} from "node:fs";
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

/** O `_headers` do site (Workers, arquivos estáticos): o padrão da Cloudflare mais `no-transform`. */
// E os textos para assistentes de IA (lote U, SITE-06) com o tipo e o `charset` escritos: a documentação da Cloudflare
// diz só que o tipo sai da extensão, sem falar de `charset` — e sem ele um "—" pode chegar quebrado.
export const CABECALHOS = "/*\n  Cache-Control: public, max-age=0, must-revalidate, no-transform\n"
  + "/*.md\n  Content-Type: text/markdown; charset=utf-8\n"
  + "/*.txt\n  Content-Type: text/plain; charset=utf-8\n";

/** Os resumos (sha256, base64) dos scripts EMBUTIDOS que rodam — o bloco de dados (`application/json`) não roda e não
 *  entra. Medido em 06/11/2026: 695 páginas e só 2 scripts embutidos diferentes; por isso a política lista os dois pelo
 *  resumo, e não `'unsafe-inline'`. Sai da montagem: script embutido novo entra sozinho, e nunca fica velho. */
export function resumosDosScripts(textos) {
  const r = new Set();
  for (const t of textos) for (const m of t.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\btype=["'](application\/(ld\+)?json|text\/plain)["']/.test(m[1])) continue;
    r.add(createHash("sha256").update(m[2], "utf8").digest("base64"));
  }
  return [...r].sort();
}

/** OS CABEÇALHOS DE SEGURANÇA (06/11/2026, a auditoria externa A-011). Cada permissão foi medida no site montado:
 *  - script: só o próprio domínio e os embutidos pelo resumo (nada de `eval`; nenhum `WebAssembly` nos pacotes);
 *  - style `'unsafe-inline'`: 14.566 atributos `style` nas páginas e os estilos que o React escreve — sem ele, nada se
 *    desenha; estilo não executa código;
 *  - img/font/media `data:` e `blob:`: os desenhos por máscara do CSS (`data:image/svg+xml`), a fonte embutida do CSS
 *    (`data:font/woff`), o som de exemplo (`data:audio/wav`) e o exportar do mapa (`createObjectURL`);
 *  - worker `blob:`/`data:`: o `layoutWorker` do mapa nasce de um `data:text/javascript` e de `blob:`;
 *  - frame `'self'`: as 87 molduras de exemplo são do próprio site; e ninguém de fora põe o site numa moldura;
 *  - permissões: tela cheia, compartilhar e copiar (o site usa); câmera, microfone, localização, pagamento e USB, não.
 *  O HSTS vai sem `preload` (entrar na lista dos navegadores é compromisso do domínio, decisão do Victor). */
export function cabecalhos(resumos) {
  const csp = ["default-src 'self'", `script-src 'self'${resumos.map((h) => ` 'sha256-${h}'`).join("")}`,
    "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self' data:", "media-src 'self' data: blob:",
    "connect-src 'self' data: blob:", "worker-src 'self' blob: data:", "frame-src 'self'", "frame-ancestors 'self'",
    "object-src 'none'", "base-uri 'self'", "form-action 'self'", "upgrade-insecure-requests"].join("; ");
  return "/*\n  Cache-Control: public, max-age=0, must-revalidate, no-transform\n"
    + `  Content-Security-Policy: ${csp}\n`
    + "  Strict-Transport-Security: max-age=31536000; includeSubDomains\n"
    + "  X-Content-Type-Options: nosniff\n"
    + "  X-Frame-Options: SAMEORIGIN\n"
    + "  Referrer-Policy: strict-origin-when-cross-origin\n"
    + "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=(), fullscreen=(self), web-share=(self), clipboard-write=(self)\n"
    + CABECALHOS.split("\n").slice(2).join("\n");
}

function arquivos(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(p) : [p];
  });
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
const conferir = process.argv.indexOf("--conferir");
if (isMain && conferir > 0) {
  // `--conferir <endereço>`: lê o site PUBLICADO como um navegador o pede, e reprova recurso de
  // fora — inclusive o que a Cloudflare injeta no caminho, que o `site-dist/` não tem. Roda depois
  // do `wrangler deploy` (`.github/workflows/site.yml`). Tenta por 2 min: a publicação leva segundos
  // para chegar à borda.
  const base = process.argv[conferir + 1];
  const paginas = ["", "button", "chart"];
  const comoNavegador = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", Accept: "text/html"};
  let maus = [];
  for (let tentativa = 1; tentativa <= 8; tentativa++) {
    maus = [];
    for (const p of paginas) {
      const r = await fetch(new URL(p, base), {headers: comoNavegador});
      if (!r.ok) maus.push(`${p || "/"}: HTTP ${r.status}`);
      else for (const a of recursosExternos(await r.text())) maus.push(`${p || "/"}: ${a}`);
    }
    if (!maus.length) break;
    await new Promise((ok) => setTimeout(ok, 15000));
  }
  if (maus.length) {
    console.error(`montar-site --conferir: o site publicado puxa recurso de fora ou não abre:\n  ` + maus.join("\n  "));
    process.exit(1);
  }
  console.log(`montar-site --conferir: ${paginas.length} páginas de ${base} sem recurso de fora`);
} else if (isMain) {
  rmSync(destino, {recursive: true, force: true});
  mkdirSync(destino, {recursive: true});
  // As páginas e, ao lado delas, os textos para assistentes de IA (SITE-06): o `.md` de cada página, o `llms.txt`, o
  // `llms-full.txt` e o `aurea-agents.md`.
  for (const n of readdirSync(origem).filter((n) => /\.(html|md|txt)$/.test(n))) cpSync(join(origem, n), join(destino, n));
  for (const d of ["assets", "embeds"]) cpSync(join(origem, d), join(destino, d), {recursive: true});
  // A Cloudflare INJETA um script dela (Web Analytics, `static.cloudflareinsights.com`) nas páginas
  // que um navegador pede — medido em aureauds.dev em 01/10/2026: o `curl` comum não via, o de
  // navegador via. É recurso de fora, e a trava proíbe. O `no-transform` impede a injeção pelo lado
  // do site, mesmo que alguém religue a estatística no painel. O resto é o padrão da Cloudflare.
  // E os cabeçalhos de segurança, com o resumo de cada script embutido das páginas que vão sair (`cabecalhos`, acima).
  const htmls = arquivos(destino).filter((f) => f.endsWith(".html")).map((f) => readFileSync(f, "utf8"));
  writeFileSync(join(destino, "_headers"), cabecalhos(resumosDosScripts(htmls)));

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
