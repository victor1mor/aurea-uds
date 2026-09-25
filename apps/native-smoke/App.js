// Aurea — smoke test num aparelho de verdade. CINCO modos, e o app abre no mais novo.
//
// ⚠ **O cabeçalho dizia "num Android de verdade", e isso envelheceu no Lote 7.** As peças de
// busca, número e imagem foram escritas para os DOIS sistemas, e três das oito perguntas do
// modo `lote7` só existem porque o iOS se comporta diferente — o teclado que não encolhe a
// janela, o `decimal-pad` sem tecla de menos, e o VOLTAR que lá não existe. Rodar só no
// Android responde metade.
//
// Nasceu por ordem do Victor em 02/09/2026, para o LOTE 0: *"não autorizaria o Lote 1 ainda (…) É
// começar a construir 6 componentes sobre uma fundação nativa que passou em testes de código, mas
// ainda nunca renderizou em React Native de verdade."* As quatro perguntas dele passaram em
// 03/09, e o modo `lote0` deste app é o instrumento que as respondeu — ele fica intocado.
//
// ⚠ **A FRONTEIRA MUDOU, e por ordem dele.** O cabeçalho antigo dizia *"nenhum componente da
// Aurea entra aqui"*, e isso valeu enquanto não havia componente. Depois do Lote 1 o Victor pediu
// o oposto: *"faça somente o smoke test do `Screen`"*. Então o modo `screen` **importa o `Screen`
// de verdade** — é o único componente da Aurea neste arquivo, e é o que está em julgamento.
//
// O que NÃO mudou: nenhum outro componente entra, e o app continua descartável.
//
// O critério de aprovação está NA TELA, ao lado do que ele julga — para a resposta não depender
// de memória. As quatro perguntas do Lote 0 estão no NATIVE.md §7; as TRÊS do `Screen` estão no
// README daqui e repetidas em cada bloco abaixo.
import * as React from "react";
import {Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions} from "react-native";
import {StatusBar} from "expo-status-bar";
import {useFonts} from "expo-font";
// O `SafeAreaProvider` NÃO é exigido pelo `Screen` — o `SafeAreaView` dele é view nativa e lê o
// inset sozinha. Quem exige o provider é o INSTRUMENTO: `useSafeAreaInsets` é como este app põe o
// número do sistema na tela ao lado do número que ele mediu. Sem os dois, "parece certo" seria a
// única resposta possível, e é exatamente isso que este app existe para não aceitar.
import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context";

import {
  Alert, AureaProvider, Avatar, Badge, BottomNav, BottomSheet, Button, Card, Chart, Checkbox, Code,
  Heading, Paragraph,
  ConfirmDialog, DataList, DataState, Dialog, Drawer, EmptyState, Field, Form, IconButton, Input,
  KPI, KeyboardAvoiding, NavList, Progress, Radio, Screen, Select, SegmentedControl, Skeleton,
  Spinner, Stack, Status, Stepper, Switch, Table, Timeline, ToastHost, Topbar, criarGlifo, criarRegistroDeIcones,
  useAureaTheme, useAureaTokens, useReduceMotion, useToast, ptBR,
  // Os cinco do Lote 7, mais os dois auxiliares públicos do `NumberField`. Eles são públicos
  // porque o app tem o mesmo problema em toda tela de lançamento — e aqui servem de SONDA:
  // `separadoresDoLocale` devolve o que o motor do APARELHO acha que é vírgula e milhar, que é
  // exatamente o que um teste rodando em Node não pode responder.
  Combobox, SearchField, NumberField, Image as AureaImage, Gallery,
  separadoresDoLocale, formatarNumero,
} from "@aurea-uds/native";
import {AUREA_FONTS, FONT_FAMILIES} from "@aurea-uds/fonts/native";

// 🔴 O MARCADOR DE BUILD, e ele encerra a pergunta que custou QUATRO rodadas: "o telefone está
// rodando o meu código?". O `preparar.mjs` grava este arquivo com o commit da árvore que
// acabou de ser empacotada, e as quatro telas o mostram no cabeçalho.
// ⚠ Em 10/09/2026 o Victor consertou três coisas independentes, rodou e disse *"nada mudou"*.
// Três consertos errados ao mesmo tempo é improvável; código que não chega é a explicação
// simples — e nenhum gate existente pega isso, porque o passo 3 do `rodar.mjs` olha o DISCO e o
// telefone pode servir um bundle de cache. **A tela é o único lugar que não mente.**
// ⚠ Não está no git (é gerado). O app já não roda sem `preparar.mjs` — os tarballs do `vendor/`
// também são gerados —, então isto não acrescenta nenhuma condição nova.
import VERSAO from "./versao.json";

// O caminho PROFUNDO, que é a forma documentada pela ADR-0038. Importar do barril traria os 2571.
// Os três primeiros não são aleatórios — cada um prova uma coisa que o gerador podia ter errado:
import IconAdd from "@aurea-uds/native/icons/add";
import IconCheckmarkFilled from "@aurea-uds/native/icons/checkmark--filled";
import IconCalendarAddAlt from "@aurea-uds/native/icons/calendar--add--alt";
// E estes cinco existem para o Lote 2: os quatro glifos de variante do `Alert` e o vazio do
// `EmptyState`. O pacote NÃO os importa por você — seria trazer ícone ao grafo do bundler pelas
// costas do consumidor (ADR-0038, cláusula 4). Esta lista é a prova de que a cláusula é usável.
import IconInformationFilled from "@aurea-uds/native/icons/information--filled";
import IconWarningAltFilled from "@aurea-uds/native/icons/warning--alt--filled";
import IconErrorFilled from "@aurea-uds/native/icons/error--filled";
import IconDocumentBlank from "@aurea-uds/native/icons/document--blank";
import IconNotification from "@aurea-uds/native/icons/notification";
// E estes quatro, para o modo `resto`: a barra inferior, a folha do `Select` e o X dos overlays.
import IconDashboard from "@aurea-uds/native/icons/dashboard";
import IconChevronDown from "@aurea-uds/native/icons/chevron--down";
import IconClose from "@aurea-uds/native/icons/close";
import IconList from "@aurea-uds/native/icons/list";
// ⚠ E estes TRÊS são os PADRÕES de componentes do Lote 3, achados rodando no aparelho em
// 09/09/2026: o `NavList` cai em `chevron--right`, e o `Stepper` em `checkmark`/`error`. Eles não
// aparecem em nenhuma prop escrita aqui — vêm do valor padrão lá dentro —, e é por isso que o
// aviso do `Icon` existe: ele diz o nome que falta e o import exato. Funcionou.
import IconCheckmark from "@aurea-uds/native/icons/checkmark";
import IconChevronRight from "@aurea-uds/native/icons/chevron--right";
import IconError from "@aurea-uds/native/icons/error";
// E estes TRÊS são do Lote 7: a lupa do `SearchField` e da folha do `Combobox`, o `−` do
// `NumberField` (o `+` já estava) e o glifo do substituto da `Image` — que é o único que
// aparece SÓ quando a foto quebra, e por isso é o mais fácil de esquecer.
import IconSearch from "@aurea-uds/native/icons/search";
import IconSubtract from "@aurea-uds/native/icons/subtract";
import IconImage from "@aurea-uds/native/icons/image";

const ICONES = criarRegistroDeIcones({
  "add": IconAdd,
  "checkmark--filled": IconCheckmarkFilled,
  "calendar--add--alt": IconCalendarAddAlt,
  "information--filled": IconInformationFilled,
  "warning--alt--filled": IconWarningAltFilled,
  "error--filled": IconErrorFilled,
  "document--blank": IconDocumentBlank,
  "notification": IconNotification,
  "dashboard": IconDashboard,
  "chevron--down": IconChevronDown,
  "close": IconClose,
  "list": IconList,
  "checkmark": IconCheckmark,
  "chevron--right": IconChevronRight,
  "error": IconError,
  "search": IconSearch,
  "subtract": IconSubtract,
  "image": IconImage,
});

// R-05, a metade que faltava: um glifo PRÓPRIO desenhado só a TRAÇO, como o logotipo do app.
// Um círculo e um visto, sem preenchimento. Se o traço não chegar ao aparelho, a caixa fica VAZIA;
// se o `fill: "none"` não chegar, o círculo vira uma bola cheia e o visto some dentro dela.
const GLIFO_TRACO = criarGlifo({
  fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round",
  circles: [{cx: 16, cy: 16, r: 12}],
  paths: ["M10.5 16.5l3.5 3.5 7.5-8"],
});

const AMARELO_ESPERADO = "#f0b100";

// 🔴 DUAS FOTOS DE VERDADE, EM `data:` — e o "de verdade" é o ponto. Uma `View` cinza provaria
// que a caixa tem o tamanho certo e NADA sobre o que este lote existe para fazer: decodificar
// bytes e desenhar. São PNG de 120×90 gerados aqui (≈700 caracteres cada), **sem rede**, porque
// depender de rede num smoke test é trocar a pergunta "a `Image` desenha?" por "o wi-fi está
// bom?".
// ⚠ Formas chapadas de propósito: **gradiente é proibido na Aurea desde a Fase 0**, e mesmo
// sendo conteúdo e não desenho, não entra um na tela que prova o design system.
const FOTO_A = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABaCAIAAAD8YgW4AAAB1klEQVR42u3b0W3DMAyEYe3Vt47QTbtZR6iBAkXQ1I5lixT/0wE3wPF7iiOyvb1/OAlpJjC0oR1DG9rQVjC0oR1DG9rQVjC0oR1DG9rQjqHn5+uzVYfeKu4FpDyqcEsmBnGPbdumECO460JfUC5rPbxnm65c0Dqip6FR0DeVS1kH9TR00u+lVkS5gnVoVUMburDyhbaGTvoCMLShyyt3dV4dOq320tCZzQ3NgYZ+GQ5UPtN/Uejhyi9HWPTfO0ODlY8HWe6FJVT5YJy13gwTlPeGWusVXA265l5HmvK/M66yqZSs/GxtaEPDlf9YkzbhcMqP1rCtQ5zyL6+hc6FVrYtAb0GuLeOh9azrQotZl4ZWsq4OLWMNgNawZkALWGOg6dYkaK51HeWz0ETrUsod0Czrasp90BTrgsrd0Li7YjA06KgYDw06KsZDg25d8dCgW1c8dAVrhPIAaNxxoKENLXq2hoSWWdkHQGda45QHQ+dYE5XHQ0dbQ5VDoOOsucpR0BHWaOVA6LHWdOVY6FHWAsrh0PetNZQzoO9YyygnQV+zVlLOg+61FlNOhT5vraecDX3GWlJ5AvSxtaryHOg9a2HladDP1trKM6EfreWVJ0P/WK+gvOUbn9HSZ8z/XMsAAAAASUVORK5CYII=";
const FOTO_B = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABaCAIAAAD8YgW4AAAB2klEQVR42u3b0U3EQAyE4a2IJwqgQ+qhBLoiEhI6cSRkk7XX/+xIU8D4e7rc2u3l9c1JSDOBoQ3tGNrQhraCoQ3tGNrQhraCoQ3tGNrQhnYMPT/vH5/VobeKewEpjyrckolB3GPbtinECO660BeUy1oP79mmKxe0juhpaBT0TeVS1kE9DZ30e6kVUa5gHVrV0IYurHyhraGTvgAMbejyyl2dV4dOq700dGZzQ3OgoV+GA5XP9F8UerjyvyMs+u+docHKx4Ms98ISqnwwzlpvhgnKe0Ot9QquBl1zryNN+c8ZV9lUSlZ+tja0oeHKv6wbaBMOp/xo3VhbhzjlH15D50KrWheB3tKIa8t4aD3rutBi1qWhlayrQ8tYA6A1rBnQAtYYaLo1CZprXUf5LDTRupRyBzTLuppyHzTFuqByNzTurhgMDToqxkODjorx0KBbVzw06NYVD13BGqE8ABp3HGhoQ4uerSGhZVb2AdCZ1jjlwdA51kTl8dDR1lDlEOg4a65yFHSENVo5EHqsNV05FnqUtYByOPR9aw3lDOg71jLKSdDXrJWU86B7rcWUU6HPW+spZ0OfsZZUngB9bK2qPAd6z1pYeRr0s7W28kzoR2t55cnQ39YrKG/5AslNZVI0oFh1AAAAAElFTkSuQmCC";

