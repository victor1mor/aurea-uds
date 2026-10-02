// Espera as transições de cor TERMINAREM — em vez de um tempo fixo depois de trocar o tema.
//
// 🔴 POR QUE EXISTE (01/10/2026): a varredura do catálogo trocava para o tema claro e esperava
// 250ms, porque a transição de cor do core dura ~120ms (`--duration-fast`). Na CI do pedido #23 o
// WebKit, numa máquina carregada, ainda estava no meio da transição, e o axe acusou contraste baixo
// no item ativo do topo de `containerscope.html` — num catálogo IDÊNTICO ao que tinha passado na
// CI anterior. Reproduzido no Chromium alongando a transição para 1,5s: a espera fixa dá a mesma
// acusação (`color-contrast · <a class="btn btn-nav" …>`), e esperar as transições dá zero.
//
// O que se espera são as animações FINITAS: as rodinhas (`.spinner`) giram para sempre, e o
// `finished` delas nunca resolve. O `getAnimations()` já força o recálculo de estilo, então as
// transições disparadas pela troca de tema já estão na lista quando ele responde.
import type {Page} from "@playwright/test";

export async function esperarTransicoes(page: Page): Promise<void> {
  await page.evaluate(() => Promise.all(document.getAnimations()
    .filter(a => a.effect && Number.isFinite(a.effect.getComputedTiming().endTime as number))
    .map(a => a.finished.catch(() => undefined))));
}
