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
import {createElement as h, Fragment, type ReactElement, type ReactNode, type SVGProps, useState, useSyncExternalStore} from "react";
import {AureaProvider, Button, ColorSwatch, IconButton, Popover, ThemeToggle, type AureaThemePreference} from "../../../packages/react/dist/index.js";

type Marca = {id: string; label: string; color: string};

// Abaixo de 1024 a palavra sai e fica só o balde — na Aurea, o botão só de ícone é o `IconButton` redondo (ADR-0052).
// Era abaixo de 768, como a referência no celular; desde 15/10/2026 é abaixo de 1024, porque com a palavra o topo do
// Início não cabia numa linha entre 768 e 1023 (medido; o Victor viu a barra cortada). O gerador faz o mesmo no parado.
const ESTREITO = "(max-width: 1023px)";
const assina = (avisa: () => void) => { const m = matchMedia(ESTREITO); m.addEventListener("change", avisa); return () => m.removeEventListener("change", avisa); };

// A amostra redonda da marca, desenhada na cor dela, com o contorno fraco da amostra da Aurea (o `ColorSwatch`): some
// sobre fundo da mesma cor sem ele. Uma por cor, para o React não trocar o componente a cada desenho.
const amostras = new Map<string, (p: SVGProps<SVGSVGElement>) => ReactElement>();
function amostra(cor: string) {
  let desenho = amostras.get(cor);
  if (!desenho) {
    desenho = (p) => h("svg", {...p, viewBox: "0 0 16 16"},
      h("circle", {cx: 8, cy: 8, r: 7, fill: cor, stroke: "currentColor", strokeOpacity: 0.35, strokeWidth: 1}));
    amostras.set(cor, desenho);
  }
  return desenho;
}

function Tema({marcas}: {marcas: Marca[]}) {
  const [marca, setMarca] = useState(() => document.documentElement.dataset.brand || "");
  const estreito = useSyncExternalStore(assina, () => matchMedia(ESTREITO).matches);
  const atual = marcas.find((m) => m.id === marca) ?? marcas[0];
  const padrao = atual.id === "";
  // A referência troca o balde pela amostra da escolhida — e aqui também, desde 15/10/2026 (o Victor: "D … pode"): o
  // `Button` da web passou a aceitar o desenho do app no encaixe do ícone (`AureaIcon`, como o `Icon` e o
  // `IconButton`). O nome falado contém o escrito ("Theme: Ember"), como pede a WCAG 2.5.3.
  // "Design theme", como o da referência: a chave claro/escuro/sistema ao lado já se chama "Theme" (15/10/2026).
  const nome = padrao ? "Design theme" : `Design theme: ${atual.label}`;
  // Na pílula do site B o balde dá lugar à paleta, como no desenho.
  const icone = padrao ? (somenteIcone ? "palette" : "paint-bucket") : amostra(atual.color);
  const gatilho = estreito || somenteIcone
    // `sm` (32), como a busca e a setinha ao lado: sem ele saía com 36 (medido, 15/10/2026).
    ? h(IconButton, {icon: icone, label: nome, variant: "tertiary", size: "sm"})
    // `sm` (32), a caixa dos outros botões do topo (15/10/2026; ver `botaoTema` no gerador).
    : h(Button, {size: "sm", variant: "tertiary", quiet: true, leadingIcon: icone, "aria-label": nome}, padrao ? "Theme" : atual.label);
  return h(Popover, {trigger: gatilho, side: "bottom"},
    h(ColorSwatch, {options: marcas.map((m) => ({color: m.color, label: m.label})), name: "site-theme", label: "Design theme",
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
// Na pílula do site B o botão é só o ícone em toda largura (o gerador marca o lugar com `data-icon-only`).
const somenteIcone = lugar?.dataset.iconOnly != null;
if (lugar && marcas.length) lugar.replaceChildren();

/** O botão "Theme" no lugar dele, dentro do provedor da busca. Sem o lugar (ou sem marcas), nada. */
export function TemaDoTopo() {
  return lugar && marcas.length ? createPortal(h(Tema, {marcas}), lugar) : null;
}

// A CHAVE DE TEMA (15/10/2026): a de três posições da referência — claro, escuro e sistema — em cada lugar que o gerador
// marcou (`data-site-theme-switch`: na barra e, no Início, dentro do menu do celular). Cada uma é um `ThemeToggle` com o
// seu próprio grupo de opções; as duas mostram a mesma escolha, que mora no provedor.
const lugaresDaChave = [...document.querySelectorAll<HTMLElement>("[data-site-theme-switch]")];
lugaresDaChave.forEach((l) => l.replaceChildren());
export function ChavesDeTema() {
  return h(Fragment, null, ...lugaresDaChave.map((l, i) => createPortal(h(ThemeToggle, {mode: "light-dark-system"}), l, `chave-${i}`)));
}

// A SETINHA DO TOPO DO INÍCIO (15/10/2026), a da referência entre 768 e 1023: abre uma janelinha com a chave de tema e o
// GitHub, que não cabem na linha ao lado dos links. O logo do GitHub vem dos dados do lugar (o desenho oficial, lido pelo
// gerador do arquivo do GitHub), pintado em branco ou preto pela regra do site.
const lugarDaSetinha = document.getElementById("site-more-root");
const desenhoGitHub = lugarDaSetinha?.dataset.github;
const repositorio = lugarDaSetinha?.dataset.repo;
if (lugarDaSetinha && desenhoGitHub) lugarDaSetinha.replaceChildren();
const GitHub = (p: SVGProps<SVGSVGElement>) => h("svg", {...p, viewBox: "0 0 98 96", fill: "none"},
  h("path", {d: desenhoGitHub, className: "site-github-ink"}));
export function SetinhaDoTopo() {
  if (!lugarDaSetinha || !desenhoGitHub) return null;
  return createPortal(h(Popover, {trigger: h(IconButton, {icon: "caret-down", label: "More", variant: "tertiary", size: "sm"}), side: "bottom"},
    h("div", {className: "site-more-panel"},
      h(ThemeToggle, {mode: "light-dark-system"}),
      h(IconButton, {icon: GitHub, label: "GitHub", variant: "tertiary", size: "sm", href: repositorio}))), lugarDaSetinha);
}

// O PROVEDOR DO SITE: o tema é a escolha guardada ("dark", "light" ou "system"); sem escolha, o provedor adota o que o
// documento trouxe (o script do <head> já aplicou). Escolher grava; o `catalog.js` espelha o tema nas molduras de prévia.
const TEMAS: AureaThemePreference[] = ["dark", "light", "system"];
const lePreferencia = (): AureaThemePreference | undefined => {
  try { const t = localStorage.getItem("aurea-theme"); return TEMAS.includes(t as AureaThemePreference) ? t as AureaThemePreference : undefined; }
  catch { return undefined; }
};
export function ProvedorDoSite({children}: {children: ReactNode}) {
  const [preferencia, setPreferencia] = useState(lePreferencia);
  return h(AureaProvider, {spriteUrl: "", theme: preferencia, onThemePreferenceChange: (p: AureaThemePreference) => {
    setPreferencia(p);
    try { localStorage.setItem("aurea-theme", p); } catch { /* sem armazenamento: vale até recarregar */ }
  }}, children);
}
