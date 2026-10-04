// BANCO DO LOTE H — AN-02, AN-03, AN-05 e AN-06 (04/10/2026). As quatro peças têm estado, efeito e
// rolagem, e o catálogo é HTML parado: aqui elas rodam de verdade, contra um "servidor" de mentira
// com 5.000 mensagens, 2.000 itens de galeria e pastas que só se sabem ao abrir.
//
// Como os outros bancos, este não afirma nada: monta. Quem afirma é `tests/visual/lote-h.spec.ts`.
// A mesma página é a bancada do Victor: construída contra a `0.18.0` publicada, ela mostra o ANTES
// (as props novas são ignoradas pelo código velho).
//
// `?rapido` tira as esperas de rede (o teste), `?aba=galeria|arvore` abre direto na aba, `?dir=rtl` vira a escrita.
// O contêiner da conversa desliga a âncora de rolagem do navegador (`overflow-anchor: none`): é o
// caso de quem não tem âncora, e é o que prova que a posição segura é a conta da Aurea.
import {StrictMode, useEffect, useMemo, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  AureaProvider, Button, Gallery, MessageComposer, MessageList, SegmentedControl, ThemeToggle, TreeView,
  ptBR, type ChatMessage, type GalleryItem, type TreeNode,
} from "@aurea-uds/react";
import "@aurea-uds/core/css";
// A fonte e o sprite pelo caminho do repositório: o Vite os copia para junto da página, e a mesma
// página funciona servida da raiz (o teste) e solta (a bancada).
import "../../../packages/fonts/dist/fonts.css";
import sprite from "../../../packages/icons/dist/aurea-icons.svg?url";

const q = new URLSearchParams(location.search);
const ESPERA = q.has("rapido") ? 0 : 700;
// `?dir=rtl`: a escrita da direita para a esquerda é atributo do documento; o provedor a repassa ao motor.
if (q.get("dir") === "rtl") document.documentElement.dir = "rtl";
const esperar = <T,>(v: T, ms = ESPERA) => new Promise<T>((r) => setTimeout(() => r(v), ms));

// Foto de mentira: um quadro de cor lisa com o número (sem gradiente — CLAUDE.md §5).
const CORES = ["#3a6ea5", "#7a4f9a", "#2f7d62", "#a5563a", "#5b6470", "#8a7a2b"];
const foto = (n: number) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect width="240" height="180" fill="${CORES[n % CORES.length]}"/><text x="120" y="100" font-family="sans-serif" font-size="40" fill="#fff" text-anchor="middle">${n}</text></svg>`)}`;

// ── A conversa: 5.000 mensagens no "servidor"; a página guarda uma janela ─────────────────────
const TOTAL = 5000, PARTE = 40, JANELA = 200;
const FRASES = ["Bom dia! Alguém viu o relatório de setembro?", "Sim, está na pasta de sempre.", "Obrigado.", "Vamos marcar para quinta às 15h? Assim dá tempo de todo mundo revisar o texto antes da reunião.", "Fechado.", "Mandei o arquivo ontem, confere?", "Confiro à tarde."];
const DIAS = ["12 de setembro", "13 de setembro", "14 de setembro", "15 de setembro"];
function mensagem(i: number, total = TOTAL): ChatMessage {
  const minha = i % 3 === 1;
  const m: ChatMessage = {
    id: `m${i}`, body: <p>{`#${i} · ${FRASES[i % FRASES.length]}`}</p>,
    time: `${String(8 + Math.floor((i % 600) / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`,
    direction: minha ? "outgoing" : "incoming",
    author: minha ? undefined : i % 2 ? "Analyst" : "Writer",
    avatar: minha ? undefined : {fallback: i % 2 ? "AN" : "WR"},
    day: i >= total - 30 ? "Hoje" : DIAS[Math.floor(i / 1250) % DIAS.length],
  };
  if (i % 11 === 0) m.attachments = Array.from({length: 1 + (i % 4)}, (_, k) => ({id: `f${i}-${k}`, kind: k === 1 ? "video" as const : "image" as const, src: foto(i + k), alt: `Foto ${i + k}`, duration: 65 + k}));
  if (i % 13 === 0) m.attachments = [...(m.attachments ?? []), {id: `d${i}`, kind: "file" as const, name: `relatorio-${i}.pdf`, bytes: 20480 + i * 7, href: "#"}];
  if (i % 9 === 0 && i > 0) m.replyTo = {id: `m${i - 1}`, author: i % 2 ? "Writer" : "Analyst", body: FRASES[(i - 1) % FRASES.length]};
  if (i % 17 === 0) m.forwardedFrom = "Curator";
  if (i % 19 === 0) m.edited = true;
  return m;
}

