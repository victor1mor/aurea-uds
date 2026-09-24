// Aurea nativo — o provider de tema × densidade, e os dois hooks que ele alimenta.
//
// ADR-0037: o motor é o `StyleSheet` puro e **esta camada é nossa**. Não há Unistyles para
// registrar tema, então o lugar onde os dois eixos moram é um contexto do React — e a ADR foi
// honesta sobre a única aposta que isso carrega: *"se o contexto do React, sem as otimizações do
// Unistyles, re-renderiza a ponto de doer na troca de tema em tela real"*. Ainda não foi medido
// em aparelho.
//
// UM CONTEXTO, E NÃO DOIS — e vale escrever por que, porque a primeira versão tinha dois.
// A ideia era que quem só troca o tema assinasse um contexto "estável" e não re-renderizasse
// junto com a tela. **Não funciona, e a razão é óbvia depois de vista:** o valor de controle
// contém `theme` e `density`, então ele muda exatamente quando o de tokens muda. Dois contextos
// que mudam juntos não poupam render nenhum — poupam só a impressão de estarem poupando.
//
// O que de fato reduz custo é o `useMemo`: entre renders que NÃO trocam eixo, os dois objetos são
// os mesmos por identidade, e a subárvore não é notificada. É o que está feito.
//
// Se um dia doer em aparelho, a saída é a que a ADR-0037 já prevê — contexto fatiado de verdade,
// com as AÇÕES separadas do ESTADO. Aí a separação compra algo, porque as ações não mudam. Não
// está feito hoje porque seria mais superfície pública para um ganho não medido.
//
// PARIDADE COM A WEB, de propósito: `useAureaTheme()` devolve o mesmo `{theme, density, setTheme,
// setDensity, toggleTheme}` do hook homônimo de `@aurea-uds/react`. Uma diferença real: lá o
// valor pode ser `null` (no servidor o tema é desconhecido e fingir um produz erro de
// hidratação); aqui não há SSR, então nunca é nulo.
//
// E `useAureaTokens()` NÃO tem par na web porque lá ele não faria sentido: o CSS resolve o token
// no uso. Não é hook duplicado — é o hook que só o alvo sem cascata precisa ter.
import * as React from "react";
import {useColorScheme} from "react-native";
import {IconRegistryProvider, type AureaIconRegistry} from "./icon.js";
import {defaultStrings, type AureaStrings} from "./strings.js";
import {
  resolverTokens,
  type AureaDensity, type AureaFontFamilies, type AureaThemeName, type AureaTokens,
} from "./tokens.js";

export type AureaThemeControl = {
  theme: AureaThemeName;
  density: AureaDensity;
  setTheme: (t: AureaThemeName) => void;
  setDensity: (d: AureaDensity) => void;
  toggleTheme: () => void;
};

type Valor = {controle: AureaThemeControl; tokens: AureaTokens; strings: AureaStrings};

// `comfortable` não é gosto: MEDIDO em 02/09/2026, os 8 tokens de densidade do `comfortable` são
// idênticos aos do `base` (8/8), e os das outras duas não batem em nenhum. É a densidade que o
// CSS já assume quando ninguém declara `data-density`.
const DENSIDADE_PADRAO: AureaDensity = "comfortable";
// `dark` é o que o catálogo inteiro declara no `<html>`, e o que a identidade da Aurea assume.
const TEMA_PADRAO: AureaThemeName = "dark";

const Contexto = React.createContext<Valor | null>(null);

