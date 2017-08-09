# for stable (numbered) versions:
# make dist-stable-v1 && make sync-stable-v1
# the result is on connect.trezor.io/1

# for rolling versions:
# make dist-rolling-claim-bch && make sync-rolling-claim-bch
# the result is on connect.trezor.io/claim-bch-ce179c9
# ce179c9 is first 7 letters from the hash of the commit (what github etc shows)

clean:
	rm -rf dist/

dist-rolling-%:
	git tag -d `git tag` #delete all local tags to prevent use of tag
	git fetch
	git checkout $*
	make .copy-$*-`git rev-parse --short HEAD`

dist-stable-v%:
	git tag -d `git tag` #delete all local tags to prevent use of tag
	git fetch
	git checkout v$*
	make .copy-$*

.copy-%:
	mkdir -p dist/$*
	cp -r chrome dist/$*
	cp -r examples dist/$*
	mkdir dist/$*/popup
	cp popup/config_signed.bin dist/$*/popup
	cp popup/popup.css dist/$*/popup
	cp popup/popup.html dist/$*/popup
	cp popup/popup-dist.js dist/$*/popup
	cp popup/popup-dist.js.map dist/$*/popup
	cp popup/trezor-crypto-dist.js dist/$*/popup
	cp popup/socket-worker-dist.js dist/$*/popup
	cp popup/socket-worker-dist.js.map dist/$*/popup
	cp -r popup/img/ dist/$*/popup
	cp login_buttons.css dist/$*
	cp connect.js dist/$*/connect.js

sync-stable-v%:
	make .sync-$*

sync-rolling-v%:
	make .sync-$*-`git rev-parse --short HEAD`

.sync-%:
	# Before first use: Install awscli (pip install awscli)
	#   Configure access credentials (aws configure), region is "eu-central-1"
	aws s3 sync --delete dist/$* s3://connect.trezor.io/$*/
