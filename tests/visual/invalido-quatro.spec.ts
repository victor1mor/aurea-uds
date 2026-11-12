import {test, expect, type Page} from "@playwright/test";

// 0.67.0 (ADR-0094, "O que fica de fora"): o erro do `Field` chega ao `NumberField`, ao `OTPField`, ao `InputGroup` e ao
// `FileInput`. Mede no navegador, nos exemplos "com erro" do site (o código de verdade, `<Field error>` em volta): a caixa
// que desenha a peça tem a borda no `--danger-400`, o rótulo do `Field` também, e o fundo é o mesmo do campo sem erro
// (tirando a marca do MESMO controle). Provado contra o defeito: no código de antes, a marca não chegava, e a borda saía
// transparente nas quatro.

const SEM_TRANSICAO = "*,*::before,*::after{transition:none!important;animation:none!important}";

const PECAS = [
  {nome: "NumberField", pagina: "pattern-numberfield-a-quantity-the-form-refused", caixa: ".number-field-group", marca: ".number-field-group > input"},
  {nome: "OTPField", pagina: "pattern-otpfield-a-code-that-did-not-match", caixa: ".otp-slot", marca: ".otp-slot"},
  {nome: "InputGroup", pagina: "pattern-inputgroup-an-address-the-form-refused", caixa: ".input-group", marca: ".input-group > .input"},
  {nome: "FileInput", pagina: "fileinput", caixa: ".dropzone", marca: ".dropzone input[type=file]"},
];

async function abrir(page: Page, pagina: string, tema: "light" | "dark") {
  await page.goto(`/apps/catalog/${pagina}.html`);
  await page.addStyleTag({content: SEM_TRANSICAO});
  await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, tema);
}

for (const tema of ["light", "dark"] as const) {
  for (const {nome, pagina, caixa, marca} of PECAS) {
    test(`${tema}: ${nome} dentro de um Field com erro — a borda e o rótulo no vermelho, o fundo igual`, async ({page}) => {
      await abrir(page, pagina, tema);
      const r = await page.evaluate(({caixa, marca}) => {
        // o Field com erro desta peça: o primeiro que tem a caixa dela e a frase de erro
        const campo = [...document.querySelectorAll<HTMLElement>(".field")].find((f) => f.querySelector(caixa) && f.querySelector(":scope > .field-error"))!;
        const sonda = document.createElement("span");
        sonda.style.color = "var(--danger-400)";
        campo.append(sonda);
        const vermelho = getComputedStyle(sonda).color;
        sonda.remove();
        const desenho = campo.querySelector<HTMLElement>(caixa)!;
        const marcas = [...campo.querySelectorAll<HTMLElement>(marca)];
        const rotulo = campo.querySelector<HTMLElement>(":scope > .label")!;
        const ler = () => ({fundo: getComputedStyle(desenho).backgroundColor, borda: getComputedStyle(desenho).borderTopColor,
          rotulo: getComputedStyle(rotulo).color});
        const valores = marcas.map((m) => m.getAttribute("aria-invalid"));
        const com = ler();
        marcas.forEach((m) => m.removeAttribute("aria-invalid"));
        const sem = ler();
        marcas.forEach((m) => m.setAttribute("aria-invalid", "true"));
        return {vermelho, valores, com, sem};
      }, {caixa, marca});
      expect(r.valores.length, "a página tem o controle da peça").toBeGreaterThan(0);
      expect(r.valores, "o erro do Field chega a cada controle da peça").toEqual(r.valores.map(() => "true"));
      expect(r.com.borda, "a borda da peça com erro é a cor da frase de erro").toBe(r.vermelho);
      expect(r.com.rotulo, "o rótulo do Field fica vermelho").toBe(r.vermelho);
      expect(r.com.fundo, "o fundo da peça com erro é o mesmo da peça sem erro").toBe(r.sem.fundo);
      expect(r.sem.borda, "sem a marca, a borda não é vermelha").not.toBe(r.vermelho);
    });
  }
}