export type AureaProviderProps = {
  children: React.ReactNode;
  /** Controlado: quando presente, manda, e `setTheme` só avisa. */
  theme?: AureaThemeName;
  /** Controlado: quando presente, manda, e `setDensity` só avisa. */
  density?: AureaDensity;
  /**
   * Tema inicial do modo não controlado. Ausente, segue o **aparelho** (`useColorScheme`) até
   * alguém chamar `setTheme` — a partir daí a escolha da pessoa manda e o sistema não a desfaz.
   */
  defaultTheme?: AureaThemeName;
  /**
   * Densidade inicial do modo não controlado. Um app de consumidor final não expõe densidade ao
   * usuário (NATIVE.md §5.4): ali isto é uma escolha do app, feita uma vez.
   */
  defaultDensity?: AureaDensity;
  /**
   * O mapa `papel -> peso -> família` que faz o texto sair no IBM Plex. Sem ele, o tema devolve a
   * família PEDIDA ("IBM Plex Sans"), que no aparelho vira fonte de sistema para todo peso que
   * não seja Regular/Italic/Bold — **medido na tabela `name` dos .ttf**: Medium e SemiBold são
   * famílias próprias, não pesos da mesma família (ADR-0039).
   *
   *     import {AUREA_FONTS, FONT_FAMILIES} from "@aurea-uds/fonts/native";
   *     const [pronto] = useFonts(AUREA_FONTS);
   *     <AureaProvider fontFamilies={FONT_FAMILIES}>
   *
   * É injetável, e não importado daqui, pela mesma razão que a ADR-0038 deu ao renderizador de
   * ícone: quem já tem a própria pilha de fonte não é obrigado a carregar 1,91 MB da nossa.
   */
  fontFamilies?: AureaFontFamilies;
  /**
   * O registro de ícones que `<Icon name>` e os botões consultam. Montado pelo app com o que ele
   * usa — **nunca** o mapa dos 2571, que anularia a poda (ADR-0038, cláusula 4).
   *
   *     import Add from "@aurea-uds/native/icons/add";
   *     const ICONES = criarRegistroDeIcones({add: Add});
   *     <AureaProvider icons={ICONES}>
   */
  icons?: AureaIconRegistry;
  /**
   * As frases que os componentes dizem sozinhos — o estado universal do `Alert`, o vazio do
   * `DataState`, o rótulo do `Spinner` para o leitor de tela. Padrão em **inglês**, como na web.
   *
   *     import {ptBR} from "@aurea-uds/native";
   *     <AureaProvider strings={ptBR}>
   *
   * A tabela é pequena de propósito, e o `strings.ts` escreve por quê: ela tem o tamanho do que
   * o alvo nativo desenha, não das 200 chaves de 124 componentes da web.
   */
  strings?: AureaStrings;
  /** Avisado quando o modo CONTROLADO recebe um pedido de troca — é o app que decide. */
  onThemeChange?: (t: AureaThemeName) => void;
  onDensityChange?: (d: AureaDensity) => void;
};

export function AureaProvider({
  children, theme, density, defaultTheme, defaultDensity,
  fontFamilies, icons, strings, onThemeChange, onDensityChange,
}: AureaProviderProps) {
  const doAparelho = useColorScheme();
  const [temaInterno, setTemaInterno] = React.useState<AureaThemeName | null>(defaultTheme ?? null);
  const [densidadeInterna, setDensidadeInterna] = React.useState<AureaDensity>(
    defaultDensity ?? DENSIDADE_PADRAO);

  // Enquanto ninguém escolheu (`temaInterno` nulo) o aparelho manda; depois, a escolha manda.
  // `useColorScheme` devolve `null` quando o sistema não diz — daí o padrão da casa.
  const temaEfetivo = theme ?? temaInterno ?? doAparelho ?? TEMA_PADRAO;
  const densidadeEfetiva = density ?? densidadeInterna;

  const controlado = theme !== undefined;
  const densidadeControlada = density !== undefined;

  const setTheme = React.useCallback((t: AureaThemeName) => {
    if (!controlado) setTemaInterno(t);
    onThemeChange?.(t);
  }, [controlado, onThemeChange]);

  const setDensity = React.useCallback((d: AureaDensity) => {
    if (!densidadeControlada) setDensidadeInterna(d);
    onDensityChange?.(d);
  }, [densidadeControlada, onDensityChange]);

  const valor = React.useMemo<Valor>(() => ({
    controle: {
      theme: temaEfetivo,
      density: densidadeEfetiva,
      setTheme,
      setDensity,
      // Alternar é sobre o que está NA TELA — a mesma regra que o hook da web escreveu.
      toggleTheme: () => setTheme(temaEfetivo === "dark" ? "light" : "dark"),
    },
    tokens: resolverTokens(temaEfetivo, densidadeEfetiva, fontFamilies),
    // As frases NÃO dependem do par (tema, densidade), mas moram no mesmo `useMemo` de propósito:
    // um contexto a mais só se paga quando ele muda em outra hora, e este muda junto — é a mesma
    // conta que o cabeçalho deste arquivo já fez para os dois contextos que viraram um.
    strings: strings ?? defaultStrings,
  }), [temaEfetivo, densidadeEfetiva, setTheme, setDensity, fontFamilies, strings]);

  // O registro de ícones fica num contexto PRÓPRIO: ele não muda quando o tema muda, e juntá-lo
  // ao valor do tema faria toda árvore que só desenha ícone re-renderizar na troca de tema.
  const conteudo = icons
    ? <IconRegistryProvider registry={icons}>{children}</IconRegistryProvider>
    : children;
  return <Contexto.Provider value={valor}>{conteudo}</Contexto.Provider>;
}

