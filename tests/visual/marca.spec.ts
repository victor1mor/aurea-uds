import {test, expect, type Page} from "@playwright/test";
import {readFileSync} from "node:fs";

// ── O EIXO DE MARCA, medido na tela (ADR-0036) ──────────────────────────────────────
// Nasceu de dois defeitos do mesmo dia, 20/08/2026, e os dois passaram por TODOS os gates que
// já existiam. O que eles têm em comum é o que este arquivo existe para cobrir: a Aurea é a
// única paleta que qualquer gate exercitava, e sob ela os dois eram invisíveis.
//
//  1. O item ATUAL da lateral usava `--secondary`/`--foreground`, que são tokens da PÁGINA. Na
//     Aurea o painel e a página têm a mesma claridade, então nunca apareceu; sob `lory`, cuja
//     lateral é escura mesmo no tema claro, virava pílula quase branca com texto escuro.
//  2. Os links da lateral do catálogo não têm atributo `class`, então a regra de LINK DE PROSA
//     (`[data-theme="light"] a:not([class])`, peso 0,2,1) ganhava da regra da lateral (0,1,1) e
//     pintava o item em repouso com `color-mix(--primary, --foreground)` — marrom escuro sobre
//     painel escuro, `oklab(0.44 0.059 0.051)`.
//
// POR QUE ELEMENTO E NÃO TOKEN: a primeira tentativa de trava mediu par de token e teria passado
// nos dois casos — os tokens estavam certos, quem errava era a cascata. Quem responde "isto se
// lê?" é o que o navegador PINTOU, e é o que se mede aqui.
//
// POR QUE OS TRÊS PAPÉIS: eu medi só o ATIVO, dei o conserto por pronto, e o Victor apontou os
// inativos — que são a maioria da lateral. Um papel não representa os outros.
//
// O eixo é combinatório por natureza: toda marca nova entra nesta matriz sem teste novo.
// AS MARCAS SAEM DO ARQUIVO DE TOKENS, e isso é o cabeçalho acima cumprindo o que promete
// ("toda marca nova entra nesta matriz sem teste novo"). Escrita à mão, a lista dizia isso e não
// fazia: a `lory` só estava aqui porque alguém a digitou, e a próxima marca entraria muda. `""` é
// a Aurea — documento sem `data-brand`.
// O filtro de `$` não é zelo: sem ele o `$description` do nó `brand` — metadado do DTCG — virava
// uma MARCA chamada `$description`. `data-brand="$description"` não casa com nada, o documento
// seguia sendo a Aurea, e o teste passava medindo a marca padrão duas vezes. Aprovação por
// cegueira é pior que reprovação, e este gate nasceu justamente de um buraco desses.
const MARCAS: string[] = ["",
  ...Object.keys(JSON.parse(readFileSync("packages/tokens/src/aurea.tokens.json", "utf8")).brand ?? {})
    .filter(k => !k.startsWith("$"))];
const TEMAS = ["light", "dark"] as const;
const PAGINA = "/apps/catalog/memoryledger.html";
const AA = 4.5;

type Medida = {ativo: number; repouso: number; rotulo: number; lumPagina: number; lumPainel: number};

