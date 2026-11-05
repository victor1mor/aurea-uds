import {test, expect, type Page} from "@playwright/test";
import {join} from "node:path";

// S-02 (05/11/2026) — as tabelas do site são `DataGrid` (o Victor: "tudo que existe no site de table vira datagrid"; a
// imagem da Styling com `fit`: "Pode, com fit"). Medido no site montado, na tela do Victor (1280 × 663):
//   • a grade ACENDE (`data-ligada="sim"`): a `DataGrid` viva, com ordenar;
//   • o título não aparece (nenhum `<caption>`), e o nome continua para o leitor de tela (o `aria-label` da grade);
//   • com `fit`, cabe na coluna do texto: a caixa não rola de lado; e com a linha entre as fileiras (`dividers`, *"Com a
//     linha"*);
//   • o axe passa nas páginas;
//   • o "Play" do Animation continua andando a bolinha DEPOIS de a grade acender (o clique é ouvido pela página).
// Provado contra o defeito: com o site montado da `claude/lote-paralelo` (9226a24b), as páginas não têm grade nenhuma.
const SITE = process.env.SITE ?? "/apps/catalog";
const AXE = join(process.cwd(), "node_modules/.pnpm/axe-core@4.10.2/node_modules/axe-core/axe.min.js");

async function abrir(p: Page, pagina: string, tema: "light" | "dark" = "light") {
  await p.setViewportSize({width: 1280, height: 663});
  await p.addInitScript((t) => { try { localStorage.setItem("aurea-theme", t); } catch { /* sem armazenamento */ } }, tema);
  await p.goto(`${SITE}/${pagina}`, {waitUntil: "networkidle"});
}
const grades = (p: Page) => p.locator("[data-vivo-grade]").evaluateAll((els) => els.map((el) => {
  const caixa = el.querySelector<HTMLElement>(".table-wrap");
  return {ligada: (el as HTMLElement).dataset.ligada, nome: el.querySelector("[role=grid]")?.getAttribute("aria-label"),
    titulo: !!el.querySelector("caption"), linha: !!el.querySelector(".datagrid-dividers"), rolaDeLado: caixa ? caixa.scrollWidth > caixa.clientWidth + 1 : null,
    fileiras: el.querySelectorAll("tbody tr").length};
}));

for (const [pagina, nome] of [["docs-styling.html", "State-based styling table"], ["native-button.html", "Button props"],
  ["saude.html", "The catalogue is complete"], ["docs-density.html", "The tokens table"]] as const) {
  test(`S-02 · ${pagina}: a grade acende, sem título à vista, com o nome, cabendo na coluna`, async ({page: p}) => {
    await abrir(p, pagina);
    await p.locator("[data-vivo-grade]").last().scrollIntoViewIfNeeded();
    await expect.poll(async () => (await grades(p)).every((g) => g.ligada === "sim")).toBe(true);
    const gs = await grades(p);
    expect(gs.length, pagina).toBeGreaterThan(0);
    expect(gs.map((g) => g.nome)).toContain(nome);
    for (const g of gs) {
      expect(g.titulo, JSON.stringify(g)).toBe(false);
      expect(g.linha, "com a linha entre as fileiras (\"Com a linha\")").toBe(true);
      expect(g.rolaDeLado, JSON.stringify(g)).toBe(false);
      expect(g.fileiras, JSON.stringify(g)).toBeGreaterThan(0);
    }
    await p.addScriptTag({path: AXE});
    const v = await p.evaluate(async () => {
      const r = await (window as any).axe.run(document.querySelectorAll("[data-vivo-grade]"), {runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]});
      return r.violations.map((x: any) => `${x.id}: ${x.nodes.length}`);
    });
    expect(v, pagina).toEqual([]);
  });
}

test("S-02 · Animation: o Play anda a bolinha depois de a grade acender", async ({page: p}) => {
  await abrir(p, "docs-animation.html");
  const caixa = p.locator(".animation-tokens [data-vivo-grade]");
  await caixa.scrollIntoViewIfNeeded();
  await expect(caixa).toHaveAttribute("data-ligada", "sim");
  await caixa.locator(".animation-play").first().click();
  await expect(caixa.locator("tbody tr").first().locator(".animation-bola")).toHaveAttribute("data-ligada", "");
});

test("S-02 · Density: a coluna da densidade escolhida continua acesa na grade", async ({page: p}) => {
  await abrir(p, "docs-density.html");
  const tokens = p.locator(".density-tokens");
  await tokens.scrollIntoViewIfNeeded();
  await expect(tokens.locator("[data-vivo-grade]")).toHaveAttribute("data-ligada", "sim");
  const fundo = (sel: string) => tokens.locator(sel).first().evaluate((e) => getComputedStyle(e).backgroundColor);
  const acesa = await fundo(".density-col-comfortable code");
  expect(acesa).not.toBe(await fundo(".density-col-compact code"));
});
