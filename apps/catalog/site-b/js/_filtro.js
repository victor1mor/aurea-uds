/* O FILTRO DA LATERAL (o desenho B, 02/11/2026): nas áreas Blocks, Patterns, Releases e Tokens, os itens da lateral levam a
   `#filtro/<valor>`. Este script marca o escolhido (`aria-current="true"`) e avisa a página com o evento `site-filtro`
   (`detail` = o valor; "all" sem filtro). Quem mostra e esconde é o script de cada página. Sem script, a página mostra tudo. */
(function () {
  var links = function () { return document.querySelectorAll('.sidebar a[href^="#filtro/"]'); };
  if (!links().length) return;
  function aplicar() {
    var m = /^#filtro\/(.+)$/.exec(location.hash);
    var valor = m ? decodeURIComponent(m[1]) : "all";
    links().forEach(function (a) {
      var sim = a.getAttribute("href") === "#filtro/" + valor;
      if (sim) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      a.classList.toggle("is-selected", sim);
    });
    document.dispatchEvent(new CustomEvent("site-filtro", {detail: valor}));
  }
  window.addEventListener("hashchange", aplicar);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", aplicar); else aplicar();
})();

/* O CAMPO DE FILTRAR DA LATERAL (Patterns): vai para baixo de "By component", como o desenho, e esconde os componentes
   cujo nome não tem o que se digitou ("All components" fica sempre). */
(function () {
  var campo = document.querySelector("[data-site-filtro-busca]");
  if (!campo) return;
  var caixa = campo.closest(".site-filtro-busca");
  var primeiro = document.querySelector('.sidebar a[href="#filtro/all"]');
  var grupo = primeiro && primeiro.closest("li");
  var lista = grupo && grupo.parentElement;
  if (caixa && lista && lista.parentElement) lista.parentElement.insertBefore(caixa, lista);
  campo.addEventListener("input", function () {
    var q = campo.value.trim().toLowerCase();
    document.querySelectorAll('.sidebar a[href^="#filtro/"]').forEach(function (a) {
      if (a.getAttribute("href") === "#filtro/all") return;
      var li = a.closest("li") || a;
      li.hidden = !!q && a.textContent.toLowerCase().indexOf(q) < 0;
    });
  });
})();

/* O "ON THIS PAGE" DA LATERAL (o desenho B): a âncora da seção que está na tela fica marcada enquanto a página rola. */
(function () {
  var links = [].slice.call(document.querySelectorAll('.sidebar a[href^="#"]:not([href^="#filtro/"])'));
  var alvos = links.map(function (a) { return document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1))); });
  if (!links.length || !alvos.some(Boolean) || !("IntersectionObserver" in window)) return;
  var visiveis = new Set();
  function marcar() {
    var k = alvos.findIndex(function (el) { return el && visiveis.has(el); });
    links.forEach(function (a, i) { if (i === k) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) visiveis.add(e.target); else visiveis.delete(e.target); });
    marcar();
  }, {rootMargin: "-20% 0px -60% 0px"});
  alvos.forEach(function (el) { if (el) io.observe(el); });
})();
