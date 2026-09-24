// Aurea — alvo NATIVO das fontes. GERADO por packages/fonts/build-fonts.mjs. NÃO EDITAR.
//
// Lote 0 do NATIVE.md (§5.2.1). O React Native não lê woff2, então o alvo web não atravessa:
// estes são os MESMOS 11 estilos da web, em .ttf estático.
//
// ⚠ NÃO use `fontWeight` para escolher o peso. MEDIDO na tabela `name` de cada arquivo:
// só Regular, Italic e Bold moram na família "IBM Plex Sans" — o Medium está em "IBM Plex Sans
// Medium" e o SemiBold em "IBM Plex Sans SemiBold", cada um uma FAMÍLIA PRÓPRIA. É o formato
// RIBBI, e vale para as três famílias. Pedir `fontFamily:"IBM Plex Sans"` + `fontWeight:"600"`
// devolve o Regular sintetizado, não o SemiBold desenhado.
//
// A forma correta é uma só: `fontFamily` recebe o NOME POSTSCRIPT, que é a chave deste mapa.
// O `FONT_FAMILIES` abaixo faz essa tradução por papel de tipografia e peso.
//
//   import {AUREA_FONTS, FONT_FAMILIES} from "@aurea-uds/fonts/native";
//   const [pronto] = useFonts(AUREA_FONTS);              // expo-font
//   <Text style={{fontFamily: FONT_FAMILIES.ui["600"]}}> // "IBMPlexSans-SemiBold"
//
// Glifos: estes .ttf são COMPLETOS, enquanto o alvo web serve o subset `latin`. Mesma origem
// de desenho (medido: o woff2 do repositório é byte a byte o `latin` do fontsource, e os dois
// vêm do Google Fonts), tamanhos diferentes — no nativo a fonte é asset local do bundle, não
// transferência de rede por página.

// nome PostScript -> asset. É o formato que o `useFonts` do expo-font recebe.
const AUREA_FONTS = {
  "IBMPlexSans-Regular": require("../files-native/ibm-plex-sans-400-normal.ttf"),
  "IBMPlexSans-Italic": require("../files-native/ibm-plex-sans-400-italic.ttf"),
  "IBMPlexSans-Medium": require("../files-native/ibm-plex-sans-500-normal.ttf"),
  "IBMPlexSans-SemiBold": require("../files-native/ibm-plex-sans-600-normal.ttf"),
  "IBMPlexSans-Bold": require("../files-native/ibm-plex-sans-700-normal.ttf"),
  "IBMPlexSerif-Medium": require("../files-native/ibm-plex-serif-500-normal.ttf"),
  "IBMPlexSerif-SemiBold": require("../files-native/ibm-plex-serif-600-normal.ttf"),
  "IBMPlexSerif-Bold": require("../files-native/ibm-plex-serif-700-normal.ttf"),
  "IBMPlexMono-Regular": require("../files-native/ibm-plex-mono-400-normal.ttf"),
  "IBMPlexMono-Medium": require("../files-native/ibm-plex-mono-500-normal.ttf"),
  "IBMPlexMono-SemiBold": require("../files-native/ibm-plex-mono-600-normal.ttf"),
};

// papel de tipografia -> peso -> nome PostScript. O sufixo `i` é o itálico.
const FONT_FAMILIES = {
  "ui": {
    "400": "IBMPlexSans-Regular",
    "500": "IBMPlexSans-Medium",
    "600": "IBMPlexSans-SemiBold",
    "700": "IBMPlexSans-Bold",
    "400i": "IBMPlexSans-Italic"
  },
  "editorial": {
    "500": "IBMPlexSerif-Medium",
    "600": "IBMPlexSerif-SemiBold",
    "700": "IBMPlexSerif-Bold"
  },
  "code": {
    "400": "IBMPlexMono-Regular",
    "500": "IBMPlexMono-Medium",
    "600": "IBMPlexMono-SemiBold"
  }
};

// O que foi medido em cada arquivo, para quem precisa do resto (o Android acha a fonte
// pelo nome do arquivo, e algumas ferramentas de build pedem a família tipográfica).
const AUREA_FONT_FILES = [
  {
    "file": "ibm-plex-sans-400-normal.ttf",
    "postScriptName": "IBMPlexSans-Regular",
    "family": "IBM Plex Sans",
    "typographicFamily": "IBM Plex Sans",
    "role": "ui",
    "weight": 400,
    "style": "normal"
  },
  {
    "file": "ibm-plex-sans-400-italic.ttf",
    "postScriptName": "IBMPlexSans-Italic",
    "family": "IBM Plex Sans",
    "typographicFamily": "IBM Plex Sans",
    "role": "ui",
    "weight": 400,
    "style": "italic"
  },
  {
    "file": "ibm-plex-sans-500-normal.ttf",
    "postScriptName": "IBMPlexSans-Medium",
    "family": "IBM Plex Sans Medium",
    "typographicFamily": "IBM Plex Sans",
    "role": "ui",
    "weight": 500,
    "style": "normal"
  },
  {
    "file": "ibm-plex-sans-600-normal.ttf",
    "postScriptName": "IBMPlexSans-SemiBold",
    "family": "IBM Plex Sans SemiBold",
    "typographicFamily": "IBM Plex Sans",
    "role": "ui",
    "weight": 600,
    "style": "normal"
  },
  {
    "file": "ibm-plex-sans-700-normal.ttf",
    "postScriptName": "IBMPlexSans-Bold",
    "family": "IBM Plex Sans",
    "typographicFamily": "IBM Plex Sans",
    "role": "ui",
    "weight": 700,
    "style": "normal"
  },
  {
    "file": "ibm-plex-serif-500-normal.ttf",
    "postScriptName": "IBMPlexSerif-Medium",
    "family": "IBM Plex Serif Medium",
    "typographicFamily": "IBM Plex Serif",
    "role": "editorial",
    "weight": 500,
    "style": "normal"
  },
  {
    "file": "ibm-plex-serif-600-normal.ttf",
    "postScriptName": "IBMPlexSerif-SemiBold",
    "family": "IBM Plex Serif SemiBold",
    "typographicFamily": "IBM Plex Serif",
    "role": "editorial",
    "weight": 600,
    "style": "normal"
  },
  {
    "file": "ibm-plex-serif-700-normal.ttf",
    "postScriptName": "IBMPlexSerif-Bold",
    "family": "IBM Plex Serif",
    "typographicFamily": "IBM Plex Serif",
    "role": "editorial",
    "weight": 700,
    "style": "normal"
  },
  {
    "file": "ibm-plex-mono-400-normal.ttf",
    "postScriptName": "IBMPlexMono-Regular",
    "family": "IBM Plex Mono",
    "typographicFamily": "IBM Plex Mono",
    "role": "code",
    "weight": 400,
    "style": "normal"
  },
  {
    "file": "ibm-plex-mono-500-normal.ttf",
    "postScriptName": "IBMPlexMono-Medium",
    "family": "IBM Plex Mono Medium",
    "typographicFamily": "IBM Plex Mono",
    "role": "code",
    "weight": 500,
    "style": "normal"
  },
  {
    "file": "ibm-plex-mono-600-normal.ttf",
    "postScriptName": "IBMPlexMono-SemiBold",
    "family": "IBM Plex Mono SemiBold",
    "typographicFamily": "IBM Plex Mono",
    "role": "code",
    "weight": 600,
    "style": "normal"
  }
];

module.exports = {AUREA_FONTS, FONT_FAMILIES, AUREA_FONT_FILES};
