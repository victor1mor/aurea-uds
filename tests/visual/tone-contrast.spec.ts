import {test, expect} from "@playwright/test";

// GATE DE CONTRASTE DA MATRIZ DE TOM — aparência × tom, nos dois temas, no navegador de verdade.
//
// Por que aqui e não no vitest: o que se cobra é a cor PINTADA, e ela é o resultado da cascata
// inteira mais `color-mix` mais os tokens por tema. Simular isso em jsdom seria reimplementar o
// motor de CSS e acreditar na reimplementação. O teste unitário de `button-tone` cobra a
// ESTRUTURA (toda célula tem regra, e a regra vence); este cobra o RESULTADO.
//
// Ele nasceu de um achado, não de zelo: a varredura que fiz para verificar os tons novos
// (21/08/2026) reprovou três células que **já estavam publicadas** — `.btn-primary-outline` e
// `.btn-primary-ghost` pintavam o rótulo com `--primary` cru, e no tema claro isso dá 1.73:1.
// Nenhum gate existente olhava para contraste. Sem este arquivo, o próximo tom entra torto do
// mesmo jeito.
const APARENCIAS = ["solid", "outline", "ghost", "link", "nav"] as const;
const TONS = ["neutral", "brand", "danger", "success", "warning", "info"] as const;
const ANTIGA: Record<string, string> = {
  "solid/brand": "primary", "solid/neutral": "secondary", "outline/neutral": "outline",
  "ghost/neutral": "ghost", "outline/brand": "primary-outline", "ghost/brand": "primary-ghost",
  "solid/danger": "danger", "outline/danger": "danger-outline", "ghost/danger": "danger-ghost",
  "link/neutral": "link", "link/brand": "link-primary", "link/danger": "link-danger",
  "nav/neutral": "nav",
};
const skin = (a: string, t: string) =>
  ANTIGA[`${a}/${t}`] ? `btn-${ANTIGA[`${a}/${t}`]}` : `btn-${a} btn-tone-${t}`;

