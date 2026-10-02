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
import { StyleSheet } from "react-native";
export function criarFolha(descrever) {
    const cache = new Map();
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
export const comOpacidade = (cor, pct) => /^#[0-9a-fA-F]{6}$/.test(cor)
    ? cor + Math.round(Math.max(0, Math.min(1, pct)) * 255).toString(16).padStart(2, "0")
    : cor;
/**
 * A cor FORTE de um tom: o texto do selo, o ícone da moldura.
 *
 * ⚠ **Morava dentro do `Badge` e mudou de casa em 02/10/2026**, quando a moldura do ícone (R-15 e
 * R-18) passou a precisar da mesma cor por tom. Duas cópias do mapa é o defeito que o `CLAUDE.md`
 * nomeia — e o dia em que um tom novo entra numa só.
 */
export const acentoDoTom = (t, tom) => tom === "primary" ? t.color.primaryEmphasis
    : tom === "info" ? t.color.info400 ?? t.color.info
        : tom === "success" ? t.color.success400 ?? t.color.success
            : tom === "warning" ? t.color.warning400 ?? t.color.warning
                : tom === "danger" ? t.color.danger400 ?? t.color.destructive
                    : t.color.secondaryForeground;
/** O fundo SUAVE de um tom (`--<tom>-bg`). `primary` e `neutral` não têm token: `undefined`. */
export const fundoDoTom = (t, tom) => tom === "info" ? t.color.infoBg
    : tom === "success" ? t.color.successBg
        : tom === "warning" ? t.color.warningBg
            : tom === "danger" ? t.color.dangerBg
                : undefined;
/**
 * 🔴 O FIO AMARELO DO ESCOLHIDO — o sinal único da casa para "este é o escolhido".
 *
 * O `aurea.css:1037-1039` põe este fio em TODOS os selecionados (`.is-selected`, botão alternado,
 * `.segmented button.active`, item ativo da lateral), e o comentário de lá diz por quê: *"Um
 * usuário aprende uma vez e reconhece em todo lugar (pedido do Victor, 24/07)."* Os três números
 * saem daquela linha, não daqui: altura 2 (fração de pixel borra), recuo 15 de cada lado
 * (`inset-inline:15px`), e o amarelo a 75% (cheio ele grita mais que o próprio rótulo).
 *
 * ⚠ **Morava dentro do `SegmentedControl` e mudou de casa em 01/10/2026**, quando a aba de
 * `<Tabs variant="secondary">` (R-12) passou a precisar do mesmo fio. Copiar os números para o
 * segundo arquivo é o defeito que o `CLAUDE.md` nomeia. Quem desenha o fio, desenha este.
 *
 * ⚠ Em peça estreita o recuo de 15 de cada lado zera a largura e o fio some — **e é o mesmo
 * comportamento da web**, onde `inset-inline:15px` numa caixa estreita não desenha nada.
 */
export const fioDoEscolhido = (t) => ({
    position: "absolute", left: 15, right: 15, bottom: 0, height: 2,
    borderRadius: t.size.radiusFull, backgroundColor: comOpacidade(t.color.primary, 0.75),
});
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
    pressionado: { opacity: 0.9, transform: [{ scale: 0.97 }] },
    inerte: { opacity: 0.45 },
};
/**
 * O estado para o leitor de tela, dito **duas vezes**: em `accessibilityState` (o aparelho) e em
 * `aria-*` (a web).
 *
 * EXISTE POR UMA MEDIÇÃO (R-20, 01/10/2026). O `react-native-web` 0.21.3 **não lê**
 * `accessibilityState`: o `createDOMProps` dele só conhece `aria-checked`, `aria-selected`,
 * `aria-disabled`, `aria-expanded` e `aria-busy` (e os `accessibilityChecked` e afins, que estão
 * para sair). Com só o `accessibilityState`, o `RadioGroup` aberto no navegador saía sem
 * `aria-checked`, e o leitor de tela não dizia qual opção estava marcada.
 *
 * O React Native 0.87 aceita as mesmas `aria-*` e as junta ao `accessibilityState` com o mesmo
 * valor, então o aparelho não muda.
 *
 * ⚠ `pressed` (o botão de ligar e desligar) é a exceção: no aparelho continua `checked`, como
 * sempre foi; na web vira `aria-pressed`, porque `aria-checked` num `button` o leitor ignora. Os
 * tipos do React Native não têm `aria-pressed`; o aparelho descarta a propriedade que não conhece.
 *
 * Uso: `<Pressable {...estadoAcessivel({checked, disabled})} />`. Ferramenta de dentro: **não
 * sai pela porta da frente do pacote.**
 */
export function estadoAcessivel(estado) {
    if (!estado)
        return { accessibilityState: undefined };
    const { pressed, ...resto } = estado;
    const doAparelho = pressed === undefined ? resto : { ...resto, checked: pressed };
    return {
        accessibilityState: doAparelho,
        "aria-checked": resto.checked,
        "aria-selected": resto.selected,
        "aria-disabled": resto.disabled,
        "aria-expanded": resto.expanded,
        "aria-busy": resto.busy,
        "aria-pressed": pressed,
    };
}
