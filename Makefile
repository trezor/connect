.PHONY: clean submodules build build-npm publish-npm build-connect build-test version-patch version-minor version-major coins protobuf eth-tokens

clean:
	rm -rf build/

# manually: goto ./submodules/trezor-common; git checkout master; git pull
submodules:
	cd ./submodules/trezor-common; git checkout master; git pull; git submodule update --recursive

# docker build for connect.trezor.io
build:
	./scripts/docker-build.sh

# docker build for npm
build-npm:
	./scripts/docker-build.sh npm

publish-npm:
	cd ./npm && npm publish

# local file system build
build-connect:
	yarn install
	yarn run build
	yarn run build:inline
	cp build/js/trezor-connect.*.js build/trezor-connect.min.js
	cp robots.txt build/robots.txt

# Build test
build-test:
	make build-connect
	sed -i '' -e 's/connect.trezor.io/sisyfos.trezor.io\/connect/g' ./build/js/iframe.*.js
	rsync -avz --delete -e ssh ./build/* admin@dev.sldev.cz:~/sisyfos/www/connect

# Version bump
version-patch:
	yarn bump patch ./package.json ./README.md ./src/js/data/ConnectSettings.js ./src/js/plugins/webextension/trezor-usb-permissions.js
version-minor:
	yarn bump minor ./package.json ./README.md ./src/js/data/ConnectSettings.js ./src/js/plugins/webextension/trezor-usb-permissions.js
version-major:
	yarn bump major ./package.json ./README.md ./src/js/data/ConnectSettings.js ./src/js/plugins/webextension/trezor-usb-permissions.js

# Sync build
sync-%:
	# Before first use: Install awscli (pip install awscli)
	# Configure access credentials (aws configure), region is "eu-central-1"
	aws s3 sync --delete --cache-control 'public, max-age=3600' build/ s3://connect.trezor.io/$*/
	aws cloudfront create-invalidation --distribution-id E3LVNAOGT94E37 --paths '/*'

# Build messages.json from protobuf
protobuf:
	make -C ./submodules/trezor-common/protob combine
	./node_modules/.bin/proto2js ./submodules/trezor-common/protob/combined.proto > ./src/data/messages/messagesN.json

# Build coin definitions
coins:
	# make submodules
	./submodules/trezor-common/tools/cointool.py dump -p -d connect -e icon -e cooldown -e github -e key -e maintainer -e uri_prefix -e version_group_id -e website -e links -e duplicate -e wallet -e bitcore -e confidential_assets -e negative_fee -o ./src/data/coins.json

eth-tokens:
	./submodules/trezor-common/tools/cointool.py dump -p -I erc20 -f chain=eth -e chain -e chain_id -e ens_address -e key -e logo -e social -e support -e type -e website -e shortcut -o ./src/data/ethereumTokens.json

.DEFAULT_GOAL:= default
default:
	@echo "Build:"
	@echo "git checkout to version branch v[X]"
	@echo "    make build"
	@echo "Sync:"
	@echo "s3 sync version build to server (connect.trezor.io)"
	@echo "    make sync-[X]"
	@echo " "
	@echo " "
	@echo "NPM:"
	@echo "    make build-npm"
	@echo "Publish NPM:"
	@echo "    make publish-npm"
