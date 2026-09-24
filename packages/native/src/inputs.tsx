// Aurea nativo — a categoria **Inputs**: `Field`, `Label`, `Input`, `Textarea`, `Select`,
// `Switch`, `Checkbox`, `Radio`, `SegmentedControl` e `Form`.
//
// Lote 4 do `NATIVE.md` §5.5 — o coração do app do consumidor: *dois formulários curtos, um
// diário e um periódico*, com **teclado numérico automático** nos campos de medida e moeda (§5.1).
//
// ── UMA CORREÇÃO ANTES DE TUDO, E ELA MUDA O TAMANHO DESTE LOTE ──────────────────────────────
// O `NATIVE.md` §5.5 diz *"sete destes são Base UI na web — este é o lote caro"*, e o `CLAUDE.md`
// repetiu. **Medido em 08/09/2026, são DOIS de dez:**
//
//     Form              -> @base-ui/react
//     SegmentedControl  -> @base-ui/react/radio-group
//     os outros oito    -> engine: null
//
// De onde veio o sete: a §5.2.4 lista a **família de campo** do Base UI inteira — Form, Field,
// Combobox, NumberField, OTPField, RadioGroup, SegmentedControl. Quatro daqueles **não estão
// neste lote**, e o `Field` da Aurea não declara motor. O número certo era da família, não do
// lote, e a frase misturou os dois.
//
// Isso não torna o lote fácil — só torna caro por outro motivo, que é o de verdade: **a ligação
// rótulo↔controle da web não existe aqui.** Ver o `Field`, abaixo.
//
// ── O QUE FOI MEDIDO, COM A LINHA ────────────────────────────────────────────────────────────
//   .field         aurea.css:672   coluna, gap 7
//   .label         :683            linha, space-between, gap 12, textSm, weightSemibold
//   .input/.select :685            altura de controle, padding-inline 13, borda borderStrong
//   .textarea      :694            minH 104, padding-block space-3, raio LG (não o de controle)
//   .select        :696            seta desenhada como imagem de fundo, padding-end 38
//   as três medidas:831-832        sm -> controlHSm/textXs/space-3 · lg -> controlHLg/textBase/space-4
//   .form          :861            grade com gap space-5
//   .field-error   :862            danger-400, textXs
//   .checkbox/.radio :863          linha, alinhada no TOPO, gap 9
//   .control-mark  :871            METADE da altura de controle, borda borderStrong, fundo fieldBg
//   o visto        :877            8×4 com borda esquerda+baixo, girado -45°
//   o ponto        :878            8×8 redondo
//   .switch-track  :882            largura h×7/6, altura h×2/3, raio 999, fundo muted
//   o polegar      :894            inset 3, lado = 100% − space-1 − space-05, redondo
//   .segmented     :922            linha, gap 3, padding 3, minH controlHMd, fundo muted
import * as React from "react";
import {
  Animated, KeyboardAvoidingView as KeyboardAvoidingViewRN, Modal, Platform, Pressable,
  ScrollView, TextInput, View,
  type KeyboardTypeOptions, type StyleProp, type TextInputProps, type TextStyle,
  type ViewProps, type ViewStyle,
} from "react-native";
import {comOpacidade, criarFolha} from "./estilos.js";
import {FilaRolante} from "./rolagem.js";
import {IconButton} from "./actions.js";
import {Icon, type AureaIconRegistry, type IconName} from "./icon.js";
import {useReduceMotion} from "./movimento.js";
import {Text} from "./text.js";
import {useAureaStrings, useAureaTokens, usePeleSobreAMarca, ForaDaMarca} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

export type AureaFieldSize = "sm" | "md" | "lg";

const alturaDoTamanho = (t: AureaTokens, s: AureaFieldSize) =>
  s === "sm" ? t.size.controlHSm : s === "lg" ? t.size.controlHLg : t.size.controlHMd;
const fonteDoTamanho = (t: AureaTokens, s: AureaFieldSize) =>
  s === "sm" ? t.size.textSm : s === "lg" ? t.size.textLg : t.size.textBase;  // ADR-0050: um degrau acima da web
const respiroDoTamanho = (t: AureaTokens, s: AureaFieldSize) =>
  s === "sm" ? t.size.space3 : s === "lg" ? t.size.space4 : 13;

