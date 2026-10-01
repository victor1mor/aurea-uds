// ADR-0053 (01/10/2026) · o item ESCOLHIDO desenha o ícone na forma cheia (Phosphor Fill); o
// resto, no Regular. Decisão do Victor. Este arquivo cobra as três metades: a web (o símbolo
// `i-<nome>-fill` do sprite), o nativo (a chave `<nome>-fill` do registro) e a volta para o
// regular quando não existe forma cheia — nome próprio do app, ou registro sem a chave.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import * as A from "../../packages/react/src/index.js";
import {AureaProvider, BottomNav as BottomNavNativo, criarRegistroDeIcones} from "../../packages/native/src/index.js";

declare module "../../packages/react/src/index.js" {
  interface AureaIconNames { "marca-do-app": true }
}

const glifos = (el: Element) => [...el.querySelectorAll("use")].map((u) => u.getAttribute("href")!.replace(/^.*#/, ""));
const ITENS = [{id: "inicio", label: "Início", icon: "house", href: "#"},
               {id: "gastos", label: "Gastos", icon: "wallet", href: "#"}] as const;

describe("web · o item escolhido é cheio", () => {
  it("Sidebar: o atual é cheio, o outro é regular", () => {
    const {container} = render(<A.AureaProvider><A.Sidebar items={[...ITENS]} current="inicio" /></A.AureaProvider>);
    expect(glifos(container)).toEqual(["i-house-fill", "i-wallet"]);
  });
  it("BottomNav: o atual é cheio, o outro é regular", () => {
    const {container} = render(<A.AureaProvider><A.BottomNav items={[...ITENS]} current="gastos" /></A.AureaProvider>);
    expect(glifos(container)).toEqual(["i-house", "i-wallet-fill"]);
  });
  it("nome próprio do app pedido em cheio sai no regular, e não num <use> vazio", () => {
    const {container} = render(<A.AureaProvider><A.Icon name="marca-do-app" weight="fill" /></A.AureaProvider>);
    expect(glifos(container)).toEqual(["i-marca-do-app"]);
  });
});

describe("nativo · o item escolhido é cheio", () => {
  const vistos: string[] = [];
  const g = (nome: string) => (() => { vistos.push(nome); return null; }) as never;
  it("BottomNav: o atual usa a chave -fill do registro; o outro, a regular", () => {
    vistos.length = 0;
    const ICONES = criarRegistroDeIcones({house: g("house"), "house-fill": g("house-fill"),
      wallet: g("wallet"), "wallet-fill": g("wallet-fill")});
    render(<AureaProvider icons={ICONES}>
      <BottomNavNativo items={[{id: "a", label: "Início", icon: "house"}, {id: "b", label: "Gastos", icon: "wallet"}]} current="a" />
    </AureaProvider>);
    expect(vistos).toEqual(["house-fill", "wallet"]);
  });
  it("sem a chave -fill no registro, o atual sai no regular", () => {
    vistos.length = 0;
    const ICONES = criarRegistroDeIcones({house: g("house"), wallet: g("wallet")});
    render(<AureaProvider icons={ICONES}>
      <BottomNavNativo items={[{id: "a", label: "Início", icon: "house"}, {id: "b", label: "Gastos", icon: "wallet"}]} current="a" />
    </AureaProvider>);
    expect(vistos).toEqual(["house", "wallet"]);
  });
});
