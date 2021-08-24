#!/usr/bin/env bash

# set -euxo pipefail

CKSUM_BEFORE=$(cksum src/data/messages/messages.json)
git submodule update --init --recursive
./scripts/protobuf-build.sh
CKSUM_AFTER=$(cksum src/data/messages/messages.json)

echo "checksum before ./scripts/protobuf-build.sh $CKSUM_BEFORE"
echo "checksum after  ./scripts/protobuf-build.sh $CKSUM_AFTER"

if [[ $CKSUM_BEFORE != $CKSUM_AFTER ]]; then
  echo "protobuf-is-synced.sh: messages.json are not up to date (in sync with trezor-common)"
  exit 1
fi
