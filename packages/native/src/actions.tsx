// Aurea nativo — `Button` e `IconButton`, sobre `Pressable`.
//
// ── A API: DOIS EIXOS, e o atalho da web NÃO atravessa ───────────────────────────────────────
// Medida a ficha da web antes de escrever (passo 1 do BUILDING.md). Lá existem TRÊS props que
// pintam a mesma coisa, e a própria ficha diz qual é qual: *"`variant` é atalho para o par
// (appearance, tone). Os treze nomes continuam valendo e pintam exatamente o mesmo; a API de dois
// eixos é appearance + tone"* — a ADR-0044.
//
// O `variant` existe lá porque a Aurea **está publicada** e aqueles treze nomes são contrato com
// quem instalou. **Aqui não há nada publicado**, e nascer com o atalho seria nascer com a dívida:
// dois caminhos para a mesma pintura, e a próxima sessão perguntando qual é o certo. Então o
// nativo tem `appearance` + `tone`, e só.
//
// ── O que ficou de fora, com o motivo (passo 5: escopo menor que a referência) ───────────────
//   `href`      — não há navegação por documento no RN; link é `Linking.openURL`, do app;
//   `type`      — `submit`/`reset` são de `<form>`, que não existe;
//   `kbd`       — atalho de teclado impresso no botão não faz sentido no toque;
//   `loading`   — precisa do `Spinner`, que é Lote 2. Entra lá, não aqui, e é melhor faltar do
//                 que nascer com um giro desenhado à mão que o Lote 2 teria de substituir;
//   `appearance:"nav"` — é a pele do item de navegação, e quem a consome é o `BottomNav`/`NavList`
//                 do Lote 3. Aparência sem consumidor é a ADR-0034 ("ter a variante não é usar").
import * as React from "react";
import {AccessibilityInfo, Platform, Pressable, Share, View, type GestureResponderEvent, type PressableProps} from "react-native";
import {brilhoDoBotao, canto, comOpacidade, criarFolha, fioDoAcabamento, misturaOpaca, preenchimento, REACAO_AO_TOQUE, estadoAcessivel} from "./estilos.js";
import {Icon, type AureaIconRegistry, type AureaIcon, type IconWeight} from "./icon.js";
import {Text} from "./text.js";
import {AvisosContext, useAureaStrings, useAureaTheme, useAureaTokens, useSobreAMarca, type SobreAMarcaValor} from "./theme.js";
import type {AureaStrings} from "./strings.js";
import type {AureaToastManager} from "./toast.js";
import type {AureaTokens} from "./tokens.js";

/** Quanto peso a caixa tem. */
export type AureaButtonAppearance = "solid" | "outline" | "ghost";
/** O que a cor significa. Mesmos nomes da web (ADR-0044). */
export type AureaButtonTone = "neutral" | "brand" | "danger" | "success" | "warning" | "info";
/** As cinco alturas de controle, todas de token de densidade. */
export type AureaButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

// 0.32.0 (ADR-0066, "sim, aprovo a escala de 48 no nativo"): a escala de TOQUE do pacote nativo da
// referência. sm 40 · md 48 · lg 56 de altura, 14 · 16 · 20 dos lados, 6 · 8 · 10 de vão, letra
// 14 · 16 · 18 em peso médio. Até a 0.31.0 eram os números do `.btn-*` da web (32 · 36 · 40 de
// altura, 12 · 15 · 20 dos lados), pequenos para o dedo.
// O `xs` e o `xl` são SÓ DA AUREA (a referência tem três tamanhos): o `xs` fica no `controlHSm`
// (32) com o recheio e a letra do `sm` de antes; o `xl` é um passo além do `lg`, `touchControlHLg
// + space2` (64), com 24 dos lados, 10 de vão e letra 18.
type Medida = {altura: number; recheio: number; vao: number};
const MEDIDA: Record<AureaButtonSize, (s: AureaTokens["size"]) => Medida> = {
  xs: (s) => ({altura: s.controlHSm, recheio: s.space3, vao: s.space1 + s.space05}),
  sm: (s) => ({altura: s.touchControlHSm, recheio: s.space3 + s.space05, vao: s.space1 + s.space05}),
  md: (s) => ({altura: s.touchControlHMd, recheio: s.space4, vao: s.space2}),
  lg: (s) => ({altura: s.touchControlHLg, recheio: s.space5, vao: s.space2 + s.space05}),
  xl: (s) => ({altura: s.touchControlHLg + s.space2, recheio: s.space6, vao: s.space2 + s.space05}),
};
// O degrau do `Text` do nativo, que sobe um em relação à web (ADR-0050): `xs` é 14, `base` é 16 e
// `lg` é 18.
const FONTE: Record<AureaButtonSize, "xs" | "base" | "lg"> = {
  xs: "xs", sm: "xs", md: "base", lg: "lg", xl: "lg",
};
// O ícone acompanha a altura nova: 16 até o `sm` (40), 20 no `md` (48), 24 do `lg` (56) para cima.
// Era 16 até o `md` e 20 no `lg` e no `xl`, quando o `md` tinha 36.
const ICONE: Record<AureaButtonSize, "sm" | "md" | "lg"> = {
  xs: "sm", sm: "sm", md: "md", lg: "lg", xl: "lg",
};

