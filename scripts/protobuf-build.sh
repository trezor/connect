#!/usr/bin/env bash

set -euxo pipefail

# use @trezor/transport script to generate flow definitions based on messages.json
node ./node_modules/@trezor/transport/scripts/protobuf-types flow

# copy generated protobuf.js into trezor-connect project
cp -f ./node_modules/@trezor/transport/protobuf.js ./src/js/types/trezor
# copy files from @trezor/transport to trezor-connect
cp -f ./node_modules/@trezor/transport/protobuf.d.ts ./src/ts/types/trezor

# eslint fix is required in flowtype
yarn eslint ./src/*/types/trezor/protobuf.* --fix

# check new types
yarn flow
