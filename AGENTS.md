# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## What this is

The extensions of AIL, a proof-of-concept programming language whose design goal is low token consumption when an AI writes it (https://github.com/CristianosLeite/ail, the main repository, whose `AGENTS.md` and `docs/language.md` describe the language). An extension is whatever makes the language usable in another program without being part of the compiler or its libraries. Each kind is a module, a directory at the top: `editors/` is the first, with one directory an editor. A new kind of extension is a new directory beside it, with its check as a target of the Makefile and a line in the README.

## Rules

- All repository text is in English: documentation, code comments, commit messages and the knowledge base. This holds even when the conversation is in another language.
- A commit message is `type: subject` (`feat`, `fix`, `test` or `docs`, no scope, lower case, no full stop) and a prose body wrapped at about 70 columns: the problem, what changed and why, how it was verified.
- Commit messages and pull request descriptions carry no trailers or attribution lines: no `Co-Authored-By`, no `Signed-off-by`, no "Generated with" footer. This holds even when the tool in use suggests one.
- An extension repeats rules of the language; it never defines one. Where it repeats one, the check compares it with the main repository.
- Nothing of the main repository is copied here. What a check needs from it is read from a checkout of it, which `make check` is given or fetches.

## The main repository

The repository is a package of AIL since 2026-11-22 (user: "ail-extensions still carries the ail.pin and has no Ailfile"), as aildb is: `Ailfile` has the name `ail-extensions`, its version and the version of AIL it needs, and the command `ail` runs the tests in `tests/` and the formatter. `ail.pin`, `tools/ail.sh` and the link or clone `ail/` are gone. The check of an editor still reads the sources of AIL, which an installed AIL has not: `tools/check.sh`, which `make check` runs, takes them from the checkout whose command `AIL` names (`make AIL=../ail/build/ail check`) or from `AILSRC`, and otherwise fetches the tag `v<version>` of the line `ail` of `Ailfile` once into `build/`, so that who has only this repository can run the check. When the language gets a statement or the formatter a rule, run `make AIL=<checkout>/build/ail check` and fix what it reports. A release is the tag `v<version>`, which is the user's to give or to ask for; a package names this one by its address and that version. The version 0.1.0 is released: the user asked on 2026-11-22 for the tag `v0.1.0`, on the merge of the pull request 3 into `main`. The version 0.1.1 followed the same day (user): every package of the family has the version of AIL it is made for, and this one asks for `ail 0.1.1`; its tag `v0.1.1` is on the merge of the pull request 4.

## Commands

```
make AIL=../ail/build/ail test    # the tests of mcp/ and the indentation, with the command of a checkout
make AIL=../ail/build/ail check   # the editors, against the sources of that checkout
make check                        # the editors, against the version of AIL that Ailfile asks for, fetched once
CODE=/path/to/code SHOW=50 make check   # another program of the editor, more wrong lines printed
code --extensionDevelopmentPath="$PWD/editors/vscode" <an AIL checkout>   # try the extension without installing it
```

A pull request to `main` runs both on GitHub (`.github/workflows/test.yml`), and nothing else starts it: `make test` with the command of the release of AIL that the line `ail` of `Ailfile` asks for, its archive checked against its `.sha256`, and `make check` with the newest stable VS Code, fetched as an archive and named by `CODE`.

## editors/vscode

The VS Code extension for `.aiw` files, plain JavaScript with no build step and no dependency: a grammar (`syntaxes/ail.tmLanguage.json`), folding by the rules of `dtkind` and `dtstrend` of `tools/lib/dent.aiw` of the main repository, written again in `extension.js` (a depth counted from the first word of each line: a word that opens a block, `else` or `end`, only when a blank, a comment or the end of the line follows, so `if=1` is an assignment; the lines inside a string that spans lines are left alone), and Format Document, which pipes the text through `build/tools/indent -` of the workspace folder of the file (the setting `ail.indentPath` names another place). A new block statement of the language is added to `extension.js`, the grammar and `language-configuration.json`, after `tools/lib/dent.aiw` there.

`editors/vscode/check.sh`, which `make check` runs, colours every `.aiw` source that git has in the checkout of AIL (`AILSRC`) with the grammar through the libraries of an installed VS Code (`test/check.js`, run by the editor's own runtime with `ELECTRON_RUN_AS_NODE=1`, since there need be no `node`) and requires each statement of `ail/compiler/tables.aiw` to be coloured as one and to be met in some source, a name that is assigned to be a variable, comments and strings to be what they are, and the folds to be the blocks that `ail/build/tools/indent` indents. It prints the number of sources, lines and statements and of wrong lines, the first 20 of them, and fails if there is one. Run it after a change to the grammar, to `extension.js` or to the statements of the language.

## mcp

A server of the Model Context Protocol in AIL (user, 2026-11-22: the MCP SDK is a module of this repository, written in AIL with the Rust SDK, rmcp, as the reference; it was made for the MCP server of aildb). It is one source of the package, `mcp/src/mcp.aiw` (prefix `mcp`), which a program reads as `ail-extensions:mcp/src/mcp.aiw`: the revision 2025-11-25 over the stdio transport, the server side and tools only. `mcpserve`, an async function, reads lines from a descriptor and writes a response a line; `mcpline` answers `initialize` (the revision the client asked for if it is one of four, else the newest), `ping`, `tools/list` and `tools/call`, and `mcpcall` awaits the handler of a tool, an async function of the program that is called with the arguments as JSON and a result of 56 bytes (`mcptext`, `mcpfail`, a buffer for a structured result). Its head says every field. It needs `lib/std/json.aiw`, `lib/std/num.aiw` and the async library of AIL, which its version 0.1.1 is the first to have; the line `ail` of `Ailfile` asks for it (user, 2026-11-22). `tests/mcp_serve.aiw` is a session through two pipes in one process, and `mcp_serve.out` what it is to print; every response in it was parsed as JSON by Python when it was made. `tests/mcp_no_memory.aiw` limits the memory of the process and calls a tool whose result the response has no room for, and has a server that gets its first request with no memory left: nothing is written in part and `mcpserve` ends with -12.

## Knowledge base

`.agents/knowledge/INDEX.md` lists the pages: how the repository is laid out and linked to the main one, the decisions of the VS Code extension, and what its check does and does not cover.
