import {createElement as h} from "react";
import {NavList, Card, Badge, Status} from "../../../packages/react/dist/index.js";

// Caixa de recorte, pelo mesmo motivo do Sidebar e da BottomNav: esta lista é o tijolo de uma
// tela de AJUSTES, e numa demo larga ela vira texto solto com muito ar no meio. A caixa dá a
// largura de um telefone; o código é o uso real.
const box = {width: "min(22rem,100%)"};

// A lista NÃO pinta superfície de propósito (a ficha diz por quê), então quem agrupa aqui é o
// `Card` — que é exatamente como o consumidor vai compor.
const demo = (props) => h("div", {style: box}, h(Card, null, h(NavList, props)));

export default {
  description:
    "NavList is the list of tappable rows that open something: leading icon, label, an optional "
    + "second line, an optional trailing value, and the chevron that says the row goes somewhere. "
    + "It is the brick every settings screen is built from.",
  install: 'import {NavList} from "@aurea-uds/react";',
  features: [
    "It is a plain <ul> of links — NOT a landmark. Sidebar and BottomNav are app chrome and live "
    + "in a <nav>; this is content inside the page, and a third <nav> on one screen only adds "
    + "noise for anyone navigating by landmark.",
    "There is no current item, on purpose. aria-current would promise a current page in a list "
    + "you enter and come back from — that is Sidebar's job, not this one.",
    "The trailing value takes any node, so Badge, Status or plain text compose in without this "
    + "component knowing they exist. That is why there is no `badge` prop here.",
    "The text is the only track that shrinks. The value and the chevron never do: a clipped value "
    + "lies (\"R$ 1.2\" for \"R$ 1.234\") and a clipped chevron stops saying the row opens.",
    "`href` decides the element AND the chevron. With it the row is a link and gets the arrow; "
    + "without it the row is a button and has no arrow — because the arrow promises the row opens "
    + "something, and signing out opens nothing.",
    "A disabled row stays FOCUSABLE and inert (aria-disabled), because :disabled drops a control "
    + "out of the tab order and keyboard users never find out the row is there.",
    "On a coarse pointer the whole row grows to 44px — WCAG 2.5.5, and the size Apple HIG and "
    + "Material both land on. The target is the row, never the chevron.",
    "The list paints no surface and draws no divider: Card already gives the grouped panel, and "
    + "the row highlight here is the pill — a pill with a rule under it contradicts itself.",
  ],
  examples: [
    {
      title: "The settings list",
      description: "The whole anatomy at once: icon, label, a second line where it earns its "
        + "place, a value on the right, and the chevron. Grouped by a Card.",
      code: `<Card>
  <NavList items={[
    {id: "profile", label: "Profile", description: "Name, photo, handle", icon: "user", href: "/profile"},
    {id: "alerts", label: "Notifications", description: "Push, email", icon: "notification", value: "On", href: "/alerts"},
    {id: "plan", label: "Plan", icon: "wallet", value: <Badge size="xs">Free</Badge>, href: "/plan"},
    {id: "sync", label: "Sync", icon: "cloud", value: <Status tone="success">Live</Status>, href: "/sync"},
  ]} />
</Card>`,
      render: () => demo({items: [
        {id: "profile", label: "Profile", description: "Name, photo, handle", icon: "user", href: "#"},
        {id: "alerts", label: "Notifications", description: "Push, email", icon: "notification", value: "On", href: "#"},
        {id: "plan", label: "Plan", icon: "wallet", value: h(Badge, {size: "xs"}, "Free"), href: "#"},
        {id: "sync", label: "Sync", icon: "cloud", value: h(Status, {tone: "success"}, "Live"), href: "#"},
      ]}),
    },
    {
      title: "Just label and chevron",
      description: "The second line, the value and the icon are all optional. A row that only "
        + "goes somewhere carries only the name and the arrow.",
      code: `<Card>
  <NavList items={[
    {id: "terms", label: "Terms of service", href: "/terms"},
    {id: "privacy", label: "Privacy", href: "/privacy"},
    {id: "about", label: "About", href: "/about"},
  ]} />
</Card>`,
      render: () => demo({items: [
        {id: "terms", label: "Terms of service", href: "#"},
        {id: "privacy", label: "Privacy", href: "#"},
        {id: "about", label: "About", href: "#"},
      ]}),
    },
    {
      title: "Rows that act, and rows that cannot",
      description: "No href means the row is a <button> — and it carries NO chevron, because the "
        + "arrow promises the row opens something and signing out opens nothing. A disabled row is "
        + "a button too (a disabled link does not exist in HTML) and it stays focusable, so a "
        + "keyboard user still hears that it is unavailable.",
      code: `<Card>
  <NavList items={[
    {id: "export", label: "Export data", description: "Sends a copy by email", icon: "download", onClick: startExport},
    {id: "beta", label: "Beta features", description: "Not on your plan", icon: "flash", disabled: true},
    {id: "out", label: "Sign out", icon: "logout", onClick: signOut},
  ]} />
</Card>`,
      render: () => demo({items: [
        {id: "export", label: "Export data", description: "Sends a copy by email", icon: "download"},
        {id: "beta", label: "Beta features", description: "Not on your plan", icon: "flash", disabled: true},
        {id: "out", label: "Sign out", icon: "logout"},
      ]}),
    },
  ],
};
