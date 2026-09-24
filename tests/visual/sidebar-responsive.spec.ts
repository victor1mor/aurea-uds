import {test, expect, type Page} from "@playwright/test";
import {join} from "node:path";
import {pathToFileURL} from "node:url";

const HEIGHT = 720;
const SIDEBAR_EMBEDS = {
  floating: "/apps/catalog/embeds/sidebar.html",
  railFloating: "/apps/catalog/embeds/sidebar-slim-floating-the-icon-rail.html",
  flush: "/apps/catalog/embeds/sidebar-full-flush-the-one-exception.html",
  railFlush: "/apps/catalog/embeds/sidebar-slim-flush-the-rail-against-the-edge.html",
} as const;
const SIDEBAR_DEMOS = [
  ...Object.values(SIDEBAR_EMBEDS),
  "/apps/catalog/embeds/sidebar-groups-and-one-level-of-nesting.html",
  "/apps/catalog/embeds/sidebar-bring-your-own-navigation.html",
];

async function expectDrawerAt(page: Page, width: number) {
  await page.setViewportSize({width, height: HEIGHT});
  await page.goto("/apps/catalog/button.html");

  await expect.soft(page.locator(".sidebar"), `a lateral sai do fluxo em ${width}px`).toBeHidden();
  await expect.soft(page.getByRole("button", {name: "Navigation"}),
    `o disparador da gaveta aparece em ${width}px`).toBeVisible();
}

test.describe("Sidebar responsivo", () => {
  for (const width of [1023, 900]) {
    test(`o AppShell entrega a navegação à gaveta em ${width}px`, async ({page}) => {
      await expectDrawerAt(page, width);
    });
  }

  test("o preview standalone não herda o colapso móvel do AppShell", async ({page}) => {
    await page.setViewportSize({width: 600, height: HEIGHT});
    await page.goto(SIDEBAR_EMBEDS.floating);

    const sidebar = page.locator(".sidebar");
    await expect(sidebar).toBeVisible();
    expect.soft(await sidebar.evaluate(el => getComputedStyle(el).position),
      "uma Sidebar sem popover continua sendo um painel, não um item estático").toBe("sticky");
    const box = await sidebar.boundingBox();
    expect(box!.height, "o painel standalone ocupa a altura útil da própria moldura")
      .toBeGreaterThanOrEqual(HEIGHT * 0.8);
  });

  test("floating preserva a largura do painel e flush usa a largura crua", async ({page}) => {
    await page.setViewportSize({width: 900, height: HEIGHT});
    const cases = [
      ["full floating", SIDEBAR_EMBEDS.floating, "--sidebar-width"],
      ["rail floating", SIDEBAR_EMBEDS.railFloating, "--sidebar-rail"],
      ["full flush", SIDEBAR_EMBEDS.flush, "--sidebar-width"],
      ["rail flush", SIDEBAR_EMBEDS.railFlush, "--sidebar-rail"],
    ] as const;

    for (const [label, url, token] of cases) {
      await page.goto(url);
      const measured = await page.locator(".sidebar").evaluate((el, property) => {
        const probe = document.createElement("div");
        probe.style.cssText = "position:absolute;visibility:hidden";
        probe.style.width = `var(${property})`;
        document.body.append(probe);
        const declared = Number.parseFloat(getComputedStyle(probe).width);
        probe.remove();
        return {panel: el.getBoundingClientRect().width, declared};
      }, token);
      expect.soft(measured.panel, `${label}: a margem não pode consumir a largura declarada`)
        .toBeCloseTo(measured.declared, 1);
    }
  });

  test("o Tooltip do rail abre por foco no embed hidratado", async ({page}) => {
    await page.setViewportSize({width: 900, height: HEIGHT});
    await page.goto(SIDEBAR_EMBEDS.railFloating);
    await page.waitForFunction(() => Object.keys(document.querySelector("#root") ?? {})
      .some(key => key.startsWith("__reactContainer$")));

    await page.locator(".sidebar-item").first().focus();
    await expect(page.getByRole("tooltip", {name: "Button"})).toBeVisible({timeout: 3000});
  });

  test("o Tooltip também hidrata quando o catálogo abre direto do disco", async ({page}) => {
    const arquivo = pathToFileURL(join(process.cwd(), "apps/catalog/embeds",
      "sidebar-slim-floating-the-icon-rail.html")).href;
    await page.goto(arquivo);
    await page.waitForFunction(() => Object.keys(document.querySelector("#root") ?? {})
      .some(key => key.startsWith("__reactContainer$")));

    await page.locator(".sidebar-item").first().focus();
    await expect(page.getByRole("tooltip", {name: "Button"})).toBeVisible({timeout: 3000});
  });

  test("os três itens principais da demo são destinos reais", async ({page}) => {
    await page.goto(SIDEBAR_EMBEDS.floating);
    const items = page.locator(".sidebar-list > li > .sidebar-item");

    await expect(items).toHaveCount(3);
    await expect.soft(page.locator(".sidebar-list > li > button.sidebar-item"),
      "navegação não pode ser um botão sem ação").toHaveCount(0);
    const destinations = await items.evaluateAll(elements => elements.map(el => el.getAttribute("href")));
    expect.soft(destinations, "cada item precisa apontar para um destino não vazio")
      .toEqual(["../button.html", "../navlist.html", "../sidebar.html"]);
  });

  test("todos os links das demos resolvem para recursos existentes do catálogo", async ({page, request}) => {
    const verificados = new Set<string>();
    for (const demo of SIDEBAR_DEMOS) {
      await page.goto(demo);
      const destinations = await page.locator(".sidebar a[href]").evaluateAll(elements =>
        elements.map(el => (el as HTMLAnchorElement).href));
      expect.soft(destinations.length, `${demo} precisa ter navegação real`).toBeGreaterThan(0);
      for (const destination of destinations) {
        if (verificados.has(destination)) continue;
        verificados.add(destination);
        const response = await request.get(destination);
        expect.soft(response.ok(), `${destination} precisa existir`).toBe(true);
        await response.dispose();
      }
    }
  });
});
