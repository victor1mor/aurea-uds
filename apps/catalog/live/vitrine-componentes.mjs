// A VITRINE "COMPONENTS" DO INÍCIO — 15/10/2026 (o Victor: "A, B, C, pode").
//
// A primeira aba da vitrine da página inicial, como a da referência: três colunas de peças soltas, lidas no código da
// vitrine dela — a composição, a ordem, os textos e as larguras. Só peças da Aurea. Sem foto de pessoa (vira inicial ou
// ícone) e sem marca de terceiro: o "continuar com" dos dois serviços de login vira e-mail e chave de acesso (CLAUDE.md
// §5). As duas fileiras de abas dela não têm painel — são escolha de um entre vários —, então aqui são o
// `SegmentedControl`, que tem a mesma aparência.
//
// UM arquivo para os dois lados: o gerador desenha a vitrine pronta na página (sem JavaScript ela já está lá), e o
// `home.js` a troca pela viva, sob o provedor único do site (ver `inicio.tsx`). Por isso `.mjs` com `createElement`: o
// gerador roda no Node, sem compilar JSX.
import {createElement as h, useId, useState} from "react";
import {
  Alert, Avatar, AvatarGroup, Button, Card, Checkbox, CloseButton, Field, Icon, Input, ListBox, OTPField, Radio,
  RadioGroup, SegmentedControl, Select, Separator, Slider, Spinner, Switch,
} from "../../../packages/react/dist/index.js";

// ── A coluna da esquerda: os campos e os controles ──────────────────────────────────────────────────────────────
const ESTADOS = [["florida", "Florida"], ["delaware", "Delaware"], ["california", "California"], ["texas", "Texas"],
  ["new-york", "New York"], ["washington", "Washington"]].map(([value, label]) => ({value, label}));

const PERIODOS = ["1D", "7D", "1M", "1Y", "All"].map((label) => ({value: label.toLowerCase(), label}));

function Periodo() {
  const [v, setV] = useState("1d");
  return h("div", {className: "vit-256"}, h(SegmentedControl, {label: "Time range", fullWidth: true, value: v, onChange: setV, items: PERIODOS}));
}

// O ícone e o nome juntos, com os 6 da referência entre eles (o rótulo é nosso; o segmento continua o da Aurea).
const comIcone = (icone, texto) => h("span", {className: "vit-rotulo"}, h(Icon, {name: icone}), texto);

function Caixas() {
  const [v, setV] = useState("chats");
  return h("div", {className: "vit-256"}, h(SegmentedControl, {label: "Inbox", fullWidth: true, value: v, onChange: setV,
    items: [{value: "chats", label: comIcone("chat-circle", "Chats")}, {value: "emails", label: comIcone("envelope", "Emails")}]}));
}

function Esquerda() {
  return h("div", {className: "vit-col vit-col-a"},
    h(Field, {label: "Your email", required: true, description: "We won't share your email", className: "vit-256"},
      h(Input, {type: "email", name: "email", placeholder: "john@email.com"})),
    h(Field, {label: "State", required: true, className: "vit-256"}, h(Select, {placeholder: "Select one", items: ESTADOS})),
    // A fileira sem rótulos da referência: cada controle com o nome escondido, que o leitor de tela continua lendo.
    h("div", {className: "vit-controles"},
      h(Checkbox, {label: "Checkbox example", labelHidden: true, defaultChecked: true}),
      h(Switch, {label: "Switch example", labelHidden: true, defaultChecked: true}),
      h(RadioGroup, {label: "Radio example", labelHidden: true, orientation: "horizontal", defaultValue: "two"},
        h(Radio, {value: "one", label: "Option one", labelHidden: true}),
        h(Radio, {value: "two", label: "Option two", labelHidden: true})),
      h(Spinner, {label: "Loading"})),
    h("div", {className: "vit-256 vit-preco"},
      h(Slider, {label: "Price", defaultValue: 250, min: 0, max: 500, step: 10, format: {style: "currency", currency: "USD"}, locale: "en-US"})),
    h(Periodo),
    h(Caixas),
    h(Card, {padding: "none", className: "vit-256 vit-lista"},
      h(ListBox, {label: "File actions", selectionMode: "none", items: [
        {title: "Actions", items: [
          {id: "new", label: "New file", description: "Create a new file", icon: "plus-square", kbd: "⌘N"},
          {id: "edit", label: "Edit file", description: "Make changes", icon: "pencil-simple", kbd: "⌘E"}]},
        {title: "Danger zone", items: [
          {id: "delete", label: "Delete file", description: "Move to trash", icon: "trash", kbd: "⌘⇧D", danger: true}]}]})));
}

// ── A coluna do meio: o grupo, o código, os botões, o perfil, o aviso e a chave ────────────────────────────────────
const PESSOAS = [["Alice", "info"], ["Ben", "success"], ["Cleo", "brand"], ["Dan", "warning"], ["Eve", "danger"],
  ["Finn", "info"], ["Gus", "neutral"]];

