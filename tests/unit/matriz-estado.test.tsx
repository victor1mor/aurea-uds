// O MECANISMO DE ESTADO DA MATRIZ — o controle do §1b do protocolo.
//
// `matrix.mjs` recalcula tudo do zero a cada execução. A ÚNICA coisa que não pode ser recalculada
// é a leitura humana de cada célula, e é isso que `MATRIX-ESTADO.json` guarda. O mecanismo tem
// uma responsabilidade só, e ela é binária: **o que foi escrito à mão sobrevive à próxima
// execução.** Se não sobreviver, uma sessão que ler 63 células e acabar os tokens perde as 63.
//
// Por isso o teste roda a cadeia INTEIRA, de verdade, duas vezes — não um mock dela. O
// `AUREA_MATRIX_FIXTURE` existe exatamente para isso: aponta leitura e escrita para um diretório
// temporário, e o estado real e o `MATRIX.json` versionado ficam intocados.
//
// E ele é provado CONTRA O DEFEITO, não só no estado bom: cada controle abaixo é escrito de forma
// que passaria se o mecanismo estivesse quebrado do jeito específico que ele cobre.
import {describe, it, expect, beforeAll, afterAll} from "vitest";
import {execFileSync} from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const RAIZ = path.join(import.meta.dirname, "..", "..");
const SCRIPT = path.join(RAIZ, "audit", "activity-2", "matrix.mjs");
const REAL = path.join(RAIZ, "audit", "activity-2");

/** Roda a cadeia inteira apontada para `dir`, e devolve `{saida, codigo, stdout}`. */
function rodar(dir: string) {
  let codigo = 0;
  let stdout = "";
  try {
    stdout = execFileSync(process.execPath, [SCRIPT], {
      env: {...process.env, AUREA_MATRIX_FIXTURE: dir},
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    const err = e as {status?: number; stdout?: string; stderr?: string};
    codigo = err.status ?? 1;
    stdout = (err.stdout ?? "") + (err.stderr ?? "");
  }
  const arq = path.join(dir, "MATRIX.json");
  return {codigo, stdout, saida: fs.existsSync(arq) ? JSON.parse(fs.readFileSync(arq, "utf8")) : null};
}

const celula = (m: any, chave: string) => {
  const [cap, eixo] = chave.split("·");
  return m.linhas.find((l: any) => l.capacidade === cap)?.comparacao?.[eixo] ?? null;
};

const escreverEstado = (dir: string, celulas: Record<string, unknown>) =>
  fs.writeFileSync(path.join(dir, "MATRIX-ESTADO.json"),
    JSON.stringify({_oQueEIsto: "fixture do teste", celulas}, null, 2));

describe("o estado da matriz sobrevive à execução seguinte", () => {
  let dir: string;
  beforeAll(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), "aurea-matriz-")); });
  afterAll(() => fs.rmSync(dir, {recursive: true, force: true}));

  // O CONTROLE CENTRAL. `avatar·aparencia` é uma célula real e a máquina a mede como
  // `AUREA_INFERIOR` (a mui declara `circular|rounded|square` e a Aurea é sempre redonda).
  // Escrever `EQUIVALENT` à mão é justamente o caso que o mecanismo existe para preservar:
  // um valor que o derivado JAMAIS produziria sozinho. Se a mescla não funcionasse, a segunda
  // execução devolveria `PENDING` — e o teste veria.
  it("a segunda execução devolve o mesmo estado escrito à mão que a primeira", () => {
    const primeira = rodar(dir);              // sem estado nenhum: tudo PENDING
    expect(primeira.codigo).toBe(0);
    expect(celula(primeira.saida, "avatar·aparencia").estado).toBe("PENDING");

    escreverEstado(dir, {
      "avatar·aparencia": {estado: "EQUIVALENT", porque: "controle do teste", em: "2026-08-27"},
    });

    const segunda = rodar(dir);
    const terceira = rodar(dir);
    expect(segunda.codigo).toBe(0);
    expect(celula(segunda.saida, "avatar·aparencia").estado).toBe("EQUIVALENT");
    expect(celula(terceira.saida, "avatar·aparencia").estado).toBe("EQUIVALENT");
    expect(celula(terceira.saida, "avatar·aparencia").estadoPorque).toBe("controle do teste");
    // e o veredito de máquina continua INTOCADO ao lado — as duas camadas convivem
    expect(celula(terceira.saida, "avatar·aparencia").veredito).toBe("AUREA_INFERIOR");
  });

  // Sem este controle, o mecanismo "passaria" preenchendo tudo com o veredito de máquina — e as
  // duas células que a leitura desmentiu (`input·orientacao`, `drawer·aparencia`) teriam nascido
  // erradas. O derivado é PENDING, inclusive onde a máquina mediu.
  it("célula sem estado à mão nasce PENDING mesmo com veredito de máquina", () => {
    const m = rodar(dir).saida;
    const c = celula(m, "accordion·orientacao");
    expect(c.veredito).toBe("AUREA_INFERIOR");
    expect(c.estado).toBe("PENDING");
    expect(c._estadoOrigem).toMatch(/derivado/);
  });

  it("célula órfã aparece na saída, no console e reprova a execução", () => {
    escreverEstado(dir, {
      "avatar·aparencia": {estado: "EQUIVALENT", porque: "controle do teste", em: "2026-08-27"},
      "capacidade-que-nao-existe·eixo-que-nao-existe":
        {estado: "CONFIRMED", porque: "controle da órfã", em: "2026-08-27"},
    });
    const r = rodar(dir);
    expect(r.saida.leitura.orfas).toContain("capacidade-que-nao-existe·eixo-que-nao-existe");
    expect(r.stdout).toMatch(/ÓRFÃ/);
    expect(r.codigo).toBe(1);
    // e a célula boa NÃO é perdida junto: a órfã reprova, não apaga o resto
    expect(celula(r.saida, "avatar·aparencia").estado).toBe("EQUIVALENT");
  });

  it("leitura feita contra um veredito que mudou é marcada, não fica em silêncio", () => {
    escreverEstado(dir, {
      "avatar·aparencia": {
        estado: "CONFIRMED", porque: "controle do desatualizado", em: "2026-08-27",
        veredictoNaEpoca: "REQUER_LEITURA",           // hoje a máquina diz AUREA_INFERIOR
      },
    });
    const r = rodar(dir);
    expect(celula(r.saida, "avatar·aparencia")._estadoDesatualizado).toMatch(/evidência mudou/);
    expect(r.saida.leitura.estadoDesatualizado).toHaveLength(1);
    expect(r.stdout).toMatch(/evidência mudada/);
  });

  it("estado fora do vocabulário fechado derruba a execução", () => {
    escreverEstado(dir, {"avatar·aparencia": {estado: "TALVEZ", porque: "x", em: "2026-08-27"}});
    const r = rodar(dir);
    expect(r.codigo).not.toBe(0);
    expect(r.stdout).toMatch(/vocabulário fechado/);
  });

  it("estado sem razão ou sem data derruba a execução", () => {
    escreverEstado(dir, {"avatar·aparencia": {estado: "CONFIRMED", em: "2026-08-27"}});
    expect(rodar(dir).stdout).toMatch(/sem `porque`/);
    escreverEstado(dir, {"avatar·aparencia": {estado: "CONFIRMED", porque: "x"}});
    expect(rodar(dir).stdout).toMatch(/sem `em`/);
  });
});

