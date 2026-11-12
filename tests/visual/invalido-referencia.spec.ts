import {test, expect, type Page} from "@playwright/test";

// ADR-0094 (0.66.0, 11/11/2026): o campo inválido é o da referência principal — o Victor viu as 21 formas lado a lado
// (hoje × a referência) e escolheu: "B como a referencia e Ember entra". O FUNDO do campo não muda; a borda fica na cor da
// frase de erro (`--danger-400`); o rótulo do campo fica vermelho; a caixa marcada fica vermelha cheia; a chave não muda.
// Mede no navegador, na página real, ligando e desligando o `aria-invalid` no MESMO controle — o fundo de antes e de
// depois tem de ser o mesmo, venha de onde vier (página, cartão).
// Provado contra o defeito: com a regra de antes (o fundo de perigo, `--danger-bg`), o primeiro teste reprova no fundo.

const SEM_TRANSICAO = "*,*::before,*::after{transition:none!important;animation:none!important}";

async function abrir(page: Page, pagina: string, tema: "light" | "dark") {
  await page.goto(`/apps/catalog/${pagina}.html`);
  await page.addStyleTag({content: SEM_TRANSICAO});
  await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, tema);
}

/** A cor de uma variável do tema, resolvida pelo navegador (o mesmo caminho do valor medido). */
const corDe = (page: Page, variavel: string, prop: "color" | "backgroundColor" = "color") => page.evaluate(({v, p}) => {
  const sonda = document.createElement("span");
  sonda.style[p as "color"] = `var(${v})`;
  document.body.append(sonda);
  const c = getComputedStyle(sonda)[p as "color"];
  sonda.remove();
  return c;
}, {v: variavel, p: prop});

for (const tema of ["light", "dark"] as const) {
  test(`${tema}: o campo com erro guarda o fundo, ganha a borda vermelha e o rótulo vermelho`, async ({page}) => {
    await abrir(page, "field", tema);
    const vermelho = await corDe(page, "--danger-400");
    const r = await page.evaluate(() => {
      const campo = document.querySelector<HTMLElement>('.field:has(> .input[aria-invalid="true"])')!;
      const input = campo.querySelector<HTMLElement>(".input")!;
      const rotulo = campo.querySelector<HTMLElement>(":scope > .label")!;
      const ler = () => ({fundo: getComputedStyle(input).backgroundColor, borda: getComputedStyle(input).borderTopColor,
        rotulo: getComputedStyle(rotulo).color});
      const com = ler();
      input.removeAttribute("aria-invalid");
      const sem = ler();
      input.setAttribute("aria-invalid", "true");
      return {com, sem};
    });
    expect(r.com.fundo, "o fundo do campo com erro é o mesmo do campo sem erro").toBe(r.sem.fundo);
    expect(r.com.borda, "a borda do campo com erro é a cor da frase de erro").toBe(vermelho);
    expect(r.com.rotulo, "o rótulo do campo com erro fica vermelho").toBe(vermelho);
    expect(r.sem.rotulo, "sem erro, o rótulo volta à cor do texto").not.toBe(vermelho);
  });

  test(`${tema}: a caixa vazia ganha o contorno; marcada, fica vermelha cheia`, async ({page}) => {
    await abrir(page, "checkbox", tema);
    const vermelho = await corDe(page, "--danger-400");
    const cheio = await corDe(page, "--destructive", "backgroundColor");
    const r = await page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>(".checkbox:not(.checkbox-pill) input:not(:disabled)")!;
      const marca = input.nextElementSibling as HTMLElement;
      const ler = () => ({fundo: getComputedStyle(marca).backgroundColor, borda: getComputedStyle(marca).borderTopColor});
      input.checked = false; const vazia = ler();
      input.setAttribute("aria-invalid", "true"); const vaziaComErro = ler();
      input.checked = true; const marcadaComErro = ler();
      input.removeAttribute("aria-invalid");
      return {vazia, vaziaComErro, marcadaComErro};
    });
    expect(r.vaziaComErro.fundo, "vazia, o fundo não muda").toBe(r.vazia.fundo);
    expect(r.vaziaComErro.borda).toBe(vermelho);
    expect(r.marcadaComErro.fundo, "marcada, o vermelho cheio").toBe(cheio);
  });

  test(`${tema}: a chave não muda com erro (a referência não tem inválido nela)`, async ({page}) => {
    await abrir(page, "switch", tema);
    const r = await page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>('.switch input[role="switch"]:not(:disabled)')!;
      const trilho = input.nextElementSibling as HTMLElement;
      // Dentro de um campo, o rótulo do campo também não muda (o desenho B aprovado).
      const campo = document.createElement("div"); campo.className = "field";
      const rotulo = document.createElement("span"); rotulo.className = "label"; rotulo.textContent = "Avisos";
      input.closest(".switch")!.before(campo); campo.append(rotulo, input.closest(".switch")!);
      const ler = () => ["backgroundColor", "borderTopColor", "boxShadow", "outlineColor"]
        .map((p) => getComputedStyle(trilho)[p as "color"]).join("|") + "|" + getComputedStyle(rotulo).color;
      const antes = ler();
      input.setAttribute("aria-invalid", "true");
      const depois = ler();
      input.removeAttribute("aria-invalid");
      return {antes, depois};
    });
    expect(r.depois).toBe(r.antes);
  });

  test(`${tema}: na Ember também (o Victor: "Ember entra")`, async ({page}) => {
    await abrir(page, "field", tema);
    await page.evaluate(() => { document.documentElement.dataset.brand = "ember"; });
    const vermelho = await corDe(page, "--danger-400");
    const r = await page.evaluate(() => {
      const input = document.querySelector<HTMLElement>('.field > .input[aria-invalid="true"]')!;
      const com = getComputedStyle(input).backgroundColor;
      input.removeAttribute("aria-invalid");
      const sem = getComputedStyle(input).backgroundColor;
      input.setAttribute("aria-invalid", "true");
      return {com, sem, borda: getComputedStyle(input).borderTopColor};
    });
    expect(r.com).toBe(r.sem);
    expect(r.borda).toBe(vermelho);
  });
}
