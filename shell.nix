with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "trezor-connect-dev";
  buildInputs = [
    autoPatchelfHook
    nodejs-12_x
    (yarn.override { nodejs = nodejs-12_x; })
  ];
  shellHook = ''
    export PATH="$PATH:$(pwd)/node_modules/.bin"
    autoPatchelf $(pwd)/node_modules/flow-bin/
  '';
}
