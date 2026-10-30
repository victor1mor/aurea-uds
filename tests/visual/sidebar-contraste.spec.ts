import {test, expect, type Page} from "@playwright/test";
import {readFileSync} from "node:fs";
import {createElement as h, Fragment} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// MNT-36 (0.50.0, ADR-0087), medido no navegador, nos três motores — a lateral de contraste, `Sidebar contrast`:
//   • numa página CLARA, o fundo é o cartão do escuro da marca (a lateral escura sobre o claro);
//   • numa página ESCURA, mais escura que a página (a página do escuro misturada com preto);
//   • o "está numa página escura?" é o do ANCESTRAL: uma faixa escura numa página clara conta como escura, e uma faixa
//     clara numa página escura, como clara (a guarda do GAR-05);
//   • a Ember tem as cores MEDIDAS do app onde nasceu (a paleta dela é fechada a mudança): o fundo, a letra e o apoio;
//   • em toda marca e nos dois temas, o item, o item atual e o texto de apoio passam de 4,5:1 sobre o fundo dela;
//   • a de CANTO RETO (`variant="flush"`, o arranjo do app que pediu) tem as mesmas cores, sem canto; e a sem caixa
//     (`plain`) também — ela pinta o fundo, senão a letra clara ficaria sobre a página clara.
// Provado contra o defeito: com o pacote da 0.49.1 a lateral não ganha nem a classe nem o tema — sai clara na página
// clara, e o fundo da Ember não é o medido.
const MARCAS: string[] = ["",
  ...Object.keys(JSON.parse(readFileSync("packages/tokens/src/aurea.tokens.json", "utf8")).brand ?? {}).filter((k) => !k.startsWith("$"))];
const ITENS: A.SidebarEntry[] = [
  {id: "painel", label: "Dashboard", icon: "squares-four", href: "#painel"},
  {id: "chamados", label: "Chamados", icon: "tray", href: "#chamados"},
  {id: "contratos", label: "Contratos", icon: "file-text", href: "#contratos"},
];
const lateral = (id: string, variant: "floating" | "flush" | "plain" = "floating") => h(A.Sidebar, {
  id, contrast: true, variant, items: ITENS, current: "painel", label: `Principal ${id}`, style: {position: "static", height: "auto"},
  header: h(A.Sidebar.Brand, {logo: "C", name: "Contratos", description: "Gestão"}),
  footer: h(A.Sidebar.User, {avatar: h(A.Avatar, {fallback: "VM", size: "sm"}), name: "Victor Moreira", description: "Solicitante"}),
});
// As referências que a lateral tem de igualar: o cartão do escuro, e a página do escuro misturada com preto.
const CORPO = renderToStaticMarkup(h(Fragment, null,
  lateral("so-na-pagina"),
  // A de CANTO RETO (flush), o arranjo do app que pediu: a mesma cor, encostada e sem canto.
  lateral("canto-reto", "flush"),
  // A sem caixa (plain): escura, ela pinta o fundo — senão a letra clara ficaria sobre a página clara.
  lateral("sem-caixa", "plain"),
  h("div", {id: "faixa-oposta", "data-theme": "__OPOSTO__", style: {padding: "8px", background: "var(--background)"}}, lateral("na-faixa")),
  h("div", {"data-theme": "dark"},
    h("div", {id: "ref-cartao-escuro", style: {background: "var(--card)", height: "4px"}}),
    h("div", {id: "ref-escuro-com-preto", style: {background: "color-mix(in oklch,var(--background) 55%,black)", height: "4px"}}))));

async function abrir(p: Page, baseURL: string | undefined, tema: string, marca: string) {
  const url = `${baseURL}/__sidebar-contraste`;
  const oposto = tema === "light" ? "dark" : "light";
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html lang="pt-BR" data-theme="${tema}"${marca ? ` data-brand="${marca}"` : ""}><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0;padding:16px;background:var(--background)"><main>${CORPO.replace("__OPOSTO__", oposto)}</main></body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
}

/** As cores pintadas, em sRGB 0..255, lidas pelo próprio navegador (um pixel de canvas): cada motor devolve `oklch()`,
 *  `color(srgb …)` ou `rgb()`, e o canvas converte todos do mesmo jeito. O fundo com transparência compõe sobre o de baixo. */