const folha = criarFolha((t: AureaTokens) => ({
  campo: {gap: 7},
  rotulo: {flexDirection: "row", justifyContent: "space-between", gap: 12},
  caixa: {
    width: "100%", minWidth: 0,
    borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
    borderRadius: t.size.radiusControl, backgroundColor: t.color.fieldBg,
    color: t.color.foreground,
  },
  // O `.textarea` é o único da família com raio LG em vez do de controle: uma caixa alta em
  // pílula viraria uma cápsula, e o CSS já decidiu isso (`aurea.css:694`).
  areaDeTexto: {minHeight: 104, paddingVertical: t.size.space3, borderRadius: t.size.radiusLg},
  invalido: {borderColor: t.color.danger400 ?? t.color.destructive},
  desabilitado: {opacity: t.size.opacityDisabled},

  // O GRUPO é a mesma caixa do campo virada em LINHA, e os números são os mesmos: mesma borda,
  // mesmo raio de controle, mesmo fundo. A altura e o respiro horizontal entram por tamanho, como
  // no `Input`, porque é o grupo que passa a desenhar a caixa quando existe um.
  grupo: {
    flexDirection: "row", alignItems: "center", width: "100%", minWidth: 0,
    borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
    borderRadius: t.size.radiusControl, backgroundColor: t.color.fieldBg,
    gap: t.size.space1,
  },
  // Dentro do grupo o campo perde a caixa e vira só o texto — a borda passou a ser do grupo.
  // ⚠ As DUAS últimas linhas continuam obrigatórias: são o conserto de Android de 09/09/2026
  // (`paddingVertical: 0` desliga a injeção do tema, `textAlignVertical` tira o texto do topo).
  // É o mesmo par que o `campoDeTexto` do `busca.tsx` carrega pela mesma razão.
  campoNoGrupo: {flex: 1, minWidth: 0, paddingVertical: 0, textAlignVertical: "center"},
  encaixe: {flexDirection: "row", alignItems: "center", flexShrink: 0, gap: t.size.space1},

  marcaBase: {
    alignItems: "center", justifyContent: "center", marginTop: 1,
    borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
    backgroundColor: t.color.fieldBg,
  },
  linhaDeControle: {flexDirection: "row", alignItems: "flex-start", gap: 9},

  trilho: {borderRadius: t.size.radiusFull, backgroundColor: t.color.muted,
           borderWidth: t.size.borderWidth, borderColor: t.color.border, justifyContent: "center"},
  polegar: {position: "absolute", left: 3, borderRadius: t.size.radiusFull},

  segmentada: {
    flexDirection: "row", alignSelf: "flex-start", gap: 3, padding: 3,
    minHeight: t.size.controlHMd, borderRadius: t.size.radiusControl,
    backgroundColor: t.color.muted, borderWidth: t.size.borderWidth, borderColor: "transparent",
  },
  segmento: {flex: 1, alignItems: "center", justifyContent: "center",
             paddingHorizontal: 14, borderRadius: t.size.radiusControl},
  segmentoAtivo: {backgroundColor: t.color.secondary},
  // 🔴 O FIO AMARELO DO ESCOLHIDO — ele faltava, e a falta era metade do defeito C4.
  // O `aurea.css:958-960` põe este fio em TODOS os selecionados da casa (`.is-selected`, aba
  // ativa, botão alternado e `.segmented button.active`), e o bloco de comentário acima dele
  // diz por quê, com data: *"Item de nav ativo, aba ativa, item de lista lateral e botão
  // alternado ligado mostram o MESMO sinal (…) Um usuário aprende uma vez e reconhece em todo
  // lugar (pedido do Victor, 24/07)."*
  // Os três números saem daquela linha, não de mim: altura 2 (fração de pixel borra), recuo 15,
  // e o amarelo a 75% (cheio ele grita mais que o próprio rótulo).
  // ⚠ Em segmento estreito o recuo de 15 de cada lado zera a largura e o fio some — **e é o
  // mesmo comportamento da web**, onde `inset-inline:15px` num box estreito não desenha nada.
  fioDoSegmento: {
    position: "absolute", left: 15, right: 15, bottom: 0, height: 2,
    borderRadius: t.size.radiusFull, backgroundColor: comOpacidade(t.color.primary, 0.75),
  },

  formulario: {gap: t.size.space5},

  // A folha do `Select`: no RN não existe `<select>`, então a lista é um `Modal` — que é
  // exatamente o "motor novo sobre `Modal`" que a §5.2.4 previu.
  fundoDaLista: {flex: 1, justifyContent: "flex-end", backgroundColor: "#00000080"},
  fundoDeToque: {position: "absolute", top: 0, right: 0, bottom: 0, left: 0},
  lista: {
    maxHeight: "60%", paddingVertical: t.size.space2,
    borderTopLeftRadius: t.size.radiusCard, borderTopRightRadius: t.size.radiusCard,
    backgroundColor: t.color.popover, borderWidth: t.size.borderWidth, borderColor: t.color.border,
  },
  opcao: {minHeight: t.size.controlHLg, justifyContent: "center",
          paddingHorizontal: t.size.space4},
}));

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Field — e a tradução que decidiu o lote
//
// ⚠ **A MAIOR PARTE DO `Field` DA WEB NÃO ATRAVESSA, e o motivo não é escolha.** Lá ele existe
// para resolver UM problema: ligar o `<label>` ao controle por `htmlFor`/`id`. O fonte tem
// `useId`, detecção de elemento rotulável, três casos de "não dono" achados por gate, e a queda
// para `role="group"` quando o filho não pode receber a ligação.
//
// **No React Native não há `id`, não há `htmlFor` e não há `<label>`.** O nome de um controle é
// uma STRING nele mesmo (`accessibilityLabel`), e não uma referência a outro nó.
//
// Então o `Field` daqui faz o que sobra, e é bastante: desenha rótulo, dica e erro na ordem
// certa, e **empurra o nome, a dica e o estado de inválido para o controle lá dentro** por
// contexto. Sem isso, cada campo do app repetiria `accessibilityLabel` à mão — e é assim que
// metade dos formulários fica sem nome para quem usa leitor de tela.
// ─────────────────────────────────────────────────────────────────────────────────────────────

type ContextoDeCampo = {
  label?: string;
  hint?: string;
  invalido: boolean;
  disabled?: boolean;
  size: AureaFieldSize;
};
const CampoCtx = React.createContext<ContextoDeCampo | null>(null);

