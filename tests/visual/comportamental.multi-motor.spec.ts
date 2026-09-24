import {test, expect} from "@playwright/test";

// G-AXIS-06 — a prova das cinco capacidades recuperadas.
//
// O que mudou de natureza em relação ao `G-AXIS-04`: aqui não basta a geometria. O valor
// responsivo resolvido é a única fonte de verdade e ele tem de sair igual em QUATRO lugares —
// `aria-orientation`, `data-orientation`, teclado e desenho. Uma interface visualmente vertical
// que continua semanticamente horizontal é o defeito que esta infraestrutura existe para impedir,
// e nenhum teste que olhe só o atributo pega isso.
//
// A lista de provas é a que o Victor especificou: abaixo do ponto, acima do ponto, as duas
// travessias, sem remontagem, ARIA, data, teclado, geometria, foco preservado, três motores, RTL.

const APP = "/apps/keyboard-probe/out/index.html";
const CONT = '[data-probe="ComportamentalContainer"]';
const estreito = `${CONT} > div[data-largura="420"]`;
const largo = `${CONT} > div[data-largura="900"]`;

/** Muda a largura do CONTÊINER sem tocar na viewport — é a metade da prova que separa os dois
 *  mecanismos. Se a orientação mudasse só ao mexer na janela, o que estaria agindo seria
 *  `matchMedia` e o container query seria decoração. */
const largura = (page: import("@playwright/test").Page, sel: string, px: number) =>
  page.$eval(sel, (el, w) => { (el as HTMLElement).style.inlineSize = `${w}px`; }, px);

const orientacoes = (page: import("@playwright/test").Page, raiz: string) =>
  page.$eval(raiz, (d) => ({
    tabsData: d.querySelector(".tabs")?.getAttribute("data-orientation") ?? null,
    tabsAria: d.querySelector(".tabs")?.getAttribute("aria-orientation") ?? null,
    toolbar: d.querySelector(".toolbar")?.getAttribute("data-orientation") ?? null,
    grupo: d.querySelector(".toggle-group")?.getAttribute("data-orientation") ?? null,
    menubar: d.querySelector(".menubar")?.getAttribute("data-orientation") ?? null,
    sepData: d.querySelector(".separator")?.getAttribute("data-orientation") ?? null,
    sepAria: d.querySelector(".separator")?.getAttribute("aria-orientation") ?? null,
  }));

test("comportamental: abaixo e acima do ponto, os cinco resolvem para lados opostos", async ({page}) => {
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${CONT} .tabs`).first()).toBeVisible();

  const a = await orientacoes(page, estreito);
  const b = await orientacoes(page, largo);
  // 420px < sm(640) → vertical;  900px ≥ sm → horizontal. Mesma viewport nos dois.
  expect(a, "no contêiner de 420px os cinco deviam estar verticais").toEqual({
    tabsData: "vertical", tabsAria: "vertical", toolbar: "vertical", grupo: "vertical",
    menubar: "vertical", sepData: "vertical", sepAria: "vertical",
  });
  expect(b.toolbar).toBe("horizontal");
  expect(b.grupo).toBe("horizontal");
  expect(b.menubar).toBe("horizontal");
  expect(b.tabsData).toBe("horizontal");
  expect(b.sepData).toBe("horizontal");
  // `aria-orientation` some no horizontal porque é o DEFAULT IMPLÍCITO de `role="tablist"` e de
  // `role="separator"`. Anunciar o default explicitamente não é mais correto, é só mais ruído —
  // o que importa é não anunciar o CONTRÁRIO, e é isso que a linha acima já cobra.
  expect(b.tabsAria).toBeNull();
});

test("comportamental: o desenho segue o atributo, nos dois lados", async ({page}) => {
  // A metade que o atributo sozinho não prova. Se a pele deixasse de reagir ao
  // `data-orientation`, os atributos continuariam certos e a tela estaria errada.
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${CONT} .tabs`).first()).toBeVisible();

  const eixo = (sel: string) => page.$eval(sel, (d) => {
    const lista = d.querySelector(".tabs")!;
    const abas = [...lista.querySelectorAll(".tab")].map(t => t.getBoundingClientRect());
    return Math.abs(abas[0].top - abas[1].top) < 2 ? "linha" : "coluna";
  });
  expect(await eixo(estreito), "420px devia desenhar as abas em coluna").toBe("coluna");
  expect(await eixo(largo), "900px devia desenhar as abas em linha").toBe("linha");
});

