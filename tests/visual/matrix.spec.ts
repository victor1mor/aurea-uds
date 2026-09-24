import {test, expect} from "@playwright/test";
import {createElement as h, type ReactNode} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {
  AureaProvider, Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator, ButtonGroup,
  Button, Banner, Badge,
} from "../../packages/react/dist/index.js";

// Matriz de aceite da Fase 3: variantes × estados × temas × densidades.
//
// Usa createElement em vez de JSX de propósito: o Playwright aplica o transform
// JSX DELE em .tsx dentro do testDir, e o React rejeita o resultado.
//
// Importa o dist/ (não o src/): o Playwright transforma .tsx, e assim a matriz
// ainda testa exatamente o que é publicado.
// Popups (ContextMenu/Combobox) exigem interação — cobertos no Vitest.
const SPRITE = "/packages/icons/dist/aurea-icons.svg";
const THEMES = ["dark", "light"] as const;
const DENSITIES = ["compact", "comfortable", "spacious"] as const;

const secao = (titulo: string, ...filhos: ReactNode[]) =>
  h("section", {className: "stack", key: titulo}, h("h3", null, titulo), ...filhos);

const matriz = () =>
  h("div", {className: "stack", style: {padding: 24, maxWidth: 900}},
    secao("Toolbar — estados",
      h(Toolbar, {label: "Normal"},
        h(ToolbarGroup, {label: "Formato"},
          h(ToolbarButton, {leadingIcon: "edit"}, "Editar"),
          h(ToolbarButton, null, "Normal"),
        ),
        h(ToolbarSeparator, null),
        h(ToolbarButton, {disabled: true}, "Desabilitado"),
        h(ToolbarButton, {variant: "primary"}, "Primário"),
      ),
      h(Toolbar, {label: "Vertical", orientation: "vertical", style: {width: 160}},
        h(ToolbarButton, null, "Um"),
        h(ToolbarSeparator, null),
        h(ToolbarButton, null, "Dois"),
      ),
    ),
    secao("ButtonGroup — variantes e estados",
      h(ButtonGroup, {label: "Variantes"},
        ...(["primary", "secondary", "outline", "ghost", "danger"] as const).map((v) =>
          h(Button, {key: v, variant: v}, v)),
      ),
      h(ButtonGroup, {label: "Estados"},
        h(Button, null, "Normal"),
        h(Button, {disabled: true}, "Desabilitado"),
        h(Button, {loading: true}, "Carregando"),
      ),
    ),
    secao("Banner — variantes",
      ...(["info", "success", "warning", "danger"] as const).map((v) =>
        h(Banner, {key: v, variant: v, title: `Banner ${v}`, icon: "information", onDismiss: () => {}},
          h("p", null, "Texto de apoio do banner."))),
      h(Banner, {title: "Sem ícone e sem dispensar"},
        h("p", null, "Variação mínima: o grid não quebra sem as colunas laterais.")),
    ),
    secao("Badge — referência de densidade",
      h("div", {className: "cluster"},
        ...(["neutral", "primary", "success", "warning", "danger", "info"] as const).map((v) =>
          h(Badge, {key: v, variant: v}, v))),
    ),
  );

// O sprite entra pelo AureaProvider (achado A4): antes cada componente com ícone recebia
// spriteUrl na mão. Aqui isso também prova o caminho que o consumidor real usa.
const BODY = renderToStaticMarkup(h(AureaProvider, {spriteUrl: SPRITE}, matriz()));

const pagina = (theme: string, density: string) =>
  `<!doctype html><html data-theme="${theme}" data-density="${density}">
   <head>
     <link rel="stylesheet" href="/packages/fonts/dist/fonts.css">
     <link rel="stylesheet" href="/packages/core/dist/aurea.css">
   </head><body>${BODY}</body></html>`;

for (const theme of THEMES) {
  for (const density of DENSITIES) {
    test(`matriz · ${theme} · ${density}`, async ({page, baseURL}) => {
      // Serve o fixture numa URL REAL do servidor em vez de setContent: o
      // <use href> do sprite de ícones só resolve same-origin, e setContent
      // deixaria o documento em about:blank (ícones sumiriam).
      const url = `${baseURL}/__matriz`;
      await page.route(url, (route) =>
        route.fulfill({contentType: "text/html; charset=utf-8", body: pagina(theme, density)}),
      );
      await page.goto(url, {waitUntil: "networkidle"});
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("body")).toHaveScreenshot(`matriz-${theme}-${density}.png`);
    });
  }
}
