// As reprovações que JÁ EXISTIAM quando a varredura WEB-48 nasceu (lote 104, 25/11/2026), cada uma pelo nome: página ·
// o que · a peça. Consertar muda a aparência, e isso é decisão do Victor, com imagem (a lista, com as fotos de cada uma,
// está no documento de decisões dele, fora do repositório). A lista só DIMINUI: a varredura reprova a reprovação nova e
// também a exceção que deixou de reprovar. Medidas no Chromium em duas rodadas completas, com a mesma lista.
export const CONHECIDAS_CORES_FORCADAS: readonly string[] = [
  // O FOCO que some no nativo, no navegador (7) — o grupo 6 do lote 110: some também FORA do alto contraste (o campo
  // invisível do `DatePicker` por cima do gatilho, o campo escondido do `OTPField`, a área que rola do `Screen`). Mudar
  // isso muda o modo normal, e vai ao Victor com imagem, num lote à parte.
  "native-datepicker.html · foco · input \"Date (sm)\"",
  "native-datepicker.html · foco · input \"Delivery\"",
  "native-datepicker.html · foco · input \"Due date\"",
  "native-datepicker.html · foco · input \"Start date\"",
  "native-otpfield.html · foco · input.css-11aywtz.r-6taxm2 \"Card PIN\"",
  "native-otpfield.html · foco · input.css-11aywtz.r-6taxm2 \"Code sent by SMS\"",
  "native-screen.html · foco · div.css-g5y9jx.r-150rngu \"FuelTollsParkingLunchHot\"",
  // O lote 110 (26/11/2026) consertou as outras 56: o foco da web (7, com o do `RadioGroup` em cartão, que era da foto) e
  // os 49 estados (a regra do destaque do sistema, no `aurea.css` e no `altocontraste.tsx` do nativo).
];
// "Menos movimento": nenhuma reprovação no dia em que a varredura nasceu.
export const CONHECIDAS_MOVIMENTO: readonly string[] = [];

// AS INTERMITENTES: reprovação de verdade que só aparece em algumas rodadas. Não reprovam quando aparecem nem quando somem.
// A chave de tema e o segmento, que moravam aqui, foram consertados no lote 110 (26/11/2026): a lista ficou vazia, e
// assim deve ficar — reprovação que vai e vem é defeito, e se conserta.
export const INTERMITENTES: readonly string[] = [];
