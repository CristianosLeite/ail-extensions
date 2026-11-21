---
title: VS Code extension
last-verified: 2026-11-21
sources: [conversation 2026-11-20, conversation 2026-11-21, editors/vscode/]
status: current
---
# VS Code extension

**Summary.** `editors/vscode/` colours `.aiw` files with a TextMate grammar, folds their
blocks and formats them through `build/tools/indent` of the workspace. It is plain
JavaScript with no build step and no dependency.

## Decisions
- **No build step, no dependency** (the user's choice, 2026-11-20): the extension is installed
  by a link to its directory.
- **Formatting is the formatter of the language**, run as `build/tools/indent -` in the
  workspace folder of the file, so the editor and `make test` of the main repository cannot
  disagree. The setting `ail.indentPath` names another place. A workspace without the tool
  built gets a message, not a guess.
- **Folding repeats two rules of `tools/lib/dent.aiw`** (`dtkind`, `dtstrend`) in
  `extension.js`, since folding must work without the tool. The check compares the folds with
  the tool on every source.
- **A tab is shown two columns wide**; sources are indented with one tab a block because that
  costs fewer tokens than spaces ([source style](https://github.com/CristianosLeite/ail/blob/main/.agents/knowledge/architecture/source-style.md)).

## How to apply
- A new block statement: `extension.js`, the grammar, `language-configuration.json`, then
  `make check`.
- The user found the extension working in the editor on 2026-11-21: colours, folding and
  formatting.
