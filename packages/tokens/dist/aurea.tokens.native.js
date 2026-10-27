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
  "brandYellowText": {
    "hex": "#826202",
    "p3": "color(display-p3 0.4921 0.3908 0.1193)",
    "oklch": "oklch(0.516 0.105 86.047)"
  },
  "brandYellowInk": {
    "hex": "#18181b",
    "p3": "color(display-p3 0.0941 0.0941 0.1059)",
    "oklch": null
  },
  "brandBlue": {
    "hex": "#0246f1",
    "p3": "color(display-p3 0.0078 0.2745 0.9451)",
    "oklch": null
  },
  "white": {
    "hex": "#ffffff",
    "p3": "color(display-p3 1 1 1)",
    "oklch": "oklch(1 0 0)"
  },
  "black": {
    "hex": "#000000",
    "p3": "color(display-p3 0 0 0)",
    "oklch": "oklch(0 0 0)"
  },
  "fontUi": "Inter",
  "fontHeading": "Sora",
  "fontEditorial": "Inter",
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
  "text6xl": 60,
  "text7xl": 72,
  "leadingTight": 1.2,
  "leadingNormal": 1.5,
  "leadingRelaxed": 1.7,
  "text4xlLeading": 1.111111,
  "text3xlLeading": 1.2,
  "text2xlLeading": 1.333333,
  "textXlLeading": 1.4,
  "textLgLeading": 1.555556,
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
  "radiusSheet": 32,
  "radiusControl": 999,
  "radiusFull": 999,
  "borderWidth": 1,
  "accentWidth": 4,
  "focusWidth": 2,
  "focusOffset": 2,
  "opacityDisabled": 0.5,
  "shadowSm": {
    "offsetX": 0,
    "offsetY": 2,
    "blurRadius": 4,
    "spreadDistance": 0,
    "color": "rgba(0,0,0,0.04)"
  },
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
  "docsWidth": 1400,
  "docsSidebarWidth": 220,
  "docsAsideWidth": 268,
  "docsTocWidth": 240,
  "docsTextWidth": 900,
  "topbarHeight": 64,
  "contentMax": 1640,
  "controlHXs": 26,
  "controlHSm": 32,
  "controlHMd": 36,
  "controlHLg": 40,
  "controlHXl": 50,
  "rowH": 48,
  "cardPad": 16,
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
  "weightExtrabold": 800,
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
export const shadowLayers = {
  "shadowSm": [
    {
      "offsetX": 0,
      "offsetY": 2,
      "blurRadius": 4,
      "spreadDistance": 0,
      "color": "rgba(0,0,0,0.04)"
    },
    {
      "offsetX": 0,
      "offsetY": 1,
      "blurRadius": 2,
      "spreadDistance": 0,
      "color": "rgba(0,0,0,0.06)"
    },
    {
      "offsetX": 0,
      "offsetY": 0,
      "blurRadius": 1,
      "spreadDistance": 0,
      "color": "rgba(0,0,0,0.06)"
    }
  ],
  "shadowMd": [
    {
      "offsetX": 0,
      "offsetY": 16,
      "blurRadius": 42,
      "spreadDistance": 0,
      "color": "rgba(0,0,0,0.28)"
    }
  ],
  "shadowLg": [
    {
      "offsetX": 0,
      "offsetY": 28,
      "blurRadius": 80,
      "spreadDistance": 0,
      "color": "rgba(0,0,0,0.42)"
    }
  ]
};
export const themes = {
  "dark": {
    "background": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "foreground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9804 0.9804 0.9804)",
      "oklch": null
    },
    "card": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0941 0.0941 0.1059)",
      "oklch": null
    },
    "cardForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9804 0.9804 0.9804)",
      "oklch": null
    },
    "popover": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0941 0.0941 0.1059)",
      "oklch": null
    },
    "popoverForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9804 0.9804 0.9804)",
      "oklch": null
    },
    "primary": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "primaryForeground": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0941 0.0941 0.1059)",
      "oklch": null
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
      "oklch": null
    },
    "secondaryForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9804 0.9804 0.9804)",
      "oklch": null
    },
    "muted": {
      "hex": "#27272a",
      "p3": "color(display-p3 0.1529 0.1529 0.1647)",
      "oklch": null
    },
    "mutedForeground": {
      "hex": "#a1a1aa",
      "p3": "color(display-p3 0.6314 0.6314 0.6667)",
      "oklch": null
    },
    "accent": {
      "hex": "#27272a",
      "p3": "color(display-p3 0.1529 0.1529 0.1647)",
      "oklch": null
    },
    "accentForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9804 0.9804 0.9804)",
      "oklch": null
    },
    "destructive": {
      "hex": "#c50f1f",
      "p3": "color(display-p3 0.7725 0.0588 0.1216)",
      "oklch": null
    },
    "destructiveForeground": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "border": {
      "hex": "#2f2f35",
      "p3": "color(display-p3 0.1843 0.1843 0.2078)",
      "oklch": null
    },
    "input": {
      "hex": "#3f3f46",
      "p3": "color(display-p3 0.2471 0.2471 0.2745)",
      "oklch": null
    },
    "ring": {
      "hex": "#71717a",
      "p3": "color(display-p3 0.4431 0.4431 0.4784)",
      "oklch": null
    },
    "chart1": {
      "hex": "#bbdbff",
      "p3": "color(display-p3 0.7333 0.8588 1)",
      "oklch": null
    },
    "chart2": {
      "hex": "#97bfff",
      "p3": "color(display-p3 0.5922 0.749 1)",
      "oklch": null
    },
    "chart3": {
      "hex": "#76a4ff",
      "p3": "color(display-p3 0.4627 0.6431 1)",
      "oklch": null
    },
    "chart4": {
      "hex": "#5789ff",
      "p3": "color(display-p3 0.3412 0.5373 1)",
      "oklch": null
    },
    "chart5": {
      "hex": "#4371f2",
      "p3": "color(display-p3 0.2627 0.4431 0.949)",
      "oklch": null
    },
    "sidebar": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0941 0.0941 0.1059)",
      "oklch": null
    },
    "sidebarForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9804 0.9804 0.9804)",
      "oklch": null
    },
    "sidebarPrimary": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "sidebarPrimaryForeground": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0941 0.0941 0.1059)",
      "oklch": null
    },
    "sidebarAccent": {
      "hex": "#27272a",
      "p3": "color(display-p3 0.1529 0.1529 0.1647)",
      "oklch": null
    },
    "sidebarAccentForeground": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9804 0.9804 0.9804)",
      "oklch": null
    },
    "sidebarBorder": {
      "hex": "#2f2f35",
      "p3": "color(display-p3 0.1843 0.1843 0.2078)",
      "oklch": null
    },
    "sidebarRing": {
      "hex": "#71717a",
      "p3": "color(display-p3 0.4431 0.4431 0.4784)",
      "oklch": null
    },
    "surface1": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0941 0.0941 0.1059)",
      "oklch": null
    },
    "surface2": {
      "hex": "#27272a",
      "p3": "color(display-p3 0.1529 0.1529 0.1647)",
      "oklch": null
    },
    "surface3": {
      "hex": "#27272a",
      "p3": "color(display-p3 0.1529 0.1529 0.1647)",
      "oklch": null
    },
    "surfaceInset": {
      "hex": "#050506",
      "p3": "color(display-p3 0.0196 0.0196 0.0235)",
      "oklch": null
    },
    "surfaceHover": {
      "hex": "#27272a",
      "p3": "color(display-p3 0.1529 0.1529 0.1647)",
      "oklch": null
    },
    "foregroundStrong": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9804 0.9804 0.9804)",
      "oklch": null
    },
    "subtleForeground": {
      "hex": "#a1a1aa",
      "p3": "color(display-p3 0.6314 0.6314 0.6667)",
      "oklch": null
    },
    "borderStrong": {
      "hex": "#a1a1aa",
      "p3": "color(display-p3 0.6314 0.6314 0.6667)",
      "oklch": null
    },
    "fieldBg": {
      "hex": "#27272a",
      "p3": "color(display-p3 0.1529 0.1529 0.1647)",
      "oklch": null
    },
    "overlay": {
      "hex": "#00000080",
      "p3": "color(display-p3 0 0 0 / 0.5)",
      "oklch": "oklch(0 0 0 / 0.5)"
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
      "hex": "#303036",
      "p3": "color(display-p3 0.1882 0.1882 0.2118)",
      "oklch": null
    },
    "segment": {
      "hex": "#3f3f46",
      "p3": "color(display-p3 0.2471 0.2471 0.2745)",
      "oklch": null
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
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "controlSelectedDot": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "primaryMark": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0941 0.0941 0.1059)",
      "oklch": null
    },
    "selection": {
      "hex": "#f0b10038",
      "p3": "color(display-p3 0.9037 0.7031 0.0745 / 0.22)",
      "oklch": "oklch(0.795 0.184 86.047 / 0.22)"
    },
    "successBg": {
      "hex": "#052505",
      "p3": "color(display-p3 0.0196 0.1451 0.0196)",
      "oklch": null
    },
    "warningBg": {
      "hex": "#4a1e04",
      "p3": "color(display-p3 0.2902 0.1177 0.0157)",
      "oklch": null
    },
    "dangerBg": {
      "hex": "#3b0509",
      "p3": "color(display-p3 0.2314 0.0196 0.0353)",
      "oklch": null
    },
    "infoBg": {
      "hex": "#002440",
      "p3": "color(display-p3 0 0.1412 0.251)",
      "oklch": null
    },
    "categoryRed": {
      "hex": "#febab4",
      "p3": "color(display-p3 0.9561 0.7403 0.7122)",
      "oklch": "oklch(0.85 0.08 25)"
    },
    "categoryRedBg": {
      "hex": "#4518169e",
      "p3": "color(display-p3 0.2507 0.1063 0.0949 / 0.62)",
      "oklch": "oklch(0.28 0.07 25 / 0.62)"
    },
    "categoryOrange": {
      "hex": "#f0995b",
      "p3": "color(display-p3 0.8929 0.6169 0.4015)",
      "oklch": "oklch(0.76 0.13 55)"
    },
    "categoryOrangeBg": {
      "hex": "#5f2e009e",
      "p3": "color(display-p3 0.3488 0.1896 0.0504 / 0.62)",
      "oklch": "oklch(0.36 0.089 55 / 0.62)"
    },
    "categoryGreen": {
      "hex": "#8ce6a0",
      "p3": "color(display-p3 0.6318 0.8922 0.6517)",
      "oklch": "oklch(0.85 0.13 150)"
    },
    "categoryGreenBg": {
      "hex": "#0632159e",
      "p3": "color(display-p3 0.0804 0.1929 0.0941 / 0.62)",
      "oklch": "oklch(0.28 0.07 150 / 0.62)"
    },
    "categoryTeal": {
      "hex": "#2bccb4",
      "p3": "color(display-p3 0.3904 0.7868 0.7085)",
      "oklch": "oklch(0.76 0.13 180)"
    },
    "categoryTealBg": {
      "hex": "#01483e9e",
      "p3": "color(display-p3 0.1102 0.2776 0.2454 / 0.62)",
      "oklch": "oklch(0.36 0.065 180 / 0.62)"
    },
    "categoryCyan": {
      "hex": "#83dcfe",
      "p3": "color(display-p3 0.5947 0.8527 0.9816)",
      "oklch": "oklch(0.85 0.098 225)"
    },
    "categoryCyanBg": {
      "hex": "#002e3c9e",
      "p3": "color(display-p3 0.0596 0.1769 0.2311 / 0.62)",
      "oklch": "oklch(0.28 0.053 225 / 0.62)"
    },
    "categoryBlue": {
      "hex": "#83b2fe",
      "p3": "color(display-p3 0.5528 0.6916 0.9715)",
      "oklch": "oklch(0.76 0.121 260)"
    },
    "categoryBlueBg": {
      "hex": "#1f3c6c9e",
      "p3": "color(display-p3 0.1488 0.232 0.4089 / 0.62)",
      "oklch": "oklch(0.36 0.09 260 / 0.62)"
    },
    "categoryViolet": {
      "hex": "#d6c2fe",
      "p3": "color(display-p3 0.8258 0.7619 0.9801)",
      "oklch": "oklch(0.85 0.086 300)"
    },
    "categoryVioletBg": {
      "hex": "#2e1f469e",
      "p3": "color(display-p3 0.1733 0.1257 0.2647 / 0.62)",
      "oklch": "oklch(0.28 0.07 300 / 0.62)"
    },
    "categoryPink": {
      "hex": "#ee8dbd",
      "p3": "color(display-p3 0.8826 0.5723 0.7323)",
      "oklch": "oklch(0.76 0.13 350)"
    },
    "categoryPinkBg": {
      "hex": "#5f26449e",
      "p3": "color(display-p3 0.3434 0.163 0.2612 / 0.62)",
      "oklch": "oklch(0.36 0.09 350 / 0.62)"
    },
    "warning400": {
      "hex": "#faa06b",
      "p3": "color(display-p3 0.9804 0.6274 0.4196)",
      "oklch": null
    },
    "success400": {
      "hex": "#54b054",
      "p3": "color(display-p3 0.3294 0.6902 0.3294)",
      "oklch": null
    },
    "danger400": {
      "hex": "#eeacb2",
      "p3": "color(display-p3 0.9333 0.6745 0.698)",
      "oklch": null
    },
    "info400": {
      "hex": "#5caae5",
      "p3": "color(display-p3 0.3608 0.6667 0.898)",
      "oklch": null
    },
    "success": {
      "hex": "#107c10",
      "p3": "color(display-p3 0.0628 0.4863 0.0628)",
      "oklch": null
    },
    "successForeground": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "successHover": {
      "hex": "#0e700e",
      "p3": "color(display-p3 0.0549 0.4392 0.0549)",
      "oklch": null
    },
    "info": {
      "hex": "#0078d4",
      "p3": "color(display-p3 0 0.4706 0.8314)",
      "oklch": null
    },
    "infoForeground": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "infoHover": {
      "hex": "#006cbf",
      "p3": "color(display-p3 0 0.4235 0.749)",
      "oklch": null
    },
    "warning": {
      "hex": "#f7630c",
      "p3": "color(display-p3 0.9686 0.3882 0.0471)",
      "oklch": null
    },
    "warningForeground": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0941 0.0941 0.1059)",
      "oklch": null
    },
    "warningHover": {
      "hex": "#de590b",
      "p3": "color(display-p3 0.8706 0.349 0.0431)",
      "oklch": null
    },
    "inputStrong": {
      "hex": "#646467",
      "p3": "color(display-p3 0.3922 0.3922 0.4039)",
      "oklch": null
    },
    "controlThumb": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "linkMark": {
      "hex": "#00000000",
      "p3": "color(display-p3 0 0 0 / 0)",
      "oklch": null
    },
    "linkUnderline": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "textMuted": {
      "hex": "#a1a1aa",
      "p3": "color(display-p3 0.6314 0.6314 0.6667)",
      "oklch": null
    },
    "oracle300": {
      "hex": "#bbdbff",
      "p3": "color(display-p3 0.7333 0.8588 1)",
      "oklch": null
    },
    "oracle400": {
      "hex": "#97bfff",
      "p3": "color(display-p3 0.5922 0.749 1)",
      "oklch": null
    },
    "oracle500": {
      "hex": "#76a4ff",
      "p3": "color(display-p3 0.4627 0.6431 1)",
      "oklch": null
    },
    "oracle600": {
      "hex": "#5789ff",
      "p3": "color(display-p3 0.3412 0.5373 1)",
      "oklch": null
    },
    "oracle700": {
      "hex": "#4371f2",
      "p3": "color(display-p3 0.2627 0.4431 0.949)",
      "oklch": null
    }
  },
  "light": {
    "background": {
      "hex": "#f5f5f5",
      "p3": "color(display-p3 0.9608 0.9608 0.9608)",
      "oklch": null
    },
    "foreground": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "card": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "cardForeground": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "popover": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "popoverForeground": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "primary": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "primaryForeground": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0941 0.0941 0.1059)",
      "oklch": null
    },
    "link": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "linkHover": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "secondary": {
      "hex": "#ebebed",
      "p3": "color(display-p3 0.9216 0.9216 0.9294)",
      "oklch": null
    },
    "secondaryForeground": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "muted": {
      "hex": "#ebebed",
      "p3": "color(display-p3 0.9216 0.9216 0.9294)",
      "oklch": null
    },
    "mutedForeground": {
      "hex": "#686871",
      "p3": "color(display-p3 0.4078 0.4078 0.4431)",
      "oklch": null
    },
    "accent": {
      "hex": "#ebebed",
      "p3": "color(display-p3 0.9216 0.9216 0.9294)",
      "oklch": null
    },
    "accentForeground": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "destructive": {
      "hex": "#c50f1f",
      "p3": "color(display-p3 0.7725 0.0588 0.1216)",
      "oklch": null
    },
    "destructiveForeground": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "border": {
      "hex": "#e4e4e7",
      "p3": "color(display-p3 0.8941 0.8941 0.9059)",
      "oklch": null
    },
    "input": {
      "hex": "#d4d4d8",
      "p3": "color(display-p3 0.8314 0.8314 0.8471)",
      "oklch": null
    },
    "ring": {
      "hex": "#8a8a93",
      "p3": "color(display-p3 0.5412 0.5412 0.5765)",
      "oklch": null
    },
    "chart1": {
      "hex": "#4589d2",
      "p3": "color(display-p3 0.2706 0.5373 0.8235)",
      "oklch": null
    },
    "chart2": {
      "hex": "#246cdf",
      "p3": "color(display-p3 0.1412 0.4235 0.8745)",
      "oklch": null
    },
    "chart3": {
      "hex": "#114fda",
      "p3": "color(display-p3 0.0667 0.3098 0.8549)",
      "oklch": null
    },
    "chart4": {
      "hex": "#0c37c4",
      "p3": "color(display-p3 0.0471 0.2157 0.7686)",
      "oklch": null
    },
    "chart5": {
      "hex": "#0c24a3",
      "p3": "color(display-p3 0.0471 0.1412 0.6392)",
      "oklch": null
    },
    "sidebar": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "sidebarForeground": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "sidebarPrimary": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "sidebarPrimaryForeground": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0941 0.0941 0.1059)",
      "oklch": null
    },
    "sidebarAccent": {
      "hex": "#ebebed",
      "p3": "color(display-p3 0.9216 0.9216 0.9294)",
      "oklch": null
    },
    "sidebarAccentForeground": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "sidebarBorder": {
      "hex": "#e4e4e7",
      "p3": "color(display-p3 0.8941 0.8941 0.9059)",
      "oklch": null
    },
    "sidebarRing": {
      "hex": "#8a8a93",
      "p3": "color(display-p3 0.5412 0.5412 0.5765)",
      "oklch": null
    },
    "surface1": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "surface2": {
      "hex": "#ebebed",
      "p3": "color(display-p3 0.9216 0.9216 0.9294)",
      "oklch": null
    },
    "surface3": {
      "hex": "#ebebed",
      "p3": "color(display-p3 0.9216 0.9216 0.9294)",
      "oklch": null
    },
    "surfaceInset": {
      "hex": "#efeff1",
      "p3": "color(display-p3 0.9373 0.9373 0.9451)",
      "oklch": null
    },
    "surfaceHover": {
      "hex": "#f4f4f5",
      "p3": "color(display-p3 0.9569 0.9569 0.9608)",
      "oklch": null
    },
    "foregroundStrong": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "subtleForeground": {
      "hex": "#686871",
      "p3": "color(display-p3 0.4078 0.4078 0.4431)",
      "oklch": null
    },
    "borderStrong": {
      "hex": "#686871",
      "p3": "color(display-p3 0.4078 0.4078 0.4431)",
      "oklch": null
    },
    "fieldBg": {
      "hex": "#ebebed",
      "p3": "color(display-p3 0.9216 0.9216 0.9294)",
      "oklch": null
    },
    "overlay": {
      "hex": "#00000066",
      "p3": "color(display-p3 0 0 0 / 0.4)",
      "oklch": "oklch(0 0 0 / 0.4)"
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
      "hex": "#e4e4e7",
      "p3": "color(display-p3 0.8941 0.8941 0.9059)",
      "oklch": null
    },
    "segment": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": "oklch(1 0 0)"
    },
    "focus": {
      "hex": "#bd7000",
      "p3": "color(display-p3 0.7412 0.4392 0)",
      "oklch": null
    },
    "focusStrong": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "primaryEmphasis": {
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
    },
    "primaryOutline": {
      "hex": "#f0b10059",
      "p3": "color(display-p3 0.9412 0.6941 0 / 0.35)",
      "oklch": null
    },
    "controlSelected": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "controlSelectedForeground": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "controlSelectedDot": {
      "hex": "#fafafa",
      "p3": "color(display-p3 0.9803 0.9803 0.9803)",
      "oklch": "oklch(0.985 0 0)"
    },
    "primaryMark": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0941 0.0941 0.1059)",
      "oklch": null
    },
    "success400": {
      "hex": "#0e700e",
      "p3": "color(display-p3 0.0549 0.4392 0.0549)",
      "oklch": null
    },
    "warning400": {
      "hex": "#8a3707",
      "p3": "color(display-p3 0.5412 0.2157 0.0274)",
      "oklch": null
    },
    "danger400": {
      "hex": "#b10e1c",
      "p3": "color(display-p3 0.6941 0.0549 0.1098)",
      "oklch": null
    },
    "info400": {
      "hex": "#006cbf",
      "p3": "color(display-p3 0 0.4235 0.749)",
      "oklch": null
    },
    "oracle300": {
      "hex": "#4589d2",
      "p3": "color(display-p3 0.2706 0.5373 0.8235)",
      "oklch": null
    },
    "oracle400": {
      "hex": "#246cdf",
      "p3": "color(display-p3 0.1412 0.4235 0.8745)",
      "oklch": null
    },
    "selection": {
      "hex": "#f0b1002e",
      "p3": "color(display-p3 0.9037 0.7031 0.0745 / 0.18)",
      "oklch": "oklch(0.795 0.184 86.047 / 0.18)"
    },
    "successBg": {
      "hex": "#f1faf1",
      "p3": "color(display-p3 0.9451 0.9804 0.9451)",
      "oklch": null
    },
    "warningBg": {
      "hex": "#fff9f5",
      "p3": "color(display-p3 1 0.9765 0.9608)",
      "oklch": null
    },
    "dangerBg": {
      "hex": "#fdf3f4",
      "p3": "color(display-p3 0.9922 0.9529 0.9569)",
      "oklch": null
    },
    "infoBg": {
      "hex": "#f3f9fd",
      "p3": "color(display-p3 0.9529 0.9765 0.9922)",
      "oklch": null
    },
    "categoryRed": {
      "hex": "#af3c3a",
      "p3": "color(display-p3 0.6339 0.2679 0.2457)",
      "oklch": "oklch(0.52 0.15 25)"
    },
    "categoryRedBg": {
      "hex": "#ffedeb",
      "p3": "color(display-p3 0.9866 0.9327 0.9249)",
      "oklch": "oklch(0.96 0.019 25)"
    },
    "categoryOrange": {
      "hex": "#8a4603",
      "p3": "color(display-p3 0.5071 0.2873 0.0967)",
      "oklch": "oklch(0.47 0.115 55)"
    },
    "categoryOrangeBg": {
      "hex": "#ffdfcb",
      "p3": "color(display-p3 0.9778 0.88 0.8062)",
      "oklch": "oklch(0.925 0.044 55)"
    },
    "categoryGreen": {
      "hex": "#077e39",
      "p3": "color(display-p3 0.2177 0.4876 0.2543)",
      "oklch": "oklch(0.52 0.141 150)"
    },
    "categoryGreenBg": {
      "hex": "#e2f9e6",
      "p3": "color(display-p3 0.9034 0.9734 0.9062)",
      "oklch": "oklch(0.96 0.035 150)"
    },
    "categoryTeal": {
      "hex": "#056a5d",
      "p3": "color(display-p3 0.1782 0.4087 0.3641)",
      "oklch": "oklch(0.47 0.084 180)"
    },
    "categoryTealBg": {
      "hex": "#bff3e7",
      "p3": "color(display-p3 0.7908 0.9468 0.9087)",
      "oklch": "oklch(0.925 0.055 180)"
    },
    "categoryCyan": {
      "hex": "#067493",
      "p3": "color(display-p3 0.1982 0.4474 0.5631)",
      "oklch": "oklch(0.52 0.097 225)"
    },
    "categoryCyanBg": {
      "hex": "#e1f6ff",
      "p3": "color(display-p3 0.8975 0.9615 0.9945)",
      "oklch": "oklch(0.96 0.025 225)"
    },
    "categoryBlue": {
      "hex": "#2256ad",
      "p3": "color(display-p3 0.1882 0.3339 0.6563)",
      "oklch": "oklch(0.47 0.15 260)"
    },
    "categoryBlueBg": {
      "hex": "#d9e7fe",
      "p3": "color(display-p3 0.861 0.905 0.9888)",
      "oklch": "oklch(0.925 0.035 260)"
    },
    "categoryViolet": {
      "hex": "#7750b1",
      "p3": "color(display-p3 0.4454 0.3196 0.6721)",
      "oklch": "oklch(0.52 0.15 300)"
    },
    "categoryVioletBg": {
      "hex": "#f4efff",
      "p3": "color(display-p3 0.9524 0.9371 0.9944)",
      "oklch": "oklch(0.96 0.022 300)"
    },
    "categoryPink": {
      "hex": "#942d66",
      "p3": "color(display-p3 0.5355 0.2057 0.3945)",
      "oklch": "oklch(0.47 0.15 350)"
    },
    "categoryPinkBg": {
      "hex": "#fedbea",
      "p3": "color(display-p3 0.9749 0.8635 0.916)",
      "oklch": "oklch(0.925 0.044 350)"
    },
    "success": {
      "hex": "#107c10",
      "p3": "color(display-p3 0.0628 0.4863 0.0628)",
      "oklch": null
    },
    "successForeground": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "successHover": {
      "hex": "#0e700e",
      "p3": "color(display-p3 0.0549 0.4392 0.0549)",
      "oklch": null
    },
    "info": {
      "hex": "#0078d4",
      "p3": "color(display-p3 0 0.4706 0.8314)",
      "oklch": null
    },
    "infoForeground": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "infoHover": {
      "hex": "#006cbf",
      "p3": "color(display-p3 0 0.4235 0.749)",
      "oklch": null
    },
    "warning": {
      "hex": "#f7630c",
      "p3": "color(display-p3 0.9686 0.3882 0.0471)",
      "oklch": null
    },
    "warningForeground": {
      "hex": "#18181b",
      "p3": "color(display-p3 0.0941 0.0941 0.1059)",
      "oklch": null
    },
    "warningHover": {
      "hex": "#de590b",
      "p3": "color(display-p3 0.8706 0.349 0.0431)",
      "oklch": null
    },
    "inputStrong": {
      "hex": "#8d8d91",
      "p3": "color(display-p3 0.5529 0.5529 0.5686)",
      "oklch": null
    },
    "linkMark": {
      "hex": "#f0b10073",
      "p3": "color(display-p3 0.9412 0.6941 0 / 0.45)",
      "oklch": null
    },
    "linkUnderline": {
      "hex": "#f0b100",
      "p3": "color(display-p3 0.9037 0.7031 0.0745)",
      "oklch": "oklch(0.795 0.184 86.047)"
    },
    "controlThumb": {
      "hex": "#ffffff",
      "p3": "color(display-p3 1 1 1)",
      "oklch": null
    },
    "warning500": {
      "hex": "#d07612",
      "p3": "color(display-p3 0.8157 0.4627 0.0706)",
      "oklch": null
    },
    "textMuted": {
      "hex": "#686871",
      "p3": "color(display-p3 0.4078 0.4078 0.4431)",
      "oklch": null
    },
    "oracle500": {
      "hex": "#114fda",
      "p3": "color(display-p3 0.0667 0.3098 0.8549)",
      "oklch": null
    },
    "oracle600": {
      "hex": "#0c37c4",
      "p3": "color(display-p3 0.0471 0.2157 0.7686)",
      "oklch": null
    },
    "oracle700": {
      "hex": "#0c24a3",
      "p3": "color(display-p3 0.0471 0.1412 0.6392)",
      "oklch": null
    }
  }
};
export const densities = {
  "compact": {
    "controlHXs": 24,
    "controlHSm": 28,
    "controlHMd": 32,
    "controlHLg": 36,
    "controlHXl": 44,
    "touchControlHSm": 36,
    "touchControlHMd": 44,
    "touchControlHLg": 52,
    "rowH": 42,
    "cardPad": 12,
    "sectionGap": 18
  },
  "comfortable": {
    "controlHXs": 26,
    "controlHSm": 32,
    "controlHMd": 36,
    "controlHLg": 40,
    "controlHXl": 50,
    "touchControlHSm": 40,
    "touchControlHMd": 48,
    "touchControlHLg": 56,
    "rowH": 48,
    "cardPad": 16,
    "sectionGap": 24
  },
  "spacious": {
    "controlHXs": 28,
    "controlHSm": 36,
    "controlHMd": 40,
    "controlHLg": 44,
    "controlHXl": 56,
    "touchControlHSm": 44,
    "touchControlHMd": 52,
    "touchControlHLg": 60,
    "rowH": 54,
    "cardPad": 20,
    "sectionGap": 32
  }
};