/** Par (fundo, texto, borda) por tom, para cada aparência. Tudo de token, nada cru. */
function pintar(t: AureaTokens, tone: AureaButtonTone) {
  const m: Record<AureaButtonTone, {solido: string; texto: string; sobre: string}> = {
    neutral: {solido: t.color.secondary, texto: t.color.secondaryForeground, sobre: t.color.foreground},
    // ⚠ O TOM DA MARCA TEM DUAS CORES, e confundi-las foi defeito publicado na `0.8.2`.
    //
    // `solido` é o amarelo da marca, que é FUNDO: o texto por cima é escuro e lê bem.
    // `sobre` é o mesmo amarelo virando TEXTO — e aí ele some. Medido sobre o fundo do tema
    // claro: **1,73:1**, contra os 4,5:1 que a WCAG exige para texto normal. No escuro dá 10,34.
    //
    // O token certo existe desde sempre e é o `link`: mesmo matiz (86.047), mais escuro,
    // **5,02:1** no claro — e no escuro ele É o amarelo da marca, então nada muda lá. A
    // identidade não foi tocada: o amarelo de preencher continua invariável, como manda o
    // `CLAUDE.md`. O que mudou é qual dos dois se usa para ESCREVER.
    //
    // ⚠ Achado pelo app na tela de entrar, não por teste nosso — os 1430 passavam por cima.
    brand: {solido: t.color.primary, texto: t.color.primaryForeground, sobre: t.color.link},
    // ⚠ MESMO DEFEITO DO TOM DA MARCA, achado por medir os outros tons em vez de parar no
    // primeiro: `destructive` escrito sobre o tema claro dá **4,30:1** — reprova por pouco, mas
    // reprova. O `danger400` passa nos DOIS temas (6,86 no claro, 7,47 no escuro), e não é
    // invenção: o `Input` já usa esse token para a borda de inválido.
    // O `solido` continua no `destructive`, porque ali ele é FUNDO e o texto por cima é claro.
    danger: {solido: t.color.destructive, texto: t.color.destructiveForeground, sobre: t.color.danger400 ?? t.color.destructive},
    // `sobre` é a LETRA do tom em cima da superfície (contorno, fantasma): o par `-400`. Desde a
    // 0.27.0 (ADR-0061) o `success`/`warning`/`info` é o fundo cheio, fundo demais para letra no escuro.
    success: {solido: t.color.success, texto: t.color.successForeground, sobre: t.color.success400 ?? t.color.success},
    warning: {solido: t.color.warning, texto: t.color.warningForeground, sobre: t.color.warning400 ?? t.color.warning},
    info: {solido: t.color.info, texto: t.color.infoForeground, sobre: t.color.info400 ?? t.color.info},
  };
  return m[tone];
}

/**
 * O mesmo par, corrigido quando a peça está DENTRO de um `Card variant="brand"`.
 *
 * 🔴 **Sem isto o botão não existe sobre o amarelo — medido nas quatro aparências, 17/09/2026:**
 * cheio neutro **1,61** no claro · cheio da marca **1,00** (amarelo no amarelo) · contornado
 * **1,38** no claro · só-texto **1,83** no escuro. O `Card variant="brand"` EXIGE `action` no
 * tipo, então o cartão obrigava a ter um botão e não dava a ele nenhuma forma de aparecer.
 *
 * A saída não é paleta nova: **uma única cor do sistema passa de 3:1 contra o amarelo nos dois
 * temas**, e é a tinta que o cartão já manda para dentro (4,54). Então aqui:
 *
 * - **cheio** — o fundo vira a TINTA e a letra vira o amarelo do cartão. O botão fica escuro
 *   sobre o amarelo, que é o único desenho que se enxerga nos dois temas;
 * - **contornado e sem fundo** — contorno e letra viram a tinta.
 *
 * ~~⚠ **O tom pedido é IGNORADO aqui**~~ — **E7, 25/09/2026: no botão CHEIO com tom, ele vale.**
 * O Victor quis as cores (confirmar em verde, "agora não" em vermelho). Medido antes, nos dois
 * temas: a letra sobre o próprio fundo do botão passa sempre (sucesso 6,3 e 9,39; perigo 4,57 e
 * 6,32), mas o FUNDO do botão contra o amarelo não se distingue (sucesso no escuro **1,00**,
 * perigo 1,51, aviso 1,36; no claro perigo 2,50) — o formato sumiria. Então o botão cheio com tom
 * mantém a cor dele e ganha **contorno na tinta do cartão** (4,54 contra o amarelo): a cor diz o
 * que ele faz, o contorno diz onde ele está.
 *
 * ⚠ **No contornado e no sem fundo o tom continua ignorado**: ali a letra colorida fica direto
 * sobre o amarelo, e nenhum tom passa de 4,5 — obedecer entregaria um botão ilegível. O neutro e
 * o da marca também seguem na tinta (neutro 1,61; marca é amarelo no amarelo, 1,00).
 */
