// RECEITA · Booking · calendar (S-11, 05/11/2026) — marcar um horário como tela de produto, na linguagem dos blocos v2 (a
// `Tela`): o calendário (`Calendar`, com os dias passados e os fins de semana fechados), os horários livres do dia em
// cartões de escolha (`RadioGroup variant="card"`), o nome, e ao lado o que é a reunião e o fuso — que fica sempre à
// vista. Interação de verdade: trocar o dia troca os horários; "Confirm booking" marca, e a tela diz o que foi marcado.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Calendar} from "../../../../packages/react/dist/calendar.js";
import {Tela, Propriedades} from "./_tela.mjs";

const pilha = {display: "grid", gap: "var(--space-4)", minInlineSize: 0};
const MES = new Date(2026, 10, 1);
// O "hoje" do exemplo é FIXO: com o hoje de verdade, o calendário marcaria outro dia a cada montagem, e o site montado
// amanhã sairia diferente do de hoje (a trava "dist desatualizado" da CI reprovaria).
const HOJE = new Date(2026, 10, 6);
// Os horários livres mudam com o dia (no app, vêm da agenda de quem recebe).
const livres = d => d.getDate() % 3 === 0 ? ["09:00", "14:30"] : d.getDate() % 3 === 1 ? ["09:00", "10:30", "11:00", "16:00"] : ["11:00", "15:00", "15:30"];
const dia = d => d.toLocaleDateString("en-GB", {weekday: "long", day: "numeric", month: "long"});

function Booking() {
  const [data, setData] = useState(new Date(2026, 10, 12));
  const [hora, setHora] = useState(() => livres(new Date(2026, 10, 12))[0]);
  const [nome, setNome] = useState("Curator");
  const [marcado, setMarcado] = useState(null);
  const horas = livres(data);
  const escolher = d => { if (!d) return; setData(d); setHora(livres(d)[0]); setMarcado(null); };
  return h(Tela, {icone: "calendar-check", trilha: ["Bookings", "Product demo"], titulo: "Book a 30-minute demo",
    estado: h(A.Badge, {tone: "info"}, "Europe/Lisbon"),
    propriedades: [["clock", "30 min"], ["video-camera", "Video call"], ["user", "With Analyst"]],
    lado: h(Propriedades, {titulo: "Your booking", itens: [{term: "Day", value: dia(data)}, {term: "Time", value: `${hora} (Lisbon)`},
      {term: "In your time", value: `${hora} UTC+0`}, {term: "Name", value: nome || "—"}]}),
    rodape: "Times are shown in the host's time zone, with yours next to them. A booked slot disappears for everyone else.",
    rodapeAcoes: h(A.Button, {variant: "primary", leadingIcon: "check", disabled: !nome.trim() || !!marcado,
      onClick: () => setMarcado(`${dia(data)} at ${hora}`)}, marcado ? "Booked" : "Confirm booking")},
    marcado ? h(A.Alert, {variant: "success", title: "You are booked"}, `${marcado}, Lisbon time. The invitation went to your email.`) : null,
    h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-5)", alignItems: "flex-start"}},
      // O calendário já tem fundo próprio (sem a caixa cinza, que o empurrava para fora no celular); numa tela mais estreita
      // que ele, ele rola no próprio lugar em vez de vazar.
      h("div", {style: {minInlineSize: 0, maxInlineSize: "100%", overflowX: "auto"}}, h(Calendar, {mode: "single", label: "Day", defaultMonth: MES, today: HOJE, selected: data, onSelect: escolher,
        disabled: [{before: HOJE}, {dayOfWeek: [0, 6]}]})),
      h("div", {style: {...pilha, flex: "1 1 calc(var(--space-24) * 2)"}},
        h(A.RadioGroup, {label: `Free on ${dia(data)}`, variant: "card", value: hora, onValueChange: setHora},
          ...horas.map(t => h(A.Radio, {key: t, value: t, label: t, description: "30 min"}))),
        h(A.Field, {label: "Your name"}, h(A.Input, {value: nome, onChange: e => setNome(e.target.value)})))));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Heading", "Badge", "Calendar", "RadioGroup", "Radio", "Field", "Input", "DataList", "Button", "Alert"],
  code: `import {useState} from "react";
import {Alert, Badge, Button, Card, DataList, Field, Heading, Input, Radio, RadioGroup, Separator} from "@aurea-uds/react";
import {Calendar} from "@aurea-uds/react/calendar";

export function Booking({slotsFor, timeZone}) {
  const [day, setDay] = useState(new Date(2026, 10, 12));
  const [time, setTime] = useState(slotsFor(day)[0]);
  const [name, setName] = useState("");
  const [booked, setBooked] = useState(false);

  return (
    <Card>
      <header>
        <Heading level={3}>Book a 30-minute demo</Heading> <Badge tone="info">{timeZone}</Badge>
      </header>
      <Separator />

      {booked && <Alert variant="success" title="You are booked">{format(day)} at {time}.</Alert>}

      <Calendar mode="single" label="Day" selected={day}
        onSelect={d => { setDay(d); setTime(slotsFor(d)[0]); }}
        disabled={[{before: new Date()}, {dayOfWeek: [0, 6]}]} />
      <RadioGroup label={\`Free on \${format(day)}\`} variant="card" value={time} onValueChange={setTime}>
        {slotsFor(day).map(t => <Radio key={t} value={t} label={t} description="30 min" />)}
      </RadioGroup>
      <Field label="Your name"><Input value={name} onChange={e => setName(e.target.value)} /></Field>

      <aside>
        <DataList items={[{term: "Day", value: format(day)}, {term: "Time", value: time}]} />
      </aside>
      <Separator />
      <footer>
        <Button variant="primary" disabled={!name || booked} onClick={() => setBooked(true)}>Confirm booking</Button>
      </footer>
    </Card>
  );
}`,
  render: () => h(Booking),
};
