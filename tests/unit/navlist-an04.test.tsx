// AN-04 · a foto e os sinais na linha do `NavList` — 03/10/2026. Um consumidor monta com ele a
// lista de conversas (`description` = a última mensagem, `value` = as não lidas), e faltavam a
// foto de quem fala e os sinais de fixada e silenciada. Cada teste reprova o código de antes, que
// ignorava as duas props em silêncio.
import {render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {AureaProvider as ProvedorWeb, NavList as NavListWeb} from "../../packages/react/src/index";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, NavList, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";

const SINAIS = [{icon: "push-pin", label: "Fixada"}, {icon: "bell-slash", label: "Silenciada"}] as const;

describe("NavList (web) · a foto e os sinais", () => {
  const conversa = (extra: Record<string, unknown> = {}) => render(<ProvedorWeb><main><NavListWeb items={[{
    id: "ana", label: "Ana", description: "Até amanhã", value: "3", href: "#ana",
    avatar: {src: "/ana.jpg", fallback: "AN"}, indicators: [...SINAIS], ...extra}]} /></main></ProvedorWeb>);

  it("a foto abre a linha, no lugar do ícone", () => {
    const {container} = conversa({icon: "user"});
    const linha = container.querySelector(".nav-list-row")!;
    expect(linha.firstElementChild).toHaveClass("avatar");
    expect(linha.querySelector(".avatar img")).toHaveAttribute("src", "/ana.jpg");
    // A foto TOMA o lugar do ícone: os dois juntos seriam duas marcas para a mesma pessoa.
    expect(linha.querySelector(":scope > .icon:not(.nav-list-chevron)")).toBeNull();
  });

  it("sem foto, o substituto", () => {
    const {container} = conversa({avatar: {fallback: "AN"}});
    expect(container.querySelector(".nav-list-row .avatar")).toHaveTextContent("AN");
  });

  it("os sinais ficam entre o texto e o valor, e cada um tem nome", async () => {
    const {container} = conversa();
    const sinais = container.querySelector(".nav-list-indicators")!;
    expect(sinais.previousElementSibling).toHaveClass("nav-list-text");
    expect(sinais.nextElementSibling).toHaveClass("nav-list-value");
    expect(sinais.querySelectorAll("svg.icon.icon-sm")).toHaveLength(2);
    expect([...sinais.querySelectorAll(".sr-only")].map((x) => x.textContent)).toEqual(["Fixada", "Silenciada"]);
    // A ORDEM do nome. Os espaços entre as partes quem põe é o leiaute, que o jsdom não tem: o nome
    // exato se mede no Chromium (`tests/visual/navlist-an04.spec.ts`).
    expect(screen.getByRole("link")).toHaveAccessibleName(/^Ana\s*Até amanhã\s*Fixada\s*Silenciada\s*3$/);
    const {violations} = await axe(container);
    expect(violations.map((v) => v.id)).toEqual([]);
  });

  it("sem foto nem sinais, a linha é a de antes", () => {
    const {container} = render(<ProvedorWeb><NavListWeb items={[{id: "a", label: "Ajustes", icon: "gear", href: "#"}]} /></ProvedorWeb>);
    expect(container.querySelector(".avatar, .nav-list-indicators")).toBeNull();
    expect(container.querySelector(".nav-list-row")!.firstElementChild).toHaveClass("icon");
  });
});

const t = resolverTokens("dark", "comfortable");
const Glifo = () => null;
// O glifo de pessoa conta quantas vezes foi desenhado: com foto, nenhuma.
const Pessoa = vi.fn(() => null);
const ICONES = criarRegistroDeIcones({"push-pin": Glifo as never, "bell-slash": Glifo as never, user: Pessoa as never, "caret-right": Glifo as never});
const estilo = (p: Record<string, unknown>) => (StyleSheet.flatten(p.style as never) ?? {}) as Record<string, unknown>;

describe("NavList (nativo) · a foto e os sinais, os mesmos da web", () => {
  const conversa = (extra: Record<string, unknown> = {}) => render(<AureaProvider icons={ICONES}><NavList items={[{
    id: "ana", label: "Ana", description: "Até amanhã", value: "3", onPress: () => {},
    avatar: {source: "https://exemplo.dev/ana.jpg", fallback: "AN"}, indicators: [...SINAIS], ...extra} as never]} /></AureaProvider>);

  it("a foto abre a linha, no tamanho do Avatar de sempre, no lugar do ícone", () => {
    conversa({icon: "user"});
    expect(__instancias("Image").at(-1)!.source).toEqual({uri: "https://exemplo.dev/ana.jpg"});
    const foto = __instancias("View").map(estilo).find((e) => e.width === t.size.controlHMd && e.height === t.size.controlHMd);
    expect(foto).toBeDefined();
    // Nenhum ícone de pessoa: a foto tomou o lugar.
    expect(Pessoa).not.toHaveBeenCalled();
  });

  it("controle: sem foto, o ícone volta", () => {
    Pessoa.mockClear();
    conversa({icon: "user", avatar: undefined});
    expect(Pessoa).toHaveBeenCalled();
  });

  it("cada sinal tem nome, e fica antes do valor", () => {
    conversa();
    const nomes = __instancias("View").filter((p) => typeof p.accessibilityLabel === "string").map((p) => p.accessibilityLabel);
    expect(nomes).toEqual(["Fixada", "Silenciada"]);
    const fila = __instancias("View").map(estilo).find((e) => e.flexDirection === "row" && e.gap === t.size.space1);
    expect(fila).toBeDefined();
  });
});
