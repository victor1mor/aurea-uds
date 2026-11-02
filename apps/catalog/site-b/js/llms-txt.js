// A PÁGINA "LLMs.txt" DO SITE B (02/11/2026, o grupo 5): o arquivo escolhido mostra o começo dele; a página escolhida
// troca o endereço; o jeito de ler troca a resposta. E os TAMANHOS: a página publicada lê os três arquivos e escreve o
// tamanho de cada um (o do llms-full.txt só existe depois de montadas as páginas). Só age na página que tem os cartões.
(function () {
  var cartoes = document.querySelector("[data-llms-arquivos]");
  if (!cartoes) return;

  function mostrar(atributo, valor) {
    document.querySelectorAll("[" + atributo + "]").forEach(function (el) {
      if (el.tagName === "BUTTON" || el.tagName === "SPAN") return;
      el.hidden = el.getAttribute(atributo) !== valor;
    });
  }
  cartoes.addEventListener("change", function (e) {
    if (e.target && e.target.type === "radio") mostrar("data-llms-espiada", e.target.value);
  });

  // Os botões de ligar (as páginas, o jeito de ler): um ligado por vez.
  function ligar(grupo, botao) {
    grupo.querySelectorAll("button[data-valor]").forEach(function (b) {
      var sim = b === botao;
      b.setAttribute("aria-pressed", sim ? "true" : "false");
      b.classList.toggle("active", sim && grupo.classList.contains("segmented"));
      if (sim) b.setAttribute("data-pressed", ""); else b.removeAttribute("data-pressed");
    });
  }
  var paginas = document.querySelector("[data-llms-paginas]");
  if (paginas) paginas.addEventListener("click", function (e) {
    var botao = e.target.closest("button[data-valor]");
    if (!botao) return;
    ligar(paginas, botao);
    document.querySelectorAll("[data-llms-pagina]").forEach(function (s) { s.textContent = botao.getAttribute("data-valor"); });
  });
  var uso = document.querySelector('[data-g5-chave="llms-uso"]');
  if (uso) uso.addEventListener("click", function (e) {
    var botao = e.target.closest("button[data-valor]");
    if (!botao) return;
    ligar(uso, botao);
    mostrar("data-llms-uso", botao.getAttribute("data-valor"));
  });

  // Os tamanhos, lidos dos arquivos de verdade (KB de 1000 bytes e as linhas, como a montagem conta).
  if (location.protocol === "file:" || !window.fetch) return;
  var nomes = {llms: "llms.txt", full: "llms-full.txt", agents: "aurea-agents.md"};
  Object.keys(nomes).forEach(function (chave) {
    fetch(new URL("./" + nomes[chave], location.href).href).then(function (r) { return r.ok ? r.text() : null; }).then(function (texto) {
      if (texto == null) return;
      var bytes = new TextEncoder().encode(texto).length, k = bytes / 1000;
      var linhas = texto.replace(/\n$/, "").split("\n").length;
      var rotulo = (k < 10 ? k.toFixed(1) : Math.round(k)) + " KB · " + linhas.toLocaleString("en-US") + " lines";
      document.querySelectorAll('[data-llms-tamanho="' + chave + '"]').forEach(function (el) { el.textContent = rotulo; });
    }, function () {});
  });
})();
