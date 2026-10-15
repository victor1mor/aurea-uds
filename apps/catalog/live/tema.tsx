// O BOTÃO "THEME" DO SITE — 14/10/2026 (o Victor: "crie um botão tema como da [referência]").
//
// A escolha de tema da referência, lida no código do site dela: um botão pequeno com o balde de tinta e "Theme",
// que abre uma janelinha com as amostras redondas e o nome embaixo de cada uma; escolhido um tema que não é o
// padrão, o botão mostra a amostra e o nome dele no lugar do balde. Na Aurea os "temas" são as MARCAS (ADR-0036).
//
// Só peças da Aurea: `Popover`, `Button` e `ColorSwatch` com `showLabels`. Quem aplica a marca é a cola do site
// (`catalog.js`), pelo evento `aurea-brand` — ela também grava a escolha e a passa às molduras de prévia.
// As marcas e as cores vêm do gerador, no `data-brands` do lugar (as cores dos tokens, em hex).
//
// UM PROVEDOR SÓ NA PÁGINA: o botão é desenhado no lugar dele por um portal, a partir da MESMA raiz da busca. Com
// duas raízes, cada `AureaProvider` punha a sua região de avisos, com o mesmo nome — e o axe reprovou as 410
// páginas (`landmark-unique`, 14/10/2026).
import {createPortal} from "react-dom";
import {createElement as h, useState, useSyncExternalStore} from "react";
import {Button, ColorSwatch, IconButton, Popover} from "../../../packages/react/dist/index.js";

type Marca = {id: string; label: string; color: string};

// No celular a palavra sai e fica só o balde, como na referência — na Aurea, o botão só de ícone é o `IconButton`
// redondo (ADR-0052). O ponto é o mesmo em que o `Header` leva os links para o menu (abaixo de 768).
const CELULAR = "(max-width: 767px)";
const assina = (avisa: () => void) => { const m = matchMedia(CELULAR); m.addEventListener("change", avisa); return () => m.removeEventListener("change", avisa); };

function Tema({marcas}: {marcas: Marca[]}) {
  const [marca, setMarca] = useState(() => document.documentElement.dataset.brand || "");
  const celular = useSyncExternalStore(assina, () => matchMedia(CELULAR).matches);
  const atual = marcas.find((m) => m.id === marca) ?? marcas[0];
  const padrao = atual.id === "";
  // A referência troca o balde pela amostra da escolhida; o `Button` da web só aceita ÍCONE no início (o encaixe de
  // desenho, `leading`, só o do nativo tem), então o balde fica e só o nome troca. O nome falado contém o escrito
  // ("Theme: Lory"), como pede a WCAG 2.5.3.
  const nome = padrao ? "Theme" : `Theme: ${atual.label}`;
  const gatilho = celular
    ? h(IconButton, {icon: "paint-bucket", label: nome, variant: "tertiary"})
    // `sm` (32), a caixa dos outros botões do topo (15/10/2026; ver `botaoTema` no gerador).
    : h(Button, {size: "sm", variant: "tertiary", leadingIcon: "paint-bucket", "aria-label": nome}, padrao ? "Theme" : atual.label);
  return h(Popover, {trigger: gatilho, side: "bottom"},
    h(ColorSwatch, {options: marcas.map((m) => ({color: m.color, label: m.label})), name: "site-theme", label: "Theme",
      size: "lg", showLabels: true, value: atual.color,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const escolhida = marcas.find((m) => m.color === e.target.value);
        if (!escolhida) return;
        setMarca(escolhida.id);
        document.dispatchEvent(new CustomEvent("aurea-brand", {detail: {brand: escolhida.id}}));
      }}));
}

// O lugar vem do gerador com o botão parado (igual ao vivo, para a barra não pular); ele sai antes de o vivo entrar.
const lugar = document.getElementById("site-theme-root");
const marcas = lugar ? JSON.parse(lugar.dataset.brands || "[]") as Marca[] : [];
if (lugar && marcas.length) lugar.replaceChildren();

/** O botão "Theme" no lugar dele, dentro do provedor da busca. Sem o lugar (ou sem marcas), nada. */
export function TemaDoTopo() {
  return lugar && marcas.length ? createPortal(h(Tema, {marcas}), lugar) : null;
}
