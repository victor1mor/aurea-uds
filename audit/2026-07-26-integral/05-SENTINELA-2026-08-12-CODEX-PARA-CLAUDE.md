# Operação SENTINELA — reauditoria Codex para Claude — 12/08/2026

Este documento é o handoff completo para uma revisão independente da Claude. Ele registra
o que já estava em commits, o que foi encontrado e corrigido na reauditoria, todos os
arquivos da camada local, os gates realmente executados e o que ainda falta provar.

## 0. Veredito executivo

**Status: APROVAÇÃO CONDICIONAL.**

- Não há defeito P0/P1 conhecido aberto no checkout local após a reauditoria.
- Build, validação, testes unitários, empacotamento, proof server, auditoria de
  dependências e a suíte visual Chromium completa passaram.
- Firefox e WebKit estão **NÃO VERIFICADOS neste checkout**: os binários Playwright não
  estão instalados nesta máquina. Isso não foi convertido em falha e nenhum download
  grande foi feito sem autorização específica.
- A revisão independente pedida pelo Victor ainda é uma condição de aceite. Este próprio
  documento não substitui essa revisão.
- O `HEAD` continua em `b9a91ab`; a camada desta reauditoria está deliberadamente sem
  commit e sem push, para a Claude poder auditar o diff antes de qualquer integração.
- Não há servidor residual na porta 8123.

## 1. Limite de autorização e proveniência

O trabalho foi retomado somente depois da autorização literal do Victor: **“PODE FAZER”**.
Antes dessa autorização houve uma continuação indevida de edição durante uma atividade
que deveria ter permanecido de auditoria; este relatório torna essa ocorrência explícita
e não tenta ocultá-la em commit.

Estado reconstruído:

| Camada | Estado | Conteúdo |
|---|---|---|
| `e389d5a` | commit preexistente | SENTINELA AUD-0001, 0003, 0004 e 0005 |
| `b9a91ab` | commit preexistente e `HEAD` atual | SENTINELA AUD-0002, 0006, 0007, 0008 e 0009 |
| diff contra `b9a91ab` | local, não commitado | reauditoria, correções residuais, superfície pública, gates e este handoff |

Nenhum commit, push, publicação npm, atualização de baseline visual ou instalação de
navegador foi feita nesta continuação.

## 2. Achados originais revalidados

| ID | Severidade | Problema comprovado | Estado no checkout atual | Evidência/aceite principal |
|---|---|---|---|---|
| AUD-0001 | Alta | `Field` contaminava o nome acessível com hint/erro, criava labels aninhados e perdia ARIA em controles compostos | Resolvido, com reforço AUD-0010 | nome exato, descrição exata, `aria-invalid`, controles simples/compostos e grupos cobertos |
| AUD-0002 | Alta | IDs do `FileInput` colidiam com itens restaurados e uma ação podia remover/alterar mais de um item | Resolvido em `b9a91ab` | fila restaurada + novo arquivo mantém IDs únicos e remoção isolada |
| AUD-0003 | Alta | `Toggle` apenas com ícone podia ficar focável e sem nome | Resolvido, com reforço AUD-0012 | erro de tipo para forma anônima e testes runtime para nome acessível |
| AUD-0004 | Média | link `Button` desabilitado/loading ainda executava callback | Resolvido, com reforço AUD-0011 | bolha e captura bloqueadas; semântica `aria-disabled=true` não pode ser sobrescrita |
| AUD-0005 | Média | `MediaPlayer` de áudio descartava `onClick` | Resolvido em `e389d5a` | áudio chama callback uma vez; vídeo mantém callback e toggle |
| AUD-0006 | Média | estados ativos restaurados do `FileInput` geravam controles inertes e podiam bloquear recibo | Resolvido em `b9a91ab` | estados não terminais restaurados são normalizados para estado recuperável |
| AUD-0007 | Média | validador enumerava árvores ignoradas antes de filtrá-las e levava cerca de dois minutos | Resolvido em `b9a91ab` | caminhada poda diretórios antes da descida; gate atual em cerca de 21 s |
| AUD-0008 | Alta operacional | documentação canônica apontava para app removido, versão, módulos, M8 e contagens antigas | Resolvido em `b9a91ab`, com reforço AUD-0017 | validador cobre referências vivas e fatos derivados |
| AUD-0009 | Média | troca de arquivo single-preview mantinha object URL anterior até unmount | Resolvido em `b9a91ab` | remoção/substituição centralizada revoga URL imediatamente |

