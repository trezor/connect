#!/usr/bin/env bash

set -euxo pipefail
cd "$(dirname "$0")"

IMAGE="trezor-connect"
DIST="build"
if [ $# -ge 1 ] && [ "$1" == "npm" ]
    then
        DIST="npm"
fi
if [ $# -ge 1 ] && [ "$1" == "npm-extended" ]
    then
        DIST="npm-extended"
fi

# find and remove previous containers
docker ps -a -q --filter "name=$IMAGE" | grep -q . && docker stop $IMAGE && docker rm -fv $IMAGE
# run docker build
docker build -t $IMAGE ../ --build-arg target=$DIST
# expose ports for copying files to local file system
docker run -p 8080:8080 --name $IMAGE $IMAGE:latest
# remove previous build from local file system
rm -rf ../$DIST
# and copy new one from docker
docker cp $IMAGE:/trezor-connect/$DIST ../
# cleanup
docker stop $IMAGE
docker rm $IMAGE
