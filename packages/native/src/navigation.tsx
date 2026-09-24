// Aurea nativo — a categoria **Navigation**: `BottomNav`, `Topbar`, `NavList` e `Stepper`.
//
// Lote 3 do `NATIVE.md` §5.5 — a moldura. O consumidor medido (§5.1) especifica ela **literal**:
// *navegação inferior fixa com quatro abas e contador de não lidos*, *o botão central abrindo uma
// folha*, *pull-to-refresh na lista e no painel*, e um *onboarding de 3 passos*.
//
// ⚠ **E a primeira coisa a dizer é o que este módulo NÃO faz: roteamento.** Isso está escrito no
// `NATIVE.md` §5.5 desde 31/08/2026 e não é lacuna — `expo-router`/`react-navigation` é escolha do
// app. O que a Aurea entrega é a **pele** que se pluga nele: um `BottomNav` recebe `items` e
// `current` e avisa por `onPress`. Quem troca de tela é o app.
//
// Medido antes de escrito, com a linha:
//
//   .topbar             aurea.css:81    linha, space-between, gap space-4, minH topbar-height
//   .topbar-floating    :82             raio de CARTÃO, borda, margem space-4
//   .topbar-pill        :87             largura de conteúdo, centrado, raio de controle
//   .bottom-nav         :270            linha, gap space-1, margem space-4, raio de controle, sombra
//   .bottom-nav-item    :273            coluna centrada, minH control-h-lg, textXs, mutedForeground
//   .bottom-nav-mark    :306            a caixa de 2rem que ANCORA o contador
//   .bottom-nav-badge   :310            canto do ícone, deslocado por -space-05
//   [aria-current]      :331            foreground + peso médio, e o ícone perde a transparência
//   os sete indicadores :360-397        de `none` a `circle-bold`
//   .nav-list           :405            coluna com gap space-05
//   .nav-list-row       :416            linha, gap space-3, minH control-h-lg, raio card − space-1
//   .stepper            :1141           colunas iguais
//   .step-dot           :1145           32 redondo, borda border-strong, fundo surface-1
//
// A semântica veio do FONTE (`navigation-client.tsx`), e é dela que sai a decisão mais importante
// deste módulo — a de acessibilidade, logo abaixo.
import * as React from "react";
import {
  Pressable, View, type StyleProp, type ViewProps, type ViewStyle} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useAnotarBottomNav} from "./barranav.js";
import {Badge} from "./display.js";
import {comOpacidade, criarFolha} from "./estilos.js";
import {Icon, type IconName} from "./icon.js";
import {Card} from "./layout.js";
import {FilaRolante} from "./rolagem.js";
import {Text} from "./text.js";
import {useAureaStrings, useAureaTokens} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

