---
title: Agent Skills
description: Give your AI coding assistant the rules for building interfaces with Aurea.
icon: brain
---

The Aurea skill gives an AI coding assistant what it needs to build with Aurea: how to install it on the web and on React Native, the rules the look depends on, and where to read each component.

It follows the [Agent Skills](https://agentskills.io/specification) format: one `SKILL.md` file that the assistant loads when the task calls for it.

## Installation

```bash
npx skills add victor1mor/aurea-uds
```

The installer finds the assistants you use (Claude Code, Cursor, OpenCode and others) and puts the skill where each one reads skills from. It comes from the open `skills` package.

### Install scope

By default the skill goes into the project, next to your code, so the whole team gets it. Add `-g` to install it for your user instead, in every project:

```bash
npx skills add victor1mor/aurea-uds -g
```

## Usage

The assistant finds the skill on its own when the work involves Aurea: a project that depends on `@aurea-uds/react`, `@aurea-uds/core` or `@aurea-uds/native`, or a request for Aurea components, tokens or themes.

Ask it, for example, to:

- build a settings page with Aurea components;
- add a dark mode switch;
- move a screen from raw CSS values to Aurea tokens.

## What's included

- Installation and setup, for the web and for React Native.
- The rules the look depends on: tokens only, no lines, no gradients, the yellow that does not change, Phosphor icon names.
- The accessibility the app must keep.
- Where to read each component: the [LLMs.txt](./docs-llms-txt.html) files.

## Structure

```bash
skills/aurea-uds/
└── SKILL.md
```

The file is in the [repository](https://github.com/victor1mor/aurea-uds/tree/main/skills/aurea-uds), under the Apache 2.0 license.
