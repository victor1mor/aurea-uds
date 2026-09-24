import {createRef} from "react";
import {render} from "@testing-library/react";
import {
  AppShell, Alert, Badge, Banner, Button, ButtonGroup, Card, Checkbox, Cluster, Grid,
  IconButton, Input, KPI, Kbd, Radio, Range, SearchField, Select, Sidebar, Skeleton,
  Stack, Status, Switch, Table, TableOfContents, Textarea, Toolbar, ToolbarButton, ToolbarGroup,
  ToolbarSeparator, Topbar,
} from "../../packages/react/src/index";

// ref em componente de biblioteca não é luxo: sem ele o consumidor não põe foco
// programático, não mede, não integra com posicionamento de terceiros nem virtualiza.
//
// A auditoria de 26/07/2026 registrou isso como M14 dizendo "58 de 65 não aceitam ref,
// falta forwardRef". O diagnóstico estava errado e o efeito certo: no React 19 `ref` é
// prop comum e JÁ chega em quem espalha `{...props}` — medido. Quem recusava era o TIPO,
// porque `HTMLAttributes<T>` não tem `ref`. A correção foi de tipo (`&RefAttributes<T>`),
// não 40 forwardRef — e é por isso que o peerDependencies subiu para react >=19: no 18
// ref-como-prop não existe nem em runtime.
//
// Este teste prova o CONTRATO: o ref chega, e chega no elemento que o tipo promete.
const CASOS: Array<[string, () => React.ReactElement, React.RefObject<any>, string]> = (() => {
  const mk = <T,>() => createRef<T>();
  const l: Array<[string, () => React.ReactElement, React.RefObject<any>, string]> = [];
  const add = (nome: string, tag: string, fn: (r: React.RefObject<any>) => React.ReactElement) => {
    const r = mk<HTMLElement>();
    l.push([nome, () => fn(r), r, tag]);
  };
  add("Card", "DIV", r => <Card ref={r} />);
  add("Stack", "DIV", r => <Stack ref={r} />);
  add("Cluster", "DIV", r => <Cluster ref={r} />);
  add("Grid", "DIV", r => <Grid ref={r} />);
  add("Skeleton", "DIV", r => <Skeleton ref={r} />);
  add("Badge", "SPAN", r => <Badge ref={r}>7</Badge>);
  add("Status", "SPAN", r => <Status ref={r}>online</Status>);
  add("Kbd", "KBD", r => <Kbd ref={r}>K</Kbd>);
  add("ButtonGroup", "DIV", r => <ButtonGroup ref={r} label="Ações" />);
  add("Alert", "DIV", r => <Alert ref={r} variant="info" title="Oi">texto</Alert>);
  add("Banner", "DIV", r => <Banner ref={r} title="Oi">texto</Banner>);
  add("Button", "BUTTON", r => <Button ref={r}>ok</Button>);
  add("IconButton", "BUTTON", r => <IconButton ref={r} label="Fechar" icon="close" />);
  add("Input", "INPUT", r => <Input ref={r} />);
  add("Range", "INPUT", r => <Range ref={r} />);
  add("Select", "BUTTON", r => <Select ref={r}><option>a</option></Select>);   // o gatilho, desde 24/09/2026
  add("Textarea", "TEXTAREA", r => <Textarea ref={r} />);
  add("Checkbox", "INPUT", r => <Checkbox ref={r} label="Aceito" />);
  add("Radio", "INPUT", r => <Radio ref={r} name="g" label="Sim" />);
  add("Switch", "INPUT", r => <Switch ref={r} label="Ligado" />);
  add("SearchField", "INPUT", r => <SearchField ref={r} />);
  add("KPI", "DIV", r => <KPI ref={r} label="Receita" value="10" />);
  add("Toolbar", "DIV", r => <Toolbar ref={r} label="Barra" />);
  add("ToolbarGroup", "DIV", r => <Toolbar label="b"><ToolbarGroup ref={r} label="Grupo" /></Toolbar>);
  add("ToolbarSeparator", "DIV", r => <Toolbar label="b"><ToolbarSeparator ref={r} /></Toolbar>);
  add("ToolbarButton", "BUTTON", r => <Toolbar label="b"><ToolbarButton ref={r}>x</ToolbarButton></Toolbar>);
  add("AppShell", "DIV", r => <AppShell ref={r}>conteúdo</AppShell>);
  add("Sidebar", "ASIDE", r => <Sidebar ref={r}>nav</Sidebar>);
  add("Topbar", "HEADER", r => <Topbar ref={r}>topo</Topbar>);
  add("TableOfContents", "NAV", r => <TableOfContents ref={r} items={[{id: "a", label: "A"}]} />);
  add("Table", "TABLE", r => <Table ref={r}><tbody><tr><td>a</td></tr></tbody></Table>);
  return l;
})();

describe("ref chega e chega no elemento certo", () => {
  for (const [nome, el, ref, tag] of CASOS) {
    test(`${nome} → <${tag.toLowerCase()}>`, () => {
      render(el());
      expect(ref.current, `${nome}: ref não foi preenchido`).not.toBeNull();
      expect(ref.current.tagName, `${nome}: ref caiu no elemento errado`).toBe(tag);
    });
  }
});