const TONS_COM_COR = new Set<AureaButtonTone>(["success", "danger", "warning", "info"]);
/**
 * SEM LINHA (16/10/2026), a "C" da bancada, escolhida pelo Victor: no tema CLARO, a letra do botão de CONTORNO com tom de
 * estado vai 20% para a cor do texto. O fundo é o tom a 16%, e o azul do claro, que já fica perto do limite contra a
 * página branca, caía a 4,02:1 sobre ele (o mínimo é 4,5). Fora disso, a letra de sempre. O par da web está no fim do
 * `aurea.css` (`[data-theme="light"] .btn-outline.btn-tone-*`).
 */
function corDaLetra(
  t: AureaTokens, tone: AureaButtonTone, appearance: AureaButtonAppearance, marca: SobreAMarcaValor | null, sobre: string,
): string {
  const deEstado = tone === "info" || tone === "success" || tone === "warning" || tone === "danger";
  return appearance === "outline" && !marca && deEstado && t.theme === "light" ? misturaOpaca(sobre, t.color.foreground, 0.8) : sobre;
}

function pintarSobreAMarca(
  base: {solido: string; texto: string; sobre: string},
  marca: SobreAMarcaValor | null,
  tone: AureaButtonTone,
  appearance: AureaButtonAppearance,
): {solido: string; texto: string; sobre: string; contorno?: string} {
  if (marca == null) return base;
  if (appearance === "solid" && TONS_COM_COR.has(tone)) return {...base, contorno: marca.tinta};
  return {solido: marca.tinta, texto: marca.fundo, sobre: marca.tinta};
}