const folha = criarFolha((t: AureaTokens) => ({
  // ── Topbar ─────────────────────────────────────────────────────────────────────────────────
  // ⚠ Sem `position: sticky` — ele não existe no React Native. Na web o `.topbar` gruda no topo
  // da rolagem; aqui uma barra que fica parada é uma barra FORA do `ScrollView`, e quem monta
  // isso é a tela. Não é omissão: é a composição correta na plataforma.
  topo: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    gap: t.size.space4, minHeight: t.size.topbarHeight,
  },
  topo_floating: {
    marginHorizontal: t.size.space4, marginTop: t.size.space4,
    paddingVertical: t.size.space2, paddingHorizontal: t.size.space4,
    borderWidth: t.size.borderWidth, borderColor: t.color.border,
    borderRadius: t.size.radiusCard, backgroundColor: t.color.card,
  },
  topo_flush: {paddingVertical: t.size.space2, paddingHorizontal: t.size.space5,
               backgroundColor: t.color.background},
  // `inset` (R-02, 24/09/2026): o recuo dos lados da `flush`. `page` é o mesmo `space4` do
  // `respiro` da `Screen` (`screen.tsx`), para o título alinhar com o conteúdo embaixo; `none` é
  // para a barra que já vai dentro de um conteúdo com recuo próprio.
  topo_recuo_page: {paddingHorizontal: t.size.space4},
  topo_recuo_none: {paddingHorizontal: 0},
  topo_pill: {
    alignSelf: "center", marginTop: t.size.space4, justifyContent: "flex-start",
    gap: t.size.space2, padding: t.size.space2,
    borderWidth: t.size.borderWidth, borderColor: t.color.border,
    borderRadius: t.size.radiusControl, backgroundColor: t.color.card,
  },

  // ── BottomNav ──────────────────────────────────────────────────────────────────────────────
  // 🔴 `floating` FLUTUA POR CIMA DA TELA, e isto é conserto de 19/09/2026 — a variante prometia
  // isso no nome e não fazia. `position: absolute` a tira do fluxo: a tela passa a ocupar a altura
  // inteira e rola POR BAIXO da pílula. É o mesmo que a web faz desde sempre com
  // `position: sticky; bottom: 0` (`aurea.css:270`) — a divergência era só deste lado.
  //
  // ⚠ **As margens são o que deixa o toque passar.** Com `left/right/bottom: 0` e `margin`, a
  // caixa deste `View` É a pílula: o que sobra em volta não pertence a ela, e o dedo encontra a
  // tela de baixo. Se a barra fosse uma faixa de largura cheia com a pílula centralizada dentro,
  // a faixa comeria o toque em silêncio.
  //
  // `zSticky` é token (20), o mesmo `--z-sticky` que a web usa na mesma peça.
  barra: {
    position: "absolute", bottom: 0, zIndex: t.size.zSticky,
    flexDirection: "row", gap: t.size.space1, margin: t.size.space4, padding: t.size.space1,
    borderWidth: t.size.borderWidth, borderColor: t.color.border,
    borderRadius: t.size.radiusControl, backgroundColor: t.color.card,
    boxShadow: [t.shadow.shadowMd],
  },
  // `edge` encosta na borda: sem margem, sem raio, só a linha de cima — e continua NO FLUXO,
  // porque uma barra encostada que flutuasse esconderia o fim da tela sem nada reservar.
  barra_edge: {
    position: "relative", left: undefined, right: undefined, bottom: undefined, zIndex: undefined,
    margin: 0, paddingHorizontal: 0, borderRadius: 0, backgroundColor: t.color.background,
    borderWidth: 0, borderTopWidth: t.size.borderWidth, boxShadow: undefined,
  },
  // A pílula CHEIA, de uma borda à outra menos a margem — o de sempre. Mora fora da `barra` para
  // o `content` nunca precisar DESFAZER estes dois (ver abaixo).
  barra_cheia: {left: 0, right: 0},
  // 🔴 `width="content"` — R-08, 24/09/2026: *"ficou super largo"*. A pílula deixa de ir de uma
  // borda à outra e fica do tamanho das abas, no centro. Nenhuma conta nossa: medido no Yoga do
  // `react-native@0.87.1`, uma peça `absolute` SEM `left`/`right` se mede pelo conteúdo, limitada
  // à largura do pai (`AbsoluteLayout.cpp`, o ramo `FitContent` de `layoutAbsoluteChild`), e é
  // posicionada pelo `alignSelf` (`alignAbsoluteChild`, o caso `Align::Center`).
  // ⚠ **Por isso `left/right` NÃO podem existir aqui**, e a forma importa: escrever
  // `left: undefined` por cima de um `left: 0` apaga na montagem, mas NÃO numa atualização — o
  // `restoreDeletedValuesInNestedArray` do `ReactNativeAttributePayload.js` pula `undefined` e
  // devolve o valor do item anterior. Trocar `width` com a tela aberta deixaria a pílula cheia.
  barra_content: {alignSelf: "center"},
  aba: {
    flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center",
    gap: t.size.space1, minHeight: t.size.controlHLg, padding: t.size.space1,
    borderRadius: t.size.radiusControl,
  },
  // Com a pílula do tamanho do conteúdo, `flex: 1` MATA as abas: no RN ele é base ZERO, e a soma
  // de zeros é uma pílula de largura zero. Aqui cada aba mede o próprio conteúdo (base `auto`) e
  // só encolhe se não couber. O mínimo é o alvo de toque da própria aba, `controlHLg`, para uma
  // aba de rótulo curto não virar um alvo mais estreito que alto; e o respiro dos lados é o
  // `space3` que o `.bottom-nav-content` da web usa na mesma peça.
  aba_content: {
    flexGrow: 0, flexShrink: 1, flexBasis: "auto",
    minWidth: t.size.controlHLg, paddingHorizontal: t.size.space3,
  },
  // A CAIXA QUE ANCORA O CONTADOR, e ela existe por um defeito visto em tela: pendurado no ITEM,
  // o número cai no meio do RÓTULO. O `navigation-client.tsx:336` conta a história inteira — o
  // Victor viu o contador cobrir o nome em 17/08/2026, e a pesquisa (Material 3 e os guias de
  // barra de abas do iOS) diz o mesmo: canto superior do ÍCONE, nunca sobre o texto.
  marca: {position: "relative", alignItems: "center", justifyContent: "center",
          width: 32, height: 32, borderRadius: t.size.radiusControl},
  marcaRedonda: {borderRadius: t.size.radiusFull},
  contador: {position: "absolute", top: -t.size.space05, right: -t.size.space05},

  // ── NavList ────────────────────────────────────────────────────────────────────────────────
  lista: {gap: t.size.space05},
  linha: {
    flexDirection: "row", alignItems: "center", gap: t.size.space3, width: "100%",
    minHeight: t.size.controlHLg,
    paddingVertical: t.size.space2, paddingHorizontal: t.size.space3,
    borderRadius: t.size.radiusCard - t.size.space1,
  },
  // O MIOLO da linha: ícone + texto (+ valor em texto) + seta. Ele é quem toca; o que vem
  // depois dele, na moldura, é IRMÃO — ver o comentário no componente.
  // Nenhuma medida nova: `flex`, `minWidth` e o MESMO `gap` da moldura.
  linhaMiolo: {flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: t.size.space3},
  linhaTexto: {flex: 1, minWidth: 0},

  // ── Tabs ───────────────────────────────────────────────────────────────────────────────────
  // A cápsula é a MESMA do `SegmentedControl`, e o CSS diz isso em voz alta no comentário de
  // cima do `.tabs` (`aurea.css:1114`): *"Mesma regra da .segmented"*. Os três números vêm de
  // lá — `gap:3px; padding:3px` — e não de mim.
  abas: {
    flexDirection: "row", gap: 3, padding: 3,
    minHeight: t.size.controlHMd, borderRadius: t.size.radiusControl,
    backgroundColor: t.color.muted,
  },
  // `padding:0 14px` é literal no `.tab` (`aurea.css:1127`). A aba NÃO estica (nada de `flex`):
  // na web ela é conteúdo dentro de um `inline-flex`, e é isso que deixa a lista rolar quando
  // não cabe, em vez de espremer todas.
  // ⚠ O nome é `abaDeTab` porque `aba` JÁ EXISTE neste arquivo — é o item do `BottomNav`
  // (linha 78), que tem `flex: 1` e cresce. Reusar o nome teria sobrescrito um dos dois em
  // silêncio, e o `tsc` só pegou porque são chaves do mesmo objeto.
  abaDeTab: {
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 14, borderRadius: t.size.radiusControl,
  },
  abaDeTabAtiva: {backgroundColor: t.color.secondary},
  painel: {marginTop: t.size.space3},

  // ── Stepper ────────────────────────────────────────────────────────────────────────────────
  trilha: {flexDirection: "row"},
  passo: {flex: 1, alignItems: "center"},
  bolinha: {
    width: 32, height: 32, marginBottom: t.size.space2,
    alignItems: "center", justifyContent: "center", borderRadius: t.size.radiusFull,
    borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
    backgroundColor: t.color.surface1,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A DECISÃO DE ACESSIBILIDADE QUE ATRAVESSA O MÓDULO INTEIRO
//
// A ficha do `BottomNav` na web escreve, em voz alta, o que ela NÃO adota — e a razão atravessa
// para cá sem uma vírgula de diferença:
//
//   "What is deliberately NOT adopted is the Tabs pattern: a tab swaps a panel inside the page,
//    a bottom bar changes page. Giving role=tablist to a menu makes the screen reader promise
//    arrow keys that lead nowhere."
//
// No React Native existem `accessibilityRole="tab"` e `"tablist"`, e usá-los aqui seria fácil e
// errado pelo mesmo motivo. **Não são usados.**
//
// O que a web usa no lugar é `<nav>` + `<a>` + `aria-current="page"`. Disso, o que existe no RN:
//
//   `<nav>`  → NÃO existe. Não há landmarks no Android/iOS como no HTML. A barra recebe
//              `accessibilityLabel` (o `label`, ou a frase do provider) e nada mais. Inventar
//              `toolbar` porque sobrou seria dizer uma coisa que não é.
//   `<a>`    → `accessibilityRole="link"`, que é o mais próximo honesto de "isto leva a outro
//              lugar" — e é o que separa a aba de um `button`, que promete ação nesta tela.
//   current  → `accessibilityState={{selected: true}}`. É o par do `aria-current` no RN.
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface AureaNavItem {
  id: string;
  label: React.ReactNode;
  icon?: IconName;
  /** O contador de não lidos. Número vira selo; `true` vira ponto. */
  badge?: number | boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export type AureaBottomNavVariant = "floating" | "edge";
/** Quanto a pílula ocupa: a tela menos a margem (`full`, o de sempre) ou só as abas (`content`). */
export type AureaBottomNavWidth = "full" | "content";
export type AureaBottomNavIndicator =
  | "none" | "subtle" | "pill" | "circle" | "circle-raised" | "circle-outline" | "circle-bold";

export interface BottomNavProps extends ViewProps {
  items: AureaNavItem[];
  /** O `id` do item corrente. */
  current?: string;
  variant?: AureaBottomNavVariant;
  indicator?: AureaBottomNavIndicator;
  /**
   * `content` põe a pílula do tamanho das abas, no centro, em vez de ir de uma borda à outra.
   * Vale só no `floating`: a `edge` encosta na borda e continua da largura da tela.
   */
  width?: AureaBottomNavWidth;
  /** Nome da barra para o leitor de tela. Sem ele, a frase do provider. */
  label?: string;
}

/**
 * A barra inferior — a pele da navegação, **não a navegação**.
 *
 * ```tsx
 * <BottomNav
 *   current={aba}
 *   items={[
 *     {id: "painel", label: "Painel", icon: "dashboard", onPress: () => ir("painel")},
 *     {id: "avisos", label: "Avisos", icon: "notification", badge: 8, onPress: () => ir("avisos")},
 *   ]} />
 * ```
 *
 * ⚠ **Ela respeita a área do sistema sozinha, e desde 19/09/2026 POR FORA da pílula.** No
 * `floating` a folga vira `marginBottom`: a borda de baixo fica exatamente `space4` acima do topo
 * da área do sistema, seja ela a faixa dos três botões do Android (≈48), a linha de gesto (≈16)
 * ou o indicador do iPhone. No `edge`, que encosta na borda, ela continua sendo recheio por
 * dentro — igual à web, onde `.bottom-nav-edge` faz exatamente isso.
 *
 * ⚠ **Não é `Tabs`, e isso é decisão registrada**, não esquecimento — ver o bloco acima.
 *
 * ── COMO MONTAR AS ABAS, com `expo-router` ou `react-navigation` ─────────────────────────────
 *
 * ```tsx
 * import {Tabs} from "expo-router";
 * import {BottomNav, BottomNavProvider} from "@aurea-uds/native";
 *
 * const ROTAS = [
 *   {name: "index",  titulo: "Início", icone: "home"},
 *   {name: "perfil", titulo: "Perfil", icone: "user"},
 * ];
 *
 * <BottomNavProvider>
 *   <Tabs
 *     screenOptions={{headerShown: false}}
 *     tabBar={({state, navigation}) => (
 *       <BottomNav
 *         label="Menu principal"
 *         current={state.routes[state.index].name}
 *         items={ROTAS.map((r) => ({
 *           id: r.name, label: r.titulo, icon: r.icone,
 *           onPress: () => navigation.navigate(r.name),
 *         }))} />
 *     )} />
 * </BottomNavProvider>
 * ```
 *
 * E as telas, sem conta nenhuma de respiro: `<Screen scroll edges={["top"]}>`.
 *
 * 🔴 **O `BottomNav` VAI SOLTO NO `tabBar`, SEM `View` EM VOLTA — e esta linha já mandou o
 * contrário.** Até a `0.8.7` a documentação aqui mandava embrulhar a barra num `View` pintado com
 * o fundo do tema, porque a barra ficava no FLUXO e o que aparecia atrás dela era a raiz do app,
 * que no Android é branca. O consumidor seguiu, e o resultado em aparelho foi uma **caixa cinza
 * em volta da pílula**: ela não flutuava, e a tela terminava acima dela.
 *
 * ✅ **Hoje o `floating` é `position: absolute`** — ele sai do fluxo e passa por cima da tela,
 * que volta a ocupar a altura inteira. Não há nada atrás da pílula para pintar, então **o
 * embrulho não é mais necessário e atrapalha**: ele é quem desenha a faixa.
 *
 * ⚠ **O `edge` continua no fluxo**, e para ELE o conselho antigo continua valendo: embrulhe os
 * dois num `View` com `flex: 1` e `backgroundColor: t.color.background`, senão sobra a faixa
 * branca do Android no pé da tela.
 *
 * ⚠ **E o sintoma engana.** Visto em foto no aparelho em 10/09/2026: com a faixa branca a barra
 * *parece* flutuando longe do pé, que é exatamente o sinal de que o respiro virou SOMA em vez de
 * `Math.max`. A conta estava certa; o branco é que empurrava a leitura. **Antes de acusar a
 * aritmética, pinte o fundo.**
 *
 * 🔴 **FLUTUAR TEM UM PREÇO, E A BIBLIOTECA É QUEM PAGA:** o fim da rolagem fica atrás da pílula.
 * É para isso que o `BottomNavProvider` existe — a barra mede a própria altura e conta para ele,
 * e o `Screen scroll` reserva o espaço sozinho. **O app não calcula nada.** Para uma tela que não
 * usa `Screen` (uma fileira de botões presa no pé, por exemplo), o número está em
 * `useBottomNavSpace()`. Fora de um provedor os dois valem zero, e nada muda.
 */
export function BottomNav({
  items, current, variant = "floating", indicator = "none", width = "full", label, style, ...rest
}: BottomNavProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const inset = useSafeAreaInsets();
  const redondo = indicator.startsWith("circle");
  const anotar = useAnotarBottomNav();
  const flutua = variant !== "edge";
  const justa = flutua && width === "content";

  return (
    <View
      accessibilityLabel={label ?? strings.bottomNavLabel}
      // 🔴 A BARRA CONTA A PRÓPRIA ALTURA — é o que permite o `Screen` reservar o fim da rolagem
      // sem o app calcular nada. A conta é a pílula (o que o layout mede) mais as DUAS margens
      // mais a folga do sistema; `edge` conta zero, porque ela fica no fluxo e já encurta a tela.
      onLayout={anotar == null ? undefined : (e) => anotar(
        flutua ? e.nativeEvent.layout.height + t.size.space4 * 2 + inset.bottom : 0)}
      style={[
        s.barra, justa ? s.barra_content : s.barra_cheia, variant === "edge" && s.barra_edge,
        // 🔴 NO `floating` A FOLGA DO SISTEMA VAI POR FORA — conserto de 19/09/2026, visto em
        // aparelho Samsung com os três botões (|||, ○, <).
        //
        // Antes, os ≈48 pontos da faixa do sistema entravam como RECHEIO dentro da pílula: ela
        // crescia para baixo e a barriga dela ficava atrás dos botões. A `margin: space4` não
        // compensava, porque o que cresceu foi o miolo.
        //
        // Agora: recheio de baixo igual aos outros lados, e a folga empurra a pílula para cima.
        // A borda de baixo fica exatamente `space4` acima do topo da área do sistema, em aparelho
        // de botões, de gesto ou com o indicador do iPhone — os três caem na mesma conta.
        flutua
          ? {paddingBottom: t.size.space1, marginBottom: t.size.space4 + inset.bottom}
          // `edge` NÃO MUDA: encostada na borda, a folga é recheio mesmo, senão sobraria uma
          // faixa de fundo entre a barra e o pé da tela. `max` e não soma, como sempre foi.
          : {paddingBottom: Math.max(t.size.space1, inset.bottom)},
        style,
      ]}
      {...rest}>
      {items.map((it) => {
        const ativo = it.id === current;
        const corDoTexto = !ativo ? t.color.mutedForeground
          : indicator === "none" ? t.color.primaryEmphasis
          : indicator === "circle-bold" ? t.color.primaryForeground
          : indicator === "subtle" || indicator === "pill" ? t.color.primaryEmphasis
          : redondo ? t.color.primaryEmphasis
          : t.color.foreground;

        return (
          <Pressable
            key={it.id}
            onPress={it.onPress}
            disabled={it.disabled}
            // `link` e não `tab`: uma aba troca um painel DESTA tela; isto troca de tela.
            accessibilityRole="link"
            accessibilityState={{selected: ativo, disabled: !!it.disabled}}
            style={[
              s.aba, justa && s.aba_content,
              indicator === "subtle" && {borderRadius: t.size.radiusCard - t.size.space1},
              ativo && (indicator === "subtle" || indicator === "pill")
                && {backgroundColor: comOpacidade(t.color.primary, 0.12)},
              ativo && indicator === "circle-bold" && {
                flex: 0, width: 56, borderRadius: t.size.radiusFull,
                backgroundColor: t.color.primary,
              },
            ]}>
            <View style={[
              s.marca, redondo && s.marcaRedonda,
              ativo && indicator === "circle" && {backgroundColor: comOpacidade(t.color.primary, 0.14)},
              ativo && indicator === "circle-raised" && {
                backgroundColor: t.color.popover, boxShadow: [t.shadow.shadowMd],
              },
              ativo && indicator === "circle-outline" && {
                borderWidth: t.size.borderWidth, borderColor: t.color.primaryEmphasis,
              },
            ]}>
              {it.icon && <Icon name={it.icon} size="lg" color={corDoTexto} />}
              {it.badge != null && it.badge !== false && (
                <View style={s.contador}>
                  {/* O contador é DECORATIVO — quem carrega a informação é o rótulo da aba, e é
                      por isso que ele entra no `accessibilityLabel` abaixo em vez de ficar solto
                      na árvore. Sem isso o leitor anuncia "Avisos, 8" sem dizer o que é o 8. */}
                  {typeof it.badge === "number"
                    ? <Badge tone="danger" emphasis="solid" size="xs" count={it.badge} />
                    : <Badge tone="danger" emphasis="solid" size="xs" dot />}
                </View>
              )}
            </View>
            {typeof it.label === "string"
              ? <Text size="xs" weight={ativo ? 500 : 400} numberOfLines={1}
                      style={{color: corDoTexto}}>{it.label}</Text>
              : it.label}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Topbar
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaTopbarVariant = "floating" | "flush" | "pill";
/** O recuo dos lados da `flush`: `bar` (20, o de sempre), `page` (16, o da `Screen`) ou `none`. */
export type AureaTopbarInset = "bar" | "page" | "none";

export interface TopbarProps extends ViewProps {
  variant?: AureaTopbarVariant;
  /**
   * Só na `flush` — R-02, 24/09/2026. Por padrão a barra recua 20 dos lados e a `Screen` recua 16,
   * então o título fica 4 para dentro do conteúdo. `page` alinha os dois; `none` serve para a
   * barra que já vai dentro de um conteúdo com recuo. As outras duas variantes são caixas com
   * margem própria e ignoram esta prop.
   */
  inset?: AureaTopbarInset;
  brand?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * A barra de cima.
 *
 * ⚠ **Ela NÃO gruda sozinha.** Na web o `.topbar` é `position: sticky`, que não existe no React
 * Native. Aqui a barra fica parada porque a TELA a põe fora do `ScrollView`:
 *
 * ```tsx
 * <Screen padded={false}>
 *   <Topbar brand={<Text weight={700}>Aurea</Text>} />
 *   <ScrollView>…</ScrollView>
 * </Screen>
 * ```
 *
 * ⚠ **E não é `banner`.** A ficha da web declara `role="banner"`, que é um *landmark* do HTML —
 * e **não há landmarks no RN**. Um papel inventado diria uma coisa errada; a barra fica sem papel,
 * e quem nomeia a tela é o conteúdo dela.
 */
export function Topbar({variant = "floating", inset = "bar", brand, children, style, ...rest}: TopbarProps) {
  const s = folha(useAureaTokens());
  return (
    <View
      style={[
        s.topo, s[`topo_${variant}`],
        variant === "flush" && inset !== "bar" && s[`topo_recuo_${inset}`],
        style,
      ]}
      {...rest}>
      {brand != null && <View>{brand}</View>}
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// NavList
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface AureaNavListItem {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** O valor à direita — um número, um estado, uma data. */
  value?: React.ReactNode;
  icon?: IconName;
  onPress?: () => void;
  disabled?: boolean;
}

export interface NavListProps extends ViewProps {
  items: AureaNavListItem[];
  /** O glifo de "isto abre", à direita. Registre-o, ou passe `false`. */
  chevron?: IconName | false;
}

/**
 * A lista de destinos DENTRO da página — a tela de ajustes, não a moldura do app.
 *
 * ⚠ **A distinção com o `BottomNav` decidiu o desenho, e a ficha da web a escreve:** aquele é
 * *chrome de aplicativo* e marca a seção corrente; este é *conteúdo*, e **não tem item corrente**
 * — não há o que estar "atual" numa lista em que se entra e da qual se volta. Por isso aqui não
 * existe `current`, e não é lacuna.
 *
 * ⚠ **Linha indisponível continua ALCANÇÁVEL pelo leitor de tela** (`accessibilityState.disabled`,
 * não sumir da árvore): quem usa leitor precisa descobrir que ela existe.
 */
export function NavList({items, chevron = "chevron--right", style, ...rest}: NavListProps) {
  const t = useAureaTokens();
  const s = folha(t);
  return (
    // `list` existe no `accessibilityRole` do RN e é o mesmo papel da web. Aqui ele atravessa
    // inteiro, ao contrário de `navigation` e `banner`.
    <View accessibilityRole="list" style={[s.lista, style]} {...rest}>
      {items.map((it) => {
        // 🔴 DUAS COISAS QUE O CONSUMIDOR MEDIU EM 17/09/2026, e as duas moram nesta linha.
        //
        // 1 · **O `value` ficava DENTRO do `Pressable`.** Como ele aceita qualquer conteúdo, um
        //     `Switch` ali virava botão dentro de botão — e **no iOS o `Switch` desaparecia**
        //     para o VoiceOver (a mesma armadilha do `Combobox`, do `Alert` e do `Chart`; o
        //     `check 43` é quem guarda a família).
        //     ⚠ **O `check 43` NÃO pega este caso, e é honesto dizer:** ele lê o NOSSO código, e
        //     aqui o que é tocável chega de fora. **Slot que recebe conteúdo do consumidor é
        //     ponto cego de qualquer gate estático** — por isso o conserto é de DESENHO.
        //
        // 2 · **Toda linha declarava `accessibilityRole="link"`, mesmo sem `onPress`.** Uma lista
        //     só de leitura anunciava cada linha como link que não vai a lugar nenhum.
        //
        // O que ficou, e por que o `value` se divide por TIPO em vez de sair sempre:
        //   • valor em TEXTO fica no miolo, porque é parte da frase da linha — pô-lo fora criaria
        //     uma segunda parada dizendo só "42 km", solta;
        //   • valor em COMPONENTE fica FORA, irmão do miolo, porque pode ser tocável.
        const temAcao = typeof it.onPress === "function";
        const valorEhTexto = typeof it.value === "string" || typeof it.value === "number";
        const miolo = (
          <>
            {it.icon && <Icon name={it.icon} size="md" color={t.color.foreground} />}
            <View style={s.linhaTexto}>
              {typeof it.label === "string"
                ? <Text size="sm" numberOfLines={1}>{it.label}</Text> : it.label}
              {it.description != null && (typeof it.description === "string"
                ? <Text size="xs" tone="muted" numberOfLines={1}>{it.description}</Text>
                : it.description)}
            </View>
            {valorEhTexto && <Text size="sm" tone="muted">{it.value}</Text>}
            {/* ⚠ A seta só aparece com ação. Seta em linha que não abre nada é promessa falsa. */}
            {temAcao && chevron
              && <Icon name={chevron} size="sm" color={t.color.mutedForeground} />}
          </>
        );
        return (
          <View key={it.id} style={[s.linha, it.disabled && {opacity: t.size.opacityDisabled}]}>
            {temAcao ? (
              <Pressable
                onPress={it.onPress}
                disabled={it.disabled}
                accessibilityRole="link"
                accessibilityState={{disabled: !!it.disabled}}
                style={s.linhaMiolo}>
                {miolo}
              </Pressable>
            ) : (
              // SEM ação: nada de `link`, e nada de `Pressable`. O `accessible` mantém a linha
              // como UMA leitura — sem ele, ícone, rótulo e descrição virariam três paradas.
              <View
                accessible
                accessibilityState={{disabled: !!it.disabled}}
                style={s.linhaMiolo}>
                {miolo}
              </View>
            )}
            {!valorEhTexto && it.value != null ? it.value : null}
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Stepper
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaStepState = "default" | "active" | "done" | "error";

export interface AureaStepItem {
  label: React.ReactNode;
  state?: AureaStepState;
  optional?: React.ReactNode;
  onPress?: () => void;
}

export interface StepperProps extends ViewProps {
  items: AureaStepItem[];
  label?: string;
  /** Glifos de `done` e `error`. Registre-os, ou o passo mostra o número. */
  doneIcon?: IconName | false;
  errorIcon?: IconName | false;
}

/**
 * A trilha de passos — o onboarding de 3 passos que o consumidor já tem.
 *
 * ⚠ **`aria-current="step"` não tem par no RN.** A web marca o passo ativo com ele; aqui o mais
 * próximo é `accessibilityState={{selected}}`, que é o que os leitores anunciam. Não é o mesmo
 * vocabulário — é o vocabulário que existe, e dizer isso é melhor que fingir paridade.
 */
export function Stepper({
  items, label, doneIcon = "checkmark", errorIcon = "error", style, ...rest
}: StepperProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  return (
    <View accessibilityRole="list" accessibilityLabel={label ?? strings.stepperLabel}
          style={[s.trilha, style]} {...rest}>
      {items.map((it, n) => {
        const st = it.state ?? "default";
        const cor = st === "error" ? (t.color.danger400 ?? t.color.destructive)
          : st === "active" ? t.color.primaryEmphasis
          : t.color.foreground;
        const miolo = (
          <>
            <View style={[
              s.bolinha,
              st === "error" && {borderColor: cor},
              st === "active" && {borderColor: t.color.primaryEmphasis},
            ]}>
              {st === "done" && doneIcon
                ? <Icon name={doneIcon} size="sm" color={cor} />
                : st === "error" && errorIcon
                  ? <Icon name={errorIcon} size="sm" color={cor} />
                  : <Text size="sm" weight={600} style={{color: cor}}>{n + 1}</Text>}
            </View>
            {typeof it.label === "string"
              ? <Text size="sm" weight={600} align="center" style={{color: cor}}>{it.label}</Text>
              : it.label}
            {it.optional != null && (typeof it.optional === "string"
              ? <Text size="xs" tone="muted" align="center">{it.optional}</Text>
              : it.optional)}
          </>
        );
        return it.onPress ? (
          <Pressable
            key={n} onPress={it.onPress}
            accessibilityRole="button"
            accessibilityState={{selected: st === "active"}}
            style={s.passo}>
            {miolo}
          </Pressable>
        ) : (
          <View key={n} accessible accessibilityState={{selected: st === "active"}} style={s.passo}>
            {miolo}
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface AureaTabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends ViewProps {
  tabs: AureaTabItem[];
  /** O `id` da aba aberta. Controlado — quem guarda o estado é o consumidor, como na web. */
  value: string;
  onChange?: (id: string) => void;
  /** Nome da fila de abas para o leitor de tela. */
  label?: string;
}

/**
 * As abas DENTRO da tela — trocar o painel, não trocar de página.
 *
 * ⚠ **E essa frase é a fronteira com o `BottomNav`, que o Lote 3 quase errou ao contrário.** Lá
 * a ficha da web proíbe `tab` com a razão pronta — *"a tab swaps a panel inside the page, a
 * bottom bar changes page"* —, e há um teste cujo único trabalho é reprovar essa palavra na barra
 * de baixo. **Aqui é o caso certo**, então `tablist`/`tab` são os papéis honestos.
 * Medido antes de escrever: os dois estão no tipo do RN **e** no enum Kotlin
 * (`ReactAccessibilityDelegate.kt:368,370`), que é a interseção que o `check 41` cobra.
 *
 * ⚠ **A fila ROLA na horizontal, e a web não rola — divergência deliberada, com fonte.** A
 * referência máxima de desenho deste projeto tem estados de rolagem na lista de abas
 * (`left-scroll`, `right-scroll`, `left-right-scroll` no inventário), e num telefone de 360dp
 * quatro rótulos já não cabem. Espremer todas seria a outra saída, e ela apaga o rótulo — que é
 * o defeito que o app mediu no `SegmentedControl`. **A cápsula, o respiro e o raio continuam
 * sendo os do CSS**; o que muda é o transbordo.
 *
 * ⚠ **O painel inativo NÃO fica montado.** Na web o motor mantém os painéis no DOM e esconde;
 * aqui montar todos custaria memória e um painel com lista longa pagaria por telas que ninguém
 * está vendo. **A consequência está declarada e não é neutra:** o estado interno de um painel
 * (rolagem, texto digitado) **se perde** ao trocar de aba. Quem precisar do contrário guarda o
 * estado fora, como já faz com `value`.
 *
 * ⚠ **A aba escolhida NÃO usa a cor da marca, e isso é de propósito.** O `.tab.active` da web é
 * `--foreground` sobre `--secondary`, e ele **desliga o fio amarelo**
 * (`aurea.css:1128`, `:after { display:none }`) que o `.segmented` recebe. São dois sinais
 * diferentes para duas coisas diferentes: escolher um valor é uma coisa, trocar de painel é
 * outra. **Não "harmonize" isto com o `SegmentedControl`** — a diferença foi escrita à mão lá.
 *
 * ⚠ **Sem orientação VERTICAL.** A web tem (`aurea.css:1122-1126`), e ela resolve um problema de
 * largura de tela grande. Não há tablet medido neste projeto, e no nativo vale demanda antes de
 * cobertura — a mesma decisão da `Table` do Lote 6.
 */
export function Tabs({tabs, value, onChange, label, style, ...rest}: TabsProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const aberta = tabs.find((it) => it.id === value);

  return (
    <View style={style} {...rest}>
      {/* O rolador é IRMÃO do painel, e a fila inteira é o `tablist`. Ele não recebe papel:
          quem tem de ser a fila para o leitor de tela é o `View` de dentro, que contém as abas.
          🔴 **AQUI MORAVA UM DEFEITO QUE EU PUBLIQUEI NA `0.8.5`.** Este rolador era um
          `ScrollView` escrito à mão com `showsHorizontalScrollIndicator={false}` — ou seja, ele
          rolava e **não dava sinal nenhum de que havia mais abas**. Quem não soubesse arrastar
          não achava a terceira. **Quem nomeou foi o consumidor, pedindo outra coisa** (a fila de
          opções do `SegmentedControl`), e a regra *"quem mais tem esse problema?"* trouxe até
          aqui. A `FilaRolante` é a mesma peça nos dois. */}
      <FilaRolante>
        <View accessibilityRole="tablist" accessibilityLabel={label ?? strings.tabsLabel}
              style={s.abas}>
          {tabs.map((it) => {
            const ativa = it.id === value;
            return (
              <Pressable
                key={it.id}
                onPress={it.disabled ? undefined : () => onChange?.(it.id)}
                disabled={it.disabled}
                accessibilityRole="tab"
                accessibilityState={{selected: ativa, disabled: !!it.disabled}}
                accessibilityLabel={typeof it.label === "string" ? it.label : undefined}
                style={[s.abaDeTab, ativa && s.abaDeTabAtiva, it.disabled && {opacity: t.size.opacityDisabled}]}>
                {typeof it.label === "string"
                  ? <Text size="sm" weight={ativa ? 600 : 400}
                          style={{color: ativa ? t.color.foreground : t.color.mutedForeground}}>
                      {it.label}
                    </Text>
                  : it.label}
              </Pressable>
            );
          })}
        </View>
      </FilaRolante>

      {/* O painel é um cartão `inset`, como na web (`card card-inset`). **Ele NÃO recebe papel.**
          🔴 **E esta linha custou DOIS erros meus em dez minutos, em direções opostas — fica
          escrita porque o mecanismo vai pegar a próxima pessoa igual.**
          Escrevi que `tabpanel` não servia. Depois "corrigi" para dizer que servia, com um
          `grep` no arquivo inteiro que achou `TABPANEL` na linha 371. **O `check 41` reprovou**,
          e a medição certa é esta:

          o `ReactAccessibilityDelegate.kt` tem **DOIS** enums, e eles NÃO são o mesmo conjunto:
            • `Role` (linha ~340) — é o da prop `role`, no estilo ARIA. **Tem `TABPANEL`.**
            • `AccessibilityRole` (linha 413) — é o da prop `accessibilityRole`, e é o que o
              `fromValue()` da linha 501 percorre para **LANÇAR** `Invalid accessibility role
              value`. **NÃO tem `TABPANEL`.**

          Um `grep TABPANEL` no arquivo acha o primeiro e responde "existe" — e a tela cai mesmo
          assim. **Grep que não distingue os dois enums dá a resposta errada com confiança.**
          Por isso o painel fica sem papel: papel que a plataforma rejeita derruba a tela, e
          inventar um "parecido" diria uma coisa errada — a mesma decisão do `Topbar`, da
          `Table` e do `Alert`. O `accessibilityLabel` fica: ele nomeia sem prometer semântica. */}
      {aberta
        ? (
          <Card
            variant="inset"
            accessibilityLabel={typeof aberta.label === "string" ? aberta.label : undefined}
            style={s.painel}>
            {aberta.content}
          </Card>
        )
        : null}
    </View>
  );
}
