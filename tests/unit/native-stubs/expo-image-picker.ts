// Dublê de `expo-image-picker`.
//
// Módulo nativo também, e aqui o que importa provar é o FLUXO DE PERMISSÃO — a parte que eu
// recomendei adiar e que o Victor mandou fazer. O dublê deixa o teste dizer o que o sistema
// responde, porque é exatamente aí que estão as decisões:
//
//   granted: true                       -> abre
//   granted: false, canAskAgain: true   -> pergunta de novo
//   granted: false, canAskAgain: false  -> NAO pergunta (o sistema nao mostraria nada)
//
// R-23 (06/10/2026): ele também guarda as OPÇÕES de cada abertura (`__opcoes`), para o teste
// conferir o que o componente pediu ao sistema (`exif`, várias de uma vez), e a foto pode trazer
// `exif`, como a de verdade.
type Permissao = {granted: boolean; canAskAgain: boolean; status: string};
type Foto = {uri: string; width?: number; height?: number; exif?: Record<string, unknown> | null};

let permissao: Permissao = {granted: true, canAskAgain: true, status: "granted"};
let resultado: {canceled: boolean; assets: Foto[] | null} =
  {canceled: false, assets: [{uri: "file:///foto.jpg"}]};

export const __chamadas: string[] = [];
export const __opcoes: Array<Record<string, unknown> | undefined> = [];
export function __definirPermissao(p: Partial<Permissao>): void {
  permissao = {granted: true, canAskAgain: true, status: "granted", ...p};
}
export function __definirResultado(r: {canceled: boolean; assets?: Foto[] | null}): void {
  resultado = {canceled: r.canceled, assets: r.assets ?? null};
}
export function __limparPicker(): void {
  __chamadas.length = 0;
  __opcoes.length = 0;
  permissao = {granted: true, canAskAgain: true, status: "granted"};
  resultado = {canceled: false, assets: [{uri: "file:///foto.jpg"}]};
}

export const getCameraPermissionsAsync = () => {
  __chamadas.push("get"); return Promise.resolve(permissao);
};
export const requestCameraPermissionsAsync = () => {
  __chamadas.push("request"); return Promise.resolve(permissao);
};
export const launchCameraAsync = (opcoes?: Record<string, unknown>) => {
  __chamadas.push("camera"); __opcoes.push(opcoes); return Promise.resolve(resultado);
};
export const launchImageLibraryAsync = (opcoes?: Record<string, unknown>) => {
  __chamadas.push("library"); __opcoes.push(opcoes); return Promise.resolve(resultado);
};
