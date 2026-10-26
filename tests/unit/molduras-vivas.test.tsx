// TODA MOLDURA DO SITE ACENDE (bloco 1, 25/10/2026). O Victor perguntou se o bloco 1 estava 100%, e a medida achou 10 das
// 67 molduras (`apps/catalog/embeds/`) sem a parte viva: as 9 páginas de padrão de moldura própria e a primeira prévia do
// AppShell. O gerador só dava o "alvo" (a chave do exemplo) à moldura de componente com arquivo próprio, e nunca à de
// padrão — e o botão de recolher a lateral, nessas molduras, não respondia. A trava das caixas (`parte-viva.spec.ts`)
// deixa as molduras de fora; esta lê o HTML montado: toda moldura diz qual exemplo é e carrega a parte viva certa.
// O navegador prova o resto (`moldura-da-previa.spec.ts`: acende sem erro, e o recolher responde).
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
import {describe, expect, it} from "vitest";

const CAT = join(process.cwd(), "apps/catalog");
const MOLDURAS = readdirSync(join(CAT, "embeds")).filter((f) => f.endsWith(".html")).sort();
const ler = (f: string) => readFileSync(join(CAT, "embeds", f), "utf8");
const alvo = (html: string) => /<(?:main|div) id="root"[^>]*\bdata-componente="([^"]+)"[^>]*\bdata-indice="(\d+)"/.exec(html);
const script = (html: string) => /<script src="\.\.\/assets\/(live(?:-motores)?)\.js"><\/script>/.exec(html)?.[1] ?? null;

// Os padrões com motor pesado ficam fora da parte viva leve: a lista é a do `live/main.tsx` (o gerador a confere contra os
// imports de cada arquivo).
const MAIN = readFileSync(join(CAT, "live/main.tsx"), "utf8");
const padraoComMotor = (arquivo: string) => MAIN.includes(`"!../content/patterns/${arquivo}.mjs"`);
const STARTERS_MOTORES = readFileSync(join(CAT, "content/_starters-motores.mjs"), "utf8");

describe("as molduras do site acendem", () => {
  it("existem molduras para medir", () => {
    expect(MOLDURAS.length).toBeGreaterThan(50);
    expect(MOLDURAS.filter((f) => f.startsWith("pattern-")).length, "as molduras de padrão").toBeGreaterThan(5);
  });

  it("toda moldura diz qual exemplo é e carrega a parte viva", () => {
    const sem = MOLDURAS.filter((f) => { const h = ler(f); return !alvo(h) || !script(h); });
    expect(sem, "molduras paradas (sem a chave do exemplo ou sem o live.js)").toEqual([]);
  });

  it("a moldura de padrão aponta para um exemplo que existe, e carrega a parte viva com motor quando ele tem", async () => {
    const erros: string[] = [];
    for (const f of MOLDURAS.filter((x) => x.startsWith("pattern-"))) {
      const h = ler(f), a = alvo(h);
      const m = a && /^padrao\/(.+)\.(\d+)$/.exec(a[1]);
      if (!m) { erros.push(`${f}: a chave não é de padrão (${a?.[1] ?? "nenhuma"})`); continue; }
      const lista = (await import(pathToFileURL(join(CAT, "content/patterns", `${m[1]}.mjs`)).href)).default;
      if (typeof lista?.[Number(m[2])]?.render !== "function") erros.push(`${f}: ${a![1]} não tem exemplo`);
      const esperado = padraoComMotor(m[1]) ? "live-motores" : "live";
      if (script(h) !== esperado) erros.push(`${f}: carrega ${script(h)}, o exemplo pede ${esperado}`);
    }
    expect(erros).toEqual([]);
  }, 60_000); // importar os módulos de padrão (com a biblioteca inteira) passa dos 5 s padrão

  it("a moldura de componente carrega a parte viva com motor quando o exemplo de partida tem", () => {
    const erros: string[] = [];
    for (const f of MOLDURAS.filter((x) => !x.startsWith("pattern-"))) {
      const h = ler(f), a = alvo(h);
      if (!a) continue; // a outra prova acusa
      const comMotor = new RegExp(`^\\s*${a[1]}\\s*:`, "m").test(STARTERS_MOTORES);
      if (script(h) !== (comMotor ? "live-motores" : "live")) erros.push(`${f}: carrega ${script(h)}`);
    }
    expect(erros).toEqual([]);
  });
});
