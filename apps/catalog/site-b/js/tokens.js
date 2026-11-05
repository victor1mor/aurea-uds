// A PÁGINA "TOKENS" DO SITE B: o valor de cada token lido do CSS na hora (no tema de "Values for"), copiar ao apertar, achar
// pelo nome, a densidade das alturas e o "Play" do movimento. Só age na página dela (o `[data-tokens]`).
(function () {
  var raiz = document.querySelector("[data-tokens]");
  if (!raiz) return;
  var escopo = raiz.querySelector("[data-tk-escopo]");
  var estado = raiz.querySelector("[data-tk-estado]");
  var todos = function (s, de) { return Array.prototype.slice.call((de || raiz).querySelectorAll(s)); };

  // O valor: o que o CSS resolve para a variável, no elemento (o tema e a densidade do escopo valem).
  function valores() {
    todos("[data-tk-valor]").forEach(function (v) {
      var nome = v.dataset.tkValor;
      var css = getComputedStyle(v).getPropertyValue("--" + nome).trim();
      v.textContent = css.replace(/\s+/g, " ");
    });
  }

  // "Values for": o tema das amostras, sem trocar o da página. Abre no tema da página.
  function tema(t) {
    escopo.setAttribute("data-theme", t);
    todos("[data-tk-tema]").forEach(function (b) { var on = b.dataset.tkTema === t; b.setAttribute("aria-pressed", on ? "true" : "false"); b.classList.toggle("active", on); });
    valores();
  }
  // Até alguém escolher, as amostras seguem o tema da página (e a troca dele).
  var escolhido = false;
  var daPagina = function () { return document.documentElement.dataset.theme === "light" ? "light" : "dark"; };
  tema(daPagina());
  new MutationObserver(function () { if (!escolhido) tema(daPagina()); })
    .observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});

  raiz.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b || !raiz.contains(b)) return;
    if (b.dataset.tkTema) { escolhido = true; tema(b.dataset.tkTema); return; }
    if (b.dataset.tkDensidade) {
      raiz.querySelector("[data-tk-densidade-escopo]").setAttribute("data-density", b.dataset.tkDensidade);
      todos("[data-tk-densidade]").forEach(function (x) { var on = x === b; x.setAttribute("aria-pressed", on ? "true" : "false"); x.classList.toggle("active", on); });
      valores();
      return;
    }
    if (b.dataset.tkPlay) {
      var bola = raiz.querySelector('[data-tk-mov="' + b.dataset.tkPlay + '"]');
      var nome = b.dataset.tkPlay;
      var ehTempo = nome.indexOf("duration") === 0;
      bola.style.transition = "none";
      bola.classList.remove("tk-bola-fim");
      void bola.offsetWidth;
      bola.style.transition = "inset-inline-start " + (ehTempo ? "var(--" + nome + ")" : "var(--duration-slow)") + " " + (ehTempo ? "var(--ease-standard)" : "var(--" + nome + ")");
      bola.classList.add("tk-bola-fim");
      return;
    }
    if (b.hasAttribute("data-tk-limpar")) { var campo = busca(); if (campo) { campo.value = ""; achar(); campo.focus(); } return; }
    var texto = b.dataset.tk ? "var(--" + b.dataset.tk + ")" : b.dataset.tkCopia;
    if (!texto) return;
    var feito = function () { estado.textContent = "Copied " + texto; };
    if (navigator.clipboard) navigator.clipboard.writeText(texto).then(feito, function () { estado.textContent = texto; });
    else estado.textContent = texto;
  });

  // Achar pelo nome: some o que não casa, e a parte que ficou vazia; nada casou, o vazio com o "Clear the search".
  // E O FILTRO DA LATERAL ("By $type", S-01, 05/11/2026): só os tokens do `$type` escolhido (`data-tk-tipo`), junto da busca.
  var filtro = "all";
  function busca() { var c = raiz.querySelector("[data-tk-busca]"); return c && (c.matches("input") ? c : c.querySelector("input")); }
  function achar() {
    var t = (busca().value || "").trim().toLowerCase(), achados = 0;
    var itens = todos("[data-tk], [data-tk-copia]").filter(function (el) { return !el.closest(".tk-ferramentas"); });
    itens.forEach(function (el) {
      var nome = (el.dataset.tk || el.dataset.tkCopia || "") + " " + el.textContent;
      var mostra = (!t || nome.toLowerCase().indexOf(t) >= 0) && (filtro === "all" || el.dataset.tkTipo === filtro);
      var alvo = el.closest(".tk-mov") || el;
      alvo.hidden = !mostra;
      if (mostra) achados++;
    });
    todos("[data-tk-sec]").forEach(function (s) {
      s.hidden = (!!t || filtro !== "all") && !todos("[data-tk], [data-tk-copia]", s).some(function (el) { return !(el.closest(".tk-mov") || el).hidden; });
    });
    var vazio = raiz.querySelector("[data-tk-vazio]");
    vazio.hidden = achados > 0;
    if (!achados) raiz.querySelector("[data-tk-vazio-titulo]").textContent = t ? "No token called “" + t + "”" : "No " + filtro + " token";
    var tipo = filtro === "all" ? "" : " of $type " + filtro;
    estado.textContent = t ? achados + (achados === 1 ? " token" : " tokens") + tipo + " match “" + t + "”."
      : filtro !== "all" ? achados + (achados === 1 ? " token" : " tokens") + tipo + "." : "Press any token to copy it.";
  }
  document.addEventListener("site-filtro", function (e) { filtro = e.detail || "all"; achar(); });
  var doEndereco = /^#filtro\/(.+)$/.exec(location.hash);
  if (doEndereco) { filtro = decodeURIComponent(doEndereco[1]); achar(); }
  var campo = busca();
  if (campo) {
    campo.addEventListener("input", achar);
    campo.addEventListener("keydown", function (e) { if (e.key === "Escape") { campo.value = ""; achar(); } });
  }
})();
