// RECEITA · Creative workspace (S-11, 05/11/2026) — a revisão de uma arte como tela de produto, na linguagem dos blocos v2 (a
// `Tela`): a arte da versão escolhida, as versões para comparar, a paleta da peça (`ColorSwatch`), e a conversa da revisão
// presa à versão. A tela de pintar é a outra metade; esta é a que torna o trabalho revisável. Interação de verdade: trocar
// de versão troca a arte; comentar entra na conversa daquela versão; "Approve" aprova a versão escolhida.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Tela, Propriedades, Grupo} from "./_tela.mjs";
import {arte} from "./_arte.mjs";

const VERSOES = [
  {id: "v7", label: "v7 · exported at 2×", time: "09:20", cor: "#eab308", forma: 0},
  {id: "v6", label: "v6 · palette swapped", time: "08:55", cor: "#38bdf8", forma: 0},
  {id: "v5", label: "v5 · first layout", time: "Mon", cor: "#a1a1aa", forma: 1},
];
const COMENTARIOS = {
  v7: [{id: "1", author: "Curator", time: "09:21", avatar: {fallback: "CU"}, body: "The yellow is doing the work. Keep it."}],
  v6: [{id: "1", author: "Analyst", time: "08:58", avatar: {fallback: "AN"}, body: "Blue reads calmer, but loses the brand."}],
  v5: [],
};
const PALETA = ["#eab308", "#18181b", "#fafafa", "#38bdf8"];

function Review() {
  const [versao, setVersao] = useState("v7");
  const [comentarios, setComentarios] = useState(COMENTARIOS);
  const [aprovada, setAprovada] = useState(null);
  const [cor, setCor] = useState(PALETA[0]);
  const v = VERSOES.find(x => x.id === versao);
  const comentar = t => setComentarios(c => ({...c, [versao]: [...c[versao], {id: String(c[versao].length + 1), author: "You", time: "09:30", direction: "outgoing", body: t}]}));
  return h(Tela, {icone: "palette", trilha: ["Projects", "Launch campaign"], id: "art_cover", titulo: "Cover · hero",
    estado: h(A.Status, {variant: aprovada ? "success" : "warning"}, aprovada ? `Approved · ${aprovada}` : "In review"),
    propriedades: [["user", "By Writer"], ["clock", `Viewing ${v.id}`], ["chat-circle", `${comentarios[versao].length} comment${comentarios[versao].length === 1 ? "" : "s"}`]],
    acoes: h(A.Button, {variant: "primary", leadingIcon: "check", disabled: aprovada === versao, onClick: () => setAprovada(versao)}, `Approve ${versao}`),
    lado: [
      h(Grupo, {key: "v", titulo: "Versions"}, h(A.RadioGroup, {label: "Version", labelHidden: true, value: versao, onValueChange: setVersao},
        ...VERSOES.map(x => h(A.Radio, {key: x.id, value: x.id, label: x.label, description: x.time + (aprovada === x.id ? " · approved" : "")})))),
      h(Propriedades, {key: "p", titulo: "Export", itens: [{term: "Size", value: "2400 × 1600"}, {term: "Format", value: "PNG, 2×"}, {term: "Colour", value: h(A.Code, null, cor)}]})],
    rodape: "Every comment belongs to one version, and every canvas action has a version you can go back to."},
    h(Grupo, {titulo: `${v.label} · ${v.time}`}, h(A.Image, {src: arte(v.cor, v.forma), alt: `Cover artwork, ${v.label}`, ratio: "16/9"})),
    h(Grupo, {titulo: "Palette"}, h(A.ColorSwatch, {label: "Palette", name: "palette", options: PALETA, value: cor, onChange: e => setCor(e.target.value), showLabels: true})),
    h(Grupo, {titulo: `Comments on ${versao}`},
      comentarios[versao].length ? h(A.MessageList, {label: `Comments on ${versao}`, messages: comentarios[versao]})
        : h(A.Text, {tone: "muted"}, "No comments on this version yet."),
      h(A.MessageComposer, {label: `Comment on ${versao}`, placeholder: "Leave a comment…", onSend: comentar})));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Button", "RadioGroup", "Radio", "DataList", "Image", "ColorSwatch", "MessageList", "MessageComposer"],
  code: `import {useState} from "react";
import {Button, Card, ColorSwatch, DataList, Heading, Image, MessageComposer, MessageList, Radio, RadioGroup, Separator, Status} from "@aurea-uds/react";

export function Review({art, versions, initialComments, approve}) {
  const [version, setVersion] = useState(versions[0].id);
  const [comments, setComments] = useState(initialComments);
  const [approved, setApproved] = useState(null);
  const v = versions.find(x => x.id === version);

  return (
    <Card>
      <header>
        <Heading level={3}>{art.name}</Heading> <Status variant={approved ? "success" : "warning"}>{approved ? "Approved" : "In review"}</Status>
        <Button variant="primary" onClick={async () => { await approve(version); setApproved(version); }}>Approve {version}</Button>
      </header>
      <Separator />

      <Image src={v.src} alt={\`\${art.name}, \${v.label}\`} ratio="16/9" />
      <ColorSwatch label="Palette" name="palette" options={art.palette} showLabels />
      <MessageList label={\`Comments on \${version}\`} messages={comments[version]} />
      <MessageComposer label={\`Comment on \${version}\`}
        onSend={body => setComments(c => ({...c, [version]: [...c[version], {id: crypto.randomUUID(), author: "You", body}]}))} />

      <aside>
        <RadioGroup label="Version" labelHidden value={version} onValueChange={setVersion}>
          {versions.map(x => <Radio key={x.id} value={x.id} label={x.label} description={x.time} />)}
        </RadioGroup>
        <DataList items={[{term: "Size", value: art.size}, {term: "Format", value: art.format}]} />
      </aside>
    </Card>
  );
}`,
  render: () => h(Review),
};
