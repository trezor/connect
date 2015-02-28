TREZOR Connect API
==================

Login
-----

Usage:

```html
<script type="text/javascript">
function trezorLogin(response) {
	if (response.success) {
		alert(JSON.stringify(response));
	} else {
		alert('failure');
	}
}
</script>

...

<trezor:login callback="trezorLogin">
</trezor:login>

...

<script src="https://trezor.github.io/connect/login.js" type="text/javascript"></script>
```
