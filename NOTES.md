* yarn:test --detectOpenHandles --forceExit are mandatory otherwise fetch to bridge (DescriptorStream) will hang up the process (TODO: fix in trezor-link)


https://firmware.corp.sldev.cz/upgrade_tests/

MacOS build FW TT binary:
- brew update
- brew install px4/px4/gcc-arm-none-eabi
- PYOPT=0 make build_unix_frozen