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

test.describe("shell · gaveta de navegação", () => {
  test("em 375px a lateral sai do fluxo e o conteúdo vem primeiro", async ({page}) => {
    await page.setViewportSize(MOVEL);
    await page.goto(PAGINA);
    const lateral = page.locator(".sidebar");
    await expect(lateral).toBeHidden();
    // o h1 é o objetivo da página: ele tem de estar na PRIMEIRA tela, sem rolar
    const caixa = await page.locator("h1").boundingBox();
    expect(caixa!.y, "o h1 tem de caber na primeira tela em 375px").toBeLessThan(MOVEL.height);
  });

  test("o disparador anuncia o estado, e quem preenche isso é o navegador", async ({page, browserName}) => {
    // CHROMIUM SÓ, e não por preguiça: a única forma de ler o estado IMPLÍCITO é a árvore de
    // acessibilidade do navegador, e o protocolo que a expõe (CDP) não existe fora do Chromium.
    // Escopar é declarar onde a medição é possível; fingir que roda nos três seria pior, porque
    // um `expect` que não pode rodar vira cobertura de mentira. O que o WebKit e o Firefox
    // cobrem desta gaveta são os quatro testes ao redor, que medem comportamento observável.
    test.skip(browserName !== "chromium", "a árvore de acessibilidade só se lê por CDP, que é do Chromium");
    await page.setViewportSize(MOVEL);
    await page.goto(PAGINA);
    const botao = page.getByRole("button", {name: "Navigation"});
    await expect(botao).toBeVisible();
    // `aria-expanded` NÃO existe como atributo no DOM — o popover o entrega na ÁRVORE DE
    // ACESSIBILIDADE, derivado do `popovertarget`. Medido em 30/07/2026, e por isso este teste
    // lê a árvore por CDP: `getByRole(..., {expanded})` do Playwright consulta o atributo e
    // não enxerga o estado implícito (tentado primeiro, e falhou — fica registrado para a
    // próxima pessoa não repetir). Chromium só, que é o único navegador instalado aqui.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Accessibility.enable");
    const estado = async () => {
      const {nodes} = await cdp.send("Accessibility.getFullAXTree") as any;
      const n = nodes.find((x: any) => x.role?.value === "button" && x.name?.value === "Navigation");
      return n?.properties?.find((p: any) => p.name === "expanded")?.value?.value;
    };
    expect(await estado(), "fechada, o disparador anuncia expanded=false").toBe(false);
    await botao.click();
    await expect(page.locator(".sidebar")).toBeVisible();
    expect(await estado(), "aberta, o disparador anuncia expanded=true").toBe(true);
  });

  test("Escape fecha a gaveta e devolve o foco ao disparador", async ({page}) => {
    await page.setViewportSize(MOVEL);
    await page.goto(PAGINA);
    const botao = page.getByRole("button", {name: "Navigation"});
    await botao.click();
    await expect(page.locator(".sidebar")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".sidebar")).toBeHidden();
    await expect(botao).toBeFocused();
  });

  test("o teclado alcança a navegação depois de abrir", async ({page}) => {
    await page.setViewportSize(MOVEL);
    await page.goto(PAGINA);
    await page.getByRole("button", {name: "Navigation"}).click();
    const dentro = () => page.evaluate(() =>
      document.querySelector(".sidebar")!.contains(document.activeElement));
    // A GARANTIA MUDOU NO K1. Era "o primeiro Tab depois de abrir cai dentro" — o que dependia
    // de o motor pôr o conteúdo do popover na ordem de tabulação do documento. O Chromium põe;
    // o WebKit NÃO. Agora quem põe o foco somos nós, e o que se cobra é o fato que vale nos
    // três motores: abriu, está dentro.
    // `expect.poll` e não leitura direta: o `toggle` do popover é ASSÍNCRONO, então ler o
    // activeElement logo depois do clique é corrida — e ela mordeu na primeira execução, com o
    // Chromium reprovando e o WebKit passando por sorte. Esperar a condição é o que torna este
    // gate uma afirmação sobre o comportamento e não sobre a velocidade da máquina.
    await expect.poll(dentro, {message: "abrir a gaveta põe o foco DENTRO dela"}).toBe(true);
    // NÃO se cobra aqui que o Tab SIGA dentro, e a ausência é deliberada e medida: no WebKit o
    // Tab escapa do popover a partir de QUALQUER elemento de dentro (rastro de focusin: link[0]
    // → botão fora). Fechar isso exige prender o foco enquanto aberto, ou seja, tornar a gaveta
    // MODAL — e este componente declara não-modalidade de propósito, no `layout.tsx`. Era decisão
    // de desenho, e o Victor DECIDIU em 10/08/2026: continua não-modal, e isto aqui é limite
    // declarado, não pendência (ADR-0019, Decisão 3).
    // Escrever a asserção e pular no WebKit seria fingir cobertura; escrevê-la sem cumprir seria
    // gate vermelho permanente. Fica o que é verdade nos três.
  });

  test("a partir de lg não há gaveta: a lateral é a lateral", async ({page}) => {
    await page.setViewportSize({width: 1024, height: 900});
    await page.goto(PAGINA);
    await expect(page.locator(".sidebar")).toBeVisible();
    await expect(page.getByRole("button", {name: "Navigation"})).toBeHidden();
    // e ela continua sendo uma coluna do grid, não um popup encostado na tela
    expect(await page.locator(".sidebar").evaluate(el => getComputedStyle(el).position)).toBe("sticky");
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
