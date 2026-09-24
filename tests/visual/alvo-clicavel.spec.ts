import {test, expect} from "@playwright/test";
import {readdirSync} from "node:fs";

// G-A11Y-11 — o que o CSS declara CLICÁVEL tem de ser operável pelo teclado. Em lugar nenhum.
//
// O achado veio da leitura da célula `card·estados` (27/08/2026): o `Card` oferece
// `variant="interactive"` — ponteiro de mão, elevação no hover, a promessa visual inteira de um
// alvo clicável — sobre uma `<div>` sem `tabIndex`, sem `role` e sem teclado. E o convite é
// aceito na própria casa: o catálogo renderiza `<div class="card card-interactive">`.
//
// A pergunta obrigatória do `CLAUDE.md` é "quem mais tem esse problema?", e respondê-la lendo
// CSS não bastava. `cursor:pointer` aparece em 23 regras do core, e o nome da classe não diz se
// o elemento que a recebe é operável: `.step-trigger` PARECE um gatilho e era um `<button>` que
// o `display:contents` tinha deixado sem caixa (o `G-A11Y-10`, irmão deste). Ler o seletor teria
// dado a resposta errada nos dois casos.
//
// Então este gate não olha CSS: olha o RESULTADO. Varre as páginas construídas e, para cada
// elemento que o navegador desenha com `cursor:pointer`, pergunta se existe QUALQUER caminho de
// teclado até a ação que a mão de ponteiro promete.
//
// WCAG 2.1.1 (Keyboard), nível A.

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