## 3. Achados residuais encontrados nesta reauditoria

### AUD-0010 — `Field` ainda falhava em Fragments e wrappers arbitrários — Alta

**Região:** `packages/react/src/inputs.tsx`, testes e conteúdo de catálogo.

**Evidência anterior à correção:** um filho único dentro de `Fragment` podia deixar
`<label for>` sem alvo; um componente wrapper arbitrário recebia `id`/ARIA no elemento
React externo sem garantia de repasse ao controle real. O resultado era associação de
rótulo quebrada. Também restavam textos dizendo que `Field` era o próprio `<label>`.

**Causa-raiz:** a estratégia de clone tratava “um elemento React” como sinônimo de
“controle rotulável”. Isso não é verdade para Fragment nem para componente arbitrário.

**Correção:** `filhoUnico` desembrulha Fragments recursivamente; `elementoRotulavel`
limita associação direta a elementos HTML rotuláveis e aos controles Aurea documentados.
Filhos múltiplos, Fragments múltiplos e wrappers não comprovados usam semântica de grupo.
Um filho com nome próprio por `label`, `aria-label` ou `aria-labelledby` também vira grupo,
sem receber um segundo `<label for>`.
Textos de catálogo, exemplo e referência histórica foram alinhados.

**Aceite:** testes cobrem Fragment único, Fragment múltiplo, wrapper arbitrário, nome ARIA
próprio, `Input`, `Switch` e `Combobox`; nome acessível é exato, hint/erro ficam só na
descrição, e o alvo de `htmlFor` existe quando aplicável.

**Estado:** resolvido no diff local.

### AUD-0011 — link desabilitado ainda vazava `onClickCapture` e ARIA — Média

**Região:** `packages/react/src/actions.tsx`.

**Evidência anterior à correção:** o bloqueio de AUD-0004 substituía apenas `onClick`.
`onClickCapture` ainda executava. Além disso, `aria-disabled={false}` fornecido pelo
consumidor podia sobrescrever o estado verdadeiro por causa da ordem do spread.

**Correção:** os dois handlers são extraídos e bloqueados quando `disabled` ou `loading`;
`aria-disabled=true` é aplicado depois das props do consumidor. O link habilitado mantém
os handlers normais.

**Aceite:** testes cobrem captura, bolha, loading, override de ARIA e link habilitado.

**Estado:** resolvido no diff local.

### AUD-0012 — `Toggle` aceitava conteúdo estruturalmente vazio — Alta

**Região:** `packages/react/src/actions.tsx` e contrato `Toggle`.

**Evidência anterior à correção:** `ReactNode` admite `false`, `null`, `undefined`, arrays
vazios e Fragments vazios. A união anterior bloqueava `<Toggle icon />`, mas ainda aceitava
formas que renderizam botão sem nome.

**Correção:** o tipo exclui boolean/null/undefined na forma com children; invariantes de
tipo dentro da própria fonte garantem que o compilador rejeite as formas diretas. Em
runtime, `temConteudoVisivel` percorre arrays, Fragments e elementos formatadores, rejeita
string/label em branco e não confunde conteúdo decorativo (`Icon`/`aria-hidden`) com texto.

**Aceite:** prova vermelha capturou array/Fragment vazios; depois da correção, vazios e
elementos decorativos ou label em branco geram o erro esperado, enquanto `label` não vazio,
texto direto e texto aninhado continuam nomeados.

**Limite conhecido:** um componente filho arbitrário sem children inspecionáveis pode
renderizar texto internamente, mas isso não pode ser conhecido antes do render. A guarda é
conservadora e exige `label` nesse caso.

