// ADR-0077 (22/10/2026) — a fonte é a Inter (texto), a Sora (títulos) e a IBM Plex Mono (código). O que este arquivo cobra:
// o `fonts.css` declara as três famílias com os arquivos certos; cada arquivo cobre os caracteres do recorte latino de antes
// (lidos DENTRO do .woff2, não do nome); a Inter e a Sora são variáveis e têm os números de largura igual (`tnum`); os da
// IBM Plex Mono são idênticos aos da IBM (a licença reserva o nome "Plex" — arquivo mudado não pode levar o nome); os tokens
// apontam para as famílias certas; o core aplica a fonte de título a todo h1 a h6; e o `numeric` e o número do KPI usam a
// fonte de código (decisões do Victor, 22/10/2026).
// Provado contra o defeito: com o pacote da 0.38.0, o `fonts.css` não declara nenhuma das três, os arquivos não existem e
// o `--font-ui` é a Atkinson — todos reprovam.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {brotliDecompressSync} from "node:zlib";
import {describe, expect, test} from "vitest";

import {join} from "node:path";

// A suíte roda da raiz do repositório (o `vitest.config` mora lá).
const ler = (p: string) => readFileSync(join(process.cwd(), p));
const fontes = ler("packages/fonts/dist/fonts.css").toString("utf8");
const tokens = ler("packages/tokens/dist/aurea.tokens.css").toString("utf8");
const core = ler("packages/core/dist/aurea.css").toString("utf8");
const arquivo = (f: string) => ler(`packages/fonts/files/${f}`);

// ── um leitor mínimo de WOFF2: o diretório de tabelas, o fluxo em Brotli, e três tabelas (cmap, fvar, GSUB/GPOS) ──────
// O formato: https://www.w3.org/TR/WOFF2/ . A cmap, a fvar e as de recursos não são transformadas — basta achar onde
// cada uma começa no fluxo descompactado (as tabelas vêm em sequência, na ordem do diretório).
const TAGS = ["cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ",
  "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB",
  "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln", "cvar",
  "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf",
  "Glat", "Gloc", "Feat", "Sill"];
function tabelas(b: Buffer): Map<string, Buffer> {
  expect(b.toString("latin1", 0, 4), "assinatura WOFF2").toBe("wOF2");
  const n = b.readUInt16BE(12);
  let o = 48;
  const base128 = () => { let v = 0; for (let i = 0; i < 5; i++) { const x = b[o++]; v = v * 128 + (x & 0x7f); if (!(x & 0x80)) return v; } throw new Error("UIntBase128"); };
  const dir: {tag: string; tam: number}[] = [];
  for (let i = 0; i < n; i++) {
    const flags = b[o++];
    const tag = (flags & 0x3f) === 63 ? b.toString("latin1", o, (o += 4)) : TAGS[flags & 0x3f];
    const versao = flags >> 6;
    const orig = base128();
    const transformada = (tag === "glyf" || tag === "loca") ? versao === 0 : versao !== 0;
    const tam = transformada ? base128() : orig;
    dir.push({tag, tam});
  }
  const fluxo = brotliDecompressSync(b.subarray(o, o + b.readUInt32BE(20)));
  const mapa = new Map<string, Buffer>();
  let pos = 0;
  for (const t of dir) { mapa.set(t.tag, fluxo.subarray(pos, pos + t.tam)); pos += t.tam; }
  return mapa;
}
function caracteres(cmap: Buffer): Set<number> {
  const n = cmap.readUInt16BE(2);
  const cps = new Set<number>();
  for (let i = 0; i < n; i++) {
    const off = cmap.readUInt32BE(4 + i * 8 + 4);
    const fmt = cmap.readUInt16BE(off);
    if (fmt === 4) {
      const segX2 = cmap.readUInt16BE(off + 6), ends = off + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
      for (let s = 0; s < segX2 / 2; s++) {
        const fim = cmap.readUInt16BE(ends + s * 2), ini = cmap.readUInt16BE(starts + s * 2);
        const delta = cmap.readInt16BE(deltas + s * 2), rOff = cmap.readUInt16BE(ranges + s * 2);
        for (let c = ini; c <= fim && c !== 0xffff; c++) {
          const g = rOff === 0 ? (c + delta) & 0xffff : cmap.readUInt16BE(ranges + s * 2 + rOff + (c - ini) * 2);
          if (g !== 0) cps.add(c);
        }
      }
    } else if (fmt === 12) {
      const grupos = cmap.readUInt32BE(off + 12);
      for (let g = 0; g < grupos; g++) { const ini = cmap.readUInt32BE(off + 16 + g * 12), fim = cmap.readUInt32BE(off + 20 + g * 12); for (let c = ini; c <= fim; c++) cps.add(c); }
    }
  }
  return cps;
}
const eixos = (fvar?: Buffer) => {
  if (!fvar) return [];
  const off = fvar.readUInt16BE(4), n = fvar.readUInt16BE(8), tam = fvar.readUInt16BE(10);
  return Array.from({length: n}, (_, i) => { const a = off + i * tam; return `${fvar.toString("latin1", a, a + 4)} ${fvar.readInt32BE(a + 4) / 65536}-${fvar.readInt32BE(a + 12) / 65536}`; });
};
const recursos = (t?: Buffer) => {
  if (!t) return new Set<string>();
  const lista = t.readUInt16BE(6), n = t.readUInt16BE(lista);
  return new Set(Array.from({length: n}, (_, i) => t.toString("latin1", lista + 2 + i * 6, lista + 6 + i * 6)));
};

