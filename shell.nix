with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "trezor-connect-dev";
  buildInputs = [
    nodejs-12_x
    (yarn.override { nodejs = nodejs-12_x; }) 
  ];
  shellHook = ''
    export PATH="$PATH:$(pwd)/node_modules/.bin"
  '';
}
