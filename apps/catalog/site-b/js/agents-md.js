// A PÁGINA "AGENTS.md" DO SITE B (02/11/2026, o grupo 5): as duas perguntas montam o comando (o "Copy" copia o que está
// escrito) e a pasta antes e depois dele. Só age na página que tem o comando.
(function () {
  var caixa = document.querySelector("[data-agents-comando]");
  if (!caixa) return;
  var modo = document.querySelector('[data-g5-chave="agents-modo"]');
  var nome = document.querySelector('[data-g5-chave="agents-nome"]');
  var antes = document.querySelector("[data-agents-antes]");
  var depois = document.querySelector("[data-agents-depois]");
  var estado = {modo: "new", nome: "AGENTS.md"};

  function linha(texto, nota, nova) {
    var li = document.createElement("li");
    if (nova) li.className = "agents-pasta-nova";
    var code = document.createElement("code");
    code.textContent = texto;
    li.appendChild(code);
    if (nota) { var s = document.createElement("small"); s.textContent = nota; li.appendChild(s); }
    return li;
  }
  function desenhar() {
    var somar = estado.modo === "append";
    var codigo = caixa.querySelector("pre code");
    if (codigo) codigo.textContent = caixa.getAttribute("data-base") + (somar ? " >> " : " -o ") + estado.nome;
    antes.replaceChildren.apply(antes, somar ? [linha("package.json"), linha(estado.nome, "your rules")] : [linha("package.json"), linha("src/")]);
    depois.replaceChildren.apply(depois, somar
      ? [linha("package.json"), linha(estado.nome, "your rules + the Aurea rules at the end", true)]
      : [linha("package.json"), linha("src/"), linha(estado.nome, "new · the Aurea rules", true)]);
  }
  function chave(grupo, campo) {
    if (!grupo) return;
    grupo.addEventListener("click", function (e) {
      var botao = e.target.closest("button[data-valor]");
      if (!botao) return;
      grupo.querySelectorAll("button[data-valor]").forEach(function (b) {
        var sim = b === botao;
        b.classList.toggle("active", sim);
        b.setAttribute("aria-pressed", sim ? "true" : "false");
      });
      estado[campo] = botao.getAttribute("data-valor");
      desenhar();
    });
  }
  chave(modo, "modo");
  chave(nome, "nome");
})();
