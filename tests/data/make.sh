#!/bin/sh
# tests/data/make.sh -- write the PDF files of tests/pdf_text.aiw again,
# with the programs that wrote them first: groff 1.23 for PostScript,
# Ghostscript 10.06 for two files of it, and pycairo for one. They are
# kept with the sources, since another version of a program writes
# other bytes; run this only to change what the test reads, and then
# compare the text of each page with pdftotext, as the README of the
# module says. It is run in tests/data.
#
#   gs.pdf     a table of cross references, Type 1C fonts with a
#              ToUnicode CMap, spaces set as character spacing
#   gsobj.pdf  a cross reference stream and an object stream, the same
#              fonts with no ToUnicode
#   cairo.pdf  a cross reference stream, object streams, fonts of two
#              bytes a code with ToUnicode
set -eu
cat > doc.tr <<'EOF'
.ll 6i
.ps 11
.vs 14
.ft B
A document of groff
.ft R
.sp
The first paragraph has plain words, an office with a fine affliction, and \(lqquotes\(rq \(em a dash.
Caf\('e na\(:ive fa\(,cade.
.sp
The second paragraph is long enough to be set in more than one line of the page, so that the reader has to join lines that follow one another, and it goes on for a while with some more words of no importance.
.bp
Page two of the document.
EOF
groff -Tps doc.tr > doc.ps
ps2pdf doc.ps gs.pdf
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dWriteObjStms=true -dWriteXRefStm=true -sOutputFile=gsobj.pdf doc.ps
python3 - <<'EOF'
import cairo
s=cairo.PDFSurface('cairo.pdf',595,842); c=cairo.Context(s)
c.select_font_face('DejaVu Sans'); c.set_font_size(12)
y=72
for line in ['A document of cairo','Plain words, an office and a fine affliction.','Café naïve façade — “quotes” and a dash.','Ελληνικά and кириллица.']:
    c.move_to(72,y); c.show_text(line); y+=18
c.show_page(); c.move_to(72,72); c.show_text('Page two of the document.'); c.show_page(); s.finish()
EOF
rm doc.tr doc.ps
