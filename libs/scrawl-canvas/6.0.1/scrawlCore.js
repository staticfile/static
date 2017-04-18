//---------------------------------------------------------------------------------
// The MIT License (MIT)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//---------------------------------------------------------------------------------

/**
# scrawlCore

## Version 6.0.1 - 14 January 2017

Developed by Rik Roots - <rik.roots@gmail.com>, <rik@rikweb.org.uk>

Scrawl demo website: <http://scrawl.rikweb.org.uk>

## Purpose and features

The core module is the only essential file in Scrawl. It must always be directly, and completely, loaded into the web page before any Scrawl extensions are added to it. 

* Defines the Scrawl scope - __window.scrawl__

* Defines a number of utility methods used throughout Scrawl.js

* Defines the Scrawl library - all significant objects created by Scrawl can be found here

* Searches the DOM for &lt;canvas&gt; elements, and imports them into the Scrawl library

* Instantiates controllers (Pad objects) and wrappers (Cell objects) for each &lt;canvas&gt; element

* Instantiates Context engine objects for each Cell object

* Defines mouse functionality in relation to &lt;canvas&gt; elements

* Defines the core functionality for Entity objects to be displayed on &lt;canvas&gt; elements; the different types of Entitys are defined in separate extensions which need to be loaded into the core

* Defines Group objects, used to group entitys together for display and interaction purposes

* Defines Design objects - Gradient and RadialGradient - which can be used by Entity objects for their _fill_ and _stroke_ styles; additional Design objects (Pattern, Color) are defined in separate extensions

## Loading the module


@example
    <script src="path/to/scrawlCore-min.js"></script>

@module scrawlCore
**/

window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