export default function App() {
  const [fontesProntas, erroFonte] = useFonts(AUREA_FONTS);
  if (erroFonte) return <Falha titulo="As fontes não carregaram" detalhe={String(erroFonte)} />;
  if (!fontesProntas) return null;
  return (
    <SafeAreaProvider>
      {/* 🔴 O `strings={ptBR}` ENTROU EM 09/09/2026, e ele é um CONSERTO DO INSTRUMENTO.
          Sem ele o provider cai no `defaultStrings`, que é INGLÊS — o idioma base do produto — e a
          tela saía misturada: o texto do próprio app em português e o da biblioteca em inglês
          (*"Waiting for approval."*, *"This may be out of date."*), o que o Victor viu em foto.
          ⚠ **A biblioteca não estava errada**: sem `strings` o inglês é o comportamento correto.
          Errado era o app, que NUNCA exercitou a tabela de frases — a decisão número 1 do Lote 2
          — e por isso ela nunca tinha sido vista em vidro nenhuma vez.
          ✅ E com isto a tela vira GATE: chave que faltar no `ptBR` aparece em inglês na hora. */}
      <AureaProvider fontFamilies={FONT_FAMILIES} icons={ICONES} strings={ptBR}>
        <StatusBar style="auto" />
        {/* ⚠ O `ToastHost` é EXPLÍCITO por decisão da ADR do Lote 5 — não há portal no RN, e pôr
            a pilha dentro do `AureaProvider` mudaria o layout de todo app em silêncio. Ele estar
            AQUI, e não lá, é a decisão sendo usada como o consumidor vai usar. */}
        <ToastHost offset={72}>
          <Roteador />
        </ToastHost>
      </AureaProvider>
    </SafeAreaProvider>
  );
}

// O app abre no modo mais NOVO — que é sempre o que ainda não foi respondido. Os antigos ficam
// a um toque, porque cada um é o registro do que já foi provado; apagá-los perderia o
// instrumento. Hoje o mais novo é o `lote7`.
function Roteador() {
  const [modo, setModo] = React.useState("lote7");
  const ir = (m) => () => setModo(m);
  if (modo === "lote7") return <SmokeDoLote7 ir={ir} />;
  if (modo === "resto") return <SmokeDoResto ir={ir} />;
  if (modo === "lote2") return <SmokeDoLote2 ir={ir} />;
  if (modo === "screen") return <SmokeDoScreen irParaLote0={ir("lote0")} irParaLote2={ir("lote2")} />;
  return <Tela irParaScreen={ir("screen")} irParaLote2={ir("lote2")} />;
}

