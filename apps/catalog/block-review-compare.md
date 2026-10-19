# Review compare

Nothing changes until someone sees what would change: the difference, the checks that ran on it, the one decision the change can take right now, and the receipt that apply writes and rollback points back to. Additions and deletions are text, so the diff reads the same without colour.

## Usage

```tsx
import {Status, CodeBlock, Alert, Toolbar, ToolbarButton, DataList} from "@aurea-uds/react";
```

```tsx
// Which actions exist is a fact about the CHANGE, so it comes from its own state
// machine. ReviewCompare has no separate "actions" region — `decision` is where every
// human action lives — so nothing is filtered out of the derivation.
const actions = allowedFrom(change.state);   // applied -> ["rollback"]

<div className="stack">
  <div role="group" aria-label="Change" className="cluster" style={{justifyContent:"space-between"}}>
    <div><strong>{change.file}</strong><div className="hint">{change.range}</div></div>
    <Status variant={tone[change.state]}>{label[change.state]}</Status>
  </div>

  {/* additions and deletions are TEXT — the +/- of a unified diff — never colour alone */}
  <div role="group" aria-label="Comparison">
    <CodeBlock language="diff">{change.diff}</CodeBlock>
    <div className="hint">{added} added, {removed} removed</div>
  </div>

  {/* announced: Alert is role="status", and role="alert" on its own when it is a failure */}
  {change.test &&
    <div role="group" aria-label="Test result">
      <Alert variant={change.test.variant}>{change.test.text}</Alert>
    </div>}

  {actions.length > 0 &&
    <div role="group" aria-label="Decision">
      <Toolbar label="Review decision">
        {actions.map(a => <ToolbarButton key={a} onClick={() => send(a)}>{label[a]}</ToolbarButton>)}
      </Toolbar>
    </div>}

  {/* apply writes the receipt; rollback points back at it and never erases it */}
  {change.receipt &&
    <div role="group" aria-label="Receipt"><DataList items={change.receipt} /></div>}
</div>
```