// O recorte latino que a web servia antes: a lista CONGELADA em `cortar-fontes.py`, lida de lá — uma lista só, a que
// corta e a que cobra. Ela era a cmap do arquivo da Atkinson (conferido em 22/10/2026: os mesmos 218), mas o arquivo
// sai do pacote com o nativo, e o teste não pode depender dele.
const ANTES = (() => {
  const bloco = ler("packages/fonts/cortar-fontes.py").toString("utf8").split("CARACTERES = [")[1].split("]")[0];
  const cps = new Set<number>();
  for (const m of bloco.matchAll(/\*range\((0x[0-9A-Fa-f]+), (0x[0-9A-Fa-f]+)\)|(0x[0-9A-Fa-f]+)/g)) {
    if (m[1]) for (let c = parseInt(m[1], 16); c < parseInt(m[2], 16); c++) cps.add(c);
    else cps.add(parseInt(m[3], 16));
  }
  return cps;
})();

test("a lista do corte é o recorte latino inteiro, de 218 caracteres", () => {
  expect(ANTES.size).toBe(218);
});

describe("ADR-0077 · o fonts.css declara as três famílias", () => {
  test("a Inter (normal e itálico) e a Sora são variáveis; a IBM Plex Mono, um peso por arquivo", () => {
    expect(fontes).toContain('font-family:"Inter";font-style:normal;font-weight:100 900;font-display:swap;src:url("../files/inter-variable-normal.woff2")');
    expect(fontes).toContain('font-family:"Inter";font-style:italic;font-weight:100 900;font-display:swap;src:url("../files/inter-variable-italic.woff2")');
    expect(fontes).toContain('font-family:"Sora";font-style:normal;font-weight:100 800;font-display:swap;src:url("../files/sora-variable-normal.woff2")');
    for (const p of [400, 500, 600]) expect(fontes).toContain(`font-family:"IBM Plex Mono";font-style:normal;font-weight:${p};font-display:swap;src:url("../files/ibm-plex-mono-${p}-normal.woff2")`);
  });
  test("a web não carrega mais a Atkinson", () => {
    expect(fontes).not.toMatch(/atkinson/i);
  });
});

describe("ADR-0077 · os arquivos, lidos por dentro", () => {
  test.each([
    ["inter-variable-normal.woff2", ["opsz 14-32", "wght 100-900"], [0x2215]],
    ["inter-variable-italic.woff2", ["opsz 14-32", "wght 100-900"], [0x2215]],
    ["sora-variable-normal.woff2", ["wght 100-800"], [0x2009]],
  ])("%s: variável, com os números de largura igual e os caracteres de antes", (f, esperados, semEstes) => {
    const t = tabelas(arquivo(f));
    expect(eixos(t.get("fvar"))).toEqual(esperados);
    expect(recursos(t.get("GSUB")).has("tnum") || recursos(t.get("GPOS")).has("tnum"), "o tnum, para as colunas de número").toBe(true);
    const tem = caracteres(t.get("cmap")!);
    const faltam = [...ANTES].filter((c) => !tem.has(c));
    expect(faltam, "só falta o que a fonte original não tem (medido em 22/10/2026)").toEqual(semEstes);
    const sobram = [...tem].filter((c) => !ANTES.has(c));
    expect(sobram, "o corte não deixa outro alfabeto").toEqual([]);
  });
  test("a IBM Plex Mono é a da IBM, sem mudança (nome reservado \"Plex\")", () => {
    const resumo = (f: string) => createHash("sha256").update(arquivo(f)).digest("hex").slice(0, 16);
    expect(resumo("ibm-plex-mono-400-normal.woff2")).toBe("e8993d946649b9d0");
    expect(resumo("ibm-plex-mono-500-normal.woff2")).toBe("41201b658a328b9d");
    expect(resumo("ibm-plex-mono-600-normal.woff2")).toBe("b7acd05041ab65f3");
  });
  test.each(["ibm-plex-mono-400-normal.woff2", "ibm-plex-mono-500-normal.woff2", "ibm-plex-mono-600-normal.woff2"])(
    "%s: o recorte Latin1 da IBM cobre 214 dos 218", (f) => {
      const tem = caracteres(tabelas(arquivo(f)).get("cmap")!);
      // Os dois acentos soltos (U+0304, U+0308), o espaço fino e a barra de divisão — medido em 22/10/2026.
      expect([...ANTES].filter((c) => !tem.has(c))).toEqual([0x304, 0x308, 0x2009, 0x2215]);
    });
});

describe("ADR-0077 · os tokens e a regra dos títulos", () => {
  test("texto Inter, título Sora, código IBM Plex Mono; o editorial é apelido do texto", () => {
    expect(tokens).toContain("--font-ui:Inter,");
    expect(tokens).toContain("--font-heading:Sora,Inter,");
    expect(tokens).toContain("--font-editorial:Inter,");
    expect(tokens).toContain('--font-code:"IBM Plex Mono",');
    expect(tokens).not.toMatch(/Atkinson/);
  });
  test("todo h1 a h6 usa a fonte de título, com força zero", () => {
    expect(core).toContain(":where(h1,h2,h3,h4,h5,h6) { font-family:var(--font-heading); }");
  });
  test("o `numeric` e o número do KPI usam a fonte de código, com os algarismos da mesma largura", () => {
    expect(core).toMatch(/\.typography-numeric \{ font-family:var\(--font-code\); font-variant-numeric:tabular-nums; \}/);
    expect(core).toMatch(/\.kpi > strong \{ font-family:var\(--font-code\);[^}]*font-variant-numeric:tabular-nums; \}/);
  });
});
