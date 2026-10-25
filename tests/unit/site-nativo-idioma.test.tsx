// O IDIOMA DA MONTAGEM DO SITE (25/10/2026). O nativo escreve data e número no idioma do aparelho; na montagem do site, o
// aparelho é o computador que monta, e o Windows (pt-BR) e a CI (en-US) desenhavam páginas diferentes — a trava "dist
// desatualizado" da `build` reprovou o DatePicker e o NumberField do nativo. O `apps/catalog/nativo/idioma-da-montagem.mjs`
// fixa o "en-US" para quem não diz o idioma. Cada caso roda num Node separado, pedindo o pt-BR pelo ambiente (o Linux da
// CI obedece o LANG; o Windows usa o do sistema).
import {spawnSync} from "node:child_process";
import {pathToFileURL} from "node:url";
import {join} from "node:path";
import {describe, expect, it} from "vitest";

const SHIM = pathToFileURL(join(process.cwd(), "apps/catalog/nativo/idioma-da-montagem.mjs")).href;
const AMOSTRA = `
  const d = new Date(2026, 9, 23, 9, 30);
  console.log(JSON.stringify({
    data: d.toLocaleDateString(),
    hora: d.toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"}),
    numero: new Intl.NumberFormat().format(2026),
    numeroDito: new Intl.NumberFormat("pt-BR").format(1234.5),
    semNew: Intl.DateTimeFormat().resolvedOptions().locale,
    instancia: new Intl.NumberFormat() instanceof Intl.NumberFormat,
    toLocale: (2026).toLocaleString(),
  }));`;
const rodar = (comShim: boolean) => {
  const codigo = comShim ? `await import(${JSON.stringify(SHIM)});${AMOSTRA}` : AMOSTRA;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", codigo], {
    encoding: "utf8", env: {...process.env, LANG: "pt_BR.UTF-8", LC_ALL: "pt_BR.UTF-8"},
  });
  if (r.status !== 0) throw new Error(r.stderr);
  return JSON.parse(r.stdout);
};

describe("o idioma da montagem do nativo no site", () => {
  it("quem não diz o idioma recebe o en-US; quem diz fica com o seu", () => {
    const com = rodar(true);
    expect(com.data).toBe("10/23/2026");
    expect(com.hora).toMatch(/^09:30\sAM$/);
    expect(com.numero).toBe("2,026");
    expect(com.toLocale).toBe("2,026");
    expect(com.numeroDito).toBe("1.234,5");
    expect(com.semNew).toBe("en-US");
    expect(com.instancia).toBe(true);
  });

  it("sem o conserto, o mesmo ambiente desenha o pt-BR (o teste exercita o defeito)", () => {
    const sem = rodar(false);
    // Num ambiente que não consegue o pt-BR (um Windows em inglês), não há defeito a provar aqui.
    if (sem.data === "10/23/2026") return;
    expect(sem.data).toBe("23/10/2026");
    expect(sem.numero).toBe("2.026");
  });
});
