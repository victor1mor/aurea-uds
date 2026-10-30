// As rodadas da saúde (`scripts/saude-rodadas.mjs`) não deixam um erro passageiro do GitHub derrubar o site (30/10/2026):
// a API respondeu 502 a uma das 30 consultas, o script parou, e o site da 0.50.0 ficou sem publicar duas vezes seguidas.
// Nos erros que passam sozinhos (5xx, 429, a rede que cai) ele tenta de novo; nos outros (404…), para na hora.
// Provado contra o defeito: com o script da 0.50.0, o `lerRodadas` para no primeiro 502 — os três primeiros reprovam.
import {afterEach, describe, expect, test, vi} from "vitest";
import {lerRodadas} from "../../scripts/saude-rodadas.mjs";

const resposta = (status: number, corpo: unknown = {}) => ({ok: status >= 200 && status < 300, status, json: async () => corpo});
const RODADAS = {workflow_runs: [
  {id: 1, created_at: "2026-10-30T12:01:55Z", head_sha: "66a90c72aaaa", status: "completed", conclusion: "success"},
  {id: 2, created_at: "2026-10-29T23:20:05Z", head_sha: "b28d7059bbbb", status: "completed", conclusion: "success"},
]};
const TRABALHOS = {jobs: [{name: "test", status: "completed", conclusion: "success"}]};
/** O GitHub de mentira: a lista das rodadas e os trabalhos de cada uma; `falhas` diz quantas vezes cada endereço erra antes. */
function github(falhas: Record<string, number[]>) {
  const chamadas: string[] = [];
  const buscar = vi.fn(async (url: string) => {
    chamadas.push(url);
    const chave = Object.keys(falhas).find((k) => url.includes(k));
    const fila = chave ? falhas[chave] : [];
    if (fila.length) { const s = fila.shift()!; if (s === 0) throw new TypeError("fetch failed"); return resposta(s); }
    return resposta(200, url.includes("/runs?") ? RODADAS : TRABALHOS);
  });
  vi.stubGlobal("fetch", buscar);
  return {buscar, chamadas};
}
const semEsperar = {esperar: async () => {}};

afterEach(() => { vi.unstubAllGlobals(); });

describe("saude-rodadas · um erro passageiro do GitHub não derruba o site", () => {
  test("um 502 numa das consultas: tenta de novo e lê as duas rodadas", async () => {
    const {chamadas} = github({"/runs/1/jobs": [502]});
    const rodadas = await lerRodadas(semEsperar);
    expect(rodadas.map((r) => r.commit)).toEqual(["66a90c72", "b28d7059"]);
    expect(chamadas.filter((u) => u.includes("/runs/1/jobs"))).toHaveLength(2);
  });

  test("o 429 (limite de pedidos) e a rede que cai também são passageiros", async () => {
    github({"/runs/1/jobs": [429, 0], "/runs?": [503]});
    await expect(lerRodadas(semEsperar)).resolves.toHaveLength(2);
  });

  test("espera entre as tentativas: 2, 5 e 10 segundos", async () => {
    github({"/runs/2/jobs": [502, 502, 502]});
    const esperas: number[] = [];
    await lerRodadas({esperar: async (ms: number) => { esperas.push(ms); }});
    expect(esperas).toEqual([2000, 5000, 10000]);
  });

  test("se o erro continua, desiste depois da quarta tentativa e diz qual foi", async () => {
    const {chamadas} = github({"/runs/1/jobs": [502, 502, 502, 502, 502]});
    await expect(lerRodadas(semEsperar)).rejects.toThrow(/runs\/1\/jobs.*respondeu 502 \(na tentativa 4\)/);
    expect(chamadas.filter((u) => u.includes("/runs/1/jobs"))).toHaveLength(4);
  });

  test("o que não é passageiro (404) para na hora, sem tentar de novo", async () => {
    const {chamadas} = github({"/runs/2/jobs": [404]});
    await expect(lerRodadas(semEsperar)).rejects.toThrow(/respondeu 404$/);
    expect(chamadas.filter((u) => u.includes("/runs/2/jobs"))).toHaveLength(1);
  });
});
