import {test, expect, type Page} from "@playwright/test";
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
import {CONHECIDAS_INVALIDO_NATIVO} from "./invalido-nativo.conhecidas";

// A VARREDURA DO INVÁLIDO DO NATIVO (lote 104, 25/11/2026 — aprovada pelo Victor em 24/11/2026: "Sim"). A web tem a dela
// desde 28/08/2026 (`invalido.spec.ts`), e ela deixava as páginas do nativo de fora: lá o erro é prop, e o `aria-invalid`
// posto à mão num elemento do `react-native-web` não muda nada. Quem media o nativo era só o teste de unidade, que pergunta
// ao dublê do React Native — e o dublê não desenha.
//
// Aqui o nativo é desenhado DE VERDADE, pelo `react-native-web`, pela mesma montagem que desenha as páginas do nativo no site
// (`apps/catalog/.nativo/ssr.mjs`, gerada por `pnpm build:catalog`). Cada campo sai duas vezes, sem erro e com erro, no MESMO
// arranjo (`apps/catalog/nativo/bancada-do-invalido.mjs`), em CADA uma das 13 marcas e nos dois temas — a regra do §8 do
// `CLAUDE.md`. O navegador calcula a cor de cada pedaço, e a varredura cobra o que a ADR-0094 decidiu:
//   1. o campo MOSTRA o erro: alguma cor do controle muda (o rótulo e a frase de erro não contam — eles mudam sozinhos);
//   2. no VERMELHO do erro: o que muda vai para o `danger400` do tema (a borda, o rótulo) ou o `destructive` (a caixa marcada
//      cheia) — nunca para uma terceira cor;
//   3. o FUNDO do campo não muda, a não ser para o vermelho cheio da caixa marcada;
//   4. no `Field`, o RÓTULO fica vermelho.
// E a FICHA: toda ficha que declara `invalid` e existe no nativo tem caso no banco, ou o motivo escrito.
//
// SÓ NO CHROMIUM: a medida é cor calculada de um desenho parado, e o desenho é o mesmo nos três navegadores — o
// `marcas-passo-c.spec.ts` (o contraste das marcas) faz a mesma escolha. O caminho que muda de navegador (o toque, o foco)
// não é deste teste.
//
// O que já reprovava no dia em que ela nasceu NÃO se conserta aqui: está em `invalido-nativo.conhecidas.ts`, pelo nome, e a
// lista só diminui.

const MARCAS = ["", "ember", "sun", "honey", "orange", "magenta", "violet", "indigo", "cobalt", "cyan", "turquoise", "emerald", "lime"];
const TEMAS = ["light", "dark"] as const;
type Caso = {ficha: string; nome: string; rotulo?: string; peca: (erro: boolean) => unknown};
type Ssr = {
  CASOS_DO_INVALIDO: Caso[];
  SEM_CASO_NO_NATIVO: Record<string, string>;
  desenharPeca: (el: unknown, tema: string, marca?: string) => {html: string; css: string};
  resolverTokens: (tema: string, densidade: string, fontes?: unknown, marca?: string) => {color: Record<string, string>};
};
const carregar = async () => (await import(pathToFileURL(join(process.cwd(), "apps/catalog/.nativo/ssr.mjs")).href)) as Ssr;
const FRASE = "Check this value.";

async function montar(p: Page, ssr: Ssr, tema: string, marca: string) {
  let css = "";
  const blocos = ssr.CASOS_DO_INVALIDO.map((c, i) => {
    const sem = ssr.desenharPeca(c.peca(false), tema, marca || undefined);
    const com = ssr.desenharPeca(c.peca(true), tema, marca || undefined);
    css = com.css;                              // a folha do `react-native-web` acumula: a última tem todas as regras
    return `<section data-caso="${i}"><div data-lado="sem">${sem.html}</div><div data-lado="com">${com.html}</div></section>`;
  });
  await p.setContent(`<!doctype html><html><head>${css}
    <style>*,*::before,*::after{transition:none!important;animation:none!important}</style></head>
    <body style="margin:0;display:grid;gap:24px;padding:24px">${blocos.join("")}</body></html>`);
}

/** Mede cada caso: o que muda entre a metade sem erro e a com erro, pedaço por pedaço. Roda DENTRO da página. */
function medir({frase, rotulos, vermelho, cheio}: {frase: string; rotulos: (string | null)[]; vermelho: string; cheio: string}) {
  const cor = (v: string) => { const i = document.createElement("i"); i.style.color = v; document.body.append(i); const c = getComputedStyle(i).color; i.remove(); return c; };
  const erroCores = new Set([cor(vermelho), cor(cheio)]);
  const textoProprio = (e: Element) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
  const LADOS = ["Top", "Right", "Bottom", "Left"] as const;
  const pinta = (e: Element) => {
    const s = getComputedStyle(e);
    const out: Record<string, string> = {fundo: s.backgroundColor, letra: s.color};
    for (const l of LADOS) if (parseFloat(s[`border${l}Width`]) > 0 && s[`border${l}Style`] !== "none") out[`borda${l}`] = s[`border${l}Color`];
    return out;
  };
  return [...document.querySelectorAll("section[data-caso]")].map((sec, i) => {
    const sem = [...sec.querySelector('[data-lado="sem"]')!.querySelectorAll("*")];
    const com = [...sec.querySelector('[data-lado="com"]')!.querySelectorAll("*")];
    if (sem.length !== com.length) return {i, arvore: `${sem.length} × ${com.length} elementos`, mudou: 0, foraDaCor: [] as string[], fundo: [] as string[], rotulo: null as boolean | null};
    let mudou = 0;
    const foraDaCor: string[] = [], fundo: string[] = [];
    let rotulo: boolean | null = null;
    for (let k = 0; k < sem.length; k++) {
      const proprio = textoProprio(sem[k]);
      const a = pinta(sem[k]), b = pinta(com[k]);
      if (proprio === frase) continue;                       // a dica que vira erro muda de cor sozinha: não é o campo
      if (proprio && proprio === rotulos[i]) {
        rotulo = erroCores.has(b.letra);                     // o rótulo do `Field` (o primeiro texto do caso)
        continue;
      }
      for (const chave of new Set([...Object.keys(a), ...Object.keys(b)])) {
        if (a[chave] === b[chave]) continue;
        // A letra só conta onde há texto; um `color` herdado por uma caixa vazia não se vê.
        if (chave === "letra" && !proprio) continue;
        mudou++;
        const nome = `${sem[k].tagName.toLowerCase()}${sem[k].getAttribute("role") ? `[${sem[k].getAttribute("role")}]` : ""} ${chave}`;
        if (!erroCores.has(b[chave] ?? "")) foraDaCor.push(`${nome} → ${b[chave] ?? "some"}`);
        if (chave === "fundo") fundo.push(`${nome}: ${a[chave]} → ${b[chave]}`);
      }
    }
    return {i, arvore: null as string | null, mudou, foraDaCor, fundo, rotulo};
  });
}

