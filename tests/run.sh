#!/usr/bin/env bash

# This script allows you to run Connect tests locally. It spins up trezor-user-env
# which the tests need to launch emulator and other things. Gitlab does not run
# this script, because the tests run inside the trezor-user-env docker container
# directly.

set -e

function cleanup() {
  echo "Cleaning up"
  echo "Stopping container with an ID $id"
  # uncomment to show logs from container, useful for debugging
  # docker logs $id
  docker stop "$id" && echo "Stopped"
}

trap cleanup EXIT

run() {
  # fetch latest image, can be commented out if you do not need latest master
  echo "Pulling latest trezor-user-env"
  docker pull registry.gitlab.com/satoshilabs/trezor/trezor-user-env/trezor-user-env

  if [ $GUI = false ]; then
    id=$(
      docker run -d \
        -e SDL_VIDEODRIVER="dummy" \
        -p "9001:9001" \
        -p "21326:21326" \
        -p "21325:21326" \
        registry.gitlab.com/satoshilabs/trezor/trezor-user-env/trezor-user-env \
        "/trezor-user-env/run.sh"
    )
    echo "Running docker container with an ID:"
    echo "$id"

  else
    xhost +
    id=$(
      docker run -d \
        -e DISPLAY=:0 \
        --network host \
        -p "9001:9001" \
        -p "21326:21326" \
        -p "21325:21326" \
        registry.gitlab.com/satoshilabs/trezor/trezor-user-env/trezor-user-env \
        "/trezor-user-env/run.sh"
    )

    # TODO: try for Mac:
    # -e DISPLAY=docker.for.mac.host.internal:0 instead of DISPLAY=:0
    # TODO: I don't think these options are needed:
    # -v /tmp/.X11-unix:/tmp/.X11-unix:rw \
    # -e QT_X11_NO_MITSHM=1 \

    echo "Running docker container with a GUI support with ID:"
    echo "$id"
  fi

  echo "Waiting for the trezor-user-env to load up"
  sleep 10

  echo "Running yarn"
  yarn jest --config jest.config.integration.js --verbose --detectOpenHandles --forceExit --coverage $COVERAGE
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

FIRMWARE='2.3.4'
INCLUDED_METHODS=''
EXCLUDED_METHODS=''
GUI=false
COVERAGE=false

OPTIND=1
while getopts ":i:e:f:hgc" opt; do
  case $opt in
  c)
    COVERAGE=true
    ;;
  g)
    GUI=true
    ;;
  f)
    FIRMWARE=$OPTARG
    ;;
  i)
    INCLUDED_METHODS=$OPTARG
    ;;
  e)
    EXCLUDED_METHODS=$OPTARG
    ;;
  h) # Script usage
    show_usage
    exit 0
    ;;
  \?)
    echo "invalid option $OPTARG"
    exit 1
    ;;
  esac
done
shift $((OPTIND - 1))

export TESTS_FIRMWARE=$FIRMWARE
export TESTS_INCLUDED_METHODS=$INCLUDED_METHODS
export TESTS_EXCLUDED_METHODS=$EXCLUDED_METHODS

run
