//
// GitDat main file.
//
requirejs.config({
	appDir: '.',
	baseurl: '.',
	paths: {
		zepto: 'https://cdn.jsdelivr.net/npm/zepto@1.2.0/dist/zepto.min',
		domReady: 'https://cdn.jsdelivr.net/gh/requirejs/domReady@2.0.1/domReady.min',
		debug: 'https://wzrd.in/standalone/debug@^3.0.0?'
	}
});
requirejs(['domReady!', 'zepto', 'debug'], (doc, $, debug) => {
	debug('init')('Checking for $');

	if (!$) {
		document.getElementById('main').innerHTML = '<div class="alert alert-danger"><strong><i class="glyphicon glyphicon-fire"></i>Something bad happened!</strong> Zepto was not defined ($ = <code>' + $.toString + '</code>)</div>';
	}
	// Debug doesn't need to be silent. Set debug to true.
	if (!localStorage.debug) {
		localStorage.debug = '*';
		location.href += '#';
	}
	const initDebug = debug('init');

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
			initDebug('I\'m lost. Where am i?');
	}
});
