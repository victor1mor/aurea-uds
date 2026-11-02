// O SITE B, A ALL COMPONENTS (01/11/2026, aprovada pelo Victor na bancada da página inteira). O que ela pediu às peças e
// aos tokens, cada um aprovado pela imagem: o `Card` clicável que SOBE com sombra (`lift`, o item 7), a moldura do ícone no
// `EmptyState` da web (`framed`, o item 9) e a sombra pequena que APARECE no escuro (a `shadow-sm` do `theme.dark`, a
// forma B: "B, em toda peça"), na web e no nativo.
// Provado contra o defeito (01/11/2026): sem a classe `card-lift`, sem a moldura no `EmptyState`, sem o valor do escuro no
// DTCG e sem o `themeShadowLayers` no `resolverTokens`, reprovam todos.
import {render} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, it} from "vitest";
import {Card} from "../../packages/react/src/layout.js";
import {EmptyState} from "../../packages/react/src/feedback-client.js";
import {resolverTokens} from "../../packages/native/src/index.js";

const raiz = join(__dirname, "..", "..");
const core = readFileSync(join(raiz, "packages/core/src/aurea.css"), "utf8");
const tokens = JSON.parse(readFileSync(join(raiz, "packages/tokens/src/aurea.tokens.json"), "utf8"));

describe("Card lift: o cartão clicável que sobe com sombra", () => {
  it("com `variant=\"interactive\"`, ganha a classe; sem `lift`, o de sempre", () => {
    const {container} = render(<><Card variant="interactive" lift render={<a href="#a" />}>a</Card>
      <Card variant="interactive" render={<a href="#b" />}>b</Card></>);
    const [com, sem] = [...container.querySelectorAll(".card")];
    expect(com.classList.contains("card-lift")).toBe(true);
    expect(sem.classList.contains("card-lift")).toBe(false);
  });
  it("nos outros cartões, `lift` não faz nada (só o clicável responde ao ponteiro)", () => {
    const {container} = render(<Card lift>c</Card>);
    expect(container.querySelector(".card")!.classList.contains("card-lift")).toBe(false);
  });
  it("a regra sobe 4 (`--space-1`), fica na cor do cartão e ganha a `--shadow-md`; parada com menos movimento", () => {
    const regra = core.match(/\.card-interactive\.card-lift:hover \{([^}]*)\}/)?.[1] ?? "";
    expect(regra).toContain("translateY(calc(-1 * var(--space-1)))");
    expect(regra).toContain("background:var(--card)");
    expect(regra).toContain("box-shadow:var(--shadow-md)");
    expect(core).toMatch(/prefers-reduced-motion:reduce\) \{ \.card-interactive\.card-lift:hover \{ transform:none; \}/);
  });
});

describe("EmptyState framed: a moldura do nativo na web", () => {
  it("com `framed`, o ícone vai dentro da moldura; sem ele, solto, como sempre", () => {
    const {container} = render(<><EmptyState framed title="A" /><EmptyState title="B" /></>);
    const [com, sem] = [...container.querySelectorAll(".empty-state")];
    expect(com.querySelector(":scope > .empty-state-frame > .icon")).not.toBeNull();
    expect(sem.querySelector(".empty-state-frame")).toBeNull();
    expect(sem.querySelector(":scope > .icon")).not.toBeNull();
  });
  it("a moldura tem 64 (`--space-16`), redonda, com o fundo e a cor do nativo (`muted`)", () => {
    const regra = core.match(/\.empty-state-frame \{([^}]*)\}/)?.[1] ?? "";
    for (const parte of ["inline-size:var(--space-16)", "block-size:var(--space-16)", "border-radius:var(--radius-full)",
      "background:var(--muted)", "color:var(--muted-foreground)"]) expect(regra).toContain(parte);
  });
});

describe("a sombra pequena no escuro", () => {
  it("o DTCG: o escuro tem a sua (uma camada, 0 1px 3px, preto a 45%); o claro, as três de antes, escritas no tema", () => {
    const escuro = tokens.theme.dark["shadow-sm"].$value;
    expect(escuro).toHaveLength(1);
    expect(escuro[0].color.alpha).toBe(0.45);
    expect(escuro[0].offsetY.value).toBe(1);
    expect(escuro[0].blur.value).toBe(3);
    expect(tokens.base["shadow-sm"].$value).toHaveLength(3);
    // e o claro escreve a dele (a mesma do base): sem ela, uma faixa clara dentro de uma página escura herdava a do escuro.
    expect(tokens.theme.light["shadow-sm"].$value).toEqual(tokens.base["shadow-sm"].$value);
  });
  it("o nativo: no escuro, a `shadowSm` é a do escuro, inteira; no claro, as três camadas", () => {
    const escuro = resolverTokens("dark", "comfortable"), claro = resolverTokens("light", "comfortable");
    expect(escuro.shadowLayers.shadowSm).toHaveLength(1);
    expect(escuro.shadowLayers.shadowSm[0].color).toBe("rgba(0,0,0,0.45)");
    expect(escuro.shadow.shadowSm.color).toBe("rgba(0,0,0,0.45)");
    expect(claro.shadowLayers.shadowSm).toHaveLength(3);
  });
});
