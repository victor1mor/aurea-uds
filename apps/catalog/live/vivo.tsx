// A PARTE VIVA DAS PRÉVIAS — as molduras (18/08/2026) e toda caixa (21/10/2026).
//
// Quem entra é o `main.tsx` (o `assets/live.js`, leve) ou o `motores.tsx` (o `assets/live-motores.js`, com os
// gráficos, o editor, a grade, o mapa e o QR). Os dois passam a lista dos exemplos de partida e chamam `ligar`.
//
// ENXERTO PROGRESSIVO nos dois casos: o gerador continua emitindo a marcação completa, e esta parte acende POR CIMA. As
// travas do repositório leem o HTML — o `catalog-sweep` cobra `h1`, hierarquia e axe em TODA página, e o gate de pixel
// fotografa —, e prévia que só existe com JavaScript quebra para quem chega com a rede ruim. O estático é o piso.
import {Component, createElement as h, Fragment, type ReactNode, useEffect, useLayoutEffect, useState} from "react";
import {createPortal} from "react-dom";
import {hydrateRoot} from "react-dom/client";
import {AureaProvider} from "../../../packages/react/dist/index.js";
import {montarSite} from "./site";

type Exemplo = {render?: () => unknown};
// O de partida pode trazer `examples`, os exemplos DEPOIS do principal (bloco 1, o catálogo fiel — 23/10/2026).
export type Starters = Record<string, Exemplo & {examples?: Exemplo[]}>;

// `import.meta.glob` com padrão NEGATIVO, e não um literal de template solto: o glob aberto casava também os arquivos `_`
// do gerador. `import: "default"` traz só os objetos de conteúdo. O IIFE precisa deles eager no mesmo arquivo porque
// `file://` bloqueia módulos repartidos por CORS (ADR-0001: o site abre direto do disco).
const modulos = import.meta.glob<{examples?: Exemplo[]}>(["../content/*.mjs", "!../content/_*.mjs"],
  {import: "default", eager: true});

// O MESMO caminho do gerador (`componentPage`): com arquivo próprio, o exemplo `i` dele; sem, o de partida no 0 e os
// `examples` dele do 1 em diante.
function exemplo(starters: Starters, nome: string, indice: number): Exemplo | undefined {
  const c = modulos[`../content/${nome}.mjs`];
  if (c) return c.examples?.[indice];
  return indice === 0 ? starters[nome] : starters[nome]?.examples?.[indice - 1];
}

// A moldura é um documento com UM exemplo; a página de componente, as caixas — e, junto, as peças vivas do topo do
// site (a busca, o tema, a setinha), que nas outras páginas vêm do `search.js`.
export function ligar(starters: Starters) {
  if (document.getElementById("root")?.dataset.componente) ligarMoldura(starters);
  else if (document.querySelector("[data-vivo]")) montarSite(h(CaixasVivas, {starters}));
}

// ── A MOLDURA (18/08/2026): o gerador já emite o exemplo com `renderToString` (os marcadores de hidratação), e
// `hydrateRoot` aproveita a marcação em vez de refazê-la.
function ligarMoldura(starters: Starters) {
  const raiz = document.getElementById("root")!;
  const componente = raiz.dataset.componente!;
  const ex = exemplo(starters, componente, Number(raiz.dataset.indice ?? 0));
  if (!ex?.render) {
    console.error(`Aurea: não há conteúdo de catálogo para ${componente}`);
    return;
  }
  try {
    hydrateRoot(raiz, h(AureaProvider, {spriteUrl: ""}, ex.render() as never));
  } catch (erro) {
    // Falha de hidratação NÃO pode apagar a prévia: o HTML estático já está na tela e continua valendo.
    console.error(`Aurea: a prévia de ${componente} não hidratou —`, erro);
  }
}

// ── AS CAIXAS DA PÁGINA (21/10/2026). O Victor: "adicione o javascript ao site da aurea assim todos os componente
// funciona como deveria funcionar". Até aqui só as molduras acendiam; as caixas do meio da página eram HTML morto — o
// CodeEditor vazio, o Combobox com "Interactive — see the code.", o menu que não abria.
//
// Sob o provedor ÚNICO do site (`montarSite`), por portal — e não uma raiz por caixa, nem uma raiz das caixas ao lado
// da do topo. Medido: com uma raiz a mais, a página ganha uma segunda região de avisos com o mesmo nome (o
// `landmark-unique` do axe, em toda página de componente — a mesma lição do Início, 14/10/2026); e o `AureaProvider` de
// fora monta o hospedeiro dos avisos presos a um botão, que é do MÓDULO: com uma raiz por caixa, o "Link copiado" do
// botão de compartilhar sairia uma vez por caixa.
//
// A caixa acende quando chega perto da tela (300 px antes), e não todas no carregamento: a página do Button tem 14.
// O desenho pronto só sai DEPOIS que o vivo está no lugar (o efeito de layout, antes de pintar), então não pisca. Se o
// exemplo cair, a guarda devolve o desenho pronto: a caixa nunca fica vazia por causa da parte viva. `data-ligada`
// diz o resultado ("sim" ou "erro") — é o que o teste lê.
type Ligada = {painel: HTMLElement; estatico: ChildNode[]; elemento: unknown; nome: string};

