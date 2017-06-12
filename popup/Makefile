BIN=$(shell npm bin)
ENTRY=popup.js
TARGET=popup-dist.js
ENTRY_WORKER=node_modules/hd-wallet/lib/socket-worker.js
TARGET_WORKER=socket-worker-dist.js

.PHONY: build clean node_modules

build: ${ENTRY} ${ENTRY_WORKER} node_modules
	${BIN}/browserify ${ENTRY} \
		-g [ uglifyify ] \
		-d \
	| ${BIN}/exorcist ${TARGET}.map > ${TARGET}
	${BIN}/browserify ${ENTRY_WORKER} \
		-g [ uglifyify ] \
		-d \
	| ${BIN}/exorcist ${TARGET_WORKER}.map > ${TARGET_WORKER}
	cp trezor-crypto/emscripten/trezor-crypto.js trezor-crypto-dist.js

clean:
	rm -f ${TARGET} ${TARGET}.map
	rm -f ${TARGET_WORKER} ${TARGET_WORKER}.map

node_modules:
	yarn
