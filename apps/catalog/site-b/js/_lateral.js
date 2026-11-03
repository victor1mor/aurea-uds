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
