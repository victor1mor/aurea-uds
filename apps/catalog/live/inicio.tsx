// O `home.js` (15/10/2026): o `search.js` mais as partes vivas do Início — só o Início o carrega, para as outras páginas
// não baixarem essas peças.
//
// O gerador já desenhou cada parte na página; aqui ela é trocada pela viva, por um portal, sob o provedor ÚNICO do site —
// com uma segunda raiz, a página teria duas regiões de avisos com o mesmo nome (o `landmark-unique` do axe, 14/10/2026).
// A troca é antes de pintar (`useLayoutEffect`): não pisca.
//
// O SITE B (02/11/2026): a página inicial nova (`site-b/paginas/inicio.mjs`) marca os lugares com `data-inicio` (as
// famílias, o baralho, o "Try it here") e `data-inicio-peca` (cada peça que flutua no palco). As partes moram em
// `inicio-b.mjs`, o mesmo arquivo que o gerador desenha. O preço e a chave de avisos são UM estado para a página toda: o
// controle que flutua e o da família 02 mostram o mesmo valor, e o aviso ao lado da chave acompanha.
// A vitrine "Components" de antes (`data-vitrine-componentes`) continua viva se a página antiga voltar.
import {createPortal} from "react-dom";
import {createElement as h, Fragment, useLayoutEffect, useState} from "react";
import {montarSite} from "./site";
import {VitrineComponentes} from "./vitrine-componentes.mjs";
import {Baralho, Familias, PecaDoPalco, Teste} from "./inicio-b.mjs";

function VitrineViva() {
  const [lugar, setLugar] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const alvo = document.querySelector<HTMLElement>("[data-vitrine-componentes]");
    if (!alvo) return;
    alvo.replaceChildren();
    setLugar(alvo);
  }, []);
  return lugar ? createPortal(h(VitrineComponentes), lugar) : null;
}

type Lugares = {pecas: HTMLElement[]; partes: Record<string, HTMLElement>};
function InicioVivo() {
  const [lugares, setLugares] = useState<Lugares | null>(null);
  const [preco, setPreco] = useState(250);
  const [avisos, setAvisos] = useState(true);
  useLayoutEffect(() => {
    const pecas = [...document.querySelectorAll<HTMLElement>("[data-inicio-peca]")];
    const partes: Record<string, HTMLElement> = {};
    document.querySelectorAll<HTMLElement>("[data-inicio]").forEach((l) => { partes[l.dataset.inicio!] = l; });
    if (!pecas.length && !Object.keys(partes).length) return;
    [...pecas, ...Object.values(partes)].forEach((l) => l.replaceChildren());
    setLugares({pecas, partes});
  }, []);
  if (!lugares) return null;
  const estado = {preco, setPreco: (v: number | number[]) => setPreco(Array.isArray(v) ? v[0] : v), avisos, setAvisos};
  const {partes} = lugares;
  return h(Fragment, null,
    ...lugares.pecas.map((l) => createPortal(h(PecaDoPalco, {nome: l.dataset.inicioPeca, ...estado}), l, `peca-${l.dataset.inicioPeca}`)),
    partes.familias ? createPortal(h(Familias, estado), partes.familias, "familias") : null,
    partes.baralho ? createPortal(h(Baralho, {total: Number(partes.baralho.dataset.total) || undefined}), partes.baralho, "baralho") : null,
    partes.teste ? createPortal(h(Teste, {marcas: JSON.parse(partes.teste.dataset.marcas || "[]")}), partes.teste, "teste") : null);
}

montarSite(h(VitrineViva), h(InicioVivo));
