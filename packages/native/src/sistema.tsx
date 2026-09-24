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
import {Avatar} from "./display.js";
import {criarFolha} from "./estilos.js";
import {Alert} from "./feedback.js";
import {Icon, type IconName} from "./icon.js";
import {useCampo, type AureaFieldSize} from "./inputs.js";
import {Text} from "./text.js";
import {useAureaStrings, useAureaTokens} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

const folha = criarFolha((t: AureaTokens) => ({
  gatilho: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    width: "100%", borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
    borderRadius: t.size.radiusControl, backgroundColor: t.color.fieldBg,
  },
  invalido: {borderColor: t.color.danger400 ?? t.color.destructive},
  desabilitado: {opacity: t.size.opacityDisabled},
  galeria: {flexDirection: "row", flexWrap: "wrap", gap: t.size.space2},
  miniatura: {position: "relative"},
  remover: {position: "absolute", top: -t.size.space2, right: -t.size.space2},
  adicionar: {
    alignItems: "center", justifyContent: "center", gap: t.size.space1,
    width: 72, height: 72, borderRadius: t.size.radiusMd,
    borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
    borderStyle: "dashed", backgroundColor: t.color.fieldBg,
  },
}));

const alturaDoTamanho = (t: AureaTokens, s: AureaFieldSize) =>
  s === "sm" ? t.size.controlHSm : s === "lg" ? t.size.controlHLg : t.size.controlHMd;

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
  icon?: IconName | false;
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
        accessibilityState={{disabled: !!inativo}}
        style={[
          s.gatilho,
          {height: alturaDoTamanho(t, tam),
           paddingHorizontal: tam === "sm" ? t.size.space3 : tam === "lg" ? t.size.space4 : 13},
          campo?.invalido && s.invalido,
          inativo && s.desabilitado,
          style,
        ]}>
        <Text size={tam === "sm" ? "xs" : tam === "lg" ? "base" : "md"}
              tone={value ? "default" : "subtle"} numberOfLines={1}>
          {texto}
        </Text>
        {icon && <Icon name={icon} size="sm" color={t.color.subtleForeground} />}
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

export type AureaPhoto = {uri: string; width?: number; height?: number};

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
  addIcon?: IconName | false;
  removeIcon?: IconName;
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
 *
 * ⚠ **O gatilho some quando o limite é atingido**, em vez de ficar aceso e não fazer nada.
 */
export function PhotoInput({
  value = [], onChange, max = 1, source = "camera", disabled, offerSettings = true,
  onPermissionDenied, addIcon = "camera", removeIcon = "close", style, testID,
}: PhotoInputProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const campo = useCampo();
  const inativo = disabled ?? campo?.disabled;
  const [negadoDeVez, setNegadoDeVez] = React.useState(false);
  const cheio = value.length >= max;

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
    const r = source === "camera"
      ? await ImagePicker.launchCameraAsync({quality: 0.7})
      : await ImagePicker.launchImageLibraryAsync({quality: 0.7});
    if (r.canceled || !r.assets?.length) return;
    const novas: AureaPhoto[] = r.assets
      .slice(0, max - value.length)
      .map((a: {uri: string; width?: number; height?: number}) =>
        ({uri: a.uri, width: a.width, height: a.height}));
    onChange?.([...value, ...novas]);
  }, [source, max, value, onChange, onPermissionDenied]);

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

      <View style={s.galeria}>
        {value.map((foto, n) => (
          <View key={foto.uri} style={s.miniatura}>
            <Avatar source={foto.uri} size="lg" alt="" />
            <View style={s.remover}>
              <IconButton
                appearance="ghost" size="sm" name={removeIcon}
                label={strings.photoRemove}
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
            accessibilityLabel={campo?.label}
            accessibilityState={{disabled: !!inativo}}
            style={[s.adicionar, inativo && s.desabilitado]}>
            {addIcon && <Icon name={addIcon} size="lg" color={t.color.subtleForeground} />}
          </Pressable>
        )}
      </View>
    </View>
  );
}
