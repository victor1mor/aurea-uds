// Aurea — alvo NATIVO das fontes. GERADO por packages/fonts/build-fonts.mjs. NÃO EDITAR.
//
// Lote 0 do NATIVE.md (§5.2.1). O React Native não lê woff2, então o alvo web não atravessa:
// estes são os MESMOS estilos da web, em .ttf estático.
//
// ⚠ NÃO use `fontWeight` para escolher o peso. MEDIDO na tabela `name` de cada arquivo:
// só Regular, Italic e Bold moram na família "Atkinson Hyperlegible Next" — o Medium está em
// "Atkinson Hyperlegible Next Medium" e o SemiBold em "… SemiBold", cada um uma FAMÍLIA PRÓPRIA.
// É o formato RIBBI, e vale para as duas famílias (era assim também na IBM Plex). Pedir a família
// + `fontWeight:"600"` devolve o Regular sintetizado, não o SemiBold desenhado.
//
// A forma correta é uma só: `fontFamily` recebe o NOME POSTSCRIPT, que é a chave deste mapa.
// O `FONT_FAMILIES` abaixo faz essa tradução por papel de tipografia e peso.
//
//   import {AUREA_FONTS, FONT_FAMILIES} from "@aurea-uds/fonts/native";
//   const [pronto] = useFonts(AUREA_FONTS);              // expo-font
//   <Text style={{fontFamily: FONT_FAMILIES.ui["600"]}}> // "AtkinsonHyperlegibleNext-SemiBold"
//
// Glifos: estes .ttf são COMPLETOS, enquanto o alvo web serve o subset `latin`. Mesma origem
// de desenho (as fontes variáveis do Google Fonts, um peso fixo por arquivo), tamanhos diferentes
// — no nativo a fonte é asset local do bundle, não transferência de rede por página.

// nome PostScript -> asset. É o formato que o `useFonts` do expo-font recebe.
const AUREA_FONTS = {
  "AtkinsonHyperlegibleNext-Regular": require("../files-native/atkinson-hyperlegible-next-400-normal.ttf"),
  "AtkinsonHyperlegibleNext-Italic": require("../files-native/atkinson-hyperlegible-next-400-italic.ttf"),
  "AtkinsonHyperlegibleNext-Medium": require("../files-native/atkinson-hyperlegible-next-500-normal.ttf"),
  "AtkinsonHyperlegibleNext-SemiBold": require("../files-native/atkinson-hyperlegible-next-600-normal.ttf"),
  "AtkinsonHyperlegibleNext-Bold": require("../files-native/atkinson-hyperlegible-next-700-normal.ttf"),
  "AtkinsonHyperlegibleMono-Regular": require("../files-native/atkinson-hyperlegible-mono-400-normal.ttf"),
  "AtkinsonHyperlegibleMono-Medium": require("../files-native/atkinson-hyperlegible-mono-500-normal.ttf"),
  "AtkinsonHyperlegibleMono-SemiBold": require("../files-native/atkinson-hyperlegible-mono-600-normal.ttf"),
};

// papel de tipografia -> peso -> nome PostScript. O sufixo `i` é o itálico.
const FONT_FAMILIES = {
  "ui": {
    "400": "AtkinsonHyperlegibleNext-Regular",
    "500": "AtkinsonHyperlegibleNext-Medium",
    "600": "AtkinsonHyperlegibleNext-SemiBold",
    "700": "AtkinsonHyperlegibleNext-Bold",
    "400i": "AtkinsonHyperlegibleNext-Italic"
  },
  "code": {
    "400": "AtkinsonHyperlegibleMono-Regular",
    "500": "AtkinsonHyperlegibleMono-Medium",
    "600": "AtkinsonHyperlegibleMono-SemiBold"
  },
  "editorial": {
    "400": "AtkinsonHyperlegibleNext-Regular",
    "500": "AtkinsonHyperlegibleNext-Medium",
    "600": "AtkinsonHyperlegibleNext-SemiBold",
    "700": "AtkinsonHyperlegibleNext-Bold"
  }
};

// O que foi medido em cada arquivo, para quem precisa do resto (o Android acha a fonte
// pelo nome do arquivo, e algumas ferramentas de build pedem a família tipográfica).
const AUREA_FONT_FILES = [
  {
    "file": "atkinson-hyperlegible-next-400-normal.ttf",
    "postScriptName": "AtkinsonHyperlegibleNext-Regular",
    "family": "Atkinson Hyperlegible Next",
    "typographicFamily": "Atkinson Hyperlegible Next",
    "role": "ui",
    "weight": 400,
    "style": "normal"
  },
  {
    "file": "atkinson-hyperlegible-next-400-italic.ttf",
    "postScriptName": "AtkinsonHyperlegibleNext-Italic",
    "family": "Atkinson Hyperlegible Next",
    "typographicFamily": "Atkinson Hyperlegible Next",
    "role": "ui",
    "weight": 400,
    "style": "italic"
  },
  {
    "file": "atkinson-hyperlegible-next-500-normal.ttf",
    "postScriptName": "AtkinsonHyperlegibleNext-Medium",
    "family": "Atkinson Hyperlegible Next Medium",
    "typographicFamily": "Atkinson Hyperlegible Next",
    "role": "ui",
    "weight": 500,
    "style": "normal"
  },
  {
    "file": "atkinson-hyperlegible-next-600-normal.ttf",
    "postScriptName": "AtkinsonHyperlegibleNext-SemiBold",
    "family": "Atkinson Hyperlegible Next SemiBold",
    "typographicFamily": "Atkinson Hyperlegible Next",
    "role": "ui",
    "weight": 600,
    "style": "normal"
  },
  {
    "file": "atkinson-hyperlegible-next-700-normal.ttf",
    "postScriptName": "AtkinsonHyperlegibleNext-Bold",
    "family": "Atkinson Hyperlegible Next",
    "typographicFamily": "Atkinson Hyperlegible Next",
    "role": "ui",
    "weight": 700,
    "style": "normal"
  },
  {
    "file": "atkinson-hyperlegible-mono-400-normal.ttf",
    "postScriptName": "AtkinsonHyperlegibleMono-Regular",
    "family": "Atkinson Hyperlegible Mono",
    "typographicFamily": "Atkinson Hyperlegible Mono",
    "role": "code",
    "weight": 400,
    "style": "normal"
  },
  {
    "file": "atkinson-hyperlegible-mono-500-normal.ttf",
    "postScriptName": "AtkinsonHyperlegibleMono-Medium",
    "family": "Atkinson Hyperlegible Mono Medium",
    "typographicFamily": "Atkinson Hyperlegible Mono",
    "role": "code",
    "weight": 500,
    "style": "normal"
  },
  {
    "file": "atkinson-hyperlegible-mono-600-normal.ttf",
    "postScriptName": "AtkinsonHyperlegibleMono-SemiBold",
    "family": "Atkinson Hyperlegible Mono SemiBold",
    "typographicFamily": "Atkinson Hyperlegible Mono",
    "role": "code",
    "weight": 600,
    "style": "normal"
  }
];

module.exports = {AUREA_FONTS, FONT_FAMILIES, AUREA_FONT_FILES};