const folha = criarFolha((t: AureaTokens) => ({
  // ⚠ O ALVO DE TOQUE, e é a decisão mais importante deste arquivo.
  //
  // Medido em 03/09/2026: `targetMin` da Aurea é **44 dp**, e a escala de controle é
  // xs=26 · sm=30 · md=36 · lg=42 · xl=50. **Três das cinco alturas são menores que o alvo
  // mínimo** — e a altura vem de token de densidade, que é identidade e não se mexe.
  //
  // A saída óbvia seria `hitSlop`, e ela está ERRADA. Pesquisado em 03/09/2026: o `hitSlop`
  // expande a área do DEDO e **não é levado em conta pelo TalkBack** — o retângulo que o leitor
  // de tela explora continua o visual. Quem usa leitor ficaria com o alvo pequeno, que é
  // exatamente quem mais precisa do alvo grande. A recomendação corrente é `minHeight`/padding
  // explícito, e é o que está aqui.
  //
  // Como isto NÃO mexe no desenho: o `Pressable` tem `minHeight: targetMin` e centraliza; quem
  // pinta fundo, borda e raio é a `caixa` interna, com a altura do token. O botão continua com
  // 36 dp de desenho e passa a ter 44 de alvo — e o leitor de tela enxerga os 44, porque o
  // elemento acessível é o `Pressable`, não um retângulo invisível ao lado dele.
  // 0.32.0: com a escala de toque, o `md` (48) e o `lg` (56) já passam do alvo sozinhos; o `sm`
  // (40) e o `xs` (32) continuam ganhando os 44 por aqui.
  // E2 (25/09/2026): SEM `alignSelf`. O botão obedece o pai, como na referência (a folha do botão dela
  // não fixa alinhamento) e como o `.btn` da web num `.stack`. Era `alignSelf: "flex-start"`, e ele
  // vencia o `alignItems: "center"` do pai: o botão do `EmptyState` ficava à esquerda com o resto
  // no meio. ⚠ A consequência, decidida pelo Victor: numa coluna sem alinhamento o botão ESTICA,
  // como na web. "Do tamanho do texto" se diz no pai — `Stack align="start"`.
  alvo: {minHeight: t.size.targetMin, justifyContent: "center"},
  alvoLargura: {alignSelf: "stretch"},
  caixa: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    ...canto(t.size.radiusControl),           // 999 — pill, identidade INTOCÁVEL
    borderWidth: t.size.borderWidth,
  },
  // `.btn:active` e `.btn:disabled` do core — os números moram no `estilos.ts` desde que o
  // `Card` com `onPress` passou a reagir igual (R-04, 24/09/2026).
  ...REACAO_AO_TOQUE,
}));

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  children?: React.ReactNode;
  appearance?: AureaButtonAppearance;
  tone?: AureaButtonTone;
  size?: AureaButtonSize;
  leadingIcon?: AureaIcon;
  trailingIcon?: AureaIcon;
  /**
   * Um desenho QUALQUER na frente do texto, para quando a marca não pode ser um ícone nosso.
   *
   * ⚠ **Ele existe por causa de MARCA REGISTRADA, não por conveniência.** Os botões de entrar com
   * a conta de outras empresas exigem o desenho oficial de cada uma, e nenhum deles pode
   * viver dentro desta biblioteca: uma delas proíbe redesenhar e manda usar o arquivo do pacote
   * dela; outra proíbe usar o logo sem licença escrita. **Então a marca entra pelo app**, e o
   * que a Aurea dá é a cápsula em volta.
   *
   *     <Button appearance="outline" leading={<RNImage source={logoDoServico} style={{width: 18, height: 18}} />}>
   *       Entrar com a conta do serviço
   *     </Button>
   *
   * ⚠ **A cor do texto NÃO atravessa para cá** — o que entra desenha a própria cor, e é assim
   * que tem de ser: a marca da empresa tem cor fixa, e tingi-la seria justamente o que a regra
   * dela proíbe. Um `leadingIcon` nosso continua herdando a cor do botão.
   */
  leading?: React.ReactNode;
  /** O mesmo, do outro lado. */
  trailing?: React.ReactNode;
  /** Registro de ícones, quando não há um em contexto. Ver `criarRegistroDeIcones`. */
  icons?: AureaIconRegistry;
  fullWidth?: boolean;
  /** Estado de alternância, anunciado ao leitor de tela como `checked`. */
  pressed?: boolean;
  /**
   * GAR-14 (0.28.0): o botão COMPARTILHA — os mesmos nomes da web. No aparelho, abre o compartilhar do
   * sistema (`Share` do React Native); o link vai DENTRO da mensagem no Android, que descarta o `url`.
   * No navegador (`react-native-web`), a regra da web: detectar o recurso; sem ele, copiar e avisar
   * "Link copiado" pelo `ToastHost`, e dizer ao leitor de tela.
   */
  share?: AureaShareData;
  /**
   * O brilho (ADR-0086, 28/10/2026), o mesmo da web: no botão principal (`appearance="solid" tone="brand"`), uma
   * sombra difusa embaixo, na cor dele a 40%. É acabamento que o app escolhe. Nos outros botões, não desenha nada.
   */
  glow?: boolean;
  /**
   * O fio (ADR-0086), o mesmo da web: em volta do botão de fundo suave (`outline`, que no "sem linha" é o tom a 16%), o
   * tom a 30%, por dentro — a sombra por dentro do `aroDoEstilo`, que não muda a medida. Nos outros, não desenha nada.
   */
  ring?: boolean;
}

/** O que o `Button share` compartilha (GAR-14). Os nomes são os da web. */
export interface AureaShareData {url?: string; title?: string; text?: string}

type DadosWeb = {url: string; title?: string; text?: string};
type NavegadorWeb = {
  share?: (d: DadosWeb) => Promise<void>;
  canShare?: (d: DadosWeb) => boolean;
  clipboard?: {writeText?: (t: string) => Promise<void>};
};

