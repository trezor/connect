#!/usr/bin/env bash

set -euxo pipefail

SRC='./submodules/trezor-common/protob'
DIST='./src/data/messages'

if [ $# -ge 1 ] && [ "$1" == "local" ]
    then
        SRC='../trezor-firmware/common/protob'
fi

# BUILD combined messages.proto file from protobuf files
# this code was copied from ./submodules/trezor-common/protob Makekile
# clear protobuf syntax and remove unknown values to be able to work with proto2js
echo 'syntax = "proto2";' > $DIST/messages.proto
echo 'import "google/protobuf/descriptor.proto";' >> $DIST/messages.proto
echo "Build proto file from $SRC"
grep -hv -e '^import ' -e '^syntax' -e '^package' -e 'option java_' $SRC/messages*.proto \
| sed 's/ hw\.trezor\.messages\.common\./ /' \
| sed 's/ common\./ /' \
| sed 's/ management\./ /' \
| sed 's/^option /\/\/ option /' \
| grep -v '    reserved '>> $DIST/messages.proto

# BUILD messages.json from message.proto
./node_modules/.bin/pbjs -t json -p $DIST -o $DIST/messages.json --keep-case messages.proto
rm $DIST/messages.proto

# BUILD types
# build flowtype definitions
node ./scripts/protobuf-types.js

# build typescript definitions
node ./scripts/protobuf-types.js typescript

# eslint fix is required for flowtype since prettier uses comma as delimiter (default is semicolon)
yarn eslint ./src/js/types/trezor/protobuf.js --fix
# check flowtype
yarn flow
