// Aurea nativo — as strings visíveis que os componentes precisam dizer sozinhos.
//
// ── POR QUE ISTO É PEQUENO, E É DE PROPÓSITO ─────────────────────────────────────────────────
// O `@aurea-uds/react` tem uma tabela de i18n com mais de duzentas chaves (`AureaStrings` no
// `pure.tsx`), porque lá existem 124 componentes — paleta de comandos, grade de dados, editor de
// blocos. **Trazer aquela tabela para cá seria trazer o contrato de componentes que não existem
// no alvo nativo**, e quem a implementasse teria de preencher chave de coisa que nunca vai
// desenhar.
//
// Então aqui a tabela é do tamanho do que HÁ: os sete estados universais, mais as quatro frases
// que `DataState` e `EmptyState` dizem quando ninguém lhes deu texto. Ela cresce com os lotes,
// e cada chave nova nasce com um componente que a usa. **Chave sem consumidor não entra.**
//
// O padrão é INGLÊS, como na web desde o Balde A do `AUREA.md` — e o `ptBR` segue disponível,
// com as mesmas frases que o `pure.tsx` publica. Elas foram COPIADAS de lá, não reescritas: duas
// traduções do mesmo estado é como um sistema passa a falar duas línguas.
export const AUREA_UNIVERSAL_STATES = [
    "waiting_user", "waiting_approval", "waiting_dependency",
    "offline", "stale", "partial", "degraded",
];
/**
 * A gravidade de um estado universal, e a regra é a MESMA linha da web:
 * `state.startsWith("waiting_") ? "info" : "warning"`.
 *
 * Esperar não é problema — é o sistema funcionando e avisando. Estar `stale`, `partial`,
 * `degraded` ou `offline` é. Trocar isso faria a tela gritar onde deveria informar.
 */
export const gravidadeDoEstado = (estado) => estado.startsWith("waiting_") ? "info" : "warning";
/** Inglês, o idioma base do produto. É o que vale sem `strings` no provider. */
export const defaultStrings = {
    loading: "Loading",
    dataError: "This could not be loaded.",
    dataEmpty: "Nothing here yet",
    bottomNavLabel: "Main",
    tabsLabel: "Tabs",
    stepperLabel: "Steps",
    datePlaceholder: "Pick a date",
    cameraDenied: "Camera access is off. Turn it on in Settings to attach a photo.",
    openSettings: "Open Settings",
    photoRemove: "Remove photo",
    passwordShow: "Show password",
    passwordHide: "Hide password",
    close: "Close",
    confirmCancel: "Cancel",
    confirmProceed: "Continue",
    dismissNotification: "Dismiss notification",
    tableLabel: "Table",
    chartLabel: "Chart",
    increment: "Increase",
    decrement: "Decrease",
    comboboxEmpty: "No results",
    comboboxClear: "Clear selection",
    themeToDark: "Switch to dark theme",
    themeToLight: "Switch to light theme",
    comboboxLoading: "Loading…",
    comboboxSearch: "Search",
    searchClear: "Clear search",
    galleryLabel: "Gallery",
    universalState: {
        waiting_user: "Waiting for someone to act.",
        waiting_approval: "Waiting for approval.",
        waiting_dependency: "Waiting for something else to finish.",
        offline: "No connection. This was loaded earlier.",
        stale: "This may be out of date.",
        partial: "Some of this could not be loaded.",
        degraded: "Working with reduced capability.",
    },
};
/** Português, copiado do `ptBR` do `@aurea-uds/react` — não retraduzido. */
export const ptBR = {
    loading: "Carregando",
    dataError: "Não foi possível carregar.",
    dataEmpty: "Ainda não há nada aqui",
    bottomNavLabel: "Principal",
    tabsLabel: "Abas",
    stepperLabel: "Etapas",
    datePlaceholder: "Escolher data",
    cameraDenied: "O acesso à câmera está desligado. Ligue nas configurações para anexar uma foto.",
    openSettings: "Abrir configurações",
    photoRemove: "Remover foto",
    passwordShow: "Mostrar senha",
    passwordHide: "Ocultar senha",
    close: "Fechar",
    confirmCancel: "Cancelar",
    confirmProceed: "Continuar",
    dismissNotification: "Dispensar notificação",
    tableLabel: "Tabela",
    chartLabel: "Gráfico",
    increment: "Aumentar",
    decrement: "Diminuir",
    comboboxEmpty: "Nenhum resultado",
    comboboxClear: "Limpar seleção",
    themeToDark: "Mudar para o tema escuro",
    themeToLight: "Mudar para o tema claro",
    comboboxLoading: "Carregando…",
    comboboxSearch: "Buscar",
    searchClear: "Limpar busca",
    galleryLabel: "Galeria",
    universalState: {
        waiting_user: "Esperando alguém agir.",
        waiting_approval: "Esperando aprovação.",
        waiting_dependency: "Esperando outra coisa terminar.",
        offline: "Sem conexão. Isto foi carregado antes.",
        stale: "Isto pode estar desatualizado.",
        partial: "Parte disto não pôde ser carregada.",
        degraded: "Funcionando com capacidade reduzida.",
    },
};