// Fora do provider os dois hooks LEVANTAM, em vez de devolverem um padrão. É decisão, e o
// motivo é o defeito que o padrão silencioso produz: um app inteiro desenhado no tema errado,
// sem nada acusando. Na web o equivalente não existe porque lá o CSS pinta de qualquer jeito;
// aqui, sem provider, não há de onde tirar cor nenhuma.
function usar(hook: string): Valor {
  const v = React.useContext(Contexto);
  if (v === null) {
    throw new Error(
      `${hook}: nenhum <AureaProvider> acima deste componente. No React Native não há cascata de `
      + `estilo, então sem provider não existe tema para ler — e um padrão silencioso aqui `
      + `desenharia o app inteiro no tema errado sem nada acusar.`);
  }
  return v;
}

/** Os dois eixos e como trocá-los. Mesma forma do hook homônimo de `@aurea-uds/react`. */
export function useAureaTheme(): AureaThemeControl {
  return usar("useAureaTheme").controle;
}

/** Os tokens já resolvidos para o par (tema, densidade) atual. Não tem par na web: lá o CSS resolve. */
export function useAureaTokens(): AureaTokens {
  return usar("useAureaTokens").tokens;
}

/**
 * As frases visíveis. Mesmo nome do hook da web (`useAureaStrings`), tabela bem menor — ver
 * `strings.ts`.
 */
