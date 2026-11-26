# mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server in [AIL](https://github.com/CristianosLeite/ail): what a program needs to offer tools to a coding agent such as Claude Code or Codex, over the stdio transport. It is one file, `src/mcp.aiw`, written with the official Rust SDK ([rmcp](https://github.com/modelcontextprotocol/rust-sdk)) as the reference for what a server is made of, and it speaks the revision 2025-11-25 of the protocol.

It is the server side and tools only: `initialize`, `ping`, `tools/list` and `tools/call`. No resources, no prompts, no requests to the client, no HTTP transport.

| rmcp | here |
|---|---|
| `ServerInfo`, `Implementation` | the 80 bytes of the server: name, version, instructions, its tools, a value of the program |
| `Tool` | 72 bytes: name, description, `inputSchema` and `outputSchema` as JSON text, the handler |
| a method with `#[tool]` | an async function `handler x arguments length result` |
| `CallToolResult::success`, `::error` | `mcptext result p n`, `mcpfail result p n` |
| `CallToolResult::structured` | JSON added to the buffer at 24 of the result: sent as `structuredContent` and, without a text, as the text too |
| `ErrorData`, the codes -32700 to -32603 | written by the server for a line that is no JSON, no request, a method or a tool it has not, arguments that are no object |
| `serve(stdio())` | `await mcpserve server 0 1` |

## Using it

It needs `lib/std/json.aiw` and `lib/std/num.aiw`, which AIL has since its version 0.1.1; `Ailfile` asks for AIL 0.2.0, the version the package is tested with. A program names the package of this repository in its `Ailfile` (`ail add --path <the top of this repository>`, or its address and a version once one is tagged) and:

```
use "lib/std/io.aiw"
use "lib/std/bytes.aiw"
use "lib/std/json.aiw"
use "lib/async/task.aiw"
use "lib/async/time.aiw"
use "lib/async/io.aiw"
use "ail-extensions:mcp/src/mcp.aiw"
buf server 80
buf tools 72
data schema "{\"type\":\"object\",\"properties\":{\"text\":{\"type\":\"string\"}},\"required\":[\"text\"]}"
async fn echo x p n r
	call jsonget p n "text" as v vn k
	if k!=5
		call mcpfail r "text is to be a string"
		ret 0
	end
	call jsonstr r v vn
	ret 0
end
store server "echo-server"
store server+8 11
store server+16 "0.1.0"
store server+24 5
store server+48 tools
store server+56 1
store tools "echo"
store tools+8 4
store tools+16 "Say it back"
store tools+24 11
len schema as n
store tools+32 schema
store tools+40 n
ref echo as f
store tools+64 f
await mcpserve server 0 1
```

The head of `src/mcp.aiw` has every field and rule. A handler gets its arguments as a JSON object that `lib/std/json.aiw` walks, and may wait (a request of its own, a child process) without anything else to arrange, since it is a task. Nothing but responses goes to the output; a program writes what it has to say to its stderr.

## Checking it

At the top of the repository, which is the package:

```
ail test          # tests/mcp_serve.aiw, a session line by line, and tests/mcp_no_memory.aiw
ail fmt --check
```

`make test` runs both; `make AIL=<path>/build/ail test` with the command of a checkout of AIL, which must be one that has the libraries above.
