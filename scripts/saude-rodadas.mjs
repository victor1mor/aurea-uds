// AS RODADAS DA SAÚDE — o pedaço da `saude.html` que só a publicação sabe (o 1-F, bloco 1 — 23/10/2026).
//
// O gerador (`build-catalog.mjs`) escreve a página com uma linha-modelo na tabela "The last 30 checks". Este script, no
// `site.yml`, lê as 30 últimas rodadas da CI no `main` pela API do GitHub e copia a linha-modelo para cada uma, trocando
// os textos de `MODELO_DA_RODADA`. Não instala nada e não roda o React: troca texto no HTML já montado, então a linha
// sai com as mesmas classes da `Table` da Aurea.
//
// Decisão do Victor (19/10/2026): "OK"/"FAILED" em palavra, o horário de Brasília e publicada MESMO vermelha.
//
// Uso: GH_TOKEN=… GITHUB_REPOSITORY=dono/repo node scripts/saude-rodadas.mjs site-dist/saude.html
import {readFileSync, writeFileSync} from "node:fs";
import {MODELO_DA_RODADA} from "./catalogo-fiel.mjs";

const PALAVRA = {success: "OK", failure: "FAILED", cancelled: "CANCELLED", timed_out: "FAILED", skipped: "SKIPPED"};
export const palavra = (r) => r.status !== "completed" ? "RUNNING" : PALAVRA[r.conclusion] ?? String(r.conclusion).toUpperCase();

// Brasília é UTC−3 o ano inteiro (o horário de verão acabou em 2019).
export function emBrasilia(iso) {
  const d = new Date(Date.parse(iso) - 3 * 3600 * 1000);
  const dois = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${dois(d.getUTCMonth() + 1)}-${dois(d.getUTCDate())} ${dois(d.getUTCHours())}:${dois(d.getUTCMinutes())}`;
}

const escapa = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Troca a linha-modelo por uma linha por rodada e tira o aviso de "lista vazia". Pura: recebe o HTML e as rodadas.
export function preencher(html, rodadas) {
  const modelo = /<tr data-modelo="">[\s\S]*?<\/tr>/.exec(html);
  if (!modelo) throw new Error("saude-rodadas: a página não tem a linha-modelo (<tr data-modelo>) — o gerador mudou?");
  const linhas = rodadas.map((r) => modelo[0].replace(' data-modelo=""', "")
    .replace(MODELO_DA_RODADA.data, escapa(r.data))
    .replace(MODELO_DA_RODADA.commit, escapa(r.commit))
    .replace(MODELO_DA_RODADA.resultado, escapa(r.resultado))
    .replace(MODELO_DA_RODADA.trabalhos, escapa(r.trabalhos))).join("");
  const saida = html.replace(modelo[0], linhas).replace(/<p data-saude-vazia="">[\s\S]*?<\/p>/, "");
  if (saida.includes("__DATA__") || saida.includes("data-modelo")) throw new Error("saude-rodadas: sobrou modelo na página");
  return saida;
}

// UM ERRO PASSAGEIRO DO GITHUB NÃO DERRUBA O SITE (30/10/2026). A API respondeu 502 a uma das 30 consultas, e o script
// parava no primeiro erro: o site da 0.50.0 ficou sem publicar duas vezes seguidas (a mesma consulta, medida daqui, falhava
// 3 em 5 vezes e, minutos depois, passava 5 em 5; a página de situação do GitHub dizia que estava tudo normal). Nos erros
// que passam sozinhos — 5xx, 429 e a rede que cai —, tenta de novo, esperando 2, 5 e 10 segundos; o resto (401, 404…)
// para na hora, porque não é passageiro. `buscar` e `esperar` existem para o teste.
const ESPERAS = [2000, 5000, 10000];
const esperarDeVerdade = (ms) => new Promise((r) => setTimeout(r, ms));
export async function api(caminho, {buscar = fetch, esperar = esperarDeVerdade} = {}) {
  for (let tentativa = 1; ; tentativa++) {
    const ultima = tentativa > ESPERAS.length;
    let r;
    try {
      r = await buscar(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}${caminho}`, {
        headers: {Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: "application/vnd.github+json"}});
    } catch (erro) {
      if (ultima) throw erro;
      await esperar(ESPERAS[tentativa - 1]);
      continue;
    }
    if (r.ok) return r.json();
    if (ultima || !(r.status >= 500 || r.status === 429))
      throw new Error(`saude-rodadas: ${caminho} respondeu ${r.status}${tentativa > 1 ? ` (na tentativa ${tentativa})` : ""}`);
    await esperar(ESPERAS[tentativa - 1]);
  }
}

export async function lerRodadas(opcoes = {}) {
  const {workflow_runs: runs} = await api("/actions/workflows/ci.yml/runs?branch=main&event=push&per_page=30", opcoes);
  return Promise.all(runs.map(async (run) => {
    const {jobs} = await api(`/actions/runs/${run.id}/jobs?per_page=50`, opcoes);
    // em ordem de nome: a API devolve na ordem em que terminaram, e cada linha sairia diferente da de cima
    const feitos = jobs.filter((j) => j.conclusion !== "skipped").sort((a, b) => a.name.localeCompare(b.name));
    return {
      data: emBrasilia(run.created_at),
      commit: run.head_sha.slice(0, 8),
      resultado: palavra(run),
      trabalhos: feitos.map((j) => `${j.name} ${palavra(j)}`).join(" · "),
    };
  }));
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  const arquivo = process.argv[2];
  if (!arquivo || !process.env.GH_TOKEN || !process.env.GITHUB_REPOSITORY) {
    console.error("uso: GH_TOKEN=… GITHUB_REPOSITORY=dono/repo node scripts/saude-rodadas.mjs <saude.html>");
    process.exit(2);
  }
  const rodadas = await lerRodadas();
  writeFileSync(arquivo, preencher(readFileSync(arquivo, "utf8"), rodadas));
  console.log(`saude-rodadas: ${rodadas.length} rodadas; a última: ${rodadas[0]?.data} ${rodadas[0]?.resultado}`);
}
