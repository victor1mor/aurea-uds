import {test, expect, type Page} from "@playwright/test";
import {mkdirSync, readdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {pageType} from "../../scripts/page-model.mjs";
import {abrir} from "./abrir-pagina";
import {CONHECIDAS_CORES_FORCADAS, CONHECIDAS_MOVIMENTO, INTERMITENTES} from "./cores-forcadas-e-movimento.conhecidas";

// WEB-48 (lote 104, 25/11/2026 — aprovado pelo Victor em 24/11/2026: "Sim, conferência automática"): TODA peça do site, em
// duas preferências do sistema que o Playwright liga sem mexer no computador.
//
//   CORES FORÇADAS (`forced-colors: active`, o "alto contraste" do Windows). O navegador troca as cores de autor pelas do
//   sistema: fundo vira a cor da tela, borda e letra viram a cor do texto, e a SOMBRA some. Tudo o que a Aurea mostra só
//   com fundo colorido ou com sombra — o anel de foco feito de `box-shadow`, o escolhido que é só um fundo mais escuro — pode
//   sumir. Esta varredura não lê CSS: ela FOTOGRAFA a peça nos dois estados e cobra que a foto mude.
//     1. O foco: o Tab anda por toda prévia; a foto da peça focada tem de ser diferente da foto sem foco.
//     2. O estado: a caixa marcada × vazia, a aba escolhida × não, o botão ligado × desligado. Só conta o estado que MUDA
//        a foto no modo normal (um atributo que o CSS não lê não é estado desenhado); esse tem de mudar também nas cores
//        forçadas.
//   MENOS MOVIMENTO (`prefers-reduced-motion: reduce`). Nada anda, a não ser os dois laços aprovados na 0.81.0 (a rodinha
//   do `Spinner` e o círculo sem fim do `ProgressCircle`, que giram a um terço da velocidade).
//     3. Nenhum elemento (nem `::before`/`::after`) tem transição ou animação de mais de 0,01 ms, nenhuma animação está
//        andando, e nada rola suave.
//     4. Trocar de aba ou de segmento não dispara a animação de deslizar (a que o JavaScript da Aurea faz).
//
// O QUE REPROVA HOJE NÃO SE CONSERTA AQUI (a ordem do lote 104): consertar muda a aparência, e isso é decisão do Victor, com
// imagem. As reprovações que já existiam no dia em que a varredura nasceu estão em `cores-forcadas-e-movimento.conhecidas.ts`,
// cada uma pelo nome; o teste reprova o que for NOVO e também a exceção que deixou de reprovar (a lista só diminui).
//
// OS NAVEGADORES. O movimento roda nos três. As cores forçadas, só no Chromium (o porquê está no bloco delas); e o teste
// confere que a troca de cor acontece de verdade, para não passar sem olhar.

const DIR = join(process.cwd(), "apps/catalog");
const TODAS = [...readdirSync(DIR).filter((f) => f.endsWith(".html")).sort(),
  ...readdirSync(join(DIR, "embeds")).filter((f) => f.endsWith(".html")).sort().map((f) => `embeds/${f}`)];
// As peças moram nas páginas de componente da web e nas do nativo (`react-native-web`). `AUREA_PAGINAS` (nomes separados por
// vírgula) restringe a varredura numa medição à mão; a CI roda tudo.
const SO = process.env.AUREA_PAGINAS?.split(",").map((s) => s.trim()).filter(Boolean);
const filtrar = (lista: string[]) => (SO ? lista.filter((f) => SO.includes(f)) : lista);
const PECAS = filtrar(TODAS.filter((f) => pageType(f) === "component" || pageType(f) === "native"));
const PAGINAS = filtrar(TODAS);
const url = (f: string) => `/apps/catalog/${f}`;
const avisar = (texto: string) => {
  test.info().annotations.push({type: "queda-do-webkit", description: texto});
  console.log(`::warning::${texto}`);
};

// Transição e animação desligadas para FOTOGRAFAR: a foto sai do estado final, e não do meio do caminho.
// E a rolagem instantânea: o site rola suave, e a foto tirada logo depois de `scrollIntoView` saía no meio do caminho
// (a primeira rodada fotografou o bloco de código no lugar do botão).
const PARADO = "*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important;" +
  "scroll-behavior:auto!important}";

async function trocaDeVerdade(p: Page) {
  return p.evaluate(() => {
    const i = document.createElement("i");
    i.style.color = "rgb(1, 2, 3)";
    document.body.append(i);
    const cor = getComputedStyle(i).color;
    i.remove();
    return cor !== "rgb(1, 2, 3)";
  });
}

/** Abre a prévia `i`, espera a parte viva acender e devolve se ela existe e tem tamanho. */
async function prepararPrevia(p: Page, i: number) {
  // A página inteira carregada antes de medir: a chave de tema do site escolhe a opção depois que a parte viva termina, e
  // medir antes disso fazia o foco da opção escolhida aparecer numa rodada e não na outra (medido em 25/11/2026).
  if (i === 0) await p.waitForLoadState("networkidle").catch(() => {});
  const ok = await p.evaluate((i) => {
    const d = document.querySelectorAll<HTMLElement>(".demo-panel[data-panel='preview']")[i];
    if (!d) return false;
    const det = d.closest("details");
    if (det) det.open = true;
    d.scrollIntoView({block: "center"});
    return true;
  }, i);
  if (!ok) return false;
  await p.waitForFunction((i) => {
    const d = document.querySelectorAll<HTMLElement>(".demo-panel[data-panel='preview']")[i];
    const viva = d?.closest<HTMLElement>("[data-vivo]") ?? d?.querySelector<HTMLElement>("[data-vivo]");
    return !viva || !!viva.dataset.ligada;
  }, i, {timeout: 4000}).catch(() => {});
  return true;
}

type Regiao = {x: number; y: number; width: number; height: number};
/** A região que mostra a peça e quem desenha por ela (o irmão da marca, a moldura logo acima), com 8 de folga. */
function regiao(el: Element): Regiao | null {
  // O campo escondido (o `sr-only` do envio de arquivo, o `<input>` de 1 × 1 sob a marca): quem mostra o foco é a primeira
  // caixa de verdade acima dele — a área toda.
  let alvo: Element = el;
  for (let a = el.parentElement; a && el.getBoundingClientRect().width * el.getBoundingClientRect().height < 16; a = a.parentElement) {
    const r = a.getBoundingClientRect();
    if (r.width >= 16 && r.height >= 16) { alvo = a; break; }
  }
  el = alvo;
  const rs = [el.getBoundingClientRect()];
  // O campo INVISÍVEL dentro de um rótulo (o rádio do cartão do `RadioGroup`): quem desenha o foco é o rótulo inteiro, com
  // o anel em volta do cartão. Sem ele, a foto pegava só o pedaço do texto ao lado do campo e acusava um foco que se vê
  // (lote 110, 26/11/2026 — medido na foto grande: o anel do cartão aparece).
  if (getComputedStyle(el).opacity === "0") {
    const r = el.closest("label")?.getBoundingClientRect();
    if (r && r.width <= 640 && r.height <= 320) rs.push(r);
  }
  if (el.nextElementSibling) rs.push(el.nextElementSibling.getBoundingClientRect());
  const pai = el.parentElement, r0 = rs[0];
  if (pai) {
    const r = pai.getBoundingClientRect();
    if (r.width <= Math.max(3 * r0.width, 80) && r.height <= Math.max(3 * r0.height, 80) && r.width <= 640 && r.height <= 320) rs.push(r);
  }
  const v = rs.filter((r) => r.width > 0 && r.height > 0);
  if (!v.length) return null;
  const x0 = Math.max(0, Math.min(...v.map((r) => r.left)) - 8), y0 = Math.max(0, Math.min(...v.map((r) => r.top)) - 8);
  // A área grande (a do envio de arquivo) fica inteira; o limite é a tela.
  const x1 = Math.min(innerWidth, Math.max(...v.map((r) => r.right)) + 8), y1 = Math.min(innerHeight, Math.max(...v.map((r) => r.bottom)) + 8);
  if (x1 - x0 < 2 || y1 - y0 < 2) return null;
  return {x: x0, y: y0, width: x1 - x0, height: y1 - y0};
}

const foto = (p: Page, r: Regiao) => p.screenshot({clip: r, animations: "disabled", caret: "hide"});
/** Nome curto e estável da peça, para a lista: a etiqueta e as duas primeiras classes, ou o papel e o nome. */
function nomeDaPeca(el: Element): string {
  const c = [...el.classList].slice(0, 2).join(".");
  const papel = el.getAttribute("role");
  const rot = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 24);
  return el.tagName.toLowerCase() + (c ? "." + c : "") + (papel ? "[role=" + papel + "]" : "") + (rot ? ` "${rot}"` : "");
}

