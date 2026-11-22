---
title: The MCP server SDK
last-verified: 2026-11-22
sources: [conversation 2026-11-22 (in the aildb repository), mcp/src/mcp.aiw, mcp/tests/serve.aiw, mcp/README.md, the specification of the Model Context Protocol 2025-11-25, the README and model.rs of rmcp]
status: current
---
# The MCP server SDK

**Summary.** `mcp/` is a server of the Model Context Protocol in AIL: the revision
2025-11-25 over stdio, the server side and tools only. It was written on 2026-11-22 for
`aildb-mcp`, the search of aildb for a coding agent, and is a module here at the user's
word. It is on the branch `mcp`, which is not pushed.

## Decisions
- **A module of this repository, in AIL, with the Rust SDK as the reference** (user,
  2026-11-22): "let us write the SDK in AIL, use the one of Rust as the reference", and
  "the MCP SDK is a module of ail-extensions"; JSON, numbers and HTTP are libraries of
  AIL itself.
- **It is a package of AIL, with its own `Ailfile`** (agent): a program names it as a
  dependency and reads `mcp:src/mcp.aiw`. The repository itself still pins AIL in
  `ail.pin`; only this module is a package.
- **What of rmcp is here** (agent): `ServerInfo` and `Tool` as bytes the program owns,
  a handler for each tool, `CallToolResult::success`, `::error` and `::structured` as
  `mcptext`, `mcpfail` and a buffer for JSON, the codes of `ErrorData`, and
  `serve(stdio())` as `mcpserve`. Not here: the client side, resources, prompts,
  sampling, tasks, the HTTP transport, the macros (AIL has none), and the revision
  2026-07-28, which rmcp calls its latest and which has no `initialize`.
- **The handler is an async function** (agent), so a tool that asks a service or runs a
  process waits without holding the server; a request is still answered before the
  next is read, which keeps the responses in the order of the requests.
- **An unsupported revision is answered with the newest** (the specification: "the
  server MUST respond with another protocol version it supports"), not with an error;
  rmcp has an error -32022 for it, and the page of the lifecycle shows -32602 as an
  example.
- **Input that is wrong for a tool is the tool's to say**, as a result with `isError`
  (the specification); the SDK checks only that the arguments are an object.
- **A structured result is checked to be one JSON object** and sent without its line
  ends, since a message is one line; a handler that gives another gets -32603.
- **What is a request is checked before anything is dispatched** (the review of the
  pull request 2 by Copilot, 2026-11-22, five findings, all taken): a message has
  `"jsonrpc":"2.0"`, as rmcp requires; an id is a string or a whole number, so `1.5` and
  `1e2` are none and are answered with the id `null`; params that are sent are an
  object, and only params that are absent are `{}` (-32602 otherwise, nothing for a
  notification); the limit of a line holds for a line that was read whole in one piece
  too, which had depended on where the reads ended; and a failed write of the answer
  to a line that is too long ends `mcpserve` with the error, as any other write does.

## Unchecked
- A real client. The test is a session written from the specification; aildb plans to
  ask its server from Claude Code and Codex.
- `make mcp-check` with the revision of `ail.pin`, which has not the libraries the SDK
  needs: it was run with the command of a checkout of AIL at its branch `net-json`.
