// A THEMING DO SITE B (02/11/2026): o laboratório põe os três atributos na prévia (tema, densidade e marca) e escreve a
// linha do html; os botões de marca do laboratório e os cartões das marcas são a mesma escolha. Sem este script, a prévia
// fica no claro, confortável, na Aurea Gold (como o desenho).
(() => {
  const pagina = document.querySelector('[data-gs-pagina="theming"]');
  if (!pagina) return;
  const previa = pagina.querySelector("[data-th-previa]");
  const estado = {tema: "light", densidade: "comfortable", marca: "gold"};
  // A altura do controle em cada densidade (o --control-h-md de cada uma), como a barra da prévia do desenho.
  const ALTURA = {compact: 32, comfortable: 36, spacious: 40};
  const nomeDa = id => "Aurea " + id.charAt(0).toUpperCase() + id.slice(1);
  const aplicar = () => {
    if (!previa) return;
    previa.dataset.theme = estado.tema;
    previa.dataset.density = estado.densidade;
    if (estado.marca === "gold") delete previa.dataset.brand; else previa.dataset.brand = estado.marca;
    previa.querySelector("[data-th-rotulo]").textContent = nomeDa(estado.marca) + " · " + estado.tema;
    previa.querySelector("[data-th-dens]").textContent = estado.densidade + " · control " + ALTURA[estado.densidade] + "px";
    const nota = previa.querySelector("[data-th-ember]");
    if (nota) nota.hidden = estado.marca !== "ember";
    const marca = estado.marca === "gold" ? "" : ' data-brand="' + estado.marca + '"';
    const linha = "<html" + marca + ' data-theme="' + estado.tema + '" data-density="' + estado.densidade + '">';
    pagina.querySelectorAll("[data-th-linha]").forEach(el => { el.textContent = linha; });
    pagina.querySelectorAll("[data-th-copiar]").forEach(el => { el.dataset.copiar = linha; });
    document.querySelectorAll("[data-th-curto]").forEach(el => {
      el.textContent = estado.marca === "gold" ? 'data-theme="' + estado.tema + '"' : 'data-brand="' + estado.marca + '"';
    });
    pagina.querySelectorAll("[data-th-marca]").forEach(b => {
      const sim = b.dataset.thMarca === estado.marca;
      b.setAttribute("aria-pressed", sim ? "true" : "false");
      b.toggleAttribute("data-pressed", sim);
    });
    const radio = pagina.querySelector('input[name="th-marca"][value="' + estado.marca + '"]');
    if (radio && !radio.checked) radio.checked = true;
  };
  pagina.addEventListener("gs-chave", e => {
    if (e.detail.nome === "th-tema") estado.tema = e.detail.valor;
    else if (e.detail.nome === "th-densidade") estado.densidade = e.detail.valor;
    else return;
    aplicar();
  });
  pagina.addEventListener("click", e => {
    const botao = e.target.closest("[data-th-marca]");
    if (!botao) return;
    estado.marca = botao.dataset.thMarca;
    aplicar();
  });
  pagina.addEventListener("change", e => {
    if (e.target.name !== "th-marca") return;
    estado.marca = e.target.value;
    aplicar();
  });
  aplicar();
})();
