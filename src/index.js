//
// GitDat main file.
//
requirejs.config({
	appDir: '.',
	baseurl: '.',
	paths: {
		zepto: 'https://cdn.jsdelivr.net/npm/zepto@1.2.0/dist/zepto.min',
		debug: 'https://wzrd.in/standalone/debug@3.0.0?',
		ee2: 'https://wzrd.in/standalone/eventemitter2@4.1.2?',
		h: 'https://wzrd.in/standalone/h@~0.1.0?',
		remoteStorage: 'https://cdnjs.cloudflare.com/ajax/libs/remoteStorage/0.14.0/remotestorage.amd'
	}
});

const libs = {};
const mainFunction = () => {
	const initDebug = libs.debug('init');
	const $ = libs.$;

	// Debug doesn't need to be silent. Set debug to true if it isn't already and reload.
	if (!localStorage.debug) {
		localStorage.debug = '*';
		location.href += '#';
	}

	initDebug('Loading gitDat!');

	if (location.href.endsWith('#')) {
		initDebug('The URL ends with #. The world is going to die.');
		location.href = location.href.split('#')[0];
	}

	initDebug('Declaring site-gen function...');

	function getPage(rawUrl, callback) {
		const fetchDebug = libs.debug('fetch');
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
		case 'page=login':
			initDebug('Found loginpage, loading it!');
			getPage('pages/login.html', setMain);
			libs.ee.emit('login.begin');
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
};

function loginInitiate() {

}

// eslint-disable-next-line max-params
requirejs(['zepto', 'debug', 'ee2', 'h', 'remoteStorage'], ($, debug, EventEmitter, h, remoteStorage) => {
	try {
		libs.$ = $;
		libs.Zepto = libs.$;
		libs.remoteStorage = remoteStorage; // This used to be at the bottom of the libs.*, but it broke the site? This is a quickfix.
		libs.debug = debug;
		libs.ee = new EventEmitter({
			wildcard: true
		});
		libs.h = h;

		if (!(libs.$ || libs.Zepto) || !libs.debug || !libs.ee || !libs.h) {
			document.getElementById('main').innerHTML = '';
			if (libs.h) {
				const h = libs.h;
				document.getElementById('main').appendChild(
					h('div.alert.alert-danger',
						h('strong',
							h('i.glyphicon.glyphicon-fire'),
							'Something bad happened!'),
						'A variable was not defined (libs =',
						h('code',
							libs),
						')'));
			} else {
				document.getElementById('main').innerHTML = '<div class="alert alert-danger"><strong><i class="glyphicon glyphicon-fire"></i>Something bad happened!</strong> A variable was not defined (libs = <code>' + libs + '</code>)</div>';
			}
		}

		const preinitDebug = libs.debug('preinit');
		const eventDebug = libs.debug('event');

		preinitDebug('Libs initialized', libs);

		libs.ee.on('domReady', mainFunction);
		libs.ee.on('login.begin', loginInitiate);
		libs.ee.prependAny(event => {
			eventDebug(event);
		});

		libs.$(document).ready(() => {
			preinitDebug('DOM is ready, loading main');
			libs.ee.emit('domReady');
		});
	} catch (err) {
		console.log(err, this);
		document.getElementById('main').innerHTML = '<div class="alert alert-danger"><strong><i class="glyphicon glyphicon-fire"></i>Something bad happened!</strong> An error was thrown in preinit (err = <code>' + err + '</code>)</div>';
	}
});
