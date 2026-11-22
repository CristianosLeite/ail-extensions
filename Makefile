# ail-extensions is a package of AIL (Ailfile), tested by the command
# ail: "ail test" runs the tests of the modules written in AIL, and "ail
# fmt --check" looks at their indentation. AIL names the command, if it
# is not on PATH:
#   make AIL=../ail/build/ail test
AIL ?= ail
AILCMD := $(if $(findstring /,$(AIL)),$(abspath $(AIL)),$(AIL))

# The tests of mcp/, the MCP server SDK (tests/mcp_*.aiw), and the
# indentation of every AIL source.
test:
	$(AIL) test $(T)
	$(AIL) fmt --check

# The check of the editors compares an extension with the language
# itself, so it reads the sources of AIL: every .aiw file that git has
# there, the statements of its compiler and its formatter, which is
# built first. AILSRC is a checkout of AIL; it is the one the command is
# in when AIL names build/ail of a checkout. Without either, the version
# of AIL that the line "ail" of Ailfile asks for is fetched once, its
# tag v<version> of the published repository, into build/, so that who
# has only this repository can run the check (tools/check.sh).
AILSRC ?= $(patsubst %/build/ail,%,$(filter %/build/ail,$(AILCMD)))
AILVER := $(shell sed -n 's/^ail //p' Ailfile)
AILURL := https://github.com/CristianosLeite/ail.git
check:
	@tools/check.sh "$(AILSRC)" $(AILVER) $(AILURL)

.PHONY: test check
