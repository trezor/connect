#!/bin/bash

set -e

function cleanup {
  echo "cleanup"
  
  # stop trezor-env container
  id=$(docker ps -aqf "name=connect-tests")
  echo "stopping container..."
  # show logs from container if exit conde !==0
  [ $id ] && docker stop $id
  [ $id ] && echo "stopped"
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
  yarn jest --config jest.config.integration.js --verbose --detectOpenHandles --forceExit --coverage $2
  exit 0
}

show_usage() {
    echo "Usage: run [OPTIONS] [ARGS]"
    echo ""
    echo "Options:"
    echo "  -g       Run tests with emulator graphical output"                                                           
    echo "  -f       Use specific firmware version, for example: 2.1.4., 2.3.0"
    echo "  -i       Included methods only, for example: applySettings,signTransaction"
    echo "  -e       All methods except excluded, for example: applySettings,signTransaction"
    echo "  -c       Collect coverage"

}

firmware='2.3.0'
included_methods=''
excluded_methods=''
gui_output=false
collect_coverage=false


OPTIND=1
while getopts ":i:e:f:hgc" opt; do
    case $opt in
        c) 
            collect_coverage=true
        ;;
        g)
            gui_output=true
        ;;
        f)
            firmware=$OPTARG
        ;;
        i) 
            included_methods=$OPTARG
        ;;
        e) 
            excluded_methods=$OPTARG
        ;;
        h) # Script usage
            show_usage
            exit 0
        ;;
        \?)
            echo "invalid option" $OPTARG
            exit 1
        ;;
    esac
done
shift $((OPTIND-1))

export TESTS_FIRMWARE=$firmware
export TESTS_INCLUDED_METHODS=$included_methods
export TESTS_EXCLUDED_METHODS=$excluded_methods


run $gui_output $collect_coverage