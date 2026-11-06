// Dublê de `react-native-safe-area-context` para os testes do `Screen`.
//
// Mesma razão dos outros dois dublês: a biblioteca importa `react-native`, que é escrito em Flow
// e nenhum transform do vitest lê. E há uma razão a mais, específica desta: **ela é um módulo
// NATIVO** (`android/`, `ios/`, `common/cpp/` no tarball — medido em 03/09/2026). Não existe
// implementação JavaScript para o Node rodar; o que calcula o inset é código Kotlin/ObjC.
//
// O `SafeAreaView` daqui usa o MESMO registro dos primitivos do dublê de `react-native`, então
// `__instancias("SafeAreaView")` e `__limpar()` funcionam iguais aos outros — e o teste consegue
// ler que borda e que estilo o `Screen` pediu.
//
// O limite, declarado: **isto não calcula inset nenhum.** Insets vêm do aparelho, e o que se pode
// provar aqui é o CONTRATO — quais bordas o `Screen` passa, em que forma, e onde o padding cai.
import * as React from "react";
import {criarPrimitivo} from "./react-native.js";

export const SafeAreaView = criarPrimitivo("SafeAreaView");
export const SafeAreaProvider = criarPrimitivo("SafeAreaProvider");

// E10 (0.12.1): as folhas de baixo leem o recuo do CONTEXTO (que atravessa o `Modal`) e, sem
// provider, a medida da abertura. Como na biblioteca: o contexto começa nulo, e
// `initialWindowMetrics` pode ser nulo.
type Insets = {top: number; right: number; bottom: number; left: number};
export const SafeAreaInsetsContext = React.createContext<Insets | null>(null);
export let initialWindowMetrics: {insets: Insets; frame: {x: number; y: number; width: number; height: number}} | null = null;

// 🔴 O GANCHO É HONESTO DESDE 05/11/2026 (auditoria externa). Este dublê devolvia o recuo SEMPRE, e a biblioteca real
// (`SafeAreaContext.js`, medido na 5.9.1) LEVANTA ERRO quando não há `SafeAreaProvider` em cima: "No safe area value
// available". Com o dublê mentindo, o `ToastHost` e o `BottomNav` chamavam o gancho direto, quebravam em app sem o
// provedor, e nenhum teste via. Agora ele faz o mesmo que a biblioteca: sem contexto, erro. As peças da Aurea leem o
// CONTEXTO, com a medida da abertura e o zero como reserva (o jeito do `menu.tsx`), e não chamam este gancho.
export const useSafeAreaInsets = (): Insets => {
  const v = React.useContext(SafeAreaInsetsContext);
  if (v == null) throw new Error("No safe area value available. Make sure you are rendering `<SafeAreaProvider>` at the top of your app.");
  return v;
};
/** Define o recuo que a peça vai ler sem provedor: a medida da ABERTURA (`initialWindowMetrics`). O `BottomNav` do Lote 3
 *  lê o recuo de baixo para não ficar sob a barra de gestos, e o teste precisa poder dizer que ela existe. Zero por padrão. */
export function __definirInsets(v: Partial<Insets>): void {
  initialWindowMetrics = {insets: {top: 0, right: 0, bottom: 0, left: 0, ...v}, frame: {x: 0, y: 0, width: 400, height: 800}};
}
/** Define a medida da abertura (`initialWindowMetrics`); `null` apaga. */
export function __definirMetricasIniciais(bottom: number | null): void {
  initialWindowMetrics = bottom == null ? null
    : {insets: {top: 0, right: 0, bottom, left: 0}, frame: {x: 0, y: 0, width: 400, height: 800}};
}

export type Edge = "top" | "right" | "bottom" | "left";
export type EdgeMode = "off" | "additive" | "maximum";
export type Edges = readonly Edge[] | Readonly<Partial<Record<Edge, EdgeMode>>>;
export type EdgeInsets = {top: number; right: number; bottom: number; left: number};
