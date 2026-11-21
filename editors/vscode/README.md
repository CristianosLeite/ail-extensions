# AIL for VS Code

Support for AIL sources (`.aiw`): syntax highlighting, folding of the
blocks (`fn`, `while`, `if` in every form, `else`) and Format Document,
which runs `build/tools/indent` of the AIL repository and so gives the
indentation that its `docs/language.md` describes under "Source style". A tab is shown two
columns wide.

The extension is plain JavaScript and has nothing to build or install
besides itself. From the top of this repository:

```
ln -s "$PWD/editors/vscode" ~/.vscode/extensions/ail.ail-0.2.0
```

and, for Format Document, in the AIL repository you work in:

```
make tools                                            # builds build/tools/indent
```

Restart VS Code after that. To try it without installing:

```
code --extensionDevelopmentPath="$PWD/editors/vscode" .
```

Format Document looks for the formatter at `build/tools/indent` in the
workspace folder of the file; the setting `ail.indentPath` names another
place. Folding and highlighting need no tool.

The rules of a line (which word opens a block, when a line is inside a
string) are those of `tools/lib/dent.aiw` of the AIL repository, written
again in `extension.js`
for the folding; a new block statement of the language is added in both,
in the grammar and in `language-configuration.json`.

`make check` at the top of this repository (`editors/vscode/check.sh`)
checks the grammar and the folding on every source of the AIL
repository, which it fetches, without the window of the editor, with the
libraries an installed VS Code colours with (`test/check.js`): the first
word of a line that is a statement of `compiler/tables.aiw` must be
coloured as one, a name that is assigned as a variable, a comment and a
string as what they are, and the folds must be the blocks that
`build/tools/indent` indents. Run it after a change to the grammar, to
`extension.js` or to the statements of the language.
