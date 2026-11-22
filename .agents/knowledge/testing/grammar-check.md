---
title: Grammar check
last-verified: 2026-11-21
sources: [conversation 2026-11-21, editors/vscode/check.sh, editors/vscode/test/check.js]
status: current
---
# Grammar check

**Summary.** `make check` colours every `.aiw` source of the main repository with the grammar,
using the runtime and the libraries of an installed VS Code and no window, and compares the
folds with the formatter. On 2026-11-21, against revision b8a090e linked as a checkout, it
reported 1207 sources, 44010 lines, 87 statements, 0 wrong.

## Decisions
- **The editor's own libraries** (`vscode-textmate`, `vscode-oniguruma`, through
  `ELECTRON_RUN_AS_NODE=1`): another implementation of TextMate grammars could colour
  otherwise, and the machine it was written on has no `node`.
- **The statements come from `compiler/tables.aiw`**, not from a list here, and each must be
  met in some source, so a statement the grammar does not know fails the check.
- **Run by hand, not by a test suite of the main repository:** it needs an installed editor.

## What it found
- Its first run, in the main repository, found 579 lines wrong: `sys` before a number, and
  `call`, `tail`, `jmp` without a name were not coloured, the string of a `use` without its
  quote ran over the next lines, and an `else` of no block folded. All were fixed.

## Not checked
- The colours a theme gives the scopes, and anything that needs the window: Format Document
  itself, the settings of `package.json`.
- (Until 2026-11-22: a clone made by `tools/ail.sh` from the published address.) Since then `make check` without a checkout fetches the tag of the version in `Ailfile`; run so on 2026-11-22 for `v0.1.0`, 1232 sources and no wrong line.