**Estado:** resolvido para as formas verificáveis pela API.

### AUD-0013 — superfície pública React divergente — Média

**Região:** `packages/react/package.json`, barrel, README e CI.

**Evidência:** `agents.js` era gerado e `AgentCard` era reexportado no barrel, mas
`@aurea-uds/react/agents` resultava em `ERR_PACKAGE_PATH_NOT_EXPORTED`. Em paralelo, a
documentação dizia que somente três módulos com engines opcionais ficavam fora do barrel,
mas havia seis: `code-editor`, `data-grid`, `qrcode`, `calendar`, `chart` e `graph`.

**Correção:** o subpath `./agents` foi exportado; o barrel continua leve; os seis módulos
opcionais permanecem somente em subpaths. README, comentário do barrel e smoke de CI foram
alinhados.

**Aceite:** import runtime de 21 entradas públicas passou; resultado observado:
`surface OK 97 14 6` (97 exports no barrel, 14 subpaths leves e 6 opcionais).

**Estado:** resolvido no diff local.

### AUD-0014 — `@aurea-uds/tokens/css` falhava no TypeScript — Média

**Região:** pacote tokens, build e baseline do tarball.

**Evidência:** o subpath CSS não publicava declaração de tipo. Um consumidor TypeScript
com resolução bundler falhava com `TS2882`.

**Correção:** condição `types` no export, geração determinística de
`dist/aurea.tokens.css.d.ts`, type-test por autorreferência do pacote, script de typecheck
e arquivo esperado no baseline de empacotamento.

**Aceite:** uma prova negativa apontando temporariamente para declaração ausente falhou
com `TS2882`; restaurado o export, `build:tokens`, typecheck e `pack:check` passaram.

**Estado:** resolvido no diff local.

### AUD-0015 — contrato de distribuição e versões não cobriam a superfície real — Média

**Região:** `packages/contracts/aurea.contract.json`, `scripts/validate.py`, plano e
protocolo.

**Evidência:** o contrato omitira o pacote público `@aurea-uds/fonts`; a regra de consumo
de tokens podia induzir import duplo com core; e a verificação de versão existente em um
worktree paralelo ainda não estava no `main`.

**Correção:** fonts foi incluído; a instrução diferencia consumo de tokens isolados do
core que já os embute; o check 32 valida a versão raiz, os seis manifests publicáveis e o
contrato; o check 34 compara dinamicamente a lista contratual com manifests que têm
`publishConfig.access=public`.

**Aceite:** alterar tokens para `0.2.1` fez o check de versões falhar; remover fonts do
contrato fez o check de superfície falhar; ambos passaram após restauração.

**Estado:** resolvido no diff local. Nenhuma alteração foi feita no worktree paralelo.

### AUD-0016 — contratos não visuais do catálogo eram Chromium-only — Média

**Região:** `tests/visual/catalog.spec.ts` e `catalog-sweep.spec.ts`.

**Evidência:** quatro testes comportamentais — breadcrumb/modelo, `aria-current`, ícones
da lateral e abas Preview/Code — estavam no mesmo arquivo das screenshots. A configuração
ignora esse arquivo inteiro em Firefox/WebKit, logo os contratos não pixel eram omitidos.

**Correção:** os quatro testes foram movidos para o sweep cross-engine; screenshots
continuam Chromium-only, sem alterar o roteamento de projetos.

**Aceite:** os quatro passaram em Chromium. Firefox/WebKit não puderam iniciar por ausência
dos binários locais; o código está roteado para eles, mas a execução atual permanece não
verificada.

**Estado:** correção estrutural resolvida; gate cross-engine pendente.

### AUD-0017 — resíduos documentais após AUD-0008 — Média operacional

**Região:** README, MAP, catálogo, exemplo, referências, plano/protocolo e changelog.

**Evidência:** ainda havia frases como “Field is a `<label>`”, “error replaces the hint”,
M8 aberto e contagens rígidas que já haviam divergido.

