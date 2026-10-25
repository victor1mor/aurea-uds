// O IDIOMA DA MONTAGEM (25/10/2026). O nativo escreve data e número no idioma do APARELHO: sem `locale`, o
// `toLocaleDateString()`, o `toLocaleTimeString()` e o `Intl.NumberFormat` usam o padrão do sistema — no celular, o certo.
// Na montagem do site, o "aparelho" é o computador que monta: o Windows do Victor (pt-BR) desenhava "23/10/2026" e "2.026",
// a CI (en-US) "10/23/2026" e "2,026", e a trava "dist desatualizado" da `build` reprovou as páginas do DatePicker e do
// NumberField. O site é em inglês: durante o desenho do nativo, quem não diz o idioma recebe o "en-US". Quem diz (o
// `locale="pt-BR"` de um exemplo) continua com o seu. Só a montagem — a peça não muda, e a parte viva usa o do navegador.
//
// ⚠ Este módulo é o PRIMEIRO import do `ssr.mjs`: os imports rodam na ordem, e o idioma tem de estar fixo antes de
// qualquer desenho.
const IDIOMA = "en-US";

for (const nome of ["toLocaleString", "toLocaleDateString", "toLocaleTimeString"]) {
  const original = Date.prototype[nome];
  Date.prototype[nome] = function (locale, opcoes) { return original.call(this, locale ?? IDIOMA, opcoes); };
}
const numeroOriginal = Number.prototype.toLocaleString;
Number.prototype.toLocaleString = function (locale, opcoes) { return numeroOriginal.call(this, locale ?? IDIOMA, opcoes); };

// Função, e não `class extends`: o `Intl.NumberFormat()` sem `new` também vale, e o protótipo é o mesmo (o `instanceof`
// continua dando certo).
for (const nome of ["NumberFormat", "DateTimeFormat"]) {
  const Original = Intl[nome];
  function Fixo(locale, opcoes) { return new Original(locale ?? IDIOMA, opcoes); }
  Fixo.prototype = Original.prototype;
  Fixo.supportedLocalesOf = Original.supportedLocalesOf.bind(Original);
  Intl[nome] = Fixo;
}
