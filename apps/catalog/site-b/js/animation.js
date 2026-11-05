// ANIMATION (site B): os botões que abrem e fecham as janelas presas nos palcos, o "Play" de cada token e a corrida das
// duas curvas. As janelas são as da Aurea; aqui só se escrevem os atributos que o motor escreveria — `data-starting-style`
// no primeiro quadro da entrada e `data-ending-style` na saída —, e a transição do `aurea.css` faz o movimento.
(function () {
  if (!document.querySelector(".animation-galeria")) return;
  var PARTES = {dialog: ".dialog-backdrop, .dialog", drawer: ".drawer", popover: ".popover", toast: ".toast"};

  function abrir(el) {
    el.removeAttribute("data-ending-style");
    el.removeAttribute("data-fechada");
    el.setAttribute("data-starting-style", "");
    el.getBoundingClientRect();
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.removeAttribute("data-starting-style"); }); });
  }
  function fechar(el) {
    el.setAttribute("data-ending-style", "");
    var feito = false;
    function fim() {
      if (feito || !el.hasAttribute("data-ending-style")) return;
      feito = true;
      el.setAttribute("data-fechada", "");
      el.removeAttribute("data-ending-style");
    }
    el.addEventListener("transitionend", fim, {once: true});
    setTimeout(fim, 600);
  }

  document.querySelectorAll("[data-abre]").forEach(function (botao) {
    var cartao = botao.closest(".animation-movimento");
    var mini = cartao && cartao.querySelector(".animation-mini");
    if (!mini) return;
    var partes = mini.querySelectorAll(PARTES[botao.getAttribute("data-abre")]);
    var rotulo = botao.querySelector("span") || botao;
    botao.addEventListener("click", function () {
      var abre = !botao.hasAttribute("data-aberta");
      botao.toggleAttribute("data-aberta", abre);
      rotulo.textContent = abre ? "Close" : "Open";
      partes.forEach(abre ? abrir : fechar);
    });
  });

  // O "Play" de cada token e a corrida: a bolinha vai até a outra ponta (e volta no clique seguinte).
  function correr(bolas) { bolas.forEach(function (b) { b.toggleAttribute("data-ligada"); }); }
  // Pela PÁGINA, e não em cada botão: a tabela é uma `DataGrid` que acende por cima do desenho pronto (S-02, 05/11/2026)
  // e redesenha as fileiras ao ordenar — o botão de agora não é o de quando este script rodou.
  document.addEventListener("click", function (e) {
    var botao = e.target.closest && e.target.closest(".animation-play");
    if (botao) correr([botao.closest("tr").querySelector(".animation-bola")]);
  });
  var corrida = document.querySelector(".animation-corrida");
  var correrBotao = corrida && corrida.querySelector(".animation-correr");
  if (correrBotao) correrBotao.addEventListener("click", function () { correr(corrida.querySelectorAll(".animation-bola")); });
})();

// "SIMULATE REDUCE MOTION": o On para o movimento da página (a regra `.animation-parado`, em `site-b/css/animation.css`),
// como o "reduzir movimento" do sistema; o Off devolve. A frase da ponta diz o que acontece.
(function () {
  var faixa = document.querySelector(".animation-simula");
  if (!faixa) return;
  var corpo = faixa.parentElement, frase = faixa.querySelector("[data-an-reduz-frase]");
  faixa.addEventListener("click", function (e) {
    var b = e.target.closest("[data-an-reduz]");
    if (!b) return;
    var parado = b.getAttribute("data-an-reduz") === "on";
    corpo.classList.toggle("animation-parado", parado);
    faixa.querySelectorAll("[data-an-reduz]").forEach(function (x) {
      var sim = x === b;
      x.classList.toggle("active", sim);
      x.setAttribute("aria-pressed", sim ? "true" : "false");
    });
    frase.textContent = parado ? "the motion below stops" : "the motion below plays";
  });
})();