**Correção:** documentação viva foi atualizada para a semântica atual; evidência antiga em
`REFERENCES.md` foi explicitamente marcada como histórica; contagens frágeis de módulos
foram substituídas por fronteiras de pacote; plano/protocolo registram os gates fechados.

**Aceite:** busca dirigida não encontrou as frases obsoletas; o catálogo foi regenerado e
o validador passou.

**Estado:** resolvido no diff local.

## 4. Gates executados e resultado real

| Gate | Resultado |
|---|---|
| provas vermelhas focais | falharam antes das correções em Toggle vazio, wrapper de Field e controle com nome ARIA próprio; suíte focal final 273/273 |
| `pnpm build` | passou sequencialmente em 25,8 s; incluiu tokens, React, catálogo e proof client |
| catálogo gerado | 206 páginas: 92 componentes, 22 ricos, 70 starters, 71 patterns, 15 blocks, 23 recipes, tokens e 4 índices |
| `python scripts/validate.py` | passou; 32 checks; aproximadamente 21 s |
| `pnpm test` | passou no checkout final: 9 arquivos, 689 testes, 29,2 s |
| `pnpm pack:check` | passou: contracts 4, core 6, fonts 16, icons 5, react 51, tokens 6 arquivos |
| `pnpm build:proof-server` | passou com Next 16.3.0, TypeScript e páginas estáticas |
| `pnpm audit --audit-level=high` | passou: nenhuma vulnerabilidade conhecida |
| smoke de superfície pública | passou: 21 entradas, 6 pacotes públicos, versão 0.2.0 |
| import runtime da superfície React | passou: `surface OK 97 14 6` |
| Playwright Chromium completo | passou no checkout final: 62/62 em 449,1 s |
| Firefox focal | não executou: faltou `firefox-1532/firefox/firefox.exe` |
| WebKit focal | não executou: faltou `webkit-2311/Playwright.exe` |
| `git diff --check` | passou |
| porta 8123 antes/depois | sem listener residual |

Observações honestas:

- Uma repetição intermediária lançou build e unitários em paralelo. No Windows, o Vitest
  manteve arquivos `dist` mapeados e o TypeScript falhou com `TS5033` ao sobrescrevê-los.
  Nenhum processo foi encerrado; depois que o teste terminou, o mesmo build executado
  sequencialmente passou. Isso foi erro de orquestração desta reauditoria, não gate verde.
- A primeira tentativa de regenerar `manifest.json` logo após o último Playwright recebeu
  `OSError 22` do Windows. O arquivo estava íntegro, gravável e sem listener do servidor;
  a repetição isolada passou. A tentativa falha não foi contabilizada como sucesso.
- O Vitest emitiu a mensagem conhecida do jsdom sobre navegação para outro documento;
  o processo terminou com sucesso e 689/689 testes passaram.
- A suíte visual solicitou `/x.mp4` em dois fixtures de `MediaPlayer` e recebeu 404; os
  testes correspondentes passaram e o sweep de erros/recursos do catálogo também passou.
- Nenhum baseline de screenshot foi regravado.
- A ausência dos navegadores não autoriza chamar Firefox/WebKit de “passou”.
- `manifest.json` mede 354 declarações de teste no source; o Vitest expande tabelas e
  executou 689 casos. São métricas diferentes, não divergência.

## 5. Inventário integral da camada local contra `b9a91ab`

Cada caminho abaixo está alterado ou criado por esta camada. Os HTML e arquivos `dist`
são artefatos gerados a partir das fontes correspondentes.

### Governança, CI e documentação