var scrawl = window.scrawl || (function() {
	'use strict';
	var my = {};

	/**
# window.scrawl

The Scrawl library object. All objects, attributes and functions contained in the library can be accessed by any other JavaScript code running on the web page.

The library will expand and change as Scrawl extensions load.

## Purpose:

* Holds links to every substantive object created by Scrawl.js and user code
* Also holds links to key DOM objects
* Functions for loading canvas elements on initialization, and for dynamically creating canvases on the web page
* Shorthand functions for rendering canvases
* Some general helper functions for testing variables that can be used by coders 

Core creates the following sections in the library:

* scrawl.__object__ - Contains key:value pairs for storing miscellaneous objects, for instance handles to DOM image elements imported into scrawl via scrawl.getImagesByClass()
* scrawl.__pad__ - Contains PADNAME:Object pairs for each instantiated Pad canvas controller object
* scrawl.__cell__ - Contains CELLNAME:Object pairs for each instantiated Cell canvas wrapper object
* scrawl.__canvas__ - Contains CELLNAME:object pairs linking to each Cell object's DOM &lt;canvas&gt; element
* scrawl.__context__ - Contains CELLNAME:Object pairs linking to each &lt;canvas&gt; element's context engine
* scrawl.__ctx__ - Contains CONTEXTNAME:Object pairs linking to each instantiated Scrawl Context object (used by Cell and Entity objects)
* scrawl.__imageData__ - Contains key:value pairs linking to JavaScript image data objects
* scrawl.__group__ - Contains GROUPNAME:Object pairs linking to each instantiated Group object
* scrawl.__design__ - Contains DESIGNNAME:Object pairs for each instantiated design object (Gradient, RadialGradient, Pattern, Color)
* scrawl.__dsn__ - Contains DESIGNNAME:precompiled gradient/pattern context object pairs (Gradient, RadialGradient, Pattern)
* scrawl.__entity__ - Contains SPRITENAME:Object pairs for each instantiated entity object (Block, Phrase, Picture, Wheel, Path, Shape, Particle)

@class window.scrawl
**/

	/**
Scrawl.js version number
@property version
@type {String}
@default 6.0.1
@final
**/
	my.version = '6.0.1';
	/**
Array of array object keys used to define the sections of the Scrawl library
@property nameslist
@type {Array}
@private
**/
	my.work = {};
	my.work.nameslist = ['padnames', 'cellnames', 'ctxnames', 'groupnames', 'designnames', 'entitynames', 'animationnames'];
	/**
Array of objects which define the sections of the Scrawl library
@property sectionlist
@type {Array}
@private
**/
	my.work.sectionlist = ['pad', 'cell', 'canvas', 'context', 'ctx', 'imageData', 'group', 'design', 'dsn', 'entity', 'animation'];
	/**
For converting between degrees and radians
@property radian
@type {Number}
@default Math.PI/180
@final
**/
	my.work.radian = Math.PI / 180;
	/**
Flag - Promise API is supported by browser
@property promise
@type {Boolean}
@default null
@final
**/
	my.work.promise = null;
	/**
An Object containing OBJECTTYPE:Object pairs which in turn contain default attribute values for each Scrawl object constructor
@property d
@type {Object}
@private
**/
	my.work.d = {};
	/**
Work vector, for calculations
@property v
@type {Vector}
@private
**/
	my.work.v = null;
	/**
Work vector, for calculations
@property colv1
@type {Vector}
@private
**/
	my.work.colv1 = null;
	/**
Work vector, for calculations
@property colv2
@type {Vector}
@private
**/
	my.work.colv2 = null;
	/**
Default empty object - passed to various functions, to prevent them generating superfluous objects
@property o
@type {Object}
@private
**/
	my.work.o = {};
	/**
Work quaternions, for calculations
@property workquat
@type {Object}
@private
**/
	my.work.workquat = null;
	/**
DOM document fragment
@property f
@type {Object}
@private
**/
	my.work.f = document.createDocumentFragment();
	/**
Key:value pairs of extension alias:filename Strings, used by scrawl.loadExtensions()
@property loadAlias
@type {Object}
@private
**/
	my.work.loadAlias = {
		block: 'scrawlBlock',
		wheel: 'scrawlWheel',
		phrase: 'scrawlPhrase',
		path: 'scrawlPath',
		shape: 'scrawlShape',
		images: 'scrawlImages',
		animation: 'scrawlAnimation',
		collisions: 'scrawlCollisions',
		factories: 'scrawlPathFactories',
		color: 'scrawlColor',
		filters: 'scrawlFilters',
		physics: 'scrawlPhysics',
		saveload: 'scrawlSaveLoad',
		stacks: 'scrawlStacks',
		frame: 'scrawlFrame',
		quaternion: 'scrawlQuaternion',
		imageload: 'scrawlImageLoad'
	};
	/**
Array of loaded extensions arrays
@property extensions
@type {Array}
@private
**/
	my.work.extensions = [];
	/**
Array of loaded extensions arrays (name changed from modules to extensions because Scrawl 'modules' are not modules)
@property modules
@type {Array}
@private
@deprecated
**/
	my.work.modules = my.work.extensions;
	/**
Device object - holds details about the browser environment and viewport
@property device
@type {Object}
**/
	my.device = {};
	/**
Key:value pairs of extension alias:Array, used by scrawl.loadExtensions()
@property loadDependencies
@type {Object}
@private
**/
	my.work.loadDependencies = {
		block: [],
		wheel: [],
		phrase: [],
		path: [],
		shape: [],
		images: ['imageload'],
		imageload: [],
		animation: [],
		collisions: [],
		factories: [],
		color: [],
		filters: [],
		physics: ['quaternion'],
		saveload: [],
		stacks: ['quaternion'],
		frame: [],
		quaternion: []
	};
	/**
A __general__ function that initializes (or resets) the Scrawl library and populates it with data, including existing &lt;canvas&gt; element data in the web page
@method init
@return The Scrawl library object (scrawl)
@chainable
@example
    scrawl.init();
**/
	my.init = function() {
		if (!my.entity) {
			my.reset();
			my.device = new my.Device();
			my.pageInit();
			my.createDefaultPad();
			my.setDisplayOffsets('all');
			my.physicsInit();
			my.filtersInit();
			my.animationInit();
		}
		return my;
	};
	/**
scrawl.init hook function - modified by stacks extension
@method pageInit
@private
**/
	my.pageInit = function() {
		if (my.device.canvas) {
			my.getCanvases();
		}
	};
	/**
scrawl.init hook function - modified by physics extension
@method physicsInit
@private
**/
	my.physicsInit = function() {};
	/**
scrawl.init hook function - modified by filters extension
@method filtersInit
@private
**/
	my.filtersInit = function() {};
	/**
scrawl.init hook function - modified by stacks extension
@method pageInit
@private
**/
	my.createDefaultPad = function() {
		var p, cellname, name;
		if (my.device.canvas) {
			name = 'defaultHiddenCanvasElement';
			p = my.addCanvasToPage({
				name: name,
			});
			name = p.name;
			cellname = name + '_base';
			my.removeItem(my.padnames, name);
			my.removeItem(my.work.activeListeners, name);
			my.work.f.appendChild(my.canvas[name]);
			my.work.cv = my.canvas[cellname];
			my.work.cvx = my.context[cellname];
			my.work.cvmodel = my.ctx[cellname];
			my.work.cvwrapper = my.cell[cellname];
			my.work.cvcontroller = my.pad[name];
		}
	};
	/**
A __general__ function that resets the Scrawl library to empty arrays and objects
@method reset
@return The Scrawl library object (scrawl)
@chainable
@example
    scrawl.reset();
**/
	my.reset = function() {
		for (var i = 0, iz = my.work.nameslist.length; i < iz; i++) {
			my[my.work.nameslist[i]] = [];
		}
		for (var j = 0, jz = my.work.sectionlist.length; j < jz; j++) {
			my[my.work.sectionlist[j]] = {};
		}
		return my;
	};
	/**
A __general__ function for loading img, css and js files

Copied and pasted (a terrible example - don't do this!) from https://davidwalsh.name/javascript-loader

All assets are added to the body tag in the DOM

This function auto-runs when scrawl.core loads
@method simpleLoader
@return Javascript object containing .css(), .js() and .img() load functions
@private
**/
	my.simpleLoader = (function() {
		function _load(tag) {
			return function(url) {
				return new Promise(function(resolve, reject) {
					var element = document.createElement(tag),
						parent = 'body',
						attr = 'src';
					element.onload = function() {
						resolve(url);
					};
					element.onerror = function() {
						reject(url);
					};
					switch (tag) {
						case 'script':
							element.type = 'text/javascript';
							element.async = true;
							break;
						case 'link':
							element.type = 'text/css';
							element.rel = 'stylesheet';
							attr = 'href';
							parent = 'head';
					}
					element[attr] = url;
					document[parent].appendChild(element);
				});
			};
		}
		return {
			css: _load('link'),
			js: _load('script'),
			img: _load('img')
		};
	})();
	/**
A __general__ function that checks to see if the Promise API is supported by the browser
@method checkForPromise
@return true if Promise is supported natively; false otherwise
@private
**/
	my.checkForPromise = function() {
		if (my.work.promise !== null) {
			return my.work.promise;
		}
		else {
			if (typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1) {
				my.work.promise = true;
				return true;
			}
			my.work.promise = false;
			return false;
		}
	};
	/**
A __general__ function that loads supporting extensions and integrates them into the core

Extension names are supplied as an array of Strings, each of which should be an _alias_ string, as follows:

Scrawl currently supports the following extensions:
* __scrawlAnimation.js__ - alias __animation__ - adds animation and tween functionality to the core
* __scrawlBlock.js__ - alias __block__ - adds _Block_ (square and rectangle) entitys to the core
* __scrawlCollisions.js__ - alias __collisions__ - adds entity collision detection functionality to the core
* __scrawlColor.js__ - alias __color__ - adds the _Color_ Design object to the core
* __scrawlFilters.js__ - alias __filters__ - adds image filter functionality to the core
* __scrawlFrame.js__ - alias __frame__ - enhanced Picture entity
* __scrawlImages.js__ - alias __images__ - adds all image functionality, including static and animated _Picture_ entitys and the _Pattern_ Design object, to the core
* __scrawlPath.js__ - alias __path__ - adds _Path_ (SVGTiny path data) entitys to the core
* __scrawlPathFactories.js__ - alias __factories__ - adds user-friendly Path and Shape factory functions (for lines, quadratic and bezier curves, ellipses, round-corner rectangles, regular shapes such as stars, triangles, etc) to the core
* __scrawlPhrase.js__ - alias __phrase__ - adds _Phrase_ (single and multiline text) entitys to the core
* __scrawlPerspective.js__ - alias __perspective__ - adds _Perspective_ functionality to the core (experimental)
* __scrawlPhysics.js__ - alias __physics__ - adds a physics engine to the core (experimental)
* __scrawlSaveLoad.js__ - alias __saveload__ - adds JSON object save and load functionality to the core (experimental)
* __scrawlShape.js__ - alias __shape__ - adds _Shape_ (path-like shapes) entitys to the core
* __scrawlStacks.js__ - alias __stacks__ - adds the ability to position, manipulate and animate &lt;canvas&gt; and other DOM elements in a 3d space on the web page
* __scrawlWheel.js__ - alias __wheel__ - adds _Wheel_ (circle and segment) entitys to the core
* __scrawlImageLoad.js__ - alias __imageload__ - adds the ability to load img elements into the library
* __scrawlQuaternion.js__ - alias __quaternion__ - adds quaternion maths functionality to the core

Where permitted, Scrawl will load extensions asynchronously. Extensions have no external dependencies beyond their need for the core module, and can be loaded in any order.

Any supplied callback function will only be run once all extensions have been loaded.

The argument object can include the following attributes:

* __path__ - String path-to-directory/folder where scrawl extension files are kept (default: '')
* __minified__ - Boolean - if true (default) minified extensions will be loaded; false for source extensions
* __extensions__ - an Array of extension alias Strings
* __callback__ - Function to run once all extension files have been loaded (defaults to an empty function)
* __error__ - Function to run if one or more extension files fails to load (defaults to an empty function)

@example
    <!DOCTYPE html>
    <html>
        <head></head>
        <body>
            <canvas></canvas>
            <script src="js/scrawlCore-min.js"></script>
            <script>
                var mycode = function(){
                    scrawl.makeWheel({
                        startX: 50,
                        startY: 50,
                        radius: 40,
                        });
                    scrawl.render();
                    };
                scrawl.loadExtensions({
                    path: 'js/',
                    extensions: ['wheel'],
                    callback: function(){
                        window.addEventListener('load', function(){
                            scrawl.init();
                            mycode();
                            }, false);
                        }
                    });
            </script>
        </body>
    </html>

@method loadExtensions
@param {Object} items - JavaScript object containing key:value pairs
@return The Scrawl library object (scrawl)
@chainable
**/
	my.loadExtensions = function(items) {
		if (my.checkForPromise()) {
			return my.loadExtensionsUsingPromise(items);
		}
		else {
			return my.loadExtensionsUsingVanilla(items);
		}
	};
	/**
loadExtensions helper function
@method loadExtensionsUsingVanilla
@param {Object} items - JavaScript object containing key:value pairs
@return The Scrawl library object (scrawl)
@chainable
@private
**/
	my.loadExtensionsUsingVanilla = function(items) {
		var path, callback, error, mini, tail, loaded, required, startTime, timeout, i, iz, getExtensions, done;
		items = my.safeObject(items);
		path = items.path || '';
		callback = (my.isa_fn(items.callback)) ? items.callback : function() {};
		error = (my.isa_fn(items.error)) ? items.error : function() {};
		mini = my.xtGet(items.minified, true);
		tail = (mini) ? '-min.js' : '.js';
		loaded = [];
		startTime = Date.now();
		timeout = 30000; // allow a maximum of 30 seconds to get all extensions
		getExtensions = function(ext) {
			var scriptTag,
				myExt = my.work.loadAlias[ext] || ext;
			if (!my.contains(my.work.extensions, myExt)) {
				scriptTag = document.createElement('script');
				scriptTag.type = 'text/javascript';
				scriptTag.async = 'true';
				scriptTag.onload = function(e) {
					done(ext);
				};
				scriptTag.onerror = function(e) {
					done(ext, true);
				};
				scriptTag.src = (/\.js$/.test(myExt)) ? path + myExt : path + myExt + tail;
				document.body.appendChild(scriptTag);
			}
		};
		done = function(m, e) {
			my.removeItem(loaded, m);
			if (e || Date.now() > startTime + timeout) {
				error();
			}
			else {
				my.pushUnique(my.work.extensions, m);
			}
			if (loaded.length === 0) {
				callback();
			}
		};
		required = my.loadExtensionsConcatenator(items);
		loaded = [].concat(required);
		for (i = 0, iz = required.length; i < iz; i++) {
			getExtensions(required[i]);
		}
		return my;
	};
	/**
loadExtensions helper function - uses the new Promise api, if it is available
@method loadExtensionsUsingPromise
@param {Object} items - JavaScript object containing key:value pairs
@return The Scrawl library object (scrawl)
@chainable
@private
**/
	my.loadExtensionsUsingPromise = function(items) {
		items = my.safeObject(items);
		var loader, path, file, alias, callback, error, mini, tail, required, request, i, iz;
		loader = my.simpleLoader;
		path = items.path || '';
		alias = my.work.loadAlias;
		callback = (my.isa_fn(items.callback)) ? items.callback : function() {};
		error = (my.isa_fn(items.error)) ? items.error : function() {};
		mini = my.xtGet(items.minified, true);
		tail = (mini) ? '-min.js' : '.js';
		required = my.loadExtensionsConcatenator(items);
		request = [];
		for (i = 0, iz = required.length; i < iz; i++) {
			file = alias[required[i]] || required[i];
			request.push(loader.js((/\.js$/.test(file)) ? path + file : path + file + tail));
		}
		Promise.all(request).then(callback).catch(error);
		return my;
	};
	/**
loadExtensions helper function
@method loadExtensionsConcatenator
@param {Object} items - JavaScript object containing key:value pairs
@return Array of extension aliases
@private
**/
	my.loadExtensionsConcatenator = function(items) {
		items = my.safeObject(items);
		var exts = [],
			required = [],
			xt = my.xt,
			pu = my.pushUnique,
			depends = my.work.loadDependencies,
			i, iz, j, jz;
		if (xt(items.extensions)) {
			exts = exts.concat([].concat(items.extensions));
		}
		if (xt(items.modules)) {
			exts = exts.concat([].concat(items.modules));
		}
		for (i = 0, iz = exts.length; i < iz; i++) {
			for (j = 0, jz = depends[exts[i]].length; j < jz; j++) {
				pu(required, depends[exts[i]][j]);
			}
			pu(required, exts[i]);
		}
		return required;
	};
	/**
A __general__ function that loads supporting extensions and integrates them into the core

(function name changed from loadModules to loadExtensions because Scrawl 'modules' are not modules)

@method loadModules
@param {Object} items - JavaScript object containing key:value pairs
@return The Scrawl library object (scrawl)
@chainable
@deprecated
**/
	my.loadModules = my.loadExtensions;
	/**
A __utility__ function that adds the attributes of the additive object to those of the reference object, where those attributes don't already exist in the reference object
@method mergeInto
@param {Object} o1 reference object
@param {Object} o2 additive object
@return Merged object
@example
    var old = {
            name: 'Peter',
            age: 42,
            job: 'lawyer'
            },
        new = {
            age: 32,
            job: 'coder',
            pet: 'cat'
            };
    scrawl.mergeInto(old, new);
    //result is {
    //  name: 'Peter',
    //  age: 42,
    //  job: 'lawyer'
    //  pet: 'cat'
    //  }
**/
	my.mergeInto = function(o1, o2) {
		for (var key in o2) {
			if (o2.hasOwnProperty(key) && !my.xt(o1[key])) {
				o1[key] = o2[key];
			}
		}
		return o1;
	};
	/**
A __utility__ function that adds the attributes of the additive object to those of the reference object, overwriting attributes where necessary
@method mergeOver
@param {Object} o1 reference object
@param {Object} o2 additive object
@return Merged object
@example
    var old = {
            name: 'Peter',
            age: 42,
            job: 'lawyer'
            },
        new = {
            age: 32,
            job: 'coder',
            pet: 'cat'
            };
    scrawl.mergeOver(old, new);
    //result is {
    //  name: 'Peter',
    //  age: 32,
    //  job: 'coder'
    //  pet: 'cat'
    //  }
**/
	my.mergeOver = function(o1, o2) {
		for (var key in o2) {
			if (o2.hasOwnProperty(key)) {
				o1[key] = o2[key];
			}
		}
		return o1;
	};
	/**
A __utility__ function that checks an array to see if it contains a given value
@method contains
@param {Array} item Reference array
@param {Mixed} k value to be checked
@return True if value is in array; false otherwise
@example
    var myarray = ['apple', 'orange'];
    scrawl.contains(myarray, 'apple');  //true
    scrawl.contains(myarray, 'banana'); //false
**/
	my.contains = function(item, k) {
		if (Array.isArray(item)) {
			return (item.indexOf(k) >= 0) ? true : false;
		}
		return false;
	};
	/**
A __utility__ function to convert strings (such as percentages) to integer values
@method toInt
@param {String} item
@return Integer number; 0 on error
**/
	my.toInt = function(item) {
		if (item.substring) {
			item = parseFloat(item);
		}
		return (item.toFixed) ? item | 0 : 0;
	};
	/**
A __utility__ function that adds a value to an array if the array doesn't already contain an element with that value
@method pushUnique
@param {Array} item Reference array
@param {Mixed} o value to be added to array
@return Amended array
@example
    var myarray = ['apple', 'orange'];
    scrawl.pushUnique(myarray, 'apple');    //returns ['apple', 'orange']
    scrawl.pushUnique(myarray, 'banana');   //returns ['apple', 'orange', 'banana']
**/
	my.pushUnique = function(item, o) {
		if (item.indexOf(o) < 0) {
			item.push(o);
		}
		return item;
	};
	/**
A __utility__ function that removes a value from an array
@method removeItem
@param {Array} item Reference array
@param {Mixed} o value to be removed from array
@return Amended array
@example
    var myarray = ['apple', 'orange'];
    scrawl.removeItem(myarray, 'banana');   //returns ['apple', 'orange']
    scrawl.removeItem(myarray, 'apple');    //returns ['orange']
**/
	my.removeItem = function(item, o) {
		var index = item.indexOf(o);
		if (index >= 0) {
			item.splice(index, 1);
		}
		return item;
	};
	/**
A __utility__ function that checks to see if a number is between two other numbers
@method isBetween
@param {Number} no Reference number
@param {Number} a Minimum or maximum number
@param {Number} b Maximum or minimum number
@param {Boolean} [e] If true, reference number can equal maximum/minimum number; on false, number must lie between the maximum and minimum (default: false)
@return True if value is between maximum and minimum; false otherwise
@example
    scrawl.isBetween(3, 1, 5);          //returns true
    scrawl.isBetween(3, 3, 5);          //returns false
    scrawl.isBetween(3, 3, 5, true);    //returns true
**/
	my.isBetween = function(no, a, b, e) {
		var value;
		if (a > b) {
			value = a;
			a = b;
			b = value;
		}
		if (e) {
			if (no >= a && no <= b) {
				return true;
			}
			return false;
		}
		else {
			if (no > a && no < b) {
				return true;
			}
			return false;
		}
	};
	/**
A __utility__ function for variable type checking

Valid identifier Strings include:

* __num__ for numbers
* __str__ for strings
* __bool__ for booleans
* __fn__ for Function objects
* __arr__ for Array objects
* __obj__ for Object objects (excluding DOM objects)
* __dom__ for DOM objects
* __event__ for DOM event objects
* __date__ for Date objects
* __vector__ for Scrawl Vector objects
* __quaternion__ for Scrawl Quaternion objects
@method isa
@param {Mixed} item Primative or object for identification
@param {String} identifier Identifier String
@return True if item type matches the identifier
@example
    var mystring = 'string',
        myboolean = false;
    scrawl.isa(mystring, 'bool');   //returns false
    scrawl.isa(mystring, 'str');    //returns true
    scrawl.isa(myboolean, 'bool');  //returns true
    scrawl.isa(myboolean, 'str');   //returns false
**/
	my.work.isa_whitelist = ['str', 'fn', 'arr', 'bool', 'canvas', 'date', 'dom', 'event', 'img', 'num', 'realnum', 'obj', 'quaternion', 'vector', 'video'];
	my.isa = function() {
		var len = arguments.length,
			arg, label;
		if (len == 2) {
			arg = arguments[0];
			label = arguments[1].toLowerCase();
			if (typeof arg != 'undefined' && my.work.isa_whitelist.indexOf(label) >= 0) {
				return my['isa_' + label](arg);
			}
		}
		return false;
	};
	my.isa_str = function(item) {
		return (item && item.substring) ? true : false;
	};
	my.isa_fn = function(item) {
		return (typeof item === 'function') ? true : false;
	};
	my.isa_arr = function(item) {
		return (Array.isArray(item)) ? true : false;
	};
	my.isa_bool = function(item) {
		return (typeof item === 'boolean') ? true : false;
	};
	my.isa_canvas = function(item) {
		return (Object.prototype.toString.call(item) === '[object HTMLCanvasElement]') ? true : false;
	};
	my.isa_date = function(item) {
		return (Object.prototype.toString.call(item) === '[object Date]') ? true : false;
	};
	my.isa_dom = function(item) {
		return (item && item.querySelector && item.dispatchEvent) ? true : false;
	};
	my.isa_event = function(item) {
		return (item && item.preventDefault && item.initEvent) ? true : false;
	};
	my.isa_img = function(item) {
		return (Object.prototype.toString.call(item) === '[object HTMLImageElement]') ? true : false;
	};
	my.isa_num = function(item) {
		return (item && item.toFixed) ? true : false;
	};
	my.isa_realnum = function(item) {
		return (item && item.toFixed && !isNaN(item) && isFinite(item)) ? true : false;
	};
	my.isa_obj = function(item) {
		return (Object.prototype.toString.call(item) === '[object Object]') ? true : false;
	};
	my.isa_quaternion = function(item) {
		return (item && item.type && item.type === 'Quaternion') ? true : false;
	};
	my.isa_vector = function(item) {
		return (item && item.type && item.type === 'Vector') ? true : false;
	};
	my.isa_video = function(item) {
		return (Object.prototype.toString.call(item) === '[object HTMLVideoElement]') ? true : false;
	};
	/**
Check to see if variable is an Object 
@method safeObject
@param {Mixed} items Variable for checking
@return Parameter being checked, if it is an object; returns an empty object on failure
@private
**/
	my.safeObject = function(items) {
		return (Object.prototype.toString.call(items) === '[object Object]') ? items : my.work.o;
	};
	/**
A __utility__ function for variable type checking
@method xt
@param {Mixed} item Primative or object for identification
@return False if item is 'undefined'
@example
    var mystring = 'string',
        myboolean;
    scrawl.xt(mystring);    //returns true
    scrawl.xt(myboolean);   //returns false
**/
	my.xt = function(item) {
		return (typeof item == 'undefined') ? false : true;
	};
	/**
A __utility__ function that checks an argument list of values and returns the first value that exists
@method xtGet
@return first defined variable; null if all values are undefined
**/
	my.xtGet = function() {
		var slice,
			i,
			iz;
		if (arguments.length > 0) {
			for (i = 0, iz = arguments.length; i < iz; i++) {
				if (typeof arguments[i] !== 'undefined') {
					return arguments[i];
				}
			}
		}
		return null;
	};
	/**
A __utility__ function that checks an argument list values and returns the first value that evaluates to true

False: 0, -0, '', undefined, null, false, NaN

@method xtGetTrue
@return first true variable; null if all values are false
**/
	my.xtGetTrue = function() {
		var slice,
			i,
			iz;
		if (arguments.length > 0) {
			for (i = 0, iz = arguments.length; i < iz; i++) {
				if (arguments[i]) {
					return arguments[i];
				}
			}
		}
		return null;
	};
	/**
A __utility__ function for variable type checking
@method xta
@param {Array} item Array of primatives or objects for identification
@return False if any item is 'undefined'
@example
    var mystring = 'string',
        mynumber = 0,
        myboolean;
    scrawl.xta([mystring, mynumber]);   //returns true
    scrawl.xta([mystring, myboolean]);  //returns false
**/
	my.xta = function() {
		var slice,
			i,
			iz;
		slice = arguments;
		if (Array.isArray(arguments[0])) {
			slice = arguments[0];
		}
		if (slice.length > 0) {
			for (i = 0, iz = slice.length; i < iz; i++) {
				if (typeof slice[i] === 'undefined') {
					return false;
				}
			}
			return true;
		}
		return false;
	};
	/**
A __utility__ function for variable type checking
@method xto
@return True if any item is not 'undefined'
@example
    var mystring = 'string',
        mynumber = 0,
        myboolean;
    scrawl.xto(mystring, mynumber); //returns true
    scrawl.xto(mystring, myboolean);    //returns true
**/
	my.xto = function() {
		var slice,
			i,
			iz;
		slice = arguments;
		if (Array.isArray(arguments[0])) {
			slice = arguments[0];
		}
		if (slice.length > 0) {
			for (i = 0, iz = slice.length; i < iz; i++) {
				if (typeof slice[i] !== 'undefined') {
					return true;
				}
			}
		}
		return false;
	};
	/**
Generate unique names for new Scrawl objects
@method makeName
@param {Object} [item] Object with attributes: name, type, target
@return Unique generated name
@private
**/
	my.makeName = function(item) {
		var name,
			nameArray;
		item = my.safeObject(item);
		if (my.contains(my.work.nameslist, item.target)) {
			name = my.xtGetTrue(item.name, item.type, 'default');
			name = name.replace(/[\.\/ \+\*\[\{\(\)~\-#\\\^\$\|\?]/g, '_');
			nameArray = name.split('___');
			return (my.contains(my[item.target], nameArray[0])) ? nameArray[0] + '___' + Math.floor(Math.random() * 100000000) : nameArray[0];
		}
		return false;
	};
	/**
A __general__ function to reset display offsets for all pads, stacks and elements

The argument is an optional String - permitted values include 'stack', 'pad', 'element'; default: 'all'

(This function is replaced by the scrawlStacks extension)
@method setDisplayOffsets
@param {String} [item] Command string detailing which element types are to be set
@return The Scrawl library object (scrawl)
@chainable
@example
    scrawl.setDisplayOffsets();
**/
	my.setDisplayOffsets = function() {
		var i,
			iz,
			padnames = my.padnames,
			pad = my.pad;
		for (i = 0, iz = padnames.length; i < iz; i++) {
			pad[padnames[i]].setDisplayOffsets();
		}
		return my;
	};
	/**
A __private__ function that searches the DOM for canvas elements and generates Pad/Cell/Context objects for each of them

(This function is replaced by the scrawlStacks extension)
@method getCanvases
@return True on success; false otherwise
@private
**/
	my.getCanvases = function() {
		var elements,
			pad,
			i,
			iz;
		elements = document.getElementsByTagName("canvas");
		if (elements.length > 0) {
			for (i = 0, iz = elements.length; i < iz; i++) {
				pad = my.makePad({
					canvasElement: elements[i]
				});
				if (i === 0) {
					my.work.currentPad = pad.name;
				}
			}
			return true;
		}
		return false;
	};
	/**
A __general__ function to add a visible &lt;canvas&gt; element to the web page, and create a Pad controller and Cell wrappers for it

The argument object should include the following attributes:

* __stackName__ (String) - STACKNAME of existing or new stack (optional)
* __parentElement__ - (String) CSS #id of parent element, or the DOM element itself; default: document.body
* any other legitimate Pad and/or Cell object attribute

(This function is replaced by the scrawlStacks extension)
@method addCanvasToPage
@param {Object} items Object containing new Cell's parameters
@return The new Pad object
@example
    <body>
        <div id="canvasholder"></div>
        <script src="js/scrawlCore-min.js"></script>
        <script>
            scrawl.addCanvasToPage({
                name:   'mycanvas',
                parentElement: 'canvasholder',
                width: 400,
                height: 200,
                }).makeCurrent();
        </script>
    </body>
**/
	my.addCanvasToPage = function(items) {
		var parent,
			canvas,
			pad,
			get = my.xtGet;
		items = my.safeObject(items);
		parent = document.getElementById(items.parentElement) || document.body;
		canvas = document.createElement('canvas');
		parent.appendChild(canvas);
		items.width = get(items.width, 300);
		items.height = get(items.height, 150);
		items.canvasElement = canvas;
		pad = new my.Pad(items);
		my.setDisplayOffsets();
		return pad;
	};
	/**
A __display__ function to ask Pads to get their Cells to clear their &lt;canvas&gt; elements
@method clear
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.clear = function(pads) {
		var padnames,
			pad = my.pad,
			i,
			iz;
		padnames = (pads) ? [].concat(pads) : my.padnames;
		for (i = 0, iz = padnames.length; i < iz; i++) {
			pad[padnames[i]].clear();
		}
		return my;
	};
	/**
A __display__ function to ask Pads to get their Cells to compile their scenes
@method compile
@param {Array} [pads] Array of PADNAMEs - can also be a String
@param {Vector} [mouse] coordinates to be used for any entity currently pivoted to a mouse/touch event
@return The Scrawl library object (scrawl)
@chainable
**/
	my.compile = function(pads, mouse) {
		var padnames,
			pad = my.pad,
			i,
			iz;
		padnames = (pads) ? [].concat(pads) : my.padnames;
		for (i = 0, iz = padnames.length; i < iz; i++) {
			pad[padnames[i]].compile(mouse);
		}
		return my;
	};
	/**
A __display__ function to ask Pads to show the results of their latest display cycle
@method show
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.show = function(pads) {
		var padnames,
			pad = my.pad,
			i,
			iz;
		padnames = (pads) ? [].concat(pads) : my.padnames;
		for (i = 0, iz = padnames.length; i < iz; i++) {
			pad[padnames[i]].show();
		}
		return my;
	};
	/**
A __display__ function to ask Pads to undertake a complete clear-compile-show display cycle
@method render
@param {Array} [pads] Array of PADNAMEs - can also be a String
@param {Vector} [mouse] coordinates to be used for any entity currently pivoted to a mouse/touch event
@return The Scrawl library object (scrawl)
@chainable
**/
	my.render = function(pads, mouse) {
		var padnames,
			pad = my.pad,
			i,
			iz;
		padnames = (pads) ? [].concat(pads) : my.padnames;
		for (i = 0, iz = padnames.length; i < iz; i++) {
			pad[padnames[i]].render(mouse);
		}
		return my;
	};
	/**
A __utility__ function to add two percent strings together
@method addPercentages
@param {String} a - first value
@param {String} b - second value
@return String result
**/
	my.addPercentages = function(a, b) {
		a = parseFloat(a);
		b = parseFloat(b);
		return (a + b) + '%';
	};
	/**
A __utility__ function to reverse the value of a percentage string
@method reversePercentage
@param {String} a - value
@return String result
**/
	my.reversePercentage = function(a) {
		a = parseFloat(a);
		a = -a;
		return a + '%';
	};
	/**
A __utility__ function to subtract a percent string from another
@method subtractPercentages
@param {String} a - initial value
@param {String} b - value to be subtracted from initial value
@return String result
**/
	my.subtractPercentages = function(a, b) {
		a = parseFloat(a);
		b = parseFloat(b);
		return (a - b) + '%';
	};
	/**
A custom __event listener__ helper array
@property activeListeners
@type {Array}
@private
**/
	my.work.activeListeners = [];
	if (window.CustomEvent) {
		/**
A custom __event listener__ function

The touchenter event is deprecated, but necessary for scrawl functionality

@method triggerTouchEnter
@private
**/
		my.triggerTouchEnter = function(e, el) {
			my.updateCustomTouch(e, el, 'touchenter');
		};
		/**
A custom __event listener__ function

The touchleave event is deprecated, but necessary for scrawl functionality

@method triggerTouchLeave
@private
**/
		my.triggerTouchLeave = function(e, el) {
			my.updateCustomTouch(e, el, 'touchleave');
		};
		/**
A custom __event listener__ function

The touchfollow event is entirely custom, designed to allow elements to subscribe to an event that started in a different element

@method triggerTouchFollow
@private
**/
		my.triggerTouchFollow = function(e, el) {
			my.updateCustomTouch(e, el, 'touchfollow');
		};
		/**
A custom __event listener__ helper function

@method cloneTouchEventItem
@private
**/
		my.cloneTouchEventItem = function(oT) {
			var nT = {};
			nT.clientX = oT.clientX;
			nT.clientY = oT.clientY;
			nT.force = oT.force;
			nT.identifier = oT.identifier;
			nT.pageX = oT.pageX;
			nT.pageY = oT.pageY;
			nT.radiusX = oT.radiusX;
			nT.radiusY = oT.radiusY;
			nT.screenX = oT.screenX;
			nT.screenY = oT.screenY;
			nT.target = oT.target;
			return nT;
		};
		/**
A custom __event listener__ helper function
@method updateCustomTouch
@private
**/
		my.updateCustomTouch = function(e, el, type) {
			var evt,
				changedTouches = [],
				targetTouches = [],
				touches = [],
				i, iz,
				xt = my.xt,
				getTouch = my.cloneTouchEventItem;
			if (xt(e.changedTouches)) {
				for (i = 0, iz = e.changedTouches.length; i < iz; i++) {
					changedTouches.push(getTouch(e.changedTouches[i]));
				}
			}
			if (xt(e.targetTouches)) {
				for (i = 0, iz = e.targetTouches.length; i < iz; i++) {
					targetTouches.push(getTouch(e.targetTouches[i]));
				}
			}
			if (xt(e.touches)) {
				for (i = 0, iz = e.touches.length; i < iz; i++) {
					touches.push(getTouch(e.touches[i]));
				}
			}
			evt = new CustomEvent(type, {
				altKey: e.altKey,
				bubbles: e.bubbles,
				cancelBubble: e.cancelBubble,
				cancelable: e.cancelable,
				changedTouches: changedTouches,
				charCode: e.charCode,
				clipboardData: e.clipboardData,
				ctrlKey: e.ctrlKey,
				currentTarget: e.currentTarget,
				defaultPrevented: e.defaultPrevented,
				detail: {},
				eventPhase: e.eventPhase,
				keyCode: e.eventPhase,
				layerX: e.layerX,
				layerY: e.layerY,
				metaKey: e.metaKey,
				pageX: e.pageX,
				pageY: e.pageY,
				path: e.path,
				returnValue: e.returnValue,
				shiftKey: e.shiftKey,
				srcElement: e.srcElement,
				target: e.target,
				targetTouches: targetTouches,
				timestamp: e.timestamp,
				touches: touches,
				view: e.view,
				which: e.which
			});
			el.dispatchEvent(evt);
		};
	}
	/**
A utility function for adding JavaScript event listeners to multiple elements
@method addNativeListener
@param {String} evt - or an Array of Strings
@param {Function} fn - function to be called when event triggers
@param {String} targ - either a querySelectorAll string, or a DOM element, or an Array of DOM elements
@return always true
**/
	my.addNativeListener = function(evt, fn, targ) {
		var targets, i, iz, j, jz;
		my.removeNativeListener(evt, fn, targ);
		evt = [].concat(evt);
		if (targ.substring) {
			targets = document.body.querySelectorAll(targ);
		}
		else if (Array.isArray(targ)) {
			targets = targ;
		}
		else {
			targets = [targ];
		}
		if (my.isa_fn(fn)) {
			for (j = 0, jz = evt.length; j < jz; j++) {
				for (i = 0, iz = targets.length; i < iz; i++) {
					targets[i].addEventListener(evt[j], fn, false);
				}
			}
		}
	};
	/**
A utility function for adding JavaScript event listeners to multiple elements
@method addNativeListener
@param {String} evt - or an Array of Strings
@param {Function} fn - function to be called when event triggers
@param {String} targ - either a querySelectorAll string, or a DOM element, or an Array of DOM elements
@return always true
**/
	my.removeNativeListener = function(evt, fn, targ) {
		var targets, i, iz, j, jz;
		evt = [].concat(evt);
		if (targ.substring) {
			targets = document.body.querySelectorAll(targ);
		}
		else if (Array.isArray(targ)) {
			targets = targ;
		}
		else {
			targets = [targ];
		}
		if (my.isa_fn(fn)) {
			for (j = 0, jz = evt.length; j < jz; j++) {
				for (i = 0, iz = targets.length; i < iz; i++) {
					targets[i].removeEventListener(evt[j], fn, false);
				}
			}
		}
	};
	/**
Adds event listeners to the element
@method addListener
@param {String} evt - or an Array of Strings from: 'up', 'down', 'enter', 'leave', 'move'
@param {Function} fn - function to be called when event triggers
@param {String} targ - either a querySelectorAll string, or a DOM element, or an Array of DOM elements
@return always true
**/
	my.addListener = function(evt, fn, targ) {
		var targets, i, iz, j, jz, nav;
		my.removeListener(evt, fn, targ);
		nav = (navigator.pointerEnabled || navigator.msPointerEnabled) ? true : false;
		evt = [].concat(evt);
		if (targ.substring) {
			targets = document.body.querySelectorAll(targ);
		}
		else if (Array.isArray(targ)) {
			targets = targ;
		}
		else {
			targets = [targ];
		}
		if (my.isa_fn(fn)) {
			for (j = 0, jz = evt.length; j < jz; j++) {
				for (i = 0, iz = targets.length; i < iz; i++) {
					if (my.isa_dom(targets[i])) {
						switch (evt[j]) {
							case 'move':
								if (nav) {
									targets[i].addEventListener('pointermove', fn, false);
								}
								else {
									targets[i].addEventListener('mousemove', fn, false);
									targets[i].addEventListener('touchmove', fn, false);
									targets[i].addEventListener('touchfollow', fn, false);
								}
								break;
							case 'up':
								if (nav) {
									targets[i].addEventListener('pointerup', fn, false);
								}
								else {
									targets[i].addEventListener('mouseup', fn, false);
									targets[i].addEventListener('touchend', fn, false);
								}
								break;
							case 'down':
								if (nav) {
									targets[i].addEventListener('pointerdown', fn, false);
								}
								else {
									targets[i].addEventListener('mousedown', fn, false);
									targets[i].addEventListener('touchstart', fn, false);
								}
								break;
							case 'leave':
								if (nav) {
									targets[i].addEventListener('pointerleave', fn, false);
								}
								else {
									targets[i].addEventListener('mouseleave', fn, false);
									targets[i].addEventListener('touchleave', fn, false);
								}
								break;
							case 'enter':
								if (nav) {
									targets[i].addEventListener('pointerenter', fn, false);
								}
								else {
									targets[i].addEventListener('mouseenter', fn, false);
									targets[i].addEventListener('touchenter', fn, false);
								}
								break;
						}
					}
				}
			}
		}
		return true;
	};
	/**
Remove event listeners from the element
@method removeListener
@param {String} evt - one from: 'up', 'down', 'enter', 'leave', 'move'
@param {Function} fn - function to be called when event triggers
@param {String} targ - either a querySelectorAll string, or a DOM element
@return true on success; false otherwise
**/
	my.removeListener = function(evt, fn, targ) {
		var targets, i, iz, j, jz, nav;
		evt = [].concat(evt);
		nav = (navigator.pointerEnabled || navigator.msPointerEnabled) ? true : false;
		if (targ.substring) {
			targets = document.body.querySelectorAll(targ);
		}
		else if (Array.isArray(targ)) {
			targets = targ;
		}
		else {
			targets = [targ];
		}

		if (my.isa_fn(fn)) {
			for (j = 0, jz = evt.length; j < jz; j++) {
				for (i = 0, iz = targets.length; i < iz; i++) {
					if (my.isa_dom(targets[i])) {
						switch (evt[j]) {
							case 'move':
								if (nav) {
									targets[i].removeEventListener('pointermove', fn, false);
								}
								else {
									targets[i].removeEventListener('mousemove', fn, false);
									targets[i].removeEventListener('touchmove', fn, false);
									targets[i].removeEventListener('touchfollow', fn, false);
								}
								break;
							case 'up':
								if (nav) {
									targets[i].removeEventListener('pointerup', fn, false);
								}
								else {
									targets[i].removeEventListener('mouseup', fn, false);
									targets[i].removeEventListener('touchend', fn, false);
								}
								break;
							case 'down':
								if (nav) {
									targets[i].removeEventListener('pointerdown', fn, false);
								}
								else {
									targets[i].removeEventListener('mousedown', fn, false);
									targets[i].removeEventListener('touchstart', fn, false);
								}
								break;
							case 'leave':
								if (nav) {
									targets[i].removeEventListener('pointerleave', fn, false);
								}
								else {
									targets[i].removeEventListener('mouseleave', fn, false);
									targets[i].removeEventListener('touchleave', fn, false);
								}
								break;
							case 'enter':
								if (nav) {
									targets[i].removeEventListener('pointerenter', fn, false);
								}
								else {
									targets[i].removeEventListener('mouseenter', fn, false);
									targets[i].removeEventListener('touchenter', fn, false);
								}
								break;
						}
					}
				}
			}
		}
		return true;
	};
	/**
A __utility__ function for performing bucket sorts on scrawl string arrays eg Group.entitys
@method bucketSort
@param {String} section scrawl library section name
@param {String} attribute on which sort will be performed
@param {Array} a array to be sorted
@return sorted array
@private
**/
	my.bucketSort = function(section, attribute, a) {
		var b, i, iz, o, f;
		b = [[]];
		for (i = 0, iz = a.length; i < iz; i++) {
			o = Math.floor(my[section][a[i]][attribute]);
			if (!b[o]) {
				b[o] = [];
			}
			b[o].push(a[i]);
		}
		f = [];
		for (i = 0, iz = b.length; i < iz; i++) {
			if (b[i]) {
				f.push(b[i]);
			}
		}
		return [].concat.apply([], f);
	};
	/**
General helper function - correct mouse coordinates if pad dimensions not equal to base cell dimensions

@method correctCoordinates
@param {Object} coords An object containing x and y attributes
@param {String} [cell] CELLNAME String
@return Amended coordinate object; false on error
**/
	my.correctCoordinates = function(coords, cell) {
		var vector,
			pad,
			w, h,
			get = my.xtGet;
		coords = my.safeObject(coords);
		vector = my.makeVector(coords);
		if (my.xta(coords.x, coords.y)) {
			cell = (my.cell[cell]) ? my.cell[cell] : my.cell[my.pad[my.work.currentPad].base];
			pad = my.pad[cell.pad];
			w = get(pad.localWidth, pad.width, 300);
			h = get(pad.localHeight, pad.height, 150);
			if (w !== cell.actualWidth) {
				vector.x /= (w / cell.actualWidth);
			}
			if (h !== cell.actualHeight) {
				vector.y /= (h / cell.actualHeight);
			}
			return vector;
		}
		return false;
	};
	/**
A __general__ function which passes on requests to Pads to generate new &lt;canvas&gt; elements and associated objects - see Pad.addNewCell() for more details
@method addNewCell
@param {Object} data Initial attribute values for new object
@param {String} pad PADNAME
@return New Cell object
**/
	my.addNewCell = function(data, pad) {
		pad = (pad && pad.substring) ? pad : my.work.currentPad;
		return my.pad[pad].addNewCell(data);
	};
	/**
A __general__ function which deletes Cell objects and their associated paraphinalia - see Pad.deleteCells() for more details
@method deleteCells
@param {Array} cells Array of CELLNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.deleteCells = function() {
		var slice,
			i,
			iz,
			j,
			jz,
			group = my.group,
			groupnames = my.groupnames,
			ri = my.removeItem;
		slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(slice[0])) {
			slice = slice[0];
		}
		for (i = 0, iz = slice.length; i < iz; i++) {
			for (j = 0, jz = my.padnames.length; j < jz; j++) {
				my.pad[my.padnames[j]].deleteCell(c[i]);
			}
			delete group[slice[i]];
			delete group[slice[i] + '_field'];
			delete group[slice[i] + '_fence'];
			ri(groupnames, slice[i]);
			ri(groupnames, slice[i] + '_field');
			ri(groupnames, slice[i] + '_fence');
			delete my.context[slice[i]];
			delete my.canvas[slice[i]];
			delete my.ctx[my.cell[slice[i]].context];
			ri(my.ctxnames, my.cell[slice[i]].context);
			delete my.cell[slice[i]];
			ri(my.cellnames, slice[i]);
		}
		return my;
	};
	/**
A __general__ function which adds supplied entitynames to Group.entitys attribute
@method addEntitysToGroups
@param {Array} groups Array of GROUPNAME Strings - can also be a String
@param {Array} entitys Array of SPRITENAME Strings - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.addEntitysToGroups = function(groups, entitys) {
		var groupArray,
			entityArray,
			group,
			i,
			iz;
		if (my.xta(groups, entitys)) {
			groupArray = [].concat(groups);
			entityArray = [].concat(entitys);
			for (i = 0, iz = groupArray.length; i < iz; i++) {
				group = my.group[groupArray[i]];
				if (group) {
					group.addEntitysToGroup(entityArray);
				}
			}
		}
		return my;
	};
	/**
A __general__ function which removes supplied entitynames from Group.entitys attribute
@method removeEntitysFromGroups
@param {Array} groups Array of GROUPNAME Strings - can also be a String
@param {Array} entitys Array of SPRITENAME Strings - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.removeEntitysFromGroups = function(groups, entitys) {
		var groupArray,
			entityArray,
			group,
			i,
			iz;
		if (my.xta(groups, entitys)) {
			groupArray = [].concat(groups);
			entityArray = [].concat(entitys);
			for (i = 0, iz = groupArray.length; i < iz; i++) {
				group = my.group[groupArray[i]];
				if (group) {
					group.removeEntitysFromGroup(entityArray);
				}
			}
		}
		return my;
	};
	/**
A __general__ function to delete entity objects
@method deleteEntity
@param {Array} items Array of SPRITENAME Strings - can also be a String
@return The Scrawl library object (scrawl)
@chainable
@example
    scrawl.makeBlock({
        name: 'myblock',
        });
    scrawl.deleteEntity(['myblock']);
**/
	my.deleteEntity = function() {
		var slice,
			i,
			iz,
			j,
			jz,
			k,
			kz,
			t,
			tz,
			targets,
			target,
			targetFlag,
			entityName,
			contextName,
			ri = my.removeItem,
			anim = my.animation,
			animnames = my.animationnames,
			a;
		slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(slice[0])) {
			slice = slice[0];
		}
		for (i = 0, iz = slice.length; i < iz; i++) {
			entityName = my.entity[slice[i]];
			if (entityName) {
				my.pathDeleteEntity(entityName);
				contextName = entityName.context;
				ri(my.ctxnames, contextName);
				delete my.ctx[contextName];
				ri(my.entitynames, slice[i]);
				delete my.entity[slice[i]];
				for (j = 0, jz = my.groupnames.length; j < jz; j++) {
					ri(my.group[my.groupnames[j]].entitys, slice[i]);
				}
			}
		}
		return my;
	};
	/**
scrawl.deleteEntity hook function - modified by path extension
@method pathDeleteEntity
@private
**/
	my.pathDeleteEntity = function(items) {};
	/**
Alias for makeVector()
@method newVector
@deprecated
**/
	my.newVector = function(items) {
		return my.makeVector(items);
	};
	/**
Alias for makePad()
@method newPad
@private
@deprecated
**/
	my.newPad = function(items) {
		return my.makePad(items);
	};
	/**
Alias for makeCell()
@method newCell
@private
@deprecated
**/
	my.newCell = function(items) {
		return my.makeCell(items);
	};
	/**
Alias for makeContext()
@method newContext
@private
@deprecated
**/
	my.newContext = function(items) {
		return my.makeContext(items);
	};
	/**
Alias for makeGroup()
@method newGroup
@deprecated
**/
	my.newGroup = function(items) {
		return my.makeGroup(items);
	};
	/**
Alias for makeGradient()
@method newGradient
@deprecated
**/
	my.newGradient = function(items) {
		return my.makeGradient(items);
	};
	/**
Alias for makeRadialGradient()
@method newRadialGradient
@deprecated
**/
	my.newRadialGradient = function(items) {
		return my.makeRadialGradient(items);
	};
	/**
A __factory__ function to generate new Vector objects
@method makeVector
@param {Object} items Key:value Object argument for setting attributes
@return Vector object
@example
    var myVector = scrawl.makeVector({
        x: 100,
        y: 200,
        });
**/
	my.makeVector = function(items) {
		return new my.Vector(items);
	};
	/**
A __factory__ function to generate new Pad objects
@method makePad
@param {Object} items Key:value Object argument for setting attributes
@return Pad object
@private
**/
	my.makePad = function(items) {
		return new my.Pad(items);
	};
	/**
A __factory__ function to generate new Cell objects
@method makeCell
@param {Object} items Key:value Object argument for setting attributes
@return Cell object
@private
**/
	my.makeCell = function(items) {
		return new my.Cell(items);
	};
	/**
A __factory__ function to generate new Context objects
@method makeContext
@param {Object} items Key:value Object argument for setting attributes
@return Context object
@private
**/
	my.makeContext = function(items) {
		return new my.Context(items);
	};
	/**
A __factory__ function to generate new Group objects
@method makeGroup
@param {Object} items Key:value Object argument for setting attributes
@return Group object
**/
	my.makeGroup = function(items) {
		return new my.Group(items);
	};
	/**
A __factory__ function to generate new Gradient objects
@method makeGradient
@param {Object} items Key:value Object argument for setting attributes
@return Gradient object
**/
	my.makeGradient = function(items) {
		return new my.Gradient(items);
	};
	/**
A __factory__ function to generate new RadialGradient objects
@method makeRadialGradient
@param {Object} items Key:value Object argument for setting attributes
@return RadialGradient object
**/
	my.makeRadialGradient = function(items) {
		return new my.RadialGradient(items);
	};
	my.setPerspectives = function() {};

	/**
# Vector

## Instantiation

* scrawl.makeVector()

## Purpose

* To hold vector (coordinate, movement) data
@class Vector
@constructor
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Vector = function(items) {
		items = my.safeObject(items);
		/**
X coordinate (px)
@property x
@type Number
@default 0
**/
		this.x = items.x || 0;
		/**
Y coodinate (px)
@property y
@type Number
@default 0
**/
		this.y = items.y || 0;
		/**
Z coordinate (px)
@property z
@type Number
@default 0
**/
		this.z = items.z || 0;
		/**
Vector name - not guaranteed to be unique
@property name
@type String
@default 'generic'
**/
		this.name = items.name || 'generic';
		return this;
	};
	my.Vector.prototype = Object.create(Object.prototype);
	/**
@property type
@type String
@default 'Vector'
@final
**/
	my.Vector.prototype.type = 'Vector';
	my.work.d.Vector = {
		x: 0,
		y: 0,
		z: 0,
		name: 'generic'
	};
	/**
Set the Vector's coordinates to values that will result in the given magnitude
@method setMagnitudeTo
@param {Number} item New magnitude
@return This
@chainable
**/
	my.Vector.prototype.setMagnitudeTo = function(item) {
		this.normalize();
		this.scalarMultiply(item);
		if (this.getMagnitude() !== item) {
			this.normalize();
			this.scalarMultiply(item);
			if (this.getMagnitude() !== item) {
				this.normalize();
				this.scalarMultiply(item);
			}
		}
		return this;
	};
	/**
Normalize the Vector to a unit vector
@method normalize
@return This
@chainable
**/
	my.Vector.prototype.normalize = function() {
		var val = this.getMagnitude();
		if (val > 0) {
			this.x /= val;
			this.y /= val;
			this.z /= val;
		}
		return this;
	};
	/**
Set all attributes to zero
@method zero
@return This
@chainable
**/
	my.Vector.prototype.zero = function() {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		return this;
	};
	/**
Set attributes to new values
@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
	my.Vector.prototype.set = function(items) {
		items = my.safeObject(items);
		var get = my.xtGet;
		this.x = (get(items.x, this.x));
		this.y = (get(items.y, this.y));
		this.z = (get(items.z, this.z));
		return this;
	};
	/**
Compare two Vector objects for equality
@method isEqual
@param {Mixed} item Object to be tested against this
@return True if argument object is a Vector, and all attributes match; false otherwise
**/
	my.Vector.prototype.isEqual = function(item) {
		if (my.isa_vector(item)) {
			if (this.x === item.x && this.y === item.y && this.z === item.z) {
				return true;
			}
		}
		return false;
	};
	/**
Comparea vector-like object to this one for equality
@method isLike
@param {Mixed} item Object to be tested against this
@return True if all attributes match; false otherwise
**/
	my.Vector.prototype.isLike = function(item) {
		if (my.isa_obj(item)) {
			if (this.x === item.x && this.y === item.y && this.z === item.z) {
				return true;
			}
		}
		return false;
	};
	/**
extracts x and y data
@method getData
@return Object (not vector) with x and y attributes
**/
	my.Vector.prototype.getData = function() {
		return {
			x: this.x,
			y: this.y,
			z: this.z
		};
	};
	/**
Check if x and y attributes are set
@method hasCoordinates
@param {Mixed} item Object to be tested
@return True if argument possesses x and y attributes
**/
	my.Vector.prototype.hasCoordinates = function(item) {
		return (my.xta(item, item.x, item.y)) ? true : false;
	};
	/**
Add a Vector to this Vector

@method vectorAdd
@param {Object} item Vector to be added to this; can also be an Object with x, y and z attributes (all optional)
@return This
@chainable
**/
	my.Vector.prototype.vectorAdd = function(item) {
		item = my.safeObject(item);
		this.x += item.x || 0;
		this.y += item.y || 0;
		this.z += item.z || 0;
		return this;
	};
	/**
Subtract a Vector from this Vector
@method vectorSubtract
@param {Object} item Vector to be subtracted from this; can also be an Object with x, y and z attributes (all optional)
@return This
@chainable
**/
	my.Vector.prototype.vectorSubtract = function(item) {
		item = my.safeObject(item);
		this.x -= item.x || 0;
		this.y -= item.y || 0;
		this.z -= item.z || 0;
		return this;
	};
	/**
Multiply a Vector with this Vector
@method vectorMultiply
@param {Object} item Vector to be multiplied with this; can also be an Object with x, y and z attributes (all optional)
@return This
@chainable
**/
	my.Vector.prototype.vectorMultiply = function(item) {
		item = my.safeObject(item);
		this.x *= item.x || 1;
		this.y *= item.y || 1;
		this.z *= item.z || 1;
		return this;
	};
	/**
Divide a Vector into this Vector
@method vectorDivide
@param {Object} item Vector to be divided into this; can also be an Object with x, y and z attributes (all optional)
@return This
@chainable
**/
	my.Vector.prototype.vectorDivide = function(item) {
		item = my.safeObject(item);
		this.x /= ((item.x || 0) !== 0) ? item.x : 1;
		this.y /= ((item.y || 0) !== 0) ? item.y : 1;
		this.z /= ((item.z || 0) !== 0) ? item.z : 1;
		return this;
	};
	/**
Multiply this Vector by a scalar value
@method scalarMultiply
@param {Number} item Multiplier scalar
@return This
@chainable
**/
	my.Vector.prototype.scalarMultiply = function(item) {
		if (item.toFixed) {
			this.x *= item;
			this.y *= item;
			this.z *= item;
			return this;
		}
		return this;
	};
	/**
Divide this Vector by a scalar value
@method scalarDivide
@param {Number} item Division scalar
@return This
@chainable
**/
	my.Vector.prototype.scalarDivide = function(item) {
		if ((item.toFixed) && item !== 0) {
			this.x /= item;
			this.y /= item;
			this.z /= item;
			return this;
		}
		return this;
	};
	/**
Retrieve Vector's magnitude value
@method getMagnitude
@return Magnitude value
**/
	my.Vector.prototype.getMagnitude = function() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
	};
	/**
Check to see if Vector is a zero vector
@method checkNotZero 
@return True if Vector is non-zero; false otherwise
**/
	my.Vector.prototype.checkNotZero = function() {
		return (this.x || this.y || this.z) ? true : false;
	};
	/**
Return a clone of this Vector
@method getVector
@return Clone of this Vector
**/
	my.Vector.prototype.getVector = function() {
		return my.makeVector({
			x: this.x,
			y: this.y,
			z: this.z
		});
	};
	/**
Obtain the cross product of one Vector and a copy of this, or another, Vector

Arithmetic is v(crossProduct)u, not u(crossProduct)v

@method getCrossProduct
@param {Object} u Vector to be used to calculate cross product; can also be an Object with x, y and z attributes (all optional)
@param {Vector} [v] Source vector (by default: this)
@return New cross product Vector; this on failure
@chainable
**/
	my.Vector.prototype.getCrossProduct = function(u, v) {
		var v1x,
			v1y,
			v1z,
			v2x,
			v2y,
			v2z;
		if (my.isa_obj(u)) {
			v = (my.isa_obj(v)) ? v : this;
			v1x = v.x || 0;
			v1y = v.y || 0;
			v1z = v.z || 0;
			v2x = u.x || 0;
			v2y = u.y || 0;
			v2z = u.z || 0;
			return my.makeVector({
				x: (v1y * v2z) - (v1z * v2y),
				y: -(v1x * v2z) + (v1z * v2x),
				z: (v1x * v2y) + (v1y * v2x)
			});
		}
		return this;
	};
	/**
Obtain the dot product of one Vector and this, or another, Vector

Arithmetic is v(dotProduct)u, not u(dotProduct)v

@method getDotProduct
@param {Object} u Vector to be used to calculate dot product; can also be an Object with x, y and z attributes (all optional)
@param {Vector} [v] Source vector (by default: this)
@return Dot product result; false on failure
**/
	my.Vector.prototype.getDotProduct = function(u, v) {
		if (my.isa_obj(u)) {
			v = (my.isa_obj(v)) ? v : this;
			return ((u.x || 0) * (v.x || 0)) + ((u.y || 0) * (v.y || 0)) + ((u.z || 0) * (v.z || 0));
		}
		return false;
	};
	/**
Obtain the triple scalar product of two Vectors and this, or a third, Vector
@method getTripleScalarProduct
@param {Object} u First vector to be used to calculate triple scalar product; can also be an Object with x, y and z attributes (all optional)
@param {Object} v Second vector to be used to calculate triple scalar product; can also be an Object with x, y and z attributes (all optional)
@param {Vector} [w] Third vector to be used to calculate triple scalar product (by default: this)
@return Triple scalar product result; false on failure
**/
	my.Vector.prototype.getTripleScalarProduct = function(u, v, w) {
		var ux,
			uy,
			uz,
			vx,
			vy,
			vz,
			wx,
			wy,
			wz;
		if (my.isa_obj(u) && my.isa_obj(v)) {
			w = (my.isa_obj(w)) ? w : this;
			ux = u.x || 0;
			uy = u.y || 0;
			uz = u.z || 0;
			vx = v.x || 0;
			vy = v.y || 0;
			vz = v.z || 0;
			wx = w.x || 0;
			wy = w.y || 0;
			wz = w.z || 0;
			return (ux * ((vy * wz) - (vz * wy))) + (uy * (-(vx * wz) + (vz * wx))) + (uz * ((vx * wy) - (vy * wx)));
		}
		return false;
	};
	/**
Rotate the Vector by a given angle
@method rotate
@param {Number} angle Rotation angle (in degrees)
@return This
@chainable
**/
	my.Vector.prototype.rotate = function(angle) {
		var stat_vr = [0, 0];
		if (angle.toFixed) {
			stat_vr[0] = Math.atan2(this.y, this.x);
			stat_vr[0] += (angle * 0.01745329251);
			stat_vr[1] = this.getMagnitude();
			this.x = stat_vr[1] * Math.cos(stat_vr[0]);
			this.y = stat_vr[1] * Math.sin(stat_vr[0]);
			return this;
		}
		return this;
	};
	/**
Rotate the Vector by 180 degrees
@method reverse
@return This
@chainable
**/
	my.Vector.prototype.reverse = function() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		return this;
	};
	/**
Rotate a Vector object by a Quaternion rotation
@method quaternionMultiply
@param {Quaternion} item Quaternion object
@param {Number} [mag] Magnitude value to which Vector needs to be set after rotation
@return Amended version of Vector; this on failure
@chainable
**/
	my.Vector.prototype.rotate3d = function(item, mag) {
		var q1,
			q2,
			q3,
			w;
		if (my.isa_quaternion(item)) {
			w = my.work.workquat;
			mag = (mag && mag.toFixed) ? mag : this.getMagnitude();
			q1 = w.q1.set(item);
			q2 = w.q2.set(this);
			q3 = w.q3.set(item).conjugate();
			q1.quaternionMultiply(q2);
			q1.quaternionMultiply(q3);
			this.set(q1.v).setMagnitudeTo(mag);
			return this;
		}
		return this;
	};

	/**
# Base 

## Instantiation

* This object should never be instantiated by users

## Purpose

* the root object for all other Scrawl objects (except Vectors, Quaternions)
* gives every object its (unique) name attribute
* also supplies title and comment attributes (very basic assistive technology)
* provides basic getter and setter functions, and a JSON-based toString function
* sets out the cloning strategy for other objects, and restricts which object types can be cloned
@class Base
@constructor
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Base = function(items) {
		items = my.safeObject(items);
		/**
Unique identifier for each object; default: computer-generated String based on Object's type
@property name
@type String
**/
		this.name = my.makeName({
			name: items.name,
			type: this.type,
			target: this.classname
		});
		return this;
	};
	my.Base.prototype = Object.create(Object.prototype);
	/**
@property type
@type String
@default 'Base'
@final
**/
	my.Base.prototype.type = 'Base';
	my.Base.prototype.classname = 'objectnames';
	my.work.d.Base = {
		/**
Comment, for accessibility
@property comment
@type String
@default ''
**/
		comment: '',
		/**
Title, for accessibility
@property title
@type String
@default ''
**/
		title: '',
		/**
Creation timestamp
@property timestamp
@type String
@default ''
**/
		timestamp: ''
	};
	/**
Retrieve an attribute value. If the attribute value has not been set, then the default value for that attribute will be returned.
@method get
@param {String} item Attribute key
@return Attribute value
@example
    var box = scrawl.makeBlock({
        width: 50,
        });
    box.get('width');               //returns 50
    box.get('height');              //returns 0
    box.get('favouriteAnimal');     //returns undefined
**/
	my.Base.prototype.get = function(item) {
		return my.xtGet(this[item], my.work.d[this.type][item]);
	};
	/**
Set attribute values. Multiple attributes can be set in the one call by including the attribute key:value pair in the argument object.

An attribute value will only be set if the object already has a default value for that attribute. This restricts the ability of coders to add attributes to Scrawl objects.
@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
@example
    var box = scrawl.makeBlock({
        width: 50,
        height: 50
        });
    box.set({
        height: 100,
        favouriteAnimal: 'cat'
        });
    box.get('width');               //returns 50
    box.get('height');              //returns 100
    box.get('favouriteAnimal');     //returns undefined
**/
	my.Base.prototype.set = function(items) {
		var d = my.work.d[this.type],
			xt = my.xt;
		for (var i in items) {
			if (xt(d[i])) {
				this[i] = items[i];
			}
		}
		return this;
	};
	/**
Clone a Scrawl.js object, optionally altering attribute values in the cloned object

Note that any callback or fn attribute functions will be referenced by the clone, not copied to the clone; these can be overwritten with new anonymous functions by including them in the items argument object

(This function is replaced by the path extension)

@method clone
@param {Object} items Object containing attribute key:value pairs; will overwrite existing values in the cloned, but not the source, Object
@return Cloned object
@chainable
@example
    var box = scrawl.makeBlock({
        width: 50,
        height: 50
        });
    var newBox = box.clone({
        height: 100
        });
    newBox.get('width');        //returns 50
    newBox.get('height');       //returns 100
**/
	my.Base.prototype.clone = function(items) {
		var merged,
			keys,
			that,
			i,
			iz;
		merged = my.mergeOver(this.parse(), my.safeObject(items));
		delete merged.context; //required for successful cloning of entitys
		keys = Object.keys(this);
		that = this;
		for (i = 0, iz = keys.length; i < iz; i++) {
			if (my.isa_fn(this[keys[i]])) {
				merged[keys[i]] = that[keys[i]];
			}
		}
		return new my[this.type](merged);
	};
	/**
Turn the object into a JSON String
@method parse
@return object of object's currently set attributes
**/
	my.Base.prototype.parse = function() {
		return JSON.parse(JSON.stringify(this));
	};
	/**
Stamp helper function - convert string percentage values to numerical values
@method numberConvert
@param {String} val coordinate String
@param {Number} dim dimension value
@return Number - value
@private
**/
	my.Base.prototype.numberConvert = function(val, dim) {
		var result = parseFloat(val) / 100;
		if (isNaN(result)) {
			switch (val) {
				case 'right':
				case 'bottom':
					return dim;
				case 'center':
					return dim / 2;
				default:
					return 0;
			}
		}
		return result * dim;
	};

	/**
# Device

## Instantiation

* This object should never be instantiated by users

## Purpose

* Wraps the browser's viewport, and includes basic information about the device

@class Device
@constructor
@extends Base
**/
	my.Device = function() {
		this.name = 'scrawl_viewport';
		/**
viewport width
@property width
@type Number
@default calculated automatically
**/
		this.width = null;
		/**
viewport height
@property height
@type Number
@default calculated automatically
**/
		this.height = null;
		/**
viewport offset from the top of the document
@property offsetX
@type Number
@default calculated automatically
**/
		this.offsetX = null;
		/**
viewport offset from the left side of the document
@property offsetY
@type Number
@default calculated automatically
**/
		this.offsetY = null;
		/**
Device/browser is touch-enabled and we should expect to receive touch events
@property expectTouch
@type Number
@default calculated automatically
**/
		this.expectTouch = false;
		/**
canvas support

False if device does not support the canvas element; true otherwise
@property canvas
@type Boolean
@default false
**/
		this.canvas = false;
		/**
canvas global composite operation support: source-in

False if device incorrectly supports the GCO source-in functionality
@property canvasGcoSourceIn
@type Boolean
@default false
**/
		this.canvasGcoSourceIn = false;
		/**
canvas global composite operation support: source-out

False if device incorrectly supports the GCO source-out functionality
@property canvasGcoSourceOut
@type Boolean
@default false
**/
		this.canvasGcoSourceOut = false;
		/**
canvas global composite operation support: destination-atop

False if device incorrectly supports the GCO destination-atop functionality
@property canvasGcoDestinationAtop
@type Boolean
@default false
**/
		this.canvasGcoDestinationAtop = false;
		/**
canvas global composite operation support: destination-in

False if device incorrectly supports the GCO destination-in functionality
@property canvasGcoDestinationIn
@type Boolean
@default false
**/
		this.canvasGcoDestinationIn = false;
		/**
canvas global composite operation support: copy

False if device incorrectly supports the GCO copy functionality
@property canvasGcoCopy
@type Boolean
@default false
**/
		this.canvasGcoCopy = false;
		/**
canvas even-odd winding functionality

False if device does not support the canvas even-odd winding functionality; true otherwise
@property canvasEvenOddWinding
@type Boolean
@default false
**/
		this.canvasEvenOddWinding = false;
		/**
canvas dashed line functionality

False if device does not support the canvas dashed line functionality; true otherwise
@property canvasDashedLine
@type Boolean
@default false
**/
		this.canvasDashedLine = false;
		this.getDeviceData();
		return this;
	};
	my.Device.prototype = Object.create(my.Base.prototype);
	/**
@property type
@type String
@default 'Device'
@final
**/
	my.Device.prototype.type = 'Device';
	my.Device.prototype.classname = 'objectnames';
	my.work.d.Device = {
		width: null,
		height: null,
		offsetX: null,
		offsetY: null,
		expectTouch: false,
		canvas: false,
		canvasEvenOddWinding: false,
		canvasDashedLine: false,
		canvasGcoSourceIn: false,
		canvasGcoSourceOut: false,
		canvasGcoDestinationAtop: false,
		canvasGcoDestinationIn: false,
		canvasGcoCopy: false,
		video: false,
		videoAutoplay: false,
		videoForceFullScreen: false
	};
	my.mergeInto(my.work.d.Device, my.work.d.Base);

	/**
Feature detection
@method getDeviceData
@private
**/
	my.Device.prototype.getDeviceData = function() {
		this.checkCanvas();
		if (this.canvas) {
			this.checkCanvasEvenOddWinding();
			this.checkCanvasDashedLine();
			this.checkCanvasGco();
		}
		this.getViewportDimensions();
		this.getViewportPosition();
		this.getStacksDeviceData();
		this.getImagesDeviceData();
		this.checkTouch();
	};
	/**
Check if we should expect to receive touch events

Modern IE uses pointer events, so Device will not check for IE specific touch-enabled devices

@method checkTouch
@private
**/
	my.Device.prototype.checkTouch = function() {
		var test = false;
		if ('ontouchstart' in window) {
			test = true;
		}
		else if (window.DocumentTouch && document instanceof DocumentTouch) {
			test = true;
		}
		this.expectTouch = test;
	};
	/**
Check if device supports canvas element
@method checkCanvas
@private
**/
	my.Device.prototype.checkCanvas = function() {
		var c = document.createElement('canvas'),
			test = c.getContext('2d');
		this.canvas = (test) ? true : false;
	};
	/**
Check if device supports canvas evenOdd winding
@method checkCanvasEvenOddWinding
@private
**/
	my.Device.prototype.checkCanvasEvenOddWinding = function() {
		var c = document.createElement('canvas'),
			x = c.getContext('2d'),
			w = 'evenodd',
			test;
		c.width = 10;
		c.height = 10;
		x.beginPath();
		x.moveTo(0, 0);
		x.lineTo(10, 0);
		x.lineTo(10, 10);
		x.lineTo(0, 10);
		x.lineTo(0, 0);
		x.moveTo(3, 3);
		x.lineTo(7, 3);
		x.lineTo(7, 7);
		x.lineTo(3, 7);
		x.lineTo(3, 3);
		x.moveTo(0, 0);
		x.closePath();
		x.mozFillRule = w;
		x.msFillRule = w;
		x.fill(w);
		test = x.getImageData(5, 5, 1, 1);
		this.canvasEvenOddWinding = (test.data[3]) ? false : true;
	};
	/**
Check if device supports dashed line functionality
@method checkCanvasDashedLine
@private
**/
	my.Device.prototype.checkCanvasDashedLine = function() {
		var c = document.createElement('canvas'),
			x = c.getContext('2d'),
			d = [5, 5],
			test;
		c.width = 10;
		c.height = 10;
		x.mozDash = d;
		x.lineDash = d;
		try {
			x.setLineDash(d);
		}
		catch (e) {}
		x.lineWidth = 10;
		x.beginPath();
		x.moveTo(0, 5);
		x.lineTo(10, 5);
		x.stroke();
		test = x.getImageData(8, 5, 1, 1);
		this.canvasDashedLine = (test.data[3]) ? false : true;
	};
	/**
Check if device supports various global composition operation functionalities
@method checkCanvasGco
@private
**/
	my.Device.prototype.checkCanvasGco = function() {
		var c = document.createElement('canvas'),
			x = c.getContext('2d'),
			test;
		c.width = 10;
		c.height = 10;

		// canvasGcoSourceIn
		x.fillStyle = 'red';
		x.fillRect(3, 0, 4, 10);
		x.globalCompositeOperation = 'source-in';
		x.fillStyle = 'blue';
		x.fillRect(0, 3, 10, 4);
		test = x.getImageData(5, 1, 1, 1);
		this.canvasGcoSourceIn = (test.data[3]) ? false : true;
		x.globalCompositeOperation = 'source-over';
		x.clearRect(0, 0, 10, 10);

		// canvasGcoSourceOut
		x.fillStyle = 'red';
		x.fillRect(3, 0, 4, 10);
		x.globalCompositeOperation = 'source-out';
		x.fillStyle = 'blue';
		x.fillRect(0, 3, 10, 4);
		test = x.getImageData(5, 1, 1, 1);
		this.canvasGcoSourceOut = (test.data[3]) ? false : true;
		x.globalCompositeOperation = 'source-over';
		x.clearRect(0, 0, 10, 10);

		// canvasGcoDestinationAtop
		x.fillStyle = 'red';
		x.fillRect(3, 0, 4, 10);
		x.globalCompositeOperation = 'destination-atop';
		x.fillStyle = 'blue';
		x.fillRect(0, 3, 10, 4);
		test = x.getImageData(5, 1, 1, 1);
		this.canvasGcoDestinationAtop = (test.data[3]) ? false : true;
		x.globalCompositeOperation = 'source-over';
		x.clearRect(0, 0, 10, 10);

		// canvasGcoDestinationIn
		x.fillStyle = 'red';
		x.fillRect(3, 0, 4, 10);
		x.globalCompositeOperation = 'destination-in';
		x.fillStyle = 'blue';
		x.fillRect(0, 3, 10, 4);
		test = x.getImageData(5, 1, 1, 1);
		this.canvasGcoDestinationIn = (test.data[3]) ? false : true;
		x.globalCompositeOperation = 'source-over';
		x.clearRect(0, 0, 10, 10);

		// canvasGcoCopy
		x.fillStyle = 'red';
		x.fillRect(3, 0, 4, 10);
		x.globalCompositeOperation = 'copy';
		x.fillStyle = 'blue';
		x.fillRect(0, 3, 10, 4);
		test = x.getImageData(5, 1, 1, 1);
		this.canvasGcoCopy = (test.data[3]) ? false : true;
	};
	/**
Determine viewport dimensions
@method getViewportDimensions
@return Boolean - true if dimensions have changed; false otherwise
@private
**/
	my.Device.prototype.getViewportDimensions = function(e) {
		var d, w, h;
		if (e) {
			d = my.device;
			w = d.width;
			h = d.height;
			d.width = document.documentElement.clientWidth - 1;
			d.height = document.documentElement.clientHeight - 1;
			return (w != d.width || h != d.height) ? true : false;
		}
		w = this.width;
		h = this.height;
		this.width = document.documentElement.clientWidth - 1;
		this.height = document.documentElement.clientHeight - 1;
		return (w != this.width || h != this.height) ? true : false;
	};
	/**
Determine viewport position within the page
@method getViewportPosition
@return Boolean - true if scrolling has occurred; false otherwise
@private
**/
	my.Device.prototype.getViewportPosition = function(e) {
		var d, get, ox, oy, doc;
		if (e) {
			d = my.device;
			get = my.xtGet;
			ox = d.offsetX;
			oy = d.offsetY;
			d.offsetX = get(e.pageX, e.target.offsetX, 0);
			d.offsetY = get(e.pageY, e.target.offsetY, 0);
			return (ox != d.offsetX || oy != d.offsetY) ? true : false;
		}
		doc = document.documentElement;
		ox = this.offsetX;
		oy = this.offsetY;
		this.offsetX = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
		this.offsetY = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
		return (ox != this.offsetX || oy != this.offsetY) ? true : false;
	};
	/**
Feature detection - hook function
@method getStacksDeviceData
@private
**/
	my.Device.prototype.getStacksDeviceData = function() {};
	/**
Feature detection - hook function
@method getImagesDeviceData
@private
**/
	my.Device.prototype.getImagesDeviceData = function() {};
	/**
Determine if viewport is in landscape mode - if width and height arte equal, landscape mode is assumend
@method isLandscape
@private
**/
	my.Device.prototype.isLandscape = function() {
		return (this.width < this.height) ? false : true;
	};
	/**
Determine if viewport is in portrait mode - if width and height arte equal, landscape mode is assumend
@method isPortrait
@private
**/
	my.Device.prototype.isPortrait = function() {
		return (this.width < this.height) ? true : false;
	};

	/**
# Position

## Instantiation

* This object should never be instantiated by users

## Purpose

* supplies objects with basic positional and scaling attributes, and methods for manipulating them
* start coordinates are relative to the top left corner of the object's Cell
* handle coordinates are relative to the object's start coordinate

Certain Scrawl extensions will add functionality to this object, for instance scrawlAnimation adds delta attributes which can be used to automatically update the position of a Scrawl entity.
@class Position
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Position = function(items) {
		var so = my.safeObject,
			d = my.work.d[this.type],
			get = my.xtGet,
			vec = my.makeVector;
		my.Base.call(this, items);
		items = so(items);
		/**
The coordinate Vector representing the object's rotation/flip point

SubScrawl, and all Objects that prototype chain to Subscrawl, supports the following 'virtual' attributes for this attribute:

* __startX__ - (Number) the x coordinate of the object's rotation/flip point, in pixels, from the left side of the object's cell
* __startY__ - (Number) the y coordinate of the object's rotation/flip point, in pixels, from the top side of the object's cell

@property start
@type Vector
**/
		var temp = so(items.start);
		this.start = vec({
			x: get(items.startX, temp.x, 0),
			y: get(items.startY, temp.y, 0),
			name: this.type + '.' + this.name + '.start'
		});
		this.currentStart = vec({
			name: this.type + '.' + this.name + '.current.start'
		});
		this.currentStart.flag = false;
		/**
An Object (in fact, a Vector) containing offset instructions from the object's rotation/flip point, where drawing commences. 

SubScrawl, and all Objects that prototype chain to Subscrawl, supports the following 'virtual' attributes for this attribute:

* __handleX__ - (Mixed) the horizontal offset, either as a Number (in pixels), or a percentage String of the object's width, or the String literal 'left', 'right' or 'center'
* __handleY__ - (Mixed) the vertical offset, either as a Number (in pixels), or a percentage String of the object's height, or the String literal 'top', 'bottom' or 'center'

Where values are Numbers, handle can be treated like any other Vector

@property handle
@type Object
**/
		temp = so(items.handle);
		this.handle = vec({
			x: get(items.handleX, temp.x, 0),
			y: get(items.handleY, temp.y, 0),
			name: this.type + '.' + this.name + '.handle'
		});
		this.currentHandle = vec({
			name: this.type + '.' + this.name + '.current.handle'
		});
		this.currentHandle.flag = false;
		/**
An object with the following attributes:

* __left__ - x coordinate of top-left corner of the enclosing box relative to the current cell's top-left corner
* __top__ - y coordinate of top-left corner of the enclosing box relative to the current cell's top-left corner
* __bottom__ - x coordinate of bottom-right corner of the enclosing box relative to the current cell's top-left corner
* __left__ - y coordinate of bottom-right corner of the enclosing box relative to the current cell's top-left corner
@property maxDimensions
@type Object
@default null
@private
**/
		this.maxDimensions = {
			flag: true,
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		};
		/**
The ENTITYNAME or POINTNAME of a entity or Point object to be used for setting this object's start point
@property pivot
@type String
@default null
**/
		this.pivot = get(items.pivot, d.pivot);
		/**
The object's scale value - larger values increase the object's size
@property scale
@type Number
@default 1
**/
		this.scale = get(items.scale, d.scale);
		/**
Current rotation of the entity, cell or element (in degrees)
@property roll
@type Number
@default 0
**/
		this.roll = get(items.roll, d.roll);
		/**
Reflection flag; set to true to flip entity, cell or element along the Y axis
@property flipReverse
@type Boolean
@default false
**/
		this.flipReverse = get(items.flipReverse, d.flipReverse);
		/**
Reflection flag; set to true to flip entity, cell or element along the X axis
@property flipUpend
@type Boolean
@default false
**/
		this.flipUpend = get(items.flipUpend, d.flipUpend);
		/**
Positioning flag; set to true to ignore path/pivot/mouse changes along the X axis
@property lockX
@type Boolean
@default false
**/
		this.lockX = get(items.lockX, d.lockX);
		/**
Positioning flag; set to true to ignore path/pivot/mouse changes along the Y axis
@property lockY
@type Boolean
@default false
**/
		this.lockY = get(items.lockY, d.lockY);
		/**
Index of mouse vector to use when pivot === 'mouse'

The Pad.mice object can hold details of multiple touch events - when an entity is assigned to a 'mouse', it needs to know which of those mouse trackers to use. Default: mouse (for the mouse cursor vector)
@property mouseIndex
@type String
@default 'mouse'
**/
		this.mouseIndex = get(items.mouseIndex, 'mouse');
		this.animationPositionInit(items);
		this.pathPositionInit(items);
		return this;
	};
	my.Position.prototype = Object.create(my.Base.prototype);
	/**
@property type
@type String
@default 'Position'
@final
**/
	my.Position.prototype.type = 'Position';
	my.Position.prototype.classname = 'objectnames';
	my.work.d.Position = {
		start: {
			x: 0,
			y: 0
		},
		currentStart: {
			x: 0,
			y: 0
		},
		handle: {
			x: 0,
			y: 0
		},
		currentHandle: {
			x: 0,
			y: 0
		},
		maxDimensions: {
			flag: true,
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		},
		pivot: null,
		scale: 1,
		flipReverse: false,
		flipUpend: false,
		lockX: false,
		lockY: false,
		roll: 0,
		mouseIndex: 'mouse',
		/**
Entity, cell or element width (in pixels)
@property width
@type Number
@default 0
**/
		width: 0,
		/**
Entity, cell or element height (in pixels)
@property height
@type Number
@default 0
**/
		height: 0
		/**
(Added by the path extension)
The ENTITYNAME of a Shape entity whose path is used to calculate this object's start point
@property path
@type String
@default ''
**/
		/**
(Added by the path extension)
A value between 0 and 1 to represent the distance along a Path object's path, where 0 is the path start and 1 is the path end
@property pathPlace
@type Number
@default 0
**/
		/**
(Added by the path extension)
A change value which can be applied to the object's pathPlace attribute
@property deltaPathPlace
@type Number
@default 0
**/
		/**
(Added by the path extension)
A flag to determine whether the object will calculate its position along a Shape path in a regular (true), or simple (false), manner
@property pathSpeedConstant
@type Boolean
@default true
**/
	};
	my.mergeInto(my.work.d.Position, my.work.d.Base);
	/**
Position constructor hook function - modified by animation extension
@method animationPositionInit
@private
**/
	my.Position.prototype.animationPositionInit = function(items) {};
	/**
Position constructor hook function - modified by path extension
@method pathPositionInit
@private
**/
	my.Position.prototype.pathPositionInit = function(items) {};
	/**
Augments Base.get(), to allow users to get values for start, startX, startY, handle, handleX, handleY

For 'start' and 'handle', returns a copy of the Vector
@method get
@param {String} get Attribute key
@return Attribute value
**/
	my.Position.prototype.get = function(item) {
		var stat_positionGet = ['startX', 'startY', 'handleX', 'handleY'];
		if (my.contains(stat_positionGet, item)) {
			switch (item) {
				case 'startX':
					return this.start.x;
				case 'startY':
					return this.start.y;
				case 'handleX':
					return this.handle.x;
				case 'handleY':
					return this.handle.y;
			}
		}
		return (this.animationPositionGet(item) || my.Base.prototype.get.call(this, item));
	};
	/**
Get the current start x coordinate
@method getX
@return Attribute value
**/
	my.Position.prototype.getX = function() {
		return this.currentStart.x;
	};
	/**
Get the current start y coordinate
@method getY
@return Attribute value
**/
	my.Position.prototype.getY = function() {
		return this.currentStart.y;
	};
	/**
Position.get hook function - modified by animation extension
@method animationPositionGet
@private
**/
	my.Position.prototype.animationPositionGet = function(item) {
		return false;
	};
	/**
Augments Base.set(), to allow users to set the start and handle attributes using startX, startY, handleX, handleY
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.set = function(items) {
		var xto = my.xto;
		items = my.safeObject(items);
		my.Base.prototype.set.call(this, items);
		if (xto(items.start, items.startX, items.startY)) {
			this.setStart(items);
		}
		if (xto(items.handle, items.handleX, items.handleY)) {
			this.setHandle(items);
		}
		if (xto(items.flipUpend, items.flipReverse, items.scale, items.width, items.height, items.roll)) {
			this.maxDimensions.flag = true;
			if (xto(items.scale, items.width, items.height)) {
				this.currentHandle.flag = false;
			}
		}
		if (my.xt(items.pivot)) {
			this.currentPivotIndex = false;
		}
		this.animationPositionSet(items);
		return this;
	};
	/**
Augments Base.setStart(), to allow users to set the start attributes using start, startX, startY
@method setStart
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setStart = function(items) {
		var temp,
			so = my.safeObject,
			get = my.xtGet,
			vec = my.makeVector,
			isvec = my.isa_vector;
		items = so(items);
		if (!isvec(this.start)) {
			this.start = vec(items.start || this.start);
			this.start.name = this.type + '.' + this.name + '.start';
		}
		temp = so(items.start);
		this.start.x = get(items.startX, temp.x, this.start.x);
		this.start.y = get(items.startY, temp.y, this.start.y);
		if (!isvec(this.currentStart)) {
			this.currentStart = vec({
				name: this.type + '.' + this.name + '.current.start'
			});
		}
		this.currentStart.flag = false;
		this.maxDimensions.flag = true;
		return this;
	};
	/**
Augments Base.setHandle(), to allow users to set the handle attributes using handle, handleX, handleY
@method setHandle
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setHandle = function(items) {
		var temp,
			so = my.safeObject,
			get = my.xtGet,
			vec = my.makeVector,
			isvec = my.isa_vector;
		items = so(items);
		if (!isvec(this.handle)) {
			this.handle = vec(items.handle || this.handle);
			this.handle.name = this.type + '.' + this.name + '.handle';
		}
		temp = so(items.handle);
		this.handle.x = get(items.handleX, temp.x, this.handle.x);
		this.handle.y = get(items.handleY, temp.y, this.handle.y);
		if (!isvec(this.currentHandle)) {
			this.currentHandle = vec({
				name: this.type + '.' + this.name + '.current.handle'
			});
		}
		this.currentHandle.flag = false;
		this.maxDimensions.flag = true;
		return this;
	};
	/**
Position.set hook function - modified by animation extension
@method animationPositionSet
@private
**/
	my.Position.prototype.animationPositionSet = function(items) {};
	my.Position.prototype.updateStart = function(item) {};
	my.Position.prototype.revertStart = function(item) {};
	my.Position.prototype.reverse = function(item) {};
	my.Position.prototype.setDeltaAttribute = function(items) {};

	/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function. This function also accepts startX, startY, handleX, handleY
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setDelta = function(items) {
		var xto = my.xto;
		items = my.safeObject(items);
		if (xto(items.start, items.startX, items.startY)) {
			this.setDeltaStart(items);
		}
		my.Position.prototype.pathPositionSetDelta.call(this, items);
		if (xto(items.handle, items.handleX, items.handleY)) {
			this.setDeltaHandle(items);
		}
		if (xto(items.scale, items.width, items.height, items.roll)) {
			if (items.scale) {
				this.setDeltaScale(items);
			}
			if (items.roll) {
				this.setDeltaRoll(items);
			}
			if (items.width) {
				this.setDeltaWidth(items);
			}
			if (items.height) {
				this.setDeltaHeight(items);
			}
			this.maxDimensions.flag = true;
			if (xto(items.scale, items.width, items.height)) {
				this.currentHandle.flag = false;
			}
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values; This function accepts start, startX, startY
@method setDeltaStart
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setDeltaStart = function(items) {
		var temp,
			x,
			y,
			so = my.safeObject,
			get = my.xtGet,
			perc = my.addPercentages;
		items = so(items);
		temp = so(items.start);
		x = get(items.startX, temp.x, 0);
		y = get(items.startY, temp.y, 0);
		this.start.x = (this.start.x.toFixed) ? this.start.x + x : perc(this.start.x, x);
		this.start.y = (this.start.y.toFixed) ? this.start.y + y : perc(this.start.y, y);
		this.currentStart.flag = false;
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values. This function accepts handle, handleX, handleY
@method setDeltaHandle
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setDeltaHandle = function(items) {
		var temp,
			x,
			y,
			so = my.safeObject,
			get = my.xtGet,
			perc = my.addPercentages;
		items = so(items);
		temp = so(items.handle);
		x = get(items.handleX, temp.x, 0);
		y = get(items.handleY, temp.y, 0);
		this.handle.x = (this.handle.x.toFixed) ? this.handle.x + x : perc(this.handle.x, x);
		this.handle.y = (this.handle.y.toFixed) ? this.handle.y + y : perc(this.handle.y, y);
		this.currentHandle.flag = false;
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values. This function accepts scale
@method setDeltaScale
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setDeltaScale = function(items) {
		items = my.safeObject(items);
		this.scale += items.scale || 0;
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values. This function accepts roll
@method setDeltaRoll
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setDeltaRoll = function(items) {
		items = my.safeObject(items);
		this.roll += items.roll || 0;
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values. This function accepts width
@method setDeltaWidth
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setDeltaWidth = function(items) {
		var w;
		items = my.safeObject(items);
		w = items.width || 0;
		this.width = (this.width.toFixed) ? this.width + w : my.addPercentages(this.width, w);
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values. This function accepts height
@method setDeltaHeight
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setDeltaHeight = function(items) {
		var h;
		items = my.safeObject(items);
		h = items.height || 0;
		this.height = (this.height.toFixed) ? this.height + h : my.addPercentages(this.height, h);
		return this;
	};
	/**
Position.setDelta hook function - modified by path extension
@method pathPositionSetDelta
@private
**/
	my.Position.prototype.pathPositionSetDelta = function(items) {};
	/**
Augments Base.clone(), to allow users to set the start and handle attributes using startX, startY, handleX, handleY

@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
	my.Position.prototype.clone = function(items) {
		var temp,
			clone,
			so = my.safeObject,
			vec = my.makeVector,
			get = my.xtGet;
		items = so(items);
		clone = my.Base.prototype.clone.call(this, items);
		temp = so(items.start);
		clone.start = vec({
			x: get(items.startX, temp.x, clone.start.x),
			y: get(items.startY, temp.y, clone.start.y),
			name: clone.type + '.' + clone.name + '.start'
		});
		temp = so(items.handle);
		clone.handle = vec({
			x: get(items.handleX, temp.x, clone.handle.x),
			y: get(items.handleY, temp.y, clone.handle.y),
			name: clone.type + '.' + clone.name + '.handle'
		});
		clone = this.animationPositionClone(clone, items);
		return clone;
	};
	/**
Position.setDelta hook function - modified by animation extension
@method animationPositionClone
@private
**/
	my.Position.prototype.animationPositionClone = function(a, items) {
		return a;
	};
	/**
updateCurrentHandle helper object

@method getReferenceDimensions
@param {Object} reference object - Stack, Pad, Element, Cell or Entity (Block, Wheel, Phrase, Picture, Path, Shape or Frame)
@return Object with attributes {w: width, h: height, c: centered}
@private
**/
	my.Position.prototype.getReferenceDimensions = {
		Pad: function(reference) {
			return {
				w: reference.localWidth,
				h: reference.localHeight,
				c: false
			};
		},
		Cell: function(reference) {
			return {
				w: reference.actualWidth,
				h: reference.actualHeight,
				c: false
			};
		},
		Block: function(reference) {
			var scale = reference.scale;
			return {
				w: reference.localWidth / scale,
				h: reference.localHeight / scale,
				c: false
			};
		},
		Wheel: function(reference) {
			return {
				w: reference.width,
				h: reference.height,
				c: true
			};
		},
		Phrase: function(reference) {
			return {
				w: reference.width,
				h: reference.height,
				c: false
			};
		},
		Picture: function(reference) {
			var scale = reference.scale,
				data = reference.pasteData;
			return {
				w: data.w / scale,
				h: data.h / scale,
				c: false
			};
		},
		Path: function(reference) {
			return {
				w: reference.width,
				h: reference.height,
				c: (reference.isLine) ? false : true
			};
		},
		Shape: function(reference) {
			return {
				w: reference.width,
				h: reference.height,
				c: (reference.isLine) ? false : true
			};
		},
		Frame: function(reference) {
			return {
				w: reference.width,
				h: reference.height,
				c: false
			};
		}
	};
	/**
Convert handle percentage values to numerical values, stored in currentHandle

@method updateCurrentHandle
@return This
@chainable
@private
**/
	my.Position.prototype.updateCurrentHandle = function() {
		var dims, cont, conv, handle, test, testx, testy, currentHandle, scale;
		if (!this.currentHandle.flag) {
			dims = this.getReferenceDimensions[this.type](this);
			cont = my.contains;
			conv = this.numberConvert;
			handle = this.handle;
			test = ['top', 'bottom', 'left', 'right', 'center'];
			testx = handle.x.substring;
			testy = handle.y.substring;
			currentHandle = this.currentHandle;
			scale = this.scale || 1;
			currentHandle.x = (testx) ? conv(handle.x, dims.w) : handle.x;
			currentHandle.y = (testy) ? conv(handle.y, dims.h) : handle.y;
			if (dims.c) {
				if (cont(test, handle.x)) {
					currentHandle.x -= (dims.w / 2);
				}
				if (cont(test, handle.y)) {
					currentHandle.y -= (dims.h / 2);
				}
			}
			if (testx) {
				currentHandle.x *= scale;
			}
			if (testy) {
				currentHandle.y *= scale;
			}
			if (isNaN(currentHandle.x)) {
				currentHandle.x = 0;
			}
			if (isNaN(currentHandle.y)) {
				currentHandle.y = 0;
			}
			currentHandle.reverse();
			currentHandle.flag = true;
		}
		return this;
	};
	/**
Convert start percentage values to numerical values, stored in currentStart

@method updateCurrentStart
@param {Object} reference object - Stack, Pad, Element, Cell or Entity (Block, Wheel, Phrase, Picture, Path, Shape or Frame)
@return This
@chainable
@private
**/
	my.Position.prototype.updateCurrentStart = function(reference) {
		var dims, conv, start, currentStart;
		if (!this.currentStart.flag && reference && reference.type) {
			currentStart = this.currentStart;
			dims = this.getReferenceDimensions[reference.type](reference);
			conv = this.numberConvert;
			start = this.start;
			currentStart.x = (start.x.substring) ? conv(start.x, dims.w) : start.x;
			currentStart.y = (start.y.substring) ? conv(start.y, dims.h) : start.y;
			if (isNaN(currentStart.x) || isNaN(currentStart.y)) {
				currentStart.x = 0;
				currentStart.y = 0;
				return this;
			}
			currentStart.flag = true;
		}
		return this;
	};
	/**
Stamp helper function - set this entity, cell or element start values to its pivot entity/point start value, or to the current mouse coordinates

Takes into account lock flag settings
@method setStampUsingPivot
@param {String} [cell] CELLNAME String
@return This
@chainable
@private
**/
	my.Position.prototype.setStampUsingPivot = function(cell, mouse) {
		var p, e,
			pivot,
			action = this.setStampUsingPivotCalculations,
			point,
			entity,
			so,
			el;
		if (!this.currentPivotIndex) {
			pivot = this.pivot;
			point = my.point;
			entity = my.entity;
			so = my.safeObject;
			if (pivot === 'mouse') {
				p = 'mouse';
				e = false;
			}
			else if (so(point)[pivot]) {
				p = 'point';
				e = point[pivot];
			}
			else if (entity[pivot]) {
				p = 'entity';
				e = entity[pivot];
			}
			else {
				el = my.xtGet(so(my.stack)[pivot], so(my.pad)[pivot], so(my.element)[pivot], false);
				if (el) {
					p = 'stack';
					e = el;
				}
			}
			if (p) {
				this.currentPivot = e;
				this.currentPivotIndex = p;
			}
		}
		if (this.currentPivotIndex) {
			action[this.currentPivotIndex](this, this.currentPivot, cell, mouse);
		}
		return this;
	};
	/**
setStampUsingPivot helper object
**/
	my.Position.prototype.setStampUsingPivotCalculations = {
		point: function(obj, pivot) {
			var entity = my.entity[pivot.entity],
				current = obj.currentStart,
				vector = pivot.getCurrentCoordinates().rotate(entity.roll).vectorAdd(entity.currentStart);
			current.x = (!obj.lockX) ? vector.x : current.x;
			current.y = (!obj.lockY) ? vector.y : current.y;
		},
		entity: function(obj, pivot) {
			var vector = (pivot.type === 'Particle') ? pivot.get('place') : pivot.currentStart,
				current = obj.currentStart;
			current.x = (!obj.lockX) ? vector.x : current.x;
			current.y = (!obj.lockY) ? vector.y : current.y;
		},
		mouse: function(obj, ignore, cell, mouse) {
			var pad,
				current = obj.currentStart;
			if (!my.xt(mouse)) {
				cell = my.cell[cell];
				pad = my.pad[cell.pad];
				mouse = pad.mice[obj.mouseIndex];
			}
			mouse = obj.correctCoordinates(mouse, cell);
			if (mouse) {
				if (obj.oldX == null && obj.oldY == null) { //jshint ignore:line
					obj.oldX = current.x;
					obj.oldY = current.y;
				}
				current.x = (!obj.lockX) ? current.x + mouse.x - obj.oldX : current.x;
				current.y = (!obj.lockY) ? current.y + mouse.y - obj.oldY : current.y;
				obj.oldX = mouse.x;
				obj.oldY = mouse.y;
			}
		},
		stack: function() {}
	};
	/**
Stamp helper function - correct mouse coordinates if pad dimensions not equal to base cell dimensions

@method correctCoordinates
@param {Object} coords An object containing x and y attributes
@param {String} [cell] CELLNAME String
@return Amended coordinate object
**/
	my.Position.prototype.correctCoordinates = function(coords, cell) {
		var vector,
			pad,
			w, h,
			get = my.xtGet;
		coords = my.safeObject(coords);
		vector = my.work.v.set(coords);
		if (scrawl.xta(coords.x, coords.y)) {
			cell = (my.cell[cell]) ? my.cell[cell] : my.cell[my.pad[my.work.currentPad].base];
			pad = my.pad[cell.pad];
			w = get(pad.localWidth, pad.width, 300);
			h = get(pad.localHeight, pad.height, 150);
			if (w !== cell.actualWidth) {
				vector.x /= (w / cell.actualWidth);
			}
			if (h !== cell.actualHeight) {
				vector.y /= (h / cell.actualHeight);
			}
			return vector;
		}
		return false;
	};

	/**
# PageElement

## Instantiation

* This object should never be instantiated by users

## Purpose

* supplies DOM elements with basic dimensional, positional and scaling attributes, and methods for manipulating them

The core implementation of this object is a stub that supplies Pad objects with basic mouse position support. The stacks extension will substantially modify it to provide CSS3 3d positioning and animation functionality for Stack, Element and Pad objects. 

@class PageElement
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.PageElement = function(items) {
		var get = my.xtGet,
		d = my.work.d[this.type];
		items = my.safeObject(items);
		my.Base.call(this, items);
		/**
DOM element width
@property width
@type Number
@default 300
**/
		this.width = get(items.width, d.width);
		/**
DOM element height
@property height
@type Number
@default 150
**/
		this.height = get(items.height, d.height);
		/**
The object's scale value - larger values increase the object's size
@property scale
@type Number
@default 1
**/
		this.scale = get(items.scale, d.scale);
		this.propogateTouch = get(items.propogateTouch, d.propogateTouch);
		this.setLocalDimensions();
		this.stacksPageElementConstructor(items);
		/**
The mice attribute is an object containing supplemented vectors which hold real-time information about the current coordinates of the mouse pointer and any other pointer or touch instances occurring over the element

mice.mouse - always refers to the mouse pointer
mice.ui0, mice.ui1 etc - refers to pointer and touch events

@property mice
@type Object
@default {}
**/
		this.mice = {
			mouse: my.makeVector()
		};
		this.mice.mouse.id = 'mouse';
		this.mice.mouse.active = false;
		this.mice.mouse.name = this.type + '.' + this.name + '.ui.mouse';
		return this;
	};
	my.PageElement.prototype = Object.create(my.Base.prototype);
	/**
@property type
@type String
@default 'PageElement'
@final
**/
	my.PageElement.prototype.type = 'PageElement';
	my.PageElement.prototype.classname = 'objectnames';
	my.work.d.PageElement = {
		width: 300,
		height: 150,
		/**
DOM element localWidth
@property localWidth
@type Number
@default 300
**/
		localWidth: 300,
		/**
DOM element localHeight
@property localHeight
@type Number
@default 150
**/
		localHeight: 150,
		/**
DOM element's current horizontal offset from the top of the web page
@property displayOffsetX
@type Number
@default 0
**/
		displayOffsetX: 0,
		/**
DOM element's current vertical offset from the left side of the web page
@property displayOffsetY
@type Number
@default 0
**/
		displayOffsetY: 0,
		scale: 1,
		mice: {},
		/**
Set the interactive attribute to true to track mouse/pointer/touch events on the element. By default Pad and Stack objects set their element's interactivity to true, while Element objects set it to false 
@property interactive
@type Boolean
@default true (false for Element objects)
**/
		interactive: true,
		/**
Boolean - if set to trye, a touchmove event will be propogated to other stacks, pads and elements; default false
@property propogateTouch
@type Boolean
@default false
**/
		propogateTouch: false,
		/**
Element CSS position styling attribute
@property position
@type String
@default 'static'
**/
		position: 'static'
	};
	my.mergeInto(my.work.d.PageElement, my.work.d.Base);
	/**
PageElement constructor hook function - modified by stacks extension
@method stacksPageElementConstructor
@private
**/
	my.PageElement.prototype.stacksPageElementConstructor = function(items) {};
	/**
Augments Base.get() to retrieve DOM element width and height values

(The stack extension replaces this core function rather than augmenting it via a hook function)

@method get
@param {String} get Attribute key
@return Attribute value
**/
	my.PageElement.prototype.get = function(item) {
		var element = this.getElement(),
			stat_pageElementGet = ['width', 'height', 'position'],
			get = my.xtGet,
			d = my.work.d[this.type];
		if (my.contains(stat_pageElementGet, item)) {
			switch (item) {
				case 'width':
					return get(this.localWidth, parseFloat(element.width), d.width);
				case 'height':
					return get(this.localHeight, parseFloat(element.height), d.height);
				case 'position':
					return get(this.position, element.style.position);
			}
		}
		return my.Base.prototype.get.call(this, item);
	};
	/**
Augments Base.set() to allow the setting of DOM element dimension values

(The stack extension replaces this core function rather than augmenting it via a hook function)

@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.PageElement.prototype.set = function(items) {
		var xt = my.xt,
			xto = my.xto;
		items = my.safeObject(items);
		my.Base.prototype.set.call(this, items);
		if (xto(items.width, items.height, items.scale)) {
			this.setLocalDimensions();
			this.setDimensions();
			this.setDisplayOffsets();
		}
		if (xt(items.position)) {
			this.position = items.position;
		}
		if (xt(items.pivot)) {
			this.pivot = items.pivot;
			if (!this.pivot) {
				delete this.oldX;
				delete this.oldY;
			}
		}
		if (xt(items.mouse)) {
			this.initMouse(items.mouse);
		}
		if (xto(items.title, items.comment)) {
			this.setAccessibility(items);
		}
		if (xt(items.interactive)) {
			this.interactive = items.interactive;
			this.removeMouseMove();
			if (this.interactive) {
				this.addMouseMove();
			}
		}
		return this;
	};
	/**
Handles the setting of DOM element title and data-comment attributes
@method setAccessibility
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.PageElement.prototype.setAccessibility = function(items) {
		var element,
			xt = my.xt;
		items = my.safeObject(items);
		element = this.getElement();
		if (xt(items.title)) {
			this.title = items.title;
			element.title = this.title;
		}
		if (xt(items.comment)) {
			this.comment = items.comment;
			element.setAttribute('data-comment', this.comment);
		}
		return this;
	};
	/**
Calculate the DOM element's current display offset values
@method setDisplayOffsets
@return This
@chainable
**/
	my.PageElement.prototype.setDisplayOffsets = function() {
		var element = this.getElement(),
			offsetX = 0,
			offsetY = 0;
		if (element.offsetParent) {
			do {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
				element = element.offsetParent;
			} while (element.offsetParent);
		}
		this.displayOffsetX = offsetX;
		this.displayOffsetY = offsetY;
		return this;
	};
	/**
Scale DOM element dimensions (width, height)
@method scaleDimensions
@param {Number} item Scale value
@return This
@chainable
**/
	my.PageElement.prototype.scaleDimensions = function(item) {
		if (item.toFixed) {
			this.scale = item;
			this.setDimensions();
		}
		return this;
	};
	/**
Helper function - set local dimensions (width, height)
@method setLocalDimensions
@return This
@chainable
@private
**/
	my.PageElement.prototype.setLocalDimensions = function() {
		var scale = this.scale;
		this.localWidth = this.width * scale;
		this.localHeight = this.height * scale;
		return this;
	};
	/**
Helper function - set DOM element dimensions (width, height)
@method setDimensions
@return This
@chainable
@private
**/
	my.PageElement.prototype.setDimensions = function() {
		var element = this.getElement();
		element.style.width = this.localWidth + 'px';
		element.style.height = this.localHeight + 'px';
		return this;
	};
	/**
Retrieve details of the Mouse cursor position in relation to the DOM element's top left hand corner. Most useful for determining mouse cursor position over Stack and Pad (visible &lt;canvas&gt;) elements.

This function is also used to retrieve details of touch positions.

_Note: if changes are made elsewhere to the web page (DOM) after the page loads, the function .getDisplayOffsets() will need to be called to recalculate the element's position within the page - failure to do so will lead to this function returning incorrect data. getDisplayOffsets() does not need to be called during/after page scrolling._

By default, the function returns a single Vector containing either the first touch position or the current mouse cursor position.

The returned object is a Vector containing the mouse cursor's current x and y coordinates in relation to the DOM element's top left corner, together with the following additional attributes:

* __active__ - set to true if mouse is hovering over the element; false otherwise
* __id__ - event vector id (-1: mouse; 0+ touch or pointer)
* __order__ - event order (0: mouse; 1+ touch or pointer)

If an argument is supplied, then all currently existing mouse/touch vectors are returned as an array, with index 0 representing the mouse pointer, index 1 representing the first touch coordinate and additional indexes representing additional touch coordinates 
@method getMouse
@param {Boolean} item - true to return the array; false (default) to return either first touch or mouse Vector
@return Vector, or an array of Vectors containing localized coordinates, with additional attributes; if mouse/touch has been disabled for the DOM element, returns false
**/
	my.PageElement.prototype.getMouse = function(item) {
		var id, i, iz,
			r = [];
		if (my.xt(item)) {
			//boolean true returns the element's mice object
			if (my.xt(item) && my.isa_bool(item) && item) {
				return this.mice;
			}
			//an event object returns an array of relevant vectors
			else if (my.isa_event(item)) {
				if (item.changedTouches) {
					for (i = 0, iz = item.changedTouches.length; i < iz; i++) {
						id = 't' + item.changedTouches[i].identifier;
						r.push(this.mice[id]);
					}
					return r;
				}
				else if (item.pointerType) {
					if (item.pointerType !== 'touch') {
						id = item.pointerType;
					}
					else {
						id = 'p' + item.pointerId;
					}
					return [this.mice[id]];
				}
				else {
					return [this.mice.mouse];
				}
			}
			else {
				return [this.mice.mouse];
			}
		}
		else {
			//item undefined returns a vector, default mouse vector
			return my.xtGet(this.mice.t0, this.mice.p1, this.mice.pen, this.mice.mouse);
		}
	};
	/**
@method getMouseIdFromEvent
@param {Boolean} item - DOM event object
@return Array - mouse id strings associated with event(s)
**/
	my.PageElement.prototype.getMouseIdFromEvent = function(item) {
		var id, i, iz,
			r = [];
		if (my.isa_event(item)) {
			if (item.changedTouches) {
				for (i = 0, iz = item.changedTouches.length; i < iz; i++) {
					id = 't' + item.changedTouches[i].identifier;
					r.push(id);
				}
			}
			else if (item.pointerType) {
				if (item.pointerType !== 'touch') {
					id = item.pointerType;
				}
				else {
					id = 'p' + item.pointerId;
				}
				r.push(id);
			}
			else {
				r.push('mouse');
			}
		}
		return r;
	};
	/**
mousemove event listener function
@method handleMouseMove
@param {Object} e window.event
@param {Boolean} active - set only by handleMouseIn, handleMouseOut
@return This
@private
**/
	my.PageElement.prototype.handleMouseMove = function(e) {
		var mouseX, mouseY, maxX, maxY, wrapper, i, iz, j, jz, el, touches, newActive, id, altEl, altWrapper,
			pad = my.pad,
			stack = my.stack,
			element = my.element,
			parent, child, elid, localMouse, childStart,
			al = my.work.activeListeners,
			xt = my.xt,
			vec = my.makeVector,
			id2 = this.id;

		if (xt(id2)) {
			//invoked directly by DOM listeners
			wrapper = pad[id2] || stack[id2] || element[id2] || false;
			el = this;
		}
		else {
			//invoked via scrawl function
			wrapper = this;
			el = this.getElement();
		}

		//touch event(s)
		if (e.changedTouches) {
			touches = e.changedTouches;

			//process each change in turn
			for (i = 0, iz = touches.length; i < iz; i++) {
				id = 't' + touches[i].identifier;

				//get rid of existing mouse vectors for a start - else things get very messy very quickly
				if (e.type === 'touchstart') {
					for (j = 0, jz = al.length; j < jz; j++) {
						altWrapper = pad[al[j]] || stack[al[j]] || element[al[j]] || false;
						if (altWrapper) {
							delete altWrapper.mice[id];
						}
					}
				}
				//determine if a vector already exists for this touch
				if (!xt(wrapper.mice[id])) {
					wrapper.mice[id] = vec({
						name: wrapper.type + '.' + wrapper.name + '.t.' + id
					});
					wrapper.mice[id].active = null;
					wrapper.mice[id].id = id;
				}

				//coordinates
				if (touches[i].pageX || touches[i].pageY) {
					mouseX = touches[i].pageX;
					mouseY = touches[i].pageY;
				}
				else if (touches[i].clientX || touches[i].clientY) {
					mouseX = touches[i].clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
					mouseY = touches[i].clientY + document.body.scrollTop + document.documentElement.scrollTop;
				}
				maxX = wrapper.displayOffsetX + wrapper.localWidth;
				maxY = wrapper.displayOffsetY + wrapper.localHeight;

				//touchmove doesn't propogate beyond its triggering element
				if (this.propogateTouch && e.type === 'touchmove') {
					for (j = 0, jz = al.length; j < jz; j++) {
						if (this.name !== al[j]) {
							altEl = my.canvas[al[j]] || my.stk[al[j]] || my.elm[al[j]] || false;
							if (altEl) {
								my.triggerTouchFollow(e, altEl);
							}
						}
					}
				}
				//touchleave and touchenter are deprecated - have to spoof them via custom events
				newActive = (mouseX >= wrapper.displayOffsetX && mouseX <= maxX && mouseY >= wrapper.displayOffsetY && mouseY <= maxY) ? true : false;
				if (wrapper.mice[id].active !== newActive) {
					wrapper.mice[id].active = newActive;
					//only trigger enter/leave if we're currently in the middle of a move event
					if (e.type === 'touchmove' || e.type === 'touchfollow') {
						if (newActive) {
							//touchenter
							my.triggerTouchEnter(e, el);
						}
						else {
							//touchleave
							my.triggerTouchLeave(e, el);
						}
					}
				}

				//finalize coordinates
				wrapper.mice[id].x = (mouseX - wrapper.displayOffsetX);
				wrapper.mice[id].y = (mouseY - wrapper.displayOffsetY);
				if (wrapper.type === 'Pad') {
					wrapper.mice[id].x = Math.round(wrapper.mice[id].x / wrapper.scale || 1);
					wrapper.mice[id].y = Math.round(wrapper.mice[id].y / wrapper.scale || 1);
				}
				if (e.type === 'touchup' || e.type === 'touchleave') {
					wrapper.mice[id].x = null;
					wrapper.mice[id].y = null;
				}
			}
		}
		//pointer event
		else if (e.pointerType) {
			elid = e.target.id;
			id = (e.pointerType !== 'touch') ? e.pointerType : 'p' + e.pointerId;

			//determine if a vector already exists for this pointer
			if (!xt(wrapper.mice[id])) {
				wrapper.mice[id] = vec({
					name: wrapper.type + '.' + wrapper.name + '.p.' + id
				});
				wrapper.mice[id].active = null;
				wrapper.mice[id].id = id;
			}
			localMouse = wrapper.mice[id];

			if (elid === wrapper.name) {

				//pointer coordinates
				localMouse.active = false;
				if (e.offsetX >= 0 && e.offsetX <= wrapper.localWidth && e.offsetY >= 0 && e.offsetY <= wrapper.localHeight) {
					localMouse.active = true;
				}
				localMouse.x = Math.round(e.offsetX);
				localMouse.y = Math.round(e.offsetY);
				if (wrapper.type === 'Pad') {
					localMouse.x = Math.round(localMouse.x / (wrapper.scale || 1));
					localMouse.y = Math.round(localMouse.y / (wrapper.scale || 1));
				}
			}
			else {
				// dealing with a stack - 
				// pointer events don't seem to propogate to stacks when the stack includes canvases or elements
				if (elid) {
					parent = e.target.parentNode;
					if (parent.id === wrapper.name) {

						//pointer coordinates
						localMouse.x = Math.round(e.pageX - wrapper.displayOffsetX);
						localMouse.y = Math.round(e.pageY - wrapper.displayOffsetY);
						localMouse.active = false;
						if (localMouse.x >= 0 && localMouse.x <= wrapper.localWidth && localMouse.y >= 0 && localMouse.y <= wrapper.localHeight) {
							localMouse.active = true;
						}
						if (wrapper.type === 'Pad') {
							localMouse.x = Math.round(localMouse.x / (wrapper.scale || 1));
							localMouse.y = Math.round(localMouse.y / (wrapper.scale || 1));
						}
					}
				}
			}
		}
		//mouse/pen event
		else {
			if (!xt(wrapper.mice.mouse)) {
				wrapper.mice.mouse = vec({
					name: wrapper.type + '.' + wrapper.name + '.ui.mouse'
				});
				wrapper.mice.mouse.active = null;
				wrapper.mice.mouse.id = 'mouse';
			}

			if (e.pageX || e.pageY) {
				mouseX = e.pageX;
				mouseY = e.pageY;
			}
			else if (e.clientX || e.clientY) {
				mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}
			wrapper.mice.mouse.active = true;
			if (e.type === 'mouseleave') {
				wrapper.mice.mouse.active = false;
			}
			wrapper.mice.mouse.x = (mouseX - wrapper.displayOffsetX);
			wrapper.mice.mouse.y = (mouseY - wrapper.displayOffsetY);
			if (wrapper.type === 'Pad') {
				wrapper.mice.mouse.x = Math.round(wrapper.mice.mouse.x / (wrapper.scale || 1));
				wrapper.mice.mouse.y = Math.round(wrapper.mice.mouse.y / (wrapper.scale || 1));
			}
		}
		wrapper.handleMouseTilt(e);
		return wrapper;
	};
	my.PageElement.prototype.pickupEntity = function(items) {};
	my.PageElement.prototype.dropEntity = function(items) {};
	/**
mouseTilt hook function - amended by scrawlStacks extension
@method handleMouseTilt
@param {Object} e window.event
@return This
@private
**/
	my.PageElement.prototype.handleMouseTilt = function(e) {};
	/**
Adds event listeners to the element
@method addMouseMove
@return This
@chainable
@private
**/
	my.PageElement.prototype.addMouseMove = function() {
		var el = this.getElement();
		my.addListener(['up', 'down', 'move', 'enter', 'leave'], this.handleMouseMove, el);
		if (this.propogateTouch) {
			my.pushUnique(my.work.activeListeners, this.name);
		}
		return this;
	};
	/**
Remove event listeners from the element
@method removeMouseMove
@return This
@chainable
@private
**/
	my.PageElement.prototype.removeMouseMove = function() {
		var el = this.getElement();
		my.removeListener(['up', 'down', 'move', 'enter', 'leave'], this.handleMouseMove, el);
		if (this.propogateTouch) {
			my.removeItem(my.work.activeListeners, this.name);
		}
		return this;
	};

	/**
# Pad

## Instantiation

* created automatically for any &lt;canvas&gt; element found on the web page when it loads
* also, scrawl.addCanvasToPage()
* should not be instantiated directly by users

## Purpose

* controller (not wrapper) object for canvas elements included in the DOM
* coordinates activity between visible canvas element and other (non-DOM) canvas elements that contribute to it

Because the Pad constructor calls the Cell constructor as part of the construction process (Cell objects __wrap__ &lt;canvas&gt; elements; Pad objects __control__ &lt;canvas&gt; elements), Cell attributes can be included in the Pad constructor object and picked up by the resultant Cell objects.

## Access

* scrawl.pad.PADNAME - for the Pad object
* scrawl.canvas.PADNAME - for the Pad object's visible (display) &lt;canvas&gt; element
* scrawl.context.PADNAME - for the visible (display) &ltcanvas&gt; element's 2d context engine (CanvasRenderingContext2D interface)
* scrawl.cell[scrawl.pad.PADNAME.display] - for the Pad object's display cell
* scrawl.cell[scrawl.pad.PADNAME.base] - for the Pad object's base cell

@class Pad
@constructor
@extends PageElement
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Pad = function(items) {
		var display,
			base,
			canvas,
			get = my.xtGet,
			d = my.work.d.Pad,
			pu = my.pushUnique,
			makeCell = my.makeCell;
		items = my.safeObject(items);
		if (my.isa_canvas(items.canvasElement)) {
			items.width = get(items.width, items.canvasElement.width, d.width);
			items.height = get(items.height, items.canvasElement.height, d.height);
			items.name = get(items.name, items.canvasElement.id, items.canvasElement.name, 'Pad');
			my.PageElement.call(this, items);
			if (this.name.match(/___/)) {
				this.name = this.name.replace(/___/g, '_');
			}
			items.canvasElement.id = this.name;
			my.pad[this.name] = this;
			pu(my.padnames, this.name);

			/**
Array of CELLNAME Strings associated with this Pad
@property cells
@type Array
@default []
**/
			this.cells = [];
			display = makeCell({
				name: this.name,
				pad: this.name,
				canvas: items.canvasElement,
				compiled: false,
				shown: false,
				width: this.localWidth,
				height: this.localHeight
			});
			pu(this.cells, display.name);
			/**
Pad's display (visible) &lt;canvas&gt; element - CELLNAME
@property display
@type String
@default ''
**/
			this.display = display.name;
			canvas = items.canvasElement.cloneNode(true);
			canvas.setAttribute('id', this.name + '_base');
			base = makeCell({
				name: this.name + '_base',
				pad: this.name,
				canvas: canvas,
				compileOrder: 9999,
				shown: false,
				width: '100%',
				height: '100%'
			});
			pu(this.cells, base.name);
			/**
Pad's base (hidden) &lt;canvas&gt; element - CELLNAME
@property base
@type String
@default ''
**/
			this.base = base.name;
			/**
Pad's currently active &lt;canvas&gt; element - CELLNAME

//not convinced there's any point in keeping this attribute anymore - take it out?

@property current
@type String
@default ''
@deprecated
**/
			this.current = base.name;
			this.setDisplayOffsets();
			this.setAccessibility(items);
			this.filtersPadInit();
			this.padStacksConstructor(items);
			this.interactive = get(items.interactive, true);
			if (this.interactive) {
				this.addMouseMove();
			}
			this.cellsCompileOrder = [].concat(this.cells);
			this.cellsShowOrder = [].concat(this.cells);
			this.resortCompile = true;
			this.resortShow = true;
			return this;
		}
		return false;
	};
	my.Pad.prototype = Object.create(my.PageElement.prototype);
	/**
@property type
@type String
@default 'Pad'
@final
**/
	my.Pad.prototype.type = 'Pad';
	my.Pad.prototype.classname = 'padnames';
	my.work.d.Pad = {
		cells: [],
		display: '',
		base: '',
		current: ''
	};
	my.mergeInto(my.work.d.Pad, my.work.d.PageElement);
	/**
Retrieve Pad's visible &lt;canvas&gt; element object
@method getElement
@return DOM element object
@private
**/
	my.Pad.prototype.getElement = function() {
		return my.canvas[this.display];
	};
	/**
Pad constructor hook function - modified by filters extension
@method filtersPadInit
@private
**/
	my.Pad.prototype.filtersPadInit = function(items) {};
	/**
Pad constructor hook function - modified by stacks extension
@method stacksPadInit
@private
**/
	my.Pad.prototype.stacksPadInit = function(items) {};
	/**
Augments PageElement.set(), to cascade scale, backgroundColor, globalAlpha and globalCompositeOperation changes to associated Cell objects
                
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Pad.prototype.set = function(items) {
		var base,
			display,
			cell = my.cell,
			xto = my.xto;
		my.PageElement.prototype.set.call(this, items);
		items = my.safeObject(items);
		display = cell[this.display];
		base = cell[this.base];
		if (xto(items.scale, items.width, items.height)) {
			display.set({
				pasteWidth: (items.width) ? this.localWidth : display.pasteWidth,
				pasteHeight: (items.height) ? this.localHeight : display.pasteHeight,
				scale: items.scale || display.scale
			});
			base.set({
				scale: items.scale || base.scale
			});
		}
		this.padStacksSet(items);
		if (xto(items.start, items.startX, items.startY, items.handle, items.handleX, items.handleY, items.scale, items.width, items.height)) {
			this.setDisplayOffsets();
		}
		if (xto(items.backgroundColor, items.globalAlpha, items.globalCompositeOperation)) {
			base.set({
				backgroundColor: items.backgroundColor || base.backgroundColor,
				globalAlpha: items.globalAlpha || base.globalAlpha,
				globalCompositeOperation: items.globalCompositeOperation || base.globalCompositeOperation
			});
		}
		return this;
	};
	/**
Pad constructor hook function - amended by Stacks extension
@method padStacksConstructor
@return Nothing
@private
**/
	my.Pad.prototype.padStacksConstructor = function() {};
	/**
Pad set hook function - amended by Stacks extension
@method padStacksSet
@return Nothing
@private
**/
	my.Pad.prototype.padStacksSet = function() {};
	/**
Display function sorting routine - cells are sorted according to their compileOrder attribute value, in ascending order
@method sortCellsCompile
@return Nothing
@private
**/
	my.Pad.prototype.sortCellsCompile = function() {
		if (this.resortCompile) {
			this.resortCompile = false;
			this.cellsCompileOrder = my.bucketSort('cell', 'compileOrder', this.cellsCompileOrder);
		}
	};
	/**
Display function sorting routine - cells are sorted according to their showOrder attribute value, in ascending order
@method sortCellsShow
@return Nothing
@private
**/
	my.Pad.prototype.sortCellsShow = function() {
		if (this.resortShow) {
			this.resortShow = false;
			this.cellsShowOrder = my.bucketSort('cell', 'showOrder', this.cellsShowOrder);
		}
	};
	/**
Display function - requests Cells to clear their &lt;canvas&gt; element

Cells with cleared = true will clear theid displays in preparation for compile/stamp operations

@method clear
@return This
@chainable
**/
	my.Pad.prototype.clear = function() {
		var current,
			cells = this.cells,
			cell = my.cell,
			i,
			iz;
		for (i = 0, iz = cells.length; i < iz; i++) {
			current = cell[cells[i]];
			if (current.rendered && current.cleared) {
				current.clear();
			}
		}
		return this;
	};
	/**
Display function - requests Cells to compile their &lt;canvas&gt; element

Cells will compile in ascending order of their compileOrder attributes, if their compiled attribute = true

By default:
* the initial base canvas has a compileOrder of 9999 and compiles last
* the initial display canvas has compiled = false and will not compile

(This function is replaced by the Filters extension)

@method compile
@return This
@chainable
**/
	my.Pad.prototype.compile = function(mouse) {
		var cell = my.cell,
			cells = this.cellsCompileOrder,
			current,
			i,
			iz;
		this.sortCellsCompile();
		for (i = 0, iz = cells.length; i < iz; i++) {
			current = cell[cells[i]];
			if (current.rendered && current.compiled) {
				current.compile(mouse);
			}
		}
		return this;
	};
	/**
Display function - requests Cells to show their &lt;canvas&gt; element 

Cells will show in ascending order of their showOrder attributes, if their show attribute = true

By default, the initial base and display canvases have shown = false:
* 'show' involves a cell copying itself onto the base cell; it makes no sense for the base cell to copy onto itself
* the last action is to copy the base cell onto the display cell

(This function is replaced by the Filters extension)

@method show
@return This
@chainable
**/
	my.Pad.prototype.show = function() {
		var display,
			base,
			cell,
			cells = my.cell,
			order = this.cellsShowOrder,
			i,
			iz;
		display = cells[this.display];
		base = cells[this.base];
		this.sortCellsShow();
		for (i = 0, iz = order.length; i < iz; i++) {
			cell = cells[order[i]];
			if (cell.rendered && cell.shown) {
				base.copyCellToSelf(cell);
			}
		}
		display.copyCellToSelf(base, true);
		return this;
	};
	/**
Display function - Pad tells its associated Cell objects to undertake a complete clear-compile-show display cycle

@method render
@return This
@chainable
**/
	my.Pad.prototype.render = function(mouse) {
		this.clear();
		this.compile(mouse);
		this.show();
		return this;
	};
	/**
Create a new (hidden) &lt;canvas&gt; element and associated Cell wrapper, and add it to this Pad
@method addNewCell
@param {Object} data Object containing attribute data for the new canvas
@return New Cell object; false on failure
@example
    scrawl.addCanvasToPage({
        name: 'mycanvas',
        width: 200,
        height: 200,
        });
    scrawl.pad.mycanvas.addNewCell({
        name: 'background',
        width: 400,
        });
**/
	my.Pad.prototype.addNewCell = function(data) {
		var canvas,
			cell,
			pu = my.pushUnique;
		data = my.safeObject(data);
		if (data.name.substring) {
			data.width = Math.round(data.width) || this.width;
			data.height = Math.round(data.height) || this.height;
			canvas = document.createElement('canvas');
			canvas.setAttribute('id', data.name);
			canvas.setAttribute('height', data.height);
			canvas.setAttribute('width', data.width);
			data.pad = this.name;
			data.canvas = canvas;
			cell = my.makeCell(data);
			pu(this.cells, cell.name);
			pu(this.cellsCompileOrder, cell.name);
			pu(this.cellsShowOrder, cell.name);
			this.resortCompile = true;
			this.resortShow = true;
			return cell;
		}
		return false;
	};
	/**
Associate existing &lt;canvas&gt; elements, and their Cell wrappers, with this Pad
@method addCells
@param {String} items One or more CELLNAME Strings
@return This
@chainable
**/
	my.Pad.prototype.addCells = function() {
		var slice,
			i,
			iz,
			pu = my.pushUnique;
		slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(slice[0])) {
			slice = slice[0];
		}
		for (i = 0, iz = slice.length; i < iz; i++) {
			if (my.cell[slice[i]]) {
				pu(this.cells, slice[i]);
				pu(this.cellsCompileOrder, slice[i]);
				pu(this.cellsShowOrder, slice[i]);
			}
		}
		this.resortCompile = true;
		this.resortShow = true;
		return this;
	};
	/**
Remove a Cell wrapper object from this Pad

_Note: does not delete the canvas, or the Cell object, from the scrawl library_
@method deleteCell
@param {String} cell CELLNAME String
@return This
@chainable
**/
	my.Pad.prototype.deleteCell = function(cell) {
		var ri = my.removeItem;
		if (cell.substring) {
			ri(this.cells, cell);
			ri(this.cellsCompileOrder, cell);
			ri(this.cellsShowOrder, cell);
			if (this.display === cell) {
				this.display = this.current;
			}
			if (this.base === cell) {
				this.base = this.current;
			}
			if (this.current === cell) {
				this.current = this.base;
			}
			this.resortCompile = true;
			this.resortShow = true;
			return this;
		}
		return this;
	};
	/**
Set scrawl.currentPad attribute to this Pad's PADNAME String
@method makeCurrent
@return This
@chainable
@example
    scrawl.addCanvasToPage({
        name: 'mycanvas',
        width: 200,
        height: 200
        }).makeCurrent();
**/
	my.Pad.prototype.makeCurrent = function() {
		my.work.currentPad = this.name;
		return this;
	};
	/**
Augments PageElement.setAccessibility(); handles the setting of &lt;canvas&gt; element title and data-comment attributes

* Title text is assigned to the display canvas's title attribute
* Comments are placed between the display canvas element's tags, within &lt;p&gt; tags - this will remove any existing content between the canvas tags

@method setAccessibility
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Pad.prototype.setAccessibility = function(items) {
		var element,
			xt = my.xt;
		items = my.safeObject(items);
		element = this.getElement();
		if (xt(items.title)) {
			this.title = items.title;
			element.title = this.title;
		}
		if (xt(items.comment)) {
			this.comment = items.comment;
			element.setAttribute('data-comment', this.comment);
			element.innerHTML = '<p>' + this.comment + '</p>';
		}
		return this;
	};
	/**
Overrides PageElement.setDimensions(); &lt;canvas&gt; elements do not use styling to set their drawing region dimensions

@method setDimensions
@return This
@chainable
**/
	my.Pad.prototype.setDimensions = function() {
		var element = this.getElement();
		element.width = this.localWidth;
		element.height = this.localHeight;
		return this;
	};

	/**
# Cell

## Instantiation

* created automatically for any &lt;canvas&gt; element found on the web page when it loads
* scrawl.addCanvasToPage()
* scrawl.addNewCell()
* Pad.addNewCell()
* should not be instantiated directly by users

## Purpose

* Acts as a wrapper for each &lt;canvas&gt; element - whether that canvas is part of the DOM or not
* Oversees manipulation of the &lt;canvas&gt; element's context engine
* Responsible clearing &lt;canvas&gt; elements, and for copying one &lt;canvas&gt; to another
* Includes functionality to pivot, path, flip, lock and roll cell positioning in the display scene
* Controls scrolling and zoom effects between &lt;canvas&gt; elements
* Builds &lt;canvas&gt; element collision fields from entity data
* Undertakes collision detection between entitys and a collision field

_Note: A Cell is entirely responsible for determining what portion of its &lt;canvas&gt; element's content will be copied to another &lt;canvas&gt; and where that copy will appear on the destination &lt;canvas&gt;._

## Access

* scrawl.cell.CELLNAME - for the Cell object
* scrawl.pad[scrawl.cell.CELLNAME.pad] - for the Cell object's Pad object

@class Cell
@constructor
@extends Position
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Cell = function(items) {
		items = my.safeObject(items);
		if (my.xta(items, items.canvas)) { //flag used by Pad constructor when calling Cell constructor
			/**
The coordinate Vector representing the Cell's target position on the &lt;canvas&gt; to which it is to be copied

Cell supports the following 'virtual' attributes for this attribute:

* __startX__ or __targetX__ - (Number) the x coordinate on the destination &lt;canvas&gt;
* __startY__ or __targetY__ - (Number) the y coordinate on the destination &lt;canvas&gt;

@property start
@type Vector
**/
			this.coreCellInit(items);
			this.animationCellInit(items);
			this.collisionsCellInit(items);
			this.filtersCellInit(items);
			return this;
		}
		return false;
	};
	my.Cell.prototype = Object.create(my.Position.prototype);
	/**
@property type
@type String
@default 'Cell'
@final
**/
	my.Cell.prototype.type = 'Cell';
	my.Cell.prototype.classname = 'cellnames';
	my.work.d.Cell = {
		/**
PADNAME of the Pad object to which this Cell belongs
@property pad
@type String
@default ''
**/
		pad: '',
		/**
The coordinate Vector representing the Cell's copy source position on its &lt;canvas&gt;

Cell supports the following 'virtual' attributes for this attribute:

* __copyX__ - (Number) the x coordinate on the source &lt;canvas&gt;
* __copyY__ - (Number) the y coordinate on the source &lt;canvas&gt;

@property copy
@type Vector
**/
		copy: {
			x: 0,
			Y: 0
		},
		/**
Copy width, in pixels. Determines which portion of this Cell's &lt;canvas&gt; element will be copied to another &lt;canvas&gt;
@property copyWidth
@type Number
@default 300
**/
		copyWidth: 300,
		/**
Copy height, in pixels. Determines which portion of this Cell's &lt;canvas&gt; element will be copied to another &lt;canvas&gt;
@property copyHeight
@type Number
@default 150
**/
		copyHeight: 150,
		/**
Local source data
@property copyData
@type Object
@default false
@private
**/
		copyData: false,
		/**
Local target data
@property pasteData
@type Object
@default false
@private
**/
		pasteData: false,
		/**
Paste width, in pixels. Determines where, and at what scale, the copied portion of this Cell's &lt;canvas&gt; will appear on the target Cell's &lt;canvas&gt;
@property pasteWidth
@type Number
@default 300
**/
		pasteWidth: 300,
		/**
Paste height, in pixels. Determines where, and at what scale, the copied portion of this Cell's &lt;canvas&gt; will appear on the target Cell's &lt;canvas&gt;
@property pasteHeight
@type Number
@default 150
**/
		pasteHeight: 150,
		/**
DOM &lt;canvas&gt; element's width (not CSS width)

_Never change this attribute directly_
@property actualWidth
@type Number
@default 300
**/
		actualWidth: 300,
		/**
DOM &lt;canvas&gt; element's height (not CSS height)

_Never change this attribute directly_
@property actualHeight
@type Number
@default 150
**/
		actualHeight: 150,
		/**
@property fieldLabel
@type String
@default ''
**/
		fieldLabel: '',
		/**
Transparency level to be used when copying this Cell's &lt;canvas&gt; element to another &lt;canvas&gt;. Permitted values are between 0 (fully transparent) and 1 (fully opaque)
@property globalAlpha
@type Number
@default 1
**/
		globalAlpha: 1,
		/**
Composition method to be used when copying this Cell's &lt;canvas&gt; element to another &lt;canvas&gt;. Permitted values include

* 'source-over'
* 'source-atop'
* 'source-in'
* 'source-out'
* 'destination-over'
* 'destination-atop'
* 'destination-in'
* 'destination-out'
* 'lighter'
* 'darker'
* 'copy'
* 'xor'

_Be aware that different browsers render these operations in different ways, and some options are not supported by all browsers. The scrawl.device object includes details of which operations the browser supports._
@property globalCompositeOperation
@type String
@default 'source-over'
**/
		globalCompositeOperation: 'source-over',
		/**
DOM &lt;canvas&gt; element's background color; use any permitted CSS color String

_Background colors are achieved via JavaScript canvas API drawing methods. Setting the CSS backgroundColor attribute on a &lt;canvas&gt; element is not recommended_
@property backgroundColor
@type String
@default 'rgba(0,0,0,0)'
**/
		backgroundColor: 'rgba(0,0,0,0)',
		/**
CTXNAME of this Cell's Context object

_Cells use a Context object to keep track of the settings supplied to its &lt;canvas&gt; element's 2d context engine_
@property context
@type String
@default ''
@private
**/
		context: '',
		/**
Array of GROUPNAMES that contribute to building this Cell's scene
@property groups
@type Array
@default []
**/
		groups: [],
		/**
Display cycle flag - on true (default), the cell will take part in the display cycle
@property rendered
@type Boolean
@default true
**/
		rendered: true,
		/**
Display cycle flag - on true (default), the cell will clear itself as part of the display cycle
@property cleared
@type Boolean
@default true
**/
		cleared: true,
		/**
Display cycle flag - on true (default), the cell will compile itself as part of the display cycle
@property compiled
@type Boolean
@default true
**/
		compiled: true,
		/**
Display cycle flag - on true (default), the cell will show itself as part of the display cycle
@property shown
@type Boolean
@default true
**/
		shown: true,
		/**
Display cycle attribute - order in which the cell will compile itself (if compile attribute = true)
@property compileOrder
@type Number
@default 0
**/
		compileOrder: 0,
		/**
Display cycle attribute - order in which the cell will show itself (if show attribute = true)
@property showOrder
@type Number
@default 0
**/
		showOrder: 0
	};
	my.mergeInto(my.work.d.Cell, my.work.d.Position);
	/**
Cell constructor hook function - core module
@method coreCellInit
@private
**/
	my.Cell.prototype.coreCellInit = function(items) {
		var temp,
			context,
			d = my.work.d.Cell,
			xt = my.xt,
			xto = my.xto,
			get = my.xtGet,
			vec = my.makeVector,
			canvas;
		my.Position.call(this, items); //handles items.start, items.startX, items.startY
		my.Base.prototype.set.call(this, items);
		my.canvas[this.name] = items.canvas;
		canvas = my.canvas[this.name];
		my.context[this.name] = items.canvas.getContext('2d');
		my.cell[this.name] = this;
		my.pushUnique(my.cellnames, this.name);
		this.pad = get(items.pad, false);
		temp = my.safeObject(items.copy);
		this.copy = vec({
			x: get(items.copyX, temp.x, 0),
			y: get(items.copyY, temp.y, 0),
			name: this.type + '.' + this.name + '.copy'
		});
		this.actualWidth = canvas.width;
		this.actualHeight = canvas.height;
		this.copyWidth = this.actualWidth;
		this.copyHeight = this.actualHeight;
		this.copyData = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};
		this.pasteData = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};
		this.pasteWidth = this.actualWidth;
		this.pasteHeight = this.actualHeight;
		this.setDimensions(items);
		if (xto(items.pasteX, items.pasteY)) {
			this.start.x = get(items.pasteX, this.start.x);
			this.start.y = get(items.pasteY, this.start.y);
		}
		if (xto(items.copyWidth, items.copyHeight, items.pasteWidth, items.pasteHeight, items.width, items.height)) {
			this.copyWidth = get(items.copyWidth, items.width, this.copyWidth);
			this.copyHeight = get(items.copyHeight, items.height, this.copyHeight);
			this.pasteWidth = get(items.pasteWidth, items.width, this.pasteWidth);
			this.pasteHeight = get(items.pasteHeight, items.height, this.pasteHeight);
		}
		context = my.makeContext({
			name: this.name,
			cell: my.context[this.name]
		});
		this.context = context.name;
		this.flipUpend = get(items.flipUpend, d.flipUpend);
		this.flipReverse = get(items.flipReverse, d.flipReverse);
		this.lockX = get(items.lockX, d.lockX);
		this.lockY = get(items.lockY, d.lockY);
		this.roll = get(items.roll, d.roll);
		this.rendered = get(items.rendered, true);
		this.cleared = get(items.cleared, true);
		this.compiled = get(items.compiled, true);
		this.shown = get(items.shown, true);
		this.compileOrder = get(items.compileOrder, 0);
		this.showOrder = get(items.showOrder, 0);
		this.backgroundColor = get(items.backgroundColor, 'rgba(0,0,0,0)');
		this.globalCompositeOperation = get(items.globalCompositeOperation, 'source-over');
		this.globalAlpha = get(items.globalAlpha, 1);
		this.groups = (xt(items.groups)) ? [].concat(items.groups) : []; //must be set
		this.sortGroups = true;
		my.makeGroup({
			name: this.name,
			cell: this.name
		});
		this.setCopy();
		this.setPaste();
	};
	/**
Cell constructor hook function - modified by collisions extension
@method collisionsCellInit
@private
**/
	my.Cell.prototype.collisionsCellInit = function(items) {};
	/**
Cell constructor hook function - modified by filters extension
@method filtersCellInit
@private
**/
	my.Cell.prototype.filtersCellInit = function(items) {};
	/**
Cell constructor hook function - modified by animation extension
@method animationCellInit
@private
**/
	my.Cell.prototype.animationCellInit = function(items) {};
	/**
Augments Position.get(), to allow users to get values for sourceX, sourceY, startX, startY, targetX, targetY, handleX, handleY, width, height
@method get
@param {String} item Attribute key
@return Attribute value
**/
	my.Cell.prototype.get = function(item) {
		var stat1 = ['pasteX', 'pasteY', 'copyX', 'copyY'],
			stat2 = ['paste', 'copy'],
			stat3 = ['width', 'height'],
			contains = my.contains;
		if (contains(stat1, item)) {
			switch (item) {
				case 'pasteX':
					return this.start.x;
				case 'pasteY':
					return this.start.y;
				case 'copyX':
					return this.copy.x;
				case 'copyY':
					return this.copy.y;
			}
		}
		if (contains(stat2, item)) {
			switch (item) {
				case 'paste':
					return this.start.getVector();
				case 'copy':
					return this.copy.getVector();
			}
		}
		if (contains(stat3, item)) {
			switch (item) {
				case 'width':
					return this.actualWidth;
				case 'height':
					return this.actualHeight;
			}
		}
		return (this.animationCellGet(item) || my.Position.prototype.get.call(this, item));
	};
	/**
Cell.get hook function - modified by animation extension
@method animationCellGet
@private
**/
	my.Cell.prototype.animationCellGet = function(item) {
		return false;
	};
	/**
Augments Position.set(), to allow users to set the start, handle, and source attributes using startX, startY, targetX, targetY, handleX, handleY, sourceX, sourceY.

Note - setting the argument attribute __resolve__ to true will force a recalculation of the cell's copy and passte data; this is useful in particular for cells that do not undertake a full display cycle (when their cleared or compiled attributes have been set to false)

@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Cell.prototype.set = function(items) {
		var xt = my.xt,
			xto = my.xto,
			i, iz;
		my.Position.prototype.set.call(this, items);
		items = my.safeObject(items);
		if (xto(items.paste, items.pasteX, items.pasteY)) {
			this.setPasteVector(items, false);
		}
		if (xto(items.copy, items.copyX, items.copyY)) {
			this.setCopyVector(items);
		}
		if (xto(items.copyWidth, items.width)) {
			this.setCopyWidth(items);
		}
		if (xto(items.copyHeight, items.height)) {
			this.setCopyHeight(items);
		}
		if (xto(items.pasteWidth, items.width)) {
			this.setPasteWidth(items, false);
		}
		if (xto(items.pasteHeight, items.height)) {
			this.setPasteHeight(items, false);
		}
		if (xto(items.actualWidth, items.width)) {
			this.setActualWidth(items, false);
		}
		if (xto(items.actualHeight, items.height)) {
			this.setActualHeight(items, false);
		}
		if (xto(items.actualWidth, items.actualHeight, items.width, items.height)) {
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
			// for(i = 0, iz = this.groups.length; i < iz; i++){
			// 	my.group[this.groups[i]].setDirtyStarts()
			// }
		}
		if (xto(items.actualWidth, items.actualHeight, items.pasteWidth, items.pasteHeight, items.width, items.height, items.handle, items.handleX, items.handleY, items.scale)) {
			this.setDirtyHandles();
		}
		if (xto(items.handle, items.handleX, items.handleY, items.scale)) {
			this.setDirtyHandles();
		}
		if (xto(items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY)) {
			this.setDirtyStarts();
		}
		this.animationCellSet(items);
		if (xt(items.compileOrder)) {
			my.pad[this.pad].resortCompile = true;
		}
		if (xt(items.showOrder)) {
			my.pad[this.pad].resortShow = true;
		}
		if (items.resolve) {
			this.setCopy();
			this.setPaste();
		}
		return this;
	};
	/**
Augments Cell.set()
@method setDirtyStarts
@return This
@chainable
@private
**/
	my.Cell.prototype.setDirtyStarts = function() {
		var group = my.group,
			groups = this.groups,
			g, i, iz;
		for (i = 0, iz = groups.length; i < iz; i++) {
			g = groups[i];
			if (group[g]) {
				group[g].setDirtyStarts();
			}
		}
		this.currentStart.flag = false;
		return this;
	};
	/**
Augments Cell.set()
@method setDirtyHandles
@return This
@chainable
@private
**/
	my.Cell.prototype.setDirtyHandles = function() {
		var group = my.group,
			groups = this.groups,
			g, i, iz;
		for (i = 0, iz = groups.length; i < iz; i++) {
			g = groups[i];
			if (group[g]) {
				group[g].setDirtyHandles();
			}
		}
		this.currentHandle.flag = false;
		return this;
	};
	/**
Augments Cell.set()
@method setActualHeight
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setActualHeight = function(items, recalc) {
		var get = my.xtGet;
		items = my.safeObject(items);
		recalc = get(recalc, true);
		this.actualHeight = get(items.actualHeight, items.height, this.actualHeight);
		if (recalc) {
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
			this.setDirtyHandles();
		}
		return this;
	};
	/**
Augments Cell.set()
@method setActualWidth
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setActualWidth = function(items, recalc) {
		var get = my.xtGet;
		items = my.safeObject(items);
		recalc = get(recalc, true);
		this.actualWidth = get(items.actualWidth, items.width, this.actualWidth);
		if (recalc) {
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
			this.setDirtyHandles();
		}
		return this;
	};
	/**
Augments Cell.set()
@method setPasteHeight
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setPasteHeight = function(items, recalc) {
		var get = my.xtGet;
		items = my.safeObject(items);
		recalc = get(recalc, true);
		this.pasteHeight = get(items.pasteHeight, items.height, this.pasteHeight);
		if (recalc) {
			this.setDirtyHandles();
		}
		return this;
	};
	/**
Augments Cell.set()
@method setPasteWidth
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setPasteWidth = function(items, recalc) {
		var get = my.xtGet;
		items = my.safeObject(items);
		recalc = get(recalc, true);
		this.pasteWidth = get(items.pasteWidth, items.width, this.pasteWidth);
		if (recalc) {
			this.setDirtyHandles();
		}
		return this;
	};
	/**
Augments Cell.set()
@method setCopyHeight
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setCopyHeight = function(items) {
		var get = my.xtGet;
		items = my.safeObject(items);
		this.copyHeight = get(items.copyHeight, items.height, this.copyHeight);
		return this;
	};
	/**
Augments Cell.set()
@method setCopyWidth
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setCopyWidth = function(items) {
		var get = my.xtGet;
		items = my.safeObject(items);
		this.copyWidth = get(items.copyWidth, items.width, this.copyWidth);
		return this;
	};
	/**
Augments Cell.set()
@method setPasteVector
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setPasteVector = function(items, recalc) {
		var get = my.xtGet,
		so = my.safeObject,
		start = this.start,
		temp;
		items = so(items);
		recalc = get(recalc, true);
		temp = so(items.paste);
		start.x = get(items.pasteX, temp.x, start.x);
		start.y = get(items.pasteY, temp.y, start.y);
		if (recalc) {
			this.setDirtyStarts();
		}
		return this;
	};
	/**
Augments Cell.set()
@method setCopyVector
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setCopyVector = function(items) {
		var get = my.xtGet,
		so = my.safeObject,
		copy = this.copy,
		temp;
		items = so(items);
		temp = so(items.copy);
		copy.x = get(items.copyX, temp.x, copy.x);
		copy.y = get(items.copyY, temp.y, copy.y);
		return this;
	};
	/**
Cell.set hook function - modified by animation extension
@method animationCellSet
@private
**/
	my.Cell.prototype.animationCellSet = function(items) {};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Position.setDelta to allow changes to be made using attributes: source, sourceX, sourceY, sourceWidth, sourceHeight, start, startX, startY, target, targetX, targetY, targetWidth, targetHeight, globalAlpha

