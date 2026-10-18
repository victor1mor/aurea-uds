import {test, expect, type Page} from "@playwright/test";

// MNT-27 medido montado (17/10/2026) — a FAIXA que o app pede (`layer`) vale na arrumação em camadas. O app de topologia
// mediu na 0.32.0: os dois firewalls da faixa "borda" saíam em alturas diferentes, o secundário ABAIXO do núcleo. A
// opção que a Aurea mandava ao motor (`layerChoiceConstraint`) só é lida pelo arrumador interativo do ELK, que o `elkjs`
// não tem; agora vai a PARTIÇÃO do motor. Dentro de contêiner o motor arruma sozinho (lá o `layer` não vale), e com
// `layer` em só alguns nós o mapa sai como sem faixas e avisa no console.
// O banco: `apps/keyboard-probe/rede4.html` (a rede do app; `?conteiner`, `?parcial`).
// Provado contra o defeito (17/10/2026): com o `layerChoiceConstraint` de volta, os dois primeiros reprovam (o
// secundário abaixo do núcleo) e o terceiro não acha o aviso.
const APP = process.env.AUREA_REDE4 ?? "/apps/keyboard-probe/out/rede4.html";

async function parar(p: Page) {
  await p.waitForFunction(() => {
    const w = window as unknown as {__ultimaMnt27?: string};
    const agora = [...document.querySelectorAll<HTMLElement>(".react-flow__node")].map((n) => n.style.transform).join("|");
    const parado = agora !== "" && agora === w.__ultimaMnt27;
    w.__ultimaMnt27 = agora;
    return parado;
  }, undefined, {polling: 400, timeout: 15_000});
}
async function abrir(p: Page, busca = "") {
  const avisos: string[] = [];
  p.on("console", (m) => { if (m.type() === "warning") avisos.push(m.text()); });
  await p.setViewportSize({width: 1280, height: 1000});
  await p.goto(APP + busca, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
  await parar(p);
  return avisos;
}
// A altura de cada nó na tela (o topo da caixa), arredondada.
const alturas = (p: Page, ids: string[]) => p.evaluate((lista) => Object.fromEntries(lista.map((id) => {
  const n = document.querySelector(`.dependency-graph .react-flow__node[data-id="${id}"]`);
  return [id, n ? Math.round(n.getBoundingClientRect().top) : NaN];
})), ids);

test("MNT-27: com `layer` em todos, cada faixa sai numa altura, na ordem pedida", async ({page: p}) => {
  await abrir(p);
  const y = await alturas(p, ["internet", "fw1", "fw2", "nucleo", "sw1", "sw2", "est1", "est2", "est3", "est4"]);
  expect(y.fw2, "os dois firewalls da mesma faixa na mesma altura").toBe(y.fw1);
  expect(y.sw2, "os dois switches na mesma altura").toBe(y.sw1);
  expect(new Set([y.est1, y.est2, y.est3, y.est4]).size, "as quatro estações na mesma altura (uma está ligada direto no núcleo)").toBe(1);
  expect(y.internet).toBeLessThan(y.fw1);
  expect(y.fw2, "o firewall secundário ACIMA do núcleo, e não abaixo").toBeLessThan(y.nucleo);
  expect(y.nucleo).toBeLessThan(y.sw1);
  expect(y.sw1).toBeLessThan(y.est1);
});

test("MNT-27: com a LAN em contêiner, as faixas de fora valem e o contêiner vem depois do núcleo", async ({page: p}) => {
  await abrir(p, "?conteiner");
  const y = await alturas(p, ["internet", "fw1", "fw2", "nucleo", "lan"]);
  expect(y.fw2, "os dois firewalls na mesma altura").toBe(y.fw1);
  expect(y.internet).toBeLessThan(y.fw1);
  expect(y.fw2, "o firewall secundário acima do núcleo").toBeLessThan(y.nucleo);
  expect(y.nucleo, "o contêiner entra na faixa da menor camada de dentro (3), depois do núcleo (2)").toBeLessThan(y.lan);
});

test("MNT-27: com `layer` em só alguns nós, o mapa sai como sem faixas e avisa uma vez no console", async ({page: p}) => {
  const avisos = await abrir(p, "?parcial");
  expect(avisos.filter((a) => a.includes("`layer` só vale")), "o aviso, uma vez").toHaveLength(1);
  const com = await alturas(p, ["fw1", "fw2", "nucleo"]);
  await abrir(p, "?sem");
  const sem = await alturas(p, ["fw1", "fw2", "nucleo"]);
  expect(com, "igual ao desenho sem `layer`").toEqual(sem);
});
