// AS PÁGINAS DA ÁREA "GETTING STARTED" (lote U, SITE-03) — o leitor do texto delas.
//
// Cada página mora num arquivo de texto (`apps/catalog/content/docs/<nome>.md`), como as da documentação da
// referência, e não em código: o mesmo texto vira a página, o "Copy Markdown" e, no SITE-06, o `.md` de cada página
// e o `llms.txt`. Este arquivo só LÊ — devolve os blocos; quem desenha é o `build-catalog.mjs`, com as peças da Aurea
// (o `Prose` é "a pele do texto longo; o leitor fica com você", diz a ficha dele).
//
// O vocabulário é FECHADO, de propósito: o que o leitor não conhece derruba a montagem, com o arquivo e a linha. Um
// leitor que engole o desconhecido publica a marca crua na página, e ninguém vê (a lição do `preview:` dos starters).
//   ---           o cabeçalho: `title` e `description`, obrigatórios; `icon`, o da lateral
//   ## / ###      os títulos (o `#` é o título da página, que vem do cabeçalho)
//   parágrafo     linhas seguidas; uma linha em branco separa
//   - / 1.        listas, sem lista dentro de lista
//   ```lang       código, sempre com a língua
//   | a | b |     tabela, com a linha `|---|` embaixo do cabeçalho
//   ::: demo id   um exemplo vivo, que o gerador desenha; o bloco de código logo depois vira a aba "Code" dele
// No meio do texto: **forte**, `código` e [nome](endereço).

export const LINGUAS = new Set(["bash", "tsx", "ts", "html", "css", "json"]);

