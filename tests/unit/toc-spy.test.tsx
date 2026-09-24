import {render, screen, act} from "@testing-library/react";
import {renderToStaticMarkup} from "react-dom/server";
import {AureaProvider, TableOfContents} from "../../packages/react/src/index";

// G-CAP-25. O defeito: a ficha do `TableOfContents` dizia "marks the section in view" e o
// componente React **não observava nada** — recebia `current` por prop, e o `build-catalog.mjs`
// nunca passava `current` em nenhuma das cinco chamadas. O comportamento existia DUAS vezes em
// vanilla (no `aurea.js` e, com outro `rootMargin`, no `apps/docs/index.html`) e zero vezes em
// React: quem instalava o pacote sozinho recebia um índice que nunca marcava nada.
//
// O que se cobra aqui é a REGRA de qual seção é a atual, não a existência do observador. A regra
// não é nova — é a mesma que o `tocSpy` do `aurea.js` já usava em produção, e reimplementá-la com
// outra régua criaria a terceira versão divergente do mesmo comportamento.

const SECOES = ["um", "dois", "tres"];
const ITENS = SECOES.map(id => ({id, label: id.toUpperCase()}));

// Um observador de mentira que guarda o callback, para o teste conduzir a interseção. jsdom não
// implementa IntersectionObserver, e um teste que dependesse de rolagem real não rodaria aqui.
let disparar: ((entradas: Array<{target: {id: string}; isIntersecting: boolean}>) => void) | null;
let opcoes: IntersectionObserverInit | undefined;
let desconectado = false;
class Falso {
  constructor(cb: (e: never[]) => void, o?: IntersectionObserverInit) {
    disparar = cb as never; opcoes = o;
  }
  observe() {}
  disconnect() { desconectado = true; }
  unobserve() {}
}

beforeEach(() => {
  disparar = null; opcoes = undefined; desconectado = false;
  document.body.innerHTML = SECOES.map(id => `<h2 id="${id}">${id}</h2>`).join("");
  (globalThis as {IntersectionObserver?: unknown}).IntersectionObserver = Falso;
});
afterEach(() => { delete (globalThis as {IntersectionObserver?: unknown}).IntersectionObserver; });

const monta = (props: Partial<React.ComponentProps<typeof TableOfContents>> = {}) => {
  const {container} = render(
    <AureaProvider><TableOfContents items={ITENS} {...props} /></AureaProvider>,
    {container: document.body.appendChild(document.createElement("div"))});
  return container;
};
const marcado = () => screen.queryAllByRole("link")
  .filter(a => a.getAttribute("aria-current") === "true").map(a => a.textContent);

// ── a regra ────────────────────────────────────────────────────────────────

test("sem nada cruzando a faixa, o atual é o PRIMEIRO item — é o topo da página", () => {
  monta();
  expect(marcado()).toEqual(["UM"]);
});

// A parte que não é óbvia, e a razão de a regra ser copiada e não reinventada: seção e subseção
// cruzam a faixa JUNTAS, e quem interessa é a mais específica — a última.
test("com duas cruzando, vence a ÚLTIMA, não a primeira", () => {
  monta();
  act(() => disparar!([{target: {id: "um"}, isIntersecting: true},
    {target: {id: "dois"}, isIntersecting: true}]));
  expect(marcado()).toEqual(["DOIS"]);
});

test("a marcação acompanha a rolagem, e some quando a seção sai da faixa", () => {
  monta();
  act(() => disparar!([{target: {id: "tres"}, isIntersecting: true}]));
  expect(marcado()).toEqual(["TRES"]);
  act(() => disparar!([{target: {id: "tres"}, isIntersecting: false}]));
  expect(marcado(), "nada cruzando volta ao primeiro").toEqual(["UM"]);
});

// A faixa é estreita e no ALTO da janela. Com a faixa inteira, a seção "atual" seria a maior
// visível, e o item piscaria entre duas ao rolar — foi o que o `aurea.js` já tinha resolvido.
test("a faixa observada é a mesma do runtime vanilla", () => {
  monta();
  expect(opcoes?.rootMargin).toBe("0px 0px -75% 0px");
});

// ── quem controla, controla ────────────────────────────────────────────────

test("com `current`, a prop vence e o observador nem entra", () => {
  monta({current: "tres"});
  expect(marcado()).toEqual(["TRES"]);
  expect(disparar, "controlado não deve observar").toBeNull();
});

// ── degradação, e o acordo com o vanilla ───────────────────────────────────

test("sem IntersectionObserver, continua uma lista de links que funciona", () => {
  delete (globalThis as {IntersectionObserver?: unknown}).IntersectionObserver;
  expect(() => monta()).not.toThrow();
  expect(marcado()).toEqual([]);
  expect(screen.getAllByRole("link")).toHaveLength(3);
});

// A marca que faz o `tocSpy` do `aurea.js` se afastar. Ela sai do EFEITO, e o teste seguinte é o
// que prova por quê.
test("com React vivo, o índice se marca para o runtime vanilla não competir", () => {
  const c = monta();
  expect(c.querySelector("nav")!.getAttribute("data-toc-spy")).toBe("react");
});

// ESTE é o teste que impede a regressão cara: o catálogo é gerado ESTÁTICO a partir deste mesmo
// componente. Se a marca saísse do render, ela entraria nas 202 páginas — onde não há React vivo
// para observar — e o `tocSpy`, que é quem de fato marca lá, se afastaria de um substituto que
// não existe. O índice pararia de funcionar no catálogo inteiro.
test("na renderização estática a marca NÃO sai: lá quem observa é o vanilla", () => {
  const html = renderToStaticMarkup(
    <AureaProvider><TableOfContents items={ITENS} /></AureaProvider>);
  expect(html).not.toContain("data-toc-spy");
  expect(html, "e o índice em si continua saindo").toContain('href="#um"');
});

// ── o `ref` do consumidor não pode ser engolido ────────────────────────────
// Em React 19 `ref` é prop comum: o componente precisa do dele para marcar o `<nav>`, e espalhar
// `...props` depois sobrescreveria o nosso — ou, na ordem inversa, o de quem consome.
test("o ref de quem consome continua chegando", () => {
  const meu = {current: null as HTMLElement | null};
  render(<AureaProvider><TableOfContents items={ITENS} ref={meu} /></AureaProvider>);
  expect(meu.current, "o ref do consumidor foi engolido pelo nosso").not.toBeNull();
  expect(meu.current!.tagName).toBe("NAV");
});

test("desmontar desliga o observador", () => {
  const {unmount} = render(<AureaProvider><TableOfContents items={ITENS} /></AureaProvider>);
  unmount();
  expect(desconectado).toBe(true);
});
