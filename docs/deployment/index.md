# Deploying Connect

_Written by @szymonlesisz, checked by @tsusanka._


## Creating new minor version

1. Go to develop branch.
1. Make sure that CHANGELOG is up to date, usually it is not so walk thru commits and update it.
1. Run `make version-patch` - this will update version number in multiple files.
1. Commit these changes with the Changelog changes into `develop` with message "version X.X.X" ([example commit](https://github.com/trezor/connect/commit/d28e506524bc666757715294f7d030ea1a1d6eef)).
1. Prepare PR from `develop` to `v8` branch, paste changelog as description and tag @prusnak or @tsusanka ([example PR](https://github.com/trezor/connect/pull/812)).
1. Review and merge.


## Deploying
After the merge we deploy it to connect.trezor.io. You of course need access rights to AWS.

1. `git checkout v8`
1. `make clean`
1. `make build`
1. `make sync-8`


## Updating NPM

### Production

1. After Connect is deployed it is time to publish it in to npm [1]
1. `yarn build:npm` - build official library (lightweight for 3rd party)
1. `cd ./npm` - go to build
1. `npm publish` - publish official build
1. `cd ../` - go back
1. `yarn build:npm-extended` - build extended library (full for us)
1. `cd ./npm-extended`
1. `npm publish --tag extended` - publish extended build

[1] Make sure that you do have npm account and access to write to trezor-connect package.

### Beta

If you want to publish to npm as `beta` (from any branch, production release is not required) do the following:

1. `yarn build:npm-extended`
1. `cd ./npm-extended`
1. `vim package.json`, manually change version from `8.X.X-extended` to `8.X.(X + 1)-beta.1` [2]
1. `npm publish --tag beta`

[2] Versioning in npm is sensitive and cannot be reverted. Once you publish a version it is "gone" forever.
For example if the current version is `8.1.27` and you publish `8.1.28` by mistake with custom `beta` tag the next official version will have to be `8.1.29`
This is why the suffix `8.1.27-beta.[number]` in published package.json is important. You can do another releases with `-beta.2` `-beta.3` etc. instead of bumping real version patch number.
