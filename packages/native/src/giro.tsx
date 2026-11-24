// Aurea nativo — o ANEL QUE GIRA, o desenho do `Spinner`, num arquivo só dele (0.80.0).
//
// Saiu do `feedback.tsx` quando o `Button` ganhou o `loading` (o Victor, 24/11/2026: *"Igual à web"*): o botão põe a
// rodinha no lugar do ícone, na COR DO TEXTO dele — o `.spinner` da web pinta com `currentColor` —, e o `Spinner`
// público pinta com a cor do texto da página. O desenho, o giro e a parada com "reduzir movimento" são um só; a cor e o
// tamanho vêm de quem usa. Morar aqui evita a volta `actions` ↔ `feedback` (o `feedback` já importa o `Button`).
import * as React from "react";
import {Animated, Easing, type StyleProp, type ViewStyle} from "react-native";
import Svg, {Circle} from "react-native-svg";
import {canto} from "./estilos.js";
import {useReduceMotion, driverNativo} from "./movimento.js";
import {useAureaTokens} from "./theme.js";

export interface AnelQueGiraProps {
  /** O lado da caixa do anel. */
  lado: number;
  /** A cor do traço. */
  cor: string;
  /** O que o leitor de tela recebe — o `Spinner` diz "carregando"; o botão esconde (ele mesmo diz "ocupado"). */
  acessibilidade: object;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * O anel que gira. **700 ms, linear** — o mesmo `.7s linear` do `.spinner` da web.
 *
 * ⚠ **Ele para quando a pessoa pede menos movimento.** Na web a regra global de `prefers-reduced-motion` já fazia isso;
 * aqui é o componente que pergunta, porque não há cascata para fazê-lo por ele. Parado, o anel continua desenhado.
 */
export function AnelQueGira({lado, cor, acessibilidade, style, testID}: AnelQueGiraProps) {
  const t = useAureaTokens();
  const reduzir = useReduceMotion();
  const giro = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // `!== false` e não `!reduzir`: enquanto é `null` o sistema ainda não respondeu, e
    // animar nesse vão é animar na cara de quem talvez tenha pedido que não.
    if (reduzir !== false) return;
    const laco = Animated.loop(Animated.timing(giro, {
      toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: driverNativo(),
    }));
    laco.start();
    // Sem o `stop` o laço sobrevive à desmontagem e continua acordando o JS — o vazamento
    // clássico de `Animated.loop`.
    return () => laco.stop();
  }, [giro, reduzir]);

  // Sem linha (16/10/2026): o anel era BORDA (3/4 da volta). Agora é o mesmo arco desenhado, como a
  // máscara da web — 2 de espessura em qualquer tamanho, por isso a conta em unidades do desenho.
  const traco = (2 * 16) / lado;
  const raio = 8 - traco / 2;
  const volta = 2 * Math.PI * raio;
  return (
    <Animated.View
      testID={testID}
      {...acessibilidade}
      style={[
        // HER-01: a ÚNICA peça com o canto `circular`, declarada. O anel GIRA, e um contorno que não seja círculo
        // perfeito balança ao girar. A referência também deixa o `Spinner` de fora das 24 peças com canto contínuo.
        canto(t.size.radiusFull, "circular"),
        {width: lado, height: lado},
        {transform: [{rotate: giro.interpolate({inputRange: [0, 1], outputRange: ["0deg", "360deg"]}) }]},
        style,
      ]}>
      <Svg width={lado} height={lado} viewBox="0 0 16 16">
        <Circle cx={8} cy={8} r={raio} fill="none" stroke={cor} strokeWidth={traco}
                strokeDasharray={`${volta * 0.75} ${volta * 0.25}`} />
      </Svg>
    </Animated.View>
  );
}
