// Dublê de `react-native` para os testes do alvo nativo.
//
// Não é conveniência: `react-native` é escrito em **Flow** e nenhum transform do vitest o lê —
// medido, `Parse failed: Flow is not supported`. O alias entra na RESOLUÇÃO (vitest.config.ts),
// e não por `vi.mock`, porque o mock só age em runtime: o Vite já teria tentado transformar o
// módulo real antes disso.
//
// ── POR QUE ELE CAPTURA PROPS ────────────────────────────────────────────────────────────────
// O que se quer verificar num componente do alvo nativo é **o que ele passa para os primitivos
// da plataforma** — que altura pediu, que cor calculou, que papel de acessibilidade declarou.
// Isso não é DOM: `@testing-library/react` acha nós por `data-testid` e devolve elementos HTML,
// que não têm `props`. Então cada primitivo daqui registra as props com que foi chamado, e o
// teste as lê por `__instancias("View")`.
//
// O limite é o de sempre, e continua declarado: **isto não desenha**. Quem desenha é o aparelho,
// e é para isso que existe `apps/native-smoke/`.
import * as React from "react";

export const useColorScheme = (): "light" | "dark" | null => null;

// `StyleSheet.create` devolve o objeto como está — que é o que a Nova Arquitetura faz de verdade
// desde que os IDs numéricos saíram. O `flatten` existe porque `style` pode ser array aninhado.
export const StyleSheet = {
  create: <T extends Record<string, unknown>>(o: T): T => o,
  flatten: (style: unknown): Record<string, unknown> => {
    const saida: Record<string, unknown> = {};
    const visitar = (v: unknown) => {
      if (!v) return;
      if (Array.isArray(v)) { v.forEach(visitar); return; }
      if (typeof v === "object") Object.assign(saida, v);
    };
    visitar(style);
    return saida;
  },
  absoluteFill: {},
  hairlineWidth: 1,
};

type Props = Record<string, unknown>;
const registro = new Map<string, Props[]>();

/** As props de cada instância do primitivo, na ordem em que foram renderizadas. */
export function __instancias(nome: string): Props[] {
  return registro.get(nome) ?? [];
}
/** Chamado pelo `setup.ts` entre testes — sem isto uma instância de um teste vaza no seguinte. */
export function __limpar(): void {
  vitrine = false;
  ultimoGesto = null;
  larguraDaJanela = 360;
  registro.clear();
  lacos.length = 0;
  reduzirMovimento = false;
  plataforma = "android";
  __chamadasDeSistema.length = 0;
}

/**
 * Fabrica um dublê de primitivo que registra as props com que foi chamado.
 *
 * **Exportado** porque o dublê de `react-native-safe-area-context` precisa do MESMO registro: se
 * ele tivesse o seu, `__limpar()` limparia um e deixaria o outro vazando entre testes.
 */
// ── MODO VITRINE — desligado por padrão, e é o que torna a mudança segura ────────────────────
//
// Ele existe por um pedido do Victor em 12/09/2026: *"quero prova visual"*. Até então toda a
// evidência do alvo nativo era saída de terminal, e ele está certo — número em texto não mostra
// se a coisa é feia, e a identidade da Aurea é metade do produto.
//
// **O que ele NÃO é:** não é o aparelho, e não substitui o `apps/native-smoke/`. O que ele desenha
// são os OBJETOS DE ESTILO que o código real calculou a partir dos tokens reais — cor, raio,
// altura, borda, espaçamento — dispostos pelo flexbox do NAVEGADOR e não pelo Yoga do React
// Native. Os dois concordam na esmagadora maioria dos casos e podem divergir em casos de borda.
// Vale como prova de VALOR (esta borda é `focusStrong`? este raio é 22?), não de LAYOUT FINAL.
//
// Desligado, o dublê é byte a byte o que era antes — o registro não muda, e nenhum dos 1401
// testes vê diferença.
let vitrine = false;
/** Liga o desenho com estilo de verdade. Só a vitrine chama. */
export function __definirVitrine(v: boolean): void { vitrine = v; }

// O que o DOM não sabe ler: prop de RN que não é CSS, ou que é CSS com outra forma.
const SO_DO_RN = new Set([
  "includeFontPadding", "shadowColor", "shadowOffset", "shadowOpacity",
  "shadowRadius", "elevation", "resizeMode", "tintColor", "overlayColor", "writingDirection",
]);

