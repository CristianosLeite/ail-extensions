# ail-extensions

Extensions for [AIL](https://github.com/CristianosLeite/ail), a programming language designed to cost few tokens when an AI writes it. Each kind of extension is a module, a directory at the top of this repository; the first is `editors/`.

## Modules

- `editors/`: support for AIL sources (`.aiw`) in editors, one directory an editor
  - [`editors/vscode/`](editors/vscode/README.md): VS Code: syntax highlighting, folding of the blocks, and Format Document through the formatter of the language. Plain JavaScript, nothing to build; its README says how to install it

- [`mcp/`](mcp/README.md): a Model Context Protocol server in AIL, tools over the stdio transport, for a program that is to be asked by a coding agent; a program reads it as `ail-extensions:mcp/src/mcp.aiw`

- [`pdf/`](pdf/README.md): the text of the pages of a PDF file, for a program that is to search or to index documents: cross references as tables and streams, object streams, `FlateDecode`, fonts with their encodings and `ToUnicode`, and a limit on the work and the memory a file may cost; a program reads it as `ail-extensions:pdf/src/pdf.aiw`. It has a decoder of DEFLATE and zlib, `pdf/src/inflate.aiw`, that is of use by itself

## Checks

```
make test                          # the tests of the modules written in AIL, and their indentation
make check                         # the grammar and the folding of the VS Code extension on every AIL source
make AIL=../ail/build/ail check    # both with the command, and the sources, of a checkout of your own
```

The repository is a package of AIL: `Ailfile` has its name, its version and the version of AIL it needs, and the command `ail` of AIL runs its tests (`ail test`, `ail fmt --check`). A program that uses a module written in AIL names the package as a dependency and reads a file of it, as `use "ail-extensions:mcp/src/mcp.aiw"`.

The check of the editors compares an extension with the language itself, so it reads the sources of AIL: every `.aiw` file there, the statements of its compiler and its formatter. They are those of the checkout whose command `AIL` names, or of the directory `AILSRC`; without either, `make check` fetches the version of AIL that `Ailfile` asks for, the tag `v<version>` of the published repository, once into `build/`. It needs x86-64 Linux, `git`, what AIL needs to build its compiler (`curl` or `gh` once, for the seed) and an installed VS Code, whose own runtime and libraries colour the sources; `CODE=<program>` names it where it is not found. Using an extension needs none of that.

## Layout

- `editors/vscode/`: the extension (`package.json`, `extension.js`, the grammar in `syntaxes/`, `language-configuration.json`), `check.sh` and `test/check.js`
- `mcp/`: the MCP server SDK, `src/mcp.aiw`, with its tests in `tests/` (`mcp_serve.aiw`, a session it is to print, and `mcp_no_memory.aiw`); they need an AIL that has `lib/std/json.aiw`
- `pdf/`: the reader of PDF, six sources in `src/`, with its tests in `tests/` (`pdf_*.aiw`) and the files they read in `tests/data/`
- `Ailfile`: the manifest of the package; `tests/`: the tests that `ail test` runs
- `tools/check.sh`: the sources of AIL for `make check`
- `AGENTS.md`, `.agents/knowledge/`: guidance and notes for AI coding agents

## License

[MIT](LICENSE).
