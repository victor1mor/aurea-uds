// Aurea — escreve `icon-names.ts`: a lista dos nomes de ícone como TIPO. Achado A-04, 24/09/2026.
//
// Até a 0.10.0 `IconName` era `string` nos dois alvos, e `<Icon name="chevron-down">` (um traço
// só; o nome do Carbon é `chevron--down`) compilava, e na tela não desenhava nada. Agora o nome
// é checado pelo TypeScript.
//
// Quem chama são os dois geradores que já leem a fonte (`packages/icons/build-icons.mjs` para a
// web e `packages/native/build-icons-native.mjs` para o nativo), com a MESMA lista que acabaram
// de desenhar. Uma função só, para que os dois arquivos saiam idênticos: o check 38 compara os
// dois e reprova se divergirem.
import {writeFileSync} from "node:fs";

/** @param {string[]} nomes em ordem alfabética  @param {string} destino caminho do `.ts` */
export function escreverNomesDeIcone(nomes, destino) {
  const linhas = nomes.map((n) => `  | ${JSON.stringify(n)}`).join("\n");
  writeFileSync(destino, `// GERADO por scripts/icon-names.mjs a partir do @carbon/icons (svg/32). Não editar à mão.
// Achado A-04: o nome do ícone é checado pelo TypeScript.

/** Os ${nomes.length} nomes do Carbon que a Aurea desenha, os mesmos na web e no nativo. */
export type CarbonIconName =
${linhas};

/**
 * Nomes que o APP acrescenta: um sprite próprio na web, um glifo de \`criarGlifo\` no nativo.
 * Vazio de propósito. O app declara os seus uma vez, e só eles passam a valer:
 *
 *     declare module "@aurea-uds/react" {       // ou "@aurea-uds/native"
 *       interface AureaIconNames { marca: true }
 *     }
 */
export interface AureaIconNames {}

/** Nome de ícone aceito: um do Carbon ou um que o app declarou em \`AureaIconNames\`. */
export type IconName = CarbonIconName | Extract<keyof AureaIconNames, string>;
`);
}
