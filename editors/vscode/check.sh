#!/bin/sh
# Check the grammar and the folding of the extension on every source of
# the main repository of AIL, a checkout of which is the directory of
# the environment variable AILSRC (make check names it and builds its
# formatter), with the libraries of an installed VS Code,
# without its window (test/check.js says what is checked). CODE names the
# program of the editor if it is not in one of the usual places, and SHOW
# how many wrong lines to print, 20 if it is not set.
set -u
cd "$(dirname "$0")/../.." || exit 1
code=${CODE:-}
if [ -z "$code" ]; then
    for d in /usr/share/code /usr/lib/code /opt/visual-studio-code /usr/share/codium; do
        for n in code codium; do
            [ -x "$d/$n" ] && [ -d "$d/resources/app" ] && code=$d/$n && break 2
        done
    done
fi
[ -n "$code" ] || { echo "check.sh: no VS Code found; set CODE to its program" >&2; exit 1; }
top=$PWD
src=${AILSRC:-}
[ -n "$src" ] && [ -x "$src/build/tools/indent" ] || { echo "check.sh: no build/tools/indent in the checkout of AIL that AILSRC names; run make check" >&2; exit 1; }
cd "$src" || exit 1
git ls-files -z '*.aiw' |
    ELECTRON_RUN_AS_NODE=1 xargs -0 "$code" "$top/editors/vscode/test/check.js" "$(dirname "$code")/resources/app"
