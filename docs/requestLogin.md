## Login

Challenge-response authentication via TREZOR. To protect against replay attacks,
you must use a server-side generated and randomized `challenge_hidden` for every
attempt.  You can also provide a visual challenge that will be shown on the
device.

Service backend needs to check whether the signature matches the generated
`challengeHidden`, provided `challengeVisual` and stored `public_key` fields.
If that is the case, the backend either creates an account (if the `public_key`
identity is seen for the first time) or signs in the user (if the `public_key`
identity is already a known user).

To understand the full mechanics, please consult the Challenge-Response chapter
of
[SLIP-0013: Authentication using deterministic hierarchy](https://github.com/satoshilabs/slips/blob/master/slip-0013.md).

### Using Javascript API

[Example:](examples/login-js.html)

```javascript
// site icon, optional. at least 48x48px
var hosticon = 'https://example.com/icon.png';

// server-side generated and randomized challenges

TrezorConnect.requestLogin({ 
    challengeHidden: '',
    challengeVisible: '',
        callback: function() {
        return {
            hidden: 'Optional',
            visible: '',
        }
    }
}).then(function(result) {
    if (result.success) {
        console.log('Public key:', result.public_key); // pubkey in hex
        console.log('Signature:', result.signature); // signature in hex
        console.log('Version 2:', result.version === 2); // version field
    } else {
        console.error('Error:', result.error);
    }
});
```

### Server side

Here is the reference implementation of the server-side signature verification
written in various languages:

- **C#**: [`examples/server.cs`](examples/server.cs)
- **Javascript**: [`examples/server.js`](examples/server.js)
- **PHP**: [`examples/server.php`](examples/server.php)
- **Python**: [`examples/server.py`](examples/server.py)
- **Ruby**: [`examples/server.rb`](examples/server.rb)
