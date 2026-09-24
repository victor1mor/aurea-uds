import {test, expect} from "@playwright/test";

// G-AXIS-04 — a PROVA da arquitetura, e o gate contra regressão da API responsiva.
//
// O achado: a Radix Themes tem eixo responsivo em 47 de 50 componentes e a Aurea tinha ZERO. A
// decisão do Victor foi ter os DOIS mecanismos — viewport e container —, explícitos na API, com
// abstração compartilhada antes dos componentes, CSS-first e sem nada observando largura.
//
// O QUE ESTE ARQUIVO PROVA, e por que ele existe em vez de um teste unitário: que a classe é
// emitida, o vitest cobra. Que a classe FUNCIONA, só o navegador diz — e o caso decisivo é o
// primeiro teste abaixo, que foi exatamente o que o Victor pediu:
//
//   o MESMO componente, com o MESMO valor, na MESMA viewport, em contêineres de larguras
//   diferentes, medindo diferente.
//
// Se os três medissem igual, o que existiria seria uma media query com outro nome. É esta
// medição, e não a leitura do CSS, que separa os dois mecanismos.
//
// Três motores porque `@container` é recente o bastante para divergir entre eles.

const APP = "/apps/keyboard-probe/out/index.html";
const alturas = (page: import("@playwright/test").Page, sel: string) =>
  page.$$eval(sel, els => els.map(e => Math.round(e.getBoundingClientRect().height)));

test("container: o mesmo botão mede diferente em contêineres diferentes, na MESMA viewport", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto(APP);
  const raiz = '[data-probe="ResponsivoContainer"]';
  await expect(page.locator(`${raiz} .btn`).first()).toBeVisible();

  const hs = await alturas(page, `${raiz} .btn`);
  const larguras = await page.$$eval(`${raiz} .container-scope`,
    els => els.map(e => Math.round(e.getBoundingClientRect().width)));
  // a prova: contêineres crescentes -> alturas NÃO DECRESCENTES, e pelo menos duas distintas
  expect(hs.length).toBe(3);
  expect(new Set(hs).size,
    `os três medem ${hs.join(", ")} em contêineres de ${larguras.join(", ")}px — ` +
    `se forem todos iguais, a container query não age e isto é uma media query com outro nome`)
    .toBeGreaterThan(1);
  for (let i = 1; i < hs.length; i++) {
    expect(hs[i], `contêiner maior não pode dar controle menor: ${hs.join(", ")}`)
      .toBeGreaterThanOrEqual(hs[i - 1]);
  }
});

test("container: a viewport não interfere — encolher a janela não muda as alturas", async ({page}) => {
  // O outro lado da mesma prova. Se as alturas mudassem ao estreitar a janela sem mudar os
  // contêineres, o que estaria agindo seria a viewport, e o mecanismo estaria trocado.
  await page.goto(APP);
  const raiz = '[data-probe="ResponsivoContainer"]';
  await page.setViewportSize({width: 1280, height: 900});
  await expect(page.locator(`${raiz} .btn`).first()).toBeVisible();
  const largo = await alturas(page, `${raiz} .btn`);
  await page.setViewportSize({width: 420, height: 900});
  await page.waitForTimeout(150);
  const estreito = await alturas(page, `${raiz} .btn`);
  expect(estreito, `mudou com a janela (${largo.join(",")} -> ${estreito.join(",")}) — ` +
    `os contêineres têm largura fixa, então quem agiu foi a viewport`).toEqual(largo);
});

test("viewport: o outro mecanismo reage à janela, e só a ela", async ({page}) => {
  await page.goto(APP);
  const sel = '[data-probe="ResponsivoViewport"] .btn';
  await page.setViewportSize({width: 420, height: 900});
  await expect(page.locator(sel)).toBeVisible();
  const estreito = (await alturas(page, sel))[0];
  await page.setViewportSize({width: 1280, height: 900});
  await page.waitForTimeout(150);
  const largo = (await alturas(page, sel))[0];
  expect(largo, `${estreito} -> ${largo}: o valor por viewport não reagiu à janela`)
    .toBeGreaterThan(estreito);
});

