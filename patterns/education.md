---
archetype: education
patterns: ContentWorkbench, MediaLibrary, FormFlow, SchedulePlanner, AnalyticsWorkbench
---

# Education

Lessons, assessment and progress: progress is readable without relying on color and
media always has captions or a transcript.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**ContentWorkbench** — the lesson in `.doc-main`/`.doc-section`; `.doc-nav`/
`TreeView` as the course outline (modules → lessons). `Tabs` for material ⟷
exercises; `CodeBlock` in technical content.

**MediaLibrary** — lesson video/audio in `MediaPlayerShell`; caption and
synchronized transcript (a `Timeline` of chapters + text). A library of
lessons in `.media-library-row`/`.media-compact`.

**FormFlow** — assessment in `Field` + `Input`/`Radio`/`Checkbox`/`Textarea`;
`.stepper` for a multi-step test; per-field validation and result.

**SchedulePlanner** — classes and deadlines in `.schedule-grid`/`.agenda-list`;
native `Input type="date"` for submissions.

**AnalyticsWorkbench** — student progress in `Progress`/`.pattern-kpis`;
grades in a `DataGrid`; `.chart-*` for the trend (with a text label, not color alone).

## Capabilities

- **lessons** — ContentWorkbench + MediaLibrary; navigation by outline.
- **assessment** — FormFlow; `.stepper` in a test; feedback per question.
- **progress** — `Progress` + a text label/percentage; a state `Badge`
  (not started/in progress/completed) with text, not color alone.
- **sessions** — SchedulePlanner; a live/recorded class with a distinct `Badge`.

## Invariants

> "progress is available without color"

Progress is never communicated by color alone. `Progress` carries a percentage/text
label; the lesson state is a `Badge` WITH text ("Completed"), not just green;
charts have a label or pattern beyond color. A colorblind person and a screen reader read
the same progress.

> "media has captions or transcript"

Every lesson video/audio offers a caption OR a synchronized transcript
(`Timeline` + text) — it's not optional. Media with no text alternative doesn't
get in; the transcript also serves as search and review.

## States

- `loading` — `Skeleton` in the lesson and the module list.
- `empty` — a course with no content: `EmptyState`.
- `in_progress` — `Progress` with a label; resumes from the saved point.
- `submitted` — assessment submitted: confirmation + grading deadline.
- `graded` — grade + feedback per question; a receipt for the submission.
- `error` — `Alert`; drafted answers aren't lost.
