//
// GitDat main file.
//
requirejs.config({
	appDir: '.',
	baseurl: '.',
	paths: {
		zepto: 'https://cdn.jsdelivr.net/npm/zepto@1.2.0/dist/zepto.min',
		debug: 'https://wzrd.in/standalone/debug@^3.0.0?',
		ee2: 'https://wzrd.in/standalone/eventemitter2@^4.1.2?'
	}
});

const libs = {};

let mainFunction;

requirejs(['zepto', 'debug', 'ee2'], ($, debug, EventEmitter) => {
	libs.$ = $;
	libs.Zepto = libs.$;
	libs.debug = debug;
	libs.ee = new EventEmitter({
		wildcard: true
	});

	const preinitDebug = libs.debug('preinit');
	const eventDebug = libs.debug('event');

	preinitDebug('Libs initialized', libs);

	libs.ee.on('domReady', mainFunction);
	libs.ee.prependAny(event => {
		eventDebug(event);
	});

	libs.$(document).ready(() => {
		preinitDebug('DOM is ready, loading main');
		libs.ee.emit('domReady');
	});
});

mainFunction = () => {
	(libs.debug ? libs.debug('init') : console.log)('Checking for libs');

	if (!(libs.$ || libs.Zepto) || !libs.debug || !libs.ee) {
		document.getElementById('main').innerHTML = '<div class="alert alert-danger"><strong><i class="glyphicon glyphicon-fire"></i>Something bad happened!</strong> A variable was not defined (libs = <code>' + libs + '</code>)</div>';
	}
	// Debug doesn't need to be silent. Set debug to true.
	if (!localStorage.debug) {
		localStorage.debug = '*';
		location.href += '#';
	}

	const initDebug = libs.debug('init');
	const $ = libs.$;

	initDebug('Done that, loading gitDat!');

	if (location.href.endsWith('#')) {
		initDebug('The URL ends with #. The world is going to die.');
		location.href = location.href.split('#')[0];
	}

	initDebug('Declaring site-gen function...');

	function getPage(rawUrl, callback) {
		const fetchDebug = debug('fetch');
		const url = location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/' + rawUrl;
		const requestId = Math.random().toString().split('.')[0];
		fetchDebug('Fetching', url, 'RequestID is', requestId);

		$.ajax({
			type: 'GET',
			url,
			timeout: 5000,
			success(response, status, xhr) {
				fetchDebug('Got response ' + xhr.status, '(' + response.length + ' bytes)', '(RID ' + requestId + ')');
				callback(response, xhr.status);
			},
			error() {
				fetchDebug('Got error', '(RID ' + requestId + ')');
			}
		});
	}
	const setMain = data => ($('#main').html(data));

	initDebug('Checking site type...');
	switch (location.href.split('?')[1]) {
		case 'page=home':
			initDebug('Found homepage, loading it!');
			getPage('pages/home.html', setMain);
			break;
		case '':
		case undefined:
			location.href += '?page=home';
			break;
		default:
			// NOTE: capitalization of i is intentional.
			initDebug('Not Found on request to ' + location.href.split('?')[1]);
			setMain('<h1>Not Found</h1>I\'m lost. Where am i?');
	}
}
