BIN=$(shell npm bin)
ENTRY=src/popup.js
TARGET=js/popup-dist.js
SOCKET_WORKER=node_modules/hd-wallet/lib/socketio-worker/inside.js
DISCOVERY_WORKER=node_modules/hd-wallet/lib/discovery/worker/inside/index.js
SOCKET_WORKER_TARGET=js/socket-worker-dist.js
DISCOVERY_WORKER_TARGET=js/discovery-worker-dist.js


.PHONY: build clean node_modules submodules

build: ${ENTRY} ${SOCKET_WORKER} ${DISCOVERY_WORKER} node_modules submodules coins-info
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

build-fast: 
	${BIN}/browserify ${ENTRY} \
		-g [ uglifyify ] \
		-d \
	| ${BIN}/exorcist ${TARGET}.map > ${TARGET}

coins-info:
	trezor-common/defs/coins/tools/build_coins.py

clean:
	rm -f ${TARGET} ${TARGET}.map
	rm -f ${TARGET_WORKER} ${TARGET_WORKER}.map

node_modules:
	yarn

submodules:
	git submodule update --init
