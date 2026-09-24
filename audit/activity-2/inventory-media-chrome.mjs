// Inventário do §9 — `media-chrome` (`Referencia/media-chrome-main`).
//
// Nona e última. É a mais diferente do quadro, e por isso a que ensina o que as outras oito não
// tinham como ensinar: não é uma biblioteca de componentes React com props — são **web
// components** que conversam por um PROTOCOLO.
//
// Nono formato (§184), e o único orientado a protocolo:
//
//   base-ui       enums `*DataAttributes.ts`
//   radix         inline no JSX
//   mui           `<nome>Classes.ts` com o tipo de cada membro
//   untitled-ui   união literal na prop + `sortCx`
//   shadcn-ui     `registry.json` legível por máquina
//   kibo-ui       um `package.json` por componente — declara o custo
//   reui          MDX com prosa de intenção
//   shark-ui      módulo TypeScript conferido pelo compilador
//   media-chrome  `constants.ts` com EVENTOS DE PEDIDO e ATRIBUTOS DE ESTADO
//
// A diferença não é cosmética. Numa árvore React o estado desce por prop e o pedido sobe por
// callback; aqui QUALQUER elemento em QUALQUER profundidade emite um evento de pedido
// (`mediaplayrequest`) que borbulha até o controlador, e o controlador espalha o estado de volta
// por atributo (`mediapaused`). É a arquitetura que permite montar um player por HTML, sem
// framework, com os controles em qualquer ordem. A Aurea tem `MediaPlayer` e `MediaPlayerShell`,
// e a pergunta que este inventário existe para responder é se a composição deles é livre ou fixa.
//
// E é a única fonte do quadro com **i18n de verdade**: sete idiomas, dicionário por chave de
// texto humano. A Aurea tem `useAureaStrings` com `ptBR` — o número daqui diz quantas chaves um
// domínio real precisa.
//
// Rodar:  node audit/activity-2/inventory-media-chrome.mjs
// Escreve: audit/activity-2/INVENTORY-MEDIA-CHROME.json

import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "../..");
const BASE = path.join(ROOT, "Referencia/media-chrome-main/media-chrome-main");
const JS = path.join(BASE, "src/js");

if (!fs.existsSync(JS)) {
  console.error("Referencia/media-chrome-main ausente. Ver audit/activity-2/02-FONTES.md.");
  process.exit(1);
}

const NA = "N/A";
const INC = "INCONCLUSIVO";
const unico = (a) => [...new Set(a)].sort();
const ler = (f) => fs.readFileSync(f, "utf8");

let commit = INC;
try {
  commit = execFileSync("git", ["-C", BASE, "rev-parse", "--short", "HEAD"], {encoding: "utf8"}).trim();
} catch { /* INCONCLUSIVO, como o §9 manda */ }

// ── o protocolo ────────────────────────────────────────────────────────────
const constantes = ler(path.join(JS, "constants.ts"));
const bloco = (nome) => {
  const i = constantes.indexOf(`export const ${nome}`);
  if (i < 0) return "";
  const a = constantes.indexOf("{", i);
  let n = 0;
  for (let k = a; k < constantes.length; k++) {
    if (constantes[k] === "{") n++;
    else if (constantes[k] === "}" && --n === 0) return constantes.slice(a, k);
  }
  return "";
};
const props = unico([...bloco("MediaUIProps").matchAll(/'(media\w+)'/g)].map((m) => m[1]));
const protocolo = {
  eventosDePedido: unico([...bloco("MediaUIEvents").matchAll(/'([a-z]+)'/g)].map((m) => m[1])),
  props,
  // é assim que a própria fonte constrói `MediaUIAttributes`, e por isso é assim que se mede
  atributosDeEstado: unico(props.map((p) => p.toLowerCase())),
};

// ── os elementos ───────────────────────────────────────────────────────────
const elementos = [];
for (const f of fs.readdirSync(JS).filter((x) => x.endsWith(".ts") && x.startsWith("media-")).sort()) {
  const t = ler(path.join(JS, f));
  const tag = t.match(/customElements\.define\(\s*['"]([\w-]+)['"]/)?.[1]
    ?? t.match(/['"]([\w-]+)['"]\s*,\s*\w+Element/)?.[1] ?? INC;
  elementos.push({
    arquivo: f, tag,
    classe: t.match(/class (\w+) extends/)?.[1] ?? INC,
    estende: t.match(/class \w+ extends ([\w.]+)/)?.[1] ?? INC,
    // `observedAttributes` é o contrato do elemento: o que ele escuta.
    observa: unico([...(t.match(/observedAttributes[^[]*\[([\s\S]*?)\]/)?.[1] ?? "")
      .matchAll(/(?:MediaUIAttributes\.(\w+)|['"]([\w-]+)['"])/g)].map((m) => m[1] ?? m[2])),
    // slots são o mecanismo de composição dos web components — o equivalente do `children`
    slots: unico([...t.matchAll(/slot\s+name=["']?([\w-]+)/g)].map((m) => m[1])),
    emite: unico([...t.matchAll(/MediaUIEvents\.(\w+)/g)].map((m) => m[1])),
    partes: unico([...t.matchAll(/part=["']([\w -]+)["']/g)].flatMap((m) => m[1].split(" "))),
    ariaEmitidos: unico([...t.matchAll(/aria-([a-z]+)/g)].map((m) => m[1])),
    teclas: unico([...t.matchAll(/(?:key|code)\s*===?\s*['"]([\w ]+)['"]/g)].map((m) => m[1])),
    linhas: t.split("\n").length,
  });
}

// ── i18n, que só esta fonte tem ────────────────────────────────────────────
const LANG = path.join(JS, "lang");
const idiomas = fs.existsSync(LANG)
  ? fs.readdirSync(LANG).filter((f) => f.endsWith(".ts")).map((f) => f.slice(0, -3)).sort() : [];
const en = fs.existsSync(path.join(LANG, "en.ts")) ? ler(path.join(LANG, "en.ts")) : "";
const chaves = unico([...en.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]));
const cobertura = idiomas.map((i) => {
  const t = ler(path.join(LANG, `${i}.ts`));
  const n = [...t.matchAll(/^\s*'?[^':]+'?:\s*'/gm)].length;
  return {idioma: i, entradas: n};
});

const saida = {
  fonte: "media-chrome", caminho: "Referencia/media-chrome-main", commit,
  medidoEm: new Date().toISOString().slice(0, 10),
  metodo: "constants.ts (protocolo) + um módulo por custom element + src/js/lang",
  totais: {
    elementos: elementos.length,
    eventosDePedido: protocolo.eventosDePedido.length,
    atributosDeEstado: protocolo.atributosDeEstado.length,
    slotsDistintos: unico(elementos.flatMap((e) => e.slots)).length,
    partesDistintas: unico(elementos.flatMap((e) => e.partes)).length,
    idiomas: idiomas.length,
    chavesDeTexto: chaves.length,
  },
  protocolo,
  i18n: {idiomas, chavesDeTexto: chaves.length, cobertura, amostraDeChaves: chaves.slice(0, 12)},
  elementos,
};
fs.writeFileSync(path.join(import.meta.dirname, "INVENTORY-MEDIA-CHROME.json"), JSON.stringify(saida, null, 2) + "\n");
console.log(`inventory-media-chrome: ${saida.totais.elementos} elementos, `
  + `${saida.totais.eventosDePedido} eventos de pedido, ${saida.totais.atributosDeEstado} atributos de estado, `
  + `${saida.totais.idiomas} idiomas / ${saida.totais.chavesDeTexto} chaves`);
