// OS ESBOÇOS DOS BLOCOS (o desenho B, 02/11/2026 — o Victor: "esse itens não esta como referencia"): a miniatura de cada
// bloco é o DESENHO do desenho aprovado — as barras, o campo, o botão e a peça que marca o bloco —, e não o bloco encolhido
// (que ficava com letra de 4). O mesmo desenho, peça por peça, com os tokens da Aurea (`site-b/css/blocks.css`, `sk-`).
// Sem export padrão: o gerador só trata como página o módulo que exporta uma função.
const b = (w, lt = false) => `<span class="sk-b sk-w${w}${lt ? " sk-lt" : ""}"></span>`;
const f = (w) => `<span class="sk-f${w ? ` sk-w${w}` : ""}"></span>`;
const btn = (texto = "", extra = "") => `<span class="sk-btn${extra ? " " + extra : ""}">${texto}</span>`;
const linha = (conteudo, extra = "") => `<div class="sk-row${extra ? " " + extra : ""}">${conteudo}</div>`;
const pilula = (tom, texto, extra = "") => `<span class="sk-pill sk-${tom}${extra ? " " + extra : ""}">${texto}</span>`;
const hora = (t) => `<span class="sk-time">${t}</span>`;
const icone = (nome) => `<svg class="icon" aria-hidden="true"><use href="#i-${nome}"></use></svg>`;

export const ESBOCOS = {
  "block-sign-in-panel": `<div class="sk sk-mc"><div class="sk-card">${b(50)}${f()}${f()}${btn("Sign in", "sk-full")}</div></div>`,
  "block-settings-form": `<div class="sk">${b(30)}${f()}${b(30)}${f()}${linha(b(40) + '<span class="sk-sw"></span>')}${linha(btn("", "sk-gh") + btn("Save"), "sk-end")}</div>`,
  "block-members-table": `<div class="sk">${linha(f(60) + btn("Invite", "sk-push"))}${linha('<span class="sk-av sk-c-b"></span>' + b(40) + pilula("ok", "online"))}${linha('<span class="sk-av sk-c-g"></span>' + b(30) + pilula("wa", "busy"))}${linha('<span class="sk-av sk-c-p"></span>' + b(40) + pilula("ok", "online"))}</div>`,
  "block-empty-project-state": `<div class="sk sk-mc"><span class="sk-ico">${icone("folder")}</span>${b(50)}${b(70, true)}${btn("+ New project")}</div>`,
  "block-stats-row": `<div class="sk sk-grid2">${[["48.2k", "↑ +12%", ""], ["312", "↑ +18", ""], ["1.8%", "↓ −0.3%", ""], ["27", "↑ +4", " sk-wa"]]
    .map(([n, d, x], i) => `<div class="sk-tile">${b([50, 60, 40, 50][i], true)}<b class="sk-num">${n}</b><span class="sk-up${x}">${d}</span></div>`).join("")}</div>`,
  "block-pricing-row": `<div class="sk sk-grid3">${[["$0", false], ["$24", true], ["$49", false]]
    .map(([n, pro], i) => `<div class="sk-tile">${pro ? '<span class="sk-badge">Pro</span>' : b([60, 0, 50][i])}<b class="sk-num">${n}</b>${b(70, true)}${b(50, true)}${btn("", pro ? "sk-tile-btn" : "sk-gh sk-tile-btn")}</div>`).join("")}</div>`,
  "block-activity-panel": `<div class="sk">${linha(b(30) + '<span class="sk-count">3</span>' + btn("", "sk-gh sk-push"))}${[["50", "09:12"], ["40", "08:47"], ["60", "08:05"]]
    .map(([w, t]) => linha(`<span class="sk-dot"></span>${b(w)}${hora(t)}`)).join("")}${linha(`<span class="sk-dot sk-off"></span>${b(40, true)}${hora("Yesterday")}`)}</div>`,
  "block-run-session-panel": `<div class="sk">${linha(pilula("in", "Running", "sk-lead") + hora("turn 4"))}<span class="sk-bub"></span><span class="sk-bub sk-me"></span><span class="sk-bub sk-w50"></span>${linha('<span class="sk-circ"></span><span class="sk-circ"></span>' + btn("Pause", "sk-gh sk-push"), "sk-bottom")}</div>`,
  "block-review-compare": `<div class="sk">${linha(pilula("ok", "Checks passed", "sk-lead") + hora("3 of 3"))}<div class="sk-code"><span class="sk-del">− radius: 8</span><span class="sk-add">+ radius: 22</span><span class="sk-add">+ tone: "info"</span><span>&nbsp; label: "Save"</span></div>${linha(btn("Reject", "sk-gh") + btn("Apply"), "sk-end")}</div>`,
  "block-resource-workbench": `<div class="sk sk-split"><div class="sk-tree">${b(70)}<span class="sk-b sk-w50 sk-in"></span><span class="sk-b sk-w60 sk-in sk-on"></span><span class="sk-b sk-w50 sk-in"></span>${b(60)}</div><div class="sk-col"><span class="sk-rowb"></span><span class="sk-rowb sk-sel"></span><span class="sk-rowb"></span>${hora("Uploading · 62%")}<div class="sk-prog"><span style="inline-size:62%"></span></div></div></div>`,
  "block-analytics-workbench": `<div class="sk">${linha('<span class="sk-seg"><i class="sk-on"></i><i></i><i></i></span>' + btn("Export", "sk-gh sk-push"))}<b class="sk-num sk-lg">12,480</b><div class="sk-bars">${[38, 52, 44, 66, 58, 74, 92].map((p, i) => `<i${i === 6 ? ' class="sk-on"' : ""} style="block-size:${p}%"></i>`).join("")}</div></div>`,
  "block-transaction-flow": `<div class="sk">${linha(b(40) + hora("$32.00"))}${linha(b(30) + hora("$16.00"))}${linha(b(20, true) + hora("Visa ·· 4242"))}${linha('<span>Total</span><b class="sk-num sk-push">$48.00</b>', "sk-tot")}${btn("Pay $48.00", "sk-full sk-bottom")}</div>`,
  "block-device-control": `<div class="sk">${linha(b(40) + pilula("ok", "online"))}${linha(b(30, true) + hora("21.4 °C · good"))}${linha(b(30, true) + hora("48 % · good"))}<span class="sk-lbl">Calibration</span><div class="sk-range"><span style="inline-size:58%"></span><i style="inset-inline-start:58%"></i></div></div>`,
  "block-media-library": `<div class="sk"><div class="sk-grid3"><span class="sk-thumb"></span><span class="sk-thumb sk-on">${icone("play")}</span><span class="sk-thumb"></span></div>${linha(`<span class="sk-play">${icone("play")}</span><div class="sk-prog"><span style="inline-size:35%"></span></div>${hora("12:04")}`, "sk-player")}</div>`,
  "block-visual-builder": `<div class="sk sk-split"><div class="sk-canvas"><span class="sk-node" style="inset-inline-start:10%;inset-block-start:12%">Trigger</span><span class="sk-node sk-on" style="inset-inline-start:30%;inset-block-start:42%">Filter</span><span class="sk-node" style="inset-inline-start:12%;inset-block-start:72%">Send</span></div><div class="sk-col sk-col-40"><span class="sk-lbl">Outline</span><span class="sk-oi"><b>1</b>Trigger</span><span class="sk-oi sk-on"><b>2</b>Filter</span><span class="sk-oi"><b>3</b>Send</span></div></div>`,
};
