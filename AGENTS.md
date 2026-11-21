# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## What this is

The extensions of AIL, a proof-of-concept programming language whose design goal is low token consumption when an AI writes it (https://github.com/CristianosLeite/ail, the main repository, whose `AGENTS.md` and `docs/language.md` describe the language). An extension is whatever makes the language usable in another program without being part of the compiler or its libraries. Each kind is a module, a directory at the top: `editors/` is the first, with one directory an editor. A new kind of extension is a new directory beside it, with its check as a target of the Makefile and a line in the README.

## Rules

- All repository text is in English: documentation, code comments, commit messages and the knowledge base. This holds even when the conversation is in another language.
- A commit message is `type: subject` (`feat`, `fix`, `test` or `docs`, no scope, lower case, no full stop) and a prose body wrapped at about 70 columns: the problem, what changed and why, how it was verified.
- Commit messages and pull request descriptions carry no trailers or attribution lines: no `Co-Authored-By`, no `Signed-off-by`, no "Generated with" footer. This holds even when the tool in use suggests one.
- An extension repeats rules of the language; it never defines one. Where it repeats one, the check compares it with the main repository.
- Nothing of the main repository is copied here. What a check needs from it is read through `ail/`.

## The main repository

`tools/ail.sh`, which the Makefile runs whenever make reads it, makes sure the main repository is at `ail/` (ignored by git): with `make AIL=<path>` a link to that checkout, which stays until it is removed; otherwise a clone of the address in `ail.pin` at the revision pinned there, moved to that revision when it is at another one, unless it has changes of its own. When the language gets a statement or the formatter a rule, run `make AIL=<checkout> check`, fix what it reports and put the new revision in `ail.pin`; the revision must be one that the published repository has, or a clone fails.

## Commands

```
make check              # fetch or link the main repository, build its formatter, run every check
make AIL=../ail check   # against a checkout of your own
CODE=/path/to/code SHOW=50 make check   # another program of the editor, more wrong lines printed
code --extensionDevelopmentPath="$PWD/editors/vscode" <an AIL checkout>   # try the extension without installing it
```

## editors/vscode

The VS Code extension for `.aw` files, plain JavaScript with no build step and no dependency: a grammar (`syntaxes/ail.tmLanguage.json`), folding by the rules of `dtkind` and `dtstrend` of `tools/lib/dent.aw` of the main repository, written again in `extension.js` (a depth counted from the first word of each line: a word that opens a block, `else` or `end`, only when a blank, a comment or the end of the line follows, so `if=1` is an assignment; the lines inside a string that spans lines are left alone), and Format Document, which pipes the text through `build/tools/indent -` of the workspace folder of the file (the setting `ail.indentPath` names another place). A new block statement of the language is added to `extension.js`, the grammar and `language-configuration.json`, after `tools/lib/dent.aw` there.

`editors/vscode/check.sh`, which `make check` runs, colours every `.aw` source that git has in `ail/` with the grammar through the libraries of an installed VS Code (`test/check.js`, run by the editor's own runtime with `ELECTRON_RUN_AS_NODE=1`, since there need be no `node`) and requires each statement of `ail/compiler/tables.aw` to be coloured as one and to be met in some source, a name that is assigned to be a variable, comments and strings to be what they are, and the folds to be the blocks that `ail/build/tools/indent` indents. It prints the number of sources, lines and statements and of wrong lines, the first 20 of them, and fails if there is one. Run it after a change to the grammar, to `extension.js` or to the statements of the language.

## Knowledge base

`.agents/knowledge/INDEX.md` lists the pages: how the repository is laid out and linked to the main one, the decisions of the VS Code extension, and what its check does and does not cover.
