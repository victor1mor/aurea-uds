import {test, expect, type Page} from "@playwright/test";

// O AVISO DE COOKIES (GAR-19, lote U, 19/10/2026): `Banner variant="consent"`, no banco `apps/keyboard-probe/lote-u.html`.
// As regras vêm de duas fontes primárias, lidas em 19/10/2026: o guia de cookies da ANPD (págs. 30–33) e o aviso de cookies
// do governo britânico. O que se mede:
// - rejeitar é tão fácil de ver quanto aceitar: os dois botões com a mesma cor, a mesma letra e a mesma altura;
// - os três botões do guia, nas palavras dele (em português);
// - as categorias que não são necessárias começam DESLIGADAS, e a necessária não tem chave;
// - a escolha chega ao app (`onConsent`) e a confirmação recebe o foco, com `role="alert"`;
// - o aviso é uma região com nome e título, no alto, e não fica preso (sem `position:fixed`);
// - o jeito direto de mudar a escolha: o app mostra o aviso de novo, e a janela abre com o que está guardado.
// Provado contra o defeito (19/10/2026), estragando o código montado: com as categorias começando ligadas, reprovam o da
// janela e o de mudar depois; sem o foco na confirmação, reprovam o de rejeitar e o de aceitar; com o "aceitar" amarelo e
// o "rejeitar" cinza, reprova o do primeiro nível.
const BANCO = process.env.AUREA_LOTE_U ?? "/apps/keyboard-probe/out/lote-u.html";
const aviso = (p: Page) => p.getByRole("region", {name: /Cookies/});
const escolhas = (p: Page) => p.evaluate(() => (window as unknown as {__consent: unknown[]}).__consent);

test("o primeiro nível: região com título, os três botões do guia, e rejeitar tão visível quanto aceitar", async ({page: p}) => {
  await p.goto(`${BANCO}?pt`);
  await expect(aviso(p)).toBeVisible();
  await expect(aviso(p).getByRole("heading", {level: 2, name: "Cookies neste site"})).toBeVisible();
  const botoes = aviso(p).getByRole("button");
  await expect(botoes).toHaveText(["Rejeitar cookies não necessários", "Aceitar todos os cookies", "Selecionar cookies"]);
  const pele = (n: number) => botoes.nth(n).evaluate((b) => {
    const c = getComputedStyle(b);
    return {fundo: c.backgroundColor, letra: c.color, tamanho: c.fontSize, peso: c.fontWeight, altura: b.getBoundingClientRect().height};
  });
  expect(await pele(0), "rejeitar e aceitar com o mesmo peso").toEqual(await pele(1));
  // No alto e sem prender: o aviso vem antes do "pular para o conteúdo" e rola com a página.
  const m = await p.evaluate(() => {
    const r = document.querySelector(".banner-consent")!;
    return {posicao: getComputedStyle(r).position, antesDoPular: !!(r.compareDocumentPosition(document.querySelector(".skip-link")!) & Node.DOCUMENT_POSITION_FOLLOWING)};
  });
  expect(m.posicao).toBe("static");
  expect(m.antesDoPular).toBe(true);
});

test("rejeitar: só a necessária fica ligada, a confirmação recebe o foco, e ocultar tira o aviso", async ({page: p}) => {
  await p.goto(BANCO);
  await aviso(p).getByRole("button", {name: "Reject non-essential cookies"}).click();
  expect(await escolhas(p)).toEqual([{choice: {necessary: true, analytics: false, marketing: false}, action: "reject"}]);
  const confirmacao = aviso(p).getByRole("alert");
  await expect(confirmacao).toHaveText("You rejected the non-essential cookies. You can change your choice at any time.");
  await expect(confirmacao).toBeFocused();
  await aviso(p).getByRole("button", {name: "Hide this message"}).click();
  await expect(aviso(p)).toHaveCount(0);
});

