// OS ACABAMENTOS (ADR-0086, 28/10/2026): o brilho (`glow`) e o fio (`ring`), que o APP escolhe — nenhuma peça muda sem
// pedir —, na web e no nativo; e o `blurred` do `Header` corrigido (o cartão a 72%, só na web). O Victor viu os três na
// bancada e disse *"Pode os três"*, com o menu como correção do `blurred`.
// Provado contra o defeito (28/10/2026): com o código da 0.47.0, reprovam todos (as props não existem, o CSS não tem as
// regras e o `blurred` é transparente).
import {render} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import * as React from "react";
import {describe, expect, it} from "vitest";
import {Badge as BadgeWeb, Button as ButtonWeb, IconButton as IconButtonWeb} from "../../packages/react/src/index.js";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Badge, Button, IconButton, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";
import {comOpacidade} from "../../packages/native/src/estilos.js";

const RAIZ = join(__dirname, "../..");
const css = readFileSync(join(RAIZ, "packages/core/src/aurea.css"), "utf8");
const claro = resolverTokens("light", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({star: Glifo});
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider theme="light" icons={ICONES}>{children}</AureaProvider>;
const plano = (p: Record<string, unknown> | undefined) => StyleSheet.flatten(p?.style as never) as Record<string, unknown>;
type Camada = {offsetX?: number; offsetY?: number; blurRadius?: number; spreadDistance?: number; color?: string; inset?: boolean};
const camadas = () => __instancias("View").map(plano).flatMap((s) => (Array.isArray(s?.boxShadow) ? s.boxShadow : []) as Camada[]);

describe("a web: a prop escreve o atributo, e só quando o app pede", () => {
  it("o `glow` e o `ring` do Button e do IconButton", () => {
    const {container} = render(<>
      <ButtonWeb variant="primary" glow>Start</ButtonWeb>
      <ButtonWeb appearance="soft" tone="brand" ring>Soft</ButtonWeb>
      <ButtonWeb variant="primary" glow={false}>Off</ButtonWeb>
      <ButtonWeb variant="primary">Default</ButtonWeb>
      <IconButtonWeb icon="star" label="Star" variant="primary" glow ring/>
    </>);
    const [a, b, c, d, e] = [...container.querySelectorAll("button")];
    expect(a.getAttribute("data-glow")).toBe("true");
    expect(b.getAttribute("data-ring")).toBe("true");
    expect(c.getAttribute("data-glow")).toBe("false");
    expect(d.hasAttribute("data-glow") || d.hasAttribute("data-ring"), "o padrão não escreve nada").toBe(false);
    expect([e.getAttribute("data-glow"), e.getAttribute("data-ring")]).toEqual(["true", "true"]);
  });
  it("o `ring` do Badge", () => {
    const {container} = render(<><BadgeWeb tone="success" ring>Paid</BadgeWeb><BadgeWeb tone="success">Paid</BadgeWeb></>);
    const [a, b] = [...container.querySelectorAll(".badge")];
    expect(a.getAttribute("data-ring")).toBe("true");
    expect(b.hasAttribute("data-ring")).toBe(false);
  });
});

describe("o core: as regras dos acabamentos e o `blurred` corrigido", () => {
  it("o brilho: só no botão principal, a cor dele a 40%, e ele fica no foco", () => {
    expect(css).toContain(':is([data-glow="true"] .btn-primary:not([data-glow]),.btn-primary[data-glow="true"])');
    expect(css).toMatch(/:not\(\[aria-disabled="true"\]\) \{\s*box-shadow:0 var\(--space-1\) calc\(var\(--space-3\) \+ var\(--space-05\)\) 0 color-mix\(in oklab, var\(--primary\) 40%, transparent\);/);
    // Que ele fica no foco se MEDE no navegador (acabamentos.spec.ts): a regra não se repete no `:focus-visible` — o
    // check 44 reprova sombra em regra de foco, e a força desta já ganha da do foco geral.
  });
  it("o fio: o tom a 30%, por dentro, no selo que não é cheio e no botão de fundo suave", () => {
    expect(css).toContain('[data-ring="true"] :is(.badge:not(.badge-solid),.btn-soft,.btn-outline,.btn-primary-outline,.btn-danger-outline):not([data-ring])');
    expect(css).toContain("box-shadow:inset 0 0 0 var(--border-width) color-mix(in oklab, var(--ring-tone, currentColor) 30%, transparent);");
    expect(css).toContain(":is(.badge-danger,.btn-tone-danger,.btn-danger-outline,.btn-danger-soft) { --ring-tone:var(--destructive); }");
  });
  it("o `blurred`: o cartão a 72%, com a cor de trás mais viva; sem desfoque, o cartão cheio", () => {
    expect(css).toContain(".topbar-flush.topbar-blurred { background:color-mix(in oklab, var(--card) 72%, transparent); -webkit-backdrop-filter:blur(var(--space-4)) saturate(160%); backdrop-filter:blur(var(--space-4)) saturate(160%); }");
    expect(css).toContain("@media (prefers-reduced-transparency:reduce) { .topbar-flush.topbar-blurred { background:var(--card);");
    expect(css).not.toContain(".topbar-flush.topbar-blurred { background:transparent;");
  });
});

describe("o nativo: as mesmas duas props", () => {
  it("o brilho no Button principal: 4 para baixo, 14 de desfoque, o primário a 40%", () => {
    render(<Envolve><Button tone="brand" glow>Start</Button></Envolve>);
    expect(camadas()).toContainEqual({offsetX: 0, offsetY: claro.size.space1, blurRadius: claro.size.space3 + claro.size.space05,
      spreadDistance: 0, color: comOpacidade(claro.color.primary, 0.4)});
    expect(__instancias("View").some((p) => (p.dataSet as {glow?: string} | undefined)?.glow === "true")).toBe(true);
  });
  it("o brilho não desenha fora do principal, nem desativado", () => {
    render(<Envolve><Button glow>Neutral</Button><Button tone="brand" appearance="outline" glow>Outline</Button><Button tone="brand" glow disabled>Off</Button></Envolve>);
    expect(camadas()).toEqual([]);
  });
  it("o fio no Button de contorno: o tom a 30%, por dentro, uma largura de borda", () => {
    render(<Envolve><Button appearance="outline" tone="success" ring>Approve</Button></Envolve>);
    expect(camadas()).toContainEqual({offsetX: 0, offsetY: 0, blurRadius: 0, spreadDistance: claro.size.borderWidth,
      color: comOpacidade(claro.color.success, 0.3), inset: true});
  });
  it("o IconButton: o brilho e o fio, como o Button", () => {
    render(<Envolve><IconButton name="star" label="Star" appearance="solid" tone="brand" glow /><IconButton name="star" label="Fav" appearance="outline" tone="brand" ring /></Envolve>);
    const cs = camadas();
    expect(cs.some((c) => !c.inset && c.color === comOpacidade(claro.color.primary, 0.4))).toBe(true);
    expect(cs.some((c) => c.inset && c.color === comOpacidade(claro.color.primary, 0.3))).toBe(true);
  });
  it("o fio no Badge que não é cheio; no cheio, nada", () => {
    render(<Envolve><Badge tone="danger" ring>Overdue</Badge></Envolve>);
    expect(camadas()).toContainEqual({offsetX: 0, offsetY: 0, blurRadius: 0, spreadDistance: claro.size.borderWidth,
      color: comOpacidade(claro.color.destructive, 0.3), inset: true});
  });
  it("o Badge cheio com `ring` não desenha", () => {
    render(<Envolve><Badge tone="danger" emphasis="solid" ring>Overdue</Badge></Envolve>);
    expect(camadas()).toEqual([]);
  });
});