// GAR-14 · o compartilhar do nativo. Ver a prop `share`.
async function compartilhar(dados: AureaShareData, avisos: AureaToastManager | null, strings: AureaStrings) {
  if (Platform.OS !== "web") {
    // O iOS manda o `url` como link de verdade e o `message` como texto; o Android só lê o `message`.
    const mensagem = [dados.text, dados.url].filter(Boolean).join(" ");
    try {
      await Share.share(Platform.OS === "ios" && dados.url
        ? {url: dados.url, message: dados.text, title: dados.title}
        : {message: mensagem, title: dados.title});
    } catch { /* a pessoa fechou, ou o sistema recusou: não há o que dizer */ }
    return;
  }
  // O alvo nativo não tem os tipos do navegador: só o pedaço que se usa aqui (como no E16).
  const g = globalThis as unknown as {navigator?: NavegadorWeb; location?: {href?: string}};
  const nav = g.navigator;
  const url = dados.url ?? g.location?.href ?? "";
  const pacote: DadosWeb = {url, ...(dados.title ? {title: dados.title} : null), ...(dados.text ? {text: dados.text} : null)};
  if (typeof nav?.share === "function" && (typeof nav.canShare !== "function" || nav.canShare(pacote))) {
    try { await nav.share(pacote); return; } catch (e) { if ((e as {name?: string} | null)?.name === "AbortError") return; }
  }
  const avisar = (falhou: boolean) => {
    const texto = falhou ? strings.linkCopyFailed : strings.linkCopied;
    avisos?.add(falhou ? {title: texto, description: url, type: "danger", duration: 0} : {title: texto, type: "success", duration: 1500});
    AccessibilityInfo.announceForAccessibility(texto);
  };
  try {
    if (typeof nav?.clipboard?.writeText !== "function") throw new Error("sem área de transferência");
    await nav.clipboard.writeText(url);
    avisar(false);
  } catch { avisar(true); }
}

/** O toque do botão com o `share`: o `onPress` do app primeiro, depois o compartilhar. O `Button` e
 *  o `IconButton` usam o mesmo — com um só, os dois não divergem. */
function useToqueComShare(share: AureaShareData | undefined, onPress: PressableProps["onPress"]) {
  const avisos = React.useContext(AvisosContext);
  const strings = useAureaStrings();
  if (!share) return onPress;
  return (e: GestureResponderEvent) => { onPress?.(e); void compartilhar(share, avisos, strings); };
}

/**
 * Botão. `Pressable` do RN, alvo ≥ `--target-min`, pele de token.
 *
 * ⚠ **`disabled` no RN não tira da ordem de foco como o `:disabled` do HTML** — ele bloqueia o
 * toque e marca `accessibilityState.disabled`, e o leitor de tela ainda alcança e anuncia
 * "desativado". Isso é MELHOR do que o `:disabled` da web para o caso que a ficha do `Button`
 * descreve: lá, um botão desabilitado some da ordem de foco e a explicação pendurada nele não é
 * lida por ninguém. Aqui não há o dilema, então não há o par `aria-disabled` — um só basta.
 */
export function Button(props: ButtonProps) {
  return <CorpoDoBotao {...props} />;
}

/** Os acabamentos (ADR-0086) do `Button` e do `IconButton`: o brilho só no principal, o fio só no de fundo suave. A marca
 *  no navegador (`dataSet`) é a mesma da web (`data-glow`, `data-ring`), e a varredura do site reconhece o fio. */
function acabamentoDoBotao(t: AureaTokens, glow: boolean | undefined, ring: boolean | undefined,
  appearance: AureaButtonAppearance, tone: AureaButtonTone, disabled: boolean | null | undefined, corDoTexto: string) {
  const comBrilho = !!glow && appearance === "solid" && tone === "brand" && !disabled;
  const comFio = !!ring && appearance === "outline";
  const acabamento = comBrilho || comFio
    ? {boxShadow: [...(comBrilho ? [brilhoDoBotao(t)] : []), ...(comFio ? [fioDoAcabamento(t, tone, corDoTexto)] : [])]}
    : null;
  const marcaDoAcabamento: object = glow !== undefined || ring !== undefined
    ? {dataSet: {...(glow !== undefined ? {glow: String(glow)} : null), ...(ring !== undefined ? {ring: String(ring)} : null)}}
    : {};
  return {acabamento, marcaDoAcabamento};
}

