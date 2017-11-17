BIN=$(shell npm bin)
ENTRY=src/popup.js
TARGET=js/popup-dist.js
SOCKET_WORKER=node_modules/hd-wallet/lib/socketio-worker/inside.js
DISCOVERY_WORKER=node_modules/hd-wallet/lib/discovery/worker/inside/index.js
SOCKET_WORKER_TARGET=js/socket-worker-dist.js
DISCOVERY_WORKER_TARGET=js/discovery-worker-dist.js
TREZOR_CRYPTO=trezor-crypto/emscripten/trezor-crypto.js
TREZOR_CRYPTO_TARGET=js/trezor-crypto-dist.js
COINS_JSON=trezor-common/coins.json
COINS_JSON_TARGET=coins.json


.PHONY: build clean node_modules submodules

build: ${ENTRY} ${SOCKET_WORKER} ${DISCOVERY_WORKER} node_modules submodules
	${BIN}/browserify ${ENTRY} \
		-g [ uglifyify ] \
		-d \
	| ${BIN}/exorcist ${TARGET}.map > ${TARGET}
	${BIN}/browserify ${SOCKET_WORKER} \
		-g [ uglifyify ] \
		-d \
	| ${BIN}/exorcist ${SOCKET_WORKER_TARGET}.map > ${SOCKET_WORKER_TARGET}
	${BIN}/browserify ${DISCOVERY_WORKER} \
		-g [ uglifyify ] \
		-d \
	| ${BIN}/exorcist ${DISCOVERY_WORKER_TARGET}.map > ${DISCOVERY_WORKER_TARGET}
	cp ${TREZOR_CRYPTO} ${TREZOR_CRYPTO_TARGET}
	cp ${COINS_JSON} ${COINS_JSON_TARGET}

build-fast: 
	${BIN}/browserify ${ENTRY} \
		-g [ uglifyify ] \
		-d \
	| ${BIN}/exorcist ${TARGET}.map > ${TARGET}

clean:
	rm -f ${TARGET} ${TARGET}.map
	rm -f ${TARGET_WORKER} ${TARGET_WORKER}.map

node_modules:
	yarn

submodules:
	git submodule update --init
