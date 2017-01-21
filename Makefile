dist-%:
	git fetch --tags
	git checkout v$*
	mkdir dist-$*
	cp -r chrome dist-$*
	cp -r examples dist-$*
	mkdir dist-$*/popup
	cp popup/popup.css dist-$*/popup
	cp popup/popup.html dist-$*/popup
	cp popup/popup-dist.js dist-$*/popup
	cp popup/popup-dist.js.map dist-$*/popup
	cp popup/trezor-crypto-dist.js dist-$*/popup
	cp popup/socket-worker-dist.js dist-$*/popup
	cp popup/socket-worker-dist.js.map dist-$*/popup
	cp -r popup/img/ dist-$*/popup
	cp login_buttons.css dist-$*
	cat connect.js | sed 's/FILL_URL/https:\/\/connect.trezor.io/$*/' > dist-$*/connect.js