// GATE DA API. O que não pode regredir em silêncio é a FORMA das classes: a camada do core casa
// por nome exato, então um prefixo trocado não quebra nada — só para de pintar, que é a falha
// mais cara de achar (é o `log-warn` do G-CSS-01 outra vez).
test("as classes emitidas têm a forma que o core pinta", async ({page}) => {
  await page.goto(APP);
  const ct = await page.$eval('[data-probe="ResponsivoContainer"] .btn', e => e.className);
  const vp = await page.$eval('[data-probe="ResponsivoViewport"] .btn', e => e.className);
  expect(ct, `container: ${ct}`).toContain("size-xs");
  expect(ct).toMatch(/\bct-(2xs|xs|sm|md|lg):size-(xs|sm|md|lg|xl)\b/);
  expect(ct, "valor responsivo NÃO pode emitir a classe do componente: ela venceria a camada")
    .not.toMatch(/\bbtn-(xs|sm|lg|xl)\b/);
  expect(vp).toMatch(/\bvp-(2xs|xs|sm|md|lg|xl|2xl):size-(xs|sm|md|lg|xl)\b/);
});

// ── AS TRÊS FAMÍLIAS RESTANTES (22/08/2026) ────────────────────────────────────────────────────
// A medição que precedeu esta expansão está em `audit/activity-2/18-G-AXIS-04-FAMILIAS.md`: são
// TRÊS escalas, não uma. Estes dois testes cobram as duas metades da conclusão.

test("famílias: cada escala acompanha o contêiner pela SUA grandeza", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto(APP);
  const raiz = '[data-probe="ResponsivoFamilias"]';
  await expect(page.locator(`${raiz} .btn`).first()).toBeVisible();

  for (const [nome, sel, eixo] of [
    ["marcação", ".control-mark", "height"],
    ["identidade", ".avatar", "height"],
    ["trilho", ".switch-track", "width"],
  ] as const) {
    const v = await page.$$eval(`${raiz} ${sel}`,
      (els, e) => els.map(x => Math.round(x.getBoundingClientRect()[e as "width" | "height"])), eixo);
    expect(v.length, `${nome}: esperava três, um por contêiner`).toBe(3);
    expect(new Set(v).size,
      `${nome} mede ${v.join(", ")} em contêineres de 260/520/820px — iguais significa que a ` +
      `família não chegou à camada, ou que leu uma variável que ninguém repõe`).toBeGreaterThan(1);
    for (let i = 1; i < v.length; i++) {
      expect(v[i], `${nome}: contêiner maior deu peça menor (${v.join(", ")})`)
        .toBeGreaterThanOrEqual(v[i - 1]);
    }
  }
});

test("famílias: o ícone DENTRO do botão responsivo não herda o passo do botão", async ({page}) => {
  // O caso que obrigou o `@property`. Medido antes de generalizar: `.icon` está dentro de um
  // `.btn` em 323 das 327 páginas do catálogo. Sem o corte de herança, o `--step-icon` que a
  // camada põe no BOTÃO desce para o `<svg>` e o ícone cresce junto — provado em `.prova`:
  // com o bloco, 20px; sem ele, 32px.
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto(APP);
  const raiz = '[data-probe="ResponsivoFamilias"]';
  await expect(page.locator(`${raiz} .btn`).first()).toBeVisible();

  const botoes = await page.$$eval(`${raiz} .btn`,
    els => els.map(e => Math.round(e.getBoundingClientRect().height)));
  const dentro = await page.$$eval(`${raiz} .btn .icon`,
    els => els.map(e => Math.round(e.getBoundingClientRect().width)));
  const soltos = await page.$$eval(`${raiz} > div > .icon`,
    els => els.map(e => Math.round(e.getBoundingClientRect().width)));

  expect(new Set(botoes).size, `os botões precisam MESMO variar (${botoes.join(", ")}), ` +
    `senão este teste passaria por não haver o que herdar`).toBeGreaterThan(1);
  expect(new Set(dentro).size,
    `o ícone dentro do botão mudou de tamanho (${dentro.join(", ")}) — ele é de outra escala e ` +
    `não pode acompanhar o botão; o @property da camada é o que corta essa herança`).toBe(1);
  expect(new Set(soltos).size,
    `o ícone com eixo PRÓPRIO precisa variar (${soltos.join(", ")}), senão o corte de herança ` +
    `matou também o que devia funcionar`).toBeGreaterThan(1);
});

// ── O EIXO `orientation` (22/08/2026) ──────────────────────────────────────────────────────────

