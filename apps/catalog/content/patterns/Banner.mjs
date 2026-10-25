// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total em duas das referências. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Notice",
    name: "Something that affects the whole page",
    description: "A banner spans the region it is about; an alert sits inside it. Dismissible only when the message is genuinely optional — a banner about degraded service that can be closed is a banner nobody sees twice.",
    uses: ["Banner"],
    code: `<Banner variant="warning" title="Reduced capacity">
  Runs are queueing. Scheduled jobs may start late until 18:00 UTC.
</Banner>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Banner, {variant: "warning", title: "Reduced capacity"},
      "Runs are queueing. Scheduled jobs may start late until 18:00 UTC.")),
  },
  // GAR-19 (19/10/2026): o aviso de cookies. Na página (HTML parado) os botões não respondem; a janela de preferências e a
  // confirmação só existem num app React — o comportamento é medido no `tests/visual/aviso-de-cookies.spec.ts`.
  {
    variant: "Consent",
    name: "The cookie notice",
    description: "variant=\"consent\" asks before setting cookies that are not necessary: reject them, accept all, or choose by category in a window. Rejecting is as easy to see as accepting — same weight, same place —, the optional categories start off, and after the choice the confirmation takes the focus. Put the notice at the top of the page, before the skip link, and do not fix it to the screen. To change the choice later, show it again from a link in the footer, with value set to what you stored.",
    uses: ["Banner", "Dialog", "Switch", "Link"],
    code: `<Banner
  variant="consent"
  categories={[
    {id: "necessary", label: "Necessary", description: "Sign-in, the cart, your cookie choice.", required: true},
    {id: "analytics", label: "Analytics", description: "Visits counted without saying who you are."},
    {id: "marketing", label: "Marketing", description: "Ads for what you saw here, on other sites."},
  ]}
  value={stored}
  onConsent={(choice) => store(choice)}
  onDismiss={() => setShown(false)}
>
  <p>We use necessary cookies to make this site work and, if you allow it, others to measure visits and show ads. <Link href="/privacy">Privacy policy</Link>.</p>
</Banner>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Banner, {variant: "consent",
      categories: [{id: "necessary", label: "Necessary", required: true}, {id: "analytics", label: "Analytics"}, {id: "marketing", label: "Marketing"}]},
      h("p", null, "We use necessary cookies to make this site work and, if you allow it, others to measure visits and show ads. ",
        h(A.Link, {href: "#"}, "Privacy policy"), "."))),
  },
];
