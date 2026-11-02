// STYLING (site B): a chave das camadas, o `Toggle` "Autosave" e a régua da largura.
(function () {
  var D = window.AureaDocsB;
  if (!D || !document.querySelector(".styling-camadas")) return;

  // "Does your app use layers too?": "No" mostra a regra solta; "Yes", a ordem das camadas.
  var chave = document.querySelector(".styling-camadas .segmented");
  var voce = document.querySelector(".styling-voce");
  if (chave) D.escolha(chave, function (v) {
    document.querySelectorAll("[data-camadas]").forEach(function (p) { p.hidden = p.getAttribute("data-camadas") !== v; });
    if (voce) voce.textContent = v === "yes" ? "@layer app (declared after aurea)" : "your CSS, outside any layer";
  });

  // O `Toggle`: a marcação ao lado mostra o `data-pressed` quando ele está ligado.
  var estado = document.querySelector(".styling-estado");
  var botao = estado && estado.querySelector(".toggle");
  var atributo = estado && estado.querySelector(".styling-atributo");
  if (botao && atributo) D.aperta(botao, function (sim) { atributo.textContent = sim ? " data-pressed" : ""; });

  // A régua: a largura escolhida acende os degraus até ela, e o botão fica "lg" do `md` (768) para cima.
  var regua = document.querySelector(".styling-regua");
  if (!regua) return;
  var largura = regua.querySelector(".styling-largura");
  var degraus = regua.querySelectorAll(".styling-degrau-vw");
  var salvar = regua.querySelector(".styling-salvar .btn");
  var explica = regua.querySelector(".styling-explica");
  var deslizante = regua.querySelector(".slider");
  if (deslizante) D.deslizante(deslizante, function (v) {
    largura.textContent = v + "px";
    degraus.forEach(function (d) {
      var sim = v >= +d.getAttribute("data-px");
      d.classList.toggle("badge-primary", sim);
      d.classList.toggle("badge-solid", sim);
    });
    var grande = v >= 768;
    if (salvar) { salvar.classList.toggle("btn-lg", grande); salvar.classList.toggle("btn-sm", !grande); }
    if (explica) explica.textContent = grande ? "md applies (768px or wider) → size \"lg\"" : "below md → base, size \"sm\"";
  });
})();