/** O que os controles leem do `Field` acima deles. Público porque um controle novo vai precisar. */
export function useCampo(): ContextoDeCampo | null {
  return React.useContext(CampoCtx);
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// O GRUPO DE CAMPO — a caixa que aceita um glifo na frente e um botão atrás.
//
// ⚠ **Ele nasceu de "quem mais tem esse problema?", e a resposta era DOIS.** O `SearchField`
// (Lote 7) já montava esta mesma linha à mão — caixa com borda, glifo, campo, botão de limpar —
// e o `PasswordField` seria o segundo a montá-la. Na web isso aconteceu literalmente assim: o
// `.input-wrap` para o glifo da busca e o `.input-wrap-end` para o botão da senha, duas soluções
// locais, e o `InputGroup` é a terceira virando uma (`inputs-client.tsx:206-210`).
//
// ⚠ **E há uma diferença de API para a web, declarada e não escondida:** lá o `InputGroupAddon`
// tem `side="start"|"end"`, porque o CSS precisa saber de que lado aplicar o respiro. Aqui a
// ordem é a do JSX dentro de uma linha do Yoga, e um `side` que não mudasse nada seria uma prop
// que mente. **Quem põe o encaixe antes do campo, põe na frente; depois, atrás.**
interface ContextoDeGrupo {
  size: AureaFieldSize;
  disabled: boolean;
  /** O campo avisa o grupo quando ganha e perde o foco — no RN não existe `:focus-within`. */
  aoFocar: (v: boolean) => void;
}
const GrupoDeCampo = React.createContext<ContextoDeGrupo | null>(null);

/** O grupo em volta do campo, quando existe um. `null` quando o campo está sozinho. */
export function useGrupoDeCampo(): ContextoDeGrupo | null {
  return React.useContext(GrupoDeCampo);
}

export interface FieldProps extends ViewProps {
  label?: string;
  hint?: React.ReactNode;
  /** Texto de erro. **Presente = o campo está inválido**, e o controle sabe disso pelo contexto. */
  error?: React.ReactNode;
  disabled?: boolean;
  size?: AureaFieldSize;
  children?: React.ReactNode;
}

/**
 * Rótulo, controle, dica e erro — na ordem, com o respiro do CSS.
 *
 * ```tsx
 * <Field label="Quilometragem" hint="Só números" error={erro}>
 *   <Input keyboardType="numeric" value={km} onChangeText={setKm} />
 * </Field>
 * ```
 *
 * ⚠ **O `error` não é só um texto vermelho:** ele marca o controle como inválido para o leitor de
 * tela e vira a dica que ele anuncia. Um campo que fica vermelho e não diz nada é um campo que só
 * quem enxerga sabe que está errado.
 *
 * ⚠ **Não há `orientation="horizontal"`.** Na web ela põe rótulo e controle lado a lado numa
 * grade de `12rem`; num telefone de 360dp isso deixa o controle com menos de metade da largura.
 * Volta quando houver alvo de tela larga — tablet é outro lote.
 */
export function Field({
  label, hint, error, disabled, size = "md", children, style, ...rest
}: FieldProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const invalido = error != null && error !== false;
  const ctx = React.useMemo<ContextoDeCampo>(() => ({
    label,
    // A dica que o leitor anuncia é o ERRO quando há erro — é a informação que importa naquele
    // momento, e é o que o `aria-describedby` da web acaba fazendo na prática.
    hint: invalido && typeof error === "string" ? error : typeof hint === "string" ? hint : undefined,
    invalido, disabled, size,
  }), [label, hint, error, invalido, disabled, size]);

  return (
    <CampoCtx.Provider value={ctx}>
      <View style={[s.campo, style]} {...rest}>
        {label != null && <Label>{label}</Label>}
        {children}
        {hint != null && !invalido && (typeof hint === "string"
          ? <Text size="xs" tone="muted">{hint}</Text> : hint)}
        {invalido && (typeof error === "string"
          ? <Text size="xs" tone="danger">{error}</Text> : error)}
      </View>
    </CampoCtx.Provider>
  );
}

export interface LabelProps extends ViewProps {
  children?: React.ReactNode;
  /** O que vai à direita — contagem de caracteres, "opcional". */
  trailing?: React.ReactNode;
}

/**
 * O rótulo.
 *
 * ⚠ **Ele NÃO nomeia o controle sozinho**, ao contrário do `<label for>` da web — no RN um texto
 * ao lado é só um texto. Quem nomeia é o `accessibilityLabel` do controle, e é o `Field` que o
 * entrega. Um `Label` solto é decoração; use-o dentro de um `Field`.
 */
export function Label({children, trailing, style, ...rest}: LabelProps) {
  const s = folha(useAureaTokens());
  return (
    <View style={[s.rotulo, style]} {...rest}>
      {typeof children === "string"
        ? <Text size="sm" weight={600}>{children}</Text> : children}
      {trailing}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Input e Textarea
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * ⚠ **O `Input` HERDA do `TextInput`, e isso é conserto de defeito publicado na `0.8.2`.**
 *
 * Até ali a interface listava catorze props e o componente desestruturava as catorze **sem
 * `...rest`**: tudo o que não estivesse na lista era **descartado em silêncio**. O app achou na
 * tela de entrar, e o efeito não aparece na tela — aparece no uso: sem `autoComplete` e
 * `textContentType` o gerenciador de senhas não reconhece os campos; sem `autoCorrect` o teclado
 * "corrige" o e-mail; sem `returnKeyType`/`onSubmitEditing` o botão "próximo" não pula para a
 * senha; e sem `ref` não há como focar o campo por código.
 *
 * ⚠ **Era pior do que parece:** o `PasswordField` repassa `...rest` ao `Input` — e o `Input`
 * jogava fora. Duas camadas concordando em perder a prop.
 *
 * O que continua sendo da Aurea está no `Omit` abaixo, e a razão de cada um está ao lado.
 */
export interface InputProps extends Omit<TextInputProps,
  // o respiro, a altura e a fonte saem do degrau e do tema — quem passar `style` SOMA, não troca
  | "style"
  // o componente calcula: vem de `disabled` e do `Field` em volta
  | "editable"
  // cor de token, não do consumidor
  | "placeholderTextColor"
  // a Aurea entrega `() => void`; o evento do RN não atravessa, e mudar isso quebraria a API
  | "onBlur" | "onFocus"
  // o nome e a dica vêm do `Field` por contexto — ver o bloco sobre `id`/`htmlFor` acima
  | "accessibilityLabel" | "accessibilityHint" | "accessibilityState"
> {
  /**
   * O nó do `TextInput` lá dentro — para focar por código (`ref.current?.focus()`), que é como
   * o "próximo" do teclado pula de um campo para o outro.
   *
   * Chega por PROPS e atravessa no `...rest`: é o padrão do React 19, sem `forwardRef`, o mesmo
   * que o `layout.tsx` já documenta. **Faltava na `0.8.2`** — não havia como focar campo nenhum.
   */
  ref?: React.Ref<React.ComponentRef<typeof TextInput>>;
  value?: string;
  defaultValue?: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: AureaFieldSize;
  /**
   * O teclado que sobe. **O plano do consumidor pede `numeric` nos campos de medida e moeda**, e
   * é a prop que faz a diferença entre digitar 12,4 em dois toques ou em oito.
   *
   * ⚠ **Teclado não é formato, e esta prop resolve só a metade fácil** — foi a segunda lacuna
   * que o consumidor mediu. Moeda, medida decimal e contador são o `NumberField` (Lote 7,
   * `numero.tsx`), que formata no blur e devolve `number`. Este campo continua devolvendo texto.
   */
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  /**
   * Normaliza o texto **quando o foco sai** — placa, documento, telefone.
   *
   * ⚠ **A Aurea entrega o MOMENTO, não o formato**, e isso é a [ADR-0024] inteira: formatar
   * enquanto se digita é o defeito que o USWDS publicou com reprovação WCAG registrada e que o
   * MUI abandonou na v6. O formato é conhecimento de DOMÍNIO — a Aurea não sabe o que é um
   * documento válido em lugar nenhum, e uma tabela de formatos por país dentro de uma biblioteca
   * de interface envelhece sem ninguém perceber.
   *
   *     <Input value={placa} onChangeText={setPlaca} formatOnBlur={(v) => v.toUpperCase()} />
   *
   * ⚠ **Exige o campo CONTROLADO** (`value` + `onChangeText`), e a diferença com a web é honesta:
   * lá o componente escreve em `e.currentTarget.value` e o `<input>` não controlado obedece. Aqui
   * o texto do `TextInput` não controlado vive dentro do nó nativo, e escrevê-lo de fora exigiria
   * `setNativeProps` — API que a Nova Arquitetura desencoraja. Então o que sai daqui é o valor
   * formatado por `onChangeText`; quem guarda o estado desenha.
   *
   * Para MOEDA e MEDIDA não use isto: use o `NumberField`, que já faz a conta e devolve `number`.
   */
  formatOnBlur?: (value: string) => string;
  onBlur?: () => void;
  onFocus?: () => void;
  /** Várias linhas. É o que o `Textarea` liga — raramente se põe à mão. */
  multiline?: boolean;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

/**
 * O campo de uma linha.
 *
 * ⚠ **`:hover` não atravessa, e não é lacuna.** A web clareia a borda no ponteiro
 * (`aurea.css:686`); **não há ponteiro no telefone**. O foco continua existindo e é o que marca o
 * campo ativo.
 */
export function Input({
  value, defaultValue, onChangeText, placeholder, disabled, size,
  keyboardType, secureTextEntry, autoCapitalize, formatOnBlur, onBlur, onFocus, multiline,
  style, testID,
  // ⚠ O `...rest` NÃO é enfeite: sem ele, toda prop do `TextInput` que a lista acima não nomeia
  // era descartada em silêncio — `autoComplete`, `textContentType`, `autoCorrect`,
  // `returnKeyType`, `onSubmitEditing`, `maxLength`. Defeito publicado na `0.8.2`.
  ...rest
}: InputProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const peleDaMarca = usePeleSobreAMarca();
  const campo = useCampo();
  const grupo = useGrupoDeCampo();
  const tam = size ?? grupo?.size ?? campo?.size ?? "md";
  const inativo = disabled ?? grupo?.disabled ?? campo?.disabled;
  const [focado, setFocado] = React.useState(false);

  return (
    <TextInput
      // O resto vem PRIMEIRO de propósito: o que a Aurea calcula (respiro, cor, nome do `Field`,
      // `editable`) tem de vencer, e as props que ela redefine estão no `Omit` da interface —
      // então não chegam por aqui e não há o que sobrescrever por acidente.
      {...rest}
      testID={testID}
      value={value}
      defaultValue={defaultValue}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={peleDaMarca?.color ?? t.color.subtleForeground}
      editable={!inativo}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      multiline={multiline}
      onFocus={() => { setFocado(true); grupo?.aoFocar(true); onFocus?.(); }}
      onBlur={() => {
        setFocado(false);
        grupo?.aoFocar(false);
        // Só avisa quando o texto MUDOU: emitir o mesmo valor a cada saída de foco faria o app
        // re-renderizar sem motivo, e num formulário de dez campos isso é dez renders por
        // preenchimento. Mesma guarda da web (`inputs-client.tsx:194`).
        if (formatOnBlur && value != null) {
          const formatado = formatOnBlur(value);
          if (formatado !== value) onChangeText?.(formatado);
        }
        onBlur?.();
      }}
      // O nome e a dica vêm do `Field` — ver o bloco acima sobre por que a ligação da web não
      // atravessa. Sem isto, o campo é um nó anônimo para o leitor de tela.
      accessibilityLabel={campo?.label}
      accessibilityHint={campo?.hint}
      accessibilityState={{disabled: !!inativo}}
      aria-invalid={campo?.invalido}
      style={[
        // DENTRO DE UM GRUPO o campo não desenha caixa nenhuma: borda, fundo, altura, respiro,
        // inválido, foco e desabilitado passam a ser do grupo. Manter qualquer um dos dois
        // desenhando daria borda dentro de borda — que é exatamente o defeito que o `.input-group
        // > .input` da web zera à mão (`aurea.css:751`).
        grupo ? s.campoNoGrupo : s.caixa,
        grupo
          ? {fontSize: fonteDoTamanho(t, tam), fontFamily: t.font.ui[400], color: t.color.foreground}
          : {height: alturaDoTamanho(t, tam), paddingHorizontal: respiroDoTamanho(t, tam),
         fontSize: fonteDoTamanho(t, tam), fontFamily: t.font.ui[400], color: t.color.foreground,
         // ⚠ AS DUAS LINHAS ABAIXO NÃO SÃO ENFEITE — sem elas o texto sobe e é CORTADO no
         // Android, e foi assim que este campo chegou ao vidro em 09/09/2026.
         //
         // `padding-block:0` é LITERAL na web (`aurea.css:685`) e não atravessou. No RN a falta
         // dele não é "sem padding": o `AndroidTextInputComponentDescriptor.h:101-107` INJETA o
         // padding do tema do Android no nó do Yoga sempre que as props não trazem `padding`,
         // `paddingTop`/`paddingBottom` nem `paddingVertical` — e o `hasPaddingVertical` é
         // exatamente o que desliga a injeção. Com `height` fixa, esse padding come a altura por
         // dentro e a caixa de texto fica menor que a linha: daí o corte.
         //
         // O `textAlignVertical` é o outro lado da mesma conta. Na web, um campo com
         // `block-size` centraliza a linha sozinho; no Android o `setTextAlignVertical` do
         // `ReactTextInputManager.kt:571` traduz `null`/`auto` para `Gravity.NO_GRAVITY`, que
         // deixa o `EditText` no topo. `center` é o que reproduz a web — e o `Textarea` o
         // sobrescreve para `top`, que é o que uma caixa alta faz nos dois lados.
         paddingVertical: 0, textAlignVertical: "center"},
        !grupo && campo?.invalido && s.invalido,
        // O foco é o único estado que sobra do trio da web (hover/focus/active), e ele importa
        // mais aqui: no telefone é a única pista de qual campo o teclado está alimentando.
        !grupo && focado && {borderColor: t.color.focusStrong},
        // 🔴 DENTRO DO CARTÃO DA MARCA A TINTA VENCE TUDO — inclusive inválido e foco, e isso é
        // medição, não preferência (os números estão no `usePeleSobreAMarca`): sobre o amarelo a
        // borda de inválido mede **1,86** e o `focusStrong` do tema ESCURO mede **1,00**, porque
        // lá ele É o amarelo. Deixá-los vencer apagaria o campo justamente quando ele mais
        // precisa ser achado.
        peleDaMarca && {color: peleDaMarca.color},
        !grupo && peleDaMarca,
        // E o foco continua existindo, por ESPESSURA em vez de cor — a única pista que sobra
        // quando só há uma tinta. O dobro da borda do token, não número novo.
        !grupo && peleDaMarca && focado && {borderWidth: t.size.borderWidth * 2},
        !grupo && inativo && s.desabilitado,
        style,
      ]}
    />
  );
}

export interface TextareaProps extends InputProps {
  /** Linhas visíveis. Vira altura mínima, porque no RN não há `rows`. */
  rows?: number;
}

/** A caixa alta. Mesmo campo, `multiline`, raio LG e altura mínima de 104 (medida no CSS). */
export function Textarea({rows, size, style, ...rest}: TextareaProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const campo = useCampo();
  const tam = size ?? campo?.size ?? "md";
  return (
    <Input
      {...rest}
      size={tam}
      style={[
        s.areaDeTexto,
        // `rows` não existe no RN; a conta é a do CSS para os tamanhos alternativos
        // (`aurea.css:836`: `min-block-size: calc(--step-h * 3)`).
        rows != null && {minHeight: alturaDoTamanho(t, tam) * rows},
        {height: undefined, textAlignVertical: "top"},
        style,
      ]}
      multiline
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Checkbox e Radio — o mesmo desenho, duas semânticas
// ─────────────────────────────────────────────────────────────────────────────────────────────

interface ControleProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  size?: AureaFieldSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /**
   * O nome para quem usa leitor de tela, quando ele NÃO deve aparecer escrito no controle.
   *
   * É o caso de uma linha de `NavList`: o nome já está na linha, então repeti-lo no `label` o
   * escreveria duas vezes — e omitir os dois deixaria o controle **MUDO** para o leitor de tela.
   * Ele vence o `label` quando os dois vêm.
   */
  accessibilityLabel?: string;
}

export interface InputGroupProps extends ViewProps {
  /** O degrau do sistema. Cai no `Field` em volta quando não vem, como no `Input`. */
  size?: AureaFieldSize;
  disabled?: boolean;
  testID?: string;
}

/**
 * A caixa de campo que aceita coisas dentro — glifo na frente, botão atrás, os dois.
 *
 *     <InputGroup>
 *       <InputGroupAddon><Icon name="email" size="sm" /></InputGroupAddon>
 *       <Input value={email} onChangeText={setEmail} keyboardType="email-address" />
 *     </InputGroup>
 *
 * ⚠ **O `Input` lá dentro para de desenhar a própria caixa** — quem desenha borda, fundo, altura,
 * foco e inválido passa a ser o grupo. Isso é automático: o campo enxerga o grupo por contexto.
 */
export function InputGroup({size, disabled, children, style, testID, ...rest}: InputGroupProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const peleDaMarca = usePeleSobreAMarca();
  const campo = useCampo();
  const tam = size ?? campo?.size ?? "md";
  const inativo = disabled ?? campo?.disabled ?? false;
  const [focado, setFocado] = React.useState(false);

  // O contexto muda de identidade a cada render se for objeto literal, e isso re-renderiza todo
  // campo de todo formulário a cada tecla. Mesma memoização do `Field`.
  const ctx = React.useMemo<ContextoDeGrupo>(
    () => ({size: tam, disabled: inativo, aoFocar: setFocado}),
    [tam, inativo],
  );

  return (
    <View
      testID={testID}
      style={[
        s.grupo,
        {height: alturaDoTamanho(t, tam), paddingHorizontal: respiroDoTamanho(t, tam)},
        campo?.invalido && s.invalido,
        // O foco vem do campo lá dentro, por contexto: no React Native não existe `:focus-within`,
        // e sem isto a única pista de qual campo o teclado alimenta sumiria ao entrar num grupo.
        focado && {borderColor: t.color.focusStrong},
        // Sobre a marca a tinta vence inválido e foco — ver `usePeleSobreAMarca`.
        peleDaMarca,
        peleDaMarca && focado && {borderWidth: t.size.borderWidth * 2},
        inativo && s.desabilitado,
        style,
      ]}
      {...rest}>
      <GrupoDeCampo.Provider value={ctx}>{children}</GrupoDeCampo.Provider>
    </View>
  );
}

export interface InputGroupAddonProps extends ViewProps {
  testID?: string;
}

/**
 * Um encaixe dentro do `InputGroup`. **A posição é a do JSX** — antes do campo fica na frente,
 * depois fica atrás. Não há prop de lado, e o porquê está no bloco do grupo lá em cima.
 */
export function InputGroupAddon({children, style, testID, ...rest}: InputGroupAddonProps) {
  const t = useAureaTokens();
  const s = folha(t);
  return <View testID={testID} style={[s.encaixe, style]} {...rest}>{children}</View>;
}

/**
 * O campo de senha, com o botão que mostra e esconde.
 *
 *     <Field label="Senha"><PasswordField value={senha} onChangeText={setSenha} /></Field>
 *
 * ⚠ **`secureTextEntry` não entra**: um campo de senha que aceitasse essa prop deixaria de ser
 * um. É a mesma razão pela qual o `type` não atravessa no `PasswordField` da web.
 *
 * ⚠ **O rótulo do botão é o anúncio do estado** — ele troca entre "Mostrar senha" e "Ocultar
 * senha". Não há estado de pressionado junto, e isso é decisão copiada da web: com os dois, o
 * leitor de tela lê a mesma informação duas vezes.
 *
 * ⚠ **`autoCapitalize` nasce em `none`.** No Android o teclado maiúsculiza a primeira letra por
 * padrão, e numa senha isso é o erro de digitação mais caro que existe: o campo está escondido,
 * então ninguém vê o que deu errado.
 */
export interface PasswordFieldProps extends Omit<InputProps, "secureTextEntry" | "multiline" | "keyboardType"> {
  /** Começa visível. Padrão: escondida. */
  defaultVisible?: boolean;
  /**
   * Um desenho na FRENTE do campo — o cadeado, quase sempre.
   *
   * ⚠ **Faltava na `0.8.2`, e a falta era de desenho meu:** o `PasswordField` monta o grupo por
   * dentro, então não havia onde encaixar nada antes do campo. Quem quisesse um cadeado teria de
   * desmontar a peça e remontar à mão, perdendo o olho, o rótulo que anuncia o estado e o
   * `autoCapitalize` que nasce em `none`.
   *
   *     <PasswordField leading={<Icon name="locked" size="sm" />} … />
   */
  leading?: React.ReactNode;
  /**
   * O registro de glifos, quando o do `AureaProvider` não tem os dois que este componente usa.
   *
   * 🔴 **ELE PRECISA DE DOIS ÍCONES, e isto não estava escrito em lugar nenhum — defeito da
   * `0.8.2`:** o olho é `view` e `view--off`. Se faltarem no registro, **o botão fica invisível**
   * e o aviso sai só em desenvolvimento: em produção a pessoa simplesmente não consegue ver a
   * senha que digitou, sem nada na tela explicando.
   *
   *     import Olho from "@aurea-uds/native/icons/view";
   *     import OlhoOff from "@aurea-uds/native/icons/view--off";
   *     const ICONES = criarRegistroDeIcones({view: Olho, "view--off": OlhoOff});
   *     // no provider, junto dos outros — ou aqui: <PasswordField icons={ICONES} />
   */
  icons?: AureaIconRegistry;
}
export function PasswordField({
  defaultVisible = false, size, disabled, autoCapitalize = "none", leading, icons, testID, style,
  ...rest
}: PasswordFieldProps) {
  const strings = useAureaStrings();
  const campo = useCampo();
  const [visivel, setVisivel] = React.useState(defaultVisible);
  const tam = size ?? campo?.size ?? "md";
  const inativo = disabled ?? campo?.disabled;

  return (
    <InputGroup size={tam} disabled={inativo} testID={testID}>
      {leading ? <InputGroupAddon>{leading}</InputGroupAddon> : null}
      <Input
        {...rest}
        size={tam}
        disabled={inativo}
        autoCapitalize={autoCapitalize}
        secureTextEntry={!visivel}
        style={style}
        testID={testID ? `${testID}-campo` : undefined}
      />
      <InputGroupAddon>
        <IconButton
          name={visivel ? "view--off" : "view"}
          label={visivel ? strings.passwordHide : strings.passwordShow}
          appearance="ghost"
          size={tam === "lg" ? "md" : "sm"}
          disabled={inativo}
          icons={icons}
          onPress={() => setVisivel(v => !v)}
          testID={testID ? `${testID}-olho` : undefined}
        />
      </InputGroupAddon>
    </InputGroup>
  );
}

export type CheckboxProps = ControleProps;
export type RadioProps = ControleProps;

function ControleMarcado({
  papel, label, description, checked, onChange, disabled, size, style, testID, accessibilityLabel,
}: ControleProps & {papel: "checkbox" | "radio"}) {
  const t = useAureaTokens();
  const s = folha(t);
  const campo = useCampo();
  const tam = size ?? campo?.size ?? "md";
  const inativo = disabled ?? campo?.disabled;
  // Mesma conta do `Switch`, pela mesma razão: sem texto, a coluna vazia com `flex: 1` tomaria a
  // largura que sobra dentro de uma fileira e apagaria o que estivesse ao lado.
  const temTexto = label != null || description != null;
  // A marca é METADE da altura do controle — `aurea.css:871`, e é o que faz ela crescer junto
  // com a densidade sem token próprio.
  const lado = alturaDoTamanho(t, tam) / 2;

  return (
    <Pressable
      testID={testID}
      onPress={inativo ? undefined : () => onChange?.(!checked)}
      disabled={inativo}
      accessibilityRole={papel}
      accessibilityState={{checked: !!checked, disabled: !!inativo}}
      // ⚠ O `accessibilityLabel` de fora vence o `label` escrito, e existe para o caso em que o
      // nome JÁ está na tela ao lado — uma linha de `NavList`, por exemplo. Sem ele, ou o nome
      // aparece escrito duas vezes, ou o controle sobe MUDO para quem usa leitor de tela.
      accessibilityLabel={accessibilityLabel ?? (typeof label === "string" ? label : campo?.label)}
      accessibilityHint={typeof description === "string" ? description : campo?.hint}
      style={[s.linhaDeControle, inativo && s.desabilitado, style]}>
      <View style={[
        s.marcaBase,
        {width: lado, height: lado,
         borderRadius: papel === "radio" ? t.size.radiusFull : 5},
        checked && {backgroundColor: t.color.controlSelected, borderColor: t.color.controlSelected},
      ]}>
        {checked && (papel === "radio"
          // O ponto do rádio é 8×8 e da cor SELECIONADA, não da cor de primeiro plano — no CSS
          // ele é `background: var(--control-selected)` sobre a marca já pintada.
          ? <View style={{width: 8, height: 8, borderRadius: t.size.radiusFull,
                          backgroundColor: t.color.controlSelectedForeground}} />
          // O visto da web é desenhado com DUAS BORDAS de um retângulo 8×4 girado −45°. Isso
          // atravessa inteiro: `transform: rotate` e `borderLeftWidth`/`borderBottomWidth`
          // existem no RN. Desenhá-lo assim, em vez de trazer um glifo, mantém a peça sem
          // depender do registro de ícones do app.
          : <View style={{
              width: 8, height: 4, marginTop: -2,
              borderLeftWidth: 2, borderBottomWidth: 2,
              borderColor: t.color.controlSelectedForeground,
              transform: [{rotate: "-45deg"}],
            }} />)}
      </View>
      {temTexto && (
        <View style={{flex: 1}}>
          {typeof label === "string" ? <Text size="sm">{label}</Text> : label}
          {description != null && (typeof description === "string"
            ? <Text size="xs" tone="muted">{description}</Text> : description)}
        </View>
      )}
    </Pressable>
  );
}

/** A caixa que marca. `accessibilityRole="checkbox"` + `state.checked`. */
export function Checkbox(p: CheckboxProps) { return <ControleMarcado {...p} papel="checkbox" />; }

/**
 * O círculo que escolhe **um de vários**.
 *
 * ⚠ **Não há prop `name`.** Na web ela agrupa os rádios pelo DOM; aqui o agrupamento é do
 * estado do app — quem sabe qual está escolhido é o `useState` da tela, e `checked` sai dele.
 */
export function Radio(p: RadioProps) { return <ControleMarcado {...p} papel="radio" />; }

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Switch
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * ⚠ **Ele TIRAVA a `description`, e passou a aceitá-la em 17/09/2026** — pedido do consumidor
 * (uma linha de explicação embaixo de "Desbloqueio por digital", no Perfil).
 *
 * ⚠ **E isto é uma frente em que o nativo vai ADIANTE da web, não atrás — declarado, não
 * escondido.** Medido em `packages/react/src/markup.tsx`: lá o `Checkbox` tem `description`, o
 * `Radio` **não**, e o `Switch` **não**. Aqui os três têm. A dívida passa a ser da web, e quem
 * mexer nela deve fechar a diferença em vez de reabrir esta.
 */
export interface SwitchProps extends ControleProps {}

/**
 * O interruptor.
 *
 * ⚠ **NÃO é o `Switch` do React Native**, pela mesma razão que o `Spinner` não é o
 * `ActivityIndicator`: aquele desenha o interruptor do Material no Android e o do iOS no iOS —
 * duas aparências que o `CLAUDE.md` proíbe em voz alta. As medidas aqui são as do CSS: trilho de
 * `altura × 7/6` por `altura × 2/3`, polegar com 3 de folga.
 *
 * ⚠ **E ele respeita "menos movimento"**: com a preferência ligada, o polegar salta em vez de
 * deslizar. O estado continua o mesmo — o que some é a animação, não a informação.
 */
export function Switch({
  label, description, checked, onChange, disabled, size, style, testID, accessibilityLabel,
}: SwitchProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const campo = useCampo();
  const tam = size ?? campo?.size ?? "md";
  const inativo = disabled ?? campo?.disabled;
  const reduzir = useReduceMotion();
  const temTexto = label != null || description != null;

  const h = alturaDoTamanho(t, tam);
  const larguraDoTrilho = h * 7 / 6;
  const alturaDoTrilho = h * 2 / 3;
  const ladoDoPolegar = alturaDoTrilho - t.size.space1 - t.size.space05;
  const curso = larguraDoTrilho - ladoDoPolegar - 6;

  const pos = React.useRef(new Animated.Value(checked ? 1 : 0)).current;
  React.useEffect(() => {
    const destino = checked ? 1 : 0;
    if (reduzir === true) { pos.setValue(destino); return; }
    if (reduzir === null) return;
    const a = Animated.timing(pos, {toValue: destino, duration: 160, useNativeDriver: true});
    a.start();
    return () => a.stop();
  }, [checked, pos, reduzir]);

  return (
    <Pressable
      testID={testID}
      onPress={inativo ? undefined : () => onChange?.(!checked)}
      disabled={inativo}
      accessibilityRole="switch"
      accessibilityState={{checked: !!checked, disabled: !!inativo}}
      // O `accessibilityLabel` de fora vence o `label` escrito — ver a prop, em `ControleProps`.
      accessibilityLabel={accessibilityLabel ?? (typeof label === "string" ? label : campo?.label)}
      // Mesma regra do `ControleMarcado`: a descrição vira DICA quando é texto. Sem isto ela
      // desenha na tela e não existe para quem usa leitor de tela.
      accessibilityHint={typeof description === "string" ? description : campo?.hint}
      // 🔴 SEM RÓTULO E SEM DESCRIÇÃO, A RAIZ É O TRILHO E MAIS NADA — e isto é conserto de um
      // defeito que só aparece no ANDROID, achado pelo consumidor em 19/09/2026.
      //
      // A coluna de texto abaixo tem `flex: 1` e existia mesmo vazia. Dentro de uma fileira — uma
      // linha de `NavList`, onde o valor-componente é IRMÃO do miolo (`navigation.tsx:248`) — esse
      // `flex: 1` faz a raiz do `Switch` tomar toda a largura que sobra. O miolo, que também tem
      // `flex: 1`, encolhe até restar só o ícone, e o NOME DA LINHA SOME.
      //
      // ⚠ **No navegador o defeito não aparece**, porque lá a divisão de espaço entre dois
      // irmãos com `flex:1` parte da largura do conteúdo. É a mesma família do `padding-block` do
      // `Input`: o que a cascata resolve de graça, aqui é conta explícita.
      style={[
        {flexDirection: "row", alignItems: "center"},
        temTexto && {gap: 10},
        inativo && s.desabilitado, style,
      ]}>
      <View style={[
        s.trilho,
        {width: larguraDoTrilho, height: alturaDoTrilho},
        checked && {backgroundColor: t.color.controlSelected, borderColor: t.color.controlSelected},
      ]}>
        <Animated.View style={[
          s.polegar,
          {width: ladoDoPolegar, height: ladoDoPolegar,
           backgroundColor: checked ? t.color.controlSelectedForeground : t.color.mutedForeground,
           transform: [{translateX: pos.interpolate({inputRange: [0, 1], outputRange: [0, curso]})}]},
        ]} />
      </View>
      {/* O MESMO desenho do `ControleMarcado` acima — coluna com rótulo e, embaixo, a linha
          esmaecida. Copiar a forma e não inventar outra é o que faz os três controles lerem
          igual; `flex: 1` para o texto usar o que sobra da largura.
          ⚠ E ela só existe QUANDO HÁ TEXTO — ver o comentário grande na raiz. */}
      {temTexto && (
        <View style={{flex: 1}}>
          {typeof label === "string" ? <Text size="sm">{label}</Text> : label}
          {description != null && (typeof description === "string"
            ? <Text size="xs" tone="muted">{description}</Text> : description)}
        </View>
      )}
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// SegmentedControl
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface SegmentedControlProps extends ViewProps {
  items: Array<{value: string; label: React.ReactNode}>;
  value?: string;
  onChange?: (v: string) => void;
  /** Nome do grupo para o leitor de tela. */
  label?: string;
  disabled?: boolean;
}

/**
 * Um de poucos, lado a lado.
 *
 * É um dos **dois** componentes deste lote que declaram motor Base UI na web
 * (`@base-ui/react/radio-group`), e o que o motor entrega lá são as **setas do teclado**. **Não
 * há teclado aqui**, então o que resta é o que já se faz à mão: papel de grupo de rádio, um
 * `radio` por segmento, e o estado `selected` em quem está escolhido.
 */
export function SegmentedControl({
  items, value, onChange, label, disabled, style, ...rest
}: SegmentedControlProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const campo = useCampo();
  const inativo = disabled ?? campo?.disabled;
  return (
    // 🔴 ELE NÃO ROLAVA, E ISSO NÃO ERA ESCOLHA — ERA TRADUÇÃO QUE FALTOU.
    // O consumidor mediu em 17/09/2026: seis tipos de manutenção não cabem numa tela de 360dp, e
    // o filtro por veículo cresce sem limite. **A web já resolvia isso**, e a linha está lá:
    //     aurea.css:2127, em tela de até 640px:
    //     .tabs,.pagination,.segmented { max-width:100%; overflow-x:auto; }
    // ⚠ **A primeira resposta que eu ia dar era criar um componente de "chips"** — e abrir a
    // referência máxima desmontou isso: o `chip` de lá é um RÓTULO, sem estado de escolha. Um
    // terceiro jeito de escolher seria inventar o que já existe.
    // O sinal de "tem mais" e a razão de não usar borda esmaecida estão no `rolagem.tsx`.
    // ⚠ A opacidade de desabilitado fica SÓ na cápsula. Pô-la aqui também multiplicaria
    // 0,5 por 0,5 — o controle sumiria em vez de esmaecer.
    <FilaRolante>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label ?? campo?.label}
        style={[s.segmentada, inativo && s.desabilitado, style]}
        {...rest}>
        {items.map((it) => {
          const ativo = it.value === value;
          return (
            <Pressable
              key={it.value}
              onPress={inativo ? undefined : () => onChange?.(it.value)}
              disabled={inativo}
              accessibilityRole="radio"
              accessibilityState={{checked: ativo, disabled: !!inativo}}
              accessibilityLabel={typeof it.label === "string" ? it.label : undefined}
              style={[s.segmento, ativo && s.segmentoAtivo]}>
            {typeof it.label === "string"
              ? <Text size="sm" weight={ativo ? 600 : 400}
                      // 🔴 ERA `foreground`, E ISSO QUEBRAVA A LINGUAGEM DE SELECIONADO.
                      // Achado pelo consumidor em 17/09/2026. A web pinta o escolhido com a
                      // MARCA (`aurea.css:937-938`), e o comentário de cima daquela regra diz
                      // que nav ativo, aba ativa, item de lista e botão ligado mostram o mesmo
                      // sinal — ordem do Victor, 24/07. O `SegmentedControl` daqui discordava
                      // da web **e do `BottomNav` deste mesmo pacote**, que já usa este token.
                      //
                      // ⚠ **`primaryEmphasis` e NÃO `primary`, e a razão está no CSS:** *"sem
                      // fundo, a marca vira TEXTO, e o amarelo puro"* não se lê no claro
                      // (`aurea.css:358`). É a mesma lição que a `0.8.3` pagou no `Button`.
                      // No escuro os dois valem o mesmo amarelo; no claro este aprofunda.
                      //
                      // ⚠ **Uma divergência declarada, não escondida:** para o `.segmented` a
                      // web usa uma mistura própria (`primary 45% + foreground`) em vez do
                      // token, enquanto para o `.bottom-nav` usa o token. São dois âmbares
                      // parecidos para a MESMA linguagem, e isso é incoerência DA WEB. Escolhi
                      // o token, que deixa os dois componentes daqui iguais entre si.
                      style={{color: ativo ? t.color.primaryEmphasis : t.color.mutedForeground}}>
                  {it.label}
                </Text>
              : it.label}
            {ativo && <View style={s.fioDoSegmento} />}
          </Pressable>
          );
        })}
      </View>
    </FilaRolante>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Select — o "motor novo sobre `Modal`" que a §5.2.4 previu
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface SelectProps {
  items: Array<{value: string; label: string; disabled?: boolean}>;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: AureaFieldSize;
  /** O glifo da seta. Registre-o, ou passe `false`. */
  chevron?: IconName | false;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A escolha de um de muitos.
 *
 * ⚠ **Não existe `<select>` no React Native**, e é aqui que a §5.2.4 acertou a previsão: *"decisão
 * de motor nova, componente a componente, sobre `Modal`/`Pressable`/`AccessibilityInfo` do próprio
 * RN"*. O gatilho parece o `.input` da web (mesma altura, mesma borda, a mesma seta à direita); a
 * lista é uma folha que sobe de baixo, que é o idioma do telefone — um menu suspenso do tamanho de
 * um `<select>` de desktop seria intocável com o polegar.
 *
 * ⚠ **O papel é `button` e não `combobox`.** `combobox` promete um campo em que se DIGITA para
 * filtrar; isto só abre uma lista. Prometer o que não se faz é o mesmo defeito do `tablist` no
 * Lote 3.
 *
 * ⚠ **Quem DIGITA para filtrar é o `Combobox`** (Lote 7, `busca.tsx`), e ele nasceu desta
 * lacuna — o consumidor bateu nela no cadastro. **A escolha entre os dois é de tamanho de
 * lista, e a linha é dura:** este monta todos os itens num `ScrollView` (abaixo), o que serve
 * para unidades, estados e tipos; um catálogo de milhares de linhas aqui não fica lento, trava.
 * O `Combobox` usa `FlatList` e aceita busca remota.
 */
export function Select({
  items, value, onChange, placeholder, disabled, size, chevron = "chevron--down", style, testID,
}: SelectProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const peleDaMarca = usePeleSobreAMarca();
  const campo = useCampo();
  const tam = size ?? campo?.size ?? "md";
  const inativo = disabled ?? campo?.disabled;
  const [aberto, setAberto] = React.useState(false);
  const escolhido = items.find((i) => i.value === value);

  return (
    <>
      <Pressable
        testID={testID}
        onPress={inativo ? undefined : () => setAberto(true)}
        disabled={inativo}
        accessibilityRole="button"
        accessibilityLabel={campo?.label}
        accessibilityHint={campo?.hint}
        accessibilityValue={{text: escolhido?.label}}
        accessibilityState={{disabled: !!inativo, expanded: aberto}}
        style={[
          s.caixa,
          {flexDirection: "row", alignItems: "center", justifyContent: "space-between",
           height: alturaDoTamanho(t, tam), paddingHorizontal: respiroDoTamanho(t, tam)},
          campo?.invalido && s.invalido,
          // Sobre a marca a tinta vence inválido — ver `usePeleSobreAMarca`.
          peleDaMarca,
          inativo && s.desabilitado,
          style,
        ]}>
        <Text size={tam === "sm" ? "xs" : tam === "lg" ? "base" : "md"}
              tone={escolhido ? "default" : "subtle"} numberOfLines={1}>
          {escolhido?.label ?? placeholder ?? ""}
        </Text>
        {chevron && <Icon name={chevron} size="sm" color={peleDaMarca?.color ?? t.color.subtleForeground} />}
      </Pressable>

      <ForaDaMarca>
      <Modal visible={aberto} transparent animationType="slide"
             onRequestClose={() => setAberto(false)}>
        {/* O toque fora fecha — é o que a pessoa espera de uma folha, e o `onRequestClose` acima
            é o BOTÃO VOLTAR do Android, que sem isso deixaria a folha presa. */}
        <View style={s.fundoDaLista}>
          {/* 🔴 O FUNDO TOCÁVEL É IRMÃO, NÃO ANCESTRAL — ver o comentário abaixo. */}
          <Pressable style={s.fundoDeToque} onPress={() => setAberto(false)} accessible={false} />
          {/* ⚠ `onStartShouldSetResponder` NÃO é enfeite, e este era um DEFEITO: um `View` sem
              manipulador não vira responder, então o toque atravessava para o `Pressable` de
              cima e **tocar no corpo da folha a fechava**. Achado ao escrever os overlays do
              Lote 5, que têm a mesma forma — e a regra do `CLAUDE.md` ("correção local é
              proibida sem responder quem mais tem esse problema") trouxe a correção até aqui. */}
          <View style={s.lista} onStartShouldSetResponder={() => true}>
            <ScrollView>
              {items.map((it) => (
                <Pressable
                  key={it.value}
                  disabled={it.disabled}
                  onPress={() => { onChange?.(it.value); setAberto(false); }}
                  accessibilityRole="menuitem"
                  accessibilityState={{selected: it.value === value, disabled: !!it.disabled}}
                  style={[s.opcao, it.disabled && s.desabilitado]}>
                  <Text size="md" weight={it.value === value ? 600 : 400}>{it.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      </ForaDaMarca>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Form
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface FormProps extends ViewProps {
  children?: React.ReactNode;
}

/**
 * A pilha de campos, com o respiro do `--space-5`.
 *
 * ⚠ **Ele é MUITO menos do que o `Form` da web, e de propósito.** Lá ele é `@base-ui/react`: mapa
 * de erros por nome de campo, submissão nativa do `<form>`, validação do navegador. **Nada disso
 * existe no React Native** — não há `<form>`, não há `submit`, não há validação de plataforma. O
 * que sobra é o espaçamento, e o `Field` já leva o erro de cada campo pelo `error`.
 *
 * Fingir a API da web aqui criaria um `onSubmit` que nada dispara e um `errors` que ninguém lê.
 */
export function Form({children, style, ...rest}: FormProps) {
  const s = folha(useAureaTokens());
  return <View style={[s.formulario, style]} {...rest}>{children}</View>;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// KeyboardAvoidingView
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface KeyboardAvoidingProps extends ViewProps {
  children?: React.ReactNode;
  /** Deslocamento extra no topo — a altura de um `Topbar`, por exemplo. */
  offset?: number;
}

/**
 * A casca que levanta o formulário quando o teclado sobe.
 *
 * ⚠ **É a peça mais chata deste lote, e a razão é que o comportamento certo DIFERE por
 * plataforma** — está na documentação do próprio React Native e é medido, não folclore:
 *
 *     iOS      -> `padding`  · a janela não encolhe; é preciso empurrar o conteúdo
 *     Android  -> `height`   · o sistema já redimensiona a janela com `adjustResize`
 *
 * Um `behavior` só nos dois lados deixa metade dos aparelhos com o botão de salvar embaixo do
 * teclado — e é exatamente o formulário de uma tela do consumidor (§5.1), com teclado numérico
 * aberto, que morde primeiro.
 *
 * ⚠ **Não é dependência nova:** o `KeyboardAvoidingView` é do próprio React Native. O que a Aurea
 * acrescenta é a escolha de `behavior` por plataforma, para o app não ter de saber disso.
 */
export function KeyboardAvoiding({children, offset, style, ...rest}: KeyboardAvoidingProps) {
  return (
    <KeyboardAvoidingViewRN
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={offset}
      style={[{flex: 1}, style]}
      {...rest}>
      {children}
    </KeyboardAvoidingViewRN>
  );
}
