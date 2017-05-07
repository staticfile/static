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
# scrawlCollisions

## Purpose and features

The Collisions extension adds support for detecting collisions between entitys

* Adds functionality to various core objects and functions so they can take detect collisions

@module scrawlCollisions
**/
if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'collisions')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlCollisions extension adaptions to the scrawl-canvas library object

## New default attributes

* Position.delta - default: {x:0,y:0,z:0};
* Cell.fieldLabel - default: '';
* Entity.fieldChannel - default: 'anycolor';
* Entity.fieldTest - default: 0;
* Entity.collisionVectors - default: [];
* Entity.collisionPoints - default: [];

@class window.scrawl_Collisions
**/

		/**
Collision vectors, for use in collision detection calculations

_Note: at some point in the future, this object needs to be moved into the scrawl.work object, for consistency_
@property scrawl.workcols
@type Object 
@value Object containing three vectors - v1, v2, v3
@private
**/
		my.workcols = {
			v1: my.makeVector({
				name: 'scrawl.workcols.v1'
			}),
			v2: my.makeVector({
				name: 'scrawl.workcols.v2'
			}),
			v3: my.makeVector({
				name: 'scrawl.workcols.v3'
			}),
		};
		/**
A __general__ function which asks Cell objects to generate field collision tables
@method scrawl.buildFields
@param {Array} [items] Array of CELLNAME Strings - can also be a String
@return Always true
**/
		my.buildFields = function(items) {
			var cells,
				cell = my.cell,
				i,
				iz;
			cells = (my.xt(items)) ? [].concat(items) : [my.pad[my.work.currentPad].current];
			if (items === 'all') {
				cells = my.cellnames;
			}
			for (i = 0, iz = cells.length; i < iz; i++) {
				cell[cells[i]].buildField();
			}
			return true;
		};

		/**
Orders all Cell objects associated with this Pad to (re)create their field collision image maps
@method Pad.buildFields
@return This
@chainable
**/
		my.Pad.prototype.buildFields = function() {
			var cell = my.cell,
				cells = this.cells;
			for (var i = 0, iz = cells.length; i < iz; i++) {
				cell[cells[i]].buildField();
			}
			return this;
		};

		/**
Cell constructor hook function - modified by collisions module
@method Cell.collisionsCellInit
@private
**/
		my.Cell.prototype.collisionsCellInit = function(items) {
			my.makeGroup({
				name: this.name + '_field',
				cell: this.name,
				visibility: false,
			});
			if (items.field) {
				my.group[this.name + '_field'].entitys = [].concat(items.field);
			}
			my.makeGroup({
				name: this.name + '_fence',
				cell: this.name,
				visibility: false,
			});
			if (items.fence) {
				my.group[this.name + '_fence'].entitys = [].concat(items.fence);
			}
		};

		my.work.d.Cell.fieldLabel = '';
		/**
Builds a collision map image from entitys, for use in entity field collision detection functions
@method Cell.buildField
@return This
@chainable
**/
		my.Cell.prototype.buildField = function() {
			var i,
				iz,
				j,
				jz,
				fieldEntitys,
				fenceEntitys,
				tempentity,
				tempfill,
				myfill,
				tempstroke,
				thisContext,
				thisEngine,
				entityContext;
			fieldEntitys = [];
			fenceEntitys = [];
			thisContext = my.ctx[this.context];
			thisEngine = my.context[this.context];
			myfill = thisContext.get('fillStyle');
			thisEngine.fillStyle = 'rgba(0,0,0,1)';
			thisEngine.fillRect(0, 0, this.actualWidth, this.actualHeight);
			thisEngine.fillStyle = myfill;
			fieldEntitys = my.group[this.name + '_field'].entitys;
			for (i = 0, iz = fieldEntitys.length; i < iz; i++) {
				tempentity = my.entity[fieldEntitys[i]];
				entityContext = my.ctx[tempentity.context];
				tempfill = entityContext.fillStyle;
				tempstroke = entityContext.strokeStyle;
				entityContext.fillStyle = 'rgba(255,255,255,1)';
				entityContext.strokeStyle = 'rgba(255,255,255,1)';
				tempentity.forceStamp('fillDraw', this.name);
				entityContext.fillStyle = tempfill;
				entityContext.strokeStyle = tempstroke;
			}
			fenceEntitys = my.group[this.name + '_fence'].entitys;
			for (j = 0, jz = fenceEntitys.length; j < jz; j++) {
				tempentity = my.entity[fenceEntitys[j]];
				entityContext = my.ctx[tempentity.context];
				tempfill = entityContext.fillStyle;
				tempstroke = entityContext.strokeStyle;
				entityContext.fillStyle = 'rgba(0,0,0,1)';
				entityContext.strokeStyle = 'rgba(0,0,0,1)';
				tempentity.forceStamp('fillDraw', this.name);
				entityContext.fillStyle = tempfill;
				entityContext.strokeStyle = tempstroke;
			}
			this.set({
				fieldLabel: this.getImageData({
					name: 'field'
				})
			});
			return this;
		};
		/**
Cell field collision detection function

Argument should be in the form of:

* {channel:String, test:Number, coordinates:Array of Vectors, x:Number, y:Number}

Where:

* __channel__ (optional) can be 'red', 'green', 'blue', 'alpha', or 'anycolor' (default)
* __test__ (optional) can be a value between 0 and 254 (default: 0)
* __coordinates__ (optional) is an array of Vector coordinates, in pixels, relative to the Cell's &lt;canvas&gt; element's top left corner
* __x__ (optional) is the horizontal coordinate, in pixels, relative to the Cell's top left corner
* __y__ (optional) is the vertical coordinate, in pixels, relative to the Cell's top left corner

Either include a single coordinate (x, y), or an array of coordinate Vectors

Test will return: 
* false if it encounters a coordinate outside the bounds of its image map
* true if all coordinates exceed the test level (thus a entity testing in the red channel will report true if it is entirely within a red part of the collision map
* the first coordinate that falls below, or equals, the test level
@method Cell.checkFieldAt
@param {Object} items Argument containing details of how and where to check the cell's collision map image
@return Vector of first the first coordinates to 'pass' the test
@private
**/
		my.Cell.prototype.checkFieldAt = function(items) {
			var i,
				iz,
				myChannel,
				myTest,
				x,
				y,
				coords,
				pos,
				d,
				fieldLabel,
				between = my.isBetween,
				temp;
			items = my.safeObject(items);
			myChannel = items.channel || 'anycolor';
			myTest = items.test || 0;
			coords = (items.coordinates) ? items.coordinates : [items.x || 0, items.y || 0];
			fieldLabel = this.get('fieldLabel');
			d = my.imageData[fieldLabel];
			for (i = 0, iz = coords.length; i < iz; i += 2) {
				x = Math.round(coords[i]);
				y = Math.round(coords[i + 1]);
				if (!between(x, 0, d.width, true) || !between(y, 0, d.height, true)) {
					return false;
				}
				else {
					pos = ((y * d.width) + x) * 4;
					temp = this.checkFieldAtActions[myChannel](d.data, pos, myTest, items, x, y);
					if (temp) {
						return temp;
					}
				}
			}
			return true;
		};
		/**
checkFieldAt helper object
@method Cell.checkFieldAtActions (not a function)
@private
**/
		my.Cell.prototype.checkFieldAtActions = {
			red: function(data, pos, test, items, x, y) {
				if (data[pos] <= test) {
					items.x = x;
					items.y = y;
					return items;
				}
				return false;
			},
			green: function(data, pos, test, items, x, y) {
				if (data[pos + 1] <= test) {
					items.x = x;
					items.y = y;
					return items;
				}
				return false;
			},
			blue: function(data, pos, test, items, x, y) {
				if (data[pos + 2] <= test) {
					items.x = x;
					items.y = y;
					return items;
				}
				return false;
			},
			alpha: function(data, pos, test, items, x, y) {
				if (data[pos + 3] <= test) {
					items.x = x;
					items.y = y;
					return items;
				}
				return false;
			},
			anycolor: function(data, pos, test, items, x, y) {
				if (data[pos] <= test || data[pos + 1] <= test || data[pos + 2] <= test) {
					items.x = x;
					items.y = y;
					return items;
				}
				return false;
			}
		};

		/**
Check all entitys in the Group to see if they are colliding with the supplied entity object. An Array of all entity objects colliding with the reference entity will be returned
@method Group.getEntitysCollidingWith
@param {String} entity SPRITENAME String of the reference entity; alternatively the entity Object itself can be passed as the argument
@return Array of visible entity Objects currently colliding with the reference entity
**/
		my.Group.prototype.getEntitysCollidingWith = function(e) {
			var i, iz, k, kz,
				homeTemp,
				awayTemp,
				entity = my.entity,
				entitys = this.entitys,
				regionRadius = this.regionRadius,
				v1 = my.workcols.v1,
				v2 = my.workcols.v2,
				ts1,
				ts2,
				tresult,
				cp,
				awaycp = [],
				hits = [],
				arg = {
					tests: []
				},
				types = ['Block', 'Phrase', 'Picture', 'Path', 'Shape', 'Wheel', 'Frame'];
			homeTemp = (e.substring) ? entity[e] : e;
			cp = homeTemp.getCollisionPoints();
			for (k = 0, kz = entitys.length; k < kz; k++) {
				awayTemp = entity[entitys[k]];
				awaycp[awayTemp.name] = awayTemp.getCollisionPoints();
			}
			if (my.contains(types, homeTemp.type)) {
				hits.length = 0;
				for (i = 0, iz = entitys.length; i < iz; i++) {
					awayTemp = entity[entitys[i]];
					if (homeTemp.name !== awayTemp.name) {
						if (awayTemp.visibility) {
							if (regionRadius) {
								ts1 = v1.set(homeTemp.currentStart);
								ts2 = v2.set(awayTemp.currentStart);
								tresult = ts1.vectorSubtract(ts2).getMagnitude();
								if (tresult > regionRadius) {
									continue;
								}
							}
							arg.tests = cp;
							if (awayTemp.checkHit(arg)) {
								hits.push(awayTemp);
								continue;
							}
							arg.tests = awaycp[awayTemp.name];
							if (homeTemp.checkHit(arg)) {
								hits.push(awayTemp);
								continue;
							}
						}
					}
				}
				return (hits.length > 0) ? hits : false;
			}
			return false;
		};
		/**
Check all entitys in the Group against each other to see if they are in collision
@method Group.getInGroupEntityHits
@return Array of [ENTITYNAME, ENTITYNAME] Arrays, one for each pair of entitys currently in collision
**/
		my.Group.prototype.getInGroupEntityHits = function() {
			var j,
				jz,
				k,
				kz,
				hits = [],
				homeTemp,
				awayTemp,
				entity = my.entity,
				entitys = this.entitys,
				regionRadius = this.regionRadius,
				v1 = my.workcols.v1,
				v2 = my.workcols.v2,
				ts1,
				ts2,
				tresult,
				cp = {},
				arg = {
					tests: []
				};
			hits.length = 0;
			for (k = 0, kz = entitys.length; k < kz; k++) {
				homeTemp = entity[entitys[k]];
				cp[homeTemp.name] = homeTemp.getCollisionPoints();
			}
			for (k = 0, kz = entitys.length; k < kz; k++) {
				homeTemp = entity[entitys[k]];
				if (homeTemp.visibility) {
					for (j = k + 1, jz = entitys.length; j < jz; j++) {
						awayTemp = entity[entitys[j]];
						if (awayTemp.visibility) {
							if (regionRadius) {
								ts1 = v1.set(homeTemp.currentStart);
								ts2 = v2.set(awayTemp.currentStart);
								tresult = ts1.vectorSubtract(ts2).getMagnitude();
								if (tresult > regionRadius) {
									continue;
								}
							}
							arg.tests = cp[homeTemp.name];
							if (awayTemp.checkHit(arg)) {
								hits.push([homeTemp.name, awayTemp.name]);
								continue;
							}
							arg.tests = cp[awayTemp.name];
							if (homeTemp.checkHit(arg)) {
								hits.push([homeTemp.name, awayTemp.name]);
								continue;
							}
						}
					}
				}
			}
			return hits;
		};
		/**
Check all entitys in this Group against all entitys in the argument Group, to see if they are in collision
@method Group.getBetweenGroupEntityHits
@param {String} g GROUPNAME of Group to be checked against this group; alternatively, the Group object itself can be supplied as the argument
@return Array of [ENTITYNAME, ENTITYNAME] Arrays, one for each pair of entitys currently in collision
**/
		my.Group.prototype.getBetweenGroupEntityHits = function(g) {
			var j,
				jz,
				k,
				kz,
				hits = [],
				thisTemp,
				gTemp,
				xt = my.xt,
				entity = my.entity,
				homeentitys = this.entitys,
				awayentitys,
				v1 = my.workcols.v1,
				v2 = my.workcols.v2,
				regionRadius = this.regionRadius,
				arg = {
					tests: []
				},
				ts1,
				ts2,
				cp = {},
				tresult;
			if (xt(g)) {
				if (g.substring) {
					if (my.group[g]) {
						g = my.group[g];
					}
					else {
						return false;
					}
				}
				else {
					if (!xt(g.type) || g.type !== 'Group') {
						return false;
					}
				}
				awayentitys = g.entitys;
				hits.length = 0;
				for (k = 0, kz = homeentitys.length; k < kz; k++) {
					thisTemp = entity[homeentitys[k]];
					cp[thisTemp.name] = thisTemp.getCollisionPoints();
				}
				for (k = 0, kz = awayentitys.length; k < kz; k++) {
					thisTemp = entity[awayentitys[k]];
					cp[thisTemp.name] = thisTemp.getCollisionPoints();
				}
				for (k = 0, kz = homeentitys.length; k < kz; k++) {
					thisTemp = entity[homeentitys[k]];
					if (thisTemp.visibility) {
						for (j = 0, jz = awayentitys.length; j < jz; j++) {
							gTemp = entity[awayentitys[j]];
							if (gTemp.visibility) {
								if (regionRadius) {
									ts1 = v1.set(thisTemp.currentStart);
									ts2 = v2.set(gTemp.currentStart);
									tresult = ts1.vectorSubtract(ts2).getMagnitude();
									if (tresult > regionRadius) {
										continue;
									}
								}
								arg.tests = cp[thisTemp.name];
								if (gTemp.checkHit(arg)) {
									hits.push([thisTemp.name, gTemp.name]);
									continue;
								}
								arg.tests = cp[gTemp.name];
								if (thisTemp.checkHit(arg)) {
									hits.push([thisTemp.name, gTemp.name]);
									continue;
								}
							}
						}
					}
				}
				return hits;
			}
			return false;
		};
		/**
Check all entitys in this Group against a &lt;canvas&gt; element's collision field image

If no argument is supplied, the Group's default Cell's &lt;canvas&gt; element will be used for the check

An Array of Arrays is returned, with each constituent array consisting of the the SPRITENAME of the entity that has reported a positive hit, alongside a coordinate Vector of where the collision is occuring
@method Group.getFieldEntityHits
@param {String} [cell] CELLNAME of Cell whose &lt;canvas&gt; element is to be used for the check
@return Array of [ENTITYNAME, Vector] Arrays
**/
		my.Group.prototype.getFieldEntityHits = function(cell) {
			var j,
				jz,
				entity = my.entity,
				entitys = this.entitys,
				bool = my.isa_bool,
				hits = [],
				result;
			cell = (my.xt(cell)) ? cell : this.cell;
			hits.length = 0;
			for (j = 0, jz = entitys.length; j < jz; j++) {
				result = entity[entitys[j]].checkField(cell);
				if (!bool(result)) {
					hits.push([entitys[j], result]);
				}
			}
			return hits;
		};

		my.work.d.Entity.fieldChannel = 'anycolor';
		my.work.d.Entity.fieldTest = 0;
		my.work.d.Entity.collisionVectors = [];
		my.work.d.Entity.collisionPoints = [];
		my.work.d.Entity.collisionArray = [];
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
		/**
Recalculate the current collision point positions for all entitys in the group

@method Group.resetCollisionPoints
@return this
@chainable
**/
		my.Group.prototype.resetCollisionPoints = function() {
			var entity = my.entity,
				entitys = this.entitys;
			for (var i = 0, iz = entitys.length; i < iz; i++) {
				entity[entitys[i]].resetCollisionPoints();
			}
			return this;
		};
		/**
Entity constructor hook function - modified by collisions module
@method Entity.collisionsEntityConstructor
@private
**/
		my.Entity.prototype.collisionsEntityConstructor = function(items) {
			var xt = my.xt;
			if (xt(items.field)) {
				this.addEntityToCellFields();
			}
			if (xt(items.fence)) {
				this.addEntityToCellFences();
			}
		};
		/**
Entity.registerInLibrary hook function - modified by collisions module
@method Entity.collisionsEntityRegisterInLibrary
@private
**/
		my.Entity.prototype.collisionsEntityRegisterInLibrary = function() {
			this.collisionVectors = [];
			this.collisionArray = [];
			this.parseCollisionPoints();
			return this;
		};
		/**
Entity.set hook function - modified by collisions module
@method Entity.collisionsEntitySet
@private
**/
		my.Entity.prototype.collisionsEntitySet = function(items) {
			var xt = my.xt,
				xto = my.xto;
			if (xt(items.collisionPoints)) {
				this.parseCollisionPoints();
			}
			if (xto(items.start, items.startX, items.startY, items.handle, items.handleX, items.handleY, items.scale, items.roll)) {
				this.collisionArray.length = 0;
			}
			if (xto(items.collisionPoints, items.width, items.height, items.radius, items.pasteWidth, items.pasteHeight)) {
				this.collisionVectors.length = 0;
			}
			if (xto(items.field, items.fence)) {
				if (xt(items.field)) {
					this.addEntityToCellFields();
				}
				if (xt(items.fence)) {
					this.addEntityToCellFences();
				}
			}
		};
		/**
Recalculate the entity's current collision point positions

This will be triggered automatically when changing the following attributes via set ort setDelta:

* for set() - start, startX, startY, handle, handleX, handleY, scale, roll, collisionPoints, width, height, radius, pasteWidth, pasteHeight
* for setDelta() - start, startX, startY, handle, handleX, handleY, scale, roll, width, height, radius, pasteWidth, pasteHeight

@method Entity.resetCollisionPoints
@return this
@chainable
**/
		my.Entity.prototype.resetCollisionPoints = function() {
			this.collisionArray.length = 0;
			return this;
		};
		/**
Entity.setDelta hook function - modified by collisions module
@method Entity.collisionsEntitySetDelta
@private
**/
		my.Entity.prototype.collisionsEntitySetDelta = function(items) {
			var xto = my.xto;
			if (xto(items.start, items.startX, items.startY, items.handle, items.handleX, items.handleY, items.scale, items.roll)) {
				this.collisionArray.length = 0;
			}
			if (xto(items.width, items.height, items.radius, items.pasteWidth, items.pasteHeight)) {
				this.collisionVectors.length = 0;
			}
		};
		/**
Add this entity to a (range of) Cell object field groups
@method Entity.addEntityToCellFields
@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
@return This
@chainable
**/
		my.Entity.prototype.addEntityToCellFields = function(cells) {
			var i,
				iz,
				cell = my.cell,
				group = my.group;
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (i = 0, iz = cells.length; i < iz; i++) {
				if (cell[cells[i]]) {
					group[cells[i] + '_field'].addEntitysToGroup(this.name);
				}
			}
			return this;
		};
		/**
Add this entity to a (range of) Cell object fence groups
@method Entity.addEntityToCellFences
@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
@return This
@chainable
**/
		my.Entity.prototype.addEntityToCellFences = function(cells) {
			var i,
				iz,
				cell = my.cell,
				group = my.group;
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (i = 0, iz = cells.length; i < iz; i++) {
				if (cell[cells[i]]) {
					group[cells[i] + '_fence'].addEntitysToGroup(this.name);
				}
			}
			return this;
		};
		/**
Remove this entity from a (range of) Cell object field groups
@method Entity.removeEntityFromCellFields
@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
@return This
@chainable
**/
		my.Entity.prototype.removeEntityFromCellFields = function(cells) {
			var i,
				iz,
				cell = my.cell,
				group = my.group;
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (i = 0, iz = cells.length; i < iz; i++) {
				if (cell[cells[i]]) {
					group[cells[i] + '_field'].removeEntitysFromGroup(this.name);
				}
			}
			return this;
		};
		/**
Remove this entity from a (range of) Cell object fence groups
@method Entity.removeEntityFromCellFences
@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
@return This
@chainable
**/
		my.Entity.prototype.removeEntityFromCellFences = function(cells) {
			var i,
				iz,
				cell = my.cell,
				group = my.group;
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (i = 0, iz = cells.length; i < iz; i++) {
				if (cell[cells[i]]) {
					group[cells[i] + '_fence'].removeEntitysFromGroup(this.name);
				}
			}
			return this;
		};
		/**
Check this entity's collision Vectors against a Cell object's collision field image to see if any of them are colliding with the Cell's field entitys
@method Entity.checkField
@param {String} [cell] CELLNAME String of the Cell to be checked against
@return First Vector coordinate to 'pass' the Cell.checkFieldAt() function's test; true if none pass; false if the test parameters are out of bounds
**/
		my.Entity.prototype.checkField = function(cell) {
			var arg = {
				coordinates: [],
				test: 0,
				channel: ''
			};
			cell = (cell) ? my.cell[cell] : my.cell[my.group[this.group].cell];
			arg.coordinates = this.getCollisionPoints();
			arg.test = this.get('fieldTest');
			arg.channel = this.get('fieldChannel');
			return cell.checkFieldAt(arg);
		};
		/**
Calculate the current positions of this entity's collision Vectors, taking into account the entity's current position, roll and scale
@method Entity.getCollisionPoints
@return Array of coordinate Vectors
**/
		my.Entity.prototype.getCollisionPoints = function() {
			var i,
				iz,
				v = my.work.v,
				collisionVectors = this.collisionVectors,
				collisionArray = this.collisionArray,
				reverse = this.flipReverse,
				upend = this.flipUpend,
				roll = this.roll,
				scale = this.scale,
				start = this.currentStart;
			if (collisionVectors.length === 0) {
				if (my.xt(this.collisionPoints)) {
					this.buildCollisionVectors();
					collisionArray.length = 0;
				}
			}
			if (collisionArray.length === 0) {
				for (i = 0, iz = collisionVectors.length; i < iz; i += 2) {
					v.x = (reverse) ? -collisionVectors[i] : collisionVectors[i];
					v.y = (upend) ? -collisionVectors[i + 1] : collisionVectors[i + 1];
					if (roll) {
						v.rotate(roll);
					}
					if (scale !== 1) {
						v.scalarMultiply(scale);
					}
					v.vectorAdd(start);
					collisionArray.push(v.x);
					collisionArray.push(v.y);
				}
			}
			return collisionArray;
		};
		/**
Collision detection helper function

Parses the collisionPoints array to generate coordinate Vectors representing the entity's collision points
@method Entity.buildCollisionVectors
@param {Array} [items] Array of collision point data
@return This
@chainable
@private
**/
		my.Entity.prototype.buildCollisionVectors = function() {
			var i,
				iz,
				o,
				w,
				h,
				xt = my.xt,
				v = my.work.v,
				collisionVectors = this.collisionVectors,
				collisionPoints = this.collisionPoints,
				handle = this.currentHandle;
			if (!handle.flag) {
				this.updateCurrentHandle();
			}
			o = v.set(handle).reverse();
			if (xt(this.localWidth)) {
				w = this.localWidth / this.scale || 0;
				h = this.localHeight / this.scale || 0;
			}
			else if (xt(this.pasteData)) {
				w = this.pasteData.w / this.scale || 0;
				h = this.pasteData.h / this.scale || 0;
			}
			else {
				w = this.width || 0;
				h = this.height || 0;
			}
			this.collisionVectors.length = 0;
			for (i = 0, iz = collisionPoints.length; i < iz; i++) {
				if (collisionPoints[i].substring) {
					switch (collisionPoints[i]) {
						case 'start':
							collisionVectors.push(0);
							collisionVectors.push(0);
							break;
						case 'N':
							collisionVectors.push((w / 2) - o.x);
							collisionVectors.push(-o.y);
							break;
						case 'NE':
							collisionVectors.push(w - o.x);
							collisionVectors.push(-o.y);
							break;
						case 'E':
							collisionVectors.push(w - o.x);
							collisionVectors.push((h / 2) - o.y);
							break;
						case 'SE':
							collisionVectors.push(w - o.x);
							collisionVectors.push(h - o.y);
							break;
						case 'S':
							collisionVectors.push((w / 2) - o.x);
							collisionVectors.push(h - o.y);
							break;
						case 'SW':
							collisionVectors.push(-o.x);
							collisionVectors.push(h - o.y);
							break;
						case 'W':
							collisionVectors.push(-o.x);
							collisionVectors.push((h / 2) - o.y);
							break;
						case 'NW':
							collisionVectors.push(-o.x);
							collisionVectors.push(-o.y);
							break;
						case 'center':
							collisionVectors.push((w / 2) - o.x);
							collisionVectors.push((h / 2) - o.y);
							break;
					}
				}
				else if (my.isa_vector(collisionPoints[i])) {
					collisionVectors.push(collisionPoints[i].x);
					collisionVectors.push(collisionPoints[i].y);
				}
			}
			return this;
		};
		/**
Collision detection helper function

Parses user input for the collisionPoint attribute
@method Entity.parseCollisionPoints
@param {Array} [items] Array of collision point data
@return This
@chainable
@private
**/
		my.Entity.prototype.parseCollisionPoints = function() {
			var i,
				iz,
				j,
				jz,
				myItems = [],
				collisionPoints,
				pu = my.pushUnique;
			if (this.collisionPoints) {
				this.collisionPoints = (Array.isArray(this.collisionPoints)) ? this.collisionPoints : [this.collisionPoints];
				collisionPoints = this.collisionPoints;
				myItems.length = 0;
				for (j = 0, jz = collisionPoints.length; j < jz; j++) {
					myItems.push(collisionPoints[j]);
				}
				collisionPoints.length = 0;
				if (my.xt(myItems)) {
					for (i = 0, iz = myItems.length; i < iz; i++) {
						if (myItems[i].substring) {
							switch (myItems[i].toLowerCase()) {
								case 'all':
									pu(collisionPoints, 'N');
									pu(collisionPoints, 'NE');
									pu(collisionPoints, 'E');
									pu(collisionPoints, 'SE');
									pu(collisionPoints, 'S');
									pu(collisionPoints, 'SW');
									pu(collisionPoints, 'W');
									pu(collisionPoints, 'NW');
									pu(collisionPoints, 'start');
									pu(collisionPoints, 'center');
									break;
								case 'corners':
									pu(collisionPoints, 'NE');
									pu(collisionPoints, 'SE');
									pu(collisionPoints, 'SW');
									pu(collisionPoints, 'NW');
									break;
								case 'edges':
									pu(collisionPoints, 'N');
									pu(collisionPoints, 'E');
									pu(collisionPoints, 'S');
									pu(collisionPoints, 'W');
									break;
								case 'perimeter':
									pu(collisionPoints, 'N');
									pu(collisionPoints, 'NE');
									pu(collisionPoints, 'E');
									pu(collisionPoints, 'SE');
									pu(collisionPoints, 'S');
									pu(collisionPoints, 'SW');
									pu(collisionPoints, 'W');
									pu(collisionPoints, 'NW');
									break;
								case 'north':
								case 'n':
									pu(collisionPoints, 'N');
									break;
								case 'northeast':
								case 'ne':
									pu(collisionPoints, 'NE');
									break;
								case 'east':
								case 'e':
									pu(collisionPoints, 'E');
									break;
								case 'southeast':
								case 'se':
									pu(collisionPoints, 'SE');
									break;
								case 'south':
								case 's':
									pu(collisionPoints, 'S');
									break;
								case 'southwest':
								case 'sw':
									pu(collisionPoints, 'SW');
									break;
								case 'west':
								case 'w':
									pu(collisionPoints, 'W');
									break;
								case 'northwest':
								case 'nw':
									pu(collisionPoints, 'NW');
									break;
								case 'start':
									pu(collisionPoints, 'start');
									break;
								case 'center':
									pu(collisionPoints, 'center');
									break;
							}
						}
						else if (myItems[i].toFixed) {
							collisionPoints.push(myItems[i]);
						}
						else if (my.isa_vector(myItems[i])) {
							collisionPoints.push(myItems[i]);
						}
					}
				}
			}
			return (collisionPoints) ? collisionPoints : [];
		};

		return my;
	}(scrawl));
}
