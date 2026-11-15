import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { I18nManager, useColorScheme } from "react-native";
import { IconRegistryProvider } from "./icon.js";
import { comOpacidade, misturaOpaca } from "./estilos.js";
import { defaultStrings } from "./strings.js";
import { resolverTokens, } from "./tokens.js";
const SEM_MODOS = { alto: false, texto: "md" };
/**
 * Os modos de leitura sobre os tokens (0-D e 0-E no nativo, 14/11/2026 — as formas que o Victor aprovou na web em
 * 04/11/2026, ADR-0090). O texto grande ("B"): cada degrau da letra sobe 2, do `textXs` ao `text2xl` (a entrelinha
 * acompanha, porque é razão); a altura dos controles NÃO muda: no nativo o controle médio já tem o alvo de toque (a web
 * subiu o dela de 36 para 44). O alto contraste ("C"): o texto de apoio a 80% do texto, e as marcas dos controles na
 * tinta — os mesmos tokens que o `[data-contrast="high"]` da web troca; o resto (o contorno dos campos, do cartão e do
 * botão, o link sublinhado) as peças desenham lendo `useMaisContraste()`/`useAltoContraste()`.
 */
function aplicarModos(t, m) {
    if (!m.alto && m.texto === "md")
        return t;
    const s = t.size;
    const size = m.texto === "lg" ? { ...s,
        textXs: s.textXs + 2, textSm: s.textSm + 2, textMd: s.textMd + 2, textBase: s.textBase + 2,
        textLg: s.textLg + 2, textXl: s.textXl + 2, text2xl: s.text2xl + 2 } : s;
    const c = t.color;
    const color = m.alto ? { ...c,
        mutedForeground: misturaOpaca(c.foreground, c.background, 0.8),
        controlThumb: c.brandYellowInk, controlSelectedForeground: c.brandYellowInk, controlSelectedDot: c.brandYellowInk } : c;
    return { ...t, size, color };
}
// `comfortable` não é gosto: MEDIDO em 02/09/2026, os 8 tokens de densidade do `comfortable` são
// idênticos aos do `base` (8/8), e os das outras duas não batem em nenhum. É a densidade que o
// CSS já assume quando ninguém declara `data-density`.
const DENSIDADE_PADRAO = "comfortable";
// `dark` é o que o catálogo inteiro declara no `<html>`, e o que a identidade da Aurea assume.
const TEMA_PADRAO = "dark";
const Contexto = React.createContext(null);
export function AureaProvider({ children, theme, density, brand, defaultTheme, defaultDensity, fontFamilies, icons, strings, direction, highContrast, textSize, onThemeChange, onDensityChange, }) {
    // Os modos de leitura herdam do provedor de fora quando este não diz (o tema num pedaço continua com eles).
    const deFora = React.useContext(Contexto)?.modos ?? SEM_MODOS;
    const alto = highContrast ?? deFora.alto, texto = textSize ?? deFora.texto;
    const modos = React.useMemo(() => ({ alto, texto }), [alto, texto]);
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
        tokens: aplicarModos(resolverTokens(temaEfetivo, densidadeEfetiva, fontFamilies, brand), modos),
        modos,
        // As frases NÃO dependem do par (tema, densidade), mas moram no mesmo `useMemo` de propósito:
        // um contexto a mais só se paga quando ele muda em outra hora, e este muda junto — é a mesma
        // conta que o cabeçalho deste arquivo já fez para os dois contextos que viraram um.
        strings: strings ?? defaultStrings,
        fontes: fontFamilies,
        marca: brand ?? null,
        raiz: null,
    }), [temaEfetivo, densidadeEfetiva, setTheme, setDensity, fontFamilies, strings, brand, modos]);
    // O registro de ícones fica num contexto PRÓPRIO: ele não muda quando o tema muda, e juntá-lo
    // ao valor do tema faria toda árvore que só desenha ícone re-renderizar na troca de tema.
    const comIcones = icons
        ? _jsx(IconRegistryProvider, { registry: icons, children: children })
        : children;
    // A direção num contexto PRÓPRIO, como o registro de ícones: as peças que refazem o tema por dentro (o cartão
    // `contrast`, a faixa fora da marca) não precisam saber dela. Sem `direction`, nada se monta e vale a de fora.
    const conteudo = direction
        ? _jsx(DirecaoContext.Provider, { value: direction, children: comIcones })
        : comIcones;
    return _jsx(Contexto.Provider, { value: valor, children: conteudo });
}
const DirecaoContext = React.createContext(null);
/**
 * Interno: `true` quando a escrita corre da direita para a esquerda — a do `AureaProvider` mais próximo que disse
 * `direction` ou, sem nenhum, a do aparelho (`I18nManager.isRTL`), como o `useIsRTL` da referência do celular.
 */
