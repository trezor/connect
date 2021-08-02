.PHONY: clean submodules build build-connect coins protobuf eth-tokens

clean:
	rm -rf build/

# manually: goto ./submodules/trezor-common; git checkout master; git pull
submodules:
	cd ./submodules/trezor-common; git checkout master; git pull; git submodule update --recursive

# docker build for connect.trezor.io
build:
	./scripts/docker-build.sh

# local file system build
build-connect:
	yarn install
	yarn run build
	yarn run build:inline
	cp build/js/trezor-connect.*.js build/trezor-connect.min.js
	cp robots.txt build/robots.txt

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
	# messages from local trezor-firmware repo
	# make -C ../trezor-firmware/common/protob combine
	# ./node_modules/.bin/proto2js ../trezor-firmware/common/protob/combined.proto > ./src/data/messages/messages.json
	node ./scripts/protobuf-types.js
	# eslint fix is required since prettier uses comma as delimiter (default is semicolon)
	eslint ./src/js/types/trezor/protobuf.js --fix
	node ./scripts/protobuf-types.js typescript

# Build coin definitions
coins:
	# make submodules
	./submodules/trezor-common/tools/cointool.py dump -p -d connect -e blockbook -e icon -e cooldown -e github -e key -e maintainer -e uri_prefix -e version_group_id -e website -e links -e duplicate -e wallet -e bitcore -e confidential_assets -e negative_fee -o ./src/data/coins.json

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
