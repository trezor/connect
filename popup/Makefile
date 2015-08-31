BIN=`npm bin`
ENTRY=popup.js
TARGET=popup-dist.js

.PHONY: watch build clean

watch: ${ENTRY} node_modules
	${BIN}/watchify $< -v -o ${TARGET}

build: ${ENTRY} node_modules
	${BIN}/browserify $< -d -g uglifyify \
		| ${BIN}/exorcist ${TARGET}.map > ${TARGET}

clean:
	rm -f ${TARGET}

node_modules:
	npm install
