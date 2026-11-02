// O COMPORTAMENTO COMUM DAS PÁGINAS DO HANDBOOK NO DESENHO B (02/11/2026): Dark Mode, Styling, Animation, Composition,
// Density e Icons. As páginas são estáticas: as peças da Aurea saem do gerador já desenhadas, mas paradas (sem o React). Aqui
// estão os três jeitos de elas responderem ao clique — a chave de segmentos (escolha única), o botão de ligar (`Toggle`) e
// o `Slider` —, escrevendo nelas os MESMOS atributos que o motor escreveria, para a pele da Aurea fazer o resto. Cada
// página chama o que precisa (`window.AureaDocsB`); sem a página, nada acontece.
(function () {
  // A chave de segmentos (`role="radiogroup"`, os itens `role="radio"`): escolhe pelo clique e pelas setas, com UMA parada
  // de Tab (a escolhida), como o motor faz. O ícone da escolhida troca para a forma cheia sozinho (o `-fill`).
  function escolha(grupo, aoEscolher) {
    var itens = Array.prototype.slice.call(grupo.querySelectorAll("[role='radio']"));
    function marcar(item, avisar) {
      itens.forEach(function (x) {
        var sim = x === item;
        x.setAttribute("aria-checked", sim ? "true" : "false");
        x.tabIndex = sim ? 0 : -1;
        x.classList.toggle("active", sim);
        if (sim) { x.setAttribute("data-checked", ""); x.removeAttribute("data-unchecked"); }
        else { x.setAttribute("data-unchecked", ""); x.removeAttribute("data-checked"); }
        var uso = x.querySelector("use");
        if (uso) {
          var nome = uso.getAttribute("href").replace(/-fill$/, "");
          uso.setAttribute("href", sim ? nome + "-fill" : nome);
        }
        var entrada = x.nextElementSibling;
        if (entrada && entrada.tagName === "INPUT") entrada.checked = sim;
      });
      if (avisar && aoEscolher) aoEscolher(valor(item), item);
    }
    function valor(item) {
      var entrada = item.nextElementSibling;
      return entrada && entrada.tagName === "INPUT" ? entrada.value : item.textContent;
    }
    itens.forEach(function (item, n) {
      item.addEventListener("click", function () { marcar(item, true); });
      item.addEventListener("keydown", function (e) {
        var passo = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (e.key === "Home" || e.key === "End") passo = e.key === "Home" ? -n : itens.length - 1 - n;
        if (!passo) return;
        e.preventDefault();
        if (getComputedStyle(grupo).direction === "rtl" && (e.key === "ArrowRight" || e.key === "ArrowLeft")) passo = -passo;
        var outro = itens[(n + passo + itens.length) % itens.length];
        marcar(outro, true);
        outro.focus();
      });
    });
    var atual = itens.filter(function (x) { return x.getAttribute("aria-checked") === "true"; })[0] || itens[0];
    if (atual) marcar(atual, false);
    return {escolher: function (v) { var it = itens.filter(function (x) { return valor(x) === v; })[0]; if (it) marcar(it, true); }};
  }

  // O botão de ligar (`Toggle`): `aria-pressed` e `data-pressed`, os dois que o motor escreve. Cada um é uma parada de Tab.
  function aperta(botao, aoMudar) {
    botao.tabIndex = 0;
    botao.addEventListener("click", function () { ligar(botao.getAttribute("aria-pressed") !== "true", true); });
    function ligar(sim, avisar) {
      botao.setAttribute("aria-pressed", sim ? "true" : "false");
      if (sim) botao.setAttribute("data-pressed", ""); else botao.removeAttribute("data-pressed");
      if (avisar && aoMudar) aoMudar(sim, botao);
    }
    return {ligar: ligar};
  }

  // O grupo de botões de ligar (`ToggleGroup`): com `unico`, ligar um desliga os outros (e o ligado não se desliga).
  function grupoDeBotoes(grupo, aoMudar, unico) {
    var botoes = Array.prototype.slice.call(grupo.querySelectorAll("button"));
    var controles = botoes.map(function (b) {
      return aperta(b, function (sim) {
        if (unico) {
          if (!sim) { controles[botoes.indexOf(b)].ligar(true, false); return; }
          botoes.forEach(function (o, i) { if (o !== b) controles[i].ligar(false, false); });
        }
        if (aoMudar) aoMudar(botoes.filter(function (o) { return o.getAttribute("aria-pressed") === "true"; }), b);
      });
    });
    return controles;
  }

  // O `Slider`: o clique e o arrasto na trilha, e as setas no campo de dentro (o `input type="range"` que a peça já traz).
  function deslizante(raiz, aoMudar) {
    var entrada = raiz.querySelector("input[type='range']");
    var controle = raiz.querySelector(".slider-control");
    var trilha = raiz.querySelector(".slider-track") || controle;
    var cheio = raiz.querySelector(".slider-fill");
    var botao = raiz.querySelector(".slider-thumb");
    var saida = raiz.querySelector(".slider-output");
    if (!entrada || !controle) return null;
    var min = +entrada.min, max = +entrada.max, passo = +entrada.step || 1;
    function por(v) {
      v = Math.min(max, Math.max(min, Math.round((v - min) / passo) * passo + min));
      var pct = (v - min) / (max - min) * 100;
      entrada.value = String(v);
      entrada.setAttribute("aria-valuenow", String(v));
      if (cheio) cheio.style.width = pct + "%";
      if (botao) botao.style.insetInlineStart = pct + "%";
      if (saida) saida.textContent = String(v);
      if (aoMudar) aoMudar(v);
    }
    function doPonteiro(e) {
      var r = trilha.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      if (getComputedStyle(raiz).direction === "rtl") x = 1 - x;
      por(min + x * (max - min));
    }
    controle.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      controle.setPointerCapture(e.pointerId);
      entrada.focus({preventScroll: true});
      doPonteiro(e);
      function mover(ev) { doPonteiro(ev); }
      function soltar() { controle.removeEventListener("pointermove", mover); controle.removeEventListener("pointerup", soltar); }
      controle.addEventListener("pointermove", mover);
      controle.addEventListener("pointerup", soltar);
    });
    entrada.addEventListener("input", function () { por(+entrada.value); });
    por(+entrada.value);
    return {por: por};
  }

  window.AureaDocsB = {escolha: escolha, aperta: aperta, grupoDeBotoes: grupoDeBotoes, deslizante: deslizante};
})();