// 🔴 O `textAlignVertical` NÃO É "só do RN" — ele tem par no CSS, e tratá-lo como intraduzível
// foi o que fez a vitrine de 12/09/2026 mostrar o número do `NumberField` colado no topo do
// campo. O Victor viu na imagem — *"os numero não estão centralizado, eles estão muito pra
// cima"* — e a acusação estava certa sobre a IMAGEM e errada sobre o componente.
//
// Medido no fonte do `react-native@0.87.1`, nos dois alvos, antes de mexer em qualquer coisa:
//   • Android — `ReactTextInputManager.kt:574-587`: `"center"` vira `Gravity.CENTER_VERTICAL`
//     no `ReactEditText`. Centraliza.
//   • iOS — `RCTUITextField.mm:224-227`: o `textRectForBounds:` delega ao `super`, e o
//     `UITextField` de uma linha já centraliza o texto nos próprios limites. Centraliza.
// **Então o componente está certo nos dois aparelhos.** O que estava errado era a conversão:
// aqui o `TextInput` é um `div` `display:flex; flex-direction:column` com altura fixa, e o
// padrão do `justify-content` é `flex-start` — o texto sobe.
//
// ⚠ E a pergunta "quem mais tem esse problema?" tem resposta de QUATRO: `numero.tsx:83`,
// `busca.tsx:160`, `inputs.tsx:340` (os três `center`) e `inputs.tsx:372` (o `top` do
// `Textarea`). A vitrine desenhava TODO campo de texto do pacote fora do lugar.
const ALINHAMENTO_VERTICAL: Record<string, string> = {
  center: "center", top: "flex-start", bottom: "flex-end",
};

// 🔴 OS ATALHOS DE EIXO DO RN NÃO EXISTEM NO CSS, e o navegador os DESCARTA em silêncio —
// achado pela segunda imagem, onde o texto do `Input` saiu colado na borda porque o
// `paddingHorizontal: 13` do componente nunca chegou. É a mesma família do `lineHeight`: valor
// certo, nome que só existe de um lado.
const EIXO: Record<string, [string, string]> = {
  paddingHorizontal: ["paddingLeft", "paddingRight"],
  paddingVertical: ["paddingTop", "paddingBottom"],
  marginHorizontal: ["marginLeft", "marginRight"],
  marginVertical: ["marginTop", "marginBottom"],
};

function paraCss(estilo: unknown): Record<string, unknown> {
  const plano = StyleSheet.flatten(estilo);
  const saida: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(plano)) {
    if (SO_DO_RN.has(k) || v == null) continue;
    if (k === "textAlignVertical") {
      // `auto` é o padrão do RN e não afirma nada — não vira regra de CSS.
      const par = ALINHAMENTO_VERTICAL[v as string];
      if (par) saida.justifyContent = par;
      continue;
    }
    const eixo = EIXO[k];
    if (eixo) { saida[eixo[0]] = v; saida[eixo[1]] = v; continue; }
    // `boxShadow` do RN 0.76+ é um ARRAY de objetos; o CSS quer string.
    if (k === "boxShadow" && Array.isArray(v)) {
      saida.boxShadow = v.map((s) => {
        const o = s as Record<string, number | string>;
        return `${o.offsetX ?? 0}px ${o.offsetY ?? 0}px ${o.blurRadius ?? 0}px ` +
               `${o.spreadDistance ?? 0}px ${o.color ?? "transparent"}`;
      }).join(", ");
      continue;
    }
    // 🔴 ACHADO PELA IMAGEM, e é a divergência de UNIDADE mais cara que existe entre os dois
    // alvos. No React Native `lineHeight` e `letterSpacing` são ABSOLUTOS em dp — o `text.tsx`
    // documenta isso na linha 102 e multiplica o token de razão pelo `fontSize` de propósito.
    // No CSS, `line-height` SEM unidade é MULTIPLICADOR: `line-height: 19.5` com `font-size:13px`
    // dá 253,5px de altura de linha. E o React não acrescenta `px` nessas duas, justamente
    // porque na web o número puro é idiomático.
    //
    // A primeira vitrine saiu com cada linha de texto ocupando 254px de altura. O valor estava
    // CERTO nos dois lados; o que diverge é como cada plataforma o lê. Sem esta conversão a
    // imagem mentiria sobre o espaçamento do design system inteiro.
    if ((k === "lineHeight" || k === "letterSpacing") && typeof v === "number") {
      saida[k] = `${v}px`;
      continue;
    }
    saida[k] = v;
  }
  // O RN é flex por padrão e em COLUNA; o CSS é bloco e em linha. Sem isto, tudo desaba.
  if (saida.display == null) saida.display = "flex";
  if (saida.flexDirection == null) saida.flexDirection = "column";
  if (saida.boxSizing == null) saida.boxSizing = "border-box";
  // 🔴 ACHADO PELA PRÓPRIA IMAGEM, 12/09/2026. No RN `borderWidth` já implica borda SÓLIDA; no
  // CSS o padrão de `border-style` é `none`, então a borda não desenha — e a primeira vitrine
  // saiu com TODAS as bordas invisíveis. O `getComputedStyle` dizia `rgb(240,177,0)` e a tela
  // não mostrava nada: o valor estava certo e o desenho não existia.
  // É a mesma armadilha que este repositório documenta em três gates diferentes — medir a
  // intenção em vez do resultado. A imagem foi o único controle que pegou.
  if (saida.borderStyle == null &&
      (saida.borderWidth != null || saida.borderTopWidth != null ||
       saida.borderBottomWidth != null)) saida.borderStyle = "solid";
  // O `flexShrink` do RN é 0 por padrão; o do CSS é 1. Sem fixar isto, caixa com altura definida
  // encolhe no navegador e não encolhe no aparelho — divergência que a vitrine inventaria.
  if (saida.flexShrink == null && saida.flex == null) saida.flexShrink = 0;
  return saida;
}

