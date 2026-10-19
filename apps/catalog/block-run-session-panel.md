# Run session panel

One run, end to end: what state it is in, the turns, the tool it is calling, where it resumes from, the receipt it already owns, and only the actions the run can take right now. The approval gate takes the place of the actions while a person has to decide.

## Usage

```tsx
import {Status, MessageList, InvocationPanel, HumanApproval, DataList, Toolbar, ToolbarButton} from "@aurea-uds/react";
```

```tsx
// Which actions exist is a fact about the RUN, so it comes from the run's own state
// machine — never from a list written next to the buttons, where it drifts unseen.
const actions = allowedFrom(run.state);   // e.g. running -> ["interrupt", "cancel"]

<div className="stack">
  <div role="group" aria-label="Run" className="cluster" style={{justifyContent:"space-between"}}>
    <strong>{run.id}</strong>
    {/* the three "waiting" states are universal (ADR-0018): pass the state and the
        sentence comes from the vocabulary. The other six carry their own label. */}
    {run.state.startsWith("waiting_")
      ? <Status state={run.state} />
      : <Status variant={tone[run.state]}>{label[run.state]}</Status>}
  </div>

  <MessageList label="Turns" messages={run.turns} />
  <InvocationPanel title="write_file" running={run.state === "running"}
    input={run.tool.input} steps={run.tool.steps} output={run.output} />

  {run.state === "waiting_approval" &&
    <HumanApproval title="Write to the repository" risk="medium"
      details={run.approval.details} onApprove={approve} onDeny={reject} />}

  {/* the receipt exists from the moment the run is accepted, and is never erased */}
  <div role="group" aria-label="Checkpoint"><DataList items={run.checkpoint} /></div>
  <div role="group" aria-label="Receipt"><DataList items={run.receipt} /></div>

  {actions.length > 0 &&
    <div role="group" aria-label="Actions">
      <Toolbar label="Run actions">
        {actions.map(a => <ToolbarButton key={a} onClick={() => send(a)}>{label[a]}</ToolbarButton>)}
      </Toolbar>
    </div>}
</div>
```
