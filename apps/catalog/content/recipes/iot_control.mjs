// RECEITA · IoT · control (S-11, 05/11/2026) — o controle de um aparelho como tela de produto, na linguagem dos blocos v2 (a
// `Tela`, e o "Device control" do desenho do Victor): a frota para escolher, o alerta com "Acknowledge", as duas leituras
// grandes (com a hora e a qualidade da leitura), o limite da temperatura, o ponto de ajuste (`Slider`), o modo noturno e a
// calibração, que escreve no aparelho e por isso pede confirmação. Interação de verdade: trocar de aparelho troca as
// leituras; mudar o ajuste e o modo; reconhecer o alerta; calibrar entra no histórico.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Tela, Propriedades, Grupo, Numero} from "./_tela.mjs";

const numeros = {display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, calc(var(--space-24) * 2)), 1fr))", gap: "var(--space-3)"};
const FROTA = {
  "gw-04": {nome: "gateway-04", lugar: "Pump room", estado: "online", temp: 74, tanque: 41, alerta: true},
  "gw-07": {nome: "gateway-07", lugar: "Roof", estado: "online", temp: 38, tanque: 88, alerta: false},
  "gw-09": {nome: "gateway-09", lugar: "Basement", estado: "offline", temp: null, tanque: null, alerta: false},
};
const LIMITE = 70;

