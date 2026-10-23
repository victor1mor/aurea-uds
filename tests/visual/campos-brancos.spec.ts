import {expect, test} from "@playwright/test";
import {readFileSync} from "node:fs";
import {join} from "node:path";

// ADR-0078 (22/10/2026) — os campos brancos no claro. O Victor viu na bancada: *"gostei Branco + sombra"*. No CLARO, o
// campo solto na página é a cor do cartão com a sombra leve (`--shadow-sm`, a mesma da referência); DENTRO de uma
// superfície que pinta a cor do cartão, volta ao cinza de antes (`--fill-2`, sem sombra); no ESCURO, tudo como antes.
// O que este arquivo prova, no navegador (o fundo e a sombra CALCULADOS, que é o que a tela pinta):
//   · a página clara: o campo de texto, a lista, a casa do código e o grupo de campo ficam brancos e com sombra; o
//     campo de DENTRO do grupo fica transparente e sem sombra (senão a sombra dobra);
//   · as superfícies brancas (cartão, janela, painel do app) devolvem o cinza; as que NÃO são brancas — o cartão de
//     contorno (a caixa da vitrine) e o `inset` — e o painel de prévia do site deixam o branco;
//   · o escuro não muda; e o tema da FAIXA manda (GAR-05): campo numa faixa escura dentro de página clara fica escuro, e
//     o contrário também; a marca `lory` no claro, branca também.
// Provado contra o defeito: com o CSS da 0.39.0, todo caso "branco" reprova (o campo era o cinza em toda parte).
// A folha vai no <head>, antes de desenhar: posta depois, o teste mede a transição do fundo (a lição da 0.37.1).
const CSS = readFileSync(join(process.cwd(), "packages/core/dist/aurea.css"), "utf8");
const BRANCO = "rgb(255, 255, 255)";
const SOMBRA = "rgba(0, 0, 0, 0.04) 0px 2px 4px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px, rgba(0, 0, 0, 0.06) 0px 0px 1px 0px";

const campos = `<input class="input" id="texto" placeholder="john@email.com">`
  + `<button type="button" class="select select-trigger" id="lista">Select one</button>`
  + `<input class="input otp-slot" id="casa" value="2">`
  + `<div class="input-group" id="grupo"><input class="input" id="dentro" placeholder="Search"></div>`;

async function medir(page: import("@playwright/test").Page, html: string, tema = "light", marca?: string) {
  await page.setContent(`<!doctype html><html data-theme="${tema}"${marca ? ` data-brand="${marca}"` : ""}><head><meta charset="utf-8">`
    + `<style>${CSS}</style></head><body style="margin:0;padding:16px">${html}</body></html>`);
  return page.evaluate(() => Object.fromEntries(["texto", "lista", "casa", "grupo", "dentro"].map((id) => {
    const cs = getComputedStyle(document.getElementById(id)!);
    return [id, {fundo: cs.backgroundColor, sombra: cs.boxShadow}];
  })));
}

const NA_PAGINA = ["texto", "lista", "casa", "grupo"] as const;

test("claro, solto na página: o campo é branco e tem a sombra da referência; o de dentro do grupo, não", async ({page}) => {
  const m = await medir(page, campos);
  for (const id of NA_PAGINA) {
    expect(m[id].fundo, `${id}: branco`).toBe(BRANCO);
    expect(m[id].sombra, `${id}: a sombra leve`).toBe(SOMBRA);
  }
  expect(m.dentro.fundo, "o campo de dentro do grupo é transparente").toBe("rgba(0, 0, 0, 0)");
  expect(m.dentro.sombra, "e sem sombra (a do grupo basta)").toBe("none");
});

const BRANCAS: Record<string, string> = {
  "o cartão": `<div class="card">${campos}</div>`,
  "a janela": `<div class="dialog">${campos}</div>`,
  "o painel do app": `<main class="content">${campos}</main>`,
  "a célula da tabela": `<table class="table"><tbody><tr><td>${campos}</td></tr></tbody></table>`,
};
for (const [nome, html] of Object.entries(BRANCAS)) {
  test(`claro, dentro de ${nome} (superfície branca): o campo volta ao cinza, sem sombra`, async ({page}) => {
    const m = await medir(page, html);
    for (const id of NA_PAGINA) {
      expect(m[id].fundo, `${nome} · ${id}: não é branco`).not.toBe(BRANCO);
      expect(m[id].sombra, `${nome} · ${id}: sem sombra`).toBe("none");
    }
  });
}

const NAO_BRANCAS: Record<string, string> = {
  "o cartão de contorno (transparente, a caixa da vitrine)": `<div class="card card-outline">${campos}</div>`,
  "o cartão inset (cinza)": `<div class="card card-inset">${campos}</div>`,
  "o painel de prévia do site (a página da prévia, dentro do cartão do site)": `<div class="demo"><div class="demo-panel" data-panel="preview">${campos}</div></div>`,
  "o painel do app sem caixa (plain)": `<main class="content content-plain">${campos}</main>`,
};
for (const [nome, html] of Object.entries(NAO_BRANCAS)) {
  test(`claro, dentro de ${nome}: o campo continua branco, com sombra`, async ({page}) => {
    const m = await medir(page, html);
    for (const id of NA_PAGINA) {
      expect(m[id].fundo, `${nome} · ${id}: branco`).toBe(BRANCO);
      expect(m[id].sombra, `${nome} · ${id}: com sombra`).toBe(SOMBRA);
    }
  });
}

test("escuro: o campo é o de antes — não é branco, não é a cor do cartão e não tem sombra", async ({page}) => {
  const m = await medir(page, campos, "dark");
  const cartao = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--card").trim());
  for (const id of NA_PAGINA) {
    expect(m[id].sombra, `escuro · ${id}: sem sombra`).toBe("none");
    expect(m[id].fundo, `escuro · ${id}: não é branco`).not.toBe(BRANCO);
    expect(m[id].fundo, `escuro · ${id}: não é a cor do cartão (${cartao})`).not.toBe("rgb(41, 41, 41)");
  }
});

test("o tema da FAIXA manda: faixa escura em página clara, e faixa clara em página escura (GAR-05)", async ({page}) => {
  const escuraNaClara = await medir(page, `<section data-theme="dark">${campos}</section>`, "light");
  expect(escuraNaClara.texto.fundo, "faixa escura: o campo não fica branco").not.toBe(BRANCO);
  expect(escuraNaClara.texto.sombra, "faixa escura: sem sombra").toBe("none");
  const claraNaEscura = await medir(page, `<section data-theme="light">${campos}</section>`, "dark");
  expect(claraNaEscura.texto.fundo, "faixa clara: o campo fica branco").toBe(BRANCO);
  expect(claraNaEscura.texto.sombra, "faixa clara: com sombra").toBe(SOMBRA);
});

test("a marca lory, no claro: o campo também é a cor do cartão dela, com sombra", async ({page}) => {
  const m = await medir(page, campos, "light", "lory");
  const cartao = await page.evaluate(() => { const d = document.createElement("div"); d.style.background = "var(--card)"; document.body.append(d); return getComputedStyle(d).backgroundColor; });
  expect(m.texto.fundo, "o campo é a cor do cartão da lory").toBe(cartao);
  expect(m.texto.sombra).toBe(SOMBRA);
});