export function useAureaStrings(): AureaStrings {
  return usar("useAureaStrings").strings;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Sobre a marca — a cor de texto FORÇADA dentro de uma superfície amarela
// ─────────────────────────────────────────────────────────────────────────────────────────────
//
// 🔴 **Isto existe porque o contraste não deixou escolha**, e os números estão no `layout.tsx`:
// sobre o `primary`, o texto comum mede **1,83 no tema escuro** e o esmaecido **1,35**. Os dois
// são ilegíveis. O único par que serve nos DOIS temas é `primary-foreground`, com 4,54.
//
// ⚠ **E no React Native não há cascata de cor** — `color` num `View` não desce para o `Text` de
// dentro, como desceria no CSS. Então a cor tem de viajar por CONTEXTO, que é exatamente a
// decisão que o `Field` do Lote 4 tomou para empurrar nome, dica e estado de inválido.
//
// ⚠ **Ele mora AQUI e não no `layout.tsx` por uma razão de estrutura:** o `layout.tsx` importa o
// `Text`, então se ele também exportasse o contexto o `text.tsx` teria de importar de volta — um
// ciclo. Este módulo é o que os dois já importam.
//
// ⚠ **Não sai pela porta da frente do pacote.** É acordo interno entre o `Card` e quem pinta.
//
// 🔴 **ELE NASCEU PELA METADE, e o consumidor achou em UM DIA — 17/09/2026.** A primeira versão
// carregava só a cor do TEXTO, e por isso só o `text.tsx` a lia. Medido no app, dentro de um
// `Card variant="brand"`:
//
//     contorno do campo (`borderStrong`) ...... 2,43 no claro · 2,24 no escuro   🔴 os DOIS
//     fundo do campo (`fieldBg`) .............. 1,61 no claro                    🔴
//     glifo de botão sem fundo (`foreground`) . 1,83 no escuro                   🔴
//
// A norma 1.4.11 pede **3:1** para o contorno que identifica um campo. Nenhum chega.
//
// 🔴 **E o pior era o `action`, que o próprio TIPO exige:** medidas as quatro aparências de botão
// sobre o amarelo — cheio neutro 1,61 · cheio da marca 1,00 · contornado 1,38 · só-texto 1,83 no
// escuro — **nenhuma aparece**. O cartão obrigava a ter um botão e não dava ao botão como existir.
//
// ✅ **A saída não foi paleta nova: foi medir que não HÁ paleta possível.** Procurada uma
// superfície neutra para encaixar controle dentro do amarelo, as três candidatas reprovam no tema
// claro — `card` 1,91 · `background` 1,73 · `secondary` 1,61. **Uma única cor do sistema inteiro
// passa de 3:1 contra o amarelo nos dois temas: `primary-foreground`, com 4,54.**
//
// Então a regra que o `Text` já seguia vale para o resto: **sobre o amarelo existe UMA tinta**, e
// ela serve para letra, para LINHA e para GLIFO. O contexto passou a carregar o par (tinta,
// fundo) porque quem se pinta INTEIRO — um botão cheio — precisa saber com que cor escrever por
// cima da tinta, e essa cor é o próprio amarelo do cartão.
export interface SobreAMarcaValor {
  /** A única cor que se pode desenhar sobre a marca: letra, contorno e glifo. 4,54 nos dois temas. */
  tinta: string;
  /** A cor do cartão por baixo. Serve de letra para quem se pinta com a tinta INTEIRA. */
  fundo: string;
}

const SobreAMarcaCtx = React.createContext<SobreAMarcaValor | null>(null);

/** O provedor. Quem usa é o `Card variant="brand"`. */
export const SobreAMarca = SobreAMarcaCtx;

/**
 * O par de cores obrigatório quando se está sobre a marca, ou `null` quando não se está.
 *
 * ⚠ **Ele vence TODOS os tons, inclusive os explícitos.** Um `tone="danger"` sobre o amarelo
 * mediria menos que os 4,5 da norma, então respeitá-lo entregaria texto ilegível em nome da
 * obediência. **Sobre o amarelo existe UMA tinta** — a hierarquia sai de peso e tamanho.
 *
 * ⚠ **E o alcance dele é DECLARADO, não completo.** Leem o contexto: `Text`, a família de campo,
 * o `Button` e o `IconButton`. **Componente fora dessa lista continua quebrado dentro do cartão
 * amarelo**, e gate estático nenhum vê isso — o que o consumidor encaixa não está no nosso
 * código, exatamente o ponto cego que o `check 43` já declara.
 */
export function useSobreAMarca(): SobreAMarcaValor | null {
  return React.useContext(SobreAMarcaCtx);
}

/**
 * Corta a marca para dentro.
 *
 * 🔴 **Existe por uma armadilha do React Native que é invisível na tela e óbvia no código:** o
 * `Modal` desenha numa camada POR CIMA de tudo, mas em React ele continua sendo FILHO de quem o
 * escreveu. Um `Select` dentro de um `Card variant="brand"` abre a folha dele **fora** do cartão
 * amarelo — e a folha herdaria a tinta do amarelo mesmo assim, pintando texto marrom sobre fundo
 * normal.
 *
 * ⚠ **Camada visual e árvore de contexto são coisas diferentes**, e é só o segundo que manda na
 * cor. Toda superfície que sai do fluxo — as duas folhas de escolha e os quatro sobrepostos —
 * passa por aqui.
 */
export function ForaDaMarca({children}: {children?: React.ReactNode}) {
  return <SobreAMarcaCtx.Provider value={null}>{children}</SobreAMarcaCtx.Provider>;
}

/**
 * A pele que um CAMPO tem de vestir quando está dentro de um `Card variant="brand"`, ou `null`
 * quando não está.
 *
 * O campo perde o fundo e passa a ser um contorno da tinta: **4,54 contra o amarelo nos dois
 * temas**, contra os 2,43/2,24 do `borderStrong` e os 1,61 do `fieldBg` no tema claro. A norma
 * 1.4.11 pede 3:1 para o contorno que identifica um campo, e só a tinta chega lá.
 *
 * ⚠ **O fundo some porque NÃO HÁ fundo possível** — medidas as três superfícies neutras do
 * sistema contra o amarelo no tema claro: `card` 1,91 · `background` 1,73 · `secondary` 1,61.
 * Nenhuma separa. Um contorno forte separa.
 *
 * 🔴 **E a tinta vence o estado de INVÁLIDO, que é o contrário do que a intuição manda.** Medido:
 * a borda de inválido (`danger-400`, `#9f2330`) mede **1,86** contra o amarelo — ela é MENOS
 * visível que a tinta. Pintar de vermelho ali deixaria o campo errado mais difícil de achar que o
 * campo certo. Dentro deste cartão o erro é dito pela MENSAGEM do `Field` e pelo estado que o
 * leitor de tela anuncia, não pela cor — que é o que a norma 1.4.1 já exige de qualquer forma.
 *
 * ⚠ **O texto digitado e o marcador de dica ficam da MESMA cor**, porque só existe uma tinta. É
 * perda real de hierarquia, declarada e não escondida: sobre o amarelo não há segunda cor.
 */
export function usePeleSobreAMarca(): {borderColor: string; backgroundColor: string; color: string} | null {
  const marca = useSobreAMarca();
  return marca == null
    ? null
    : {borderColor: marca.tinta, backgroundColor: "transparent", color: marca.tinta};
}
