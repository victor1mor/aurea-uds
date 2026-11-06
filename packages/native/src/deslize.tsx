// Aurea nativo — O ESCOLHIDO DESLIZA (S-04, 05/11/2026), o par do `useDeslize` da web.
//
// O Victor achou o escolhido do `SegmentedControl` e do `Tabs` PULANDO de um item ao outro. A referência tem uma peça
// separada atrás dos itens, que anda até o escolhido; aqui é esta. Aprovado na bancada da web (*"Pode, Ember também"*),
// e levado ao nativo pela regra do §8 (peça editada se confere no outro alvo).
//
// ⚠ **POR QUE QUADRO A QUADRO, E NÃO `Animated.timing`.** O indicador muda de LARGURA (os itens não têm a mesma), e a
// largura não anda pelo motor de animação do aparelho — ele só move `transform` e `opacity`. E o pacote não escreve o
// `useNativeDriver` à mão (o `native-e13.test.tsx` cobra que seja sempre `driverNativo()`, que no aparelho é `true`).
// Esticar com `scaleX` deformaria as pontas da cápsula. Então a peça anda pelo relógio da tela
// (`requestAnimationFrame`), com o tempo e a curva dos tokens (`durationSlow`, `easeEmphasized`) — os mesmos da web.
// São uns 17 quadros, e só o indicador se redesenha: o estado é DELE, não do controle.
//
// Quem pediu menos movimento vê a troca de uma vez (`useReduceMotion`, `movimento.ts`) — e, enquanto o sistema não
// respondeu, também: a primeira posição nunca anima.
import * as React from "react";
import {Easing, View, type LayoutChangeEvent, type StyleProp, type ViewStyle} from "react-native";
import {useReduceMotion} from "./movimento.js";
import {useAureaTokens} from "./theme.js";

/** O lugar de um item dentro da fila, como o `onLayout` dele diz. */
export type CaixaDoItem = {x: number; y: number; width: number; height: number};

const mesma = (a: CaixaDoItem | null, b: CaixaDoItem | null) =>
  !!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

/**
 * A medida de cada item da fila e a do escolhido — o par do indicador. `medir(chave)` vai no `onLayout` de cada item;
 * `pronto` diz quando o indicador já está no lugar, e só então o item deixa de se pintar (antes, ele se pinta, como
 * sempre — nenhum quadro fica sem o escolhido).
 */
export function useFilaQueDesliza(ativo: string | undefined) {
  const [caixas, setCaixas] = React.useState<Record<string, CaixaDoItem>>({});
  const [pronto, setPronto] = React.useState(false);
  const medir = React.useCallback((chave: string) => (e: LayoutChangeEvent) => {
    const {x, y, width, height} = e.nativeEvent.layout;
    const nova = {x, y, width, height};
    setCaixas((c) => (mesma(c[chave] ?? null, nova) ? c : {...c, [chave]: nova}));
  }, []);
  const alvo = ativo != null ? caixas[ativo] ?? null : null;
  return {medir, alvo, pronto: pronto && alvo != null, aoFicarPronto: setPronto};
}

/**
 * A peça que anda. Mora DENTRO da fila, como primeiro filho, atrás dos itens; `style` é a pintura do escolhido (a mesma
 * que o item usa), e `children` o que mais ela leva (o fio da aba secundária).
 */
export function IndicadorQueDesliza({alvo, aoFicarPronto, style, children}: {
  alvo: CaixaDoItem | null;
  aoFicarPronto: (pronto: boolean) => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const t = useAureaTokens();
  const reduzir = useReduceMotion();
  // A ORIGEM: o indicador fica em `left: 0, top: 0`, e o `onLayout` dele diz onde isso cai no mesmo sistema de
  // coordenadas dos itens (borda e recheio da fila incluídos, em qualquer plataforma). O deslocamento é a diferença.
  const [origem, setOrigem] = React.useState<{x: number; y: number} | null>(null);
  const [caixa, setCaixa] = React.useState<CaixaDoItem | null>(null);
  const atual = React.useRef<CaixaDoItem | null>(null);
  const {durationSlow} = t.size;
  const curva = t.easing.easeEmphasized;
  React.useEffect(() => {
    if (!alvo) return;
    const de = atual.current;
    if (!de || reduzir !== false || mesma(de, alvo)) { atual.current = alvo; setCaixa(alvo); return; }
    const ease = Easing.bezier(...curva);
    const t0 = Date.now();
    let quadro = 0;
    const passo = () => {
      const p = Math.min(1, (Date.now() - t0) / durationSlow);
      const e = ease(p);
      const entre = (a: number, b: number) => a + (b - a) * e;
      const c = {x: entre(de.x, alvo.x), y: entre(de.y, alvo.y), width: entre(de.width, alvo.width), height: entre(de.height, alvo.height)};
      atual.current = c;
      setCaixa(c);
      if (p < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    // Troca no meio do caminho: o próximo parte de onde a peça está (`atual`), e não do item de antes.
    return () => cancelAnimationFrame(quadro);
  }, [alvo?.x, alvo?.y, alvo?.width, alvo?.height, reduzir, durationSlow, curva]);
  const pronto = caixa != null && origem != null;
  React.useEffect(() => { aoFicarPronto(pronto); }, [pronto, aoFicarPronto]);
  return (
    <View
      collapsable={false}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      onLayout={(e) => {
        const {x, y} = e.nativeEvent.layout;
        setOrigem((o) => (o && o.x === x && o.y === y ? o : {x, y}));
      }}
      style={[
        {position: "absolute", left: 0, top: 0},
        pronto && caixa && origem
          ? {width: caixa.width, height: caixa.height, transform: [{translateX: caixa.x - origem.x}, {translateY: caixa.y - origem.y}]}
          : {width: 0, height: 0, opacity: 0},
        style,
      ]}>
      {children}
    </View>
  );
}
