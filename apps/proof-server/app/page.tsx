// COMPONENTE DE SERVIDOR — este arquivo NÃO declara `"use client"`, e é exatamente por isso que
// ele existe. Item A3 do PLANO-1.0.
//
// O modo de falha que esta página trava (medido em 02/08/2026, corrigido em 06/08): sem as
// diretivas, o barril reexportava um módulo que chama `createContext`, e este import quebrava na
// hora — no consumidor, não em nós. Se alguém tirar uma diretiva, `next build` morre aqui.
//
// Cada linha abaixo prova uma coisa diferente, e nenhuma é decorativa:
//   • o import é do BARRIL, não de um subpath — é o caminho que o consumidor usa primeiro;
//   • `cx()` é CHAMADO no servidor: se ele viesse de um módulo com a diretiva, seria uma
//     referência de cliente e explodiria aqui. É o que o `pure.tsx` existe para impedir;
//   • `ptBR` é dado puro atravessando para um provider de cliente;
//   • `Accordion` continua sendo componente de SERVIDOR (marcação pura) e é renderizado como um;
//   • `Toggle` é de cliente e NÃO CONTROLADO de propósito: um manipulador aqui tornaria esta
//     página de cliente e a prova viraria decoração.
import {AureaProvider, Accordion, Badge, Button, Card, Stack, Toggle, cx, ptBR} from "@aurea-uds/react";
// E o SUBPATH da categoria, que até 16/08/2026 esta página não exercitava — o comentário acima
// dizia "o import é do BARRIL", e era descrição de uma cobertura que faltava. Cada módulo de
// categoria virou uma VITRINE sem diretiva (ADR-0026), que reexporta o irmão `-client` e o
// `markup.js`. Isto aqui é o único lugar do repositório onde um empacotador de RSC de verdade
// resolve essa forma; `tsc` não a testa.
//
// O QUE ESTA LINHA PROVA: que a vitrine resolve e renderiza numa página de servidor. O que ela
// NÃO prova é o PESO — componente de cliente também renderiza aqui sem reclamar. Quem cobra o
// peso é o check 26b, que reprova a diretiva em cima de um reexport do `markup.js`.
import {KPI, Kbd} from "@aurea-uds/react/data-display";

export default function Page() {
  const marca = cx("card", "card-raised", false && "nunca");
  return <main id="prova" className="stack">
    <h1>Aurea — fronteira servidor/cliente</h1>

    {/* servidor: sem provider, sem estado, sem JavaScript no cliente */}
    <div id="do-servidor" className={marca} data-cx={marca}>
      <Accordion items={[{id: "a", title: "Renderizado no servidor", content: "Sem hidratação."}]}/>
      <KPI id="do-subpath" label={<>Pelo subpath, tecla <Kbd>K</Kbd></>} value="sem diretiva"/>
    </div>

    {/* cliente: o provider e o controle de dois estados */}
    <AureaProvider strings={ptBR}>
      <Card id="do-cliente">
        <Stack>
          <Badge>{ptBR.loading}</Badge>
          <Toggle id="alvo" defaultPressed={false}>Alternar</Toggle>
          <Button>{ptBR.next}</Button>
        </Stack>
      </Card>
    </AureaProvider>
  </main>;
}
