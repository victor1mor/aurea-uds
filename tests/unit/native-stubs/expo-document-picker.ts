// Dublê de `expo-document-picker` (R-21, 02/10/2026).
//
// O seletor de arquivos é do sistema (Kotlin/Swift); sem dublê o teste nem resolveria o import.
// O que o teste precisa dizer é O QUE O SISTEMA DEVOLVEU — cancelado, um arquivo, vários, um
// grande demais — e conferir O QUE A PEÇA PEDIU (`type`, `multiple`). A forma do resultado é a
// do `types.d.ts` da 57.0.3: `{canceled: true, assets: null}` ou `{canceled: false, assets}`.
type Ativo = {uri: string; name: string; size?: number; mimeType?: string; lastModified: number};
type Resultado = {canceled: true; assets: null} | {canceled: false; assets: Ativo[]};

const PADRAO: Resultado = {
  canceled: false,
  assets: [{uri: "file:///cache/doc.pdf", name: "doc.pdf", size: 2048, mimeType: "application/pdf", lastModified: 0}],
};
let resultado: Resultado = PADRAO;

/** As opções de cada chamada a `getDocumentAsync`, em ordem. */
export const __pedidos: Array<Record<string, unknown>> = [];
export function __definirDocumentos(r: Resultado): void { resultado = r; }
export function __limparDocumentos(): void { __pedidos.length = 0; resultado = PADRAO; }

export const getDocumentAsync = (opcoes: Record<string, unknown> = {}) => {
  __pedidos.push(opcoes);
  return Promise.resolve(resultado);
};
