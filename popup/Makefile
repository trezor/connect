BIN=`npm bin`
ENTRY=popup.js
TARGET=popup-dist.js

.PHONY: watch build clean

watch: ${ENTRY} node_modules
	${BIN}/watchify $< \
		-t [ babelify ] \
		-o ${TARGET} \
		-v

build: ${ENTRY} node_modules
	${BIN}/browserify $< \
		-t [ babelify --sourceMapRelative . ] \
		-g [ uglifyify ] \
		-d \
	| ${BIN}/exorcist ${TARGET}.map > ${TARGET}

clean:
	rm -f ${TARGET} ${TARGET}.map

node_modules:
	npm install
