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
- **It is a directory of the package that the repository is** (2026-11-22; first a
  package of its own, `mcp/Ailfile`, which no program could name by an address): a
  program names `ail-extensions` as a dependency and reads
  `ail-extensions:mcp/src/mcp.aiw`; its tests are `tests/mcp_*.aiw` of the package
  ([the link to the main repository](modules-and-link.md)).
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
- **The second review of the pull request 2** (Copilot, 2026-11-22, four findings, all
  taken): `initialize` is answered only when its params have a `protocolVersion` that is
  a string, `capabilities` that are an object and a `clientInfo` with a name and a
  version, -32602 otherwise, and the newest revision is the answer to a string that is
  no revision the server has, not to params that are wrong; a response that could not be
  put together for want of memory is not written in part: `mcpcall` returns -12 when a
  piece of a result could not be added, and `mcpserve` writes only what `jsonvalue`
  takes as one object on one line, and ends with -12 otherwise; the bytes of a line
  that comes in many reads are looked at once, by a place that is kept between the
  reads; and `make mcp-check` builds the formatter that `ail fmt` runs.
- **A test without memory** (2026-11-22): the commits of the two reviews said that the
  paths without memory were not made to happen in a test, and an answer in the pull
  request said that no test makes an allocation fail. A test can: the tests of the
  main repository limit the memory of the process with `setrlimit`, which was not
  looked for before that was written; the user's question brought it out.
  `mcp/tests/no_memory.aiw` limits the memory to 64 MiB and calls a tool that adds 24
  MiB of text: the server writes nothing of that response and ends with -12, the
  request before it answered. Still without a test: a write of a response that fails.
- **The third review of the pull request 2** (Copilot, 2026-11-22, three findings, all
  taken): a structured result may be nested 126 deep, since the response puts it two
  levels down and is itself read as JSON before it is written (`mcpdepth`); every task
  and event is awaited by a handle that was looked at, 0 being -12, the handler of a
  tool and the reads and writes of `mcpserve` included; and `mcpline` says whether its
  line is to have a response, so that a response that is due and of no bytes, for want
  of memory for the first of them, ends the server with -12 and is not taken for a
  notification. `mcp/tests/no_memory.aiw` has the last: a server that waits for its
  first request while the memory is taken whole ends with -12, where before the fix it
  went on waiting.

## Unchecked
- A real client. The test is a session written from the specification; aildb plans to
  ask its server from Claude Code and Codex.
- (Until 2026-11-22 the libraries the SDK needs had no released AIL, and the tests ran
  with the command of a checkout of its branch `net-json`. AIL 0.1.1 has them, and
  `Ailfile` asks for it.)
