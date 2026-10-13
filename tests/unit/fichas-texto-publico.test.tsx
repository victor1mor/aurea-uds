// OS TEXTOS PÚBLICOS DAS FICHAS — 13/10/2026, passo 11 (ADR-0067).
//
// O resumo e a descrição de cada prop aparecem no site (a tabela "API Reference" e o "Copy Markdown") e
// no pacote. A DOC-15 (passo 8) limpou 72 textos com número de pedido e versão, e o check 47 do
// `validate.py` cobra o formato que ela achou ("GAR-14 (0.28.0): …"). O rascunho da página nova
// mostrou o que ficou para trás: as descrições de `appearance`, `tone` e `share` do Button, do
// IconButton e do ToolbarButton em PORTUGUÊS no meio do inglês, um "Since 0.19" e um "(A5, 06/10/2026)".
// Este teste cobra os três: o texto público é em inglês, sem data e sem versão — o histórico mora no
// CHANGELOG.
import {readFileSync, readdirSync} from "node:fs";
import {describe, expect, test} from "vitest";

const DIR = "packages/contracts/registry";
const fichas = readdirSync(DIR).filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(`${DIR}/${f}`, "utf8")) as {name: string; summary?: string; props?: {name: string; description?: string}[]});
const textos = fichas.flatMap((f) => [
  {onde: `${f.name} · summary`, texto: f.summary ?? ""},
  ...(f.props ?? []).map((p) => ({onde: `${f.name} · ${p.name}`, texto: p.description ?? ""})),
]);

// Marcas que só o português tem: os til e o cedilha, e as palavras curtas mais comuns.
// ("com" e "os" ficam de fora: aparecem em endereço — youtube.com — e em "OS".)
const PORTUGUES = /[ãõç]|\b(não|é|quem|que|para|uma|das|dos)\b/i;
// Uma data no formato do projeto (13/10/2026) ou uma versão do pacote citada no texto ("0.19", "0.28.0").
const DATA = /\b\d{2}\/\d{2}\/\d{4}\b/;
const VERSAO = /\b(since|in|from|until)\s+0\.\d+(\.\d+)?\b|\(0\.\d+\.\d+\)/i;

describe("o texto público das fichas", () => {
  test("é em inglês", () => {
    expect(textos.filter((t) => PORTUGUES.test(t.texto)).map((t) => t.onde)).toEqual([]);
  });
  test("não traz data nem versão do pacote", () => {
    expect(textos.filter((t) => DATA.test(t.texto) || VERSAO.test(t.texto)).map((t) => t.onde)).toEqual([]);
  });
  test("a varredura lê textos de verdade", () => {
    expect(fichas.length).toBeGreaterThan(100);
    expect(textos.length).toBeGreaterThan(500);
  });
});
