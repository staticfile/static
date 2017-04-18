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
# scrawlFrame

## Purpose and features

The Frame module adds 'Frame' entitys to the core module:

* Replicates functionality of Picture entity
* Can use &lt;img&gt;, &lt;canvas&gt; or &lt;video&gt; for source image
* Simulates 3d perspective in a 2d canvas element
* Corners can be moved independently of each other
* Alternatively, frame can be locked to a stack element which can then be manipulated in 3d space 

Note that Frame entity code, being a combination of classic entity and stack element functionalities, bypasses the existing Core code. Thus much of the frame code replicates Position, Cell, Context and Entity code. Changes to the code for these core Objects MUST be ported over to the frame code, where applicable. Changes are made to the frame code will also need to be checked against core code to see if that, too, needs to be updated.

@module scrawlFrame
**/

if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'frame')) {
	var scrawl = (function(my) {
		'use strict';
		/**
# window.scrawl

scrawlFrame module adaptions to the Scrawl library object

@class window.scrawl_Frame
**/

		/**
Alias for makeFramePoint()
@method newFramePoint
@deprecated
**/
		my.newFramePoint = function(items) {
			return new my.FramePoint(items);
		};
		/**
A __factory__ function to generate new FramePoint entitys
@method makeFramePoint
@param {Object} items Key:value Object argument for setting attributes
@return FramePoint object
**/
		my.makeFramePoint = function(items) {
			return new my.FramePoint(items);
		};
		/**
Alias for makeFrame()
@method newFrame
@deprecated
**/
		my.newFrame = function(items) {
			return new my.Frame(items);
		};
		/**
A __factory__ function to generate new Frame entitys
@method makeFrame
@param {Object} items Key:value Object argument for setting attributes
@return Frame object
**/
		my.makeFrame = function(items) {
			return new my.Frame(items);
		};
		my.pushUnique(my.work.nameslist, 'framepointnames');

		/**
# FramePoint

## Instantiation

* scrawl.makeFramePoint()

## Purpose

* Defines the corner points for a Frame entity

## Access

* none - like Vectors, only stored locally

@class FramePoint
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.FramePoint = function FramePoint(items) {
			var get = my.xtGet,
			vec = my.makeVector;
			my.Base.call(this, items);
			items = my.safeObject(items);
			this.host = get(items.host, false);
			this.data = get(items.data, false);
			this.reference = get(items.reference, false);
			this.lock = get(items.lock, false);
			this.lockCorner = get(items.lockCorner, false);
			this.pivot = get(items.pivot, false);
			this.path = get(items.path, false);
			this.pathPlace = get(items.pathPlace, false);
			this.deltaPathPlace = get(items.deltaPathPlace, false);
			this.pathSpeedConstant = get(items.pathSpeedConstant, false);
			this.lockX = get(items.lockX, false);
			this.lockY = get(items.lockY, false);
			this.local = vec({
				name: this.name + '_local'
			});
			this.setReference();
			this.setLocal();
		};
		my.FramePoint.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'FramePoint'
@final
**/
		my.FramePoint.prototype.type = 'FramePoint';
		my.work.d.FramePoint = {
			/**
Frame emtity to which this frame corner belongs
@property host
@type String - FRAMENAME String of the host frame
@default false
@private
**/
			host: false,
			/**
Data should always be an array in the form [x, y, z]
@property data
@type Array - consisting of [x, y, z] coordinates
@default false
@private
**/
			data: false,
			/**
reference - defines how, and from where, the local coordinates for this FramePoint will be calculated

Permitted values include: 'data', 'lock', 'entity', 'cell', 'point', 'stack', 'pad', 'element', 'particle'
@property data
@type String
@default false
@private
**/
			reference: false,
			/**
@property pivot
@type String - ENTITYNAME, CELLNAME etc of object FramePoint will use as its pivot
@default false
@private
**/
			pivot: false,
			/**
@property lock
@type Boolean - true if host Frame is using a Stack Element for positioning; false otherwise
@default false
@private
**/
			lock: false,
			/**
@property lockCorner
@type String - if lock == true, will be set to one of four values: 'topLeft', 'topRight', 'bottomRight', 'bottomLeft'
@default false
@private
**/
			lockCorner: false,
			/**
@property local
@type Vector - current coordinates for this FramePoint's position
@default Object - {x:0, y:0, z:0}
@private
**/
			local: {
				x: 0,
				y: 0,
				z: 0
			},
			/**
The ENTITYNAME of a Path entity whose path is used to calculate this object's start point
@property path
@type String
@default false
**/
			path: false,
			/**
A value between 0 and 1 to represent the distance along a Path object's path, where 0 is the path start and 1 is the path end
@property pathPlace
@type Number
@default false
**/
			pathPlace: false,
			/**
A change value which can be applied to the object's pathPlace attribute
@property deltaPathPlace
@type Number
@default false
**/
			deltaPathPlace: false,
			/**
A flag to determine whether the object will calculate its position along a Shape path in a regular (true), or simple (false), manner
@property pathSpeedConstant
@type Boolean
@default false
**/
			pathSpeedConstant: false,
			/**
Positioning flag; set to true to ignore path/pivot/mouse changes along the X axis
@property lockX
@type Boolean
@default false
**/
			lockX: false,
			/**
Positioning flag; set to true to ignore path/pivot/mouse changes along the Y axis
@property lockY
@type Boolean
@default false
**/
			lockY: false
		};
		my.mergeInto(my.work.d.FramePoint, my.work.d.Base);
		my.FramePoint.prototype.classname = 'framepointnames';
		/**
@method get
@param {String} item Name of attribute to return
@return attribute
**/
		my.FramePoint.prototype.get = function(item) {
			return my.Base.get.call(this, items);
		};
		/**
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.FramePoint.prototype.set = function(items) {
			var get = my.xtGet;
			this.host = get(items.host, this.host);
			this.data = get(items.data, this.data);
			this.pivot = get(items.pivot, this.pivot);
			this.path = get(items.path, this.path);
			this.lock = get(items.lock, this.lock);
			this.lockCorner = get(items.lockCorner, this.lockCorner);
			this.pathPlace = get(items.pathPlace, this.pathPlace);
			this.deltaPathPlace = get(items.deltaPathPlace, this.deltaPathPlace);
			this.pathSpeedConstant = get(items.pathSpeedConstant, this.pathSpeedConstant);
			this.lockX = get(items.lockX, this.lockX);
			this.lockY = get(items.lockY, this.lockY);
			this.setReference();
			this.setLocal();
			return this;
		};
		/**
Funtion to set the reference attribute - a string flag to inform the code where the positioning data will originate:

* _data_ - user/code will supply position through a position array
* _lock_ - position determined by a corner div within a positioning element in a stack
* _entity_, _cell_, _point_, _stack_, _pad_, _element_, _particle_ - positioned using a pivot or path; string value defines which part of the Scrawl library the pivot or path will be found

@method setReference
@return This
@chainable
@private
**/
		my.FramePoint.prototype.setReference = function() {
			if (this.data) {
				this.reference = 'data';
			}
			else if (this.lock) {
				this.reference = 'lock';
			}
			else if (this.path && my.contains(my.entitynames, this.path)) {
				this.reference = 'entity';
			}
			else if (this.pivot) {
				if (my.contains(my.entitynames, this.pivot)) {
					this.reference = 'entity';
				}
				else if (my.contains(my.cellnames, this.pivot)) {
					this.reference = 'cell';
				}
				else if (my.contains(my.pointnames, this.pivot)) {
					this.reference = 'point';
				}
				else if (my.stack && my.contains(my.stacknames, this.pivot)) {
					this.reference = 'stack';
				}
				else if (my.pad && my.contains(my.padnames, this.pivot)) {
					this.reference = 'pad';
				}
				else if (my.element && my.contains(my.elementnames, this.pivot)) {
					this.reference = 'element';
				}
				else if (my.particle && my.contains(my.particlenames, this.pivot)) {
					this.reference = 'particle';
				}
				else {
					this.reference = false;
				}
			}
			else {
				this.reference = false;
			}
			return this;
		};
		/**
Update the local positioning vector

@method setLocal
@return This
@chainable
@private
**/
		my.FramePoint.prototype.setLocal = function() {
			var x, y, e, ref, host, stack,
				ratioX = 1,
				ratioY = 1,
				loc = this.local;
			this.changed = false;
			x = loc.x;
			y = loc.y;
			if (this.reference === 'data') {
				this.setLocalFromData();
			}
			else if (this.lock) {
				e = my.element[this.lock][this.lockCorner];
				host = my.cell[my.group[my.entity[this.host].group].cell];
				stack = my.stack[my.pad[host.pad].group];
				if (my.xt(stack, host)) {
					ratioX = host.actualWidth / (stack.localWidth || host.actualWidth);
					ratioY = host.actualHeight / (stack.localHeight || host.actualHeight);
				}
				loc.x = e.x * ratioX;
				loc.y = e.y * ratioY;
			}
			else if (this.path) {
				this.setLocalFromPath();
			}
			else if (this.pivot) {
				switch (this.reference) {
					case 'point':
						e = my.point[this.pivot].local;
						break;
					case 'particle':
						e = my.particle[this.pivot].place;
						break;
					default:
						e = my[this.reference][this.pivot].currentStart;
				}
				loc.x = e.x;
				loc.y = e.y;
			}
			if (x != this.local.x || y != this.local.y) {
				this.changed = true;
			}
			return this;
		};
		/**
setLocal() helper function - position supplied in data array

Data should always be an array in the form [x, y, z]
@method setLocalFromData
@return This
@chainable
@private
**/
		my.FramePoint.prototype.setLocalFromData = function() {
			var cell = my.cell[my.group[my.entity[this.host].group].cell],
				local = this.local,
				data = this.data,
				setlocal = this.setLocalFromDataString;
			if (Array.isArray(this.data)) {
				local.x = (data[0].toFixed) ? data[0] : setlocal(data[0], cell.actualWidth);
				local.y = (data[1].toFixed) ? data[1] : setlocal(data[1], cell.actualHeight);
			}
			return this;
		};
		/**
setLocalFromData() helper function - convert percentage/literal strings to numeric values

@method setLocalFromDataString
@param {String} item percentage string or string position value
@param {Number} dimension Host's cell's actualWidth or actualHeight
@return Number calculated position value
@chainable
@private
**/
		my.FramePoint.prototype.setLocalFromDataString = function(item, dimension) {
			switch (item) {
				case 'top':
				case 'left':
					return 0;
				case 'right':
				case 'bottom':
					return dimension;
				case 'center':
					return dimension / 2;
				default:
					return (parseFloat(item) / 100) * dimension;
			}
		};
		/**
setLocal() helper function - position supplied by Path entity

@method setLocalFromPath
@return This
@chainable
@private
**/
		my.FramePoint.prototype.setLocalFromPath = function() {
			var here,
				e = my.entity[this.path],
				local = this.local;
			if (e && e.type === 'Path') {
				if (this.deltaPathPlace) {
					this.pathPlace += this.deltaPathPlace;
					if (this.pathPlace > 1) {
						this.pathPlace -= 1;
					}
					else if (this.pathPlace < 0) {
						this.pathPlace += 1;
					}
				}
				here = e.getPerimeterPosition(this.pathPlace, this.pathSpeedConstant, false);
				local.x = (!this.lockX) ? here.x : local.x;
				local.y = (!this.lockY) ? here.y : local.y;
			}
			return this;
		};

		/**
# Frame

## Instantiation

* scrawl.makeFrame()

## Purpose

* Defines a Frame entity

## Access

* scrawl.entity.FRAMENAME - for the Frame entity object

@class Frame
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Frame = function Frame(items) {
			var vec = my.makeVector,
				get = my.xtGet;
			my.Base.call(this, items);
			items = my.safeObject(items);

			this.cornersDataArrayOrder = my.xtGet(items.cornersDataArrayOrder, ['tlx', 'tly', 'trx', 'try', 'brx', 'bry', 'blx', 'bly']);

			this.topLeft = false;
			this.topRight = false;
			this.bottomRight = false;
			this.bottomLeft = false;

			this.width = 1;
			this.height = 1;
			this.localWidth = 1;
			this.localHeight = 1;
			this.referencePoint = vec();

			this.source = get(items.source, false);
			// this.sourceType = false;
			this.copy = {
				x: get(items.copyX, 0),
				y: get(items.copyY, 0),
				w: get(items.copyWidth, '100%'),
				h: get(items.copyHeight, '100%')
			};
			this.currentCopy = {
				flag: false
			};

			this.cell = document.createElement('canvas');
			this.engine = this.cell.getContext('2d');

			this.interferenceLoops = get(items.interferenceLoops, 2);
			this.interferenceFactor = get(items.interferenceFactor, 1.03);

			this.method = get(items.method, 'fill');
			this.visibility = get(items.visibility, true);
			this.order = get(items.order, 0);

			this.globalAlpha = get(items.globalAlpha, 1);
			this.globalCompositeOperation = get(items.globalCompositeOperation, 'source-over');

			this.lineWidth = get(items.lineWidth, 0);
			this.lineCap = get(items.lineCap, 'butt');
			this.lineJoin = get(items.lineJoin, 'miter');
			this.lineDash = get(items.lineDash, []);
			this.lineDashOffset = get(items.lineDashOffset, 0);
			this.miterLimit = get(items.miterLimit, 10);
			this.strokeStyle = get(items.strokeStyle, '#000000');
			this.shadowOffsetX = get(items.shadowOffsetX, 0);
			this.shadowOffsetY = get(items.shadowOffsetY, 0);
			this.shadowBlur = get(items.shadowBlur, 0);
			this.shadowColor = get(items.shadowColor, '#000000');

			this.group = my.Entity.prototype.getGroup.call(this, items);

			my.Entity.prototype.registerInLibrary.call(this, items);
			my.pushUnique(my.group[this.group].entitys, this.name);

			this.lockElementAttributes = {};
			this.setLockElementAttributes(items);
			this.lockFrameTo = false;
			if (items.lockFrameTo) {
				this.lockFrameTo = items.lockFrameTo;
				this.lockOn(items);
			}
			this.setCorners(items);
			this.setEngine(this);
			this.filtersEntityInit(items);
			this.maxDimensions = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				flag: true
			};

			this.redraw = true;

			return this;
		};
		my.Frame.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Frame'
@final
**/
		my.Frame.prototype.type = 'Frame';
		my.Frame.prototype.classname = 'entitynames';
		my.work.d.Frame = {
			/**
Current coordinate for top left corner
@property topLeft
@type Object - {x:Number, y:Number}
@default false
@private
**/
			topLeft: false,
			/**
Current coordinate for top right corner
@property topRight
@type Object - {x:Number, y:Number}
@default false
@private
**/
			topRight: false,
			/**
Current coordinate for bottom right corner
@property bottomRight
@type Object - {x:Number, y:Number}
@default false
@private
**/
			bottomRight: false,
			/**
Current coordinate for bottom left corner
@property bottomLeft
@type Object - {x:Number, y:Number}
@default false
@private
**/
			bottomLeft: false,
			/**
Enclosing width of entity
@property width
@type Number
@default 1
@private
**/
			width: 1,
			/**
Enclosing height of entity
@property height
@type Number
@default 1
@private
**/
			height: 1,
			/**
Used as part of core entity collision detection functionality - must always be the same as width attribute
@property localWidth
@type Number
@default 1
@private
**/
			localWidth: 1,
			/**
Used as part of core entity collision detection functionality - must always be the same as height attribute
@property localHeight
@type Number
@default 1
@private
**/
			localHeight: 1,
			/**
Top left corner reference point for enclosing dimension box of entity
@property height
@type Number
@default 1
**/
			referencePoint: false,
			/**
If present, the DOM &lt;div&gt; element being used to position entity within the stack
@property currentFrame
@type DOM element object
@default false
@private
**/
			currentFrame: false,
			/**
Entity drawing method. A entity can be drawn onto a &lt;canvas&gt; element in a variety of ways; these methods include:

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
			method: 'fill',
			/**
Visibility flag - entitys will (in general) not be drawn on a &lt;canvas&gt; element when this flag is set to false
@property visibility
@type Boolean
@default true
**/
			visibility: true,
			/**
Entity order value - lower order entitys are drawn on &lt;canvas&gt; elements before higher order entitys
@property order
@type Number
@default 0
**/
			order: 0,
			/**
ELEMENTNAME of stack element which frame entity will use for positioning data
@property lockFrameTo
@type String
@default false
**/
			lockFrameTo: false,
			/**
JavaScript Object containing key:value pairs - used to cascade data to underlying stack element (if present)
@property lockElementAttributes
@type Object
@default false
@private
**/
			lockElementAttributes: false,
			/**
Entity transparency - a value between 0 and 1, where 0 is completely transparent and 1 is completely opaque
@property globalAlpha
@type Number
@default 1
@private
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
Outline width, in pixels
@property lineWidth
@type Number
@default 0
**/
			lineWidth: 0,
			/**
Outline cap styling. Permitted values include:

* 'butt'
* 'round'
* 'square'

@property lineCap
@type String
@default 'butt'
**/
			lineCap: 'butt',
			/**
Outline join styling. Permitted values include:

* 'miter'
* 'round'
* 'bevel'

@property lineJoin
@type String
@default 'miter'
**/
			lineJoin: 'miter',
			/**
Outline dash format - an array of Numbers representing line and gap values (in pixels), for example [5,2,2,2] for a long-short dash pattern
@property lineDash
@type Array
@default []
**/
			lineDash: [],
			/**
Outline dash offset - distance along the entity's outline at which to start the line dash. Changing this value can be used to create a 'marching ants effect
@property lineDashOffset
@type Number
@default 0
**/
			lineDashOffset: 0,
			/**
miterLimit - affecting the 'pointiness' of the outline join where two lines join at an acute angle
@property miterLimit
@type Number
@default 10
**/
			miterLimit: 10,
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
@default '#000000'
**/
			shadowColor: '#000000',
			/**
ASSETNAME or CANVASNAME of source asset used to fill frame
@property source
@type String
@default false
**/
			source: false,
			// sourceType: false,
			/**
Every Frame entity includes its own personal &lt;canvas&gt; element, which is not part of the DOM and which can only be accessed through this attribute
@property cell
@type DOM canvas element
@default false
@private
**/
			cell: false,
			/**
The Frame entity's &lt;canvas&gt; element's 2d context engine - not stored in the scrawl library and can only be accessed through this attribute
@property engine
@type CanvasRenderingContext2D interface
@default false
@private
**/
			engine: false,
			/**
Array of FILTERNAME strings, for filters to be applied to this entity
@property filters
@type Array
@default []
**/
			filters: [],
			/**
Filter flag - when true, will draw the entity; on false (default), the clip method is used instead
@property filterOnStroke
@type Boolean
@default false
**/
			filterOnStroke: false,
			/**
The filterLevel attribute determines at which point in the display cycle the filter will be applied. Permitted values are:

* '__entity__' - filter is applied immediately after the Entity has stamped itself onto a cell
* '__cell__' - filter is applied after all Entites have completed stamping themselves onto the cell
* '__pad__' - filter is applied to the base canvas after all cells have completed copying themselves onto it, and before the base cell copies itself onto the display cell

@property filterLevel
@type String
@default 'entity'
**/
			filterLevel: 'entity',
			/**
The ENTITYNAME or POINTNAME of a entity or Point object to be used for setting this object's start point - will only affect any underlying stack div element used for positioning the frame entity. 

Note that each corner can also have its own pivot reference
@property pivot
@type String
@default null
**/
			pivot: null,
			/**
The ENTITYNAME of a Path entity to be used for setting this entity's start point - will only affect any underlying stack div element used for positioning the frame entity. 

Note that each corner can also have its own path reference
@property path
@type String
@default null
**/
			path: false,
			/**
Index of mouse vector to use when pivot === 'mouse'

The Pad.mice object can hold details of multiple touch events - when an entity is assigned to a 'mouse', it needs to know which of those mouse trackers to use. Default: mouse (for the mouse cursor vector)
@property mouseIndex
@type String
@default 'mouse'
**/
			mouseIndex: 'mouse',
			/**
Reflection flag; set to true to flip entity, cell or element along the Y axis - this has no meaning to Frame entitys (which can be repositioned either by directly repositioning corners, or by rotating any associated stack element), but has to be included for compatibility with core entity functionality
@property flipReverse
@type Boolean
@default false
**/
			flipReverse: false,
			/**
Reflection flag; set to true to flip entity, cell or element along the X axis - this has no meaning to Frame entitys (which can be repositioned either by directly repositioning corners, or by rotating any associated stack element), but has to be included for compatibility with core entity functionality
@property flipUpend
@type Boolean
@default false
**/
			flipUpend: false,
			/**
Positioning flag; set to true to ignore path/pivot/mouse changes along the X axis - will only affect any underlying stack div element used for positioning the frame entity. Note that each corner can also be individually restricted
@property lockX
@type Boolean
@default false
**/
			lockX: false,
			/**
Positioning flag; set to true to ignore path/pivot/mouse changes along the Y axis - will only affect any underlying stack div element used for positioning the frame entity. Note that each corner can also be individually restricted
@property lockY
@type Boolean
@default false
**/
			lockY: false,
			/**
GROUPNAME String for this entity's default group

_Note: an entity can belong to more than one group by being added to other Group objects via the __scrawl.addEntitysToGroups()__ and __Group.addEntityToGroup()__ functions_
@property group
@type String
@default false
**/
			group: false,
			/**
Dirty flag - sets to true when certain entity attributes change
@property redraw
@type Boolean
@default false
@private
**/
			redraw: false,
			/**
The current Frame drawing process often leads to moire interference patterns appearing in the resulting image. Scrawl uses resizing to blur out these patterns. The interferenceLoops attribute sets the number of times the image gets resized; if patterns still appear in the final image, increase this value
@property interferenceLoops
@type Number
@default 2
**/
			interferenceLoops: 2,
			/**
The current Frame drawing process often leads to moire interference patterns appearing in the resulting image. Scrawl uses resizing to blur out these patterns. The interferenceFactor attribute sets the resizing ratio; if patterns still appear in the final image, change this value to something more appropriate
@property interferenceFactor
@type Number
@default 1.03
**/
			interferenceFactor: 1.03,
			/**
Maximum dimensions - used as part of entity filter and collision detection functionality
@property maxDimensions
@type Object
@default {top:0, bottom:0, left:0, right:0, flag:true}
@private
**/
			maxDimensions: {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				flag: true
			}
		};
		/**
Attribute cascaded to appropriate FramePoint object path attribute
@property topLeftPath
@type String
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object path attribute
@property topRightPath
@type String
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object path attribute
@property bottomRightPath
@type String
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object path attribute
@property bottomLeftPath
@type String
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object pathPlace attribute
@property topLeftPathPlace
@type Number
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object pathPlace attribute
@property topRightPathPlace
@type Number
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object pathPlace attribute
@property bottomRightPathPlace
@type Number
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object pathPlace attribute
@property bottomLeftPathPlace
@type Number
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object deltaPathPlace attribute
@property topLeftDeltaPathPlace
@type Number
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object deltaPathPlace attribute
@property topRightDeltaPathPlace
@type Number
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object deltaPathPlace attribute
@property bottomRightDeltaPathPlace
@type Number
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object deltaPathPlace attribute
@property bottomLeftDeltaPathPlace
@type Number
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object pathSpeedConstant attribute
@property topLeftPathSpeedConstant
@type Boolean
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object pathSpeedConstant attribute
@property topRightPathSpeedConstant
@type Boolean
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object pathSpeedConstant attribute
@property bottomRightPathSpeedConstant
@type Boolean
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object pathSpeedConstant attribute
@property bottomLeftPathSpeedConstant
@type Boolean
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object pivot attribute
@property topLeftPivot
@type String
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object pivot attribute
@property topRightPivot
@type String
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object pivot attribute
@property bottomRightPivot
@type String
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object pivot attribute
@property bottomLeftPivot
@type String
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object lockX attribute
@property topLeftLockX
@type Boolean
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object lockX attribute
@property topRightLockX
@type Boolean
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object lockX attribute
@property bottomRightLockX
@type Boolean
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object lockX attribute
@property bottomLeftLockX
@type Boolean
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object lockY attribute
@property topLeftLockY
@type Boolean
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object lockY attribute
@property topRightLockY
@type Boolean
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object lockY attribute
@property bottomRightLockY
@type Boolean
@default false
**/
		/**
Attribute cascaded to appropriate FramePoint object lockY attribute
@property bottomLeftLockY
@type Boolean
@default false
**/
		my.mergeInto(my.work.d.Frame, my.work.d.Base);
		/**
Frame.registerInLibrary hook function - modified by collisions extension
@method collisionsEntityRegisterInLibrary
@private
**/
		my.Frame.prototype.collisionsEntityRegisterInLibrary = function(items) {
			return my.Entity.prototype.collisionsEntityRegisterInLibrary.call(this, items);
		};
		/**
Augments Base.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Frame.prototype.set = function(items) {
			var e,
				so = my.safeObject,
				copy = this.copy,
				get = my.xtGet;
			my.Base.prototype.set.call(this, items);
			items = so(items);
			if (this.lockFrameTo || items.lockFrameTo) {
				this.setLockElementAttributes(items);
				if (items.lockFrameTo) {
					this.lockOn(items);
					this.lockFrameTo = items.lockFrameTo;
				}
				e = get(so(my.element)[this.lockFrameTo], so(my.stack)[this.lockFrameTo], so(my.pad)[this.lockFrameTo]);
				if (e) {
					e.set(this.lockElementAttributes);
				}
			}
			if (my.xt(items.copyX, items.copyY, items.copyWidth, items.copyHeight)) {
				copy.x = get(items.copyX, copy.x);
				copy.y = get(items.copyY, copy.y);
				copy.w = get(items.copyWidth, copy.w);
				copy.h = get(items.copyHeight, copy.h);
				this.currentCopy.flag = false;
			}
			if (items.order) {
				my.group[this.group].resort = true;
			}
			this.setCorners(items);
			this.setEngine(items);
			return this;
		};
		/**
Augments Base.clone()
@method clone
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Frame.prototype.clone = function(items) {
			var a,
				c = my.Base.prototype.clone.call(this, items),
				get = my.xtGet,
				copy = this.copy;
			if (c.lockFrameTo) {
				a = my.mergeOver(this.lockElementAttributes, my.safeObject(items));
				my.element[c.lockFrameTo].set(a);
			}
			c.copy = {
				x: get(items.copyX, copy.x),
				y: get(items.copyY, copy.y),
				w: get(items.copyWidth, copy.w),
				h: get(items.copyHeight, copy.h)
			};
			c.currentCopy = {
				flag: false
			};
			c.redraw = true;
			return c;
		};
		/**
@method setCorners
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Frame.prototype.setCorners = function(items) {
			var i,
				corners,
				cornersX,
				cornersY,
				corner,
				temp,
				makeFramePoint,
				get,
				xt,
				xto,
				order,
				cell;
			items = my.safeObject(items);
			corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
			cornersX = ['tlx', 'trx', 'brx', 'blx'];
			cornersY = ['tly', 'try', 'bry', 'bly'];
			makeFramePoint = my.makeFramePoint;
			cell = my.cell[my.group[this.group].cell];
			get = my.xtGet;
			xt = my.xt;
			xto = my.xto;
			order = this.cornersDataArrayOrder;
			for (i = 0; i < 4; i++) {
				temp = {};
				corner = corners[i];
				if (!this[corner]) {
					this[corner] = makeFramePoint({
						name: this.name + '_' + corner,
						host: this.name
					});
				}
				if (xt(items.cornersData)) {
					if (Array.isArray(items.cornersData)) {
						temp.data = [
							get(items.cornersData[order.indexOf(cornersX[i])], this[corner].local.x, 0),
							get(items.cornersData[order.indexOf(cornersY[i])], this[corner].local.y, 0)
						];
					}
					else {
						temp.data = false;
					}
					this.redraw = true;
				}
				else if (items.lockFrameTo) {
					temp.lock = items.lockFrameTo;
					temp.lockCorner = corner;
					this.redraw = true;
				}
				temp.path = get(items[corner + 'Path'], this[corner].path);
				temp.pathPlace = get(items[corner + 'PathPlace'], this[corner].pathPlace);
				temp.deltaPathPlace = get(items[corner + 'DeltaPathPlace'], this[corner].deltaPathPlace);
				temp.pathSpeedConstant = get(items[corner + 'PathSpeedConstant'], this[corner].pathSpeedConstant);
				temp.pivot = get(items[corner + 'Pivot'], this[corner].pivot);
				temp.lockX = get(items[corner + 'LockX'], this[corner].lockX);
				temp.lockY = get(items[corner + 'LockY'], this[corner].lockY);
				this[corner].set(temp);
				if (xto(items[corner + 'Path'], items[corner + 'PathPlace'], items[corner + 'Pivot'])) {
					this.redraw = true;
				}
			}
			return this;
		};
		/**
@method getCorners
@return Object containing x/y coordinate objects for each corner
@example
	Returns an object with the following structure:
    
    {
		topLeft: {x: 0, y:0},
		topRight: {x: 0, y:0},
		bottomRight: {x: 0, y:0},
		bottomLeft: {x: 0, y:0}
    }
**/
		my.Frame.prototype.getCorners = function() {
			var result = {
					topLeft: {},
					topRight: {},
					bottomRight: {},
					bottomLeft: {}
				},
				corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'],
				corner;
			for (var i = 0; i < 4; i++) {
				corner = corners[i];
				result[corner].x = this[corner].local.x || 0;
				result[corner].y = this[corner].local.y || 0;
			}
			return result;
		};
		/**
@method checkCorners
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Frame.prototype.checkCorners = function() {
			var i,
				corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'],
				corner,
				result = false;
			for (i = 0; i < 4; i++) {
				corner = corners[i];
				if (this.lockFrameTo || this.pivot || this.path || this[corner].pivot || this[corner].path) {
					this[corner].setLocal();
				}
				if (this[corner].changed) {
					result = true;
				}
			}
			return result;
		};
		/**
@method setEngine
@param {Object} items Object consisting of key:value attributes
@private
**/
		my.Frame.prototype.setEngine = function(items) {
			var design, strokeStyle,
				e = this.engine;
			if (items.lineWidth) {
				e.lineWidth = items.lineWidth;
			}
			if (items.lineCap) {
				e.lineCap = items.lineCap;
			}
			if (items.lineJoin) {
				e.lineJoin = items.lineJoin;
			}
			if (items.lineDash) {
				e.mozDash = items.lineDash;
				e.lineDash = items.lineDash;
				if (e.setLineDash) {
					e.setLineDash(items.lineDash);
				}
			}
			if (items.lineDashOffset) {
				e.mozDashOffset = items.lineDashOffset;
				e.lineDashOffset = items.lineDashOffset;
			}
			if (items.miterLimit) {
				e.miterLimit = items.miterLimit;
			}
			if (items.globalCompositeOperation) {
				e.globalCompositeOperation = items.globalCompositeOperation;
			}
			if (items.globalAlpha) {
				e.globalAlpha = items.globalAlpha;
			}
			if (items.shadowOffsetX) {
				e.shadowOffsetX = items.shadowOffsetX;
			}
			if (items.shadowOffsetY) {
				e.shadowOffsetY = items.shadowOffsetY;
			}
			if (items.shadowBlur) {
				e.shadowBlur = items.shadowBlur;
			}
			if (items.shadowColor) {
				e.shadowColor = items.shadowColor;
			}
			if (items.strokeStyle) {
				design = my.design[items.strokeStyle];
				if (my.xt(design)) {
					if (my.contains(['Gradient', 'RadialGradient', 'Pattern'], design.type)) {
						design.update(this.name, my.group[this.group].cell);
					}
					strokeStyle = design.getData();
				}
				else {
					strokeStyle = items.strokeStyle;
				}
				this.engine.strokeStyle = strokeStyle;
			}
			return this;
		};
		/**
@method setDestinationEngine
@param Object ctx - 2d context engine
@param String - CELLNAME
@param Object - scrawl Cell object
@private
**/
		my.Frame.prototype.setDestinationEngine = function(ctx, cellname, cell) {
			var design, strokeStyle,
				record = my.ctx[cellname];
			if (record.lineWidth != this.lineWidth) {
				ctx.lineWidth = this.lineWidth;
				record.lineWidth = this.lineWidth;
			}
			if (record.lineCap != this.lineCap) {
				ctx.lineCap = this.lineCap;
				record.lineCap = this.lineCap;
			}
			if (record.lineJoin != this.lineJoin) {
				ctx.lineJoin = this.lineJoin;
				record.lineJoin = this.lineJoin;
			}
			if (record.lineDash != this.lineDash) {
				ctx.mozDash = this.lineDash;
				ctx.lineDash = this.lineDash;
				if (ctx.setLineDash) {
					ctx.setLineDash(this.lineDash);
				}
				record.lineDash = this.lineDash;
			}
			if (record.lineDashOffset != this.lineDashOffset) {
				ctx.mozDashOffset = this.lineDashOffset;
				ctx.lineDashOffset = this.lineDashOffset;
				record.lineDashOffset = this.lineDashOffset;
			}
			if (record.miterLimit != this.miterLimit) {
				ctx.miterLimit = this.miterLimit;
				record.miterLimit = this.miterLimit;
			}
			if (record.shadowOffsetX != this.shadowOffsetX) {
				ctx.shadowOffsetX = this.shadowOffsetX;
				record.shadowOffsetX = this.shadowOffsetX;
			}
			if (record.shadowOffsetY != this.shadowOffsetY) {
				ctx.shadowOffsetY = this.shadowOffsetY;
				record.shadowOffsetY = this.shadowOffsetY;
			}
			if (record.shadowBlur != this.shadowBlur) {
				ctx.shadowBlur = this.shadowBlur;
				record.shadowBlur = this.shadowBlur;
			}
			if (record.shadowColor != this.shadowColor) {
				ctx.shadowColor = this.shadowColor;
				record.shadowColor = this.shadowColor;
			}
			if (record.strokeStyle != this.strokeStyle) {
				if (my.xt(my.design[this.strokeStyle])) {
					design = my.design[this.strokeStyle];
					if (my.contains(['Gradient', 'RadialGradient', 'Pattern'], design.type)) {
						design.update(this.name, my.group[this.group].cell);
					}
					strokeStyle = design.getData();
				}
				else {
					strokeStyle = this.strokeStyle;
				}
				ctx.strokeStyle = strokeStyle;
				record.strokeStyle = this.strokeStyle;
			}
			if (record.globalCompositeOperation != this.globalCompositeOperation) {
				ctx.globalCompositeOperation = this.globalCompositeOperation;
				record.globalCompositeOperation = this.globalCompositeOperation;
			}
			if (record.globalAlpha != this.globalAlpha) {
				ctx.globalAlpha = this.globalAlpha;
				record.globalAlpha = this.globalAlpha;
			}
			return this;
		};
		/**
Attach a Frame entity to an existing stack element, or create a new stack &lt;div&gt; element
@method lockOn
@param {Object} items Object consisting of key:value attributes
@private
**/
		my.Frame.prototype.lockOn = function(items) {
			var so = my.safeObject,
				lockFrameTo = this.lockFrameTo,
				el = my.xtGet(so(my.stack)[lockFrameTo], so(my.pad)[lockFrameTo], so(my.element)[lockFrameTo], false),
				corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'],
				corner,
				parent, stack, temp,
				i;
			if (!el) {
				parent = my.pad[my.cell[my.group[this.group].cell].pad].group;
				if (parent) {
					stack = my.stack[parent];
					temp = document.createElement('div');
					temp.id = lockFrameTo;
					document.body.appendChild(temp);
					el = stack.addElementById(lockFrameTo);
					el.set({
						translateZ: stack.get('translateZ') - 2,
					});
					this.currentFrame = el;
				}
			}
			if (el) {
				this.setLockElementAttributes(items);
				el.set(this.lockElementAttributes);
				if (!el.topLeft) {
					el.addCornerTrackers();
					for (i = 0; i < 4; i++) {
						corner = corners[i];
						if (this[corner].local) {
							this[corner].local = el[corner];
						}
					}
				}
				this.setLockElementAttributes(items);
				el.set(this.lockElementAttributes);
			}
		};
		/**
Array of key Strings used to whitelist the permitted attributes for cascade to stack element, if present. Used by lockElementAttributes attribute
@property lockElementAttributesList
@type Array
@default ['start', 'startX', 'startY', 'handle', 'handleX', 'handleY', 'deltaStart', 'deltaStartX', 'deltaStartY', 'deltaHandle', 'deltaHandleX', 'deltaHandleY', 'width', 'height', 'scale', 'deltaScale', 'deltaRoll', 'deltaPitch', 'deltaYaw', 'roll', 'pitch', 'yaw', 'includeCornerTrackers', 'pivot', 'path', 'pathPlace', 'deltaPathPlace', 'pathSpeedConstant', 'translate', 'translateX', 'translateY', 'translateZ', 'mouseIndex', 'cursor']
@private
**/
		my.Frame.prototype.lockElementAttributesList = ['start', 'startX', 'startY', 'handle', 'handleX', 'handleY', 'deltaStart', 'deltaStartX', 'deltaStartY', 'deltaHandle', 'deltaHandleX', 'deltaHandleY', 'width', 'height', 'scale', 'deltaScale', 'deltaRoll', 'deltaPitch', 'deltaYaw', 'roll', 'pitch', 'yaw', 'includeCornerTrackers', 'pivot', 'path', 'pathPlace', 'deltaPathPlace', 'pathSpeedConstant', 'translate', 'translateX', 'translateY', 'translateZ', 'mouseIndex', 'cursor'];
		/**
@method setLockElementAttributes
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Frame.prototype.setLockElementAttributes = function(items) {
			var keys = Object.keys(items),
				key,
				whitelist = this.lockElementAttributesList,
				i, iz,
				cont = my.contains,
				lea = this.lockElementAttributes;
			for (i = 0, iz = keys.length; i < iz; i++) {
				key = keys[i];
				if (cont(whitelist, key)) {
					lea[key] = items[key];
				}
			}
			return this;
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
		my.Frame.prototype.forceStamp = function(method, cellname, cell, mouse) {
			var temp = this.visibility;
			this.visibility = true;
			this.stamp(method, cell);
			this.visibility = temp;
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
		my.Frame.prototype.stamp = function(method, cellname, cell, mouse) {
			var dCell,
				dName,
				dCtx,
				dMethod;
			if (this.visibility) {
				dCell = (cell) ? cell : my.group[this.group].cell;
				dName = dCell.name;
				dCtx = my.context[dName];
				dMethod = (method) ? method : this.method;
				this.redrawCanvas();
				this[dMethod](dCtx, dName, dCell);
				this.stampFilter(dCtx, dName, dCell);
			}
			return this;
		};
		/**
Entity constructor hook function - modified by filters module
@method filtersEntityInit
@private
**/
		my.Frame.prototype.filtersEntityInit = function(items) {
			my.Entity.prototype.filtersEntityInit.call(this, items);
		};
		/**
Entity.stamp hook function - add a filter to an Entity, and any background detail enclosed by the Entity
@method stampFilter
@private
**/
		my.Frame.prototype.stampFilter = function(engine, cellname, cell) {
			my.Entity.prototype.stampFilter.call(this, engine, cellname, cell);
		};
		/**
Entity.stamp hook helper function
@method stampFilterDefault
@private
**/
		my.Frame.prototype.stampFilterDefault = function(entity, engine, cellname, cell) {
			return my.Entity.prototype.stampFilterDefault.call(this, entity, engine, cellname, cell);
		};
		my.Frame.prototype.stampFilterDimensionsActions = my.Entity.prototype.stampFilterDimensionsActions;
		/**
Draw Frame entity in its own local canvas, then copy over to destimation canvas
@method redrawCanvas
@private
**/
		my.Frame.prototype.redrawCanvas = function() {
			var tl, tr, br, bl, tlloc, trloc, brloc, blloc, tlx, tly, trx, tryy, brx, bry, blx, bly,
				min, max, ceil, floor, xmin, ymin, xmax, ymax,
				width, height, dim, maxDim, minDim,
				src, //must be an image, canvas or video
				i, sx, sy, ex, ey, len, angle, val, fw, fh, copy,
				cv, cvx, getPos, iFac, cell, xta,
				get = my.xtGet,
				redraw, cornerCheck;

			src = my.xtGet(my.asset[this.source], my.canvas[this.source], false);
			if (src) {

				redraw = this.redraw;
				cornerCheck = this.checkCorners();
				if (redraw || cornerCheck) {

					xta = my.xta;
					// this.checkCorners();
					tl = this.topLeft;
					tr = this.topRight;
					br = this.bottomRight;
					bl = this.bottomLeft;
					if (xta(tl, tr, br, bl)) {

						tlloc = tl.local;
						trloc = tr.local;
						brloc = br.local;
						blloc = bl.local;
						if (xta(tlloc, trloc, brloc, blloc)) {

							tlx = tlloc.x;
							tly = tlloc.y;
							trx = trloc.x;
							tryy = trloc.y;
							brx = brloc.x;
							bry = brloc.y;
							blx = blloc.x;
							bly = blloc.y;
							min = Math.min;
							max = Math.max;
							ceil = Math.ceil;
							floor = Math.floor;
							xmin = min.apply(Math, [tlx, trx, brx, blx]);
							ymin = min.apply(Math, [tly, tryy, bry, bly]);
							xmax = max.apply(Math, [tlx, trx, brx, blx]);
							ymax = max.apply(Math, [tly, tryy, bry, bly]);
							width = xmax - xmin || 1;
							height = ymax - ymin || 1;
							dim = max.apply(Math, [width, height]);
							maxDim = ceil(dim);
							minDim = floor(dim);
							cv = my.work.cv;
							cvx = my.work.cvx;
							getPos = this.getPosition;
							iFac = this.interferenceFactor;
							cell = this.cell;
							this.width = width;
							this.localWidth = width;
							this.height = height;
							this.localHeight = height;
							this.referencePoint.x = xmin;
							this.referencePoint.y = ymin;
							if (my.contains(['fill', 'drawFill', 'fillDraw', 'sinkInto', 'floatOver'], this.method)) {

								this.redraw = false;
								copy = this.currentCopy;
								if (!copy.flag) {
									this.updateCurrentCopy(src);
								}
								cell.width = ceil(width);
								cell.height = ceil(height);
								cv.width = maxDim;
								cv.height = maxDim;
								cvx.drawImage(src, copy.x, copy.y, copy.w, copy.h, 0, 0, minDim, minDim);
								for (i = 0; i <= minDim; i++) {
									val = i / minDim;
									sx = getPos(tlx, blx, val) - xmin;
									sy = getPos(tly, bly, val) - ymin;
									ex = getPos(trx, brx, val) - xmin;
									ey = getPos(tryy, bry, val) - ymin;
									len = this.getLength(sx, sy, ex, ey);
									angle = this.getAngle(sx, sy, ex, ey);

									this.setEasel(sx, sy, angle);
									this.engine.drawImage(cv, 0, i, minDim, 1, 0, 0, len, 1);
									this.resetEasel();
								}
								fw = ceil(width);
								fh = ceil(height);
								for (i = 0; i < this.interferenceLoops; i++) {
									fw = ceil(fw * iFac);
									fh = ceil(fh * iFac);
									cv.width = fw;
									cv.height = fh;
									cvx.drawImage(cell, 0, 0, cell.width, cell.height, 0, 0, fw, fh);
									this.engine.drawImage(cv, 0, 0, fw, fh, 0, 0, cell.width, cell.height);
								}
								this.redraw = false;
							}
						}
					}
					this.maxDimensions.flag = true;
				}
			}
			return this;
		};
		/**
redrawCanvas helper function - updates copy parameters
@method updateCurrentCopy
@private
**/
		my.Frame.prototype.updateCurrentCopy = function(reference) {
			var copy = this.copy,
				current = this.currentCopy,
				width, height, w, h,
				conv = this.numberConvert,
				get = my.xtGet;
			if (reference) {
				width = get(reference.actualWidth, reference.width);
				height = get(reference.actualHeight, reference.height);
				current.x = (copy.x.substring) ? conv(copy.x, width) : copy.x;
				current.y = (copy.y.substring) ? conv(copy.y, height) : copy.y;
				current.w = (copy.w.substring) ? conv(copy.w, width) : copy.w;
				current.h = (copy.h.substring) ? conv(copy.h, height) : copy.h;
				current.x = (current.x < 0) ? 0 : current.x;
				current.y = (current.y < 0) ? 0 : current.y;
				current.w = (current.w < 1) ? 1 : current.w;
				current.h = (current.h < 1) ? 1 : current.h;
				w = width - current.x;
				h = height - current.y;
				current.w = (current.w > w) ? w : current.w;
				current.h = (current.h > h) ? h : current.h;
				current.flag = true;
			}
		};
		/**
redrawCanvas helper function
@method getPosition
@private
**/
		my.Frame.prototype.getPosition = function(a, b, v) {
			return ((b - a) * v) + a;
		};
		/**
redrawCanvas helper function
@method getLength
@private
**/
		my.Frame.prototype.getLength = function(xa, ya, xb, yb) {
			return Math.sqrt(Math.pow(xa - xb, 2) + Math.pow(ya - yb, 2));
		};
		/**
redrawCanvas helper function
@method getAngle
@private
**/
		my.Frame.prototype.getAngle = function(xa, ya, xb, yb) {
			return Math.atan2(ya - yb, xa - xb);
		};
		/**
redrawCanvas helper function
@method setEasel
@private
**/
		my.Frame.prototype.setEasel = function(x, y, a) {
			var cos = Math.cos(a),
				sin = Math.sin(a);
			this.engine.setTransform(-cos, -sin, sin, -cos, x, y);
		};
		/**
redrawCanvas helper function
@method resetEasel
@private
**/
		my.Frame.prototype.resetEasel = function() {
			this.engine.setTransform(1, 0, 0, 1, 0, 0);
		};
		my.Frame.prototype.correctCoordinates = my.Position.prototype.correctCoordinates;
		/**
Set entity's pivot to 'mouse'; set handles to supplied Vector value; set order to +9999
@method pickupEntity
@param {Vector} items Coordinate vector; alternatively an object with {x, y} attributes can be used
@return This
@chainable
**/
		my.Frame.prototype.pickupEntity = function(items) {
			var cf = this.currentFrame;
			if (cf) {
				cf.pickupEntity(items);
				this.oldPivot = this.pivot;
				this.pivot = 'mouse';
				my.group[this.group].resort = true;
			}
			return this;
		};
		/**
Revert pickupEntity() actions, ensuring entity is left where the user drops it
@method dropEntity
@param {String} [items] Alternative pivot String
@return This
@chainable
**/
		my.Frame.prototype.dropEntity = function(item) {
			var cf = this.currentFrame;
			if (cf) {
				cf.dropEntity(item);
				this.pivot = this.oldPivot;
				delete this.oldPivot;
				my.group[this.group].resort = true;
			}
			return this;
		};
		/**
stamp helper function - clear shadow parameters during a multi draw operation (drawFill and fillDraw methods)
@method clearShadow
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
		my.Frame.prototype.clearShadow = function(ctx, cellname, cell) {
			if (this.shadowOffsetX || this.shadowOffsetY || this.shadowBlur) {
				cell.clearShadow();
			}
			return this;
		};
		/**
stamp helper function
@method prepareStamp
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@private
**/
		my.Frame.prototype.prepareStamp = function(ctx, cellname, cell) {
			this.setDestinationEngine(ctx, cellname, cell);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		};
		/**
stamp helper function - draw the path between the corner points
@method drawPath
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@private
**/
		my.Frame.prototype.drawPath = function(ctx, cellname, cell) {
			var tl = this.topLeft.local,
				tr = this.topRight.local,
				br = this.bottomRight.local,
				bl = this.bottomLeft.local;
			if (my.xta(tl, tr, br, bl)) {
				ctx.beginPath();
				ctx.moveTo(tl.x, tl.y);
				ctx.lineTo(tr.x, tr.y);
				ctx.lineTo(br.x, br.y);
				ctx.lineTo(bl.x, bl.y);
				ctx.closePath();
			}
			return this;
		};
		/**
stamp helper function - fill thge entity
@method drawImage
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@private
**/
		my.Frame.prototype.drawImage = function(ctx, cellname, cell) {
			var referencePoint = this.referencePoint;
			ctx.drawImage(this.cell, referencePoint.x, referencePoint.y);
			return this;
		};
		/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
		my.Frame.prototype.clip = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.clip();
			return this;
		};
		/**
Stamp helper function - perform a 'clear' method draw
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
		my.Frame.prototype.clear = function(ctx, cellname, cell) {
			var engine = my.ctx[cellname];
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.globalCompositeOperation = 'destination-out';
			ctx.fillStyle = '#000000';
			ctx.strokeStyle = '#000000';
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = engine.get('fillStyle');
			ctx.strokeStyle = engine.get('strokeStyle');
			ctx.globalCompositeOperation = engine.get('globalCompositeOperation');
			return this;
		};
		/**
Stamp helper function - perform a 'clearWithBackground' method draw
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
		my.Frame.prototype.clearWithBackground = function(ctx, cellname, cell) {
			var engine = my.ctx[cellname],
				color = my.cell[cellname].get('backgroundColor');
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.globalCompositeOperation = 'destination-out';
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = engine.get('fillStyle');
			ctx.strokeStyle = engine.get('strokeStyle');
			ctx.globalCompositeOperation = engine.get('globalCompositeOperation');
			return this;
		};
		/**
Stamp helper function - perform a 'draw' method draw
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
		my.Frame.prototype.draw = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.stroke();
			return this;
		};
		/**
Stamp helper function - perform a 'fill' method draw
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
		my.Frame.prototype.fill = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawImage(ctx, cellname, cell);
			return this;
		};
		/**
Stamp helper function - perform a 'drawFill' method draw
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
		my.Frame.prototype.drawFill = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.stroke();
			this.clearShadow(ctx, cellname, cell);
			this.drawImage(ctx, cellname, cell);
			return this;
		};
		/**
Stamp helper function - perform a 'fillDraw' method draw
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
		my.Frame.prototype.fillDraw = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawImage(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			this.clearShadow(ctx, cellname, cell);
			ctx.stroke();
			return this;
		};
		/**
Stamp helper function - perform a 'sinkInto' method draw
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
		my.Frame.prototype.sinkInto = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawImage(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.stroke();
			return this;
		};
		/**
Stamp helper function - perform a 'floatOver' method draw
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cellname CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} cell scrawl Cell object
@return This
@chainable
@private
**/
		my.Frame.prototype.floatOver = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.stroke();
			this.drawImage(ctx, cellname, cell);
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
		my.Frame.prototype.none = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
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
		my.Frame.prototype.checkHit = function(items) {
			items = my.safeObject(items);
			var tests = (my.xt(items.tests)) ? items.tests : [(items.x || false), (items.y || false)],
				result = false,
				cvx = my.work.cvx,
				i, iz;
			cvx.setTransform(1, 0, 0, 1, 0, 0);
			this.drawPath(cvx);
			for (i = 0, iz = tests.length; i < iz; i += 2) {
				result = cvx.isPointInPath(tests[i], tests[i + 1]);
				if (result) {
					items.x = tests[i];
					items.y = tests[i + 1];
					break;
				}
			}
			return (result) ? items : false;
		};
		/**
Calculate the box position of the entity

Returns an object with the following attributes:

* __left__ - x coordinate of top-left corner of the enclosing box relative to the current cell's top-left corner
* __top__ - y coordinate of top-left corner of the enclosing box relative to the current cell's top-left corner
* __bottom__ - x coordinate of bottom-right corner of the enclosing box relative to the current cell's top-left corner
* __left__ - y coordinate of bottom-right corner of the enclosing box relative to the current cell's top-left corner

@method getMaxDimensions
@param {Object} cell object
@param {Object} entity object
@return dimensions object
@private
**/
		my.Frame.prototype.getMaxDimensions = function(cell) {
			var tl, tr, br, bl, tlloc, trloc, brloc, blloc, t, l, b, r,
				min = Math.min,
				max = Math.max,
				floor = Math.floor,
				ceil = Math.ceil,
				border, paste,
				between = my.isBetween,
				w, h, halfW, halfH;
			tl = this.topLeft;
			tr = this.topRight;
			br = this.bottomRight;
			bl = this.bottomLeft;
			cell = (cell && cell.type === 'Cell') ? cell : my.cell[my.group[this.group].cell];
			if (my.xta(tl, tr, br, bl)) {
				tlloc = tl.local;
				trloc = tr.local;
				brloc = br.local;
				blloc = bl.local;
				border = (this.lineWidth / 2) + 1;
				l = floor(min.apply(Math, [tlloc.x, trloc.x, brloc.x, blloc.x]) - border);
				t = floor(min.apply(Math, [tlloc.y, trloc.y, brloc.y, blloc.y]) - border);
				r = ceil(max.apply(Math, [tlloc.x, trloc.x, brloc.x, blloc.x]) + border);
				b = ceil(max.apply(Math, [tlloc.y, trloc.y, brloc.y, blloc.y]) + border);
			}
			else {
				paste = my.safeObject(cell.pasteData);
				l = floor(paste.x || 0);
				t = floor(paste.y || 0);
				r = ceil(paste.x + paste.w || 1);
				b = ceil(paste.y + paste.h || 1);
			}
			w = cell.actualWidth;
			h = cell.actualHeight;
			halfW = w / 2;
			halfH = h / 2;
			if (!between(t, 0, h, true)) {
				t = (t > halfH) ? h : 0;
			}
			if (!between(b, 0, h, true)) {
				b = (b > halfH) ? h : 0;
			}
			if (!between(l, 0, w, true)) {
				l = (l > halfW) ? w : 0;
			}
			if (!between(r, 0, w, true)) {
				r = (r > halfW) ? w : 0;
			}
			this.maxDimensions.top = t;
			this.maxDimensions.bottom = b;
			this.maxDimensions.left = l;
			this.maxDimensions.right = r;
			this.maxDimensions.flag = false;
			return this.maxDimensions;
		};

		my.Frame.prototype.parseCollisionPoints = function() {
			return [];
		};

		/**
reciprocal assignment - also occurs in scrawlFilters as there's no way to tell which file (scrawlFrame, scrawlFilters) will be loaded first
@method stampFilterActions
@private
**/
		if (my.Entity.prototype.stampFilterActions) {
			my.Frame.prototype.stampFilterActions = my.Entity.prototype.stampFilterActions;
		}


		return my;
	}(scrawl));
}
