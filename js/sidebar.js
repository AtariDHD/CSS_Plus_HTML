window.onload = function() {
    var body = $('BODY')[0];

    $('.choice A').click(function () {
    	if ($(this).hasClass('open'))
	    	closeAllSections();
    	else {
			closeAllSections();
			openSection($(this));
    	}
    	return false;
    });

    $('A.new-win').click(function () {
    	return demoFragment($(this).prev(), $(this).parent().prev().text());
    });

    function demoFragment($ta, demoTitle) {
    	var newWin = window.open('', 'csshtml_demo_' + getUniqueTime());
		newWin.document.writeln('<html><head><title>CSS+HTML Fragment - ' + demoTitle + '</title></head><body>' + $ta.val() + '</body></html>');
		newWin.document.close();
    	return false;
    }

	function getUniqueTime() {
		var time = new Date().getTime();
		while (time == new Date().getTime());
		return new Date().getTime();
	}

    function closeAllSections() {
		$('.choice A.open').each(function () {
	    	var $ta = $(this).parent().next().find('TEXTAREA');
	    	$ta.val('');
	    	$ta.parent().hide(100, function () { $(this).prev().find('A').removeClass('open'); });
		});
    }

    function openSection($a) {
		$a.addClass('open');
		$a.parent().next().fadeIn(400);
		elementSelected();
    }

    function elementSelected() {
		$('.choice A.open').each(function () {
	    	var $ta = $(this).parent().next().find('TEXTAREA');
	    	$ta.val('inspecting...');

			chrome.devtools.inspectedWindow.eval('(' + inspect.toString() + ')($0, "' + $(this).attr('id') + '")', function (result) {
				$ta.val(result ? style_html(result, { max_char: 0 }) : 'result was null').select().focus();
			});
		});
	}

	chrome.devtools.panels.elements.onSelectionChanged.addListener(elementSelected);
}

