// UMA FONTE DE VERDADE PARA O TEMA — 09/09/2026.
//
// A biblioteca expõe DUAS APIs para o mesmo estado, em portas diferentes:
//   `useAureaTheme`        (@aurea-uds/react/system) — lê o DOM, funciona sem provider
//   `useTheme`/`useDensity`(@aurea-uds/react)        — lê o contexto, exige provider
//
// 🔴 Até este commit elas DIVERGIAM depois de uma escrita: o `setTheme` do `/system` escrevia
// `document.documentElement.dataset` direto, e o efeito do provider só reescreve o atributo
// quando o VALOR DELE muda — que não mudava. Resultado medido em jsdom:
//     ANTES   ctx=dark  dom=dark   attr=dark
//     DEPOIS  ctx=dark  dom=light  attr=light
// O CSS inteiro seguia o atributo (claro) enquanto todo componente que lê `useTheme()`
// renderizava como escuro. **Sem sintoma no console, e publicado na 0.6.0.**
//
// Estes testes são o controle. Eles falham no código anterior — provado antes do conserto.
import {describe, expect, it} from "vitest";
import {act, render, screen} from "@testing-library/react";
import * as React from "react";
import {AureaProvider, useAureaTheme} from "../../packages/react/src/system.js";
import {useTheme, useDensity} from "../../packages/react/src/internal.js";

function Sonda({aoMontar}:{aoMontar:(api:ReturnType<typeof useAureaTheme>)=>void}) {
  const ctx = useTheme();
  const dens = useDensity();
  const api = useAureaTheme();
  aoMontar(api);
  // Renderizado, não capturado: é o que a árvore realmente vê neste quadro.
  return <i data-testid="s" data-ctx={ctx.theme ?? "-"} data-dens={dens.density ?? "-"}
            data-dom={api.theme ?? "-"} data-domdens={api.density ?? "-"} />;
}

const raiz = () => document.documentElement;

describe("tema: as duas APIs públicas não podem divergir", () => {
  it("setTheme do /system, DENTRO do provider, move o contexto junto", async () => {
    let api!: ReturnType<typeof useAureaTheme>;
    raiz().dataset.theme = "dark";
    render(<AureaProvider><Sonda aoMontar={(a) => {api = a;}} /></AureaProvider>);
    await act(async () => {});
    expect(screen.getByTestId("s").dataset.ctx).toBe("dark");

    await act(async () => { api.setTheme("light"); });

    const s = screen.getByTestId("s");
    expect(raiz().dataset.theme).toBe("light");   // o CSS
    expect(s.dataset.dom).toBe("light");          // a API do /system
    expect(s.dataset.ctx).toBe("light");          // 🔴 o contexto — era aqui que quebrava
  });

  it("setDensity do /system, DENTRO do provider, move o contexto junto", async () => {
    let api!: ReturnType<typeof useAureaTheme>;
    raiz().dataset.density = "comfortable";
    render(<AureaProvider><Sonda aoMontar={(a) => {api = a;}} /></AureaProvider>);
    await act(async () => {});

    await act(async () => { api.setDensity("compact"); });

    const s = screen.getByTestId("s");
    expect(raiz().dataset.density).toBe("compact");
    expect(s.dataset.domdens).toBe("compact");
    expect(s.dataset.dens).toBe("compact");       // 🔴 mesma divergência, no outro eixo
  });

  it("toggleTheme do /system, DENTRO do provider, move o contexto junto", async () => {
    let api!: ReturnType<typeof useAureaTheme>;
    raiz().dataset.theme = "dark";
    render(<AureaProvider><Sonda aoMontar={(a) => {api = a;}} /></AureaProvider>);
    await act(async () => {});

    await act(async () => { api.toggleTheme(); });

    const s = screen.getByTestId("s");
    expect(raiz().dataset.theme).toBe("light");
    expect(s.dataset.ctx).toBe("light");
  });

  // ⚠ A METADE QUE O CONSERTO NÃO PODE QUEBRAR: sem provider o hook continua sozinho, escrevendo
  // o DOM — é a razão de ele existir numa porta separada, e quem usa a Aurea só pelo CSS depende
  // disso. Um conserto que exigisse provider seria uma quebra pior que o defeito.
  it("SEM provider, o hook continua escrevendo o DOM sozinho", async () => {
    let api!: ReturnType<typeof useAureaTheme>;
    raiz().dataset.theme = "dark";
    render(<Sonda aoMontar={(a) => {api = a;}} />);
    await act(async () => {});

    await act(async () => { api.setTheme("light"); });

    expect(raiz().dataset.theme).toBe("light");
    expect(screen.getByTestId("s").dataset.dom).toBe("light");
  });
});

// 🔴 O SEGUNDO DEFEITO, achado pelo conserto do primeiro — 09/09/2026.
// O `toggleTheme` do provider era `valor==="light"?"dark":"light"`. Com `valor` indefinido
// ("ninguém escolheu ainda") aquilo dava `light`: quem está no claro do sistema clicava e NÃO
// VIA NADA ACONTECER. O `useAureaTheme` sempre resolveu o desconhecido para claro e alternou
// para ESCURO, e um teste do `stable.test.tsx` já cobrava isso — **cada metade estava testada
// sozinha, e é por isso que a discordância entre elas sobreviveu.**
describe("tema: o caso 'ninguém escolheu ainda'", () => {
  it("as DUAS metades alternam para escuro quando o tema é desconhecido", async () => {
    let api!: ReturnType<typeof useAureaTheme>;
    delete raiz().dataset.theme;
    render(<AureaProvider><Sonda aoMontar={(a) => {api = a;}} /></AureaProvider>);
    await act(async () => {});
    expect(screen.getByTestId("s").dataset.ctx).toBe("-");   // desconhecido mesmo

    await act(async () => { api.toggleTheme(); });

    expect(raiz().dataset.theme).toBe("dark");
    expect(screen.getByTestId("s").dataset.ctx).toBe("dark");
  });
});
