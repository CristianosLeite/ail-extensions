#!/bin/sh
# usage: tools/check.sh AILSRC VERSION URL
#
# Run the checks of the editors (make check) against the sources of AIL.
# AILSRC is a checkout of AIL; if it is empty, the tag v<VERSION> of the
# repository at URL is fetched once into build/ail-<VERSION>, the
# version that the line "ail" of Ailfile asks for, and is the checkout.
# Its formatter is built, and each check gets the checkout in AILSRC.
set -eu
cd "$(dirname "$0")/.."
src=$1
version=$2
url=$3
if [ -z "$src" ]; then
    src=build/ail-$version
    if [ ! -f "$src/compiler/tables.aiw" ]; then
        mkdir -p build
        git clone -q --depth 1 --branch "v$version" "$url" "$src" ||
            { echo "check: cannot fetch v$version of $url; name a checkout with AILSRC=" >&2; exit 1; }
    fi
fi
[ -f "$src/compiler/tables.aiw" ] || { echo "check: no sources of AIL at $src" >&2; exit 1; }
make -s -C "$src" AIL= build/tools/indent
AILSRC=$(cd "$src" && pwd) editors/vscode/check.sh
