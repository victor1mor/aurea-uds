import * as React from "react";
import { TextInput, type KeyboardTypeOptions, type StyleProp, type TextInputProps, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type AureaFilaJustify } from "./rolagem.js";
import { type AureaIconRegistry, type IconName } from "./icon.js";
export type AureaFieldSize = "sm" | "md" | "lg";
type ContextoDeCampo = {
    label?: string;
    hint?: string;
    invalido: boolean;
    disabled?: boolean;
    size: AureaFieldSize;
};
/** O que os controles leem do `Field` acima deles. Público porque um controle novo vai precisar. */
export declare function useCampo(): ContextoDeCampo | null;
interface ContextoDeGrupo {
    size: AureaFieldSize;
    disabled: boolean;
    /** O campo avisa o grupo quando ganha e perde o foco — no RN não existe `:focus-within`. */
    aoFocar: (v: boolean) => void;
}
/** O grupo em volta do campo, quando existe um. `null` quando o campo está sozinho. */
export declare function useGrupoDeCampo(): ContextoDeGrupo | null;
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
export declare function Field({ label, hint, error, disabled, size, children, style, ...rest }: FieldProps): React.JSX.Element;
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
export declare function Label({ children, trailing, style, ...rest }: LabelProps): React.JSX.Element;
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
export interface InputProps extends Omit<TextInputProps, "style" | "editable" | "placeholderTextColor" | "onBlur" | "onFocus" | "accessibilityLabel" | "accessibilityHint" | "accessibilityState"> {
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
export declare function Input({ value, defaultValue, onChangeText, placeholder, disabled, size, keyboardType, secureTextEntry, autoCapitalize, formatOnBlur, onBlur, onFocus, multiline, style, testID, ...rest }: InputProps): React.JSX.Element;
export interface TextareaProps extends InputProps {
    /** Linhas visíveis. Vira altura mínima, porque no RN não há `rows`. */
    rows?: number;
}
/** A caixa alta. Mesmo campo, `multiline`, raio LG e altura mínima de 104 (medida no CSS). */
export declare function Textarea({ rows, size, style, ...rest }: TextareaProps): React.JSX.Element;
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
     * Onde a marca fica na altura do texto — E5, 25/09/2026. `center` (o padrão) põe a marca no meio
     * do bloco, como o HeroUI Native (`radio.css` e `control-field.css`: `align-items: center`).
     * `start` a põe no meio da PRIMEIRA linha, para rótulo longo, de várias linhas.
     */
    align?: "center" | "start";
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
export declare function InputGroup({ size, disabled, children, style, testID, ...rest }: InputGroupProps): React.JSX.Element;
export interface InputGroupAddonProps extends ViewProps {
    testID?: string;
}
/**
 * Um encaixe dentro do `InputGroup`. **A posição é a do JSX** — antes do campo fica na frente,
 * depois fica atrás. Não há prop de lado, e o porquê está no bloco do grupo lá em cima.
 */
export declare function InputGroupAddon({ children, style, testID, ...rest }: InputGroupAddonProps): React.JSX.Element;
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
export declare function PasswordField({ defaultVisible, size, disabled, autoCapitalize, leading, icons, testID, style, ...rest }: PasswordFieldProps): React.JSX.Element;
export type CheckboxProps = ControleProps;
export type RadioProps = ControleProps;
/** A caixa que marca. `accessibilityRole="checkbox"` + `state.checked`. */
export declare function Checkbox(p: CheckboxProps): React.JSX.Element;
/**
 * O círculo que escolhe **um de vários**.
 *
 * ⚠ **Não há prop `name`.** Na web ela agrupa os rádios pelo DOM; aqui o agrupamento é do
 * estado do app — quem sabe qual está escolhido é o `useState` da tela, e `checked` sai dele.
 */
export declare function Radio(p: RadioProps): React.JSX.Element;
/**
 * ⚠ **Ele TIRAVA a `description`, e passou a aceitá-la em 17/09/2026** — pedido do consumidor
 * (uma linha de explicação embaixo de "Desbloqueio por digital", no Perfil).
 *
 * ⚠ **E isto é uma frente em que o nativo vai ADIANTE da web, não atrás — declarado, não
 * escondido.** Medido em `packages/react/src/markup.tsx`: lá o `Checkbox` tem `description`, o
 * `Radio` **não**, e o `Switch` **não**. Aqui os três têm. A dívida passa a ser da web, e quem
 * mexer nela deve fechar a diferença em vez de reabrir esta.
 */
export interface SwitchProps extends ControleProps {
}
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
export declare function Switch({ label, description, checked, onChange, disabled, size, style, testID, accessibilityLabel, }: SwitchProps): React.JSX.Element;
export interface SegmentedControlProps extends ViewProps {
    items: Array<{
        value: string;
        label: React.ReactNode;
    }>;
    value?: string;
    onChange?: (v: string) => void;
    /** Nome do grupo para o leitor de tela. */
    label?: string;
    disabled?: boolean;
    /** Onde o controle fica quando cabe na linha: `start` (padrão), `center` ou `end` (E3). */
    justify?: AureaFilaJustify;
}
/**
 * Um de poucos, lado a lado.
 *
 * É um dos **dois** componentes deste lote que declaram motor Base UI na web
 * (`@base-ui/react/radio-group`), e o que o motor entrega lá são as **setas do teclado**. **Não
 * há teclado aqui**, então o que resta é o que já se faz à mão: papel de grupo de rádio, um
 * `radio` por segmento, e o estado `selected` em quem está escolhido.
 */
export declare function SegmentedControl({ items, value, onChange, label, disabled, justify, style, ...rest }: SegmentedControlProps): React.JSX.Element;
export interface SelectProps {
    items: Array<{
        value: string;
        label: string;
        disabled?: boolean;
    }>;
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
export declare function Select({ items, value, onChange, placeholder, disabled, size, chevron, style, testID, }: SelectProps): React.JSX.Element;
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
export declare function Form({ children, style, ...rest }: FormProps): React.JSX.Element;
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
export declare function KeyboardAvoiding({ children, offset, style, ...rest }: KeyboardAvoidingProps): React.JSX.Element;
export {};
