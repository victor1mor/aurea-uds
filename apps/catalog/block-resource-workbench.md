# Resource workbench

Where resources come from, what is in there, what the selected one is, what is in flight right now, where it all came from, and only the actions this phase allows. The transfer says its phase and its percent in words, so the bar is never the only thing carrying the news.

## Usage

```tsx
import {TreeView, Table, Status, Progress, Alert, DataList, Toolbar, ToolbarButton} from "@aurea-uds/react";
```

```tsx
// Which actions exist is a fact about the TRANSFER, so it comes from its own state
// machine — never from a list written next to the buttons, where it drifts unseen.
const actions = allowedFrom(job.state);   // transferring -> ["pause", "verify"]

<div className="stack">
  {/* tree and list side by side: that is what a workbench IS, and stacking them
      costs the height the other four regions need */}
  <div className="grid" style={{gridTemplateColumns:"minmax(140px,1fr) 2fr"}}>
    <TreeView label="Workspace" items={job.tree} defaultExpandedIds={["brand"]} />
    <Table caption="Resources">{/* … */}</Table>
  </div>

  {/* "conflict requires preview": the conflict is explained HERE, next to what arrived,
      because whoever chooses has to see what is about to be overwritten */}
  <div role="group" aria-label="Preview">
    <strong>{job.selected.name}</strong>
    <div className="hint">{job.selected.summary}</div>
    {job.state === "conflict" &&
      <Alert variant="warning" title="Name already taken">{job.conflict.existing}</Alert>}
  </div>

  {/* one number feeds BOTH the bar and the sentence — "progress announces percent
      and phase", and a bar on its own is drawing, not announcing */}
  <div role="group" aria-label="Transfer queue">
    <div className="cluster" style={{justifyContent:"space-between"}}>
      <span>{job.file.name}</span>
      <span className="hint">{job.phase} · {job.percent}%</span>
    </div>
    <Progress value={job.percent} label={job.phase + " " + job.file.name} />
  </div>

  {/* "restore keeps provenance": it exists from discovery and survives everything,
      so it is not conditional on any state */}
  <div role="group" aria-label="Provenance"><DataList items={job.provenance} /></div>

  {actions.length > 0 &&
    <div role="group" aria-label="Actions">
      <Toolbar label="Workbench actions">
        {actions.map(a => <ToolbarButton key={a} onClick={() => send(a)}>{label[a]}</ToolbarButton>)}
      </Toolbar>
    </div>}
</div>
```
