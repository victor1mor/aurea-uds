// Aurea nativo — os dois componentes que **chamam o SISTEMA**: `DatePicker` e `PhotoInput`.
//
// Lote 4 do `NATIVE.md` §5.5, a parte que parou por dependência e o Victor autorizou em
// 08/09/2026. Eles moram num arquivo próprio porque são de outra natureza que o resto do lote:
// um `Input` desenha; estes **pedem alguma coisa ao aparelho** e vivem com a resposta.
//
// ── AS DUAS DEPENDÊNCIAS, MEDIDAS NO REGISTRO ────────────────────────────────────────────────
//
//   @react-native-community/datetimepicker   MIT · 9.1.0 fixado pelo Expo SDK 57 · vem no Expo Go
//   expo-image-picker                        MIT · ~57.0.15 fixado pelo SDK      · vem no Expo Go
//
// **As duas são peers OPCIONAIS**, ao contrário do `react-native-svg` e do
// `react-native-safe-area-context`. A razão é medida, não estética: `Icon` e `Screen` entram em
// qualquer app; data e foto, não. Um app sem nenhuma das duas telas não deve ser obrigado a
// instalar módulo nativo — e é o `peerDependenciesMeta` que diz isso ao gestor de pacotes.
//
// ── ⚠ ELES NÃO SAEM PELO BARRIL PRINCIPAL, E ISSO É O DESENHO ────────────────────────────────
//
//     import {DatePicker, PhotoInput} from "@aurea-uds/native/system";
//
// Se saíssem por `@aurea-uds/native`, o Metro puxaria os dois módulos NATIVOS para o grafo de
// todo app que importasse qualquer coisa deste pacote — inclusive quem só quer um `Button`. É
// exatamente o problema que a **ADR-0038** já resolveu para os 2571 ícones, com a mesma saída:
// **caminho profundo**. Módulo que não é importado não entra no grafo, e isso não depende de
// tree-shaking nenhum.
//
// A primeira versão tentou `require()` dentro da função, para ser preguiçosa sem caminho novo.
// **Não presta, e o teste é que mostrou:** `require` escapa da resolução de módulo (o dublê não
// era alcançado), o TypeScript não tipa o resultado, e a preguiça passa a depender de o bundler
// não hastear o `require` — que é aposta na configuração do consumidor, a mesma que a ADR-0038
// recusa. O caminho profundo é preguiçoso **por construção**.
import * as React from "react";
import {Linking, Platform, Pressable, View, type StyleProp, type ViewStyle} from "react-native";
import RNDateTimePicker, {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import {IconButton} from "./actions.js";
import {canto, criarFolha, estadoAcessivel} from "./estilos.js";
import {Alert} from "./feedback.js";
import {Icon, type AureaIcon} from "./icon.js";
import {useCampo, type AureaFieldSize} from "./inputs.js";
import {FotoAmpliada, Image} from "./midia.js";
import {Text} from "./text.js";
import {useAureaStrings, useAureaTokens} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

const folha = criarFolha((t: AureaTokens) => ({
  gatilho: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    width: "100%", borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
    ...canto(t.size.radiusControl), backgroundColor: t.color.fieldBg,
  },
  invalido: {borderColor: t.color.danger400 ?? t.color.destructive},
  // No navegador o texto e o ícone vão numa caixa escondida do leitor de tela (E16): a mesma
  // fileira do gatilho, ocupando a largura dele.
  mioloWeb: {flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between"},
  desabilitado: {opacity: t.size.opacityDisabled},
  // R-22 (02/10/2026), a "B" da prancha: miniatura QUADRADA de 64 — o `Avatar` `lg` da
  // referência, e a medida que o botão de pôr foto passou a ter também (era 72, número à mão) — e o X
  // TODO FORA da foto. O X é o `IconButton` `sm` (30) com fundo; a área de toque dele é de 44
  // (`targetMin`), com o desenho no centro, então o deslocamento que põe o canto do DESENHO no
  // canto da foto é (30 + 44) / 2. A grade deixa esse espaço em cima, à direita e entre as linhas,
  // porque no Android o toque fora da caixa do pai não chega.
  galeria: {
    flexDirection: "row", flexWrap: "wrap", columnGap: t.size.space4,
    rowGap: foraDoX(t) + t.size.space2,
  },
  comX: {paddingTop: foraDoX(t), paddingRight: foraDoX(t)},
  miniatura: {position: "relative", width: t.size.space16},
  remover: {position: "absolute", top: -foraDoX(t), right: -foraDoX(t)},
  adicionar: {
    alignItems: "center", justifyContent: "center", gap: t.size.space1,
    width: t.size.space16, height: t.size.space16, ...canto(t.size.radiusLg),
    borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
    borderStyle: "dashed", backgroundColor: t.color.fieldBg,
  },
}));

/** Quanto o X do `PhotoInput` sai da foto: metade do desenho (30) mais metade do alvo (44). */
const foraDoX = (t: AureaTokens) => (t.size.controlHSm + Math.max(t.size.controlHSm, t.size.targetMin)) / 2;

const alturaDoTamanho = (t: AureaTokens, s: AureaFieldSize) =>
  s === "sm" ? t.size.controlHSm : s === "lg" ? t.size.controlHLg : t.size.controlHMd;

// E16 (09/10/2026) · NO NAVEGADOR, o calendário "deles" é o do NAVEGADOR. A biblioteca de data não
// tem versão web: o arquivo genérico dela devolve `null` e só avisa no console — tocar no campo não
// abria nada (achado do app rodando no `react-native-web`). A saída é o `<input type="date">` do
// próprio navegador, INVISÍVEL e POR CIMA do nosso gatilho: a pele continua a nossa, o toque cai no
// campo do navegador, e é ele que o leitor de tela anuncia. Por cima, e não escondido e aberto por
// código, porque o `showPicker()` não existe no Safari do iPhone (dados de compatibilidade do MDN,
// 8.1.5): lá quem abre o seletor é o toque no próprio campo. No computador, o clique chama o
// `showPicker()` (Chrome e Edge 99, Firefox 101, Safari 17.4).
// E o ícone de calendário do próprio campo, esticado sobre ele inteiro: o clique vira um clique de
// verdade no ícone, e o navegador abre o seletor SEM o `showPicker()`. É o que vale dentro de uma
// página de outro endereço (moldura), onde o Chrome recusa o `showPicker()` — medido: "called from
// cross-origin iframe". O pseudo-elemento só existe no Chrome, no Edge e no Safari; o Firefox já
// abre o seletor no clique. O React 19 (o mínimo do pacote) põe a regra no topo da página UMA vez.
const REGRA_DO_CAMPO_WEB = "input[data-aurea-campo-data]::-webkit-calendar-picker-indicator{"
  + "position:absolute;top:0;left:0;width:100%;height:100%;margin:0;padding:0;opacity:0;cursor:pointer}";
const doisDigitos = (n: number) => String(n).padStart(2, "0");
/** A data no formato do campo do navegador: `AAAA-MM-DD` (data) ou `HH:MM` (hora), no fuso local. */
const paraCampoWeb = (d: Date, mode: "date" | "time") => mode === "time"
  ? `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`
  : `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
/**
 * O texto do campo de volta para `Date`, mexendo só no que o campo escolhe: a data mantém a hora de
 * `base`, e a hora mantém a data — como o seletor do aparelho, que parte do `value` (ou de agora).
 * Texto incompleto ou vazio (a pessoa apagou) não vira data: `undefined`, e `onChange` não é chamado.
 */
const doCampoWeb = (texto: string, mode: "date" | "time", base: Date): Date | undefined => {
  const d = new Date(base.getTime());
  if (mode === "time") {
    const m = /^(\d{2}):(\d{2})/.exec(texto);
    if (!m) return undefined;
    d.setHours(Number(m[1]), Number(m[2]), 0, 0);
    return d;
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!m) return undefined;
  d.setFullYear(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d;
};

// ─────────────────────────────────────────────────────────────────────────────────────────────
// DatePicker
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface DatePickerProps {
  value?: Date;
  onChange?: (d: Date) => void;
  /** Padrão: a data de hoje, quando o diálogo abre sem valor. */
  mode?: "date" | "time";
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  size?: AureaFieldSize;
  /** Como a data vira texto no gatilho. Padrão: o formato do aparelho. */
  format?: (d: Date) => string;
  placeholder?: string;
  icon?: AureaIcon | false;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * O campo de data — **a nossa pele, o calendário DELES**.
 *
 * ⚠ **E isso é a decisão, não uma concessão.** A Aurea desenha o gatilho (mesma altura, mesma
 * borda e o mesmo raio do `Input`), e o que abre é o **diálogo do sistema**. Data é um controle
 * que o Android e o iOS fazem melhor e que a pessoa já sabe usar — reimplementá-lo daria um
 * calendário com a nossa cor e o comportamento errado em nove casos de borda (fuso, calendário
 * não gregoriano, entrada por teclado, TalkBack).
 *
 * ⚠ **As duas plataformas têm APIs DIFERENTES**, e isso não é detalhe de implementação — é o que
 * o componente existe para esconder:
 *
 *     Android  ->  `DateTimePickerAndroid.open({...})`  IMPERATIVO, o diálogo é do sistema
 *     iOS      ->  `<RNDateTimePicker>`                 DECLARATIVO, vira um nó na árvore
 *
 * Um app que não soubesse disso escreveria o caminho do Android e veria nada acontecer no iPhone.
 */
export function DatePicker({
  value, onChange, mode = "date", minimumDate, maximumDate, disabled, size,
  format, placeholder, icon = "calendar", style, testID,
}: DatePickerProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const campo = useCampo();
  const tam = size ?? campo?.size ?? "md";
  const inativo = disabled ?? campo?.disabled;
  // Só o iOS precisa manter o seletor na árvore; no Android o diálogo é do sistema e some sozinho.
  const [abertoNoIOS, setAbertoNoIOS] = React.useState(false);

  const texto = value
    ? (format ? format(value) : value.toLocaleDateString())
    : (placeholder ?? strings.datePlaceholder);

  const receber = React.useCallback((evento: {type: string}, data?: Date) => {
    setAbertoNoIOS(false);
    // `dismissed` é a pessoa cancelando. Chamar `onChange` aí gravaria uma data que ninguém
    // escolheu — e no Android o `value` volta preenchido mesmo no cancelamento.
    if (evento.type === "set" && data) onChange?.(data);
  }, [onChange]);

  const abrir = React.useCallback(() => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: value ?? new Date(), mode, minimumDate, maximumDate, onChange: receber,
      });
      return;
    }
    setAbertoNoIOS(true);
  }, [value, mode, minimumDate, maximumDate, receber]);

  const mostrarSeletorIOS = abertoNoIOS && Platform.OS !== "android";

  const conteudo = (
    <>
      <Text size={tam === "sm" ? "xs" : tam === "lg" ? "base" : "md"}
            tone={value ? "default" : "subtle"} numberOfLines={1}>
        {texto}
      </Text>
      {icon && <Icon name={icon} size="sm" color={t.color.subtleForeground} />}
    </>
  );
  const pele = [
    s.gatilho,
    {height: alturaDoTamanho(t, tam),
     paddingHorizontal: tam === "sm" ? t.size.space3 : tam === "lg" ? t.size.space4 : 13},
    campo?.invalido && s.invalido,
    inativo && s.desabilitado,
    style,
  ];

  if (Platform.OS === "web") {
    // O gatilho vira só desenho: sem toque, fora do Tab e escondido do leitor de tela. Quem recebe
    // o toque, o foco e o nome é o campo do navegador, por cima dele.
    const campoDoNavegador = React.createElement("input", {
      type: mode === "time" ? "time" : "date",
      value: value ? paraCampoWeb(value, mode) : "",
      min: minimumDate && mode === "date" ? paraCampoWeb(minimumDate, mode) : undefined,
      max: maximumDate && mode === "date" ? paraCampoWeb(maximumDate, mode) : undefined,
      disabled: inativo,
      "aria-label": campo?.label ?? (value ? texto : placeholder ?? strings.datePlaceholder),
      "aria-invalid": campo?.invalido || undefined,
      "aria-description": campo?.hint,
      "data-testid": testID ? `${testID}-campo` : undefined,
      "data-aurea-campo-data": "",
      onChange: (e: {currentTarget: {value: string}}) => {
        const data = doCampoWeb(e.currentTarget.value, mode, value ?? new Date());
        if (data) onChange?.(data);
      },
      onClick: (e: {currentTarget: {showPicker?: () => void}}) => {
        // Sem `showPicker` (Safari do iPhone) o próprio toque já abriu o seletor; e ele pode
        // recusar (página dentro de outra), caso em que o campo continua lá, focado.
        try { e.currentTarget.showPicker?.(); } catch { /* o toque no campo basta */ }
      },
      style: {
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%", margin: 0,
        padding: 0, border: 0, opacity: 0, cursor: inativo ? "default" : "pointer",
        // O calendário do navegador segue o tema da Aurea, e não o do sistema operacional.
        colorScheme: t.theme,
      },
    });
    return (
      <Pressable testID={testID} disabled={inativo} focusable={false} style={pele}>
        <View importantForAccessibility="no-hide-descendants" style={s.mioloWeb}>{conteudo}</View>
        {React.createElement("style", {href: "aurea-campo-data", precedence: "default"}, REGRA_DO_CAMPO_WEB)}
        {campoDoNavegador}
      </Pressable>
    );
  }

  return (
    <>
      <Pressable
        testID={testID}
        onPress={inativo ? undefined : abrir}
        disabled={inativo}
        accessibilityRole="button"
        accessibilityLabel={campo?.label}
        accessibilityHint={campo?.hint}
        accessibilityValue={{text: value ? texto : undefined}}
        {...estadoAcessivel({disabled: !!inativo})}
        style={pele}>
        {conteudo}
      </Pressable>
      {mostrarSeletorIOS && (
        <RNDateTimePicker
          value={value ?? new Date()}
          mode={mode}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={receber}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// PhotoInput
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaPhoto = {
  uri: string; width?: number; height?: number;
  /**
   * Quando a foto foi TIRADA, lida do EXIF (R-23). Só vem com a prop `exif`, e fica vazia quando
   * a foto não traz a data — a que passou por um aplicativo de mensagens, por exemplo, perde o EXIF no caminho.
   */
  takenAt?: Date;
};

// R-23 (06/10/2026) · a data em que a foto foi tirada, e NADA MAIS do EXIF.
//
// Lido no fonte do `expo-image-picker` 57.0.15: no iPhone o código junta o dicionário `{Exif}` no
// topo, então `DateTimeOriginal` chega com esse nome nos dois sistemas. O formato do EXIF é
// "AAAA:MM:DD HH:MM:SS", sem fuso. O iPhone pode mandar `OffsetTimeOriginal` ("-03:00"); a lista
// de etiquetas do Android não tem fuso, e aí vale a hora local do aparelho — que é a hora em que
// a pessoa estava, no caso comum de fotografar e lançar no mesmo lugar.
//
// ⚠ O EXIF de uma foto da galeria traz também a LOCALIZAÇÃO. Por isso esta função devolve uma
// data e o EXIF não sai daqui: o app não recebe o que não pediu.
function dataDaFoto(exif: Record<string, unknown> | null | undefined): Date | undefined {
  const bruto = exif?.DateTimeOriginal ?? exif?.DateTimeDigitized;
  if (typeof bruto !== "string") return undefined;
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(bruto.trim());
  if (!m) return undefined;
  const [ano, mes, dia, hora, minuto, segundo] = m.slice(1).map(Number);
  // "0000:00:00 00:00:00" é como câmera sem relógio escreve "sem data".
  if (ano === 0 || mes < 1 || mes > 12 || dia < 1 || dia > 31 || hora > 23 || minuto > 59 || segundo > 59) {
    return undefined;
  }
  const fuso = exif?.OffsetTimeOriginal ?? exif?.OffsetTimeDigitized;
  const f = typeof fuso === "string" ? /^([+-])(\d{2}):(\d{2})$/.exec(fuso.trim()) : null;
  if (f) {
    const minutos = (f[1] === "-" ? -1 : 1) * (Number(f[2]) * 60 + Number(f[3]));
    return new Date(Date.UTC(ano, mes - 1, dia, hora, minuto, segundo) - minutos * 60000);
  }
  return new Date(ano, mes - 1, dia, hora, minuto, segundo);
}

export interface PhotoInputProps {
  value?: AureaPhoto[];
  onChange?: (fotos: AureaPhoto[]) => void;
  /** Quantas fotos cabem. Padrão: 1 — o plano do consumidor pede um anexo por lançamento. */
  max?: number;
  /**
   * De onde vem a foto. Padrão `camera`, que é o que o plano do consumidor pede.
   * `library` abre a galeria; quem quiser os dois desenha dois gatilhos.
   */
  source?: "camera" | "library";
  disabled?: boolean;
  /** Levar às configurações do app quando a pessoa negou e o sistema não pergunta mais. */
  offerSettings?: boolean;
  /** Avisado quando a permissão foi negada — o app pode querer contar uma história própria. */
  onPermissionDenied?: () => void;
  /**
   * Lê do EXIF a data em que a foto foi tirada e a entrega em `takenAt` (R-23). Desligado por
   * padrão: ler o EXIF custa (no iPhone, a foto que está no iCloud desce inteira) e o app só
   * paga quando precisa. Da galeria, é o que põe na ordem certa a foto que sobe dias depois.
   */
  exif?: boolean;
  addIcon?: AureaIcon | false;
  removeIcon?: AureaIcon;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * O anexo por foto.
 *
 * ⚠ **ESTE COMPONENTE CARREGA DECISÕES DE FLUXO QUE NÃO ERAM ÓBVIAS, e elas estão declaradas
 * aqui em vez de escondidas no código.** Eu recomendei adiá-lo por isso; o Victor mandou fazer, e
 * então cada pergunta foi respondida com um padrão — e cada padrão tem uma saída:
 *
 * | a pergunta | o que ficou | como mudar |
 * |---|---|---|
 * | o que mostrar **sem** permissão? | o gatilho aparece normal. Tocar é que pergunta | — |
 * | e se a pessoa **negar**? | pergunta de novo na próxima vez, enquanto o sistema deixar | `onPermissionDenied` |
 * | e se negar de vez (`canAskAgain: false`)? | um `Alert` de aviso + botão para as **configurações** | `offerSettings={false}` |
 * | **câmera ou galeria?** | câmera, que é o que o plano pede | `source="library"` |
 * | como **remover**? | um `IconButton` no canto de cada miniatura | `removeIcon` |
 * | **quantas** cabem? | uma | `max` |
 * | **várias de uma vez?** | da galeria, sim, quando cabe mais de uma (R-23) | `max` |
 * | **a data** em que foi tirada? | não lê: ler o EXIF custa | `exif` → `takenAt` (R-23) |
 *
 * ⚠ **O gatilho some quando o limite é atingido**, em vez de ficar aceso e não fazer nada.
 *
 * **R-22 (02/10/2026), achado do app: a pessoa não conseguia OLHAR a foto que escolheu.** A
 * miniatura era um `Avatar` redondo de 42, sem toque, e o X (sem fundo, só 8 para fora) cobria
 * metade dela. Agora, na "B" da prancha escolhida pelo Victor:
 *
 * | | |
 * |---|---|
 * | miniatura | quadrada de 64, a `Image` da `Gallery` (o `Avatar` `lg` da referência) |
 * | tocar nela | abre a foto grande, no MESMO zoom da `Gallery` (`FotoAmpliada`) |
 * | o X | com fundo, TODO fora da foto, no canto de cima à direita |
 * | leitor de tela | *"Foto 2 de 3"* (com uma só, *"Foto"*) e *"Abre a foto"*; o X, *"Remover foto 2"* |
 * | inativo | a foto ainda abre (olhar não muda nada); o X não remove |
 */
export function PhotoInput({
  value = [], onChange, max = 1, source = "camera", disabled, offerSettings = true,
  onPermissionDenied, exif = false, addIcon = "camera", removeIcon = "x", style, testID,
}: PhotoInputProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const campo = useCampo();
  const inativo = disabled ?? campo?.disabled;
  const [negadoDeVez, setNegadoDeVez] = React.useState(false);
  const [aberta, setAberta] = React.useState<number | null>(null);
  const cheio = value.length >= max;
  // "Foto 2 de 3": a posição entre as que EXISTEM, e não entre as que cabem (`max`).
  const nomeDa = (n: number) => value.length > 1
    ? `${strings.photo} ${n + 1} ${strings.positionOf} ${value.length}` : strings.photo;
  const fotoAberta = aberta != null ? value[aberta] : undefined;

  const escolher = React.useCallback(async () => {
    if (source === "camera") {
      const atual = await ImagePicker.getCameraPermissionsAsync();
      let resposta = atual;
      // `canAskAgain: false` quer dizer que o SISTEMA não vai mais mostrar o diálogo — pedir de
      // novo ali seria uma chamada que não faz nada, e a pessoa veria o app "travar" sem motivo.
      if (!atual.granted && atual.canAskAgain) resposta = await ImagePicker.requestCameraPermissionsAsync();
      if (!resposta.granted) {
        setNegadoDeVez(!resposta.canAskAgain);
        onPermissionDenied?.();
        return;
      }
    }
    // R-23: da GALERIA, escolhe várias de uma vez quando cabe mais de uma, até o que falta para o
    // `max`. A câmera tira uma por vez — no sistema, não há outro jeito.
    const cabem = max - value.length;
    const r = source === "camera"
      ? await ImagePicker.launchCameraAsync({quality: 0.7, exif})
      : await ImagePicker.launchImageLibraryAsync(cabem > 1
        ? {quality: 0.7, exif, allowsMultipleSelection: true, selectionLimit: cabem}
        : {quality: 0.7, exif});
    if (r.canceled || !r.assets?.length) return;
    const novas: AureaPhoto[] = r.assets
      .slice(0, cabem)
      .map((a: {uri: string; width?: number; height?: number; exif?: Record<string, unknown> | null}) => {
        const foto: AureaPhoto = {uri: a.uri, width: a.width, height: a.height};
        const quando = exif ? dataDaFoto(a.exif) : undefined;
        if (quando) foto.takenAt = quando;
        return foto;
      });
    onChange?.([...value, ...novas]);
  }, [source, max, value, onChange, onPermissionDenied, exif]);

  return (
    <View testID={testID} style={style}>
      {negadoDeVez && (
        <Alert variant="warning">
          <View style={{gap: t.size.space2}}>
            <Text size="sm" tone="muted">{strings.cameraDenied}</Text>
            {offerSettings && (
              <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button"
                         accessibilityLabel={strings.openSettings}>
                <Text size="sm" weight={600} tone="primary">{strings.openSettings}</Text>
              </Pressable>
            )}
          </View>
        </Alert>
      )}

      <View style={[s.galeria, value.length > 0 && s.comX]}>
        {value.map((foto, n) => (
          <View key={`${foto.uri}-${n}`} style={s.miniatura}>
            <Pressable
              onPress={() => setAberta(n)}
              accessibilityRole="imagebutton"
              accessibilityLabel={nomeDa(n)}
              accessibilityHint={strings.photoOpen}>
              {/* `alt=""`: quem dá nome é a miniatura, e o leitor não diz a foto duas vezes. */}
              <Image source={foto.uri} alt="" ratio={1} />
            </Pressable>
            <View style={s.remover}>
              <IconButton
                appearance="solid" size="sm" name={removeIcon}
                label={`${strings.photoRemove} ${n + 1}`}
                disabled={inativo}
                onPress={() => onChange?.(value.filter((_, i) => i !== n))} />
            </View>
          </View>
        ))}
        {/* O gatilho SOME no limite, em vez de ficar aceso sem fazer nada. */}
        {!cheio && (
          <Pressable
            onPress={inativo ? undefined : escolher}
            disabled={inativo}
            accessibilityRole="button"
            accessibilityLabel={campo?.label ?? strings.photoAdd}
            {...estadoAcessivel({disabled: !!inativo})}
            style={[s.adicionar, inativo && s.desabilitado]}>
            {addIcon && <Icon name={addIcon} size="lg" color={t.color.subtleForeground} />}
          </Pressable>
        )}
      </View>

      <FotoAmpliada
        source={fotoAberta?.uri}
        title={aberta != null ? nomeDa(aberta) : ""}
        alt={aberta != null ? nomeDa(aberta) : ""}
        // A proporção da foto, quando a câmera a deu: a grande aparece inteira, sem tarja à toa.
        ratio={fotoAberta?.width && fotoAberta.height ? fotoAberta.width / fotoAberta.height : 1}
        onClose={() => setAberta(null)} />
    </View>
  );
}