async function medir(page: Page, marca: string, tema: string): Promise<Medida> {
  await page.evaluate(([m, t]) => {
    if (m) document.documentElement.dataset.brand = m;
    else delete document.documentElement.dataset.brand;
    document.documentElement.dataset.theme = t;
  }, [marca, tema]);
  // O tema tem transição declarada; ler no mesmo quadro devolve a cor ANTIGA e o teste mede o
  // estado errado sem falhar. Já custou uma sessão inteira — está registrado no protocolo.
  await page.waitForTimeout(350);
  return page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const ctx = cv.getContext("2d", {willReadFrequently: true})!;
    // Compor num canvas é o que resolve DUAS coisas de uma vez: `getComputedStyle` devolve
    // `oklch()`/`oklab()`, que uma conta de luminância RGB leria como lixo, e as cores da lateral
    // usam `color-mix(... , transparent)` — alfa que só vira cor de verdade sobre o fundo dela.
    const rgb = (cor: string, base?: string): [number, number, number] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = base ?? "#fff";
      ctx.fillRect(0, 0, 1, 1);
      ctx.fillStyle = cor;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    const lum = (c: [number, number, number]) => {
      const [r, g, b] = c.map(x => {
        const v = x / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const razao = (a: [number, number, number], b: [number, number, number]) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
      return +((x + 0.05) / (y + 0.05)).toFixed(2);
    };
    const lateral = document.querySelector(".app-shell > .sidebar")!;
    const painelCor = getComputedStyle(lateral).backgroundColor;
    const painel = rgb(painelCor);
    const painelHex = `rgb(${painel.join(",")})`;
    const ativo = lateral.querySelector("a.active")!;
    const repouso = lateral.querySelector("a:not(.active)")!;
    const rotulo = lateral.querySelector(".nav-group-label, h4")!;
    const csAtivo = getComputedStyle(ativo);
    // O ativo tem fundo PRÓPRIO: medir contra o painel mentiria a favor.
    const fundoAtivo = rgb(csAtivo.backgroundColor, painelHex);
    return {
      ativo: razao(rgb(csAtivo.color, `rgb(${fundoAtivo.join(",")})`), fundoAtivo),
      repouso: razao(rgb(getComputedStyle(repouso).color, painelHex), painel),
      rotulo: razao(rgb(getComputedStyle(rotulo).color, painelHex), painel),
      lumPagina: lum(rgb(getComputedStyle(document.body).backgroundColor)),
      lumPainel: lum(painel),
    };
  });
}

test.describe("marca · a lateral se lê em toda combinação", () => {
  for (const marca of MARCAS) {
    for (const tema of TEMAS) {
      const nome = marca || "aurea";
      test(`${nome} · ${tema}`, async ({page}) => {
        await page.goto(PAGINA);
        const m = await medir(page, marca, tema);
        expect.soft(m.ativo, `${nome}/${tema}: o item ATUAL contra o fundo dele`)
          .toBeGreaterThanOrEqual(AA);
        expect.soft(m.repouso, `${nome}/${tema}: o item em REPOUSO contra o painel — a maioria `
          + "da lateral, e o papel que passou despercebido em 20/08/2026")
          .toBeGreaterThanOrEqual(AA);
        expect.soft(m.rotulo, `${nome}/${tema}: o rótulo de grupo contra o painel`)
          .toBeGreaterThanOrEqual(AA);
        // A LATERAL É SUPERFÍCIE, e superfície NUNCA é mais escura que a página em que pousa.
        // Esta é a trava que faltava quando o Victor apontou o painel azulado do `lory` no tema
        // escuro: as três medidas de contraste acima passavam, porque cada uma media o painel
        // contra ELE MESMO. O defeito estava na RELAÇÃO — eu tinha mapeado a lateral para o
        // trilho escuro do app deles (`--side`) em vez de mapear para superfície, e ela saiu
        // MAIS ESCURA que a página, o contrário do que a Aurea faz nos dois temas.
        expect.soft(m.lumPainel, `${nome}/${tema}: a lateral é superfície — não pode ser mais `
          + "escura que a página. Medir cor isolada não pega isto; só a relação pega")
          .toBeGreaterThanOrEqual(m.lumPagina);
      });
    }
  }

  // A marca não pode vazar para quem não pediu: sem `data-brand` o documento é a Aurea, e o
  // amarelo dela é invariável entre os temas — que é o contrato que a ADR-0036 preservou ao
  // mudar o ESCOPO da regra em vez de afrouxá-la.
  test("sem data-brand, o primário é o amarelo da Aurea nos dois temas", async ({page}) => {
    await page.goto(PAGINA);
    const cores: string[] = [];
    for (const tema of TEMAS) {
      await page.evaluate(t => {
        delete document.documentElement.dataset.brand;
        document.documentElement.dataset.theme = t;
      }, tema);
      await page.waitForTimeout(300);
      cores.push(await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()));
    }
    expect(cores[0], "o amarelo não muda entre claro e escuro").toBe(cores[1]);
    expect(cores[0]).toContain("0.795");
  });

  // E a marca PRECISA mudar alguma coisa, senão ela é decoração no seletor. Prova pelo outro
  // lado: com `data-brand`, o primário deixa de ser o da Aurea.
  test("com data-brand=lory, o primário deixa de ser o da Aurea", async ({page}) => {
    await page.goto(PAGINA);
    await page.evaluate(() => {
      document.documentElement.dataset.brand = "lory";
      document.documentElement.dataset.theme = "light";
    });
    await page.waitForTimeout(300);
    const cor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--primary").trim());
    expect(cor).not.toContain("0.795");
  });
});

