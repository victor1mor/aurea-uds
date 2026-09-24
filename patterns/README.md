# Recipes — the 23 contract archetypes

Each product archetype from the contract
(`packages/contracts/aurea.contract.json` → `applicationPatterns.archetypes`)
becomes a **recipe**: how to assemble that kind of product by composing the
blocks Aurea already has.

This is documentation, not a code package. The contract's rule:

> "Archetypes are recipes of optional patterns, never new component families."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Recipe format

One file per archetype, named with the contract id (`saas_admin.md`).

Required front matter — `scripts/validate.py` (check 9) compares it against the
contract and fails if it diverges:

```markdown
---
archetype: saas_admin
patterns: AppShell, CollectionWorkbench, FormFlow, IdentityAccess
---
```

Sections, in order (they mirror the contract's `recipeContract`:
`patterns`, `capabilities`, `invariants`):

1. **Composition** — each contract pattern → concrete Aurea blocks.
2. **Capabilities** — each contract capability → how to cover it.
3. **Invariants** — each invariant (quoted in English, as in the contract)
   → a concrete practice in the composition.
4. **States** — which states the UI needs to show and with which block.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Vocabulary: contract pattern → Aurea blocks

The 17 patterns (12 application + 5 operational) and the blocks that
realize them. React = `@aurea-uds/react`; classes = `@aurea-uds/core`.

**AppShell**
`AppShell`, `CommandPaletteShell`, `Breadcrumb`, `Banner`;
`.app-shell`, `.skip-link`, `.brand`, `.status-dot`.

**CollectionWorkbench**
`DataGrid`, `Table`, `DataList`, `TreeView`, `SearchField`, `Pagination`,
`MultiCombobox` (facets), `SegmentedControl` (view switch),
`EmptyState`, `Skeleton`.

**FormFlow**
`Field`, `Input` (includes `type="date"` — Phase 4 step 5 decision),
`Select`, `Textarea`, `Checkbox`, `Radio`, `Switch`, `Range`,
`FileInput`, `MultiCombobox`; `.stepper`/`.step`, `.field-error`.

**ContentWorkbench**
`Tabs`, `CodeBlock`, `TreeView` (outline);
`.doc-main`, `.doc-nav`, `.doc-section`.

**VisualBuilder**
`.builder-canvas`, `.builder-node`, `.builder-edge`, `.builder-outline`
(the keyboard/reader alternative required by the contract).

**AnalyticsWorkbench**
`KPI`, `DataGrid` (tabular alternative), `SegmentedControl` (time range);
`.chart`, `.chart-line`, `.chart-area`, `.legend`, `.pattern-kpis`.

**MediaLibrary**
`MediaPlayerShell`; `.media-library*`, `.media-compact`, `.queue-list`.

**IdentityAccess**
`Avatar`, `Badge`, `Dialog` (scoped confirmation);
`.permission-row`, `.approval`.

**TransactionFlow**
`.flow-panel`, `.flow-summary`, `.flow-total`, `.stepper`;
`Banner`/`Alert` (result), `Badge` (status).

**SchedulePlanner**
`.schedule-grid`, `.agenda-list`; native `Input type="date"`.

**SpatialWorkbench**
`.map-panel`, `.map-marker`, `.map-route` — always mirrored by a
list (`DataList`/`DataGrid`), a recurring invariant across the archetypes.

**DeviceControl**
`.device-grid`, `.health-matrix`, `.usage-bars`, `.cost-meter`;
`Alert` (sensitive command).

**RunSession** (operational)
`Timeline`, `LogStream`, `Progress`, `Badge` (accepted/running/…);
`.trace`, `.invocation`, `.approval`, `.event-stream`.

**ResourceWorkbench** (operational)
`TreeView`, `Tabs`, `CodeBlock`; `.file-list`, `.file-item`,
`.usage-bars`, `.health-matrix`.

**ConversationChannel** (operational)
`Avatar`, `Badge`, `NotificationCenter`; `.message`, `.status-dot`.

**ReviewCompare** (operational)
`Tabs` (before/after), `CodeBlock`, `Timeline` (history),
`Dialog` (scoped approve/reject).

**CaptureTranscript** (operational)
`Timeline`, `LogStream`, `MediaPlayerShell` (caption/transcript);
`.trace`, `.memory-entry`.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Index of the 23 archetypes

All 23 recipes done.

- `saas_admin` — [saas_admin.md](saas_admin.md)
- `dashboard_bi` — [dashboard_bi.md](dashboard_bi.md)
- `file_cloud` — [file_cloud.md](file_cloud.md)
- `agent_ai` — [agent_ai.md](agent_ai.md)
- `booking_calendar` — [booking_calendar.md](booking_calendar.md)
- `public_site` — [public_site.md](public_site.md)
- `docs_cms` — [docs_cms.md](docs_cms.md)
- `catalog_gallery` — [catalog_gallery.md](catalog_gallery.md)
- `media_streaming` — [media_streaming.md](media_streaming.md)
- `workflow_automation` — [workflow_automation.md](workflow_automation.md)
- `developer_tools` — [developer_tools.md](developer_tools.md)
- `messaging_social` — [messaging_social.md](messaging_social.md)
- `commerce_finance` — [commerce_finance.md](commerce_finance.md)
- `maps_logistics` — [maps_logistics.md](maps_logistics.md)
- `iot_control` — [iot_control.md](iot_control.md)
- `project_crm_erp` — [project_crm_erp.md](project_crm_erp.md)
- `education` — [education.md](education.md)
- `personal_productivity` — [personal_productivity.md](personal_productivity.md)
- `mobile_pwa` — [mobile_pwa.md](mobile_pwa.md)
- `support_service` — [support_service.md](support_service.md)
- `regulated_records` — [regulated_records.md](regulated_records.md)
- `creative_workspace` — [creative_workspace.md](creative_workspace.md)
- `observability_ops` — [observability_ops.md](observability_ops.md)