async function medir(p: Page, id: string) {
  return p.evaluate((id) => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    const cx = cv.getContext("2d", {willReadFrequently: true})!;
    const rgba = (c: string) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = "#000"; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); return [...cx.getImageData(0, 0, 1, 1).data]; };
    const fundo = (el: Element | null): number[] => { while (el) { const c = rgba(getComputedStyle(el).backgroundColor); if (c[3] === 255) return c.slice(0, 3); el = el.parentElement; } return [255, 255, 255]; };
    const sobre = (el: Element) => { const c = rgba(getComputedStyle(el).backgroundColor); const f = fundo(el.parentElement); const a = c[3] / 255; return c.slice(0, 3).map((v, i) => Math.round(v * a + f[i] * (1 - a))); };
    const cor = (el: Element) => rgba(getComputedStyle(el).color).slice(0, 3);
    const sb = document.getElementById(id)!;
    const atual = sb.querySelector(".sidebar-item[aria-current]")!;
    return {
      tema: sb.getAttribute("data-theme"), classe: sb.classList.contains("sidebar-contrast"),
      lateral: fundo(sb), pagina: fundo(sb.parentElement),
      item: cor(sb.querySelector(".sidebar-item:not([aria-current])")!), atual: cor(atual), fundoAtual: sobre(atual),
      nome: cor(sb.querySelector(".sidebar-user-name")!), apoio: cor(sb.querySelector(".sidebar-user-description")!),
      cartaoEscuro: fundo(document.getElementById("ref-cartao-escuro")),
      escuroComPreto: fundo(document.getElementById("ref-escuro-com-preto")),
    };
  }, id);
}
const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contraste = (a: number[], b: number[]) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
// Um ponto de folga por canal: a mistura de cor (`color-mix`) arredonda diferente em cada motor.
const perto = (a: number[], b: number[]) => a.every((v, i) => Math.abs(v - b[i]) <= 1);
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

test.describe("MNT-36 · a lateral de contraste", () => {
  for (const marca of MARCAS) for (const tema of ["light", "dark"] as const) {
    test(`${marca || "aurea"} · página ${tema === "light" ? "clara" : "escura"}`, async ({page, baseURL}) => {
      await abrir(page, baseURL, tema, marca);
      const m = await medir(page, "so-na-pagina");
      expect(m.classe).toBe(true);
      expect(m.tema).toBe("dark");
      if (marca === "ember") {
        // A Ember: as cores medidas do app onde nasceu, exatas.
        const medidas = tema === "light" ? {fundo: "#0e141c", nome: "#e4e8ed", apoio: "#8c939b"} : {fundo: "#04080d", nome: "#e1e5ea", apoio: "#7a8188"};
        expect(m.lateral).toEqual(hex(medidas.fundo));
        expect(m.nome).toEqual(hex(medidas.nome));
        expect(m.apoio).toEqual(hex(medidas.apoio));
      } else if (tema === "light") {
        // Na página clara, o cartão do escuro.
        expect(perto(m.lateral, m.cartaoEscuro), `${m.lateral} × ${m.cartaoEscuro}`).toBe(true);
      } else {
        // Na página escura, a página do escuro com preto: mais escura que a página.
        expect(perto(m.lateral, m.escuroComPreto), `${m.lateral} × ${m.escuroComPreto}`).toBe(true);
        expect(lum(m.lateral)).toBeLessThan(lum(m.pagina));
      }
      // A lateral se separa da página clara; e tudo dentro dela se lê.
      if (tema === "light") expect(contraste(m.lateral, m.pagina)).toBeGreaterThan(10);
      for (const [papel, c, f] of [["item", m.item, m.lateral], ["atual", m.atual, m.fundoAtual], ["apoio", m.apoio, m.lateral]] as const)
        expect(contraste(c, f), `${papel} ${c} sobre ${f}`).toBeGreaterThanOrEqual(4.5);
    });
  }

  for (const marca of ["", "ember"]) for (const tema of ["light", "dark"] as const) {
    test(`a de canto reto (flush) e a sem caixa (plain) têm a mesma cor da flutuante · ${marca || "aurea"} · ${tema}`, async ({page, baseURL}) => {
      await abrir(page, baseURL, tema, marca);
      const [solta, reta, semCaixa] = [await medir(page, "so-na-pagina"), await medir(page, "canto-reto"), await medir(page, "sem-caixa")];
      expect(reta.classe).toBe(true);
      expect(reta.tema).toBe("dark");
      for (const k of ["lateral", "item", "atual", "fundoAtual", "nome", "apoio"] as const) {
        expect(reta[k], k).toEqual(solta[k]);
        expect(semCaixa[k], `sem caixa: ${k}`).toEqual(solta[k]);
      }
      expect(await page.locator("#canto-reto").evaluate((el) => getComputedStyle(el).borderTopRightRadius)).toBe("0px");
    });
  }

  test("a página que conta é a do ANCESTRAL: a faixa escura numa página clara, e a clara numa página escura", async ({page, baseURL}) => {
    await abrir(page, baseURL, "light", "");
    const naEscura = await medir(page, "na-faixa");
    expect(perto(naEscura.lateral, naEscura.escuroComPreto), `${naEscura.lateral}`).toBe(true);
    await abrir(page, baseURL, "dark", "");
    const naClara = await medir(page, "na-faixa");
    expect(perto(naClara.lateral, naClara.cartaoEscuro), `${naClara.lateral}`).toBe(true);
  });
});
