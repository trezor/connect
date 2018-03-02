
import Trezor from '../js/index-npm';

// https://lazamar.github.io/testing-http-requests-with-jasmine/
//window.fetch = undefined;
import 'whatwg-fetch';
import 'jasmine-ajax';
var karmaJasmineAsync = require("karma-jasmine-async");

describe('TrezorConnect.js', () => {

    //karmaJasmineAsync(this);
    console.log("ASYNC", karmaJasmineAsync);
    // set up the async spec
    var async = new AsyncSpec(this);

    // run an async setup
  async.beforeEach(function(done){
    doSomething();

    // simulate async stuff and wait 10ms
    setTimeout(function(){

      // more code here
      doMoreStuff();

      // when the async stuff is done, call `done()`
      done();

    }, 10);
  });

  // run an async cleanup
  async.afterEach(function(done){
    // simulate async cleanup
    setTimeout(function(){

      done(); // done with the async stuff

    }, 10);
  });

  // run an async expectation
  async.it("did stuff", function(done){

    // simulate async code again
    setTimeout(function(){

      expect(1).toBe(1);

      // all async stuff done, and spec asserted
      done();

    });

  });

    /*
    // beforeEach(function(){
    //     jasmine.Ajax.install(); // this enables interception
    // });

    // afterEach(function(){
    //     jasmine.Ajax.uninstall(); // disables interceptions
    // })

    beforeEach(function() {
        spyOn(window, 'fetch').and.callThrough();
        //spyOn(window, 'fetch').and.callThrough();
        //WeatherService.fetchCurrentTemperature();
        //self.fetch.polyfill = true
    });

    it('should add two numbers', () => {
        // const calculator = new Calculator();
        // const sum = calculator.add(5, 2);
        // expect(sum).toBe(7);

        //expect(window.fetch).toHaveBeenCalledWith('someweatherapi.com');


        Trezor.init({
            debug: false,
            //configUrl:
        }).then(() => {
            console.log("INITED!");
        }).catch(err => {
            console.log("ERO", err);
        })

        // setTimeout( function() {
        //     Trezor.getXPub({
        //         //selectedDevice: _selectedDevice,
        //         account: 0,
        //         coin: 'Bitcoin'
        //     })
        //     .then(function(resp) {
        //         console.log("RESP", resp)
        //     })
        //     .catch(function(e){
        //         console.log("E!", e);
        //     });
        // }, 2000)



    });
    */

//   it('should substract two numbers', () => {
//     const calculator = new Calculator();
//     const sub = calculator.sub(5, 2);
//     expect(sub).toBe(3);
//   });
});
