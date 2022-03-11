#!/usr/bin/env bash

set -euxo pipefail

# BUILD types
# build flowtype definitions
node ./scripts/protobuf-types.js

# build typescript definitions
node ./scripts/protobuf-types.js typescript

# eslint fix is required in both flowtype and typescript (comma delimiter, tabs, spaces)
yarn eslint ./src/*/types/trezor/protobuf.* --fix

# check new types
yarn flow
yarn typescript
