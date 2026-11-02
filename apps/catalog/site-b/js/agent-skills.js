// A PÁGINA "Agent Skills" DO SITE B (02/11/2026, o grupo 5): o cartão escolhido troca o comando do bloco (o "Copy" copia
// o que está escrito). Só age na página que tem os cartões.
(function () {
  var onde = document.querySelector("[data-skills-onde]");
  var caixa = document.querySelector("[data-skills-comando]");
  if (!onde || !caixa) return;
  onde.addEventListener("change", function (e) {
    if (!e.target || e.target.type !== "radio") return;
    var codigo = caixa.querySelector("pre code");
    if (codigo) codigo.textContent = caixa.getAttribute(e.target.value === "user" ? "data-usuario" : "data-projeto");
  });
})();
