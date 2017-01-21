#!/bin/bash

# Before first use:
# Install awscli (pip install awscli)
# Configure access credentials (aws configure), region is "eu-central-1"

api_version=1
bucket=connect.trezor.io

set -e
cd `dirname $0`

aws s3 sync --exclude ".git*" . s3://$bucket/$api_version/

echo "DONE"