/** Com `AUREA_FOTOS` (uma pasta), grava as fotos de cada reprovação — é delas que sai a lista com imagem para o Victor. */
function guardar(nome: string, fotos: Record<string, Buffer>) {
  const pasta = process.env.AUREA_FOTOS;
  if (!pasta) return;
  const base = nome.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 120);
  mkdirSync(pasta, {recursive: true});
  for (const [quando, png] of Object.entries(fotos)) writeFileSync(join(pasta, `${base}--${quando}.png`), png);
}

/** Compara a lista medida com a de exceções: reprova o novo E a exceção que não reprova mais. */
function conferir(medidas: Set<string>, conhecidas: readonly string[], titulo: string, alcance: string[]) {
  // A exceção de uma página que esta rodada não visitou (a `AUREA_PAGINAS`) não conta como resolvida.
  const visitadas = new Set(alcance);
  // A intermitente (ver o arquivo das conhecidas) não reprova quando aparece nem quando some.
  const novas = [...medidas].filter((m) => !conhecidas.includes(m) && !INTERMITENTES.includes(m)).sort();
  const resolvidas = conhecidas.filter((c) => visitadas.has(c.split(" · ")[0]) && !medidas.has(c));
  expect(novas, `${titulo} — reprovação NOVA (conserte, ou, se mudar a aparência, leve ao Victor com imagem):\n${novas.join("\n")}`).toEqual([]);
  expect(resolvidas, `${titulo} — exceção que deixou de reprovar: tire-a da lista de conhecidas:\n${resolvidas.join("\n")}`).toEqual([]);
}

