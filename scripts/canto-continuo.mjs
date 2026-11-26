// O CANTO CONTÍNUO NA WEB (HER-01 na web, lote 106, 26/11/2026). O nativo tem o canto do iPhone desde a 0.20.0
// (`borderCurve: "continuous"`, no `canto()` do `estilos.ts`); a web ganha o mesmo onde o navegador desenha o
// `corner-shape`. Onde não desenha, nada muda: o canto redondo de sempre.
//
// A FORMA, aprovada pelo Victor na bancada viva de 26/11/2026 ("Aprovo os cinco", a forma "do tamanho do iPhone"):
// com o MESMO raio, o `squircle` parece menor que o canto redondo (medido na bancada de 24/11/2026). O canto do iPhone de
// raio r começa a curva a 1,53 × r da quina e passa, na diagonal, a 0,30 × r dela. A curva `superellipse(1.65)` com o
// raio 1,5 × r passa nos dois pontos — por isso o raio sobe 50% junto com a curva, e só aqui, onde ela é desenhada.
//
// A CÁPSULA E O CÍRCULO FICAM REDONDOS. Com o canto contínuo, a cápsula fica quadrada nas pontas (medido na bancada); no
// iPhone ela continua redonda. Regra cujo raio é cápsula (`--radius-control`, `--radius-full`, 999px, 50%) ganha
// `corner-shape: round`, e a que herda o raio do pai (`inherit`) herda também a forma.
//
// COMO, na montagem: cada regra que escreve um raio ganha, LOGO DEPOIS dela, uma cópia com o mesmo seletor dentro de
// `@supports (corner-shape: superellipse(2))`, com a forma e o raio novo. O peso é o mesmo e a ordem também: a forma segue
// exatamente a cascata do raio, e quem já sobrepõe um raio sobrepõe também a forma. A fonte (`aurea.css`) continua escrita
// só com `border-radius` — quem escreve uma regra de canto não precisa lembrar da cópia. Os TOKENS não mudam: o CSS do
// app que usa `--radius-card` nas próprias caixas fica como está.

export const SUPORTE = "@supports (corner-shape: superellipse(2))";
export const FORMA = "superellipse(1.65)";
export const ESCALA_DO_RAIO = 1.5;

const RAIO = /^border(?:-[a-z]+)*-radius$/;
const CAPSULA = /--radius-control|--radius-full|--btn-group-[vh]|\b999+px|\b50%/;

// Divide no nível de fora (fora de parênteses), por um caractere.
function dividir(texto, sep) {
  const partes = [];
  let prof = 0, ini = 0;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (c === "(") prof++;
    else if (c === ")") prof--;
    else if (c === sep && prof === 0) { partes.push(texto.slice(ini, i)); ini = i + 1; }
  }
  partes.push(texto.slice(ini));
  return partes;
}

// O raio novo: cada pedaço do valor vezes 1,5. O zero fica zero (`calc(0 * 1.5)` seria um número, e não uma medida).
function escalar(valor) {
  const importante = /\s*!important\s*$/.exec(valor);
  const v = importante ? valor.slice(0, importante.index) : valor;
  const pedacos = dividir(v.trim().replace(/\s+/g, " "), " ").filter(Boolean);
  const novo = pedacos.map((p) => (/^0(px)?$/.test(p) ? p : `calc(${p} * ${ESCALA_DO_RAIO})`)).join(" ");
  return novo + (importante ? " !important" : "");
}

// A cópia de uma regra, ou "" quando ela não escreve raio.
function copia(seletor, corpo) {
  const decls = dividir(corpo, ";").map((d) => {
    const i = d.indexOf(":");
    return i < 0 ? null : {prop: d.slice(0, i).trim(), valor: d.slice(i + 1).trim()};
  }).filter((d) => d && RAIO.test(d.prop));
  if (!decls.length) return "";
  const valores = decls.map((d) => d.valor.replace(/\s*!important\s*$/, ""));
  if (valores.every((v) => /^(0(px)?|none|unset|initial|revert)$/.test(v))) return "";
  const forte = decls.some((d) => /!important\s*$/.test(d.valor)) ? " !important" : "";
  let dentro;
  if (valores.some((v) => CAPSULA.test(v))) dentro = `corner-shape:round${forte}`;
  else if (valores.every((v) => v === "inherit")) dentro = `corner-shape:inherit${forte}`;
  else dentro = `corner-shape:${FORMA}${forte};` + decls.map((d) => `${d.prop}:${d.valor === "inherit" ? d.valor : escalar(d.valor)}`).join(";");
  return `${SUPORTE}{${seletor.trim()}{${dentro}}}`;
}

// Anda na folha: os blocos de regra ganham a cópia logo depois; os de `@media`, `@supports`, `@container` e `@layer`
// são percorridos por dentro; os outros (`@keyframes`, `@font-face`, `@property`) ficam como estão. Comentário e texto
// entre aspas não contam chave.
export function cantoContinuo(css) {
  let saida = "", i = 0;
  const n = css.length;
  // Lê até a próxima `{` ou `;` ou `}` do nível, pulando comentário e aspas.
  const ate = (de, alvos) => {
    let j = de;
    while (j < n) {
      if (css.startsWith("/*", j)) { const f = css.indexOf("*/", j + 2); j = f < 0 ? n : f + 2; continue; }
      const c = css[j];
      if (c === '"' || c === "'") { const f = css.indexOf(c, j + 1); j = f < 0 ? n : f + 1; continue; }
      if (alvos.includes(c)) return j;
      j++;
    }
    return n;
  };
  const fechaBloco = (de) => {
    let prof = 1, j = de;
    while (j < n && prof > 0) {
      const k = ate(j, "{}");
      if (k >= n) return n;
      prof += css[k] === "{" ? 1 : -1;
      j = k + 1;
    }
    return j;
  };
  const andar = (fim) => {
    while (i < fim) {
      const k = ate(i, "{};");
      if (k >= fim) { saida += css.slice(i, fim); i = fim; return; }
      if (css[k] === ";" || css[k] === "}") { saida += css.slice(i, k + 1); i = k + 1; continue; }
      const prelude = css.slice(i, k);
      const limpo = prelude.replace(/\/\*[\s\S]*?\*\//g, "").trim();
      const fecha = fechaBloco(k + 1);
      if (/^@(media|supports|container|layer)\b/.test(limpo)) {
        saida += css.slice(i, k + 1);
        i = k + 1;
        andar(fecha - 1);
        saida += "}";
        i = fecha;
      } else if (limpo.startsWith("@")) {
        saida += css.slice(i, fecha);
        i = fecha;
      } else {
        saida += css.slice(i, fecha) + copia(limpo, css.slice(k + 1, fecha - 1));
        i = fecha;
      }
    }
  };
  andar(n);
  return saida;
}
