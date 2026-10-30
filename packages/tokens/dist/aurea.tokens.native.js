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
      "hex": "#5e5e65",
      "p3": "color(display-p3 0.3686 0.3686 0.3961)",
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
      "hex": "#09090b",
      "p3": "color(display-p3 0.0353 0.0353 0.0431)",
      "oklch": null
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
      "hex": "#5e5e65",
      "p3": "color(display-p3 0.3686 0.3686 0.3961)",
      "oklch": null
    },
    "borderStrong": {
      "hex": "#5e5e65",
      "p3": "color(display-p3 0.3686 0.3686 0.3961)",
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
      "hex": "#5e5e65",
      "p3": "color(display-p3 0.3686 0.3686 0.3961)",
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
export const brands = {
  "ember": {
    "dark": {
      "background": {
        "hex": "#070e15",
        "p3": "color(display-p3 0.0341 0.0537 0.079)",
        "oklch": "oklch(0.16 0.018 250)"
      },
      "foreground": {
        "hex": "#eff2f6",
        "p3": "color(display-p3 0.9388 0.9491 0.9621)",
        "oklch": "oklch(0.96 0.006 250)"
      },
      "card": {
        "hex": "#111921",
        "p3": "color(display-p3 0.074 0.0975 0.1275)",
        "oklch": "oklch(0.21 0.02 250)"
      },
      "cardForeground": {
        "hex": "#eff2f6",
        "p3": "color(display-p3 0.9388 0.9491 0.9621)",
        "oklch": "oklch(0.96 0.006 250)"
      },
      "popover": {
        "hex": "#111921",
        "p3": "color(display-p3 0.074 0.0975 0.1275)",
        "oklch": "oklch(0.21 0.02 250)"
      },
      "popoverForeground": {
        "hex": "#eff2f6",
        "p3": "color(display-p3 0.9388 0.9491 0.9621)",
        "oklch": "oklch(0.96 0.006 250)"
      },
      "primary": {
        "hex": "#ff7716",
        "p3": "color(display-p3 0.9354 0.4975 0.2145)",
        "oklch": "oklch(0.72 0.19 48)"
      },
      "primaryForeground": {
        "hex": "#070e16",
        "p3": "color(display-p3 0.0322 0.0538 0.0819)",
        "oklch": "oklch(0.16 0.02 250)"
      },
      "secondary": {
        "hex": "#19212a",
        "p3": "color(display-p3 0.1052 0.1296 0.1607)",
        "oklch": "oklch(0.245 0.02 250)"
      },
      "secondaryForeground": {
        "hex": "#eff2f6",
        "p3": "color(display-p3 0.9388 0.9491 0.9621)",
        "oklch": "oklch(0.96 0.006 250)"
      },
      "muted": {
        "hex": "#0d151c",
        "p3": "color(display-p3 0.0567 0.0797 0.109)",
        "oklch": "oklch(0.19 0.02 250)"
      },
      "mutedForeground": {
        "hex": "#9ea6ae",
        "p3": "color(display-p3 0.6242 0.6481 0.6785)",
        "oklch": "oklch(0.72 0.015 250)"
      },
      "accent": {
        "hex": "#522404",
        "p3": "color(display-p3 0.2981 0.1511 0.049)",
        "oklch": "oklch(0.32 0.08 50)"
      },
      "accentForeground": {
        "hex": "#ffb769",
        "p3": "color(display-p3 1 0.7314 0.4648)",
        "oklch": "oklch(0.85 0.14 60)"
      },
      "destructive": {
        "hex": "#ff645f",
        "p3": "color(display-p3 0.9272 0.4311 0.3968)",
        "oklch": "oklch(0.7 0.19 25)"
      },
      "destructiveForeground": {
        "hex": "#070e16",
        "p3": "color(display-p3 0.0322 0.0538 0.0819)",
        "oklch": "oklch(0.16 0.02 250)"
      },
      "border": {
        "hex": "#ffffff1a",
        "p3": "color(display-p3 1 1 1 / 0.1)",
        "oklch": "oklch(1 0 0 / 0.1)"
      },
      "input": {
        "hex": "#ffffff1a",
        "p3": "color(display-p3 1 1 1 / 0.1)",
        "oklch": "oklch(1 0 0 / 0.1)"
      },
      "ring": {
        "hex": "#ff7716",
        "p3": "color(display-p3 0.9354 0.4975 0.2145)",
        "oklch": "oklch(0.72 0.19 48)"
      },
      "chart1": {
        "hex": "#ff822a",
        "p3": "color(display-p3 0.9452 0.538 0.2588)",
        "oklch": "oklch(0.74 0.18 50)"
      },
      "chart2": {
        "hex": "#f0c551",
        "p3": "color(display-p3 0.9156 0.7777 0.3965)",
        "oklch": "oklch(0.84 0.14 88)"
      },
      "chart3": {
        "hex": "#37c080",
        "p3": "color(display-p3 0.3896 0.7431 0.5212)",
        "oklch": "oklch(0.72 0.15 158)"
      },
      "chart4": {
        "hex": "#37aae3",
        "p3": "color(display-p3 0.354 0.6583 0.8706)",
        "oklch": "oklch(0.7 0.13 235)"
      },
      "chart5": {
        "hex": "#c374d5",
        "p3": "color(display-p3 0.7215 0.4696 0.8132)",
        "oklch": "oklch(0.68 0.16 320)"
      },
      "sidebar": {
        "hex": "#111921",
        "p3": "color(display-p3 0.074 0.0975 0.1275)",
        "oklch": "oklch(0.21 0.02 250)"
      },
      "sidebarForeground": {
        "hex": "#eff2f6",
        "p3": "color(display-p3 0.9388 0.9491 0.9621)",
        "oklch": "oklch(0.96 0.006 250)"
      },
      "sidebarPrimary": {
        "hex": "#ff7716",
        "p3": "color(display-p3 0.9354 0.4975 0.2145)",
        "oklch": "oklch(0.72 0.19 48)"
      },
      "sidebarPrimaryForeground": {
        "hex": "#070e16",
        "p3": "color(display-p3 0.0322 0.0538 0.0819)",
        "oklch": "oklch(0.16 0.02 250)"
      },
      "sidebarAccent": {
        "hex": "#19212a",
        "p3": "color(display-p3 0.1052 0.1296 0.1607)",
        "oklch": "oklch(0.245 0.02 250)"
      },
      "sidebarAccentForeground": {
        "hex": "#eff2f6",
        "p3": "color(display-p3 0.9388 0.9491 0.9621)",
        "oklch": "oklch(0.96 0.006 250)"
      },
      "sidebarBorder": {
        "hex": "#ffffff1a",
        "p3": "color(display-p3 1 1 1 / 0.1)",
        "oklch": "oklch(1 0 0 / 0.1)"
      },
      "sidebarRing": {
        "hex": "#ff7716",
        "p3": "color(display-p3 0.9354 0.4975 0.2145)",
        "oklch": "oklch(0.72 0.19 48)"
      },
      "surface1": {
        "hex": "#111921",
        "p3": "color(display-p3 0.074 0.0975 0.1275)",
        "oklch": "oklch(0.21 0.02 250)"
      },
      "surface2": {
        "hex": "#19212a",
        "p3": "color(display-p3 0.1052 0.1296 0.1607)",
        "oklch": "oklch(0.245 0.02 250)"
      },
      "surface3": {
        "hex": "#0d151c",
        "p3": "color(display-p3 0.0567 0.0797 0.109)",
        "oklch": "oklch(0.19 0.02 250)"
      },
      "surfaceInset": {
        "hex": "#0d151c",
        "p3": "color(display-p3 0.0567 0.0797 0.109)",
        "oklch": "oklch(0.19 0.02 250)"
      },
      "surfaceHover": {
        "hex": "#19212a",
        "p3": "color(display-p3 0.1052 0.1296 0.1607)",
        "oklch": "oklch(0.245 0.02 250)"
      },
      "foregroundStrong": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "subtleForeground": {
        "hex": "#9ea6ae",
        "p3": "color(display-p3 0.6242 0.6481 0.6785)",
        "oklch": "oklch(0.72 0.015 250)"
      },
      "borderStrong": {
        "hex": "#ffffff2e",
        "p3": "color(display-p3 1 1 1 / 0.18)",
        "oklch": "oklch(1 0 0 / 0.18)"
      },
      "fieldBg": {
        "hex": "#0d151c",
        "p3": "color(display-p3 0.0567 0.0797 0.109)",
        "oklch": "oklch(0.19 0.02 250)"
      },
      "overlay": {
        "hex": "#00000099",
        "p3": "color(display-p3 0 0 0 / 0.6)",
        "oklch": "oklch(0 0 0 / 0.6)"
      },
      "primaryHover": {
        "hex": "#ff9246",
        "p3": "color(display-p3 0.9855 0.5981 0.3416)",
        "oklch": "oklch(0.78 0.17 50)"
      },
      "primaryActive": {
        "hex": "#eb6200",
        "p3": "color(display-p3 0.8575 0.4177 0.1466)",
        "oklch": "oklch(0.66 0.19 46)"
      },
      "secondaryHover": {
        "hex": "#212a33",
        "p3": "color(display-p3 0.1377 0.1628 0.195)",
        "oklch": "oklch(0.28 0.02 250)"
      },
      "segment": {
        "hex": "#29323b",
        "p3": "color(display-p3 0.1683 0.1941 0.2271)",
        "oklch": "oklch(0.312 0.02 250)"
      },
      "focus": {
        "hex": "#ff7716",
        "p3": "color(display-p3 0.9354 0.4975 0.2145)",
        "oklch": "oklch(0.72 0.19 48)"
      },
      "focusStrong": {
        "hex": "#ffb769",
        "p3": "color(display-p3 1 0.7314 0.4648)",
        "oklch": "oklch(0.85 0.14 60)"
      },
      "primaryEmphasis": {
        "hex": "#ffb769",
        "p3": "color(display-p3 1 0.7314 0.4648)",
        "oklch": "oklch(0.85 0.14 60)"
      },
      "primaryOutline": {
        "hex": "#ff771666",
        "p3": "color(display-p3 0.9354 0.4975 0.2145 / 0.4)",
        "oklch": "oklch(0.72 0.19 48 / 0.4)"
      },
      "controlSelected": {
        "hex": "#ff7716",
        "p3": "color(display-p3 0.9354 0.4975 0.2145)",
        "oklch": "oklch(0.72 0.19 48)"
      },
      "controlSelectedForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "primaryMark": {
        "hex": "#070e16",
        "p3": "color(display-p3 0.0322 0.0538 0.0819)",
        "oklch": "oklch(0.16 0.02 250)"
      },
      "selection": {
        "hex": "#522404",
        "p3": "color(display-p3 0.2981 0.1511 0.049)",
        "oklch": "oklch(0.32 0.08 50)"
      },
      "successBg": {
        "hex": "#073d25",
        "p3": "color(display-p3 0.0999 0.2362 0.1517)",
        "oklch": "oklch(0.32 0.07 158)"
      },
      "warningBg": {
        "hex": "#4b3301",
        "p3": "color(display-p3 0.2789 0.204 0.0478)",
        "oklch": "oklch(0.34 0.07 80)"
      },
      "dangerBg": {
        "hex": "#5e211f",
        "p3": "color(display-p3 0.3406 0.1448 0.1307)",
        "oklch": "oklch(0.34 0.09 25)"
      },
      "infoBg": {
        "hex": "#0b374d",
        "p3": "color(display-p3 0.0974 0.2132 0.2938)",
        "oklch": "oklch(0.32 0.06 235)"
      },
      "warning400": {
        "hex": "#e8ab3e",
        "p3": "color(display-p3 0.8736 0.6801 0.3274)",
        "oklch": "oklch(0.78 0.14 78)"
      },
      "success400": {
        "hex": "#37c080",
        "p3": "color(display-p3 0.3896 0.7431 0.5212)",
        "oklch": "oklch(0.72 0.15 158)"
      },
      "danger400": {
        "hex": "#ff736d",
        "p3": "color(display-p3 0.931 0.4836 0.4461)",
        "oklch": "oklch(0.722 0.1717 25)"
      },
      "info400": {
        "hex": "#37aae3",
        "p3": "color(display-p3 0.354 0.6583 0.8706)",
        "oklch": "oklch(0.7 0.13 235)"
      },
      "warningForeground": {
        "hex": "#242424",
        "p3": "color(display-p3 0.1412 0.1412 0.1412)",
        "oklch": null
      },
      "controlThumb": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "linkUnderline": {
        "hex": "#ff7716",
        "p3": "color(display-p3 0.9354 0.4975 0.2145)",
        "oklch": "oklch(0.72 0.19 48)"
      },
      "sidebarContrast": {
        "hex": "#04080d",
        "p3": "color(display-p3 0.0157 0.0314 0.051)",
        "oklch": null
      },
      "sidebarContrastAccent": {
        "hex": "#0d151c",
        "p3": "color(display-p3 0.051 0.0824 0.1098)",
        "oklch": null
      },
      "sidebarContrastForeground": {
        "hex": "#e1e5ea",
        "p3": "color(display-p3 0.8823 0.898 0.9176)",
        "oklch": null
      },
      "sidebarContrastMuted": {
        "hex": "#7a8188",
        "p3": "color(display-p3 0.4784 0.5059 0.5333)",
        "oklch": null
      },
      "brandYellowInk": {
        "hex": "#242424",
        "p3": "color(display-p3 0.1412 0.1412 0.1412)",
        "oklch": null
      },
      "textMuted": {
        "hex": "#9ea6ae",
        "p3": "color(display-p3 0.6242 0.6481 0.6785)",
        "oklch": "oklch(0.72 0.015 250)"
      },
      "oracle300": {
        "hex": "#ff822a",
        "p3": "color(display-p3 0.9452 0.538 0.2588)",
        "oklch": "oklch(0.74 0.18 50)"
      },
      "oracle400": {
        "hex": "#f0c551",
        "p3": "color(display-p3 0.9156 0.7777 0.3965)",
        "oklch": "oklch(0.84 0.14 88)"
      },
      "oracle500": {
        "hex": "#37c080",
        "p3": "color(display-p3 0.3896 0.7431 0.5212)",
        "oklch": "oklch(0.72 0.15 158)"
      },
      "oracle600": {
        "hex": "#37aae3",
        "p3": "color(display-p3 0.354 0.6583 0.8706)",
        "oklch": "oklch(0.7 0.13 235)"
      },
      "oracle700": {
        "hex": "#c374d5",
        "p3": "color(display-p3 0.7215 0.4696 0.8132)",
        "oklch": "oklch(0.68 0.16 320)"
      }
    },
    "light": {
      "background": {
        "hex": "#fcf9f7",
        "p3": "color(display-p3 0.9848 0.9779 0.9691)",
        "oklch": "oklch(0.984 0.004 70)"
      },
      "foreground": {
        "hex": "#172029",
        "p3": "color(display-p3 0.0984 0.1251 0.1592)",
        "oklch": "oklch(0.24 0.022 250)"
      },
      "card": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "cardForeground": {
        "hex": "#172029",
        "p3": "color(display-p3 0.0984 0.1251 0.1592)",
        "oklch": "oklch(0.24 0.022 250)"
      },
      "popover": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "popoverForeground": {
        "hex": "#172029",
        "p3": "color(display-p3 0.0984 0.1251 0.1592)",
        "oklch": "oklch(0.24 0.022 250)"
      },
      "primary": {
        "hex": "#f76500",
        "p3": "color(display-p3 0.8989 0.4331 0.1717)",
        "oklch": "oklch(0.682 0.197 44.5)"
      },
      "primaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
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
        "hex": "#f6f3ef",
        "p3": "color(display-p3 0.9628 0.9524 0.9394)",
        "oklch": "oklch(0.965 0.006 70)"
      },
      "secondaryForeground": {
        "hex": "#172029",
        "p3": "color(display-p3 0.0984 0.1251 0.1592)",
        "oklch": "oklch(0.24 0.022 250)"
      },
      "muted": {
        "hex": "#f6f3ef",
        "p3": "color(display-p3 0.9628 0.9524 0.9394)",
        "oklch": "oklch(0.965 0.006 70)"
      },
      "mutedForeground": {
        "hex": "#5a616b",
        "p3": "color(display-p3 0.3572 0.3799 0.415)",
        "oklch": "oklch(0.49 0.018 255)"
      },
      "accent": {
        "hex": "#ffecd8",
        "p3": "color(display-p3 1 0.9301 0.8552)",
        "oklch": "oklch(0.96 0.04 60)"
      },
      "accentForeground": {
        "hex": "#b33c00",
        "p3": "color(display-p3 0.6487 0.2683 0)",
        "oklch": "oklch(0.52 0.17 45)"
      },
      "destructive": {
        "hex": "#ea3c3c",
        "p3": "color(display-p3 0.845 0.2964 0.2673)",
        "oklch": "oklch(0.62 0.21 26)"
      },
      "destructiveForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "border": {
        "hex": "#e0e3e7",
        "p3": "color(display-p3 0.8813 0.8902 0.9039)",
        "oklch": "oklch(0.915 0.006 255)"
      },
      "input": {
        "hex": "#e0e3e7",
        "p3": "color(display-p3 0.8813 0.8902 0.9039)",
        "oklch": "oklch(0.915 0.006 255)"
      },
      "ring": {
        "hex": "#f76500",
        "p3": "color(display-p3 0.8989 0.4331 0.1717)",
        "oklch": "oklch(0.682 0.197 44.5)"
      },
      "chart1": {
        "hex": "#f76500",
        "p3": "color(display-p3 0.8989 0.4331 0.1717)",
        "oklch": "oklch(0.682 0.197 44.5)"
      },
      "chart2": {
        "hex": "#ecbd3a",
        "p3": "color(display-p3 0.8981 0.7499 0.332)",
        "oklch": "oklch(0.82 0.15 88)"
      },
      "chart3": {
        "hex": "#29ac68",
        "p3": "color(display-p3 0.3346 0.6658 0.4319)",
        "oklch": "oklch(0.66 0.15 155)"
      },
      "chart4": {
        "hex": "#0891c9",
        "p3": "color(display-p3 0.2534 0.5599 0.7674)",
        "oklch": "oklch(0.62 0.13 235)"
      },
      "chart5": {
        "hex": "#a95cbb",
        "p3": "color(display-p3 0.6223 0.3742 0.7114)",
        "oklch": "oklch(0.6 0.16 320)"
      },
      "sidebar": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "sidebarForeground": {
        "hex": "#172029",
        "p3": "color(display-p3 0.0984 0.1251 0.1592)",
        "oklch": "oklch(0.24 0.022 250)"
      },
      "sidebarPrimary": {
        "hex": "#b33c00",
        "p3": "color(display-p3 0.6487 0.2683 0)",
        "oklch": "oklch(0.52 0.17 45)"
      },
      "sidebarPrimaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "sidebarAccent": {
        "hex": "#f8f6f4",
        "p3": "color(display-p3 0.973 0.9661 0.9573)",
        "oklch": "oklch(0.975 0.004 70)"
      },
      "sidebarAccentForeground": {
        "hex": "#172029",
        "p3": "color(display-p3 0.0984 0.1251 0.1592)",
        "oklch": "oklch(0.24 0.022 250)"
      },
      "sidebarBorder": {
        "hex": "#e0e3e7",
        "p3": "color(display-p3 0.8813 0.8902 0.9039)",
        "oklch": "oklch(0.915 0.006 255)"
      },
      "sidebarRing": {
        "hex": "#f76500",
        "p3": "color(display-p3 0.8989 0.4331 0.1717)",
        "oklch": "oklch(0.682 0.197 44.5)"
      },
      "surface1": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "surface2": {
        "hex": "#f8f6f4",
        "p3": "color(display-p3 0.973 0.9661 0.9573)",
        "oklch": "oklch(0.975 0.004 70)"
      },
      "surface3": {
        "hex": "#f6f3ef",
        "p3": "color(display-p3 0.9628 0.9524 0.9394)",
        "oklch": "oklch(0.965 0.006 70)"
      },
      "surfaceInset": {
        "hex": "#f6f3ef",
        "p3": "color(display-p3 0.9628 0.9524 0.9394)",
        "oklch": "oklch(0.965 0.006 70)"
      },
      "surfaceHover": {
        "hex": "#f6f3ef",
        "p3": "color(display-p3 0.9628 0.9524 0.9394)",
        "oklch": "oklch(0.965 0.006 70)"
      },
      "foregroundStrong": {
        "hex": "#070e16",
        "p3": "color(display-p3 0.0322 0.0538 0.0819)",
        "oklch": "oklch(0.16 0.02 250)"
      },
      "subtleForeground": {
        "hex": "#5a616b",
        "p3": "color(display-p3 0.3572 0.3799 0.415)",
        "oklch": "oklch(0.49 0.018 255)"
      },
      "borderStrong": {
        "hex": "#cdd1d6",
        "p3": "color(display-p3 0.8084 0.8201 0.8381)",
        "oklch": "oklch(0.86 0.008 255)"
      },
      "fieldBg": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "overlay": {
        "hex": "#070e1573",
        "p3": "color(display-p3 0.0341 0.0537 0.079 / 0.45)",
        "oklch": "oklch(0.16 0.018 250 / 0.45)"
      },
      "primaryHover": {
        "hex": "#e45400",
        "p3": "color(display-p3 0.8286 0.3673 0.0792)",
        "oklch": "oklch(0.63 0.197 44.5)"
      },
      "primaryActive": {
        "hex": "#cf4600",
        "p3": "color(display-p3 0.7528 0.3139 0)",
        "oklch": "oklch(0.58 0.19 44.5)"
      },
      "secondaryHover": {
        "hex": "#eeeae7",
        "p3": "color(display-p3 0.9301 0.9199 0.9069)",
        "oklch": "oklch(0.94 0.006 70)"
      },
      "focus": {
        "hex": "#f76500",
        "p3": "color(display-p3 0.8989 0.4331 0.1717)",
        "oklch": "oklch(0.682 0.197 44.5)"
      },
      "focusStrong": {
        "hex": "#b33c00",
        "p3": "color(display-p3 0.6487 0.2683 0)",
        "oklch": "oklch(0.52 0.17 45)"
      },
      "primaryEmphasis": {
        "hex": "#b33c00",
        "p3": "color(display-p3 0.6487 0.2683 0)",
        "oklch": "oklch(0.52 0.17 45)"
      },
      "primaryOutline": {
        "hex": "#f7650059",
        "p3": "color(display-p3 0.8989 0.4331 0.1717 / 0.35)",
        "oklch": "oklch(0.682 0.197 44.5 / 0.35)"
      },
      "controlSelected": {
        "hex": "#f76500",
        "p3": "color(display-p3 0.8989 0.4331 0.1717)",
        "oklch": "oklch(0.682 0.197 44.5)"
      },
      "controlSelectedForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "primaryMark": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "success400": {
        "hex": "#037e47",
        "p3": "color(display-p3 0.2138 0.4847 0.2973)",
        "oklch": "oklch(0.52 0.1276 155)"
      },
      "warning400": {
        "hex": "#926100",
        "p3": "color(display-p3 0.5441 0.389 0.1177)",
        "oklch": "oklch(0.532 0.1129 75)"
      },
      "danger400": {
        "hex": "#cd1723",
        "p3": "color(display-p3 0.7389 0.1855 0.1765)",
        "oklch": "oklch(0.542 0.21 26)"
      },
      "info400": {
        "hex": "#0473a1",
        "p3": "color(display-p3 0.1952 0.4457 0.6151)",
        "oklch": "oklch(0.526 0.1106 235)"
      },
      "oracle300": {
        "hex": "#f76500",
        "p3": "color(display-p3 0.8989 0.4331 0.1717)",
        "oklch": "oklch(0.682 0.197 44.5)"
      },
      "oracle400": {
        "hex": "#ecbd3a",
        "p3": "color(display-p3 0.8981 0.7499 0.332)",
        "oklch": "oklch(0.82 0.15 88)"
      },
      "selection": {
        "hex": "#ffecd8",
        "p3": "color(display-p3 1 0.9301 0.8552)",
        "oklch": "oklch(0.96 0.04 60)"
      },
      "successBg": {
        "hex": "#d5f9e0",
        "p3": "color(display-p3 0.8632 0.9726 0.8857)",
        "oklch": "oklch(0.95 0.05 155)"
      },
      "warningBg": {
        "hex": "#ffebc2",
        "p3": "color(display-p3 1 0.9246 0.7781)",
        "oklch": "oklch(0.95 0.06 80)"
      },
      "dangerBg": {
        "hex": "#ffe2de",
        "p3": "color(display-p3 1 0.8942 0.8747)",
        "oklch": "oklch(0.95 0.05 25)"
      },
      "infoBg": {
        "hex": "#d6f4ff",
        "p3": "color(display-p3 0.8604 0.9516 1)",
        "oklch": "oklch(0.95 0.04 235)"
      },
      "warningForeground": {
        "hex": "#242424",
        "p3": "color(display-p3 0.1412 0.1412 0.1412)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#f76500",
        "p3": "color(display-p3 0.8989 0.4331 0.1717)",
        "oklch": "oklch(0.682 0.197 44.5)"
      },
      "controlThumb": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": "oklch(1 0 0)"
      },
      "warning500": {
        "hex": "#e98d35",
        "p3": "color(display-p3 0.8653 0.5711 0.2835)",
        "oklch": "oklch(0.727 0.149 60)"
      },
      "sidebarContrast": {
        "hex": "#0e141c",
        "p3": "color(display-p3 0.0549 0.0784 0.1098)",
        "oklch": null
      },
      "sidebarContrastAccent": {
        "hex": "#182029",
        "p3": "color(display-p3 0.0941 0.1255 0.1608)",
        "oklch": null
      },
      "sidebarContrastForeground": {
        "hex": "#e4e8ed",
        "p3": "color(display-p3 0.8941 0.9098 0.9294)",
        "oklch": null
      },
      "sidebarContrastMuted": {
        "hex": "#8c939b",
        "p3": "color(display-p3 0.549 0.5765 0.6078)",
        "oklch": null
      },
      "brandYellowInk": {
        "hex": "#242424",
        "p3": "color(display-p3 0.1412 0.1412 0.1412)",
        "oklch": null
      },
      "textMuted": {
        "hex": "#5a616b",
        "p3": "color(display-p3 0.3572 0.3799 0.415)",
        "oklch": "oklch(0.49 0.018 255)"
      },
      "oracle500": {
        "hex": "#29ac68",
        "p3": "color(display-p3 0.3346 0.6658 0.4319)",
        "oklch": "oklch(0.66 0.15 155)"
      },
      "oracle600": {
        "hex": "#0891c9",
        "p3": "color(display-p3 0.2534 0.5599 0.7674)",
        "oklch": "oklch(0.62 0.13 235)"
      },
      "oracle700": {
        "hex": "#a95cbb",
        "p3": "color(display-p3 0.6223 0.3742 0.7114)",
        "oklch": "oklch(0.6 0.16 320)"
      }
    }
  },
  "sun": {
    "dark": {
      "primary": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "link": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "linkHover": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "accent": {
        "hex": "#38311a",
        "p3": "color(display-p3 0.2196 0.1922 0.102)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "ring": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#fbd34e",
        "p3": "color(display-p3 0.9843 0.8275 0.3059)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#eabe13",
        "p3": "color(display-p3 0.9176 0.7451 0.0745)",
        "oklch": null
      },
      "focus": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "focusStrong": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#facc1559",
        "p3": "color(display-p3 0.9804 0.8 0.0824 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#facc1538",
        "p3": "color(display-p3 0.9804 0.8 0.0824 / 0.2196)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#facc15bf",
        "p3": "color(display-p3 0.9804 0.8 0.0824 / 0.75)",
        "oklch": null
      }
    },
    "light": {
      "primary": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "accent": {
        "hex": "#fef8de",
        "p3": "color(display-p3 0.9961 0.9726 0.8706)",
        "oklch": null
      },
      "ring": {
        "hex": "#b27600",
        "p3": "color(display-p3 0.698 0.4627 0)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#b27600",
        "p3": "color(display-p3 0.698 0.4627 0)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#fbd34e",
        "p3": "color(display-p3 0.9843 0.8275 0.3059)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#eabe13",
        "p3": "color(display-p3 0.9176 0.7451 0.0745)",
        "oklch": null
      },
      "focus": {
        "hex": "#b27600",
        "p3": "color(display-p3 0.698 0.4627 0)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#facc1559",
        "p3": "color(display-p3 0.9804 0.8 0.0824 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#facc152e",
        "p3": "color(display-p3 0.9804 0.8 0.0824 / 0.1804)",
        "oklch": null
      },
      "linkMark": {
        "hex": "#facc1573",
        "p3": "color(display-p3 0.9804 0.8 0.0824 / 0.451)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#facc15",
        "p3": "color(display-p3 0.9804 0.8 0.0824)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#facc15bf",
        "p3": "color(display-p3 0.9804 0.8 0.0824 / 0.75)",
        "oklch": null
      }
    }
  },
  "honey": {
    "dark": {
      "primary": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "link": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "linkHover": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "accent": {
        "hex": "#372c1c",
        "p3": "color(display-p3 0.2157 0.1726 0.1098)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "ring": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#f7b04e",
        "p3": "color(display-p3 0.9686 0.6902 0.3059)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#e59a21",
        "p3": "color(display-p3 0.898 0.6039 0.1294)",
        "oklch": null
      },
      "focus": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "focusStrong": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#f5a52459",
        "p3": "color(display-p3 0.9608 0.6471 0.1412 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#f5a52438",
        "p3": "color(display-p3 0.9608 0.6471 0.1412 / 0.2196)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#f5a524bf",
        "p3": "color(display-p3 0.9608 0.6471 0.1412 / 0.75)",
        "oklch": null
      }
    },
    "light": {
      "primary": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "accent": {
        "hex": "#fef2e0",
        "p3": "color(display-p3 0.9961 0.949 0.8784)",
        "oklch": null
      },
      "ring": {
        "hex": "#cc6700",
        "p3": "color(display-p3 0.8 0.4039 0)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#cc6700",
        "p3": "color(display-p3 0.8 0.4039 0)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#f7b04e",
        "p3": "color(display-p3 0.9686 0.6902 0.3059)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#e59a21",
        "p3": "color(display-p3 0.898 0.6039 0.1294)",
        "oklch": null
      },
      "focus": {
        "hex": "#cc6700",
        "p3": "color(display-p3 0.8 0.4039 0)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#f5a52459",
        "p3": "color(display-p3 0.9608 0.6471 0.1412 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#f5a5242e",
        "p3": "color(display-p3 0.9608 0.6471 0.1412 / 0.1804)",
        "oklch": null
      },
      "linkMark": {
        "hex": "#f5a52473",
        "p3": "color(display-p3 0.9608 0.6471 0.1412 / 0.451)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#f5a524bf",
        "p3": "color(display-p3 0.9608 0.6471 0.1412 / 0.75)",
        "oklch": null
      }
    }
  },
  "orange": {
    "dark": {
      "primary": {
        "hex": "#ff7a1a",
        "p3": "color(display-p3 1 0.4784 0.102)",
        "oklch": null
      },
      "link": {
        "hex": "#ff904f",
        "p3": "color(display-p3 1 0.5647 0.3098)",
        "oklch": null
      },
      "linkHover": {
        "hex": "#ff904f",
        "p3": "color(display-p3 1 0.5647 0.3098)",
        "oklch": null
      },
      "accent": {
        "hex": "#38261b",
        "p3": "color(display-p3 0.2196 0.149 0.1059)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#ff904f",
        "p3": "color(display-p3 1 0.5647 0.3098)",
        "oklch": null
      },
      "ring": {
        "hex": "#ff7a1a",
        "p3": "color(display-p3 1 0.4784 0.102)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#ff904f",
        "p3": "color(display-p3 1 0.5647 0.3098)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#ff7a1a",
        "p3": "color(display-p3 1 0.4784 0.102)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#ff8c46",
        "p3": "color(display-p3 1 0.549 0.2745)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#ee7218",
        "p3": "color(display-p3 0.9333 0.4471 0.0941)",
        "oklch": null
      },
      "focus": {
        "hex": "#ff7a1a",
        "p3": "color(display-p3 1 0.4784 0.102)",
        "oklch": null
      },
      "focusStrong": {
        "hex": "#ff7a1a",
        "p3": "color(display-p3 1 0.4784 0.102)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#ff904f",
        "p3": "color(display-p3 1 0.5647 0.3098)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#ff7a1a59",
        "p3": "color(display-p3 1 0.4784 0.102 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#ff7a1a",
        "p3": "color(display-p3 1 0.4784 0.102)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#ff7a1a38",
        "p3": "color(display-p3 1 0.4784 0.102 / 0.2196)",
        "oklch": null
      },
      "warningBg": {
        "hex": "#4a320b",
        "p3": "color(display-p3 0.2902 0.1961 0.0431)",
        "oklch": null
      },
      "warning400": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "warning": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "warningHover": {
        "hex": "#f7b04e",
        "p3": "color(display-p3 0.9686 0.6902 0.3059)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#ff7a1a",
        "p3": "color(display-p3 1 0.4784 0.102)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#ff7a1abf",
        "p3": "color(display-p3 1 0.4784 0.102 / 0.75)",
        "oklch": null
      }
    },
    "light": {
      "primary": {
        "hex": "#ff7a1a",
        "p3": "color(display-p3 1 0.4784 0.102)",
        "oklch": null
      },
      "accent": {
        "hex": "#ffecdf",
        "p3": "color(display-p3 1 0.9255 0.8745)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#a44900",
        "p3": "color(display-p3 0.6431 0.2863 0)",
        "oklch": null
      },
      "ring": {
        "hex": "#d46100",
        "p3": "color(display-p3 0.8314 0.3804 0)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#a44900",
        "p3": "color(display-p3 0.6431 0.2863 0)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#d46100",
        "p3": "color(display-p3 0.8314 0.3804 0)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#ff8c46",
        "p3": "color(display-p3 1 0.549 0.2745)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#ee7218",
        "p3": "color(display-p3 0.9333 0.4471 0.0941)",
        "oklch": null
      },
      "focus": {
        "hex": "#d46100",
        "p3": "color(display-p3 0.8314 0.3804 0)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#a44900",
        "p3": "color(display-p3 0.6431 0.2863 0)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#ff7a1a59",
        "p3": "color(display-p3 1 0.4784 0.102 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#ff7a1a",
        "p3": "color(display-p3 1 0.4784 0.102)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "warning400": {
        "hex": "#8c5b00",
        "p3": "color(display-p3 0.549 0.3569 0)",
        "oklch": null
      },
      "selection": {
        "hex": "#ff7a1a2e",
        "p3": "color(display-p3 1 0.4784 0.102 / 0.1804)",
        "oklch": null
      },
      "warningBg": {
        "hex": "#fffbf6",
        "p3": "color(display-p3 1 0.9843 0.9647)",
        "oklch": null
      },
      "warning": {
        "hex": "#f5a524",
        "p3": "color(display-p3 0.9608 0.6471 0.1412)",
        "oklch": null
      },
      "warningHover": {
        "hex": "#f7b04e",
        "p3": "color(display-p3 0.9686 0.6902 0.3059)",
        "oklch": null
      },
      "linkMark": {
        "hex": "#ff7a1a73",
        "p3": "color(display-p3 1 0.4784 0.102 / 0.451)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#ff7a1a",
        "p3": "color(display-p3 1 0.4784 0.102)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#ff7a1abf",
        "p3": "color(display-p3 1 0.4784 0.102 / 0.75)",
        "oklch": null
      }
    }
  },
  "magenta": {
    "dark": {
      "primary": {
        "hex": "#e0196e",
        "p3": "color(display-p3 0.8784 0.098 0.4314)",
        "oklch": null
      },
      "primaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "link": {
        "hex": "#ff88a8",
        "p3": "color(display-p3 1 0.5333 0.6588)",
        "oklch": null
      },
      "linkHover": {
        "hex": "#ff88a8",
        "p3": "color(display-p3 1 0.5333 0.6588)",
        "oklch": null
      },
      "accent": {
        "hex": "#341827",
        "p3": "color(display-p3 0.2039 0.0941 0.1529)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#ff88a8",
        "p3": "color(display-p3 1 0.5333 0.6588)",
        "oklch": null
      },
      "ring": {
        "hex": "#ff4688",
        "p3": "color(display-p3 1 0.2745 0.5333)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#ff88a8",
        "p3": "color(display-p3 1 0.5333 0.6588)",
        "oklch": null
      },
      "sidebarPrimaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#ff4688",
        "p3": "color(display-p3 1 0.2745 0.5333)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#bd135c",
        "p3": "color(display-p3 0.7412 0.0745 0.3608)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#bd135c",
        "p3": "color(display-p3 0.7412 0.0745 0.3608)",
        "oklch": null
      },
      "focus": {
        "hex": "#ff4688",
        "p3": "color(display-p3 1 0.2745 0.5333)",
        "oklch": null
      },
      "focusStrong": {
        "hex": "#e0196e",
        "p3": "color(display-p3 0.8784 0.098 0.4314)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#ff88a8",
        "p3": "color(display-p3 1 0.5333 0.6588)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#e0196e59",
        "p3": "color(display-p3 0.8784 0.098 0.4314 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#e0196e",
        "p3": "color(display-p3 0.8784 0.098 0.4314)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "primaryMark": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#e0196e38",
        "p3": "color(display-p3 0.8784 0.098 0.4314 / 0.2196)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#e0196e",
        "p3": "color(display-p3 0.8784 0.098 0.4314)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#e0196ebf",
        "p3": "color(display-p3 0.8784 0.098 0.4314 / 0.75)",
        "oklch": null
      },
      "primaryGradientEnd": {
        "hex": "#8a0b41",
        "p3": "color(display-p3 0.4966 0.1103 0.256)",
        "oklch": "oklch(0.4137 0.1594 3.94)"
      }
    },
    "light": {
      "primary": {
        "hex": "#e0196e",
        "p3": "color(display-p3 0.8784 0.098 0.4314)",
        "oklch": null
      },
      "primaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "accent": {
        "hex": "#fbdfeb",
        "p3": "color(display-p3 0.9843 0.8745 0.9216)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#bb0059",
        "p3": "color(display-p3 0.7333 0 0.349)",
        "oklch": null
      },
      "ring": {
        "hex": "#e0196e",
        "p3": "color(display-p3 0.8784 0.098 0.4314)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#bb0059",
        "p3": "color(display-p3 0.7333 0 0.349)",
        "oklch": null
      },
      "sidebarPrimaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#e0196e",
        "p3": "color(display-p3 0.8784 0.098 0.4314)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#bd135c",
        "p3": "color(display-p3 0.7412 0.0745 0.3608)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#bd135c",
        "p3": "color(display-p3 0.7412 0.0745 0.3608)",
        "oklch": null
      },
      "focus": {
        "hex": "#e0196e",
        "p3": "color(display-p3 0.8784 0.098 0.4314)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#bb0059",
        "p3": "color(display-p3 0.7333 0 0.349)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#e0196e59",
        "p3": "color(display-p3 0.8784 0.098 0.4314 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#e0196e",
        "p3": "color(display-p3 0.8784 0.098 0.4314)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "primaryMark": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#e0196e2e",
        "p3": "color(display-p3 0.8784 0.098 0.4314 / 0.1804)",
        "oklch": null
      },
      "linkMark": {
        "hex": "#e0196e73",
        "p3": "color(display-p3 0.8784 0.098 0.4314 / 0.451)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#e0196e",
        "p3": "color(display-p3 0.8784 0.098 0.4314)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#e0196ebf",
        "p3": "color(display-p3 0.8784 0.098 0.4314 / 0.75)",
        "oklch": null
      },
      "primaryGradientEnd": {
        "hex": "#8a0b41",
        "p3": "color(display-p3 0.4966 0.1103 0.256)",
        "oklch": "oklch(0.4137 0.1594 3.94)"
      }
    }
  },
  "violet": {
    "dark": {
      "primary": {
        "hex": "#7c3aed",
        "p3": "color(display-p3 0.4863 0.2275 0.9294)",
        "oklch": null
      },
      "primaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "link": {
        "hex": "#b49eff",
        "p3": "color(display-p3 0.7059 0.6196 1)",
        "oklch": null
      },
      "linkHover": {
        "hex": "#b49eff",
        "p3": "color(display-p3 0.7059 0.6196 1)",
        "oklch": null
      },
      "accent": {
        "hex": "#261d38",
        "p3": "color(display-p3 0.149 0.1137 0.2196)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#b49eff",
        "p3": "color(display-p3 0.7059 0.6196 1)",
        "oklch": null
      },
      "ring": {
        "hex": "#9c76ff",
        "p3": "color(display-p3 0.6118 0.4627 1)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#b49eff",
        "p3": "color(display-p3 0.7059 0.6196 1)",
        "oklch": null
      },
      "sidebarPrimaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#9c76ff",
        "p3": "color(display-p3 0.6118 0.4627 1)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#682fc8",
        "p3": "color(display-p3 0.4078 0.1843 0.7843)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#682fc8",
        "p3": "color(display-p3 0.4078 0.1843 0.7843)",
        "oklch": null
      },
      "focus": {
        "hex": "#9c76ff",
        "p3": "color(display-p3 0.6118 0.4627 1)",
        "oklch": null
      },
      "focusStrong": {
        "hex": "#7c3aed",
        "p3": "color(display-p3 0.4863 0.2275 0.9294)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#b49eff",
        "p3": "color(display-p3 0.7059 0.6196 1)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#7c3aed59",
        "p3": "color(display-p3 0.4863 0.2275 0.9294 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#7c3aed",
        "p3": "color(display-p3 0.4863 0.2275 0.9294)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "primaryMark": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#7c3aed38",
        "p3": "color(display-p3 0.4863 0.2275 0.9294 / 0.2196)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#7c3aed",
        "p3": "color(display-p3 0.4863 0.2275 0.9294)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#7c3aedbf",
        "p3": "color(display-p3 0.4863 0.2275 0.9294 / 0.75)",
        "oklch": null
      },
      "primaryGradientEnd": {
        "hex": "#4a2093",
        "p3": "color(display-p3 0.2704 0.1349 0.5532)",
        "oklch": "oklch(0.3789 0.1726 293.01)"
      }
    },
    "light": {
      "primary": {
        "hex": "#7c3aed",
        "p3": "color(display-p3 0.4863 0.2275 0.9294)",
        "oklch": null
      },
      "primaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "accent": {
        "hex": "#ede3fc",
        "p3": "color(display-p3 0.9294 0.8902 0.9882)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#7530e4",
        "p3": "color(display-p3 0.4588 0.1882 0.8941)",
        "oklch": null
      },
      "ring": {
        "hex": "#7c3aed",
        "p3": "color(display-p3 0.4863 0.2275 0.9294)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#7530e4",
        "p3": "color(display-p3 0.4588 0.1882 0.8941)",
        "oklch": null
      },
      "sidebarPrimaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#7c3aed",
        "p3": "color(display-p3 0.4863 0.2275 0.9294)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#682fc8",
        "p3": "color(display-p3 0.4078 0.1843 0.7843)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#682fc8",
        "p3": "color(display-p3 0.4078 0.1843 0.7843)",
        "oklch": null
      },
      "focus": {
        "hex": "#7c3aed",
        "p3": "color(display-p3 0.4863 0.2275 0.9294)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#7530e4",
        "p3": "color(display-p3 0.4588 0.1882 0.8941)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#7c3aed59",
        "p3": "color(display-p3 0.4863 0.2275 0.9294 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#7c3aed",
        "p3": "color(display-p3 0.4863 0.2275 0.9294)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "primaryMark": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#7c3aed2e",
        "p3": "color(display-p3 0.4863 0.2275 0.9294 / 0.1804)",
        "oklch": null
      },
      "linkMark": {
        "hex": "#7c3aed73",
        "p3": "color(display-p3 0.4863 0.2275 0.9294 / 0.451)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#7c3aed",
        "p3": "color(display-p3 0.4863 0.2275 0.9294)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#7c3aedbf",
        "p3": "color(display-p3 0.4863 0.2275 0.9294 / 0.75)",
        "oklch": null
      },
      "primaryGradientEnd": {
        "hex": "#4a2093",
        "p3": "color(display-p3 0.2704 0.1349 0.5532)",
        "oklch": "oklch(0.3789 0.1726 293.01)"
      }
    }
  },
  "indigo": {
    "dark": {
      "primary": {
        "hex": "#4f46e5",
        "p3": "color(display-p3 0.3098 0.2745 0.898)",
        "oklch": null
      },
      "primaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "link": {
        "hex": "#9aa6ff",
        "p3": "color(display-p3 0.6039 0.651 1)",
        "oklch": null
      },
      "linkHover": {
        "hex": "#9aa6ff",
        "p3": "color(display-p3 0.6039 0.651 1)",
        "oklch": null
      },
      "accent": {
        "hex": "#201e37",
        "p3": "color(display-p3 0.1255 0.1177 0.2157)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#9aa6ff",
        "p3": "color(display-p3 0.6039 0.651 1)",
        "oklch": null
      },
      "ring": {
        "hex": "#7982ff",
        "p3": "color(display-p3 0.4745 0.5098 1)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#9aa6ff",
        "p3": "color(display-p3 0.6039 0.651 1)",
        "oklch": null
      },
      "sidebarPrimaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#7982ff",
        "p3": "color(display-p3 0.4745 0.5098 1)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#413ac1",
        "p3": "color(display-p3 0.2549 0.2275 0.7569)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#413ac1",
        "p3": "color(display-p3 0.2549 0.2275 0.7569)",
        "oklch": null
      },
      "focus": {
        "hex": "#7982ff",
        "p3": "color(display-p3 0.4745 0.5098 1)",
        "oklch": null
      },
      "focusStrong": {
        "hex": "#4f46e5",
        "p3": "color(display-p3 0.3098 0.2745 0.898)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#9aa6ff",
        "p3": "color(display-p3 0.6039 0.651 1)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#4f46e559",
        "p3": "color(display-p3 0.3098 0.2745 0.898 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#4f46e5",
        "p3": "color(display-p3 0.3098 0.2745 0.898)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "primaryMark": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#4f46e538",
        "p3": "color(display-p3 0.3098 0.2745 0.898 / 0.2196)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#4f46e5",
        "p3": "color(display-p3 0.3098 0.2745 0.898)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#4f46e5bf",
        "p3": "color(display-p3 0.3098 0.2745 0.898 / 0.75)",
        "oklch": null
      },
      "primaryGradientEnd": {
        "hex": "#2e288e",
        "p3": "color(display-p3 0.1748 0.1568 0.5337)",
        "oklch": "oklch(0.3574 0.161 276.97)"
      }
    },
    "light": {
      "primary": {
        "hex": "#4f46e5",
        "p3": "color(display-p3 0.3098 0.2745 0.898)",
        "oklch": null
      },
      "primaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "accent": {
        "hex": "#e6e5fb",
        "p3": "color(display-p3 0.902 0.898 0.9843)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#4e45e4",
        "p3": "color(display-p3 0.3059 0.2706 0.8941)",
        "oklch": null
      },
      "ring": {
        "hex": "#4f46e5",
        "p3": "color(display-p3 0.3098 0.2745 0.898)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#4e45e4",
        "p3": "color(display-p3 0.3059 0.2706 0.8941)",
        "oklch": null
      },
      "sidebarPrimaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#4f46e5",
        "p3": "color(display-p3 0.3098 0.2745 0.898)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#413ac1",
        "p3": "color(display-p3 0.2549 0.2275 0.7569)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#413ac1",
        "p3": "color(display-p3 0.2549 0.2275 0.7569)",
        "oklch": null
      },
      "focus": {
        "hex": "#4f46e5",
        "p3": "color(display-p3 0.3098 0.2745 0.898)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#4e45e4",
        "p3": "color(display-p3 0.3059 0.2706 0.8941)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#4f46e559",
        "p3": "color(display-p3 0.3098 0.2745 0.898 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#4f46e5",
        "p3": "color(display-p3 0.3098 0.2745 0.898)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "primaryMark": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#4f46e52e",
        "p3": "color(display-p3 0.3098 0.2745 0.898 / 0.1804)",
        "oklch": null
      },
      "linkMark": {
        "hex": "#4f46e573",
        "p3": "color(display-p3 0.3098 0.2745 0.898 / 0.451)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#4f46e5",
        "p3": "color(display-p3 0.3098 0.2745 0.898)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#4f46e5bf",
        "p3": "color(display-p3 0.3098 0.2745 0.898 / 0.75)",
        "oklch": null
      },
      "primaryGradientEnd": {
        "hex": "#2e288e",
        "p3": "color(display-p3 0.1748 0.1568 0.5337)",
        "oklch": "oklch(0.3574 0.161 276.97)"
      }
    }
  },
  "cobalt": {
    "dark": {
      "primary": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "primaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "link": {
        "hex": "#82acff",
        "p3": "color(display-p3 0.5098 0.6745 1)",
        "oklch": null
      },
      "linkHover": {
        "hex": "#82acff",
        "p3": "color(display-p3 0.5098 0.6745 1)",
        "oklch": null
      },
      "accent": {
        "hex": "#151e39",
        "p3": "color(display-p3 0.0824 0.1177 0.2235)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#82acff",
        "p3": "color(display-p3 0.5098 0.6745 1)",
        "oklch": null
      },
      "ring": {
        "hex": "#548aff",
        "p3": "color(display-p3 0.3294 0.5412 1)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#82acff",
        "p3": "color(display-p3 0.5098 0.6745 1)",
        "oklch": null
      },
      "sidebarPrimaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#548aff",
        "p3": "color(display-p3 0.3294 0.5412 1)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#013acb",
        "p3": "color(display-p3 0.0039 0.2275 0.7961)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#013acb",
        "p3": "color(display-p3 0.0039 0.2275 0.7961)",
        "oklch": null
      },
      "focus": {
        "hex": "#548aff",
        "p3": "color(display-p3 0.3294 0.5412 1)",
        "oklch": null
      },
      "focusStrong": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#82acff",
        "p3": "color(display-p3 0.5098 0.6745 1)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#0246f159",
        "p3": "color(display-p3 0.0078 0.2745 0.9451 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "primaryMark": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#0246f138",
        "p3": "color(display-p3 0.0078 0.2745 0.9451 / 0.2196)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#0246f1bf",
        "p3": "color(display-p3 0.0078 0.2745 0.9451 / 0.75)",
        "oklch": null
      },
      "primaryGradientEnd": {
        "hex": "#012895",
        "p3": "color(display-p3 0.0496 0.1531 0.5623)",
        "oklch": "oklch(0.3466 0.1812 263.46)"
      }
    },
    "light": {
      "primary": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "primaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "accent": {
        "hex": "#dce5fd",
        "p3": "color(display-p3 0.8628 0.898 0.9922)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "ring": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "sidebarPrimaryForeground": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#013acb",
        "p3": "color(display-p3 0.0039 0.2275 0.7961)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#013acb",
        "p3": "color(display-p3 0.0039 0.2275 0.7961)",
        "oklch": null
      },
      "focus": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#0246f159",
        "p3": "color(display-p3 0.0078 0.2745 0.9451 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "primaryMark": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#0246f12e",
        "p3": "color(display-p3 0.0078 0.2745 0.9451 / 0.1804)",
        "oklch": null
      },
      "linkMark": {
        "hex": "#0246f173",
        "p3": "color(display-p3 0.0078 0.2745 0.9451 / 0.451)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#0246f1",
        "p3": "color(display-p3 0.0078 0.2745 0.9451)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#0246f1bf",
        "p3": "color(display-p3 0.0078 0.2745 0.9451 / 0.75)",
        "oklch": null
      },
      "primaryGradientEnd": {
        "hex": "#012895",
        "p3": "color(display-p3 0.0496 0.1531 0.5623)",
        "oklch": "oklch(0.3466 0.1812 263.46)"
      }
    }
  },
  "cyan": {
    "dark": {
      "primary": {
        "hex": "#06b6d4",
        "p3": "color(display-p3 0.0235 0.7137 0.8314)",
        "oklch": null
      },
      "link": {
        "hex": "#1cbcdb",
        "p3": "color(display-p3 0.1098 0.7372 0.8588)",
        "oklch": null
      },
      "linkHover": {
        "hex": "#1cbcdb",
        "p3": "color(display-p3 0.1098 0.7372 0.8588)",
        "oklch": null
      },
      "accent": {
        "hex": "#152e35",
        "p3": "color(display-p3 0.0824 0.1804 0.2078)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#1cbcdb",
        "p3": "color(display-p3 0.1098 0.7372 0.8588)",
        "oklch": null
      },
      "ring": {
        "hex": "#06b6d4",
        "p3": "color(display-p3 0.0235 0.7137 0.8314)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#1cbcdb",
        "p3": "color(display-p3 0.1098 0.7372 0.8588)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#06b6d4",
        "p3": "color(display-p3 0.0235 0.7137 0.8314)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#48bfd9",
        "p3": "color(display-p3 0.2823 0.749 0.851)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#05aac6",
        "p3": "color(display-p3 0.0196 0.6667 0.7765)",
        "oklch": null
      },
      "focus": {
        "hex": "#06b6d4",
        "p3": "color(display-p3 0.0235 0.7137 0.8314)",
        "oklch": null
      },
      "focusStrong": {
        "hex": "#06b6d4",
        "p3": "color(display-p3 0.0235 0.7137 0.8314)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#1cbcdb",
        "p3": "color(display-p3 0.1098 0.7372 0.8588)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#06b6d459",
        "p3": "color(display-p3 0.0235 0.7137 0.8314 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#06b6d4",
        "p3": "color(display-p3 0.0235 0.7137 0.8314)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#06b6d438",
        "p3": "color(display-p3 0.0235 0.7137 0.8314 / 0.2196)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#06b6d4",
        "p3": "color(display-p3 0.0235 0.7137 0.8314)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#06b6d4bf",
        "p3": "color(display-p3 0.0235 0.7137 0.8314 / 0.75)",
        "oklch": null
      }
    },
    "light": {
      "primary": {
        "hex": "#06b6d4",
        "p3": "color(display-p3 0.0235 0.7137 0.8314)",
        "oklch": null
      },
      "accent": {
        "hex": "#dcf5f9",
        "p3": "color(display-p3 0.8628 0.9608 0.9765)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#006d80",
        "p3": "color(display-p3 0 0.4274 0.502)",
        "oklch": null
      },
      "ring": {
        "hex": "#008fa8",
        "p3": "color(display-p3 0 0.5608 0.6588)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#006d80",
        "p3": "color(display-p3 0 0.4274 0.502)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#008fa8",
        "p3": "color(display-p3 0 0.5608 0.6588)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#48bfd9",
        "p3": "color(display-p3 0.2823 0.749 0.851)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#05aac6",
        "p3": "color(display-p3 0.0196 0.6667 0.7765)",
        "oklch": null
      },
      "focus": {
        "hex": "#008fa8",
        "p3": "color(display-p3 0 0.5608 0.6588)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#006d80",
        "p3": "color(display-p3 0 0.4274 0.502)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#06b6d459",
        "p3": "color(display-p3 0.0235 0.7137 0.8314 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#06b6d4",
        "p3": "color(display-p3 0.0235 0.7137 0.8314)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#06b6d42e",
        "p3": "color(display-p3 0.0235 0.7137 0.8314 / 0.1804)",
        "oklch": null
      },
      "linkMark": {
        "hex": "#06b6d473",
        "p3": "color(display-p3 0.0235 0.7137 0.8314 / 0.451)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#06b6d4",
        "p3": "color(display-p3 0.0235 0.7137 0.8314)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#06b6d4bf",
        "p3": "color(display-p3 0.0235 0.7137 0.8314 / 0.75)",
        "oklch": null
      }
    }
  },
  "turquoise": {
    "dark": {
      "primary": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "link": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "linkHover": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "accent": {
        "hex": "#17312f",
        "p3": "color(display-p3 0.0902 0.1922 0.1843)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "ring": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#4ecfb2",
        "p3": "color(display-p3 0.3059 0.8118 0.698)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#12bb9d",
        "p3": "color(display-p3 0.0706 0.7333 0.6157)",
        "oklch": null
      },
      "focus": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "focusStrong": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#14c8a859",
        "p3": "color(display-p3 0.0784 0.7843 0.6588 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#14c8a838",
        "p3": "color(display-p3 0.0784 0.7843 0.6588 / 0.2196)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#14c8a8bf",
        "p3": "color(display-p3 0.0784 0.7843 0.6588 / 0.75)",
        "oklch": null
      }
    },
    "light": {
      "primary": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "accent": {
        "hex": "#def7f3",
        "p3": "color(display-p3 0.8706 0.9686 0.9529)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#00715e",
        "p3": "color(display-p3 0 0.4431 0.3686)",
        "oklch": null
      },
      "ring": {
        "hex": "#00937b",
        "p3": "color(display-p3 0 0.5765 0.4824)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#00715e",
        "p3": "color(display-p3 0 0.4431 0.3686)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#00937b",
        "p3": "color(display-p3 0 0.5765 0.4824)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#4ecfb2",
        "p3": "color(display-p3 0.3059 0.8118 0.698)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#12bb9d",
        "p3": "color(display-p3 0.0706 0.7333 0.6157)",
        "oklch": null
      },
      "focus": {
        "hex": "#00937b",
        "p3": "color(display-p3 0 0.5765 0.4824)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#00715e",
        "p3": "color(display-p3 0 0.4431 0.3686)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#14c8a859",
        "p3": "color(display-p3 0.0784 0.7843 0.6588 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#14c8a82e",
        "p3": "color(display-p3 0.0784 0.7843 0.6588 / 0.1804)",
        "oklch": null
      },
      "linkMark": {
        "hex": "#14c8a873",
        "p3": "color(display-p3 0.0784 0.7843 0.6588 / 0.451)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#14c8a8",
        "p3": "color(display-p3 0.0784 0.7843 0.6588)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#14c8a8bf",
        "p3": "color(display-p3 0.0784 0.7843 0.6588 / 0.75)",
        "oklch": null
      }
    }
  },
  "emerald": {
    "dark": {
      "primary": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "link": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "linkHover": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "accent": {
        "hex": "#183125",
        "p3": "color(display-p3 0.0941 0.1922 0.1451)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "ring": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#4dd078",
        "p3": "color(display-p3 0.302 0.8157 0.4706)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#15bc5d",
        "p3": "color(display-p3 0.0824 0.7372 0.3647)",
        "oklch": null
      },
      "focus": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "focusStrong": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#17c96459",
        "p3": "color(display-p3 0.0902 0.7882 0.3922 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#17c96438",
        "p3": "color(display-p3 0.0902 0.7882 0.3922 / 0.2196)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#17c964bf",
        "p3": "color(display-p3 0.0902 0.7882 0.3922 / 0.75)",
        "oklch": null
      }
    },
    "light": {
      "primary": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "accent": {
        "hex": "#dff7e9",
        "p3": "color(display-p3 0.8745 0.9686 0.9137)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#007435",
        "p3": "color(display-p3 0 0.4549 0.2078)",
        "oklch": null
      },
      "ring": {
        "hex": "#009647",
        "p3": "color(display-p3 0 0.5882 0.2784)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#007435",
        "p3": "color(display-p3 0 0.4549 0.2078)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#009647",
        "p3": "color(display-p3 0 0.5882 0.2784)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#4dd078",
        "p3": "color(display-p3 0.302 0.8157 0.4706)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#15bc5d",
        "p3": "color(display-p3 0.0824 0.7372 0.3647)",
        "oklch": null
      },
      "focus": {
        "hex": "#009647",
        "p3": "color(display-p3 0 0.5882 0.2784)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#007435",
        "p3": "color(display-p3 0 0.4549 0.2078)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#17c96459",
        "p3": "color(display-p3 0.0902 0.7882 0.3922 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#17c9642e",
        "p3": "color(display-p3 0.0902 0.7882 0.3922 / 0.1804)",
        "oklch": null
      },
      "linkMark": {
        "hex": "#17c96473",
        "p3": "color(display-p3 0.0902 0.7882 0.3922 / 0.451)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#17c964",
        "p3": "color(display-p3 0.0902 0.7882 0.3922)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#17c964bf",
        "p3": "color(display-p3 0.0902 0.7882 0.3922 / 0.75)",
        "oklch": null
      }
    }
  },
  "lime": {
    "dark": {
      "primary": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "link": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "linkHover": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "accent": {
        "hex": "#2b351f",
        "p3": "color(display-p3 0.1686 0.2078 0.1216)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "ring": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#aeea5b",
        "p3": "color(display-p3 0.6824 0.9176 0.3569)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#98d731",
        "p3": "color(display-p3 0.5961 0.8431 0.1922)",
        "oklch": null
      },
      "focus": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "focusStrong": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#a3e63559",
        "p3": "color(display-p3 0.6392 0.902 0.2078 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#a3e63538",
        "p3": "color(display-p3 0.6392 0.902 0.2078 / 0.2196)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#a3e635bf",
        "p3": "color(display-p3 0.6392 0.902 0.2078 / 0.75)",
        "oklch": null
      }
    },
    "light": {
      "primary": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "accent": {
        "hex": "#f2fce3",
        "p3": "color(display-p3 0.949 0.9882 0.8902)",
        "oklch": null
      },
      "accentForeground": {
        "hex": "#4c7200",
        "p3": "color(display-p3 0.298 0.4471 0)",
        "oklch": null
      },
      "ring": {
        "hex": "#619000",
        "p3": "color(display-p3 0.3804 0.5647 0)",
        "oklch": null
      },
      "sidebarPrimary": {
        "hex": "#4c7200",
        "p3": "color(display-p3 0.298 0.4471 0)",
        "oklch": null
      },
      "sidebarRing": {
        "hex": "#619000",
        "p3": "color(display-p3 0.3804 0.5647 0)",
        "oklch": null
      },
      "primaryHover": {
        "hex": "#aeea5b",
        "p3": "color(display-p3 0.6824 0.9176 0.3569)",
        "oklch": null
      },
      "primaryActive": {
        "hex": "#98d731",
        "p3": "color(display-p3 0.5961 0.8431 0.1922)",
        "oklch": null
      },
      "focus": {
        "hex": "#619000",
        "p3": "color(display-p3 0.3804 0.5647 0)",
        "oklch": null
      },
      "primaryEmphasis": {
        "hex": "#4c7200",
        "p3": "color(display-p3 0.298 0.4471 0)",
        "oklch": null
      },
      "primaryOutline": {
        "hex": "#a3e63559",
        "p3": "color(display-p3 0.6392 0.902 0.2078 / 0.349)",
        "oklch": null
      },
      "controlSelected": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "controlSelectedDot": {
        "hex": "#ffffff",
        "p3": "color(display-p3 1 1 1)",
        "oklch": null
      },
      "selection": {
        "hex": "#a3e6352e",
        "p3": "color(display-p3 0.6392 0.902 0.2078 / 0.1804)",
        "oklch": null
      },
      "linkMark": {
        "hex": "#a3e63573",
        "p3": "color(display-p3 0.6392 0.902 0.2078 / 0.451)",
        "oklch": null
      },
      "linkUnderline": {
        "hex": "#a3e635",
        "p3": "color(display-p3 0.6392 0.902 0.2078)",
        "oklch": null
      },
      "sidebarCurrentLine": {
        "hex": "#a3e635bf",
        "p3": "color(display-p3 0.6392 0.902 0.2078 / 0.75)",
        "oklch": null
      }
    }
  }
};
