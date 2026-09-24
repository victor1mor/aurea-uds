"use client";
// RESOLUÇÃO RESPONSIVA EM RUNTIME — a infraestrutura do `G-AXIS-06`.
//
// POR QUE ELA EXISTE. O eixo responsivo nasceu CSS-first, e para `size` isso está certo: mudar um
// degrau de escala não muda o que o componente FAZ. Para `orientation` em componente que navega
// por seta, muda: o `aria-orientation` decide que par de setas move o foco, e CSS não escreve
// atributo. Medido no banco de prova — no `Tabs` horizontal, ArrowDown/ArrowUp ficam PARADOS.
// Desenhar em coluna por CSS e continuar anunciando `horizontal` deixaria a interface visualmente
// vertical e semanticamente horizontal. A decisão do Victor (22/08/2026, ADR-0047) é que
// CSS-first vale para apresentação, e resolução em runtime é permitida — e necessária — quando o
// que está em jogo é semântica, teclado ou comportamento do motor.
//
// A REGRA QUE ESTE ARQUIVO OBEDECE: o valor responsivo RESOLVIDO é a única fonte de verdade. Ele
// vai para o motor; o motor publica `data-orientation` e `aria-orientation` e ajusta o teclado; a
// pele reage ao atributo publicado. Em nenhum momento o CSS decide a orientação por conta própria
// e o JavaScript corre atrás para consertar o atributo — isso seria duas fontes de verdade e uma
// janela em que visual e comportamento divergem.
//
// O MECANISMO MUDA COM A NATUREZA DO VALOR, e é de propósito:
//
//     valor simples   →  nada. Nenhum listener, nenhum observer, nenhum estado.
//     viewport        →  matchMedia          (é o que a janela expõe, e é barato)
//     container       →  ResizeObserver      (não há outra forma de medir um elemento)
//
// A API pública não muda: continua `Responsive<T>` com os mesmos três formatos.
import {createContext, useContext, useLayoutEffect, useMemo, useRef, useState,
  useSyncExternalStore, type ReactNode, type RefObject} from "react";
import {ESCALA, ESCALA_CONTAINER, PONTOS_DESC, PONTOS_CONTAINER_DESC,
  type Breakpoint, type ContainerBreakpoint} from "./escala.js";
import {cx, valorBase, type Responsive} from "./pure.js";

// ── o contêiner Aurea, identificado sem heurística ─────────────────────────────────────────────
//
// O Victor foi explícito: *"não quero heurística — vamos observar o parentElement e provavelmente
// é ele"*. O elemento que o observer mede tem de ser EXATAMENTE o que a API responsiva considera.
//
// Quem define o contêiner no CSS é `.container-scope { container:aurea / inline-size }`, e
// `@container aurea` casa com o ancestral mais próximo que tenha esse nome. Então a regra do JS é
// a MESMA REGRA, não uma parecida: `closest(".container-scope")`. Não é palpite sobre qual
// elemento seja — é o mesmo seletor que o navegador usa para responder a `@container`.
//
// O contexto existe por cima disso, para o caso explícito: quem monta um `<ContainerScope>` passa
// a referência adiante e nem precisa da busca. Os dois caminhos apontam para o mesmo elemento, e
// há teste cobrando isso.
const ContainerAurea = createContext<RefObject<HTMLElement | null> | null>(null);

/** O contêiner Aurea como PRIMITIVE. Declara o contêiner para o CSS (`container-scope`) e publica
 *  o elemento para quem precisar medi-lo — os dois pelo mesmo elemento, por construção. */
export function ContainerScope({children, className, ...props}:
  {children?: ReactNode; className?: string} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  return <ContainerAurea.Provider value={ref}>
    <div ref={ref} className={cx("container-scope", className)} {...props}>{children}</div>
  </ContainerAurea.Provider>;
}

