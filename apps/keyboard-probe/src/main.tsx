// BANCO DE MEDIÇÃO DO TECLADO — a segunda metade do `G-A11Y-04`.
//
// A primeira metade cobriu os componentes que SÃO elemento nativo, e ali a medição cabia numa
// página estática: `<input type=range>` e `<select>` não precisam de React para responder a
// tecla. A matriz do §13 deixou oito capacidades cujo teclado a `radix` declara mais rico que a
// ficha da Aurea — e essas vêm do MOTOR, então precisam montar de verdade para serem medidas.
//
// Por que uma aplicação e não a página do catálogo: o catálogo é gerado por
// `renderToStaticMarkup`. Efeito não roda ali, e teclado de motor é efeito — `roving tabindex`,
// captura de tecla, foco gerido. Medir no catálogo mediria HTML parado.
//
// O que este arquivo NÃO faz: ele não afirma nada. Ele monta, e quem afirma é
// `tests/visual/teclado-motor.spec.ts`, que pressiona tecla e observa se algo mudou.
import {StrictMode, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  AureaProvider, Accordion, Avatar, ButtonGroup, Checkbox, DropdownMenu, Field, Icon, Separator,
  Switch, Tabs, Toggle, ToggleGroup, Toolbar, Radio, Button, Select, OTPField, Menubar,
  Input, InputGroup, InputGroupAddon, TreeView, FileInput, Sidebar, ContextMenu, IconButton,
  SegmentedControl, Collapsible, NumberField, SearchField, PasswordField, Combobox, Stepper,
  Textarea, Form, Pagination, NavList, BottomNav, SortableList, Carousel, Gallery, Card,
  MediaEmbed,
} from "@aurea-uds/react";
// A leva de 29/08/2026. Estes vieram da outra linhagem, onde o check 30 não existia: as fichas
// declaravam teclado sem uma medição atrás. Os de `agents` e o `DependencyGraph` moram em
// subcaminho próprio pelo check 19, como o DataGrid e o Calendar.
import {AutomationCard, InterAgentMessage, InvocationPanel, MemoryLedger, ToolPermission} from "@aurea-uds/react/agents";
import {DependencyGraph} from "@aurea-uds/react/graph";
// O `CodeEditor` mora em subcaminho próprio pelo check 19 (CodeMirror é dependência pesada).
import {CodeEditor} from "@aurea-uds/react/code-editor";
import {BlockEditor} from "@aurea-uds/react";
// O `DataGrid` mora em subcaminho próprio por causa do check 19 — dependência pesada
// (`@tanstack/react-table`) não entra no módulo raiz. Importar de "@aurea-uds/react" falha o
// build, e o erro é o gate funcionando.
import {DataGrid} from "@aurea-uds/react/data-grid";
// O `Calendar` também mora em subcaminho próprio (react-day-picker), pelo check 19.
import {Calendar} from "@aurea-uds/react/calendar";
import "@aurea-uds/core/css";

// 1×1 transparente: o banco não fala com a rede, e a medição aqui é de tecla, não de imagem.
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const ITENS = [
  {id: "um", title: "Primeiro", content: "conteúdo um"},
  {id: "dois", title: "Segundo", content: "conteúdo dois"},
  {id: "tres", title: "Terceiro", content: "conteúdo três"},
];

