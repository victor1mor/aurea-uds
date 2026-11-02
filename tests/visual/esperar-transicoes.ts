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
//
// E só as de quem está DESENHADO (01/11/2026, pedido #111): a Introduction do site B tem links dentro das perguntas
// fechadas (`<details>`). No Firefox e no WebKit, a transição de quem está no conteúdo fechado começa e não anda
// (`currentTime` parado em 0), e o `finished` dela nunca resolve — a varredura travou 15 minutos em cada um. O
// `checkVisibility()` diz quem não está desenhado; ali não há cor para o axe medir.
import type {Page} from "@playwright/test";

export async function esperarTransicoes(page: Page): Promise<void> {
  await page.evaluate(() => Promise.all(document.getAnimations()
    .filter(a => a.effect && Number.isFinite(a.effect.getComputedTiming().endTime as number))
    .filter(a => { const t = (a.effect as KeyframeEffect).target; return !t || t.checkVisibility(); })
    .map(a => a.finished.catch(() => undefined))));
}
