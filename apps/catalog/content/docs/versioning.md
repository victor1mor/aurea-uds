---
title: Versioning
description: What Aurea promises from 1.0 on, what counts as public, how long an old name keeps working, and how a breaking change is announced.
icon: git-branch
sources: none
---

Aurea follows [Semantic Versioning](https://semver.org): `major.minor.patch`. All seven packages, web and native, always share the same version and are released together. Upgrade them together too, all to the same version.

## What each number means

- **Major**: something public can stop working. The release notes list each change, and the [Migration](./docs-migration.html) page says how to move to the new way.
- **Minor**: something new, such as a component, a prop, a prop value, a token or a phrase. A name can also be deprecated. What worked keeps working.
- **Patch**: a fix. What worked keeps working.

## Before 1.0

Versions `0.x` can change anything, and every change is written in the [release notes](./releases.html). From `1.0.0` on, the rules below apply.

## What is public

The rules protect the public API, which is what you can see and use from outside the packages:

- the components and hooks the packages export, with their props, prop values and exported types, on the web and in React Native;
- the import paths each package lists in its `exports`, such as `@aurea-uds/react/data-grid`, `@aurea-uds/native/system` and `@aurea-uds/tokens/css`;
- the design tokens: the CSS variables on the Tokens page, their names in the JSON file, and the token names in React Native;
- the CSS classes and `data-*` attributes this site documents for plain HTML, such as `data-theme`, `data-brand` and `data-density`;
- the brand names and the values of each theme, density and reading mode;
- the keys of `AureaStrings`, the phrases components say on their own;
- the keyboard behavior and the accessible names that a component page documents;
- the field names of the contract in `@aurea-uds/contracts`.

The badge at the top of each component page says how far the rules go. **Stable**, **Ready** and **Universal** are covered. **Deprecated** marks an old name that has a newer one. A component marked **Draft** is not covered yet and can change in a minor release.

## What is not public

These can change in any release:

- anything this site does not document, such as internal class names, private helpers and the inner structure of the markup;
- the exact text of development warnings;
- the order of the rules inside the CSS files;
- the content of the contract, which grows when the library grows. Its field names stay.

## What is a breaking change

A breaking change needs a new **major** version. In Aurea, these are breaking:

- removing or renaming something public;
- removing or moving an import path;
- changing a default, which is what happens when you pass nothing;
- making a prop's type stricter, so that a value that used to work stops compiling;
- removing a documented keyboard behavior or accessible name;
- raising the oldest supported version of React, React Native or another peer dependency;
- changing the overall size of a component, or lowering its contrast.

## What is not a breaking change

These can ship in a **minor** or **patch** release:

- something new, as long as what you already wrote keeps working;
- a new key in `AureaStrings`, which comes with an English default. The release notes flag it under "May break compilation" if you build the whole object yourself;
- a small visual adjustment, such as a padding, a shadow or a color within the same tone, as long as the component keeps its overall size and its contrast;
- a new look that a component can take, when it comes as a new variant you choose and the default stays the same;
- deprecating a name, which keeps it working;
- development warnings.

## How old names leave

1. A minor release marks the old name as deprecated and says what replaces it. The old name keeps working.
2. The deprecation is written in three places: the "Deprecated" section of the release notes, a deprecation mark in the types (most editors then strike the name through), and the Migration page.
3. The name is removed only in a major release, and at least six months after the minor release that deprecated it. If the next major comes sooner, the name waits for the one after.
4. Each major release that removes names has its own section on the Migration page, with what replaces each name and how to move while you are still on the previous version.

Some deprecated names are never removed. `Topbar`, the old name of `Header`, keeps the deprecation mark so that new code picks the current name, and the Migration page lists it under "Old names that stay".

## Fixes for older versions

Fixes, security fixes included, ship in the newest version only. To get one, upgrade to the newest minor of the newest major. A deprecated name keeps working for at least six months, so you have time to plan the move to a new major.
