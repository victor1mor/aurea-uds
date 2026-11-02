// DENSITY (site B): a chave das três densidades muda o `data-density` do cartão de peças, as medidas ao lado (lidas dos
// tokens, em px, como a página está agora), a coluna acesa da tabela e o atributo do palco. E o botão de cada densidade
// no toque diz a altura que tem aqui.
(function () {
  var D = window.AureaDocsB;
  var previa = document.querySelector(".density-previa");
  if (!D || !previa) return;
  var px = function (el, token) {
    var t = document.createElement("div");
    t.style.blockSize = "var(" + token + ")";
    t.style.position = "absolute";
    t.style.visibility = "hidden";
    el.appendChild(t);
    var v = Math.round(t.getBoundingClientRect().height);
    t.remove();
    return v;
  };
  function medir() {
    document.querySelectorAll(".density-medidas [data-token]").forEach(function (dd) {
      dd.textContent = px(previa, dd.getAttribute("data-token")) + "px";
    });
  }
  var chave = document.querySelector(".density-chave .segmented");
  if (chave) D.escolha(chave, function (d) {
    previa.setAttribute("data-density", d);
    var tabela = document.querySelector(".density-tokens");
    if (tabela) tabela.setAttribute("data-coluna", d);
    var atributo = document.querySelector(".density-atributo");
    if (atributo) atributo.textContent = "data-density=\"" + d + "\"";
    medir();
  });
  medir();
  // A altura do botão de verdade em cada densidade, nesta tela (no toque, a peça sobe para 44).
  document.querySelectorAll(".density-toque").forEach(function (c) {
    var botao = c.querySelector(".btn");
    var lugar = c.querySelector("[data-altura]");
    if (botao && lugar) lugar.textContent = Math.round(botao.getBoundingClientRect().height) + "px here";
  });
})();
