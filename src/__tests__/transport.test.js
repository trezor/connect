/*global require, global, describe, it, beforeEach, expect, jasmine*/

//import Trezor from '../js/entrypoints/connect';

describe('Initializing', async () => {

    let defaultTimeout;
    beforeEach(() => {
        defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;

        const handleUiEvent = (event) => {
            // console.log("ui event", event)
            // switch(event) {
            //     case 'ui_request_window' :
            //         Trezor.uiMessage({ type: 'popup_handshake' });
            //     break;
            //     case 'ui_request_permission' :
            //         Trezor.uiMessage({ type: 'ui_receive_permission', data: 'true' });
            //     break;
            // }
        }

        const handleDeviceEvent = (event) => {
            // console.log("device event", event)
        }



        // Trezor.on('UI_EVENT', handleUiEvent);
        // Trezor.on('DEVICE_EVENT', handleDeviceEvent);
        //

    });


    // it('TrezorConnect.init timeout', async (done) => {

    //     try {
    //         await Trezor.init({
    //             iframe_src: 'https://wrong-domain.trezor.io/iframe.html',
    //             popup_src: 'https://sisyfos.trezor.io/popup.html',
    //             webusb: false,
    //         });
    //     } catch(error) {
    //         done();
    //     }

    // });


    // // initialize connect
    // it('TrezorConnect.init', async (done) => {

    //     try {

    //         const handleTransportEvent = (event) => {
    //             console.log("transport event", event)
    //             Trezor.off('TRANSPORT_EVENT', handleTransportEvent);
    //             expect(event.type).toBe('transport__start');
    //             done();
    //         }
    //         Trezor.on('TRANSPORT_EVENT', handleTransportEvent);

    //         await Trezor.init({
    //             iframe_src: 'https://sisyfos.trezor.io/iframe.html',
    //             popup_src: 'https://sisyfos.trezor.io/popup.html',
    //             webusb: false,
    //             debug: true
    //         });
    //     } catch(error) {
    //         throw error;
    //     }

    // });



    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout;
    });


    // it('TrezorConnect.getPublicKey', async (done) => {

    //     let resp = await Trezor.cipherKeyValue({
    //         path: "m/1'/2'/3'",
    //         key: "My key",
    //         value: "1c0ffeec0ffeec0ffeec0ffeec0ffee1",
    //         encrypt: true,
    //         askOnEncrypt: true,
    //         askOnDecrypt: true,
    //         useEmptyPassphrase: true,
    //         override: true
    //     });

    //     console.log("TEST 22222", resp)

    //     // let resp = { xpub: 1 };
    //     // expect(resp.xpub).toEqual(1);
    //     done();
    // });

    //it('Get public key', async (done) => {

        //console.log("ELOOOO")

        // try {
            // await Trezor.init({
            //     iframe_src: 'http://localhost:8081/iframe.html',
            //     popup_src: 'http://localhost:8081/popup.html'
            // });

            // Trezor.on('UI_EVENT', handleUiEvent);

            // Trezor.on('DEVICE_EVENT', async (e) =>{
            //     console.log("---dev event!!!", e)
            //     if (e.type === 'device-connect_unacquired' || e.type === 'device-connect') {

            //         const resp = await Trezor.getPublicKey({
            //             account: 0,
            //             confirmation: true
            //         });
            //     }
            // })

            // Trezor.on('device-connect', async () => {


            //     const resp = await Trezor.getPublicKey({
            //             account: 0,
            //             confirmation: false
            //     });

            //     console.log("ELOOOOO!", resp)

            //     expect(resp.xpub).toEqual('xpub6D6yNFXJDMMP7VZtiByQSShqFKzFboV5UZjGG7TjLn8eBj9sAqPALEUx8VWFXgsia411CJL8Bnk9KUwCQYm9tUGkH1AGWzNJsugXXnT2Tef');

            //     done();
            // });

        // } catch(error) {

        // }
    //});

    // No transport
    // Iframe error

    // it('Get public key2', async (done) => {


    //         // await Trezor.init();

    //         // Trezor.on('UI_EVENT', handleUiEvent);

    //         // Trezor.on('device_connect', async () => {

    //         //     const resp = await Trezor.getPublicKey({
    //         //         account: 1,
    //         //         confirmation: false
    //         //     });

    //         //     expect(resp.xpub).toEqual('pub6D6yNFXJDMMP7VZtiByQSShqFKzFboV5UZjGG7TjLn8eBj9sAqPALEUx8VWFXgsia411CJL8Bnk9KUwCQYm9tUGkH1AGWzNJsugXXnT2Tef');

    //         //     done();
    //         // });


    // });



    // TODO: make sure that device is disconnected
    // will be connected after trezor init
    // it('should connect and get device event', function (done) {
    //     Trezor.init({
    //         //configUrl:
    //     }).then(() => {
    //         console.log("INITED!");
    //         //done();
    //     }).catch(err => {
    //         console.log("ERO", err);
    //     });
    // });

});
