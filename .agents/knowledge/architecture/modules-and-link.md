---
title: Modules and the link to the main repository
last-verified: 2026-11-22
sources: [conversation 2026-11-21, conversation 2026-11-22 (in the aildb repository), Makefile, Ailfile, tools/check.sh]
status: current
---
# Modules and the link to the main repository

**Summary.** The directory `editors/` left the main repository on 2026-11-21 and is a module
of this one, which is for everything that brings the language into another program. A module
is a directory at the top. Since 2026-11-22 the repository is a package of AIL, with an
`Ailfile` in the place of `ail.pin`. The checks of the editors compare an extension with the
language, so they read the sources of AIL: a checkout that is named, or the version of the
line `ail` of `Ailfile`, fetched once.

## Decisions
- **A repository of extensions, `editors` a module of it** (user, 2026-11-21), on the model of
  ail-bench, which took the benchmarks the same day: the main repository keeps the compiler,
  the libraries and their tests.
- **The same link as ail-bench** (until 2026-11-22, see below)**:** a clone from the published address at a pinned revision by
  default, since the user required that a developer who clones only this repository can run
  it, and a link for a checkout that is being worked on. No submodule and no copy.
- **Only the checks need the main repository.** Installing or using an extension does not;
  `make` has no target but `check`.
- **The pin said which language the extensions were checked against** (until 2026-11-22)**:** a statement added
  there after that revision may be uncoloured here until the pin is moved.
- **A package of AIL, `Ailfile` in the place of `ail.pin`** (user, 2026-11-22: "ail-extensions
  still carries the ail.pin and has no Ailfile"; it was an item of the TODO of AIL since the
  packages). The manifest has the name `ail-extensions`, the version 0.1.0, a proposal, and
  the version of AIL; `ail test` runs `tests/`, which has the tests of the modules written in
  AIL. `ail.pin`, `tools/ail.sh` and `ail/` are gone. The package is the whole repository and
  not a module of it (agent): a dependency by address is a repository with the package at its
  top, so only so can a program name the MCP SDK, `ail-extensions:mcp/src/mcp.aiw`, by an
  address and a version. The first form of the SDK, a package in `mcp/` with its own manifest,
  had no address for that reason.
- **Who has only this repository can still run the check** (the requirement of 2026-11-21,
  kept; agent for the how): without a checkout named by `AIL` or `AILSRC`, `tools/check.sh`
  fetches the tag `v<version>` of the line `ail` of `Ailfile` into `build/`. The version of
  the manifest says which language the extensions were last checked against, as the pin did,
  by a release and not by a revision.
- **What the pin had hidden** (2026-11-22): it named a revision before `f4to8`, `f8to4` and
  `fdot4`, so the check never met them; against the tag `v0.1.0` it found them uncoloured,
  and the grammar got them in a commit of its own.
- **0.1.1, with AIL** (user, 2026-11-22: "migrate all to the version 0.1.1", the line `ail`
  and the version of each package): the manifest is `version 0.1.1` and `ail 0.1.1`, and
  the tag `v0.1.1` is what a program now names. The tag `v0.1.0` stays, with `ail 0.1.0`.

## Gotchas
- The version of the line `ail` must be a tag `v<version>` of the published repository, or
  the fetch of `make check` fails; a checkout can always be named.
- An extension installed by a link to `editors/vscode` of the main repository was left
  pointing at nothing by the move; the link must name this repository.
