#!/usr/bin/env bash

fail=0

git fetch origin develop

# list all commits between HEAD and develop
for commit in $(git rev-list origin/develop..)
do
    COMMIT_ID=$(git log --pretty=format:'%H' -n 1 $commit)
    echo "Checking $commit"

    # 1. Checking if the commit is in develop"

    if [[ $(git merge-base --is-ancestor $COMMIT_ID HEAD | grep --only-matching "remotes/origin/develop") == "remotes/origin/develop" ]]; then
      continue
    fi

    fail=1
    echo "Last commit is not in develop!"
done

echo "ALL OK"
exit $fail
