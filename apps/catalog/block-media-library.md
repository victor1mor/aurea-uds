# Media library

One selection shared by the gallery, the detail and the player — never three strings that happen to match. The resume position is a number, the optional capabilities say which ones exist, and the queue can be reordered without touching what is playing. The transport lives in the player and nowhere else.

## Usage

```tsx
import {MediaPlayer, Status, DataList, Toolbar, ToolbarButton, EmptyState} from "@aurea-uds/react";
```

```tsx
// Which actions exist is a fact about PLAYBACK, so it comes from its own state machine.
// Six of the nine actions have no transition — seek, queue, playlist, chapter, track,
// favorite — and that is not a hole: choosing a chapter does not change the library's state.
const actions = allowedFrom(view.state);   // ready -> ["play"]

<div className="stack" style={{"--media-h":"6rem", "--media-ar":"auto"}}>
  <div className="cluster" style={{justifyContent:"space-between"}}>
    <strong>{item.title} · {item.meta}</strong>
    {/* offline here IS the universal state (ADR-0018): it is OUR connection that dropped,
        which is the opposite of what the same word means in DeviceControl */}
    {isUniversal(view.state)
      ? <Status state={view.state} />
      : <Status variant={tone[view.state]}>{label[view.state]}</Status>}
  </div>

  {/* "gallery selection works by keyboard": the tiles are BUTTONS. Measured — the core's
      .card-interactive has cursor:pointer and :hover and no focus at all, because a div
      never takes Tab. The skin is the one that exists; the element is what the keyboard
      reaches. aria-current marks the selected one, and the word is in the text too. */}
  <div role="group" aria-label="Library" className="cluster">
    {library.map(i =>
      <button key={i.id} type="button" className="card card-interactive"
        aria-current={i.id === selection ? "true" : undefined}
        onClick={() => select(i.id)}>
        <strong>{i.title}</strong>
        <div className="hint">{i.id === selection ? i.meta + " · selected" : i.meta}</div>
      </button>)}
  </div>

  {/* ONE selection feeds the gallery, the detail and the player. Three hand-written strings
      that agree today are one rename away from disagreeing. */}
  <MediaPlayer kind="audio" title={item.title} subtitle={item.subtitle} />

  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    <div role="group" aria-label="Item detail">
      <DataList items={[{term:"Duration",value:item.meta},{term:"Resume at",value:item.resumeAt}]} />
    </div>
    {/* optional capabilities: what exists is declared, so nobody goes looking for it */}
    <div role="group" aria-label="Chapters"><DataList items={item.chapters} /></div>
  </div>

  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    {/* "bulk organize never interrupts playback": none of these is a transport control */}
    <div role="group" aria-label="Queue">
      <DataList items={[{term:"Next",value:queue[0].label}]} />
      <Toolbar label="Queue actions">…</Toolbar>
    </div>
    <div role="group" aria-label="Tracks"><DataList items={item.tracks} /></div>
  </div>

  <div className="grid" style={{gridTemplateColumns:"1fr auto"}}>
    {/* "autoplay never surprises" — said in TEXT, where whoever arrives goes looking */}
    <div role="group" aria-label="History">
      <div className="hint">Last played {h.when}, stopped at {h.at} · autoplay is off</div>
    </div>
    {/* library actions, never transport: the transport is the player's, and two buttons for
        the same thing are two truths about who controls it */}
    <div role="group" aria-label="Actions"><Toolbar label="Library actions">…</Toolbar></div>
  </div>
</div>
```
