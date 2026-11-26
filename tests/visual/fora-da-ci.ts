// As provas que o job `provas` da CI NÃO roda, cada uma com o motivo (lote 105, 25/11/2026).
//
// O job `provas` (`.github/workflows/ci.yml`, com `AUREA_PROVAS=1`) roda no Chromium toda prova de `tests/visual/` que
// nenhum outro job roda. As daqui reprovam no Linux da CI E no Windows do Victor, e o conserto delas é uma decisão do
// Victor, não um acerto de teste: por isso ficam fora, com o motivo, até ele decidir. Continuam rodando na suíte local.
//
// Cada entrada sai pelo título do teste (`grepInvert` do `playwright.config.ts`), não pelo arquivo: as outras provas do
// mesmo arquivo continuam na CI. Quem tirar uma entrada daqui tem de ver a prova passar no job `provas`.

// Vazia desde o lote 106 (26/11/2026): as duas que estavam aqui (a fotografia da Ember e o crachá `danger` dela no claro)
// foram ajustadas com a decisão do Victor (*"Sim, ajustar"*) e voltaram à CI.
export const FORA_DA_CI: {arquivo: string; titulo: RegExp; motivo: string}[] = [];
