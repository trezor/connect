var fs = require('fs');
var path = require('path');

// remove fields from hd-wallet/package.json
// var hdWallet = path.resolve(__dirname, '../../hd-wallet/package.json');
// try {
//     var hdWalletPackageJSON = require(hdWallet);
//     delete hdWalletPackageJSON.browserify;
//     delete hdWalletPackageJSON['browserify-shim'];
//     fs.writeFileSync(hdWallet, JSON.stringify(hdWalletPackageJSON, null, '  '));

//     // override
//     var hook = path.resolve(__dirname, '../__hooks/engine.io-websocket.js');
//     var hooked = path.resolve(__dirname, '../../engine.io-client/lib/transports/websocket.js');
//     fs.readFile(hook, 'utf-8', (error, data) => {
//         if (error) {
//             console.error('_hooks/engine.io-websocket.js read error', error);
//             return;
//         }
//         fs.writeFile(hooked, data, (err) => {
//             if (err) {
//                 console.error('engine.io-client override error', error);
//             }
//         });
//     });
// } catch (error) {
//     console.error('hd-wallet override error', error.message);
// }

console.log(process.env)
