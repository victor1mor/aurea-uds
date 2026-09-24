// Aurea nativo — o NÚMERO: `NumberField`, e o formatador que a ADR-0024 delegava ao motor.
//
// Lote 7 do `NATIVE.md` §8, segunda das três lacunas medidas pelo consumidor. O `Input` do Lote 4
// tem `keyboardType` e o comentário dele já cita a demanda (`inputs.tsx:232-235`: *"o plano do
// consumidor pede `numeric` nos campos de medida e moeda"*) — mas teclado numérico é a metade
// fácil. **A que faltava é o FORMATO**: moeda, medida decimal e contador.
//
// ── A ADR-0024 ATRAVESSA, E FOI CONFERIDA ANTES DE SE AFIRMAR ISSO ───────────────────────────
// A decisão da web é *"a Aurea entrega o MOMENTO, não o formato"*: formatar no **blur**, nunca
// enquanto se digita. As três medições que a sustentam (o `Input mask` do USWDS publicado com
// reprovação WCAG registrada, o abandono da máscara pelo MUI na v6, a prática de acessibilidade)
// são sobre COMPORTAMENTO HUMANO, não sobre plataforma — então elas valem igual aqui, e não há
// evidência nova que reabra a decisão (`decisions/README.md`).
//
// **A dúvida que a demanda levantou era outra, e estava errada:** *"no nativo não há blur
// equivalente garantido"*. Há. O `TextInput` do RN tem `onBlur` e `onFocus`, o `Input` do Lote 4
// já os expõe (`inputs.tsx:239-240`) e já os liga (`inputs.tsx:278-279`). O blur dispara ao
// perder foco, ao fechar o teclado e ao sair da tela.
//
// **O que MUDA de verdade é quem formata.** Na web, `NumberFieldRoot` do `@base-ui/react` recebe
// `format`/`locale` e chama o `Intl`. **Não há Base UI aqui.** Então a chamada ao `Intl` passa a
// ser nossa — e com ela a volta, que na web ninguém escreveu: **converter de volta o que a pessoa
// digitou**. Isto é o que o arquivo faz.
//
// ── O `Intl` NO MOTOR JS DO RN: o que foi lido, e o que dele NÃO se usa ──────────────────────
// Medido no `doc/IntlAPIs.md` do próprio motor (a fonte, não um blog), em 11/09/2026:
//
//   • `Intl.NumberFormat` com `format` e `resolvedOptions` existe **nos dois sistemas**, e a
//     implementação delega à plataforma — ICU no Android, `NSFormatter` no iOS. Moeda e decimal,
//     que é a demanda, estão cobertos;
//   • `formatToParts` é **só Android**. Por isso este arquivo NÃO o usa para descobrir os
//     separadores — ele os deriva formatando um número-sonda, que funciona onde `format` funciona;
//   • o resultado **varia com a versão do Android**, porque varia o ICU do aparelho. É o preço de
//     não embutir ICU no bundle, e o motor o declara;
//   • abaixo do Android 21 o locale cai para inglês. Fora do alvo deste pacote.
//
// **Três defeitos conhecidos, e a biblioteca fica longe dos três:**
//   `notation: "compact"`   quebrado nos dois (motor#768, motor#1035). **Recusado com aviso em `__DEV__`**;
//   `signDisplay: "always"` com moeda, some o símbolo nos positivos no Android (motor#789);
//   `format()` com STRING   não é lido como decimal (motor#1418). Aqui só entra `number`, nunca texto.
//
// ⚠ **E há a possibilidade de não haver `Intl` nenhum** — o consumidor pode compilar o motor sem
// ele, ou trocar de motor. A queda é declarada e visível (o número cru, com o separador do
// locale), nunca um `R$` inventado à mão: uma moeda formatada errado é pior que uma não
// formatada, porque parece certa.
import * as React from "react";
import {Platform, TextInput, View, type StyleProp, type ViewStyle} from "react-native";
import {IconButton} from "./actions.js";
import {criarFolha} from "./estilos.js";
import {useCampo, type AureaFieldSize} from "./inputs.js";
import {useAureaStrings, useAureaTokens, usePeleSobreAMarca} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