function inspect(el, func) {
	if (el === undefined || el.nodeType !== Node.ELEMENT_NODE)
		return;

	var doc = el.ownerDocument,
		 $ = doc.defaultView.jQuery,
		 $el = $(el),
		 html = $el[0].outerHTML,
		 rulesUsed = [],
		 sheets = [],
		 docSheets = doc.styleSheets,
		 xorSheets = $('#cph_xorcss')[0].contentDocument.styleSheets;

	for (var s in docSheets) {
		var thisSheet = docSheets[s];
		if (thisSheet.cssRules && !isPrintOnlyStylesheet(thisSheet.media))
			sheets.push([thisSheet, thisSheet.ownerNode.getAttribute('cph-ssorder')]);
	}
	for (var s in xorSheets) {
		var thisSheet = xorSheets[s];
		if (thisSheet.cssRules)
			sheets.push([thisSheet, thisSheet.ownerNode.getAttribute('cph-ssorder')]);
	}
	sheets.sort(function (a, b) {
		 return a[1] - b[1];
	});

	// Mapping between tag names and css default values lookup tables. This allows to exclude default values in the result.
	var defaultStylesByTagName = {};
	
	// Styles inherited from style sheets will not be rendered for elements with these tag names
	var noStyleTags = {"BASE":true,"HEAD":true,"HTML":true,"META":true,"NOFRAME":true,"NOSCRIPT":true,"PARAM":true,"SCRIPT":true,"STYLE":true,"TITLE":true};

	// This list determines which css default values lookup tables are precomputed at load time
	// Lookup tables for other tag names will be automatically built at runtime if needed
	var tagNames = ["A","ABBR","ADDRESS","AREA","ARTICLE","ASIDE","AUDIO","B","BASE","BDI","BDO","BLOCKQUOTE","BODY","BR","BUTTON","CANVAS","CAPTION","CENTER","CITE","CODE","COL","COLGROUP","COMMAND","DATALIST","DD","DEL","DETAILS","DFN","DIV","DL","DT","EM","EMBED","FIELDSET","FIGCAPTION","FIGURE","FONT","FOOTER","FORM","H1","H2","H3","H4","H5","H6","HEAD","HEADER","HGROUP","HR","HTML","I","IFRAME","IMG","INPUT","INS","KBD","KEYGEN","LABEL","LEGEND","LI","LINK","MAP","MARK","MATH","MENU","META","METER","NAV","NOBR","NOSCRIPT","OBJECT","OL","OPTION","OPTGROUP","OUTPUT","P","PARAM","PRE","PROGRESS","Q","RP","RT","RUBY","S","SAMP","SCRIPT","SECTION","SELECT","SMALL","SOURCE","SPAN","STRONG","STYLE","SUB","SUMMARY","SUP","SVG","TABLE","TBODY","TD","TEXTAREA","TFOOT","TH","THEAD","TIME","TITLE","TR","TRACK","U","UL","VAR","VIDEO","WBR"];
	
	return eval('inspect_' + func + '()');

	function inspect_authored() {
		for (var s in sheets) {
			var thisSheet = sheets[s][0],
				 rules = thisSheet.cssRules;
			if (rules && !isPrintOnlyStylesheet(thisSheet.media)) {
				for (var r in rules) {
					try {
						if (rules[r].selectorText)
							findFirstMatch($el, rules[r]);
					}
					catch(err) {}
				}
			}
		}
		
		return prepareAuthoredResults();
	}

	function inspect_authored_trim_selectors() {
		for (var s in sheets) {
			var thisSheet = sheets[s][0],
				 rules = thisSheet.cssRules;
			if (rules && !isPrintOnlyStylesheet(thisSheet.media)) {
				for (var r in rules) {
					try {
						if (rules[r].selectorText && findFirstMatchGivenSelector($el, rules[r].selectorText)) {
							var thisRule = { cssText: rules[r].cssText, selectorText: rules[r].selectorText },
							    selectors = thisRule.selectorText.split(','),
							    matchingSelectors = [];
							for (var l in selectors) {
								var thisSelector = $.trim(selectors[l]);
								if (findFirstMatchGivenSelector($el, thisSelector))
									matchingSelectors.push(thisSelector);
							}
							thisRule.selectorText = matchingSelectors.join(', ');
							thisRule.cssText = thisRule.cssText.replace(/^.*?{(.*?)}/, thisRule.selectorText + ' { \$1 }');
							rulesUsed.push(thisRule);
						}
					}
					catch(err) {}
				}
			}
		}
	
		return prepareAuthoredResults();
	}

	function inspect_authored_top() {
		for (var s in sheets) {
			var thisSheet = sheets[s][0],
				 rules = thisSheet.cssRules;
			if (rules && !isPrintOnlyStylesheet(thisSheet.media)) {
				for (var r in rules) {
					try {
						if (rules[r].selectorText && $(rules[r].selectorText).index($el) != -1)
							rulesUsed.push(rules[r]);
					}
					catch(err) {}
				}
			}
		}
	
		return prepareAuthoredResults();
	}

	function inspect_authored_top_trim_selectors() {
		for (var s in sheets) {
			var thisSheet = sheets[s][0],
				 rules = thisSheet.cssRules;
			if (rules && !isPrintOnlyStylesheet(thisSheet.media)) {
				for (var r in rules) {
					try {
						if (rules[r].selectorText && $(rules[r].selectorText).index($el) != -1) {
							var thisRule = { cssText: rules[r].cssText, selectorText: rules[r].selectorText },
							    selectors = thisRule.selectorText.split(','),
							    matchingSelectors = [];
							for (var l in selectors) {
								var thisSelector = $.trim(selectors[l]);
								if ($(thisSelector).index($el) != -1) {
									matchingSelectors.push(thisSelector);
								}
							}
							thisRule.selectorText = matchingSelectors.join(', ');
							thisRule.cssText = thisRule.cssText.replace(/^.*?{(.*?)}/, thisRule.selectorText + ' { \$1 }');
							rulesUsed.push(thisRule);
						}
					}
					catch(err) {}
				}
			}
		}

		return prepareAuthoredResults();
	}

	function inspect_computed() {
		var testDoc = $(doc).find('#cph_styleTests')[0].contentDocument,
		    testDocBody = testDoc.body;
	
		// Precompute the lookup tables.
		for (var i = 0; i < tagNames.length; i++) {
			if(!noStyleTags[tagNames[i]])
				defaultStylesByTagName[tagNames[i]] = computeDefaultStyleByTagName(tagNames[i]);
		}
	
		return serializeIt();

		function computeDefaultStyleByTagName(tagName) {
			var defaultStyle = {},
			    element = testDocBody.appendChild(testDoc.createElement(tagName)),
			    computedStyle = getComputedStyle(element);
			for (var i = 0; i < computedStyle.length; i++) {
				defaultStyle[computedStyle[i]] = computedStyle[computedStyle[i]];
			}
			testDocBody.removeChild(element);
			return defaultStyle;
		}

		function getDefaultStyleByTagName(tagName) {
			tagName = tagName.toUpperCase();
			if (!defaultStylesByTagName[tagName])
				defaultStylesByTagName[tagName] = computeDefaultStyleByTagName(tagName);
			return defaultStylesByTagName[tagName];
		}
	
		 function serializeIt() {
			  var cssTexts = [],
			      elements = el.querySelectorAll('*');
			  for (var i = 0; i < elements.length; i++) {
					var e = elements[i];
					if (!noStyleTags[e.tagName]) {
						 var computedStyle = getComputedStyle(e),
						     defaultStyle = getDefaultStyleByTagName(e.tagName);
						 cssTexts[i] = e.style.cssText;
						 for (var ii = 0; ii < computedStyle.length; ii++) {
							  var cssPropName = computedStyle[ii];
							  if (computedStyle[cssPropName] !== defaultStyle[cssPropName])
									e.style[cssPropName] = computedStyle[cssPropName];
						 }
					}
			  }
	
			var elCssText = el.style.cssText;
			if (!noStyleTags[el.tagName]) {
				 var computedStyle = getComputedStyle(el),
				     defaultStyle = getDefaultStyleByTagName(el.tagName);
				 for (var ii = 0; ii < computedStyle.length; ii++) {
					  var cssPropName = computedStyle[ii];
					  if (computedStyle[cssPropName] !== defaultStyle[cssPropName])
							el.style[cssPropName] = computedStyle[cssPropName];
				 }
			}

			var result = el.outerHTML;
			for (var i = 0; i < elements.length; i++ ) {
				elements[i].style.cssText = cssTexts[i];
			}
			el.style.cssText = elCssText;
			return result;
		}
	}

	function inspect_complete() {
		var cssTexts = [],
		    elements = el.querySelectorAll('*');
		for (var i = 0; i < elements.length; i++) {
			var e = elements[i];
			if (!noStyleTags[e.tagName]) {
				 var computedStyle = getComputedStyle(e);
				 cssTexts[i] = e.style.cssText;
				 for (var ii = 0; ii < computedStyle.length; ii++) {
					  var cssPropName = computedStyle[ii];
							e.style[cssPropName] = computedStyle[cssPropName];
				 }
			}
		}

		var elCssText = el.style.cssText;
		if (!noStyleTags[el.tagName]) {
			var computedStyle = getComputedStyle(el);
			for (var ii = 0; ii < computedStyle.length; ii++) {
				var cssPropName = computedStyle[ii];
					el.style[cssPropName] = computedStyle[cssPropName];
			}
		}

		var result = el.outerHTML;
		for (var i = 0; i < elements.length; i++) {
			elements[i].style.cssText = cssTexts[i];
		}
		el.style.cssText = elCssText;

		return result;
	}

	function prepareAuthoredResults() {
		var style = rulesUsed.map(function (cssRule) {
			var cssText = cssRule.cssText;
			return cssText.replace(/(\{|;)\s+/g, '\$1\n   ').replace(/\s+}/, '\n}');
		}).join('\n');

		return '<style type="text/css">\n' +
				 '/\* styles for inspected element and children *\/\n' +
				 style + '\n\n' +
				 '/\* styles for inspected element\'s parent (to facilitate inherited styles) *\/\n' +
				 '#inspected_parent {\n' +
				 getInheritableStyles($el.parent()[0]) +
				 '}\n' +
				 '</style>\n\n\n' +
				 '<div id="inspected_parent">\n\n' +
				 html +
				 '\n\n</div>';
	}

	function getInheritableStyles(el) {
		if (el === undefined || el.nodeType !== Node.ELEMENT_NODE || noStyleTags[el.tagName])
			return '';

		var cssText = '',
		    inheritedProps = { 'border-collapse': true, 'border-spacing': true, 'caption-side': true, 'color': true, 'cursor': true, 'direction': true, 'empty-cells': true, 'font-family': true, 'font-size': true, 'font-style': true, 'font-variant': true, 'font-weight': true, 'font': true, 'letter-spacing': true, 'line-height': true, 'list-style-image': true, 'list-style-position': true, 'list-style-type': true, 'list-style': true, 'orphans': true, 'quotes': true, 'text-align': true, 'text-indent': true, 'text-transform': true, 'visibility': true, 'white-space': true, 'widows': true, 'word-spacing': true },
		    computedStyle = getComputedStyle(el);
		for (var ii = 0; ii < computedStyle.length; ii++) {
			var cssPropName = computedStyle[ii];
			if (inheritedProps[cssPropName])
				cssText += '   ' + cssPropName + ': ' + computedStyle[cssPropName] + ';\n';
		}

		return cssText;
	}

	function findFirstMatch($elm, checkRule) {
		try {
			if ($(checkRule.selectorText).index($elm) != -1) {
				rulesUsed.push(checkRule);
				return true;
			}
		}
		catch(err) {}
		var childMatched = false;
		$elm.children().each(function () {
			if (findFirstMatch($(this), checkRule)) {
				childMatched = true;
				return false;
			}
		});
		return childMatched;
	}

	function findFirstMatchGivenSelector($elm, selText) {
		if ($(selText).index($elm) != -1)
			return true;
		var childMatched = false;
		$elm.children().each(function () {
			if (findFirstMatchGivenSelector($(this), selText)) {
				childMatched = true;
				return false; // break .each() loop
			}
		});
		return childMatched;
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
}


/*

 Style HTML
---------------

  Written by Nochum Sossonko, (nsossonko@hotmail.com)

  Based on code initially developed by: Einar Lielmanis, <elfz@laacz.lv>
    http://jsbeautifier.org/


  You are free to use this in any way you want, in case you find this useful or working for you.

  Usage:
    style_html(html_source);

    style_html(html_source, options);

  The options are:
    indent_size (default 4)          — indentation size,
    indent_char (default space)      — character to indent with,
    max_char (default 70)            -  maximum amount of characters per line,
    brace_style (default "collapse") - "collapse" | "expand" | "end-expand"
            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line.
    unformatted (defaults to inline tags) - list of tags, that shouldn't be reformatted
    indent_scripts (default normal)  - "keep"|"separate"|"normal"

    e.g.

    style_html(html_source, {
      'indent_size': 2,
      'indent_char': ' ',
      'max_char': 78,
      'brace_style': 'expand',
      'unformatted': ['a', 'sub', 'sup', 'b', 'i', 'u']
    });
*/

function style_html(html_source, options) {
//Wrapper function to invoke all the necessary constructors and deal with the output.

  var multi_parser,
      indent_size,
      indent_character,
      max_char,
      brace_style,
      unformatted;

  options = options || {};
  indent_size = options.indent_size || 4;
  indent_character = options.indent_char || ' ';
  brace_style = options.brace_style || 'collapse';
  max_char = options.max_char == 0 ? Infinity : options.max_char || 70;
  unformatted = options.unformatted || ['a', 'span', 'bdo', 'em', 'strong', 'dfn', 'code', 'samp', 'kbd', 'var', 'cite', 'abbr', 'acronym', 'q', 'sub', 'sup', 'tt', 'i', 'b', 'big', 'small', 'u', 's', 'strike', 'font', 'ins', 'del', 'pre', 'address', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  function Parser() {

    this.pos = 0; //Parser position
    this.token = '';
    this.current_mode = 'CONTENT'; //reflects the current Parser mode: TAG/CONTENT
    this.tags = { //An object to hold tags, their position, and their parent-tags, initiated with default values
      parent: 'parent1',
      parentcount: 1,
      parent1: ''
    };
    this.tag_type = '';
    this.token_text = this.last_token = this.last_text = this.token_type = '';

    this.Utils = { //Uilities made available to the various functions
      whitespace: "\n\r\t ".split(''),
      single_token: 'br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed,?php,?,?='.split(','), //all the single tags for HTML
      extra_liners: 'head,body,/html'.split(','), //for tags that need a line of whitespace before them
      in_array: function (what, arr) {
        for (var i=0; i<arr.length; i++) {
          if (what === arr[i]) {
            return true;
          }
        }
        return false;
      }
    }

    this.get_content = function () { //function to capture regular content between tags

      var input_char = '',
          content = [],
          space = false; //if a space is needed

      while (this.input.charAt(this.pos) !== '<') {
        if (this.pos >= this.input.length) {
          return content.length?content.join(''):['', 'TK_EOF'];
        }

        input_char = this.input.charAt(this.pos);
        this.pos++;
        this.line_char_count++;

        if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
          if (content.length) {
            space = true;
          }
          this.line_char_count--;
          continue; //don't want to insert unnecessary space
        }
        else if (space) {
          if (this.line_char_count >= this.max_char) { //insert a line when the max_char is reached
            content.push('\n');
            for (var i=0; i<this.indent_level; i++) {
              content.push(this.indent_string);
            }
            this.line_char_count = 0;
          }
          else{
            content.push(' ');
            this.line_char_count++;
          }
          space = false;
        }
        content.push(input_char); //letter at-a-time (or string) inserted to an array
      }
      return content.length?content.join(''):'';
    }

    this.get_contents_to = function (name) { //get the full content of a script or style to pass to js_beautify
      if (this.pos == this.input.length) {
        return ['', 'TK_EOF'];
      }
      var input_char = '';
      var content = '';
      var reg_match = new RegExp('\<\/' + name + '\\s*\>', 'igm');
      reg_match.lastIndex = this.pos;
      var reg_array = reg_match.exec(this.input);
      var end_script = reg_array?reg_array.index:this.input.length; //absolute end of script
      if(this.pos < end_script) { //get everything in between the script tags
        content = this.input.substring(this.pos, end_script);
        this.pos = end_script;
      }
      return content;
    }

    this.record_tag = function (tag){ //function to record a tag and its parent in this.tags Object
      if (this.tags[tag + 'count']) { //check for the existence of this tag type
        this.tags[tag + 'count']++;
        this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
      }
      else { //otherwise initialize this tag type
        this.tags[tag + 'count'] = 1;
        this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
      }
      this.tags[tag + this.tags[tag + 'count'] + 'parent'] = this.tags.parent; //set the parent (i.e. in the case of a div this.tags.div1parent)
      this.tags.parent = tag + this.tags[tag + 'count']; //and make this the current parent (i.e. in the case of a div 'div1')
    }

    this.retrieve_tag = function (tag) { //function to retrieve the opening tag to the corresponding closer
      if (this.tags[tag + 'count']) { //if the openener is not in the Object we ignore it
        var temp_parent = this.tags.parent; //check to see if it's a closable tag.
        while (temp_parent) { //till we reach '' (the initial value);
          if (tag + this.tags[tag + 'count'] === temp_parent) { //if this is it use it
            break;
          }
          temp_parent = this.tags[temp_parent + 'parent']; //otherwise keep on climbing up the DOM Tree
        }
        if (temp_parent) { //if we caught something
          this.indent_level = this.tags[tag + this.tags[tag + 'count']]; //set the indent_level accordingly
          this.tags.parent = this.tags[temp_parent + 'parent']; //and set the current parent
        }
        delete this.tags[tag + this.tags[tag + 'count'] + 'parent']; //delete the closed tags parent reference...
        delete this.tags[tag + this.tags[tag + 'count']]; //...and the tag itself
        if (this.tags[tag + 'count'] == 1) {
          delete this.tags[tag + 'count'];
        }
        else {
          this.tags[tag + 'count']--;
        }
      }
    }

    this.get_tag = function () { //function to get a full tag and parse its type
      var input_char = '',
          content = [],
          space = false,
          tag_start, tag_end;

      do {
        if (this.pos >= this.input.length) {
          return content.length?content.join(''):['', 'TK_EOF'];
        }

        input_char = this.input.charAt(this.pos);
        this.pos++;
        this.line_char_count++;

        if (this.Utils.in_array(input_char, this.Utils.whitespace)) { //don't want to insert unnecessary space
          space = true;
          this.line_char_count--;
          continue;
        }

        if (input_char === "'" || input_char === '"') {
          if (!content[1] || content[1] !== '!') { //if we're in a comment strings don't get treated specially
            input_char += this.get_unformatted(input_char);
            space = true;
          }
        }

        if (input_char === '=') { //no space before =
          space = false;
        }

        if (content.length && content[content.length-1] !== '=' && input_char !== '>'
            && space) { //no space after = or before >
          if (this.line_char_count >= this.max_char) {
            this.print_newline(false, content);
            this.line_char_count = 0;
          }
          else {
            content.push(' ');
            this.line_char_count++;
          }
          space = false;
        }
        if (input_char === '<') {
            tag_start = this.pos - 1;
        }
        content.push(input_char); //inserts character at-a-time (or string)
      } while (input_char !== '>');

      var tag_complete = content.join('');
      var tag_index;
      if (tag_complete.indexOf(' ') != -1) { //if there's whitespace, thats where the tag name ends
        tag_index = tag_complete.indexOf(' ');
      }
      else { //otherwise go with the tag ending
        tag_index = tag_complete.indexOf('>');
      }
      var tag_check = tag_complete.substring(1, tag_index).toLowerCase();
      if (tag_complete.charAt(tag_complete.length-2) === '/' ||
          this.Utils.in_array(tag_check, this.Utils.single_token)) { //if this tag name is a single tag type (either in the list or has a closing /)
        this.tag_type = 'SINGLE';
      }
      else if (tag_check === 'script') { //for later script handling
        this.record_tag(tag_check);
        this.tag_type = 'SCRIPT';
      }
      else if (tag_check === 'style') { //for future style handling (for now it justs uses get_content)
        this.record_tag(tag_check);
        this.tag_type = 'STYLE';
      }
      else if (this.Utils.in_array(tag_check, unformatted)) { // do not reformat the "unformatted" tags
        var comment = this.get_unformatted('</'+tag_check+'>', tag_complete); //...delegate to get_unformatted function
        content.push(comment);
        // Preserve collapsed whitespace either before or after this tag.
        if (tag_start > 0 && this.Utils.in_array(this.input.charAt(tag_start - 1), this.Utils.whitespace)){
            content.splice(0, 0, this.input.charAt(tag_start - 1));
        }
        tag_end = this.pos - 1;
        if (this.Utils.in_array(this.input.charAt(tag_end + 1), this.Utils.whitespace)){
            content.push(this.input.charAt(tag_end + 1));
        }
        this.tag_type = 'SINGLE';
      }
      else if (tag_check.charAt(0) === '!') { //peek for <!-- comment
        if (tag_check.indexOf('[if') != -1) { //peek for <!--[if conditional comment
          if (tag_complete.indexOf('!IE') != -1) { //this type needs a closing --> so...
            var comment = this.get_unformatted('-->', tag_complete); //...delegate to get_unformatted
            content.push(comment);
          }
          this.tag_type = 'START';
        }
        else if (tag_check.indexOf('[endif') != -1) {//peek for <!--[endif end conditional comment
          this.tag_type = 'END';
          this.unindent();
        }
        else if (tag_check.indexOf('[cdata[') != -1) { //if it's a <[cdata[ comment...
          var comment = this.get_unformatted(']]>', tag_complete); //...delegate to get_unformatted function
          content.push(comment);
          this.tag_type = 'SINGLE'; //<![CDATA[ comments are treated like single tags
        }
        else {
          var comment = this.get_unformatted('-->', tag_complete);
          content.push(comment);
          this.tag_type = 'SINGLE';
        }
      }
      else {
        if (tag_check.charAt(0) === '/') { //this tag is a double tag so check for tag-ending
          this.retrieve_tag(tag_check.substring(1)); //remove it and all ancestors
          this.tag_type = 'END';
        }
        else { //otherwise it's a start-tag
          this.record_tag(tag_check); //push it on the tag stack
          this.tag_type = 'START';
        }
        if (this.Utils.in_array(tag_check, this.Utils.extra_liners)) { //check if this double needs an extra line
          this.print_newline(true, this.output);
        }
      }
      return content.join(''); //returns fully formatted tag
    }

    this.get_unformatted = function (delimiter, orig_tag) { //function to return unformatted content in its entirety

      if (orig_tag && orig_tag.indexOf(delimiter) != -1) {
        return '';
      }
      var input_char = '';
      var content = '';
      var space = true;
      do {

        if (this.pos >= this.input.length) {
          return content;
        }

        input_char = this.input.charAt(this.pos);
        this.pos++

        if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
          if (!space) {
            this.line_char_count--;
            continue;
          }
          if (input_char === '\n' || input_char === '\r') {
            content += '\n';
            /*  Don't change tab indention for unformatted blocks.  If using code for html editing, this will greatly affect <pre> tags if they are specified in the 'unformatted array'
            for (var i=0; i<this.indent_level; i++) {
              content += this.indent_string;
            }
            space = false; //...and make sure other indentation is erased
            */
            this.line_char_count = 0;
            continue;
          }
        }
        content += input_char;
        this.line_char_count++;
        space = true;


      } while (content.indexOf(delimiter) == -1);
      return content;
    }

    this.get_token = function () { //initial handler for token-retrieval
      var token;

      if (this.last_token === 'TK_TAG_SCRIPT' || this.last_token === 'TK_TAG_STYLE') { //check if we need to format javascript
       var type = this.last_token.substr(7)
       token = this.get_contents_to(type);
        if (typeof token !== 'string') {
          return token;
        }
        return [token, 'TK_' + type];
      }
      if (this.current_mode === 'CONTENT') {
        token = this.get_content();
        if (typeof token !== 'string') {
          return token;
        }
        else {
          return [token, 'TK_CONTENT'];
        }
      }

      if (this.current_mode === 'TAG') {
        token = this.get_tag();
        if (typeof token !== 'string') {
          return token;
        }
        else {
          var tag_name_type = 'TK_TAG_' + this.tag_type;
          return [token, tag_name_type];
        }
      }
    }

    this.get_full_indent = function (level) {
      level = this.indent_level + level || 0;
      if (level < 1)
        return '';

      return Array(level + 1).join(this.indent_string);
    }


    this.printer = function (js_source, indent_character, indent_size, max_char, brace_style) { //handles input/output and some other printing functions

      this.input = js_source || ''; //gets the input for the Parser
      this.output = [];
      this.indent_character = indent_character;
      this.indent_string = '';
      this.indent_size = indent_size;
      this.brace_style = brace_style;
      this.indent_level = 0;
      this.max_char = max_char;
      this.line_char_count = 0; //count to see if max_char was exceeded

      for (var i=0; i<this.indent_size; i++) {
        this.indent_string += this.indent_character;
      }

      this.print_newline = function (ignore, arr) {
        this.line_char_count = 0;
        if (!arr || !arr.length) {
          return;
        }
        if (!ignore) { //we might want the extra line
          while (this.Utils.in_array(arr[arr.length-1], this.Utils.whitespace)) {
            arr.pop();
          }
        }
        arr.push('\n');
        for (var i=0; i<this.indent_level; i++) {
          arr.push(this.indent_string);
        }
      }

      this.print_token = function (text) {
        this.output.push(text);
      }

      this.indent = function () {
        this.indent_level++;
      }

      this.unindent = function () {
        if (this.indent_level > 0) {
          this.indent_level--;
        }
      }
    }
    return this;
  }

  /*_____________________--------------------_____________________*/

  multi_parser = new Parser(); //wrapping functions Parser
  multi_parser.printer(html_source, indent_character, indent_size, max_char, brace_style); //initialize starting values

  while (true) {
      var t = multi_parser.get_token();
      multi_parser.token_text = t[0];
      multi_parser.token_type = t[1];

    if (multi_parser.token_type === 'TK_EOF') {
      break;
    }

    switch (multi_parser.token_type) {
      case 'TK_TAG_START':
        multi_parser.print_newline(false, multi_parser.output);
        multi_parser.print_token(multi_parser.token_text);
        multi_parser.indent();
        multi_parser.current_mode = 'CONTENT';
        break;
      case 'TK_TAG_STYLE':
      case 'TK_TAG_SCRIPT':
        multi_parser.print_newline(false, multi_parser.output);
        multi_parser.print_token(multi_parser.token_text);
        multi_parser.current_mode = 'CONTENT';
        break;
      case 'TK_TAG_END':
        //Print new line only if the tag has no content and has child
        if (multi_parser.last_token === 'TK_CONTENT' && multi_parser.last_text === '') {
            var tag_name = multi_parser.token_text.match(/\w+/)[0];
            var tag_extracted_from_last_output = multi_parser.output[multi_parser.output.length -1].match(/<\s*(\w+)/);
            if (tag_extracted_from_last_output === null || tag_extracted_from_last_output[1] !== tag_name)
                multi_parser.print_newline(true, multi_parser.output);
        }
        multi_parser.print_token(multi_parser.token_text);
        multi_parser.current_mode = 'CONTENT';
        break;
      case 'TK_TAG_SINGLE':
        // Don't add a newline before elements that should remain unformatted.
        var tag_check = multi_parser.token_text.match(/^\s*<([a-z]+)/i);
        if (!tag_check || !multi_parser.Utils.in_array(tag_check[1], unformatted)){
            multi_parser.print_newline(false, multi_parser.output);
        }
        multi_parser.print_token(multi_parser.token_text);
        multi_parser.current_mode = 'CONTENT';
        break;
      case 'TK_CONTENT':
        if (multi_parser.token_text !== '') {
          multi_parser.print_token(multi_parser.token_text);
        }
        multi_parser.current_mode = 'TAG';
        break;
      case 'TK_STYLE':
      case 'TK_SCRIPT':
        if (multi_parser.token_text !== '') {
          multi_parser.output.push('\n');
          var text = multi_parser.token_text;
          if (multi_parser.token_type == 'TK_SCRIPT') {
            var _beautifier = typeof js_beautify == 'function' && js_beautify;
          } else if (multi_parser.token_type == 'TK_STYLE') {
            var _beautifier = typeof css_beautify == 'function' && css_beautify;
          }

          if (options.indent_scripts == "keep") {
            var script_indent_level = 0;
          } else if (options.indent_scripts == "separate") {
            var script_indent_level = -multi_parser.indent_level;
          } else {
            var script_indent_level = 1;
          }

          var indentation = multi_parser.get_full_indent(script_indent_level);
          if (_beautifier) {
            // call the Beautifier if avaliable
            text = _beautifier(text.replace(/^\s*/, indentation), options);
          } else {
            // simply indent the string otherwise
            var white = text.match(/^\s*/)[0];
            var _level = white.match(/[^\n\r]*$/)[0].split(multi_parser.indent_string).length - 1;
            var reindent = multi_parser.get_full_indent(script_indent_level -_level);
            text = text.replace(/^\s*/, indentation)
                   .replace(/\r\n|\r|\n/g, '\n' + reindent)
                   .replace(/\s*$/, '');
          }
          if (text) {
            multi_parser.print_token(text);
            multi_parser.print_newline(true, multi_parser.output);
          }
        }
        multi_parser.current_mode = 'TAG';
        break;
    }
    multi_parser.last_token = multi_parser.token_type;
    multi_parser.last_text = multi_parser.token_text;
  }
  return multi_parser.output.join('');
}
