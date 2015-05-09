#TREZOR Connect API

Connect is a platform for easy integration of TREZOR into 3rd party services.

##Login

Easy Login Dialog via TREZOR.
To use it include the following in your site and adapt the `trezorLogin` function.

```html
<script type="text/javascript">
function trezorLogin(response) {
	if (response.success) {
		alert('success:\n\n' + JSON.stringify(response));
	} else {
		alert('failure:\n\n' + JSON.stringify(response));
	}
}
</script>

...

<trezor:login callback="trezorLogin" icon="http://coinmap.org/img/logo_square.png">
</trezor:login>

<!--
// You can use custom hidden/visual challenges (i.e. not generated
// by Connect) by setting the challenge_hidden/challenge_visual
// attributes of the trezor:login tag.
// This can be done either on the server side while rendering
// the page contents like this:

<trezor:login callback="trezorLogin"
              challenge_hidden="0123456789abcdef"
              challenge_visual="Lorem Ipsum"
              icon="http://coinmap.org/img/logo_square.png">
</trezor:login>

// ... or using the following script on the client side:

<script>
var elements = document.getElementsByTagName('trezor:login');
var e = elements[0];
e.setAttribute('challenge_hidden', '0123456789abcdef');
e.setAttribute('challenge_visual', 'Lorem Ipsum');
</script>
-->

...

<script src="https://trezor.github.io/connect/login.js" type="text/javascript"></script>
```

The `<trezor:login>` tag will be translated into the following button:

![login button](https://raw.githubusercontent.com/trezor/connect/gh-pages/docs/login_button.png)

When user clicks on the button, the following dialog windows will popup:

![login dialog](https://raw.githubusercontent.com/trezor/connect/gh-pages/docs/login_dialog.png)

and TREZOR will show the following confirmation screen:

![login trezor](https://raw.githubusercontent.com/trezor/connect/gh-pages/docs/login_trezor.jpg)

If user confirms the action, the device will return the login structure described below.
Challenge fields are copied from request, the rest is returned from TREZOR.

```javascript
{
  "success": true,
  "challenge_hidden": "aaa3d9fb398428c72254c83b5ef020663d8bff43324187295865965c1bf51160",
  "challenge_visual": "2015-03-12 17:32:26",
  "address": "1JZuZ6Ttk4Wv7B98M5cF6GswMqGSHnUZ2J",
  "public_key": "02134ba0f19c15d41193184f96e444f5903935de726e0433aeae16e446b07129e4",
  "signature":"20fa9e8db27700b6784cf270292b8b7fddd1d126346066c286b02ccf951d9fa3141a6b0528bfc87605c940c491c1f58ccfd7350775df2fd973dcf096415db3f0d7"
}
```

Service backend needs to concatenate the `challenge_hidden` (translated to binary) and `challenge_visual` fields into the message and check whether the signature matches its contents against the `public_key`/`address`.

If that is the case, the backend either creates an account (if the `public_key`/`address` identity is seen for the first time) or signs in the user (if the `public_key`/`address` identity is already a known user).

In case the error is encountered, the contents of the response will be:

```javascript
{
  "success": false,
  "error": "String description of the error"
}
```

To understand the full mechanics, please consult the Challenge-Response chapter of
[SLIP-0013: Authentication using deterministic hierarchy](http://doc.satoshilabs.com/slips/slip-0013.html).

##Server side

Here is the reference implementation of the server-side signature verification written in various languages:

###Python

Dependencies: https://pypi.python.org/pypi/bitcoin >= 1.1.27

```python
import binascii
import hashlib
import base64
import bitcoin

def verify(challenge_hidden, challenge_visual, pubkey, signature):
    message = binascii.unhexlify(challenge_hidden) + challenge_visual
    signature_b64 = base64.b64encode(binascii.unhexlify(signature))
    return bitcoin.ecdsa_verify(message, signature_b64, pubkey)

def main():
    challenge_hidden = "cd8552569d6e4509266ef137584d1e62c7579b5b8ed69bbafa4b864c6521e7c2"
    challenge_visual = "2015-03-23 17:39:22"
    pubkey = "020cbccdc85ef2ce4718e46bc20ca9e50025de12b4e7900d1085152a52ebfc2590"
    signature = "2063f0a4ea00bf412b3526fbc0bc1e3850c8597d56e73bc748fa9d315114061fe522f250687188312df56ac5ed84bfc627ee9136c258ffaedaa6613542b340d81c"
    print verify(challenge_hidden, challenge_visual, pubkey, signature)

if __name__ == '__main__':
    main()
```

###PHP

Dependencies: https://github.com/BitcoinPHP/BitcoinECDSA.php

```php
<?php
namespace BitcoinPHP\BitcoinECDSA;
require "BitcoinECDSA.php";

function verify($challenge_hidden, $challenge_visual, $pubkey, $signature)
{
    $message = hex2bin($challenge_hidden) . $challenge_visual;

    $R = substr($signature, 2, 64);
    $S = substr($signature, 66, 64);

    $ecdsa = new BitcoinECDSA();
    $hash = $ecdsa->hash256("\x18Bitcoin Signed Message:\n" . $ecdsa->numToVarIntString(strlen($message)) . $message);

    return (bool)$ecdsa->checkSignaturePoints($pubkey, $R, $S, $hash);

}

$challenge_hidden = "cd8552569d6e4509266ef137584d1e62c7579b5b8ed69bbafa4b864c6521e7c2";
$challenge_visual = "2015-03-23 17:39:22";
$pubkey = "020cbccdc85ef2ce4718e46bc20ca9e50025de12b4e7900d1085152a52ebfc2590";
$signature = "2063f0a4ea00bf412b3526fbc0bc1e3850c8597d56e73bc748fa9d315114061fe522f250687188312df56ac5ed84bfc627ee9136c258ffaedaa6613542b340d81c";

echo (int)verify($challenge_hidden, $challenge_visual, $pubkey, $signature);
```

###Ruby

Dependencies: https://github.com/lian/bitcoin-ruby

```ruby
require 'bitcoin'

challenge_hidden = "aaa3d9fb398428c72254c83b5ef020663d8bff43324187295865965c1bf51160"
challenge_visual = "2015-03-12 17:32:26"
address = "1JZuZ6Ttk4Wv7B98M5cF6GswMqGSHnUZ2J"
public_key = "02134ba0f19c15d41193184f96e444f5903935de726e0433aeae16e446b07129e4"
signature = "20fa9e8db27700b6784cf270292b8b7fddd1d126346066c286b02ccf951d9fa3141a6b0528bfc87605c940c491c1f58ccfd7350775df2fd973dcf096415db3f0d7"

Bitcoin.verify_message(address, [signature.htb].pack('m0'), challenge_hidden.htb + challenge_visual) #=> true
```
