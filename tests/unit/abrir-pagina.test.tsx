// A varredura do catálogo repete UMA vez a página em que o WebKit quebra por dentro
// (`tests/visual/abrir-pagina.ts`). Três rodadas da CI, em 02 e 03/10/2026, morreram assim, cada
// uma numa página diferente. A lógica se prova aqui, sem navegador: a sessão de nuvem não tem
// WebKit, e o que importa é o que se repete e o que NÃO se repete.
//
// A entrada que exercita o defeito é a página que cai na primeira vez e abre na segunda: com o
// `page.goto` puro, o código de antes, ela reprova (primeiro teste).
import {describe, expect, it, vi} from "vitest";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {abrir} from "../visual/abrir-pagina";

const QUEDA = "page.goto: WebKit encountered an internal error";
const pagina = (...erros: Array<string | null>) => {
  let n = 0;
  return {goto: vi.fn(async () => { const e = erros[n++]; if (e) throw new Error(e); return null; })};
};

describe("abrir · a queda do WebKit", () => {
  it("com o goto puro, o código de antes, a página que cai uma vez reprova a varredura", async () => {
    const p = pagina(QUEDA, null);
    await expect(p.goto("/x.html")).rejects.toThrow(QUEDA);
  });
  it("a página que cai uma vez abre na segunda, e a queda fica avisada", async () => {
    const p = pagina(QUEDA, null), aviso = vi.fn();
    await expect(abrir(p, "/apps/catalog/skeleton.html", aviso)).resolves.toBeUndefined();
    expect(p.goto).toHaveBeenCalledTimes(2);
    expect(aviso).toHaveBeenCalledOnce();
    expect(aviso.mock.calls[0][0]).toContain("/apps/catalog/skeleton.html");
  });
  it("duas quedas seguidas reprovam: uma página que derruba sempre não some", async () => {
    const p = pagina(QUEDA, QUEDA);
    await expect(abrir(p, "/y.html")).rejects.toThrow(QUEDA);
    expect(p.goto).toHaveBeenCalledTimes(2);
  });
  it("qualquer outro erro sobe na hora, sem segunda tentativa", async () => {
    const p = pagina("page.goto: net::ERR_CONNECTION_REFUSED", null), aviso = vi.fn();
    await expect(abrir(p, "/z.html", aviso)).rejects.toThrow("ERR_CONNECTION_REFUSED");
    expect(p.goto).toHaveBeenCalledOnce();
    expect(aviso).not.toHaveBeenCalled();
  });
  it("sem erro, uma tentativa só", async () => {
    const p = pagina(null);
    await abrir(p, "/w.html");
    expect(p.goto).toHaveBeenCalledOnce();
  });
});

// E a varredura de fato passa por ela: nenhuma das voltas pelas páginas abre com o `goto` puro.
// No código de antes eram nove `page.goto(url(f))`.
describe("a varredura do catálogo abre toda página pelo `abrir`", () => {
  const fonte = readFileSync(join(__dirname, "../visual/catalog-sweep.spec.ts"), "utf8");
  it("nenhum `page.goto(url(f))` sobrou", () => {
    expect(fonte.match(/page\.goto\(url\(/g) ?? []).toEqual([]);
  });
  it("as nove voltas usam o `abrir`", () => {
    expect((fonte.match(/abrir\(page, url\(f\), avisar\)/g) ?? []).length).toBeGreaterThanOrEqual(9);
  });
});
