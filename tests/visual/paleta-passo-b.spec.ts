// AS CORES, PASSO B (ADR-0084, 27/10/2026) — os estilos novos no navegador, no banco dos estilos
// (`apps/keyboard-probe/estilos.html`, construído pelo `pnpm build`). Cada cor é comparada com a cor do token calculada
// pelo próprio navegador (o mesmo caminho dos dois lados — a lição do WebKit na 0.45.0), e cada letra e cada ícone do item
// atual da barra de baixo têm o contraste medido contra o fundo de verdade, nos dois temas, nos nove formatos e nas duas
// barras. O `brand-white` é a reprovação consciente (1,91:1): o teste prova que ela existe — e que fica só nele.
// Provado contra o defeito (27/10/2026): com o CSS do core da 0.45.0 no lugar do de hoje, reprovam todos menos a `ember`.
import {test, expect, type Page} from "@playwright/test";

const APP = "/apps/keyboard-probe/out/estilos.html";
const FORMAS = ["none", "subtle", "pill", "circle", "circle-raised", "circle-outline", "circle-bold", "capsule", "expand"];
const ATUAL = ["current", "neutral", "contrast", "brand", "ring", "plain", "brand-white", "white-ring", "brand-gradient",
  "bar-ink", "bar-ring", "bar-plain", "bar-light"];

