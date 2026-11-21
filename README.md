# ail-extensions

Extensions for [AIL](https://github.com/CristianosLeite/ail), a programming language designed to cost few tokens when an AI writes it. Each kind of extension is a module, a directory at the top of this repository; the first is `editors/`.

## Modules

- `editors/`: support for AIL sources (`.aiw`) in editors, one directory an editor
  - [`editors/vscode/`](editors/vscode/README.md): VS Code: syntax highlighting, folding of the blocks, and Format Document through the formatter of the language. Plain JavaScript, nothing to build; its README says how to install it

## Checks

```
make check              # check the grammar and the folding of the VS Code extension on every AIL source
make AIL=../ail check   # the same against a checkout of your own
```

The checks compare an extension with the language itself, so they need the main repository: its sources, the statements of its compiler and its formatter. `make` puts it at `ail/`, which git ignores: a clone of the address in `ail.pin` at the revision pinned there, or, with `make AIL=<path>`, a link to a checkout, which stays until it is removed. A clone at another revision is moved to the pinned one by the next `make`.

`make check` needs x86-64 Linux, `git`, what the main repository needs to build its compiler (`curl` or `gh` once, for the seed) and an installed VS Code, whose own runtime and libraries colour the sources; `CODE=<program>` names it where it is not found. Using an extension needs none of that.

## Layout

- `editors/vscode/`: the extension (`package.json`, `extension.js`, the grammar in `syntaxes/`, `language-configuration.json`), `check.sh` and `test/check.js`
- `tools/ail.sh`, `ail.pin`: the main repository at `ail/`
- `AGENTS.md`, `.agents/knowledge/`: guidance and notes for AI coding agents

## License

[MIT](LICENSE).