/** Interno: `true` com o alto contraste do app ligado (`highContrast` no `AureaProvider`). Fora de provedor, `false`. */
export function useAltoContraste() {
    return React.useContext(Contexto)?.modos?.alto ?? false;
}
export function useDirecaoRtl() {
    const d = React.useContext(DirecaoContext);
    return d ? d === "rtl" : I18nManager.isRTL;
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
    // ✅ **E corta o tema do pedaço também (ADR-0063, 10/10/2026).** A mesma armadilha vale para o
    // `Card variant="contrast"`: ele entrega os tokens do ESCURO aos filhos, e a folha de um `Select`
    // aberto dali sairia escura sobre um app claro. Na web isso não acontece porque a folha vai para
    // o fim da página (portal), fora do pedaço; aqui, quem sai do fluxo volta ao valor do app.
    const v = React.useContext(Contexto);
    const corpo = _jsx(SobreAMarcaCtx.Provider, { value: null, children: children });
    return v?.raiz ? _jsx(Contexto.Provider, { value: v.raiz, children: corpo }) : corpo;
}
/**
 * O tema num pedaço da tela — o `Card variant="contrast"` (MT-01, ADR-0063, 10/10/2026). Os filhos
 * leem os tokens do `tema` pedido; o resto do app não muda. É o jeito da referência principal de
 * fazer um pedaço escuro (o tema aplicado num elemento), e o da web (`data-theme` no cartão).
 *
 * ⚠ **O `useAureaTheme()` continua o do app**: dentro do pedaço, `theme` diz o tema do APP, e o
 * `setTheme` troca o do app. Só os tokens mudam — é o que pinta.
 *
 * Interno: o público é o `Card variant="contrast"`. O que sai do fluxo (folha, sobreposto) passa
 * pelo `ForaDaMarca` e volta ao app.
 */
/**
 * Os tokens do APP, mesmo dentro de um pedaço com tema próprio. Quem desenha uma janela que sai do
 * fluxo (a folha, o diálogo) pinta o FUNDO dela com isto: o `ForaDaMarca` devolve o contexto do app
 * só para quem lê o contexto DENTRO da janela (o texto, o botão), e o fundo é calculado antes, por
 * quem abre. Medido na bancada do Lote N (10/10/2026): sem isto, a lista do `Select` aberta de
 * dentro do `contrast` saía com o fundo do escuro e a letra do claro. Interno.
 */
export function useTokensDoApp() {
    const v = usar("useTokensDoApp");
    return (v.raiz ?? v).tokens;
}
export function TemaDentro({ tema, children }) {
    const v = usar("TemaDentro");
    const valor = React.useMemo(() => ({
        ...v,
        tokens: aplicarModos(resolverTokens(tema, v.controle.density, v.fontes, v.marca), v.modos ?? SEM_MODOS),
        raiz: v.raiz ?? v,
    }), [v, tema]);
    if (v.tokens.theme === tema)
        return _jsx(_Fragment, { children: children });
    return _jsx(Contexto.Provider, { value: valor, children: children });
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
 *
 * ⚠ **Sem linha (16/10/2026, o Victor: "quero tudo sem borda sem exceções").** O contorno da tinta
 * saiu, e sem ele o campo sumia no amarelo (fundo transparente, nenhuma linha). Agora o campo é a
 * TINTA a 14% sobre o amarelo — o amarelo um pouco mais escuro, como o campo fora do cartão é a
 * superfície um pouco diferente da página. A 1.4.11 (3:1 para o limite do campo), que só o contorno
 * alcançava, deixa de ser cumprida aqui, como em todo campo sem linha: decisão do Victor, ADR-0072.
 */
export function usePeleSobreAMarca() {
    const marca = useSobreAMarca();
    return marca == null
        ? null
        : { borderColor: "transparent", backgroundColor: comOpacidade(marca.tinta, 0.14), color: marca.tinta };
}