/** O corpo do `Button`. `semRecuo` é só do `LinkButton`: sem recuo, sem borda e sem altura. */
function CorpoDoBotao({
  children, appearance = "solid", tone = "neutral", size = "md",
  leadingIcon, trailingIcon, leading, trailing, icons, fullWidth = false, pressed,
  disabled, accessibilityLabel, semRecuo = false, share, glow, ring, onPress, ...rest
}: ButtonProps & {semRecuo?: boolean}) {
  const t = useAureaTokens();
  const aoTocar = useToqueComShare(share, onPress);
  const s = folha(t);
  const marca = useSobreAMarca();
  const cor = pintarSobreAMarca(pintar(t, tone), marca, tone, appearance);
  const corDaBorda = marca?.tinta ?? t.color.border;

  const medida = MEDIDA[size](t.size);
  const caixa = React.useMemo(() => ({
    height: medida.altura,
    paddingHorizontal: medida.recheio,
    gap: medida.vao,
    // Sem linha (16/10/2026): o de CONTORNO, sem a linha, ganha o fundo — o tom a 16%, o neutro a 10%. A letra do tom de
    // estado, no claro, vai 20% para a cor do texto (`corDaLetra`): a "C" da bancada.
    backgroundColor: appearance === "solid" ? cor.solido
      // Dentro do cartão da marca, a mesma tinta escura do campo (a 14%): o branco a 10% clareava o amarelo e sumia.
      : appearance === "outline" ? (marca ? comOpacidade(marca.tinta, 0.14)
        : tone && tone !== "neutral" ? comOpacidade(cor.solido, 0.16) : preenchimento(t, 2))
      : "transparent",
    borderColor: "transparent",
    ...(fullWidth ? {flex: 1} : null),
    // A regra do botão-link da referência: `height: auto; padding: 0`, e a do botão dela já
    // tem `border-width: 0`. A borda transparente de 1 empurraria o texto 1 para dentro.
    ...(semRecuo ? {height: undefined, paddingHorizontal: 0, borderWidth: 0} : null),
  }), [medida.altura, medida.recheio, medida.vao, appearance, cor.solido, cor.contorno, corDaBorda, fullWidth, semRecuo, marca, tone, t]);

  const corDoTexto = appearance === "solid" ? cor.texto : corDaLetra(t, tone, appearance, marca, cor.sobre);
  const {acabamento, marcaDoAcabamento} = acabamentoDoBotao(t, glow, ring, appearance, tone, disabled, corDoTexto);

  return (
    <Pressable
      disabled={disabled}
      onPress={aoTocar}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      {...estadoAcessivel({disabled: !!disabled, pressed})}
      style={({pressed: tocando}) => [
        s.alvo, fullWidth && s.alvoLargura,
        tocando && s.pressionado, disabled && s.inerte,
      ]}
      {...rest}>
      <View style={[s.caixa, caixa, acabamento]} {...marcaDoAcabamento}>
        {leading ?? null}
        {leadingIcon ? <Icon name={leadingIcon} size={ICONE[size]} color={corDoTexto} icons={icons} /> : null}
        {typeof children === "string"
          // E1 (25/09/2026): entrelinha NORMAL (1,5), como o rótulo do botão da referência
          // (a folha do botão dela usa a entrelinha de cada degrau da escala). Era `none` (1,0), e a letra
          // precisa de 1,3 em para caber inteira — a IBM Plex subia 1,025 e descia 0,275; a
          // Atkinson Hyperlegible (ADR-0053) sobe 0,984 e desce 0,316, o mesmo 1,3 (medido na
          // tabela `hhea` dos dois arquivos, 01/10/2026). Desde a ADR-0077 (0.40.1): a Inter pede 1,21 (sobe
          // 0,969, desce 0,241), a Sora 1,26 e a IBM Plex Mono os mesmos 1,3 (medido na `hhea`, 22/10/2026) —
          // todas cabem nesta linha. No Android o RN
          // corta o que passa da linha, e a perna do g, do p e do ç sumia. Cabe em todo tamanho e
          // densidade (conta da 0.32.0): `xs`/`sm` têm linha de 21 e o menor botão mede 28 (`xs`
          // no compacto); o `md` tem linha de 24 e mede 44 ou mais; `lg`/`xl`, 27 e 52 ou mais.
          ? <Text size={FONTE[size]} weight={500} leading="normal" style={{color: corDoTexto}}>{children}</Text>
          : children}
        {trailingIcon ? <Icon name={trailingIcon} size={ICONE[size]} color={corDoTexto} icons={icons} /> : null}
        {trailing ?? null}
      </View>
    </Pressable>
  );
}

// ── LinkButton (E9, 0.12.1) ──────────────────────────────────────────────────────────────────
// O botão-texto que encosta na margem: "Escolher pela marca", "Não encontrei. Cadastrar à mão". É
// o `LinkButton` da referência (o componente e a folha de estilo dele): o `Button` sem
// fundo, com `height: auto; padding: 0`, e a variante travada — quem quer caixa usa o `Button`.
// ⚠ A área de toque não encolhe: o alvo continua com `targetMin` (44) de altura, e só o desenho
// perde o recuo. ⚠ Como todo `Button`, ele obedece o pai (E2): numa coluna que estica, o texto vai
// para o meio; encostado na margem é `Stack align="start"`.

export interface LinkButtonProps extends Omit<ButtonProps, "appearance" | "fullWidth" | "glow" | "ring"> {}

/** Botão-texto sem recuo nem caixa, alinhado com o texto em volta. O `LinkButton` da referência. */
export function LinkButton(props: LinkButtonProps) {
  return <CorpoDoBotao {...props} appearance="ghost" semRecuo />;
}