const slug = t => t.toLowerCase().replace(/`/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// O texto de dentro de um parágrafo, item ou célula, em pedaços: {t:"texto"} | {strong} | {code} | {link, href}.
export function lerLinha(texto, onde) {
  const out = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let ultimo = 0, m;
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) out.push({t: texto.slice(ultimo, m.index)});
    if (m[1] !== undefined) out.push({strong: m[1]});
    else if (m[2] !== undefined) out.push({code: m[2]});
    else out.push({link: m[3], href: m[4]});
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) out.push({t: texto.slice(ultimo)});
  // Marca que sobrou é marca que o leitor não entendeu: um `**` sem par, um `[x]` sem endereço.
  for (const p of out) if (p.t !== undefined && /\*\*|\]\(|<[a-zA-Z/]/.test(p.t)) {
    throw new Error(`${onde}: marca que o leitor não conhece em "${p.t.trim().slice(0, 60)}"`);
  }
  return out;
}

const celulas = linha => linha.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, "|"));

export function lerDoc(texto, arquivo) {
  const linhas = texto.replace(/\r\n/g, "\n").split("\n");
  if (linhas[0] !== "---") throw new Error(`${arquivo}: falta o cabeçalho (---) na primeira linha`);
  const fim = linhas.indexOf("---", 1);
  if (fim < 0) throw new Error(`${arquivo}: o cabeçalho não fecha (---)`);
  const meta = {};
  for (const l of linhas.slice(1, fim)) {
    const m = l.match(/^([a-z]+):\s*(.+)$/);
    if (!m) throw new Error(`${arquivo}: linha do cabeçalho fora da forma "chave: valor" — "${l}"`);
    meta[m[1]] = m[2].trim();
  }
  for (const k of ["title", "description"]) if (!meta[k]) throw new Error(`${arquivo}: o cabeçalho não tem "${k}"`);
  // `icon` (opcional): o ícone do item na lateral, como os da área da referência — um nome do Phosphor.
  const desconhecidas = Object.keys(meta).filter(k => !["title", "description", "icon"].includes(k));
  if (desconhecidas.length) throw new Error(`${arquivo}: chave de cabeçalho que o gerador não lê — ${desconhecidas.join(", ")}`);

  const blocos = [];
  const ids = new Set();
  let i = fim + 1;
  const onde = () => `${arquivo}:${i + 1}`;
  while (i < linhas.length) {
    const l = linhas[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{2,3}) (.+)$/))) {
      const texto = m[2].trim();
      let id = slug(texto);
      // Dois títulos iguais na mesma página dariam a mesma âncora, e o índice levaria sempre ao primeiro.
      for (let n = 2; ids.has(id); n++) id = `${slug(texto)}-${n}`;
      ids.add(id);
      blocos.push({tipo: m[1].length === 2 ? "h2" : "h3", id, texto: lerLinha(texto, onde()), rotulo: texto.replace(/`/g, "")});
      i++; continue;
    }
    if (/^#/.test(l)) throw new Error(`${onde()}: só "##" e "###" — o título da página vem do cabeçalho`);
    if ((m = l.match(/^```(\S*)\s*$/))) {
      const lingua = m[1];
      if (!LINGUAS.has(lingua)) throw new Error(`${onde()}: bloco de código sem língua conhecida ("${lingua}"); use ${[...LINGUAS].join(", ")}`);
      const corpo = [];
      i++;
      while (i < linhas.length && !/^```\s*$/.test(linhas[i])) corpo.push(linhas[i++]);
      if (i >= linhas.length) throw new Error(`${arquivo}: bloco de código que não fecha`);
      i++;
      blocos.push({tipo: "codigo", lingua, codigo: corpo.join("\n")});
      continue;
    }
    if ((m = l.match(/^::: demo ([a-z0-9-]+)\s*$/))) { blocos.push({tipo: "demo", id: m[1]}); i++; continue; }
    if (/^:::/.test(l)) throw new Error(`${onde()}: diretiva que o gerador não conhece — "${l}"`);
    if (/^\|/.test(l)) {
      const cab = celulas(l);
      const sep = linhas[i + 1] || "";
      if (!/^\|?\s*:?-{3,}/.test(sep)) throw new Error(`${onde()}: tabela sem a linha |---| embaixo do cabeçalho`);
      i += 2;
      const corpo = [];
      while (i < linhas.length && /^\|/.test(linhas[i])) {
        const c = celulas(linhas[i]);
        if (c.length !== cab.length) throw new Error(`${onde()}: a linha da tabela tem ${c.length} células, o cabeçalho tem ${cab.length}`);
        corpo.push(c.map(x => lerLinha(x, onde())));
        i++;
      }
      blocos.push({tipo: "tabela", cabecalho: cab.map(x => lerLinha(x, onde())), linhas: corpo});
      continue;
    }
    if ((m = l.match(/^(- |\d+\. )/))) {
      const ordenada = m[1] !== "- ";
      const itens = [];
      while (i < linhas.length && (ordenada ? /^\d+\. /.test(linhas[i]) : /^- /.test(linhas[i]))) {
        let item = linhas[i].replace(/^(- |\d+\. )/, "");
        i++;
        // A continuação do item: linha recuada logo embaixo.
        while (i < linhas.length && /^ {2,}\S/.test(linhas[i]) && !/^ +(- |\d+\. )/.test(linhas[i])) item += " " + linhas[i++].trim();
        if (i < linhas.length && /^ +(- |\d+\. )/.test(linhas[i])) throw new Error(`${arquivo}:${i + 1}: lista dentro de lista — o leitor não desenha`);
        itens.push(lerLinha(item, onde()));
      }
      blocos.push({tipo: ordenada ? "ol" : "ul", itens});
      continue;
    }
    if (/^ *>/.test(l)) throw new Error(`${onde()}: citação (>) — o leitor não desenha`);
    if (/^ *</.test(l)) throw new Error(`${onde()}: HTML cru — o leitor não desenha`);
    const para = [];
    while (i < linhas.length && linhas[i].trim() && !/^(#|```|:::|\||- |\d+\. )/.test(linhas[i])) para.push(linhas[i++].trim());
    blocos.push({tipo: "p", texto: lerLinha(para.join(" "), onde())});
  }
  return {title: meta.title, description: meta.description, icon: meta.icon, blocos};
}

// O texto da página para quem copia (o "Copy Markdown") ou lê por máquina: o arquivo, sem o cabeçalho e sem as
// diretivas (o código do exemplo fica — é ele que se copia), com o título e a descrição no topo.
export function paraTexto(texto) {
  const doc = texto.replace(/\r\n/g, "\n");
  const fim = doc.indexOf("\n---", 3);
  const meta = Object.fromEntries(doc.slice(4, fim).split("\n").map(l => l.match(/^([a-z]+):\s*(.+)$/)).filter(Boolean).map(m => [m[1], m[2].trim()]));
  const corpo = doc.slice(fim + 4).split("\n").filter(l => !/^::: demo /.test(l)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return `# ${meta.title}\n\n${meta.description}\n\n${corpo}\n`;
}
