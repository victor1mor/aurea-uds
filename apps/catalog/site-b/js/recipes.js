// A PÁGINA "RECIPES" DO SITE B: escolher a receita (os padrões dela acendem), filtrar a lista, ligar um padrão (a lista marca
// quem o usa) e copiar a lista de padrões. Só age na página dela (o `[data-receitas]`). Os dados vêm do `#rec-dados`.
(function () {
  var raiz = document.querySelector("[data-receitas]");
  var fonte = document.getElementById("rec-dados");
  if (!raiz || !fonte) return;
  var dados = JSON.parse(fonte.textContent);
  var R = dados.receitas;
  var atual = R.find(function (r) { return raiz.querySelector('[data-rec-item="' + r.id + '"][aria-pressed="true"]'); }) || R[0];
  var padrao = "";
  var q = function (s) { return raiz.querySelector(s); };
  var todos = function (s) { return Array.prototype.slice.call(raiz.querySelectorAll(s)); };
  var anuncio = q("[data-rec-anuncio]");

  // Uma etiqueta do mesmo jeito das que o gerador desenhou (copiada da primeira, para a pele ser a mesma).
  function etiquetas(lugar, textos) {
    var molde = lugar.firstElementChild;
    if (!molde) return;
    lugar.replaceChildren.apply(lugar, textos.map(function (t) { var e = molde.cloneNode(false); e.textContent = t; return e; }));
  }

  function desenhar() {
    q("[data-rec-pos]").textContent = "Recipe " + (R.indexOf(atual) + 1) + " of " + R.length;
    q("[data-rec-nome]").textContent = atual.nome;
    q("[data-rec-texto]").textContent = atual.texto;
    etiquetas(q("[data-rec-foco]"), atual.foco);
    etiquetas(q("[data-rec-usa]"), atual.padroes);
    q("[data-rec-conta]").textContent = atual.padroes.length;
    q("[data-rec-conta-palavra]").textContent = atual.padroes.length === 1 ? "pattern to compose" : "patterns to compose";
    q("[data-rec-abrir]").setAttribute("href", atual.href);
    q("[data-rec-copiar]").textContent = "Copy the list";
    todos("[data-rec-item]").forEach(function (b) {
      var r = R.find(function (x) { return x.id === b.dataset.recItem; });
      var usa = !!padrao && r.padroes.indexOf(padrao) >= 0;
      b.setAttribute("aria-pressed", r.id === atual.id ? "true" : "false");
      b.toggleAttribute("data-apagado", !!padrao && !usa);
      b.querySelector(".rec-item-conta").hidden = usa;
      b.querySelector(".rec-item-usa").hidden = !usa;
    });
    todos("[data-rec-padrao]").forEach(function (c) {
      var nome = c.dataset.recPadrao, usado = atual.padroes.indexOf(nome) >= 0, ligado = padrao === nome;
      c.classList.toggle("card-selected", usado);
      c.setAttribute("aria-pressed", ligado ? "true" : "false");
      c.querySelector(".rec-padrao-usado").hidden = !usado || ligado;
      c.querySelector(".rec-padrao-filtro").hidden = !ligado;
    });
    var noGrupo = function (lista) { return atual.padroes.filter(function (x) { return lista.indexOf(x) >= 0; }).length + " in this recipe"; };
    q('[data-rec-no-grupo="app"]').textContent = noGrupo(dados.app);
    q('[data-rec-no-grupo="op"]').textContent = noGrupo(dados.op);
    var faixa = q("[data-rec-faixa]");
    faixa.hidden = !padrao;
    if (padrao) {
      var n = R.filter(function (r) { return r.padroes.indexOf(padrao) >= 0; }).length;
      q("[data-rec-faixa-texto]").textContent = padrao + " is used by " + n + (n === 1 ? " recipe" : " recipes") + " — marked in the list.";
    }
  }

  raiz.addEventListener("click", function (e) {
    var item = e.target.closest("[data-rec-item]");
    if (item) {
      atual = R.find(function (r) { return r.id === item.dataset.recItem; }) || atual;
      desenhar();
      if (anuncio) anuncio.textContent = atual.nome + ": " + atual.padroes.length + " patterns, " + atual.padroes.join(", ") + ".";
      return;
    }
    var cartao = e.target.closest("[data-rec-padrao]");
    if (cartao) {
      padrao = padrao === cartao.dataset.recPadrao ? "" : cartao.dataset.recPadrao;
      desenhar();
      return;
    }
    if (e.target.closest("[data-rec-limpar]")) { padrao = ""; desenhar(); return; }
    var copiar = e.target.closest("[data-rec-copiar]");
    if (copiar) {
      var texto = atual.nome + ": " + atual.padroes.join(", ");
      var feito = function () {
        copiar.textContent = "Copied";
        setTimeout(function () { copiar.textContent = "Copy the list"; }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(texto).then(feito, function () {});
    }
  });

  // O filtro da lista: pelo nome, pelo que a receita cobre e pelo texto; o Esc limpa.
  var campo = q("[data-rec-filtro]");
  var campoInput = campo && (campo.matches("input") ? campo : campo.querySelector("input"));
  if (campoInput) {
    var filtrar = function () {
      var t = campoInput.value.trim().toLowerCase(), vistos = 0;
      todos("[data-rec-item]").forEach(function (b) {
        var r = R.find(function (x) { return x.id === b.dataset.recItem; });
        var mostra = !t || (r.nome + " " + r.foco.join(" ") + " " + r.texto).toLowerCase().indexOf(t) >= 0;
        b.hidden = !mostra;
        if (mostra) vistos++;
      });
      q("[data-rec-nada]").hidden = vistos > 0;
    };
    campoInput.addEventListener("input", filtrar);
    campoInput.addEventListener("keydown", function (e) { if (e.key === "Escape") { campoInput.value = ""; filtrar(); } });
  }
})();
