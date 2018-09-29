#!/usr/bin/env bash
set -e

cd `dirname $0`

docker build -t connect_build .
docker run -t -v $(pwd)/..:/original connect_build "./run_inside.sh"

