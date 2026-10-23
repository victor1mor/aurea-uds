// Aurea — alvo NATIVO das fontes. GERADO por packages/fonts/build-fonts.mjs. NÃO EDITAR.
//
// Lote 0 do NATIVE.md (§5.2.1). O React Native não lê woff2, então o alvo web não atravessa:
// estes são os MESMOS estilos da web, em .ttf estático.
//
// ⚠ NÃO use `fontWeight` para escolher o peso. Os arquivos estão no formato RIBBI: só Regular,
// Italic e Bold moram na família principal ("Inter", "Sora", "IBM Plex Mono"); o Medium e o SemiBold
// são FAMÍLIAS PRÓPRIAS ("Inter Medium", "Sora SemiBold"…). Pedir a família + `fontWeight:"600"`
// devolve o Regular sintetizado, não o SemiBold desenhado. (Era assim também na Atkinson e na IBM Plex.)
//
// A forma correta é uma só: `fontFamily` recebe o NOME POSTSCRIPT, que é a chave deste mapa.
// O `FONT_FAMILIES` abaixo faz essa tradução por papel de tipografia e peso.
//
//   import {AUREA_FONTS, FONT_FAMILIES} from "@aurea-uds/fonts/native";
//   const [pronto] = useFonts(AUREA_FONTS);              // expo-font
//   <Text style={{fontFamily: FONT_FAMILIES.ui["600"]}}> // "Inter-SemiBold"
//
// Texto em Inter, título em Sora, código e valores em IBM Plex Mono (ADR-0077). Glifos: estes .ttf
// são COMPLETOS, enquanto o alvo web serve o recorte latino — no nativo a fonte é asset local do
// bundle, não transferência de rede por página.

// nome PostScript -> asset. É o formato que o `useFonts` do expo-font recebe.
const AUREA_FONTS = {
  "Inter-Regular": require("../files-native/inter-400-normal.ttf"),
  "Inter-Italic": require("../files-native/inter-400-italic.ttf"),
  "Inter-Medium": require("../files-native/inter-500-normal.ttf"),
  "Inter-SemiBold": require("../files-native/inter-600-normal.ttf"),
  "Inter-Bold": require("../files-native/inter-700-normal.ttf"),
  "Inter-ExtraBold": require("../files-native/inter-800-normal.ttf"),
  "Sora-Regular": require("../files-native/sora-400-normal.ttf"),
  "Sora-Medium": require("../files-native/sora-500-normal.ttf"),
  "Sora-SemiBold": require("../files-native/sora-600-normal.ttf"),
  "Sora-Bold": require("../files-native/sora-700-normal.ttf"),
  "Sora-ExtraBold": require("../files-native/sora-800-normal.ttf"),
  "IBMPlexMono": require("../files-native/ibm-plex-mono-400-normal.ttf"),
  "IBMPlexMono-Medm": require("../files-native/ibm-plex-mono-500-normal.ttf"),
  "IBMPlexMono-SmBld": require("../files-native/ibm-plex-mono-600-normal.ttf"),
};

// papel de tipografia -> peso -> nome PostScript. O sufixo `i` é o itálico.
const FONT_FAMILIES = {
  "ui": {
    "400": "Inter-Regular",
    "500": "Inter-Medium",
    "600": "Inter-SemiBold",
    "700": "Inter-Bold",
    "800": "Inter-ExtraBold",
    "400i": "Inter-Italic"
  },
  "heading": {
    "400": "Sora-Regular",
    "500": "Sora-Medium",
    "600": "Sora-SemiBold",
    "700": "Sora-Bold",
    "800": "Sora-ExtraBold"
  },
  "code": {
    "400": "IBMPlexMono",
    "500": "IBMPlexMono-Medm",
    "600": "IBMPlexMono-SmBld"
  },
  "editorial": {
    "400": "Inter-Regular",
    "500": "Inter-Medium",
    "600": "Inter-SemiBold",
    "700": "Inter-Bold",
    "800": "Inter-ExtraBold"
  }
};