test("o que o CSS declara clicável é operável pelo teclado, em toda página do catálogo",
  async ({page}) => {
    const falhas: string[] = [];
    for (const f of PAGES) {
      await page.goto(`/apps/catalog/${f}`);
      const desta = await page.evaluate(() => {
        const ruins: string[] = [];
        // ATIVÁVEL, e não "focável" — a distinção custou uma volta e é a razão de este gate
        // funcionar.
        //
        // A primeira versão aceitava qualquer `[tabindex]:not([tabindex='-1'])` como prova de
        // caminho de teclado, e PASSOU VERDE numa página onde o defeito existe. O motivo: o
        // catálogo envolve cada demonstração num `<div class="demo-panel" role="tabpanel"
        // tabindex="0">` — foco de ROLAGEM, para o painel ser alcançável quando o conteúdo
        // transborda. Todo conteúdo demonstrado está dentro dele, então `closest([tabindex])`
        // absolvia o catálogo INTEIRO. O gate media o embrulho do catálogo, não o componente.
        //
        // Foco não é ativação. Um `tabpanel` recebe foco e não faz nada quando se aperta Enter;
        // um `<button>` faz. O que absolve uma superfície clicável é haver uma AÇÃO alcançável,
        // e por isso a lista abaixo é de coisas que ativam:
        //
        //   nativos      button, a[href], summary, e os controles de formulário
        //   por papel    os `role` de widget acionável da WAI-ARIA
        //
        // Ficam de fora, de propósito, `role=tabpanel`, `region`, `group` e `[tabindex]` solto:
        // são contêineres focáveis, e foco de contêiner não é a promessa que a mão de ponteiro
        // faz.
        const PAPEIS_ATIVAVEIS = ["button", "link", "menuitem", "menuitemcheckbox",
          "menuitemradio", "option", "tab", "checkbox", "radio", "switch", "treeitem"];
        const OPERAVEL = "button:not([disabled]), a[href], input:not([disabled]), " +
          "select:not([disabled]), textarea:not([disabled]), summary, " +
          PAPEIS_ATIVAVEIS.map((r) => `[role="${r}"]`).join(", ");

        const visivel = (el: Element) => {
          const r = el.getBoundingClientRect();
          const c = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && c.visibility !== "hidden" && c.display !== "none";
        };

        // DESABILITADO não é defeito de teclado: um controle inerte não promete ação nenhuma, e
        // o `cursor:pointer` nele é herança da regra do estado normal. Acusá-lo faria o gate
        // cobrar caminho de teclado para um checkbox que existe justamente para NÃO ser operável
        // — foi o que ele fez na primeira medição, com os `label.checkbox` das demonstrações de
        // estado `disabled`.
        const inerte = (el: Element) => {
          if (el.closest("[disabled], [aria-disabled='true'], [data-disabled], [inert]")) return true;
          // E também para BAIXO: uma superfície cujo único controle está desabilitado não promete
          // ação nenhuma. O `<label class="checkbox">` de uma demonstração de estado `disabled`
          // envolve um `<input disabled>` — o `closest` não o vê, porque o controle é FILHO, e o
          // gate acusava o rótulo de não ter caminho de teclado. Ele não tem, e está certo assim.
          const controles = el.querySelectorAll("input, select, textarea, button");
          return controles.length > 0 &&
            [...controles].every((c) => (c as HTMLInputElement).disabled);
        };

        for (const el of document.querySelectorAll<HTMLElement>("*")) {
          if (getComputedStyle(el).cursor !== "pointer" || !visivel(el) || inerte(el)) continue;

          // TRÊS CAMINHOS, e os três são legítimos — por isso o gate pergunta pelos três em vez
          // de exigir que o próprio elemento seja focável:
          //
          //  1. o elemento É operável        — `<button class="btn">`
          //  2. um ANCESTRAL é operável      — `cursor:pointer` HERDA, então todo <span> dentro
          //                                    de um botão chega aqui, e nenhum deles é defeito
          //  3. um DESCENDENTE é operável    — `<label class="checkbox">` envolve o <input>, e
          //                                    é o input que recebe o foco e a tecla
          //
          // Sobra o caso real: uma superfície que promete clique e não tem ação alcançável em
          // lugar nenhum da linhagem nem do conteúdo.
          if (el.matches(OPERAVEL)) continue;
          if (el.closest(OPERAVEL)) continue;
          if (el.querySelector(OPERAVEL)) continue;

          // QUARTO CAMINHO: dentro de um `<label>` com controle associado.
          //
          // Ele não é um refinamento — sem ele o gate acusa a metade do desenho de todo controle
          // marcável da Aurea. O `<span class="control-mark">` (a caixa desenhada) é IRMÃO do
          // `<input>`, não pai nem filho: `matches` não pega, `closest` não pega porque o
          // ancestral é um `<label>`, e `querySelector` não pega porque o span não tem filhos.
          // Os três caminhos falham, e mesmo assim clicar nele ATIVA o controle — é o que um
          // `<label>` faz, e é por isso que a caixa desenhada funciona ao clique.
          //
          // Medido em 28/08/2026: acusava `span.control-mark` em 16 páginas, `span.switch-track`
          // em 8 e `span.sr-only` em 5, todos corretos e todos operáveis.
          const rotulo = el.closest("label");
          if (rotulo) {
            const alvo = rotulo.getAttribute("for");
            if (rotulo.querySelector(OPERAVEL) || (alvo && document.getElementById(alvo))) continue;
          }

          // SÓ A RAIZ. `cursor:pointer` herda, então uma superfície defeituosa arrasta todos os
          // filhos dela para o relatório: a primeira medição acusou `span`, `strong`,
          // `span.muted`, `i.status-dot` e mais seis — todos DENTRO do mesmo
          // `div.card.card-interactive`, e nenhum deles é uma causa. Reportar o sintoma junto com
          // a causa esconde quantos defeitos distintos existem, que é a mesma lição do detector
          // de ordem de foco acusando o mesmo `nav-toggle` nas sete páginas.
          //
          // O ancestral mais alto que também tem `cursor:pointer` e também não tem caminho é a
          // causa; ele será (ou já foi) visitado por este mesmo laço.
          const paiTambemFalha = (() => {
            for (let a = el.parentElement; a; a = a.parentElement) {
              if (getComputedStyle(a).cursor !== "pointer") return false;
              if (a.matches(OPERAVEL) || a.querySelector(OPERAVEL)) return false;
              return true;   // o pai imediato herda o defeito: ele é a causa, não este
            }
            return false;
          })();
          if (paiTambemFalha) continue;

          // `className` num SVG é um `SVGAnimatedString`, não uma string — sem isto o relatório
          // dizia `svg.[object.SVGAnimatedString]`.
          const classe = typeof el.className === "string" ? el.className
            : (el.getAttribute("class") ?? "");
          const onde = el.tagName.toLowerCase() +
            (classe ? "." + classe.trim().split(/\s+/).join(".") : "");
          ruins.push(onde);
        }
        return [...new Set(ruins)];
      });
      for (const r of desta) falhas.push(`${f}: ${r}`);
    }

    // O relatório agrupa por CLASSE, não por página: o mesmo defeito aparece em dezenas de
    // páginas, e listar todas esconde quantas causas distintas existem. Foi a lição do detector
    // de ordem de foco, que acusava o mesmo `nav-toggle` nas sete páginas como se fossem sete.
    const porClasse = new Map<string, number>();
    for (const f of falhas) {
      const k = f.split(": ")[1];
      porClasse.set(k, (porClasse.get(k) ?? 0) + 1);
    }
    // O relatório nomeia UMA PÁGINA por classe. Sem ela o resultado não é acionável: a primeira
    // medição disse `label.checkbox (em 1 página)` e conferir a primeira página com essa classe
    // mostrou um `<label>` com `<input>` dentro, correto — a acusada era outra, e não havia como
    // saber qual.
    const exemplo = new Map<string, string>();
    for (const f of falhas) {
      const [pag, k] = [f.split(": ")[0], f.split(": ")[1]];
      if (!exemplo.has(k)) exemplo.set(k, pag);
    }
    const resumo = [...porClasse.entries()].sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `  ${k}  (em ${n} página(s), p.ex. ${exemplo.get(k)})`).join("\n");

    expect(porClasse.size, `superfície com \`cursor:pointer\` e SEM caminho de teclado — a mão de ` +
      `ponteiro promete uma ação que o teclado não alcança (WCAG 2.1.1):\n${resumo}\n\n` +
      `Corrija a SEMÂNTICA, não o sintoma: decida o que a superfície promete e renderize o ` +
      `elemento que materializa a promessa (\`<button>\` para ação, \`<a href>\` para navegação). ` +
      `\`tabindex="0"\` numa <div> deixa o gate verde e a pessoa sem papel, sem tecla e sem nome ` +
      `acessível.`).toBe(0);
  });
