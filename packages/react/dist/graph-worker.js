// O TRABALHADOR DO MAPA (MNT-22, 0.32.0): o arrumador do `DependencyGraph` fora da tela principal, por
// um caminho da Aurea.
//
//   Vite:  import TrabalhadorDoMapa from "@aurea-uds/react/graph-worker?worker";
//          <DependencyGraph layout="layered" layoutWorker={() => new TrabalhadorDoMapa()} … />
//
// Por que existe: a receita antiga importava `elkjs/lib/elk-worker.min.js` direto, e a trava do app de
// rede reprova motor importado por fora da Aurea (`motor-usado-por-fora`). Este módulo é UMA linha que
// importa o trabalhador do `elkjs` (peer opcional) — ele NÃO copia o `elkjs` para dentro do pacote, que
// seria redistribuí-lo (decisão do Victor, 10/10/2026).
//
// Como funciona: o `elk-worker.min.js`, quando roda num trabalhador (sem `document`, com `self`), se
// registra sozinho em `self.onmessage` antes de qualquer outra coisa (medido no 0.12.0). O empacotador
// junta os dois num arquivo de trabalhador, e o `elk-api` da Aurea conversa com ele.
//
// ⚠ Este arquivo é a única exceção ao `sideEffects: false` do pacote: o import abaixo É o efeito.
import "elkjs/lib/elk-worker.min.js";
