/*var addHeaders = [];
var modifyHeaders = {};
var filterHeaders = {};
var targetHeaders = [];
var enabled = false;

function setStatus(status) {
	enabled = status === 'STARTED';
//    console.log('Plugin enabled: ' + enabled);
}

function setHeaders(headers) {
	addHeaders.splice(0, addHeaders.length);
	for (var member in modifyHeaders)
		delete modifyHeaders[member];
	for (var member in filterHeaders)
		delete filterHeaders[member];

	for (var j = 0; j < headers.length; ++j) {
		var header = headers[j];
		if (header && header.state === 'ENABLED') {
			if (header.action === 'Add') {
				addHeaders.push(header);
			} else if (header.action === 'Modify') {
				modifyHeaders[header.name] = header;
			} else if (header.action === 'Filter') {
				filterHeaders[header.name] = header;
			}
		}
	}
//    console.log('addHeaders: ' + JSON.stringify(addHeaders));
//    console.log('modifyHeaders: ' + JSON.stringify(modifyHeaders));
//    console.log('filterHeaders: ' + JSON.stringify(filterHeaders));
}

function initialize() {
	var status = $.jStorage.get('CMH.CTRL');
	if (!status)
		status = 'STOPPED';
	setStatus(status);

	var headers = jQuery.jStorage.get('CMH.HEADERS');
	if (!headers)
		headers = [];
	setHeaders(headers);
}

function openOrFocusOptionsPage() {
	var optionsUrl = chrome.extension.getURL('options.html');
	chrome.tabs.query({}, function(extensionTabs) {
		var found = false;
		for (var i = 0; i < extensionTabs.length; i++) {
			if (optionsUrl === extensionTabs[i].url) {
				found = true;
				chrome.tabs.update(extensionTabs[i].id, {"selected": true});
			}
		}
		if (found === false) {
			chrome.tabs.create({url: "options.html"});
		}
	});
}
chrome.extension.onConnect.addListener(function(port) {
	var tab = port.sender.tab;
	// This will get called by the content script we execute in
	// the tab as a result of the user pressing the browser action.
	port.onMessage.addListener(function(info) {
		var max_length = 1024;
		if (info.selection.length > max_length)
			info.selection = info.selection.substring(0, max_length);
		openOrFocusOptionsPage();
	});
});

// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
	openOrFocusOptionsPage();
});

chrome.tabs.onActivated.addListener(function() {
	initialize();
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
	if (info.status === "loading") {
		initialize();
	}
});
*/

let onHeadersReceivedOptions = ['blocking', 'responseHeaders'];
if (chrome.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS) {
	onHeadersReceivedOptions.push(chrome.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS);
}

console.log('register...');

let tilingWebsiteUrls = ['http://localhost'];
let allowedTabs = [];

function isUrlAllowedToInitiateSecurityDeactivation(urlToTest){
	for(let iTilingUrl in tilingWebsiteUrls){
		if(urlToTest.startsWith(tilingWebsiteUrls[iTilingUrl]))
			return true;
	}
	return false;
}

chrome.webRequest.onHeadersReceived.addListener(function(details) {
		let originalHeaders = details.responseHeaders,
			blockingResponse = {};
		let targetHeaders = [];

		let actived = false;
		if(allowedTabs.indexOf(details.tabId) === -1) {
			console.log(details.type === 'main_frame' , details.frameId === 0 , isUrlAllowedToInitiateSecurityDeactivation(details.url) , details.parentFrameId === -1);
			if (details.type === 'main_frame' && details.frameId === 0 && isUrlAllowedToInitiateSecurityDeactivation(details.url) && details.parentFrameId === -1) {
				allowedTabs.push(details.tabId);
				actived = true;
			}
		}else{
			actived = true;
		}
		console.log(JSON.stringify(allowedTabs))

		if(actived){
			console.log(JSON.stringify(originalHeaders));
			for(let i = 0; i < originalHeaders.length; i++){
				let header = originalHeaders[i];
				if(
					header.name.toLowerCase() !== 'X-Frame-Options'.toLowerCase()
					&& header.name.toLowerCase() !== 'Content-Security-Policy'.toLowerCase()
				){
					targetHeaders.push(header);
				}
			}
		}else{
			targetHeaders = originalHeaders;
		}
		console.log('=>', JSON.stringify(targetHeaders));

		blockingResponse.responseHeaders = targetHeaders;
		return blockingResponse;
	},
	{urls: ["<all_urls>"]}, onHeadersReceivedOptions);

// console.log('Extension ID: '+chrome.runtime.getManifest().key);

chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse) {
		if (request) {
			if (request.message) {
				if (request.message == "version") {
					sendResponse({version: 1.0});
				}
			}
		}
		return true;
	});