export function criarPrimitivo(nome: string) {
  const Duble = (props: Props) => {
    // `style` do `Pressable` pode ser função de estado; o teste quer o resultado, e o estado que
    // interessa por padrão é o de repouso.
    const resolvido = typeof props.style === "function"
      ? (props.style as (e: {pressed: boolean}) => unknown)({pressed: false})
      : props.style;
    // E o estado COM O DEDO EM CIMA, guardado ao lado — 24/09/2026, R-04. Sem ele, a reação ao
    // toque do `Card` só se provaria lendo o fonte, e o `Button` nunca teve a dele provada aqui.
    // Quem não tem `style` de função devolve o mesmo do repouso: não há estado a distinguir.
    const tocando = typeof props.style === "function"
      ? (props.style as (e: {pressed: boolean}) => unknown)({pressed: true})
      : props.style;
    registro.set(nome, [...(registro.get(nome) ?? []), {...props, style: resolvido, __estiloTocando: tocando}]);
    const extra: Props = {};
    if (vitrine) {
      extra.style = paraCss(resolvido);
      // O texto de um `TextInput` não mora em `children` — mora em `value`/`placeholder`. Sem
      // isto a vitrine desenharia caixas vazias, que é justamente o que não se quer ver.
      if (nome === "TextInput") {
        const v = (props.value ?? props.defaultValue ?? "") as string;
        const guia = (props.placeholder ?? "") as string;
        extra.children = v !== "" ? v : guia;
        if (v === "" && guia !== "") {
          (extra.style as Record<string, unknown>).color = props.placeholderTextColor;
        }
      }
      // 🔴 O `Image` PRECISA VIRAR `<img>` NA VITRINE, e a imagem de 12/09/2026 provou por quê:
      // desenhado como `div`, ele não carrega byte nenhum — as fotos saíam como caixas cinzas e
      // a prancha que existia para provar "exibir imagem" não provava nada. O `source` do RN é
      // `{uri}` ou um `require()`; só o primeiro tem como virar `src` aqui.
      if (nome === "Image") {
        extra.children = null;
        const fonte = props.source as {uri?: string} | undefined;
        if (fonte && typeof fonte.uri === "string") {
          extra.__img = fonte.uri;
          // `resizeMode` é prop do RN e some no `paraCss`; no DOM o par dele é `object-fit`.
          (extra.style as Record<string, unknown>).objectFit =
            (props.resizeMode as string) ?? "cover";
        }
      }
    }
    const {__img, ...resto} = extra as Props & {__img?: string};
    return React.createElement(
      __img ? "img" : "div",
      {
        "data-rn": nome,
        "data-testid": props.testID as string | undefined,
        ...(__img ? {src: __img, alt: ""} : null),
        ...resto,
      },
      __img ? null : ((extra.children !== undefined ? extra.children : props.children) as React.ReactNode));
  };
  Duble.displayName = nome;
  return Duble;
}

export const View = criarPrimitivo("View");
export const Text = criarPrimitivo("Text");
export const Pressable = criarPrimitivo("Pressable");
export const ScrollView = criarPrimitivo("ScrollView");

