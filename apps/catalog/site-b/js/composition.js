// COMPOSITION (site B): as partes do cartão, a área do `AppShell` e a categoria de importar.
(function () {
  var D = window.AureaDocsB;
  var montador = document.querySelector(".composition-montador");
  if (!D || !montador) return;

  // As partes: cada `Toggle` liga ou desliga uma parte do cartão de verdade, e o código ao lado acompanha.
  var cartao = montador.querySelector(".composition-cartao");
  var codigo = montador.querySelector(".composition-codigo code");
  var grupo = montador.querySelector(".toggle-group");
  var ORDEM = ["media", "header", "title", "desc", "content", "footer"];
  function partes() {
    var on = {};
    grupo.querySelectorAll("button").forEach(function (b, i) { on[ORDEM[i]] = b.getAttribute("aria-pressed") === "true"; });
    return on;
  }
  function montar() {
    var c = partes();
    var cabeca = c.header && (c.title || c.desc);
    var mostra = {media: c.media, header: cabeca, title: c.title, desc: c.desc, content: c.content, footer: c.footer};
    mostra.none = !c.media && !cabeca && !c.content && !c.footer;
    var CLASSE = {media: ".card-media", header: ".card-header", title: ".card-title", desc: ".card-description", content: ".card-content",
      footer: ".card-footer", none: ".composition-vazio"};
    Object.keys(mostra).forEach(function (k) {
      var el = cartao.querySelector(CLASSE[k]);
      if (el) el.hidden = !mostra[k];
    });
    var l = ["<Card>"];
    if (c.media) l.push("  <Card.Media>…</Card.Media>");
    if (cabeca) {
      l.push("  <Card.Header>");
      if (c.title) l.push("    <Card.Title>Weekly report</Card.Title>");
      if (c.desc) l.push("    <Card.Description>Sent every Monday at 9:00.</Card.Description>");
      l.push("  </Card.Header>");
    }
    if (c.content) l.push("  <Card.Content>12 people receive it.</Card.Content>");
    if (c.footer) l.push("  <Card.Footer>", "    <Button variant=\"primary\">Edit</Button>", "    <Button>Pause</Button>", "  </Card.Footer>");
    l.push("</Card>");
    if (codigo) codigo.textContent = l.join("\n");
  }
  D.grupoDeBotoes(grupo, montar, false);
  montar();

  // As áreas do `AppShell`: uma escolhida por vez; o painel diz o nome e para que serve.
  var moldura = document.querySelector(".composition-moldura");
  var nome = document.querySelector(".composition-info-nome");
  var frase = document.querySelector(".composition-info-frase");
  if (moldura) D.grupoDeBotoes(moldura, function (ligados) {
    var area = ligados[0] && ligados[0].textContent;
    var texto = area && document.querySelector(".composition-info [data-area='" + area + "']");
    if (area && nome) nome.textContent = area;
    if (texto && frase) frase.textContent = texto.textContent;
  }, true);

  // As categorias: uma por vez; o código mostra a linha de importar dela.
  var categorias = document.querySelector(".composition-categorias .toggle-group");
  var importar = document.querySelector(".composition-importar code");
  var EXEMPLO = {actions: "{Button, IconButton}", inputs: "{Input, Select}"};
  if (categorias && importar) D.grupoDeBotoes(categorias, function (ligados) {
    var c = ligados[0] && ligados[0].textContent;
    if (c) importar.textContent = "import " + (EXEMPLO[c] || "{/* … */}") + " from \"@aurea-uds/react/" + c + "\";";
  }, true);
})();