test("aceitar todos: tudo ligado", async ({page: p}) => {
  await p.goto(BANCO);
  await aviso(p).getByRole("button", {name: "Accept all cookies"}).click();
  expect(await escolhas(p)).toEqual([{choice: {necessary: true, analytics: true, marketing: true}, action: "accept-all"}]);
  await expect(aviso(p).getByRole("alert")).toBeFocused();
});

test("a janela: as categorias começam desligadas, a necessária não tem chave, e salvar devolve o que foi escolhido", async ({page: p}) => {
  await p.goto(BANCO);
  await aviso(p).getByRole("button", {name: "Choose cookies"}).click();
  const janela = p.getByRole("dialog", {name: "Cookie preferences"});
  await expect(janela).toBeVisible();
  await expect(janela.getByRole("switch")).toHaveCount(2);
  for (const nome of ["Analytics", "Marketing"]) await expect(janela.getByRole("switch", {name: new RegExp(nome)})).not.toBeChecked();
  await expect(janela.getByText("Always on")).toBeVisible();
  // O Esc fecha sem escolher.
  await p.keyboard.press("Escape");
  await expect(janela).toBeHidden();
  expect(await escolhas(p)).toEqual([]);
  await aviso(p).getByRole("button", {name: "Choose cookies"}).click();
  await janela.getByText("Analytics", {exact: true}).click();
  await expect(janela.getByRole("switch", {name: /Analytics/})).toBeChecked();
  await janela.getByRole("button", {name: "Save my choices"}).click();
  expect(await escolhas(p)).toEqual([{choice: {necessary: true, analytics: true, marketing: false}, action: "custom"}]);
  await expect(janela).toBeHidden();
  await expect(aviso(p).getByRole("alert")).toHaveText("Your cookie choices were saved. You can change them at any time.");
  await expect(aviso(p).getByRole("alert")).toBeFocused();
});

test("mudar depois: o aviso volta, e a janela abre com a escolha guardada", async ({page: p}) => {
  await p.goto(`${BANCO}?guardado`);
  await expect(aviso(p)).toHaveCount(0);
  await p.getByRole("button", {name: "Change cookies"}).click();
  await aviso(p).getByRole("button", {name: "Choose cookies"}).click();
  const janela = p.getByRole("dialog", {name: "Cookie preferences"});
  await expect(janela.getByRole("switch", {name: /Analytics/})).toBeChecked();
  await expect(janela.getByRole("switch", {name: /Marketing/})).not.toBeChecked();
});

test("pelo teclado: o Tab passa pelos três botões, na ordem do guia", async ({page: p, browserName}) => {
  await p.goto(BANCO);
  await expect(aviso(p)).toBeVisible();
  // O primeiro Tab cai no link da política, dentro do texto; depois, os três botões. No WebKit o Tab não passa por link
  // nenhum (a preferência do Safari, medida no `site-gar01-06.spec.ts` em 07/10/2026): lá a conta começa nos botões.
  const esperado = ["Privacy policy", "Reject non-essential cookies", "Accept all cookies", "Choose cookies"].slice(browserName === "webkit" ? 1 : 0);
  const nomes: string[] = [];
  for (let n = 0; n < esperado.length; n++) {
    await p.keyboard.press("Tab");
    nomes.push(await p.evaluate(() => document.activeElement?.textContent ?? ""));
  }
  expect(nomes).toEqual(esperado);
});

test("no celular: uma coluna, sem rolar de lado", async ({page: p}) => {
  await p.setViewportSize({width: 375, height: 812});
  await p.goto(`${BANCO}?pt`);
  await expect(aviso(p)).toBeVisible();
  const m = await p.evaluate(() => {
    const r = document.querySelector(".banner-consent")!;
    const filhos = [...r.children].map((c) => Math.round(c.getBoundingClientRect().left));
    return {colunas: getComputedStyle(r).gridTemplateColumns.split(" ").length, filhos,
      lado: document.documentElement.scrollWidth - document.documentElement.clientWidth};
  });
  expect(m.colunas).toBe(1);
  expect(new Set(m.filhos).size, "título, texto e botões alinhados à esquerda").toBe(1);
  expect(m.lado).toBe(0);
});
