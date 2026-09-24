// Aurea nativo — a fábrica de folhas de estilo, memoizada por (tema, densidade).
//
// EXISTE POR UMA MEDIÇÃO, não por gosto. O smoke test do Lote 0 rodou num Android em 03/09/2026
// e a troca de tema custou **182 ms** e **161 ms** sobre 40 linhas. Passou o critério de 200 ms,
// mas passou perto — e três coisas inflavam o número, uma delas de propósito: **o app chamava
// `StyleSheet.create` a cada render**, para medir o pior caso.
//
// A ADR-0037 registrou a lição em uma frase: *"os componentes do Lote 1 não têm essa desculpa"*.
// Este arquivo é essa frase virando código.
//
// COMO FUNCIONA, e por que não é só um `useMemo`: os estilos dependem do par (tema, densidade),
// que tem **seis** combinações e muda raramente. Um `useMemo` por componente recalcularia a folha
// uma vez por INSTÂNCIA; aqui a folha é calculada uma vez por COMBINAÇÃO e compartilhada por
// todas as instâncias daquele componente. Vinte botões na tela produzem uma folha, não vinte.
//
// O cache não tem limite de tamanho, e isso é seguro por construção: a chave é
// `${tema}:${densidade}`, então ele tem **teto de seis entradas por componente**. Não é cache de
// dados do usuário; é uma tabela de seis linhas.
import {StyleSheet, type ImageStyle, type TextStyle, type ViewStyle} from "react-native";
import type {AureaTokens} from "./tokens.js";

/**
 * Recebe a função que descreve os estilos a partir dos tokens e devolve um leitor memoizado.
 *
 *     const folha = criarFolha((t) => ({caixa: {backgroundColor: t.color.card}}));
 *     // dentro do componente:
 *     const s = folha(tokens);   // mesma referência enquanto o par (tema, densidade) não mudar
 *
 * A identidade estável importa duas vezes: o `StyleSheet.create` não roda de novo, e o objeto de
 * estilo que chega ao `View` é o mesmo por referência — o que deixa a comparação de props do
 * React resolver no atalho em vez de descer na árvore.
 */
// ⚠ A assinatura repete a forma do próprio `StyleSheet.create`, e isso NÃO é enfeite: sem o
// `& NamedStyles` o TypeScript infere `flexDirection: string` em vez do literal `"row"`, e todo
// estilo do pacote reprova. Medido em 03/09/2026, ao compilar o Lote 1 pela primeira vez.
//
// O tipo é DECLARADO AQUI e não importado de `StyleSheet.NamedStyles`: aquele mora dentro do
// namespace e não é exportado (medido nos tipos do react-native 0.87.1). `ViewStyle`, `TextStyle`
// e `ImageStyle` são públicos, e é deles que ele se compõe — sem depender de detalhe interno.
type NamedStyles<T> = {[P in keyof T]: ViewStyle | TextStyle | ImageStyle};

export function criarFolha<T extends NamedStyles<T> | NamedStyles<Record<string, unknown>>>(
  descrever: (t: AureaTokens) => T & NamedStyles<Record<string, unknown>>,
): (t: AureaTokens) => T {
  const cache = new Map<string, T>();
  return (t) => {
    const chave = `${t.theme}:${t.density}`;
    let folha = cache.get(chave);
    if (!folha) {
      folha = StyleSheet.create(descrever(t));
      cache.set(chave, folha);
    }
    return folha;
  };
}

/**
 * O `color-mix(in srgb, X 12%, transparent)` do CSS, traduzido.
 *
 * **Não há `color-mix` no React Native** — medido no interpretador de cor, o mesmo que a ADR-0027
 * já tinha atravessado a pé. O que existe é hex de OITO dígitos, e `#RRGGBBAA` com o alfa certo
 * dá o mesmo pixel sobre um fundo opaco. Cai para a cor crua se ela não for hex de seis, para
 * nunca produzir uma string que o RN descarte em silêncio.
 *
 * ⚠ **Ele morava dentro do `navigation.tsx` e mudou de casa em 17/09/2026**, quando o
 * `SegmentedControl` passou a precisar do mesmo cálculo para o fio do escolhido. Copiar a função
 * para o segundo arquivo é exatamente o defeito que o `CLAUDE.md` nomeia — *correção local é
 * proibida sem responder "quem mais tem esse problema?"*.
 *
 * ✅ **Sai pela porta da frente do pacote desde 24/09/2026 (R-07).** Até ali era ferramenta de
 * dentro, e o app que precisava de um fundo translúcido sobre a cor do tema (o círculo atrás de
 * um ícone) não tinha como escrevê-lo sem número à mão. O `check 39` cobra o teste dele.
 */
export const comOpacidade = (cor: string, pct: number): string =>
  /^#[0-9a-fA-F]{6}$/.test(cor)
    ? cor + Math.round(Math.max(0, Math.min(1, pct)) * 255).toString(16).padStart(2, "0")
    : cor;

/**
 * A reação ao TOQUE de tudo que é alvo inteiro — hoje o `Button`, o `IconButton` e o `Card` com
 * `onPress`. Os números são os do core: `.btn:active { transform:scale(.97); opacity:.9 }` e
 * `.btn:disabled { opacity:.45 }`.
 *
 * ⚠ **Mora aqui desde 24/09/2026 (R-04)**, quando o `Card` passou a responder ao toque e a
 * decisão foi *"a mesma reação do `Button`"*. Copiar os três números para o `layout.tsx` faria
 * duas peças dizerem a mesma coisa em dois lugares — e a primeira que mudasse deixaria a outra
 * para trás. Mesma razão do `comOpacidade` acima, e pelo mesmo motivo **não sai pela porta da
 * frente do pacote**.
 *
 * ⚠ **Não é animação:** não há transição, o alvo SALTA para 0,97 enquanto o dedo está em cima.
 * Por isso ele não consulta `useReduceMotion` — não há movimento para parar.
 */
export const REACAO_AO_TOQUE = {
  pressionado: {opacity: 0.9, transform: [{scale: 0.97}]},
  inerte: {opacity: 0.45},
} as const satisfies Record<string, ViewStyle>;