async function abrir(p: Page, busca: string) {
  await p.goto(`${APP}?${busca}`, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
  // as transições de cor terminam antes de medir
  await p.waitForTimeout(400);
}

// As funções de medida, no navegador: a cor de um token pelo mesmo caminho da cor medida (um elemento de prova), o
// RGB de qualquer cor (o canvas resolve oklch e color-mix), o contraste da WCAG e o fundo EFETIVO: as camadas de fundo
// dos ancestrais, compostas de baixo para cima até a primeira opaca — o fundo translúcido (o amarelo a 12% do item atual)
// só se mede composto sobre o que está atrás. O degradê conta pela cor de partida, a mais escura das duas pontas.
const AJUDA = `
  window.__cor = (prop, valor) => { const e = document.createElement("i"); e.style[prop] = valor; document.body.append(e);
    const c = getComputedStyle(e)[prop]; e.remove(); return c; };
  const cv = document.createElement("canvas"); cv.width = cv.height = 1; const cx = cv.getContext("2d", {willReadFrequently: true});
  window.__rgb = (c) => { cx.clearRect(0,0,1,1); cx.fillStyle = "#000"; cx.fillStyle = c; cx.fillRect(0,0,1,1); return [...cx.getImageData(0,0,1,1).data]; };
  const lum = ([r,g,b]) => { const f = v => { v/=255; return v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4; }; return .2126*f(r)+.7152*f(g)+.0722*f(b); };
  window.__ct = (a, b) => { const [x,y] = [lum(__rgb(a)), lum(__rgb(b))].sort((p,q)=>q-p); return (x+.05)/(y+.05); };
  window.__fundo = (el) => {
    const camadas = [];
    for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e);
      if (s.backgroundImage.includes("gradient")) { camadas.push(__rgb(getComputedStyle(document.documentElement).getPropertyValue("--primary"))); break; }
      const c = __rgb(s.backgroundColor); if (c[3] > 0) { camadas.push(c); if (c[3] === 255) break; } }
    if (!camadas.length || camadas[camadas.length - 1][3] < 255) camadas.push(__rgb(getComputedStyle(document.documentElement).getPropertyValue("--background")));
    let base = camadas.pop();
    while (camadas.length) { const c = camadas.pop(), a = c[3] / 255; base = [0, 1, 2].map((i) => Math.round(c[i] * a + base[i] * (1 - a))).concat(255); }
    return "rgb(" + base[0] + ", " + base[1] + ", " + base[2] + ")"; };
`;

for (const tema of ["light", "dark"] as const) {
  test.describe(`passo B · ${tema}`, () => {
    test("o botão ligado: os três estilos com as cores dos tokens, e a letra a 4,5:1 ou mais", async ({page: p}) => {
      await abrir(p, `tema=${tema}`);
      await p.addScriptTag({content: AJUDA});
      const r = await p.evaluate(() => {
        const W = window as unknown as Record<string, (...a: string[]) => unknown>;
        const esperado: Record<string, [string, string]> = {brand: ["var(--primary)", "var(--primary-foreground)"],
          neutral: ["var(--input)", "var(--foreground)"], contrast: ["var(--foreground)", "var(--background)"]};
        return Object.entries(esperado).map(([v, [fundo, letra]]) => {
          // o `Toggle` não repassa `data-*`: a peça é o primeiro botão ligado da linha
          const b = document.querySelector(`[data-prova="ligado-${v}"] > .btn.toggle[data-pressed]`)!;
          const s = getComputedStyle(b);
          return {v, fundo: s.backgroundColor === W.__cor("backgroundColor", fundo), letra: s.color === W.__cor("color", letra),
            contraste: W.__ct(s.color, s.backgroundColor) as number,
            grupo: getComputedStyle(document.querySelector(`[data-prova="ligado-${v}"] .toggle-group [data-pressed]`)!).backgroundColor === s.backgroundColor,
            barra: getComputedStyle(document.querySelector(`[data-prova="ligado-${v}"] .toolbar [aria-pressed="true"]`)!).backgroundColor === s.backgroundColor,
            fio: getComputedStyle(b, "::after").content};
        });
      });
      for (const x of r) {
        expect(x.fundo && x.letra, `${x.v}: as cores dos tokens`).toBe(true);
        expect(x.contraste, `${x.v}: a letra`).toBeGreaterThanOrEqual(4.5);
        expect(x.grupo && x.barra, `${x.v}: o grupo e a barra de ferramentas pintam igual`).toBe(true);
        expect(["none", "normal"], `${x.v}: sem o fio de baixo`).toContain(x.fio);
      }
    });

    test("o segmento: seis estilos; o aro, o ponto reservado, e a letra a 4,5:1 ou mais", async ({page: p}) => {
      await abrir(p, `tema=${tema}`);
      await p.addScriptTag({content: AJUDA});
      const r = await p.evaluate(() => {
        const W = window as unknown as Record<string, (...a: string[]) => unknown>;
        const out: Record<string, unknown> = {};
        for (const v of ["current", "neutral", "contrast", "brand", "ring", "dot"]) {
          const ativo = document.querySelector(`[data-prova="seg-${v}"] .active`)!;
          const outro = document.querySelector(`[data-prova="seg-${v}"] button:not(.active)`)!;
          const s = getComputedStyle(ativo);
          out[v] = {fundo: s.backgroundColor, letra: s.color, sombra: s.boxShadow, fio: getComputedStyle(ativo, "::after").content,
            contraste: W.__ct(s.color, W.__fundo(ativo) as string), ponto: getComputedStyle(ativo, "::before").backgroundColor,
            pontoOutro: getComputedStyle(outro, "::before").backgroundColor,
            larguraPonto: [getComputedStyle(ativo, "::before").width, getComputedStyle(outro, "::before").width]};
        }
        out.tokens = {segment: W.__cor("backgroundColor", "var(--segment)"), foreground: W.__cor("backgroundColor", "var(--foreground)"),
          primary: W.__cor("backgroundColor", "var(--primary)")};
        return out;
      }) as Record<string, {fundo: string; letra: string; sombra: string; fio: string; contraste: number; ponto: string; pontoOutro: string; larguraPonto: string[]}> & {tokens: Record<string, string>};
      const t = r.tokens;
      expect(r.neutral.fundo).toBe(t.segment);
      expect(r.contrast.fundo).toBe(t.foreground);
      expect(r.brand.fundo).toBe(t.primary);
      expect(r.ring.sombra, "o aro por dentro").toContain("inset");
      expect(r.dot.ponto, "o ponto do aceso é o amarelo").toBe(t.primary);
      expect(r.dot.pontoOutro, "o lugar do ponto existe, sem cor").toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
      expect(r.dot.larguraPonto[0]).toBe(r.dot.larguraPonto[1]);
      for (const v of ["neutral", "contrast", "brand", "ring", "dot"]) expect(["none", "normal"], `${v}: sem o fio`).toContain(r[v].fio);
      for (const v of ["current", "neutral", "contrast", "brand", "ring", "dot"]) expect(r[v].contraste, `${v}: a letra`).toBeGreaterThanOrEqual(4.5);
    });

    test("a linha do tempo: o aro, o último em destaque, o grafite e a hora à esquerda com o trilho junto", async ({page: p}) => {
      await abrir(p, `tema=${tema}`);
      await p.addScriptTag({content: AJUDA});
      const r = await p.evaluate(() => {
        const W = window as unknown as Record<string, (...a: string[]) => unknown>;
        const pontos = (v: string) => [...document.querySelectorAll(`[data-prova="linha-${v}"] .timeline-dot`)].map((e) => getComputedStyle(e));
        const time = document.querySelector('[data-prova="linha-time"]')!;
        const hora = time.querySelector("small")!.getBoundingClientRect(), ponto = time.querySelector(".timeline-dot")!.getBoundingClientRect();
        const li = time.querySelector("li")!, trilho = getComputedStyle(li, "::before");
        return {
          primary: W.__cor("backgroundColor", "var(--primary)"), muted: W.__cor("backgroundColor", "var(--muted-foreground)"),
          foreground: W.__cor("backgroundColor", "var(--foreground)"),
          ring: pontos("ring").map((s) => [s.backgroundColor, s.boxShadow.includes("inset")]),
          latest: pontos("latest").map((s) => [s.backgroundColor, s.boxShadow !== "none"]),
          contrast: pontos("contrast").map((s) => s.backgroundColor),
          horaAntes: hora.right <= ponto.left, centroDoPonto: ponto.left + ponto.width / 2 - li.getBoundingClientRect().left,
          trilhoX: parseFloat(trilho.left) + parseFloat(trilho.width) / 2,
        };
      });
      for (const [fundo, aro] of r.ring) { expect(fundo).toMatch(/rgba\(0, 0, 0, 0\)|transparent/); expect(aro).toBe(true); }
      expect(r.latest.slice(0, -1).every(([f, h]) => f === r.muted && !h), "os anteriores na cor fraca, sem halo").toBe(true);
      expect(r.latest.at(-1), "o último no amarelo, com o halo").toEqual([r.primary, true]);
      expect(r.contrast.every((f) => f === r.foreground)).toBe(true);
      expect(r.horaAntes, "a hora à esquerda do ponto").toBe(true);
      expect(Math.abs(r.trilhoX - r.centroDoPonto), "o trilho no centro do ponto").toBeLessThan(1);
    });

    for (const lugar of ["floating", "edge"] as const) {
      test(`a barra de baixo (${lugar}): os treze estilos nos nove formatos — a letra e o ícone do atual se leem`, async ({page: p}) => {
        const falhas: string[] = [];
        let medidos = 0;
        for (const forma of FORMAS) {
          await abrir(p, `tema=${tema}&ind=${forma}&var=${lugar}`);
          await p.addScriptTag({content: AJUDA});
          const r = await p.evaluate((estilos) => {
            const W = window as unknown as Record<string, (...a: unknown[]) => unknown>;
            return estilos.map((v) => {
              const nav = document.querySelector(`[data-prova="bn-${v}"] .bottom-nav`)!;
              const atual = nav.querySelector(".bottom-nav-item[aria-current]")!;
              const nome = atual.querySelector(".bottom-nav-label")!, icone = atual.querySelector(".bottom-nav-mark .icon")!;
              const outros = [...nav.querySelectorAll(".bottom-nav-item:not([aria-current]) .bottom-nav-label")];
              const visivel = (e: Element) => !e.classList.contains("sr-only");
              return {v, nome: visivel(nome) ? W.__ct(getComputedStyle(nome).color, W.__fundo(nome)) : null,
                icone: W.__ct(getComputedStyle(icone).color, W.__fundo(icone)),
                outros: outros.filter(visivel).map((e) => W.__ct(getComputedStyle(e).color, W.__fundo(e))),
                barraAmarela: getComputedStyle(nav).backgroundColor === W.__cor("backgroundColor", "var(--primary)")};
            });
          }, ATUAL) as Array<{v: string; nome: number | null; icone: number; outros: number[]; barraAmarela: boolean}>;
          for (const x of r) {
            medidos++;
            const onde = `${forma} · ${x.v}`;
            if (x.v === "brand-white") continue; // a reprovação consciente, medida no teste de baixo
            if (x.nome != null && x.nome < 4.5) falhas.push(`${onde}: o nome do atual a ${x.nome.toFixed(2)}:1`);
            if (x.icone < 3) falhas.push(`${onde}: o ícone do atual a ${x.icone.toFixed(2)}:1`);
            if (x.v.startsWith("bar-")) {
              if (!x.barraAmarela) falhas.push(`${onde}: a barra não é amarela`);
              for (const c of x.outros) if (c < 4.5) falhas.push(`${onde}: um nome desligado a ${c.toFixed(2)}:1`);
            } else if (x.barraAmarela) falhas.push(`${onde}: a barra ficou amarela sem ser estilo de barra`);
          }
        }
        expect(medidos, "os treze estilos nos nove formatos").toBe(13 * 9);
        expect(falhas).toEqual([]);
      });
    }

    test("o `brand-white` é a reprovação consciente: o ícone branco no amarelo, abaixo de 3:1 — e só ele", async ({page: p}) => {
      await abrir(p, `tema=${tema}&ind=capsule`);
      await p.addScriptTag({content: AJUDA});
      const c = await p.evaluate(() => {
        const W = window as unknown as Record<string, (...a: unknown[]) => unknown>;
        const icone = document.querySelector('[data-prova="bn-brand-white"] .bottom-nav-item[aria-current] .bottom-nav-mark .icon')!;
        return W.__ct(getComputedStyle(icone).color, W.__fundo(icone)) as number;
      });
      expect(c).toBeLessThan(2);
      expect(c).toBeGreaterThan(1.8);
    });
  });
}

// ~~A `ember` fica de fora: os estilos novos não a alcançam.~~ → A Ember RECEBE os estilos, como as outras
// marcas (o Victor, 28/10/2026: "Sim, como as outras"); o padrão dela, sem estilo escolhido, continua o de antes (quem prova
// é o `ember-congelada.spec.ts`). Provado contra o defeito: com a seção do passo B ainda excluindo a Ember, os três estilos
// saem iguais ao padrão e reprova.
for (const marca of ["ember"]) test(`a ${marca} recebe os estilos novos, como as outras marcas`, async ({page: p}) => {
  await abrir(p, `tema=light&marca=${marca}`);
  const r = await p.evaluate(() => {
    const fundo = (sel: string) => getComputedStyle(document.querySelector(sel)!).backgroundColor;
    const tinta = (v: string) => { const s = document.createElement("span"); s.style.background = `var(${v})`; document.body.append(s);
      const c = getComputedStyle(s).backgroundColor; s.remove(); return c; };
    return {segAtual: fundo('[data-prova="seg-current"] .active'), segContraste: fundo('[data-prova="seg-contrast"] .active'),
      barra: fundo('[data-prova="bn-bar-ink"] .bottom-nav'), barraPadrao: fundo('[data-prova="bn-current"] .bottom-nav'),
      ligadoContraste: fundo('[data-prova="ligado-contrast"] > .btn.toggle[data-pressed]'), ligadoPadrao: fundo('[data-prova="ligado-brand"] > .btn.toggle[data-pressed]'),
      texto: tinta("--foreground"), primario: tinta("--primary")};
  });
  expect(r.segContraste).not.toBe(r.segAtual);
  expect(r.segContraste).toBe(r.texto);
  expect(r.barra).not.toBe(r.barraPadrao);
  expect(r.barra).toBe(r.primario);
  expect(r.ligadoContraste).toBe(r.texto);
});

test("o botão ligado cinza ganha o contorno de 3:1 com \"aumentar contraste\" — e só com ele", async ({browser}) => {
  for (const [contrast, esperaContorno] of [["more", true], ["no-preference", false]] as const) {
    const ctx = await browser.newContext({contrast});
    const p = await ctx.newPage();
    await abrir(p, "tema=light");
    const sombra = await p.evaluate(() => getComputedStyle(document.querySelector('[data-prova="ligado-neutral"] > .btn.toggle[data-pressed]')!).boxShadow);
    expect(sombra.includes("inset"), `contrast=${contrast}`).toBe(esperaContorno);
    await ctx.close();
  }
});

// A BARRA NA MESMA ALTURA NO CELULAR (27/10/2026, ADR-0084): as nove barras do nativo, rodando pelo `react-native-web` na
// página do site, medem o mesmo. Era 61 nos redondos e na cápsula e 57 no `circle-bold`, contra 53 nos outros.
test("a barra de baixo do celular: os nove formatos na mesma altura", async ({page: p}) => {
  await p.goto("/apps/catalog/native-bottomnav.html", {waitUntil: "networkidle"});
  await p.waitForSelector('[aria-label="Main menu, circle-bold"]');
  const alturas = await p.evaluate((formas) => Object.fromEntries(formas.map((f) => {
    const el = document.querySelector(`[aria-label="Main menu, ${f}"]`);
    return [f, el ? Math.round(el.getBoundingClientRect().height * 10) / 10 : -1];
  })), FORMAS);
  const doNone = alturas.none;
  expect(doNone).toBeGreaterThan(0);
  for (const f of FORMAS) expect(Math.abs(alturas[f] - doNone), `${f}: ${alturas[f]} contra ${doNone} no none`).toBeLessThanOrEqual(0.5);
});
