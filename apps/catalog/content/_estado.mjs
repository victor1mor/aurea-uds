// O ESTADO DOS EXEMPLOS (21/10/2026). Com a parte viva em toda caixa, exemplo controlado com o aviso vazio
// (`onChange: () => {}`) desenhava certo e não mudava ao clicar — a aba não trocava, a lista não se reordenava. Estes
// guardam o valor como o app guardaria. No HTML pronto nada muda: o primeiro desenho é o valor do exemplo.
// `_` no começo: não é conteúdo de componente (como o `_starters`), e o gerador não faz página dele.
import {createElement as h, Fragment, useState} from "react";

// Um valor e o aviso que o troca: Tabs e SegmentedControl (`value`/`onChange`), o cartão (`enabled`/`onToggle`), o
// mapa (`selectedId`/`onSelect`).
export function ComValor({componente, valor = "value", aviso = "onChange", ...props}) {
  const [atual, setAtual] = useState(props[valor]);
  return h(componente, {...props, [valor]: atual, [aviso]: setAtual});
}

// A janela que o gatilho abre (Dialog, Drawer): o estado de aberta, como o código do exemplo escreve (`open`/`onClose`).
// No HTML pronto ela começa fechada — o gatilho é o que a página mostra (bloco 1, o 3-C, 24/10/2026).
export function ComJanela({gatilho, janela}) {
  const [aberta, setAberta] = useState(false);
  return h(Fragment, null, gatilho(() => setAberta(true)), janela(aberta, () => setAberta(false)));
}

// Uma lista e o "de onde para onde": a ordem muda como o app mudaria (SortableList, BlockEditor). Com `onRemove` no
// exemplo, remover também tira o item.
export function ComOrdem({componente, lista = "items", ...props}) {
  const [itens, setItens] = useState(props[lista]);
  const mover = (de, para) => setItens((xs) => { const c = [...xs]; const [x] = c.splice(de, 1); c.splice(para, 0, x); return c; });
  const remover = (i) => setItens((xs) => xs.filter((_, k) => k !== i));
  return h(componente, {...props, [lista]: itens, onReorder: mover, ...(props.onRemove ? {onRemove: remover} : {})});
}

// O ITEM ATUAL QUE O CLIQUE MOVE (06/11/2026, o pedido do Victor — "ainda estou encontrando componentes no site que não
// interage" — e o desenho do FigCraft aprovado com *"Pode"*). A lateral, o shell, o cabeçalho e o índice recebem o atual
// (`current`) e o app o move pela rota; no exemplo não há rota, e o atual ficava parado — e o link do item levava a MOLDURA
// para outra página. Aqui o atual mora no estado, e o clique num item (que não seja grupo) o move. O `href` fica (o item
// continua link, com o endereço na barra de status); a navegação é impedida, como o roteador do app faria.
// `porRender`: a peça que não liga o `onClick` do item (o `Header`) recebe o link pela porta `render` — o mesmo caminho que
// o app usa para pôr o link do roteador dele.
export function ComAtual({componente, valor = "current", lista = "items", porRender = false, ...props}) {
  const [atual, setAtual] = useState(props[valor]);
  const liga = (xs) => Array.isArray(xs) ? xs.map((it) => {
    if (!it || typeof it !== "object" || !("id" in it)) return it;
    if (Array.isArray(it.items)) return {...it, items: liga(it.items)};
    const clique = (e) => { e?.preventDefault?.(); it.onClick?.(e); setAtual(it.id); };
    return porRender ? {...it, render: h("a", {href: it.href ?? "#", onClick: clique})} : {...it, onClick: clique};
  }) : xs;
  return h(componente, {...props, [valor]: atual, [lista]: liga(props[lista])});
}

