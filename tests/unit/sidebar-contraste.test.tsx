// MNT-36 (0.50.0, ADR-0087) · a lateral de contraste, `Sidebar contrast` — a forma A ("escura neutra") que o Victor escolheu
// na bancada das 13 marcas (29/10/2026):
//   • a lateral traz `data-theme="dark"` no próprio elemento (o tema escuro DA MARCA por dentro, como o `Card contrast`);
//   • só o fundo segue a página: na clara, o cartão do escuro; na escura, a página do escuro misturada com preto;
//   • a Ember tem as cores MEDIDAS do app onde nasceu, nos tokens `sidebar-contrast*`, que só ela define — e o core lê o
//     valor da PÁGINA (`inherit`), porque o da própria lateral seria sempre o do escuro;
//   • o `AppShell` repassa (`sidebarContrast`).
// As cores se medem no navegador (`tests/visual/sidebar-contraste.spec.ts`).
// Provado contra o defeito: na 0.49.1 a `Sidebar` não tem `contrast` (o atributo cai no `<aside>` como texto, sem classe e
// sem tema), o `AppShell` não tem `sidebarContrast`, o CSS não tem as regras e os tokens da Ember não existem — reprovam.
import {render} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {describe, expect, test} from "vitest";
import {AppShell, Sidebar} from "../../packages/react/src/index";

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const fonte = JSON.parse(readFileSync("packages/tokens/src/aurea.tokens.json", "utf8"));
/** O corpo da regra cujo seletor é EXATAMENTE este (no começo da regra, não dentro de uma lista). */
const regra = (seletor: string) => {
  const esc = seletor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp(`(?:^|[}\\n])\\s*${esc}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : "";
};
const ITENS = [{id: "a", label: "Painel", icon: "house" as const, href: "#a"}, {id: "b", label: "Chamados", icon: "tray" as const, href: "#b"}];
const lateral = (c: HTMLElement) => c.querySelector("aside.sidebar") as HTMLElement;

describe("MNT-36 · Sidebar contrast", () => {
  test("a lateral de contraste traz o tema escuro no próprio elemento", () => {
    const {container} = render(<Sidebar contrast items={ITENS} current="a" label="Principal" />);
    const el = lateral(container);
    expect(el.classList.contains("sidebar-contrast")).toBe(true);
    expect(el.getAttribute("data-theme")).toBe("dark");
  });

  test("sem contrast, nada muda: nem classe, nem tema", () => {
    const {container} = render(<Sidebar items={ITENS} current="a" label="Principal" />);
    const el = lateral(container);
    expect(el.classList.contains("sidebar-contrast")).toBe(false);
    expect(el.hasAttribute("data-theme")).toBe(false);
  });

  test("a lateral com painel (panel) também ganha", () => {
    const secoes = [{id: "s", label: "Seção", icon: "house" as const, items: ITENS}];
    const {container} = render(<Sidebar contrast panel="docked" items={secoes} current="a" label="Principal" />);
    const el = lateral(container);
    expect(el.classList.contains("sidebar-contrast")).toBe(true);
    expect(el.getAttribute("data-theme")).toBe("dark");
  });

  test("a de canto reto (flush) também ganha — no AppShell, junto do sidebarVariant", () => {
    const {container} = render(<AppShell brand="App" navItems={ITENS} currentNavId="a" sidebarVariant="flush" sidebarContrast>
      <h1>Página</h1></AppShell>);
    const el = lateral(container);
    expect(el.classList.contains("sidebar-flush")).toBe(true);
    expect(el.classList.contains("sidebar-contrast")).toBe(true);
    expect(el.getAttribute("data-theme")).toBe("dark");
  });

  test("o AppShell repassa à lateral de navegação, e não à coluna da direita", () => {
    const {container} = render(<AppShell brand="App" navItems={ITENS} currentNavId="a" sidebarContrast aside={<p>Nesta página</p>}>
      <h1>Página</h1></AppShell>);
    const [nav, direita] = [...container.querySelectorAll("aside.sidebar")] as HTMLElement[];
    expect(nav.classList.contains("sidebar-contrast")).toBe(true);
    expect(nav.getAttribute("data-theme")).toBe("dark");
    expect(direita.classList.contains("app-shell-aside")).toBe(true);
    expect(direita.classList.contains("sidebar-contrast")).toBe(false);
  });
});

describe("MNT-36 · o CSS da lateral de contraste", () => {
  test("numa página clara, o fundo é o cartão do escuro; a Ember entra pelo token da página", () => {
    const r = regra(".sidebar.sidebar-contrast");
    // O `inherit` traz o valor da PÁGINA: sem ele, o token da Ember seria o do escuro na página clara também.
    for (const t of ["--sidebar-contrast", "--sidebar-contrast-accent", "--sidebar-contrast-foreground", "--sidebar-contrast-muted"])
      expect(r).toContain(`${t}:inherit`);
    expect(r).toContain("--sidebar:var(--sidebar-contrast,var(--card))");
    expect(r).toContain("--sidebar-accent:var(--sidebar-contrast-accent,var(--secondary))");
  });

  test("numa página escura (pelo ANCESTRAL, com a guarda do GAR-05), mais escura que a página", () => {
    const r = regra('[data-theme="dark"] .sidebar.sidebar-contrast:where(:not([data-theme="light"] *),[data-theme="light"] [data-theme="dark"] *)');
    expect(r).toContain("--sidebar:var(--sidebar-contrast,color-mix(in oklch,var(--background) 55%,black))");
    expect(r).toContain("--sidebar-accent:var(--sidebar-contrast-accent,var(--card))");
  });

  test("a plain (sem caixa) pinta o fundo quando é de contraste — sem isso, a letra clara ficaria sobre a página clara", () => {
    expect(regra(".sidebar-plain.sidebar-contrast")).toContain("background:var(--sidebar)");
  });

  test("na Ember, a letra e o texto de apoio também são os medidos", () => {
    const r = regra('.sidebar.sidebar-contrast:where([data-brand="ember"] *)');
    expect(r).toContain("--sidebar-foreground:var(--sidebar-contrast-foreground)");
    expect(r).toContain("--muted-foreground:var(--sidebar-contrast-muted)");
  });
});

describe("MNT-36 · os tokens da Ember (a paleta fechada a mudança)", () => {
  const MEDIDAS = {
    light: {"sidebar-contrast": "#0e141c", "sidebar-contrast-accent": "#182029", "sidebar-contrast-foreground": "#e4e8ed", "sidebar-contrast-muted": "#8c939b"},
    dark: {"sidebar-contrast": "#04080d", "sidebar-contrast-accent": "#0d151c", "sidebar-contrast-foreground": "#e1e5ea", "sidebar-contrast-muted": "#7a8188"},
  } as const;

  test("a Ember define os oito, com as cores medidas do app onde nasceu", () => {
    for (const tema of ["light", "dark"] as const)
      for (const [nome, hex] of Object.entries(MEDIDAS[tema]))
        expect(fonte.brand.ember[tema][nome]?.$value?.hex, `${tema} ${nome}`).toBe(hex);
  });

  test("só a Ember: nenhuma outra marca e nenhum tema base define a lateral de contraste", () => {
    const outros = [
      ...Object.entries(fonte.theme).filter(([k]) => !k.startsWith("$")).map(([k, v]) => [`theme.${k}`, v] as const),
      ...Object.entries(fonte.brand).filter(([k]) => !k.startsWith("$") && k !== "ember")
        .flatMap(([m, v]: [string, any]) => ["light", "dark"].map((t) => [`brand.${m}.${t}`, v[t]] as const)),
    ];
    for (const [onde, bloco] of outros)
      expect(Object.keys(bloco as object).filter((k) => k.startsWith("sidebar-contrast")), onde).toEqual([]);
  });
});
