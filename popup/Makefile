BIN=$(shell npm bin)
ENTRY=popup.js
TARGET=popup-dist.js

SOCKET_WORKER=node_modules/hd-wallet/lib/socketio-worker/inside.js
DISCOVERY_WORKER=node_modules/hd-wallet/lib/discovery/worker/inside/index.js
SOCKET_WORKER_TARGET=socket.worker.js
DISCOVERY_WORKER_TARGET=discovery.worker.js

.PHONY: build clean node_modules

build: ${ENTRY} ${SOCKET_WORKER} ${DISCOVERY_WORKER} node_modules
	${BIN}/browserify ${ENTRY} \
		-g [ uglifyify ] \
		-d \
	| ${BIN}/exorcist ${TARGET}.map > ${TARGET}
	${BIN}/browserify ${SOCKET_WORKER} \
		-g [ uglifyify ] \
		-d \
	| ${BIN}/exorcist ${SOCKET_WORKER}.map > ${SOCKET_WORKER_TARGET}
	${BIN}/browserify ${DISCOVERY_WORKER} \
		-g [ uglifyify ] \
		-d \
	| ${BIN}/exorcist ${DISCOVERY_WORKER}.map > ${DISCOVERY_WORKER_TARGET}
	cp trezor-crypto/emscripten/trezor-crypto.js trezor-crypto-dist.js

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