function Conversa() {
  const [servidor, setServidor] = useState(TOTAL);
  const [ini, setIni] = useState(TOTAL - 60);
  const [fimJ, setFimJ] = useState(TOTAL);
  const [carregando, setCarregando] = useState<"antes" | "depois" | null>(null);
  const [extras, setExtras] = useState<Record<string, ChatMessage>>({});
  const [resposta, setResposta] = useState<ChatMessage | null>(null);
  const [edicao, setEdicao] = useState<ChatMessage | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);
  const msgs = useMemo(() => Array.from({length: fimJ - ini}, (_, k) => extras[`m${ini + k}`] ?? mensagem(ini + k, servidor)), [ini, fimJ, extras, servidor]);
  const temAntes = ini > 0, temDepois = fimJ < servidor;
  const antigas = async () => {
    setCarregando("antes");
    await esperar(null);
    setIni((a) => { const n = Math.max(0, a - PARTE); setFimJ((f) => Math.min(f, n + JANELA)); return n; });
    setCarregando(null);
  };
  const recentes = async () => {
    setCarregando("depois");
    await esperar(null);
    setFimJ((f) => { const n = Math.min(servidor, f + PARTE); setIni((a) => Math.max(a, n - JANELA)); return n; });
    setCarregando(null);
  };
  // Chega mensagem no "servidor". Ela só aparece se a janela estiver no fim — como no app.
  const receber = (texto = "Chegou agora.", minha = false) => {
    const i = servidor;
    setExtras((e) => ({...e, [`m${i}`]: {id: `m${i}`, body: <p>{texto}</p>, time: "agora", day: "Hoje", direction: minha ? "outgoing" : "incoming", author: minha ? undefined : "Writer", avatar: minha ? undefined : {fallback: "WR"}}}));
    setServidor(i + 1);
    if (fimJ === servidor) setFimJ(i + 1);
  };
  const ultima = (minha: boolean) => [...msgs].reverse().find((m) => (m.direction === "outgoing") === minha) ?? null;
  return <section className="lote-h-conversa">
    <p className="hint" id="janela">{JSON.stringify({naTela: msgs.length, primeira: ini, ultima: fimJ - 1, servidor, carregando})}</p>
    <div id="rolador" className="lote-h-rolador">
      <MessageList messages={msgs} label="Conversa de teste"
        hasMoreBefore={temAntes} onReachStart={antigas} loadingBefore={carregando === "antes"}
        hasMoreAfter={temDepois} onReachEnd={recentes} loadingAfter={carregando === "depois"} />
    </div>
    <div className="lote-h-acoes">
      <Button size="sm" variant="secondary" onClick={() => receber()}>Receber mensagem</Button>
      <Button size="sm" variant="secondary" onClick={() => { setEdicao(null); setResposta(ultima(false)); }}>Responder à última</Button>
      <Button size="sm" variant="secondary" onClick={() => { setResposta(null); setEdicao(ultima(true)); }}>Editar a minha última</Button>
    </div>
    <MessageComposer placeholder="Mensagem" attach={{maxSize: 10 * 1024 * 1024}}
      replyTo={resposta ? {id: resposta.id, author: resposta.author ?? "Você", body: typeof resposta.body === "object" ? (resposta.body as {props: {children: string}}).props.children : String(resposta.body)} : null}
      onCancelReply={() => setResposta(null)}
      editing={edicao ? {id: edicao.id, body: String((edicao.body as {props: {children: string}}).props.children)} : null}
      onCancelEdit={() => setEdicao(null)}
      onSend={(texto, d) => {
        setAvisos((a) => [...a, JSON.stringify({texto, arquivos: d?.files.map((f) => f.name), respostaA: d?.replyToId, editada: d?.editingId})]);
        if (d?.editingId) { const id = d.editingId; setExtras((e) => ({...e, [id]: {...(e[id] ?? msgs.find((m) => m.id === id)!), body: <p>{texto}</p>, edited: true}})); setEdicao(null); return; }
        setResposta(null);
        receber(texto || `${d?.files.length ?? 0} arquivo(s)`, true);
      }} />
    <pre className="hint" id="envios">{avisos.join("\n")}</pre>
  </section>;
}

