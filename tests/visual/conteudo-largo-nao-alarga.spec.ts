import {expect, test} from "@playwright/test";
import {join} from "node:path";

// MNT-33 (21/10/2026, o app de rede, medido na 0.36.0): o `DataState` deixava a tabela larga alargar a PÁGINA. A
// `.data-state` era `display:grid` sem `grid-template-columns`: a coluna implícita (`auto`) não fica menor que o conteúdo,
// e a `.table-region` (que tem a própria rolagem) nunca chegava a rolar — a 640 px (a tela do Victor a 200%), a página
// rolava 104 px para o lado. Quem mais tinha o mesmo desenho: as peças que embrulham CONTEÚDO DO APP numa grade sem
// coluna — o `Collapsible`, o `Form` e o corpo do `Dialog`. As outras grades do core guardam os itens da própria peça.
const CSS = join(process.cwd(), "packages/core/dist/aurea.css");
const tabela = `<div class="table-region" tabindex="0"><table class="table"><thead><tr>${
  ["Device", "Address", "Site", "Owner", "Status", "Last seen", "Uptime"].map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${
  Array.from({length: 3}, (_, i) => `<tr>${["core-switch-0" + i, "10.0.0." + i, "Datacenter North", "Network team",
    "Operational", "21/10/2026 16:45", "182 days"].map((c) => `<td style="white-space:nowrap">${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
// A tabela vem dentro de um `div` comum, como o app a monta (a tabela e o que vai junto dela): é esse invólucro, sem
// `min-width: 0`, que faz a coluna implícita crescer. A tabela DIRETO na grade não alarga — a caixa de rolagem dela pode
// encolher —, e um teste com ela direto passava com o defeito dentro (medido em 21/10/2026). O `Collapsible` já põe o
// painel dele no meio, com a marcação da peça (`.collapsible-panel`).
const conteudo = `<div><p>7 devices in the path</p>${tabela}</div>`;
const CASOS: Record<string, string> = {
  DataState: `<div class="data-state" status="ready">${conteudo}</div>`,
  Collapsible: `<div class="collapsible" data-open=""><button type="button" class="collapsible-trigger">Devices</button><div class="collapsible-panel" data-open="">${tabela}</div></div>`,
  Form: `<form class="form">${conteudo}</form>`,
  "Dialog body": `<div class="dialog-body">${conteudo}</div>`,
};

for (const [nome, html] of Object.entries(CASOS)) {
  test(`a tabela larga dentro de ${nome} rola na caixa dela, e a página não rola de lado (640 px)`, async ({page}) => {
    await page.setViewportSize({width: 640, height: 480});
    await page.setContent(`<!doctype html><html data-theme="dark"><head><meta charset="utf-8"></head><body style="margin:0">`
      + `<main style="padding:16px">${html}</main></body></html>`);
    await page.addStyleTag({path: CSS});
    const m = await page.evaluate(() => {
      const regiao = document.querySelector(".table-region") as HTMLElement;
      return {pagina: document.documentElement.scrollWidth, janela: innerWidth, regiao: regiao.clientWidth, tabela: regiao.scrollWidth};
    });
    expect(m.tabela, `${nome}: a tabela é mais larga que a caixa (senão o teste não prova nada)`).toBeGreaterThan(m.regiao);
    expect(m.pagina, `${nome}: a página rola de lado`).toBeLessThanOrEqual(m.janela);
  });
}