function Codigo() {
  const id = useId();
  return h("div", {className: "vit-codigo", role: "group", "aria-labelledby": `${id}-t`, "aria-describedby": `${id}-d`},
    h("div", {className: "vit-codigo-topo"},
      h("span", {className: "label", id: `${id}-t`}, "Verify account"),
      h("p", {className: "vit-apagado", id: `${id}-d`}, "We've sent a code to a****@email.com")),
    // O código já começado, como o dela: lá, o nome da biblioteca no teclado do telefone; aqui, AUREA (2-8-7-3-2).
    h(OTPField, {label: "Verification code", length: 6, groupSize: 3, defaultValue: "28732"}),
    h("p", {className: "vit-apagado vit-reenviar"}, "Didn't receive a code?", h(Button, {variant: "link", size: "sm"}, "Resend")));
}

const BOTOES = ["primary", "secondary", "tertiary", "danger", "danger-soft", "ghost"];

function Meio() {
  return h("div", {className: "vit-col vit-col-b"},
    h(AvatarGroup, {max: 5, label: "Team"},
      ...PESSOAS.map(([nome, tom], n) => h(Avatar, {key: n, fallback: nome[0], alt: nome, tone: tom, emphasis: "soft"}))),
    h(Codigo),
    h("div", {className: "vit-botoes"}, ...BOTOES.map((variant) => h(Button, {key: variant, size: "sm", variant}, "Click me"))),
    h(Card, {className: "vit-largo"},
      h(Card.Header, {className: "vit-perfil"},
        h(Avatar, {size: "sm", fallback: "C", tone: "brand", emphasis: "soft"}),
        h("div", {className: "vit-perfil-nome"},
          h("span", {className: "vit-forte"}, "Curator", h(Icon, {name: "seal-check", weight: "fill", className: "vit-selo"}),
            h("span", {className: "sr-only"}, "Verified")),
          h("span", {className: "vit-apagado"}, "@curator"))),
      h(Card.Content, null,
        h("p", {className: "vit-bio"}, "Collecting the best of UI for web & mobile.", h("br"),
          h(Icon, {name: "rocket", size: "sm"}), " Picks every Friday")),
      h(Card.Footer, {className: "vit-numeros"},
        h("span", null, h("strong", null, "12"), " Following"),
        h("span", null, h("strong", null, "3.4K"), " Followers"))),
    h(Alert, {className: "vit-largo", title: "You have 2 credits left", action: h(Button, {variant: "tertiary"}, "Upgrade")},
      "Get a paid plan for more credits"),
    h("div", {className: "vit-avisos"},
      h(Switch, {label: "Allow notifications", description: "Receive push notifications", defaultChecked: true, indicatorPlacement: "end"})));
}

// ── A coluna da direita: os três cartões ───────────────────────────────────────────────────────────────────────
const grupo = (titulo, membros, por, icone, tom) => h(Card, {className: "vit-grupo"},
  h(Card.Header, null, h(Avatar, {size: "lg", tone: tom, emphasis: "soft", fallback: h(Icon, {name: icone, size: "lg"})})),
  h(Card.Content, null, h("p", {className: "vit-forte"}, titulo), h("p", {className: "vit-apagado"}, membros)),
  h(Card.Footer, {className: "vit-por"}, h(Icon, {name: "user-circle", size: "sm"}), por));

function Direita() {
  return h("div", {className: "vit-col vit-col-c"},
    h(Card, {className: "vit-cartao vit-conta"},
      h(Card.Header, {className: "vit-conta-topo"},
        h(Avatar, {fallback: h(Icon, {name: "user"})}),
        h(Card.Title, null, "Create an account"),
        h(CloseButton, {className: "vit-fechar"})),
      h(Card.Content, {className: "vit-conta-corpo"},
        h("p", {className: "vit-nota"}, "Start your free 7-day trial. No credit card required."),
        h(Button, {variant: "primary", fullWidth: true}, "Get Started"),
        h("div", {className: "vit-ou"}, h(Separator), h("span", null, "Or"), h(Separator)),
        h(Button, {variant: "tertiary", fullWidth: true, leadingIcon: "envelope-simple"}, "Continue with email"),
        h(Button, {variant: "tertiary", fullWidth: true, leadingIcon: "key"}, "Continue with a passkey"))),
    h("div", {className: "vit-grupos"},
      grupo("Design Club", "148 members", "By John", "palette", "info"),
      grupo("AI Builders", "362 members", "By Martha", "robot", "success")),
    h(Card, {className: "vit-cartao vit-salvar"},
      h(Card.Header, null,
        h(Avatar, {tone: "warning", emphasis: "soft", fallback: h(Icon, {name: "floppy-disk"})}),
        h(Card.Title, null, "Unsaved changes"),
        h(Card.Description, null, "Do you want to save or discard changes?"),
        h(CloseButton, {className: "vit-fechar"})),
      h(Card.Footer, null,
        h(Button, {variant: "tertiary", grow: true}, "Discard"),
        h(Button, {variant: "primary", grow: true}, "Save changes"))));
}

// O `h2` só para o leitor de tela (15/10/2026): os títulos dos cartões são `h3` (o `Card.Title`), e logo abaixo do `h1`
// da página a ordem pulava um nível — a varredura (`heading-order` do axe) pegou. Fora do desenho: `sr-only` sai do fluxo.
export function VitrineComponentes() {
  return h("div", {className: "vit-c"}, h("h2", {className: "sr-only"}, "Components"), h(Esquerda), h(Meio), h(Direita));
}
