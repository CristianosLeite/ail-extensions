// The AIL extension: formatting through build/tools/indent and folding of
// blocks. Plain JavaScript, loaded as it is; nothing to build.
'use strict';
const cp = require('child_process');
const path = require('path');

const OPENERS = new Set(['fn', 'async', 'while', 'if', 'ifz', 'ifeq', 'ifne', 'iflt',
  'ifle', 'ifgt', 'ifge', 'ifslt', 'ifsle', 'ifsgt', 'ifsge']);

// What a line does to the depth, as dtkind in tools/lib/dent.aw has it: 1 it
// opens a block, 2 it is else, 3 it is end, 0 anything else. The first
// word counts only when a blank, a comment or the end of the line follows.
function kind(line) {
  const m = /^[ \t]*([a-z0-9_]*)(.?)/.exec(line);
  if (m[2] !== '' && !' \t\r#'.includes(m[2])) return 0;
  if (m[1] === 'else') return 2;
  if (m[1] === 'end') return 3;
  return OPENERS.has(m[1]) ? 1 : 0;
}

// Whether a line ends inside a string, as dtstrend in tools/lib/dent.aw.
function strend(line, s) {
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (s) {
      if (c === '\\') i++;
      if (c === '"') s = false;
    } else {
      if (c === '#') return false;
      if (c === '"') s = true;
    }
  }
  return s;
}

// The blocks of the lines as pairs [first, last] of line numbers from 0:
// an opener to the line before its end, and to the line before its else,
// which starts a range of its own. A line inside a string is no statement.
function folds(lines) {
  const out = [];
  const open = [];
  let instr = false;
  for (let i = 0; i < lines.length; i++) {
    if (instr) {
      instr = strend(lines[i], true);
      continue;
    }
    const k = kind(lines[i]);
    const closes = (k === 2 || k === 3) && open.length > 0;
    if (closes) {
      const from = open.pop();
      if (i - 1 > from) out.push([from, i - 1]);
    }
    // an else of no block opens none, as the formatter has it
    if (k === 1 || (k === 2 && closes)) open.push(i);
    // the path of a use has no escapes and ends on its line
    instr = !/^[ \t]*use[ \t]/.test(lines[i]) && strend(lines[i], false);
  }
  return out;
}

// Run the formatter as a filter: the indented text, or an error.
function indent(tool, cwd, text) {
  return new Promise((resolve, reject) => {
    const child = cp.execFile(tool, ['-'], { cwd, encoding: 'utf8', maxBuffer: 1 << 28 },
      (err, stdout, stderr) => {
        if (err) reject(new Error(err.code === 'ENOENT'
          ? `${tool} not found: run make tools in the AIL repository or set ail.indentPath`
          : (stderr.trim() || err.message)));
        else resolve(stdout);
      });
    child.stdin.on('error', () => {});
    child.stdin.end(text);
  });
}

function activate(context) {
  const vscode = require('vscode');
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('ail', {
      async provideDocumentFormattingEdits(document) {
        const folder = vscode.workspace.getWorkspaceFolder(document.uri);
        const cwd = folder ? folder.uri.fsPath
          : document.uri.scheme === 'file' ? path.dirname(document.uri.fsPath) : process.cwd();
        const set = vscode.workspace.getConfiguration('ail', document.uri).get('indentPath')
          || 'build/tools/indent';
        const text = document.getText();
        let done;
        try {
          done = await indent(path.resolve(cwd, set), cwd, text);
        } catch (e) {
          vscode.window.showErrorMessage(`AIL: ${e.message}`);
          return [];
        }
        if (done === text) return [];
        const all = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
        return [vscode.TextEdit.replace(all, done)];
      }
    }),
    vscode.languages.registerFoldingRangeProvider('ail', {
      provideFoldingRanges(document) {
        const lines = [];
        for (let i = 0; i < document.lineCount; i++) lines.push(document.lineAt(i).text);
        return folds(lines).map(([a, b]) => new vscode.FoldingRange(a, b));
      }
    }));
}

function deactivate() {}

module.exports = { activate, deactivate, kind, strend, folds, indent };
