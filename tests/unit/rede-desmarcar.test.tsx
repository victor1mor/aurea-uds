// MNT-35 (o app de rede, 26/10/2026) · o mapa não desmarcava o nó escolhido: o `onSelect` só era chamado pelo botão
// do nó, e o app não tinha como saber que a pessoa clicou fora ou apertou Esc. Agora, com um nó escolhido, o clique
// na área vazia do desenho e o Esc dentro do mapa chamam `onSelect(null)` (o MESMO aviso da escolha, como a
// referência faz numa lista), e a região viva do mapa diz "Nenhum nó escolhido". O Esc que desmarcou para ali; sem
// nada escolhido, ele segue (a janela em volta fecha, como antes).
// O que se prova aqui, no jsdom: o Esc e o clique no fundo do motor. O arraste que anda pelo mapa (não é clique) e o
// modo de arrumar se provam no navegador (`tests/visual/rede-desmarcar.spec.ts`).
// Provado contra o defeito (29/10/2026): com o `graph.tsx` da 0.48.0, os cinco primeiros reprovam (nada chama o
// `onSelect`, e não há região viva — o quinto reprova só pela região); os dois últimos guardam o que NÃO pode
// desmarcar e passam nos dois casos.
import {describe, expect, test, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import {AureaProvider, ptBR} from "../../packages/react/src/index";
import {DependencyGraph} from "../../packages/react/src/graph";

const NOS = [{id: "a", label: "Firewall"}, {id: "b", label: "Switch"}, {id: "c", label: "Recepção"}];
const ARESTAS = [{from: "a", to: "b"}, {from: "b", to: "c"}];
const montar = (ui: React.ReactNode) => render(<AureaProvider strings={ptBR}>{ui}</AureaProvider>);
const mapa = (c: HTMLElement) => c.querySelector<HTMLElement>(".dependency-graph")!;
const fundo = (c: HTMLElement) => c.querySelector<HTMLElement>(".react-flow__pane")!;
const regiao = (c: HTMLElement) => c.querySelector<HTMLElement>(".dependency-graph [role=status]");

describe("MNT-35 — desmarcar o nó escolhido", () => {
  test("o Esc dentro do mapa chama onSelect(null) e para ali", () => {
    const escolher = vi.fn();
    const {container} = montar(<DependencyGraph nodes={NOS} edges={ARESTAS} selectedId="b" onSelect={escolher}/>);
    const no = container.querySelector<HTMLElement>("button.graph-node-body")!;
    const seguiu = fireEvent.keyDown(no, {key: "Escape"});
    expect(escolher).toHaveBeenCalledWith(null);
    // `fireEvent` devolve `false` quando alguém chamou `preventDefault`: o Esc foi usado, e a janela em volta não fecha.
    expect(seguiu).toBe(false);
  });

  test("o clique na área vazia do desenho chama onSelect(null)", () => {
    const escolher = vi.fn();
    const {container} = montar(<DependencyGraph nodes={NOS} edges={ARESTAS} selectedId="b" onSelect={escolher}/>);
    expect(fundo(container)).toBeTruthy();
    fireEvent.click(fundo(container));
    expect(escolher).toHaveBeenCalledWith(null);
  });

  test("a região viva diz que nada ficou escolhido", () => {
    const {container} = montar(<DependencyGraph nodes={NOS} edges={ARESTAS} selectedId="b" onSelect={() => {}}/>);
    expect(regiao(container)).toBeTruthy();
    expect(regiao(container)).toHaveAttribute("aria-live", "polite");
    expect(regiao(container)!.textContent).toBe("");
    fireEvent.keyDown(mapa(container), {key: "Escape"});
    expect(regiao(container)!.textContent).toBe("Nenhum nó escolhido");
  });

  test("a região viva se esvazia com a escolha seguinte, para falar de novo no próximo Esc", () => {
    const {container, rerender} = montar(<DependencyGraph nodes={NOS} edges={ARESTAS} selectedId="b" onSelect={() => {}}/>);
    fireEvent.keyDown(mapa(container), {key: "Escape"});
    expect(regiao(container)!.textContent).toBe("Nenhum nó escolhido");
    rerender(<AureaProvider strings={ptBR}><DependencyGraph nodes={NOS} edges={ARESTAS} selectedId="c" onSelect={() => {}}/></AureaProvider>);
    expect(regiao(container)!.textContent).toBe("");
  });

  test("sem nada escolhido, o Esc e o clique no fundo não avisam, e o Esc segue adiante", () => {
    const escolher = vi.fn();
    const {container} = montar(<DependencyGraph nodes={NOS} edges={ARESTAS} selectedId={null} onSelect={escolher}/>);
    const seguiu = fireEvent.keyDown(mapa(container), {key: "Escape"});
    fireEvent.click(fundo(container));
    expect(escolher).not.toHaveBeenCalled();
    expect(seguiu).toBe(true);
    expect(regiao(container)!.textContent).toBe("");
  });

  test("o Esc dentro de um campo do app não desmarca, e o onKeyDown do app continua chegando", () => {
    const escolher = vi.fn(), teclou = vi.fn();
    const {container} = montar(<DependencyGraph nodes={NOS} edges={ARESTAS} selectedId="b" onSelect={escolher} onKeyDown={teclou}/>);
    const campo = document.createElement("input");
    mapa(container).appendChild(campo);
    fireEvent.keyDown(campo, {key: "Escape"});
    expect(escolher).not.toHaveBeenCalled();
    expect(teclou).toHaveBeenCalledTimes(1);
  });

  test("o Esc que o app já usou (preventDefault no onKeyDown dele) não desmarca", () => {
    const escolher = vi.fn();
    const {container} = montar(<DependencyGraph nodes={NOS} edges={ARESTAS} selectedId="b" onSelect={escolher}
      onKeyDown={(e) => e.preventDefault()}/>);
    fireEvent.keyDown(mapa(container), {key: "Escape"});
    expect(escolher).not.toHaveBeenCalled();
  });
});
