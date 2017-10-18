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
	git fetch
	git checkout $*
	make .copy-$*-`git rev-parse --short HEAD`

dist-stable-v%:
	git fetch
	git checkout v$*
	make .copy-$*

.copy-%:
	mkdir -p dist/$*
	cp -r chrome dist/$*
	cp -r examples dist/$*
	mkdir dist/$*/popup
	mkdir dist/$*/popup/js
	mkdir dist/$*/popup/css
	mkdir dist/$*/popup/img
	cp popup/config_signed.bin dist/$*/popup
	cp popup/coins.json dist/$*/popup
	cp popup/popup.html dist/$*/popup
	cp login_buttons.css dist/$*
	cp connect.js dist/$*/connect.js
	cp -r popup/js dist/$*/popup/
	cp -r popup/css dist/$*/popup/
	cp -r popup/img dist/$*/popup/
	

sync-stable-v%:
	make .sync-$*

sync-rolling-%:
	make .sync-$*-`git rev-parse --short HEAD`

.sync-%:
	# Before first use: Install awscli (pip install awscli)
	#   Configure access credentials (aws configure), region is "eu-central-1"
	aws s3 sync --delete dist/$* s3://connect.trezor.io/$*/
