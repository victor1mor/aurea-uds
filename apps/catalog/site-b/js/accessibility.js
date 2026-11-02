// A PÁGINA "Accessibility" DO SITE B (02/11/2026, o grupo 5): o campo que fica inválido (o anel muda de cor), a área de
// toque de 44 pintada, e o texto a 200% numa JANELA PRÓPRIA — um `iframe` com a folha do site, em que a régua muda o
// tamanho da letra da RAIZ (as peças medem em `rem`, como a varredura de 200% mede). A régua é a `Slider` da Aurea, sem
// React nesta página: o campo de faixa dela recebe o teclado, e o arrastar é daqui. Só age na página que tem a régua.
(function () {
  var reflow = document.querySelector("[data-acc-reflow]");
  if (!reflow) return;

  // O CAMPO INVÁLIDO.
  var botaoInvalido = document.querySelector("[data-acc-invalido]");
  var campo = document.querySelector("[data-acc-campo]");
  if (botaoInvalido && campo) botaoInvalido.addEventListener("click", function () {
    var ligado = botaoInvalido.getAttribute("aria-pressed") !== "true";
    botaoInvalido.setAttribute("aria-pressed", ligado ? "true" : "false");
    botaoInvalido.textContent = ligado ? "Make it valid" : "Make the field invalid";
    if (ligado) campo.setAttribute("aria-invalid", "true"); else campo.removeAttribute("aria-invalid");
    campo.value = ligado ? "not-an-email" : "you@company.com";
  });

  // A ÁREA DE TOQUE.
  var toque = document.querySelector("[data-acc-toque]");
  var botaoArea = document.querySelector("[data-acc-area]");
  if (toque && botaoArea) botaoArea.addEventListener("click", function () {
    var ligado = botaoArea.getAttribute("aria-pressed") !== "true";
    botaoArea.setAttribute("aria-pressed", ligado ? "true" : "false");
    botaoArea.textContent = ligado ? "Hide the 44px hit area" : "Show the 44px hit area";
    toque.setAttribute("data-mostrar", ligado ? "true" : "false");
  });

  // A JANELA PRÓPRIA.
  var lugar = reflow.querySelector("[data-acc-janela]");
  var numero = reflow.querySelector("[data-acc-tamanho]");
  var faixa = reflow.querySelector('input[type="range"]');
  var trilho = reflow.querySelector(".slider-control");
  var cheio = reflow.querySelector(".slider-fill");
  var bolinha = reflow.querySelector(".slider-thumb");
  if (!lugar || !faixa) return;
  var raiz = document.documentElement;
  var janela = document.createElement("iframe");
  janela.title = "The card at the chosen text size";
  var folha = new URL("./assets/catalog.css", location.href).href;
  janela.srcdoc = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<link rel="stylesheet" href="' + folha + '"><style>html,body{margin:0;background:transparent}body{padding:var(--space-1)}</style></head><body>'
    + lugar.innerHTML + "</body></html>";
  var pct = 100;
  function doc() { try { return janela.contentDocument; } catch (e) { return null; } }
  function espelhar() {
    var d = doc();
    if (!d || !d.documentElement) return;
    ["data-theme", "data-brand", "data-density"].forEach(function (a) {
      var v = raiz.getAttribute(a);
      if (v == null) d.documentElement.removeAttribute(a); else d.documentElement.setAttribute(a, v);
    });
    d.documentElement.style.fontSize = pct + "%";
    janela.style.height = "0px";
    janela.style.height = d.documentElement.scrollHeight + "px";
  }
  janela.addEventListener("load", espelhar);
  lugar.replaceChildren(janela);
  new MutationObserver(espelhar).observe(raiz, {attributes: true, attributeFilter: ["data-theme", "data-brand", "data-density"]});
  window.addEventListener("resize", espelhar);

  function mudar(valor) {
    var min = Number(faixa.min) || 100, max = Number(faixa.max) || 200, passo = Number(faixa.step) || 10;
    valor = Math.min(max, Math.max(min, Math.round(valor / passo) * passo));
    pct = valor;
    faixa.value = String(valor);
    faixa.setAttribute("aria-valuenow", String(valor));
    faixa.setAttribute("aria-valuetext", valor + "%");
    var parte = ((valor - min) / (max - min)) * 100;
    if (cheio) cheio.style.width = parte + "%";
    if (bolinha) bolinha.style.insetInlineStart = parte + "%";
    if (numero) numero.textContent = valor + "%";
    espelhar();
  }
  faixa.setAttribute("aria-valuetext", "100%");
  faixa.addEventListener("input", function () { mudar(Number(faixa.value)); });
  // O arrastar no trilho (sem React, o motor da régua não está aqui): a posição vira o valor, e o teclado fica no campo.
  if (trilho) {
    var arrastando = false;
    var porPonto = function (x) {
      var r = trilho.getBoundingClientRect();
      var parte = (x - r.left) / r.width;
      if (getComputedStyle(trilho).direction === "rtl") parte = 1 - parte;
      mudar(Number(faixa.min) + parte * (Number(faixa.max) - Number(faixa.min)));
    };
    trilho.addEventListener("pointerdown", function (e) {
      arrastando = true;
      trilho.setPointerCapture(e.pointerId);
      faixa.focus({preventScroll: true});
      porPonto(e.clientX);
      e.preventDefault();
    });
    trilho.addEventListener("pointermove", function (e) { if (arrastando) porPonto(e.clientX); });
    trilho.addEventListener("pointerup", function () { arrastando = false; });
    trilho.addEventListener("pointercancel", function () { arrastando = false; });
  }
})();
