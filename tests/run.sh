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

run() {
  if [ $1 = false ]
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
}

show_usage() {
    echo "Usage: run [OPTIONS] [ARGS]"
    echo ""
    echo "Options:"
    echo "  -t \"<,TEST_NAME/SUBTEST_NAME>\"      Run specified tests/subtest"
    echo "  -x \"<,TEST_NAME>\"                   Run all but specified tests"
}

# Show help if no option provided
if [ $# -eq 0 ]; then
    show_usage
fi;

firmware=''
gui_output=false

OPTIND=1
while getopts ":f:h:g" opt; do
    case $opt in
        g) # GUI output
            gui_output=true
        ;;
        f) # Firmware version
            echo "f"
            echo $OPTARG
            firmware=$OPTARG
        ;;
        h) # Script usage
            show_usage
        ;;
        \?)
            echo "invalid option" $OPTARG
            exit 1
        ;;
    esac
done
shift $((OPTIND-1))

export TESTS_FIRMWARE=$firmware

run $gui_output