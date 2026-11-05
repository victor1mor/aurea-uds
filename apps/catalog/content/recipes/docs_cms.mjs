// RECEITA · Docs · CMS (S-11, 05/11/2026) — o editor de um artigo como tela de produto, na linguagem dos blocos v2 (a
// `Tela`): o título e o texto, a aba que mostra como vai ficar (`Prose`), as etiquetas (`TagGroup`), e ao lado as
// propriedades que mudam enquanto se escreve (as palavras, o tempo de leitura) e as versões. Interação de verdade: escrever
// muda a contagem e a prévia; tirar uma etiqueta; "Save draft" guarda uma versão; "Publish" publica.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Tela, Propriedades, Grupo} from "./_tela.mjs";

const pilha = {display: "grid", gap: "var(--space-4)", minInlineSize: 0};
const TEXTO = "A claim about state needs a command behind it.\n\nCounting by hand drifts the moment someone else edits the page. Measuring does not.";
const VERSOES = [{title: "v3 · draft", description: "by you", time: "09:20"}, {title: "v2 · published", description: "by Curator", time: "Mon"}];

function Editor() {
  const [titulo, setTitulo] = useState("Measuring instead of counting");
  const [texto, setTexto] = useState(TEXTO);
  const [aba, setAba] = useState("write");
  const [etiquetas, setEtiquetas] = useState([{id: "quality", label: "Quality"}, {id: "process", label: "Process"}, {id: "tokens", label: "Tokens"}]);
  const [estado, setEstado] = useState("draft");
  const [versoes, setVersoes] = useState(VERSOES);
  const palavras = texto.trim() ? texto.trim().split(/\s+/).length : 0;
  const versao = (rotulo, quem) => setVersoes(vs => [{title: `v${vs.length + 2} · ${rotulo}`, description: quem, time: "09:31"}, ...vs]);
  return h(Tela, {icone: "file-text", trilha: ["Docs", "Engineering"], id: "measuring-instead-of-counting", titulo: titulo || "Untitled",
    estado: h(A.Status, {variant: estado === "published" ? "success" : "warning"}, estado === "published" ? "Published" : "Draft"),
    propriedades: [["user", "By you"], ["clock", "Edited 09:20"], ["eye", `${Math.max(1, Math.round(palavras / 200))} min read`]],
    acoes: [
      h(A.Button, {key: "s", variant: "secondary", onClick: () => { setEstado("draft"); versao("draft", "by you"); }}, "Save draft"),
      h(A.Button, {key: "p", variant: "primary", leadingIcon: "cloud-arrow-up", disabled: estado === "published", onClick: () => { setEstado("published"); versao("published", "by you"); }}, "Publish")],
    lado: [
      h(Propriedades, {key: "p", titulo: "Article", itens: [{term: "Words", value: String(palavras)}, {term: "Slug", value: h(A.Code, null, "/measuring")},
        {term: "Section", value: "Engineering"}]}),
      h(Grupo, {key: "v", titulo: "Versions"}, h(A.Timeline, {items: versoes}))],
    rodape: "Publishing keeps every version. The preview is the same component the site uses, not a second renderer."},
    h(A.Tabs, {label: "Article", value: aba, onChange: setAba, panel: "plain", tabs: [
      {id: "write", label: "Write", content: h(Grupo, {titulo: "Content"}, h("div", {style: pilha},
        h(A.Field, {label: "Title"}, h(A.Input, {value: titulo, onChange: e => { setTitulo(e.target.value); setEstado("draft"); }})),
        h(A.Field, {label: "Body", hint: "Plain text; a blank line starts a paragraph."},
          h(A.Textarea, {rows: 6, value: texto, onChange: e => { setTexto(e.target.value); setEstado("draft"); }}))))},
      {id: "preview", label: "Preview", content: h(Grupo, {titulo: "As readers see it"}, h(A.Prose, null,
        h("h4", null, titulo || "Untitled"), ...texto.split(/\n\s*\n/).filter(Boolean).map((p, n) => h("p", {key: n}, p))))}]}),
    h(Grupo, {titulo: "Tags"}, h(A.TagGroup, {label: "Tags", labelHidden: true, items: etiquetas, onRemove: ids => setEtiquetas(ts => ts.filter(t => !ids.includes(t.id)))})));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Button", "DataList", "Timeline", "Tabs", "Field", "Input", "Textarea", "Prose", "TagGroup"],
  code: `import {useState} from "react";
import {Button, Card, DataList, Field, Heading, Input, Prose, Separator, Status, Tabs, TagGroup, Textarea, Timeline} from "@aurea-uds/react";

export function ArticleEditor({article, save, publish}) {
  const [title, setTitle] = useState(article.title);
  const [body, setBody] = useState(article.body);
  const [tags, setTags] = useState(article.tags);
  const words = body.trim().split(/\\s+/).length;

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
          <Prose><h1>{title}</h1>{body.split(/\\n\\s*\\n/).map((p, i) => <p key={i}>{p}</p>)}</Prose>
        )},
      ]} />
      <TagGroup label="Tags" items={tags} onRemove={ids => setTags(t => t.filter(x => !ids.includes(x.id)))} />

      <aside>
        <DataList items={[{term: "Words", value: words}, {term: "Slug", value: article.slug}]} />
        <Timeline items={article.versions} />
      </aside>
    </Card>
  );
}`,
  render: () => h(Editor),
};