// `getComputedStyle` devolve `oklch()` para token e `oklab()` para `color-mix` — nunca sRGB. A
// conversão é feita aqui, e não por leitura de pixel: medir pixel passa pelo gerenciamento de
// cor do navegador e deriva (medido em 21/08: a mesma cor lia diferente entre duas chamadas).
function paraSrgb(css: string): [number, number, number] {
  const n = (css.split("/")[0].match(/-?[\d.]+/g) ?? []).map(Number);
  if (css.startsWith("rgb")) return [n[0] / 255, n[1] / 255, n[2] / 255];
  let [L, A, B] = n;
  if (css.startsWith("oklch")) { const r = (n[2] * Math.PI) / 180; A = n[1] * Math.cos(r); B = n[1] * Math.sin(r); }
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3;
  const f = (x: number) => Math.min(1, Math.max(0, x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055));
  return [f(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    f(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    f(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)];
}
const lum = (c: [number, number, number]) => {
  const g = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * g(c[0]) + 0.7152 * g(c[1]) + 0.0722 * g(c[2]);
};
const razao = (a: string, b: string) => {
  const [x, y] = [lum(paraSrgb(a)), lum(paraSrgb(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

for (const tema of ["dark", "light"] as const) {
  test(`contraste · matriz de tom · tema ${tema}`, async ({page}) => {
    // Uma página real do catálogo: assim o CSS medido é o mesmo que o consumidor recebe, com a
    // camada `@layer aurea` e a ordem de origem de verdade.
    await page.goto("/apps/catalog/button.html");
    if (tema === "light") {
      await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
      await page.waitForTimeout(600);
    }
    const medidas = await page.evaluate(({APARENCIAS, TONS, fonte}) => {
      const skin = new Function("a", "t", `return (${fonte})(a,t)`) as (a: string, t: string) => string;
      const caixa = document.createElement("div");
      document.body.append(caixa);
      const r: Record<string, {fg: string; bg: string; bd: string; pagina: string}> = {};
      const fundoDe = (e: Element) => {
        for (let x = e.parentElement; x; x = x.parentElement) {
          const c = getComputedStyle(x).backgroundColor;
          if (c !== "rgba(0, 0, 0, 0)") return c;
        }
        return getComputedStyle(document.body).backgroundColor;
      };
      for (const a of APARENCIAS) for (const t of TONS) {
        const b = document.createElement("button");
        b.className = `btn ${skin(a, t)}`;
        b.textContent = "Action";
        caixa.append(b);
        const s = getComputedStyle(b);
        const pagina = fundoDe(b);
        r[`${a}/${t}`] = {fg: s.color, bd: s.borderTopColor, pagina,
          bg: s.backgroundColor === "rgba(0, 0, 0, 0)" ? pagina : s.backgroundColor};
      }
      caixa.remove();
      return r;
    }, {APARENCIAS: [...APARENCIAS], TONS: [...TONS],
        fonte: `(a,t)=>{const A=${JSON.stringify(ANTIGA)};return A[a+"/"+t]?"btn-"+A[a+"/"+t]:"btn-"+a+" btn-tone-"+t}`});

    for (const a of APARENCIAS) for (const t of TONS) {
      const c = medidas[`${a}/${t}`];
      // 4.5:1 = WCAG 2.2 SC 1.4.3 para texto normal. O rótulo do botão é 13px/500: não é
      // "texto grande", então não vale a exceção de 3:1.
      expect(razao(c.fg, c.bg), `${a} × ${t}: rótulo a ${razao(c.fg, c.bg).toFixed(2)}:1`)
        .toBeGreaterThanOrEqual(4.5);
      // 3:1 = SC 1.4.11, contraste de componente de interface: a borda é o que diz onde o
      // botão começa e termina, então ela é informação, não enfeite.
      if (a === "outline") {
        expect(razao(c.bd, c.pagina), `${a} × ${t}: borda a ${razao(c.bd, c.pagina).toFixed(2)}:1`)
          .toBeGreaterThanOrEqual(3);
      }
    }
  });
}

// ── os PAPÉIS DE TEXTO do sistema, sobre as superfícies em que eles aparecem ─────────────────
//
// G-A11Y-05. O gate acima cobre a matriz do botão; nada cobria a cor de texto SOLTA. O axe achou
// (22/08/2026, na varredura do catálogo) que um `<a>` em prosa reprovava no tema claro, e a
// medição à mão explicou por quê: o core pintava o link com `--primary`, que é o amarelo da
// marca — **1,73:1** sobre o fundo claro, contra os 4,5:1 do SC 1.4.3. Todo link em prosa
// reprovava, no tema claro, desde sempre. Ninguém via porque o projeto se desenvolve no escuro
// (lá dá 10,34:1) e o catálogo repinta os próprios links.
//
// A raiz é a mesma da ADR-0044, e é por isso que a correção não foi "escurecer o amarelo":
// `--primary` é INVARIÁVEL entre temas porque é identidade. Um papel semântico que precisa mudar
// com o tema não pode ser servido por ele. O link ganhou `--link`/`--link-hover`.
//
// A pergunta "quem mais tem esse problema?" foi feita ANTES de escrever este bloco, varrendo
// 11 papéis de texto × 5 superfícies × 2 temas: no escuro **nenhuma** reprovação; no claro,
// só `--primary` — que está fora da lista abaixo de propósito, e a razão está no comentário dele.
const PAPEIS_DE_TEXTO = ["--foreground", "--muted-foreground", "--subtle-foreground",
  "--link", "--link-hover", "--secondary-foreground", "--success", "--warning", "--info",
  "--danger-400"];
// `--primary` NÃO entra: ele é preenchimento (com `--primary-foreground` por cima), nunca texto
// sobre a página. Incluí-lo faria o gate cobrar 4,5:1 de uma cor que nunca é lida como texto —
// e a correção óbvia seria escurecer a marca, que é o que a identidade proíbe.
const SUPERFICIES = ["--background", "--card", "--secondary", "--popover", "--sidebar"];

for (const tema of ["dark", "light"] as const) {
  test(`contraste · papéis de texto sobre superfícies · tema ${tema}`, async ({page}) => {
    await page.goto("/apps/catalog/button.html");
    await page.evaluate(t => { document.documentElement.dataset.theme = t; }, tema);
    await page.waitForTimeout(600);

    // `getPropertyValue` devolve o token CRU, e `--link` no escuro vale `var(--brand-yellow)` —
    // que não é cor nenhuma fora de contexto. Quem resolve `var()` é o navegador: aplica-se o
    // token numa sonda e lê-se o COMPUTADO. Sem isto o teste compara strings, não cores.
    const cores = await page.evaluate(ns => {
      const sonda = document.createElement("span");
      document.body.append(sonda);
      const out: Record<string, string> = {};
      for (const n of ns) { sonda.style.color = `var(${n})`; out[n] = getComputedStyle(sonda).color; }
      sonda.remove();
      return out;
    }, [...PAPEIS_DE_TEXTO, ...SUPERFICIES]);

    // Controle NEGATIVO, e ele já pagou: a primeira versão desta medição dava
    // `--foreground` sobre `--background` = 1,00:1, o que é impossível — o corpo do texto é
    // legível. A causa era ler `oklch(0.985 0 0)` com regex de número e tratar `0.985` como um
    // canal 0-255. Se o corpo do texto não passar folgado, quem está errado é o teste.
    const controle = razao(cores["--foreground"], cores["--background"]);
    expect(controle, `controle: o corpo do texto mede ${controle.toFixed(2)}:1 — ` +
      `abaixo de 10 quem está errado é a medição, não o sistema`).toBeGreaterThan(10);

    for (const papel of PAPEIS_DE_TEXTO) for (const sup of SUPERFICIES) {
      const r = razao(cores[papel], cores[sup]);
      expect(r, `${papel} sobre ${sup}: ${r.toFixed(2)}:1 (SC 1.4.3 pede 4.5)`)
        .toBeGreaterThanOrEqual(4.5);
    }
  });
}

// E o elo que faltava. O bloco acima prova que o TOKEN `--link` tem contraste; não prova que o
// `<a>` o USA. Medido em 22/08/2026: devolvendo a regra do core para `--primary` e deixando o
// token certo no lugar, os quatro testes acima passavam — o defeito voltava inteiro e o gate não
// via. Um token bom apontado por ninguém não pinta nada.
//
// Então este cobra o elemento REAL, com a cascata real, que é a única coisa que o leitor vê.
for (const tema of ["dark", "light"] as const) {
  test(`contraste · um link de verdade, em prosa · tema ${tema}`, async ({page}) => {
    await page.goto("/apps/catalog/button.html");
    await page.evaluate(t => {
      document.documentElement.dataset.theme = t;
      // Fora de qualquer container do catálogo, que repinta os próprios links: o que se mede é o
      // que o CONSUMIDOR recebe ao instalar o core e escrever um parágrafo.
      const p = document.createElement("p");
      p.id = "prova-link";
      p.innerHTML = 'prosa com <a href="#" id="prova-a">um link</a> dentro';
      document.body.append(p);
    }, tema);
    await page.waitForTimeout(400);
    const {link, fundo, corpo} = await page.evaluate(() => {
      const a = document.getElementById("prova-a")!;
      let n: HTMLElement | null = a.parentElement, bg = "";
      while (n) { const c = getComputedStyle(n).backgroundColor;
        if (c && c !== "rgba(0, 0, 0, 0)") { bg = c; break; } n = n.parentElement; }
      return {link: getComputedStyle(a).color, fundo: bg,
        corpo: getComputedStyle(document.getElementById("prova-link")!).color};
    });
    const r = razao(link, fundo);
    expect(r, `link em prosa a ${r.toFixed(2)}:1 no tema ${tema} — SC 1.4.3 pede 4.5`)
      .toBeGreaterThanOrEqual(4.5);
    // e ele tem de se DISTINGUIR do corpo: um link da cor do texto, num parágrafo, só existe
    // para quem passa o ponteiro. SC 1.4.1 — cor não pode ser o único sinal, mas quando ela é
    // um dos sinais, precisa ser um sinal.
    const contraCorpo = razao(link, corpo);
    expect(contraCorpo, `link e corpo do texto a ${contraCorpo.toFixed(2)}:1 — indistinguíveis`)
      .toBeGreaterThanOrEqual(1.4);
  });
}
