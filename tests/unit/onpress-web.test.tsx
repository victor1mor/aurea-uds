// DOC-11 (16/11/2026; decisão do Victor de 06/10/2026: "onPress nos dois", como a referência e como o nativo). Na web,
// tudo que se toca aceita `onPress`, e o `onClick` continua valendo, como apelido: com os dois, rodam os dois, o `onPress`
// primeiro. Provado contra o defeito: sem o `juntarToque` (o código da 0.72.0), o `onPress` não é chamado em nenhuma peça.
import {render, fireEvent} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {Button, IconButton, CloseButton, Toolbar, ToolbarButton} from "../../packages/react/src/actions.js";
import {Card, Header} from "../../packages/react/src/markup.js";
import {Sidebar, NavList, Stepper, BottomNav} from "../../packages/react/src/navigation-client.js";
import {juntarToque} from "../../packages/react/src/pure.js";

describe("DOC-11 · o onPress na web", () => {
  it("o ajudante: só um, devolve ele; os dois, roda os dois na ordem", () => {
    const ordem: string[] = [];
    const p = () => ordem.push("press");
    const c = () => ordem.push("click");
    expect(juntarToque(p, undefined)).toBe(p);
    expect(juntarToque(undefined, c)).toBe(c);
    expect(juntarToque(undefined, undefined)).toBeUndefined();
    juntarToque(p, c)!(undefined as never);
    expect(ordem).toEqual(["press", "click"]);
  });

  it("Button, IconButton, CloseButton e ToolbarButton chamam o onPress, e o onClick continua valendo", () => {
    const casos = [
      (f: () => void, g?: () => void) => <Button onPress={f} onClick={g}>Salvar</Button>,
      (f: () => void, g?: () => void) => <IconButton icon="gear" label="Ajustes" onPress={f} onClick={g}/>,
      (f: () => void, g?: () => void) => <CloseButton onPress={f} onClick={g}/>,
      (f: () => void, g?: () => void) => <Toolbar label="Texto"><ToolbarButton onPress={f} onClick={g}>Negrito</ToolbarButton></Toolbar>,
    ];
    for (const caso of casos) {
      const press = vi.fn(); const click = vi.fn();
      const {container, unmount} = render(caso(press, click));
      fireEvent.click(container.querySelector("button")!);
      expect(press).toHaveBeenCalledTimes(1);
      expect(click).toHaveBeenCalledTimes(1);
      expect(press.mock.invocationCallOrder[0]).toBeLessThan(click.mock.invocationCallOrder[0]);
      unmount();
    }
  });

  it("o botão desativado não chama o onPress", () => {
    const press = vi.fn();
    const {container} = render(<Button disabled onPress={press}>Salvar</Button>);
    fireEvent.click(container.querySelector("button")!);
    expect(press).not.toHaveBeenCalled();
  });

  it("o Card leva o onPress ao elemento do render", () => {
    const press = vi.fn();
    const {container} = render(<Card variant="interactive" render={<button type="button"/>} onPress={press}>Relatório</Card>);
    fireEvent.click(container.querySelector("button")!);
    expect(press).toHaveBeenCalledTimes(1);
  });

  it("os itens da Sidebar, da NavList, do Stepper, da BottomNav e do Header chamam o onPress", () => {
    const press = vi.fn();
    const item = {id: "a", label: "Início", onPress: press};
    const montagens = [
      <Sidebar items={[item]}/>,
      <NavList items={[item]}/>,
      <Stepper items={[{label: "Passo 1", onPress: press}]}/>,
      <BottomNav items={[{...item, icon: "house"}]}/>,
      <Header items={[{...item, href: "#"}]}/>,
    ];
    for (const m of montagens) {
      press.mockClear();
      const {container, unmount} = render(m);
      const alvo = [...container.querySelectorAll("button, a")].find((e) => /Início|Passo 1/.test(e.textContent ?? ""))!;
      expect(alvo, "o item foi desenhado").toBeTruthy();
      fireEvent.click(alvo);
      expect(press).toHaveBeenCalledTimes(1);
      unmount();
    }
  });
});
