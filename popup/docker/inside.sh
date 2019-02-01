#!/bin/bash
set -ex
export LC_ALL=C

make node_modules
make build