test("orientação: o mesmo grupo empilha no contêiner estreito e enfileira no largo", async ({page}) => {
  // A prova que o `size` já tinha, aplicada ao outro eixo: mesma viewport, contêineres
  // diferentes, resultados diferentes. Aqui o observável é a GEOMETRIA DO EIXO — num grupo
  // empilhado a altura passa de uma linha e a largura é a do contêiner; enfileirado, o contrário.
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto(APP);
  const raiz = '[data-probe="ResponsivoOrientacao"]';
  await expect(page.locator(`${raiz} .btn-group`).first()).toBeVisible();

  const eixo = await page.$$eval(`${raiz} .btn-group`, els => els.map(e => {
    const filhos = [...e.children].map(c => c.getBoundingClientRect());
    // dois botões no mesmo topo = enfileirado; topos diferentes = empilhado
    return Math.abs(filhos[0].top - filhos[1].top) < 2 ? "linha" : "coluna";
  }));
  expect(eixo.length).toBe(3);
  expect(eixo[0], `contêiner de 260px devia empilhar, e deu ${eixo[0]}`).toBe("coluna");
  expect(eixo[2], `contêiner de 820px devia enfileirar, e deu ${eixo[2]}`).toBe("linha");
  expect(new Set(eixo).size,
    `os três deram ${eixo.join(", ")} — iguais significa que a camada de orientação não age`)
    .toBeGreaterThan(1);
});

test("orientação: a regra do DESCENDENTE viaja junto com a do componente", async ({page}) => {
  // O `Field` horizontal é um grid de duas colunas, e quem diz em que coluna cada peça vai são
  // regras de FILHO. Se a camada copiasse só a regra do componente, o campo viraria grid e as
  // peças se empilhariam na coluna 1 — pior que não ter feito nada.
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto(APP);
  const raiz = '[data-probe="ResponsivoOrientacao"]';
  await expect(page.locator(`${raiz} .field`).first()).toBeVisible();

  const lado = await page.$$eval(`${raiz} .field`, els => els.map(e => {
    const rot = e.querySelector(".label")!.getBoundingClientRect();
    const campo = e.querySelector(".input")!.getBoundingClientRect();
    return rot.right <= campo.left + 2 ? "lado a lado" : "empilhado";
  }));
  expect(lado[0], "no contêiner de 260px o campo devia ficar empilhado").toBe("empilhado");
  expect(lado[2], "no de 820px o rótulo devia ficar À ESQUERDA do campo — é a regra do filho " +
    "que põe cada um na sua coluna").toBe("lado a lado");
});

test("orientação: a VOLTA ao valor base dá o mesmo computado que o estático", async ({page}) => {
  // O corpo do valor base RECONSTRÓI o desenho de partida em vez de copiar uma regra — não existe
  // `.btn-group-horizontal` no core, porque horizontal é o que `.btn-group` já faz. Reconstrução
  // que ninguém confere é divergência esperando acontecer, e o controle de texto do gerador não
  // tem contra o que conferir aqui. Quem confere é este teste, no computado.
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto(APP);
  const raiz = '[data-probe="ResponsivoOrientacao"]';
  await expect(page.locator(`${raiz} .btn-group`).first()).toBeVisible();

  const propriedades = ["flex-direction", "align-items", "display"];
  const [responsivo, estatico] = await page.evaluate(([sel, props]) => {
    const caixa = document.createElement("div");
    caixa.style.cssText = "position:fixed;top:0;left:0;z-index:99999;inline-size:900px";
    caixa.innerHTML = `<div class="btn-group" id="__e"><button class="btn">a</button></div>`;
    document.body.appendChild(caixa);
    const ler = (el: Element) => (props as string[]).map(p => getComputedStyle(el).getPropertyValue(p));
    // o do contêiner LARGO já voltou a horizontal pela camada; o injetado é o estático puro
    const resp = ler(document.querySelectorAll(sel as string)[2]);
    const est = ler(document.getElementById("__e")!);
    caixa.remove();
    return [resp, est];
  }, [`${raiz} .btn-group`, propriedades] as const);

  expect(responsivo, `a volta ao base deu ${responsivo.join("/")} e o estático dá ` +
    `${estatico.join("/")} — a reconstrução do corpo base divergiu do desenho de partida`)
    .toEqual(estatico);
});
