// A PÁGINA "RTL" DO SITE B (02/11/2026, o grupo 5): a chave ltr | rtl troca o `dir` da caixa que espelha. Só age na
// página que tem a caixa.
(function () {
  var caixa = document.querySelector("[data-rtl-caixa]");
  var chave = document.querySelector('[data-g5-chave="rtl-sentido"]');
  if (!caixa || !chave) return;
  var nome = document.querySelector("[data-rtl-sentido]");
  chave.addEventListener("click", function (e) {
    var botao = e.target.closest("button[data-valor]");
    if (!botao) return;
    var sentido = botao.getAttribute("data-valor");
    chave.querySelectorAll("button[data-valor]").forEach(function (b) {
      var ligado = b === botao;
      b.classList.toggle("active", ligado);
      b.setAttribute("aria-pressed", ligado ? "true" : "false");
    });
    caixa.setAttribute("dir", sentido);
    if (nome) nome.textContent = sentido;
  });
})();