function Device() {
  const [atual, setAtual] = useState("gw-04");
  const [ajuste, setAjuste] = useState(62);
  const [noite, setNoite] = useState(true);
  const [reconhecido, setReconhecido] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [historico, setHistorico] = useState([{title: "Firmware 2.4.1 installed", time: "Mon 03:00"}, {title: "Calibrated", description: "by Analyst", time: "Oct 28"}]);
  const d = FROTA[atual];
  const fora = d.temp != null && d.temp > LIMITE;
  const calibrar = () => { setConfirmar(false); setHistorico(hs => [{title: "Calibrated", description: `by you · setpoint ${ajuste} °C`, time: "09:22"}, ...hs]); };
  return h(Tela, {icone: "cpu", trilha: ["Fleet", d.lugar], id: d.nome, titulo: d.lugar,
    estado: h(A.Status, {variant: d.estado === "online" ? (fora ? "warning" : "success") : "offline"}, d.estado === "online" ? (fora ? "Over the limit" : "Online") : "Offline"),
    propriedades: [["wifi-high", d.estado === "online" ? "Signal good" : "No signal since 08:40"], ["clock", "Read 09:21"], ["cpu", "Firmware 2.4.1"]],
    acoes: h(A.Button, {variant: "danger-ghost", leadingIcon: "gauge", disabled: d.estado !== "online", onClick: () => setConfirmar(true)}, "Calibrate"),
    lado: [
      h(Grupo, {key: "f", titulo: "Fleet"}, h(A.RadioGroup, {label: "Device", labelHidden: true, value: atual, onValueChange: v => { setAtual(v); setReconhecido(false); }},
        ...Object.entries(FROTA).map(([id, x]) => h(A.Radio, {key: id, value: id, label: x.nome, description: `${x.lugar} · ${x.estado}`})))),
      h(Propriedades, {key: "p", titulo: "Device", itens: [{term: "Model", value: "GW-200"}, {term: "Serial", value: h(A.Code, null, "GW2-04-1187")}, {term: "Installed", value: "Mar 2025"}]})],
    rodape: "Reading a device never changes it. Anything that writes to it — like calibration — asks first and lands in the history."},
    d.estado !== "online" ? h(A.Banner, {variant: "warning", title: "This device is offline"}, "The last readings are from 08:40. Commands wait until it is back.") : null,
    d.alerta && !reconhecido ? h(A.Alert, {variant: "warning", title: `Temperature above ${LIMITE} °C`,
      action: h(A.Button, {variant: "secondary", size: "sm", onClick: () => setReconhecido(true)}, "Acknowledge")}, "Since 09:02. The pump keeps running.") : null,
    h("div", {style: numeros},
      h(Numero, {label: "Temperature", value: d.temp == null ? "—" : `${d.temp} °C`, trend: d.temp == null ? "no reading" : `limit ${LIMITE} °C`,
        direction: fora ? "up" : "flat", tone: fora ? "danger" : "neutral"}),
      h(Numero, {label: "Tank level", value: d.tanque == null ? "—" : `${d.tanque}%`, trend: d.tanque == null ? "no reading" : "good reading", direction: "flat", tone: "neutral"})),
    d.temp != null ? h(Grupo, {titulo: "Against the limit"},
      h(A.Progress, {value: Math.min(100, Math.round(d.temp / 90 * 100)), label: `Temperature, ${d.temp} °C of the 90 °C scale`, showLabel: true,
        tone: fora ? "danger" : "brand", detail: `limit ${LIMITE} °C`})) : null,
    h(Grupo, {titulo: "Settings"},
      h(A.Slider, {label: "Setpoint", value: ajuste, onValueChange: setAjuste, min: 40, max: 80, step: 1, showValue: true, format: {style: "unit", unit: "celsius"},
        disabled: d.estado !== "online"}),
      h(A.Switch, {label: "Night mode", description: "Halves the pump speed from 22:00 to 06:00", checked: noite, onChange: e => setNoite(e.target.checked),
        disabled: d.estado !== "online"})),
    h(Grupo, {titulo: "History"}, h(A.Timeline, {items: historico})),
    h(A.ConfirmDialog, {open: confirmar, destructive: true, title: `Calibrate ${d.nome}?`, confirmLabel: "Calibrate", cancelLabel: "Not now",
      description: `This writes the setpoint (${ajuste} °C) to the device and restarts its sensors for about 30 seconds.`,
      onConfirm: calibrar, onCancel: () => setConfirmar(false)}));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Button", "RadioGroup", "Radio", "DataList", "Banner", "Alert", "KPI",
    "Progress", "Slider", "Switch", "Timeline", "ConfirmDialog"],
  code: `import {useState} from "react";
import {Alert, Button, Card, ConfirmDialog, DataList, Heading, KPI, Progress, Radio, RadioGroup, Separator, Slider, Status,
  Switch, Timeline} from "@aurea-uds/react";

export function Device({fleet, limit, calibrate}) {
  const [id, setId] = useState(Object.keys(fleet)[0]);
  const [setpoint, setSetpoint] = useState(62);
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const d = fleet[id];

  return (
    <Card>
      <header>
        <Heading level={3}>{d.place}</Heading> <Status variant={d.temp > limit ? "warning" : "success"}>{d.state}</Status>
        <Button variant="danger-ghost" leadingIcon="gauge" onClick={() => setConfirm(true)}>Calibrate</Button>
      </header>
      <Separator />

      {d.alert && !acknowledged && (
        <Alert variant="warning" title={\`Temperature above \${limit} °C\`}
          action={<Button variant="secondary" size="sm" onClick={() => setAcknowledged(true)}>Acknowledge</Button>} />
      )}
      <Card variant="inset"><KPI variant="plain" label="Temperature" value={\`\${d.temp} °C\`} tone={d.temp > limit ? "danger" : "neutral"} /></Card>
      <Progress value={d.temp / 90 * 100} label="Temperature against the scale" showLabel detail={\`limit \${limit} °C\`} />
      <Slider label="Setpoint" value={setpoint} onValueChange={setSetpoint} min={40} max={80} showValue />
      <Switch label="Night mode" description="Halves the pump speed at night" />
      <Timeline items={d.history} />

      <div>
        <RadioGroup label="Device" labelHidden value={id} onValueChange={setId}>
          {Object.entries(fleet).map(([key, x]) => <Radio key={key} value={key} label={x.name} description={x.state} />)}
        </RadioGroup>
      </div>

      <ConfirmDialog open={confirm} destructive title={\`Calibrate \${d.name}?\`} confirmLabel="Calibrate"
        description="This writes to the device and restarts its sensors."
        onConfirm={() => { setConfirm(false); calibrate(id, setpoint); }} onCancel={() => setConfirm(false)} />
    </Card>
  );
}`,
  render: () => h(Device),
};
