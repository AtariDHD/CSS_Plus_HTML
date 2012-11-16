$(function() {
	// inject jQuery into the background content page so that it is available to sidebar.js
    var script = document.createElement('script');
    script.src = 'http' + (/^https/.test(location.protocol) ? 's' : '') + '://code.jquery.com/jquery-latest.min.js';
    document.getElementsByTagName('head')[0].appendChild(script);

	injectRestrictedCSS();
	setTimeout(function () { // crude and very error-prone attempt to catch stylesheets added via ajax and scripts; TODO: replace with appropriate event
		injectRestrictedCSS();
	}, 3000);
});


function injectRestrictedCSS() {
	var $xorcss = setupXorSheetsContainer(),
		 xorSheets = [],
		 sheets = document.styleSheets;

	for (var s in sheets) {
		if (!(sheets[s].rules || sheets[s].cssRules) && sheets[s].href && sheets[s].href.indexOf('http') == 0) // if no rules present for external stylesheet
			xorSheets.push(sheets[s].href);
	}

	if (xorSheets.length > $xorcss.children().length) { // check to see if there are new stylesheets to handle or if this is our first time injecting css
		$xorcss.html(''); // clear previously injected stylesheets so that we don't affect performance with redundant sheets
		for (var x in xorSheets) {
			$.get(YQLURL(xorSheets[x]), function(xmlDoc) { // make async ajax call to get stylesheet using Yahoo's YQL service to deal with cross-origin security restriction 
				if (xmlDoc) {
					try {
						var xorid = 'xor_' + getUniqueTime();
						$('#xorcss').append($('<style type="text/css" id="' + xorid + '" />').html(xmlDoc.getElementsByTagName('p')[0].childNodes[0].nodeValue)); // extract results of YQL query and insert into a new stylesheet
						$('#' + xorid)[0].disabled = true; // disable stylesheet so that we don't affect page rendering
					}
					catch(err) {
						console.log('error injecting');
					}
				}
			});
		}
	}
}

function getUniqueTime() {
	var time = new Date().getTime();
	while (time == new Date().getTime());
	return new Date().getTime();
}

function setupXorSheetsContainer() {
	if (!$('#xorcss').length)
		$('BODY').prepend('<div id="xorcss" style="display: none;" />'); // we'll keep track of our injected stylesheets by putting them into this hidden div container
	return $('#xorcss');
}

function YQLURL(url) {
	return 'http' + (/^https/.test(location.protocol) ? 's' : '') + '://query.yahooapis.com/v1/public/yql' + // generate YQL URL containing query to fetch stylesheet via the stylesheets URL
			 '?q=' + encodeURIComponent('select * from html where url="' + url + '" and xpath="*"') +
			 '&format=xml';
}
