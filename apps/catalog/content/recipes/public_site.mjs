// RECEITA · Public site (S-11, 05/11/2026) — a página de um site público como tela de produto, na linguagem dos blocos v2
// (a `Tela`: aqui, o editor da página, com a página dentro): a abertura com a ação principal, os três motivos, os preços com
// a escolha mensal/anual, e a inscrição na lista de novidades com a validação de verdade. Interação de verdade: trocar
// para "Yearly" troca os preços; a inscrição recusa e-mail errado e confirma o certo; "Publish" publica a página.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Tela, Propriedades, Grupo} from "./_tela.mjs";

const tres = {display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, calc(var(--space-24) * 2)), 1fr))", gap: "var(--space-3)"};
const PLANOS = [["Starter", 0, 0, "For one person", false], ["Team", 24, 240, "For a small team", true], ["Business", 49, 490, "For the whole company", false]];
const MOTIVOS = [["eye", "Readable first", "Contrast measured in both themes."], ["devices", "One look, two platforms", "Web and native share the tokens."],
  ["hexagon", "Every value a token", "Colour, radius, type and space."]];

function Site() {
  const [periodo, setPeriodo] = useState("monthly");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState(null);
  const [inscrito, setInscrito] = useState(false);
  const [publicada, setPublicada] = useState(false);
  const inscrever = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErro("Type an email like name@example.com."); return; }
    setErro(null); setInscrito(true);
  };
  return h(Tela, {icone: "globe", trilha: ["Website", "Pages"], id: "/", titulo: "Home page",
    estado: h(A.Status, {variant: publicada ? "success" : "warning"}, publicada ? "Published" : "Draft"),
    propriedades: [["clock", publicada ? "Published 09:30" : "Edited 09:24"], ["eye", "1.2k visits / day"], ["globe", "example.com"]],
    acoes: h(A.Button, {variant: "primary", leadingIcon: "cloud-arrow-up", disabled: publicada, onClick: () => setPublicada(true)}, publicada ? "Published" : "Publish"),
    lado: h(Propriedades, {titulo: "Page", itens: [{term: "Title", value: "Ship the interface"}, {term: "Language", value: "English"},
      {term: "Sections", value: "4"}, {term: "Sign-ups", value: inscrito ? "1 new" : "—"}]}),
    rodape: "One primary action per section. The page reads without JavaScript; the toggle and the form are the only parts that need it."},
    h(Grupo, {titulo: "Hero"},
      h("div", null, h(A.Badge, {tone: "primary"}, "New")),
      h(A.Heading, {level: 4}, "Ship the interface, not the argument about it."),
      h(A.Text, {tone: "muted"}, "One system, two themes, three densities — measured, not guessed."),
      h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-2)"}},
        h(A.Button, {variant: "primary", trailingIcon: "arrow-right", href: "#start"}, "Get started"),
        h(A.Button, {appearance: "soft", tone: "brand", href: "#docs"}, "Read the docs"))),
    h(Grupo, {titulo: "Why"}, h("div", {style: tres}, ...MOTIVOS.map(([ic, t, d]) => h(A.Card, {key: t},
      h("div", {style: {display: "grid", gap: "var(--space-2)"}}, h(A.Icon, {name: ic}), h("strong", null, t), h(A.Text, {type: "body-sm", tone: "muted"}, d)))))),
    h(Grupo, {titulo: "Pricing"},
      h(A.SegmentedControl, {label: "Billing", value: periodo, onChange: setPeriodo, items: [{value: "monthly", label: "Monthly"}, {value: "yearly", label: "Yearly · 2 months free"}]}),
      h("div", {style: tres}, ...PLANOS.map(([nome, mes, ano, para, destaque]) => h(A.Card, {key: nome},
        h("div", {style: {display: "grid", gap: "var(--space-2)", justifyItems: "start"}},
          h("div", {style: {display: "flex", gap: "var(--space-2)", alignItems: "center"}}, h("strong", null, nome), destaque ? h(A.Badge, {tone: "primary"}, "Recommended") : null),
          h(A.Text, {type: "h3", numeric: true}, periodo === "monthly" ? `$${mes}` : `$${ano}`),
          h(A.Text, {type: "body-sm", tone: "muted"}, `${para} · per ${periodo === "monthly" ? "month" : "year"}`),
          h(A.Button, {variant: destaque ? "primary" : "secondary", size: "sm", href: "#start"}, mes ? "Start trial" : "Start free")))))),
    h(Grupo, {titulo: "Newsletter"}, inscrito
      ? h(A.Alert, {variant: "success", title: "You are on the list"}, `We will write to ${email} once a month. Unsubscribing is one click.`)
      : h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-2)", alignItems: "flex-end"}},
        h("div", {style: {flex: "1 1 calc(var(--space-24) * 2)"}}, h(A.Field, {label: "Email", error: erro},
          h(A.Input, {type: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "name@example.com", "aria-invalid": erro ? "true" : undefined}))),
        h(A.Button, {variant: "primary", onClick: inscrever}, "Subscribe"))));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Button", "DataList", "Badge", "SegmentedControl", "Field", "Input", "Alert"],
  code: `import {useState} from "react";
import {Alert, Badge, Button, Card, Field, Heading, Input, SegmentedControl, Text} from "@aurea-uds/react";

export function HomePage({plans, subscribe}) {
  const [period, setPeriod] = useState("monthly");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  return (
    <>
      <section>
        <Badge tone="primary">New</Badge>
        <Heading level={1}>Ship the interface, not the argument about it.</Heading>
        <Text tone="muted">One system, two themes, three densities.</Text>
        <Button variant="primary" trailingIcon="arrow-right" href="/start">Get started</Button>
        <Button appearance="soft" tone="brand" href="/docs">Read the docs</Button>
      </section>

      <section>
        <SegmentedControl label="Billing" value={period} onChange={setPeriod}
          items={[{value: "monthly", label: "Monthly"}, {value: "yearly", label: "Yearly · 2 months free"}]} />
        {plans.map(p => (
          <Card key={p.name}>
            <strong>{p.name}</strong> {p.recommended && <Badge tone="primary">Recommended</Badge>}
            <Text type="h3" numeric>{period === "monthly" ? p.monthly : p.yearly}</Text>
            <Button variant={p.recommended ? "primary" : "secondary"} href="/start">Start trial</Button>
          </Card>
        ))}
      </section>

      <section>
        {done ? <Alert variant="success" title="You are on the list">We will write once a month.</Alert> : (
          <>
            <Field label="Email" error={error}>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={error ? "true" : undefined} />
            </Field>
            <Button variant="primary" onClick={async () => {
              if (!email.includes("@")) return setError("Type an email like name@example.com.");
              await subscribe(email); setDone(true);
            }}>Subscribe</Button>
          </>
        )}
      </section>
    </>
  );
}`,
  render: () => h(Site),
};