test("comportamental: a travessia nos DOIS sentidos, sem remontar e sem perder o foco", async ({page}) => {
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${CONT} .tabs`).first()).toBeVisible();

  // carimba o nó para detectar remontagem: se o React recriar o elemento, a marca some
  await page.$eval(`${estreito} .tabs`, (el) => { (el as any).__marca = "original"; });
  await page.locator(`${estreito} .tab`).nth(1).focus();
  const focoAntes = await page.evaluate(() => document.activeElement?.textContent);

  // ESTREITO → LARGO
  await largura(page, estreito, 900);
  await expect.poll(async () => (await orientacoes(page, estreito)).toolbar,
    {message: "alargar o contêiner devia virar os cinco para horizontal"}).toBe("horizontal");

  expect(await page.$eval(`${estreito} .tabs`, (el) => (el as any).__marca),
    "o elemento foi RECRIADO na travessia — mudar de orientação não pode remontar a árvore")
    .toBe("original");
  expect(await page.evaluate(() => document.activeElement?.textContent),
    "o foco saiu de onde estava durante a mudança").toBe(focoAntes);

  // LARGO → ESTREITO
  await largura(page, estreito, 420);
  await expect.poll(async () => (await orientacoes(page, estreito)).toolbar,
    {message: "estreitar de volta devia virar os cinco para vertical"}).toBe("vertical");
  expect(await page.$eval(`${estreito} .tabs`, (el) => (el as any).__marca)).toBe("original");
});

test("comportamental: o contêiner muda SEM a viewport mudar, e a viewport sem o contêiner", async ({page}) => {
  // Os dois mecanismos são distintos e têm de continuar sendo: um resolve por ResizeObserver, o
  // outro por matchMedia, e cruzar os dois faria `md` significar duas coisas.
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${CONT} .tabs`).first()).toBeVisible();

  const porJanela = () => page.$eval('[data-probe="ComportamentalViewport"]',
    (d) => d.querySelector(".tabs")?.getAttribute("data-orientation") ?? null);

  expect(await porJanela(), "1400px ≥ md(768): a de viewport devia estar horizontal").toBe("horizontal");
  const antesDoContainer = await porJanela();
  await largura(page, estreito, 900);
  await expect.poll(async () => (await orientacoes(page, estreito)).toolbar).toBe("horizontal");
  expect(await porJanela(), "mexer num contêiner mexeu na que responde à JANELA").toBe(antesDoContainer);

  // e o outro lado: estreitar a janela vira a de viewport e NÃO a de contêiner (largura fixa)
  const antesDoContainerFixo = (await orientacoes(page, largo)).toolbar;
  await page.setViewportSize({width: 500, height: 900});
  await expect.poll(porJanela, {message: "500px < md: a de viewport devia virar vertical"}).toBe("vertical");
  expect((await orientacoes(page, largo)).toolbar,
    "encolher a janela mexeu num contêiner de largura FIXA").toBe(antesDoContainerFixo);
});

test("comportamental: o TECLADO acompanha — e a prova negativa das abas", async ({page}) => {
  // A prova que o Victor pediu explicitamente, e a razão de toda esta infraestrutura existir:
  // não basta conferir o atributo. Horizontal → Left/Right navegam e Up/Down NÃO assumem a
  // navegação das abas. Vertical → Up/Down navegam.
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${CONT} .tabs`).first()).toBeVisible();

  const move = async (raiz: string, tecla: string) => {
    await page.locator(`${raiz} .tab`).first().focus();
    const antes = await page.evaluate(() => document.activeElement?.textContent);
    await page.keyboard.press(tecla);
    const depois = await page.evaluate(() => document.activeElement?.textContent);
    return antes !== depois;
  };

  // VERTICAL (contêiner de 420px)
  expect(await move(estreito, "ArrowDown"), "vertical: Baixo tem de navegar").toBe(true);
  expect(await move(estreito, "ArrowUp"), "vertical: Cima tem de navegar").toBe(true);
  expect(await move(estreito, "ArrowRight"),
    "vertical: Direita NÃO pode navegar as abas — se navega, o motor não recebeu a orientação " +
    "resolvida e o teclado ficou no eixo errado").toBe(false);

  // HORIZONTAL (contêiner de 900px) — a prova negativa
  expect(await move(largo, "ArrowRight"), "horizontal: Direita tem de navegar").toBe(true);
  expect(await move(largo, "ArrowLeft"), "horizontal: Esquerda tem de navegar").toBe(true);
  expect(await move(largo, "ArrowDown"),
    "horizontal: Baixo NÃO pode assumir a navegação das abas").toBe(false);
  expect(await move(largo, "ArrowUp"), "horizontal: Cima NÃO pode assumir a navegação").toBe(false);
});

test("comportamental: o teclado acompanha a TRAVESSIA, não só o estado inicial", async ({page}) => {
  // O caso que separa "o motor nasceu certo" de "o motor foi atualizado": um componente que
  // recebesse a orientação só na montagem passaria em tudo acima e falharia aqui.
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${CONT} .tabs`).first()).toBeVisible();

  const move = async (tecla: string) => {
    await page.locator(`${estreito} .tab`).first().focus();
    const antes = await page.evaluate(() => document.activeElement?.textContent);
    await page.keyboard.press(tecla);
    return antes !== await page.evaluate(() => document.activeElement?.textContent);
  };

  expect(await move("ArrowDown"), "começa vertical: Baixo navega").toBe(true);
  await largura(page, estreito, 900);
  await expect.poll(async () => (await orientacoes(page, estreito)).tabsData).toBe("horizontal");
  expect(await move("ArrowRight"), "depois de alargar: Direita passa a navegar").toBe(true);
  expect(await move("ArrowDown"), "depois de alargar: Baixo para de navegar").toBe(false);
});

test("comportamental: em RTL o eixo horizontal inverte e o vertical não", async ({page}) => {
  await page.setViewportSize({width: 1400, height: 900});
  await page.goto(APP);
  await expect(page.locator(`${CONT} .tabs`).first()).toBeVisible();
  await page.evaluate(() => { document.documentElement.dir = "rtl"; });

  const primeiro = () => page.$eval(`${largo} .tabs`, (l) => {
    const abas = [...l.querySelectorAll(".tab")];
    return abas.map(t => t.getBoundingClientRect().left).indexOf(
      Math.min(...abas.map(t => t.getBoundingClientRect().left)));
  });
  expect(await primeiro(), "em RTL a PRIMEIRA aba fica à direita, então a de menor `left` é a última")
    .toBe(2);

  // e a vertical continua de cima para baixo, porque RTL é eixo inline e não bloco
  const ordemVertical = await page.$eval(`${estreito} .tabs`, (l) =>
    [...l.querySelectorAll(".tab")].map(t => Math.round(t.getBoundingClientRect().top)));
  expect([...ordemVertical].sort((a, b) => a - b), "a coluna não pode inverter em RTL")
    .toEqual(ordemVertical);
});
