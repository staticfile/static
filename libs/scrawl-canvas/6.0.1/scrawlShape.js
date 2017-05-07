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
# scrawlShape

## Purpose and features

The Shape extension adds Shape entitys - path-based objects - to the core module

* Defines a entity composed of lines, quadratic and bezier curves, etc
* See also Path object, which achieves a similar thing in a different way

@module scrawlShape
**/

if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'shape')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlShape extension adaptions to the scrawl-canvas library object

@class window.scrawl_Shape
**/

		/**
Alias for makeShape()
@method newShape
@deprecated
**/
		my.newShape = function(items) {
			return my.makeShape(items);
		};
		/**
A __factory__ function to generate new Shape entitys
@method makeShape
@param {Object} items Key:value Object argument for setting attributes
@return Shape object
@example
	scrawl.makeShape({
		startX: 50,
		startY: 20,
		fillStyle: 'red',
		data: 'M0,0 50,0 60,20, 10,20 0,0z',
		});
**/
		my.makeShape = function(items) {
			return new my.Shape(items);
		};

		/**
# Shape

## Instantiation

* scrawl.makeShape() - Irregular, path-based shapes

Additional factory functions to instantiate Shape objects are available in the __pathFactoryFunctions__ module

## Purpose

* Defines a entity composed of lines, quadratic and bezier curves, etc
* See also Path object, which achieves a similar thing in a different way

## Access

* scrawl.entity.SHAPENAME - for the Shape entity object

@class Shape
@constructor
@extends Entity
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Shape = function Shape(items) {
			items = my.safeObject(items);
			my.Entity.call(this, items);
			my.Position.prototype.set.call(this, items);
			this.isLine = (my.isa_bool(items.isLine)) ? items.isLine : true;
			this.dataSet = (my.xt(this.data)) ? this.buildDataSet(this.data) : '';
			this.winding = my.xtGet(items.winding, 'nonzero');
			this.registerInLibrary();
			my.pushUnique(my.group[this.group].entitys, this.name);
			return this;
		};
		my.Shape.prototype = Object.create(my.Entity.prototype);
		/**
@property type
@type String
@default 'Shape'
@final
**/
		my.Shape.prototype.type = 'Shape';
		my.Shape.prototype.classname = 'entitynames';
		my.work.d.Shape = {
			/**
Interpreted path data - calculated by scrawl-canvas from the data attribute
@property dataSet
@type Array
@default false
@private
**/
			dataSet: false,
			/**
Drawing flag - when set to true, will treat the first drawing (not positioning) data point as the start point

Generally this is set automatically as part of a shape factory function
@property isLine
@type Boolean
@default true
**/
			isLine: true,
			/**
Shape entity default method attribute is 'draw', not 'fill'
@property method
@type String
@default 'draw'
**/
			method: 'draw',
			/**
Winding value
@property winding
@type String
@default 'non-zero'
**/
			winding: 'nonzero'
		};
		my.mergeInto(my.work.d.Shape, my.work.d.Entity);
		/**
Augments Entity.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Shape.prototype.set = function(items) {
			my.Entity.prototype.set.call(this, items);
			items = my.safeObject(items);
			if (my.xt(items.data && items.data.substring)) {
				this.dataSet = this.buildDataSet(this.data);
			}
			return this;
		};
		/**
Constructor, clone and set helper function

Create native path data from data attribute String

@method buildDataSet
@param {String} d Path string
@return Native path data
@private
**/
		my.Shape.prototype.buildDataSet = function(d) {
			var stat1 = ['M', 'L', 'C', 'Q', 'S', 'T'],
				myData = [],
				command,
				points = [],
				minX,
				minY,
				maxX,
				maxY,
				curX,
				curY,
				set,
				i,
				iz,
				j,
				jz,
				result = [];
			myData.length = 0;
			minX = 999999;
			minY = 999999;
			maxX = -999999;
			maxY = -999999;
			curX = this.start.x;
			curY = this.start.y;
			set = d.match(/([A-Za-z][0-9. ,\-]*)/g);
			var checkMaxMin = function(cx, cy) {
				minX = (minX > cx) ? cx : minX;
				minY = (minY > cy) ? cy : minY;
				maxX = (maxX < cx) ? cx : maxX;
				maxY = (maxY < cy) ? cy : maxY;
			};
			for (i = 0, iz = set.length; i < iz; i++) {
				command = set [i][0];
				points = set [i].match(/(-?[0-9.]+\b)/g);
				if (points) {
					for (j = 0, jz = points.length; j < jz; j++) {
						points[j] = parseFloat(points[j]);
					}
					switch (command) {
						case 'H':
							for (j = 0, jz = points.length; j < jz; j++) {
								curX = points[j];
								checkMaxMin(curX, curY);
							}
							break;
						case 'V':
							for (j = 0, jz = points.length; j < jz; j++) {
								curY = points[j];
								checkMaxMin(curX, curY);
							}
							break;
						case 'M':
							for (j = 0, jz = points.length; j < jz; j += 2) {
								curX = points[j];
								curY = points[j + 1];
								checkMaxMin(curX, curY);
							}
							break;
						case 'L':
						case 'T':
							for (j = 0, jz = points.length; j < jz; j += 2) {
								curX = points[j];
								curY = points[j + 1];
								checkMaxMin(curX, curY);
							}
							break;
						case 'Q':
						case 'S':
							for (j = 0, jz = points.length; j < jz; j += 4) {
								curX = points[j + 2];
								curY = points[j + 3];
								checkMaxMin(curX, curY);
							}
							break;
						case 'C':
							for (j = 0, jz = points.length; j < jz; j += 6) {
								curX = points[j + 4];
								curY = points[j + 5];
								checkMaxMin(curX, curY);
							}
							break;
						case 'h':
							for (j = 0, jz = points.length; j < jz; j++) {
								curX += points[j];
								checkMaxMin(curX, curY);
							}
							break;
						case 'v':
							for (j = 0, jz = points.length; j < jz; j++) {
								curY += points[j];
								checkMaxMin(curX, curY);
							}
							break;
						case 'm':
						case 'l':
						case 't':
							for (j = 0, jz = points.length; j < jz; j += 2) {
								curX += points[j];
								curY += points[j + 1];
								checkMaxMin(curX, curY);
							}
							break;
						case 'q':
						case 's':
							for (j = 0, jz = points.length; j < jz; j += 4) {
								curX += points[j + 2];
								curY += points[j + 3];
								checkMaxMin(curX, curY);
							}
							break;
						case 'c':
							for (j = 0, jz = points.length; j < jz; j += 6) {
								curX += points[j + 4];
								curY += points[j + 5];
								checkMaxMin(curX, curY);
							}
							break;
					}
				}
				myData.push({
					c: command,
					p: points
				});
			}
			for (i = 0, iz = myData.length; i < iz; i++) {
				if (my.contains(stat1, myData[i].c)) {
					for (j = 0, jz = myData[i].p.length; j < jz; j += 2) {
						myData[i].p[j] -= minX;
						myData[i].p[j + 1] -= minY;
					}
				}
				if (myData[i].c === 'H') {
					for (j = 0, jz = myData[i].p.length; j < jz; j++) {
						myData[i].p[j] -= minX;
					}
				}
				if (myData[i].c === 'V') {
					for (j = 0, jz = myData[i].p.length; j < jz; j++) {
						myData[i].p[j] -= minY;
					}
				}
			}
			this.width = maxX - minX;
			this.height = maxY - minY;
			for (i = 0, iz = myData.length; i < iz; i++) {
				result.push(myData[i]);
			}
			return result;
		};
		/**
Helper function - define the entity's path on the &lt;canvas&gt; element's context engine
@method doOutline
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@private
**/
		my.Shape.prototype.doOutline = function(ctx, cell) {
			cell.setEngine(this);
			if (!this.dataSet && this.data) {
				this.buildDataSet(this.data);
			}
			return this.completeOutline(ctx, cell);
		};
		/**
Helper function - define the entity's path on the &lt;canvas&gt; element's context engine
@method completeOutline
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@return This
@private
**/
		my.Shape.prototype.completeOutline = function(ctx, cell) {
			var stat1 = ['M'],
				stat2 = ['C', 'c', 'S', 's'],
				stat3 = ['Q', 'q', 'T', 't'],
				i,
				iz,
				k,
				kz,
				here,
				currentX,
				currentY,
				reflectX,
				reflectY,
				d,
				tempX,
				tempY;
			var myshape = {
				M: function(item) {
					currentX = d.p[0];
					currentY = d.p[1];
					reflectX = currentX;
					reflectY = currentY;
					ctx.moveTo((currentX * item.scale), (currentY * item.scale));
					for (k = 2, kz = d.p.length; k < kz; k += 2) {
						currentX = d.p[k];
						currentY = d.p[k + 1];
						reflectX = currentX;
						reflectY = currentY;
						ctx.lineTo((currentX * item.scale), (currentY * item.scale));
					}
				},
				m: function(item) {
					currentX += d.p[0];
					currentY += d.p[1];
					reflectX = currentX;
					reflectY = currentY;
					ctx.moveTo((currentX * item.scale), (currentY * item.scale));
					for (k = 2, kz = d.p.length; k < kz; k += 2) {
						currentX += d.p[k];
						currentY += d.p[k + 1];
						reflectX = currentX;
						reflectY = currentY;
						ctx.lineTo((currentX * item.scale), (currentY * item.scale));
					}
				},
				Z: function(item) {
					ctx.closePath();
				},
				z: function(item) {
					ctx.closePath();
				},
				L: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k += 2) {
						currentX = d.p[k];
						currentY = d.p[k + 1];
						reflectX = currentX;
						reflectY = currentY;
						ctx.lineTo((currentX * item.scale), (currentY * item.scale));
					}
				},
				l: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k += 2) {
						currentX += d.p[k];
						currentY += d.p[k + 1];
						reflectX = currentX;
						reflectY = currentY;
						ctx.lineTo((currentX * item.scale), (currentY * item.scale));
					}
				},
				H: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k++) {
						currentX = d.p[k];
						reflectX = currentX;
						ctx.lineTo((currentX * item.scale), (currentY * item.scale));
					}
				},
				h: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k++) {
						currentX += d.p[k];
						reflectX = currentX;
						ctx.lineTo((currentX * item.scale), (currentY * item.scale));
					}
				},
				V: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k++) {
						currentY = d.p[k];
						reflectY = currentY;
						ctx.lineTo((currentX * item.scale), (currentY * item.scale));
					}
				},
				v: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k++) {
						currentY += d.p[k];
						reflectY = currentY;
						ctx.lineTo((currentX * item.scale), (currentY * item.scale));
					}
				},
				C: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k += 6) {
						ctx.bezierCurveTo((d.p[k] * item.scale), (d.p[k + 1] * item.scale), (d.p[k + 2] * item.scale), (d.p[k + 3] * item.scale), (d.p[k + 4] * item.scale), (d.p[k + 5] * item.scale));
						reflectX = d.p[k + 2];
						reflectY = d.p[k + 3];
						currentX = d.p[k + 4];
						currentY = d.p[k + 5];
					}
				},
				c: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k += 6) {
						ctx.bezierCurveTo(((currentX + d.p[k]) * item.scale), ((currentY + d.p[k + 1]) * item.scale), ((currentX + d.p[k + 2]) * item.scale), ((currentY + d.p[k + 3]) * item.scale), ((currentX + d.p[k + 4]) * item.scale), ((currentY + d.p[k + 5]) * item.scale));
						reflectX = currentX + d.p[k + 2];
						reflectY = currentY + d.p[k + 3];
						currentX += d.p[k + 4];
						currentY += d.p[k + 5];
					}
				},
				S: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k += 4) {
						if (i > 0 && my.contains(stat2, item.dataSet[i - 1].c)) {
							tempX = currentX + (currentX - reflectX);
							tempY = currentY + (currentY - reflectY);
						}
						else {
							tempX = currentX;
							tempY = currentY;
						}
						ctx.bezierCurveTo((tempX * item.scale), (tempY * item.scale), (d.p[k] * item.scale), (d.p[k + 1] * item.scale), (d.p[k + 2] * item.scale), (d.p[k + 3] * item.scale));
						reflectX = d.p[k];
						reflectY = d.p[k + 1];
						currentX = d.p[k + 2];
						currentY = d.p[k + 3];
					}
				},
				s: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k += 4) {
						if (i > 0 && my.contains(stat2, item.dataSet[i - 1].c)) {
							tempX = currentX + (currentX - reflectX);
							tempY = currentY + (currentY - reflectY);
						}
						else {
							tempX = currentX;
							tempY = currentY;
						}
						ctx.bezierCurveTo((tempX * item.scale), (tempY * item.scale), ((currentX + d.p[k]) * item.scale), ((currentY + d.p[k + 1]) * item.scale), ((currentX + d.p[k + 2]) * item.scale), ((currentY + d.p[k + 3]) * item.scale));
						reflectX = currentX + d.p[k];
						reflectY = currentY + d.p[k + 1];
						currentX += d.p[k + 2];
						currentY += d.p[k + 3];
					}
				},
				Q: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k += 4) {
						ctx.quadraticCurveTo((d.p[k] * item.scale), (d.p[k + 1] * item.scale), (d.p[k + 2] * item.scale), (d.p[k + 3] * item.scale));
						reflectX = d.p[k];
						reflectY = d.p[k + 1];
						currentX = d.p[k + 2];
						currentY = d.p[k + 3];
					}
				},
				q: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k += 4) {
						ctx.quadraticCurveTo(((currentX + d.p[k]) * item.scale), ((currentY + d.p[k + 1]) * item.scale), ((currentX + d.p[k + 2]) * item.scale), ((currentY + d.p[k + 3]) * item.scale));
						reflectX = currentX + d.p[k];
						reflectY = currentY + d.p[k + 1];
						currentX += d.p[k + 2];
						currentY += d.p[k + 3];
					}
				},
				T: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k += 2) {
						if (i > 0 && my.contains(stat3, item.dataSet[i - 1].c)) {
							tempX = currentX + (currentX - reflectX);
							tempY = currentY + (currentY - reflectY);
						}
						else {
							tempX = currentX;
							tempY = currentY;
						}
						ctx.quadraticCurveTo((tempX * item.scale), (tempY * item.scale), (d.p[k] * item.scale), (d.p[k + 1] * item.scale));
						reflectX = tempX;
						reflectY = tempY;
						currentX = d.p[k];
						currentY = d.p[k + 1];
					}
				},
				t: function(item) {
					for (k = 0, kz = d.p.length; k < kz; k += 2) {
						if (i > 0 && my.contains(stat3, item.dataSet[i - 1].c)) {
							tempX = currentX + (currentX - reflectX);
							tempY = currentY + (currentY - reflectY);
						}
						else {
							tempX = currentX;
							tempY = currentY;
						}
						ctx.quadraticCurveTo((tempX * item.scale), (tempY * item.scale), ((currentX + d.p[k]) * item.scale), ((currentY + d.p[k + 1]) * item.scale));
						reflectX = tempX;
						reflectY = tempY;
						currentX += d.p[k];
						currentY += d.p[k + 1];
					}
				}
			};
			if (this.dataSet) {
				here = this.currentHandle;
				currentX = 0;
				currentY = 0;
				reflectX = 0;
				reflectY = 0;
				this.rotateCell(ctx, cell);
				ctx.translate(here.x, here.y);
				ctx.beginPath();
				if (!my.contains(stat1, this.dataSet[0].c)) {
					ctx.moveTo(currentX, currentY);
				}
				for (i = 0, iz = this.dataSet.length; i < iz; i++) {
					d = this.dataSet[i];
					myshape[d.c](this);
				}
			}
			return this;
		};
		/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Shape.prototype.clip = function(ctx, cellname, cell) {
			ctx.save();
			this.doOutline(ctx, cell);
			ctx.clip(this.winding);
			return this;
		};
		/**
Stamp helper function - perform a 'clear' method draw
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Shape.prototype.clear = function(ctx, cellname, cell) {
			this.clip(ctx, cellname, cell);
			ctx.clearRect(0, 0, cell.get('actualWidth'), cell.get('.actualHeight'));
			ctx.restore();
			return this;
		};
		/**
Stamp helper function - perform a 'clearWithBackground' method draw
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Shape.prototype.clearWithBackground = function(ctx, cellname, cell) {
			this.clip(ctx, cellname, cell);
			ctx.fillStyle = cell.backgroundColor;
			ctx.fillRect(0, 0, cellactualWidth, cell.actualHeight);
			ctx.fillStyle = my.ctx[cellname].get('fillStyle');
			ctx.restore();
			return this;
		};
		/**
Stamp helper function - perform a 'draw' method draw
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Shape.prototype.draw = function(ctx, cellname, cell) {
			this.doOutline(ctx, cell);
			ctx.stroke();
			return this;
		};
		/**
Stamp helper function - perform a 'fill' method draw
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Shape.prototype.fill = function(ctx, cellname, cell) {
			this.doOutline(ctx, cell);
			ctx.fill(this.winding);
			return this;
		};
		/**
Stamp helper function - perform a 'drawFill' method draw
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Shape.prototype.drawFill = function(ctx, cellname, cell) {
			this.doOutline(ctx, cell);
			ctx.stroke();
			this.clearShadow(ctx, cell);
			ctx.fill(this.winding);
			return this;
		};
		/**
Stamp helper function - perform a 'fillDraw' method draw
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Shape.prototype.fillDraw = function(ctx, cellname, cell) {
			this.doOutline(ctx, cell);
			ctx.fill(this.winding);
			this.clearShadow(ctx, cell);
			ctx.stroke();
			return this;
		};
		/**
Stamp helper function - perform a 'sinkInto' method draw
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Shape.prototype.sinkInto = function(ctx, cellname, cell) {
			this.doOutline(ctx, cell);
			ctx.fill(this.winding);
			ctx.stroke();
			return this;
		};
		/**
Stamp helper function - perform a 'floatOver' method draw
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Shape.prototype.floatOver = function(ctx, cellname, cell) {
			this.doOutline(ctx, cell);
			ctx.stroke();
			ctx.fill(this.winding);
			return this;
		};
		/**
Stamp helper function - perform a 'none' method draw
@method none
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Shape.prototype.none = function(ctx, cellname, cell) {
			this.doOutline(ctx, cell);
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
		my.Shape.prototype.checkHit = function(items) {
			var tests,
				result,
				i,
				iz,
				cvx = my.work.cvx;
			items = my.safeObject(items);
			tests = (my.xt(items.tests)) ? [].concat(items.tests) : [(items.x || false), (items.y || false)];
			result = false;
			cvx.mozFillRule = this.winding;
			cvx.msFillRule = this.winding;
			this.completeOutline(cvx, my.group[this.group].cell);
			for (i = 0, iz = tests.length; i < iz; i += 2) {
				result = cvx.isPointInPath(tests[i], tests[i + 1], this.winding);
				if (result) {
					items.x = tests[i];
					items.y = tests[i + 1];
					break;
				}
			}
			return (result) ? items : false;
		};
		/**
Collision detection helper function

Parses the collisionPoints array to generate coordinate Vectors representing the entity's collision points
@method buildCollisionVectors
@param {Array} [items] Array of collision point data
@return This
@chainable
@private
**/
		my.Shape.prototype.buildCollisionVectors = function(items) {
			var i,
				iz,
				p,
				o,
				w,
				h;
			if (this.isLine) {
				my.Entity.prototype.buildCollisionVectors.call(this, items);
			}
			else {
				p = (my.xt(items)) ? this.parseCollisionPoints(items) : this.collisionPoints;
				o = this.getOffsetStartVector().reverse();
				w = this.width / 2;
				h = this.height / 2;
				this.collisionVectors.length = 0;
				for (i = 0, iz = p.length; i < iz; i++) {
					if (p[i].substring) {
						switch (p[i]) {
							case 'start':
								this.collisionVectors.push(0);
								this.collisionVectors.push(0);
								break;
							case 'N':
								this.collisionVectors.push(-o.x);
								this.collisionVectors.push(-h - o.y);
								break;
							case 'NE':
								this.collisionVectors.push(w - o.x);
								this.collisionVectors.push(-h - o.y);
								break;
							case 'E':
								this.collisionVectors.push(w - o.x);
								this.collisionVectors.push(-o.y);
								break;
							case 'SE':
								this.collisionVectors.push(w - o.x);
								this.collisionVectors.push(h - o.y);
								break;
							case 'S':
								this.collisionVectors.push(-o.x);
								this.collisionVectors.push(h - o.y);
								break;
							case 'SW':
								this.collisionVectors.push(-w - o.x);
								this.collisionVectors.push(h - o.y);
								break;
							case 'W':
								this.collisionVectors.push(-w - o.x);
								this.collisionVectors.push(-o.y);
								break;
							case 'NW':
								this.collisionVectors.push(-w - o.x);
								this.collisionVectors.push(-h - o.y);
								break;
							case 'center':
								this.collisionVectors.push(-o.x);
								this.collisionVectors.push(-o.y);
								break;
						}
					}
					else if (my.isa_vector(p[i])) {
						this.collisionVectors.push(p[i].x);
						this.collisionVectors.push(p[i].y);
					}
				}
			}
			return this;
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
		my.Shape.prototype.getMaxDimensions = function(cell) {
			this.maxDimensions.top = 0;
			this.maxDimensions.bottom = cell.actualHeight;
			this.maxDimensions.left = 0;
			this.maxDimensions.right = cell.actualWidth;
			this.maxDimensions.flag = false;
			return this.maxDimensions;
		};

		return my;
	}(scrawl));
}
