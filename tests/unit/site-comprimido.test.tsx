// O SITE COMPRIMIDO (lote 112, 27/11/2026). O `no-transform` impede a Cloudflare de comprimir, e o site inteiro saía sem
// compressão (medido em aureauds.dev: a folha com 1,44 MB, o script das caixas vivas com 1,86 MB). As páginas continuam
// com ele (barra a injeção do script de estatística da Cloudflare, que só acontece em HTML); os arquivos de apoio não.
//
// O servidor dos testes não lê o `_headers`. Aqui ele é aplicado como a documentação dos Workers descreve: as regras na
// ordem do arquivo, toda regra cujo caminho casa soma os cabeçalhos dela (o mesmo nome se junta com vírgula), e
// `! Nome` solta o que as regras de CIMA já puseram. Provado contra o defeito: sem o bloco `/assets/*`, a folha sai com
// `no-transform`; com o bloco ACIMA da regra geral, os dois valores se juntam — o teste reprova nos dois casos.
import {describe, expect, it} from "vitest";
// @ts-expect-error — módulo .mjs sem tipos
import {cabecalhos} from "../../scripts/montar-site.mjs";

function aplicar(arquivo: string, caminho: string): Record<string, string> {
  const regras: {padrao: string; linhas: string[]}[] = [];
  for (const l of arquivo.split("\n")) {
    if (!l.trim()) continue;
    if (!/^\s/.test(l)) regras.push({padrao: l.trim(), linhas: []});
    else regras.at(-1)!.linhas.push(l.trim());
  }
  const casa = (p: string) => new RegExp("^" + p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace("*", ".*") + "$").test(caminho);
  const h: Record<string, string> = {};
  for (const r of regras.filter((r) => casa(r.padrao))) {
    for (const l of r.linhas) {
      if (l.startsWith("! ")) { delete h[l.slice(2).toLowerCase()]; continue; }
      const i = l.indexOf(":");
      const nome = l.slice(0, i).trim().toLowerCase(), valor = l.slice(i + 1).trim();
      h[nome] = h[nome] ? `${h[nome]}, ${valor}` : valor;
    }
  }
  return h;
}

describe("o _headers do site", () => {
  const arquivo: string = cabecalhos(["x"]);

  it("as páginas continuam com no-transform (nada se injeta nelas)", () => {
    for (const p of ["/", "/button", "/button.html", "/embeds/sidebar.html", "/llms.txt"]) {
      expect(aplicar(arquivo, p)["cache-control"]).toBe("public, max-age=0, must-revalidate, no-transform");
    }
  });

  it("os arquivos de apoio perdem o no-transform, com um Cache-Control só", () => {
    for (const p of ["/assets/catalog.css", "/assets/live.js", "/assets/live-motores.js", "/assets/logo/aurea.svg"]) {
      expect(aplicar(arquivo, p)["cache-control"]).toBe("public, max-age=0, must-revalidate");
    }
  });

  it("os cabeçalhos de segurança continuam em todo arquivo", () => {
    const h = aplicar(arquivo, "/assets/catalog.css");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["content-security-policy"]).toContain("default-src 'self'");
  });
});
