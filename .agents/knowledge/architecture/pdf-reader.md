---
title: The reader of PDF
last-verified: 2026-11-23
sources: [conversation 2026-11-23 (in the aildb repository), pdf/README.md, pdf/src/*.aiw, tests/pdf_*.aiw, tests/data/make.sh, ISO 32000-1, RFC 1950, RFC 1951]
status: current
---
# The reader of PDF

**Summary.** `pdf/` gives the text of the pages of a PDF file, in AIL, for the index of
aildb. It is six sources, written on 2026-11-23, one commit each but the first two of
the document: inflate, objects and cross references, streams, text. The user decided
where it is, what it reads and how its errors and its cost behave; the agent chose the
rest, which is for the user to review (`status/open-items.md`).

## Decisions
- **A module of this repository, not files of aildb** (user, 2026-11-23). aildb's
  chunker took `.aiw` and `.md`; the user asked for other formats, "such as PDF", in
  AIL. The library of AIL has no inflate and nothing of PDF. Asked whether the reader
  should be in aildb or here, as the MCP SDK is, the user chose here, knowing that it
  means two repositories, two pull requests and a tag of this one before aildb can
  name it.
- **What is read** (user, 2026-11-23, of two offers): streams that are not packed or
  FlateDecode with the predictors of PNG, classic and stream cross references, object
  streams, simple fonts with the three encodings and Differences, and ToUnicode. The
  other offer, classic tables and ToUnicode alone, fails on most files since PDF 1.5.
  No OCR; an encrypted file is refused.
- **The contract** (user, 2026-11-23, reviewing the plan): the bytes of the file are the
  caller's and stay until the close; pages count from 1; after an error the buffer is
  as it was. A page with text in one stream and an unknown filter in another gives
  nothing and an error (agent, of the two the user named: "a page is all or nothing,
  so that the index never has half a page unseen"). An error of a page leaves the
  others readable; one of the document is the result of every later call. So a caller
  that drops a whole document for a document error must drop what it took of earlier
  pages, which is aildb's to do.
- **A budget for the whole document** (user, 2026-11-23: depth and a limit for each
  stream leave room for many streams, objects and repeated forms). `work` and `mem` of
  `pdfopen`, counted in `pdfdocspend` and `pdfdocalloc`, which every source calls: a
  unit of work for about 16 bytes looked at or unpacked and for each object, entry,
  operator and code. The numbers of the units are the agent's. Memory is counted as it
  is asked for, but a stream is unpacked into buffers that double, so the peak may be
  about three times `mem`; this is said in the README and not hidden.
- **A value is two addresses, and no tree is built** (agent). `pdfobj.aiw` reads tokens
  where they lie; a dictionary is searched each time. It costs scanning a dictionary
  again for every key, which is counted as work, and saves every allocation of a
  parser. Object streams are unpacked once and kept, so an address into one stays
  good until the close.
- **No recursion without a limit** (agent): forms 12 deep and never inside themselves,
  object streams that need one another 16 deep, with a stream marked while it is
  unpacked so that one that needs an object of itself gives none; the page tree 64
  deep and no node below itself; arrays and dictionaries 256 deep.
- **Where spaces and line feeds go** (agent, from what the files showed). The pen is
  followed through the text matrix and the matrix of the page, with the widths of the
  font. Before a string: a line feed if it is more than half the font size off the
  line or more than twice the size behind the end of the one before, a space if it is
  more than 0.15 of the size after it. Two cases came from Ghostscript's output of
  groff: a space written as character spacing after the glyph before it (`2.75 Tc
  (Ad)Tj` is "A d"), so a character spacing above 0.15 of the size is a space; and a
  space character that a negative word spacing takes back (`-2.48 Tw (ar y)Tj` is
  "ary"), so a space narrower than a twentieth of the size is left out. poppler keeps
  the second as "Librar y".
- **The encoding of an embedded Type 1 program is read** (agent, 2026-11-23), which the
  plan did not have: the first comparison with pdftotext gave 89.5% of its words, and
  the documents of TeX had a colon for every period, since cmmi10 has the period at
  the code 58 and says so only in its program (`dup 58 /period put`). With it, and
  with a glyph name of one byte taken as that character (Type 3 fonts name glyphs
  "0" and "1"), 98.8%. CFF and TrueType programs are not read.
- **Ligatures are written as their letters** (agent): U+FB00 to U+FB04, wherever they
  come from, because the text is for search.
- **FlateDecode with a wrong or missing Adler-32 is taken** if the last block ends
  (agent), as other readers take it; `inflatezlib` itself stays strict.
- **The tests' expectations come from outside the code** (agent, as aildb's rule for
  expected output says): Python programs that are not kept wrote the inputs and, beside
  each, what it gives. Of five tests the first runs differed in four lines in all,
  each time in the expectation: a reference counted one too many, an object stream
  found by its `endstream`, the catalog in an object stream counted as memory at the
  open, the work of a page guessed. The text of `hand.pdf`, 13 pages, was as written
  at the first run.
- **pdftotext is the reference for the files of other writers, page by page, with two
  changes to both texts** (user, 2026-11-23: use it as the reference by page and say
  how white space is made equal): every run of white space one space, and NFKC for
  the ligatures.
- **What the review of the pull request 6 found, fixed the same day** (Copilot,
  2026-11-23; the fixes are the agent's). Work was counted for what a filter gives and
  not for what it reads, so 10000 empty blocks cost nothing, and a block of a few bytes
  could ask for tables of 131072 bytes: a filter's input is counted now, and `inflate`
  takes the address of the work and counts 4100 for the tables of a block. The
  contents of a page and of the forms on it were kept together without being counted
  as memory, so 400 streams of 4 MiB were held with `mem` at 64 MiB: `pdfdochold`
  counts them. No memory found by the inflater, a decoder or a string was the result
  of one call, or a string left out of a page, and not the error of the document: it
  is now, wherever it is found. A name of a resource written with `#` in the contents
  was looked up as written and not found: it is looked up as its bytes. A file for each
  of the first two and a page for the last are in `tests/pdf_text.aiw`; no test makes
  the kernel refuse memory.
- **What two more reviews found, fixed the same day** (the user, with files that show
  each, and Copilot's second review, 2026-11-23). A page left out moved the numbers of
  those after it: beyond 64 levels a branch of the page tree was given up and the
  leaves found were numbered on, so text of page 2 came out as page 1. A tree that
  deep is now no document, and a kid that is no dictionary is a page with its number
  that cannot be read. A letter at the code 32 (`/Differences [32 /i]`) was taken for a
  space and could be left out: only a code whose character is U+0020 is, and the word
  spacing is for fonts of one byte alone. A run of a ToUnicode CMap whose destination
  is several characters gave the same characters to every code: the last byte of the
  destination is counted up for each, before it is read. The text of a page was not
  counted: it is work as it is added, and a page of more text than the memory left
  makes the document spent; what the caller keeps in its buffer over pages is the
  caller's, which the README says. The bytes a font keeps for codes of several
  characters count as memory. A character spacing wider than a gap looked at the
  byte before the buffer when the page had no text yet. Half a surrogate pair and a
  value above U+10FFFF are written as U+FFFD, so that the text is UTF-8. No memory for
  a space or a line feed that the reader puts in is the error of the document.
- **What Copilot's fifth review found, fixed the same day** (2026-11-23). An object
  has its generation, which was not looked at: after an update that gives the number
  of a freed object to a new one, `5 0 R` found the new `5 1 obj`, and its text could
  come out as that of another page. The entry keeps the generation, the two numbers
  before `obj` are to give it too, an object of an object stream has 0, and a
  reference with another generation is null (`pdfdocref`; poppler does the same).
  `pdfdocobj`, by the number alone, stays for what is found by no reference. The
  bytes before the value of an object, white space and comments, were looked at for
  the four units of the object each time a font was set: they count as the rest, a
  unit for 16, also where no object is, and so do the pairs of an object stream that
  are passed to reach one. An array of contents that a string without its end or
  the end of the bytes cut short gave the text of the streams before: it is
  `pdfbad`. `ASCIIHexDecode` was held to half the bytes it reads, so much white
  space before a few digits made a document spent: the bytes it gives are counted
  as they are added. The text of the 400 files read on that day did not change, and
  the most work a byte is still 5.5.
- **What Copilot's sixth review found, fixed the same day** (2026-11-23). The bytes
  of a table of cross references counted by its entries alone, so white space and
  comments in it cost nothing: they count a unit for 16 each of the two times a
  table is read, also when it is none, which made the cost of every file with a
  table a little more (the hand-written file of the test opens for 554, not 418).
  The same for what lies between the dictionary of a stream and `stream`, and
  between the bytes a Length names and `endstream`. A value null for a key is as no
  key (ISO 32000-1, 7.3.9), also the null that a reference to no object gives:
  `pdfdocget` says so, and so `/Contents null` is a page of no text, `/Filter null`
  no filter and `/Resources null` the resources of the node above; `/Encrypt null`
  in a trailer is no encryption. The text of the 400 files did not change, and the
  most work a byte is 5.5 as before.

## What was seen and is not done
- No file of LaTeX, LibreOffice, Word or a browser was made for the tests: none of
  them is on the machine. Files of TeX were among the 400 that were read once.
- A damaged cross reference is not repaired by a search for `obj`.
- Hyphens at the end of a line are not joined; pdftotext joins them.
- `LZWDecode` and `RunLengthDecode` are not read.