// Sem `leading` e `trailing` (bloco 1, 24/10/2026): o botão só de ícone não tem onde pôr peça antes ou depois do glifo, e as
// duas props chegavam pelo `ButtonProps`, apareciam na ficha e não desenhavam nada. O desenho próprio do app vai no `name`
// (R-11: toda prop de ícone aceita o `AureaIcon`). O `ThemeToggle` herda daqui.
export interface IconButtonProps extends Omit<ButtonProps, "children" | "leadingIcon" | "trailingIcon" | "leading" | "trailing" | "fullWidth"> {
  name: AureaIcon;
  /** **Obrigatório**: um botão que só tem glifo não tem texto para o leitor de tela anunciar. */
  label: string;
}

/**
 * Botão REDONDO, só glifo.
 *
 * O raio é o da cápsula (`radiusControl`, 999) num quadrado, e um quadrado com raio 999 é um
 * círculo — o mesmo que o `.btn-icon` do core faz. Decisão do Victor, 25/09/2026 (ADR-0052): era
 * `--radius-md`/`--radius-sm`, e a referência faz o botão só de ícone redondo.
 *
 * ⚠ **`label` é obrigatório no tipo**, e é a única prop deste pacote que obriga texto. Um ícone
 * sozinho não diz nada a quem não o vê, e deixar isso opcional é o mesmo que deixá-lo vazio.
 */
export function IconButton(props: IconButtonProps) {
  return <BotaoDeIcone {...props} />;
}

/**
 * Quanto a ÁREA DE TOQUE do `IconButton` passa do círculo desenhado, de cada lado — R-24
 * (08/10/2026). O alvo é o maior entre o desenho e o `targetMin` (44), centrado; o círculo de
 * `md` tinha 36, e sobravam 4 de cada lado. O `Badge` preso usa isto para se prender ao CÍRCULO,
 * e não ao canto da área de toque — medido: preso à área de toque, o selo ficava 4 para fora.
 * 0.32.0: com a escala de toque o `md` tem 48 e a folga é 0; sobra no `sm` (40: 2) e no `xs`.
 */
export function folgaDoToque(t: AureaTokens, size: AureaButtonSize = "md"): number {
  const lado = MEDIDA[size](t.size).altura;
  return Math.max(0, (Math.max(lado, t.size.targetMin) - lado) / 2);
}

/** O corpo do `IconButton`. A cor própria do ícone (`corDoIcone`) é só do `ThemeToggle`: o
 *  `IconButton` público não tem cor solta, e dentro do cartão da marca ela não vale (a tinta vence). */
function BotaoDeIcone({
  name, label, appearance = "ghost", tone = "neutral", size = "md",
  icons, pressed, disabled, corDoIcone, pesoDoIcone, share, glow, ring, onPress, ...comSobras
}: IconButtonProps & {corDoIcone?: string; pesoDoIcone?: IconWeight}) {
  // Quem chama de JavaScript, sem o tipo, ainda pode mandar `leading`/`trailing`: elas não descem ao `Pressable`.
  const {leading: _antes, trailing: _depois, ...rest} = comSobras as typeof comSobras & {leading?: unknown; trailing?: unknown};
  const t = useAureaTokens();
  const aoTocar = useToqueComShare(share, onPress);
  const s = folha(t);
  const marca = useSobreAMarca();
  const cor = pintarSobreAMarca(pintar(t, tone), marca, tone, appearance);
  const corDaBorda = marca?.tinta ?? t.color.border;
  // O círculo tem a altura do botão do mesmo tamanho (o só-ícone da referência: `aspect-ratio: 1`).
  const lado = MEDIDA[size](t.size).altura;
  const corDaLetraDoIcone = corDoIcone && !marca ? corDoIcone : appearance === "solid" ? cor.texto : corDaLetra(t, tone, appearance, marca, cor.sobre);
  const {acabamento, marcaDoAcabamento} = acabamentoDoBotao(t, glow, ring, appearance, tone, disabled, corDaLetraDoIcone);

  const caixa = React.useMemo(() => ({
    height: lado, width: lado, paddingHorizontal: 0,
    ...canto(t.size.radiusControl),
    // Sem linha (16/10/2026): o de contorno ganha o fundo, como o `Button` — a tinta do cartão da marca, o tom, ou o neutro.
    backgroundColor: appearance === "solid" ? cor.solido
      : appearance === "outline" ? (marca ? comOpacidade(marca.tinta, 0.14)
        : tone && tone !== "neutral" ? comOpacidade(cor.solido, 0.16) : preenchimento(t, 2))
      : "transparent",
    borderColor: "transparent",
  }), [t, lado, appearance, cor.solido, cor.contorno, corDaBorda, marca, tone]);

  return (
    <Pressable
      disabled={disabled}
      onPress={aoTocar}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...estadoAcessivel({disabled: !!disabled, pressed})}
      style={({pressed: tocando}) => [
        // Largura FIXA, como o só-ícone da referência: ele nunca estica,
        // nem numa coluna sem alinhamento. O alvo é o maior entre o desenho e o `targetMin`.
        s.alvo, {width: Math.max(lado, t.size.targetMin), alignItems: "center"},
        tocando && s.pressionado, disabled && s.inerte,
      ]}
      {...rest}>
      <View style={[s.caixa, caixa, acabamento]} {...marcaDoAcabamento}>
        <Icon name={name} size={ICONE[size]} icons={icons} weight={pesoDoIcone}
              color={corDaLetraDoIcone} />
      </View>
    </Pressable>
  );
}

