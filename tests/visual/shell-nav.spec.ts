import {test, expect} from "@playwright/test";

// A GAVETA de navegação do AppShell — achado A8, Fase 8.
//
// Antes: em 375px a lateral empilhava ACIMA do conteúdo e o `h1` da página começava 4,6 telas
// abaixo, depois dos 65 itens de navegação. O gate de rolagem lateral passava: nada estourava,
// e a página era inutilizável. Usabilidade não se prova medindo overflow.
//
// Abrir, fechar, Escape, clique fora e `aria-expanded` são do POPOVER NATIVO. É justamente por
// isso que precisam de teste: garantia de plataforma que ninguém verifica é garantia que some
// numa atualização sem nada ficar vermelho.
//
// E EM 09/08/2026 O TEMOR DESTE PARÁGRAFO SE CONFIRMOU — não numa atualização, numa TROCA DE
// MOTOR. O item K1 acrescentou Firefox e WebKit ao `playwright.config.ts`, e o WebKit mostrou
// que a plataforma NÃO entrega o foco: ao abrir ele vai para o <body>, oito Tabs não entram na
// gaveta e o Escape não devolve nada. A gestão de foco passou a ser nossa (`focoDaGaveta`, no
// `aurea.js` do core e no `AppShell`), e é por isso que os dois testes de foco abaixo valem nos
// TRÊS motores: é o que separa "funciona onde eu testei" de "funciona".
const MOVEL = {width: 375, height: 812};
const PAGINA = "/apps/catalog/button.html";
// A NAVEGAÇÃO, e não toda `.sidebar`: desde a 0.32.0 a página do catálogo tem também a coluna da direita
// ("On this page", `.app-shell-aside`, DOC-01), que abaixo de 1280 DESCE para depois do conteúdo — de
// propósito. Com `.sidebar` puro o teste achava as duas (medido em 14/10/2026).
const NAV = ".sidebar:not(.app-shell-aside)";

test.describe("shell · gaveta de navegação", () => {
  test("em 375px a lateral sai do fluxo e o conteúdo vem primeiro", async ({page}) => {
    await page.setViewportSize(MOVEL);
    await page.goto(PAGINA);
    const lateral = page.locator(NAV);
    await expect(lateral).toBeHidden();
    // o h1 é o objetivo da página: ele tem de estar na PRIMEIRA tela, sem rolar
    const caixa = await page.locator("h1").boundingBox();
    expect(caixa!.y, "o h1 tem de caber na primeira tela em 375px").toBeLessThan(MOVEL.height);
  });

  // O SITE B (o item 10, aprovado pela bancada em 01/11/2026): no celular a gaveta do lado deu lugar à FOLHA QUE SOBE DE
  // BAIXO (`Drawer side="bottom"`), aberta pelo botão "Menu" (vivo, `apps/catalog/live/site.tsx`). O botão "Navigation" da
  // gaveta do `AppShell` sai quando o botão vivo existe. Os três testes abaixo cobravam a gaveta pelo botão "Navigation"
  // NESTA página; passaram a cobrar a mesma coisa na folha: o estado anunciado, o Esc que fecha e devolve o foco, e o foco
  // que entra. A gaveta do `AppShell` como peça continua coberta onde ela é a navegação (o `appshell-an01.spec.ts`).
  // Agora o estado é um ATRIBUTO (`aria-expanded` no botão, escrito pelo site), e se lê nos três motores.
  test("o disparador anuncia o estado", async ({page}) => {
    await page.setViewportSize(MOVEL);
    await page.goto(PAGINA);
    const botao = page.getByRole("button", {name: "Menu", exact: true});
    await expect(botao).toBeVisible();
    await expect(page.getByRole("button", {name: "Navigation", exact: true})).toBeHidden();
    await expect(botao).toHaveAttribute("aria-expanded", "false");
    await botao.click();
    await expect(page.getByRole("dialog", {name: "Menu"})).toBeVisible();
    // Com a folha aberta (modal), o resto da página sai da árvore de acessibilidade: o botão se lê pela classe.
    await expect(page.locator(".site-menu-botao")).toHaveAttribute("aria-expanded", "true");
  });

  test("Escape fecha a folha e devolve o foco ao disparador", async ({page}) => {
    await page.setViewportSize(MOVEL);
    await page.goto(PAGINA);
    const botao = page.getByRole("button", {name: "Menu", exact: true});
    await botao.click();
    await expect(page.getByRole("dialog", {name: "Menu"})).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", {name: "Menu"})).toBeHidden();
    await expect(botao).toBeFocused();
  });

  test("o teclado alcança a navegação depois de abrir", async ({page}) => {
    await page.setViewportSize(MOVEL);
    await page.goto(PAGINA);
    await page.getByRole("button", {name: "Menu", exact: true}).click();
    const folha = page.getByRole("dialog", {name: "Menu"});
    // `expect.poll`: a janela abre e põe o foco dentro de forma assíncrona.
    await expect.poll(() => folha.evaluate((el) => el.contains(document.activeElement)),
      {message: "abrir a folha põe o foco DENTRO dela"}).toBe(true);
    // E a lista da área (a da lateral) está nela: a página atual, marcada.
    await expect(folha.locator('.sidebar-item[aria-current="page"]')).toBeVisible();
  });

  // O nome EXATO (site B, 01/11/2026): a lateral de Components tem a família "Navigation", com o botão que a abre e fecha
  // ("11 Navigation"); por pedaço do nome, o teste achava esse botão e não o da gaveta.
  test("a partir de lg não há gaveta: a lateral é a lateral", async ({page}) => {
    await page.setViewportSize({width: 1024, height: 900});
    await page.goto(PAGINA);
    await expect(page.locator(NAV)).toBeVisible();
    await expect(page.getByRole("button", {name: "Navigation", exact: true})).toBeHidden();
    // e ela continua sendo uma coluna do grid, não um popup encostado na tela
    expect(await page.locator(NAV).evaluate(el => getComputedStyle(el).position)).toBe("sticky");
  });

  test("página curta não estica a barra do topo", async ({page}) => {
    // Medido no desenho da B-10 (24/09/2026): sem linhas declaradas no `.app-shell`, o grid
    // repartia a sobra do `min-height:100vh` entre a barra e o conteúdo, e numa página curta em
    // tela estreita a barra crescia (56px viravam 76px na 0.9.0). A altura com o conteúdo longo
    // é a referência; encurtar o conteúdo não pode mudá-la.
    await page.setViewportSize(MOVEL);
    await page.goto(PAGINA);
    const barra = page.locator(".topbar");
    const longa = (await barra.boundingBox())!.height;
    await page.locator("main.content").evaluate(el => { el.innerHTML = "<p>curta</p>"; });
    const curta = (await barra.boundingBox())!.height;
    expect(curta, "a sobra da tela vai para o conteúdo, não para a barra").toBe(longa);
  });
});
