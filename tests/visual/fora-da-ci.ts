// As provas que o job `provas` da CI NÃO roda, cada uma com o motivo (lote 105, 25/11/2026).
//
// O job `provas` (`.github/workflows/ci.yml`, com `AUREA_PROVAS=1`) roda no Chromium toda prova de `tests/visual/` que
// nenhum outro job roda. As daqui reprovam no Linux da CI E no Windows do Victor, e o conserto delas é uma decisão do
// Victor, não um acerto de teste: por isso ficam fora, com o motivo, até ele decidir. Continuam rodando na suíte local.
//
// Cada entrada sai pelo título do teste (`grepInvert` do `playwright.config.ts`), não pelo arquivo: as outras provas do
// mesmo arquivo continuam na CI. Quem tirar uma entrada daqui tem de ver a prova passar no job `provas`.

export const FORA_DA_CI: {arquivo: string; titulo: RegExp; motivo: string}[] = [
  {
    arquivo: "ember-congelada.spec.ts",
    titulo: /a ember no (claro|escuro) sai com as cores da 0\.44\.0/,
    motivo:
      "A Ember não está mais igual à 0.44.0: no claro, 7 cores de um campo; no escuro, 73 (as marcas da chave, da caixa de " +
      "marcar e dos campos, de preto para branco). Desde 14/11/2026 a Ember recebe o que cada lote faz, e a fotografia " +
      "de 0.44.0 ficou velha. Regravar a fotografia (EMBER_GRAVAR) é aceitar as cores de hoje como as novas congeladas: " +
      "é decisão do Victor, olhando.",
  },
  {
    arquivo: "marca.spec.ts",
    titulo: /marca · o crachá semântico se lê em toda combinação.*ember · light/,
    motivo:
      "O crachá `danger` cheio da Ember no claro mede 4,03:1 (a prova pede 4,5:1). Era aceito pelo Victor desde a 0.33.0 " +
      "(a falha conhecida \"fora da CI\"), mas a prova nunca ganhou a exceção. Escrever a exceção ou mudar a cor é decisão " +
      "dele.",
  },
];
