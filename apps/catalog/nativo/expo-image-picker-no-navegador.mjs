// A BIBLIOTECA DE FOTOS NO SITE (bloco 1, o 5-A — 23/10/2026). O `@aurea-uds/native/system` importa o `expo-image-picker`,
// que puxa o `expo` pelo fonte — o Vite não o monta. No navegador, a câmera e a galeria viram o seletor de arquivos (com
// `capture` na câmera), que é o que a versão web da própria biblioteca faz; só as quatro funções que o `PhotoInput` chama.
// O navegador sempre libera (não há o "negado" do aparelho), e a foto não traz a data (`takenAt` vazio): a página diz.
const concedido = {granted: true, canAskAgain: true, status: "granted", expires: "never"};
export const getCameraPermissionsAsync = async () => concedido;
export const requestCameraPermissionsAsync = async () => concedido;
function escolher({capture = false, allowsMultipleSelection = false} = {}) {
  return new Promise((resolver) => {
    const campo = document.createElement("input");
    campo.type = "file";
    campo.accept = "image/*";
    campo.multiple = allowsMultipleSelection;
    if (capture) campo.setAttribute("capture", "environment");
    campo.addEventListener("change", () => {
      const arquivos = Array.from(campo.files ?? []);
      resolver(arquivos.length
        ? {canceled: false, assets: arquivos.map((a) => ({uri: URL.createObjectURL(a)}))}
        : {canceled: true, assets: null});
    });
    campo.addEventListener("cancel", () => resolver({canceled: true, assets: null}));
    campo.click();
  });
}
export const launchCameraAsync = (o) => escolher({...o, capture: true});
export const launchImageLibraryAsync = (o) => escolher(o);
