import type {Page} from "@playwright/test";

// ABRIR UMA PÁGINA DA VARREDURA, e tentar de novo UMA vez só quando o WebKit quebra por dentro.
//
// Medido na CI em 02 e 03/10/2026: em 3 de 4 rodadas, a varredura do WebKit morreu com
// `page.goto: WebKit encountered an internal error` (#67 em `pattern-aspectratio-…`, #69 em
// `breadcrumb.html`, #70 em `skeleton.html`), cada vez numa página diferente, que tinha aberto
// normalmente dezenas de vezes na mesma rodada. É defeito do WebKit que vem com o Playwright no
// Linux: a parte de rede dele cai no meio da navegação (microsoft/playwright#42803 e #34450).
// Nas três, a queda veio logo depois de uma página com exemplo vivo numa moldura (`live.js`).
//
// O que isto NÃO faz: esconder página com defeito. Só essa mensagem exata é repetida, só uma vez,
// e se a segunda tentativa cair também o teste reprova com o erro dela. Qualquer outro erro
// sobe na hora. Repetir o teste inteiro (`retries` na configuração) custaria 15 minutos por queda;
// aqui custa uma página.
export const QUEDA_DO_WEBKIT = /WebKit encountered an internal error/;

type Navegavel = Pick<Page, "goto">;

export async function abrir(page: Navegavel, url: string, aviso?: (texto: string) => void): Promise<void> {
  try {
    await page.goto(url);
  } catch (e) {
    if (!QUEDA_DO_WEBKIT.test(String((e as Error)?.message ?? e))) throw e;
    // Fica escrito no relatório e no log da CI: é assim que se mede quantas vezes isso acontece.
    aviso?.(`o WebKit quebrou ao abrir ${url}; segunda tentativa`);
    await page.goto(url);
  }
}
