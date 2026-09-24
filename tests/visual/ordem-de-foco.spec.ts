import {test, expect} from "@playwright/test";
import {readdirSync} from "node:fs";

// G-A11Y-06 — a ordem VISUAL e a ordem de FOCO não podem divergir. Em lugar nenhum.
//
// O achado veio da triagem do `align` (22/08/2026), no `input-group-addon`, que posicionava por
// `order`. Mas a pergunta obrigatória do CLAUDE.md é "quem mais tem esse problema?", e responder
// lendo CSS não bastava: `order`, `flex-direction:*-reverse`, `grid-row/column`, `grid-area` e
// `grid-auto-flow:dense` produzem o mesmo defeito por caminhos diferentes, e o defeito pode
// nascer de uma composição sem que regra nenhuma pareça suspeita.
//
// Então este gate não olha CSS: olha o RESULTADO. Varre todas as páginas construídas e, em cada
// contêiner com dois ou mais elementos focáveis, compara a ordem do DOM (que é a ordem de
// tabulação quando não há `tabindex` positivo) com a ordem visual. Divergiu, reprova.
//
// WCAG 2.4.3 (Focus Order), nível A.

const PAGES = readdirSync("apps/catalog").filter((f) => f.endsWith(".html"));

// ORÇAMENTO DE TEMPO, e ele é DERIVADO do trabalho — não é um número escolhido a esmo.
//
// Este gate navega TODAS as páginas construídas do catálogo e rodava nos 30s do padrão do
// Playwright. Isso nunca foi uma decisão: era o default nunca revisado, e o gate vinha passando
// só porque a margem ainda dava. Em 28/08/2026 ela acabou — o `G-API-02` acrescentou três
// patterns, o catálogo foi de 329 para 332 páginas, e o teste morreu com
// "Test timeout of 30000ms exceeded" num `page.goto`.
//
// E o modo de falhar é o pior possível, o mesmo que o `G-GATE-02` já pagou uma vez: um gate que
// estoura o relógio parece defeito da página que ele estava visitando no momento. Aqui apontou
// para `tabs.html`, que o cartão tinha acabado de mexer — a acusação mais plausível possível, e
// falsa. A página serve em 200 e pesa 60 KB, um terço do `patterns.html`, que passa.
//
// O irmão que faz a MESMA varredura já tinha resolvido isto: `catalog-sweep.spec.ts` configura
// 15 minutos, e `geometry.spec.ts` 8. Eram três os que não configuravam nada — este, o
// `invalido` e o `ordem-de-foco` —, e os outros dois passaram nesta rodada por margem, não por
// estarem certos. Corrigidos os três juntos: "quem mais tem esse problema?" com a resposta já
// escrita na porta ao lado.
//
// O orçamento CRESCE COM AS PÁGINAS de propósito. Um número fixo volta a expirar no dia em que
// alguém acrescentar patterns, e o próximo a pagar não vai saber por quê. A ASSERÇÃO não mudou:
// isto é tempo para fazer o trabalho que o gate sempre teve, não tolerância a defeito.
test.describe.configure({timeout: Math.max(2 * 60 * 1000, PAGES.length * 1000)});

