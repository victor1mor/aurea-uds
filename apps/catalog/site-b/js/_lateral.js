/* A LATERAL QUE NÃO SOBE (o Victor, 03/11/2026, com a imagem: "sidebar sobe quando rola a pagina ate final"). A lateral
   gruda no topo (`sticky`), mas não passa do fim do `AppShell`, que acaba antes do rodapé: no fim da página ela era
   empurrada para cima e sumia atrás da barra de cima. Aprovado pela imagem: o topo dela fica parado, e no fim ela ENCOLHE
   por baixo até a linha do conteúdo, com a lista rolando por dentro; o rodapé continua de ponta a ponta. A peça não muda:
   só o site passa a altura, quando o que sobra é menos que a altura dela. Sem script, a lateral sobe como antes. */
(function () {
  var laterais = document.querySelectorAll(".app-shell-docs > .sidebar");
  if (!laterais.length) return;
  var pedido = 0;
  function ajusta() {
    pedido = 0;
    laterais.forEach(function (lateral) {
      lateral.style.removeProperty("max-block-size");
      var cs = getComputedStyle(lateral);
      if (cs.position !== "sticky") return;
      var sobra = lateral.parentElement.getBoundingClientRect().bottom - (parseFloat(cs.top) || 0);
      if (sobra < lateral.getBoundingClientRect().height) lateral.style.maxBlockSize = Math.max(sobra, 0) + "px";
    });
  }
  function pede() { if (!pedido) pedido = requestAnimationFrame(ajusta); }
  addEventListener("scroll", pede, {passive: true});
  addEventListener("resize", pede);
  pede();
})();

/* A LATERAL ABRE NO ITEM ATUAL (S-07 — o Victor, 05/11/2026, em Chart: "rolei, cliquei em um item, e a sidebar sobe de novo
   para o topo"). Cada página é um documento novo, e a lateral nascia rolada no topo, com o item atual fora da vista.
   Aprovado pela imagem: ao sair, a página guarda a rolagem da lateral (por área, só nesta aba); ao abrir, a lateral volta
   a ela — e, se o item atual ainda ficar fora da vista (chegou de outra área, ou do endereço direto), rola até ele ficar
   no meio. Sem script, ou sem onde guardar, só a segunda parte. */
(function () {
  var lateral = document.querySelector(".app-shell-docs > .sidebar:not(.app-shell-aside)");
  if (!lateral) return;
  var area = (/\bsite-area-([\w-]+)/.exec(lateral.parentElement.className) || [])[1] || "";
  var chave = "aurea-lateral:" + area;
  function rola() {
    // Quem rola: a própria lateral (na coluna, medido) ou a caixa de dentro dela que tiver a rolagem.
    var rolavel = function (el) { return el && el.clientHeight > 0 && el.scrollHeight > el.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowY); };
    var caixa = [lateral, lateral.querySelector(".sidebar-body")].filter(rolavel)[0];
    if (!caixa) return;
    var atual = lateral.querySelector('.sidebar-nav a[aria-current="page"]');
    try { var guardado = sessionStorage.getItem(chave); if (guardado != null) caixa.scrollTop = Number(guardado) || 0; } catch (e) { /* sem onde guardar */ }
    if (atual) {
      var c = caixa.getBoundingClientRect(), a = atual.getBoundingClientRect();
      if (a.top < c.top || a.bottom > c.bottom) caixa.scrollTop += a.top - c.top - (caixa.clientHeight - a.height) / 2;
    }
    addEventListener("pagehide", function () {
      try { sessionStorage.setItem(chave, String(Math.round(caixa.scrollTop))); } catch (e) { /* sem onde guardar */ }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", rola); else rola();
})();
