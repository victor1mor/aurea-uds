// O `home.js` (15/10/2026): o `search.js` mais a vitrine "Components" viva — só o Início o carrega, para as outras
// páginas não baixarem as peças da vitrine.
//
// O gerador já desenhou a vitrine na página (`vitrine-componentes.mjs`, o mesmo arquivo); aqui ela é trocada pela viva,
// por um portal, sob o provedor ÚNICO do site — com uma segunda raiz, a página teria duas regiões de avisos com o mesmo
// nome (o `landmark-unique` do axe, 14/10/2026). A troca é antes de pintar (`useLayoutEffect`): não pisca.
import {createPortal} from "react-dom";
import {createElement as h, useLayoutEffect, useState} from "react";
import {montarSite} from "./site";
import {VitrineComponentes} from "./vitrine-componentes.mjs";

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

montarSite(h(VitrineViva));