// ── matchMedia compartilhado ───────────────────────────────────────────────────────────────────
// Um `MediaQueryList` por PONTO, não por componente. Sete pontos no total, para a aplicação
// inteira, e o navegador já avalia essas media queries de qualquer jeito por causa do CSS.
//
// AUSÊNCIA das APIs não pode quebrar: `jsdom` não implementa `matchMedia` nem `ResizeObserver`, e
// consumidor que testa em jsdom é caso comum, não exótico. Sem essas APIs o valor fica no BASE —
// que é o mesmo comportamento do servidor, e portanto o degradar correto: a interface aparece
// coerente, só não adapta. Quebrar seria transformar uma limitação de ambiente em erro de runtime.
const temMatchMedia = () => typeof window !== "undefined" && typeof window.matchMedia === "function";
const mqls = new Map<string, MediaQueryList>();
const mql = (px: number) => {
  const q = `(min-width:${px}px)`;
  let m = mqls.get(q);
  if (!m) { m = window.matchMedia(q); mqls.set(q, m); }
  return m;
};

// UM ouvinte real por ponto para a APLICAÇÃO INTEIRA, com um conjunto de interessados por cima.
// `useSyncExternalStore` chama `subscribe` por componente, então a versão ingênua registrava sete
// ouvintes por componente responsivo — linear no número de componentes, e medido: 7 para um,
// 70 para dez. Aqui é 7 para sempre, e o teste de escala cobra isso.
const interessadosVp = new Set<() => void>();
let ouvindoVp = false;
const avisarTodos = () => { for (const f of interessadosVp) f(); };

function assinarViewport(avisar: () => void) {
  if (!temMatchMedia()) return () => {};
  interessadosVp.add(avisar);
  if (!ouvindoVp) {
    for (const px of Object.values(ESCALA)) mql(px).addEventListener("change", avisarTodos);
    ouvindoVp = true;
  }
  return () => { interessadosVp.delete(avisar); };
}

/** O ponto mais alto que a janela alcança, ou `null` abaixo do primeiro. `min-width` quer dizer
 *  que o ÚLTIMO ponto atingido vence, então a varredura é do maior para o menor. */
function pontoDaViewport(): Breakpoint | null {
  if (!temMatchMedia()) return null;
  for (const p of PONTOS_DESC) if (mql(ESCALA[p]).matches) return p;
  return null;
}

// ── ResizeObserver compartilhado ───────────────────────────────────────────────────────────────
// UM observer para o documento inteiro, com um registro de callbacks por elemento — e não um
// observer por componente. Não é infraestrutura especulativa: é a forma mais simples que não
// multiplica objetos, e o custo real está medido em `audit/activity-2/20-G-AXIS-06-CUSTO.md`.
const inscritos = new Map<Element, Set<(largura: number) => void>>();
let observer: ResizeObserver | null = null;

function observarElemento(el: Element, avisar: (largura: number) => void) {
  if (typeof ResizeObserver === "undefined") return () => {};
  if (!observer) {
    observer = new ResizeObserver((entradas) => {
      for (const e of entradas) {
        // `borderBoxSize` é o que `@container ... (min-width)` consulta — a caixa de conteúdo
        // daria outro número em qualquer elemento com padding, e as duas respostas divergiriam
        // justamente onde o Victor exigiu que fossem a mesma.
        const largura = e.borderBoxSize?.[0]?.inlineSize ?? e.contentRect.width;
        for (const f of inscritos.get(e.target) ?? []) f(largura);
      }
    });
  }
  let jogo = inscritos.get(el);
  if (!jogo) { jogo = new Set(); inscritos.set(el, jogo); observer.observe(el); }
  jogo.add(avisar);
  return () => {
    jogo!.delete(avisar);
    if (jogo!.size === 0) { inscritos.delete(el); observer!.unobserve(el); }
  };
}

function pontoDaLargura(largura: number): ContainerBreakpoint | null {
  for (const p of PONTOS_CONTAINER_DESC) if (largura >= ESCALA_CONTAINER[p]) return p;
  return null;
}

// ── a resolução ────────────────────────────────────────────────────────────────────────────────
/** O valor de um mapa de pontos, dado o ponto alcançado. Percorre do alcançado para baixo e
 *  devolve o primeiro que o mapa declara — um mapa esparso (`{md:"x"}`) continua valendo em `lg`,
 *  que é a semântica de `min-width` e a mesma da camada CSS. */
