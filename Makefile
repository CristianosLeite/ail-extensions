# The extensions of AIL for editors. An extension needs nothing built;
# make only checks them, against the main repository, which is at ail/: a
# clone of the address and revision in ail.pin, which the first make
# fetches, or a link to a checkout named once with make AIL=<path>.
AILSAID := $(shell tools/ail.sh $(AIL) 2>&1 || echo failed)
ifneq ($(AILSAID),)
$(error $(AILSAID))
endif

# The formatter of the main repository, which the checks compare the
# folding with, is built where its source is.
check:
	@make -s -C ail AIL= build/tools/indent
	@editors/vscode/check.sh

# The MCP server SDK, mcp/, a package of AIL: its tests and its
# indentation, with the command ail of the main repository, which is
# built first.
mcp-check:
	@make -s -C ail AIL= build/ail
	cd mcp && ../ail/build/ail test && ../ail/build/ail fmt --check

.PHONY: check mcp-check
