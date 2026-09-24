// Aurea — alvo NATIVO, gerado de aurea.tokens.json (DTCG 2025.10). NÃO EDITAR À MÃO.
// Regravar: node scripts/build-tokens.mjs — e o check 36 do validador reprova se divergir.
//
// Etapa 2 do NATIVE.md. O que este arquivo é, e o que ele deliberadamente NÃO é, está escrito no
// gerador (scripts/build-tokens.mjs). Em resumo:
//   • dp, não rem: 1rem = 16dp, MEDIDO no navegador (raiz sem font-size = 16px);
//   • cada cor em TRÊS formas — hex, p3 e oklch — mas HOJE SÓ O `hex` FUNCIONA: o interpretador
//     de cor do React Native recusa p3 e oklch (medido nas versões 0.81.5 e 0.87.0 por
//     `node scripts/measure-color-rn-parser.mjs`; é JS compartilhado entre iOS e Android). Passar
//     p3 ou oklch a um `style` faz a cor ser DESCARTADA. Os outros dois são intenção registrada
//     para quando isso mudar — ver a §"A correção" da ADR-0027;
//   • `tracking` é RAZÃO de em e não dp — letterSpacing no RN é absoluto, então o consumidor
//     multiplica pelo fontSize. Emitir dp daria certo num tamanho só;
//   • `breakpoints` NÃO é para StyleSheet — não há @media no RN. Vai para `Dimensions`;
//   • `fontFamily` é a família PEDIDA, não o nome que o RN aceita: o iOS quer o nome PostScript
//     e o Android o nome do arquivo, e o pacote @aurea-uds/fonts hoje só tem .woff2, que o RN não
//     lê. O nome final se decide quando os arquivos nativos entrarem;
//   • 6 tokens que moram no `base` do DTCG saem DENTRO de cada tema, e não no
//     `base` daqui: text-muted, oracle-300, oracle-400, oracle-500, oracle-600, oracle-700. Eles apontam para folhas que só existem por tema, e no
//     CSS o `var()` resolve isso no uso. Em JS não há ligação tardia — pôr um valor estático no
//     base escolheria um tema e erraria no outro.
export const REM_EM_DP = 16;
export const base = {
  "brandYellow": {
    "hex": "#f0b100",
    "p3": "color(display-p3 0.9037 0.7031 0.0745)",
    "oklch": "oklch(0.795 0.184 86.047)"
  },
  "brandYellowForeground": {
    "hex": "#733e0a",
    "p3": "color(display-p3 0.4225 0.2527 0.0951)",
    "oklch": "oklch(0.421 0.095 57.708)"
  },
  "fontUi": "IBM Plex Sans",
  "fontEditorial": "IBM Plex Serif",
  "fontCode": "IBM Plex Mono",
  "textXs": 12,
  "textSm": 14,
  "textMd": 14,
  "textBase": 16,
  "textLg": 18,
  "textXl": 20,
  "text2xl": 24,
  "text3xl": 30,
  "text4xl": 36,
  "text5xl": 48,
  "leadingTight": 1.2,
  "leadingNormal": 1.5,
  "leadingRelaxed": 1.7,
  "space0": 0,
  "space05": 2,
  "space1": 4,
  "space2": 8,
  "space3": 12,
  "space4": 16,
  "space5": 20,
  "space6": 24,
  "space7": 28,
  "space8": 32,
  "space10": 40,
  "space12": 48,
  "space16": 64,
  "space20": 80,
  "space24": 96,
  "radiusXs": 6,
  "radiusSm": 8,
  "radiusMd": 10,
  "radiusLg": 16,
  "radiusCard": 22,
  "radiusControl": 999,
  "radiusFull": 999,
  "borderWidth": 1,
  "opacityDisabled": 0.5,
  "shadowMd": {
    "offsetX": 0,
    "offsetY": 16,
    "blurRadius": 42,
    "spreadDistance": 0,
    "color": "rgba(0,0,0,0.28)"
  },
  "shadowLg": {
    "offsetX": 0,
    "offsetY": 28,
    "blurRadius": 80,
    "spreadDistance": 0,
    "color": "rgba(0,0,0,0.42)"
  },
  "durationFast": 120,
  "durationBase": 180,
  "durationSlow": 280,
  "easeStandard": [
    0.2,
    0,
    0,
    1
  ],
  "easeEmphasized": [
    0.2,
    0.8,
    0.2,
    1
  ],
  "zBase": 0,
  "zSticky": 20,
  "zDropdown": 40,
  "zDrawer": 60,
  "zModal": 80,
  "zToast": 100,
  "sidebarWidth": 264,
  "sidebarRail": 68,
  "topbarHeight": 64,
  "contentMax": 1640,
  "controlHXs": 26,
  "controlHSm": 30,
  "controlHMd": 36,
  "controlHLg": 42,
  "controlHXl": 50,
  "rowH": 48,
  "cardPad": 20,
  "sectionGap": 24,
  "mediaCanvas": {
    "hex": "#020202",
    "p3": "color(display-p3 0.0079 0.0079 0.0079)",
    "oklch": "oklch(0.085 0 0)"
  },
  "mediaForeground": {
    "hex": "#fafafa",
    "p3": "color(display-p3 0.9803 0.9803 0.9803)",
    "oklch": "oklch(0.985 0 0)"
  },
  "mediaMuted": {
    "hex": "#ababab",
    "p3": "color(display-p3 0.6691 0.6691 0.6691)",
    "oklch": "oklch(0.74 0 0)"
  },
  "mediaScrim": {
    "hex": "#000000d1",
    "p3": "color(display-p3 0 0 0 / 0.82)",
    "oklch": "oklch(0 0 0 / 0.82)"
  },
  "mediaTrack": {
    "hex": "#ffffff2e",
    "p3": "color(display-p3 1 1 1 / 0.18)",
    "oklch": "oklch(1 0 0 / 0.18)"
  },
  "mediaBuffered": {
    "hex": "#ffffff6b",
    "p3": "color(display-p3 1 1 1 / 0.42)",
    "oklch": "oklch(1 0 0 / 0.42)"
  },
  "mediaCaptionBg": {
    "hex": "#000000d1",
    "p3": "color(display-p3 0 0 0 / 0.82)",
    "oklch": "oklch(0 0 0 / 0.82)"
  },
  "mediaControlBg": {
    "hex": "#00000085",
    "p3": "color(display-p3 0 0 0 / 0.52)",
    "oklch": "oklch(0 0 0 / 0.52)"
  },
  "mediaControlHover": {
    "hex": "#ffffff24",
    "p3": "color(display-p3 1 1 1 / 0.14)",
    "oklch": "oklch(1 0 0 / 0.14)"
  },
  "success400": {
    "hex": "#42d392",
    "p3": "color(display-p3 0.2588 0.8275 0.5726)",
    "oklch": null
  },
  "success500": {
    "hex": "#22c875",
    "p3": "color(display-p3 0.1333 0.7843 0.4588)",
    "oklch": null
  },
  "success700": {
    "hex": "#147a4d",
    "p3": "color(display-p3 0.0784 0.4784 0.302)",
    "oklch": null
  },
  "warning400": {
    "hex": "#f18500",
    "p3": "color(display-p3 0.8895 0.5417 0.1662)",
    "oklch": "oklch(0.72 0.175 60)"
  },
  "warning500": {
    "hex": "#e98d35",
    "p3": "color(display-p3 0.8653 0.5711 0.2835)",
    "oklch": "oklch(0.727 0.149 60)"
  },
  "warning800": {
    "hex": "#774613",
    "p3": "color(display-p3 0.4406 0.2824 0.121)",
    "oklch": "oklch(0.443 0.092 61)"
  },
  "danger400": {
    "hex": "#ff7180",
    "p3": "color(display-p3 1 0.4431 0.502)",
    "oklch": null
  },
  "danger500": {
    "hex": "#e94b58",
    "p3": "color(display-p3 0.9137 0.2941 0.3451)",
    "oklch": null
  },
  "danger800": {
    "hex": "#7f2029",
    "p3": "color(display-p3 0.498 0.1255 0.1608)",
    "oklch": null
  },
  "info400": {
    "hex": "#8ec5ff",
    "p3": "color(display-p3 0.5569 0.7725 1)",
    "oklch": null
  },
  "info500": {
    "hex": "#2b7fff",
    "p3": "color(display-p3 0.1686 0.498 1)",
    "oklch": null
  },
  "info800": {
    "hex": "#1447e6",
    "p3": "color(display-p3 0.0784 0.2784 0.902)",
    "oklch": null
  },
  "oracle50": {
    "hex": "#e6f3ff",
    "p3": "color(display-p3 0.9119 0.9529 1)",
    "oklch": "oklch(0.96 0.025 251.813)"
  },
  "oracle100": {
    "hex": "#c2e1ff",
    "p3": "color(display-p3 0.784 0.8804 1)",
    "oklch": "oklch(0.9 0.06 251.813)"
  },
  "oracle200": {
    "hex": "#a3d2ff",
    "p3": "color(display-p3 0.6762 0.8189 1)",
    "oklch": "oklch(0.85 0.09 251.813)"
  },
  "oracle800": {
    "hex": "#102caa",
    "p3": "color(display-p3 0.0911 0.1695 0.6406)",
    "oklch": "oklch(0.38 0.2 265.638)"
  },
  "oracle900": {
    "hex": "#0a207f",
    "p3": "color(display-p3 0.0608 0.1229 0.4786)",
    "oklch": "oklch(0.31 0.16 265.638)"
  },
  "oracle950": {
    "hex": "#05144f",
    "p3": "color(display-p3 0.0319 0.0762 0.2978)",
    "oklch": "oklch(0.23 0.11 265.638)"
  },
  "weightRegular": 400,
  "weightMedium": 500,
  "weightSemibold": 600,
  "weightBold": 700,
  "iconSm": 16,
  "iconMd": 20,
  "iconLg": 24,
  "iconXl": 32,
  "leadingNone": 1,
  "targetMin": 44
};
export const tracking = {
  "trackingTight": -0.01,
  "trackingNormal": 0,
  "trackingWide": 0.04,
  "trackingWider": 0.06,
  "trackingWidest": 0.12
};
export const breakpoints = {
  "breakpoint2xs": 360,
  "breakpointXs": 480,
  "breakpointSm": 640,
  "breakpointMd": 768,
  "breakpointLg": 1024,
  "breakpointXl": 1280,
  "breakpoint2xl": 1536
};
export const themes = {
  "dark": {
    "background": {
      "hex": "#0a0a0a",
      "p3": "color(display-p3 0.0394 0.0394 0.0394)",
      "oklch": "oklch(0.145 0 0)"
    },
    "foreground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "card": {
      "hex": "#171717",
      "p3": "color(display-p3 0.0905 0.0905 0.0905)",
      "oklch": "oklch(0.205 0 0)"
    },
    "cardForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "popover": {
      "hex": "#171717",
      "p3": "color(display-p3 0.0905 0.0905 0.0905)",
      "oklch": "oklch(0.205 0 0)"
    },
    "popoverForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "primary": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "primaryForeground": {
      "hex": "#733e0a",
      "p3": "color(display-p3 0.4225 0.2527 0.0951)",
      "oklch": "oklch(0.421 0.095 57.708)"
    },
    "link": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "linkHover": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "secondary": {
      "hex": "#27272a",
      "p3": "color(display-p3 0.1529 0.1529 0.1647)",
      "oklch": "oklch(0.274 0.006 286.033)"
    },
    "secondaryForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "muted": {
      "hex": "#262626",
      "p3": "color(display-p3 0.1494 0.1494 0.1494)",
      "oklch": "oklch(0.269 0 0)"
    },
    "mutedForeground": {
      "hex": "#a1a1a1",
      "p3": "color(display-p3 0.6302 0.6302 0.6302)",
      "oklch": "oklch(0.708 0 0)"
    },
    "accent": {
      "hex": "#262626",
      "p3": "color(display-p3 0.1494 0.1494 0.1494)",
      "oklch": "oklch(0.269 0 0)"
    },
    "accentForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "destructive": {
      "hex": "#ff6467",
      "p3": "color(display-p3 0.9335 0.4317 0.4235)",
      "oklch": "oklch(0.704 0.191 22.216)"
    },
    "destructiveForeground": {
      "hex": "#1e1212",
      "p3": "color(display-p3 0.1121 0.0743 0.0714)",
      "oklch": "oklch(0.2 0.02 22)"
    },
    "border": {
      "hex": "#ffffff1a",
      "p3": "color(display-p3 1 1 1 / 0.1)",
      "oklch": "oklch(1 0 0 / 0.1)"
    },
    "input": {
      "hex": "#ffffff26",
      "p3": "color(display-p3 1 1 1 / 0.15)",
      "oklch": "oklch(1 0 0 / 0.15)"
    },
    "ring": {
      "hex": "#737373",
      "p3": "color(display-p3 0.4515 0.4515 0.4515)",
      "oklch": "oklch(0.556 0 0)"
    },
    "chart1": {
      "hex": "#8ec5ff",
      "p3": "color(display-p3 0.6026 0.7672 0.9939)",
      "oklch": "oklch(0.809 0.105 251.813)"
    },
    "chart2": {
      "hex": "#2b7fff",
      "p3": "color(display-p3 0.2664 0.4912 0.9886)",
      "oklch": "oklch(0.623 0.214 259.815)"
    },
    "chart3": {
      "hex": "#155dfc",
      "p3": "color(display-p3 0.1745 0.359 0.9502)",
      "oklch": "oklch(0.546 0.245 262.881)"
    },
    "chart4": {
      "hex": "#1447e6",
      "p3": "color(display-p3 0.1379 0.275 0.8676)",
      "oklch": "oklch(0.488 0.243 264.376)"
    },
    "chart5": {
      "hex": "#193cb8",
      "p3": "color(display-p3 0.134 0.2306 0.6955)",
      "oklch": "oklch(0.424 0.199 265.638)"
    },
    "sidebar": {
      "hex": "#171717",
      "p3": "color(display-p3 0.0905 0.0905 0.0905)",
      "oklch": "oklch(0.205 0 0)"
    },
    "sidebarForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "sidebarPrimary": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "sidebarPrimaryForeground": {
      "hex": "#733e0a",
      "p3": "color(display-p3 0.4225 0.2527 0.0951)",
      "oklch": "oklch(0.421 0.095 57.708)"
    },
    "sidebarAccent": {
      "hex": "#262626",
      "p3": "color(display-p3 0.1494 0.1494 0.1494)",
      "oklch": "oklch(0.269 0 0)"
    },
    "sidebarAccentForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "sidebarBorder": {
      "hex": "#ffffff1a",
      "p3": "color(display-p3 1 1 1 / 0.1)",
      "oklch": "oklch(1 0 0 / 0.1)"
    },
    "sidebarRing": {
      "hex": "#737373",
      "p3": "color(display-p3 0.4515 0.4515 0.4515)",
      "oklch": "oklch(0.556 0 0)"
    },
    "surface1": {
      "hex": "#171717",
      "p3": "color(display-p3 0.0905 0.0905 0.0905)",
      "oklch": "oklch(0.205 0 0)"
    },
    "surface2": {
      "hex": "#27272a",
      "p3": "color(display-p3 0.1529 0.1529 0.1647)",
      "oklch": "oklch(0.274 0.006 286.033)"
    },
    "surface3": {
      "hex": "#262626",
      "p3": "color(display-p3 0.1494 0.1494 0.1494)",
      "oklch": "oklch(0.269 0 0)"
    },
    "surfaceInset": {
      "hex": "#0a0a0a",
      "p3": "color(display-p3 0.0394 0.0394 0.0394)",
      "oklch": "oklch(0.145 0 0)"
    },
    "surfaceHover": {
      "hex": "#2e2e2e",
      "p3": "color(display-p3 0.1792 0.1792 0.1792)",
      "oklch": "oklch(0.3 0 0)"
    },
    "foregroundStrong": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "subtleForeground": {
      "hex": "#b1b1b1",
      "p3": "color(display-p3 0.6936 0.6936 0.6936)",
      "oklch": "oklch(0.76 0 0)"
    },
    "borderStrong": {
      "hex": "#7a7a7a",
      "p3": "color(display-p3 0.479 0.479 0.479)",
      "oklch": "oklch(0.58 0 0)"
    },
    "fieldBg": {
      "hex": "#262626",
      "p3": "color(display-p3 0.1494 0.1494 0.1494)",
      "oklch": "oklch(0.269 0 0)"
    },
    "overlay": {
      "hex": "#000000bd",
      "p3": "color(display-p3 0 0 0 / 0.74)",
      "oklch": "oklch(0 0 0 / 0.74)"
    },
    "primaryHover": {
      "hex": "#fac000",
      "p3": "color(display-p3 0.9464 0.7613 0.1219)",
      "oklch": "oklch(0.835 0.19 89)"
    },
    "primaryActive": {
      "hex": "#dd9f00",
      "p3": "color(display-p3 0.8291 0.633 0.0845)",
      "oklch": "oklch(0.74 0.17 84)"
    },
    "secondaryHover": {
      "hex": "#303033",
      "p3": "color(display-p3 0.1877 0.1878 0.1999)",
      "oklch": "oklch(0.31 0.006 286.033)"
    },
    "focus": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "focusStrong": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "primaryEmphasis": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "primaryOutline": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "controlSelected": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "controlSelectedForeground": {
      "hex": "#733e0a",
      "p3": "color(display-p3 0.4225 0.2527 0.0951)",
      "oklch": "oklch(0.421 0.095 57.708)"
    },
    "selection": {
      "hex": "#f0b10038",
      "p3": "color(display-p3 0.9037 0.7031 0.0745 / 0.22)",
      "oklch": "oklch(0.795 0.184 86.047 / 0.22)"
    },
    "successBg": {
      "hex": "#0b5d2a5c",
      "p3": "color(display-p3 0.1609 0.3588 0.1866 / 0.36)",
      "oklch": "oklch(0.42 0.11 150 / 0.36)"
    },
    "warningBg": {
      "hex": "#552c00a3",
      "p3": "color(display-p3 0.312 0.1804 0.0425 / 0.64)",
      "oklch": "oklch(0.34 0.08 60 / 0.64)"
    },
    "dangerBg": {
      "hex": "#5b161a9e",
      "p3": "color(display-p3 0.329 0.1093 0.1117 / 0.62)",
      "oklch": "oklch(0.32 0.1 22 / 0.62)"
    },
    "infoBg": {
      "hex": "#122a529e",
      "p3": "color(display-p3 0.0924 0.1619 0.3121 / 0.62)",
      "oklch": "oklch(0.29 0.08 260 / 0.62)"
    },
    "warning400": {
      "hex": "#f18500",
      "p3": "color(display-p3 0.8895 0.5417 0.1662)",
      "oklch": "oklch(0.72 0.175 60)"
    },
    "success": {
      "hex": "#42d392",
      "p3": "color(display-p3 0.2588 0.8275 0.5726)",
      "oklch": null
    },
    "successForeground": {
      "hex": "#0e1913",
      "p3": "color(display-p3 0.0638 0.0964 0.0757)",
      "oklch": "oklch(0.2 0.02 160)"
    },
    "successHover": {
      "hex": "#63e4a6",
      "p3": "color(display-p3 0.5273 0.8827 0.6709)",
      "oklch": "oklch(0.83 0.145 160)"
    },
    "info": {
      "hex": "#8ec5ff",
      "p3": "color(display-p3 0.5569 0.7725 1)",
      "oklch": null
    },
    "infoForeground": {
      "hex": "#0f171f",
      "p3": "color(display-p3 0.0653 0.0885 0.1182)",
      "oklch": "oklch(0.2 0.02 250)"
    },
    "infoHover": {
      "hex": "#acd5ff",
      "p3": "color(display-p3 0.7073 0.8325 0.9923)",
      "oklch": "oklch(0.86 0.075 250)"
    },
    "warning": {
      "hex": "#f18500",
      "p3": "color(display-p3 0.8895 0.5417 0.1662)",
      "oklch": "oklch(0.72 0.175 60)"
    },
    "warningForeground": {
      "hex": "#1d140d",
      "p3": "color(display-p3 0.1077 0.0795 0.054)",
      "oklch": "oklch(0.2 0.02 60)"
    },
    "warningHover": {
      "hex": "#ff9c3b",
      "p3": "color(display-p3 0.9501 0.6285 0.3141)",
      "oklch": "oklch(0.78 0.16 60)"
    },
    "textMuted": {
      "hex": "#a1a1a1",
      "p3": "color(display-p3 0.6302 0.6302 0.6302)",
      "oklch": "oklch(0.708 0 0)"
    },
    "oracle300": {
      "hex": "#8ec5ff",
      "p3": "color(display-p3 0.6026 0.7672 0.9939)",
      "oklch": "oklch(0.809 0.105 251.813)"
    },
    "oracle400": {
      "hex": "#2b7fff",
      "p3": "color(display-p3 0.2664 0.4912 0.9886)",
      "oklch": "oklch(0.623 0.214 259.815)"
    },
    "oracle500": {
      "hex": "#155dfc",
      "p3": "color(display-p3 0.1745 0.359 0.9502)",
      "oklch": "oklch(0.546 0.245 262.881)"
    },
    "oracle600": {
      "hex": "#1447e6",
      "p3": "color(display-p3 0.1379 0.275 0.8676)",
      "oklch": "oklch(0.488 0.243 264.376)"
    },
    "oracle700": {
      "hex": "#193cb8",
      "p3": "color(display-p3 0.134 0.2306 0.6955)",
      "oklch": "oklch(0.424 0.199 265.638)"
    }
  },
  "light": {
    "background": {
      "hex": "#f3f3f3",
      "p3": "color(display-p3 0.954 0.954 0.954)",
      "oklch": "oklch(0.965 0 0)"
    },
    "foreground": {
      "hex": "#0a0a0a",
      "p3": "color(display-p3 0.0394 0.0394 0.0394)",
      "oklch": "oklch(0.145 0 0)"
    },
    "card": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": "oklch(1 0 0)"
    },
    "cardForeground": {
      "hex": "#0a0a0a",
      "p3": "color(display-p3 0.0394 0.0394 0.0394)",
      "oklch": "oklch(0.145 0 0)"
    },
    "popover": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": "oklch(1 0 0)"
    },
    "popoverForeground": {
      "hex": "#0a0a0a",
      "p3": "color(display-p3 0.0394 0.0394 0.0394)",
      "oklch": "oklch(0.145 0 0)"
    },
    "primary": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "primaryForeground": {
      "hex": "#733e0a",
      "p3": "color(display-p3 0.4225 0.2527 0.0951)",
      "oklch": "oklch(0.421 0.095 57.708)"
    },
    "link": {
      "hex": "#846301",
      "p3": "color(display-p3 0.4976 0.3951 0.1201)",
      "oklch": "oklch(0.52 0.106 86.047)"
    },
    "linkHover": {
      "hex": "#6c4d00",
      "p3": "color(display-p3 0.4058 0.3056 0)",
      "oklch": "oklch(0.44 0.106 86.047)"
    },
    "secondary": {
      "hex": "#ebebeb",
      "p3": "color(display-p3 0.9215 0.9215 0.9215)",
      "oklch": "oklch(0.94 0 0)"
    },
    "secondaryForeground": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0938 0.0938 0.1048)",
      "oklch": "oklch(0.21 0.006 285.885)"
    },
    "muted": {
      "hex": "#ebebeb",
      "p3": "color(display-p3 0.9215 0.9215 0.9215)",
      "oklch": "oklch(0.94 0 0)"
    },
    "mutedForeground": {
      "hex": "#505050",
      "p3": "color(display-p3 0.3124 0.3124 0.3124)",
      "oklch": "oklch(0.43 0 0)"
    },
    "accent": {
      "hex": "#ebebeb",
      "p3": "color(display-p3 0.9215 0.9215 0.9215)",
      "oklch": "oklch(0.94 0 0)"
    },
    "accentForeground": {
      "hex": "#171717",
      "p3": "color(display-p3 0.0905 0.0905 0.0905)",
      "oklch": "oklch(0.205 0 0)"
    },
    "destructive": {
      "hex": "#e7000b",
      "p3": "color(display-p3 0.8303 0.1404 0.1332)",
      "oklch": "oklch(0.577 0.245 27.325)"
    },
    "destructiveForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "border": {
      "hex": "#dbdbdb",
      "p3": "color(display-p3 0.857 0.857 0.857)",
      "oklch": "oklch(0.89 0 0)"
    },
    "input": {
      "hex": "#e5e5e5",
      "p3": "color(display-p3 0.8982 0.8982 0.8982)",
      "oklch": "oklch(0.922 0 0)"
    },
    "ring": {
      "hex": "#a1a1a1",
      "p3": "color(display-p3 0.6302 0.6302 0.6302)",
      "oklch": "oklch(0.708 0 0)"
    },
    "chart1": {
      "hex": "#8ec5ff",
      "p3": "color(display-p3 0.6026 0.7672 0.9939)",
      "oklch": "oklch(0.809 0.105 251.813)"
    },
    "chart2": {
      "hex": "#2b7fff",
      "p3": "color(display-p3 0.2664 0.4912 0.9886)",
      "oklch": "oklch(0.623 0.214 259.815)"
    },
    "chart3": {
      "hex": "#155dfc",
      "p3": "color(display-p3 0.1745 0.359 0.9502)",
      "oklch": "oklch(0.546 0.245 262.881)"
    },
    "chart4": {
      "hex": "#1447e6",
      "p3": "color(display-p3 0.1379 0.275 0.8676)",
      "oklch": "oklch(0.488 0.243 264.376)"
    },
    "chart5": {
      "hex": "#193cb8",
      "p3": "color(display-p3 0.134 0.2306 0.6955)",
      "oklch": "oklch(0.424 0.199 265.638)"
    },
    "sidebar": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": "oklch(1 0 0)"
    },
    "sidebarForeground": {
      "hex": "#0a0a0a",
      "p3": "color(display-p3 0.0394 0.0394 0.0394)",
      "oklch": "oklch(0.145 0 0)"
    },
    "sidebarPrimary": {
      "hex": "#733e0a",
      "p3": "color(display-p3 0.4225 0.2527 0.0951)",
      "oklch": "oklch(0.421 0.095 57.708)"
    },
    "sidebarPrimaryForeground": {
      "hex": "#733e0a",
      "p3": "color(display-p3 0.4225 0.2527 0.0951)",
      "oklch": "oklch(0.421 0.095 57.708)"
    },
    "sidebarAccent": {
      "hex": "#ebebeb",
      "p3": "color(display-p3 0.9215 0.9215 0.9215)",
      "oklch": "oklch(0.94 0 0)"
    },
    "sidebarAccentForeground": {
      "hex": "#171717",
      "p3": "color(display-p3 0.0905 0.0905 0.0905)",
      "oklch": "oklch(0.205 0 0)"
    },
    "sidebarBorder": {
      "hex": "#dbdbdb",
      "p3": "color(display-p3 0.857 0.857 0.857)",
      "oklch": "oklch(0.89 0 0)"
    },
    "sidebarRing": {
      "hex": "#a1a1a1",
      "p3": "color(display-p3 0.6302 0.6302 0.6302)",
      "oklch": "oklch(0.708 0 0)"
    },
    "surface1": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": "oklch(1 0 0)"
    },
    "surface2": {
      "hex": "#ebebeb",
      "p3": "color(display-p3 0.9215 0.9215 0.9215)",
      "oklch": "oklch(0.94 0 0)"
    },
    "surface3": {
      "hex": "#ebebeb",
      "p3": "color(display-p3 0.9215 0.9215 0.9215)",
      "oklch": "oklch(0.94 0 0)"
    },
    "surfaceInset": {
      "hex": "#f0f0f0",
      "p3": "color(display-p3 0.941 0.941 0.941)",
      "oklch": "oklch(0.955 0 0)"
    },
    "surfaceHover": {
      "hex": "#e6e6e6",
      "p3": "color(display-p3 0.902 0.902 0.902)",
      "oklch": "oklch(0.925 0 0)"
    },
    "foregroundStrong": {
      "hex": "#0a0a0a",
      "p3": "color(display-p3 0.0394 0.0394 0.0394)",
      "oklch": "oklch(0.145 0 0)"
    },
    "subtleForeground": {
      "hex": "#505050",
      "p3": "color(display-p3 0.3124 0.3124 0.3124)",
      "oklch": "oklch(0.43 0 0)"
    },
    "borderStrong": {
      "hex": "#747474",
      "p3": "color(display-p3 0.4561 0.4561 0.4561)",
      "oklch": "oklch(0.56 0 0)"
    },
    "fieldBg": {
      "hex": "#ebebeb",
      "p3": "color(display-p3 0.9215 0.9215 0.9215)",
      "oklch": "oklch(0.94 0 0)"
    },
    "overlay": {
      "hex": "#0a0a0a66",
      "p3": "color(display-p3 0.0394 0.0394 0.0394 / 0.4)",
      "oklch": "oklch(0.145 0 0 / 0.4)"
    },
    "primaryHover": {
      "hex": "#fac000",
      "p3": "color(display-p3 0.9464 0.7613 0.1219)",
      "oklch": "oklch(0.835 0.19 89)"
    },
    "primaryActive": {
      "hex": "#dd9f00",
      "p3": "color(display-p3 0.8291 0.633 0.0845)",
      "oklch": "oklch(0.74 0.17 84)"
    },
    "secondaryHover": {
      "hex": "#e6e6e6",
      "p3": "color(display-p3 0.902 0.902 0.902)",
      "oklch": "oklch(0.925 0 0)"
    },
    "focus": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "focusStrong": {
      "hex": "#733e0a",
      "p3": "color(display-p3 0.4225 0.2527 0.0951)",
      "oklch": "oklch(0.421 0.095 57.708)"
    },
    "primaryEmphasis": {
      "hex": "#733e0a",
      "p3": "color(display-p3 0.4225 0.2527 0.0951)",
      "oklch": "oklch(0.421 0.095 57.708)"
    },
    "primaryOutline": {
      "hex": "#733e0a",
      "p3": "color(display-p3 0.4225 0.2527 0.0951)",
      "oklch": "oklch(0.421 0.095 57.708)"
    },
    "controlSelected": {
      "hex": "#733e0a",
      "p3": "color(display-p3 0.4225 0.2527 0.0951)",
      "oklch": "oklch(0.421 0.095 57.708)"
    },
    "controlSelectedForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "success400": {
      "hex": "#0f6b3e",
      "p3": "color(display-p3 0.0588 0.4196 0.2431)",
      "oklch": null
    },
    "warning400": {
      "hex": "#9f5400",
      "p3": "color(display-p3 0.5836 0.3461 0.0687)",
      "oklch": "oklch(0.525 0.131 61)"
    },
    "danger400": {
      "hex": "#9f2330",
      "p3": "color(display-p3 0.6235 0.1373 0.1882)",
      "oklch": null
    },
    "info400": {
      "hex": "#164f9d",
      "p3": "color(display-p3 0.0863 0.3098 0.6157)",
      "oklch": null
    },
    "oracle300": {
      "hex": "#8ec5ff",
      "p3": "color(display-p3 0.6026 0.7672 0.9939)",
      "oklch": "oklch(0.809 0.105 251.813)"
    },
    "oracle400": {
      "hex": "#2b7fff",
      "p3": "color(display-p3 0.2664 0.4912 0.9886)",
      "oklch": "oklch(0.623 0.214 259.815)"
    },
    "selection": {
      "hex": "#f0b1002e",
      "p3": "color(display-p3 0.9037 0.7031 0.0745 / 0.18)",
      "oklch": "oklch(0.795 0.184 86.047 / 0.18)"
    },
    "successBg": {
      "hex": "#d5f5da",
      "p3": "color(display-p3 0.858 0.9579 0.8625)",
      "oklch": "oklch(0.94 0.05 150)"
    },
    "warningBg": {
      "hex": "#ffe6c6",
      "p3": "color(display-p3 1 0.9081 0.7938)",
      "oklch": "oklch(0.95 0.06 61)"
    },
    "dangerBg": {
      "hex": "#ffe2df",
      "p3": "color(display-p3 1 0.8932 0.8808)",
      "oklch": "oklch(0.95 0.05 22)"
    },
    "infoBg": {
      "hex": "#ddf0ff",
      "p3": "color(display-p3 0.8812 0.9379 1)",
      "oklch": "oklch(0.95 0.045 260)"
    },
    "success": {
      "hex": "#0f6b3e",
      "p3": "color(display-p3 0.0588 0.4196 0.2431)",
      "oklch": null
    },
    "successForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "successHover": {
      "hex": "#00572e",
      "p3": "color(display-p3 0.1347 0.3347 0.1971)",
      "oklch": "oklch(0.4 0.1 155)"
    },
    "info": {
      "hex": "#164f9d",
      "p3": "color(display-p3 0.0863 0.3098 0.6157)",
      "oklch": null
    },
    "infoForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "infoHover": {
      "hex": "#0a3f86",
      "p3": "color(display-p3 0.1072 0.2427 0.5055)",
      "oklch": "oklch(0.38 0.13 258)"
    },
    "warning": {
      "hex": "#9f5400",
      "p3": "color(display-p3 0.5836 0.3461 0.0687)",
      "oklch": "oklch(0.525 0.131 61)"
    },
    "warningForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "warningHover": {
      "hex": "#884800",
      "p3": "color(display-p3 0.4986 0.296 0.0656)",
      "oklch": "oklch(0.47 0.115 61)"
    },
    "textMuted": {
      "hex": "#505050",
      "p3": "color(display-p3 0.3124 0.3124 0.3124)",
      "oklch": "oklch(0.43 0 0)"
    },
    "oracle500": {
      "hex": "#155dfc",
      "p3": "color(display-p3 0.1745 0.359 0.9502)",
      "oklch": "oklch(0.546 0.245 262.881)"
    },
    "oracle600": {
      "hex": "#1447e6",
      "p3": "color(display-p3 0.1379 0.275 0.8676)",
      "oklch": "oklch(0.488 0.243 264.376)"
    },
    "oracle700": {
      "hex": "#193cb8",
      "p3": "color(display-p3 0.134 0.2306 0.6955)",
      "oklch": "oklch(0.424 0.199 265.638)"
    }
  }
};
export const densities = {
  "compact": {
    "controlHXs": 24,
    "controlHSm": 28,
    "controlHMd": 32,
    "controlHLg": 38,
    "controlHXl": 44,
    "rowH": 42,
    "cardPad": 16,
    "sectionGap": 18
  },
  "comfortable": {
    "controlHXs": 26,
    "controlHSm": 30,
    "controlHMd": 36,
    "controlHLg": 42,
    "controlHXl": 50,
    "rowH": 48,
    "cardPad": 20,
    "sectionGap": 24
  },
  "spacious": {
    "controlHXs": 28,
    "controlHSm": 34,
    "controlHMd": 40,
    "controlHLg": 48,
    "controlHXl": 56,
    "rowH": 54,
    "cardPad": 24,
    "sectionGap": 32
  }
};