// O orçamento sai da conta (a lição do `catalog-sweep`): por página de peça, as fotos do foco e dos estados.
test.describe.configure({timeout: Math.max(10 * 60_000, PECAS.length * 6_000)});

test.describe("cores forçadas (alto contraste do Windows)", () => {
  // SÓ NO CHROMIUM (a escolha do lote 104): o WebKit não tem o modo, e o Firefox repetiria a mesma troca de cores da
  // especificação dobrando o tempo da varredura (29 min no Chromium, medido em 25/11/2026). O alto contraste do Windows é o
  // do Edge, que é Chromium. O movimento, abaixo, roda nos três.
  test.skip(({browserName}) => browserName !== "chromium", "as cores forçadas se medem no Chromium (ver acima)");
  test("o foco de toda peça continua visível", async ({page: p}) => {
    await p.setViewportSize({width: 1280, height: 800});
    // Com "menos movimento" também: as peças do nativo animam em JavaScript (o CSS de parar não as alcança), e a foto
    // tirada no meio do caminho mediria a animação, não o estado.
    await p.emulateMedia({forcedColors: "active", reducedMotion: "reduce"});
    await abrir(p, url(PECAS[0]), avisar);
    expect(await trocaDeVerdade(p), "o Chromium deixou de trocar as cores — a varredura mediria nada").toBe(true);
    const medidas = new Set<string>();
    let paradas = 0;
    for (const f of PECAS) {
      await abrir(p, url(f), avisar);
      await p.addStyleTag({content: PARADO});
      const prevs = await p.locator(".demo-panel[data-panel='preview']").count();
      for (let i = 0; i < prevs; i++) {
        if (!(await prepararPrevia(p, i))) continue;
        await p.evaluate((i) => {
          const d = document.querySelectorAll<HTMLElement>(".demo-panel[data-panel='preview']")[i];
          (window as any).__prev = d;
          d.focus();
        }, i);
        for (let k = 0; k < 40; k++) {
          await p.keyboard.press("Tab");
          const alvo = await p.evaluateHandle(() => {
            const el = document.activeElement as HTMLElement | null;
            const prev = (window as any).__prev as HTMLElement;
            return el && prev.contains(el) && el !== prev ? el : null;
          });
          const el = alvo.asElement();
          if (!el) break;
          // O Tab que entra numa MOLDURA (`iframe`: as prévias que moram em documento próprio) segue lá dentro, e o anel
          // é desenhado no documento de dentro. As molduras não são medidas aqui (limite anotado na lista do lote 104).
          if (await el.evaluate((e) => e.tagName === "IFRAME")) break;
          await el.evaluate((e) => e.scrollIntoView({block: "nearest", inline: "nearest"}));
          const r = await el.evaluate(regiao);
          if (!r) continue;
          paradas++;
          const com = await foto(p, r);
          await el.evaluate((e) => (e as HTMLElement).blur());
          const sem = await foto(p, r);
          await el.evaluate((e) => (e as HTMLElement).focus({focusVisible: true} as FocusOptions));
          if (com.equals(sem)) {
            const nome = `${f} · foco · ${await el.evaluate(nomeDaPeca)}`;
            medidas.add(nome);
            // A foto do modo normal, para a lista de reprovações mostrar o que some.
            if (process.env.AUREA_FOTOS) {
              await p.emulateMedia({forcedColors: "none"});
              await el.evaluate((e) => (e as HTMLElement).focus({focusVisible: true} as FocusOptions));
              const normal = await foto(p, r);
              await p.emulateMedia({forcedColors: "active"});
              guardar(nome, {"normal-com-foco": normal, "forcadas-com-foco": com, "forcadas-sem-foco": sem});
            }
          }
        }
      }
    }
    expect(paradas, "poucas peças focadas — o Tab não entrou nas prévias").toBeGreaterThan(SO ? 0 : 300);
    conferir(medidas, CONHECIDAS_CORES_FORCADAS.filter((c) => c.includes(" · foco · ")), "foco invisível nas cores forçadas", PECAS);
  });

  test("o estado escolhido de toda peça continua visível", async ({page: p}) => {
    await p.setViewportSize({width: 1280, height: 800});
    // Com "menos movimento" também: as peças do nativo animam em JavaScript (o CSS de parar não as alcança), e a foto
    // tirada no meio do caminho mediria a animação, não o estado.
    await p.emulateMedia({forcedColors: "active", reducedMotion: "reduce"});
    await abrir(p, url(PECAS[0]), avisar);
    expect(await trocaDeVerdade(p), "o Chromium deixou de trocar as cores — a varredura mediria nada").toBe(true);
    const medidas = new Set<string>();
    let estados = 0;
    for (const f of PECAS) {
      await p.emulateMedia({forcedColors: "none"});
      await abrir(p, url(f), avisar);
      await p.addStyleTag({content: PARADO});
      const prevs = await p.locator(".demo-panel[data-panel='preview']").count();
      for (let i = 0; i < prevs; i++) {
        if (!(await prepararPrevia(p, i))) continue;
        // Os que guardam estado: o marcável do formulário e os atributos de estado que o CSS da Aurea lê.
        const n = await p.evaluate((i) => {
          const d = document.querySelectorAll<HTMLElement>(".demo-panel[data-panel='preview']")[i];
          const lista = [...d.querySelectorAll<HTMLElement>(
            "input[type=checkbox],input[type=radio],[aria-selected],[aria-pressed],[aria-checked]")]
            .filter((e) => !(e as HTMLInputElement).disabled && e.getAttribute("aria-hidden") !== "true");
          (window as any).__estados = lista;
          return lista.length;
        }, i);
        for (let k = 0; k < n; k++) {
          const el = (await p.evaluateHandle((k) => (window as any).__estados[k], k)).asElement();
          if (!el) continue;
          await el.evaluate((e) => (e.closest("label") ?? e).scrollIntoView({block: "nearest"}));
          const r = await el.evaluate(regiao);
          if (!r) continue;
          // A TROCA É A DE VERDADE: o clique, como a pessoa faz. Trocar só o atributo engana — a peça viva guarda o estado
          // também em classe (`.active` no segmento), e a foto media metade da troca (a primeira versão desta varredura
          // acusou segmentos assim). O que se escolhe uma vez só (aba, opção) se mede quando NÃO está escolhido, e o
          // clique o escolhe; o que liga e desliga (caixa, chave, botão ligado) se mede nos dois sentidos e volta como
          // estava. O item ATUAL da navegação (`aria-current`) fica de fora: ele é link (o clique sairia da página), e trocar
          // só o atributo deixa o selo "You are here" na tela — a foto mediria metade da troca (medido em 25/11/2026).
          const ler = () => el.evaluate((e) => e instanceof HTMLInputElement ? String(e.checked)
            : e.getAttribute("aria-selected") ?? e.getAttribute("aria-pressed") ?? e.getAttribute("aria-checked"));
          const escolhe = await el.evaluate((e) => ["tab", "radio", "option", "menuitemradio", "treeitem", "gridcell", "row"]
            .includes(e.getAttribute("role") ?? (e instanceof HTMLInputElement ? e.type : "")));
          const antes = await ler();
          if (escolhe && antes === "true") continue;
          // Depois do clique, espera o estado trocar (a peça do nativo responde num quadro seguinte) e mais dois quadros de
          // desenho. Sem isso a foto saía antes da troca, e uma rodada acusava o que a outra não acusava (medido em 25/11/2026).
          const trocar = async (de: string | null) => {
            await el.evaluate((e) => (e as HTMLElement).click());
            await p.waitForFunction(([e, de]) => {
              const x = e as Element;
              const v = x instanceof HTMLInputElement ? String(x.checked)
                : x.getAttribute("aria-selected") ?? x.getAttribute("aria-pressed") ?? x.getAttribute("aria-checked");
              return v !== de;
            }, [el, de] as const, {timeout: 500}).catch(() => {});
            await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
          };
          // Trocar o modo de cor recalcula a página inteira, e é o passo caro: o que liga e desliga só vai às cores forçadas
          // quando a troca muda a foto no modo normal. O que se escolhe uma vez precisa da foto de antes já nas duas.
          const nN = await foto(p, r);
          let fA: Buffer | null = null;
          if (escolhe) { await p.emulateMedia({forcedColors: "active"}); fA = await foto(p, r); await p.emulateMedia({forcedColors: "none"}); }
          await trocar(antes);
          const depois = await ler();
          if (depois === antes) continue;               // o clique não trocou (peça só de leitura, ou controlada sem dono)
          const nD = await foto(p, r);
          if (nN.equals(nD)) { if (!escolhe) await trocar(depois); continue; }  // no modo normal não muda: não é estado desenhado
          await p.emulateMedia({forcedColors: "active"});
          const fD = await foto(p, r);
          if (!escolhe) {
            // A foto "antes" só vale se o segundo clique DESFEZ a troca: o ponto do gráfico, por exemplo, continua escolhido
            // (a primeira versão comparava duas fotos do mesmo estado e acusava o gráfico do nativo).
            await trocar(depois);
            if ((await ler()) === antes) fA = await foto(p, r);
          }
          await p.emulateMedia({forcedColors: "none"});
          if (!fA) continue;
          estados++;
          if (fA.equals(fD)) {
            const nome = `${f} · estado · ${await el.evaluate(nomeDaPeca)}`;
            medidas.add(nome);
            guardar(nome, {"normal-antes": nN, "normal-depois": nD, "forcadas-antes": fA, "forcadas-depois": fD});
          }
        }
      }
    }
    expect(estados, "poucos estados medidos — o seletor deixou de casar").toBeGreaterThan(SO ? 0 : 100);
    conferir(medidas, CONHECIDAS_CORES_FORCADAS.filter((c) => c.includes(" · estado · ")), "estado invisível nas cores forçadas", PECAS);
  });
});

