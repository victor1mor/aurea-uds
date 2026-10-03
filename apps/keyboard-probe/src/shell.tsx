// BANCO DA MOLDURA — AN-01 (03/10/2026). O `AppShell` é dono da página inteira (a grade, o `<main>`,
// a gaveta), então não cabe dentro do banco de teclado ao lado dos outros: tem página própria.
//
// Como o outro banco, este não afirma nada: monta. Quem afirma é `tests/visual/appshell-an01.spec.ts`.
// A variante vem do endereço (`?lateral=flush`, `?topo=flush`, `?controlado`, `?inicio=recolhida`, `?dir=rtl`),
// para a mesma página servir a todas as medições.
import {StrictMode, useState} from "react";
import {createRoot} from "react-dom/client";
import {AppShell, AureaProvider, Card} from "@aurea-uds/react";
import "@aurea-uds/core/css";

const q = new URLSearchParams(location.search);
// `?dir=rtl`: a escrita da direita para a esquerda é atributo do documento; o provedor só a repassa ao motor.
if (q.get("dir") === "rtl") document.documentElement.dir = "rtl";
const ITENS = [
  {id: "inicio", label: "Início", icon: "house", href: "#inicio"},
  {id: "relatorios", label: "Relatórios", icon: "chart-bar", href: "#relatorios"},
  {id: "ajustes", label: "Ajustes", icon: "gear", href: "#ajustes"},
] as const;

// Cada aviso do shell fica escrito na página, para o teste ler o que o app recebeu.
function Moldura() {
  const [avisos, setAvisos] = useState<boolean[]>([]);
  const [controlada, setControlada] = useState(q.get("inicio") === "recolhida");
  const avisar = (v: boolean) => { setAvisos((a) => [...a, v]); if (q.has("controlado")) setControlada(v); };
  return (
    <AppShell brand={<strong>Aurea</strong>} navItems={[...ITENS]} currentNavId="relatorios"
      sidebarCollapsible
      sidebarVariant={q.get("lateral") === "flush" ? "flush" : undefined}
      topbarVariant={q.get("topo") === "flush" ? "flush" : undefined}
      {...(q.has("controlado") ? {sidebarCollapsed: controlada} : {defaultSidebarCollapsed: q.get("inicio") === "recolhida" || undefined})}
      onSidebarCollapsedChange={avisar}>
      <Card><h1>Relatórios</h1><p id="avisos">{JSON.stringify(avisos)}</p></Card>
      {/* Altura para a página rolar: o botão tem de grudar junto com a lateral. */}
      <div style={{height: "200vh"}} />
    </AppShell>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><AureaProvider direction={q.get("dir") === "rtl" ? "rtl" : "ltr"}><Moldura /></AureaProvider></StrictMode>,
);
