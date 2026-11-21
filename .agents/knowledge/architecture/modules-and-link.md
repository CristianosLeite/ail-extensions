---
title: Modules and the link to the main repository
last-verified: 2026-11-21
sources: [conversation 2026-11-21, Makefile, tools/ail.sh, ail.pin]
status: current
---
# Modules and the link to the main repository

**Summary.** The directory `editors/` left the main repository on 2026-11-21 and is a module
of this one, which is for everything that brings the language into another program. A module
is a directory at the top. The checks compare an extension with the language, so they read
the main repository at `ail/`: a clone of the address and revision in `ail.pin`, or a link
made by `make AIL=<path>`.

## Decisions
- **A repository of extensions, `editors` a module of it** (user, 2026-11-21), on the model of
  ail-bench, which took the benchmarks the same day: the main repository keeps the compiler,
  the libraries and their tests.
- **The same link as ail-bench:** a clone from the published address at a pinned revision by
  default, since the user required that a developer who clones only this repository can run
  it, and a link for a checkout that is being worked on. No submodule and no copy.
- **Only the checks need the main repository.** Installing or using an extension does not;
  `make` has no target but `check`.
- **The pin says which language the extensions were checked against:** a statement added
  there after that revision may be uncoloured here until the pin is moved.

## Gotchas
- The revision in `ail.pin` must exist in the published repository.
- An extension installed by a link to `editors/vscode` of the main repository was left
  pointing at nothing by the move; the link must name this repository.