function doMapa<T extends string, P extends string>(
  mapa: Partial<Record<P, T>>, alcancado: P | null, ordemDesc: ReadonlyArray<P>, base: T): T {
  if (!alcancado) return base;
  let vendo = false;
  for (const p of ordemDesc) {
    if (p === alcancado) vendo = true;
    if (vendo && mapa[p] !== undefined) return mapa[p] as T;
  }
  return base;
}

const semAssinatura = () => () => {};

/** RESOLVE um `Responsive<T>` no valor único que vale agora.
 *
 *  Genérico de propósito: o `G-AXIS-06` chegou por `orientation`, mas nada aqui sabe o que é
 *  orientação. Qualquer eixo COMPORTAMENTAL futuro usa este mesmo resolvedor — foi o que o Victor
 *  pediu ao recusar um `useResponsiveOrientation`.
 *
 *  SSR/RSC: o servidor devolve sempre o valor BASE, deterministicamente. A hidratação casa com
 *  ele — `useSyncExternalStore` usa o snapshot de servidor durante a hidratação e só então
 *  re-renderiza com o do cliente —, e o contêiner só é medido depois da montagem, quando existe
 *  elemento para medir. Valor simples não assina nada: nem `matchMedia`, nem observer, nem
 *  estado que dependa de hidratação. */
export function useValorResponsivo<T extends string>(valor: Responsive<T> | undefined, padrao: T,
  ancora?: RefObject<HTMLElement | null>): T {
  const base = (valorBase(valor) ?? padrao) as T;
  const porViewport = typeof valor === "object" && valor !== null && valor.viewport ? valor.viewport : null;
  const porContainer = typeof valor === "object" && valor !== null && valor.container ? valor.container : null;

  // VIEWPORT — `useSyncExternalStore` porque a fonte é externa e síncrona, e porque ele é o único
  // jeito de a hidratação usar o valor de servidor sem aviso e ainda assim corrigir no mesmo
  // commit seguinte, em vez de esperar um efeito.
  const pontoVp = useSyncExternalStore(
    porViewport ? assinarViewport : semAssinatura,
    () => (porViewport ? pontoDaViewport() : null),
    () => null);

  // CONTAINER — o elemento só existe depois da montagem, então aqui é estado + efeito de layout.
  // O primeiro render do cliente devolve o base, igual ao do servidor; a medição entra em
  // seguida. Foi por isso que não usei `useSyncExternalStore` também aqui: não há snapshot
  // síncrono antes de haver elemento.
  const doContexto = useContext(ContainerAurea);
  const [largura, setLargura] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!porContainer) return;
    // A ÂNCORA é o elemento raiz do próprio componente, e ela é obrigatória para o caminho de
    // busca: sem um nó no documento não há de onde subir. O contexto vem primeiro quando existe,
    // porque aí o contêiner é explícito e não precisa ser procurado.
    const el = doContexto?.current ?? ancora?.current?.closest(".container-scope") ?? null;
    if (!el) return;
    setLargura(el.getBoundingClientRect().width);
    return observarElemento(el, setLargura);
  }, [porContainer, doContexto, ancora]);

  return useMemo(() => {
    if (porViewport) return doMapa(porViewport, pontoVp, PONTOS_DESC, base);
    if (porContainer) return doMapa(porContainer, largura === null ? null : pontoDaLargura(largura),
      PONTOS_CONTAINER_DESC, base);
    return base;
  }, [porViewport, porContainer, pontoVp, largura, base]);
}

/* A ÂNCORA não virou hook. Era açúcar de uma linha (`useRef`), e todo `export` deste pacote é
   superfície pública — o check 11 cobra ficha, preview e starter de cada uma. Um `useRef` no
   próprio componente diz a mesma coisa sem inventar API.

   O que ela precisa ser: uma ref presa ao ELEMENTO RAIZ do componente. Sem um nó no documento o
   caminho de busca não tem de onde subir, e o valor fica no base para sempre, em silêncio — foi
   exatamente o defeito da primeira versão deste arquivo. */
