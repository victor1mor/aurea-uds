// O OUTRO LADO da fronteira — item A4 do PLANO-1.0. SPA, sem servidor: tudo aqui é cliente.
//
// Vale como prova por três motivos que o A3 não cobre:
//   • um empacotador de cliente vê as diretivas `"use client"` como texto e as DESCARTA (o
//     Rollup ainda avisa). Se elas quebrassem alguma coisa deste lado, quebraria aqui;
//   • a resolução é pelo mapa `exports` do pacote — barril e subpath, os dois caminhos que o
//     consumidor tem;
//   • estado de verdade: o Toggle é controlado a partir daqui, então há evento, re-render e
//     hidratação — que é o que o A3, sendo estático, não exercita.
import {StrictMode, useState} from "react";
import {createRoot} from "react-dom/client";
import {AureaProvider, Badge, Button, Card, Stack, Toggle, cx, ptBR} from "@aurea-uds/react";
import {Accordion} from "@aurea-uds/react/disclosure";
import "@aurea-uds/core/css";

function App() {
  const [ligado, setLigado] = useState(false);
  return <main id="prova" className={cx("stack", ligado && "ligado")}>
    <h1>Aurea — empacotador de cliente</h1>
    <Accordion items={[{id: "a", title: "Do subpath", content: "@aurea-uds/react/disclosure"}]}/>
    <AureaProvider strings={ptBR}>
      <Card id="do-cliente">
        <Stack>
          <Badge id="estado">{ligado ? ptBR.next : ptBR.previous}</Badge>
          <Toggle id="alvo" pressed={ligado} onPressedChange={setLigado}>Alternar</Toggle>
          <Button>{ptBR.close}</Button>
        </Stack>
      </Card>
    </AureaProvider>
  </main>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App/></StrictMode>);
