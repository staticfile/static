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
# scrawlPathFactories

## Purpose and features

The Factories extension adds a set of factory functions to the scrawl-canvas library, which can be used to generate both Path and Shape entitys

@module scrawlPathFactories
**/

if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'factories')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlPathFactories extension adaptions to the scrawl-canvas library object

@class window.scrawl_Factories
**/

		/**
A __factory__ function to generate elliptical Shape or Path entity objects

The argument can include:
* __radiusX__ - Number, horizontal radius of ellipse; default: 0 (not retained)
* __radiusY__ - Number, vertical radius of ellipse; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path (not retained)
* any other legitimate Entity, Context or Shape/Path attribute

Percentage String values are relative to the entity's cell's dimensions

@method makeEllipse
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
		my.makeEllipse = function(items) {
			var cell,
				startX,
				startY,
				radiusX,
				radiusY,
				myData,
				cx,
				cy,
				dx,
				dy,
				conv = my.Position.prototype.numberConvert,
				get = my.xtGet;
			items = my.safeObject(items);
			items.closed = true;
			cell = my.Entity.prototype.getEntityCell(items);
			startX = get(items.startX, 0);
			startY = get(items.startY, 0);
			radiusX = get(items.radiusX, 0);
			radiusY = get(items.radiusY, 0);
			startX = (startX.substring) ? conv(startX, cell.actualWidth) : startX;
			startY = (startY.substring) ? conv(startY, cell.actualHeight) : startY;
			radiusX = (radiusX.substring) ? conv(radiusX, cell.actualWidth) : radiusX;
			radiusY = (radiusY.substring) ? conv(radiusY, cell.actualHeight) : radiusY;
			myData = 'm';
			cx = startX;
			cy = startY;
			dx = startX;
			dy = startY - radiusY;
			myData += (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX + (radiusX * 0.55);
			dy = startY - radiusY;
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX + radiusX;
			dy = startY - (radiusY * 0.55);
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX + radiusX;
			dy = startY;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX + radiusX;
			dy = startY + (radiusY * 0.55);
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX + (radiusX * 0.55);
			dy = startY + radiusY;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX;
			dy = startY + radiusY;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX - (radiusX * 0.55);
			dy = startY + radiusY;
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX - radiusX;
			dy = startY + (radiusY * 0.55);
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX - radiusX;
			dy = startY;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX - radiusX;
			dy = startY - (radiusY * 0.55);
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX - (radiusX * 0.55);
			dy = startY - radiusY;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX;
			dy = startY - radiusY;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			myData += 'z';
			items.isLine = false;
			items.data = myData;
			return (items.shape) ? my.makeShape(items) : my.makePath(items);
		};
		/**
A __factory__ function to generate rectangular Shape or Path entity objects, with optional rounded corners

The argument can include:
* __width__ - Number or % String, default: 0
* __height__ - Number or % String, default: 0
* also, 0, 1 or more of the following __radius__ attributes (all Number, default: radius=0): radiusTopLeftX, radiusTopLeftY, radiusTopRightX, radiusTopRightY, radiusBottomRightX, radiusBottomRightY, radiusBottomLeftX, radiusBottomLeftY, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, radiusTopX, radiusTopY, radiusBottomX, radiusBottomY, radiusLeftX, radiusLeftY, radiusRightX, radiusRightY, radiusTop, radiusBottom, radiusRight, radiusLeft, radiusX, radiusY, radius (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path (not retained)
* any other legitimate Entity, Context or Shape/Path attribute

Percentage String values are relative to the entity's cell's dimensions

@method makeRectangle
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
		my.makeRectangle = function(items) {
			var cell,
				startX,
				startY,
				width,
				height,
				halfWidth,
				halfHeight,
				brx,
				bry,
				blx,
				bly,
				tlx,
				tly,
				trx,
				_try,
				myData,
				cx,
				cy,
				dx,
				dy,
				conv = my.Position.prototype.numberConvert,
				get = my.xtGet;
			items = my.safeObject(items);
			items.closed = true;
			cell = my.Entity.prototype.getEntityCell(items);
			startX = get(items.startX, 0);
			startY = get(items.startY, 0);
			width = get(items.width, 0);
			height = get(items.height, 0);
			startX = (startX.substring) ? conv(startX, cell.actualWidth) : startX;
			startY = (startY.substring) ? conv(startY, cell.actualHeight) : startY;
			width = (width.substring) ? conv(width, cell.actualWidth) : width;
			height = (height.substring) ? conv(height, cell.actualHeight) : height;
			brx = get(items.radiusTopLeftX, items.radiusTopLeft, items.radiusTopX, items.radiusLeftX, items.radiusTop, items.radiusLeft, items.radiusX, items.radius, 0);
			bry = get(items.radiusTopLeftY, items.radiusTopLeft, items.radiusTopY, items.radiusLeftY, items.radiusTop, items.radiusLeft, items.radiusY, items.radius, 0);
			blx = get(items.radiusTopRightX, items.radiusTopRight, items.radiusTopX, items.radiusRightX, items.radiusTop, items.radiusRight, items.radiusX, items.radius, 0);
			bly = get(items.radiusTopRightY, items.radiusTopRight, items.radiusTopY, items.radiusRightY, items.radiusTop, items.radiusRight, items.radiusY, items.radius, 0);
			tlx = get(items.radiusBottomRightX, items.radiusBottomRight, items.radiusBottomX, items.radiusRightX, items.radiusBottom, items.radiusRight, items.radiusX, items.radius, 0);
			tly = get(items.radiusBottomRightY, items.radiusBottomRight, items.radiusBottomY, items.radiusRightY, items.radiusBottom, items.radiusRight, items.radiusY, items.radius, 0);
			trx = get(items.radiusBottomLeftX, items.radiusBottomLeft, items.radiusBottomX, items.radiusLeftX, items.radiusBottom, items.radiusLeft, items.radiusX, items.radius, 0);
			_try = get(items.radiusBottomLeftY, items.radiusBottomLeft, items.radiusBottomY, items.radiusLeftY, items.radiusBottom, items.radiusLeft, items.radiusY, items.radius, 0);
			halfWidth = (width / 2);
			halfHeight = (height / 2);
			myData = 'm';
			cx = startX;
			cy = startY;
			dx = startX - halfWidth + tlx;
			dy = startY - halfHeight;
			myData += (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX + halfWidth - trx;
			dy = startY - halfHeight;
			myData += 'l' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX + halfWidth - trx + (trx * 0.55);
			dy = startY - halfHeight;
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX + halfWidth;
			dy = startY - halfHeight +
				_try - (
					_try * 0.55);
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX + halfWidth;
			dy = startY - halfHeight +
				_try;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX + halfWidth;
			dy = startY + halfHeight - bry;
			myData += 'l' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX + halfWidth;
			dy = startY + halfHeight - bry + (bry * 0.55);
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX + halfWidth - brx + (brx * 0.55);
			dy = startY + halfHeight;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX + halfWidth - brx;
			dy = startY + halfHeight;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX - halfWidth + blx;
			dy = startY + halfHeight;
			myData += 'l' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX - halfWidth + blx - (blx * 0.55);
			dy = startY + halfHeight;
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX - halfWidth;
			dy = startY + halfHeight - bly + (bly * 0.55);
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX - halfWidth;
			dy = startY + halfHeight - bly;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX - halfWidth;
			dy = startY - halfHeight + tly;
			myData += 'l' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX - halfWidth;
			dy = startY - halfHeight + tly - (tly * 0.55);
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX - halfWidth + tlx - (tlx * 0.55);
			dy = startY - halfHeight;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX - halfWidth + tlx;
			dy = startY - halfHeight;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			myData += 'z';
			items.isLine = false;
			items.data = myData;
			return (items.shape) ? my.makeShape(items) : my.makePath(items);
		};
		/**
A __factory__ function to generate bezier curve Shape or Path entity objects

The argument can include:
* __startX__ - Number or % String; default: 0
* __startY__ - Number or % String; default: 0
* __startControlX__ - Number or % String; default: 0 (not retained)
* __startControlY__ - Number or % String; default: 0 (not retained)
* __endControlX__ - Number or % String; default: 0 (not retained)
* __endControlY__ - Number or % String; default: 0 (not retained)
* __endX__ - Number or % String; default: 0 (not retained)
* __endY__ - Number or % String; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path 
* any other legitimate Entity, Context or Shape/Path attribute

Percentage String values are relative to the entity's cell's dimensions

@method makeBezier
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
		my.makeBezier = function(items) {
			var cell,
				startX,
				startY,
				startControlX,
				startControlY,
				endControlX,
				endControlY,
				endX,
				endY,
				data,
				myFixed,
				myShape,
				tempName,
				conv = my.Position.prototype.numberConvert,
				get = my.xtGet,
				point = my.point;
			items = my.safeObject(items);
			items.closed = false;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			items.isLine = true;
			cell = my.Entity.prototype.getEntityCell(items);
			startX = get(items.startX, 0);
			startY = get(items.startY, 0);
			startControlX = get(items.startControlX, 0);
			startControlY = get(items.startControlY, 0);
			endControlX = get(items.endControlX, 0);
			endControlY = get(items.endControlY, 0);
			endX = get(items.endX, 0);
			endY = get(items.endY, 0);
			startX = (startX.substring) ? conv(startX, cell.actualWidth) : startX;
			startY = (startY.substring) ? conv(startY, cell.actualHeight) : startY;
			startControlX = (startControlX.substring) ? conv(startControlX, cell.actualWidth) : startControlX;
			startControlY = (startControlY.substring) ? conv(startControlY, cell.actualHeight) : startControlY;
			endControlX = (endControlX.substring) ? conv(endControlX, cell.actualWidth) : endControlX;
			endControlY = (endControlY.substring) ? conv(endControlY, cell.actualHeight) : endControlY;
			endX = (endX.substring) ? conv(endX, cell.actualWidth) : endX;
			endY = (endY.substring) ? conv(endY, cell.actualHeight) : endY;
			myFixed = items.fixed || 'none';
			items.fixed = false;
			data = 'm0,0c' +
				(startControlX - startX) + ',' + (startControlY - startY) + ' ' +
				(endControlX - startX) + ',' + (endControlY - startY) + ' ' +
				(endX - startX) + ',' + (endY - startY);
			items.data = data;
			if (items.shape) {
				myShape = my.makeShape(items);
			}
			else {
				myShape = my.makePath(items);
				tempName = myShape.name.replace('~', '_', 'g');
				switch (myFixed) {
					case 'all':
						point[tempName + '_p1'].setToFixed(startX, startY);
						point[tempName + '_p2'].setToFixed(startControlX, startControlY);
						point[tempName + '_p3'].setToFixed(endControlX, endControlY);
						point[tempName + '_p4'].setToFixed(endX, endY);
						break;
					case 'both':
						point[tempName + '_p1'].setToFixed(startX, startY);
						point[tempName + '_p4'].setToFixed(endX, endY);
						break;
					case 'start':
						point[tempName + '_p1'].setToFixed(startX, startY);
						break;
					case 'startControl':
						point[tempName + '_p2'].setToFixed(startControlX, startControlY);
						break;
					case 'endControl':
						point[tempName + '_p3'].setToFixed(endControlX, endControlY);
						break;
					case 'end':
						point[tempName + '_p4'].setToFixed(endX, endY);
						break;
				}
			}
			return myShape;
		};
		/**
A __factory__ function to generate quadratic curve Shape or Path entity objects

The argument can include:
* __startX__ - Number or % String; default: 0
* __startY__ - Number or % String; default: 0
* __controlX__ - Number or % String; default: 0 (not retained)
* __controlY__ - Number or % String; default: 0 (not retained)
* __endX__ - Number or % String; default: 0 (not retained)
* __endY__ - Number or % String; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path 
* any other legitimate Entity, Context or Shape/Path attribute

Percentage String values are relative to the entity's cell's dimensions

@method makeQuadratic
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
		my.makeQuadratic = function(items) {
			var cell,
				startX,
				startY,
				controlX,
				controlY,
				endX,
				endY,
				data,
				myFixed,
				myShape,
				tempName,
				conv = my.Position.prototype.numberConvert,
				get = my.xtGet,
				point = my.point;
			items = my.safeObject(items);
			items.closed = false;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			items.isLine = true;
			cell = my.Entity.prototype.getEntityCell(items);
			startX = get(items.startX, 0);
			startY = get(items.startY, 0);
			controlX = get(items.controlX, 0);
			controlY = get(items.controlY, 0);
			endX = get(items.endX, 0);
			endY = get(items.endY, 0);
			startX = (startX.substring) ? conv(startX, cell.actualWidth) : startX;
			startY = (startY.substring) ? conv(startY, cell.actualHeight) : startY;
			controlX = (controlX.substring) ? conv(controlX, cell.actualWidth) : controlX;
			controlY = (controlY.substring) ? conv(controlY, cell.actualHeight) : controlY;
			endX = (endX.substring) ? conv(endX, cell.actualWidth) : endX;
			endY = (endY.substring) ? conv(endY, cell.actualHeight) : endY;
			myFixed = items.fixed || 'none';
			data = 'm0,0q' +
				(controlX - startX) + ',' + (controlY - startY) + ' ' +
				(endX - startX) + ',' + (endY - startY);
			items.fixed = false;
			items.data = data;
			if (items.shape) {
				myShape = my.makeShape(items);
			}
			else {
				myShape = my.makePath(items);
				tempName = myShape.name.replace('~', '_', 'g');
				switch (myFixed) {
					case 'all':
						point[tempName + '_p1'].setToFixed(startX, startY);
						point[tempName + '_p2'].setToFixed(controlX, controlY);
						point[tempName + '_p3'].setToFixed(endX, endY);
						break;
					case 'both':
						point[tempName + '_p1'].setToFixed(startX, startY);
						point[tempName + '_p3'].setToFixed(endX, endY);
						break;
					case 'start':
						point[tempName + '_p1'].setToFixed(startX, startY);
						break;
					case 'control':
						point[tempName + '_p2'].setToFixed(controlX, controlY);
						break;
					case 'end':
						point[tempName + '_p3'].setToFixed(endX, endY);
						break;
				}
			}
			return myShape;
		};
		/**
A __factory__ function to generate straight line Shape or Path entity objects

The argument can include:
* __startX__ - Number or % String; default: 0
* __startY__ - Number or % String; default: 0
* __endX__ - Number or % String; default: 0 (not retained)
* __endY__ - Number or % String; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path 
* any other legitimate Entity, Context or Shape/Path attribute

Percentage String values are relative to the entity's cell's dimensions

@method makeLine
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
		my.makeLine = function(items) {
			var cell,
				startX,
				startY,
				endX,
				endY,
				data,
				myFixed,
				myShape,
				tempName,
				conv = my.Position.prototype.numberConvert,
				get = my.xtGet,
				point = my.point;
			items = my.safeObject(items);
			items.isLine = true;
			items.closed = false;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			cell = my.Entity.prototype.getEntityCell(items);
			startX = get(items.startX, 0);
			startY = get(items.startY, 0);
			endX = get(items.endX, 0);
			endY = get(items.endY, 0);
			startX = (startX.substring) ? conv(startX, cell.actualWidth) : startX;
			startY = (startY.substring) ? conv(startY, cell.actualHeight) : startY;
			endX = (endX.substring) ? conv(endX, cell.actualWidth) : endX;
			endY = (endY.substring) ? conv(endY, cell.actualHeight) : endY;
			myFixed = items.fixed || 'none';
			data = 'm0,0 ' + (endX - startX) + ',' + (endY - startY);
			items.fixed = false;
			items.data = data;
			if (items.shape) {
				myShape = my.makeShape(items);
			}
			else {
				myShape = my.makePath(items);
				tempName = myShape.name.replace('~', '_', 'g');
				switch (myFixed) {
					case 'both':
						point[tempName + '_p1'].setToFixed(startX, startY);
						point[tempName + '_p2'].setToFixed(endX, endY);
						break;
					case 'start':
						point[tempName + '_p1'].setToFixed(startX, startY);
						break;
					case 'end':
						point[tempName + '_p2'].setToFixed(endX, endY);
						break;
				}
			}
			return myShape;
		};
		/**
A __factory__ function to generate regular entitys such as triangles, stars, hexagons, etc

The argument can include:
* __angle__ - Number; eg an angle of 72 produces a pentagon, while 144 produces a five-pointed star - default: 0
* __sides__ - Number; number of sides to the regular entity - default: 0
* __outline__ - Number; default: 0
* __radius__ - Number; default: 0 (not retained)
* __startControlX__ - Number or % String - x coordinate for control (quadratic) or startControl (bezier) curve; default: 0 (not retained)
* __controlX__ - alias for startControlX; default: 0 (not retained)
* __startControlY__ - Number or % String - y coordinate for control (quadratic) or startControl (bezier) curve; default: 0 (not retained)
* __controlY__ - alias for startControlY; default: 0 (not retained)
* __endControlX__ - Number or % String - x coordinate for endControl (bezier) curve; default: 0 (not retained)
* __endControlY__ - Number or % String - y coordinate for endControl (bezier) curve; default: 0 (not retained)
* __lineType__ - String defining type of line/curve to use for generated entity (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path (not retained)
* any other legitimate Entity, Context or Shape/Path attribute

Entitys can be generated using lines, or quadratic or bezier curves. The species of line to use is defined in the __lineType__ attribute which accepts the following values:
* '__l__' - straight line (default)
* '__q__' - quadratic curve
* '__t__' - reflected quadratic curve
* '__c__' - bezier curve
* '__s__' - reflected bezier curve

_Either the 'angle' attribute or the 'sides' attribute (but not both) must be included in the argument object_

Percentage String values are relative to the entity's cell's dimensions

@method makeRegularShape
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
		my.makeRegularShape = function(items) {
			var stat1 = ['c', 's', 'q', 't', 'l'],
				stat2 = ['s', 't'],
				stat3 = ['c', 's', 'q', 't'],
				stat4 = ['c', 'q'],
				cell,
				startX, startY, radius,
				turn, currentAngle,
				count, test,
				species,
				c1x, c1y, c2x, c2y,
				data,
				conv = my.Position.prototype.numberConvert,
				get = my.xtGet,
				cont = my.contains,
				wv1 = my.work.worklink.v1,
				wv2 = my.work.worklink.v2,
				wc1 = my.work.worklink.control1,
				wc2 = my.work.worklink.control2,
				sides, angle;
			items = my.safeObject(items);
			cell = my.Entity.prototype.getEntityCell(items);
			sides = items.sides;
			angle = items.angle;
			if (my.xto(sides, angle)) {
				items.closed = true;
				items.isLine = false;
				c1x = get(items.startControlX, items.controlX, 0);
				c1y = get(items.startControlY, items.controlY, 0);
				c2x = items.endControlX || 0;
				c2y = items.endControlY || 0;
				c1x = (c1x.substring) ? conv(c1x, cell.actualWidth) : c1x;
				c1y = (c1y.substring) ? conv(c1y, cell.actualHeight) : c1y;
				c2x = (c2x.substring) ? conv(c2x, cell.actualWidth) : c2x;
				c2y = (c2y.substring) ? conv(c2y, cell.actualHeight) : c2y;
				species = (cont(stat1, items.lineType)) ? items.lineType : 'l';
				radius = items.radius || 20;
				// - known bug: items.sides has difficulty exiting the loop, hence the count<1000 limit
				turn = (sides && sides.toFixed && sides > 1) ? 360 / sides : ((angle && angle.toFixed && angle > 0) ? angle : 4);
				currentAngle = 0;
				count = 0;
				wv1.x = wv2.x = radius;
				wv1.y = wv2.y = 0;
				wc1.x = c1x;
				wc1.y = c1y;
				wc2.x = c2x;
				wc2.y = c2y;
				data = 'm' + wv1.x.toFixed(1) + ',' + wv1.y.toFixed(1);
				if (cont(stat2, species)) {
					data += ('s' === species) ? 'c' : 'q';
				}
				else {
					data += species;
				}
				do {
					count++;
					currentAngle += turn;
					currentAngle = currentAngle % 360;
					test = currentAngle.toFixed(0);
					wv1.rotate(turn);
					wc1.rotate(turn);
					wc2.rotate(turn);
					if (cont(stat3, species)) {
						if (1 === count && cont(stat2, species)) {
							if ('s' === species) {
								data += wc1.x.toFixed(1) + ',' + wc1.y.toFixed(1) + ' ' + wc2.x.toFixed(1) + ',' + wc2.y.toFixed(1) + ' ';
							}
							else {
								data += wc1.x.toFixed(1) + ',' + wc1.y.toFixed(1) + ' ';
							}
						}
						else {
							if ('s' === species) {
								data += wc2.x.toFixed(1) + ',' + wc2.y.toFixed(1) + ' ';
							}
							else if (cont(stat4, species)) {
								data += wc1.x.toFixed(1) + ',' + wc1.y.toFixed(1) + ' ';
							}
						}
					}
					if ('c' === species) {
						data += wc2.x.toFixed(1) + ',' + wc2.y.toFixed(1) + ' ';
					}
					data += (wv1.x - wv2.x).toFixed(1) + ',' + (wv1.y - wv2.y).toFixed(1) + ' ';
					if (1 === count) {
						if (cont(stat2, species)) {
							data += ('s' === species) ? 's' : 't';
						}
					}
					wv2.set(wv1);
				} while (test !== '0' && count < 1000);
				data += 'z';
				items.data = data;
				return (items.shape) ? my.makeShape(items) : my.makePath(items);
			}
			return false;
		};

		if (!my.xt(my.work.worklink)) {
			my.work.worklink = {
				start: my.makeVector({
					name: 'scrawl.worklink.start'
				}),
				end: my.makeVector({
					name: 'scrawl.worklink.end'
				}),
				control1: my.makeVector({
					name: 'scrawl.worklink.control1'
				}),
				control2: my.makeVector({
					name: 'scrawl.worklink.control2'
				}),
				v1: my.makeVector({
					name: 'scrawl.worklink.v1'
				}),
				v2: my.makeVector({
					name: 'scrawl.worklink.v2'
				}),
				v3: my.makeVector({
					name: 'scrawl.worklink.v3'
				}),
			};
		}

		return my;
	}(scrawl));
}
