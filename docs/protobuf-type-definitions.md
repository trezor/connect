# From Protobuf to TypeScript and Flow

This document describes how the definitions of protobuf messages maintained in the
firmware repo are semi-automatically translated to Flow and TypeScript definitions that are used in Connect codebase and by Connect users respectively.

## The Pipeline

The beginning and source of truth are the `.proto` definitions in the [firmware repository](https://github.com/trezor/trezor-firmware/tree/master/common/protob). These are duplicated as read-only in the [trezor-common](https://github.com/trezor/trezor-common) repository.

`trezor-common` is included in Connect as a git submodule mounted at `submodules/trezor-common`.

Here, `.proto` definitions are translated to a JSON format using [proto2js](https://www.npmjs.com/package/proto2js) package. This JSON is used on runtime by the [trezor-link](https://github.com/trezor/trezor-link/) (de)serialization logic and to generate the Flow and Typescript definitions.

The JSON is transformed to Flow and/or TypeScript definitions by a script in `scripts/protobuf-types.js`. The script also applies 'patches' I.e. after-the-fact fixes manually described in `scripts/protobuf-patches.js`. The patches compensate for/fix
- The source `.proto` definitions that do not reflect the actual business logic. Usually fields marked as required which are in fact optional.
- Fields typed as `uint32`, `uint64`, `sint32`, `sint64` in protobuf that need to be represented as strings in runtime because of javascript number's insufficient range. Runtime conversion is handled automatically by `trezor-link`.
- Similarly, fields typed as `bytes` in protobuf may be represented as hexadecimal `string`, `Buffer`, `Uint8Array` or `Array<number>` in runtime.
- Optional protobuf fields that get typed as `<T> | undefined` but are in fact deserialized as `<T> | null`. This could be handled globally by `trezor-link`. The patches exist mainly for historical reasons.

All these steps are done manually and all the generated files are tracked in git. It's also not uncommon to circumvent
some step by eg. generating the messages.json file not from the Common submodule but directly from the firmware repo.

## Example

```bash
# Clone the connect repo.
git clone git@github.com:trezor/connect.git
cd connect
# Fetch all git submodules.
git submodule update --init --recursive
# Install the node modules - including the `proto2js` package required in the next step.
yarn
# Transform the .proto definitions to JSON.
# Generate Flow and TypeScript definitions.
./scripts/protobuf-build.sh
```