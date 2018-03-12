# for stable (numbered) versions:
# make dist-stable-v1 && make sync-stable-v1
# the result is on connect.trezor.io/1

# for rolling versions:
# make dist-rolling-claim-bch && make sync-rolling-claim-bch
# the result is on connect.trezor.io/claim-bch-ce179c9
# ce179c9 is first 7 letters from the hash of the commit (what github etc shows)

clean:
	rm -rf dist/

build:
	yarn run build

dist-%:
	git fetch
	git checkout $*
	make clean
	make build
	make .copy-$*

.copy-%:
	cp dist/js/trezor-connect.*.js dist/trezor-connect.js

sync-%:
	make .sync-$*

.sync-%:
	# Before first use: Install awscli (pip install awscli)
	# Configure access credentials (aws configure), region is "eu-central-1"
	aws s3 sync --delete --cache-control 'public, max-age=3600' dist/$* s3://connect.trezor.io/$*/

npm:
	yarn bump
	rm -rf dist-npm
	mkdir -p dist-npm
	cp ./package.npm.connect.json ./dist-npm/package.json
	cp README.md ./dist-npm/README.md
	cp COPYING ./dist-npm/COPYING
	cp ./dist/js/trezor-connect.*.js ./dist-npm/index.js
	cd ./dist-npm && npm publish