const alturaDoTamanho = (t: AureaTokens, s: AureaFieldSize) =>
  s === "sm" ? t.size.controlHSm : s === "lg" ? t.size.controlHLg : t.size.controlHMd;
const fonteDoTamanho = (t: AureaTokens, s: AureaFieldSize) =>
  s === "sm" ? t.size.textSm : s === "lg" ? t.size.textLg : t.size.textBase;  // ADR-0050: um degrau acima da web

const folha = criarFolha((t: AureaTokens) => ({
  // 🔴 ELE ESTICAVA, E NÃO DEVIA — achado em 12/09/2026, olhando a primeira imagem da vitrine.
  //
  // O `.number-field` da web é `inline-flex` (`aurea.css:704`) e o `.number-field-group` também
  // (`:705`): os dois **ABRAÇAM o conteúdo**. A primeira versão daqui punha `flex: 1` no campo,
  // que PREENCHE — e o resultado é um campo enorme com o `−` e o `+` jogados nas pontas. Era
  // divergência do nosso próprio CSS, entregue sem declarar, e ela só apareceu quando houve
  // imagem para olhar.
  //
  // ⚠ **A saída é o eixo da HeroUI, e não uma invenção minha:** o `number-field` deles publica
  // `fullWidth: [base, false, group, true]` (`INVENTORY-HEROUI.json`, medido em 22/08/2026).
  // Esticar ou abraçar é DECISÃO DE USO, então vira prop — com o padrão em abraçar, que é o que
  // o nosso CSS já dizia.
  grupo: {flexDirection: "row", alignItems: "center", gap: t.size.space1,
          alignSelf: "flex-start"},
  grupoLargo: {alignSelf: "stretch"},
  // `--space-16` = 64dp, medido. É a largura do `.number-field-input` (`aurea.css:706`), e ela
  // serve ao caso que o componente foi feito para: contador e medida curta. **Moeda formatada
  // não cabe em 64dp — nem aqui nem na web**, e é para isso que existe o `fullWidth`.
  campo: {
    width: t.size.space16, textAlign: "center",
    borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
    borderRadius: t.size.radiusControl, backgroundColor: t.color.fieldBg,
    // A mesma correção de Android do `Input` do Lote 4 — ver `inputs.tsx:280-296`.
    paddingVertical: 0, textAlignVertical: "center",
  },
  campoLargo: {width: undefined, flex: 1, minWidth: t.size.space16},
  invalido: {borderColor: t.color.danger400 ?? t.color.destructive},
  desabilitado: {opacity: t.size.opacityDisabled},
}));

// ─────────────────────────────────────────────────────────────────────────────────────────────
// O formatador, e a volta que a web não precisou escrever
// ─────────────────────────────────────────────────────────────────────────────────────────────

const TEM_INTL = (() => {
  try { return typeof Intl !== "undefined" && typeof Intl.NumberFormat === "function"; }
  catch { return false; }
})();

/** Os separadores de um locale, derivados de um número-sonda. */
export type AureaSeparadores = {decimal: string; grupo: string};

// A sonda é `12345.6`: ela tem separador de grupo E casa decimal, então a saída carrega os dois
// em posições conhecidas — o PRIMEIRO não-dígito é o de grupo, o ÚLTIMO é o decimal.
//
//     pt-BR  -> "12.345,6"   grupo "."   decimal ","
//     en-US  -> "12,345.6"   grupo ","   decimal "."
//     fr-FR  -> "12 345,6"   grupo U+202F (espaço estreito), decimal ","
//
// É por isso que a derivação é por SONDA e não por tabela: o espaço estreito do francês é o tipo
// de detalhe que uma tabela escrita à mão erra, e que o `formatToParts` resolveria — se ele
// existisse no iOS.
const SONDA = 12345.6;
const cacheDeSeparadores = new Map<string, AureaSeparadores>();