function Falha({titulo, detalhe}) {
  return (
    <View style={{flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#300"}}>
      <Text style={{color: "#fff", fontSize: 20, marginBottom: 8}}>{titulo}</Text>
      <Text style={{color: "#fcc"}}>{detalhe}</Text>
    </View>
  );
}

function Tela({irParaScreen, irParaLote2}) {
  const {theme, density, toggleTheme, setDensity} = useAureaTheme();
  const t = useAureaTokens();
  const [ms, setMs] = React.useState(null);

  // PERGUNTA 3, e ela vira NÚMERO em vez de impressão. A ADR-0037 assumiu uma aposta —
  // *"se o contexto do React, sem as otimizações do Unistyles, re-renderiza a ponto de doer"* — e
  // "não doeu" é fraco demais para decidir. Marca-se o toque e mede-se até o efeito que roda
  // depois do commit do render seguinte. Não é o tempo de pintura do sistema; é o custo do
  // caminho que a ADR-0037 escolheu, que é o que está em julgamento.
  const t0 = React.useRef(null);
  React.useEffect(() => {
    if (t0.current !== null) {
      setMs(Date.now() - t0.current);
      t0.current = null;
    }
  }, [theme, density]);
  const cronometrar = (fn) => () => { t0.current = Date.now(); fn(); };

  const s = estilos(t);

  return (
    <ScrollView style={s.fundo} contentContainerStyle={s.conteudo}>
      <Text style={s.h1}>Aurea · smoke do Lote 0</Text>
      <Text style={s.legenda}>
        tema {theme} · densidade {density}
        {ms !== null ? ` · última troca: ${ms} ms` : ""}
        {"\n"}build {VERSAO.commit}{VERSAO.sujo ? " (arvore suja)" : ""}
      </Text>

      <View style={s.barra}>
        <Botao t={t} onPress={cronometrar(toggleTheme)} rotulo="trocar tema" />
        <Botao t={t} onPress={cronometrar(() => setDensity("compact"))} rotulo="compact" />
        <Botao t={t} onPress={cronometrar(() => setDensity("comfortable"))} rotulo="comfortable" />
        <Botao t={t} onPress={cronometrar(() => setDensity("spacious"))} rotulo="spacious" />
        <Botao t={t} onPress={irParaScreen} rotulo="→ Screen" />
        <Botao t={t} onPress={irParaLote2} rotulo="→ Lote 2" />
      </View>

      {/* ── 1 ─────────────────────────────────────────────────────────────── */}
      <Bloco t={t} n="1" titulo="Os cinco pesos são distintos?"
        criterio={"Regular, Medium, SemiBold e Bold têm de parecer DIFERENTES entre si, e o itálico "
          + "inclinado. Se saírem todos iguais, o nome PostScript não resolveu e a ADR-0039 está "
          + "errada — é o achado mais caro que este app pode dar."}>
        {[["400", "Regular"], ["500", "Medium"], ["600", "SemiBold"], ["700", "Bold"]].map(([p, nome]) => (
          <Text key={p} style={{color: t.color.foreground, fontSize: t.size.textLg,
                                fontFamily: t.font.ui[p]}}>
            {p} {nome} — Aurea Universal Design System
          </Text>
        ))}
        <Text style={{color: t.color.mutedForeground, fontSize: t.size.textMd,
                      fontFamily: t.font.ui.italic}}>
          400 Italic — o único itálico do pacote
        </Text>
        <Text style={s.nota}>
          `editorial[400]` e `code[700]` NÃO existem no IBM Plex — o provider fecha a grade caindo
          para o peso mais próximo. Aqui isso dá {t.font.editorial[400]} e {t.font.code[700]};
          nenhum dos dois pode sair vazio.
        </Text>
        <Text style={{color: t.color.foreground, fontSize: t.size.textLg,
                      fontFamily: t.font.editorial[700], marginTop: t.size.space2}}>
          Serif 700 — IBM Plex Serif
        </Text>
        <Text style={{color: t.color.foreground, fontSize: t.size.textMd,
                      fontFamily: t.font.code[400]}}>
          Mono 400 — const x = 42;
        </Text>
        <Text style={s.nota}>
          Controle: a linha abaixo NÃO passa por `fontFamily` e sai na fonte do sistema. Se ela
          parecer igual às de cima, nenhuma fonte carregou.
        </Text>
        <Text style={{color: t.color.mutedForeground, fontSize: t.size.textLg}}>
          Sem fontFamily — fonte do sistema
        </Text>
      </Bloco>

      {/* ── 1b ── B-02 ────────────────────────────────────────────────────── */}
      <Bloco t={t} n="1b" titulo="Os papéis de texto (B-02) crescem em degraus que se enxergam?"
        criterio={"Os seis títulos têm de DIMINUIR a cada linha, sem dois iguais, e em seminegrito. "
          + "Os três parágrafos são 16, 14 e 12 — o do meio NÃO pode ser do tamanho do primeiro "
          + "(seria o degrau a mais do `size`, que o papel não usa). O código tem fundo e fonte mono; "
          + "no leitor de tela, só os títulos são anunciados como título."}>
        {["h1", "h2", "h3", "h4", "h5", "h6"].map((h) => (
          <Heading key={h} type={h}>{h.toUpperCase()} · Relatórios</Heading>
        ))}
        <Paragraph>Texto corrido — o relatório da semana está pronto.</Paragraph>
        <Paragraph type="body-sm">Texto pequeno — gerado às 09:40.</Paragraph>
        <Paragraph type="body-xs" color="muted">Texto mínimo, apagado — valores arredondados.</Paragraph>
        <Paragraph>Rode <Code>pnpm build</Code> antes de publicar.</Paragraph>
      </Bloco>

      {/* ── 2 ─────────────────────────────────────────────────────────────── */}
      <Bloco t={t} n="2" titulo="Os ícones desenham, e na cor pedida?"
        criterio={"Os quatro têm de aparecer NA COR DO TEXTO, não pretos e não vazios. O do meio é o "
          + "que importa mais: `checkmark--filled` tem um contorno interno com fill=\"none\", e se "
          + "o gerador tivesse pintado esse miolo o visto sumiria dentro de um círculo cheio."}>
        <View style={s.icones}>
          <Glifo t={t} nome="add" Comp={IconAdd} prova="um path simples" />
          <Glifo t={t} nome="checkmark--filled" Comp={IconCheckmarkFilled} prova='o fill="none"' />
          <Glifo t={t} nome="calendar--add--alt" Comp={IconCalendarAddAlt} prova="o <switch> do Illustrator" />
          <Glifo t={t} nome="criarGlifo a traço" Comp={GLIFO_TRACO} prova="círculo VAZADO e visto de traço redondo" />
        </View>
        <View style={s.icones}>
          <IconAdd size={t.size.iconSm} color={t.color.primary} />
          <IconAdd size={t.size.iconMd} color={t.color.primary} />
          <IconAdd size={t.size.iconLg} color={t.color.primary} />
          <IconAdd size={t.size.iconXl} color={t.color.primary} />
        </View>
        <Text style={s.nota}>
          A escala acima é `iconSm/Md/Lg/Xl` do tema ({t.size.iconSm}/{t.size.iconMd}/
          {t.size.iconLg}/{t.size.iconXl} dp) — os quatro têm de crescer, e nenhum ficar borrado.
        </Text>
      </Bloco>

      {/* ── 4 ─────────────────────────────────────────────────────────────── */}
      <Bloco t={t} n="4" titulo="A sombra e o hex pintam certo?"
        criterio={"O cartão acima tem `boxShadow`, que a Etapa 2 mediu ser 1:1 com o CSS mas NUNCA "
          + "testou em aparelho. Tem de haver sombra visível — e no tema light ela é sutil. O "
          + "amarelo tem de ser exatamente " + AMARELO_ESPERADO + "."}>
        <View style={s.amostras}>
          <Amostra t={t} cor={t.color.primary} nome="primary" esperado={AMARELO_ESPERADO} />
          <Amostra t={t} cor={t.color.background} nome="background" />
          <Amostra t={t} cor={t.color.card} nome="card" />
          <Amostra t={t} cor={t.color.border} nome="border" />
        </View>
        <Text style={s.nota}>
          `primary` medido agora: {t.color.primary} · esperado: {AMARELO_ESPERADO}
          {t.color.primary?.toLowerCase() === AMARELO_ESPERADO ? "  ✓ bate" : "  ✗ NÃO BATE"}
        </Text>
        <Text style={s.nota}>
          Em tela de gamute largo este amarelo perde ΔEok 0,0225 contra o `oklch` da web. Não é
          defeito nosso: o interpretador de cor do RN recusa gamute largo (ADR-0027). Teto da
          plataforma, e está declarado.
        </Text>
      </Bloco>

      {/* ── 3 ─────────────────────────────────────────────────────────────── */}
      <Bloco t={t} n="3" titulo="A troca de tema re-renderiza sem doer?"
        criterio={"Trocar tema e densidade com a lista abaixo montada. O número em ms aparece no "
          + "topo. Se passar de ~200 ms ou piscar, a aposta da ADR-0037 (contexto nosso, sem as "
          + "otimizações do Unistyles) precisa de revisão — e aí é ADR nova, não conserto solto."}>
        <Text style={s.nota}>
          40 linhas, cada uma lendo cor, espaço e fonte do tema. É de propósito: uma tela com um
          card só não exercita re-render nenhum.
        </Text>
        {Array.from({length: 40}, (_, i) => (
          <View key={i} style={s.linha}>
            <IconCheckmarkFilled size={t.size.iconSm} color={t.color.primary} />
            <Text style={{color: t.color.foreground, fontSize: t.size.textMd,
                          fontFamily: t.font.ui[400], flex: 1}}>
              linha {String(i + 1).padStart(2, "0")} — altura de controle {t.size.controlHMd} dp
            </Text>
            <Text style={{color: t.color.mutedForeground, fontSize: t.size.textSm,
                          fontFamily: t.font.code[400]}}>
              {t.size.rowH}
            </Text>
          </View>
        ))}
      </Bloco>

      <Text style={s.rodape}>
        Este app é descartável. Esta TELA continua sem nenhum componente da Aurea — é o que ela
        provou em 03/09/2026 e o que ela continua sendo. Quem usa componente é o outro modo.
      </Text>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// O SMOKE DO `Screen` — três perguntas, e as três com NÚMERO na tela.
//
// A ADR-0040 escolheu o `SafeAreaView` da biblioteca em vez do hook `useSafeAreaInsets` porque o
// modo `additive` SOMA o inset ao padding do tema dentro do cálculo do Yoga. Isso foi lido no
// fonte C++ e provado em teste unitário — mas o teste roda sobre um dublê que **não calcula inset
// nenhum**, porque quem calcula é código Kotlin/ObjC. É esta tela que fecha a lacuna.
//
// O INSTRUMENTO: uma faixa é o PRIMEIRO filho do `Screen`, e o `onLayout` dela devolve onde ela
// caiu dentro do pai. Em Yoga a posição do filho é medida a partir da borda do pai, então esse
// número É o padding que o pai aplicou. Ao lado dele fica o esperado, calculado do inset do
// sistema mais o token — nunca de constante escrita à mão.
// ─────────────────────────────────────────────────────────────────────────────

const BORDAS_QUATRO = ["top", "right", "bottom", "left"];
const BORDAS_SO_TOPO = ["top"];

// `onLayout` devolve float, e inset de sistema também. Comparar com `===` reprovaria por 0,0001.
const bate = (a, b) => Math.abs(a - b) < 0.5;

function SmokeDoScreen({irParaLote0, irParaLote2}) {
  const t = useAureaTokens();
  const {theme, density, toggleTheme} = useAureaTheme();
  const inset = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();

  const [scroll, setScroll] = React.useState(false);
  const [quatroBordas, setQuatroBordas] = React.useState(true);
  const [medido, setMedido] = React.useState(null);

  const bordas = quatroBordas ? BORDAS_QUATRO : BORDAS_SO_TOPO;
  const respiro = t.size.space4;
  const paisagem = width > height;
  // Aparelho sem entalhe, ou Android que não desenha sob as barras, devolve 0 nos quatro lados.
  // Não é falha do `Screen` — é ausência de pergunta, e a tela tem de dizer isso em vez de deixar
  // um `✓ bate` verde sugerir que a soma foi provada.
  const semInset = inset.top === 0 && inset.right === 0 && inset.bottom === 0 && inset.left === 0;

  // O ESPERADO sai de conta, não de memória. E ele muda com o modo, o que é o contrato do
  // `Screen`: sem `scroll` o respiro é da raiz (e soma com o inset); com `scroll` ele vai para o
  // `contentContainerStyle`, e o inset fica no viewport — por isso o esperado cai para o token só.
  const esperadoY = scroll ? respiro : respiro + (bordas.includes("top") ? inset.top : 0);
  const esperadoX = scroll ? respiro : respiro + (bordas.includes("left") ? inset.left : 0);

  const aoMedir = React.useCallback((e) => {
    const {x, y} = e.nativeEvent.layout;
    setMedido((m) => (m && bate(m.x, x) && bate(m.y, y) ? m : {x, y}));
  }, []);

  const s = estilos(t);
  const okY = medido && bate(medido.y, esperadoY);
  const okX = medido && bate(medido.x, esperadoX);

  return (
    <Screen scroll={scroll} edges={bordas}>
      {/* A FAIXA. Primeiro filho de propósito: é ela que o `onLayout` mede, e é ela que some (ou
          não) sob a barra de status quando se rola. */}
      <View onLayout={aoMedir} style={s.faixa} />

      <View style={{gap: t.size.space3}}>
        <Text style={s.h1}>Aurea · smoke do Screen</Text>
        <Text style={s.legenda}>
          {scroll ? "com scroll" : "sem scroll"} · bordas {bordas.join("/")} ·{" "}
          {paisagem ? "PAISAGEM" : "retrato"} {Math.round(width)}×{Math.round(height)}
        {"\n"}build {VERSAO.commit}{VERSAO.sujo ? " (arvore suja)" : ""}
        </Text>

        <View style={s.barra}>
          <Botao t={t} onPress={() => setScroll((v) => !v)}
            rotulo={scroll ? "scroll: ligado" : "scroll: desligado"} />
          <Botao t={t} onPress={() => setQuatroBordas((v) => !v)}
            rotulo={quatroBordas ? "bordas: 4" : "bordas: só topo"} />
          <Botao t={t} onPress={toggleTheme} rotulo="trocar tema" />
          <Botao t={t} onPress={irParaLote0} rotulo="← Lote 0" />
          <Botao t={t} onPress={irParaLote2} rotulo="→ Lote 2" />
        </View>

        <View style={s.cartao}>
          <Text style={s.h2}>O que o sistema deu, e o que o Screen fez</Text>
          <Linha t={t} rotulo="inset do sistema"
            valor={`topo ${inset.top} · dir ${inset.right} · bai ${inset.bottom} · esq ${inset.left}`} />
          <Linha t={t} rotulo="--space-4 (token)" valor={String(respiro)} />
          <Linha t={t} rotulo="esperado y · x" valor={`${esperadoY} · ${esperadoX}`} />
          <Linha t={t} rotulo="medido y · x"
            valor={medido ? `${arred(medido.y)} · ${arred(medido.x)}` : "medindo…"}
            estado={medido ? (okY && okX ? "ok" : "falha") : null} />
          <Text style={s.nota}>
            O medido é o `onLayout` da faixa amarela — onde ela caiu DENTRO do pai, que em Yoga é o
            padding que o pai aplicou.
          </Text>
          {semInset && (
            <Text style={s.alerta}>
              ⚠ O inset é ZERO nos quatro lados. O `✓ bate` acima prova que o `Screen` aplicou o
              padding do tema e que a conta fecha — mas NÃO prova a soma com entalhe, porque não
              houve entalhe para somar. Neste aparelho as perguntas 5 e 6 ficam SEM RESPOSTA, não
              aprovadas. A 7 (scroll) continua respondível.
            </Text>
          )}
        </View>

        <Bloco t={t} n="5" titulo="Safe area + o padding da Aurea"
          criterio={"`medido` tem de bater com `esperado`. Se o topo sair " + inset.top
            + " (o inset sozinho) em vez de " + (inset.top + respiro)
            + ", o modo não é `additive` e sim `maximum` — e a ADR-0040 leu o fonte C++ errado. "
            + "Se sair " + respiro + ", o inset não chegou e o `SafeAreaView` não está fazendo "
            + "nada."}>
          <Text style={s.nota}>
            O fundo do tema pinta ATÉ debaixo da barra de status — é padding, não margem. Se
            aparecer uma tira de outra cor no topo, o `Screen` está deixando de preencher.
          </Text>
        </Bloco>

        <Bloco t={t} n="6" titulo="Gire o aparelho — as bordas laterais"
          criterio={"Em PAISAGEM, num aparelho com entalhe, `esq` ou `dir` tem de sair de 0 — e o "
            + "`medido x` acompanha. Depois toque em `bordas: só topo`: o x tem de CAIR para "
            + respiro + ", porque as outras três viram `off`. Se o x não mudar em nenhum dos dois "
            + "casos, a lista de bordas não está sendo respeitada."}>
          <Text style={s.nota}>
            {paisagem
              ? `Está em paisagem. Inset lateral agora: esq ${inset.left} · dir ${inset.right}.`
              : "Está em retrato. Gire o aparelho (o rotacionar automático do Android tem de estar ligado)."}
          </Text>
        </Bloco>

        <Bloco t={t} n="7" titulo="O scroll e a barra de status"
          criterio={"Ligue `scroll`, role para cima e olhe a faixa amarela. Ela tem de ser "
            + "RECORTADA na linha de baixo da barra de status — não passar por baixo dela. E a "
            + "faixa tem de ficar no MESMO lugar físico da tela com e sem scroll: o respiro muda "
            + "de lugar no código (raiz -> contentContainerStyle), mas o desenho não muda."}>
          <Text style={s.nota}>
            Com `scroll` ligado o esperado cai para {respiro}, e isso É o contrato: o inset saiu do
            conteúdo e foi para o viewport. As {scroll ? "40 linhas" : "linhas de enchimento"}{" "}
            abaixo existem só para haver o que rolar.
          </Text>
        </Bloco>

        {scroll && Array.from({length: 40}, (_, i) => (
          <View key={i} style={s.linha}>
            <Text style={{color: t.color.mutedForeground, fontSize: t.size.textSm,
                          fontFamily: t.font.code[400]}}>
              enchimento {String(i + 1).padStart(2, "0")}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const arred = (n) => Math.round(n * 10) / 10;

function Linha({t, rotulo, valor, estado}) {
  const cor = estado === "ok" ? t.color.success
    : estado === "falha" ? t.color.destructive
    : t.color.foreground;
  return (
    <View style={{flexDirection: "row", gap: t.size.space2, alignItems: "baseline"}}>
      <Text style={{color: t.color.mutedForeground, fontSize: t.size.textXs, width: 130}}>
        {rotulo}
      </Text>
      <Text style={{color: cor, fontSize: t.size.textSm, fontFamily: t.font.code[400], flex: 1}}>
        {valor}{estado === "ok" ? "  \u2713 bate" : estado === "falha" ? "  \u2717 NAO BATE" : ""}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// O SMOKE DO LOTE 2 — o painel de leitura, e as perguntas que só o vidro responde.
//
// Os dez componentes passaram em 29 testes unitários. O que aqueles testes NÃO fazem é desenhar:
// eles leem que altura, que cor e que papel de acessibilidade o componente pediu — e um anel que
// pede a rotação certa ainda pode engasgar, um pulso na medida certa ainda pode incomodar, e um
// selo com `top:-8` ainda pode cair no lugar errado sobre um ícone real.
//
// ⚠ **E há uma pergunta que NÃO É de vidro e é a mais importante daqui:** a preferência de
// "menos movimento" do sistema. Na web ela é atendida de graça pelo `aurea.css:2128`; no nativo
// quem pergunta é o componente. Um teste unitário prova que ele pergunta ao dublê — **só o
// aparelho prova que o dublê disse a verdade sobre o sistema real**.
// ─────────────────────────────────────────────────────────────────────────────

function SmokeDoLote2({ir}) {
  const t = useAureaTokens();
  const {theme, toggleTheme} = useAureaTheme();
  const reduzir = useReduceMotion();
  const [estado, setEstado] = React.useState(undefined);
  const s = estilos(t);

  // O ciclo do `DataState`, na ordem em que uma tela real os vive.
  const ESTADOS = [undefined, "loading", "error", "empty", "stale", "offline"];
  const proximo = () => setEstado(ESTADOS[(ESTADOS.indexOf(estado) + 1) % ESTADOS.length]);

  return (
    <Screen scroll>
      <Stack>
        <Text style={s.h1}>Aurea · smoke do Lote 2</Text>
        <Text style={s.legenda}>
          tema {theme} · menos movimento: {reduzir === null ? "perguntando…" : reduzir ? "SIM" : "não"}
        {"\n"}build {VERSAO.commit}{VERSAO.sujo ? " (arvore suja)" : ""}
        </Text>

        <View style={s.barra}>
          <Botao t={t} onPress={toggleTheme} rotulo="trocar tema" />
          <Botao t={t} onPress={proximo} rotulo={`estado: ${estado ?? "normal"}`} />
          <Botao t={t} onPress={ir("screen")} rotulo="← Screen" />
          <Botao t={t} onPress={ir("lote0")} rotulo="← Lote 0" />
        </View>

        {/* ── 8 ─────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="8" titulo="O anel gira liso, e para quando você pede?"
          criterio={"Os três tamanhos têm de girar SEM engasgo — o laço é nativo (`useNativeDriver`), "
            + "então tremer aqui é achado. Depois ligue `Remover animações` nas configurações de "
            + "acessibilidade do Android: os três têm de PARAR, e a linha acima tem de virar `SIM`. "
            + "Se girarem com a preferência ligada, o nativo ficou menos acessível que a web na "
            + "mesma peça — e nenhum teste de código pega isso."}>
          <View style={s.icones}>
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </View>
        </Bloco>

        {/* ── 9 ─────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="9" titulo="O pulso do esqueleto incomoda?"
          criterio={"1,35 s por ciclo, descendo até 55% de opacidade — os números do CSS, lidos "
            + "literalmente. Tem de parecer respiração, não pisca-pisca. Se irritar aqui, irrita "
            + "numa tela inteira de listas. E ele também tem de PARAR com `Remover animações`."}>
          <Skeleton height={t.size.space8} />
          <Skeleton width="70%" />
          <Skeleton width="40%" />
        </Bloco>

        {/* ── 10 ────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="10" titulo="O selo ancorado cai no canto certo?"
          criterio={"O `8` tem de ficar sobre o CANTO do sino, com o anel da cor do fundo "
            + "separando os dois — não colado no meio nem cortado para fora. O `120` vira `99+`. "
            + "O zero SOME (é o de baixo, que não deve aparecer)."}>
          <View style={s.icones}>
            <Badge count={8} anchor="top-end">
              <IconButton name="notification" label="Avisos, 8 não lidos" onPress={() => {}} />
            </Badge>
            <Badge count={120} anchor="top-end">
              <IconButton name="notification" label="Avisos, 120 não lidos" onPress={() => {}} />
            </Badge>
            <Badge count={0} anchor="top-end">
              <IconButton name="notification" label="Avisos, nenhum não lido" onPress={() => {}} />
            </Badge>
          </View>
          <View style={s.icones}>
            <Badge tone="success">ok</Badge>
            <Badge tone="warning" emphasis="outline">atenção</Badge>
            <Badge tone="danger" emphasis="solid">3</Badge>
            <Badge tone="primary" dot>com ponto</Badge>
          </View>
        </Bloco>

        {/* ── 11 ────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="11" titulo="O KPI é um cartão de verdade?"
          criterio={"Os dois têm de ter SUPERFÍCIE, borda e o raio de 22px — se saírem como texto "
            + "solto sobre o fundo, o `KPI` deixou de ser `Card` e a identidade foi embora. "
            + "Compare com o cartão que envolve este próprio bloco: o raio tem de ser o mesmo."}>
          <KPI label="Custo por km" value="R$ 1,20" trend="+3% no mês" />
          <KPI label="Saúde" value="82" trend="estável" />
          <Progress value={82} label="Saúde" />
          <Progress value={18} label="Combustível" />
          <Text style={s.nota}>
            As duas barras têm de preencher 82% e 18% do trilho. Uma barra cheia nas duas quer
            dizer que a porcentagem não chegou ao estilo.
          </Text>
        </Bloco>

        {/* ── 12 ────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="12" titulo="O ponto de `offline` é VAZADO?"
          criterio={"O último tem de ser um anel OCO, não um círculo cheio de outra cor. É o que "
            + "separa `está fora` de `está bem` para quem não distingue as duas cores — e é a "
            + "única linha do `.status` que não é só cor."}>
          <Status variant="online">Sincronizado</Status>
          <Status variant="away">Ocioso</Status>
          <Status variant="busy">Ocupado</Status>
          <Status variant="offline">Sem conexão</Status>
          <Status state="waiting_approval" />
        </Bloco>

        {/* ── 13 ────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="13" titulo="Os avisos desenham o ícone da variante?"
          criterio={"Os quatro têm de ter GLIFO à esquerda, cada um na cor da variante. Ícone "
            + "faltando aqui não é defeito do `Alert` — é o registro do app, e este app registra "
            + "os quatro de propósito, para provar que a cláusula 4 da ADR-0038 é usável."}>
          <Alert variant="info" title="Informação">Uma linha de contexto.</Alert>
          <Alert variant="success">Lançamento salvo.</Alert>
          <Alert variant="warning" state="stale" />
          <Alert variant="danger" onDismiss={() => {}}>Não foi possível sincronizar.</Alert>
        </Bloco>

        {/* ── 14 ────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="14" titulo="A região troca de cara — e o dado SOBREVIVE ao aviso?"
          criterio={"Toque em `estado:` até passar por todos. `loading` mostra esqueleto, `error` "
            + "mostra alerta vermelho, `empty` mostra o vazio. Mas em `stale` e `offline` o "
            + "NÚMERO TEM DE CONTINUAR NA TELA, com o aviso EM CIMA dele — se o número sumir, o "
            + "componente trocou informação parcial por informação nenhuma."}>
          <DataState state={estado} emptyIcon="document--blank">
            {() => (
              <Card>
                <Text style={s.h2}>R$ 1,20 por km</Text>
                <Text style={s.nota}>Este número é o conteúdo. Ele tem de sobreviver a `stale`.</Text>
              </Card>
            )}
          </DataState>
        </Bloco>

        {/* ── 15 ────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="15" titulo="O retrato cai para as iniciais?"
          criterio={"O primeiro tem URL quebrada de propósito e TEM DE mostrar `VM` — não um "
            + "buraco cinza. Os três tamanhos vêm da altura de controle do tema, então têm de "
            + "crescer visivelmente."}>
          <View style={s.icones}>
            <Avatar source="https://exemplo.invalido/nao-existe.png" fallback="VM" />
            <Avatar fallback="A" size="sm" />
            <Avatar fallback="B" size="md" />
            <Avatar fallback="C" size="lg" />
          </View>
          <EmptyState
            title="Nada por aqui"
            description="O ícone acima é o `document--blank`, e o texto está centrado." />
        </Bloco>

        <Text style={s.rodape}>
          Este modo usa NOVE componentes da Aurea. A fronteira do app deixou de ser "nenhum" no
          Lote 1 e continua sendo "só o que está em julgamento".
        </Text>
      </Stack>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// MODO `lote7` — buscar, formatar número e mostrar foto
// ─────────────────────────────────────────────────────────────────────────────────────────────
//
// As cinco peças do Lote 7 saíram na `0.8.0` com **teste e nenhum vidro**, e o `NATIVE.md` §8.6
// declarou isso em vez de esconder. Este modo é o instrumento que falta.
//
// ⚠ **A regra de corte é a mesma dos outros modos: só entra o que um teste de código NÃO pode
// responder.** O filtro por acento, a espera de 250 ms, o `FlatList` em vez de `ScrollView`, a
// ida-e-volta do formato — tudo isso já está provado em 1409 testes. O que sobra é o que depende
// do SISTEMA: o teclado, o motor de JS do aparelho, o gesto e o que a tela realmente mostra.
//
// 🔴 **E TRÊS DAS OITO EXISTEM PORQUE O iOS É DIFERENTE**, não por simetria de documento:
//   • a janela do iOS **não encolhe** com o teclado (`inputs.tsx:732-733`) — a folha de 90% fica
//     inteira atrás dele se o `KeyboardAvoiding` não estiver lá;
//   • o `decimal-pad` do iOS **não tem tecla de menos** (`numero.tsx:255-259`);
//   • **não há botão VOLTAR no iOS** — a saída por gesto é o puxador, e só.
// Rodar isto só no Android responde metade das perguntas. Está dito para que ninguém escreva
// "passou" sobre a metade.
function SmokeDoLote7({ir}) {
  const t = useAureaTokens();
  const {theme, toggleTheme} = useAureaTheme();
  const s = estilos(t);

  const [item, setItem] = React.useState(null);
  const [consulta, setConsulta] = React.useState("");
  const [buscando, setBuscando] = React.useState(false);
  const [chamadas, setChamadas] = React.useState(0);
  const [pagina, setPagina] = React.useState(1);

  const [filtro, setFiltro] = React.useState("");
  // ⚠ `value` do `NumberField` é NÚMERO, não string — o campo devolve `null` quando o que foi
  //   digitado não vira número (`lerNumero`), e é por isso que o estado nasce em `null`.
  const [litros, setLitros] = React.useState(null);
  const [saldo, setSaldo] = React.useState(0);
  const [valor, setValor] = React.useState(null);
  const [foto, setFoto] = React.useState("a");

  // Um catálogo de DOIS MIL, que é a forma da demanda: o app não tem a lista na mão, ele pergunta.
  // Aqui o "servidor" é local e responde em 300 ms — o que se julga é a folha, não a rede.
  const CATALOGO = React.useMemo(
    () => Array.from({length: 2000}, (_, i) => ({
      value: String(i),
      label: `${["Açúcar refinado", "Açúcar cristal", "Café moído", "Farinha de trigo",
                 "Óleo de soja", "Arroz agulhinha", "Feijão carioca", "Leite integral"][i % 8]}`
        + ` ${String(i).padStart(4, "0")}`,
    })),
    [],
  );

  // A dobra de acento é a MESMA do `SearchField` (`busca.tsx:513-518`), escrita aqui de novo de
  // propósito: este app é o consumidor, e o consumidor não importa função interna da biblioteca.
  const dobrar = (v) => {
    try { return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
    catch { return v.toLowerCase(); }
  };

  // O "servidor". `onSearchChange` já chega com a espera feita — o contador abaixo mostra quantas
  // vezes ele foi chamado, e é assim que a espera de 250 ms se vê em vidro.
  const buscar = React.useCallback((q) => {
    setChamadas((n) => n + 1);
    setBuscando(true);
    setPagina(1);
    const alvo = dobrar(q);
    setTimeout(() => { setConsulta(alvo); setBuscando(false); }, 300);
  }, []);

  const achados = React.useMemo(() => {
    const base = consulta === ""
      ? CATALOGO
      : CATALOGO.filter((i) => dobrar(i.label).includes(consulta));
    return base.slice(0, pagina * 40);
  }, [CATALOGO, consulta, pagina]);

  // ── AS SONDAS DO MOTOR, e elas rodam no APARELHO ───────────────────────────────────────────
  // ⚠ Isto é o que nenhum teste daqui pode responder: os 1409 testes rodam em Node, e o motor de
  // JS do telefone é outro. `Intl` ausente ou com outra tabela de locale derruba TODA moeda do
  // app — e derruba em silêncio, formatando errado em vez de lançar.
  const sonda = React.useMemo(() => {
    let sep = null, erroSep = null;
    try { sep = separadoresDoLocale("pt-BR"); } catch (e) { erroSep = String(e); }
    let normal = false;
    try { normal = "é".normalize("NFD").length === 2; } catch { normal = false; }
    let moeda = null;
    try {
      moeda = formatarNumero(1234.5, "pt-BR",
                             {minimumFractionDigits: 2, maximumFractionDigits: 2});
    } catch (e) { moeda = String(e); }
    return {
      sistema: Platform.OS,
      versao: String(Platform.Version),
      temIntl: typeof Intl !== "undefined" && typeof Intl.NumberFormat === "function",
      sep, erroSep, normal, moeda,
    };
  }, []);

  const OK = (v) => (v ? "✅" : "🔴");

  const FOTOS = React.useMemo(() => ([
    {id: "a", source: {uri: FOTO_A}, alt: "Bomba de combustível", caption: "boa — 120×90"},
    {id: "b", source: {uri: FOTO_B}, alt: "Painel do veículo", caption: "boa — outra cor"},
    {id: "c", source: {uri: "https://exemplo.invalido/nao-existe.png"}, alt: "Esta quebrou",
     caption: "QUEBRADA de propósito"},
  ]), []);

  return (
    <Screen scroll padded>
      <Stack>
        <Text style={s.h1}>Aurea · smoke do Lote 7</Text>
        <Text style={s.legenda}>
          tema {theme} · Combobox, SearchField, NumberField, Image, Gallery{"\n"}
          build {VERSAO.commit}{VERSAO.sujo ? " (arvore suja)" : ""}
        </Text>

        <View style={s.barra}>
          <Botao t={t} onPress={toggleTheme} rotulo="trocar tema" />
          <Botao t={t} onPress={ir("resto")} rotulo="← resto" />
          <Botao t={t} onPress={ir("lote2")} rotulo="← Lote 2" />
        </View>

        <Text style={s.alerta}>
          ⚠ TRÊS destas oito só se respondem no iOS: a 3 (o teclado não encolhe a janela lá), a 6
          (o `decimal-pad` do iOS não tem menos) e a 5 (não há VOLTAR). Rodar só no Android
          responde CINCO — e escrever "passou" sobre as oito seria o mesmo erro do "11/11" de
          09/09/2026.
        </Text>

        {/* ── 1 ─────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="1" titulo="O motor do aparelho formata como o nosso?"
          criterio={"Esta pergunta NÃO tem toque — ela é leitura, e é a mais barata das oito.\n\n"
            + "Os 1409 testes rodam em Node. O motor de JS do telefone é OUTRO, e o `NumberField` "
            + "inteiro depende de duas coisas dele: `Intl.NumberFormat` e `String#normalize`. Se "
            + "o `Intl` vier sem a tabela de `pt-BR`, a moeda sai formatada ERRADA — e sai em "
            + "silêncio, sem lançar. Os separadores abaixo são medidos por SONDA (`numero.tsx`), "
            + "não presumidos.\n\nTem de ler: decimal `,` · milhar `.` · moeda `1.234,50`."}>
          <Text style={s.mono}>sistema     {sonda.sistema} {sonda.versao}</Text>
          <Text style={s.mono}>{OK(sonda.temIntl)} Intl.NumberFormat</Text>
          <Text style={s.mono}>{OK(sonda.sep && sonda.sep.decimal === ",")} decimal   {sonda.sep ? JSON.stringify(sonda.sep.decimal) : sonda.erroSep}</Text>
          <Text style={s.mono}>{OK(sonda.sep && sonda.sep.grupo === ".")} milhar    {sonda.sep ? JSON.stringify(sonda.sep.grupo) : ""}</Text>
          <Text style={s.mono}>{OK(sonda.normal)} normalize NFD (busca sem acento)</Text>
          <Text style={s.mono}>{OK(sonda.moeda === "1.234,50")} 1234.5 -&gt; {String(sonda.moeda)}</Text>
        </Bloco>

        {/* ── 2 ─────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="2" titulo="A folha abre com o teclado JÁ em pé?"
          criterio={"Abra o campo abaixo. A folha sobe E o teclado sobe JUNTO, sem segundo toque "
            + "— é o `autoFocus` (`busca.tsx:426`), e é o que faz a folha valer a pena: um toque "
            + "a mais por cadastro, vezes o dia inteiro.\n\nE olhe a tecla de confirmar do "
            + "teclado: ela tem de ser uma LUPA (ou 'Buscar'), não 'enter'. É o "
            + "`returnKeyType=\"search\"` — pista de plataforma, não decoração.\n\n🔴 Se o "
            + "teclado NÃO subir junto, a pergunta 3 fica sem sentido e o `autoFocus` é dívida."}>
          <Field label="Item (catálogo de 2000, busca remota)">
            <Combobox
              testID="cb"
              items={achados}
              value={item}
              onValueChange={setItem}
              onSearchChange={buscar}
              loading={buscando}
              onEndReached={() => setPagina((p) => p + 1)}
              placeholder="toque para buscar"
              searchPlaceholder="Buscar item" />
          </Field>
          <Text style={s.mono}>chamadas ao servidor: {chamadas} · na tela: {achados.length}</Text>
          <Text style={s.nota}>
            O contador mede a ESPERA de 250 ms: digite "acucar" (seis letras) devagar e depois
            rápido. Rápido tem de somar MENOS chamadas que letras — se somar seis, a espera não
            está funcionando no aparelho.
          </Text>
        </Bloco>

        {/* ── 3 ─────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="3" titulo="⚠ Com o teclado ABERTO, a lista continua visível? (só o iOS decide)"
          criterio={"Na MESMA folha da pergunta 2: com o teclado em pé, role a lista e escolha um "
            + "item SEM fechar o teclado.\n\n🔴 Esta é a pergunta que bloqueia o cadastro, e ela "
            + "é do iOS. O Android redimensiona a janela sozinho (`adjustResize`) e a folha se "
            + "ajeita de graça; **o iOS NÃO encolhe** — lá a folha de 90% fica inteira ATRÁS do "
            + "teclado, a pessoa digita e não vê resultado nenhum.\n\nO conserto de 12/09/2026 "
            + "foi envolver o `Modal` num `KeyboardAvoiding` (`busca.tsx:393`). Antes disso o "
            + "código dizia, por escrito, que não precisava — a análise tinha olhado o sistema "
            + "errado.\n\nTem de: ver pelo menos duas linhas da lista acima do teclado, e "
            + "conseguir rolar."}>
          <Text style={s.criterio}>Use a folha da pergunta 2. Não há nada a tocar aqui.</Text>
        </Bloco>

        {/* ── 4 ─────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="4" titulo="Rolar a lista E arrastar o puxador — os DOIS?"
          criterio={"Ainda na folha da pergunta 2, com o teclado fechado:\n\n"
            + "a) role a lista rápido — 2000 itens têm de correr lisos (`FlatList`, não "
            + "`ScrollView`);\n"
            + "b) arraste o PUXADOR (a barrinha no topo) para baixo — tem de fechar.\n\n"
            + "🔴 Os dois juntos é que decidem. No `BottomSheet` do Lote 5 a folha INTEIRA "
            + "arrasta; aqui o gesto mora só no cabeçalho (`busca.tsx:406-414`), porque "
            + "reivindicá-lo sobre a lista roubaria a rolagem — que é a única coisa que este "
            + "componente existe para fazer. Se (a) falhar, o gesto está largo demais; se (b) "
            + "falhar, o iOS fica sem saída por gesto."}>
          <Text style={s.criterio}>Use a folha da pergunta 2. Não há nada a tocar aqui.</Text>
        </Bloco>

        {/* ── 5 ─────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="5" titulo="As três saídas — e a que NÃO pode fechar"
          criterio={"Ainda na mesma folha:\n\n"
            + "• tocar no ESCURO acima dela → fecha;\n"
            + "• botão VOLTAR (Android) → fecha. **No iOS ele não existe** — lá a saída é o "
            + "arrasto da pergunta 4;\n"
            + "• tocar no CORPO da folha (na lista, no campo) → 🔴 **NÃO PODE FECHAR**.\n\n"
            + "A terceira é regressão medida: em 10/09/2026 o `Select` fechava quando se tocava "
            + "no corpo, porque um `View` sem manipulador não vira responder no RN e o toque "
            + "atravessava para o fundo. Aqui seria pior — tocar para pôr o cursor no campo de "
            + "busca fecharia a folha."}>
          <Text style={s.criterio}>Use a folha da pergunta 2. Não há nada a tocar aqui.</Text>
        </Bloco>

        {/* ── 6 ─────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="6" titulo="⚠ O teclado do número, e a ida-e-volta do formato"
          criterio={"Três coisas, e a primeira é do iOS:\n\n"
            + "a) toque em **Litros** (mínimo 0): o teclado tem de ter VÍRGULA e **não precisa** "
            + "de menos — é `decimal-pad`;\n"
            + "b) toque em **Saldo** (mínimo −50): o teclado tem de ter o **sinal de menos**. No "
            + "iOS isso exige `numbers-and-punctuation`, porque o `decimal-pad` de lá não tem "
            + "tecla de menos (`numero.tsx:255-259`) — um campo que aceita negativo com um "
            + "teclado que não digita menos é um campo quebrado;\n"
            + "c) em **Valor**, digite `1234,5` e toque FORA: tem de virar `R$ 1.234,50`. Toque "
            + "de volta: tem de voltar ao cru para editar. É a ADR-0024 — formata no BLUR, nunca "
            + "enquanto se digita.\n\nE olhe a posição do número dentro da cápsula: ele tem de "
            + "estar no MEIO na vertical."}>
          <Field label="Litros (min 0)">
            <NumberField testID="nf-litros" value={litros} onValueChange={setLitros}
                         locale="pt-BR" format={{maximumFractionDigits: 1}}
                         min={0} step={0.5} placeholder="0,0" />
          </Field>
          <Field label="Saldo (min −50)">
            <NumberField testID="nf-saldo" value={saldo} onValueChange={setSaldo}
                         locale="pt-BR" min={-50} max={50} step={1} />
          </Field>
          <Field label="Valor (formata ao sair)">
            <NumberField testID="nf-valor" value={valor} onValueChange={setValor} fullWidth
                         locale="pt-BR" format={{style: "currency", currency: "BRL"}}
                         min={0} placeholder="R$ 0,00" />
          </Field>
        </Bloco>

        {/* ── 7 ─────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="7" titulo="A busca acha sem acento, no motor do aparelho?"
          criterio={"Digite `acucar`, sem cedilha e sem acento. Tem de achar **Açúcar**.\n\n"
            + "A pergunta 1 já leu se o `normalize` existe; esta prova que ele é USADO no caminho "
            + "certo. Num catálogo em português, exigir o acento certo é exigir que a pessoa "
            + "saiba escrever o que está procurando.\n\nE olhe a lupa e o `×`: os dois dentro "
            + "de UMA cápsula, não em três caixas — é o `.input-group` da web."}>
          <SearchField testID="sf" value={filtro} onChangeText={setFiltro}
                       placeholder="Filtrar o que está na tela" />
          <View style={{gap: t.size.space1}}>
            {CATALOGO.slice(0, 8)
              .filter((i) => filtro === "" || dobrar(i.label).includes(dobrar(filtro)))
              .map((i) => <Text key={i.value} style={s.mono}>{i.label}</Text>)}
          </View>
        </Bloco>

        {/* ── 8 ─────────────────────────────────────────────────────────── */}
        <Bloco t={t} n="8" titulo="A foto aparece, a quebrada não some, e a grande cabe"
          criterio={"Três coisas:\n\n"
            + "a) as duas primeiras miniaturas DESENHAM (são bytes de verdade, em `data:`, sem "
            + "rede);\n"
            + "b) a terceira aponta para um endereço que não existe: ela tem de virar o "
            + "SUBSTITUTO — caixa do mesmo tamanho, mesmo raio, glifo `image` do Carbon dentro. "
            + "**Não pode sumir nem encolher a grade**, porque a caixa é reservada pela proporção "
            + "antes de qualquer byte chegar;\n"
            + "c) toque numa boa: abre no `Dialog` com `contain`. 🔴 **Tem de caber na tela "
            + "inteira, sem corte e sem estourar a largura num telefone estreito** — `contain` e "
            + "não `cover`, porque cortar a imagem que a pessoa pediu para VER é o oposto do que "
            + "ela pediu. Aperte VOLTAR (Android) ou toque no escuro: fecha."}>
          <AureaImage source={{uri: FOTO_A}} alt="Foto principal do item" ratio={4 / 3} />
          <Gallery testID="gal" items={FOTOS} zoom selected={foto} onSelect={setFoto} />
        </Bloco>

        <Text style={s.rodape}>
          Este modo usa SETE componentes da Aurea — os cinco do Lote 7 mais `Field` e `Screen`.
          O que a aritmética já prova ficou de fora: o filtro, a espera, a paginação e a
          ida-e-volta do formato estão em 1409 testes. Aqui só o que o vidro decide.
        </Text>
      </Stack>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// MODO `resto` — os LOTES 3, 4, 5, 6 e o CHART
// ─────────────────────────────────────────────────────────────────────────────────────────────
//
// 37 dos 46 componentes chegaram aqui sem nunca ter renderizado. Este modo é o instrumento que
// falta, e ele é DELIBERADAMENTE curto: só entram as perguntas que **um teste de código não pode
// responder**, porque o dublê não é o sistema.
//
// O que ficou de FORA, e é decisão e não esquecimento: tudo que a aritmética já prova (a escala do
// `Chart`, o caminho com buraco, a régua do eixo, a divisão da faixa das barras). Encher a tela de
// coisa já provada esconde as sete que importam.
//
// ⚠ **A pergunta 4 é a mais cara do lote inteiro** — o teclado numérico é a única linha do plano
// do consumidor que o Lote 4 existe para cumprir.
function SmokeDoResto({ir}) {
  const t = useAureaTokens();
  const {theme, toggleTheme} = useAureaTheme();
  const s = estilos(t);
  const toast = useToast();

  const [aba, setAba] = React.useState("painel");
  const [km, setKm] = React.useState("");
  const [comb, setComb] = React.useState("g");
  const [lembrar, setLembrar] = React.useState(false);
  const [aceito, setAceito] = React.useState(false);
  const [turno, setTurno] = React.useState("dia");
  const [dialogo, setDialogo] = React.useState(null);
  const [longa, setLonga] = React.useState(false);

  // Mil linhas. O número não é enfeite: a pendência que a ADR-0038 deixou aberta em 31/08/2026
  // era o desempenho em LISTA LONGA, e ela só fecha com uma lista longa de verdade.
  const MIL = React.useMemo(
    () => Array.from({length: 1000}, (_, i) => ({
      id: String(i),
      data: `${String((i % 28) + 1).padStart(2, "0")}/09`,
      km: String(9 + (i % 40) / 10),
      custo: `R$ ${180 + (i % 90)}`,
    })),
    [],
  );

  // Quarenta pontos, pelo mesmo motivo — e com um BURACO no meio, que é o caso que o traço tem
  // de pular em vez de fingir zero.
  const QUARENTA = React.useMemo(
    () => Array.from({length: 40}, (_, i) => (i === 17 ? null : 180 + Math.round(Math.sin(i / 3) * 60))),
    [],
  );

  // 🔴 O CONTÊINER ERA UM FRAGMENT `<>`, E ISSO DEIXAVA UMA FAIXA BRANCA NO TEMA ESCURO — visto
  // em foto no aparelho em 10/09/2026. O `Screen` pinta o fundo NA PRÓPRIA RAIZ; a `BottomNav` é
  // IRMÃ dele, então o que fica atrás dela é a raiz do app — e raiz sem cor, no Android, é BRANCA.
  // ⚠ E A LEITURA ERRADA QUE ISSO QUASE PRODUZIU: a barra parecia "flutuando longe do pé", que é
  // o sintoma que a própria pergunta 1 manda olhar para acusar SOMA no lugar de `Math.max`. A
  // conta estava certa (`navigation.tsx:208`); era o branco empurrando a leitura. **Quase acusei
  // o componente errado por causa do sintoma.**
  // ⚠ Quem põe a barra como irmã da tela fica DONO DO FUNDO atrás dela — está dito no JSDoc da
  // `BottomNav` agora, porque o consumidor cai nisto igual.
  return (
    <View style={{flex: 1, backgroundColor: t.color.background}}>
      <Screen scroll padded>
        <Stack>
          <Text style={s.h1}>Aurea · smoke do resto</Text>
          <Text style={s.legenda}>tema {theme} · Lotes 3, 4, 5, 6 e o Chart{"\n"}build {VERSAO.commit}{VERSAO.sujo ? " (arvore suja)" : ""}</Text>

          <View style={s.barra}>
            <Botao t={t} onPress={toggleTheme} rotulo="trocar tema" />
            <Botao t={t} onPress={ir("lote2")} rotulo="← Lote 2" />
            <Botao t={t} onPress={ir("screen")} rotulo="← Screen" />
          </View>

          {/* ── 1 ─────────────────────────────────────────────────────────── */}
          <Bloco t={t} n="1" titulo="O contador cabe, ou cobre o nome?"
            criterio={"Este é DEFEITO VISTO EM TELA em 17/08/2026, na web: o número cobriu o nome "
              + "inteiro. A correção foi pendurar o contador no ÍCONE, não no item. Olhe a barra "
              + "no pé desta tela: o `128` tem de ficar sobre o sino e o texto `Avisos` tem de "
              + "continuar legível. E o respiro de baixo é `Math.max`, NÃO soma — se a barra "
              + "estiver flutuando longe do pé, a conta virou soma."}>
            <Text style={s.criterio}>A barra está fixa no pé da tela. Role até o fim.</Text>
          </Bloco>

          {/* ── 2 ─────────────────────────────────────────────────────────── */}
          <Bloco t={t} n="2" titulo="A moldura desenha?"
            criterio={"`Topbar`, `NavList` e `Stepper` — os três não têm papel de acessibilidade, "
              + "de propósito (`banner` e `navigation` NÃO mapeiam no RN). O que se julga aqui é "
              + "só o desenho: a Topbar tem divisória embaixo, a NavList separa os itens, e o "
              + "Stepper mostra QUAL passo está ativo sem depender só de cor."}>
            <Topbar brand={<Text style={{color: t.color.foreground, fontFamily: t.font.ui[600]}}>Aurea</Text>} />
            {/* ⚠ O `Stepper` NÃO recebe `current`: o estado mora em CADA passo. É o contrato do
                componente, e escrevê-lo errado aqui daria uma trilha sem passo ativo — que é
                justamente o que a pergunta acima manda olhar. */}
            <Stepper
              items={[
                {label: "Dados", state: "done"},
                {label: "Foto", state: "active"},
                {label: "Revisar"},
              ]} />
            <NavList
              items={[
                {id: "1", label: "Lançamentos", icon: "list"},
                {id: "2", label: "Ajustes", icon: "dashboard"},
              ]} />
          </Bloco>

          {/* ── 3 ─────────────────────────────────────────────────────────── */}
          <Bloco t={t} n="3" titulo="O `Switch` é NOSSO, ou é o do Material?"
            criterio={"O `Switch` do React Native traria o interruptor do Material, que a "
              + "identidade proíbe. Este é desenhado com as medidas do CSS. Se ele parecer um "
              + "switch de Android, o componente errado entrou. O `Checkbox` e o `Radio` seguem "
              + "a mesma regra, e o `SegmentedControl` tem de estar em PILL (raio 999)."}>
            <Switch label="Lembrar deste veículo" checked={lembrar} onChange={setLembrar} />
            <Checkbox label="Aceito os termos" checked={aceito} onChange={setAceito} />
            <SegmentedControl
              value={turno}
              onChange={setTurno}
              items={[{value: "dia", label: "Dia"}, {value: "noite", label: "Noite"}]} />
          </Bloco>

          {/* ── 4 ─────────────────────────────────────────────────────────── */}
          <Bloco t={t} n="4" titulo="⚠ O TECLADO NUMÉRICO SOBE? (a pergunta mais cara)"
            criterio={"Esta é a ÚNICA linha do plano do consumidor que o Lote 4 existe para "
              + "cumprir. Toque no campo de quilometragem: tem de subir o teclado NUMÉRICO, não o "
              + "alfabético. Digitar `12,4` tem de custar dois toques, não oito. Se subir o "
              + "alfabético, o lote inteiro não entrega o que foi construído para entregar.\n\n"
              + "⚠ E OLHE O NÚMERO: ele tem de ficar CENTRADO na pílula e inteiro. Em 09/09/2026 "
              + "ele saía alto e cortado — o padding do tema do Android entrava sozinho no Yoga "
              + "porque o `padding-block:0` da web não tinha atravessado. Esta é a prova do "
              + "conserto."}>
            <Form>
              <Field label="Quilometragem" hint="Só números">
                <Input keyboardType="numeric" value={km} onChangeText={setKm} placeholder="12,4" />
              </Field>
            </Form>
          </Bloco>

          {/* ── 5 ─────────────────────────────────────────────────────────── */}
          <Bloco t={t} n="5" titulo="Tocar no CORPO da folha do `Select` fecha ela?"
            criterio={"DEFEITO CORRIGIDO EM 09/09/2026, e esta é a prova no vidro. Um `View` sem "
              + "manipulador não vira responder no RN, então o toque atravessava para o fundo e "
              + "FECHAVA a folha. Abra o seletor e toque no espaço VAZIO entre duas opções: ela "
              + "tem de continuar aberta. Tocar FORA dela, no escuro, tem de fechar."}>
            <Field label="Combustível">
              <Select
                value={comb}
                onChange={setComb}
                items={[
                  {value: "g", label: "Gasolina"},
                  {value: "e", label: "Etanol"},
                  {value: "d", label: "Diesel"},
                ]} />
            </Field>
          </Bloco>

          {/* ── 6 ─────────────────────────────────────────────────────────── */}
          <Bloco t={t} n="6" titulo="⚠ O botão VOLTAR fecha as quatro superfícies?"
            criterio={"No RN o botão VOLTAR do Android é o `Escape` da web, e o próprio RN "
              + "documenta `onRequestClose` como OBRIGATÓRIO. Nenhum teste de código prova que o "
              + "Android o entrega. Abra cada uma e aperte VOLTAR: as quatro têm de fechar.\n\n"
              + "E no `ConfirmDialog` tem uma segunda pergunta: tocar FORA dele NÃO pode fechar. "
              + "É a diferença de comportamento que separa ele de um `Dialog` com dois botões."}>
            <View style={s.barra}>
              <Botao t={t} onPress={() => setDialogo("dialog")} rotulo="Dialog" />
              <Botao t={t} onPress={() => setDialogo("confirm")} rotulo="Confirm" />
              <Botao t={t} onPress={() => setDialogo("drawer")} rotulo="Drawer" />
              <Botao t={t} onPress={() => setDialogo("sheet")} rotulo="BottomSheet" />
            </View>
          </Bloco>

          {/* ── 7 ─────────────────────────────────────────────────────────── */}
          <Bloco t={t} n="7" titulo="Arrastar a folha responde, ou engasga?"
            criterio={"A ADR do Lote 5 recusou `@gorhom/bottom-sheet` (duas peças novas) e usou o "
              + "`PanResponder`, que é do próprio RN. O CUSTO foi DECLARADO: o gesto roda na ponte "
              + "de JS, não na thread de UI. Abra o BottomSheet acima e arraste devagar: tem de "
              + "acompanhar o dedo. Soltar no MEIO tem de VOLTAR; arrastar mais de um terço, ou "
              + "dar um lance rápido, tem de fechar.\n\nSe engasgar, a troca é uma ADR nova — e "
              + "esta tela é a evidência que ela precisa."} />

          {/* ── 8 ─────────────────────────────────────────────────────────── */}
          <Bloco t={t} n="8" titulo="O aviso nasce acima da barra de gestos?"
            criterio={"O `ToastHost` deste app tem `offset={72}` para limpar a barra inferior. O "
              + "aviso tem de aparecer ACIMA dela, inteiro, e o X tem de ser alcançável. Se ele "
              + "nascer embaixo ou cortado, a conta do respiro está errada.\n\nToque duas vezes: "
              + "o segundo entra e o teto é 3. O de `duration: 0` NÃO pode sumir sozinho."}>
            <View style={s.barra}>
              <Botao t={t} rotulo="aviso" onPress={() => toast.add({title: "Lançamento salvo", type: "success"})} />
              <Botao t={t} rotulo="aviso que fica" onPress={() => toast.add({
                title: "Falhou ao enviar", description: "Toque no X para dispensar.",
                type: "danger", duration: 0,
              })} />
            </View>
          </Bloco>

          {/* ── 9 ─────────────────────────────────────────────────────────── */}
          <Bloco t={t} n="9" titulo="O cartão de linha cabe em 360dp?"
            criterio={"A `Table` do nativo NÃO é uma tabela: cada linha vira um cartão e cada "
              + "célula leva o nome da coluna junto. Com nome de coluna longo, o valor tem de "
              + "continuar do lado direito e NÃO pode ser empurrado para fora. E com o TalkBack "
              + "ligado, `Quilometragem: 12,4` tem de ser lido como UMA parada, não duas."}>
            <Table
              caption="Lançamentos"
              columns={[
                {key: "data", header: "Data", primary: true},
                {key: "km", header: "Quilometragem por litro", cell: (l) => l.km},
                {key: "custo", header: "Custo"},
              ]}
              rows={MIL.slice(0, 2)}
              keyExtractor={(l) => l.id} />
            <DataList items={[
              {term: "Quilometragem", value: "12,4 km/l"},
              {term: "Custo por km", value: "R$ 0,84"},
            ]} />
            <Timeline items={[
              {title: "Criado", description: "pelo app", time: "08/09 14:20"},
              {title: "Enviado", time: "08/09 15:02"},
            ]} />
          </Bloco>

          {/* ── 10 ────────────────────────────────────────────────────────── */}
          <Bloco t={t} n="10" titulo="O Chart desenha, e o eixo sai na fonte da Aurea?"
            criterio={"O texto do eixo é `SvgText` com `fontFamily` — e no nativo cada PESO é uma "
              + "família (ADR-0039). Se os números do eixo saírem na fonte do sistema, o nome de "
              + "família não chegou.\n\nToque numa faixa do gráfico: o ponto tem de acender e os "
              + "valores em texto têm de aparecer embaixo. **O toque tem de acertar a faixa que "
              + "você mirou** — com 40 pontos cada faixa fica com ~7dp, e é aqui que se descobre "
              + "se isso é usável.\n\nE a barra tem de NASCER NO ZERO: se ela flutuar, a régua "
              + "está mentindo sobre a proporção."}>
            <Chart
              label="Custo por dia"
              labels={QUARENTA.map((_, i) => (i % 8 === 0 ? String(i) : ""))}
              series={[{name: "Custo", data: QUARENTA}]}
              mark="area"
              formatValue={(v) => `R$ ${Math.round(v)}`} />
            <Chart
              label="Duas séries"
              labels={["jan", "fev", "mar", "abr"]}
              series={[
                {name: "Custo", data: [210, 198, 240, 187]},
                {name: "Meta", data: [200, 200, 200, 200], mark: "line"},
              ]}
              mark="bar"
              height={160} />
          </Bloco>

          {/* ── 11 ────────────────────────────────────────────────────────── */}
          <Bloco t={t} n="11" titulo="⚠ Mil linhas abrem sem engasgo? (a pendência mais velha)"
            criterio={"Esta é a pergunta que a ADR-0038 deixou aberta em 31/08/2026 — *'volta a "
              + "importar quando existir tela de lista'*. **Esta é a tela.** Ligue abaixo e role "
              + "rápido: com `virtualized` só o que está na tela é montado.\n\n⚠ Note que a lista "
              + "vira o ROLADOR — por isso ela abre numa tela própria, sem `scroll` no `Screen`. "
              + "Dois roladores no mesmo eixo desligam a virtualização, e o RN avisa no console."}>
            <Botao t={t} onPress={() => setLonga(true)} rotulo="abrir as mil linhas" />
          </Bloco>

          <Text style={s.rodape}>
            Este modo usa 22 componentes da Aurea. As perguntas que a aritmética já responde
            ficaram de fora de propósito — o que está aqui é só o que o vidro decide.
          </Text>
        </Stack>
      </Screen>

      {/* A barra inferior fica FORA do `Screen`, que é como o consumidor a usa: ela é irmã da
          tela, não filha dela. */}
      <BottomNav
        current={aba}
        items={[
          {id: "painel", label: "Painel", icon: "dashboard", onPress: () => setAba("painel")},
          {id: "avisos", label: "Avisos", icon: "notification", badge: 128, onPress: () => setAba("avisos")},
        ]} />

      <Dialog open={dialogo === "dialog"} title="Editar lançamento"
              onClose={() => setDialogo(null)}
              footer={<>
                <Button appearance="outline" onPress={() => setDialogo(null)}>Cancelar</Button>
                <Button onPress={() => setDialogo(null)}>Salvar</Button>
              </>}>
        <Text style={s.criterio}>
          Aperte VOLTAR: tem de fechar. Toque no escuro: tem de fechar. Toque AQUI, no corpo:
          NÃO pode fechar.
        </Text>
      </Dialog>

      <ConfirmDialog
        open={dialogo === "confirm"}
        destructive
        title="Apagar este lançamento?"
        description="Ele sai do histórico e do custo por km. Isto não volta."
        confirmLabel="Apagar"
        onConfirm={() => setDialogo(null)}
        onCancel={() => setDialogo(null)} />

      <Drawer open={dialogo === "drawer"} title="Filtros" side="right"
              onClose={() => setDialogo(null)}>
        <Text style={s.criterio}>
          Ele tem de entrar pela DIREITA, deslizando. Se subir do chão, a animação do `Modal`
          ficou ligada por engano.
        </Text>
      </Drawer>

      <BottomSheet open={dialogo === "sheet"} title="Novo lançamento"
                   onClose={() => setDialogo(null)}>
        <Text style={s.criterio}>
          Arraste o puxador para baixo. Soltar no meio VOLTA; passar de um terço FECHA.
        </Text>
        <Button onPress={() => setDialogo(null)}>Fechar</Button>
      </BottomSheet>

      {/* ⚠ SEM `scroll` no `Screen`: a lista virtualizada É o rolador. Isto não é detalhe de
          demonstração — é a regra documentada, e pô-la dentro de um `ScrollView` desligaria a
          virtualização que esta tela existe para medir. */}
      {longa ? (
        <TelaDasMilLinhas t={t} onFechar={() => setLonga(false)} linhas={MIL} />
      ) : null}
    </View>
  );
}

// A tela das mil linhas, separada porque ela precisa de um `Screen` SEM `scroll`.
function TelaDasMilLinhas({t, onFechar, linhas}) {
  const s = estilos(t);
  return (
    <Dialog open title="Mil linhas, virtualizadas" onClose={onFechar} scroll={false}>
      <Text style={s.criterio}>
        Role rápido até o fim. Tem de correr liso: só o que está na tela é montado.
      </Text>
      <View style={{height: 380}}>
        <Table
          caption="Mil lançamentos"
          virtualized
          columns={[
            {key: "data", header: "Data", primary: true},
            {key: "km", header: "km/l"},
            {key: "custo", header: "Custo"},
          ]}
          rows={linhas}
          keyExtractor={(l) => l.id} />
      </View>
    </Dialog>
  );
}

function Bloco({t, n, titulo, criterio, children}) {
  const s = estilos(t);
  return (
    <View style={s.cartao}>
      <Text style={s.h2}>{n}. {titulo}</Text>
      <Text style={s.criterio}>{criterio}</Text>
      <View style={{gap: t.size.space2}}>{children}</View>
    </View>
  );
}

function Glifo({t, nome, Comp, prova}) {
  return (
    <View style={{alignItems: "center", gap: 4, flex: 1}}>
      <Comp size={t.size.iconXl} color={t.color.foreground} />
      <Text style={{color: t.color.mutedForeground, fontSize: t.size.textXs,
                    fontFamily: t.font.code[400], textAlign: "center"}}>{nome}</Text>
      <Text style={{color: t.color.subtleForeground, fontSize: t.size.textXs,
                    textAlign: "center"}}>{prova}</Text>
    </View>
  );
}

function Amostra({t, cor, nome, esperado}) {
  return (
    <View style={{alignItems: "center", gap: 4}}>
      <View style={{width: 56, height: 56, backgroundColor: cor,
                    borderRadius: t.size.radiusMd, borderWidth: 1, borderColor: t.color.border}} />
      <Text style={{color: t.color.mutedForeground, fontSize: t.size.textXs}}>{nome}</Text>
      <Text style={{color: t.color.subtleForeground, fontSize: t.size.textXs,
                    fontFamily: t.font.code[400]}}>{esperado ?? cor}</Text>
    </View>
  );
}

function Botao({t, onPress, rotulo}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => ({
        minHeight: 48,              // o alvo de toque que o plano do consumidor exige
        paddingHorizontal: t.size.space4,
        justifyContent: "center",
        borderRadius: t.size.radiusControl,
        backgroundColor: pressed ? t.color.primaryActive : t.color.primary,
      })}>
      <Text style={{color: t.color.primaryForeground, fontFamily: t.font.ui[600],
                    fontSize: t.size.textMd}}>
        {rotulo}
      </Text>
    </Pressable>
  );
}

// `StyleSheet.create` a cada render é de propósito: é EXATAMENTE o que a ADR-0037 escolheu como
// motor, e se isso custar caro é este app que tem de mostrar. Esconder o custo atrás de um cache
// seria medir outra coisa.
const estilos = (t) => StyleSheet.create({
  fundo: {flex: 1, backgroundColor: t.color.background},
  conteudo: {padding: t.size.space4, gap: t.size.space4, paddingBottom: t.size.space16},
  h1: {color: t.color.foreground, fontSize: t.size.text2xl, fontFamily: t.font.ui[700]},
  // A faixa que o `onLayout` mede no smoke do `Screen`. Amarelo da marca de propósito: ela tem de
  // ser inconfundível quando some (ou não) sob a barra de status.
  faixa: {height: 10, borderRadius: t.size.radiusControl, backgroundColor: t.color.primary},
  legenda: {color: t.color.mutedForeground, fontSize: t.size.textSm, fontFamily: t.font.code[400]},
  barra: {flexDirection: "row", flexWrap: "wrap", gap: t.size.space2},
  cartao: {
    backgroundColor: t.color.card,
    borderRadius: t.size.radiusCard,          // 22px, a identidade intocável
    padding: t.size.cardPad,                  // muda com a densidade
    gap: t.size.space3,
    borderWidth: t.size.borderWidth,
    borderColor: t.color.border,
    boxShadow: [t.shadow.shadowMd],           // RN 0.76+, 1:1 com o CSS (Etapa 2)
  },
  h2: {color: t.color.foreground, fontSize: t.size.textLg, fontFamily: t.font.ui[600]},
  criterio: {color: t.color.mutedForeground, fontSize: t.size.textSm,
             lineHeight: t.size.textSm * t.size.leadingNormal},
  nota: {color: t.color.subtleForeground, fontSize: t.size.textXs,
         lineHeight: t.size.textXs * t.size.leadingNormal},
  // `warningForeground` e `warningBg` existem nos dois temas — conferido no alvo de tokens.
  alerta: {color: t.color.warningForeground,
           backgroundColor: t.color.warningBg,
           borderRadius: t.size.radiusMd, padding: t.size.space2,
           fontSize: t.size.textXs, lineHeight: t.size.textXs * t.size.leadingNormal},
  icones: {flexDirection: "row", alignItems: "center", gap: t.size.space4},
  amostras: {flexDirection: "row", gap: t.size.space3, flexWrap: "wrap"},
  linha: {flexDirection: "row", alignItems: "center", gap: t.size.space2,
          minHeight: t.size.rowH, borderBottomWidth: t.size.borderWidth,
          borderBottomColor: t.color.border},
  // A leitura das SONDAS do modo `lote7`. Monoespaçada de propósito: são valores medidos, e
  // valor medido alinhado em coluna se confere de relance — que é o que se faz com oito linhas.
  mono: {color: t.color.foreground, fontSize: t.size.textSm, fontFamily: t.font.code[400]},
  rodape: {color: t.color.subtleForeground, fontSize: t.size.textXs, textAlign: "center"},
});
