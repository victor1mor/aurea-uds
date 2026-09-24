import {test, expect} from "@playwright/test";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

// Compara ESTILO COMPUTADO (não screenshot) — independe de plataforma, então vale
// como gate duro no CI Linux, igual ao rtl.spec.
const CORE_CSS = readFileSync(
  fileURLToPath(new URL("../../packages/core/dist/aurea.css", import.meta.url)),
  "utf8",
);

const VARIANTS = ["neutral", "offline", "online"] as const;
const MARKUP = VARIANTS.map(v =>
  `<span id="s-${v}" class="status${v === "neutral" ? "" : ` status-${v}`}">` +
  `<i class="status-dot"></i><span class="status-label">${v}</span></span>`,
).join("");

async function load(page: import("@playwright/test").Page, theme: "dark" | "light") {
  await page.setContent(
    `<!doctype html><html data-theme="${theme}"><head><style>${CORE_CSS}</style></head>` +
    `<body>${MARKUP}</body></html>`,
  );
}

const style = (page: import("@playwright/test").Page, sel: string, prop: string) =>
  page.evaluate(
    ([s, p]) => {
      const el = document.querySelector(s);
      if (!el) throw new Error(`sem elemento: ${s}`);
      return getComputedStyle(el).getPropertyValue(p);
    },
    [sel, prop] as const,
  );

for (const theme of ["dark", "light"] as const) {
  // O bug que este teste tranca: --subtle-foreground e --muted-foreground são o MESMO
  // valor no tema claro, então um `offline` que dependesse SÓ da cor saía pixel-idêntico
  // ao `neutral` — uma variante que não varia. Quem separa é o ponto vazado.
  test(`status: offline não colapsa no neutral (${theme})`, async ({page}) => {
    await load(page, theme);
    const neutral = await style(page, "#s-neutral .status-dot", "background-color");
    const offline = await style(page, "#s-offline .status-dot", "background-color");
    expect(offline).not.toBe(neutral);
    expect(offline).toBe("rgba(0, 0, 0, 0)");
    expect(neutral).not.toBe("rgba(0, 0, 0, 0)");
  });

  // A cor nunca é o único sinal (WCAG 1.4.1): o rótulo é texto de verdade, em
  // --foreground, e não herda a cor da variante.
  test(`status: rótulo fica legível, não pintado pela variante (${theme})`, async ({page}) => {
    await load(page, theme);
    const label = await style(page, "#s-online .status-label", "color");
    const dot = await style(page, "#s-online .status-dot", "background-color");
    expect(label).not.toBe(dot);
    expect(label).toBe(await style(page, "#s-neutral .status-label", "color"));
  });
}