| Arquivo | Mudança |
|---|---|
| `.github/workflows/ci.yml` | smoke da superfície React atualizado para subpaths leves e seis módulos opcionais |
| `.gitignore` | ignora `apps/proof-*/tsconfig.tsbuildinfo` gerado pelo typecheck |
| `CHANGELOG.md` | registra correções da reauditoria e novos gates |
| `MAP.md` | remove contagens frágeis e documenta fronteiras do pacote React |
| `PLANO-1.0.md` | registra verificação de consistência de versão concluída |
| `README.md` | corrige superfície pública e módulos opcionais |
| `REFERENCES.md` | marca implementação antiga de Field como evidência histórica |
| `STATE.md` | bloco derivado atualizado pelo validador |
| `audit/2026-07-26-integral/00-INDEX.md` | inclui este handoff no índice |
| `audit/2026-07-26-integral/04-PROTOCOLO-IA.md` | registra gates 32 e 34 e estado de continuidade |
| `audit/2026-07-26-integral/05-SENTINELA-2026-08-12-CODEX-PARA-CLAUDE.md` | este relatório completo |
| `examples/react/App.tsx` | comentário de Field alinhado ao DOM atual |
| `manifest.json` | fatos derivados regenerados |

### Contratos e pacotes

| Arquivo | Mudança |
|---|---|
| `packages/contracts/aurea.contract.json` | inclui fonts e qualifica consumo de tokens CSS |
| `packages/contracts/registry/Field.json` | contrato de label/descrição/grupo alinhado |
| `packages/contracts/registry/Toggle.json` | exigência de nome acessível alinhada |
| `packages/react/README.md` | documenta seis módulos opcionais e superfície leve |
| `packages/react/package.json` | exporta `./agents` |
| `packages/react/src/actions.tsx` | Toggle vazio e bloqueio completo de link desabilitado |
| `packages/react/src/index.tsx` | comentário/superfície pública alinhados |
| `packages/react/src/inputs.tsx` | associação robusta de Field com Fragments e grupos |
| `packages/react/dist/actions.d.ts` | declaração gerada |
| `packages/react/dist/actions.js` | runtime gerado |
| `packages/react/dist/index.js` | barrel gerado |
| `packages/react/dist/inputs.js` | runtime gerado |
| `packages/tokens/package.json` | export CSS com types e script de typecheck |
| `packages/tokens/css-import.type-test.ts` | prova TypeScript por autorreferência do pacote |
| `packages/tokens/dist/aurea.tokens.css.d.ts` | declaração gerada para import CSS |
| `package.json` | `build:tokens` executa build e typecheck no pacote correto |

### Build, validação e catálogo

| Arquivo | Mudança |
|---|---|
| `scripts/build-catalog.mjs` | geração alinhada à semântica atual de Field |
| `scripts/build-tokens.mjs` | gera a declaração do subpath CSS |
| `scripts/package-files.json` | inclui a nova declaração no baseline do tarball |
| `scripts/validate.py` | checks de versão e superfície contratual; seleção compartilhada de pacotes públicos |
| `apps/catalog/content/Field.mjs` | features e semântica atualizadas |
| `apps/catalog/content/Textarea.mjs` | descrição acessível corrigida |
| `apps/catalog/content/_starters.mjs` | remove referência a M8 aberto |
| `apps/catalog/content/patterns/Field.mjs` | hint e erro descritos cumulativamente |
| `apps/catalog/block-device-control.html` | saída gerada; Range com nome ARIA próprio usa grupo, sem segundo label |
| `apps/catalog/field.html` | saída gerada |
| `apps/catalog/pattern-field-rejected-value.html` | saída gerada |
| `apps/catalog/patterns.html` | saída gerada |
| `apps/catalog/radio.html` | saída gerada |
| `apps/catalog/range.html` | saída gerada |
| `apps/catalog/textarea.html` | saída gerada |
| `apps/catalog/toggle.html` | saída gerada |

### Testes

| Arquivo | Mudança |
|---|---|
| `tests/unit/components.test.tsx` | captura/ARIA de Button e regressões relacionadas |
| `tests/unit/lote1.test.tsx` | Toggle vazio e formas nomeadas |
| `tests/unit/stable.test.tsx` | Field com Fragment, wrapper, grupo e associações |
| `tests/visual/catalog-sweep.spec.ts` | recebe quatro contratos cross-engine não pixel |
| `tests/visual/catalog.spec.ts` | mantém somente contratos Chromium/pixel apropriados |

## 6. Arquivos dos dois commits preexistentes

