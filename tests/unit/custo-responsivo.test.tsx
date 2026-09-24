import {act} from "react";
import {createRoot} from "react-dom/client";
import {AureaProvider, Tabs, Toolbar, Button, ContainerScope} from "../../packages/react/src/index";

// G-AXIS-06 — o CUSTO do resolvedor, medido em vez de temido.
//
// O Victor foi explícito nos dois sentidos: nada de medo abstrato de `ResizeObserver`, e nada de
// megainfraestrutura especulativa sem medição. O que estes testes cobram é a única propriedade
// que separa "compartilhado" de "por instância": **crescer o número de componentes não pode
// crescer o número de observadores.** Se um dia alguém trocar o singleton por um observer local,
// o custo vira linear em silêncio — e é isso que estes números pegam.

// ACUMULADO de propósito: o observer é um singleton de MÓDULO e sobrevive entre testes — que é
// exatamente a propriedade sob prova. Zerar o contador a cada teste mediria "quantos nasceram
// neste teste", que é sempre zero depois do primeiro, e o teste passaria por vacuidade.
let construidosTotal = 0;
let observados = 0, largura = 420;
const mqlsCriadas = new Set<string>();
let ouvintesMQ = 0;

beforeEach(() => {
  observados = 0; ouvintesMQ = 0; mqlsCriadas.clear();
  (window as any).matchMedia = (q: string) => {
    mqlsCriadas.add(q);
    const px = Number(/(\d+)px/.exec(q)?.[1] ?? 0);
    return {
      get matches() { return 1024 >= px; }, media: q,
      addEventListener: () => { ouvintesMQ++; }, removeEventListener: () => { ouvintesMQ--; },
    };
  };
  (window as any).ResizeObserver = globalThis.ResizeObserver = class {
    constructor(_cb: unknown) { construidosTotal++; }
    observe(_el: Element) { observados++; }
    unobserve() {} disconnect() {}
  } as any;
  Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
    configurable: true, value: () => ({width: largura, height: 10, top: 0, left: 0, right: 0, bottom: 0}),
  });
});

const monta = (ui: React.ReactNode) => {
  const div = document.createElement("div");
  document.body.appendChild(div);
  act(() => { createRoot(div).render(<AureaProvider>{ui}</AureaProvider>); });
  return div;
};

const barra = (i: number) => <Toolbar key={i} label={`b${i}`}
  orientation={{base: "vertical", container: {sm: "horizontal"}}}><Button>a</Button></Toolbar>;

test("N componentes no MESMO contêiner = UM observer e UMA observação", () => {
  monta(<ContainerScope>{Array.from({length: 12}, (_, i) => barra(i))}</ContainerScope>);
  expect(construidosTotal, "o observer é um singleton de módulo: doze componentes não fazem doze")
    .toBeLessThanOrEqual(1);
  expect(observados, "o mesmo elemento observado uma vez, com um conjunto de interessados por cima")
    .toBe(1);
});

test("o custo cresce com CONTÊINERES, não com componentes", () => {
  // A propriedade que importa: dobrar os componentes não muda nada; dobrar os contêineres soma
  // uma observação cada. É o mínimo possível — não há como saber a largura de dois elementos
  // diferentes observando um só.
  monta(<>
    <ContainerScope>{Array.from({length: 8}, (_, i) => barra(i))}</ContainerScope>
    <ContainerScope>{Array.from({length: 8}, (_, i) => barra(100 + i))}</ContainerScope>
  </>);
  expect(construidosTotal, "nenhum observer NOVO: o do teste anterior continua servindo")
    .toBeLessThanOrEqual(1);
  expect(observados, "dois contêineres, duas observações — e só").toBe(2);
});

test("N componentes por VIEWPORT = os mesmos 7 ouvintes, não 7 por componente", () => {
  // Medido antes de corrigir: a versão ingênua registrava sete ouvintes POR COMPONENTE, porque
  // `useSyncExternalStore` chama `subscribe` uma vez por instância. Dez componentes davam setenta.
  const abas = [{id: "a", label: "Um", content: "um"}, {id: "b", label: "Dois", content: "dois"}];
  monta(<>{Array.from({length: 10}, (_, i) =>
    <Tabs key={i} value="a" onChange={() => {}} label={`t${i}`} tabs={abas}
      orientation={{base: "vertical", viewport: {md: "horizontal"}}} />)}</>);
  expect(mqlsCriadas.size, "uma MediaQueryList por PONTO da escala, para a aplicação inteira").toBe(7);
  expect(ouvintesMQ, "sete ouvintes reais no total — não setenta").toBe(7);
});
