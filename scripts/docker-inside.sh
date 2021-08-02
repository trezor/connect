#!/bin/bash
set -ex
export LC_ALL=C

if [ "$1" == "npm" ]
    then
        yarn install
        yarn run build:npm
    else
        yarn install
        yarn run build:connect
fi
