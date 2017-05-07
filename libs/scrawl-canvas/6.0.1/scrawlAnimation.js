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
# scrawlAnimation

## Purpose and features

The Animation module adds support for animation and tweening to the core

* Adds and starts an animation loop to the core
* Defines the Animation object, used to program animation sequences
* Defines the Tween object - a specialized form of animation which has pre-determined start and end points, durations and easing options
* Adds functionality to various core objects and functions so they can take advantage of the animation object

@module scrawlAnimation
**/
if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'animation')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlAnimation extension adaptions to the Scrawl library object

## New library sections

* scrawl.tween - for Tween and Action objects

## New default attributes

* Position.delta - default: {x:0,y:0,z:0};
* Position.deltaPathPlace - default: 0;
* Position.pathSpeedConstant - default: true;
* Position.tweenLock - default: false;

* Cell.sourceDelta - default: {x:0, y:0, z:0};
* Cell.sourceMinWidth - default: 0;
* Cell.sourceMaxWidth - default: 0;
* Cell.sourceMinHeight - default: 0;
* Cell.sourceMaxHeight - default: 0;

* PageElement.tweenLock - default: false;

* Design.roll - default: 0;
* Design.autoUpdate - default: false;

@class window.scrawl_Animation
**/

		my.work.d.Position.delta = {
			x: 0,
			y: 0,
			z: 0
		};
		my.work.d.Position.deltaPathPlace = 0;
		my.work.d.Position.pathSpeedConstant = true;
		my.work.d.Position.tweenLock = false;
		my.mergeInto(my.work.d.Cell, my.work.d.Position);
		my.mergeInto(my.work.d.Entity, my.work.d.Position);
		if (my.xt(my.work.d.Block)) {
			my.mergeInto(my.work.d.Block, my.work.d.Entity);
		}
		if (my.xt(my.work.d.Shape)) {
			my.mergeInto(my.work.d.Shape, my.work.d.Entity);
		}
		if (my.xt(my.work.d.Wheel)) {
			my.mergeInto(my.work.d.Wheel, my.work.d.Entity);
		}
		if (my.xt(my.work.d.Picture)) {
			my.mergeInto(my.work.d.Picture, my.work.d.Entity);
		}
		if (my.xt(my.work.d.Phrase)) {
			my.mergeInto(my.work.d.Phrase, my.work.d.Entity);
		}
		if (my.xt(my.work.d.Path)) {
			my.mergeInto(my.work.d.Path, my.work.d.Entity);
		}

		my.work.d.PageElement.tweenLock = false;
		my.mergeInto(my.work.d.Pad, my.work.d.PageElement);
		if (my.xt(my.work.d.Stack)) {
			my.mergeInto(my.work.d.Stack, my.work.d.PageElement);
		}
		if (my.xt(my.work.d.Element)) {
			my.mergeInto(my.work.d.Element, my.work.d.PageElement);
		}

		my.pushUnique(my.work.sectionlist, 'tween');
		my.pushUnique(my.work.nameslist, 'tweennames');

		/**
Convert a time into its component properties

Expected values:
* Number - time value in milliseconds
* String number+% - will always return a Number time value of 0
* String number+ms - returns a Number time value in milliseconds
* String number+s - converts and returns a Number time value in milliseconds

@method convertTime
@return [String timeUnit, Number timeValue]
@private
**/
		my.convertTime = function(item) {
			var a, timeUnit, timeValue;
			if (my.xt(item)) {
				if (item.toFixed) {
					return ['ms', item];
				}
				a = item.match(/^\d+\.?\d*(\D*)/);
				timeUnit = (a[1].toLowerCase) ? a[1].toLowerCase() : 'ms';
				switch (timeUnit) {
					case 's':
						timeValue = parseFloat(item) * 1000;
						break;
					case '%':
						timeValue = parseFloat(item);
						break;
					default:
						timeUnit = 'ms';
						timeValue = parseFloat(item);
				}
				return [timeUnit, timeValue];
			}
			return false;
		};
		/**
A __utility__ function that adds two numbers between 0 and 1, keeping them within bounds

@method addWithinBounds
@param {Number} a first number
@param {Number} b second number
@return result of calculation
**/
		my.addWithinBounds = function(a, b) {
			var result = a + b;
			if (result > 1) {
				return result - 1;
			}
			if (result < 0) {
				return result + 1;
			}
			return result;
		};
		/**
Position constructor hook function

Adds a __delta__ (deltaX, deltaY) Vector to the object, used to give an object a 'velocity'

@method animationPositionInit
@private
**/
		my.Position.prototype.animationPositionInit = function(items) {
			var temp = my.safeObject(items.delta),
				vec = my.makeVector,
				get = my.xtGet,
				d = my.work.d[this.type];
			this.delta = vec({
				name: this.type + '.' + this.name + '.delta',
				x: get(items.deltaX, temp.x, 0),
				y: get(items.deltaY, temp.y, 0)
			});
			this.pathSpeedConstant = get(items.pathSpeedConstant, d.pathSpeedConstant);
			this.deltaPathPlace = get(items.deltaPathPlace, d.deltaPathPlace);
		};
		/**
Position.get hook function - modified by animation module
@method animationPositionGet
@private
**/
		my.Position.prototype.animationPositionGet = function(item) {
			var stat = ['deltaX', 'deltaY'];
			if (my.contains(stat, item)) {
				switch (item) {
					case 'deltaX':
						return this.delta.x;
					case 'deltaY':
						return this.delta.y;
				}
			}
			if ('delta' === item) {
				return this.delta.getVector();
			}
			return false;
		};
		/**
Position.set hook function - modified by animation module
@method animationPositionSet
@private
**/
		my.Position.prototype.animationPositionSet = function(items) {
			if (my.xto(items.delta, items.deltaX, items.deltaY)) {
				this.setDeltaAttribute(items);
			}
		};
		/**
Augments Position.set(), to allow users to set the delta attributes using delta, deltaX, deltaY

The scrawlAnimation module adds a __delta__ attribute to Cells and Entitys - this is an inbuilt delta vector which can be used to automatically animate the start vector of these objects - via the updateStart, revertStart and reverse functions - as part of the animation cycle.

Be aware that this is different to the Position.setDelta() function inherited by Cells and Entitys. setDelta is used to add a supplied argument value to the existing values of any numerical attribute of a Cell or Entity object, and is thus not limited to the animation cycle.

@method setDeltaAttribute
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Position.prototype.setDeltaAttribute = function(items) {
			var temp,
				so = my.safeObject,
				get = my.xtGet;
			items = so(items);
			if (!my.isa_vector(this.delta)) {
				this.delta = my.makeVector(items.delta || this.delta);
			}
			temp = so(items.delta);
			this.delta.x = get(items.deltaX, temp.x, this.delta.x);
			this.delta.y = get(items.deltaY, temp.y, this.delta.y);
			return this;
		};
		/**
Position.clone hook function - modified by animation module
@method animationPositionClone
@private
**/
		my.Position.prototype.animationPositionClone = function(a, items) {
			var temp = my.safeObject(items.delta),
				get = my.xtGet;
			a.delta = my.makeVector({
				x: get(items.deltaX, temp.x, a.delta.x),
				y: get(items.deltaY, temp.y, a.delta.y),
			});
			return a;
		};
		/**
Adds delta values to the start vector; adds deltaPathPlace to pathPlace

Permitted argument values include 
* 'x' - delta.x added to start.x
* 'y' - delta.y added to start.y
* 'path' - deltaPathPlace added to pathPlace 
* undefined: all values are amended
@method Position.updateStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
		my.Position.prototype.updateStart = function(item) {
			item = my.xtGet(item, 'all');
			this.updateStartActions[item](my.addPercentages, this.start, this.delta, my.addWithinBounds, this);
			this.currentStart.flag = false;
			if (my.xt(this.collisionArray)) {
				this.collisionArray.length = 0;
			}
			return this;
		};
		/**
updateStart helper object

@method Position.updateStartActions
@private
**/
		my.Position.prototype.updateStartActions = {
			x: function(perc, start, delta, add) {
				start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
			},
			y: function(perc, start, delta, add) {
				start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
			},
			path: function(perc, start, delta, add, obj) {
				obj.pathPlace = add(obj.pathPlace, obj.deltaPathPlace);
			},
			all: function(perc, start, delta, add, obj) {
				if (obj.deltaPathPlace) {
					obj.pathPlace = add(obj.pathPlace, obj.deltaPathPlace);
				}
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
				}
			}
		};
		/**
Subtracts delta values from the start vector; subtracts deltaPathPlace from pathPlace

Permitted argument values include 
* 'x' - delta.x subtracted from start.x
* 'y' - delta.y subtracted from start.y
* 'path' - deltaPathPlace subtracted from pathPlace 
* undefined: all values are amended
@method Position.revertStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
		my.Position.prototype.revertStart = function(item) {
			item = my.xtGet(item, 'all');
			this.revertStartActions[item](my.subtractPercentages, this.start, this.delta, my.addWithinBounds, this);
			this.currentStart.flag = false;
			if (my.xt(this.collisionArray)) {
				this.collisionArray.length = 0;
			}
			return this;
		};
		/**
revertStart helper object

@method Position.revertStartActions
@private
**/
		my.Position.prototype.revertStartActions = {
			x: function(perc, start, delta, add) {
				start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
			},
			y: function(perc, start, delta, add) {
				start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
			},
			path: function(perc, start, delta, add, obj) {
				obj.pathPlace = add(obj.pathPlace, -obj.deltaPathPlace);
			},
			all: function(perc, start, delta, add, obj) {
				if (obj.deltaPathPlace) {
					obj.pathPlace = add(obj.pathPlace, -obj.deltaPathPlace);
				}
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
				}
			}
		};
		/**
Swaps the values of an attribute between two objects
@method Position.exchange
@param {Object} obj Object with which this object will swap attribute values
@param {String} item Attribute to be swapped
@return This
@chainable
**/
		my.Position.prototype.exchange = function(obj, item) {
			var temp;
			if (my.isa_obj(obj)) {
				temp = this[item] || this.get(item);
				this[item] = obj[item] || obj.get(item);
				obj[item] = temp;
			}
			return this;
		};
		/**
Changes the sign (+/-) of specified attribute values
@method Position.reverse
@param {String} [item] String used to limit this function's actions - permitted values include 'deltaX', 'deltaY', 'delta', 'deltaPathPlace'; default action: all values are amended
@return This
@chainable
**/
		my.Position.prototype.reverse = function(item) {
			item = my.xtGet(item, 'all');
			this.reverseActions[item](this.delta, my.reversePercentage, this);
			return this;
		};
		/**
reverse helper object
@method Position.reverseActions
@private
**/
		my.Position.prototype.reverseActions = {
			deltaX: function(delta, perc) {
				delta.x = (delta.x.toFixed) ? -delta.x : perc(delta.x);
			},
			deltaY: function(delta, perc) {
				delta.y = (delta.y.toFixed) ? -delta.y : perc(delta.y);
			},
			delta: function(delta, perc) {
				delta.x = (delta.x.toFixed) ? -delta.x : perc(delta.x);
				delta.y = (delta.y.toFixed) ? -delta.y : perc(delta.y);
			},
			deltaPathPlace: function(delta, perc, obj) {
				obj.deltaPathPlace = -obj.deltaPathPlace;
			},
			all: function(delta, perc, obj) {
				obj.deltaPathPlace = -obj.deltaPathPlace;
				delta.x = (delta.x.toFixed) ? -delta.x : perc(delta.x);
				delta.y = (delta.y.toFixed) ? -delta.y : perc(delta.y);
			}
		};
		my.work.d.Cell.copyDelta = {
			x: 0,
			y: 0,
		};
		my.work.d.Cell.copyMinWidth = 0;
		my.work.d.Cell.copyMaxWidth = 0;
		my.work.d.Cell.copyMinHeight = 0;
		my.work.d.Cell.copyMaxHeight = 0;
		/**
Cell constructor hook function

Adds a __sourceDelta__ (sourceDeltaX, sourceDeltaY) Vector to the cell, used to give it a 'velocity'

@method animationCellInit
@private
**/
		my.Cell.prototype.animationCellInit = function(items) {
			var temp = my.safeObject(items.copyDelta),
				get = my.xtGet;
			this.copyDelta = my.makeVector({
				x: get(items.copyDeltaX, temp.x, 0),
				y: get(items.copyDeltaY, temp.y, 0),
			});
		};
		/**
Cell.get hook function - modified by animation module
@method animationCellGet
@private
**/
		my.Cell.prototype.animationCellGet = function(item) {
			var stat = ['copyDeltaX', 'copyDeltaY'];
			if (my.contains(stat, item)) {
				switch (item) {
					case 'copyDeltaX':
						return this.copyDelta.x;
					case 'copyDeltaY':
						return this.copyDelta.y;
				}
			}
			return my.Base.prototype.get.call(this, item);
		};
		/**
Cell.set hook function - modified by animation module
@method animationCellSet
@private
**/
		my.Cell.prototype.animationCellSet = function(items) {
			var temp,
				get = my.xtGet;
			if (my.xto(items.copyDelta, items.copyDeltaX, items.copyDeltaY)) {
				temp = my.safeObject(items.copyDelta);
				this.copyDelta.x = get(items.copyDeltaX, temp.x, this.copyDelta.x);
				this.copyDelta.y = get(items.copyDeltaY, temp.y, this.copyDelta.y);
			}
		};
		/**
Adds delta values to the start vector; adds sourceDelta values to the source vector; adds deltaPathPlace to pathPlace

Permitted argument values include 
* 'x' - delta.x added to start.x; deltaSource.x added to source.x
* 'y' - delta.y added to start.y; deltaSource.y added to source.y
* 'start', 'target' - delta added to start
* 'source' - deltaSource added to source
* 'path' - deltaPathPlace added to pathPlace 
* undefined: all values are amended
@method Cell.updateStart
@param {String} [item] String used to limit this function's actions
@return This
@chainable
**/
		my.Cell.prototype.updateStart = function(item) {
			item = my.xtGet(item, 'all');
			this.updateStartActions[item](my.addPercentages, this.start, this.delta, this.copy, this.copyDelta, my.addWithinBounds, this);
			this.currentStart.flag = false;
			return this;
		};
		/**
updateStart helper object

@method Cell.updateStartActions
@private
**/
		my.Cell.prototype.updateStartActions = {
			x: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
				}
				if (copyDelta.x) {
					copy.x = (copy.x.toFixed) ? copy.x + copyDelta.x : perc(copy.x, copyDelta.x);
				}
			},
			y: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
				}
				if (copyDelta.y) {
					copy.y = (copy.y.toFixed) ? copy.y + copyDelta.y : perc(copy.y, copyDelta.y);
				}
			},
			start: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
				}
			},
			paste: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
				}
			},
			copy: function(perc, start, delta, copy, copyDelta, add) {
				if (copyDelta.x) {
					copy.x = (copy.x.toFixed) ? copy.x + copyDelta.x : perc(copy.x, copyDelta.x);
				}
				if (copyDelta.y) {
					copy.y = (copy.y.toFixed) ? copy.y + copyDelta.y : perc(copy.y, copyDelta.y);
				}
			},
			path: function(perc, start, delta, copy, copyDelta, add, obj) {
				obj.pathPlace = add(obj.pathPlace, obj.deltaPathPlace);
			},
			all: function(perc, start, delta, copy, copyDelta, add, obj) {
				if (obj.deltaPathPlace) {
					obj.pathPlace = add(obj.pathPlace, obj.deltaPathPlace);
				}
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
				}
				if (copyDelta.x) {
					copy.x = (copy.x.toFixed) ? copy.x + copyDelta.x : perc(copy.x, copyDelta.x);
				}
				if (copyDelta.y) {
					copy.y = (copy.y.toFixed) ? copy.y + copyDelta.y : perc(copy.y, copyDelta.y);
				}
			}
		};
		/**
Subtracts delta values from the start vector; subtracts sourceDelta values from the source vector; subtracts deltaPathPlace to pathPlace

Permitted argument values include 
* 'x' - delta.x subtracted from start.x; deltaSource.x subtracted from source.x
* 'y' - delta.y subtracted from start.y; deltaSource.y subtracted from source.y
* 'start', 'target' - delta subtracted from start
* 'source' - deltaSource subtracted from source
* 'path' - deltaPathPlace subtracted from pathPlace 
* undefined: all values are amended
@method Cell.revertStart
@param {String} [item] String used to limit this function's actions
@return This
@chainable
**/
		my.Cell.prototype.revertStart = function(item) {
			item = my.xtGet(item, 'all');
			this.revertStartActions[item](my.subtractPercentages, this.start, this.delta, this.copy, this.copyDelta, my.addWithinBounds, this);
			this.currentStart.flag = false;
			return this;
		};
		/**
revertStart helper object
@method Cell.revertStartActions
@private
**/
		my.Cell.prototype.revertStartActions = {
			x: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
				}
				if (copyDelta.x) {
					copy.x = (copy.x.toFixed) ? copy.x - copyDelta.x : perc(copy.x, copyDelta.x);
				}
			},
			y: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
				}
				if (copyDelta.y) {
					copy.y = (copy.y.toFixed) ? copy.y - copyDelta.y : perc(copy.y, copyDelta.y);
				}
			},
			start: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
				}
			},
			paste: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
				}
			},
			copy: function(perc, start, delta, copy, copyDelta, add) {
				if (copyDelta.x) {
					copy.x = (copy.x.toFixed) ? copy.x - copyDelta.x : perc(copy.x, copyDelta.x);
				}
				if (copyDelta.y) {
					copy.y = (copy.y.toFixed) ? copy.y - copyDelta.y : perc(copy.y, copyDelta.y);
				}
			},
			path: function(perc, start, delta, copy, copyDelta, add, obj) {
				obj.pathPlace = add(obj.pathPlace, -obj.deltaPathPlace);
			},
			all: function(perc, start, delta, copy, copyDelta, add, obj) {
				if (obj.deltaPathPlace) {
					obj.pathPlace = add(obj.pathPlace, -obj.deltaPathPlace);
				}
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
				}
				if (copyDelta.x) {
					copy.x = (copy.x.toFixed) ? copy.x - copyDelta.x : perc(copy.x, copyDelta.x);
				}
				if (copyDelta.y) {
					copy.y = (copy.y.toFixed) ? copy.y - copyDelta.y : perc(copy.y, copyDelta.y);
				}
			}
		};
		/**
Zooms one cell in relation to another cell
@method Cell.zoom
@param {Number} item Number of pixels to amend the zoomed cell's start and dimensions by
@return This
@chainable
**/
		my.Cell.prototype.zoom = function(item) {
			var sWidth,
				sHeight,
				aWidth,
				aHeight,
				minWidth,
				minHeight,
				maxWidth,
				maxHeight,
				sx,
				sy,
				myW,
				myH,
				myX,
				myY;
			if (item.toFixed) {
				sWidth = this.copyWidth;
				sHeight = this.copyHeight;
				aWidth = this.actualWidth;
				aHeight = this.actualHeight;
				minWidth = my.xtGet(this.copyMinWidth, this.copyWidth);
				minHeight = my.xtGet(this.copyMinHeight, this.copyHeight);
				maxWidth = my.xtGet(this.copyMaxWidth, this.copyWidth);
				maxHeight = my.xtGet(this.copyMaxHeight, this.copyHeight);
				sx = this.copy.x;
				sy = this.copy.y;
				myW = sWidth + item;
				myH = sHeight + item;
				if (my.isBetween(myW, minWidth, maxWidth, true) && my.isBetween(myH, minHeight, maxHeight, true)) {
					sWidth = myW;
					myX = sx - (item / 2);
					if (myX < 0) {
						sx = 0;
					}
					else if (myX > (aWidth - sWidth)) {
						sx = aWidth - sWidth;
					}
					else {
						sx = myX;
					}
					sHeight = myH;
					myY = sy - (item / 2);
					if (myY < 0) {
						sy = 0;
					}
					else if (myY > (aHeight - sHeight)) {
						sy = aHeight - sHeight;
					}
					else {
						sy = myY;
					}
					this.copy.x = sx;
					this.copy.y = sy;
					this.copyWidth = sWidth;
					this.copyHeight = sHeight;
				}
			}
			return this;
		};
		/**
Perform a splice-shift-join operation on the &lt;canvas&gt; element's current scene

Argument is an Object in the form:

* {edge:String, strip:Number}

Permitted values for the argument Object's attributes are:

* __edge__ - one from 'horizontal', 'vertical', 'top', 'bottom', 'left', 'right'
* __strip__ - a width/height Number (in pixels) of the strip that is to be moved from the named edge of the &lt;canvas&gt; to the opposite edge
* __shiftSource__ - boolean - when true, will automatically shift the sourceX and sourceY coordinates; default: false

_Note that this function is only effective in achieving a parallax effect if the user never clears or updates the cell's &lt;canvas&gt; element, and takes steps to shift the cell's source vector appropriately each time the splice operation is performed_

@method Cell.spliceCell
@param {Object} items Object containing data for the splice operation
@return This
@chainable
**/
		my.Cell.prototype.spliceCell = function(items) {
			var stat = ['horizontal', 'vertical', 'top', 'bottom', 'left', 'right'],
				myStrip,
				myRemains,
				myEdge,
				myShift,
				height,
				width,
				ctx,
				c,
				cv = my.work.cv,
				cvx = my.work.cvx;
			items = my.safeObject(items);
			if (my.contains(stat, items.edge)) {
				myShift = my.xtGet(items.shiftCopy, false);
				height = this.actualHeight;
				width = this.actualWidth;
				ctx = my.context[this.name];
				c = my.canvas[this.name];
				cv.width = width;
				cv.height = height;
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				switch (items.edge) {
					case 'horizontal':
						myRemains = width / 2;
						myStrip = myRemains;
						myEdge = 'left';
						break;
					case 'vertical':
						myRemains = height / 2;
						myStrip = myRemains;
						myEdge = 'top';
						break;
					case 'top':
					case 'bottom':
						myStrip = my.xtGet(items.strip, 20);
						myRemains = height - myStrip;
						myEdge = items.edge;
						break;
					case 'left':
					case 'right':
						myStrip = my.xtGet(items.strip, 20);
						myRemains = width - myStrip;
						myEdge = items.edge;
						break;
				}
				switch (myEdge) {
					case 'top':
						cvx.drawImage(c, 0, 0, width, myStrip, 0, myRemains, width, myStrip);
						cvx.drawImage(c, 0, myStrip, width, myRemains, 0, 0, width, myRemains);
						this.copy.y -= (myShift) ? myStrip : 0;
						break;
					case 'bottom':
						cvx.drawImage(c, 0, 0, width, myRemains, 0, myStrip, width, myRemains);
						cvx.drawImage(c, 0, myRemains, width, myStrip, 0, 0, width, myStrip);
						this.copy.y += (myShift) ? myStrip : 0;
						break;
					case 'left':
						cvx.drawImage(c, 0, 0, myStrip, height, myRemains, 0, myStrip, height);
						cvx.drawImage(c, myStrip, 0, myRemains, height, 0, 0, myRemains, height);
						this.copy.x -= (myShift) ? myStrip : 0;
						break;
					case 'right':
						cvx.drawImage(c, 0, 0, myRemains, height, myStrip, 0, myRemains, height);
						cvx.drawImage(c, myRemains, 0, myStrip, height, 0, 0, myStrip, height);
						this.copy.x += (myShift) ? myStrip : 0;
						break;
				}
				ctx.clearRect(0, 0, width, height);
				ctx.drawImage(cv, 0, 0, width, height);
				if (myShift) {
					this.setCopy();
				}
			}
			return this;
		};
		/**
Ask all entitys in the Group to perform an updateStart() operation

Each entity will add their delta values to their start Vector, and/or add deltaPathPlace from pathPlace
@method Group.updateStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
		my.Group.prototype.updateStart = function(item) {
			var entitys = this.entitys,
				e = my.entity;
			for (var i = 0, iz = entitys.length; i < iz; i++) {
				e[entitys[i]].updateStart(item);
			}
			return this;
		};
		/**
Ask all entitys in the Group to perform a revertStart() operation

Each entity will subtract their delta values to their start Vector, and/or subtract deltaPathPlace from pathPlace
@method Group.revertStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
		my.Group.prototype.revertStart = function(item) {
			var entitys = this.entitys,
				e = my.entity;
			for (var i = 0, iz = entitys.length; i < iz; i++) {
				e[entitys[i]].revertStart(item);
			}
			return this;
		};
		/**
Ask all entitys in the group to perform a reverse() operation

Each entity will change the sign (+/-) of specified attribute values
@method Group.reverse
@param {String} [item] String used to limit this function's actions - permitted values include 'deltaX', 'deltaY', 'delta', 'deltaPathPlace'; default action: all values are amended
@return This
@chainable
**/
		my.Group.prototype.reverse = function(item) {
			var entitys = this.entitys,
				e = my.entity;
			for (var i = 0, iz = entitys.length; i < iz; i++) {
				e[entitys[i]].reverse(item);
			}
			return this;
		};
		/**
A value for shifting the color stops (was __roll__ in versions prior to v4.0)
@property shift
@type Number
@default 0
**/
		my.work.d.Design.shift = 0;
		/**
A flag to indicate that stop color shifts should be automatically applied
@property autoUpdate
@type Boolean
@default false
**/
		my.work.d.Design.autoUpdate = false;
		my.mergeInto(my.work.d.Gradient, my.work.d.Design);
		my.mergeInto(my.work.d.RadialGradient, my.work.d.Design);
		if (my.xt(my.work.d.Pattern)) {
			my.mergeInto(my.work.d.Pattern, my.work.d.Design);
		}
		/**
Creates the gradient

_This function replaces the one in the core module_
@method Design.update
@param {String} [entity] SPRITENAME String
@param {String} [cell] CELLNAME String
@return This
@chainable
**/
		my.Design.prototype.update = function(entity, cell) {
			this.makeGradient(entity, cell);
			this.sortStops();
			this.applyStops();
			return this;
		};
		/**
Gradient builder helper function - sorts color attribute Objects by their stop attribute values, after adding the roll value to them
@method Design.sortStops
@return Nothing
@private
**/
		my.Design.prototype.sortStops = function() {
			var color,
				shift,
				i,
				iz;
			color = this.get('color');
			shift = this.get('shift');
			for (i = 0, iz = color.length; i < iz; i++) {
				color[i].stop += shift;
				if (!my.isBetween(color[i].stop, 0, 1, true)) {
					color[i].stop = (color[i].stop > 0.5) ? color[i].stop - 1 : color[i].stop + 1;
				}
				if (color[i].stop <= 0) {
					color[i].stop = 0.000001;
				}
				else if (color[i].stop >= 1) {
					color[i].stop = 0.999999;
				}
			}
			color.sort(function(a, b) {
				return a.stop - b.stop;
			});
			this.color = color;
		};
		/**
A __factory__ function to generate new Ticker objects
@method makeTicker
@param {Object} items Key:value Object argument for setting attributes
@return Ticker object
**/
		my.makeTicker = function(items) {
			return new my.Ticker(items);
		};
		/**
Alias for makeTween()
@method newTween
@deprecated
**/
		my.newTween = function(items) {
			return my.makeTween(items);
		};
		/**
A __factory__ function to generate new Tween objects
@method makeTween
@param {Object} items Key:value Object argument for setting attributes
@return Tween object
**/
		my.makeTween = function(items) {
			return new my.Tween(items);
		};
		/**
Alias for makeAction()
@method newAction
@deprecated
**/
		my.newAction = function(items) {
			return my.makeAction(items);
		};
		/**
A __factory__ function to generate new Action objects
@method makeAction
@param {Object} items Key:value Object argument for setting attributes
@return Action object
**/
		my.makeAction = function(items) {
			return new my.Action(items);
		};
		/**
Locate a target object
@method locateTarget
@param {String} OBJECTNAME string of required target
@private
@return target Object; false if not found
**/
		my.locateTarget = function(item) {
			var sections = ['entity', 'cell', 'pad', 'stack', 'element', 'point', 'group', 'design', 'animation', 'tween', 'anim', 'filter', 'image', 'force', 'spring', 'physics'],
				section, name, j, jz,
				contains = my.contains,
				xt = my.xt;
			if (my.xt(item) && item.substring) {
				for (j = 0, jz = sections.length; j < jz; j++) {
					section = sections[j];
					name = section + 'names';
					if (xt(my[name]) && my[name].indexOf(item) >= 0) {
						return my[section][item];
					}
				}
			}
			return false;
		};
		/**
# Ticker

## Instantiation

* scrawl.makeTicker()

## Purpose

* Defines a linear time sequence to which tweens and other actions can subscribe

## Access

* scrawl.animation.TICKERNAME - for the Ticker object

## Ticker functions

* Start a Ticker from 0 by calling the __run()__ function on it.
* Tickers can be stopped by calling the __halt()__ function on it.
* Start a Ticker from the point at which it was previously halted by calling the __resume()__ function on it.
* A Ticker can have its current tick amended by calling the __seekTo()__ function on it.
* A Ticker can be deleted by calling the __kill()__ function on it.

@class Ticker
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Ticker = function(items) {
			var xtGet = my.xtGet,
				temp;
			my.Base.call(this, items);
			items = my.safeObject(items);
			this.order = xtGet(items.order, 0);
			this.subscribers = [];
			this.duration = xtGet(items.duration, 0);
			this.eventChoke = xtGet(items.eventChoke, 0);
			this.killOnComplete = xtGet(items.killOnComplete, false);
			this.cycles = xtGet(items.cycles, 1);
			this.cycleCount = 0;
			this.active = false;
			this.effectiveDuration = 0;
			this.startTime = 0;
			this.currentTime = 0;
			this.tick = 0;
			this.lastEvent = 0;
			if (items.subscribers) {
				this.subscribe(items.subscribers);
			}
			this.setEffectiveDuration();
			my.animation[this.name] = this;
			my.pushUnique(my.animationnames, this.name);
			return this;
		};
		my.Ticker.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Ticker'
@final
**/
		my.Ticker.prototype.type = 'Ticker';
		my.Ticker.prototype.classname = 'animationnames';
		my.work.d.Ticker = {
			/**
Animation order

Objects in the animation loop are sorted by their order values, and run as part of the animation loop from lowest to highest order value. There is no guarantee in which order objects with the same order value will run during each animation loop
@property order
@type Number
@default 0
**/
			order: 0,
			/**
Ticker length, in milliseconds

If no duration is set, Ticker will set the last subscribed object's end time as its effective duration
@property duration
@type Number
@default 0
**/
			duration: 0,
			/**
Array of String names of tween and action subscribers to this Ticker

@property subscribers
@type Array
@default []
**/
			subscribers: [],
			/**
When set to true, Ticker will delete itself and any associated tweens from the scrawl library

@property killOnComplete
@type Boolean
@default false
**/
			killOnComplete: false,
			/**
Number of times to cycle the ticker:

* 0 - the ticker will repeat until stopped
* > 0 - the ticker will repeat the given number of cycles, then stop

Default action is to run the ticker once, then stop it

@property cycles
@type Number
@default 1
**/
			cycles: 1,
			/**
Event choke value

A ticker will trigger a __timeupdate__ event on the document object as it runs, with details of the ticker's current state including:

* __name__
* __tick__ (milliseconds)

If the eventChoke attribute is set to 0 (default), no tickerupdate events are fired as the ticker runs - thus this value needs to be set explicitly to make the Ticker emit events. Otherwise, this value represents the time between each event emission

@property eventChoke
@type Number
@default 0
**/
			eventChoke: 0
		};
		my.mergeInto(my.work.d.Ticker, my.work.d.Base);
		/**
Make a new tickerupdate customEvent object
@method makeTickerUpdateEvent
@return customEvent object, or null if browser does not support custom events
**/
		my.Ticker.prototype.makeTickerUpdateEvent = function() {
			var e = null,
				data = {
					name: this.name,
					type: 'Ticker',
					tick: this.tick,
					reverseTick: this.effectiveDuration - this.tick
				};
			if (window.MSInputMethodContext) {
				//do IE9-11 stuff
				e = document.createEvent('CustomEvent');
				e.initCustomEvent("tickerupdate", true, true, data);
			}
			else {
				if (window.CustomEvent) {
					e = new CustomEvent('tickerupdate', {
						detail: data,
						bubbles: true,
						cancelable: true
					});
				}
			}
			return e;
		};
		/**
Add a Tween or Action's name to the Ticker's .subscribers array

@method subscribe
@param {Array} [items] Array containing String name values, or Objects with a .name attribute; alternatively can be a single String or Object
@chainable
@return this
**/
		my.Ticker.prototype.subscribe = function(items) {
			var myItems = [].concat(items),
				i, iz,
				item, safeItem, name,
				pu = my.pushUnique,
				so = my.safeObject;
			for (i = 0, iz = myItems.length; i < iz; i++) {
				item = myItems[i];
				if (item.substring) {
					name = item;
				}
				else {
					safeItem = so(item);
					name = safeItem.name || false;
				}
				if (name) {
					pu(this.subscribers, name);
				}
			}
			if (myItems.length) {
				this.sortSubscribers();
				this.recalculateEffectiveDuration();
			}
			return this;
		};
		/**
Remove a Tween or Action's name from the Ticker's .subscribers array

@method unsubscribe
@param {Array} [items] Array containing String name values, or Tween/Action Objects with a .name attribute; alternatively can be a single String or Object
@chainable
@return this
**/
		my.Ticker.prototype.unsubscribe = function(items) {
			var myItems = [].concat(items),
				i, iz,
				item, safeItem, name,
				ri = my.removeItem,
				so = my.safeObject;
			for (i = 0, iz = myItems.length; i < iz; i++) {
				item = items[i];
				if (item.substring) {
					name = item;
				}
				else {
					safeItem = so(item);
					name = safeItem.name || false;
				}
				if (name) {
					ri(this.subscribers, name);
				}
			}
			if (myItems.length) {
				this.sortSubscribers();
				this.recalculateEffectiveDuration();
			}
			return this;
		};
		/**
Recalculate the ticker's effective duration

@method recalculateEffectiveDuration
@chainable
@private
@return this
**/
		my.Ticker.prototype.recalculateEffectiveDuration = function() {
			var i, iz, obj, durationValue, duration = 0,
				t = my.tween;
			if (!this.duration) {
				for (i = 0, iz = this.subscribers.length; i < iz; i++) {
					obj = t[this.subscribers[i]];
					durationValue = obj.getEndTime();
					if (durationValue > duration) {
						duration = durationValue;
					}
				}
				this.effectiveDuration = duration;
			}
			else {
				this.setEffectiveDuration(); // shouldn't cause an infinite loop ...
			}
			return this;
		};
		/**
Set the ticker's effective duration from this.duration

@method setEffectiveDuration
@chainable
@private
@return this
**/
		my.Ticker.prototype.setEffectiveDuration = function() {
			var temp;
			if (this.duration) {
				temp = my.convertTime(this.duration);
				if (temp[0] === '%') {
					// cannot use percentage values for ticker durations
					this.duration = 0
					this.recalculateEffectiveDuration();
				}
				else {
					this.effectiveDuration = temp[1];
				}
			}
			return this;
		};
		/**
Order subscriber tweens by their time attributes, lowest to highest

@method sortSubscribers
@chainable
@private
@return this
**/
		my.Ticker.prototype.sortSubscribers = function() {
			my.bucketSort('tween', 'effectiveTime', this.subscribers);
		};
		/**
Set attributes - restricted so that only subscribers, order, duration and cycles attributes can be amended

@method set
@param {Object} [items] Object containing key:value parameters for updating
@chainable
@return this
**/
		my.Ticker.prototype.set = function(items) {
			items = my.safeObject(items);
			var xt = my.xt,
				i, iz, obj;
			if (xt(items.order)) {
				this.order = items.order;
				if (this.active) {
					my.work.resortAnimations = true;
				}
			}
			if (xt(items.cycles)) {
				this.cycles = items.cycles;
				if (!this.cycles) {
					this.cycleCount = 0;
				}
			}
			if (xt(items.subscribers)) {
				this.subscribers = [];
				this.subscribe(items.subscribers);
			}
			if (xt(items.duration)) {
				this.duration = items.duration;
				this.setEffectiveDuration();
				for (i = 0, iz = this.subscribers.length; i < iz; i++) {
					obj = my.tween[this.subscribers[i]];
					obj.calculateEffectiveTime();
					if (obj.type === 'Tween') {
						obj.calculateEffectiveDuration();
					}
				}
			}
			if (xt(items.killOnComplete)) {
				this.killOnComplete = items.killOnComplete;
			}
			if (xt(items.eventChoke)) {
				this.eventChoke = items.eventChoke;
			}
			return this;
		};
		/**
Animation function

@method fn
@chainable
@param {Boolean} [reverseOrder] when true, perform update from last subscriber to first; default false
@private
@return this
**/
		my.Ticker.prototype.fn = function(reverseOrder) {
			var i, iz, subs, sub, eTime, now, e,
				t = my.tween,
				result = {
					tick: 0,
					reverseTick: 0,
					willLoop: false,
					next: false
				};
			reverseOrder = my.xt(reverseOrder) ? reverseOrder : false;
			if (this.active && this.startTime) {
				if (!this.cycles || this.cycleCount < this.cycles) {
					this.currentTime = Date.now();
					this.tick = this.currentTime - this.startTime;
					if (!this.cycles || this.cycleCount + 1 < this.cycles) {
						if (this.tick >= this.effectiveDuration) {
							this.tick = 0;
							this.startTime = this.currentTime;
							result.tick = this.effectiveDuration;
							result.reverseTick = 0;
							result.willLoop = true;
							if (this.cycles) {
								this.cycleCount++;
							}
						}
						else {
							result.tick = this.tick;
							result.reverseTick = this.effectiveDuration - this.tick;
						}
						result.next = true;
					}
					else {
						if (this.tick >= this.effectiveDuration) {
							result.tick = this.effectiveDuration;
							result.reverseTick = 0;
							this.active = false;
							if (this.cycles) {
								this.cycleCount++;
							}
						}
						else {
							result.tick = this.tick;
							result.reverseTick = this.effectiveDuration - this.tick;
							result.next = true;
						}
					}
					subs = [].concat(this.subscribers);
					if (reverseOrder) {
						subs.reverse();
					}
					for (i = 0, iz = subs.length; i < iz; i++) {
						sub = t[subs[i]];
						sub.update(result);
					}
					// need to add in here code for triggering makeTickerUpdateEvent calls
					if (this.eventChoke) {
						eTime = this.lastEvent + this.eventChoke;
						now = Date.now();
						if (eTime < now) {
							e = this.makeTickerUpdateEvent();
							window.dispatchEvent(e);
							this.lastEvent = now;
						}
					}
					if (!this.active) {
						this.halt();
					}
					if (this.killOnComplete && this.cycleCount >= this.cycles) {
						this.killTweens(true);
					}
				}
			}
			return this;
		};

		/**
Change the supplied attributes for each subscribed tween and action

@method updateSubscribers
@param {Object} items Object containing key:value parameters for updating
@param {Boolean} [reversed] when true, perform update from last subscriber to first; default false
@chainable
@private
@return this
**/
		my.Ticker.prototype.updateSubscribers = function(items, reversed) {
			var subs = [].concat(this.subscribers);
			reversed = (my.xt(reversed)) ? reversed : false
			if (reversed) {
				subs.reverse();
			}
			for (var i = 0, iz = subs.length; i < iz; i++) {
				scrawl.tween[subs[i]].set(items);
			}
			return this;
		};
		/**
Bulk-change the playing direction for all subscribed tweens and actions

@method changeSubscriberDirection
@chainable
@private
@return this
**/
		my.Ticker.prototype.changeSubscriberDirection = function() {
			var subs = [].concat(this.subscribers),
				sub;
			for (var i = 0, iz = subs.length; i < iz; i++) {
				sub = scrawl.tween[subs[i]];
				sub.reversed = !sub.reversed;
			}
			return this;
		};
		/**
Start ticker from 0

@method run
@chainable
@return this
**/
		my.Ticker.prototype.run = function() {
			if (!this.active) {
				this.startTime = this.currentTime = Date.now();
				this.cycleCount = 0;
				this.updateSubscribers({
					reversed: false
				});
				this.active = true;
				this.fn(true);
				my.pushUnique(my.work.animate, this.name);
				my.work.resortAnimations = true;
			}
			return this;
		};
		/**
Reset ticker to initial conditions

@method reset
@chainable
@return this
**/
		my.Ticker.prototype.reset = function() {
			if (this.active) {
				this.halt();
			}
			this.startTime = this.currentTime = Date.now();
			this.cycleCount = 0;
			this.updateSubscribers({
				reversed: false
			});
			this.active = true;
			this.fn(true);
			this.active = false;
			return this;
		};
		/**
Reset ticker to final conditions

@method complete
@chainable
@return this
**/
		my.Ticker.prototype.complete = function() {
			if (this.active) {
				this.halt();
			}
			this.startTime = this.currentTime = Date.now();
			this.cycleCount = 0;
			this.updateSubscribers({
				reversed: true
			});
			this.active = true;
			this.fn();
			this.active = false;
			return this;
		};
		/**
Reverse tracker direction and continue playing

@method reverse
@chainable
@return this
**/
		my.Ticker.prototype.reverse = function() {
			var timePlayed;
			if (this.active) {
				this.halt();
			}
			timePlayed = this.currentTime - this.startTime;
			this.startTime = this.currentTime - (this.effectiveDuration - timePlayed);
			this.changeSubscriberDirection();
			this.active = true;
			this.fn();
			this.active = false;
			return this;
		};
		/**
Halt ticker

@method halt
@chainable
@return this
**/
		my.Ticker.prototype.halt = function() {
			this.active = false;
			my.removeItem(my.work.animate, this.name);
			my.work.resortAnimations = true;
			return this;
		};
		/**
Resume ticker

@method resume
@chainable
@return this
**/
		my.Ticker.prototype.resume = function() {
			var now, current, start;
			if (!this.active) {
				now = Date.now(),
				current = this.currentTime,
				start = this.startTime;
				this.startTime = now - (current - start);
				this.currentTime = now;
				this.active = true;
				my.pushUnique(my.work.animate, this.name);
				my.work.resortAnimations = true;
			}
			return this;
		};
		/**
seekTo a different specific point on the ticker

@method seekTo
@param {Number} seekto time in milliseconds from start of ticker; default 0 - effectively sets ticker back to starting conditions
@param {Boolean} [resume] - flag - when true, the resume() function will trigger; false (default) triggers a single call to the fn() function
@chainable
@return this
**/
		my.Ticker.prototype.seekTo = function(milliseconds, resume) {
			var xtGet = my.xtGet,
				backwards = false;
			milliseconds = xtGet(milliseconds, 0);
			resume = xtGet(resume, false);
			if (this.active) {
				this.halt();
			}
			if (this.cycles && this.cycleCount >= this.cycles) {
				this.cycleCount = this.cycles - 1;
			}
			if (milliseconds < this.tick) {
				backwards = true;
			}
			this.currentTime = Date.now();
			this.startTime = this.currentTime - milliseconds;
			this.active = true;
			this.fn(backwards);
			this.active = false;
			if (resume) {
				this.resume();
			}
			return this;
		};
		/**
seekFor a different relative point on the ticker

@method seekFor
@param {Number} seekfor time in milliseconds from current tick; default 0 - no change
@param {Boolean} [resume] - flag - when true, the resume() function will trigger; false (default) triggers a single call to the fn() function
@chainable
@return this
**/
		my.Ticker.prototype.seekFor = function(milliseconds, resume) {
			var xtGet = my.xtGet,
				backwards = false;
			milliseconds = xtGet(milliseconds, 0);
			milliseconds = xtGet(resume, false);
			if (this.active) {
				this.halt();
			}
			if (this.cycles && this.cycleCount >= this.cycles) {
				this.cycleCount = this.cycles - 1;
			}
			this.startTime -= milliseconds;
			if (milliseconds < 0) {
				backwards = true;
			}
			this.active = true;
			this.fn(backwards);
			this.active = false;
			if (resume) {
				this.resume();
			}
			return this;
		};
		/**
Remove this Ticker from the scrawl library
@method kill
@return Always true
**/
		my.Ticker.prototype.kill = function() {
			if (this.active) {
				this.halt();
			}
			delete my.animation[this.name];
			my.removeItem(my.animationnames, this.name);
			my.removeItem(my.work.animate, this.name);
			my.work.resortAnimations = true;
			return true;
		};
		/**
Remove this Ticker from the scrawl library (if argument is true), alongside any tweens associated with it
@method killTweens
@return true if argument is true; this otherwise (default)
**/
		my.Ticker.prototype.killTweens = function(autokill) {
			var i, iz, sub,
				t = my.tween,
				autokill = (my.xt(autokill)) ? autokill : false;
			for (i = 0, iz = this.subscribers.length; i < iz; i++) {
				sub = t[this.subscribers[i]];
				sub.kill();
			}
			if (autokill) {
				this.kill();
				return true;
			}
			return this;
		};
		/**
# Action

## Instantiation

* scrawl.makeAction()

## Purpose

* Defines a reversible function which can subscribe to a ticker so that it gets invoked at a particular moment after the ticker starts to run

Actions only really make sense when they are associated with a Ticker object. They have no duration as such (unless their action/revert functions include asynchronous activities, in which case - you're on your own!). The action() function should define a set of near-instant actions; the revert() function should mirror the action, to allow the Action object to be reversible.

Action and revert functions are not expected to take any arguments - they are expected to act on the objects assigned to their __targets__ Array

To access the Action functions directly, assign it to a variable, or call it from the library: 

* scrawl.tween[ACTIONNAME].action()
* scrawl.tween[ACTIONNAME].revert()

## Access

* scrawl.tween.ACTIONNAME - for the Action object

## Action functions

* An Action can be invoked by calling its __action()__ function.
* An Action can be reversed by calling its __revert()__ function.
* An Action can be deleted by calling the __kill()__ function on it.

@class Action
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Action = function(items) {
			var xtGet = my.xtGet;
			my.Base.call(this, items);
			items = my.safeObject(items);
			if (my.xt(items.targets)) {
				this.setTargets(items.targets);
			}
			else {
				this.targets = [];
			}
			this.reverseOnCycleEnd = xtGet(items.reverseOnCycleEnd, false);
			this.reversed = xtGet(items.reversed, false);
			this.action = (typeof items.action === 'function') ? items.action : function() {};
			this.revert = (typeof items.revert === 'function') ? items.revert : function() {};
			this.time = xtGet(items.time, 0);
			this.order = xtGet(items.order, 0);
			this.triggered = false;
			this.calculateEffectiveTime();
			my.tween[this.name] = this;
			my.pushUnique(my.tweennames, this.name);
			this.ticker = '';
			if (my.xt(items.ticker)) {
				this.addToTicker(items.ticker);
			}
			return this;
		};
		my.Action.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Action'
@final
**/
		my.Action.prototype.type = 'Action';
		my.Action.prototype.classname = 'tweennames';
		my.work.d.Action = {
			/**
Ticker name
If an Action object is associated with a ticker, it will fire (or revert) at the appropriate point in the course of the ticker's run.
@property ticker
@type String
@default ''
**/
			ticker: '',
			/**
Array of Objects on which this Action will perform its action and revert functions; if the array includes Strings, the constructor, set and clone functions will search for the Objects in the Scrawl library, checking sections (if they currently exist) in the following order: 

* entity, cell, pad, stack, element, point, group, design, animation, tween, anim, filter, image, force, spring, physics

This attribute can also accept a single Object or String as its value in the 

@property targets
@type Array
@default []
**/
			targets: [],
			/**
Action function
@property action
@type Function
@default function(){}
**/
			action: function() {},
			/**
Revert function - should reverse the actions of the .action function
@property revert
@type Function
@default function(){}
**/
			revert: function() {},
			/**
Time - point (in milliseconds) following the start of the Action's ticker when the action function will trigger
@property time
@type Number
@default 0
**/
			time: 0,
			/**
Reversable flag - when true, the action will alternate the tick and reverseTick values as the ticker cycles
@property reverseOnCycleEnd
@type Boolean
@default false
**/
			reverseOnCycleEnd: false,
			/**
Reversed - when true, the action is using reverseTick value
@property reversed
@type Boolean
@default false
**/
			reversed: false,
			/**
Sort order - for Actions that share the same time value on a given Ticker. Without a sort order, there will be no guarantee which actions with the same time value will be performed first
@property order
@type Number
@default 0
**/
			order: 0
		};
		my.mergeInto(my.work.d.Action, my.work.d.Base);
		/**
Get the effective (millisecond number) time when action will trigger
@method calculateEffectiveTime
@param {String} [item] new time value; defaults to this.time
@chainable
@private
@return this
**/
		my.Action.prototype.calculateEffectiveTime = function(item) {
			var time = my.xtGet(item, this.time),
				calculatedTime = my.convertTime(time),
				cTime = calculatedTime[1],
				cType = calculatedTime[0],
				ticker, tickerDuration = 0;
			this.effectiveTime = 0;
			if (cType === '%' && cTime <= 100) {
				if (this.ticker) {
					ticker = my.animation[this.ticker];
					if (ticker) {
						tickerDuration = ticker.effectiveDuration;
						this.effectiveTime = tickerDuration * (cTime / 100);
					}
				}
			}
			else {
				this.effectiveTime = cTime;
			}
			return this;
		};
		/**
Add action to given ticker

If action is already subscribed to a different ticker, the function will automatically unsubscribe from that ticker before subscribing to the new ticker
@method addToTicker
@param {String} item TICKERNAME to which this Action will subscribe  
@chainable
@return this
**/
		my.Action.prototype.addToTicker = function(item) {
			var xt = my.xt,
				tick;
			if (xt(item)) {
				if (this.ticker && this.ticker !== item) {
					this.removeFromTicker(this.ticker);
				}
				tick = my.animation[item];
				if (xt(tick)) {
					this.ticker = item;
					tick.subscribe(this.name);
					this.calculateEffectiveTime();
				}
			}
			return this;
		};
		/**
Remove action from given ticker
@method removeFromTicker
@param {String} item TICKERNAME to which this Action will unsubscribe  
@chainable
@return this
**/
		my.Action.prototype.removeFromTicker = function(item) {
			var xt = my.xt,
				tick;
			if (xt(item)) {
				tick = my.animation[item];
				if (xt(tick)) {
					this.ticker = '';
					tick.unsubscribe(this.name);
				}
			}
			return this;
		};
		/**
retrieve the completion time for the action
@method getEndTime
@private
@return Number
**/
		my.Action.prototype.getEndTime = function() {
			return this.effectiveTime;
		};
		/**
Investigate the data supplied by the ticker and, if necessary, invoke the action or revert functions, as appropriate

The object passed by the ticker has the following attributes:

* tick - milliseconds since ticker started its run
* reverseTick - milliseconds before ticker reaches the end of its run
* willLoop - boolean indicating whether ticker is about to restart
* next - boolean indicating whether this is the ticker's last update

@method update
@param {Object} items Object sent by ticker  
@private
@return always true
**/
		my.Action.prototype.update = function(items) {
			if (this.reversed) {
				if (items.reverseTick >= this.effectiveTime) {
					if (!this.triggered) {
						this.action();
						this.triggered = true;
					}
				}
				else {
					if (this.triggered) {
						this.revert();
						this.triggered = false;
					}
				}
			}
			else {
				if (items.tick >= this.effectiveTime) {
					if (!this.triggered) {
						this.action();
						this.triggered = true;
					}
				}
				else {
					if (this.triggered) {
						this.revert();
						this.triggered = false;
					}
				}
			}
			if (this.reverseOnCycleEnd && items.willLoop) {
				if (items.next) {
					this.reversed = !this.reversed;
				}
				else {
					this.reversed = false;
					this.triggered = false;
				}
			}
			return true;
		};
		/**
Set attributes
@method set
@param {Object} Object containing key:value attributes
@chainable
@return this
**/
		my.Action.prototype.set = function(items) {
			var xt = my.xt,
				ticker;
			items = my.safeObject(items);
			ticker = (xt(items.ticker)) ? this.ticker : false;
			// if either ticker or time change, then this.effectiveTime will need recalculation
			if (ticker) {
				this.ticker = ticker;
				this.addToTicker(items.ticker);
			}
			else if (xt(items.time)) {
				this.time = items.time;
				this.calculateEffectiveTime();
			}
			if (xt(items.targets)) {
				this.setTargets(items.targets);
			}
			if (my.xto(items.reverseOnCycleEnd, items.reversed, items.order)) {
				if (xt(items.reverseOnCycleEnd)) {
					this.reverseOnCycleEnd = items.reverseOnCycleEnd;
				}
				if (xt(items.reversed)) {
					this.reversed = items.reversed;
				}
				if (xt(items.order)) {
					this.order = items.order;
				}
			}
			if (xt(items.triggered) && this.triggered !== items.triggered) {
				if (items.triggered) {
					this.action();
				}
				else {
					this.revert();
				}
				this.triggered = items.triggered;
			}
			if (xt(items.action)) {
				this.action = items.action;
				if (typeof this.action !== 'function') {
					this.action = function() {};
				}
			}
			if (xt(items.revert)) {
				this.revert = items.revert;
				if (typeof this.revert !== 'function') {
					this.revert = function() {};
				}
			}
			return this;
		};
		/**
Set targets attribute - assumes that the supplied Array will replace, not amend, any existing targets array
@method setTargets
@param {Array} items Array of Objects and/or Strings, can also be single Object or string
@chainable
@private
@return this
**/
		my.Action.prototype.setTargets = function(items) {
			items = [].concat(items);
			var newTargets = [],
				item, i, iz, result;
			for (i = 0, iz = items.length; i < iz; i++) {
				item = items[i];
				if (typeof item === 'function') {
					if (typeof item.set === 'function') {
						newTargets.push(item);
					}
				}
				else if (typeof item === 'object' && my.xt(item.name)) {
					newTargets.push(item);
				}
				else {
					result = my.locateTarget(item);
					if (result) {
						newTargets.push(result);
					}
				}
			}
			this.targets = newTargets;
			return this;
		};
		/**
Add Objects to targets attribute - assumes that the supplied Array will augment any existing targets array
@method addToTargets
@param {Array} items Array of Objects and/or Strings, can also be single Object or string
@chainable
@return this
**/
		my.Action.prototype.addToTargets = function(items) {
			items = [].concat(items);
			var item, i, iz, result;
			for (i = 0, iz = items.length; i < iz; i++) {
				item = items[i];
				if (typeof item === 'function') {
					if (typeof item.set === 'function') {
						this.targets.push(item);
					}
				}
				else {
					result = my.locateTarget(item);
					if (result) {
						this.targets.push(result);
					}
				}
			}
			return this;
		};
		/**
Remove Objects from targets attribute - will not remove an object with no name and/or type attributes
@method removeFromTargets
@param {Array} items Array of Objects and/or Strings, can also be single Object or string
@chainable
@return this
**/
		my.Action.prototype.removeFromTargets = function(items) {
			items = [].concat(items);
			var item, i, iz, j, jz, k, kz,
				t, type, name, doRemove, obj, objName,
				identifiers = [],
				newTargets = [].concat(this.targets),
				contains = my.contains;
			for (j = 0, jz = newTargets.length; j < jz; j++) {
				t = newTargets[j];
				type = t.type || 'unknown';
				name = t.name || 'unnamed';
				if (type !== 'unknown' && name !== 'unnamed') {
					identifiers.push(type + '_' + name);
				}
			}
			for (i = 0, iz = items.length; i < iz; i++) {
				item = items[i];
				obj = false;
				if (typeof item === 'function') {
					obj = item;
				}
				else {
					// obj = this.locateTarget(item);
					obj = my.locateTarget(item);
				}
				if (obj) {
					type = obj.type || 'unknown';
					name = obj.name || 'unnamed';
					if (type !== 'unknown' && name !== 'unnamed') {
						objName = type + '_' + name;
						doRemove = identifiers.indexOf(objName);
						if (doRemove >= 0) {
							newTargets[doRemove] = false;
						}
					}
				}
			}
			this.targets = [];
			for (k = 0, kz = newTargets; k < kz; k++) {
				if (newTargets[k]) {
					this.targets.push(newTargets[k]);
				}
			}
			return this;
		};
		/**
Create a clone of this Action

Note: strongly advise every call to this function includes newly created anonymous functions for the action and revert attributes in the argument object - Scrawl's clone functionality does not clone function attributes!

@method clone
@param {Object} Object containing key:value attributes
@chainable
@return a new copy of the Action object
**/
		my.Action.prototype.clone = function(items) {
			items = my.safeObject(items);
			var c, xt = my.xt;
			c = my.Base.prototype.clone.call(this, items);
			if (xt(items.targets)) {
				c.setTargets(items.targets);
			}
			else {
				c.targets = [].concat(this.targets);
			}
			c.reverseOnCycleEnd = (xt(items.reverseOnCycleEnd)) ? items.reverseOnCycleEnd : this.reverseOnCycleEnd;
			c.revert = (xt(items.revert)) ? items.revert : this.revert;
			c.action = (xt(items.action)) ? items.action : this.action;
			c.revert = (xt(items.revert)) ? items.revert : this.revert;
			c.time = (xt(items.time)) ? items.time : this.time;
			c.order = (xt(items.order)) ? items.order : this.order;
			c.triggered = false;
			c.calculateEffectiveTime();
			return c;
		};
		/**
Remove this Action from the scrawl library
@method kill
@return Always true
**/
		my.Action.prototype.kill = function() {
			if (this.ticker) {
				this.removeFromTicker(this.ticker);
			}
			delete my.tween[this.name];
			my.removeItem(my.tweennames, this.name);
			return true;
		};
		/**
Update target attributes
@method updateTargets
@param {Object} items - containing key:value attributes to be forwarded to target set() functions
@chainable
@return this
**/
		my.Action.prototype.updateTargets = function(items) {
			for (var i = 0, iz = this.targets.length; i < iz; i++) {
				this.targets[i].set(items);
			}
			return this;
		};
		/**
# Tween

## Instantiation

* scrawl.makeTween()

## Purpose

* Defines a set of attribute update definitions for objects

## Access

* scrawl.tween.TWEENNAME - for the Tween object

## Tween functions

* A Tween can be deleted by calling the __kill()__ function on it.

@class Tween
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Tween = function(items) {
			var xtGet = my.xtGet,
				xt = my.xt,
				tickerName;
			my.Base.call(this, items);
			items = my.safeObject(items);
			this.ticker = xtGet(items.ticker, '');
			if (my.xt(items.targets)) {
				this.setTargets(items.targets);
			}
			else {
				this.targets = [];
			}
			this.definitions = xt(items.definitions) ? [].concat(items.definitions) : [];
			this.setDefinitionsValues();
			this.time = xtGet(items.time, 0);
			this.duration = xtGet(items.duration, 0);
			this.reverseOnCycleEnd = xtGet(items.reverseOnCycleEnd, false);
			this.reversed = xtGet(items.reversed, false);
			this.order = xtGet(items.order, 0);
			this.action = (xt(items.action)) ? items.action : false;
			this.status = 'before';
			this.calculateEffectiveTime();
			this.calculateEffectiveDuration();
			my.tween[this.name] = this;
			my.pushUnique(my.tweennames, this.name);
			this.ticker = '';
			if (my.xt(items.ticker)) {
				this.addToTicker(items.ticker);
			}
			else {
				// here is where we create the ticker - will have same name as the tween
				tickerName = this.name + '_ticker';
				my.makeTicker({
					name: tickerName,
					order: this.order,
					subscribers: this.name,
					duration: this.effectiveDuration,
					eventChoke: xtGet(items.eventChoke, 0),
					cycles: xtGet(items.cycles, 1),
					killOnComplete: xtGet(items.killOnComplete, false)
				});
				this.ticker = tickerName;
				my.animation[tickerName].recalculateEffectiveDuration();
			}
			return this;
		};
		my.Tween.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Tween'
@final
**/
		my.Tween.prototype.type = 'Tween';
		my.Tween.prototype.classname = 'tweennames';
		my.work.d.Tween = {
			/**
Ticker name
If a Tween object is associated with a ticker, it will fire (or revert) at the appropriate point in the course of the ticker's run.
@property ticker
@type String
@default ''
**/
			ticker: '',
			/**
Array of Objects on which this Tween will perform its action and revert functions; if the array includes Strings, the constructor, set and clone functions will search for the Objects in the Scrawl library, checking sections (if they currently exist) in the following order: 

* entity, cell, pad, stack, element, point, group, design, animation, tween, anim, filter, image, force, spring, physics

This attribute can also accept a single Object or String as its value in the 

@property targets
@type Array
@default []
**/
			targets: [],
			/**
Array of Objects which define the actions this tween will take. The Objects must include the following attributes: 
* attribute - (required) a String of the attribute key value
* start - (required) a Number or String value determining the point on the Ticker at which the tween will activate (eg: 100, '10%', '2px')
* end - (required) a Number or String value determining the point on the Ticker at which the tween will deactivate (eg: 900, '90%', '50px')
* engine - (optional) a String value supplying the name of the easing engine to use; default 'linear'
* integer - (optional) a Boolean: when true, the calculated value will have Math.round() applied before targets are set; default false

This attribute can also accept a single Object as its value 

@property definitions
@type Array
@default []
**/
			definitions: [],
			/**
Time - point (in milliseconds) following the start of the Tween's ticker when the tween will trigger
@property time
@type Number
@default 0
**/
			time: 0,
			/**
Function to be called at the end of each tween recalculation - takes no arguments
@property action
@type Function
@default false
**/
			action: false,
			/**
Duration - time required for tween to run
@property duration
@type Number
@default 0
**/
			duration: 0,
			/**
Reversable flag - when true, the tween will reverse its direction of play as each ticker cycle completes; default false (will go back to beginning and play in the current direction)
@property reverseOnCycleEnd
@type Boolean
@default false
**/
			reverseOnCycleEnd: false,
			/**
Reversed - determines the directin in which the tween will run - true means that reverseTick values will be used for calculations; default false
@property reversed
@type Boolean
@default false
**/
			reversed: false,
			/**
Sort order - for Actions that share the same time value on a given Ticker. Without a sort order, there will be no guarantee which actions with the same time value will be performed first
@property order
@type Number
@default 0
**/
			order: 0
		};
		my.mergeInto(my.work.d.Tween, my.work.d.Base);
		/**
retrieve the completion time for the action
@method getEndTime
@private
@return Number
**/
		my.Tween.prototype.getEndTime = function() {
			return this.effectiveTime + this.effectiveDuration;
		};
		/**
Get the effective (millisecond number) time when tween will trigger
@method calculateEffectiveTime
@param {String} [item] new time value; defaults to this.time
@chainable
@private
@return this
**/
		my.Tween.prototype.calculateEffectiveTime = function(item) {
			my.Action.prototype.calculateEffectiveTime.call(this, item);
			return this;
		};
		/**
Get the effective (millisecond number) duration for the tween
@method calculateEffectiveDuration
@param {String} [item] new time value; defaults to this.time
@chainable
@private
@return this
**/
		my.Tween.prototype.calculateEffectiveDuration = function(item) {
			var tweenDuration = my.xtGet(item, this.duration),
				calculatedDur = my.convertTime(tweenDuration),
				cDur = calculatedDur[1],
				cType = calculatedDur[0],
				ticker, tickerDuration = 0;
			this.effectiveDuration = 0;
			if (cType === '%') {
				if (this.ticker) {
					ticker = my.animation[this.ticker];
					if (ticker) {
						tickerDuration = ticker.effectiveDuration;
						this.effectiveDuration = tickerDuration * (cDur / 100);
					}
				}
			}
			else {
				this.effectiveDuration = cDur;
			}
			return this;
		};
		/**
Add tween to given ticker

If tween is already subscribed to a different ticker, the function will automatically unsubscribe from that ticker before subscribing to the new ticker
@method addToTicker
@param {String} item TICKERNAME to which this Tween will subscribe  
@chainable
@return this
**/
		my.Tween.prototype.addToTicker = function(item) {
			my.Action.prototype.addToTicker.call(this, item);
			this.calculateEffectiveDuration();
			return this;
		};
		/**
Remove action from given ticker
@method removeFromTicker
@param {String} item TICKERNAME to which this Tween will unsubscribe  
@chainable
@return this
**/
		my.Tween.prototype.removeFromTicker = function(item) {
			my.Action.prototype.removeFromTicker.call(this, item);
			return this;
		};
		/**
Investigate the data supplied by the ticker and, if necessary, invoke the action or revert functions, as appropriate

The object passed by the ticker has the following attributes:

* tick - milliseconds since ticker started its run
* reverseTick - milliseconds before ticker reaches the end of its run
* willLoop - boolean indicating whether ticker is about to restart
* next - boolean indicating whether this is the ticker's last update

@method update
@param {Object} items Object sent by ticker  
@private
@return always true
**/
		my.Tween.prototype.update = function(items) {
			items = my.safeObject(items);
			var starts, ends,
				tick = items.tick || 0,
				revTick = items.reverseTick || 0,
				status = 'running';

			// 1. Should we do work for this tween?
			if (!this.reversed) {
				starts = this.effectiveTime;
				ends = this.effectiveTime + this.effectiveDuration;
				if (tick < starts) {
					status = 'before';
				}
				else if (tick > ends) {
					status = 'after'
				}
			}
			else {
				starts = this.effectiveTime + this.effectiveDuration;
				ends = this.effectiveTime;
				if (revTick > starts) {
					status = 'after';
				}
				else if (revTick < ends) {
					status = 'before'
				}
			}

			// for tweens with a duration > 0
			if (this.effectiveDuration) {
				if (status === 'running' || status !== this.status) {
					this.status = status;
					this.doSimpleUpdate(items);
					this.updateCleanup(items);
				}
			}
			// for tweens with a duration == 0
			else {
				if (status !== this.status) {
					this.status = status;
					this.doSimpleUpdate(items);
					this.updateCleanup(items);
				}
			}
			if (items.willLoop) {
				if (this.reverseOnCycleEnd) {
					this.reversed = !this.reversed;
				}
				else {
					this.status = 'before';
				}
			}
			return true;
		};
		/**
Perform a simple update
@method doSimpleUpdate
@param {Object} items Object sent by ticker  
@private
@return always true
**/
		my.Tween.prototype.doSimpleUpdate = function(items) {
			items = my.safeObject(items);
			var starts = this.effectiveTime,
				effectiveTick,
				actions = my.Tween.prototype.engineActions,
				i, iz, j, jz, def, progress,
				setObj = {};

			// 2. Ticks only run forward - check if tween is in reverse mode
			effectiveTick = (this.reversed) ? items.reverseTick - starts : items.tick - starts;

			// 3. determine the current progress of the tween
			if (this.effectiveDuration && this.status === 'running') {
				progress = effectiveTick / this.effectiveDuration;
			}
			else {
				progress = (this.status === 'after') ? 1 : 0;
			}

			// 4. calculate the current value for each definition
			for (i = 0, iz = this.definitions.length; i < iz; i++) {
				def = this.definitions[i];
				if (def.engine.substring) {
					def.value = actions[def.engine](def.effectiveStart, def.effectiveChange, progress);
				}
				else {
					def.value = def.engine(def.effectiveStart, def.effectiveChange, progress);
				}
				if (def.integer) {
					def.value = Math.round(def.value);
				}
				if (def.suffix) {
					def.value += def.suffix;
				}
				setObj[def.attribute] = def.value;
			}

			// 5. Apply all definitions updates to target objects
			for (j = 0, jz = this.targets.length; j < jz; j++) {
				this.targets[j].set(setObj);
			}

			// 6. perform any action
			if (this.action) {
				this.action();
			}
			return true;
		};
		/**
update cleanup
@method updateCleanup
@param {Object} items Object sent by ticker  
@private
@return always true
**/
		my.Tween.prototype.updateCleanup = function(items) {
			items = my.safeObject(items);
			// do cleanup stuff here
			if (!items.next) {
				this.status = (this.reverse) ? 'before' : 'after';
			}
			return true;
		};
		/**
Tween engine helper object
@method engineActions
@private
**/
		my.Tween.prototype.engineActions = {
			out: function(start, change, position) {
				var temp = 1 - position;
				return (start + change) + (Math.cos((position * 90) * my.work.radian) * -change);
			},
			in : function(start, change, position) {
				return start + (Math.sin((position * 90) * my.work.radian) * change);
			},
			easeIn: function(start, change, position) {
				var temp = 1 - position;
				return (start + change) + ((temp * temp) * -change);
			},
			easeIn3: function(start, change, position) {
				var temp = 1 - position;
				return (start + change) + ((temp * temp * temp) * -change);
			},
			easeIn4: function(start, change, position) {
				var temp = 1 - position;
				return (start + change) + ((temp * temp * temp * temp) * -change);
			},
			easeIn5: function(start, change, position) {
				var temp = 1 - position;
				return (start + change) + ((temp * temp * temp * temp * temp) * -change);
			},
			easeOutIn: function(start, change, position) {
				var temp = 1 - position;
				return (position < 0.5) ?
					start + ((position * position) * change * 2) :
					(start + change) + ((temp * temp) * -change * 2);
			},
			easeOutIn3: function(start, change, position) {
				var temp = 1 - position;
				return (position < 0.5) ?
					start + ((position * position * position) * change * 4) :
					(start + change) + ((temp * temp * temp) * -change * 4);
			},
			easeOutIn4: function(start, change, position) {
				var temp = 1 - position;
				return (position < 0.5) ?
					start + ((position * position * position * position) * change * 8) :
					(start + change) + ((temp * temp * temp * temp) * -change * 8);
			},
			easeOutIn5: function(start, change, position) {
				var temp = 1 - position;
				return (position < 0.5) ?
					start + ((position * position * position * position * position) * change * 16) :
					(start + change) + ((temp * temp * temp * temp * temp) * -change * 16);
			},
			easeOut: function(start, change, position) {
				return start + ((position * position) * change);
			},
			easeOut3: function(start, change, position) {
				return start + ((position * position * position) * change);
			},
			easeOut4: function(start, change, position) {
				return start + ((position * position * position * position) * change);
			},
			easeOut5: function(start, change, position) {
				return start + ((position * position * position * position * position) * change);
			},
			linear: function(start, change, position) {
				return start + (position * change);
			}
		};
		/**
Set attributes
@method set
@param {Object} Object containing key:value attributes
@chainable
@return this
**/
		my.Tween.prototype.set = function(items) {
			var xt = my.xt,
				ticker;
			items = my.safeObject(items);
			ticker = (xt(items.ticker)) ? this.ticker : false;
			my.Base.prototype.set.call(this, items);
			// if either ticker or time change, then this.effectiveTime will need recalculation
			if (ticker) {
				this.ticker = ticker;
				this.addToTicker(items.ticker);
			}
			else if (my.xto(items.time, items.duration)) {
				this.calculateEffectiveTime();
				this.calculateEffectiveDuration();
			}
			if (xt(items.targets)) {
				this.setTargets(items.targets);
			}
			if (xt(items.definitions)) {
				this.definitions = [].concat(items.definitions);
				this.setDefinitionsValues();
			}
			if (xt(items.action)) {
				this.action = items.action;
				if (typeof this.action !== 'function') {
					this.action = false;
				}
			}
			return this;
		};
		/**
Calculate the effective values for definitions
@method setDefinitionsValues
@param {Object} Object containing key:value attributes
@chainable
@private
@return this
**/
		my.Tween.prototype.setDefinitionsValues = function() {
			var i, iz, temp, def,
				xt = my.xt;
			for (i = 0, iz = this.definitions.length; i < iz; i++) {
				def = this.definitions[i];
				temp = this.parseDefinitionsValue(def.start);
				def.effectiveStart = temp[1];
				def.suffix = temp[0];
				temp = this.parseDefinitionsValue(def.end);
				def.effectiveEnd = temp[1];
				if (!xt(def.engine)) {
					def.engine = 'linear';
				}
				def.effectiveChange = def.effectiveEnd - def.effectiveStart;
			}
			return this;
		};
		/**
setDefinitionsValues helper function
@method parseDefinitionsValue
@param {String} value to be parsed; can also be a Number
@private
@return Array of parsed values in the form ['Suffix', Number]
**/
		my.Tween.prototype.parseDefinitionsValue = function(item) {
			var result = ['', 0],
				a, xt = my.xt;
			if (xt(item)) {
				if (item.toFixed) {
					result[1] = item;
				}
				else if (item.substring) {
					a = item.match(/^-?\d+\.?\d*(\D*)/);
					if (xt(a[0])) {
						result[1] = parseFloat(a);
					}
					if (xt(a[1])) {
						result[0] = a[1];
					}
				}
			}
			return result;
		};
		/**
Set targets attribute - assumes that the supplied Array will replace, not amend, any existing targets array
@method setTargets
@param {Array} items Array of Objects and/or Strings, can also be single Object or string
@chainable
@private
@return this
**/
		my.Tween.prototype.setTargets = function(items) {
			my.Action.prototype.setTargets.call(this, items);
			return this;
		};
		/**
Add Objects to targets attribute - assumes that the supplied Array will augment any existing targets array
@method addToTargets
@param {Array} items Array of Objects and/or Strings, can also be single Object or string
@chainable
@return this
**/
		my.Tween.prototype.addToTargets = function(items) {
			my.Action.prototype.addToTargets.call(this, items);
			return this;
		};
		/**
Remove Objects from targets attribute - will not remove an object with no name and/or type attributes
@method removeFromTargets
@param {Array} items Array of Objects and/or Strings, can also be single Object or string
@chainable
@return this
**/
		my.Tween.prototype.removeFromTargets = function(items) {
			my.Action.prototype.removeFromTargets.call(this, items);
			return this;
		};
		/**
Create a clone of this Tween

Note: strongly advise every call to this function includes newly created anonymous functions for the action and revert attributes in the argument object - Scrawl's clone functionality does not clone function attributes!

@method clone
@param {Object} Object containing key:value attributes
@chainable
@return a new copy of the Tween object
**/
		my.Tween.prototype.clone = function(items) {
			var c = my.Base.prototype.clone.call(this, items);
			items = my.safeObject(items);
			if (!items.targets) {
				c.setTargets(this.targets);
			}
			return c;
		};
		/**
Start the tween's ticker from 0

@method run
@return this
**/
		my.Tween.prototype.run = function() {
			var t = my.animation[this.ticker];
			if (t) {
				t.run();
			}
			return this;
		};
		/**
Halt the tween's ticker

@method halt
@return this
**/
		my.Tween.prototype.halt = function() {
			var t = my.animation[this.ticker];
			if (t) {
				t.halt();
			}
			return this;
		};
		/**
Resume the tween's ticker

@method resume
@return this
**/
		my.Tween.prototype.resume = function() {
			var t = my.animation[this.ticker];
			if (t) {
				t.resume();
			}
			return this;
		};
		/**
seekTo a different specific point on the tween's ticker

@method seekTo
@return this
**/
		my.Tween.prototype.seekTo = function(milliseconds) {
			var t = my.animation[this.ticker];
			if (t) {
				t.seekTo(milliseconds);
			}
			return this;
		};
		/**
seekFor a different relative point on the tween's ticker

@method seekFor
@return this
**/
		my.Tween.prototype.seekFor = function(milliseconds) {
			var t = my.animation[this.ticker];
			if (t) {
				t.seekFor(milliseconds);
			}
			return this;
		};
		/**
Remove this Tween from the scrawl library (including any self-created ticker associated with the tween)
@method kill
@return Always true
**/
		my.Tween.prototype.kill = function() {
			var t;
			if (this.ticker === this.name + '_ticker') {
				t = my.animation[this.ticker];
				if (t) {
					t.kill();
				}
			}
			my.Action.prototype.kill.call(this);
		};

		return my;
	}(scrawl));
}
