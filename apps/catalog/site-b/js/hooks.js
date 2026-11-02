// A PÁGINA "HOOKS" DO SITE B: o "Try it" de cada hook. O aviso e o tema passam pela ponte do site (o evento `site-hook`,
// no `live/site.tsx`), que chama o `useToast` e o `useAureaTheme` de verdade; a lateral, o dicionário e o sprite são
// demonstrações paradas que este arquivo troca. Só age na página dela (o `[data-hooks]`).
(function () {
  var raiz = document.querySelector("[data-hooks]");
  if (!raiz) return;
  var ponte = function (d) { document.dispatchEvent(new CustomEvent("site-hook", {detail: d})); };
  var q = function (s) { return raiz.querySelector(s); };
  var AVISOS = {
    success: {title: "Saved", description: "Two files uploaded.", type: "success"},
    info: {title: "Heads up", description: "A new version is available.", type: "info"},
    warning: {title: "Almost full", description: "You have used 90% of the space.", type: "warning"},
    danger: {title: "Could not save", description: "The connection dropped. Try again.", type: "danger"}
  };
  var marcar = function (botoes, escolhido) {
    botoes.forEach(function (b) { var on = b === escolhido; b.setAttribute("aria-pressed", on ? "true" : "false"); b.classList.toggle("active", on); });
  };

  // A lateral da demonstração: as duas formas (aberta e recolhida) são a `Sidebar` de verdade; o botão troca uma pela outra.
  var recolhida = false;
  var lateral = function (fechar) {
    recolhida = fechar;
    q('[data-hk-lateral="aberta"]').hidden = recolhida;
    q('[data-hk-lateral="fechada"]').hidden = !recolhida;
    q("[data-hk-lateral-estado]").textContent = "sidebar.collapsed   // " + recolhida + "\nsidebar.collapsible // \"icon\"";
  };

  // O tema e a densidade: lidos do <html>, que é quem o `useAureaTheme` escreve.
  var estadoDoTema = function () {
    var alvo = q("[data-hk-tema-estado]");
    if (!alvo) return;
    var html = document.documentElement;
    alvo.textContent = "theme   // \"" + (html.dataset.theme || "dark") + "\"\ndensity // \"" + (html.dataset.density || "comfortable") + "\"";
    var botoes = Array.prototype.slice.call(raiz.querySelectorAll("[data-hk-densidade]"));
    marcar(botoes, botoes.find(function (b) { return b.dataset.hkDensidade === (html.dataset.density || "comfortable"); }));
  };
  new MutationObserver(estadoDoTema).observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme", "data-density"]});
  estadoDoTema();

  raiz.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.hkAviso) {
      if (b.dataset.hkAviso === "promise") ponte({promise: {loading: "Uploading…", success: "Uploaded", error: "Upload failed"}});
      else ponte({toast: AVISOS[b.dataset.hkAviso]});
    } else if (b.hasAttribute("data-hk-lateral-foco")) lateral(true);
    else if (b.hasAttribute("data-hk-lateral-alterna")) lateral(!recolhida);
    else if (b.hasAttribute("data-hk-tema")) ponte({toggleTheme: true});
    else if (b.dataset.hkDensidade) ponte({density: b.dataset.hkDensidade});
    else if (b.dataset.hkSprite) {
      marcar(Array.prototype.slice.call(raiz.querySelectorAll("[data-hk-sprite]")), b);
      var u = b.dataset.hkSprite;
      q("[data-hk-sprite-uso]").textContent = "<Icon name=\"plus\"/> draws\n<use href=\"" + u + "#plus\"/>";
      q("[data-hk-sprite-valor]").textContent = "useSpriteUrl()  // \"" + u + "\"";
    }
  });

  // O dicionário: a frase escrita no campo é a que a lista vazia diz.
  var frase = q("[data-hk-frase]");
  if (frase) frase.addEventListener("input", function () {
    var t = frase.value || "No results";
    q("[data-hk-frase-mostra]").textContent = t;
    q("[data-hk-frase-codigo]").textContent = "<AureaProvider strings={{comboboxEmpty: " + JSON.stringify(t) + "}}>";
  });
})();
