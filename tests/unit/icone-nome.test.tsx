// A-04 · o nome do ícone é checado pelo TypeScript, na web e no nativo.
//
// Até a 0.10.0 `IconName` era `string` nos dois alvos: `<Icon name="chevron-down">` (um traço só;
// o do Carbon é `chevron--down`) compilava e não desenhava nada. A regra mora no TIPO, e tipo não
// se prova no vitest: quem prova são as duas sondas, compiladas pelo `tsc` de verdade.
//
// Provado contra o defeito: com `IconName = string` de volta no `icon-names.ts` gerado, as duas
// sondas reprovam com `Unused '@ts-expect-error' directive`.
import {spawnSync} from "node:child_process";
import {readFileSync} from "node:fs";
import {describe, expect, it} from "vitest";

const tsc = (dir: string) =>
  spawnSync(process.execPath, ["node_modules/typescript/bin/tsc", "-p", dir], {encoding: "utf8"});

describe("A-04 · nome de ícone checado pelo TypeScript", () => {
  it("web: nome errado reprova; nome do Carbon e nome declarado pelo app passam", () => {
    const r = tsc("tests/unit/tipos-web");
    expect(r.stdout + r.stderr).toBe("");
    expect(r.status).toBe(0);
  });

  it("nativo: o mesmo, e também a chave do registro", () => {
    const r = tsc("tests/unit/tipos-nativo");
    expect(r.stdout + r.stderr).toBe("");
    expect(r.status).toBe(0);
  });

  // As duas listas saem da mesma função e da mesma fonte; se um alvo andar sem o outro, o nome
  // que compila num não compila no outro.
  it("a lista é a mesma nos dois alvos", () => {
    const web = readFileSync("packages/react/src/icon-names.ts", "utf8");
    const nativo = readFileSync("packages/native/src/icon-names.ts", "utf8");
    expect(nativo).toBe(web);
    expect(web).toContain('| "chevron--down"');
  });
});
