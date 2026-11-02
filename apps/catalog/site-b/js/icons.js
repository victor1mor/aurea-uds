// ICONS (site B): a mesa de experimentar — o nome (um ladrilho por vez), o peso e o tamanho trocam o desenho grande, o
// `Icon` no tamanho de verdade e a linha de código — e a chave "Home / Alerts / Settings" (a escolhida fica cheia sozinha).
(function () {
  var D = window.AureaDocsB;
  var mesa = document.querySelector(".icons-mesa");
  if (!D || !mesa) return;
  var PX = {sm: 16, md: 20, lg: 24, xl: 32};
  var estado = {nome: "house", peso: "regular", tamanho: "md"};
  var grande = mesa.querySelector(".icons-grande use");
  var real = mesa.querySelector(".icons-real .icon");
  var px = mesa.querySelector(".icons-px");
  var linha = mesa.querySelector(".icons-linha code");
  function desenhar() {
    var id = "#i-" + estado.nome + (estado.peso === "fill" ? "-fill" : "");
    if (grande) grande.setAttribute("href", id);
    if (real) {
      real.querySelector("use").setAttribute("href", id);
      real.setAttribute("class", "icon" + (estado.tamanho === "md" ? "" : " icon-" + estado.tamanho));
    }
    if (px) px.textContent = PX[estado.tamanho] + "px";
    if (linha) linha.textContent = "<Icon name=\"" + estado.nome + "\"" + (estado.peso === "fill" ? " weight=\"fill\"" : "") +
      " size=\"" + estado.tamanho + "\" />";
  }
  D.grupoDeBotoes(mesa.querySelector(".icons-grade"), function (ligados) {
    if (ligados[0]) { estado.nome = ligados[0].querySelector(".icons-ladrilho-dentro > span").textContent; desenhar(); }
  }, true);
  var chaves = mesa.querySelectorAll(".icons-escolhas .segmented");
  if (chaves[0]) D.escolha(chaves[0], function (v) { estado.peso = v; desenhar(); });
  if (chaves[1]) D.escolha(chaves[1], function (v) { estado.tamanho = v; desenhar(); });
  var abas = document.querySelector(".icons-abas .segmented");
  if (abas) D.escolha(abas);
})();