export type ViewProps = Props & {children?: React.ReactNode; testID?: string};
export type TextProps = ViewProps;
export type PressableProps = ViewProps;
export type ViewStyle = Record<string, unknown>;
export type TextStyle = Record<string, unknown>;
export type ImageStyle = Record<string, unknown>;

// ── O LOTE 2 TROUXE ANIMAÇÃO, E COM ELA UM PROBLEMA DE DUBLÊ ─────────────────────────────────
// `Animated.loop` não devolve nada inspecionável: ele agenda quadros no driver nativo, que aqui
// não existe. Então o que este dublê registra não é o movimento — é **a DECISÃO de mover**.
//
// É o que o teste precisa saber, e é o que a web tem de graça: lá a regra global de
// `prefers-reduced-motion` para toda animação sem o componente participar. Aqui quem pergunta é
// o componente, e um componente que esquecer de perguntar fica menos acessível que a web na
// mesma peça — em silêncio. `__animacoes()` é o que torna esse silêncio audível no teste.
type Laco = {parado: boolean};
const lacos: Laco[] = [];
/** Os laços que foram INICIADOS desde o último `__limpar()`. */
export function __animacoes(): Laco[] { return lacos; }

class ValorAnimado {
  constructor(public valor: number) {}
  // ⚠ Faltava, e o Lote 4 achou: o `Switch` chama `setValue` para SALTAR quando a pessoa pediu
  // menos movimento, e o dublê levantava `TypeError`. Um dublê incompleto reprova o código certo
  // — que é a forma mais cara de um teste falhar, porque parece achado.
  setValue(v: number) { this.valor = v; }
  stopAnimation() {}
  // O `interpolate` real devolve um nó; aqui devolve algo legível, para o teste conseguir provar
  // QUE a rotação foi pedida sem depender do formato interno do RN.
  interpolate(cfg: {inputRange: number[]; outputRange: (string | number)[]}) {
    return {__interpolado: cfg.outputRange};
  }
}

const criarLaco = (): {start: () => void; stop: () => void} => {
  const laco: Laco = {parado: false};
  return {
    start: () => { lacos.push(laco); },
    stop: () => { laco.parado = true; },
  };
};

export const Animated = {
  Value: ValorAnimado,
  View: criarPrimitivo("Animated.View"),
  Text: criarPrimitivo("Animated.Text"),
  timing: () => criarLaco(),
  sequence: () => criarLaco(),
  loop: (_animacao: unknown) => criarLaco(),
};

export const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t,
  inOut: (f: unknown) => f,
  // O Lote 5 usa `Easing.bezier(...t.easing.easeEmphasized)` — os quatro números do DTCG. O
  // dublê só precisa devolver ALGO chamável; a curva em si não é o que o teste pergunta.
  bezier: (..._n: number[]) => (t: number) => t,
};

// ── PanResponder (Lote 5) ────────────────────────────────────────────────────────────────────
// O gesto do `BottomSheet`. O dublê GUARDA a configuração em vez de simular o dedo: é isso que
// deixa o teste chamar `onPanResponderRelease` com um `dy` escolhido e provar a REGRA (soltar no
// meio volta, passar do limiar fecha) sem depender de um motor de toque.
export type ConfigDeGesto = Record<string, (e: unknown, g: {dx: number; dy: number; vx: number; vy: number}) => unknown>;
let ultimoGesto: ConfigDeGesto | null = null;
/** A configuração passada ao último `PanResponder.create()`. */
export function __ultimoGesto(): ConfigDeGesto | null { return ultimoGesto; }

// ── FlatList e useWindowDimensions (Lote 6) ─────────────────────────────────────────────────
// O `FlatList` do dublê **desenha todos os itens**, e isso é deliberado: a virtualização é
// comportamento do motor de lista do RN, não contrato nosso. O que o teste pergunta é se o
// componente ESCOLHEU o `FlatList` e com que props — `data`, `keyExtractor`, `renderItem` — e
// isso o dublê responde. Fingir uma janela aqui testaria o dublê, não a Aurea.
export const FlatList = (props: Props) => {
  registro.set("FlatList", [...(registro.get("FlatList") ?? []), {...props}]);
  const dados = (props.data as unknown[]) ?? [];
  const desenhar = props.renderItem as ((info: {item: unknown; index: number}) => unknown) | undefined;
  const chave = props.keyExtractor as ((item: unknown, n: number) => string) | undefined;
  return React.createElement(
    React.Fragment,
    null,
    ...dados.map((item, index) =>
      React.createElement(
        React.Fragment,
        {key: chave ? chave(item, index) : String(index)},
        desenhar ? (desenhar({item, index}) as never) : null,
      ),
    ),
  );
};

