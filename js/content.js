$(function() {
	var jqLoaderCode =
		"if (typeof jQuery === 'undefined') {\n" +
		"    var jqscript = document.createElement('script');\n" +
		"    jqscript.type = 'text/javascript';\n" +
		"    jqscript.src = 'http' + (/^https/.test(location.protocol) ? 's' : '') + '://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js';\n" +
		"    var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;\n" +
		"    head.insertBefore(jqscript, head.firstChild);\n" +
		"}\n";

	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.async = true;
	script.appendChild(document.createTextNode(jqLoaderCode));
	var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
	head.insertBefore(script, head.firstChild);

	$('BODY').append('<iframe id="cph_xorcss" style="display: none;" />'); // we'll keep track of our injected stylesheets by putting them into this hidden iframe, where they can't interfere
	$('BODY').append('<iframe id="cph_styleTests" style="display: none;" />'); // we'll use this iframe to test elements for their default styles

	setTimeout(function() {
		injectRestrictedCSS();
		setTimeout(function () { // crude and very error-prone attempt to catch stylesheets added via ajax and scripts; TODO: supplement with appropriate events (document load maybe? + something to detect dom changes)
			injectRestrictedCSS();
		}, 3000);
	}, 1);
});

function injectRestrictedCSS() {
	var xorcssDoc = getInjectedSheetsDocument(),
		 xorSheets = [],
		 sheets = document.styleSheets,
		 sheetIndex = 0;

	$('LINK, :not(#cph_xorcss) STYLE').each(function () {
		$(this).attr('cph-ssorder', sheetIndex);
		sheetIndex++;
	});

	for (var s in sheets) {
		var thisSheet = sheets[s];
		if (!thisSheet.cssRules && thisSheet.href && thisSheet.href.indexOf('http') == 0 && !isPrintOnlyStylesheet(thisSheet.media)) // if no rules present for external stylesheet
			xorSheets.push([thisSheet.href, $(thisSheet.ownerNode).attr('cph-ssorder')]);
	}

	if (xorSheets.length > $(xorcssDoc).find('STYLE').length) { // check to see if there are new stylesheets to handle or if this is our first time injecting css
		$(xorcssDoc).find('HEAD').html(''); // clear previously injected stylesheets so that we don't affect performance with redundant sheets
		for (var x in xorSheets) {
			$.get(YQLURL(xorSheets[x][0]), injectSheet(xorSheets[x][1]));
		}
	}
}

function injectSheet(sheetIndex) {
	return function (xmlDoc) {
		if (xmlDoc) {
			try {
				var xorcssDoc = getInjectedSheetsDocument(),
					 newStylesheet = document.createElement('style');
				newStylesheet.type = 'text/css';
				newStylesheet.setAttribute('cph-ssorder', sheetIndex);
				newStylesheet.appendChild(document.createTextNode(xmlDoc.getElementsByTagName('p')[0].childNodes[0].nodeValue));
				xorcssDoc.getElementsByTagName('head')[0].appendChild(newStylesheet);
				newStylesheet.disabled = true;
			}
			catch(err) {
				console.log('error injecting');
			}
		}
	}
}

function getInjectedSheetsDocument() {
	return $('#cph_xorcss')[0].contentDocument;
}

function YQLURL(url) {
	return 'http' + (/^https/.test(location.protocol) ? 's' : '') + '://query.yahooapis.com/v1/public/yql' + // generate YQL URL containing query to fetch stylesheet via the stylesheets URL
			 '?q=' + encodeURIComponent('select * from html where url="' + url + '" and xpath="*"') +
			 '&format=xml';
}

function isPrintOnlyStylesheet(mediaList) {
	var isPrint = false;
	if (mediaList.length) {
		for (var m = 0; m < mediaList.length; m++) {
			if (mediaList[m] == 'screen')
				return false;
			else if (mediaList[m] == 'print')
				isPrint = true;
		}
	}
	return isPrint;
}
