---
title: AGENTS.md
description: Short Aurea rules to put in your project's AGENTS.md, for AI coding agents.
icon: robot
---

[AGENTS.md](https://agents.md/) is a file at the root of a project with instructions for AI coding agents. Aurea publishes its rules in a form you can put there.

## Usage

Download the file and save it at the root of your project:

```bash
curl -fsSL https://aureauds.dev/aurea-agents.md -o AGENTS.md
```

If your project already has an `AGENTS.md`, add the Aurea rules to the end of it instead:

```bash
curl -fsSL https://aureauds.dev/aurea-agents.md >> AGENTS.md
```

Some assistants read a file with another name, such as `CLAUDE.md`. Use the name your assistant reads.

## What it contains

- Where to read the documentation: the [LLMs.txt](./docs-llms-txt.html) files.
- To ask whether the app is for the web or React Native before installing anything.
- The setup for each target.
- The rules the look depends on, and the accessibility the app must keep.

It is the same text as the [Aurea skill](./docs-agent-skills.html). Use the skill when your assistant supports skills; use this file when it does not.

## Keeping it current

The file does not update itself. Download it again after upgrading Aurea.
