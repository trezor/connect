#!/bin/bash
set -e
cd "$(dirname "$0")"

# find and remove previous containers
docker ps -a -q --filter "name=trezor-connect" | grep -q . && docker stop trezor-connect && docker rm -fv trezor-connect
# run docker build
docker build -t trezor-connect ../
# expose ports for copying files to local file system
docker run -p 8080:8080 --name trezor-connect trezor-connect:latest
# remove previous build from local file system
# and copy new one from docker
rm -rf ../build
docker cp trezor-connect:/trezor-connect-v4/js ../
# cleanup
docker stop trezor-connect
docker rm trezor-connect

