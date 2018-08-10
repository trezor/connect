#!/usr/bin/env bash

set -ex
export LC_ALL=C

# Note - this is run INSIDE the docker - don't run outside 

cd /original

git submodule sync
git submodule update --recursive --init
#GITREV=$(git rev-parse HEAD)
#echo $GITREV > app/revision.txt

make build
exit 0