test.describe("menos movimento", () => {
  // Os dois laços aprovados (a 0.81.0): giram a um terço da velocidade, sem parar.
  const LACOS = ".spinner, .progress-circle-indeterminate > svg";

  test("nada anda: nenhuma transição, animação ou rolagem suave", async ({page: p}) => {
    test.setTimeout(Math.max(10 * 60_000, PAGINAS.length * 2_000));
    await p.emulateMedia({reducedMotion: "reduce"});
    const medidas = new Set<string>();
    for (const f of PAGINAS) {
      await abrir(p, url(f), avisar);
      await p.waitForLoadState("load");
      const achados = await p.evaluate((lacos) => {
        const seg = (v: string) => Math.max(0, ...v.split(",").map((x) => x.trim().endsWith("ms") ? parseFloat(x) / 1000 : parseFloat(x) || 0));
        const nome = (el: Element, pseudo: string) => {
          const c = [...el.classList].slice(0, 2).join(".");
          return el.tagName.toLowerCase() + (c ? "." + c : "") + pseudo;
        };
        const out = new Set<string>();
        for (const el of document.querySelectorAll("*")) {
          if (el.matches(lacos)) continue;
          for (const pseudo of ["", "::before", "::after"]) {
            const s = getComputedStyle(el, pseudo || null);
            if (pseudo && (s.content === "none" || s.content === "normal")) continue;
            // 0,01 ms é o que a regra global da Aurea deixa (`aurea.css`, `prefers-reduced-motion`): nada se vê.
            if (seg(s.transitionDuration) > 0.00002 && s.transitionProperty !== "none") out.add(`transição · ${nome(el, pseudo)} · ${s.transitionDuration}`);
            if (s.animationName !== "none" && seg(s.animationDuration) > 0.00002) out.add(`animação · ${nome(el, pseudo)} · ${s.animationName}`);
            if (s.scrollBehavior === "smooth") out.add(`rolagem suave · ${nome(el, pseudo)}`);
          }
        }
        for (const a of document.getAnimations()) {
          const alvo = (a.effect as KeyframeEffect | null)?.target;
          if (alvo?.matches?.(lacos)) continue;
          const d = Number((a.effect?.getComputedTiming().duration as number) ?? 0);
          if (a.playState === "running" && d > 1) out.add(`andando · ${alvo ? nome(alvo, "") : "?"} · ${d} ms`);
        }
        return [...out];
      }, LACOS);
      for (const a of achados) medidas.add(`${f} · ${a}`);
    }
    conferir(medidas, CONHECIDAS_MOVIMENTO.filter((c) => !c.includes(" · desliza · ")), "movimento com \"menos movimento\" ligado", PAGINAS);
  });

  test("trocar de aba ou de segmento não desliza", async ({page: p, browserName}) => {
    // Só no Chromium. Quem decide se o escolhido desliza é o JavaScript do pacote (`reduzMovimento()`, que pergunta ao
    // navegador por "menos movimento") — o mesmo código nos três; e a transição de CSS de toda página já é cobrada nos três
    // pelo teste de cima. No Firefox da CI este passeio por todas as prévias passou de 22 minutos (pedido #165).
    test.skip(browserName !== "chromium", "o deslizar é decidido pelo JavaScript do pacote, igual nos três navegadores");
    await p.emulateMedia({reducedMotion: "reduce"});
    const medidas = new Set<string>();
    let trocas = 0;
    for (const f of PECAS) {
      await abrir(p, url(f), avisar);
      const prevs = await p.locator(".demo-panel[data-panel='preview']").count();
      for (let i = 0; i < prevs; i++) {
        if (!(await prepararPrevia(p, i))) continue;
        const r = await p.evaluate((i) => {
          const d = document.querySelectorAll<HTMLElement>(".demo-panel[data-panel='preview']")[i];
          const alvos = [...d.querySelectorAll<HTMLElement>(
            'button[role=tab][aria-selected=false]:not([disabled]):not([aria-disabled=true]), .segmented button[role=radio][aria-checked=false]:not([disabled]):not([aria-disabled=true])')];
          const out: string[] = [];
          for (const a of alvos) {
            a.click();
            for (const an of document.getAnimations()) {
              const d2 = Number((an.effect?.getComputedTiming().duration as number) ?? 0);
              const alvo = (an.effect as KeyframeEffect | null)?.target;
              if (an.playState === "running" && d2 > 1 && !alvo?.matches?.(".spinner, .progress-circle-indeterminate > svg"))
                out.push(`${a.getAttribute("role") ?? "segmento"} "${(a.textContent || a.getAttribute("aria-label") || "").trim().slice(0, 20)}" · ${d2} ms`);
            }
          }
          return {n: alvos.length, out};
        }, i);
        trocas += r.n;
        for (const o of r.out) medidas.add(`${f} · desliza · ${o}`);
      }
    }
    expect(trocas, "nenhuma aba ou segmento trocado — o seletor deixou de casar").toBeGreaterThan(SO ? -1 : 10);
    conferir(medidas, CONHECIDAS_MOVIMENTO.filter((c) => c.includes(" · desliza · ")), "deslizar com \"menos movimento\" ligado", PECAS);
  });
});
