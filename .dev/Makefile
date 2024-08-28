
PROJECT_ROOT = $(shell git rev-parse --show-toplevel)

.DEFAULT_GOAL := $(PROJECT_ROOT)/index.html

build:
	install -d -m 700 $@

DATASYNCER_ASSETS = $(shell find -s $(realpath $(PROJECT_ROOT)/../datasyncer/api) -name openapi.yaml)

build/0-datasyncer-openapi.yaml: export NODE_NO_WARNINGS = 1
build/0-datasyncer-openapi.yaml: build $(DATASYNCER_ASSETS)
	npx @redocly/cli join --without-x-tag-groups $(DATASYNCER_ASSETS) -o $@

ACCOUNTSADMIN_ASSETS = $(shell find -s $(realpath $(PROJECT_ROOT)/../accountsadmin/api) -name openapi.yaml)

build/1-accountsadmin-openapi.yaml: build $(ACCOUNTSADMIN_ASSETS)
	cp $(ACCOUNTSADMIN_ASSETS) $@

build/openapi.yaml: export NODE_NO_WARNINGS = 1
build/openapi.yaml: build/0-datasyncer-openapi.yaml build/1-accountsadmin-openapi.yaml
	npx @redocly/cli join --without-x-tag-groups build/*-openapi.yaml -o $@

build/sanitized.yaml: build/openapi.yaml
	yq 'del(.paths.* | select(key == "/placeholder")) | del(.tags[] | select(.name == "Placeholder"))' $< > $@

build/index.html: export NODE_NO_WARNINGS = 1
build/index.html: build/sanitized.yaml
	npx @redocly/cli build-docs $< -o $@

$(PROJECT_ROOT)/index.html: build/index.html
	cp build/index.html $(PROJECT_ROOT)/index.html

.PHONY: publish
publish: $(PROJECT_ROOT)/index.html
	cd $(PROJECT_ROOT) && git add index.html && git commit -m "Updated api" && git push

.PHONY: browse
browse: $(PROJECT_ROOT)/index.html
	open $(PROJECT_ROOT)/index.html

.PHONY: clean
clean:
	rm -rfv build/* *~
