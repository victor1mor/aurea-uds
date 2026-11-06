# Docs · CMS

Content authoring: edit, version, publish. Draft and published are distinct, visible states.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Button, DataList, Timeline, Tabs, Field, Input, Textarea, Prose, TagGroup} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Button, Card, DataList, Field, Heading, Input, Prose, Separator, Status, Tabs, TagGroup, Textarea, Timeline} from "@aurea-uds/react";

export function ArticleEditor({article, save, publish}) {
  const [title, setTitle] = useState(article.title);
  const [body, setBody] = useState(article.body);
  const [tags, setTags] = useState(article.tags);
  const words = body.trim().split(/\s+/).length;

  return (
    <Card>
      <header>
        <Heading level={3}>{title}</Heading> <Status variant="warning">Draft</Status>
        <Button variant="secondary" onClick={() => save({title, body, tags})}>Save draft</Button>
        <Button variant="primary" onClick={() => publish({title, body, tags})}>Publish</Button>
      </header>
      <Separator />

      <Tabs label="Article" panel="plain" tabs={[
        {id: "write", label: "Write", content: (
          <>
            <Field label="Title"><Input value={title} onChange={e => setTitle(e.target.value)} /></Field>
            <Field label="Body"><Textarea rows={6} value={body} onChange={e => setBody(e.target.value)} /></Field>
          </>
        )},
        {id: "preview", label: "Preview", content: (
          <Prose><h1>{title}</h1>{body.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}</Prose>
        )},
      ]} />
      <TagGroup label="Tags" items={tags} onRemove={ids => setTags(t => t.filter(x => !ids.includes(x.id)))} />

      <div>
        <DataList items={[{term: "Words", value: words}, {term: "Slug", value: article.slug}]} />
        <Timeline items={article.versions} />
      </div>
    </Card>
  );
}
```
