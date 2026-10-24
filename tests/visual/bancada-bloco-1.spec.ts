import {test, expect, type Page} from "@playwright/test";

// A BANCADA DO BLOCO 1 (ADR-0081, 24/10/2026), medida no navegador: o contraste de cada ponto que a bancada mostrava
// reprovando, nos dois temas, depois das transições; e a caixa do exemplo que cresce, na tela do Victor (1280 × 663).
// Provado contra o defeito: contra o site de antes (`BASE_SITE` servindo a pasta em `5c822ff1`), reprovam os cinco.
const base = process.env.BASE_SITE ?? "";
const AA = 4.5;

// A letra contra o fundo efetivo: as camadas de cima até a primeira opaca, misturadas.
async function contrastes(page: Page, pagina: string, seletor: string) {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto(`${base}/apps/catalog/${pagina}`);
  const out: Record<string, {texto: string; razao: number}[]> = {};
  for (const tema of ["dark", "light"] as const) {
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, tema);
    await page.waitForTimeout(500);
    out[tema] = await page.evaluate((sel) => {
      const cv = document.createElement("canvas"); cv.width = cv.height = 1;
      const cx = cv.getContext("2d", {willReadFrequently: true})!;
      const rgba = (c: string) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = "#000"; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const mistura = (a: number[], b: number[]) => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
      const fundo = (e: Element) => { const cs: number[][] = []; for (let x: Element | null = e; x; x = x.parentElement) { const c = rgba(getComputedStyle(x).backgroundColor); if (c[3] > 0) cs.push(c); if (c[3] >= 1) break; } let r = [255, 255, 255, 1]; for (const c of cs.reverse()) r = mistura(c, r); return r; };
      const lum = (c: number[]) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
      const razao = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
      return [...document.querySelectorAll(sel)].filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => {
        const b = fundo(e);
        return {texto: (e.textContent ?? "").trim().slice(0, 24), razao: Math.round(razao(mistura(rgba(getComputedStyle(e).color), b), b) * 100) / 100};
      });
    }, seletor);
  }
  return out;
}
const abaixo = (m: Record<string, {texto: string; razao: number}[]>) =>
  Object.entries(m).flatMap(([tema, l]) => l.filter((x) => x.razao < AA).map((x) => `${tema} "${x.texto}" ${x.razao}`));

test("2 · a letra do tone primary passa de 4,5:1 nos dois temas", async ({page}) => {
  const m = await contrastes(page, "text.html", ".typography-tone-primary");
  expect(m.light.length).toBeGreaterThan(0);
  expect(abaixo(m)).toEqual([]);
});

test("3 · os botões da marca dentro da barra de ferramentas passam de 4,5:1 nos dois temas", async ({page}) => {
  const m = await contrastes(page, "toolbarbutton.html", ".toolbar :is(.btn-primary-outline,.btn-primary-ghost,.btn-link-primary)");
  expect(m.light.length).toBeGreaterThan(2);
  expect(abaixo(m)).toEqual([]);
});

test("4 · o Avatar suave com tom passa de 4,5:1 nos dois temas", async ({page}) => {
  const m = await contrastes(page, "avatar.html", ".avatar-soft:is(.avatar-tone-info,.avatar-tone-success,.avatar-tone-warning,.avatar-tone-danger)");
  expect(m.light.length).toBeGreaterThan(0);
  expect(abaixo(m)).toEqual([]);
});

test("6 · running, paused, offline e review não saem iguais ao neutral, e passam de 4,5:1", async ({page}) => {
  const m = await contrastes(page, "badge.html", ":is(.badge-running,.badge-paused,.badge-offline,.badge-review):not(.badge-dot)");
  expect(abaixo(m)).toEqual([]);
  for (const tema of ["dark", "light"]) {
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, tema);
    await page.waitForTimeout(400);
    // O neutro é o `Badge` sem tom (não há classe `badge-neutral`): o teste cria, na mesma caixa, um neutro e um de cada tom.
    const cores = await page.evaluate(() => {
      const caixa = document.querySelector('.demo-panel[data-panel="preview"]')!;
      return Object.fromEntries([["neutral", "badge"], ...["running", "paused", "offline", "review"].map((v) => [v, `badge badge-${v}`])].map(([v, cls]) => {
        const e = document.createElement("span"); e.className = cls; e.textContent = v; caixa.append(e);
        const c = `${getComputedStyle(e).color} ${getComputedStyle(e).backgroundColor}`; e.remove();
        return [v, c];
      }));
    });
    const iguais = ["running", "paused", "offline", "review"].filter((v) => cores[v] === cores.neutral);
    expect(iguais, `${tema}: ${JSON.stringify(cores)}`).toEqual([]);
  }
});

test("1 · na tela do Victor, a caixa de um exemplo alto cresce e não rola por dentro", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 663});
  await page.goto(`${base}/apps/catalog/datastate.html`);
  const caixas = await page.evaluate(() => [...document.querySelectorAll(".demo")].map((d) => {
    const p = d.querySelector<HTMLElement>('.demo-panel[data-panel="preview"]');
    return {altura: Math.round(d.getBoundingClientRect().height), rola: p ? p.scrollHeight > p.clientHeight + 1 : false};
  }));
  expect(caixas.filter((c) => c.rola)).toEqual([]);
  // A mais alta passa da mínima de antes (359 nesta tela): é a caixa crescendo, e não o exemplo cortado.
  expect(Math.max(...caixas.map((c) => c.altura))).toBeGreaterThan(400);
});
