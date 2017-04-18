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
# scrawlBlock

## Purpose and features

The Block extension adds Block entitys - squares and rectangles - to the core module

* Defines 'rect' objects for displaying on a Cell's canvas
* Performs 'rect' based drawing operations on canvases

@module scrawlBlock
**/

if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'block')) {
	var scrawl = (function(my) {
		'use strict';
		/**
# window.scrawl

scrawlBlock extension adaptions to the scrawl-canvas library object

@class window.scrawl_Block
**/

		/**
Alias for makeBlock()
@method newBlock
@deprecated
**/
		my.newBlock = function(items) {
			return new my.Block(items);
		};
		/**
A __factory__ function to generate new Block entitys
@method makeBlock
@param {Object} items Key:value Object argument for setting attributes
@return Block object
@example
	scrawl.makeBlock({
		width: 100,
		height: 50,
		startX: 150,
		startY: 60,
		fillStyle: 'blue',
		strokeStyle: 'red',
		roll: 30,
		method: 'sinkInto',
		});
**/
		my.makeBlock = function(items) {
			return new my.Block(items);
		};

		/**
# Block

## Instantiation

* scrawl.makeBlock()

## Purpose

* Defines 'rect' objects for displaying on a Cell's canvas
* Performs 'rect' based drawing operations on canvases

## Access

* scrawl.entity.BLOCKNAME - for the Block entity object

@class Block
@constructor
@extends Entity
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Block = function Block(items) {
			var get = my.xtGet,
			d = my.work.d.Block;
			items = my.safeObject(items);
			my.Entity.call(this, items);
			my.Position.prototype.set.call(this, items);
			this.width = get(items.width, d.width);
			this.height = get(items.height, d.height);
			this.setLocalDimensions();
			this.registerInLibrary();
			my.pushUnique(my.group[this.group].entitys, this.name);
			return this;
		};
		my.Block.prototype = Object.create(my.Entity.prototype);
		/**
@property type
@type String
@default 'Block'
@final
**/
		my.Block.prototype.type = 'Block';
		my.Block.prototype.classname = 'entitynames';
		my.work.d.Block = {
			/**
Block display - width, in pixels
@property localWidth
@type Number
@default 0
@private
**/
			localWidth: 0,
			/**
Block display - height, in pixels
@property localHeight
@type Number
@default 0
@private
**/
			localHeight: 0,
		};
		my.mergeInto(my.work.d.Block, my.work.d.Entity);
		/**
Augments Entity.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Block.prototype.set = function(items) {
			my.Entity.prototype.set.call(this, items);
			if (my.xto(items.width, items.height, items.scale)) {
				this.setLocalDimensions();
			}
			return this;
		};
		/**
Augments Entity.set()
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Block.prototype.setDelta = function(items) {
			my.Entity.prototype.setDelta.call(this, items);
			if (my.xto(items.width, items.height, items.scale)) {
				this.setLocalDimensions();
			}
			return this;
		};
		/**
Augments Entity.set() - sets the local dimensions
@method setLocalDimensions
@return This
@chainable
**/
		my.Block.prototype.setLocalDimensions = function() {
			var cell = my.cell[my.group[this.group].cell];
			if (this.width.substring) {
				this.localWidth = (parseFloat(this.width) / 100) * cell.actualWidth * this.scale;
			}
			else {
				this.localWidth = this.width * this.scale || 0;
			}
			if (this.height.substring) {
				this.localHeight = (parseFloat(this.height) / 100) * cell.actualHeight * this.scale;
			}
			else {
				this.localHeight = this.height * this.scale || 0;
			}
			return this;
		};
		/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@return This
@chainable
@private
**/
		my.Block.prototype.clip = function(ctx, cellname, cell) {
			var here = this.currentHandle;
			this.rotateCell(ctx, cell);
			ctx.beginPath();
			ctx.rect(here.x, here.y, this.localWidth, this.localHeight);
			ctx.clip();
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
		my.Block.prototype.clear = function(ctx, cellname, cell) {
			var here = this.currentHandle;
			cell.setToClearShape();
			this.rotateCell(ctx, cell);
			ctx.clearRect(here.x, here.y, this.localWidth, this.localHeight);
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
		my.Block.prototype.clearWithBackground = function(ctx, cellname, cell) {
			var bg = cell.get('backgroundColor'),
				myCellCtx = my.ctx[cellname],
				fillStyle = myCellCtx.get('fillStyle'),
				strokeStyle = myCellCtx.get('strokeStyle'),
				globalAlpha = myCellCtx.get('globalAlpha'),
				here = this.currentHandle;
			this.rotateCell(ctx, cell);
			ctx.fillStyle = bg;
			ctx.strokeStyle = bg;
			ctx.globalAlpha = 1;
			ctx.strokeRect(here.x, here.y, this.localWidth, this.localHeight);
			ctx.fillRect(here.x, here.y, this.localWidth, this.localHeight);
			ctx.fillStyle = fillStyle;
			ctx.strokeStyle = strokeStyle;
			ctx.globalAlpha = globalAlpha;
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
		my.Block.prototype.draw = function(ctx, cellname, cell) {
			var here = this.currentHandle;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			ctx.strokeRect(here.x, here.y, this.localWidth, this.localHeight);
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
		my.Block.prototype.fill = function(ctx, cellname, cell) {
			var here = this.currentHandle;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			ctx.fillRect(here.x, here.y, this.localWidth, this.localHeight);
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
		my.Block.prototype.drawFill = function(ctx, cellname, cell) {
			var here = this.currentHandle;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			ctx.strokeRect(here.x, here.y, this.localWidth, this.localHeight);
			this.clearShadow(ctx, cell);
			ctx.fillRect(here.x, here.y, this.localWidth, this.localHeight);
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
		my.Block.prototype.fillDraw = function(ctx, cellname, cell) {
			var here = this.currentHandle;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			ctx.fillRect(here.x, here.y, this.localWidth, this.localHeight);
			this.clearShadow(ctx, cell);
			ctx.strokeRect(here.x, here.y, this.localWidth, this.localHeight);
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
		my.Block.prototype.sinkInto = function(ctx, cellname, cell) {
			var here = this.currentHandle;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			ctx.fillRect(here.x, here.y, this.localWidth, this.localHeight);
			ctx.strokeRect(here.x, here.y, this.localWidth, this.localHeight);
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
		my.Block.prototype.floatOver = function(ctx, cellname, cell) {
			var here = this.currentHandle;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			ctx.strokeRect(here.x, here.y, this.localWidth, this.localHeight);
			ctx.fillRect(here.x, here.y, this.localWidth, this.localHeight);
			return this;
		};
		/**
Stamp helper function - perform a 'none' method draw
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Block.prototype.none = function(ctx, cellname, cell) {
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
		my.Block.prototype.getMaxDimensions = function(cell) {
			var cw = cell.actualWidth,
				ch = cell.actualHeight,
				halfW = cw / 2,
				halfH = ch / 2,
				cx = this.currentStart.x,
				cy = this.currentStart.y,
				lw = this.localWidth,
				lh = this.localHeight,
				fr = this.flipReverse,
				fu = this.flipUpend,
				xtl, xtr, xbr, xbl, ytl, ytr, ybr, ybl,
				x = (fr) ? cw - cx : cx,
				y = (fu) ? ch - cy : cy,
				w = (fr) ? -lw : lw,
				h = (fu) ? -lh : lh,
				o = this.currentHandle,
				hx = (fr) ? -o.x : o.x,
				hy = (fu) ? -o.y : o.y,
				line = my.ctx[this.context].lineWidth || 0,
				max, min, ax, ay, ref,
				ceil = Math.ceil,
				floor = Math.floor,
				t, l, b, r,
				roll = this.roll,
				v = my.work.v,
				between = my.isBetween;
			l = (fr) ? x + hx + w : x + hx;
			r = (fr) ? x + hx : x + hx + w;
			t = (fu) ? y + hy + h : y + hy;
			b = (fu) ? y + hy : y + hy + h;
			if (roll) {
				min = Math.min;
				max = Math.max;
				ref = {
					x: x,
					y: y
				};
				v.set({
					x: l,
					y: t
				}).vectorSubtract(ref).rotate(roll).vectorAdd(ref);
				xtl = v.x;
				ytl = v.y;
				v.set({
					x: r,
					y: t
				}).vectorSubtract(ref).rotate(roll).vectorAdd(ref);
				xtr = v.x;
				ytr = v.y;
				v.set({
					x: r,
					y: b
				}).vectorSubtract(ref).rotate(roll).vectorAdd(ref);
				xbl = v.x;
				ybl = v.y;
				v.set({
					x: l,
					y: b
				}).vectorSubtract(ref).rotate(roll).vectorAdd(ref);
				xbr = v.x;
				ybr = v.y;
				ax = [xtl, xtr, xbr, xbl];
				ay = [ytl, ytr, ybr, ybl];
				t = min.apply(Math, ay);
				l = min.apply(Math, ax);
				b = max.apply(Math, ay);
				r = max.apply(Math, ax);
			}
			t = floor(t - line);
			l = floor(l - line);
			b = ceil(b + line);
			r = ceil(r + line);
			if (!between(t, 0, ch, true)) {
				t = (t > halfH) ? ch : 0;
			}
			if (!between(b, 0, ch, true)) {
				b = (b > halfH) ? ch : 0;
			}
			if (!between(l, 0, cw, true)) {
				l = (l > halfW) ? cw : 0;
			}
			if (!between(r, 0, cw, true)) {
				r = (r > halfW) ? cw : 0;
			}
			this.maxDimensions.top = t;
			this.maxDimensions.bottom = b;
			this.maxDimensions.left = l;
			this.maxDimensions.right = r;
			this.maxDimensions.flag = false;
			return this.maxDimensions;
		};

		return my;
	}(scrawl));
}
