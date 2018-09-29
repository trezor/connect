# for stable (numbered) versions:
# make dist-stable-v1 && make sync-stable-v1
# the result is on connect.trezor.io/1

# for rolling versions:
# make dist-rolling-claim-bch && make sync-rolling-claim-bch
# the result is on connect.trezor.io/claim-bch-ce179c9
# ce179c9 is first 7 letters from the hash of the commit (what github etc shows)

clean:
	rm -rf dist/

# manually: goto ./submodules/trezor-common; git checkout master; git pull
submodules:
	git submodule update --remote --merge --recursive

build:
	yarn
	yarn run build
	yarn run build:inline
	cp dist/js/trezor-connect.*.js dist/trezor-connect.min.js
	cp robots.txt dist/robots.txt

# Build only npm library
build-npm:
	yarn run build:npm
	cd ./npm && npm publish

# Build test
build-test:
	make build
	sed -i '' -e 's/connect.trezor.io/sisyfos.trezor.io\/connect/g' ./dist/js/iframe.*.js
	rsync -avz --delete -e ssh ./dist/* admin@dev.sldev.cz:~/sisyfos/www/connect

# Build for hot fixes on https://connect.trezor.io/[major]

build-patch:
	yarn bump --patch --grep ./README.md ./src/js/data/ConnectSettings.js
	make build
	# Call: sync-[major]
	# TODO: git push changed files with new version in summary

# Build for minor fixes on https://connect.trezor.io/[major.minor] and NPM
build-minor:
	yarn bump --minor --grep ./README.md ./src/js/data/ConnectSettings.js
	make build
	# Call: build-npm
	# Call: sync-[major.minor]
	# TODO: git push changed files with new version in summary

# Build for major fixes on https://connect.trezor.io/[major] and NPM
build-major:
	yarn bump --major --grep ./README.md ./src/js/data/ConnectSettings.js
	make build
	# Call: build-npm
	# Call: sync-[major]
	# TODO: git push changed files with new version in summary

# Sync new build
sync-%:
	make .sync-$*

.sync-%:
	# Before first use: Install awscli (pip install awscli)
	# Configure access credentials (aws configure), region is "eu-central-1"
	aws s3 sync --delete --cache-control 'public, max-age=3600' dist/ s3://connect.trezor.io/$*/

# Build messages.json from protobuf
protobuf:
	make -C ./submodules/trezor-common/protob combine
	./node_modules/.bin/proto2js ./submodules/trezor-common/protob/combined.proto > ./src/data/messages.I.json

# Build coin definitions
coins:
	# make submodules
	./submodules/trezor-common/defs/coins/tools/build_coins.py connect
	mv coins.json ./src/data/coins.json
	cp ./submodules/trezor-common/defs/ethereum/networks.json ./src/data/ethereumNetworks.json
