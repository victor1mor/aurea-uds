// A BIBLIOTECA DE DOCUMENTOS NO SITE (bloco 1, o 5-A — 23/10/2026). O `@aurea-uds/native/system/file` importa o
// `expo-document-picker`, que puxa o `expo-modules-core` pelo fonte (TypeScript cru) — o Vite não o monta. No navegador, a
// janela de documentos vira o seletor de arquivos, que é o que a versão web da própria biblioteca faz: só a função que o
// `FileInput` chama, `getDocumentAsync`, com o mesmo formato de resposta (`canceled` e `assets`).
export function getDocumentAsync({type, multiple = false} = {}) {
  return new Promise((resolver) => {
    const campo = document.createElement("input");
    campo.type = "file";
    if (type) campo.accept = Array.isArray(type) ? type.join(",") : type;
    campo.multiple = multiple;
    campo.addEventListener("change", () => {
      const arquivos = Array.from(campo.files ?? []);
      resolver(arquivos.length
        ? {canceled: false, assets: arquivos.map((a) => ({uri: URL.createObjectURL(a), name: a.name, size: a.size, mimeType: a.type}))}
        : {canceled: true, assets: null});
    });
    campo.addEventListener("cancel", () => resolver({canceled: true, assets: null}));
    campo.click();
  });
}
