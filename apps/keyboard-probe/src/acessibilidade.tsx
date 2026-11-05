// BANCO DO BLOCO 3 — o alto contraste (0-D) e o texto grande (0-E) no app inteiro (o MNT-30), 04/11/2026.
// As mesmas peças de verdade em quatro colunas — hoje, o contraste "C", o texto "B" e os dois juntos — nos dois temas.
// A marca vem de `?marca=cobalt`. Aprovada na bancada em 04/11/2026 ("Aprovo"); as regras moram no core desde então
// (ADR-0090). Quem afirma é `tests/visual/acessibilidade-modos.spec.ts`; cada coluna leva `data-coluna`.
import {StrictMode, type ReactNode} from "react";
import {createRoot} from "react-dom/client";
import {
  AureaProvider, Badge, Button, Card, Checkbox, Field, Heading, Input, Link, Paragraph, SegmentedControl, Select, Table,
} from "@aurea-uds/react";
import "@aurea-uds/core/css";

const q = new URLSearchParams(location.search);
const marca = q.get("marca");
if (marca) document.documentElement.setAttribute("data-brand", marca);
const SPRITE = new URL("../../../packages/icons/dist/aurea-icons.svg", location.href).href;

const COLUNAS: {nome: string; attrs: Record<string, string>}[] = [
  {nome: "Hoje", attrs: {}},
  {nome: "Alto contraste (C)", attrs: {"data-contrast": "high"}},
  {nome: "Texto grande (B)", attrs: {"data-text": "lg"}},
  {nome: "Os dois juntos", attrs: {"data-contrast": "high", "data-text": "lg"}},
];

function Tela() {
  return (
    <Card>
      <div style={{display: "grid", gap: "var(--space-3)"}}>
        <Heading level={3}>Novo equipamento</Heading>
        <Paragraph tone="muted">Os equipamentos que a ferramenta consulta por SNMP.</Paragraph>
        <Field label="Endereço" hint="IPv4, por exemplo 172.17.80.27.">
          <Input placeholder="172.17.80.27" />
        </Field>
        <Field label="Credencial">
          <Select aria-label="Credencial" items={[{value: "public", label: "public"}, {value: "privada", label: "privada"}]} defaultValue="public" />
        </Field>
        <Checkbox label="Consultar a cada 5 minutos" defaultChecked />
        <p style={{margin: 0}}>Leia o <Link href="#guia">guia de cadastro</Link> antes de começar.</p>
        <div style={{display: "flex", gap: "var(--space-2)", flexWrap: "wrap"}}>
          <Button variant="primary">Cadastrar</Button>
          <Button variant="secondary">Cancelar</Button>
        </div>
        <SegmentedControl label="Ritmo" items={[{value: "eq", label: "Equilibrado"}, {value: "cu", label: "Cuidadoso"}]} value="eq" onChange={() => {}} />
        <Table caption="Equipamentos">
          <thead><tr><th scope="col">Equipamento</th><th scope="col">Situação</th></tr></thead>
          <tbody>
            <tr><td>172.17.80.204</td><td><Badge tone="success">ativo</Badge></td></tr>
            <tr><td>172.17.80.150</td><td><Badge>parado</Badge></td></tr>
          </tbody>
        </Table>
      </div>
    </Card>
  );
}

function Linha({tema}: {tema: "light" | "dark"}): ReactNode {
  return (
    <section data-theme={tema} style={{background: "var(--background)", color: "var(--foreground)", padding: "var(--space-6)",
      borderRadius: "var(--radius-card)", display: "grid", gap: "var(--space-4)"}}>
      <h2 style={{margin: 0}}>{tema === "light" ? "Tema claro" : "Tema escuro"}{marca ? ` · ${marca}` : " · Aurea Gold"}</h2>
      <div style={{display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--space-4)", alignItems: "start"}}>
        {COLUNAS.map((c) => (
          <div key={c.nome} data-coluna={c.nome} {...c.attrs} style={{display: "grid", gap: "var(--space-2)"}}>
            <strong style={{fontSize: "1.125rem"}}>{c.nome}</strong>
            <Tela />
          </div>
        ))}
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AureaProvider spriteUrl={SPRITE}>
      <main style={{display: "grid", gap: "var(--space-6)", padding: "var(--space-6)", background: "#000"}}>
        <Linha tema="light" />
        <Linha tema="dark" />
      </main>
    </AureaProvider>
  </StrictMode>,
);