/** Descobre o separador decimal e o de milhar do locale. Memoizado por locale. */
export function separadoresDoLocale(locale?: string): AureaSeparadores {
  const chave = locale ?? "";
  const guardado = cacheDeSeparadores.get(chave);
  if (guardado) return guardado;

  let achado: AureaSeparadores = {decimal: ".", grupo: ","};
  if (TEM_INTL) {
    try {
      const amostra = new Intl.NumberFormat(locale).format(SONDA);
      const naoDigitos = amostra.replace(/\p{Nd}/gu, "");
      if (naoDigitos.length >= 1) {
        achado = {
          decimal: naoDigitos.slice(-1),
          grupo: naoDigitos.length >= 2 ? naoDigitos.slice(0, 1) : "",
        };
      }
    } catch {
      // Locale inválido, ou `Intl` presente e capenga. O padrão acima é o do `Number.prototype`,
      // que é o que a queda inteira usa.
    }
  }
  cacheDeSeparadores.set(chave, achado);
  return achado;
}

const cacheDeFormatos = new Map<string, Intl.NumberFormat>();

/**
 * Formata um número para EXIBIÇÃO. Nunca para o valor que o app guarda.
 *
 * ⚠ Sem `Intl`, devolve o número cru com o separador decimal do locale — **não** uma moeda
 * montada à mão. Ver a nota no topo do módulo.
 */
export function formatarNumero(
  n: number, locale?: string, format?: Intl.NumberFormatOptions,
): string {
  if (TEM_INTL) {
    const chave = `${locale ?? ""}|${format ? JSON.stringify(format) : ""}`;
    try {
      let f = cacheDeFormatos.get(chave);
      if (!f) { f = new Intl.NumberFormat(locale, format); cacheDeFormatos.set(chave, f); }
      // ⚠ Sempre `number`, nunca `String(n)`: o motor não lê string como decimal (motor#1418).
      return f.format(n);
    } catch {
      // Opção que este motor não conhece. Cai para o cru em vez de derrubar a tela.
    }
  }
  const {decimal} = separadoresDoLocale(locale);
  return String(n).replace(".", decimal);
}

/**
 * Lê de volta o que a pessoa digitou. **Devolve `null` quando não há número** — e `null` não é
 * zero: um campo vazio e um campo com `0` são coisas diferentes num lançamento.
 *
 * Aceita o que a pessoa realmente digita ou cola: `R$ 1.234,50`, `1 234,50`, `-12,4`, `12.4`.
 * A regra é simples e por isso previsível — **tudo que não é dígito, sinal ou o separador
 * decimal DO LOCALE é lixo** e sai fora, inclusive o separador de milhar.
 */
export function lerNumero(texto: string, locale?: string): number | null {
  const {decimal} = separadoresDoLocale(locale);
  const negativo = /-/.test(texto);
  // `\p{Nd}` e não `[0-9]`: o teclado de alguns locales entrega dígitos que não são ASCII, e um
  // filtro ASCII os jogaria fora em silêncio — devolvendo `null` para um número que a pessoa vê
  // na tela.
  let cru = "";
  for (const c of texto) {
    if (/\p{Nd}/u.test(c)) cru += c;
    else if (c === decimal) cru += ".";
  }
  // Duas casas decimais digitadas por engano ("1.2.3") não viram número — melhor devolver `null`
  // e deixar o campo mostrar o que era antes do que adivinhar qual ponto a pessoa quis.
  if (cru === "" || cru === ".") return null;
  if (cru.indexOf(".") !== cru.lastIndexOf(".")) return null;
  const n = Number(cru);
  if (!Number.isFinite(n)) return null;
  return negativo ? -n : n;
}

