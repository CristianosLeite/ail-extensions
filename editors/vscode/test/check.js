// editors/vscode/test/check.js -- check the grammar and the folding of
// the extension on every source of the main repository, without the editor's
// window. Run by editors/vscode/check.sh with the runtime of VS Code
// (ELECTRON_RUN_AS_NODE), which brings the libraries the editor colours
// with: vscode-textmate and vscode-oniguruma. Arguments: the directory of
// the resources of VS Code, then the sources.
//
// For each line that is no part of a string that began on a line before,
// read here without the grammar:
//   - a first word that is a statement of compiler/tables.aiw, with a
//     blank, a comment or the end of the line behind it, must get a scope
//     of a keyword or a storage word, and every statement of the table
//     must be met in some source;
//   - a first word with = or an operator and = behind it must be a
//     variable, also when it is spelled like a statement;
//   - the bytes from a # outside a string to the end of the line must be
//     a comment, and the bytes of a string a string.
// And the blocks that folds() of extension.js gives must be those of the
// depths that build/tools/indent gives the lines.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const res = process.argv[2];
const files = process.argv.slice(3);
// the main repository, where check.sh runs this from
const root = path.join(__dirname, '..', '..', '..', 'ail');
const ext = require(path.join(__dirname, '..', 'extension.js'));

function lib(name) {
  for (const d of ['node_modules.asar', 'node_modules']) {
    try { return require(path.join(res, d, name)); } catch (e) { /* next */ }
  }
  throw new Error('no ' + name + ' under ' + res);
}
function wasm() {
  for (const d of ['node_modules.asar.unpacked', 'node_modules']) {
    const p = path.join(res, d, 'vscode-oniguruma', 'release', 'onig.wasm');
    if (fs.existsSync(p)) return fs.readFileSync(p).buffer;
  }
  throw new Error('no onig.wasm under ' + res);
}

// the statements of the compiler: the names of optab, the first table
function statements() {
  const out = new Set();
  let on = false;
  for (const line of fs.readFileSync(path.join(root, 'compiler', 'tables.aiw'), 'utf8').split('\n')) {
    if (line.startsWith('data optab ')) on = true;
    else if (!line.startsWith('data ') || /^data [a-z]/.test(line)) on = false;
    if (!on) continue;
    const m = /^data (?:optab )?[0-9]+ "([a-z0-9]+)"/.exec(line);
    if (m) out.add(m[1]);
  }
  return out;
}

// the columns of a line that are a comment and those that are a string,
// s saying whether the line starts inside a string: [mask, s at the end].
// The path of a use has no escapes: a backslash before its closing quote
// is a byte of the path, and no string goes on behind the line
function classes(line, s) {
  const mask = new Array(line.length).fill('');
  const use = !s && /^[ \t]*use[ \t]/.test(line);
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (s) {
      mask[i] = 's';
      if (c === '\\' && !use && i + 1 < line.length) mask[++i] = 's';
      else if (c === '"') s = false;
    } else if (c === '#') {
      for (; i < line.length; i++) mask[i] = 'c';
    } else if (c === '"') {
      mask[i] = 's';
      s = true;
    }
  }
  return [mask, use ? false : s];
}

// the blocks of a text by the depths the formatter gives its lines: a
// line and the deeper lines behind it, up to the line before the one
// that comes back to its depth
function blocks(text) {
  const tool = path.join(root, 'build', 'tools', 'indent');
  const lines = execFileSync(tool, ['-'], { input: text, maxBuffer: 1 << 28 }).toString('latin1').split('\n');
  const out = [];
  const open = [];
  let instr = false;
  for (let i = 0; i < lines.length; i++) {
    if (instr) { instr = ext.strend(lines[i], true); continue; }
    const k = ext.kind(lines[i]);
    const isuse = /^[ \t]*use[ \t]/.test(lines[i]);
    instr = !isuse && ext.strend(lines[i], false);
    if (/^[ \t]*\r?$/.test(lines[i])) continue;
    const d = /^\t*/.exec(lines[i])[0].length;
    while (open.length && open[open.length - 1][1] >= d) {
      const [from] = open.pop();
      if (i - 1 > from) out.push([from, i - 1]);
    }
    if (k === 1 || k === 2) open.push([i, d]);
  }
  return out;
}