function App() {
  const [aba, setAba] = useState("a");
  // as seções do G-AXIS-06 têm estado PRÓPRIO: compartilhar `aba` com as de cima faria uma
  // medição mexer na outra, e o teste falharia por interferência e não por defeito.
  const [abaComp, setAbaComp] = useState("um");
  const [otp, setOtp] = useState("");
  // OS BANCOS DE BOTÃO PRECISAM DE EFEITO OBSERVÁVEL, e isso não é enfeite do fixture.
  // A foto do probe compara o DOM antes e depois da tecla. Um `<button onClick={() => {}}>`
  // recebe o Enter, chama o handler, e NADA muda no documento — a medição sai "tecla inerte", e
  // o gate acusa o componente de não ter teclado. Medido em 27/08/2026: foi o que aconteceu com
  // Sidebar, IconButton e ContextMenu na primeira execução dos sete bancos novos.
  // `data-ativado` é o efeito mínimo que torna o clique visível para a foto.
  const [ativado, setAtivado] = useState<Record<string, number>>({});
  const [segmento, setSegmento] = useState("b");
  const [pagina, setPagina] = useState(5);
  const [ordem, setOrdem] = useState([
    {id: "a", label: "Messenger"}, {id: "b", label: "Analyst"}, {id: "c", label: "Curator"},
  ]);
  const [galeria, setGaleria] = useState("b");
  const [automacao, setAutomacao] = useState(true);
  const [no, setNo] = useState<string | null>("b");
  const [blocos, setBlocos] = useState([
    {id: "b1", kind: "Texto", children: "Primeiro bloco"},
    {id: "b2", kind: "Texto", children: "Segundo bloco"},
    {id: "b3", kind: "Texto", children: "Terceiro bloco"},
  ]);

  const marca = (k: string) => () => setAtivado((a) => ({...a, [k]: (a[k] ?? 0) + 1}));
  // Cada banco tem `data-probe` com o NOME DA FICHA: é a chave que liga a medição ao contrato,
  // e é o que impede o teste de medir um componente e cobrar de outro.
  return <AureaProvider>
    <main style={{display: "grid", gap: "2rem", padding: "2rem"}}>
      <section data-probe="Accordion"><Accordion items={ITENS} /></section>

      <section data-probe="Checkbox">
        <Checkbox label="Um" defaultChecked /><Checkbox label="Dois" />
      </section>

      <section data-probe="Radio">
        <Radio name="r" label="Um" defaultChecked /><Radio name="r" label="Dois" />
        <Radio name="r" label="Três" />
      </section>

      <section data-probe="Tabs">
        <Tabs label="Relatório" value={aba} onChange={setAba} tabs={[
          {id: "a", label: "Um", content: "um"},
          {id: "b", label: "Dois", content: "dois"},
          {id: "c", label: "Três", content: "três"},
        ]} />
      </section>

      {/* os dois eixos VERTICAIS do G-AXIS-03, aqui porque este é o único lugar do repositório
          onde os componentes montam de verdade num navegador — e grade vertical se confere
          medindo caixa, não lendo CSS. */}
      <section data-probe="TabsVertical">
        {/* O conteúdo da aba SELECIONADA é o longo, de propósito: só o painel ativo renderiza,
            e o defeito que a grade evita — a lista esticar até a altura do painel — só aparece
            quando o painel é MAIS ALTO que a lista. Com o texto longo numa aba não selecionada o
            gate passava com o defeito de volta; medido em 22/08/2026. */}
        <Tabs label="Vertical" orientation="vertical" value={aba} onChange={setAba} tabs={[
          {id: "a", label: "Um", content: Array.from({length: 8}, (_, i) =>
            <p key={i}>Parágrafo {i + 1}: o painel precisa ficar bem mais alto que a coluna de
            rótulos, senão a linha e a grade desenham igual e o teste não separa as duas.</p>)},
          {id: "b", label: "Dois com rótulo bem mais longo", content: "conteúdo dois"},
          {id: "c", label: "Três", content: "conteúdo três"},
        ]} />
      </section>

      {/* G-AXIS-04 — A PROVA. Os três botões têm o MESMO `size` e estão na MESMA viewport; o
          que muda é a largura do contêiner em que cada um foi posto. Se os três medirem igual,
          a container query não está funcionando e o que existe é uma media query com outro
          nome — foi por isso que o Victor pediu exatamente este exemplo. */}
      <section data-probe="ResponsivoContainer">
        {[260, 520, 820].map(w => (
          <div key={w} className="container-scope" style={{inlineSize: w, marginBottom: "1rem",
            border: "1px dashed var(--border)", padding: "0.5rem"}}>
            <Button data-w={w} size={{base: "xs", container: {xs: "sm", sm: "md", md: "lg"}}}>
              contêiner de {w}px
            </Button>
          </div>
        ))}
      </section>

      {/* AS TRÊS FAMÍLIAS RESTANTES (22/08/2026). Mesma viewport, contêineres crescentes: cada
          família tem de acompanhar pela SUA escala. E o ícone dentro do botão responsivo NÃO pode
          acompanhar — ele é de outra escala, e o `@property` da camada é o que corta a herança. */}
      <section data-probe="ResponsivoFamilias">
        {[260, 520, 820].map(w => (
          <div key={w} className="container-scope" data-largura={w}
            style={{inlineSize: w, marginBottom: "1rem", border: "1px dashed var(--border)", padding: "0.5rem"}}>
            <Button leadingIcon="add" size={{base: "xs", container: {xs: "sm", sm: "md", md: "lg"}}}>
              botão com ícone
            </Button>
            <Checkbox label="marcação" size={{base: "sm", container: {sm: "md", md: "lg"}}} />
            <Switch label="trilho" size={{base: "sm", container: {sm: "md", md: "lg"}}} />
            <Avatar fallback="AB" size={{base: "sm", container: {sm: "md", md: "lg"}}} />
            <Icon name="add" size={{base: "sm", container: {sm: "lg", md: "xl"}}} />
          </div>
        ))}
      </section>

      {/* O EIXO DE ORIENTAÇÃO pela mesma camada. Três contêineres, mesma viewport: o grupo tem de
          empilhar sozinho no estreito e enfileirar no largo. Só os três componentes em que a
          orientação ANUNCIADA não pode divergir da visual — ver a tabela do gerador. */}
      <section data-probe="ResponsivoOrientacao">
        {[260, 520, 820].map(w => (
          <div key={w} className="container-scope" data-largura={w}
            style={{inlineSize: w, marginBottom: "1rem", border: "1px dashed var(--border)", padding: "0.5rem"}}>
            <ButtonGroup label={`Ações ${w}`} orientation={{base: "vertical", container: {sm: "horizontal"}}}>
              <Button>Duplicar</Button><Button>Arquivar</Button>
            </ButtonGroup>
            <Field label="Rótulo" orientation={{base: "vertical", container: {sm: "horizontal"}}}>
              <input className="input" defaultValue="valor" />
            </Field>
          </div>
        ))}
      </section>

      {/* G-AXIS-06 — os CINCO comportamentais, resolvidos em runtime. Aqui o que se mede não é só
          geometria: é o `aria-orientation`, o `data-orientation`, o teclado e o desenho dizendo a
          MESMA coisa, nos dois lados de cada ponto e nas duas travessias. */}
      <section data-probe="ComportamentalContainer">
        {[420, 900].map(w => (
          <div key={w} className="container-scope" data-largura={w}
            style={{inlineSize: w, marginBottom: "1rem", border: "1px dashed var(--border)", padding: "0.5rem"}}>
            <Tabs value={abaComp} onChange={setAbaComp} label={`Abas ${w}`}
              orientation={{base: "vertical", container: {sm: "horizontal"}}}
              tabs={[{id: "um", label: "Um", content: "1"}, {id: "dois", label: "Dois", content: "2"},
                     {id: "tres", label: "Três", content: "3"}]} />
            <Toolbar label={`Barra ${w}`} orientation={{base: "vertical", container: {sm: "horizontal"}}}>
              <Button>A</Button><Button>B</Button>
            </Toolbar>
            <ToggleGroup label={`Grupo ${w}`} orientation={{base: "vertical", container: {sm: "horizontal"}}}>
              <Toggle value="a">A</Toggle><Toggle value="b">B</Toggle>
            </ToggleGroup>
            <Menubar label={`Menu ${w}`} orientation={{base: "vertical", container: {sm: "horizontal"}}}
              menus={[{label: "Arquivo", items: [{label: "Novo"}]}, {label: "Editar", items: [{label: "Desfazer"}]}]} />
            <Separator orientation={{base: "vertical", container: {sm: "horizontal"}}} />
          </div>
        ))}
      </section>

      {/* G-A11Y-06 / ADR-0048 — o adorno de campo com os dois eixos separados. O que se mede aqui
          não é geometria: é a ORDEM. `side` decide o DOM, `layout` decide o desenho, e os dois
          têm de continuar dizendo a mesma coisa em qualquer largura e nos dois sentidos. */}
      <section data-probe="AdornoEstrutural">
        {[300, 900].map(w => (
          <div key={w} className="container-scope" data-largura={w}
            style={{inlineSize: w, marginBottom: "1rem", border: "1px dashed var(--border)", padding: "0.5rem"}}>
            {/* start focável + end focável, com o `start` escrito DEPOIS do campo de propósito:
                o grupo tem de colocá-lo antes no DOM. */}
            <InputGroup>
              <Input aria-label={`campo ${w}`} defaultValue="valor" />
              <InputGroupAddon side="start" layout={{base: "block", container: {sm: "inline"}}}>
                <button className="btn btn-sm" type="button">antes</button>
              </InputGroupAddon>
              <InputGroupAddon side="end" layout={{base: "block", container: {sm: "inline"}}}>
                <button className="btn btn-sm" type="button">depois</button>
              </InputGroupAddon>
            </InputGroup>
            {/* múltiplos adornos do mesmo lado, e um Textarea em vez de Input */}
            <InputGroup>
              <textarea className="textarea" rows={2} aria-label={`texto ${w}`} defaultValue="x" />
              <InputGroupAddon side="end" layout={{base: "block", container: {sm: "inline"}}}>
                <button className="btn btn-sm" type="button">um</button>
              </InputGroupAddon>
              <InputGroupAddon side="end" layout={{base: "block", container: {sm: "inline"}}}>
                <button className="btn btn-sm" type="button">dois</button>
              </InputGroupAddon>
            </InputGroup>
          </div>
        ))}
      </section>

      {/* o mesmo eixo comportamental, mas por JANELA — matchMedia, não ResizeObserver. */}
      <section data-probe="ComportamentalViewport">
        <Tabs value={abaComp} onChange={setAbaComp} label="Abas por janela"
          orientation={{base: "vertical", viewport: {md: "horizontal"}}}
          tabs={[{id: "um", label: "Um", content: "1"}, {id: "dois", label: "Dois", content: "2"}]} />
      </section>

      {/* e o outro mecanismo, para comparação: este reage à JANELA, não ao contêiner. */}
      <section data-probe="ResponsivoViewport">
        <Button size={{base: "xs", viewport: {sm: "md", lg: "xl"}}}>reage à janela</Button>
      </section>

      <section data-probe="MenubarVertical">
        <Menubar label="Vertical" orientation="vertical" menus={[
          {label: "Arquivo", items: [{label: "Novo"}, {label: "Abrir"}]},
          {label: "Editar com rótulo longo", items: [{label: "Desfazer"}]},
        ]} />
      </section>

      <section data-probe="DropdownMenu">
        <DropdownMenu trigger={<Button>Abrir menu</Button>} items={[
          {label: "Renomear"}, {label: "Duplicar"}, "separator", {label: "Remover"},
        ]} />
      </section>

      <section data-probe="Select">
        <Select aria-label="Fuso" defaultValue="b">
          <option value="a">A</option><option value="b">B</option><option value="c">C</option>
        </Select>
      </section>

      <section data-probe="OTPField">
        <OTPField length={4} label="Código" value={otp} onValueChange={setOtp} />
      </section>

      {/* O `DataGrid` entrou em 27/08/2026, ao LER a célula `data-grid·teclado` da matriz do §13.
          Ele era o único dos oito bancos cuja ficha declarava teclado SEM `keyboardNote` — ou
          seja, sem medição no navegador atrás. Declarar quatro setas de memória é exatamente o
          que o `G-A11Y-04` existe para não deixar acontecer.

          E ele é `selectable`: a mesma montagem serve ao `G-STATE-03`, que é a ficha declarar
          `states: []` num componente que tem seleção de linha. Um banco, duas medições. */}
      {/* AS SETE QUE DECLARAVAM TECLADO SEM MEDIÇÃO NENHUMA ATRÁS.
          Medido em 27/08/2026: além do DataGrid, outras sete fichas declaravam `a11y.keyboard`
          sem `keyboardNote` — ou seja, teclas escritas de memória. O DataGrid provou que isso
          não é zelo excessivo: as quatro dele eram ficção, e a ficha prometia `role: "grid"`.
          "Quem mais tem esse problema?" é a pergunta obrigatória do CLAUDE.md, e a resposta
          eram estas sete. */}
      {/* `mode="single"` não é detalhe do fixture: SEM ele o react-day-picker desenha os dias
          como texto em <td>, sem botão nenhum, e não há o que focar nem o que medir. */}
      {/* SEGUNDA LEVA, 27/08/2026. O check 30 mediu o tamanho real do problema que o DataGrid
          revelou: de 41 fichas que declaram `a11y.keyboard`, só 12 tinham rastro de medição.
          Estas são as que o banco alcança sem infraestrutura nova. */}
      <section data-probe="Switch" data-ativado={ativado.switch ?? 0}>
        <Switch label="Notificar" onChange={marca("switch")} />
      </section>

      <section data-probe="Toggle" data-ativado={ativado.toggle ?? 0}>
        <Toggle label="Negrito" icon="add" onPressedChange={marca("toggle")} />
      </section>

      <section data-probe="ToggleGroup" data-ativado={ativado.togglegroup ?? 0}>
        <ToggleGroup label="Alinhar">
          <Toggle value="a" label="Um" icon="add" onPressedChange={marca("togglegroup")} />
          <Toggle value="b" label="Dois" icon="close" onPressedChange={marca("togglegroup")} />
          <Toggle value="c" label="Três" icon="add" onPressedChange={marca("togglegroup")} />
        </ToggleGroup>
      </section>

      <section data-probe="Toolbar" data-ativado={ativado.toolbar ?? 0}>
        <Toolbar label="Ações">
          <Button size="sm" onClick={marca("toolbar")}>Um</Button>
          <Button size="sm" onClick={marca("toolbar")}>Dois</Button>
          <Button size="sm" onClick={marca("toolbar")}>Três</Button>
        </Toolbar>
      </section>

      {/* MediaEmbed (N-10): a fachada é um <button> nativo. Enter e Espaço trocam a fachada pelo
          <iframe> e o foco vai para ele — é essa troca que a foto vê, sem contador. O endereço é
          about:blank: o banco mede o teclado, não o YouTube, e não pode depender de rede. */}
      <section data-probe="MediaEmbed">
        <MediaEmbed src="about:blank" title="Trailer" poster="data:image/gif;base64,R0lGODlhAQABAAAAACw=" autoplay={false} />
      </section>

      <section data-probe="Button" data-ativado={ativado.button ?? 0}>
        <Button onClick={marca("button")}>Confirmar</Button>
      </section>

      <section data-probe="SegmentedControl" data-ativado={ativado.segmented ?? 0}>
        <SegmentedControl label="Modo" value={segmento} onChange={(v) => {
          setSegmento(v); marca("segmented")();
        }} items={[{value: "a", label: "Um"}, {value: "b", label: "Dois"},
                  {value: "c", label: "Três"}]} />
      </section>

      <section data-probe="Collapsible">
        <Collapsible trigger="Detalhes"><p>conteúdo dobrado</p></Collapsible>
      </section>

      <section data-probe="NumberField">
        <NumberField label="Quantidade" defaultValue={5} min={0} max={10} />
      </section>

      <section data-probe="SearchField"><SearchField aria-label="Buscar" /></section>

      <section data-probe="PasswordField"><PasswordField aria-label="Senha" /></section>

      <section data-probe="Combobox">
        <Combobox label="Fuso" items={[
          {value: "a", label: "Messenger"}, {value: "b", label: "Analyst"},
          {value: "c", label: "Curator"},
        ]} />
      </section>

      {/* O `Stepper` só desenha <button> quando o item traz `onClick` — sem ele os passos são
          texto, não há o que focar, e a medição mede o banco vizinho. */}
      <section data-probe="Stepper" data-ativado={ativado.stepper ?? 0}>
        <Stepper label="Progresso" items={[
          {id: "a", label: "Um", state: "done", onClick: marca("stepper")},
          {id: "b", label: "Dois", state: "active", onClick: marca("stepper")},
          {id: "c", label: "Três", onClick: marca("stepper")},
        ]} />
      </section>

      <section data-probe="Calendar"><Calendar mode="single" label="Data" /></section>

      <section data-probe="TreeView">
        <TreeView label="Arquivos" defaultExpandedIds={["raiz"]} items={[
          {id: "raiz", label: "Projeto", children: [
            {id: "a", label: "Messenger"}, {id: "b", label: "Analyst"},
          ]},
          {id: "c", label: "Curator"},
        ]} />
      </section>

      <section data-probe="FileInput"><FileInput label="Anexo" /></section>

      <section data-probe="Sidebar" data-ativado={ativado.sidebar ?? 0}>
        <Sidebar label="Seções" current="b" items={[
          {id: "a", label: "Messenger", onClick: marca("sidebar")},
          {id: "b", label: "Analyst", onClick: marca("sidebar")},
          {id: "c", label: "Curator", onClick: marca("sidebar")},
        ]} />
      </section>

      {/* O `ContextMenu` abre com o BOTÃO DIREITO, não com tecla no gatilho — medir tecla num
          gatilho fechado mede um menu que não existe. O banco declara `abreComContexto` e o
          teste dispara o menu de contexto antes de medir. Foi a segunda cegueira dos sete
          bancos novos, em 27/08/2026. */}
      <section data-probe="ContextMenu" data-ativado={ativado.contextmenu ?? 0}>
        <ContextMenu label="Ações" items={[
          {label: "Renomear", onClick: marca("contextmenu")},
          {label: "Duplicar", onClick: marca("contextmenu")},
          "separator",
          {label: "Remover", onClick: marca("contextmenu")},
        ]}><Button>Clique com o direito</Button></ContextMenu>
      </section>

      <section data-probe="IconButton" data-ativado={ativado.iconbutton ?? 0}>
        <IconButton icon="add" label="Acrescentar" onClick={marca("iconbutton")} />
        <IconButton icon="close" label="Fechar" onClick={marca("iconbutton")} />
      </section>

      <section data-probe="DataGrid">
        <DataGrid
          label="Servidores"
          data={[
            {id: "a", nome: "Messenger", estado: "ativo"},
            {id: "b", nome: "Analyst", estado: "parado"},
            {id: "c", nome: "Curator", estado: "ativo"},
          ]}
          columns={[
            {accessorKey: "nome", header: "Nome"},
            {accessorKey: "estado", header: "Estado"},
          ]}
          selectable
          getRowId={(r: {id: string}) => r.id}
        />
      </section>

      {/* ── A leva de 29/08/2026 ────────────────────────────────────────────
          Vinte fichas da linhagem que não tinha o check 30 declaravam teclas sem medição.
          Estas são as que este banco ALCANÇA sem infraestrutura nova; as que sobraram estão
          declaradas com motivo na lista do check 30. Cada uma tem efeito observável — o
          comentário do `marca` acima explica por que isso não é enfeite. */}

      <section data-probe="Input"><Input defaultValue="um" /><Input defaultValue="dois" /></section>

      <section data-probe="Textarea"><Textarea defaultValue={"linha um\nlinha dois"} /></section>

      <section data-probe="Field">
        <Field label="Nome"><Input defaultValue="Messenger" /></Field>
        <Field label="Notas"><Textarea defaultValue="texto" /></Field>
      </section>

      {/* `Enter` num formulário SUBMETE, e submeter recarrega a página — o que apagaria a foto.
          `onSubmit` do Form já chama `preventDefault`, e o efeito observável é o contador. */}
      <section data-probe="Form" data-ativado={ativado.form ?? 0}>
        <Form onSubmit={marca("form")}>
          <Field label="Nome"><Input name="nome" defaultValue="Analyst" /></Field>
          <Button type="submit">Enviar</Button>
        </Form>
      </section>

      <section data-probe="Pagination" data-pagina={pagina}>
        <Pagination page={pagina} total={9} onPageChange={setPagina} />
      </section>

      <section data-probe="NavList" data-ativado={ativado.navlist ?? 0}>
        <NavList items={[
          {id: "a", label: "Messenger", onClick: marca("navlist")},
          {id: "b", label: "Analyst", onClick: marca("navlist")},
          {id: "c", label: "Curator", onClick: marca("navlist")},
        ]} />
      </section>

      <section data-probe="BottomNav" data-ativado={ativado.bottomnav ?? 0}>
        <BottomNav current="b" items={[
          {id: "a", label: "Messenger", icon: "chat", onClick: marca("bottomnav")},
          {id: "b", label: "Analyst", icon: "chart--line", onClick: marca("bottomnav")},
          {id: "c", label: "Curator", icon: "bookmark", onClick: marca("bottomnav")},
        ]} />
      </section>

      {/* A ordem É o efeito observável: a foto guarda o índice de cada nó, então uma troca de
          posição aparece sozinha, sem contador. */}
      <section data-probe="SortableList">
        <SortableList items={ordem} label="Agentes" onReorder={(de, para) => setOrdem((o) => {
          const c = [...o]; const [x] = c.splice(de, 1); c.splice(para, 0, x!); return c;
        })} />
      </section>

      <section data-probe="Carousel">
        <Carousel label="Cartões">
          <Card>Primeiro</Card><Card>Segundo</Card><Card>Terceiro</Card>
        </Carousel>
      </section>

      {/* `src` é um data: URI de 1×1 — o banco não pode depender de rede, e a medição é de
          teclado, não de imagem. */}
      <section data-probe="Gallery" data-selecionado={galeria}>
        <Gallery label="Capturas" selected={galeria} onSelect={setGaleria} items={[
          {id: "a", src: PIXEL, alt: "Um"},
          {id: "b", src: PIXEL, alt: "Dois"},
          {id: "c", src: PIXEL, alt: "Três"},
        ]} />
      </section>

      <section data-probe="AutomationCard" data-ativado={ativado.automation ?? 0}>
        <AutomationCard name="Resumo diário" description="Todo dia às 9h"
          trigger="Agendado" action="Enviar resumo" enabled={automacao}
          onToggle={(v) => { setAutomacao(v); marca("automation")(); }} />
      </section>

      <section data-probe="InterAgentMessage">
        <InterAgentMessage label="Trocas" messages={[
          {id: "m1", from: "Messenger", to: "Analyst", body: "segue o lote",
           details: [{term: "Lote", value: "12"}]},
          {id: "m2", from: "Analyst", to: "Curator", body: "conferido",
           details: [{term: "Lote", value: "12"}]},
        ]} />
      </section>

      <section data-probe="InvocationPanel">
        <InvocationPanel title="Execução" input="resumir" output="pronto" steps={[
          {id: "s1", label: "Ler", detail: "3 arquivos", state: "done", content: "detalhe um"},
          {id: "s2", label: "Resumir", state: "done", content: "detalhe dois"},
        ]} />
      </section>

      <section data-probe="MemoryLedger">
        <MemoryLedger label="Memória" records={[
          {id: "r1", content: "prefere respostas curtas", scope: "semantic", operation: "added",
           details: [{term: "Fonte", value: "conversa"}]},
          {id: "r2", content: "fuso -03", scope: "episodic", operation: "updated",
           details: [{term: "Fonte", value: "perfil"}]},
        ]} />
      </section>

      <section data-probe="ToolPermission" data-ativado={ativado.toolperm ?? 0}>
        <ToolPermission label="Ferramentas" onChange={marca("toolperm")} tools={[
          {id: "t1", name: "Ler arquivo", permission: "ask"},
          {id: "t2", name: "Escrever arquivo", permission: "never"},
        ]} />
      </section>

      <section data-probe="DependencyGraph" data-selecionado={no}>
        <DependencyGraph label="Dependências" selectedId={no} onSelect={setNo}
          nodes={[
            {id: "a", label: "Messenger", x: 0, y: 0},
            {id: "b", label: "Analyst", x: 160, y: 0},
            {id: "c", label: "Curator", x: 320, y: 0},
          ]}
          edges={[{from: "a", to: "b"}, {from: "b", to: "c"}]} />
      </section>

      {/* O `BlockEditor` é o segundo dono do `useReorder` (item N1), então o protocolo de dois
          tempos é o mesmo do SortableList: `Space` pega o bloco, e só então as setas o movem. */}
      <section data-probe="BlockEditor">
        <BlockEditor label="Blocos" blocks={blocos}
          onRemove={(i) => setBlocos((b) => b.filter((_, j) => j !== i))}
          onReorder={(de, para) => setBlocos((b) => {
            const c = [...b]; const [x] = c.splice(de, 1); c.splice(para, 0, x!); return c;
          })} />
      </section>

      {/* O CodeMirror gere o próprio foco e o próprio documento. O que este banco alcança é o
          que se pressiona SEM modificador — `Ctrl+Z` e `Ctrl+Shift+Z` estão fora da lista de
          candidatas do probe, como o `F2` e o `Control+Home` do DataGrid. */}
      <section data-probe="CodeEditor">
        <CodeEditor label="Código" defaultValue={"const a = 1;\nconst b = 2;\nconst c = 3;"} />
      </section>
    </main>
  </AureaProvider>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
