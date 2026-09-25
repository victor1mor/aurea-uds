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
import {Pressable, View, type PressableProps} from "react-native";
import {criarFolha, REACAO_AO_TOQUE} from "./estilos.js";
import {Icon, type AureaIconRegistry, type IconName} from "./icon.js";
import {Text} from "./text.js";
import {useAureaStrings, useAureaTheme, useAureaTokens, useSobreAMarca, type SobreAMarcaValor} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

/** Quanto peso a caixa tem. */
export type AureaButtonAppearance = "solid" | "outline" | "ghost";
/** O que a cor significa. Mesmos nomes da web (ADR-0044). */
export type AureaButtonTone = "neutral" | "brand" | "danger" | "success" | "warning" | "info";
/** As cinco alturas de controle, todas de token de densidade. */
export type AureaButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

const ALTURA: Record<AureaButtonSize, string> = {
  xs: "controlHXs", sm: "controlHSm", md: "controlHMd", lg: "controlHLg", xl: "controlHXl",
};
// Os mesmos números do `.btn-*` do core, medidos lá — não reinventados aqui.
const PADDING: Record<AureaButtonSize, number> = {xs: 10, sm: 12, md: 15, lg: 20, xl: 26};
const GAP: Record<AureaButtonSize, number> = {xs: 6, sm: 8, md: 8, lg: 8, xl: 10};
const FONTE: Record<AureaButtonSize, "xs" | "sm" | "base"> = {
  xs: "xs", sm: "xs", md: "sm", lg: "base", xl: "base",
};
const ICONE: Record<AureaButtonSize, "sm" | "md" | "lg"> = {
  xs: "sm", sm: "sm", md: "sm", lg: "md", xl: "md",
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
    success: {solido: t.color.success, texto: t.color.successForeground, sobre: t.color.success},
    warning: {solido: t.color.warning, texto: t.color.warningForeground, sobre: t.color.warning},
    info: {solido: t.color.info, texto: t.color.infoForeground, sobre: t.color.info},
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
  // E2 (25/09/2026): SEM `alignSelf`. O botão obedece o pai, como no HeroUI Native (`button.css`
  // não fixa alinhamento) e como o `.btn` da web num `.stack`. Era `alignSelf: "flex-start"`, e ele
  // vencia o `alignItems: "center"` do pai: o botão do `EmptyState` ficava à esquerda com o resto
  // no meio. ⚠ A consequência, decidida pelo Victor: numa coluna sem alinhamento o botão ESTICA,
  // como na web. "Do tamanho do texto" se diz no pai — `Stack align="start"`.
  alvo: {minHeight: t.size.targetMin, justifyContent: "center"},
  alvoLargura: {alignSelf: "stretch"},
  caixa: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: t.size.radiusControl,           // 999 — pill, identidade INTOCÁVEL
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
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  /**
   * Um desenho QUALQUER na frente do texto, para quando a marca não pode ser um ícone nosso.
   *
   * ⚠ **Ele existe por causa de MARCA REGISTRADA, não por conveniência.** O botão "Entrar com
   * Google" e o "Entrar com Apple" exigem o desenho oficial de cada um, e nenhum dos dois pode
   * viver dentro desta biblioteca: o Google proíbe redesenhar e manda usar o arquivo do pacote
   * dele; a Apple proíbe usar o logo sem licença escrita. **Então a marca entra pelo app**, e o
   * que a Aurea dá é a cápsula em volta.
   *
   *     <Button appearance="outline" leading={<RNImage source={logoGoogle} style={{width: 18, height: 18}} />}>
   *       Entrar com Google
   *     </Button>
   *
   * ⚠ **A cor do texto NÃO atravessa para cá** — o que entra desenha a própria cor, e é assim
   * que tem de ser: a marca do Google tem cor fixa, e tingi-la seria justamente o que a regra
   * dele proíbe. Um `leadingIcon` nosso continua herdando a cor do botão.
   */
  leading?: React.ReactNode;
  /** O mesmo, do outro lado. */
  trailing?: React.ReactNode;
  /** Registro de ícones, quando não há um em contexto. Ver `criarRegistroDeIcones`. */
  icons?: AureaIconRegistry;
  fullWidth?: boolean;
  /** Estado de alternância, anunciado ao leitor de tela como `checked`. */
  pressed?: boolean;
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
export function Button({
  children, appearance = "solid", tone = "neutral", size = "md",
  leadingIcon, trailingIcon, leading, trailing, icons, fullWidth = false, pressed,
  disabled, accessibilityLabel, ...rest
}: ButtonProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const marca = useSobreAMarca();
  const cor = pintarSobreAMarca(pintar(t, tone), marca, tone, appearance);
  const corDaBorda = marca?.tinta ?? t.color.border;

  const caixa = React.useMemo(() => ({
    height: t.size[ALTURA[size]],
    paddingHorizontal: PADDING[size],
    gap: GAP[size],
    backgroundColor: appearance === "solid" ? cor.solido : "transparent",
    borderColor: cor.contorno ?? (appearance === "outline" ? corDaBorda : "transparent"),
    ...(fullWidth ? {flex: 1} : null),
  }), [t, size, appearance, cor.solido, cor.contorno, corDaBorda, fullWidth]);

  const corDoTexto = appearance === "solid" ? cor.texto : cor.sobre;

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{disabled: !!disabled, ...(pressed === undefined ? null : {checked: pressed})}}
      style={({pressed: tocando}) => [
        s.alvo, fullWidth && s.alvoLargura,
        tocando && s.pressionado, disabled && s.inerte,
      ]}
      {...rest}>
      <View style={[s.caixa, caixa]}>
        {leading ?? null}
        {leadingIcon ? <Icon name={leadingIcon} size={ICONE[size]} color={corDoTexto} icons={icons} /> : null}
        {typeof children === "string"
          // E1 (25/09/2026): entrelinha NORMAL (1,5), como o rótulo do botão do HeroUI Native
          // (`button.css`: `line-height: var(--text-*--line-height)`). Era `none` (1,0), e o IBM
          // Plex precisa de 1,3 em para caber inteiro (sobe 1,025 e desce 0,275): no Android o RN
          // corta o que passa da linha, e a perna do g, do p e do ç sumia. Cabe em todo tamanho e
          // densidade (medido): `xs`/`sm` têm linha de 21 e o menor botão mede 24 (compacto); os
          // maiores têm linha de 24 e medem 32 ou mais.
          ? <Text size={FONTE[size]} weight={500} leading="normal" style={{color: corDoTexto}}>{children}</Text>
          : children}
        {trailingIcon ? <Icon name={trailingIcon} size={ICONE[size]} color={corDoTexto} icons={icons} /> : null}
        {trailing ?? null}
      </View>
    </Pressable>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, "children" | "leadingIcon" | "trailingIcon" | "fullWidth"> {
  name: IconName;
  /** **Obrigatório**: um botão que só tem glifo não tem texto para o leitor de tela anunciar. */
  label: string;
}

/**
 * Botão REDONDO, só glifo.
 *
 * O raio é o da cápsula (`radiusControl`, 999) num quadrado, e um quadrado com raio 999 é um
 * círculo — o mesmo que o `.btn-icon` do core faz. Decisão do Victor, 25/09/2026 (ADR-0052): era
 * `--radius-md`/`--radius-sm`, e o HeroUI 3.2.6 faz o botão só de ícone redondo.
 *
 * ⚠ **`label` é obrigatório no tipo**, e é a única prop deste pacote que obriga texto. Um ícone
 * sozinho não diz nada a quem não o vê, e deixar isso opcional é o mesmo que deixá-lo vazio.
 */
export function IconButton(props: IconButtonProps) {
  return <BotaoDeIcone {...props} />;
}

/** O corpo do `IconButton`. A cor própria do ícone (`corDoIcone`) é só do `ThemeToggle`: o
 *  `IconButton` público não tem cor solta, e dentro do cartão da marca ela não vale (a tinta vence). */
function BotaoDeIcone({
  name, label, appearance = "ghost", tone = "neutral", size = "md",
  icons, pressed, disabled, corDoIcone, ...rest
}: IconButtonProps & {corDoIcone?: string}) {
  const t = useAureaTokens();
  const s = folha(t);
  const marca = useSobreAMarca();
  const cor = pintarSobreAMarca(pintar(t, tone), marca, tone, appearance);
  const corDaBorda = marca?.tinta ?? t.color.border;
  const lado = t.size[ALTURA[size]];

  const caixa = React.useMemo(() => ({
    height: lado, width: lado, paddingHorizontal: 0,
    borderRadius: t.size.radiusControl,
    backgroundColor: appearance === "solid" ? cor.solido : "transparent",
    borderColor: cor.contorno ?? (appearance === "outline" ? corDaBorda : "transparent"),
  }), [t, lado, size, appearance, cor.solido, cor.contorno, corDaBorda]);

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled: !!disabled, ...(pressed === undefined ? null : {checked: pressed})}}
      style={({pressed: tocando}) => [
        // Largura FIXA, como o só-ícone do HeroUI (`.button--icon-only`: `w-10`): ele nunca estica,
        // nem numa coluna sem alinhamento. O alvo é o maior entre o desenho e o `targetMin`.
        s.alvo, {width: Math.max(lado, t.size.targetMin), alignItems: "center"},
        tocando && s.pressionado, disabled && s.inerte,
      ]}
      {...rest}>
      <View style={[s.caixa, caixa]}>
        <Icon name={name} size={ICONE[size]} icons={icons}
              color={corDoIcone && !marca ? corDoIcone : appearance === "solid" ? cor.texto : cor.sobre} />
      </View>
    </Pressable>
  );
}

