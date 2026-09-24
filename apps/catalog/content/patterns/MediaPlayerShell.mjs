// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// O shell é a MOLDURA sem motor: `.media-player` e nada mais. Quem quer o motor (play, tempo,
// buffer, volume, legenda) usa o MediaPlayer. Todo pattern daqui é do caso em que o motor NÃO é
// do browser — uma transmissão, uma tela remota, um canvas — e os controles são do consumidor.
//
// A tela é escura nos DOIS temas (`--media-canvas`), e o core tem override de Badge para dentro
// dela. Status não tem: medido com axe, o rótulo reprovava contraste ali. Por isso Badge aqui.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

// A prévia tem CAIXA (ADR-0002: nenhuma deve exigir rolagem), e o player mede
// `min-height:var(--media-h,360px)` com `aspect-ratio:16/9` — os dois acima do que cabe. A
// válvula já existe no core e é essa variável; o que a prévia faz é usá-la, sem tocar no
// componente. Medido em 29/08/2026, quando a varredura do catálogo pegou as cinco páginas.
const cheio = {width: "min(500px,100%)", "--media-h": "260px"};
const centro = {display: "grid", placeItems: "center", gap: "var(--space-3)",
  height: "100%", textAlign: "center", padding: "var(--space-6)"};

export default [
  {
    variant: "Frame",
    name: "A stream with its own controls",
    description: "The frame gives the surface, the aspect ratio and the dark canvas that holds in both themes; everything inside is yours. This is the shape to reach for when the engine is not a <video> — a remote screen, a canvas, a live socket.",
    uses: ["MediaPlayerShell", "Badge", "Icon"],
    code: `<MediaPlayerShell>
  <div className="media-overlay-title">
    <div><strong>Studio A</strong><span>1080p · 30 fps</span></div>
    <Badge variant="danger">on air</Badge>
  </div>
  <div className="media-controls">
    <div className="media-control-row">
      <button type="button" className="media-control" aria-label="Stop"><Icon name="stop" /></button>
      <button type="button" className="media-control" aria-label="Mute"><Icon name="volume--up" /></button>
    </div>
  </div>
</MediaPlayerShell>`,
    render: () => h("div", {style: cheio}, h(A.MediaPlayerShell, null,
      h("div", {className: "media-overlay-title"},
        h("div", null, h("strong", null, "Studio A"), h("span", null, "1080p · 30 fps")),
        h(A.Badge, {variant: "danger"}, "on air")),
      // `aria-label` em cada controle: o <svg> é `aria-hidden` (ele é desenho), então sem o
      // rótulo o botão não tem NOME acessível nenhum — o axe reprovou os dois em 22/08/2026.
      // O `.media-control` é a pele do próprio player e não é componente da Aurea; quem escreve
      // controle próprio aqui herda a obrigação que o IconButton já resolve sozinho.
      h("div", {className: "media-controls"},
        h("div", {className: "media-control-row"},
          h("button", {type: "button", className: "media-control", "aria-label": "Stop"},
            h(A.Icon, {name: "stop"})),
          h("button", {type: "button", className: "media-control", "aria-label": "Mute"},
            h(A.Icon, {name: "volume--up"})))))),
  },
  {
    variant: "Frame",
    name: "Waiting for a source",
    description: "The state a player spends more time in than anyone plans for. Saying nothing reads as broken; the frame with a placeholder says the surface is ready and the source is not, which is the fact the reader needs while they wait.",
    uses: ["MediaPlayerShell", "Spinner"],
    code: `<MediaPlayerShell>
  <div className="media-placeholder">
    <Spinner />
    <strong>Connecting…</strong>
  </div>
</MediaPlayerShell>`,
    render: () => h("div", {style: cheio}, h(A.MediaPlayerShell, null,
      h("div", {style: centro},
        h(A.Spinner, null), h("strong", null, "Connecting…")))),
  },
  {
    variant: "Frame",
    name: "The source failed",
    description: "A dead stream is not an empty one: it needs the reason and a way out. Keeping the failure inside the frame instead of replacing the frame with an alert holds the layout still — the page does not jump when a tile drops.",
    uses: ["MediaPlayerShell", "Icon", "Button"],
    code: `<MediaPlayerShell>
  <div className="media-placeholder">
    <Icon name="warning--alt" />
    <strong>Stream unavailable</strong>
    <Button size="sm" variant="secondary" onClick={retry}>Try again</Button>
  </div>
</MediaPlayerShell>`,
    render: () => h("div", {style: cheio}, h(A.MediaPlayerShell, null,
      h("div", {style: centro},
        h("span", {className: "media-placeholder"}, h(A.Icon, {name: "warning--alt"})),
        h("strong", null, "Stream unavailable"),
        h(A.Button, {size: "sm", variant: "secondary"}, "Try again")))),
  },
];