const prender = (n: number, min?: number, max?: number) => {
  let v = n;
  if (min != null && v < min) v = min;
  if (max != null && v > max) v = max;
  return v;
};

// O texto que o campo mostra ENQUANTO SE EDITA: o número sem grupo e sem símbolo, com o separador
// decimal do locale. É o oposto do que se mostra em repouso, e é a decisão da ADR-0024 — editar
// "R$ 1.234,50" com o cursor no meio é o defeito que o MUI filmou.
const paraEdicao = (n: number | null, locale?: string): string => {
  if (n == null) return "";
  const {decimal} = separadoresDoLocale(locale);
  return String(n).replace(".", decimal);
};

// ─────────────────────────────────────────────────────────────────────────────────────────────
// NumberField
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface NumberFieldProps {
  /** Controlado. `null` é **vazio**, e é diferente de `0`. */
  value?: number | null;
  defaultValue?: number;
  onValueChange?: (v: number | null) => void;
  min?: number;
  max?: number;
  /** Quanto os botões somam e tiram. Padrão **1**. */
  step?: number;
  /**
   * As opções do `Intl.NumberFormat`. **Mesma prop, mesmo tipo e mesmo significado da web** —
   * lá elas iam para o Base UI, aqui vão para o `Intl` direto.
   *
   *     moeda    {style: "currency", currency: "BRL"}          com locale "pt-BR"
   *     medida   {maximumFractionDigits: 1}                    12,4
   *     contador nenhuma — o padrão já é o inteiro agrupado
   *
   * ⚠ **`notation: "compact"` não é aceito**, e a recusa é medida: está quebrado no motor nos
   * dois sistemas (motor#768, motor#1035). Em `__DEV__` sai aviso; em produção a opção é
   * ignorada, porque um "1,2 mi" errado numa tela de lançamento é pior que "1.234.567".
   */
  format?: Intl.NumberFormatOptions;
  /** O locale do `Intl`. Sem ele, o do aparelho. */
  locale?: string;
  disabled?: boolean;
  /** Mostra o valor e não deixa editar — os botões também somem. */
  readOnly?: boolean;
  size?: AureaFieldSize;
  /**
   * Ocupa a largura disponível em vez de abraçar o conteúdo. Padrão **false**.
   *
   * O padrão segue o `.number-field` da web, que é `inline-flex` (`aurea.css:704`) — e o mesmo
   * eixo existe na HeroUI (`fullWidth`, medido no inventário). **Ligue para moeda:** o campo em
   * repouso tem `--space-16` (64dp), que cabe um contador e não cabe `R$ 1.234,50`.
   */
  fullWidth?: boolean;
  /** O nome para o leitor de tela quando não há `Field` em volta. */
  label?: string;
  placeholder?: string;
  /**
   * O teclado. Sem ele a escolha é derivada: **`decimal-pad`**, ou o teclado com sinal quando
   * `min` é negativo — porque o `decimal-pad` do iOS **não tem tecla de menos**, e um campo que
   * aceita −5 e não deixa digitá-lo é um campo quebrado.
   */
  keyboardType?: "numeric" | "decimal-pad" | "number-pad" | "numbers-and-punctuation";
  /** Os glifos dos botões. Registre-os, ou passe `false` para tirar os dois. */
  icons?: {increment: IconNameLocal; decrement: IconNameLocal} | false;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// O tipo do nome de ícone vem do módulo de ícones; declarado localmente para não importar o
// módulo inteiro só pelo tipo (é `string`, e o `IconName` de lá é exatamente isso).
type IconNameLocal = string;

/**
 * O número que se digita OU se empurra de um em um.
 *
 * ```tsx
 * <Field label="Valor">
 *   <NumberField value={valor} onValueChange={setValor}
 *                format={{style: "currency", currency: "BRL"}} locale="pt-BR" />
 * </Field>
 *
 * <Field label="Litros">
 *   <NumberField value={litros} onValueChange={setLitros}
 *                format={{maximumFractionDigits: 1}} locale="pt-BR" min={0} />
 * </Field>
 *
 * <Field label="Quantidade">
 *   <NumberField value={qtd} onValueChange={setQtd} min={0} step={1} />
 * </Field>
 * ```
 *
 * ⚠ **O que sai por `onValueChange` é o número CRU, sempre.** `1234.5`, nunca `"R$ 1.234,50"`.
 * É a mesma trava da ADR-0024 — lá o motor renderiza um input escondido com o valor cru; aqui não
 * há formulário nativo para esconder nada, então o contrato É a assinatura da função.
 *
 * ⚠ **Formata no blur, e só no blur.** Enquanto o campo tem foco, ele mostra exatamente o que foi
 * digitado — essa é a decisão inteira da ADR-0024, e o teste que a cobra está no lote.
 *
 * ⚠ **`onValueChange` dispara a CADA TECLA**, com o número lido pelas regras do `locale` — "12,"
 * em pt-BR entrega `12`, "1.234,5" entrega `1234.5`, apagar tudo entrega `null`. Texto que ainda
 * não é número (só "," ou só "-") não dispara nada. **`min`/`max` NÃO prendem durante a
 * digitação**, só no blur — e se prender mudar o número, ele é emitido de novo.
 *
 * ⚠ **Com FOCO, quem manda é quem digita.** Se o pai trocar o `value` por outro número enquanto o
 * campo está sendo editado, o texto na tela **não muda** — inclusive quando o pai só devolve o
 * mesmo número que acabou de receber, que é o caso comum de um `useState` controlado. Sem foco, o
 * campo obedece ao `value` e mostra o número novo formatado, que é o que faz um campo calculado a
 * partir de outros dois funcionar.
 */
export function NumberField({
  value, defaultValue, onValueChange, min, max, step = 1, format, locale,
  disabled, readOnly, size, fullWidth = false, label, placeholder, keyboardType,
  icons = {increment: "add", decrement: "subtract"}, style, testID,
}: NumberFieldProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const peleDaMarca = usePeleSobreAMarca();
  const strings = useAureaStrings();
  const campo = useCampo();
  const tam = size ?? campo?.size ?? "md";
  const inativo = disabled ?? campo?.disabled;

  const [interno, setInterno] = React.useState<number | null>(defaultValue ?? null);
  const numero = value !== undefined ? value : interno;

  // `null` = o campo está em repouso e mostra o FORMATADO. Uma string = está sendo editado, e a
  // string é literalmente o que foi digitado. Os dois estados não se misturam, e é isso que faz
  // "digitar não é interrompido" ser verdade em vez de intenção.
  const [emEdicao, setEmEdicao] = React.useState<string | null>(null);

  if (__DEV__ && format && (format as {notation?: string}).notation === "compact") {
    console.warn(
      "Aurea NumberField: `notation: \"compact\"` está quebrado no motor nos dois sistemas " +
      "(motor#768, motor#1035) e por isso é ignorado. Formate o número no app se precisar de " +
      "\"1,2 mi\" — e teste em aparelho, não no simulador.");
  }
  const formatoSeguro = React.useMemo(() => {
    if (!format || (format as {notation?: string}).notation !== "compact") return format;
    const {notation: _fora, compactDisplay: _fora2, ...resto} = format as Intl.NumberFormatOptions
      & {notation?: string; compactDisplay?: string};
    return resto as Intl.NumberFormatOptions;
  }, [format]);

  const emitir = React.useCallback((n: number | null) => {
    if (value === undefined) setInterno(n);
    onValueChange?.(n);
  }, [value, onValueChange]);

  const mostrar = emEdicao != null
    ? emEdicao
    : numero == null ? "" : formatarNumero(numero, locale, formatoSeguro);

  const confirmar = React.useCallback(() => {
    if (emEdicao == null) return;
    const lido = lerNumero(emEdicao, locale);
    setEmEdicao(null);
    // Texto ilegível devolve o valor de antes — o campo volta a mostrar o formatado, e nada se
    // perde. Apagar tudo, que é diferente, devolve `null`.
    if (lido == null) { if (emEdicao.trim() === "") emitir(null); return; }
    // ⚠ **Só aqui é que `min`/`max` prendem**, e é no blur de propósito — ver `digitar` abaixo.
    // Se prender mudou o número, o pai recebe o preso: quem ouviu "1" durante a digitação precisa
    // ouvir o "10" final, senão fica com um valor que o campo não mostra mais.
    emitir(prender(lido, min, max));
  }, [emEdicao, locale, emitir, min, max]);

  // 🔴 CADA TECLA ENTREGA O NÚMERO — e isto é conserto de defeito que GRAVA DADO ERRADO, não
  // refinamento. Achado pelo consumidor em aparelho, 19/09/2026.
  //
  // Antes, `onChangeText` só guardava o texto aqui dentro e o pai só era avisado no blur. Num
  // cartão com o campo e o botão de confirmar lado a lado, o `Screen` tem
  // `keyboardShouldPersistTaps="handled"` (`screen.tsx:154`) — então o toque no botão CHEGA ao
  // botão sem passar pelo blur. O `onPress` roda com o valor ANTIGO.
  //
  // ⚠ **A cara disso na tela é "o campo está vazio"**, e o dano real é maior e mudo: num
  // formulário que corrige um número já salvo, tocar em Salvar com o teclado aberto regrava o
  // número velho, sem erro e sem aviso.
  //
  // O que NÃO muda com isto, e é a ADR-0024 inteira: o campo continua mostrando o que foi
  // digitado enquanto tem foco (`emEdicao` é quem manda em `mostrar`), e continua formatando só
  // no blur. **Digitar nunca é interrompido** — nem pelo formato, nem pelo eco do pai: enquanto
  // `emEdicao` não é `null`, nada que venha por `value` reescreve o texto.
  const digitar = React.useCallback((texto: string) => {
    setEmEdicao(texto);
    const lido = lerNumero(texto, locale);
    // Apagar tudo é VAZIO, que é diferente de ilegível: o vazio é uma intenção e vira `null`.
    if (lido == null) { if (texto.trim() === "") emitir(null); return; }
    // ⚠ **NÃO prende aqui.** Com `min={10}`, prender durante a digitação faria o "1" virar 10 na
    // cara de quem ainda ia digitar o "5" de 15 — o campo escreveria por cima da pessoa. Prender
    // é do blur, e só.
    emitir(lido);
  }, [locale, emitir]);

  const empurrar = React.useCallback((direcao: 1 | -1) => {
    // Se o campo está sendo editado, o que vale é o que está escrito — empurrar por cima do valor
    // antigo descartaria a digitação em silêncio.
    const base = emEdicao != null ? (lerNumero(emEdicao, locale) ?? 0) : (numero ?? 0);
    setEmEdicao(null);
    emitir(prender(base + direcao * step, min, max));
  }, [emEdicao, numero, locale, emitir, step, min, max]);

  const tecladoPadrao: NumberFieldProps["keyboardType"] =
    min != null && min < 0
      ? (Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric")
      : "decimal-pad";

  const noLimite = (direcao: 1 | -1) => {
    const base = numero ?? 0;
    return direcao === 1 ? (max != null && base >= max) : (min != null && base <= min);
  };

  const mostrarBotoes = icons !== false && !readOnly;

  // 🔴 ACHADO PELA REFERÊNCIA, e não por mim — 12/09/2026. O inventário da HeroUI que já morava
  // no repositório (`audit/activity-2/INVENTORY-HEROUI.json`, medido em 22/08 sobre
  // `@heroui/react@3.2.4`) lista os estados do `number-field` deles:
  //
  //     disabled · focus-visible · FOCUS-WITHIN · hovered · invalid · pressed
  //
  // Este componente nasceu **sem estado de foco nenhum** — e era o ÚNICO campo de texto do pacote
  // sem ele: o `Input` do Lote 4 marca (`inputs.tsx:344`), o `Textarea` herda, o `SearchField`
  // marca (`busca.tsx:520`). Inconsistência dentro da própria biblioteca, e invisível em teste
  // até alguém comparar com uma referência.
  //
  // ⚠ **A BORDA vai no CAMPO, e não no grupo — e aqui a Aurea diverge da HeroUI de propósito.**
  // Lá o `Group` carrega a caixa e o `Input` fica nu dentro dela. Aqui não: o `.number-field-group`
  // do nosso CSS (`aurea.css:705`) é só `inline-flex` + `gap`, e quem tem borda é o `.input`
  // (`aurea.css:685`), com os dois botões FORA dela. O estado que faltava é o deles; a geometria
  // continua sendo a nossa.
  const [focado, setFocado] = React.useState(false);

  return (
    <View testID={testID}
          style={[s.grupo, fullWidth && s.grupoLargo, inativo && s.desabilitado, style]}>
      {mostrarBotoes && (
        <IconButton
          name={icons.decrement} label={strings.decrement} appearance="ghost" size={tam}
          disabled={inativo || noLimite(-1)}
          onPress={() => empurrar(-1)}
          testID={testID ? `${testID}-menos` : undefined} />
      )}
      <TextInput
        testID={testID ? `${testID}-campo` : undefined}
        value={mostrar}
        onChangeText={digitar}
        onFocus={() => { setFocado(true); setEmEdicao(paraEdicao(numero, locale)); }}
        onBlur={() => { setFocado(false); confirmar(); }}
        editable={!inativo && !readOnly}
        placeholder={placeholder}
        placeholderTextColor={peleDaMarca?.color ?? t.color.subtleForeground}
        keyboardType={keyboardType ?? tecladoPadrao}
        // O nome vem do `Field`, como em todo controle deste pacote — e `label` cobre quem usa o
        // campo solto. Sem um dos dois, é um nó anônimo para o leitor de tela.
        accessibilityLabel={label ?? campo?.label}
        accessibilityHint={campo?.hint}
        accessibilityState={{disabled: !!inativo}}
        aria-invalid={campo?.invalido}
        style={[
          s.campo,
          fullWidth && s.campoLargo,
          {height: alturaDoTamanho(t, tam), fontSize: fonteDoTamanho(t, tam),
           fontFamily: t.font.ui[400], color: t.color.foreground},
          campo?.invalido && s.invalido,
          // A ORDEM IMPORTA e é a mesma do `Input` do Lote 4: o inválido vem antes, o foco
          // depois. Um campo inválido que está sendo corrigido tem de mostrar que está ativo —
          // invertendo, a pessoa digita sem pista nenhuma de onde o teclado está batendo.
          focado && {borderColor: t.color.focusStrong},
          // 🔴 E DENTRO DO CARTÃO DA MARCA A TINTA VENCE OS DOIS — `usePeleSobreAMarca` tem os
          // números: sobre o amarelo o inválido mede 1,86 e o foco do tema escuro mede 1,00.
          // O foco continua existindo, por espessura.
          peleDaMarca,
          peleDaMarca && focado && {borderWidth: t.size.borderWidth * 2},
        ]}
      />
      {mostrarBotoes && (
        <IconButton
          name={icons.increment} label={strings.increment} appearance="ghost" size={tam}
          disabled={inativo || noLimite(1)}
          onPress={() => empurrar(1)}
          testID={testID ? `${testID}-mais` : undefined} />
      )}
    </View>
  );
}
