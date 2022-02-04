# the last successful build of nixpkgs-unstable as of 2021-11-16 compatible to trezor-suite
with import
  (builtins.fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/5cb226a06c49f7a2d02863d0b5786a310599df6b.tar.gz";
    sha256 = "0dzz207swwm5m0dyibhxg5psccrcqfh1lzkmzzfns27wc4ria6z3";
  })
{ };

stdenv.mkDerivation {
  name = "trezor-connect-dev";
  buildInputs = [
    autoPatchelfHook
    xorg.xhost
    ncurses
    nodejs
    yarn
    git
  ];
  shellHook = ''
    export CHROME_BIN=/run/current-system/sw/bin/chromium
    export FIREFOX_BIN=/run/current-system/sw/bin/firefox
    export PATH="$PATH:$(pwd)/node_modules/.bin"
    autoPatchelf $(pwd)/node_modules/flow-bin/
  '';
}
