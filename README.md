CSS+HTML
======================

Chrome/Chromium extension that allows you to capture CSS and HTML of an element and its children.

![Screenshot](https://github.com/ifugu/CSS_Plus_HTML/blob/master/img/screenshot.png?raw=true)

Usage
-----

You may install this extension from its google chrome webstore page [soon]


or download it and manually load as an 'Unpacked extension' via chrome extensions page.


Disclaimers
-----------

+ IT IS HIGHLY RECOMMENDED TO LEAVE THE EXTENSION DISABLED UNLESS YOU NEED IT. External stylesheets protected by CORs are injected a second time into the page.  This could cause the page to render incorrectly due to the order of execution of the CSS rules. It could also adversely affect the performance of web pages.
+ The extension uses Yahoo's YQL service to gain access to stylesheets that are restricted by cross origin request security.
+ Inherited styles are not captured for the user authored styles sections.
+ The Computed and All Styles sections are prone to error and sometime capture too much information while missing a few items. Performance is also very poor. A proper CSS parser should be used in the future to improve these features.

Bugs and Features
-----------------

If you found a bug or have a feature request, please create an issue here on GitHub.
https://github.com/ifugu/CSS_Plus_HTML/issues

Changelog
---------



Thanks to
------

+ **Konrad Dzwinel** for the CSS Diff extension that I used as a template.
+ **Nochum Sossonko** for the HTML formatting code http://jsbeautifier.org/
+ **Luc125** of StackOverflow http://stackoverflow.com/users/746757/luc125 for the computed styles code http://stackoverflow.com/questions/6209161/extract-the-current-dom-and-print-it-as-a-string-with-styles-intact
+ **kirilloid** of StackOverflow http://stackoverflow.com/users/255363/kirilloid for the basis of the user authored style capture code http://stackoverflow.com/questions/4781410/jquery-how-to-get-all-styles-css-defined-within-internal-external-document-w

Author
------

**Corey Meredith**

+ https://github.com/ifugu
+ https://twitter.com/ifugu
+ http://www.linkedin.com/pub/corey-meredith/0/375/38b

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