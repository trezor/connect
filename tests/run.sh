#!/bin/bash

set -e

function cleanup {
  echo "cleanup"
  
  # stop trezor-env container
  id=$(docker ps -aqf "name=connect-tests")
  echo "docker container id:"
  echo $id
  # show logs from container if exit conde !==0
  [ $id ] && docker stop $id
}

trap cleanup EXIT

echo "to run in ci use './run.sh ci'"

if [ "$1" = "ci" ]
then
  docker run --rm -d \
    --name connect-tests \
    -e SDL_VIDEODRIVER="dummy" \
    -p 9001:9001 \
    -p 21324:21324 \
    -p 21325:21325 \
    mroz22/trezor-user-env:beta
else
  xhost +
  docker run --rm -d \
    --name connect-tests \
    --ipc host \
    -e DISPLAY=$DISPLAY \
    -e QT_X11_NO_MITSHM=1 \
    -v /tmp/.X11-unix:/tmp/.X11-unix:rw \
    -p 9001:9001 \
    -p 21324:21324 \
    -p 21325:21325 \
    mroz22/trezor-user-env:beta
fi

yarn jest --config jest.config.integration.js --verbose --detectOpenHandles --forceExit --runInBand --bail

cleanup
