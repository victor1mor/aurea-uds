import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useColorScheme } from "react-native";
import { IconRegistryProvider } from "./icon.js";
import { defaultStrings } from "./strings.js";
import { resolverTokens, } from "./tokens.js";
// `comfortable` não é gosto: MEDIDO em 02/09/2026, os 8 tokens de densidade do `comfortable` são
// idênticos aos do `base` (8/8), e os das outras duas não batem em nenhum. É a densidade que o
// CSS já assume quando ninguém declara `data-density`.
const DENSIDADE_PADRAO = "comfortable";
// `dark` é o que o catálogo inteiro declara no `<html>`, e o que a identidade da Aurea assume.
const TEMA_PADRAO = "dark";
const Contexto = React.createContext(null);
export function AureaProvider({ children, theme, density, defaultTheme, defaultDensity, fontFamilies, icons, strings, onThemeChange, onDensityChange, }) {
    const doAparelho = useColorScheme();
    const [temaInterno, setTemaInterno] = React.useState(defaultTheme ?? null);
    const [densidadeInterna, setDensidadeInterna] = React.useState(defaultDensity ?? DENSIDADE_PADRAO);
    // Enquanto ninguém escolheu (`temaInterno` nulo) o aparelho manda; depois, a escolha manda.
    // `useColorScheme` devolve `null` quando o sistema não diz — daí o padrão da casa.
    const temaEfetivo = theme ?? temaInterno ?? doAparelho ?? TEMA_PADRAO;
    const densidadeEfetiva = density ?? densidadeInterna;
    const controlado = theme !== undefined;
    const densidadeControlada = density !== undefined;
    const setTheme = React.useCallback((t) => {
        if (!controlado)
            setTemaInterno(t);
        onThemeChange?.(t);
    }, [controlado, onThemeChange]);
    const setDensity = React.useCallback((d) => {
        if (!densidadeControlada)
            setDensidadeInterna(d);
        onDensityChange?.(d);
    }, [densidadeControlada, onDensityChange]);
    const valor = React.useMemo(() => ({
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
        ? _jsx(IconRegistryProvider, { registry: icons, children: children })
        : children;
    return _jsx(Contexto.Provider, { value: valor, children: conteudo });
}
// Fora do provider os dois hooks LEVANTAM, em vez de devolverem um padrão. É decisão, e o
// motivo é o defeito que o padrão silencioso produz: um app inteiro desenhado no tema errado,
// sem nada acusando. Na web o equivalente não existe porque lá o CSS pinta de qualquer jeito;
// aqui, sem provider, não há de onde tirar cor nenhuma.
function usar(hook) {
    const v = React.useContext(Contexto);
    if (v === null) {
        throw new Error(`${hook}: nenhum <AureaProvider> acima deste componente. No React Native não há cascata de `
            + `estilo, então sem provider não existe tema para ler — e um padrão silencioso aqui `
            + `desenharia o app inteiro no tema errado sem nada acusar.`);
    }
    return v;
}
/** Os dois eixos e como trocá-los. Mesma forma do hook homônimo de `@aurea-uds/react`. */
export function useAureaTheme() {
    return usar("useAureaTheme").controle;
}
/** Os tokens já resolvidos para o par (tema, densidade) atual. Não tem par na web: lá o CSS resolve. */
export function useAureaTokens() {
    return usar("useAureaTokens").tokens;
}
/**
 * As frases visíveis. Mesmo nome do hook da web (`useAureaStrings`), tabela bem menor — ver
 * `strings.ts`.
 */
/**
 * O gerente de avisos do `ToastHost`, para quem não pode importar o `toast.tsx` — o `Button share`
 * (GAR-14, 0.28.0): o `toast.tsx` importa o `IconButton`, e o botão importar o toast fecharia um
 * ciclo. Interno: o público continua sendo o `useToast`. `null` sem `ToastHost` acima.
 */
export const AvisosContext = React.createContext(null);
export function useAureaStrings() {
    return usar("useAureaStrings").strings;
}
const SobreAMarcaCtx = React.createContext(null);
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
export function useSobreAMarca() {
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
export function ForaDaMarca({ children }) {
    return _jsx(SobreAMarcaCtx.Provider, { value: null, children: children });
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
export function usePeleSobreAMarca() {
    const marca = useSobreAMarca();
    return marca == null
        ? null
        : { borderColor: marca.tinta, backgroundColor: "transparent", color: marca.tinta };
}
