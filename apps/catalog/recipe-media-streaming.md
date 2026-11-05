# Media · streaming

An audio/video library with queue, playlists, tracks and chapters. A library action doesn't interrupt what's playing.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Badge, Button, DataList, SortableList, MediaPlayer, ListBox} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
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
}
```
