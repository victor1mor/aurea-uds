import {test, expect} from "@playwright/test";
import {esperarTransicoes} from "./esperar-transicoes";

// Lote 1, as travas (20/10/2026). O check 49 do `validate.py` (o estado que a ficha promete existe no código) achou
// peças que recebiam o `disabled` e não mudavam nada na tela: o `Checkbox`, o `Radio` e o `Switch` (o `<input>` é
// invisível e quem desenha é a marca), e por eles o `CheckboxGroup` e o `RadioGroup`; o gatilho do `Collapsible`
// (marcado pelo motor com `data-disabled`, e ainda acendendo no hover); e o `InputGroup`, em que só o texto recuava.
// A referência desenha o desativado na raiz do controle, a 0,5 — o `--opacity-disabled` da Aurea.
//
// Aqui cada peça é medida no navegador, com a folha publicada e a marcação que o React emite. Provado contra o
// defeito: com a folha do `main` de 20/10/2026 (`005cd2b8`), as cinco desativadas medem 1.
const PECAS: Array<[string, string, string, number]> = [
  // [nome, marcação, o elemento medido, a opacidade efetiva esperada]
  ["caixa ativa", `<label class="checkbox"><input type="checkbox"><span class="control-mark"></span><span><strong>SSO</strong></span></label>`, ".checkbox", 1],
  ["caixa desativada", `<label class="checkbox"><input type="checkbox" disabled><span class="control-mark"></span><span><strong>SSO</strong></span></label>`, ".checkbox", 0.5],
  ["caixa marcada e desativada", `<label class="checkbox"><input type="checkbox" checked disabled><span class="control-mark"></span><span><strong>SSO</strong></span></label>`, ".checkbox", 0.5],
  ["rádio desativado", `<label class="radio"><input type="radio" disabled><span class="control-mark"></span>Sul</label>`, ".radio", 0.5],
  ["chave desativada", `<label class="switch"><input type="checkbox" role="switch" disabled><span class="switch-track"></span><span>Avisos</span></label>`, ".switch", 0.5],
  ["gatilho desativado da sanfona", `<div class="collapsible" data-disabled><button type="button" class="collapsible-trigger" data-disabled aria-disabled="true">Detalhes</button></div>`, ".collapsible-trigger", 0.5],
  // No grupo, o ícone é o que não recuava (o campo já recuava sozinho); e o campo não pode recuar duas vezes.
  ["ícone do grupo de campo desativado", `<div class="input-group"><span class="input-group-addon input-group-addon-start">@</span><input class="input" disabled value="ana"></div>`, ".input-group-addon", 0.5],
  ["campo do grupo desativado", `<div class="input-group"><span class="input-group-addon input-group-addon-start">@</span><input class="input" disabled value="ana"></div>`, ".input", 0.5],
  // Só o CAMPO desativa o grupo: o botão de limpar, desativado sem texto, não.
  ["grupo com botão desativado", `<div class="input-group"><input class="input" value=""><span class="input-group-addon input-group-addon-end"><button type="button" class="btn btn-ghost" disabled>x</button></span></div>`, ".input-group", 1],
];

test("toda peça desativada recua para a opacidade de desativado, e a ativa não", async ({page: p, baseURL}) => {
  const url = `${baseURL}/__desativado`;
  await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="dark"><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body>${PECAS.map(([nome, html]) => `<div data-nome="${nome}">${html}</div>`).join("")}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  const medidas = await p.$$eval("[data-nome]", (caixas, alvos) => caixas.map((c, i) => {
    // A opacidade EFETIVA: o produto da do elemento e a de cada ancestral até a caixa — o campo dentro do grupo
    // desativado não pode somar outra camada (seriam 0,25).
    let el = c.querySelector(alvos[i]) as HTMLElement | null;
    let o = 1;
    while (el && el !== c) { o *= Number(getComputedStyle(el).opacity); el = el.parentElement; }
    return {nome: (c as HTMLElement).dataset.nome, opacidade: Math.round(o * 100) / 100};
  }), PECAS.map(([, , alvo]) => alvo));
  expect(medidas).toHaveLength(PECAS.length);
  for (const [i, [nome, , , esperado]] of PECAS.entries()) expect(medidas[i].opacidade, nome).toBe(esperado);
});

test("o gatilho desativado da sanfona não acende no hover", async ({page: p, baseURL}) => {
  const url = `${baseURL}/__desativado-hover`;
  await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="dark"><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body><div class="collapsible"><button type="button" class="collapsible-trigger" data-disabled aria-disabled="true">Detalhes</button></div>
      <div class="collapsible"><button type="button" class="collapsible-trigger" id="ativo">Mais</button></div></body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  const cor = (sel: string) => p.$eval(sel, el => getComputedStyle(el).color);
  const parado = await cor("[data-disabled].collapsible-trigger");
  await p.hover("[data-disabled].collapsible-trigger");
  await esperarTransicoes(p);
  expect(await cor("[data-disabled].collapsible-trigger")).toBe(parado);
  // E o ativo continua acendendo: a guarda não tirou o hover de quem tem.
  const antes = await cor("#ativo");
  await p.hover("#ativo");
  await esperarTransicoes(p);
  expect(await cor("#ativo")).not.toBe(antes);
});
