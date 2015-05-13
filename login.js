var elements = document.getElementsByTagName('trezor:login');
var origin = 'https://trezor.github.io';
var connect_path = origin + '/connect/';

var contentCss = '<style type="text/css">@import url("https://trezor.github.io/button.css")</style>';

var contentHtml = '<div id="trezorconnect-wrapper"><a id="trezorconnect-button" onclick="trezor_login_handler();"><span id="trezorconnect-icon"></span>Sign in with <strong>TREZOR</strong></a><span id="trezorconnect-info"><a id="trezorconnect-infolink" href="https://www.bitcointrezor.com/" target="_blank">What is TREZOR?</a></div>';


var content = contentCss + contentHtml

for (var i = 0; i < elements.length; i++) {
	var e = elements[i];
	window.connect_data = {
		'callback': e.getAttribute('callback'),
		'hosticon': e.getAttribute('icon'),
		'challenge_hidden': e.getAttribute('challenge_hidden') || Array.apply(null, Array(64)).map(function () {return Math.floor(Math.random()*16).toString(16);}).join(''),
		'challenge_visual': e.getAttribute('challenge_visual') || new Date().toISOString().substring(0,19).replace('T',' ')
	};
	e.parentNode.innerHTML = content;
}

function receiveMessage(event) {
	if (event.origin !== origin) return;
	if (window.connect_data.interval) {
		clearInterval(window.connect_data.interval);
	}
	if (window.connect_data.callback) {
		window[window.connect_data.callback](event.data);
	}
}

window.addEventListener('message', receiveMessage, false);

function trezor_login_handler() {
	var w = 500, h = 400, x = (screen.width - w) / 2, y = (screen.height - h) / 3;
	var popup = window.open(connect_path + 'login.html', 'trezor_login_window', 'height='+h+',width='+w+',left='+x+',top='+y+',menubar=no,toolbar=no,location=no,personalbar=no,status=no');
	// repeatedly sent request
	window.connect_data.interval = setInterval(function() {
		var request = {};
		request.trezor_login = true;
		request.challenge_hidden = window.connect_data.challenge_hidden;
		request.challenge_visual = window.connect_data.challenge_visual;
		request.icon = window.connect_data.hosticon;
		popup.postMessage(request, origin);
	}, 250);
}