// ── A galeria: 2.000 itens de tipos misturados, por partes de 60 ─────────────────────────────
const ITENS_G: GalleryItem[] = Array.from({length: 2000}, (_, i) => ({id: `g${i}`, src: foto(i), alt: `Item ${i}`, kind: i % 5 === 2 ? "video" : "image", duration: i % 5 === 2 ? 30 + (i % 300) : undefined}));
function Galeria() {
  const [qtd, setQtd] = useState(60);
  const [carregando, setCarregando] = useState(false);
  const [lote, setLote] = useState(false);
  const [escolhidas, setEscolhidas] = useState<string[]>([]);
  const itens = ITENS_G.slice(0, qtd);
  const mais = async () => { setCarregando(true); await esperar(null); setQtd((n) => Math.min(ITENS_G.length, n + 60)); setCarregando(false); };
  return <section>
    <div className="lote-h-acoes">
      <Button size="sm" variant={lote ? "primary" : "secondary"} onClick={() => { setLote(!lote); setEscolhidas([]); }}>{lote ? "Sair da escolha" : "Escolher várias"}</Button>
      {lote && <Button size="sm" variant="secondary" onClick={() => setEscolhidas(itens.map((i) => i.id))}>Selecionar visíveis</Button>}
      {lote && <span className="hint" id="escolhidas">{escolhidas.length} escolhida(s)</span>}
      <span className="hint" id="carregados">{itens.length} de {ITENS_G.length} carregados</span>
    </div>
    <Gallery items={itens} label="Galeria de teste" zoom
      selectionMode={lote ? "multiple" : "single"} selectedIds={escolhidas} onSelectionChange={setEscolhidas}
      hasMore={qtd < ITENS_G.length} loading={carregando} onReachEnd={mais} />
  </section>;
}

// ── A árvore: grupos e pastas que só se sabem ao abrir ───────────────────────────────────────
function Arvore() {
  const [filhos, setFilhos] = useState<Record<string, TreeNode[]>>({});
  const [escolhido, setEscolhido] = useState<string | null>("recebidos");
  const falhou = useRef(false);
  const no = (id: string, label: string, pasta = true): TreeNode => ({id, label, icon: pasta ? "folder" : "file-text", hasChildren: pasta || undefined, children: filhos[id]});
  const items: TreeNode[] = [no("recebidos", "Recebidos"), no("projetos", "Projetos"), no("instavel", "Pasta instável (falha na 1ª vez)"), no("leia", "Leia-me.txt", false)];
  const carregar = async (n: TreeNode) => {
    if (n.children?.length) return;
    if (n.id === "instavel" && !falhou.current) { falhou.current = true; await esperar(null); throw new Error("rede"); }
    const lista = await esperar([1, 2, 3].map((k) => no(`${n.id}-${k}`, `${n.label} · ${k}`, k < 3)));
    setFilhos((f) => ({...f, [n.id]: lista}));
  };
  return <section>
    <p className="hint" id="destino">Destino escolhido: {escolhido ?? "nenhum"}</p>
    <TreeView label="Pastas do servidor" items={items} onExpand={carregar} selectedId={escolhido} onSelect={(n) => setEscolhido(n.id)} />
  </section>;
}

function Banco() {
  const [aba, setAba] = useState(q.get("aba") ?? "conversa");
  useEffect(() => { const u = new URL(location.href); u.searchParams.set("aba", aba); history.replaceState(null, "", u); }, [aba]);
  return <main className="lote-h">
    <header className="lote-h-topo">
      <strong>Lote H · {import.meta.env.VITE_AUREA_VERSAO ?? "0.19.0 (depois)"}</strong>
      <SegmentedControl label="Peça" value={aba} onChange={setAba} items={[{value: "conversa", label: "Conversa (AN-02, AN-03)"}, {value: "galeria", label: "Galeria (AN-05)"}, {value: "arvore", label: "Árvore (AN-06)"}]} />
      <ThemeToggle />
    </header>
    {aba === "conversa" ? <Conversa /> : aba === "galeria" ? <Galeria /> : <Arvore />}
  </main>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><AureaProvider strings={ptBR} spriteUrl={sprite} direction={q.get("dir") === "rtl" ? "rtl" : "ltr"}><Banco /></AureaProvider></StrictMode>,
);