async function main() {
  const tm = lib('vscode-textmate');
  const onig = lib('vscode-oniguruma');
  await onig.loadWASM(wasm());
  const gpath = path.join(__dirname, '..', 'syntaxes', 'ail.tmLanguage.json');
  const registry = new tm.Registry({
    onigLib: Promise.resolve({
      createOnigScanner: (s) => new onig.OnigScanner(s),
      createOnigString: (s) => new onig.OnigString(s),
    }),
    loadGrammar: async () => tm.parseRawGrammar(fs.readFileSync(gpath, 'utf8'), gpath),
  });
  const grammar = await registry.loadGrammar('source.ail');
  const stmts = statements();
  const met = new Set();
  let bad = 0;
  let nlines = 0;
  const say = (f, i, msg) => {
    if (++bad <= (+process.env.SHOW || 20)) console.log(`${f}:${i + 1}: ${msg}`);
  };
  // lines that no source of the repository has, checked like one: a use
  // whose path ends with a backslash, with a comment behind it, and the
  // statement after it
  const own = 'use "a\\" # the path is a and a backslash\nif x\n\tsys 60 "b\\"" # a comment\nend\n';
  for (const f of ['(lines of check.js)', ...files]) {
    // bytes as characters, so that a column is a byte
    const text = f.startsWith('(') ? own : fs.readFileSync(f).toString('latin1');
    const lines = text.split('\n');
    let stack = tm.INITIAL;
    let instr = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const r = grammar.tokenizeLine(line, stack);
      stack = r.ruleStack;
      nlines++;
      const scope = new Array(line.length).fill('');
      for (const t of r.tokens) {
        for (let c = t.startIndex; c < t.endIndex && c < line.length; c++) scope[c] = t.scopes.join(' ');
      }
      const began = instr;
      const [mask, s] = classes(line, instr);
      instr = s;
      for (let c = 0; c < line.length; c++) {
        if (mask[c] === 'c' && !scope[c].includes('comment.')) { say(f, i, `column ${c + 1} of a comment is ${scope[c] || 'nothing'}`); break; }
        if (mask[c] === 's' && !scope[c].includes('string.')) { say(f, i, `column ${c + 1} of a string is ${scope[c] || 'nothing'}`); break; }
        if (mask[c] === '' && /comment\.|string\./.test(scope[c])) { say(f, i, `column ${c + 1} is ${scope[c]} and is code`); break; }
      }
      if (began) continue;
      const m = /^[ \t]*([a-z][a-z0-9_]*)(.?)(.?)(.?)/.exec(line);
      if (!m) continue;
      const at = line.indexOf(m[1]);
      const rest = m[2] + m[3] + m[4];
      if (/^(=(?!=)|(<<|>>|[*\/%+\-&^|])=)/.test(rest)) {
        if (!scope[at].includes('variable.')) say(f, i, `${m[1]} is assigned and is ${scope[at] || 'nothing'}`);
      } else if (stmts.has(m[1]) && (m[2] === '' || ' \t\r#'.includes(m[2]))) {
        met.add(m[1]);
        if (!/keyword\.|storage\./.test(scope[at])) say(f, i, `the statement ${m[1]} is ${scope[at] || 'nothing'}`);
      }
    }
    const want = JSON.stringify(blocks(text));
    const got = JSON.stringify(ext.folds(lines));
    if (want !== got) say(f, 0, 'the folds are not the blocks of the formatter');
  }
  for (const s of stmts) {
    if (!met.has(s)) { console.log(`the statement ${s} is in no source`); bad++; }
  }
  console.log(`${files.length} sources, ${nlines} lines, ${stmts.size} statements, ${bad} wrong`);
  process.exit(bad ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
