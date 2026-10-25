// A BIBLIOTECA DE DATA NO SITE (bloco 1, o 5-A — 23/10/2026). O `@aurea-uds/native/system` importa o
// `@react-native-community/datetimepicker`, que não tem versão de navegador e cujo fonte é Flow (o Vite não o lê). No navegador,
// o `DatePicker` do nativo nem chega a usá-la: abre o calendário do PRÓPRIO navegador (o E16, `sistema.tsx`). Este arquivo só
// existe para o import carregar — por isso não desenha nada.
export const DateTimePickerAndroid = {open: () => {}, dismiss: () => Promise.resolve(true)};
export default function RNDateTimePicker() { return null; }
