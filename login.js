window.connect_data = {};

var elements = document.getElementsByTagName('trezor:login');
var connect_origin = 'https://trezor.github.io';
var connect_path = connect_origin + '/connect/';

var content_css = '<style type="text/css">@import url("'+connect_path+'button.css")</style>';

var content_html = '<div id="trezorconnect-wrapper"><a id="trezorconnect-button" onclick="trezor_login_handler(\'@callback@\', \'@hosticon@\', \'@challenge_hidden@\', \'@challenge_visual@\');"><span id="trezorconnect-icon"></span>Sign in with <strong>TREZOR</strong></a><span id="trezorconnect-info"><a id="trezorconnect-infolink" href="https://www.bitcointrezor.com/" target="_blank">What is TREZOR?</a></div>';

for (var i = 0; i < elements.length; i++) {
	var e = elements[i];
	callback = e.getAttribute('callback') || '';
	hosticon = e.getAttribute('icon') || '';
	challenge_hidden = e.getAttribute('challenge_hidden') || '';
	challenge_visual = e.getAttribute('challenge_visual') || '';
	e.parentNode.innerHTML = content_css + content_html.replace('@callback@', callback).replace('@hosticon@', hosticon).replace('@challenge_hidden@', challenge_hidden).replace('@challenge_visual@', challenge_visual);
}

function receiveMessage(event) {
	if (event.origin !== connect_origin) return;
	if (window.connect_data.interval) {
		clearInterval(window.connect_data.interval);
	}
	if (window.connect_data.callback) {
		window[window.connect_data.callback](event.data);
	}
}

window.addEventListener('message', receiveMessage, false);

function trezor_login_handler(callback, hosticon, challenge_hidden, challenge_visual) {
	var w = 500, h = 400, x = (screen.width - w) / 2, y = (screen.height - h) / 3;
	var popup = window.open(connect_path + 'login.html', 'trezor_login_window', 'height='+h+',width='+w+',left='+x+',top='+y+',menubar=no,toolbar=no,location=no,personalbar=no,status=no');
	window.connect_data.callback = callback;
	// repeatedly sent request
	window.connect_data.interval = setInterval(function() {
		var request = {};
		request.trezor_login = true;
		request.icon = hosticon || 'https://trezor.github.io/connect/trezor.png';
		request.challenge_hidden = challenge_hidden || Array.apply(null, Array(64)).map(function () {return Math.floor(Math.random()*16).toString(16);}).join('');
		request.challenge_visual = challenge_visual || new Date().toISOString().substring(0,19).replace('T',' ');
		popup.postMessage(request, connect_origin);
	}, 250);
}