// ── O CRACHÁ SEMÂNTICO EM TODA MARCA ─────────────────────────────────────────────────────────
// Achado em 29/08/2026, e o buraco era do GATE, não de quem escreveu a paleta: as 18 combinações
// de crachá do `skin.spec.ts` montam só a marca PADRÃO. A ADR-0036 diz que marca redefine COR —
// que é exatamente o eixo que aquele gate cobra —, então nenhuma marca jamais passou por ele.
//
// O que estava escondido ali: na `lory`, o crachá `warning` no tema claro media **1,74:1**. Os
// quatro semânticos do claro e o `danger` do escuro estavam abaixo do AA. A causa é estrutural e
// vale para qualquer marca lida de um kit: o degrau `-400` vem do MEIO da rampa, e sobre um
// `-bg` de claridade 0,95 nada do meio da rampa se lê.
//
// Aqui se mede o que o navegador PINTOU, na página do próprio componente, e não o par de tokens
// — a mesma razão que o cabeçalho deste arquivo dá para as medidas da lateral: o token pode estar
// certo e a cascata errada.
const SEMANTICAS = ["info", "success", "warning", "danger"] as const;

test.describe("marca · o crachá semântico se lê em toda combinação", () => {
  for (const marca of MARCAS) {
    for (const tema of TEMAS) {
      const nome = marca || "aurea";
      test(`${nome} · ${tema}`, async ({page}) => {
        await page.goto("/apps/catalog/badge.html");
        await page.evaluate(([m, t]) => {
          if (m) document.documentElement.dataset.brand = m;
          else delete document.documentElement.dataset.brand;
          document.documentElement.dataset.theme = t;
        }, [marca, tema]);
        await page.waitForTimeout(350);   // a transição de cor do core; ver o comentário em `medir`
        const razoes = await page.evaluate((sems) => {
          const cv = document.createElement("canvas");
          cv.width = cv.height = 1;
          const ctx = cv.getContext("2d", {willReadFrequently: true})!;
          const rgb = (cor: string, base?: string): [number, number, number] => {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = base ?? "#fff"; ctx.fillRect(0, 0, 1, 1);
            ctx.fillStyle = cor; ctx.fillRect(0, 0, 1, 1);
            const d = ctx.getImageData(0, 0, 1, 1).data;
            return [d[0], d[1], d[2]];
          };
          const lum = (c: [number, number, number]) => {
            const [r, g, b] = c.map(x => {
              const v = x / 255;
              return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          const razao = (a: [number, number, number], b: [number, number, number]) => {
            const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
            return +((x + 0.05) / (y + 0.05)).toFixed(2);
          };
          const fora: Record<string, number> = {};
          const pagina = `rgb(${rgb(getComputedStyle(document.body).backgroundColor).join(",")})`;
          for (const sem of sems) {
            const el = document.querySelector(`.badge-${sem}`);
            if (!el) { fora[sem] = -1; continue; }   // -1 acusa a AUSÊNCIA em vez de passar calado
            const cs = getComputedStyle(el);
            // o fundo do crachá é `color-mix(..., transparent)` em várias variantes: só vira cor
            // de verdade composto sobre a página, e é por isso que ele entra como base.
            const fundo = rgb(cs.backgroundColor, pagina);
            fora[sem] = razao(rgb(cs.color, `rgb(${fundo.join(",")})`), fundo);
          }
          return fora;
        }, SEMANTICAS as unknown as string[]);
        for (const sem of SEMANTICAS) {
          expect.soft(razoes[sem], `${nome}/${tema}: o crachá \`${sem}\` contra o fundo dele — ` +
            "-1 quer dizer que a página não tem esse crachá, e aí não é aprovação, é cegueira")
            .toBeGreaterThanOrEqual(AA);
        }
      });
    }
  }
});
