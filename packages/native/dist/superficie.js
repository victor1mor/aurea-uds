// ADR-0078 (0.40.1 no nativo): "estou numa superfície branca". No CLARO, o campo solto na tela é a cor do cartão
// com a sombra leve (`fundoDeCampo`, em `estilos.ts`); dentro de uma superfície que pinta a cor do cartão, ele volta
// ao cinza de antes — branco no branco só a sombra separa. Na web quem avisa é a cascata (`--field-fill`); aqui, este
// contexto, que o `Card` liga (o de contorno e o `inset` herdam de quem está em volta; o `contrast` liga), e também o
// `Dialog`, o `Drawer`, a `BottomSheet`, o conteúdo do `Popover`, o `Accordion` com `surface`, o `Header` flutuante e
// o de pílula e o `ScrollShadow` de superfície. Peça nova que pinta a cor do cartão e recebe conteúdo do app liga
// também. O `Alert`, o `Toast` e a célula da `Table` não: são um elemento só para o leitor de tela, e campo dentro
// deles some no iPhone (check 43). Interno ao pacote: não sai pela porta da frente (nome com inicial maiúscula conta
// como componente).
import * as React from "react";
export const NaSuperficie = React.createContext(false);
/** `true` dentro de uma superfície branca da Aurea (ou do app que ligou o contexto). */
export const useNaSuperficie = () => React.useContext(NaSuperficie);
