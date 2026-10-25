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