Note - setting the argument attribute __resolve__ to true will force a recalculation of the cell's copy and passte data; this is useful in particular for cells that do not undertake a full display cycle (when their cleared or compiled attributes have been set to false)

@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Cell.prototype.setDelta = function(items) {
		var xt = my.xt,
			xto = my.xto,
			i, iz;
		my.Position.prototype.setDelta.call(this, items);
		items = my.safeObject(items);
		if (xto(items.copy, items.copyX, items.copyY)) {
			this.setDeltaCopy(items);
		}
		if (xto(items.paste, items.pasteX, items.pasteY)) {
			this.setDeltaPaste(items, false);
		}
		if (xt(items.copyWidth)) {
			this.setDeltaCopyWidth(items);
		}
		if (xt(items.copyHeight)) {
			this.setDeltaCopyHeight(items);
		}
		if (xto(items.pasteWidth, items.width)) {
			this.setDeltaPasteWidth(items, false);
		}
		if (xto(items.pasteHeight, items.height)) {
			this.setDeltaPasteHeight(items, false);
		}
		if (xto(items.actualWidth, items.width)) {
			this.setDeltaActualWidth(items, false);
		}
		if (xto(items.actualHeight, items.height)) {
			this.setDeltaActualHeight(items, false);
		}
		// if (xto(items.actualHeight, items.height, items.actualWidth, items.width)){
		// 	for(i = 0, iz = this.groups.length; i < iz; i++){
		// 		my.group[this.groups[i]].setDirtyStarts()
		// 	}
		// }
		if (xt(items.roll)) {
			this.setDeltaRoll(items);
		}
		if (xt(items.globalAlpha)) {
			this.setDeltaGlobalAlpha(items);
		}
		if (xto(items.actualWidth, items.width, items.actualHeight, items.height)) {
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
		}
		if (xto(items.actualWidth, items.actualHeight, items.pasteWidth, items.pasteHeight, items.width, items.height, items.handle, items.handleX, items.handleY, items.scale)) {
			this.setDirtyHandles();
		}
		if (xto(items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY)) {
			this.setDirtyStarts();
		}
		if (items.resolve) {
			this.setCopy();
			this.setPaste();
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaGlobalAlpha
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Cell.prototype.setDeltaGlobalAlpha = function(items) {
		items = my.safeObject(items);
		this.globalAlpha += items.globalAlpha || 0;
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaRoll
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Cell.prototype.setDeltaRoll = function(items) {
		items = my.safeObject(items);
		this.roll += items.roll || 0;
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaActualHeight
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setDeltaActualHeight = function(items, recalc) {
		var height,
			get = my.xtGet;
		items = my.safeObject(items);
		recalc = get(recalc, true);
		height = get(items.actualHeight, items.height);
		this.actualHeight = (height.toFixed) ? this.actualHeight + height : this.actualHeight;
		if (recalc) {
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
			this.setDirtyHandles();
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaActualWidth
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setDeltaActualWidth = function(items, recalc) {
		var width,
			get = my.xtGet;
		items = my.safeObject(items);
		recalc = get(recalc, true);
		width = get(items.actualWidth, items.width);
		this.actualWidth = (width.toFixed) ? this.actualWidth + width : this.actualWidth;
		if (recalc) {
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
			this.setDirtyHandles();
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaPasteHeight
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setDeltaPasteHeight = function(items, recalc) {
		var height,
			get = my.xtGet;
		items = my.safeObject(items);
		recalc = get(recalc, true);
		height = get(items.pasteHeight, items.height);
		this.pasteHeight = (this.pasteHeight.toFixed) ? this.pasteHeight + height : my.addPercentages(this.pasteHeight, height);
		if (recalc) {
			this.setDirtyHandles();
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaCopyHeight
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setDeltaCopyHeight = function(items) {
		items = my.safeObject(items);
		this.copyHeight = (this.copyHeight.toFixed) ? this.copyHeight + items.copyHeight : my.addPercentages(this.copyHeight, items.copyHeight);
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaPasteWidth
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setDeltaPasteWidth = function(items, recalc) {
		var width,
			get = my.xtGet;
		items = my.safeObject(items);
		recalc = get(recalc, true);
		width = get(items.pasteWidth, items.width);
		this.pasteWidth = (this.pasteWidth.toFixed) ? this.pasteWidth + width : my.addPercentages(this.pasteWidth, width);
		if (recalc) {
			this.setDirtyHandles();
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaCopyWidth
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setDeltaCopyWidth = function(items) {
		items = my.safeObject(items);
		this.copyWidth = (this.copyWidth.toFixed) ? this.copyWidth + items.copyWidth : my.addPercentages(this.copyWidth, items.copyWidth);
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaPaste
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setDeltaPaste = function(items, recalc) {
		var temp,
			so = my.safeObject,
			get = my.xtGet,
			perc = my.addPercentages,
			start = this.start,
			x,
			y;
		items = so(items);
		recalc = my.xtGet(recalc, true);
		temp = so(items.paste);
		x = get(items.pasteX, temp.x, 0);
		y = get(items.pasteY, temp.y, 0);
		start.x = (this.start.x.toFixed) ? start.x + x : perc(start.x, x);
		start.y = (this.start.y.toFixed) ? start.y + y : perc(start.y, y);
		if (recalc) {
			this.setDirtyStarts();
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaCopy
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setDeltaCopy = function(items) {
		var temp,
			so = my.safeObject,
			get = my.xtGet,
			perc = my.addPercentages,
			copy = this.copy,
			x,
			y;
		items = so(items);
		temp = so(items.copy);
		x = get(items.copyX, temp.x, 0);
		y = get(items.copyY, temp.y, 0);
		copy.x = (x.toFixed) ? copy.x + x : perc(copy.x, x);
		copy.y = (y.toFixed) ? copy.y + y : perc(copy.y, y);
		return this;
	};
	/**
Set the Cell's &lt;canvas&gt; context engine to the specification supplied by the entity about to be drawn on the canvas
@method setEngine
@param {Entity} entity Entity object
@return Entity object
@private
**/
	my.Cell.prototype.setEngine = function(entity) {
		var cellContext,
			entityContext,
			cellEngine,
			changes,
			cName,
			eName,
			ctx = my.ctx,
			action = this.setEngineActions,
			stat1 = ['Gradient', 'RadialGradient', 'Pattern'];
		if (!entity.fastStamp) {
			cellContext = ctx[this.context];
			entityContext = ctx[entity.context];
			changes = entityContext.getChanges(entity, cellContext);
			if (Object.keys(changes).length > 0) {
				cellEngine = my.context[this.name];
				eName = entity.name;
				cName = this.name;
				for (var item in changes) {
					action[item](changes[item], cellEngine, stat1, eName, cName);
					cellContext[item] = changes[item];
				}
			}
		}
		return entity;
	};
	my.Cell.prototype.setEngineActions = {
		fillStyle: function(item, e, s, entity, cell) {
			var design, fillStyle;
			if (my.xt(my.design[item])) {
				design = my.design[item];
				if (my.contains(s, design.type)) {
					design.update(entity, cell);
				}
				fillStyle = design.getData();
			}
			else {
				fillStyle = item;
			}
			e.fillStyle = fillStyle;
		},
		font: function(item, e) {
			e.font = item;
		},
		globalAlpha: function(item, e) {
			e.globalAlpha = item;
		},
		globalCompositeOperation: function(item, e) {
			e.globalCompositeOperation = item;
		},
		lineCap: function(item, e) {
			e.lineCap = item;
		},
		lineDash: function(item, e) {
			e.mozDash = item;
			e.lineDash = item;
			if (e.setLineDash) {
				e.setLineDash(item);
			}
		},
		lineDashOffset: function(item, e) {
			e.mozDashOffset = item;
			e.lineDashOffset = item;
		},
		lineJoin: function(item, e) {
			e.lineJoin = item;
		},
		lineWidth: function(item, e) {
			e.lineWidth = item;
		},
		shadowBlur: function(item, e) {
			e.shadowBlur = item;
		},
		shadowColor: function(item, e) {
			e.shadowColor = item;
		},
		shadowOffsetX: function(item, e) {
			e.shadowOffsetX = item;
		},
		shadowOffsetY: function(item, e) {
			e.shadowOffsetY = item;
		},
		strokeStyle: function(item, e, s, entity, cell) {
			var design, strokeStyle;
			if (my.xt(my.design[item])) {
				design = my.design[item];
				if (my.contains(s, design.type)) {
					design.update(entity, cell);
				}
				strokeStyle = design.getData();
			}
			else {
				strokeStyle = item;
			}
			e.strokeStyle = strokeStyle;
		},
		miterLimit: function(item, e) {
			e.miterLimit = item;
		},
		textAlign: function(item, e) {
			e.textAlign = item;
		},
		textBaseline: function(item, e) {
			e.textBaseline = item;
		},
		winding: function(item, e) {
			e.mozFillRule = item;
			e.msFillRule = item;
		}
	};
	/**
groupSort
@method groupSort
@return nothing
@private
**/
	my.Cell.prototype.groupSort = function() {
		if (this.sortGroups) {
			this.sortGroups = false;
			this.groups = my.bucketSort('group', 'order', this.groups);
		}
	};
	/**
Clear the Cell's &lt;canvas&gt; element using JavaScript ctx.clearRect()
@method clear
@return This
@chainable
**/
	my.Cell.prototype.clear = function() {
		var cellContext,
			w = this.actualWidth,
			h = this.actualHeight,
			b = this.backgroundColor,
			cellEngine;
		cellEngine = my.context[this.name];
		cellContext = my.ctx[this.context];
		cellEngine.setTransform(1, 0, 0, 1, 0, 0);
		cellEngine.clearRect(0, 0, w, h);
		if (b !== 'rgba(0,0,0,0)') {
			cellEngine.fillStyle = b;
			cellEngine.fillRect(0, 0, w, h);
			cellContext.fillStyle = b;
		}
		return this;
	};
	/**
Prepare to draw entitys onto the Cell's &lt;canvas&gt; element, in line with the Cell's group Array

(This function is replaced by the Filters extension)
@method compile
@return This
@chainable
**/
	my.Cell.prototype.compile = function(mouse) {
		var group,
			i,
			iz;
		this.groupSort();
		for (i = 0, iz = this.groups.length; i < iz; i++) {
			group = my.group[this.groups[i]];
			if (group.visibility) {
				group.stamp(false, this.name, this, mouse);
			}
		}
		return this;
	};
	/**
Cell copy helper function
@method rotateDestination
@param {Object} engine Javascript canvas context object
@return This
@chainable
@private
**/
	my.Cell.prototype.rotateDestination = function(engine) {
		var reverse = (this.flipReverse) ? -1 : 1,
			upend = (this.flipUpend) ? -1 : 1,
			cos,
			sin,
			rotation = (this.addPathRoll) ? this.roll + this.pathRoll : this.roll,
			data = this.pasteData;
		if (rotation) {
			rotation *= 0.01745329251;
			cos = Math.cos(rotation);
			sin = Math.sin(rotation);
			engine.setTransform((cos * reverse), (sin * reverse), (-sin * upend), (cos * upend), data.x, data.y);
			return this;
		}
		engine.setTransform(reverse, 0, 0, upend, data.x, data.y);
		return this;
	};
	/**
Cell copy helper function
@method prepareToCopyCell
@param {Object} engine Javascript canvas context object
@return This
@chainable
@private
**/
	my.Cell.prototype.prepareToCopyCell = function(engine) {
		var data = this.pasteData;
		if (this.pivot) {
			this.setStampUsingPivot(my.pad[this.pad].base);
		}
		else {
			this.pathPrepareToCopyCell();
		}
		this.setCopy();
		this.setPaste();
		this.rotateDestination(engine);
		return this;
	};
	/**
Cell.prepareToCopyCell hook function - modified by path extension
@method pathPrepareToCopyCell
@private
**/
	my.Cell.prototype.pathPrepareToCopyCell = function() {};
	/**
Cell.setCopy update copyData object values
@method setCopy
@chainable
@private
**/
	my.Cell.prototype.setCopy = function() {
		var bet = my.isBetween,
			data = this.copyData,
			copy = this.copy,
			conv = this.numberConvert,
			floor = Math.floor,
			cw = this.copyWidth,
			ch = this.copyHeight,
			aw = this.actualWidth,
			ah = this.actualHeight;
		data.x = (copy.x.substring) ? conv(copy.x, aw) : copy.x;
		data.y = (copy.y.substring) ? conv(copy.y, ah) : copy.y;
		if (!bet(data.x, 0, aw - 1, true)) {
			data.x = (data.x < 0) ? 0 : aw - 1;
		}
		if (!bet(data.y, 0, ah - 1, true)) {
			data.y = (data.y < 0) ? 0 : ah - 1;
		}
		data.w = (cw.substring) ? conv(cw, aw) : cw;
		data.h = (ch.substring) ? conv(ch, ah) : ch;
		if (!bet(data.w, 1, aw, true)) {
			data.w = (data.w < 1) ? 1 : aw;
		}
		if (!bet(data.h, 1, ah, true)) {
			data.h = (data.h < 1) ? 1 : ah;
		}
		if (data.x + data.w > aw) {
			data.x = aw - data.w;
		}
		if (data.y + data.h > ah) {
			data.y = ah - data.h;
		}
		data.x = floor(data.x);
		data.y = floor(data.y);
		data.w = floor(data.w);
		data.h = floor(data.h);
		return this;
	};
	/**
Cell.setPaste helper function
@method setReference
@private
**/
	my.Cell.prototype.setReference = function() {
		var so = my.safeObject,
			cell = my.cell,
			pad = so(my.pad[this.pad]),
			display = so(cell[pad.display]),
			base = so(cell[pad.base]),
			isRaw = (!pad.base) ? true : false,
			isBase = (this.name === pad.base) ? true : false,
			isDisplay = (this.name === pad.display) ? true : false,
			isFirstCellInPad = (!pad.display) ? true : false;
		if (isFirstCellInPad) {
			this.reference = pad;
		}
		else if (isRaw) {
			this.reference = false;
		}
		else if (isBase) {
			this.reference = display;
		}
		else if (isDisplay) {
			this.reference = pad;
		}
		else {
			this.reference = base;
		}
	};
	/**
Cell.setPaste update pasteData object values
@method setPaste
@chainable
@private
**/
	my.Cell.prototype.setPaste = function() {
		var so = my.safeObject,
			cell = my.cell,
			pad = so(my.pad[this.pad]),
			display = so(cell[pad.display]),
			base = so(cell[pad.base]),
			stack = (my.xt(pad.group)) ? true : false,
			isBase = (this.name === pad.base) ? true : false,
			width, height,
			floor = Math.floor,
			conv = this.numberConvert,
			scale = this.scale,
			data = this.pasteData,
			start = this.currentStart,
			get = my.xtGet;
		if (my.xta(display, base)) {
			width = (this.name === pad.base) ? display.actualWidth : get(base.actualWidth, this.actualWidth, 300);
			height = (this.name === pad.base) ? display.actualHeight : get(base.actualHeight, this.actualHeight, 150);
			if (!start.flag) {
				if (!this.reference) {
					this.setReference();
				}
				this.updateCurrentStart(this.reference);
			}
			data.x = start.x;
			data.y = start.y;
			data.w = this.pasteWidth;
			if (data.w.substring) {
				data.w = conv(data.w, width);
			}
			if (!isBase || !stack) {
				data.w *= scale;
			}
			data.h = this.pasteHeight;
			if (data.h.substring) {
				data.h = conv(data.h, height);
			}
			if (!isBase || !stack) {
				data.h *= scale;
			}
			if (data.w < 1) {
				data.w = 1;
			}
			if (data.h < 1) {
				data.h = 1;
			}
			data.x = floor(data.x);
			data.y = floor(data.y);
			data.w = floor(data.w);
			data.h = floor(data.h);
		}
		return this;
	};
	/**
Cell copy helper function
@method copyCellToSelf
@param {String} cell CELLNAME of cell to be copied onto this cell's &lt;canvas&gt; element
@return This
@chainable
@private
**/
	my.Cell.prototype.copyCellToSelf = function(cell) {
		var destinationContext,
			destinationEngine,
			sourceEngine,
			sourceCanvas,
			copy, paste, offset;
		cell = (cell.substring) ? my.cell[cell] : cell;
		if (my.xt(cell)) {
			destinationEngine = my.context[this.name];
			destinationContext = my.ctx[this.name];
			sourceEngine = my.context[cell.name];
			sourceCanvas = my.canvas[cell.name];
			if (cell.globalAlpha !== destinationContext.globalAlpha) {
				destinationEngine.globalAlpha = cell.globalAlpha;
				destinationContext.globalAlpha = cell.globalAlpha;
			}
			if (cell.globalCompositeOperation !== destinationContext.globalCompositeOperation) {
				destinationEngine.globalCompositeOperation = cell.globalCompositeOperation;
				destinationContext.globalCompositeOperation = cell.globalCompositeOperation;
			}
			sourceEngine.setTransform(1, 0, 0, 1, 0, 0);
			offset = cell.currentHandle;
			if (!offset.flag) {
				cell.updateCurrentHandle();
			}
			cell.prepareToCopyCell(destinationEngine);
			copy = cell.copyData;
			paste = cell.pasteData;
			destinationEngine.drawImage(sourceCanvas, copy.x, copy.y, copy.w, copy.h, offset.x, offset.y, paste.w, paste.h);
		}
		return this;
	};
	/**
Entity stamp helper function
@method clearShadow
@return This
@chainable
@private
**/
	my.Cell.prototype.clearShadow = function(engine) {
		var context = my.ctx[this.context];
		engine.shadowOffsetX = 0.0;
		engine.shadowOffsetY = 0.0;
		engine.shadowBlur = 0.0;
		context.shadowOffsetX = 0.0;
		context.shadowOffsetY = 0.0;
		context.shadowBlur = 0.0;
		return this;
	};
	/**
Entity stamp helper function
@method restoreShadow
@return This
@chainable
@private
**/
	my.Cell.prototype.restoreShadow = function(engine, entitycontext) {
		var ctx = my.ctx,
			cellContext = ctx[this.context],
			entityContext = ctx[entitycontext];
		engine.shadowOffsetX = entityContext.shadowOffsetX;
		engine.shadowOffsetY = entityContext.shadowOffsetY;
		engine.shadowBlur = entityContext.shadowBlur;
		cellContext.shadowOffsetX = entityContext.shadowOffsetX;
		cellContext.shadowOffsetY = entityContext.shadowOffsetY;
		cellContext.shadowBlur = entityContext.shadowBlur;
		return this;
	};
	/**
Entity stamp helper function
@method setToClearShape
@return This
@chainable
@private
**/
	my.Cell.prototype.setToClearShape = function() {
		var context,
			engine;
		engine = my.context[this.name];
		context = my.ctx[this.context];
		engine.fillStyle = 'rgba(0, 0, 0, 0)';
		engine.strokeStyle = 'rgba(0, 0, 0, 0)';
		engine.shadowColor = 'rgba(0, 0, 0, 0)';
		context.fillStyle = 'rgba(0, 0, 0, 0)';
		context.strokeStyle = 'rgba(0, 0, 0, 0)';
		context.shadowColor = 'rgba(0, 0, 0, 0)';
		return this;
	};
	/**
Amend the physical dimensions of the Cell's &lt;canvas&gt; element

Omitting the argument will force the &lt;canvas&gt; to set itself to its Pad object's dimensions
@method setDimensions
@param {Object} [items] Argument with __width__ and/or __height__ attributes, in pixels
@return This
@chainable
**/
	my.Cell.prototype.setDimensions = function(items) {
		var pad = my.pad[this.pad],
			canvas = my.canvas[this.name],
			width = my.xtGet(items.width, items.actualWidth, this.actualWidth),
			height = my.xtGet(items.height, items.actualHeight, this.actualHeight);
		if (pad) {
			if (width.substring) {
				width = (parseFloat(width) / 100) * (pad.localWidth / pad.scale);
			}
			if (height.substring) {
				height = (parseFloat(height) / 100) * (pad.localHeight / pad.scale);
			}
		}
		canvas.width = width;
		canvas.height = height;
		this.actualWidth = width;
		this.actualHeight = height;
		return this;
	};
	/**
Perform a JavaScript ctx.save() operation
@method saveContext
@return This
@chainable
**/
	my.Cell.prototype.saveContext = function() {
		my.context[this.name].save();
		return this;
	};
	/**
Perform a JavaScript ctx.restore() operation
@method restoreContext
@return This
@chainable
**/
	my.Cell.prototype.restoreContext = function() {
		my.context[this.name].restore();
		return this;
	};
	/**
Capture an image of the cell's &lt;canvas&gt; element using the JavaScript ctx.getImageData() operation

Argument is an Object in the form:

* {x:Number, y:Number, width:Number, height:Number}

Default values are:

* {0, 0, this.actualWidth, this.actualHeight}

@method getImageData
@param {Object} dimensions Details of the &lt;canvas&gt; area to be saved
@return String label pointing to where the image has been saved in the scrawl library - scrawl.imageData[STRING]
**/
	my.Cell.prototype.getImageData = function(dimensions) {
		var x,
			y,
			get = my.xtGet,
			width,
			height,
			label;
		dimensions = my.safeObject(dimensions);
		label = (dimensions.name && dimensions.name.substring) ? this.name + '_' + dimensions.name : this.name + '_imageData';
		x = get(dimensions.x, 0);
		y = get(dimensions.y, 0);
		width = get(dimensions.width, this.actualWidth);
		height = get(dimensions.height, this.actualHeight);
		my.imageData[label] = my.context[this.name].getImageData(x, y, width, height);
		return label;
	};

	/**
# Context

## Instantiation

* This object should never be instantiated by users

## Purpose

* wraps a given context for a Cell or Entity object
* responsible for comparing contexts and listing changes that need to be made for successful Entity stamping on a canvas
* all updates to a Context object's attributes should be performed via the Entity object's set() function

@class Context
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Context = function(items) {
		items = my.safeObject(items);
		my.Base.call(this, items);
		if (items.cell) {
			this.getContextFromEngine(items.cell);
		}
		else {
			this.set(items);
		}
		my.ctx[this.name] = this;
		my.pushUnique(my.ctxnames, this.name);
		return this;
	};
	my.Context.prototype = Object.create(my.Base.prototype);
	/**
@property type
@type String
@default 'Context'
@final
**/
	my.Context.prototype.type = 'Context';
	my.Context.prototype.classname = 'ctxnames';
	my.work.d.Context = {
		/**
Color, gradient or pattern used to fill a entity. Can be:

* Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
* COLORNAME String
* GRADIENTNAME String
* RADIALGRADIENTNAME String
* PATTERNNAME String
@property fillStyle
@type String
@default '#000000'
**/
		fillStyle: '#000000',
		/**
Shape and Path entity fill method. Can be:

* 'nonzero' - all areas enclosed by the entity's path are flooded
* 'evenodd' - only 'odd' areas of the entity's path are flooded
@property winding
@type String
@default 'nonzero'
**/
		winding: 'nonzero',
		/**
Color, gradient or pattern used to outline a entity. Can be:

* Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
* COLORNAME String
* GRADIENTNAME String
* RADIALGRADIENTNAME String
* PATTERNNAME String
@property strokeStyle
@type String
@default '#000000'
**/
		strokeStyle: '#000000',
		/**
Entity transparency - a value between 0 and 1, where 0 is completely transparent and 1 is completely opaque
@property globalAlpha
@type Number
@default 1
**/
		globalAlpha: 1,
		/**
Compositing method for applying the entity to an existing Cell (&lt;canvas&gt;) display. Permitted values include

* 'source-over'
* 'source-atop'
* 'source-in'
* 'source-out'
* 'destination-over'
* 'destination-atop'
* 'destination-in'
* 'destination-out'
* 'lighter'
* 'darker'
* 'copy'
* 'xor'

_Be aware that different browsers render these operations in different ways, and some options are not supported by all browsers_

@property globalCompositeOperation
@type String
@default 'source-over'
**/
		globalCompositeOperation: 'source-over',
		/**
Line width, in pixels
@property lineWidth
@type Number
@default 1
**/
		lineWidth: 1,
		/**
Line cap styling. Permitted values include:

* 'butt'
* 'round'
* 'square'

@property lineCap
@type String
@default 'butt'
**/
		lineCap: 'butt',
		/**
Line join styling. Permitted values include:

* 'miter'
* 'round'
* 'bevel'

@property lineJoin
@type String
@default 'miter'
**/
		lineJoin: 'miter',
		/**
Line dash format - an array of Numbers representing line and gap values (in pixels), for example [5,2,2,2] for a long-short dash pattern
@property lineDash
@type Array
@default []
**/
		lineDash: [],
		/**
Line dash offset - distance along the entity's outline at which to start the line dash. Changing this value can be used to create a 'marching ants effect
@property lineDashOffset
@type Number
@default 0
**/
		lineDashOffset: 0,
		/**
miterLimit - affecting the 'pointiness' of the line join where two lines join at an acute angle
@property miterLimit
@type Number
@default 10
**/
		miterLimit: 10,
		/**
Horizontal offset of a entity's shadow, in pixels
@property shadowOffsetX
@type Number
@default 0
**/
		shadowOffsetX: 0,
		/**
Vertical offset of a entity's shadow, in pixels
@property shadowOffsetY
@type Number
@default 0
**/
		shadowOffsetY: 0,
		/**
Blur border for a entity's shadow, in pixels
@property shadowBlur
@type Number
@default 0
**/
		shadowBlur: 0,
		/**
Color used for entity shadow effect. Can be:

* Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
* COLORNAME String
@property shadowColor
@type String
@default 'rgba(0,0,0,0)'
**/
		shadowColor: 'rgba(0,0,0,0)',
		/**
Cascading Style Sheet font String, for Phrase entitys
@property font
@type String
@default '10pt sans-serif'
**/
		font: '10pt sans-serif',
		/**
Text alignment for multi-line Phrase entitys. Permitted values include:

* 'start'
* 'left'
* 'center'
* 'right'
* 'end'

@property textAlign
@type String
@default 'start'
**/
		textAlign: 'start',
		/**
Text baseline value for single-line Phrase entitys set to follow a Path entity path. Permitted values include:

* 'alphabetic'
* 'top'
* 'hanging'
* 'middle'
* 'ideographic'
* 'bottom'

@property textBaseline
@type String
@default 'alphabetic'
**/
		textBaseline: 'alphabetic'
	};
	my.work.contextKeys = Object.keys(my.work.d.Context);
	my.mergeInto(my.work.d.Context, my.work.d.Base);
	/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function - lineDashOffset, lineWidth, globalAlpha

(Only for use by Context objects)
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
	my.Context.prototype.setDelta = function(items) {
		var xt = my.xt,
			d = my.work.d.Context;
		items = my.safeObject(items);
		if (xt(items.lineDashOffset)) {
			if (!xt(this.lineDashOffset)) {
				this.lineDashOffset = d.lineDashOffset + items.lineDashOffset;
			}
			this.lineDashOffset += items.lineDashOffset;
		}
		if (xt(items.lineWidth)) {
			if (!xt(this.lineWidth)) {
				this.lineWidth = d.lineWidth + items.lineWidth;
			}
			this.lineWidth += items.lineWidth;
			if (this.lineWidth < 0) {
				this.lineWidth = 0;
			}
		}
		if (xt(items.globalAlpha)) {
			if (!xt(this.globalAlpha)) {
				this.globalAlpha = d.globalAlpha + items.globalAlpha;
			}
			this.globalAlpha += items.globalAlpha;
			if (!my.isBetween(this.globalAlpha, 0, 1, true)) {
				this.globalAlpha = (this.globalAlpha > 0.5) ? 1 : 0;
			}
		}
		return this;
	};
	/**
Interrogates a &lt;canvas&gt; element's context engine and populates its own attributes with returned values

(Only for use by Context objects)
@method getContextFromEngine
@param {Object} ctx &lt;canvas&gt; element context engine Object
@return This
@chainable
@private
**/
	my.Context.prototype.getContextFromEngine = function(ctx) {
		var keys = my.work.contextKeys,
			get = my.xtGet;
		for (var i = 0, iz = keys.length; i < iz; i++) {
			this[keys[i]] = ctx[keys[i]];
		}
		this.winding = get(ctx.mozFillRule, ctx.msFillRule, 'nonzero');
		this.lineDash = (my.xt(ctx.lineDash)) ? ctx.lineDash : [];
		this.lineDashOffset = get(ctx.mozDashOffset, ctx.lineDashOffset, 0);
		return this;
	};
	/**
Interrogates a &lt;canvas&gt; element's context engine and returns an object of non-default attributes
@private
**/
	my.Context.prototype.getNonDefaultAttributes = function() {
		var d = my.work.d.Context,
			xt = my.xt,
			keys = my.work.contextKeys,
			i, iz,
			result = {};
		for (i = 0, iz = keys.length; i < iz; i++) {
			if (keys[i] === 'lineDash' && this.lineDash && this.lineDash.length > 0) {
				result.lineDash = this.lineDash;
			}
			else if (xt(this[keys[i]]) && this[keys[i]] != d[keys[i]]) {
				result[keys[i]] = this[keys[i]];
			}
		}
		return result;
	};
	/**
Interrogates a &lt;canvas&gt; element's context engine and populates its own attributes with returned values

(Only for use by Context objects)
@method getChanges
@param {Object} ctx &lt;canvas&gt; element context engine Object
@return This
@chainable
@private
**/
	my.Context.prototype.getChanges = function(entity, ctx) {
		var c = ctx.getNonDefaultAttributes(),
			ca = Object.keys(c),
			e = this.getNonDefaultAttributes(),
			ea = Object.keys(e),
			d, color,
			df = my.work.d.Context,
			result = {},
			contains = my.contains,
			i, iz;
		for (i = 0, iz = ca.length; i < iz; i++) {
			if (!contains(ea, ca[i])) {
				result[ca[i]] = df[ca[i]];
			}
		}
		for (i = 0, iz = ea.length; i < iz; i++) {
			if (ea[i] === 'lineWidth' && entity.scaleOutline) {
				if (e.lineWidth * entity.scale !== c.lineWidth) {
					result.lineWidth = e.lineWidth * entity.scale;
				}
			}
			else if (e[ea[i]] != c[ea[i]]) {
				result[ea[i]] = e[ea[i]];
			}
			else if (contains(['fillStyle', 'strokeStyle', 'shadowColor'], ea[i])) {
				d = my.design[e[ea[i]]];
				if (d && d.type === 'Color') {
					color = d.getData();
					if (color !== c[ea[i]]) {
						result[ea[i]] = color;
					}
				}
				else if (ea[i] != 'shadowColor' && d && d.autoUpdate) {
					result[ea[i]] = e[ea[i]];
				}
			}
		}
		return result;
	};

	/**
# Group

## Instantiation

* scrawl.makeGroup()

## Purpose

* associates entity objects with a cell object, for stamping/compiling the &lt;canvas&gt; scene
* groups Entity objects for specific purposes
* (with collisions extension) plays a key role in collision detection between Entitys

## Access

* scrawl.group.GROUPNAME - for the Group object
* scrawl.cell[scrawl.group.GROUPNAME.cell] - for the Group object's default Cell object

@class Group
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Group = function(items) {
		var get = my.xtGet,
		pu = my.pushUnique;
		items = my.safeObject(items);
		my.Base.call(this, items);
		/**
Array of SPRITENAME Strings of entitys that comprise this Group
@property entitys
@type Array
@default []
**/
		this.entitys = (my.xt(items.entitys)) ? [].concat(items.entitys) : [];
		/**
CELLNAME of the default Cell object to which this group is associated
@property cell
@type String
@default ''
**/
		this.cell = items.cell || my.pad[my.work.currentPad].current;
		/**
Group order value - lower order Groups are drawn on &lt;canvas&gt; elements before higher order Groups
@property order
@type Number
@default 0
**/
		this.order = get(items.order, 0);
		/**
Resort flag
@property resort
@type Boolean
@default false
@private
**/
		this.resort = true;
		/**
Visibility flag - Group entitys will (in general) not be drawn on a &lt;canvas&gt; element when this flag is set to false
@property visibility
@type Boolean
@default true
**/
		this.visibility = get(items.visibility, true);
		/**
Sorting flag - when set to true, Groups will sort their constituent entity object according to their entity.order attribute for each iteration of the display cycle
@property entitySort
@type Boolean
@default true
**/
		this.entitySort = get(items.entitySort, true);
		/**
Collision checking radius, in pixels - as a first step in a collision check, the Group will winnow potential collisions according to how close the checked entity is to the current reference entity or mouse coordinate; when set to 0, this collision check step is skipped and all entitys move on to the next step
@property regionRadius
@type Number
@default 0
**/
		this.regionRadius = get(items.regionRadius, 0);
		my.group[this.name] = this;
		pu(my.groupnames, this.name);
		pu(my.cell[this.cell].groups, this.name);
		return this;
	};
	my.Group.prototype = Object.create(my.Base.prototype);
	/**
@property type
@type String
@default 'Group'
@final
**/
	my.Group.prototype.type = 'Group';
	my.Group.prototype.classname = 'groupnames';
	my.work.d.Group = {
		entitys: [],
		cell: '',
		order: 0,
		visibility: true,
		entitySort: true,
		resort: false,
		regionRadius: 0
	};
	my.mergeInto(my.work.d.Group, my.work.d.Base);
	/**
set
@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
	my.Group.prototype.set = function(items) {
		my.Base.prototype.set.call(this, items);
		if (my.xt(items.order)) {
			my.cell[this.cell].sortGroups = true;
		}
		return this;
	};
	/**
Entity sorting routine - entitys are sorted according to their entity.order attribute value, in ascending order

Order values are treated as integers. The sort routine is a form of bucket sort, and should be stable (entitys with equal order values should not be swapped)
@method sortEntitys
@param {Boolean} [force] Force a resort, whatever the settings of the group's entitySort and resort attributes
@return Nothing
@private
**/
	my.Group.prototype.sortEntitys = function(force) {
		if (force || (this.entitySort && this.resort)) {
			this.resort = false;
			this.entitys = my.bucketSort('entity', 'order', this.entitys);
		}
	};
	/**
Tell the Group to ask _all_ of its constituent entitys to draw themselves on a &lt;canvas&gt; element, regardless of their visibility
@method forceStamp
@param {String} [method] Drawing method String
@param {String} [cellname] CELLNAME of cell on which entitys are to draw themselves
@param {Object} [cell] cell wrapper object
@param {Vector} [mouse] coordinates to be used for any entity currently pivoted to a mouse/touch event
@return This
@chainable
**/
	my.Group.prototype.forceStamp = function(method, cellname, cell, mouse) {
		var visibility = this.visibility;
		this.visibility = true;
		this.stamp(method, cellname, cell, mouse);
		this.visibility = visibility;
		return this;
	};
	/**
Tell the Group to ask its constituent entitys to draw themselves on a &lt;canvas&gt; element; only entitys whose visibility attribute is set to true will comply
@method stamp
@param {String} [method] Drawing method String
@param {String} [cellname] CELLNAME of cell on which entitys are to draw themselves
@param {Object} [cell] cell wrapper object
@param {Vector} [mouse] coordinates to be used for any entity currently pivoted to a mouse/touch event
@return This
@chainable
**/
	my.Group.prototype.stamp = function(method, cellname, cell, mouse) {
		var entity,
			entitys,
			e = my.entity,
			i,
			iz;
		if (this.visibility) {
			this.sortEntitys();
			entitys = this.entitys;
			cell = (my.xt(cell)) ? cell : my.cell[cellname];
			for (i = 0, iz = entitys.length; i < iz; i++) {
				entity = e[entitys[i]];
				if (entity) {
					entity.group = this.name;
					entity.stamp(method, cellname, cell, mouse);
				}
			}
		}
		return this;
	};
	/**
Add entitys to the Group
@method addEntitysToGroup
@param {Array} item Array of SPRITENAME Strings; alternatively, a single SPRITENAME String can be supplied as the argument
@return This
@chainable
**/
	my.Group.prototype.addEntitysToGroup = function() {
		var slice = [],
			pu = my.pushUnique,
			entitys = this.entitys,
			i,
			iz,
			e,
			xt = my.xt;
		for (i = 0, iz = arguments.length; i < iz; i++) {
			if (xt(arguments[i])) {
				if (Array.isArray(arguments[i])) {
					slice = slice.concat(arguments[i]);
				}
				else if (Array.isArray(arguments[i][0])) {
					slice = slice.concat(arguments[i][0]);
				}
				else {
					slice.push(arguments[i]);
				}
			}
		}
		for (i = 0, iz = slice.length; i < iz; i++) {
			e = slice[i];
			if (my.xt(e)) {
				if (e.substring) {
					pu(entitys, e);
				}
				else {
					if (my.xt(e.name)) {
						pu(entitys, e.name);
					}
				}
			}
		}
		this.resort = true;
		return this;
	};
	/**
Remove entitys from the Group
@method removeEntitysFromGroup
@param {Array} item Array of SPRITENAME Strings; alternatively, a single SPRITENAME String can be supplied as the argument
@return This
@chainable
**/
	my.Group.prototype.removeEntitysFromGroup = function() {
		var slice = [],
			ri = my.removeItem,
			entitys = this.entitys,
			i,
			iz,
			e,
			xt = my.xt;
		for (i = 0, iz = arguments.length; i < iz; i++) {
			if (xt(arguments[i])) {
				if (Array.isArray(arguments[i])) {
					slice = slice.concat(arguments[i]);
				}
				else if (Array.isArray(arguments[i][0])) {
					slice = slice.concat(arguments[i][0]);
				}
				else {
					slice.push(arguments[i]);
				}
			}
		}
		for (i = 0, iz = slice.length; i < iz; i++) {
			e = slice[i];
			if (my.xt(e)) {
				if (e.substring) {
					ri(entitys, e);
				}
				else {
					if (my.xt(e.name)) {
						ri(entitys, e.name);
					}
				}
			}
		}
		this.resort = true;
		return this;
	};
	/**
Ask all entitys in the Group to perform a setDelta() operation

start delta coordinates can be supplied in the form of __x__ and __y__ attributes in the argument object, in addition to the more normal __startX__ and __startY__ attributes

@method updateEntitysBy
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
	my.Group.prototype.updateEntitysBy = function(items) {
		var entitys = this.entitys,
			entity = my.entity,
			xt = my.xt,
			i,
			iz;
		items = my.safeObject(items);
		if (xt(items.x)) {
			items.startX = items.x;
		}
		if (xt(items.y)) {
			items.startY = items.y;
		}
		for (i = 0, iz = entitys.length; i < iz; i++) {
			entity[entitys[i]].setDelta(items);
		}
		return this;
	};
	/**
Ask all entitys in the Group to perform a set() operation
@method setEntitysTo
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
	my.Group.prototype.setEntitysTo = function(items) {
		var entitys = this.entitys,
			i,
			iz;
		for (i = 0, iz = entitys.length; i < iz; i++) {
			my.entity[entitys[i]].set(items);
		}
		return this;
	};
	/**
Require all entitys in the Group to set their pivot attribute to the supplied POINTNAME or SPRITENAME string, and set their handle Vector to reflect the current vector between that entity or Point object's start Vector and their own Vector

This has the effect of turning a set of disparate entitys into a single, coordinated group.
@method pivotEntitysTo
@param {String} item SPRITENAME or POINTNAME String
@return This
@chainable
**/
	my.Group.prototype.pivotEntitysTo = function(item) {
		var pivot,
			pivotVector,
			entity,
			entitys = this.entitys,
			e = my.entity,
			entityVector,
			v = my.work.v,
			i,
			iz,
			arg = {
				pivot: 0,
				handleX: 0,
				handleY: 0
			};
		item = (item.substring) ? item : false;
		if (item) {
			pivot = e[item] || my.point[item] || false;
			if (pivot) {
				pivotVector = (pivot.type === 'Point') ? pivot.local : pivot.start;
				for (i = 0, iz = entitys.length; i < iz; i++) {
					entity = e[entitys[i]];
					entityVector = v.set(entity.start);
					entityVector.vectorSubtract(pivotVector);
					arg.pivot = item;
					arg.handleX = -entityVector.x;
					arg.handleY = -entityVector.y;
					entity.set(arg);
				}
			}
		}
		return this;
	};
	/**
Check all entitys in the Group to see if they are colliding with the supplied coordinate. The check is done in reverse order after the entitys have been sorted; the entity Object with the highest order value that is colliding with the coordinate is returned
@method getEntityAt
@param {Vector} items Coordinate vector; alternatively an Object with x and y attributes can be used
@return Entity object, or false if no entitys are colliding with the coordinate
**/
	my.Group.prototype.getEntityAt = function(items) {
		var entity,
			v1 = my.work.colv1,
			v2 = my.work.colv2,
			entitys = this.entitys,
			e = my.entity,
			rad = this.regionRadius,
			coordinate,
			i;
		items = my.safeObject(items);
		coordinate = v1.set(items); //coordinate = my.work.colv1
		coordinate = my.Position.prototype.correctCoordinates(coordinate, this.cell); //coordinate = my.work.v
		this.sortEntitys();
		for (i = entitys.length - 1; i >= 0; i--) {
			entity = e[entitys[i]];
			if (rad) {
				v2.set(entity.currentStart).vectorSubtract(coordinate);
				if (v2.getMagnitude() > rad) {
					continue;
				}
			}
			if (entity.checkHit(coordinate)) {
				return entity;
			}
		}
		return false;
	};
	/**
Check all entitys in the Group to see which one(s) are associated with a particular mouse index
@method getEntitysByMouseIndex
@param {String} item Mouse index string
@return Array of Entity objects
**/
	my.Group.prototype.getEntitysByMouseIndex = function(item) {
		var result = [],
			entitys = this.entitys,
			e = my.entity,
			i, iz,
			entity;
		if (item.substring) {
			for (i = 0, iz = entitys.length; i < iz; i++) {
				entity = e[entitys[i]];
				if (entity.mouseIndex === item) {
					result.push(entity);
				}
			}
		}
		return result;
	};
	/**
Check all entitys in the Group to see if they are colliding with the supplied coordinate. The check is done in reverse order after the entitys have been sorted; all entitys (in the group) colliding with the coordinate are returned as an array of entity objects
@method getAllEntitysAt
@param {Vector} items Coordinate vector; alternatively an Object with x and y attributes can be used
@return Array of Entity objects
**/
	my.Group.prototype.getAllEntitysAt = function(items) {
		var entity,
			v1 = my.work.colv1,
			v2 = my.work.colv2,
			coordinate,
			results,
			entitys = this.entitys,
			e = my.entity,
			rad = this.regionRadius,
			i;
		items = my.safeObject(items);
		coordinate = v1.set(items); //coordinate = my.work.colv1
		results = [];
		coordinate = my.Position.prototype.correctCoordinates(coordinate, this.cell); //coordinate = my.work.v
		this.sortEntitys();
		for (i = entitys.length - 1; i >= 0; i--) {
			entity = e[entitys[i]];
			if (rad) {
				v2.set(entity.currentStart).vectorSubtract(coordinate);
				if (v2.getMagnitude() > rad) {
					continue;
				}
			}
			if (entity.checkHit(coordinate)) {
				results.push(entity);
			}
		}
		return (results.length > 0) ? results : false;
	};
	/**
Augments Group.set()
@method setDirtyStarts
@return This
@chainable
@private
**/
	my.Group.prototype.setDirtyStarts = function() {
		var entity = my.entity,
			entitys = this.entitys,
			e,
			i, iz,
			xt = my.xt;
		for (i = 0, iz = entitys.length; i < iz; i++) {
			e = entity[entitys[i]];
			if (xt(e)) {
				e.currentStart.flag = false;
			}
		}
		return this;
	};
	/**
Augments Group.set()
@method setDirtyHandles
@return This
@chainable
@private
**/
	my.Group.prototype.setDirtyHandles = function() {
		var entity = my.entity,
			entitys = this.entitys,
			e,
			i, iz,
			xt = my.xt;
		for (i = 0, iz = entitys.length; i < iz; i++) {
			e = entity[entitys[i]];
			if (xt(e)) {
				e.currentHandle.flag = false;
			}
		}
		return this;
	};

	/**
# Entity

## Instantiation

* This object should never be instantiated by users

## Purpose

* Supplies the common methodology for all Scrawl entitys: Phrase, Block, Wheel, Picture, Path, Shape
* Sets up the attributes for holding a entity's current state: position, visibility, rotation, drawing order, context
* Describes how entitys should be stamped onto a Cell's canvas
* Provides drag-and-drop functionality

__Scrawl core does not include any entity type constructors.__ Each entity type used on a web page canvas needs to be added to the core by loading its associated extension:

* __Block__ entitys are defined in the _scrawlBlock_ extension (alias: block)
* __Wheel__ entitys are defined in the _scrawlWheel_ extension (alias: wheel)
* __Phrase__ entitys are defined in the _scrawlPhrase_ extension (alias: phrase)
* __Picture__ entitys are defined as part of the _scrawlImages_ extension (alias: images)
* __Path__ entitys are defined in the _scrawlPath_ extension (alias: path)
* __Shape__ entitys are defined in the _scrawlShape_ extension (alias: shape)
* additional factory functions for defining common Path and Shape objects (lines, curves, ovals, triangles, stars, etc) are supplied by the _scrawlPathFactories_ extension (alias: factories)

@class Entity
@constructor
@extends Position
@uses Context
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Entity = function(items) {
		var get = my.xtGet;
		items = my.safeObject(items);
		my.Position.call(this, items);
		items.name = this.name;
		var myContext = my.makeContext(items);
		/**
CTXNAME of this Entity's Context object
@property context
@type String
@default ''
@private
**/
		this.context = myContext.name;
		/**
GROUPNAME String for this entity's default group

_Note: a entity can belong to more than one group by being added to other Group objects via the __scrawl.addEntitysToGroups()__ and __Group.addEntityToGroup()__ functions_
@property group
@type String
@default ''
**/
		this.group = this.getGroup(items);
		/**
Display cycle flag; if set to true, entity will not change the &lt;canvas&gt; element's context engine's settings before drawing itself on the cell
@property fastStamp
@type Boolean
@default false
**/
		this.fastStamp = get(items.fastStamp, false);
		/**
Scaling flag; set to true to ensure lineWidth scales in line with the scale attribute value
@property scaleOutline
@type Boolean
@default true
**/
		this.scaleOutline = get(items.scaleOutline, true);
		/**
Entity order value - lower order entitys are drawn on &lt;canvas&gt; elements before higher order entitys
@property order
@type Number
@default 0
**/
		this.order = get(items.order, 0);
		/**
Visibility flag - entitys will (in general) not be drawn on a &lt;canvas&gt; element when this flag is set to false
@property visibility
@type Boolean
@default true
**/
		this.visibility = get(items.visibility, true);
		/**
Entity drawing method. An entity can be drawn onto a &lt;canvas&gt; element in a variety of ways; these methods include:

* 'draw' - stroke the entity's path with the entity's strokeStyle color, pattern or gradient
* 'fill' - fill the entity's path with the entity's fillStyle color, pattern or gradient
* 'drawFill' - stroke, and then fill, the entity's path; if a shadow offset is present, the shadow is added only to the stroke action
* 'fillDraw' - fill, and then stroke, the entity's path; if a shadow offset is present, the shadow is added only to the fill action
* 'floatOver' - stroke, and then fill, the entity's path; shadow offset is added to both actions
* 'sinkInto' - fill, and then stroke, the entity's path; shadow offset is added to both actions
* 'clear' - fill the entity's path with transparent color 'rgba(0, 0, 0, 0)'
* 'clearWithBackground' - fill the entity's path with the Cell's current backgroundColor
* 'clip' - clip the drawing zone to the entity's path (not tested)
* 'none' - perform all necessary updates, but do not draw the entity onto the canvas

_Note: not all entitys support all of these operations_
@property method
@type String
@default 'fill'
**/
		this.method = get(items.method, my.work.d[this.type].method);
		this.collisionsEntityConstructor(items);
		this.filtersEntityInit(items);
		return this;
	};
	my.Entity.prototype = Object.create(my.Position.prototype);
	/**
@property type
@type String
@default 'Entity'
@final
**/
	my.Entity.prototype.type = 'Entity';
	my.Entity.prototype.classname = 'entitynames';
	my.work.d.Entity = {
		order: 0,
		visibility: true,
		method: 'fill',
		/**
Current SVGTiny data string for the entity (only supported by Path and Shape entitys)
@property data
@type String
@default ''
**/
		data: '',
		/**
Entity radius, in pixels - not supported by all entity objects
@property radius
@type Number
@default 0
**/
		radius: 0,
		scaleOutline: true,
		fastStamp: false,
		context: '',
		group: ''
	};
	my.mergeInto(my.work.d.Entity, my.work.d.Position);
	/**
Entity constructor hook function - modified by filters extension
@method filtersEntityInit
@private
**/
	my.Entity.prototype.filtersEntityInit = function(items) {};
	/**
Entity constructor hook function - modified by collisions extension
@method collisionsEntityConstructor
@private
**/
	my.Entity.prototype.collisionsEntityConstructor = function(items) {};
	/**
Constructor helper function - register entity object in the scrawl library
@method registerInLibrary
@return This
@chainable
@private
**/
	my.Entity.prototype.registerInLibrary = function(items) {
		my.entity[this.name] = this;
		my.pushUnique(my.entitynames, this.name);
		my.group[this.group].addEntitysToGroup(this.name);
		this.collisionsEntityRegisterInLibrary(items);
		return this;
	};
	/**
Entity.registerInLibrary hook function - modified by collisions extension
@method collisionsEntityRegisterInLibrary
@private
**/
	my.Entity.prototype.collisionsEntityRegisterInLibrary = function() {};
	/**
Augments Position.get()

Allows users to retrieve a entity's Context object's values via the entity
@method get
@param {String} item attribute key string
@return Attribute value
**/
	my.Entity.prototype.get = function(item) {
		var xt = my.xt,
			d = my.work.d;
		if (xt(d.Base[item])) {
			return my.Base.prototype.get.call(this, item);
		}
		if (xt(d.Context[item])) {
			return my.ctx[this.context].get(item);
		}
		return my.Position.prototype.get.call(this, item);
	};
	/**
Augments Position.set()

Allows users to:
* set a entity's Context object's values via the entity
* shift a entity between groups
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Entity.prototype.set = function(items) {
		var group = my.group,
			xt = my.xt,
			xto = my.xto;
		my.Position.prototype.set.call(this, items);
		my.ctx[this.context].set(items);
		items = my.safeObject(items);
		if (xt(items.group) && items.group !== this.group) {
			group[this.group].removeEntitysFromGroup(this.name);
			this.group = this.getGroup(items.group);
			group[this.group].addEntitysToGroup(this.name);
		}
		this.collisionsEntitySet(items);
		if (xt(items.order)) {
			group[this.group].resort = true;
		}
		if (xt(items.lineWidth)) {
			this.maxDimensions.flag = true;
		}
		return this;
	};
	/**
Entity.set hook function - modified by collisions extension
@method collisionsEntitySet
@private
**/
	my.Entity.prototype.collisionsEntitySet = function() {};
	/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function

Allows users to amend a entity's Context object's values via the entity, in addition to its own attribute values
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Entity.prototype.setDelta = function(items) {
		my.Position.prototype.setDelta.call(this, items);
		items = my.safeObject(items);
		if (my.xto(items.lineDashOffset, items.lineWidth, items.globalAlpha)) {
			my.ctx[this.context].setDelta(items);
			if (my.xt(items.lineWidth)) {
				this.maxDimensions.flag = true;
			}
		}
		this.collisionsEntitySetDelta(items);
		return this;
	};
	/**
Entity.setDelta hook function - modified by collisions extension
@method collisionsEntitySetDelta
@private
**/
	my.Entity.prototype.collisionsEntitySetDelta = function() {};
	/**
Augments Position.clone()
@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
	my.Entity.prototype.clone = function(items) {
		var context,
			enhancedItems,
			clone,
			i, iz;
		items = my.safeObject(items);

		context = JSON.parse(JSON.stringify(my.ctx[this.context]));
		delete context.name;
		enhancedItems = my.mergeInto(items, context);
		delete enhancedItems.context;
		clone = my.Position.prototype.clone.call(this, enhancedItems);
		if (my.xt(items.createNewContext) && !items.createNewContext) {
			delete my.ctx[clone.context];
			my.removeItem(my.ctxnames, clone.context);
			clone.context = this.context;
		}
		return clone;
	};
	/**
Constructor helper function - discover this entity's default group affiliation
@method getGroup
@param {Object} [items] Constructor argument
@return GROUPNAME String
@private
**/
	my.Entity.prototype.getGroup = function(items) {
		items = my.safeObject(items);
		if (my.xt(items.group) && my.group[items.group]) {
			return items.group;
		}
		else {
			return my.pad[my.work.currentPad].current;
		}
	};
	/**
Helper function - get a entity's cell onbject
@method getEntityCell
@return Cell object
@private
**/
	my.Entity.prototype.getEntityCell = function(items) {
		return my.cell[my.group[this.getGroup(items)].cell];
	};
	/**
Stamp function - instruct entity to draw itself on a Cell's &lt;canvas&gt; element, regardless of the setting of its visibility attribute

Permitted methods include:

* 'draw' - stroke the entity's path with the entity's strokeStyle color, pattern or gradient
* 'fill' - fill the entity's path with the entity's fillStyle color, pattern or gradient
* 'drawFill' - stroke, and then fill, the entity's path; if a shadow offset is present, the shadow is added only to the stroke action
* 'fillDraw' - fill, and then stroke, the entity's path; if a shadow offset is present, the shadow is added only to the fill action
* 'floatOver' - stroke, and then fill, the entity's path; shadow offset is added to both actions
* 'sinkInto' - fill, and then stroke, the entity's path; shadow offset is added to both actions
* 'clear' - fill the entity's path with transparent color 'rgba(0, 0, 0, 0)'
* 'clearWithBackground' - fill the entity's path with the Cell's current backgroundColor
* 'clip' - clip the drawing zone to the entity's path (not tested)
* 'none' - perform all necessary updates, but do not draw the entity onto the canvas
@method forceStamp
@param {String} [method] Permitted method attribute String; by default, will use entity's own method setting
@param {String} [cellname] CELLNAME of cell on which entitys are to draw themselves
@param {Object} [cell] cell wrapper object
@param {Vector} [mouse] coordinates to be used for any entity currently pivoted to a mouse/touch event
@return This
@chainable
**/
	my.Entity.prototype.forceStamp = function(method, cellname, cell, mouse) {
		var visibility = this.visibility;
		this.visibility = true;
		this.stamp(method, cellname, cell, mouse);
		this.visibility = visibility;
		return this;
	};
	/**
Stamp function - instruct entity to draw itself on a Cell's &lt;canvas&gt; element, if its visibility attribute is true

Permitted methods include:

* 'draw' - stroke the entity's path with the entity's strokeStyle color, pattern or gradient
* 'fill' - fill the entity's path with the entity's fillStyle color, pattern or gradient
* 'drawFill' - stroke, and then fill, the entity's path; if a shadow offset is present, the shadow is added only to the stroke action
* 'fillDraw' - fill, and then stroke, the entity's path; if a shadow offset is present, the shadow is added only to the fill action
* 'floatOver' - stroke, and then fill, the entity's path; shadow offset is added to both actions
* 'sinkInto' - fill, and then stroke, the entity's path; shadow offset is added to both actions
* 'clear' - fill the entity's path with transparent color 'rgba(0, 0, 0, 0)'
* 'clearWithBackground' - fill the entity's path with the Cell's current backgroundColor
* 'clip' - clip the drawing zone to the entity's path (not tested)
* 'none' - perform all necessary updates, but do not draw the entity onto the canvas
@method stamp
@param {String} [method] Permitted method attribute String; by default, will use entity's own method setting
@param {String} [cellname] CELLNAME of cell on which entitys are to draw themselves
@param {Object} [cell] cell wrapper object
@param {Vector} [mouse] coordinates to be used for any entity currently pivoted to a mouse/touch event
@return This
@chainable
**/
	my.Entity.prototype.stamp = function(method, cellname, cell, mouse) {
		var engine,
			cellCtx,
			eCtx,
			here,
			sCanvas,
			sEngine,
			sFlag = !this.currentStart.flag,
			hFlag = !this.currentHandle.flag,
			data;
		if (this.visibility) {
			if (!cell) {
				cell = my.cell[cellname] || my.cell[my.group[this.group].cell];
				cellname = cell.name;
			}
			engine = my.context[cellname];
			method = method || this.method;
			if (sFlag || hFlag) {
				if (sFlag) {
					this.updateCurrentStart(cell);
				}
				if (hFlag) {
					this.updateCurrentHandle();
				}
				this.resetCollisionPoints();
			}
			if (this.pivot) {
				this.setStampUsingPivot(cellname, mouse);
				this.maxDimensions.flag = true;
			}
			else {
				this.pathStamp();
			}
			this[method](engine, cellname, cell);
			this.stampFilter(engine, cellname, cell);
		}
		return this;
	};
	/**
stamp helper function - amended by collisions extension
@method resetCollisionPoints
@return this
@chainable
**/
	my.Entity.prototype.resetCollisionPoints = function() {};
	/**
Entity.stamp hook function - modified by path extension
@method pathStamp
@private
**/
	my.Entity.prototype.pathStamp = function() {};
	/**
Entity.stamp hook function - modified by filters extension
@method stampFilter
@private
**/
	my.Entity.prototype.stampFilter = function() {};
	my.Entity.prototype.stampFilterDimensionsActions = {};
	/**
Stamp helper function - rotate and position canvas ready for drawing entity
@method rotateCell
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell Cell name
@return This
@chainable
@private
**/
	my.Entity.prototype.rotateCell = function(ctx, cell) {
		var reverse = (this.flipReverse) ? -1 : 1,
			upend = (this.flipUpend) ? -1 : 1,
			rotation = (this.addPathRoll) ? this.roll + this.pathRoll : this.roll,
			cos,
			sin,
			start = this.currentStart;
		if (rotation) {
			rotation *= 0.01745329251;
			cos = Math.cos(rotation);
			sin = Math.sin(rotation);
			ctx.setTransform((cos * reverse), (sin * reverse), (-sin * upend), (cos * upend), start.x, start.y);
			return this;
		}
		ctx.setTransform(reverse, 0, 0, upend, start.x, start.y);
		return this;
	};
	/**
Entity.getStartValues
@method getStartValues
@private
**/
	my.Entity.prototype.getStartValues = function() {
		var start = this.currentStart;
		return {
			x: start.x,
			y: start.y
		};
	};
	/**
Entity.getHandleValues
@method getHandleValues
@private
**/
	my.Entity.prototype.getHandleValues = function() {
		var handle = this.currentHandle;
		return {
			x: handle.x,
			y: handle.y
		};
	};
	/**
Entity.getStart
@method getStart
**/
	my.Entity.prototype.getStart = function() {
		var start = my.work.v.set(this.currentStart).vectorAdd(this.currentHandle);
		return {
			x: start.x,
			y: start.y
		};
	};
	/**
Stamp helper function - perform a 'clear' method draw

_Note: not supported by this entity_
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
	my.Entity.prototype.clear = function(ctx, cellname, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'clearWithBackground' method draw

_Note: not supported by this entity_
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
	my.Entity.prototype.clearWithBackground = function(ctx, cellname, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'draw' method draw

_Note: not supported by this entity_
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
	my.Entity.prototype.draw = function(ctx, cellname, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'fill' method draw

_Note: not supported by this entity_
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
	my.Entity.prototype.fill = function(ctx, cellname, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'drawFill' method draw

_Note: not supported by this entity_
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
	my.Entity.prototype.drawFill = function(ctx, cellname, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'fillDraw' method draw

_Note: not supported by this entity_
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
	my.Entity.prototype.fillDraw = function(ctx, cellname, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'sinkInto' method draw

_Note: not supported by this entity_
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
	my.Entity.prototype.sinkInto = function(ctx, cellname, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'floatOver' method draw

_Note: not supported by this entity_
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
	my.Entity.prototype.floatOver = function(ctx, cellname, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'clip' method draw

_Note: not supported by this entity_
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
	my.Entity.prototype.clip = function(ctx, cellname, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'none' method draw. This involves setting the &lt;canvas&gt; element's context engine's values with this entity's context values, but not defining or drawing the entity on the canvas.
@method none
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
	my.Entity.prototype.none = function(ctx, cellname, cell) {
		cell.setEngine(this);
		return this;
	};
	/**
Stamp helper function - clear shadow parameters during a multi draw operation (drawFill and fillDraw methods)
@method clearShadow
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.clearShadow = function(ctx, cell) {
		var context = my.ctx[this.context];
		if (context.shadowOffsetX || context.shadowOffsetY || context.shadowBlur) {
			cell.clearShadow(ctx);
		}
		return this;
	};
	/**
Stamp helper function - clear shadow parameters during a multi draw operation (Phrase text-along-path drawFill and fillDraw methods)
@method restoreShadow
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.restoreShadow = function(ctx, cell) {
		var context = my.ctx[this.context];
		if (context.shadowOffsetX || context.shadowOffsetY || context.shadowBlur) {
			cell.restoreShadow(ctx, this.context);
		}
		return this;
	};
	/**
Set entity's pivot to 'mouse'; set handles to supplied Vector value; set order to +9999
@method pickupEntity
@param {Vector} items Coordinate vector; alternatively an object with {x, y} attributes can be used
@return This
@chainable
**/
	my.Entity.prototype.pickupEntity = function(items) {
		var cell,
			coordinate;
		items = my.safeObject(items);
		coordinate = my.work.v.set(items);
		cell = my.cell[my.group[this.group].cell];
		coordinate = this.correctCoordinates(coordinate, cell);
		this.oldX = coordinate.x || 0;
		this.oldY = coordinate.y || 0;
		this.oldPivot = this.pivot;
		this.mouseIndex = my.xtGet(items.id || 'mouse');
		this.pivot = 'mouse';
		this.currentPivotIndex = false;
		this.order += 9999;
		my.group[this.group].resort = true;
		return this;
	};
	/**
Revert pickupEntity() actions, ensuring entity is left where the user drops it
@method dropEntity
@param {String} [items] Alternative pivot String
@return This
@chainable
**/
	my.Entity.prototype.dropEntity = function(item) {
		this.pivot = my.xtGet(item, this.oldPivot, null);
		this.currentPivotIndex = false;
		this.order = (this.order >= 9999) ? this.order - 9999 : 0;
		delete this.oldPivot;
		delete this.oldX;
		delete this.oldY;
		this.mouseIndex = 'mouse';
		my.group[this.group].resort = true;
		this.start.x = this.currentStart.x;
		this.start.y = this.currentStart.y;
		this.currentHandle.flag = false;
		if (this.setPaste) {
			this.setPaste();
		}
		return this;
	};
	/**
Check Cell coordinates to see if any of them fall within this entity's path - uses JavaScript's _isPointInPath_ function

Argument object contains the following attributes:

* __tests__ - an array of Vector coordinates to be checked; alternatively can be a single Vector
* __x__ - X coordinate
* __y__ - Y coordinate

Either the 'tests' attribute should contain a Vector, or an array of vectors, or the x and y attributes should be set to Number values
@method checkHit
@param {Object} items Argument object
@return The first coordinate to fall within the entity's path; false if none fall within the path
**/
	my.Entity.prototype.checkHit = function(items) {
		var tests = [],
			here,
			handle = this.currentHandle,
			result,
			i,
			iz,
			width,
			height,
			lw = this.localWidth,
			lh = this.localHeight,
			scale = this.scale,
			cvx = my.work.cvx;
		items = my.safeObject(items);
		if (my.xt(items.tests)) {
			tests = items.tests;
		}
		else {
			tests.length = 0;
			tests.push(items.x || 0);
			tests.push(items.y || 0);
		}
		this.rotateCell(cvx, this.getEntityCell().name);
		if (!handle.flag) {
			this.updateCurrentHandle();
		}
		here = handle;
		width = (lw) ? lw : this.width * scale;
		height = (lh) ? lh : this.height * scale;
		cvx.beginPath();
		cvx.rect(here.x, here.y, width, height);
		for (i = 0, iz = tests.length; i < iz; i += 2) {
			result = cvx.isPointInPath(tests[i], tests[i + 1]);
			if (result) {
				break;
			}
		}
		if (result) {
			items.x = tests[i];
			items.y = tests[i + 1];
			return items;
		}
		return false;
	};

	/**
# Design

## Instantiation

* This object should never be instantiated by users

## Purpose

* Defines gradients and radial gradients used with entity objects' strokeStyle and fillStyle attributes

@class Design
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Design = function(items) {
		my.Base.call(this, items);
		/**
Drawing flag - when set to 'entity' (or true), will use entity-based coordinates to calculate the start and end points of the gradient; when set to 'cell' (or false - default), will use Cell-based coordinates
@property lockTo
@type String - or alternatively Boolean
@default 'cell'
**/
		this.lockTo = my.xtGet(items.lockTo, my.work.d[this.type].lockTo);
		return this;
	};
	my.Design.prototype = Object.create(my.Base.prototype);
	/**
@property type
@type String
@default 'Design'
@final
**/
	my.Design.prototype.type = 'Design';
	my.Design.prototype.classname = 'designnames';
	my.work.d.Design = {
		/**
Array of JavaScript Objects representing color stop data

Objects take the form {color:String, stop:Number} where:

* __color__ attribute can be any legitimate CSS color string
* __stop can be any number between O and 0.999999 (not 1)
@property color
@type Array of JavaScript objects
@default [{color: 'black', stop: 0},{color: 'white', stop: 0.999999}]
**/
		color: [{
			color: 'black',
			stop: 0
        }, {
			color: 'white',
			stop: 0.999999
        }],
		lockTo: 'cell',
		/**
Drawing flag - when set to true, force the gradient to update each drawing cycle - only required in the simplest scenes where fillStyle and strokeStyle do not change between entities
@property autoUpdate
@type Boolean
@default false
**/
		autoUpdate: false,
		/**
CELLNAME String of &lt;canvas&gt; element context engine on which the gradient has been set
@property cell
@type String
@default ''
**/
		cell: '',
		/**
Horizontal start coordinate, in pixels, from the top-left corner of the gradient's &lt;canvas&gt; element
@property startX
@type Number
@default 0
**/
		startX: 0,
		/**
Vertical start coordinate, in pixels, from the top-left corner of the gradient's &lt;canvas&gt; element
@property startY
@type Number
@default 0
**/
		startY: 0,
		/**
Horizontal end coordinate, in pixels, from the top-left corner of the gradient's &lt;canvas&gt; element
@property endX
@type Number
@default 0
**/
		endX: 0,
		/**
Vertical end coordinate, in pixels, from the top-left corner of the gradient's &lt;canvas&gt; element
@property endY
@type Number
@default 0
**/
		endY: 0
	};
	my.mergeInto(my.work.d.Design, my.work.d.Base);
	/**
Update values to Number attributes

Will also accept an object containing start and end attributes, each of which can include x, y, startX, startY, r, startRadius and/or endRadius attributes

@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Design.prototype.set = function(items) {
		var temp, x, y,
			xt = my.xt,
			xto = my.xto,
			so = my.safeObject,
			get = my.xtGet;
		items = my.safeObject(items);
		if (xto(items.startX, items.startY, items.startRadius, items.start)) {
			temp = so(items.start);
			this.startX = get(temp.x, temp.startX, items.startX, this.startX);
			this.startY = get(temp.y, temp.startY, items.startY, this.startY);
			this.startRadius = get(temp.r, temp.startRadius, items.startRadius, this.startRadius);
		}
		if (xto(items.endX, items.endY, items.endRadius, items.end)) {
			temp = so(items.end);
			this.endX = get(temp.x, temp.endX, items.endX, this.endX);
			this.endY = get(temp.y, temp.endY, items.endY, this.endY);
			this.endRadius = get(temp.r, temp.endRadius, items.endRadius, this.endRadius);
		}
		if (items.shift && xt(my.work.d.Design.shift)) {
			this.shift = items.shift;
		}
		if (xt(items.autoUpdate)) {
			this.autoUpdate = items.autoUpdate;
		}
		if (xt(items.color)) {
			this.color = [].concat(items.color);
		}
		return this;
	};
	/**
Add values to Number attributes
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Design.prototype.setDelta = function(items) {
		var temp,
			perc = my.addPercentages;
		items = my.safeObject(items);
		if (items.startX) {
			temp = this.get('startX');
			this.startX = (items.startX.substring) ? perc(temp, items.startX) : temp + items.startX;
		}
		if (items.startY) {
			temp = this.get('startY');
			this.startY = (items.startY.substring) ? perc(temp, items.startY) : temp + items.startY;
		}
		if (items.startRadius) {
			temp = this.get('startRadius');
			this.startRadius = temp + items.startRadius;
		}
		if (items.endX) {
			temp = this.get('endX');
			this.endX = (items.endX.substring) ? perc(temp, items.endX) : temp + items.endX;
		}
		if (items.endY) {
			temp = this.get('endY');
			this.endY = (items.endY.substring) ? perc(temp, items.endY) : temp + items.endY;
		}
		if (items.endRadius) {
			temp = this.get('endRadius');
			this.endRadius = temp + items.endRadius;
		}
		if (items.shift && my.xt(my.work.d.Design.shift)) {
			temp = this.get('shift');
			this.shift = temp + items.shift;
		}
		return this;
	};
	/**
Creates the gradient

_This function is replaced by the animation extension_
@method update
@param {String} [entity] SPRITENAME String
@param {String} [cell] CELLNAME String
@return This
@chainable
**/
	my.Design.prototype.update = function(entity, cell) {
		this.makeGradient(entity, cell);
		this.applyStops();
		return this;
	};
	/**
Returns &lt;canvas&gt; element's contenxt engine's gradient object, or 'rgba(0,0,0,0)' on failure
@method getData
@return JavaScript Gradient object, or String
@private
**/
	my.Design.prototype.getData = function() {
		return (my.xt(my.dsn[this.name])) ? my.dsn[this.name] : 'rgba(0,0,0,0)';
	};
	/**
Design.update() helper function - builds &lt;canvas&gt; element's contenxt engine's gradient object
@method makeGradient
@param {String} [entity] SPRITENAME String
@param {String} [cell] CELLNAME String
@return This
@chainable
@private
**/
	my.Design.prototype.makeGradient = function(entity, cell) {
		var ctx,
			c = my.cell,
			conv,
			cw,
			ch,
			xt = my.xt,
			g,
			x,
			y,
			sx,
			sy,
			sr,
			ex,
			ey,
			er,
			fsx,
			fsy,
			fex,
			fey,
			temp,
			w,
			h,
			r,
			v = my.work.v;
		entity = my.entity[entity] || false;
		if (xt(cell)) {
			cell = (c[cell]) ? c[cell] : c[this.get('cell')];
		}
		else if (entity) {
			cell = c[entity.group];
		}
		else {
			cell = c[this.get('cell')];
		}
		ctx = my.context[cell.name];
		//in all cases, the canvas origin will have been translated to the current entity's start
		if (this.lockTo && this.lockTo !== 'cell') {
			temp = entity.currentHandle;
			switch (entity.type) {
				case 'Wheel':
					x = -temp.x + (entity.radius * entity.scale);
					y = -temp.y + (entity.radius * entity.scale);
					break;
				case 'Shape':
				case 'Path':
					if (entity.isLine) {
						x = -temp.x;
						y = -temp.y;
					}
					else {
						x = -temp.x + ((entity.width / 2) * entity.scale);
						y = -temp.y + ((entity.height / 2) * entity.scale);
					}
					break;
				default:
					x = -temp.x;
					y = -temp.y;
			}
			w = (xt(entity.localWidth)) ? entity.localWidth : entity.width * entity.scale;
			h = (xt(entity.localHeight)) ? entity.localHeight : entity.height * entity.scale;
			sx = (xt(this.startX)) ? this.startX : 0;
			if (sx.substring) {
				sx = (parseFloat(sx) / 100) * w;
			}
			sy = (xt(this.startY)) ? this.startY : 0;
			if (sy.substring) {
				sy = (parseFloat(sy) / 100) * h;
			}
			ex = (xt(this.endX)) ? this.endX : w;
			if (ex.substring) {
				ex = (parseFloat(ex) / 100) * w;
			}
			ey = (xt(this.endY)) ? this.endY : h;
			if (ey.substring) {
				ey = (parseFloat(ey) / 100) * h;
			}
			if (this.type === 'Gradient') {
				g = ctx.createLinearGradient(sx - x, sy - y, ex - x, ey - y);
			}
			else {
				sr = (xt(this.startRadius)) ? this.startRadius : 0;
				if (sr.substring) {
					sr = (parseFloat(sr) / 100) * w;
				}
				er = (xt(this.endRadius)) ? this.endRadius : w;
				if (er.substring) {
					er = (parseFloat(er) / 100) * w;
				}
				g = ctx.createRadialGradient(sx - x, sy - y, sr, ex - x, ey - y, er);
			}
		}
		else {
			conv = entity.numberConvert;
			cw = cell.actualWidth;
			ch = cell.actualHeight;
			x = entity.start.x;
			if (x.substring) {
				x = conv(x, cw);
			}
			y = entity.start.y;
			if (y.substring) {
				y = conv(y, ch);
			}
			sx = (xt(this.startX)) ? this.startX : 0;
			if (sx.substring) {
				sx = conv(sx, cw);
			}
			sy = (xt(this.startY)) ? this.startY : 0;
			if (sy.substring) {
				sy = conv(sy, ch);
			}
			ex = (xt(this.endX)) ? this.endX : cw;
			if (ex.substring) {
				ex = conv(ex, cw);
			}
			ey = (xt(this.endY)) ? this.endY : ch;
			if (ey.substring) {
				ey = conv(ey, ch);
			}
			x = (entity.flipReverse) ? cw - x : x;
			y = (entity.flipUpend) ? ch - y : y;
			sx = (entity.flipReverse) ? cw - sx : sx;
			sy = (entity.flipUpend) ? ch - sy : sy;
			ex = (entity.flipReverse) ? cw - ex : ex;
			ey = (entity.flipUpend) ? ch - ey : ey;
			fsx = sx - x;
			fsy = sy - y;
			fex = ex - x;
			fey = ey - y;
			r = entity.roll;
			if ((entity.flipReverse && entity.flipUpend) || (!entity.flipReverse && !entity.flipUpend)) {
				r = -entity.roll;
			}
			if (entity.roll) {
				v.set({
					x: fsx,
					y: fsy,
					z: 0
				}).rotate(r);
				fsx = v.x;
				fsy = v.y;
				v.set({
					x: fex,
					y: fey,
					z: 0
				}).rotate(r);
				fex = v.x;
				fey = v.y;
			}
			if (this.type === 'Gradient') {
				g = ctx.createLinearGradient(fsx, fsy, fex, fey);
			}
			else {
				sr = (xt(this.startRadius)) ? this.startRadius : 0;
				if (sr.substring) {
					sr = (parseFloat(sr) / 100) * cell.actualWidth;
				}
				er = (xt(this.endRadius)) ? this.endRadius : cell.actualWidth;
				if (er.substring) {
					er = (parseFloat(er) / 100) * cell.actualWidth;
				}
				g = ctx.createRadialGradient(fsx, fsy, sr, fex, fey, er);
			}
		}
		my.dsn[this.name] = g;
		return this;
	};
	/**
Design.update() helper function - applies color attribute objects to the gradient
@method applyStops
@return This
@private
@chainable
**/
	my.Design.prototype.applyStops = function() {
		var color = this.get('color'),
			i,
			iz,
			dsn = my.dsn[this.name];
		if (dsn) {
			for (i = 0, iz = color.length; i < iz; i++) {
				dsn.addColorStop(color[i].stop, color[i].color);
			}
		}
		return this;
	};
	/**
Remove this gradient from the scrawl library
@method remove
@return Always true
**/
	my.Design.prototype.remove = function() {
		delete my.dsn[this.name];
		delete my.design[this.name];
		my.removeItem(my.designnames, this.name);
		return true;
	};

	/**
# Gradient

## Instantiation

* scrawl.makeGradient()

## Purpose

* Defines a linear gradient
* Used with entity.strokeStyle and entity.fillStyle attributes

## Access

* scrawl.design.GRADIENTNAME - for the Gradient object

@class Gradient
@constructor
@extends Design
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Gradient = function(items) {
		items = my.safeObject(items);
		my.Design.call(this, items);
		my.Base.prototype.set.call(this, items);
		my.design[this.name] = this;
		my.pushUnique(my.designnames, this.name);
		return this;
	};
	my.Gradient.prototype = Object.create(my.Design.prototype);
	/**
@property type
@type String
@default 'Gradient'
@final
**/
	my.Gradient.prototype.type = 'Gradient';
	my.Gradient.prototype.classname = 'designnames';
	my.work.d.Gradient = {};
	my.mergeInto(my.work.d.Gradient, my.work.d.Design);

	/**
# RadialGradient

## Instantiation

* scrawl.makeRadialGradient()

## Purpose

* Defines a radial gradient
* Used with entity.strokeStyle and entity.fillStyle attributes

## Access

* scrawl.design.RADIALGRADIENTNAME - for the RadialGradient object

@class RadialGradient
@constructor
@extends Design
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.RadialGradient = function(items) {
		items = my.safeObject(items);
		my.Design.call(this, items);
		my.Base.prototype.set.call(this, items);
		my.design[this.name] = this;
		my.pushUnique(my.designnames, this.name);
		return this;
	};
	my.RadialGradient.prototype = Object.create(my.Design.prototype);
	/**
@property type
@type String
@default 'RadialGradient'
@final
**/
	my.RadialGradient.prototype.type = 'RadialGradient';
	my.RadialGradient.prototype.classname = 'designnames';
	my.work.d.RadialGradient = {
		/**
Start circle radius, in pixels or percentage of entity/cell width
@property startRadius
@type Number (by default), or String percentage value
@default 0
**/
		startRadius: 0,
		/**
End circle radius, in pixels or percentage of entity/cell width
@property endRadius
@type Number (by default), or String percentage value
@default 0 (though in practice, an undefined end radius will default to the entity's width, or the cell's width)
**/
		endRadius: 0
	};
	my.mergeInto(my.work.d.RadialGradient, my.work.d.Design);

	my.work.v = my.makeVector({
		name: 'scrawl.v'
	});
	my.work.colv1 = my.makeVector({
		name: 'scrawl.colv1'
	});
	my.work.colv2 = my.makeVector({
		name: 'scrawl.colv2'
	});

	/**
A __factory__ function to generate new Animation objects
@method makeAnimation
@param {Object} items Key:value Object argument for setting attributes
@return Animation object
**/
	my.makeAnimation = function(items) {
		return new my.Animation(items);
	};
	/**
Alias for makeAnimation()
@method newAnimation
@deprecated
**/
	my.newAnimation = function(items) {
		return my.makeAnimation(items);
	};
	my.work.animate = [];
	/**
Animation flag: set to false to stop animation loop
@property doAnimation
@type {Boolean}
**/
	my.work.doAnimation = false;
	/**
Animation ordering flag - when set to false, the ordering of animations is skipped; default: true
@property orderAnimations
@type {Boolean}
@default true
**/
	my.work.orderAnimations = true;
	my.work.resortAnimations = true;
	/**
The Scrawl animation loop

Animation loop is invoked automatically as part of the initialization process

Scrawl will run all Animation objects whose ANIMATIONNAME Strings are included in the __scrawl.animate__ Array

All animation can be halted by setting the __scrawl.doAnimation__ flag to false

To restart animation, either call __scrawl.initialize()__, or set _scrawl.doAnimation_ to true and call __scrawl.animationLoop()

@method animationLoop
@return Recursively calls itself - never returns
**/
	my.animationLoop = function() {
		var i,
			iz,
			animate = my.work.animate,
			animation = my.animation;
		if (my.work.orderAnimations) {
			my.sortAnimations();
		}
		for (i = 0, iz = animate.length; i < iz; i++) {
			if (animate[i]) {
				animation[animate[i]].fn();
			}
		}
		if (my.work.doAnimation) {
			window.requestAnimFrame(function() {
				my.animationLoop();
			});
		}
	};
	/**
Animation sorting routine - animation objects are sorted according to their animation.order attribute value, in ascending order
@method sortAnimations
@return Nothing
@private
**/
	my.sortAnimations = function() {
		if (my.work.resortAnimations) {
			my.work.resortAnimations = false;
			my.work.animate = my.bucketSort('animation', 'order', my.work.animate);
		}
	};
	/**
Starts the animation loop
@method animationInit
@private
**/
	my.animationInit = function() {
		my.makeAnimation({
			name: 'viewportMasterAnimation',
			fn: function() {
				var dev = my.device,
					testDims, testPos;
				testDims = dev.getViewportDimensions();
				testPos = dev.getViewportPosition();
				if (testDims) {
					my.setPerspectives();
				}
				if (testDims || testPos) {
					my.setDisplayOffsets('all');
				}
			}
		});
		my.work.doAnimation = true;
		my.animationLoop();
	};

	/**
# Animation

## Instantiation

* scrawl.makeAnimation()

## Purpose

* Defines an animation function to be run by the scrawl.animationLoop() function

## Access

* scrawl.animation.ANIMATIONNAME - for the Animation object

@class Animation
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Animation = function(items) {
		var delay;
		my.Base.call(this, items);
		items = my.safeObject(items);
		delay = (my.isa_bool(items.delay)) ? items.delay : false;
		this.fn = items.fn || function() {};
		this.order = items.order || 0;
		my.animation[this.name] = this;
		my.pushUnique(my.animationnames, this.name);
		my.work.resortAnimations = true;
		/**
Pseudo-attribute used to prevent immediate running of animation when first created

_This attribute is not retained by the Animation object_
@property delay
@type Boolean
@default false
**/
		if (!delay) {
			this.run();
		}
		return this;
	};
	my.Animation.prototype = Object.create(my.Base.prototype);
	/**
@property type
@type String
@default 'Animation'
@final
**/
	my.Animation.prototype.type = 'Animation';
	my.Animation.prototype.classname = 'animationnames';
	my.work.d.Animation = {
		/**
Anonymous function for an animation routine
@property fn
@type Function
@default function(){}
**/
		fn: function() {},
		/**
Lower order animations are run during each frame before higher order ones
@property order
@type Number
@default 0
**/
		order: 0,
	};
	my.mergeInto(my.work.d.Animation, my.work.d.Base);
	/**
Run an animation
@method run
@return Always true
**/
	my.Animation.prototype.run = function() {
		my.pushUnique(my.work.animate, this.name);
		return true;
	};
	/**
Check to see if animation is running
@method isRunning
@return true if active; false otherwise
**/
	my.Animation.prototype.isRunning = function() {
		return my.contains(my.work.animate, this.name);
	};
	/**
Stop an animation
@method halt
@return Always true
**/
	my.Animation.prototype.halt = function() {
		my.removeItem(my.work.animate, this.name);
		return true;
	};
	/**
Remove this Animation from the scrawl library
@method kill
@return Always true
**/
	my.Animation.prototype.kill = function() {
		delete my.animation[this.name];
		my.removeItem(my.animationnames, this.name);
		my.removeItem(my.work.animate, this.name);
		my.work.resortAnimations = true;
		return true;
	};

	var exports = my;

	return my;
}());
