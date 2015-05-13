var elements = document.getElementsByTagName('trezor:login');
var origin = 'https://trezor.github.io';
var connect_path = origin + '/connect/';

var contentHtml = '<a id="trezorconnect-button" onclick="trezor_login_handler();"><span id="trezorconnect-icon"></span>Sign in with <strong>TREZOR</strong></a><span id="trezorconnect-info"><a id="trezorconnect-infolink" href="https://www.bitcointrezor.com/" target="_blank">What is TREZOR?</a></span>';

var contentCss = '<style>#trezorconnect-button {font-family: Helvetica, Arial, sans-serif; font-size: 14px; display: block; padding: 6px 12px; margin-bottom: 0; font-weight: normal; line-height: 1.42857143; text-align: center; white-space: nowrap; vertical-align: middle; cursor: pointer; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; border: 1px solid transparent; border-radius: 4px; text-decoration: none; position:relative; padding-left:44px; width:136px; color:#fff; background-color:#59983b; border-color:rgba(0,0,0,0.2);} #trezorconnect-button:hover{background-color:#43732d} #trezorconnect-icon{position:absolute; left:0; top:0; bottom:0; width:32px; line-height:34px; font-size:1.6em; text-align:center; border-right:1px solid rgba(0,0,0,0.2); background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABWklEQVRYw+2WPUsDQRCGZ0w0RRQUCwUllT9AFAQra/+BjYiQRgRBBFv/goWFlVjaBm1SCVpZiIKgha1iI4iFXxDz2MzBEe6SveOWIOwLx3I7X+/NzuyNSEBADgDrQAN4Al6AU2ADKPkOPAk0ScclUPNJIB78ETgEDoD72P6Vl0xY2iMcA5WYrGxEImz7INCIfXklQV4CbkznwtXvQAYO87Y2VfWnU6iqvyJyZq+zrseQhcCUrc9ddCLZiD2FEuhbzy92FJgrjoClXv7VgcCriIzn5P+hqsPdFMoOTgZT9r9E5NOOsSoiQzn998zAeyylC0AV0JQ2HAOWgVuz+S6SwEoGmxNXAn3vgkAgEPgXV3HUhg/ALjDdRXcO2AfefNwDEdrAOVAHRm1M2wHuEv4HhRBYtVGslRQgZb9lNmtFD6RbNvMloW1D6SYw4bsuZoA9q4trq42aBATkwB8MsRcDkn7CNQAAAABJRU5ErkJggg==\') no-repeat;} #trezorconnect-info{display: block;font-family: Helvetica, Arial, sans-serif; font-size: 9px; width: 192px; text-align: right; margin-top: 2px;} #trezorconnect-infolink{text-decoration: none; color: #59983b;}</style>'

var content = contentHtml + contentCss

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
