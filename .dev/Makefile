
PROJECT_ROOT = $(shell git rev-parse --show-toplevel)

BUILD_PATH = $(PROJECT_ROOT)/.dev/build

.DEFAULT_GOAL := $(PROJECT_ROOT)/index.html

$(BUILD_PATH):
	install -d -m 700 $@

DATASYNCER_ASSETS = $(shell find -s $(realpath $(PROJECT_ROOT)/../datasyncer/api) -name openapi.yaml)

$(BUILD_PATH)/0-datasyncer-openapi.yaml: export NODE_NO_WARNINGS = 1
$(BUILD_PATH)/0-datasyncer-openapi.yaml: $(BUILD_PATH) $(DATASYNCER_ASSETS)
	npx @redocly/cli join --prefix-tags-with-info-prop title $(DATASYNCER_ASSETS) -o $@

ACCOUNTSADMIN_ASSETS = $(shell find -s $(realpath $(PROJECT_ROOT)/../accountsadmin/api) -name openapi.yaml)

$(BUILD_PATH)/1-accountsadmin-openapi.yaml: $(BUILD_PATH) $(ACCOUNTSADMIN_ASSETS)
	cp $(ACCOUNTSADMIN_ASSETS) $@

POSTAL_ASSETS = $(shell find -s $(realpath $(PROJECT_ROOT)/../postal/api) -name openapi.yaml)

$(BUILD_PATH)/2-postal-openapi.yaml: export NODE_NO_WARNINGS = 1
$(BUILD_PATH)/2-postal-openapi.yaml: $(BUILD_PATH) $(POSTAL_ASSETS)
	npx @redocly/cli join --prefix-tags-with-info-prop title $(POSTAL_ASSETS) -o $@

KOTLIN_ASSETS = \
	$(BUILD_PATH)/kt-auth-openapi.json \
	$(BUILD_PATH)/kt-financial-openapi.json \
	$(BUILD_PATH)/kt-clouseau-openapi.json \
	$(BUILD_PATH)/kt-esign-openapi.json \
	$(BUILD_PATH)/kt-notification-generator-openapi.json \
	$(BUILD_PATH)/kt-outlet-management-openapi.json \
	$(BUILD_PATH)/kt-supplier-management-openapi.json \
	$(BUILD_PATH)/kt-user-management-openapi.json \

$(KOTLIN_ASSETS): $(BUILD_PATH)/kt-%-openapi.json:
	curl -o $@ https://api.staging.hospitad.com/$*/v3/api-docs

# prefix all operators with service keyword to solve conflict on operationId
# prefix all paths with service keyword to solve conflict on path
# replace all tags with service keyword to organize by service
# set common title "Product API"
# override server on path-level
$(subst /kt-,/sanitized-,$(KOTLIN_ASSETS)): $(BUILD_PATH)/sanitized-%-openapi.json: $(KOTLIN_ASSETS)
	server=$$(jq -r .servers[0].url $(subst /sanitized-,/kt-,$@)); \
	jq --arg keyword $* '.paths[][].operationId |= "op_keyspace_" + $$keyword[0:2] + "_" + . | .paths=(.paths | with_entries(.key |= "/op_keyspace_" + $$keyword[0:2] + .)) | .paths[][].tags = [$$keyword] | .info.title = "Product API" | .paths[].servers[0].url = "'$${server}'"' $(subst /sanitized-,/kt-,$@) > $@

# for x in .dev/build/kt-*.json; do echo -en $x; jq .info.title $x; done
$(BUILD_PATH)/3-kt-openapi.yaml: export NODE_NO_WARNINGS = 1
$(BUILD_PATH)/3-kt-openapi.yaml: $(BUILD_PATH) $(subst /kt-,/sanitized-,$(KOTLIN_ASSETS))
	npx @redocly/cli join --prefix-components-with-info-prop title --prefix-tags-with-info-prop title $(subst /kt-,/sanitized-,$(KOTLIN_ASSETS)) -o $@

$(BUILD_PATH)/openapi.yaml: export NODE_NO_WARNINGS = 1
$(BUILD_PATH)/openapi.yaml: $(BUILD_PATH)/0-datasyncer-openapi.yaml $(BUILD_PATH)/1-accountsadmin-openapi.yaml $(BUILD_PATH)/2-postal-openapi.yaml $(BUILD_PATH)/3-kt-openapi.yaml
	npx @redocly/cli join --prefix-components-with-info-prop title $(BUILD_PATH)/*-openapi.yaml -o $@

# uses redocly.yaml to filter internal apis
$(BUILD_PATH)/openapi-external.yaml: $(BUILD_PATH)/openapi.yaml
	cd $(PROJECT_ROOT)/.dev && npx @redocly/cli --config $(PROJECT_ROOT)/.dev/redocly.yaml bundle external@latest --output $(BUILD_PATH)/openapi-external.yaml

# delete placeholder paths
# delete placeholder tags
# delete placeholder tag groups
# delete prefix from operators that contain service keyword (to solve conflict before redocly join)
$(BUILD_PATH)/sanitized.yaml: $(BUILD_PATH)/openapi-external.yaml
		yq 'del(.paths.* | select(key == "/placeholder")) | del(.tags[] | select(.name|match(".*Placeholder"))) | del(.x-tagGroups[].tags[] | select(match(".*Placeholder"))) | (.. | select(tag == "!!str" and key == "operationId")) |= sub("op_keyspace_.._", "")' $< > $@

# NOTE: deleting prefix from paths that contain service keyword does not work before redocly build-docs because paths must be unique
#		yq 'del(.paths.* | select(key == "/placeholder")) | del(.tags[] | select(.name|match(".*Placeholder"))) | del(.x-tagGroups[].tags[] | select(match(".*Placeholder"))) | .paths=(.paths | with_entries(.key |= sub("/op_keyspace_..", ""))) | (.. | select(tag == "!!str" and key == "operationId")) |= sub("op_keyspace_.._", "")' $< > $@

$(BUILD_PATH)/index.html: export NODE_NO_WARNINGS = 1
$(BUILD_PATH)/index.html: $(BUILD_PATH)/sanitized.yaml
	npx @redocly/cli build-docs $< -o $@

# delete prefix from paths that contain service keyword (to work-around conflict after redocly build-docs)
$(PROJECT_ROOT)/index.html: $(BUILD_PATH)/index.html
	sed 's|/op_keyspace_..||g' $< > $@

.PHONY: publish
publish: $(PROJECT_ROOT)/index.html
	cd $(PROJECT_ROOT) && git add index.html && git commit -m "Updated api" && git push

.PHONY: browse
browse: $(PROJECT_ROOT)/index.html
	open $(PROJECT_ROOT)/index.html

.PHONY: clean
clean:
	rm -rfv $(BUILD_PATH)/* *~