// O BOTÃO QUE LIGA E DESLIGA (06/11/2026, junto do `ComAtual`): o filtro fixo e a estrela da linha mostravam `pressed`
// fixo, e o clique não mudava nada — justo o exemplo de "estado que sobrevive ao clique". Aqui o clique troca.
export function ComLigado({componente, ...props}) {
  const [ligado, setLigado] = useState(Boolean(props.pressed));
  return h(componente, {...props, pressed: ligado, onClick: (e) => { props.onClick?.(e); setLigado((x) => !x); }});
}

// O PASSO QUE O CLIQUE ESCOLHE (06/11/2026): o Stepper de "voltar a um passo feito" passava o aviso vazio. Aqui o passo
// clicado vira o ativo, os de antes ficam feitos e os de depois voltam a pendentes; os que já tinham sido alcançados
// continuam clicáveis, para a pessoa ir e voltar.
export function ComPassos({componente, ...props}) {
  const original = props.items.findIndex((it) => it.state === "active");
  const [ativo, setAtivo] = useState(original);
  const items = props.items.map((it, k) => ({...it,
    state: it.state === "error" ? "error" : k < ativo ? "done" : k === ativo ? "active" : undefined,
    onClick: k <= Math.max(original, ativo) && k !== ativo ? () => setAtivo(k) : undefined}));
  return h(componente, {...props, items});
}

// O LINK DE DENTRO QUE MOVE O ATUAL (06/11/2026): o índice da página e a trilha não têm aviso de clique — o item é um link
// para a seção (ou a página). Uma caixa sem desenho (`display:contents`) pega o clique do link antes dele navegar: no
// índice, o atual vira a seção clicada; na trilha, ela termina no item clicado, como depois de navegar até ele.
const linkClicado = (e) => e.target.closest?.("a[href]");
export function ComIndice({componente, ...props}) {
  const [atual, setAtual] = useState(props.current);
  return h("div", {style: {display: "contents"}, onClickCapture: (e) => {
    const l = linkClicado(e); const alvo = l?.getAttribute("href");
    if (!alvo?.startsWith("#")) return;
    e.preventDefault(); setAtual(decodeURIComponent(alvo.slice(1)));
  }}, h(componente, {...props, current: atual}));
}
export function ComTrilha({componente, ...props}) {
  const [items, setItems] = useState(props.items);
  return h("div", {style: {display: "contents"}, onClickCapture: (e) => {
    const l = linkClicado(e); if (!l) return;
    const links = [...e.currentTarget.querySelectorAll("a[href]")], i = links.indexOf(l);
    const comLink = items.map((it, k) => (it.href ? k : -1)).filter((k) => k >= 0);
    if (i < 0 || comLink[i] == null) return;
    e.preventDefault();
    setItems(items.slice(0, comLink[i] + 1).map((it, k, xs) => (k === xs.length - 1 ? {...it, href: undefined} : it)));
  }}, h(componente, {...props, items}));
}

// A NAVEGAÇÃO PRONTA COM O ATUAL QUE O CLIQUE MOVE (06/11/2026): os exemplos do AppShell e o "traga a sua navegação" da
// lateral passam um `<nav>` com links, o primeiro marcado — e o clique levava a moldura embora (ou não fazia nada). A
// mesma marcação (`aria-current`, e a classe do atual onde o exemplo usa uma), com o atual no estado.
export function NavComAtual({className, label, itens, atual, classeDoItem, classeAtiva, rotuloEmSpan}) {
  const [a, setA] = useState(atual);
  return h("nav", {className, "aria-label": label}, ...itens.map(({rotulo, href = "#"}) => {
    const eh = rotulo === a;
    const cls = [classeDoItem, eh && classeAtiva].filter(Boolean).join(" ") || undefined;
    return h("a", {key: rotulo, href, className: cls, ...(eh ? {"aria-current": "page"} : {}),
      onClick: (e) => { e.preventDefault(); setA(rotulo); }}, rotuloEmSpan ? h("span", {className: rotuloEmSpan}, rotulo) : rotulo);
  }));
}
