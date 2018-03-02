/*global require, global, describe, it, beforeEach, expect, jasmine*/

import Trezor from '../js/entrypoints/connect';

describe('Initializing', async () => {
    'use strict';

    // initialize device
    try {
        await Trezor.init({
            //iframe_src: 'http://localhost:8081/iframe.html'
        })
    } catch(error) {
        throw error;
    }

    const handleUiEvent = (event) => {
        switch(event) {
            case 'ui_request_window' :
                Trezor.uiMessage({ type: 'popup_handshake' });
            break;
            case 'ui_request_permission' :
                Trezor.uiMessage({ type: 'ui_receive_permission', data: 'true' });
            break;
        }
    }

    it('Call function', async (done) => {

        await Trezor.getPublicKey({
            account: 0,
            confirmation: true
        });

        // let resp = { xpub: 1 };
        // expect(resp.xpub).toEqual(1);
        done();
    });

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
