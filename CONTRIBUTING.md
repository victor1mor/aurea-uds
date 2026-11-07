# Contributing to Aurea

Aurea is maintained by Victor, who makes the final call. Contributions are welcome, with one caveat:
**the visual identity is not up for discussion** (the "The look" section of the [README](README.md) says
what it is). Requests to change the yellow, the radii, the type or the densities will be closed.

Please write issues and pull requests in **English**.

## Before you start

- **Bug or idea:** open an issue before writing code. Say what you tried, what you expected and what
  happened, and whether it is on the **web** or **native** — the two libraries are different.
- **New component:** read [`docs/BUILDING.md`](docs/BUILDING.md) first. No component starts without it.
- **Decisions already made** live in [`decisions/`](decisions/README.md) and are not reopened without new
  evidence.

## Set up your machine

- Node 24, pnpm 12 and Python 3. A different `pnpm` switches itself to the project's version (the
  `packageManager` field of `package.json`).

```bash
pnpm install
pnpm build
```

## Check before opening a pull request

Run them one per line:

```bash
python scripts/validate.py
pnpm build
npx vitest run
node scripts/check-pack.mjs
```

Among other things, `validate.py` checks that none of the maintainer's private names entered the code.
That list **is not public**: without it the validator fails and tells you so. To run without the list on
your machine, set `AUREA_SEM_LISTA=1`. On a pull request from a fork, CI also runs without the list; the
check with it stays with the maintainer.

## Rules a pull request must follow

- **Every geometry number comes from a token.** A raw pixel value in the CSS fails CI.
- **A fix comes with a test that fails on the old defect**, in the same commit. A test that passes with
  the defect inside proves nothing.
- **Changed a component's API? Change its record** in `packages/contracts/registry/`. The validator checks
  one against the other.
- **Changed the look? Show before and after**, in both themes.
- **No third-party trademarks** (company logos) inside the library.
- Code copied from another project only comes in if the licence allows it (Apache-2.0 accepts MIT, BSD and
  Apache; it does **not** accept AGPL or non-commercial licences), credited in
  [`docs/REFERENCES.md`](docs/REFERENCES.md).

## Licence

By contributing, you agree that your contribution is released under [Apache 2.0](LICENSE).
