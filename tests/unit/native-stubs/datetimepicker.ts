// Dublê de `@react-native-community/datetimepicker`.
//
// Ele é um MÓDULO NATIVO: o diálogo que ele abre é código Kotlin/ObjC, e não existe no Node. O
// que o teste pode provar é o CONTRATO — que o `DatePicker` chama o caminho certo por plataforma,
// e que ele distingue "escolheu" de "cancelou".
export const __aberturas: Array<Record<string, unknown>> = [];
export function __limparSeletor(): void { __aberturas.length = 0; }

export const DateTimePickerAndroid = {
  open: (args: Record<string, unknown>) => { __aberturas.push(args); },
  dismiss: () => Promise.resolve(true),
};

// O componente do iOS. Registra as props, como os outros dublês.
const Seletor = (props: Record<string, unknown>) => { __aberturas.push(props); return null; };
export default Seletor;
