import {test, expect} from "@playwright/test";

// Item A4 do PLANO-1.0 — a metade CLIENTE da prova da fronteira, e a que o A3 não cobre.
//
// O A3 é estático: o `next build` renderiza a página de servidor e grava HTML, e é lá que uma
// diretiva faltando mata o build. Este aqui roda o outro lado — um pacote empacotado por
// empacotador de CLIENTE (Vite), servido como SPA, sem servidor nenhum. O que só aparece aqui:
// a aplicação HIDRATA e o estado responde ao clique. Um pacote pode passar no A3 e chegar ao
// navegador quebrado; a partir daqui, não em silêncio.
//
// A aplicação é `apps/proof-client`, construída por `pnpm build` (o `build:proof-client` entrou
// na cadeia justamente para este teste nunca rodar contra uma saída velha). O webServer do
// Playwright serve a RAIZ do repositório — por isso o `base: "./"` no vite.config.
const APP = "/apps/proof-client/out/index.html";

test("prova A4: o SPA monta, e monta com a pele da Aurea", async ({page}) => {
  const erros: string[] = [];
  page.on("console", m => m.type() === "error" && erros.push(m.text()));
  page.on("pageerror", e => erros.push(String(e)));

  await page.goto(APP);

  // Se a fronteira estivesse quebrada deste lado, o React nem montaria e o #root ficaria vazio.
  await expect(page.locator("#prova")).toBeVisible();
  // Do subpath (`@aurea-uds/react/disclosure`), que é módulo de SERVIDOR — do lado do cliente
  // ele é código normal, e é isso que se está conferindo: a diretiva não o tornou especial.
  await expect(page.locator("#prova details")).toHaveCount(1);
  // Pele: a classe sozinha não prova nada (o check 18 já ensinou isso), então mede-se o EFEITO.
  await expect(page.locator("#do-cliente")).toHaveClass(/\bcard\b/);
  const raio = await page.locator("#do-cliente").evaluate(el => getComputedStyle(el).borderRadius);
  expect(raio).toBe("22px"); // --radius-card, a identidade do CLAUDE.md
  expect(erros).toEqual([]);
});

test("prova A4: hidratou — o estado responde ao clique", async ({page}) => {
  await page.goto(APP);
  const alvo = page.locator("#alvo");
  await expect(alvo).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#estado")).toHaveText("Anterior");

  await alvo.click();

  // O `Toggle` é CONTROLADO a partir do App: o clique só muda o `aria-pressed` se o evento
  // subiu, o estado do React mudou e o componente re-renderizou. Se a hidratação não tivesse
  // acontecido, o botão estaria no DOM e inerte — que é o modo de falha silencioso.
  await expect(alvo).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#estado")).toHaveText("Próxima");
});