test("todo campo do nativo se mostra inválido, no vermelho do erro, em toda marca e tema", async ({page: p, browserName}) => {
  test.skip(browserName !== "chromium", "o desenho é o mesmo nos três; a cor se mede no Chromium (ver o topo)");
  test.setTimeout(10 * 60_000);
  const ssr = await carregar();
  const medidas = new Set<string>();
  let casos = 0;
  for (const marca of MARCAS) {
    for (const tema of TEMAS) {
      await montar(p, ssr, tema, marca);
      // As cores do erro deste tema e desta marca, lidas dos tokens do nativo pela própria montagem (o mesmo caminho do campo).
      const cores = ssr.resolverTokens(tema, "comfortable", undefined, marca || undefined).color;
      const vermelho = cores.danger400 ?? cores.destructive;
      const cheio = cores.destructive;
      expect(vermelho, "a cor do erro do tema").toBeTruthy();
      const rotulos = ssr.CASOS_DO_INVALIDO.map((c) => c.rotulo ?? null);
      const r = await p.evaluate(medir, {frase: FRASE, rotulos, vermelho, cheio});
      const onde = `${marca || "gold"}/${tema}`;
      for (const m of r) {
        const c = ssr.CASOS_DO_INVALIDO[m.i];
        casos++;
        const nome = (o: string) => `${c.nome} · ${o} · ${onde}`;
        if (m.arvore) { medidas.add(nome(`a árvore muda com o erro (${m.arvore})`)); continue; }
        if (m.mudou === 0) medidas.add(nome("não se mostra inválido"));
        for (const x of m.foraDaCor) medidas.add(nome(`muda para cor que não é a do erro: ${x}`));
        for (const x of m.fundo) if (!/marcada|marcado/.test(c.nome)) medidas.add(nome(`o fundo muda: ${x}`));
        if (m.rotulo === false) medidas.add(nome("o rótulo do Field não fica vermelho"));
        // O rótulo que não se acha não passa calado: seria a régua 4 medindo nada.
        if (c.rotulo && m.rotulo === null && !m.arvore) medidas.add(nome("o rótulo do Field não foi achado"));
        if (process.env.AUREA_DEPURAR && !marca && tema === "light") console.log(c.nome, JSON.stringify(m));
      }
    }
  }
  expect(casos, "o banco do inválido sumiu — o teste ficaria verde sem medir nada").toBeGreaterThan(MARCAS.length * 2 * 15);
  const novas = [...medidas].filter((m) => !CONHECIDAS_INVALIDO_NATIVO.includes(m)).sort();
  const resolvidas = CONHECIDAS_INVALIDO_NATIVO.filter((m) => !medidas.has(m));
  expect(novas, `campo do nativo com o erro fora da ADR-0094 — reprovação NOVA:\n${novas.join("\n")}`).toEqual([]);
  expect(resolvidas, `exceção que deixou de reprovar: tire-a de invalido-nativo.conhecidas.ts:\n${resolvidas.join("\n")}`).toEqual([]);
});

// A FICHA × O BANCO: a mesma disciplina do `invalido.spec.ts` da web. Toda ficha que declara `invalid` e existe no nativo
// (`platforms.native` não é "n-a" nem "planned") tem pelo menos um caso no banco, ou o motivo em `SEM_CASO_NO_NATIVO`.
test("toda ficha com `invalid` que existe no nativo tem caso no banco", async ({browserName}) => {
  test.skip(browserName !== "chromium", "não depende de navegador");
  const ssr = await carregar();
  const fichas = readdirSync("packages/contracts/registry").filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(`packages/contracts/registry/${f}`, "utf8")) as {name: string; states?: string[]; platforms?: {native?: string}})
    .filter((d) => (d.states ?? []).includes("invalid") && d.platforms?.native && !["n-a", "planned"].includes(d.platforms.native));
  expect(fichas.length, "nenhuma ficha do nativo com invalid — o filtro deixou de casar").toBeGreaterThan(10);
  const cobertas = new Set(ssr.CASOS_DO_INVALIDO.map((c) => c.ficha));
  const semCaso = fichas.map((d) => d.name).filter((n) => !cobertas.has(n) && !ssr.SEM_CASO_NO_NATIVO[n]);
  expect(semCaso, `ficha que declara \`invalid\` no nativo sem caso no banco (apps/catalog/nativo/bancada-do-invalido.mjs) ` +
    `nem motivo em SEM_CASO_NO_NATIVO — ninguém mede esse campo:`).toEqual([]);
});
