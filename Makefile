clean:
	rm -rf dist/

dist-%:
	git fetch --tags
	git checkout v$*
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

sync-%:
	# Before first use: Install awscli (pip install awscli)
	#   Configure access credentials (aws configure), region is "eu-central-1"
	aws s3 sync --delete dist/$* s3://connect.trezor.io/$*/
