import * as React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { type AureaFieldSize } from "./inputs.js";
/** Os separadores de um locale, derivados de um número-sonda. */
export type AureaSeparadores = {
    decimal: string;
    grupo: string;
};
/** Descobre o separador decimal e o de milhar do locale. Memoizado por locale. */
export declare function separadoresDoLocale(locale?: string): AureaSeparadores;
/**
 * Formata um número para EXIBIÇÃO. Nunca para o valor que o app guarda.
 *
 * ⚠ Sem `Intl`, devolve o número cru com o separador decimal do locale — **não** uma moeda
 * montada à mão. Ver a nota no topo do módulo.
 */
export declare function formatarNumero(n: number, locale?: string, format?: Intl.NumberFormatOptions): string;
/**
 * Lê de volta o que a pessoa digitou. **Devolve `null` quando não há número** — e `null` não é
 * zero: um campo vazio e um campo com `0` são coisas diferentes num lançamento.
 *
 * Aceita o que a pessoa realmente digita ou cola: `R$ 1.234,50`, `1 234,50`, `-12,4`, `12.4`.
 * A regra é simples e por isso previsível — **tudo que não é dígito, sinal ou o separador
 * decimal DO LOCALE é lixo** e sai fora, inclusive o separador de milhar.
 */
export declare function lerNumero(texto: string, locale?: string): number | null;
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
    icons?: {
        increment: IconNameLocal;
        decrement: IconNameLocal;
    } | false;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
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
export declare function NumberField({ value, defaultValue, onValueChange, min, max, step, format, locale, disabled, readOnly, size, fullWidth, label, placeholder, keyboardType, icons, style, testID, }: NumberFieldProps): React.JSX.Element;
export {};
