# Knowledge index

The decisions about the language and its source style are in the knowledge base of the main repository (https://github.com/CristianosLeite/ail, `.agents/knowledge/`). The pages here are about the extensions.

## architecture
- [Modules and the link to the main repository](architecture/modules-and-link.md) — one directory a kind of extension, `editors/` the first; the main repository as a pinned clone or a link at `ail/`, and why
- [VS Code extension](architecture/vscode-extension.md) — plain JavaScript without a build step, the line rules of the formatter written again for folding, formatting through `build/tools/indent` of the workspace
- [The MCP server SDK](architecture/mcp-sdk.md) — `mcp/`, a package of AIL: the revision 2025-11-25 over stdio, tools only, rmcp as the reference; handlers are async functions, a structured result is one checked object; written for aildb, not yet asked by a real client
- [The reader of PDF](architecture/pdf-reader.md) — `pdf/`, six sources: values read in place as two addresses, the work and the memory of a document counted, a page all or nothing; spaces from the places and the widths; what was measured against pdftotext on 2026-11-23

## testing
- [Grammar check](testing/grammar-check.md) — every source of the language coloured with the editor's own libraries; what it found, what it does not cover

## status
- [Open items](status/open-items.md) — pending work
