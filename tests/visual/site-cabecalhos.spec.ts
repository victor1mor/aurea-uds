import {test, expect, type Page} from "@playwright/test";
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
// @ts-expect-error — módulo .mjs sem tipos
import {cabecalhos, resumosDosScripts} from "../../scripts/montar-site.mjs";

// OS CABEÇALHOS DE SEGURANÇA DO SITE (06/11/2026, a auditoria externa A-011). O servidor dos testes não lê o `_headers`
// da Cloudflare; aqui a política que a montagem escreve é posta em cada documento, e o navegador conta as violações.
// As páginas são as mais pesadas: a inicial, uma com a parte viva, uma com os motores (o mapa, com o trabalhador), a do
// nativo, a da cor, uma receita e uma moldura de exemplo.
// Provado contra o defeito: o segundo teste tira os resumos e o navegador BLOQUEIA o script embutido — o instrumento vê.
// O `upgrade-insecure-requests` sai só aqui: o servidor do teste é http, e o site publicado é https.
const ler = (d: string): string[] => readdirSync(d, {withFileTypes: true})
  .flatMap((e) => e.isDirectory() ? ler(join(d, e.name)) : [join(d, e.name)]);
const RESUMOS: string[] = resumosDosScripts(ler("apps/catalog").filter((f) => f.endsWith(".html")).map((f) => readFileSync(f, "utf8")));
const politica = (resumos: string[]) => {
  const linha = (cabecalhos(resumos) as string).split("\n").find((l) => l.includes("Content-Security-Policy:"))!;
  return linha.split("Content-Security-Policy:")[1].trim().replace(/;\s*upgrade-insecure-requests/, "");
};

async function comPolitica(page: Page, csp: string) {
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") return route.continue();
    const r = await route.fetch();
    await route.fulfill({response: r, headers: {...r.headers(), "content-security-policy": csp}});
  });
  await page.addInitScript(() => {
    (window as unknown as {__violacoes: string[]}).__violacoes = [];
    addEventListener("securitypolicyviolation", (e) => (window as unknown as {__violacoes: string[]}).__violacoes
      .push(`${e.effectiveDirective} ${e.blockedURI || "(embutido)"} ${e.sourceFile}:${e.lineNumber}`));
  });
}
const violacoes = (page: Page) => page.evaluate(() => (window as unknown as {__violacoes: string[]}).__violacoes);

const PAGINAS = ["index.html", "button.html", "dependencygraph.html", "native-button.html", "colorpicker.html",
  "recipe-agent-ai.html", "embeds/sidebar-groups-and-one-level-of-nesting.html"];

test.describe("o site com a política de conteúdo", () => {
  for (const p of PAGINAS) {
    test(`${p} acende sem violação`, async ({page}) => {
      await comPolitica(page, politica(RESUMOS));
      await page.goto(`/apps/catalog/${p}`);
      // a parte viva acende (as caixas marcadas dizem "sim"), e o tempo cobre o trabalhador do mapa
      await page.waitForLoadState("networkidle");
      for (const c of await page.locator("[data-ligada]").all()) await expect(c).not.toHaveAttribute("data-ligada", "erro");
      expect(await violacoes(page)).toEqual([]);
    });
  }
  test("sem os resumos, o script embutido é bloqueado (o teste enxerga a violação)", async ({page}) => {
    await comPolitica(page, politica([]));
    await page.goto("/apps/catalog/button.html");
    await page.waitForLoadState("networkidle");
    expect((await violacoes(page)).some((v) => v.startsWith("script-src"))).toBe(true);
  });
});