function preparar(starters: Starters, painel: HTMLElement): Ligada | null {
  const nome = painel.dataset.vivo!;
  const [componente, indice] = nome.split(":");
  const ex = exemplo(starters, componente, Number(indice));
  try {
    if (!ex?.render) throw new Error("o exemplo não está nesta parte viva");
    // O elemento nasce UMA vez: um `render` que define um componente dentro dele criaria um tipo novo a cada desenho
    // da lista — a caixa perderia o estado (o que foi digitado, o que abriu) quando outra caixa acendesse.
    return {painel, estatico: [...painel.childNodes], elemento: ex.render(), nome};
  } catch (erro) {
    console.error(`Aurea: a prévia ${nome} não ligou —`, erro);
    painel.dataset.ligada = "erro";
    return null;
  }
}

// As caixas que JÁ estão perto da tela acendem no primeiro desenho, que o `montarSite` faz síncrono — ainda dentro do
// script, antes de a página terminar de carregar. Medido na CI (21/10/2026): acendendo depois, pelo observador, o WebKit
// mediu o `Card.Header` no instante da troca, num elemento que acabava de sair da página (tudo zero). Com isto, a página
// "pronta" já é a viva, para o teste e para quem lê; só as de mais abaixo acendem ao rolar.
const MARGEM = 300;
const perto = (c: HTMLElement) => {
  const r = c.getBoundingClientRect();
  return r.width > 0 && r.bottom > -MARGEM && r.top < innerHeight + MARGEM;
};
const preparadas = new WeakSet<Element>();

function CaixasVivas({starters}: {starters: Starters}) {
  const [ligadas, setLigadas] = useState<Ligada[]>(() => {
    const caixas = [...document.querySelectorAll<HTMLElement>("[data-vivo]")].filter(perto);
    caixas.forEach((c) => preparadas.add(c));
    return caixas.map((c) => preparar(starters, c)).filter((l): l is Ligada => l !== null);
  });
  useEffect(() => {
    const olho = new IntersectionObserver((vistas) => {
      const novas: Ligada[] = [];
      for (const v of vistas) {
        if (!v.isIntersecting) continue;
        olho.unobserve(v.target);
        if (preparadas.has(v.target)) continue;
        preparadas.add(v.target);
        const l = preparar(starters, v.target as HTMLElement);
        if (l) novas.push(l);
      }
      if (novas.length) setLigadas((xs) => [...xs, ...novas]);
    }, {rootMargin: `${MARGEM}px 0px`});
    for (const c of document.querySelectorAll<HTMLElement>("[data-vivo]")) if (!preparadas.has(c)) olho.observe(c);
    return () => olho.disconnect();
  }, [starters]);
  return h(Fragment, null, ...ligadas.map((l) =>
    createPortal(h(Guarda, {painel: l.painel, estatico: l.estatico, nome: l.nome},
      h(Viva, {painel: l.painel, estatico: l.estatico, elemento: l.elemento})), l.painel, l.nome)));
}

function Viva({painel, estatico, elemento}: {painel: HTMLElement; estatico: ChildNode[]; elemento: unknown}) {
  useLayoutEffect(() => {
    for (const n of estatico) n.remove();
    painel.dataset.ligada = "sim";
  }, [painel, estatico]);
  return elemento as ReactNode;
}

class Guarda extends Component<{painel: HTMLElement; estatico: ChildNode[]; nome: string; children: ReactNode},
  {caiu: boolean}> {
  state = {caiu: false};
  static getDerivedStateFromError() { return {caiu: true}; }
  componentDidCatch(erro: unknown) {
    console.error(`Aurea: a prévia ${this.props.nome} caiu —`, erro);
    for (const n of this.props.estatico) if (!n.isConnected) this.props.painel.append(n);
    this.props.painel.dataset.ligada = "erro";
  }
  render() { return this.state.caiu ? null : this.props.children; }
}
