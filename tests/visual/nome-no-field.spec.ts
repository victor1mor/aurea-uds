import {test, expect} from "@playwright/test";

// 0.68.0: o `Field` dá o NOME e a FRASE DE ERRO ao campo do `NumberField`, do `OTPField`, do `InputGroup` e do `FileInput`.
// Mede no navegador, nos exemplos "com erro" do site (o código de verdade, `<Field label error>` em volta, a peça SEM nome
// próprio): o nome e a descrição que a árvore de acessibilidade entrega ao leitor de tela, nos três navegadores. Provado
// contra o defeito: no código de antes (a 0.67.0), o `NumberField` e o `InputGroup` saíam sem nome, o `OTPField` só com
// "Digit 1", o `FileInput` só com o texto da área, e nenhum com a frase de erro.

const CASOS = [
  {nome: "NumberField", pagina: "pattern-numberfield-a-quantity-the-form-refused", campo: ".number-field-group > input",
    esperado: ["Seats"], erro: "Pick at least one seat"},
  {nome: "InputGroup", pagina: "pattern-inputgroup-an-address-the-form-refused", campo: ".input-group > .input",
    esperado: ["Website"], erro: "Enter a full address"},
  {nome: "OTPField", pagina: "pattern-otpfield-a-code-that-did-not-match", campo: ".otp-slot",
    esperado: [1, 2, 3, 4, 5, 6].map((n) => `Verification code Digit ${n}`), erro: "That code did not match"},
  {nome: "FileInput", pagina: "fileinput", campo: ".dropzone input[type=file]",
    esperado: ["Proof of address Drag files here or click to select"], erro: "Attach a document"},
  // A página do COMPONENTE também mostra o erro (13/11/2026): a 0.67.0 pôs o exemplo da web só em Patterns, e o Victor
  // procurou na página da peça. Sem o exemplo "With an error" nela, o Field com a frase não existe e o teste reprova.
  {nome: "NumberField", pagina: "numberfield", campo: ".number-field-group > input",
    esperado: ["Seats"], erro: "Pick at least one seat"},
  {nome: "InputGroup", pagina: "inputgroup", campo: ".input-group > .input",
    esperado: ["Website"], erro: "Enter a full address"},
  {nome: "OTPField", pagina: "otpfield", campo: ".otp-slot",
    esperado: [1, 2, 3, 4, 5, 6].map((n) => `Verification code Digit ${n}`), erro: "That code did not match"},
];

for (const {nome, pagina, campo, esperado, erro} of CASOS) {
  test(`${nome} dentro de um Field (${pagina}): o campo se chama pelo rótulo e lê a frase de erro`, async ({page}) => {
    await page.goto(`/apps/catalog/${pagina}.html`);
    // o Field com erro desta peça: o que tem a frase esperada
    const field = page.locator(".field", {has: page.locator(":scope > .field-error", {hasText: erro})}).first();
    // na página de componente o exemplo mora num <details> fechado: o que está fechado fica fora da árvore de
    // acessibilidade (nome ""), então abre e rola até ele, como a pessoa faz (a lição do meio-marcado, 0.64.0)
    await field.evaluate((f) => { for (let d = f.closest("details"); d; d = d.parentElement?.closest("details") ?? null) d.open = true; });
    await field.scrollIntoViewIfNeeded();
    const campos = field.locator(campo);
    await expect(campos).toHaveCount(esperado.length);
    for (const [i, nomeEsperado] of esperado.entries()) {
      await expect(campos.nth(i)).toHaveAccessibleName(nomeEsperado);
      await expect(campos.nth(i)).toHaveAccessibleDescription(erro);
    }
    // e o Field não é mais um grupo com o mesmo rótulo e a mesma frase (o leitor de tela diria duas vezes)
    await expect(field).not.toHaveAttribute("role", "group");
  });
}