// O que foi medido em cada arquivo, para quem precisa do resto (o Android acha a fonte
// pelo nome do arquivo, e algumas ferramentas de build pedem a família tipográfica).
const AUREA_FONT_FILES = [
  {
    "file": "inter-400-normal.ttf",
    "postScriptName": "Inter-Regular",
    "family": "Inter",
    "typographicFamily": "Inter",
    "role": "ui",
    "weight": 400,
    "style": "normal"
  },
  {
    "file": "inter-400-italic.ttf",
    "postScriptName": "Inter-Italic",
    "family": "Inter",
    "typographicFamily": "Inter",
    "role": "ui",
    "weight": 400,
    "style": "italic"
  },
  {
    "file": "inter-500-normal.ttf",
    "postScriptName": "Inter-Medium",
    "family": "Inter Medium",
    "typographicFamily": "Inter",
    "role": "ui",
    "weight": 500,
    "style": "normal"
  },
  {
    "file": "inter-600-normal.ttf",
    "postScriptName": "Inter-SemiBold",
    "family": "Inter SemiBold",
    "typographicFamily": "Inter",
    "role": "ui",
    "weight": 600,
    "style": "normal"
  },
  {
    "file": "inter-700-normal.ttf",
    "postScriptName": "Inter-Bold",
    "family": "Inter",
    "typographicFamily": "Inter",
    "role": "ui",
    "weight": 700,
    "style": "normal"
  },
  {
    "file": "inter-800-normal.ttf",
    "postScriptName": "Inter-ExtraBold",
    "family": "Inter ExtraBold",
    "typographicFamily": "Inter",
    "role": "ui",
    "weight": 800,
    "style": "normal"
  },
  {
    "file": "sora-400-normal.ttf",
    "postScriptName": "Sora-Regular",
    "family": "Sora",
    "typographicFamily": "Sora",
    "role": "heading",
    "weight": 400,
    "style": "normal"
  },
  {
    "file": "sora-500-normal.ttf",
    "postScriptName": "Sora-Medium",
    "family": "Sora Medium",
    "typographicFamily": "Sora",
    "role": "heading",
    "weight": 500,
    "style": "normal"
  },
  {
    "file": "sora-600-normal.ttf",
    "postScriptName": "Sora-SemiBold",
    "family": "Sora SemiBold",
    "typographicFamily": "Sora",
    "role": "heading",
    "weight": 600,
    "style": "normal"
  },
  {
    "file": "sora-700-normal.ttf",
    "postScriptName": "Sora-Bold",
    "family": "Sora",
    "typographicFamily": "Sora",
    "role": "heading",
    "weight": 700,
    "style": "normal"
  },
  {
    "file": "sora-800-normal.ttf",
    "postScriptName": "Sora-ExtraBold",
    "family": "Sora ExtraBold",
    "typographicFamily": "Sora",
    "role": "heading",
    "weight": 800,
    "style": "normal"
  },
  {
    "file": "ibm-plex-mono-400-normal.ttf",
    "postScriptName": "IBMPlexMono",
    "family": "IBM Plex Mono",
    "typographicFamily": "IBM Plex Mono",
    "role": "code",
    "weight": 400,
    "style": "normal"
  },
  {
    "file": "ibm-plex-mono-500-normal.ttf",
    "postScriptName": "IBMPlexMono-Medm",
    "family": "IBM Plex Mono Medm",
    "typographicFamily": "IBM Plex Mono",
    "role": "code",
    "weight": 500,
    "style": "normal"
  },
  {
    "file": "ibm-plex-mono-600-normal.ttf",
    "postScriptName": "IBMPlexMono-SmBld",
    "family": "IBM Plex Mono SmBld",
    "typographicFamily": "IBM Plex Mono",
    "role": "code",
    "weight": 600,
    "style": "normal"
  }
];

module.exports = {AUREA_FONTS, FONT_FAMILIES, AUREA_FONT_FILES};