// ThemeToggle (25/09/2026, pedido do Victor): o botão de claro e escuro, com cor no ícone — o
// irmão do da web. Peça EXCLUSIVA da Aurea (a referência não tem troca de tema), pensada como
// ela faria: um só-ícone, sem cor solta. Mostra o tema para onde se VAI: no claro a LUA, na tinta
// do texto; no escuro o SOL, no amarelo da marca. ⚠ Os glifos `moon` e `sun` (na forma cheia, `moon-fill` e `sun-fill`) saem do registro do
// app, como os do `Alert`: sem eles o ícone não desenha, e o `Icon` avisa no desenvolvimento.
/** Fechado: sem `appearance` e sem `tone`, porque a cor é a do glifo. */
export interface ThemeToggleProps extends Omit<IconButtonProps, "name" | "label" | "onPress" | "appearance" | "tone" | "share" | "glow" | "ring"> {}
export function ThemeToggle(props: ThemeToggleProps) {
  const {theme, toggleTheme} = useAureaTheme();
  const t = useAureaTokens();
  const s = useAureaStrings();
  const escuro = theme === "dark";
  return (
    <BotaoDeIcone {...props} name={escuro ? "sun" : "moon"}
      label={escuro ? s.themeToLight : s.themeToDark}
      corDoIcone={escuro ? t.color.primary : t.color.foreground} pesoDoIcone="fill"
      onPress={toggleTheme} />
  );
}

// ── CloseButton (HER-12, 0.32.0) ─────────────────────────────────────────────────────────────
// O botão de fechar da referência, irmão do da web. No nativo dela ele é o próprio botão `sm` só
// de ícone com fundo neutro: um círculo de 40 (o `touchControlHSm`, a escala de toque da
// ADR-0066), o X esmaecido e a área de toque estendida em 12 de cada lado (`space3`, o `hitSlop`
// dela). O X é o do traço Bold (decisão do Victor, *"1 bold"*): a chave `x-bold` do registro do app
// (`@aurea-uds/native/icons/x-bold`); sem ela, sai o `x`. ⚠ O X dela tem 18; aqui é o `iconMd`
// (20), porque a escala de ícone não tem 18 — decisão do Victor na bancada (*"mantém 20"*).
// Fechado como o dela: sem cor nem tamanho; `children` troca o X.
export interface CloseButtonProps {
  /** O nome que o leitor de tela anuncia. Padrão: a frase `close` ("Close"/"Fechar"). */
  label?: string;
  onPress?: PressableProps["onPress"];
  disabled?: boolean;
  /** Registro local de ícones, quando não há um em contexto. */
  icons?: AureaIconRegistry;
  /** Troca o X. */
  children?: React.ReactNode;
  testID?: string;
}

/** O botão de fechar: círculo neutro com o X, que já se chama "Close"/"Fechar". */
export function CloseButton({label, onPress, disabled, icons, children, testID}: CloseButtonProps) {
  const t = useAureaTokens();
  const s = useAureaStrings();
  const lado = t.size.touchControlHSm;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ?? s.close}
      {...estadoAcessivel({disabled: !!disabled})}
      hitSlop={t.size.space3}
      testID={testID}
      style={({pressed: tocando}) => [
        {width: lado, height: lado, alignItems: "center", justifyContent: "center",
         ...canto(t.size.radiusFull), backgroundColor: t.color.secondary},
        // Encolhe a 93%, como o da referência (o botão comum da Aurea vai a 97%).
        tocando && {opacity: REACAO_AO_TOQUE.pressionado.opacity, transform: [{scale: 0.93}]},
        disabled && REACAO_AO_TOQUE.inerte,
      ]}>
      {children ?? <Icon name="x" weight="bold" size="md" icons={icons} color={t.color.mutedForeground} />}
    </Pressable>
  );
}
