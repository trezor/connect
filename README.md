TREZOR Connect API
==================

Connect is a platform for easy integration of TREZOR into 3rd party services.

Login
-----

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

```
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

```
{
  "success": false,
  "error": "String description of the error"
}
```

To understand the full mechanics, please consult the Challenge-Response chapter of
[SLIP-0013: Authentication using deterministic hierarchy](http://doc.satoshilabs.com/slips/slip-0013.html).
