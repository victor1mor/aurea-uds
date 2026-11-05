// RECEITA · Media · streaming (S-11, 05/11/2026) — o player com a fila como tela de produto, na linguagem dos blocos v2 (a
// `Tela`, e o "Media library" do desenho do Victor): o que toca (`MediaPlayer`, com um som de exemplo dentro da própria
// página), os capítulos com o atual marcado, a fila que se reordena sem mexer no que toca (`SortableList`), e ao lado onde
// retomar e o próximo. Interação de verdade: tocar; escolher um capítulo; reordenar a fila (também pelo teclado); "Play
// next" passa ao primeiro da fila.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Tela, Propriedades, Grupo} from "./_tela.mjs";
import {arte, SOM} from "./_arte.mjs";

const EPISODIOS = [
  {id: "e14", label: "Episode 14 · Measuring instead of counting", length: "38:12"},
  {id: "e15", label: "Episode 15 · Two themes, one system", length: "41:02"},
  {id: "e16", label: "Episode 16 · Reading at a distance", length: "36:47"},
  {id: "e17", label: "Episode 17 · The yellow does the work", length: "44:30"},
];
const CAPITULOS = [{id: "c1", label: "Intro", start: "00:00"}, {id: "c2", label: "Why count is wrong", start: "04:10"},
  {id: "c3", label: "A command behind every claim", start: "17:45"}, {id: "c4", label: "Questions", start: "31:20"}];

function Player() {
  const [tocando, setTocando] = useState(EPISODIOS[0]);
  const [fila, setFila] = useState(EPISODIOS.slice(1));
  const [capitulo, setCapitulo] = useState("c2");
  const mover = (de, para) => setFila(xs => { const c = [...xs]; const [x] = c.splice(de, 1); c.splice(para, 0, x); return c; });
  const proximo = () => { if (!fila.length) return; setTocando(fila[0]); setFila(f => [...f.slice(1), tocando]); setCapitulo("c1"); };
  return h(Tela, {icone: "music-notes", trilha: ["Podcasts", "Design systems, measured"], id: tocando.id, titulo: tocando.label.split(" · ")[1],
    estado: h(A.Badge, {tone: "info"}, "Season 2"),
    propriedades: [["clock", tocando.length], ["queue", `${fila.length} in queue`], ["play-circle", "Resume at 12:31"]],
    acoes: h(A.Button, {variant: "primary", leadingIcon: "play", disabled: !fila.length, onClick: proximo}, "Play next"),
    lado: [
      h(Propriedades, {key: "r", titulo: "Listening", itens: [{term: "Resume at", value: "12:31"}, {term: "Speed", value: "1×"},
        {term: "Next up", value: fila[0]?.label.split(" · ")[1] ?? "—"}]}),
      h(Grupo, {key: "f", titulo: "Queue · drag or use Space and the arrows"}, h(A.SortableList, {label: "Up next", items: fila, onReorder: mover}))],
    rodape: "The transport lives only in the player. Reordering the queue never touches what is playing."},
    // As válvulas do próprio player (`--media-h`, `--media-ar`): com a altura mínima de 360 e o 16:9 de vídeo, ele nunca
    // ficava com menos de 640 de largura e passava da coluna (achado pela medição de 05/11/2026).
    h("div", {style: {"--media-ar": "auto", "--media-h": "calc(var(--space-24) * 2)", minInlineSize: 0}}, h(A.MediaPlayer, {kind: "audio", src: SOM, poster: arte("#eab308", 3), title: tocando.label.split(" · ")[1], subtitle: `${tocando.label.split(" · ")[0]} · Season 2`})),
    h(Grupo, {titulo: "Chapters"}, h(A.ListBox, {label: "Chapters", selectionMode: "single", value: [capitulo], onValueChange: v => v[0] && setCapitulo(v[0]),
      items: CAPITULOS.map(c => ({id: c.id, label: c.label, description: c.start}))})));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Badge", "Button", "DataList", "SortableList", "MediaPlayer", "ListBox"],
  code: `import {useState} from "react";
import {Badge, Button, Card, DataList, Heading, ListBox, MediaPlayer, Separator, SortableList} from "@aurea-uds/react";

export function Player({episodes, chapters}) {
  const [playing, setPlaying] = useState(episodes[0]);
  const [queue, setQueue] = useState(episodes.slice(1));
  const [chapter, setChapter] = useState(chapters[0].id);
  const move = (from, to) => setQueue(q => { const c = [...q]; const [x] = c.splice(from, 1); c.splice(to, 0, x); return c; });

  return (
    <Card>
      <header>
        <Heading level={3}>{playing.title}</Heading> <Badge tone="info">Season 2</Badge>
        <Button variant="primary" leadingIcon="play" disabled={!queue.length}
          onClick={() => { setPlaying(queue[0]); setQueue(q => [...q.slice(1), playing]); }}>Play next</Button>
      </header>
      <Separator />

      <div style={{"--media-ar": "auto", "--media-h": "12rem"}}>
        <MediaPlayer kind="audio" src={playing.src} poster={playing.cover} title={playing.title} subtitle={playing.show} />
      </div>
      <ListBox label="Chapters" selectionMode="single" value={[chapter]} onValueChange={v => v[0] && setChapter(v[0])}
        items={chapters.map(c => ({id: c.id, label: c.label, description: c.start}))} />

      <div>
        <DataList items={[{term: "Resume at", value: playing.resumeAt}, {term: "Next up", value: queue[0]?.title}]} />
        <SortableList label="Up next" items={queue} onReorder={move} />
      </div>
    </Card>
  );
}`,
  render: () => h(Player),
};
