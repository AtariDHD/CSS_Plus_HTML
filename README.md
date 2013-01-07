CSS+HTML
======================

Chrome/Chromium extension that allows you to capture the page author or computed styles of the current inspected element along with the markup for the element and its children.

![Screenshot](https://github.com/ifugu/CSS_Plus_HTML/blob/master/img/screenshot.png?raw=true)

Installation
------------

You may install this extension from its 
[Google Chrome Webstore Page](https://chrome.google.com/webstore/detail/css%20html/pbgafccggboemhmcmnmglkgidbiigoeh?hl=en) or [download the source from Github](https://github.com/ifugu/CSS_Plus_HTML/) and manually load as an "Unpacked extension" via Chrome's extensions page.  Tick the "Developer Mode" checkbox on the extensions page to allow loading unpacked extensions.

Usage
-----
1. Inspect an element within a web page by:
    - Right-clicking on the element and selecting "Inspect Element".
    - OR open Chrome Developer Tools from the menu Tools > Developer Tools or by pressing F12. Then click the magnifying glass icon at the bottom. Now move the mouse pointer over the desired element in the web page and click to inspect it.
2. After an element is inspected, options to capture the styles and markup will be displayed in the right panel of the "Elements" tab under "CSS+HTML" (please see the screenshot).
3. Choose an output option:
    - Click "Author Styles" to capture:
        - CSS rules from external and embedded stylesheets that apply to the inspected element.
        - CSS rules from external and embedded stylesheets that apply to the inspected element's children.
        - HTML markup, including inline styles set via the "style" attribute, for the inspected element.
        - HTML markup, including inline styles set via the "style" attribute, for the inspected element's children.
        - Inheritable styles from parent elements. A mocked parent element is created with inheritable properties set on it.
    - Click "Author Styles (matching selectors only)" to capture:
        - Same as "Author Styles".
        - Selectors that do not match the inspected element or its children will be removed.
    - Click "Author Styles (inspected element only)" to capture:
        - CSS rules from external and embedded stylesheets that apply to the inspected element only.
        - HTML markup, including inline styles set via the "style" attribute, for the inspected element.
        - HTML markup, including inline styles set via the "style" attribute, for the inspected element's children.
        - Inheritable styles from parent elements. A mocked parent element is created with inheritable properties set on it.
    - Click "Author Styles (inspected element only, matching selectors only)" to capture:
        - Same as "Author Styles (inspected element only)".
        - Selectors that do not match the inspected element will be removed.
    - Click "Computed Styles" to capture:
        - This method attempts to capture all document author styles, including inherited author styles, for the inspected element and its children by calling getComputedStyle for each element. An attempt is made to include only document author styles and omit default and user agent styles.
    - Click "All Styles" to capture:
        - This method attempts to capture all styles for the inspected element and its children by calling getComputedStyle for each element. This option tends to be slow, overly aggressive at retrieving styles, inaccurate at times, and produces a ton of output. :(
4. The results will automatically be selected and focused for copying. Press CTRL-C or right click the output and choose copy.
5. If you inspect a different element while an output option is open, the output will be updated for the new element.


Disclaimers
-----------

+ The extension uses Yahoo's YQL service to gain access to stylesheets that are restricted by Cross-Origin-Request security. This can adversely affect the performance of web pages.
+ Author Styles results contain selectors that matched the inspected element and its children within the inspected page. Once the CSS rules are extracted into the Author Styles results panel, the selectors may no longer match due to parent elements that do not exist in the resulting document fragment.
+ The Computed and All Styles sections are prone to error and sometime capture too much information while missing a few items. Performance is also very poor.

Bugs and Features
-----------------

If you found a bug or have a feature request, please [create an issue here on GitHub](https://github.com/ifugu/CSS_Plus_HTML/issues).

Future Plans
------------
+ Create a "Computed Author Styles" section that gathers the author styles for the inspected element and its children along with inherited styles. The styles will be output as inline styles instead of CSS rulesets. This should produce a much improved version of getComputedStyles that is more intuitive and useful.
+ Refactor and clean up code. Increase code reuse.

Changelog
---------
+ v0.44: improved performance and minimized the number of inherited styles returned
+ v0.43: fixed support for local files
+ v0.42: fixed jquery conflict that would cause pages to malfunction
+ v0.41: added support for inherited styles to author styles

Thanks to
------

+ **[Konrad Dzwinel](https://github.com/kdzwinel)** for the [CSS Diff extension](https://github.com/kdzwinel/CSS-Diff) that I used as a template.
+ **Nochum Sossonko** for the [HTML formatting code](http://jsbeautifier.org/)
+ **[Luc125](http://stackoverflow.com/users/746757/luc125)** of StackOverflow for the [computed styles code](http://stackoverflow.com/questions/6209161/extract-the-current-dom-and-print-it-as-a-string-with-styles-intact)
+ **[kirilloid](http://stackoverflow.com/users/255363/kirilloid)** of StackOverflow for the basis of the [author style capture code](http://stackoverflow.com/questions/4781410/jquery-how-to-get-all-styles-css-defined-within-internal-external-document-w)

Author
------

**Corey Meredith**

+ [https://github.com/ifugu](https://github.com/ifugu)
+ [https://twitter.com/ifugu](https://twitter.com/ifugu)
+ [http://www.linkedin.com/pub/corey-meredith/0/375/38b](http://www.linkedin.com/pub/corey-meredith/0/375/38b)

License
-------

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.