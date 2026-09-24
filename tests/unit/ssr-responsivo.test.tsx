import {renderToString} from "react-dom/server";
import {act} from "react";
import {createRoot, hydrateRoot} from "react-dom/client";
import {AureaProvider, Tabs, Toolbar, Button, ContainerScope} from "../../packages/react/src/index";

// G-AXIS-06 — a metade que o navegador não prova: SSR, hidratação e o que acontece DEPOIS dela.
//
// A decisão anterior (`G-AXIS-04`) era "nada observa largura, o HTML do servidor já está certo".
// O `G-AXIS-06` abriu uma exceção para os eixos COMPORTAMENTAIS, e a exceção vem com obrigação:
// o servidor continua determinístico, a hidratação continua sem aviso, e a correção acontece
// depois — nunca durante, que é o que produz o `hydration mismatch`.

// jsdom não implementa `matchMedia` nem `ResizeObserver`. As duas fábricas abaixo são
// CONTROLÁVEIS de propósito: sem poder mover a largura à mão, os testes de travessia mediriam
// só o estado inicial — que é o defeito que o `teclado acompanha a TRAVESSIA` existe para pegar,
// um nível acima.
let larguraDaJanela = 1024;
const ouvintesMQ = new Set<() => void>();
function instalarMatchMedia() {
  (window as any).matchMedia = (q: string) => {
    const px = Number(/(\d+)px/.exec(q)?.[1] ?? 0);
    return {
      get matches() { return larguraDaJanela >= px; },
      media: q,
      addEventListener: (_: string, f: () => void) => { ouvintesMQ.add(f); },
      removeEventListener: (_: string, f: () => void) => { ouvintesMQ.delete(f); },
    };
  };
}
const observados = new Map<Element, (l: number) => void>();
function instalarResizeObserver() {
  (window as any).ResizeObserver = globalThis.ResizeObserver = class {
    cb: (e: Array<{target: Element; borderBoxSize: Array<{inlineSize: number}>; contentRect: {width: number}}>) => void;
    constructor(cb: any) { this.cb = cb; }
    observe(el: Element) {
      observados.set(el, (l) => this.cb([{target: el, borderBoxSize: [{inlineSize: l}], contentRect: {width: l}}]));
    }
    unobserve(el: Element) { observados.delete(el); }
    disconnect() { observados.clear(); }
  } as any;
}

const comProvider = (ui: React.ReactNode) => <AureaProvider>{ui}</AureaProvider>;

const abas = [{id: "a", label: "Um", content: "um"}, {id: "b", label: "Dois", content: "dois"}];

test("o servidor renderiza o valor BASE, deterministicamente", () => {
  // Duas chamadas, o mesmo HTML: nada no caminho de servidor pode depender de largura, porque no
  // servidor não existe largura nenhuma.
  const ui = comProvider(<Tabs value="a" onChange={() => {}} label="t" tabs={abas}
    orientation={{base: "vertical", viewport: {md: "horizontal"}}} />);
  const a = renderToString(ui);
  const b = renderToString(ui);
  expect(a).toBe(b);
  expect(a, "o servidor tem de emitir o BASE, não o resolvido").toContain('data-orientation="vertical"');
});

test("valor SIMPLES não assina nada — nem matchMedia, nem observer", () => {
  // É a promessa que mantém a mudança aditiva: quem não usa valor responsivo não paga nada por
  // ele. Se um dia alguém assinar incondicionalmente, este teste cai.
  instalarMatchMedia();
  const mm = vi.spyOn(window, "matchMedia");
  const ro = vi.fn();
  const original = window.ResizeObserver;
  (window as any).ResizeObserver = class { constructor() { ro(); } observe() {} unobserve() {} disconnect() {} };
  const div = document.createElement("div");
  document.body.appendChild(div);
  act(() => { createRoot(div).render(comProvider(<Toolbar label="t"><Button>a</Button></Toolbar>)); });
  expect(mm, "valor simples não pode chamar matchMedia").not.toHaveBeenCalled();
  expect(ro, "valor simples não pode criar ResizeObserver").not.toHaveBeenCalled();
  (window as any).ResizeObserver = original;
  mm.mockRestore();
});

test("hidratação sem aviso, e a correção vem DEPOIS", async () => {
  instalarMatchMedia();
  larguraDaJanela = 1024;
  // O caso que o `useSyncExternalStore` existe para resolver: a hidratação usa o snapshot de
  // SERVIDOR — casando com o HTML — e só o commit seguinte usa o do cliente. Um `useEffect`
  // ingênuo faria o mesmo; o que NÃO faria o mesmo é ler `window.matchMedia` durante o render,
  // que é o erro clássico e produz o aviso.
  const avisos: unknown[][] = [];
  const erroOriginal = console.error;
  console.error = (...a: unknown[]) => { avisos.push(a); };

  // a janela do jsdom é 1024px de largura: `md` (768) está ATINGIDO, então o cliente resolve
  // para `horizontal` enquanto o servidor mandou `vertical`. É exatamente a divergência que
  // precisa acontecer sem aviso.
  const ui = comProvider(<Tabs value="a" onChange={() => {}} label="t" tabs={abas}
    orientation={{base: "vertical", viewport: {md: "horizontal"}}} />);
  const html = renderToString(ui);
  const div = document.createElement("div");
  div.innerHTML = html;
  document.body.appendChild(div);
  expect(div.querySelector(".tabs")!.getAttribute("data-orientation")).toBe("vertical");

  await act(async () => { hydrateRoot(div, ui); });
  console.error = erroOriginal;

  const deHidratacao = avisos.filter(a => String(a[0]).toLowerCase().includes("hydrat"));
  expect(deHidratacao, `avisos de hidratação: ${JSON.stringify(deHidratacao).slice(0, 300)}`).toEqual([]);
  expect(div.querySelector(".tabs")!.getAttribute("data-orientation"),
    "depois da hidratação o valor tinha de ter sido corrigido para o da janela").toBe("horizontal");
});

test("o resolvedor de CONTAINER acha o mesmo elemento pelos dois caminhos", async () => {
  instalarResizeObserver();
  // O Victor foi explícito contra heurística. São dois caminhos — o contexto do `<ContainerScope>`
  // e a busca por `closest(".container-scope")` —, e eles têm de apontar para o MESMO elemento,
  // que é o mesmo que `@container aurea` casa no CSS.
  const div = document.createElement("div");
  document.body.appendChild(div);
  await act(async () => {
    createRoot(div).render(comProvider(
      <ContainerScope data-teste="escopo">
        <Toolbar label="t" orientation={{base: "vertical", container: {sm: "horizontal"}}}>
          <Button>a</Button>
        </Toolbar>
      </ContainerScope>));
  });
  const escopo = div.querySelector('[data-teste="escopo"]')!;
  expect(escopo.classList.contains("container-scope"),
    "o ContainerScope tem de declarar o contêiner do CSS no MESMO elemento que publica no contexto")
    .toBe(true);
  expect(div.querySelector(".toolbar")!.closest(".container-scope"),
    "o caminho de busca tem de chegar ao mesmo elemento do contexto").toBe(escopo);
});
