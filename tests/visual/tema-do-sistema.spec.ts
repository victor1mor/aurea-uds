import {test, expect, type Page} from "@playwright/test";

// O D16 (0.72.0; aprovado pelo Victor em 19/10/2026: "o tema do sistema, claro quando ele não diz"). Uma página SEM
// `data-theme` no `<html>` segue o sistema: com o sistema escuro, ela sai IGUAL à mesma página com `data-theme="dark"`;
// com o claro, igual à com `data-theme="light"`. Medido elemento por elemento no banco da paleta (as peças que mudam com o
// tema), em três marcas: a padrão, a Ember e uma das onze.
// Provado contra o defeito: com a folha da 0.71.0 (sem as cópias do `tema-implicito.mjs`), a página sem tema não tem cor
// nenhuma e reprova nos dois sistemas.
const APP = "/apps/keyboard-probe/out/paleta.html";
const PROPS = ["color", "background-color", "background-image", "border-top-color", "outline-color", "box-shadow",
  "text-decoration-color", "fill", "stroke", "opacity", "color-scheme"];

async function fotografar(p: Page, tema: string, sistema: "light" | "dark", marca: string) {
  await p.emulateMedia({colorScheme: sistema});
  await p.setViewportSize({width: 1280, height: 900});
  await p.goto(`${APP}?tema=${tema}${marca ? `&marca=${marca}` : ""}`, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
  // As transições de cor terminam antes da leitura (a mesma espera do `esperar-transicoes`).
  await p.waitForTimeout(400);
  return p.evaluate((PROPS) => {
    const out: Record<string, string> = {};
    out["html data-theme"] = document.documentElement.getAttribute("data-theme") ?? "(nenhum)";
    for (const [i, el] of [document.documentElement, document.body, ...document.querySelectorAll("main *")].entries()) {
      const cs = getComputedStyle(el);
      for (const prop of PROPS) out[`${i}:${el.tagName.toLowerCase()} ${prop}`] = cs.getPropertyValue(prop);
    }
    return out;
  }, PROPS);
}

for (const marca of ["", "ember", "cobalt"]) for (const sistema of ["light", "dark"] as const) {
  test(`sem data-theme, o sistema ${sistema === "dark" ? "escuro" : "claro"} dá o tema ${sistema}${marca ? ` (${marca})` : ""}`, async ({page: p}, info) => {
    test.skip(info.project.name !== "chromium", "a regra é de CSS; um navegador basta para a comparação elemento por elemento");
    // O lado escrito é tirado com o sistema CONTRÁRIO, para provar que o atributo manda sobre o sistema.
    const escrito = await fotografar(p, sistema, sistema === "dark" ? "light" : "dark", marca);
    const doSistema = await fotografar(p, "sistema", sistema, marca);
    expect(doSistema["html data-theme"], "a página do sistema não tem atributo").toBe("(nenhum)");
    expect(escrito["html data-theme"]).toBe(sistema);
    expect(Object.keys(doSistema).length, "o banco tem peças").toBeGreaterThan(2000);
    const dif: string[] = [];
    for (const [k, v] of Object.entries(escrito)) if (k !== "html data-theme" && doSistema[k] !== v) dif.push(`${k}: ${v} ≠ ${doSistema[k]}`);
    expect(dif.slice(0, 30), `${dif.length} diferenças`).toEqual([]);
  });
}
