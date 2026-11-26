import { type ViewProps } from "react-native";
/** A marca do alto contraste, só no navegador. No aparelho, nada (o `dataSet` não existe lá). */
export declare function marcaHC(tipo: "ligada" | "desligada" | "miolo" | "caixa" | "escolhida"): ViewProps;
/** A folha da regra, só no navegador: a peça que leva a marca chama este gancho, e a folha entra no `<head>` uma vez. */
export declare function useRegraDoAltoContraste(): void;
