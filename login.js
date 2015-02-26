var elements = document.getElementsByTagName('trezor:login');
var origin = 'https://trezor.github.io';
var connect_path = origin + '/connect/';

for (var i = 0; i < elements.length; i++) {
	content = '<img style="cursor: pointer; cursor: hand;" src="' + connect_path + 'login.png" onclick="trezor_login_handler();">';
	var e = elements[i];
	e.parentNode.innerHTML = content;
}

function receiveMessage(event) {
	if (event.origin !== origin) return;
	trezorLogin(event.data);
}

window.addEventListener('message', receiveMessage, false);

function trezor_login_handler() {
	var w = 400, h = 300, x = (screen.width - w) / 2, y = (screen.height - h) / 3;
	var popup = window.open(connect_path + 'login.html', 'trezor_login_window', 'height='+h+',width='+w+',left='+x+',top='+y+',menubar=no,toolbar=no,location=no,personalbar=no,status=no');
	// give some time to popup to open, then send request
	setTimeout(function() {
		var request = {};
		request.proto = location.protocol.substring(0, location.protocol.length - 1);
		request.user = null;
		request.host = location.hostname;
		request.port = location.port ? location.port : null;
		request.path = null;
		request.challenge_hidden = btoa(String.fromCharCode.apply(null, window.crypto.getRandomValues(new Uint8Array(24))));
		request.challenge_visual = new Date().toISOString().substring(0,19).replace('T',' ');
		popup.postMessage(request, origin);
	}, 1000);
}
