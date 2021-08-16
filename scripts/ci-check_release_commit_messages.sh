#!/usr/bin/env bash

fail=0

git fetch origin develop

# list all commits between HEAD and develop
commit=$(git rev-list origin/develop..)

commit_id=$(git log --pretty=format:'%H' -n 1 $commit)
echo "Checking $commit"

# 1. Checking if the commit is in develop"

if [[ $(git merge-base --is-ancestor $commit_id HEAD | grep --only-matching "remotes/origin/develop") == "remotes/origin/develop" ]]; then
  continue
fi

fail=1
echo "Last commit is not in develop!"


echo "ALL OK"
exit $fail