// ── E o mesmo mecanismo, contra o ARQUIVO REAL ────────────────────────────────
// O fixture prova o mecanismo; isto prova que ele está de fato ligado ao estado que o projeto
// usa. Um mecanismo correto apontado para lugar nenhum passaria em tudo acima.
describe("o estado real está ligado à matriz real", () => {
  const estado = JSON.parse(fs.readFileSync(path.join(REAL, "MATRIX-ESTADO.json"), "utf8"));
  const matriz = JSON.parse(fs.readFileSync(path.join(REAL, "MATRIX.json"), "utf8"));

  it("não há célula órfã no estado real", () => {
    expect(matriz.leitura.orfas).toEqual([]);
  });

  it("toda célula escrita à mão chegou à matriz com o estado escrito", () => {
    const chaves = Object.keys(estado.celulas);
    expect(chaves.length).toBeGreaterThan(0);
    for (const k of chaves) {
      const c = celula(matriz, k);
      expect(c, `a célula \`${k}\` do estado não existe na matriz`).not.toBeNull();
      expect(c.estado, `a célula \`${k}\` perdeu o estado na mescla`).toBe(estado.celulas[k].estado);
      expect(c._estadoOrigem).toBe("MATRIX-ESTADO.json");
    }
  });

  it("a contagem de lidas bate com o número de células escritas à mão", () => {
    expect(matriz.leitura.lidas).toBe(Object.keys(estado.celulas).length);
    expect(matriz.leitura.lidas + matriz.leitura.pendentes).toBe(matriz.leitura.celulas);
  });
});