Esta lista evita que a revisão independente olhe apenas o diff local e esqueça o trabalho
que já entrou em commits antes desta reauditoria.

### Commit `e389d5a` — AUD-0001/0003/0004/0005

- `CHANGELOG.md`, `STATE.md`, `manifest.json`.
- `packages/contracts/registry/Field.json`, `Toggle.json`.
- `packages/react/src/actions.tsx`, `inputs.tsx`, `media.tsx` e seus artefatos em `dist`.
- `tests/unit/components.test.tsx`, `lote1.test.tsx`, `stable.test.tsx`.
- Conteúdo/HTML de catálogo para Range, Field, Input, Radio, Select, Textarea, Toggle,
  SearchField, blocks, patterns e recipes afetados pela mudança de DOM.

### Commit `b9a91ab` — AUD-0002/0006/0007/0008/0009

- `AUREA.md`, `BUILDING.md`, `QUALITY.md`, `README.md`, `ROADMAP.md`, `CHANGELOG.md`,
  `STATE.md`, `manifest.json`.
- `packages/contracts/registry/FileInput.json`.
- `packages/react/src/file-input.tsx` e `packages/react/dist/file-input.js`.
- `scripts/validate.py`.
- `tests/unit/components.test.tsx`.
- `apps/catalog/fileinput.html`.

Para verificar a lista exata, usar `git show --stat e389d5a` e
`git show --stat b9a91ab`; não inferir autoria da camada local a partir desses commits.

## 7. O que ainda falta

1. **Claude deve auditar independentemente** o diff completo de `b9a91ab` até o worktree,
   além de revisar os dois commits antecedentes.
2. **Firefox e WebKit devem ser executados** quando houver autorização para instalar os
   binários Playwright ou em ambiente que já os possua. Até lá, o estado é não verificado.
3. **Somente após a revisão**, decidir se a camada deve ser commitada. Não há autorização
   implícita para push ou publicação.
4. Se a política exigir duas passagens independentes totalmente limpas, a segunda é a
   própria revisão Claude; por isso este relatório não declara “APROVADO” pleno.

Não ficou pendente correção conhecida de código fonte, geração de dist/catálogo ou gate
Chromium. Um filho customizado de `Toggle` sem texto inspecionável precisa fornecer `label`;
essa escolha conservadora evita presumir um nome que o ReactNode não consegue provar.

## 8. Roteiro exato para a auditoria Claude

1. Confirmar `HEAD=b9a91ab`, branch, status e ausência de mudanças externas inesperadas.
2. Ler `CLAUDE.md`, este relatório e o diff completo: `git diff b9a91ab --`.
3. Reproduzir primeiro os testes focais de Field, Toggle, Button, FileInput e MediaPlayer.
4. Revisar a allowlist de `elementoRotulavel`, a recursão de `temConteudoVisivel`, a ordem
   de props do anchor e a seleção de pacotes públicos em `validate.py`.
5. Conferir que `dist`, contratos e HTML gerado correspondem às fontes; não editar gerado
   isoladamente.
6. Reexecutar build, validação, unitários, pack check, proof server e Chromium.
7. Com autorização/ambiente adequado, executar Firefox e WebKit sem regravar screenshots.
8. Classificar cada AUD como `RESOLVIDO`, `PARCIAL`, `REGRESSÃO` ou `NÃO VERIFICADO`, com
   comando e evidência. Não transformar timeout ou browser ausente em sucesso.
9. Não encerrar processos que não tenham sido iniciados pela própria revisão.
10. Não criar commit, push ou publicação sem nova autorização literal do Victor.

## 9. Critério de encerramento recomendado

A camada pode sair de **APROVAÇÃO CONDICIONAL** para **APROVADO** somente se:

- a revisão independente não encontrar regressão P0/P1/P2 material;
- todos os gates locais continuarem verdes;
- Firefox/WebKit passarem no conjunto cross-engine ou houver waiver explícito e registrado;
- o diff auditado for exatamente o diff integrado;
- o tracker/relatório final distinguir fatos verificados de limitações.
