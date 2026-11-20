---
title: Versioning
description: What can change in a minor release, what only changes in a major one, and how old names leave.
icon: git-branch
sources: none
---

Aurea follows [Semantic Versioning](https://semver.org): `major.minor.patch`. All seven packages, web and native, always share the same version and are released together. Upgrade them together too, all to the same version.

## What each number means

- **Major** — something documented can stop working. The release notes list each change and how to move to the new way.
- **Minor** — something new: a component, a prop, a prop value, a token. What worked keeps working.
- **Patch** — a fix. What worked keeps working.

## Before 1.0

Versions `0.x` can change anything, and every change is written in the [changelog](https://github.com/victor1mor/aurea-uds/blob/main/CHANGELOG.md). From `1.0.0` on, the rules below apply.

## What is documented

The rules protect what is documented: what this site shows, the props table of each component, and the types the packages export.

## What is a breaking change

A breaking change needs a new **major** version. In Aurea, these are breaking:

- removing or renaming a component, a prop, a prop value, a design token, or a documented CSS class or attribute;
- removing or moving an import path, such as `@aurea-uds/native/system`;
- changing a default, which is what happens when you pass nothing;
- making a prop's type stricter, so that a value that used to work stops compiling.

## What is not a breaking change

These can ship in a **minor** or **patch** release:

- something new, as long as what you already wrote keeps working;
- a small visual adjustment, such as a padding, a shadow or a color within the same tone, as long as it does not change the overall size of a component or lower its contrast;
- anything that is not documented: internal class names, private helpers, the inner structure of the markup;
- development warnings.

## How old names leave

1. A minor release marks the old name as deprecated, says what replaces it, and keeps it working.
2. The old name is removed only in the next major release, and the release notes say how to move to the new one.
