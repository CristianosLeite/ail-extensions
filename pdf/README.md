# pdf

The text of the pages of a PDF file, in [AIL](https://github.com/CristianosLeite/ail): what a program needs to read a document that it is to search or to index, with no other program and no library but that of AIL. It was written for the index of [aildb](https://github.com/CristianosLeite/aildb), and ISO 32000-1 is what it follows.

It reads; it draws nothing and writes no PDF. It gives the text that the contents of a page show, in their order, and puts a space or a line feed where only the places of the strings say that there is one. It has no OCR: a page that is a picture of text has no text.

## Using it

It needs AIL 0.1.1 or later. A program names the package of this repository as a dependency and reads one file of it:

```
use "lib/std/io.aiw"
use "lib/std/bytes.aiw"
use "lib/std/file.aiw"
use "ail-extensions:pdf/src/pdf.aiw"
buf file 24
buf text 24
buf d pdfsize
call argv 1 as p n
call fileread p n file
load file as p
load file+8 as n
call pdfopen p n d 64*n+1000000 268435456 as pages
ifslt pages 0
	call die "no PDF file that can be read\n"
end
i=1
while i<=pages
	call bycut text 0
	call pdfpage d i text as r
	ifsge r 0
		load text as q
		call print q r
		call print "\n"
	end
	i+=1
end
call pdfclose d
```

| Function | Does |
|---|---|
| `pdfopen p n d work mem` | opens the `n` bytes at `p`, a whole file; returns the number of pages |
| `pdfpage d i out` | adds the text of the page `i`, from 1, to the buffer `out` of `lib/std/bytes.aiw`, as UTF-8; returns the number of bytes added |
| `pdfclose d` | gives back what the document allocated |

- **The document** `d` is `pdfsize` bytes that the caller owns, a `buf` or a `local`.
- **The bytes of the file** are the caller's too. Nothing is written to them, and they stay as they are, at their address, until `pdfclose`.
- **A negative result** is an error. Of `pdfopen`, after which `d` needs no `pdfclose`: `pdfdocbad` (-22), no PDF file or one whose structure cannot be read; `pdfdoclocked` (-13), an encrypted file; `pdfdocspent` (-7) and `pdfdocmem` (-12), below. Of `pdfpage`: `pdfbad` (-5), contents that are not well formed or a stream of them that cannot be unpacked; `pdffilter` (-95), a stream of the page with a filter that is not known; `pdfrange` (-34), no such page.
- **A page is all or nothing.** After an error of `pdfpage` the buffer is as it was at the call, with nothing of the page in it, also when one stream of the page has text and another has a filter that is not known: an index never has half a page that nobody was told of. The other pages stay readable.
- **What a document may cost** is the caller's to say, for a file that is made to cost much. `work` is counted down by about one for every 16 bytes that are looked at, given to a filter or unpacked, for every object, operator and code, and by 4100 for the tables of each block of `FlateDecode`; `mem` is the bytes that may be allocated at one time, the contents of a page and of the forms drawn on it among them, which are held together. When either is used up the document is spent: `pdfdocspent` is the result of that call and of every one after it, and `pdfclose` is still to be called. A stream is unpacked into buffers that grow by doubling, so the memory in use may for a moment be about three times `mem`. Of 394 files that opened on the machine of the author (2026-11-23), the one that cost most took 5.5 of work for each of its bytes, so 64 for each byte and a million more, as above, is ample; 256 MiB of memory held every one of them.
- **Several documents** may be open at once, each with its own `d`, and in several threads: nothing is shared between them.

## What is read

- The cross references as a table or as a stream, with the sections of later changes, and objects in object streams (PDF 1.5).
- Streams that are not packed or packed with `FlateDecode`, with the predictors of PNG and of TIFF, `ASCIIHexDecode` and `ASCII85Decode`.
- The pages in the order of the page tree, with the resources a page inherits.
- The operators that show and place text (`BT ET Tf Td TD Tm T* TL Tc Tw Tz Tj TJ ' "`), `q Q cm`, forms drawn with `Do`, twelve deep; an inline image is passed over.
- Fonts of one byte a code with `WinAnsiEncoding`, `MacRomanEncoding`, `StandardEncoding`, `Differences` by a table of 343 glyph names (and `uniXXXX`, `uXXXX`), and the encoding in the clear part of an embedded Type 1 program, which the fonts of TeX need; fonts of two bytes a code; and for both a `ToUnicode` CMap, which goes before the rest.

## What is not

- An encrypted file, also one that opens without a password.
- A file whose cross references are damaged: it is not searched for its objects.
- `LZWDecode`, `RunLengthDecode` and the filters of images. A page whose contents use one is `pdffilter`.
- A font without `ToUnicode` whose characters are only in a TrueType or CFF program, or in a predefined CMap of more than two bytes: its codes come out as U+FFFD or as the characters of its base encoding.
- The order in which a person reads: the text comes in the order of the contents, which for most writers is that order, and columns are not found. A word broken at the end of a line stays broken.
- Text that is drawn but not seen (clipped, white on white) is text; marked content, annotations and form fields are not read.

## What was checked

`tests/pdf_inflate.aiw`, `pdf_obj.aiw`, `pdf_doc.aiw`, `pdf_stm.aiw` and `pdf_text.aiw`, which `make test` runs, each for one source of `pdf/src/`. What a test is to print was written from outside the code: by zlib and base64 of Python 3 for what is packed, from ISO 32000-1 for the syntax, and from the objects, operators and fonts that a Python program put into the files it wrote for the tests.

Three files are from other writers, Ghostscript 10.06 and cairo (`tests/data/make.sh`), and the test requires in their bytes what they are there for: `/ObjStm`, `/XRef`, `/ToUnicode`. Their text, which the test prints, was compared with `pdftotext` of poppler, each page alone (`pdftotext -f N -l N`), after two changes to both texts: every run of white space is one space, and a ligature is its letters (NFKC). No page differed. The two changes are needed because the readers differ there by design: poppler lays the text out in lines of the page and keeps the ligature U+FB01, this reader gives the order of the contents and writes `fi`.

Files that are no PDF or are damaged must end, and soon: each file of the tests is read cut at every eleventh length and with every 53rd byte changed in three ways, 6469 files, and four files are made to cost much (a form that draws eight forms twelve deep, 400 streams of 4 MiB, which are also too much to hold with work for all of them, pages below one another, 1000 streams of 10000 blocks that unpack to nothing); all of it within the 10 seconds a test has.

Outside the tests, on 2026-11-23, on an Intel Core i7-12700H with AIL 0.1.1 at `d9e069e`: of the 400 files named `.pdf` found on that machine, 394 opened with no page in error, three are encrypted and three are no PDF; the 131 different ones with more than 50 words gave 98.8% of the 1401266 words that `pdftotext` gives of them, and of the words of this reader 98.6% are among those; reading all 400 took 7.7 seconds, 119 MB, where `pdftotext` took 11.4 for the 394. 1760 files damaged at random, 40 for each of 44 files, were read with no fault. There was no file of LaTeX, LibreOffice, Word or a browser made for the tests, since none of those programs is on that machine; files of TeX and of others were among the 400.

## Layout

| File | Prefix | What it is |
|---|---|---|
| `src/pdf.aiw` | `pdf` | the three functions above: the page tree, the contents, where spaces and line feeds go |
| `src/pdffont.aiw` | `pdffont` | the characters and the width of a code of a font |
| `src/pdfstm.aiw` | `pdfstm` | the bytes of a stream, with its filters undone |
| `src/pdfdoc.aiw` | `pdfdoc` | the document: cross references, objects, object streams, the work and the memory |
| `src/pdfobj.aiw` | `pdfobj` | the syntax of objects, read where the bytes lie |
| `src/inflate.aiw` | `inflate` | DEFLATE (RFC 1951) and zlib (RFC 1950), of use by itself |

Each file names the files it needs, and its head says what its functions take and give.