// A largura da janela. O padrão é 360 — um telefone comum —, e é de propósito: o alvo deste
// pacote é telefone, então o teste que NÃO define largura testa o caso real. Quem quer o largo
// (tablet, paisagem) diz.
let larguraDaJanela = 360;
/** Muda a largura da janela para o próximo render. */
export function __definirLargura(v: number): void { larguraDaJanela = v; }
export const useWindowDimensions = () => ({width: larguraDaJanela, height: 800, scale: 2, fontScale: 1});

export const PanResponder = {
  create(cfg: ConfigDeGesto) {
    ultimoGesto = cfg;
    return {panHandlers: {__gesto: cfg}};
  },
};

// O dublê responde "não" por padrão: é o caso comum, e é o que faz a ausência da pergunta passar
// despercebida no código real — por isso o teste que importa é o que RESPONDE "sim".
let reduzirMovimento = false;
/** Liga a preferência de "menos movimento" para o próximo render. */
export function __definirReduceMotion(v: boolean): void { reduzirMovimento = v; }

export const AccessibilityInfo = {
  isReduceMotionEnabled: () => Promise.resolve(reduzirMovimento),
  addEventListener: (_evento: string, _ouvinte: unknown) => ({remove: () => {}}),
};

export const Image = criarPrimitivo("Image");
export type ImageSourcePropType = unknown;
export type StyleProp<T> = T | T[] | false | null | undefined;

// O Lote 3 trouxe o puxar-para-atualizar. O `RefreshControl` real e' um componente nativo; aqui
// ele so' precisa REGISTRAR que foi passado, com que `refreshing` e com que `onRefresh` — que e'
// o contrato que o `Screen` promete.
export const RefreshControl = criarPrimitivo("RefreshControl");

// O Lote 4 trouxe os formularios. Tres primitivos novos, e o `Platform` — que e' o que o
// `KeyboardAvoiding` consulta para escolher o `behavior`, e por isso o teste precisa poder
// trocar de plataforma.
export const TextInput = criarPrimitivo("TextInput");

// 🔴 O `Modal` PRECISA DE TRATAMENTO PROPRIO NA VITRINE, e a razao e' um defeito que a imagem
// de 12/09/2026 expos: o duble desenha os filhos SEMPRE, inclusive com `visible={false}`. Para
// o teste isso e' proposital — ele inspeciona props sem abrir nada. Para a IMAGEM e' mentira:
// a primeira vitrine mostrou a lista do `Select` e a folha do `Combobox` ABERTAS, empilhadas
// sob o campo, quando as duas estavam fechadas. Quem olhasse veria um componente quebrado que
// duplica o proprio campo.
//
// **Registro continua recebendo a instancia dos dois jeitos** — o que muda e' so' o que sai no
// DOM quando a vitrine esta' ligada.
const ModalDuble = criarPrimitivo("Modal");
export const Modal = (props: Props) => {
  const desenhado = ModalDuble(props);
  if (vitrine && props.visible === false) {
    // Registra (o `ModalDuble` acima ja' fez) e NAO desenha. A folha fechada some da imagem,
    // que e' o que acontece na tela.
    return null;
  }
  return desenhado;
};
(Modal as {displayName?: string}).displayName = "Modal";
export const KeyboardAvoidingView = criarPrimitivo("KeyboardAvoidingView");

let plataforma: "ios" | "android" = "android";
/** Troca a plataforma que o proximo render vai ler. */
export function __definirPlataforma(v: "ios" | "android"): void { plataforma = v; }
export const Platform = {
  get OS() { return plataforma; },
  select: <T,>(m: {ios?: T; android?: T; default?: T}) =>
    (plataforma === "ios" ? m.ios : m.android) ?? m.default,
};

export type KeyboardTypeOptions = string;

// `Linking.openSettings` e' o caminho que o `PhotoInput` oferece quando a pessoa negou a camera
// de vez. O teste precisa saber SE ele foi chamado — abrir configuracao de verdade nao ha' como.
export const __chamadasDeSistema: string[] = [];
export const Linking = {
  openSettings: () => { __chamadasDeSistema.push("openSettings"); return Promise.resolve(); },
  openURL: (u: string) => { __chamadasDeSistema.push("openURL:" + u); return Promise.resolve(); },
};