// ThemeToggle (25/09/2026, pedido do Victor): o botão de claro e escuro, com cor no ícone — o
// irmão do da web. Peça EXCLUSIVA da Aurea (o HeroUI Native não tem troca de tema), pensada como
// ele faria: um só-ícone, sem cor solta. Mostra o tema para onde se VAI: no claro a LUA, na tinta
// do texto; no escuro o SOL, no amarelo da marca. ⚠ Os glifos `asleep--filled` e `light--filled` saem do registro do
// app, como os do `Alert`: sem eles o ícone não desenha, e o `Icon` avisa no desenvolvimento.
/** Fechado: sem `appearance` e sem `tone`, porque a cor é a do glifo. */
export interface ThemeToggleProps extends Omit<IconButtonProps, "name" | "label" | "onPress" | "appearance" | "tone"> {}
export function ThemeToggle(props: ThemeToggleProps) {
  const {theme, toggleTheme} = useAureaTheme();
  const t = useAureaTokens();
  const s = useAureaStrings();
  const escuro = theme === "dark";
  return (
    <BotaoDeIcone {...props} name={escuro ? "light--filled" : "asleep--filled"}
      label={escuro ? s.themeToLight : s.themeToDark}
      corDoIcone={escuro ? t.color.primary : t.color.foreground}
      onPress={toggleTheme} />
  );
}