test("ordem visual == ordem de foco, em toda página do catálogo", async ({page}) => {
  const falhas: string[] = [];
  for (const f of PAGES) {
    await page.goto(`/apps/catalog/${f}`);
    const desta = await page.evaluate(() => {
      const ruins: string[] = [];
      // `:not([tabindex='-1'])` em TODOS, e não só no último: elemento com tabindex -1 não entra na
      // ordem do Tab, que é o que este gate compara. Achado em 24/09/2026 com o Select novo: o motor
      // põe um <input> escondido (aria-hidden, tabindex -1) para enviar o formulário, e o gate o lia
      // como parada de foco — no canto da tela, onde ele mora por construção.
      const foco = ["button", "a[href]", "input", "select", "textarea", "[tabindex]"].map(s => `${s}:not([tabindex='-1'])`).join(", ");
      // `tabindex` positivo reordena a tabulação de um jeito que nem o DOM nem o desenho contam.
      // Ele é proibido por outra razão, mas se existir, esta comparação deixa de valer — então
      // acusar é mais honesto que medir errado.
      for (const t of document.querySelectorAll("[tabindex]")) {
        const v = Number(t.getAttribute("tabindex"));
        if (v > 0) ruins.push(`tabindex positivo (${v}) em ${t.tagName}.${t.className}`);
      }
      const visivel = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
      };
      // O ALVO É A CAUSA, e isso precisou de uma correção. A primeira versão comparava a ordem
      // em QUALQUER contêiner flex/grid com dois focáveis, e acusou os contêineres de página
      // inteira: num layout de duas colunas, o sumário à direita nasce depois do conteúdo no DOM
      // e aparece mais acima na tela. Isso não é reordenação — são duas regiões independentes, e
      // a sequência do DOM é justamente o que define a ordem entre elas.
      //
      // O defeito que este gate persegue tem CAUSA conhecida: alguém pediu ao CSS para desenhar
      // fora da ordem do documento. Então a condição é dupla — existe um mecanismo de
      // reordenação em uso, E o resultado diverge. Sem a primeira metade, o gate mede layout;
      // com ela, mede reordenação.
      // O ALVO É A CAUSA, e chegar nela custou duas correções do instrumento.
      //
      // (1) A primeira versão comparava QUALQUER contêiner flex/grid com dois focáveis, e acusou
      //     os contêineres de página inteira: num layout de duas colunas o sumário nasce depois
      //     do conteúdo no DOM e aparece mais acima na tela. Não é reordenação — são regiões
      //     independentes, e a sequência do DOM é o que define a ordem entre elas.
      //
      // (2) A segunda exigia um mecanismo de reordenação em uso, e ainda acusava: `.topbar` tem
      //     `grid-column:1/-1` para ATRAVESSAR as colunas, não para trocar de lugar. Colocação
      //     explícita não é reordenação.
      //
      // O que `order`, `flex-direction:*-reverse`, `grid-row/column`, `grid-area` e
      // `grid-auto-flow:dense` reordenam são os FILHOS DIRETOS. Então é nesse nível que a
      // comparação vale: a sequência dos filhos diretos que carregam algo focável, no DOM contra
      // na tela. Focável enterrado dentro de um filho não é reordenado por nada disso — ele vai
      // junto com o filho.
      const reordena = (el: HTMLElement) => {
        const c = getComputedStyle(el);
        if (/-reverse/.test(c.flexDirection) || /dense/.test(c.gridAutoFlow)) return true;
        for (const filho of el.children) {
          const f = getComputedStyle(filho as HTMLElement);
          if (f.order && f.order !== "0") return true;
          if ((f.gridRowStart && f.gridRowStart !== "auto") ||
              (f.gridColumnStart && f.gridColumnStart !== "auto")) return true;
        }
        return false;
      };
      for (const caixa of document.querySelectorAll<HTMLElement>("*")) {
        const disp = getComputedStyle(caixa).display;
        if (!/flex|grid/.test(disp)) continue;         // só quem pode reordenar
        if (!reordena(caixa)) continue;                // …e só quem REORDENA de fato
        const filhos = [...caixa.children].filter((f) =>
          f.matches(foco) ? visivel(f) : [...f.querySelectorAll(foco)].some(visivel)) as HTMLElement[];
        if (filhos.length < 2) continue;
        const naVisual = [...filhos].sort((a, b) => {
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          const mesmaLinha = Math.abs(ra.top - rb.top) <= Math.min(ra.height, rb.height) / 2;
          if (!mesmaLinha) return ra.top - rb.top;
          return getComputedStyle(document.documentElement).direction === "rtl"
            ? rb.right - ra.right : ra.left - rb.left;
        });
        for (let i = 0; i < filhos.length; i++) {
          if (filhos[i] !== naVisual[i]) {
            const nome = caixa.className || caixa.tagName.toLowerCase();
            ruins.push(`${String(nome).slice(0, 60)} (${disp}): a sequência dos filhos com ` +
              `conteúdo focável difere entre DOM e tela`);
            break;
          }
        }
      }
      return [...new Set(ruins)];
    });
    for (const d of desta) falhas.push(`${f} — ${d}`);
  }
  expect(falhas, `ordem visual ≠ ordem de foco em ${falhas.length} caixa(s):\n` +
    falhas.slice(0, 10).join("\n") +
    "\n\nQuem reordena o DESENHO sem reordenar o DOM (`order`, `flex-direction:*-reverse`, " +
    "`grid-row/column`, `grid-area`, `grid-auto-flow:dense`) muda o que se vê e não o que se " +
    "tabula. A correção é estrutural: ponha o elemento no DOM na posição em que ele aparece.")
    .toEqual([]);
});
