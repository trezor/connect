#!/usr/bin/env bash

# This script runs trezor-connect tests.
# It spins up trezor-user-env and sets required evironment variables.

set -euo pipefail

USER_ENV_IMAGE="ghcr.io/trezor/trezor-user-env"

cleanup() {
  if [ -n "${dockerID-}" ]; then
    echo "Stopping container with an ID $dockerID"
    "$DOCKER_PATH" stop "$dockerID" && echo "trezor-user-env stopped"
  fi
}

trap cleanup EXIT

# Running standalone instance of trezor-user-env
# docker run -it -e SDL_VIDEODRIVER="dummy" -p "9001:9001" -p "21326:21326" -p "21325:21326" registry.gitlab.com/satoshilabs/trezor/trezor-user-env/trezor-user-env

# Tweaking trezor-user-env locally
# docker run -it -e SDL_VIDEODRIVER="dummy" -p "9001:9001" -p "21326:21326" -p "21325:21326" registry.gitlab.com/satoshilabs/trezor/trezor-user-env/trezor-user-env nix-shell
# do your changes using `vi` and run:
# [nix-shell:/trezor-user-env]# ./run.sh

# Ports
# 9001  - websocket server, communication test case > user-env (setup etc...)
# 21326 - trezord proxy. beacuse of trezord CORS check
# 21325 - original trezord port redirected to trezor-user-env proxy

runDocker() {
  echo "Pulling latest trezor-user-env"
  "$DOCKER_PATH" pull "$USER_ENV_IMAGE"
  # `--rm` flag will automatically delete container when done
  dockerID=$(
    "$DOCKER_PATH" run -d --rm \
      -e SDL_VIDEODRIVER="dummy" \
      -p "9001:9001" \
      -p "21326:21326" \
      -p "21325:21326" \
      "$USER_ENV_IMAGE"
  )
  "$DOCKER_PATH" logs -f "$dockerID" &
  echo "Running docker container with ID $dockerID"
}

show_usage() {
  echo "Usage: run [OPTIONS] [ARGS]"
  echo ""
  echo "Options:"
  echo "  -c       Disable backend cache. default: enabled"
  echo "  -d       Disable docker. Useful when running own instance of trezor-user-env. default: enabled"
  echo "  -D PATH  Set path to docker executable. Can be replaced with `podman`. default: docker"
  echo "  -e       All methods except excluded, example: applySettings,signTransaction"
  echo "  -f       Use specific firmware version, example: 2.1.4, 1.8.0 default: 2-master"
  echo "  -i       Included methods only, example: applySettings,signTransaction"
  echo "  -s       actual test script. default: 'yarn test:integration'"
}

# default options
FIRMWARE=""
INCLUDED_METHODS=""
EXCLUDED_METHODS=""
DOCKER=true
DOCKER_PATH="docker"
TEST_SCRIPT="yarn test:integration"
USE_TX_CACHE=true
USE_WS_CACHE=true

# user options
OPTIND=1
while getopts ":i:e:f:s:D:hdc" opt; do
  case $opt in
  d)
    DOCKER=false
    ;;
  D)
    DOCKER_PATH="$OPTARG"
    ;;
  c)
    USE_TX_CACHE=false
    USE_WS_CACHE=false
    ;;
  s)
    TEST_SCRIPT=$OPTARG
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

# export essential process.env variables
export TESTS_FIRMWARE=$FIRMWARE
export TESTS_INCLUDED_METHODS=$INCLUDED_METHODS
export TESTS_EXCLUDED_METHODS=$EXCLUDED_METHODS
export TESTS_USE_TX_CACHE=$USE_TX_CACHE
export TESTS_USE_WS_CACHE=$USE_WS_CACHE

run() {
  if [ $DOCKER = true ]; then
    runDocker
  fi

  TESTS_FIRMWARE=$(node ./tests/get-latest-firmware.js)

  echo "Running ${TEST_SCRIPT}"
  echo "  Firmware: ${TESTS_FIRMWARE}"
  echo "  Included methods: ${INCLUDED_METHODS}"
  echo "  Excluded methods: ${EXCLUDED_METHODS}"
  echo "  TxCache: ${USE_TX_CACHE}"
  echo "  WsCache: ${USE_WS_CACHE}"

  # run actual test script
  ${TEST_SCRIPT}
}

run
