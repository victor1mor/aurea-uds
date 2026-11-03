import {test, expect} from "@playwright/test";
import {readFileSync} from "node:fs";

// A ÁREA RELEASES (lote U, 19/10/2026): as notas de versão da referência — uma área no topo, "All Releases" com a última
// no alto e uma página por versão, com a data e o comando de atualizar. Decisões do Victor: todas as versões, em inglês,
// numa área própria. O texto mora em `apps/catalog/content/releases/*.md`; o gerador cobra, na montagem, que toda versão
// do CHANGELOG tenha nota com a mesma data. Aqui, o que só a página mostra.
// Provado contra o defeito (19/10/2026): contra o site do `main` de antes (`BASE_SITE=http://127.0.0.1:8128`), os quatro
// reprovam — lá não há a área.
const base = process.env.BASE_SITE ?? "";
// A última versão sai do pacote, e não escrita aqui: escrita, o teste reprovava a cada versão nova (achado ao fechar a
// 0.36.0, 20/10/2026).
const VERSAO: string = JSON.parse(readFileSync("packages/react/package.json", "utf8")).version;

test("All Releases mostra a última no alto e leva cada versão à nota dela", async ({page}) => {
  await page.goto(`${base}/apps/catalog/releases.html`);
  await expect(page.locator(".site-areas a[aria-current]")).toHaveText("Releases");
  // O site B (0.54.0): a última versão é o cartão do alto, com o número em destaque e o link para a nota.
  const ultima = page.locator(".rel-ultima .rel-versao").first();
  await expect(ultima).toHaveText(`v${VERSAO}`);
  await expect(page.locator(".rel-ultima").getByRole("link", {name: "Read full release notes"}).first()).toHaveAttribute("href", `./release-v${VERSAO.replaceAll(".", "-")}.html`);
});

test("a versão que saiu dentro de outra leva à seção da nota de quem a publicou", async ({page}) => {
  await page.goto(`${base}/apps/catalog/releases.html`);
  // O site B: a linha da v0.12.0 diz "Released inside v0.12.1." e leva à seção da nota dela.
  const link = page.getByRole("link", {name: /^v0\.12\.0\b.*Released inside v0\.12\.1/});
  await expect(link).toHaveAttribute("href", "./release-v0-12-1.html#includes-v0-12-0");
  await link.click();
  await expect(page.locator("#includes-v0-12-0")).toHaveText("Includes v0.12.0");
});

test("a nota tem a data e o comando de atualizar; o do React Native só desde a 0.7.0", async ({page}) => {
  await page.goto(`${base}/apps/catalog/release-v0-27-0.html`);
  await expect(page.locator("time[datetime='2026-10-09']")).toHaveText("October 9, 2026");
  // O site B: a caixa "Update" ao lado da abertura, com Web | Native e os quatro gerenciadores (as abas escondidas contam).
  const codigo = page.locator(".rel-atualizar pre").allTextContents();
  const texto = (await codigo).join("\n");
  expect(texto).toContain("pnpm add @aurea-uds/react@0.27.0 @aurea-uds/core@0.27.0 @aurea-uds/fonts@0.27.0 @aurea-uds/icons@0.27.0");
  expect(texto).toContain("pnpm add @aurea-uds/native@0.27.0");
  await page.goto(`${base}/apps/catalog/release-v0-6-0.html`);
  await expect(page.locator(".rel-atualizar [data-g1-painel='Native']")).toHaveCount(0);
  expect((await page.locator(".rel-atualizar pre").allTextContents()).join("\n")).not.toContain("@aurea-uds/native");
});

test("o Início não leva a área Releases, como o Início da referência", async ({page}) => {
  await page.goto(`${base}/apps/catalog/index.html`);
  await expect(page.locator("header nav a", {hasText: "Docs"}).first()).toBeAttached();
  await expect(page.locator("header nav a", {hasText: "Releases"})).toHaveCount(0);
  // E toda outra página leva a aba.
  await page.goto(`${base}/apps/catalog/button.html`);
  await expect(page.locator(".site-areas a", {hasText: "Releases"})).toHaveAttribute("href", "./releases.html");
});
