TREZOR Connect API
==================

Connect is a platform for easy integration of TREZOR into 3rd party services.

Login
-----

Easy Login Dialog via TREZOR.
To use it include the following in your site and adapt the `trezorLogin` function.

To understand the mechanics, please consult the Challenge-Response chapter of
[SLIP-0046: Authentication using deterministic hierarchy](http://doc.satoshilabs.com/slips/slip-0046.html).


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

<trezor:login callback="trezorLogin" icon="https://en.bitcoin.it/w/images/en/2/29/BC_Logo_.png">
</trezor:login>

...

<script src="https://trezor.github.io/connect/login.js" type="text/javascript"></script>
```
