# for stable (numbered) versions:
# make dist-stable-v1 && make sync-stable-v1
# the result is on connect.trezor.io/1

# for rolling versions:
# make dist-rolling-claim-bch && make sync-rolling-claim-bch
# the result is on connect.trezor.io/claim-bch-ce179c9
# ce179c9 is first 7 letters from the hash of the commit (what github etc shows)

clean:
	rm -rf dist/

node_modules:
	yarn

build:
	yarn
	yarn run build
	cp dist/js/trezor-connect.*.js dist/trezor-connect.js
	cp robots.txt dist/robots.txt

dist-%:
	git fetch
	git checkout $*
	git submodule update --init
	make clean
	make build

sync-%:
	make .sync-$*

.sync-%:
	# Before first use: Install awscli (pip install awscli)
	# Configure access credentials (aws configure), region is "eu-central-1"
	aws s3 sync --delete --cache-control 'public, max-age=3600' dist/ s3://connect.trezor.io/$*/

# Build only for npm
npm:
	yarn bump
	yarn run build:npm
	cp ./package.npm.connect.json ./dist/package.json
	cp README.md ./dist/README.md
	cp COPYING ./dist/COPYING
	cp CHANGELOG.md ./dist/CHANGELOG.md
	mkdir -p ./dist/flowtype
	cp ./src/flowtype/trezor.js ./dist/flowtype/trezor.js
	cp ./src/flowtype/trezor-connect.js ./dist/flowtype/trezor-connect.js
	cp ./src/flowtype/trezor-connect-params.js ./dist/flowtype/trezor-connect-params.js
	cp ./src/flowtype/trezor-connect-response.js ./dist/flowtype/trezor-connect-response.js
	cd ./dist && npm publish

protobuf:
	sed 's/\(google\/protobuf\)/\.\/\1/' ./submodules/trezor-common/protob/messages.proto > ./submodules/trezor-common/protob/messages_fixed.proto
	./node_modules/.bin/proto2js ./submodules/trezor-common/protob/messages_fixed.proto > ./src/data/messages.json
	rm ./submodules/trezor-common/protob/messages_fixed.proto

coins:
	make submodule
#	./submodules/trezor-common/defs/coins/tools/build_coins.py connect
	./submodules/trezor-common/defs/coins/tools/build_coins.py
	mv coins.json ./src/data/coins.json
	cp ./submodules/trezor-common/defs/ethereum/networks.json ./src/data/ethereumNetworks.json

submodule:
	git submodule update --remote --merge --recursive
