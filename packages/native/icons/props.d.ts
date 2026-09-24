// GERADO por packages/native/build-icons-native.mjs. NÃO EDITAR.
// Glifo do @carbon/icons (IBM Corp., Apache-2.0) — ver NOTICE. Desenho copiado sem alteração.
import type {SvgProps} from "react-native-svg";

export type AureaIconProps = Omit<SvgProps, "color"> & {
  /** Lado do quadrado, em dp. O desenho é 32x32 e escala a partir daí. */
  size?: number;
  /**
   * Cor do glifo. O padrão é PRETO EXPLÍCITO, não herança: `currentColor` não existe no
   * React Native, e o desenho do Carbon não traz `fill` nenhum. Passe a cor do tema —
   * `useAureaTokens().color.foreground` — em vez de aceitar o padrão.
   */
  color?: string;
};
