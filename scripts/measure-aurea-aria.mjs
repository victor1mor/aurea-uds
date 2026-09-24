// A ARIA que a Aurea REALMENTE emite, por componente — medida no render, não declarada na ficha.
// A ficha só declara `a11y.role`; comparar isso com os `ariaEmitidos` das referências (que são
// medidos do fonte) compararia declaração com medição, e a Aurea perderia por construção.
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {JSDOM} from "jsdom";
import {readFileSync, readdirSync, writeFileSync} from "node:fs";

const starters = (await import("../apps/catalog/content/_starters.mjs")).default;
const conteudo = {};
for (const f of readdirSync("apps/catalog/content").filter(f => /^[A-Z].*\.mjs$/.test(f))) {
  const m = await import(`../apps/catalog/content/${f}`);
  conteudo[f.replace(".mjs","")] = m.default;
}
const A = await import("../packages/react/dist/index.js");

const out = {};
const alvos = new Set([...Object.keys(starters), ...Object.keys(conteudo)]);
for (const nome of alvos) {
  const entrada = conteudo[nome]?.examples?.[0] ?? starters[nome];
  if (!entrada?.render) { out[nome] = {aria: null, motivo: "sem render (embed/prerender)"}; continue; }
  let html;
  try { html = renderToStaticMarkup(h(A.AureaProvider, {spriteUrl: ""}, entrada.render())); }
  catch (e) { out[nome] = {aria: null, motivo: "render estourou: " + e.message.slice(0,80)}; continue; }
  const doc = new JSDOM(`<body>${html}</body>`).window.document;
  const set = new Set();
  for (const el of doc.querySelectorAll("*"))
    for (const a of el.attributes)
      if (a.name === "role" || a.name.startsWith("aria-")) set.add(a.name === "role" ? `role:${a.value}` : a.name);
  out[nome] = {aria: [...set].sort(), motivo: html ? null : "render vazio (portal)"};
}
writeFileSync("audit/activity-2/AUREA-ARIA.json", JSON.stringify({
  _gerado: "node scripts/measure-aurea-aria.mjs",
  _metodo: "renderToStaticMarkup do starter/exemplo de cada componente, atributos role e aria-* " +
    "colhidos do DOM. Portal não renderiza em estático — nesses casos o preview é só o disparador, " +
    "e o registro diz isso em vez de reportar lista vazia.",
  componentes: out}, null, 2) + "\n");
const comAria = Object.values(out).filter(v => v.aria?.length).length;
console.log(`ARIA medida: ${Object.keys(out).length} componentes, ${comAria} emitem role/aria-*`);
