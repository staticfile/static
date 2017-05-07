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
# scrawlSaveLoad

## Purpose and features

Adds the ability to save and load Scrawl objects and scenes as JSON strings

_This extension is experimental and thus likely to change significantly as scrawl-canvas evolves_

@module scrawlSaveLoad
**/

if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'saveload')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlSaveLoad extension adaptions to the scrawl-canvas library object

@class window.scrawl_SaveLoad
**/

		/**
A __load__ function

Argument should be a JSON String, or an Array of JSON Strings, of objects to be loaded or updated
@method load
@param {Array} item Array of JSON Strings; alternatively, a JSON String
@return Always true
**/
		my.load = function(item) {
			var a, //object from item
				type,
				b, //existing object settings
				c, //defaults
				k; //a keys
			if (item.substring) {
				item = [item];
			}
			for (var i = 0, z = item.length; i < z; i++) {
				if (item[i].substring) {
					a = JSON.parse(item[i]);
					if (my.xt(a.type)) {
						type = a.type.toLowerCase();
						if (my.contains(my[a.classname], a.name)) {
							//update
							b = my[type][a.name].parse();
							c = my.work.d[a.type];
							k = Object.keys(b);
							for (var j = 0, w = k.length; j < w; j++) {
								if (!my.xt(a[k])) {
									a[k] = c[k];
								}
							}
							my[type][a.name].set(a);
						}
						else {
							//create
							switch (type) {
								case 'pad':
									my.addCanvasToPage(a);
									my.work.currentPad = a.name;
									break;
								case 'cell':
									if (my.xt(a.pad) && my.contains(my.padnames, a.pad) && !my.contains(my.pad[a.pad].cells, a.name)) {
										my.pad[a.pad].addNewCell(a);
									}
									break;
								case 'group':
									my.makeGroup(a);
									break;
								case 'path':
									my.makePath(a);
									break;
								case 'gradient':
									my.makeGradient(a);
									break;
								case 'radialgradient':
									my.makeRadialGradient(a);
									break;
								default:
									new my[a.type](a);
							}
						}
					}
				}
			}
			return true;
		};
		/**
A __save__ function

Argument should be a String literal: 'pads', 'cells', 'groups', 'entitys', 'designs', 'spriteanimations', 'springs'

_Note: this function does not check for duplicate objects_
@method save
@param {string} item A String literal
@return Array of saved data
**/
		my.save = function(item) {
			var results = [],
				i, iz;
			switch (item) {
				case 'pads':
					for (i = 0, iz = my.padnames.length; i < iz; i++) {
						results = results.concat(my.pad[my.padnames[i]].toString());
					}
					break;
				case 'cells':
					for (i = 0, iz = my.cellnames.length; i < iz; i++) {
						results = results.concat(my.cell[my.cellnames[i]].toString());
					}
					break;
				case 'groups':
					for (i = 0, iz = my.groupnames.length; i < iz; i++) {
						results = results.concat(my.group[my.groupnames[i]].toString());
					}
					break;
				case 'entitys':
					for (i = 0, iz = my.entitynames.length; i < iz; i++) {
						results = results.concat(my.entity[my.entitynames[i]].toString());
					}
					break;
				case 'designs':
					for (i = 0, iz = my.designnames.length; i < iz; i++) {
						results = results.concat(my.design[my.designnames[i]].toString());
					}
					break;
				case 'spriteanimations':
					if (my.xt(my.spriteanimationnames)) {
						for (i = 0, iz = my.spriteanimationnames.length; i < iz; i++) {
							results = results.concat(my.spriteanimation[my.spriteanimationnames[i]].toString());
						}
					}
					break;
				case 'springs':
					if (my.xt(my.springnames)) {
						for (i = 0, iz = my.springnames.length; i < iz; i++) {
							results = results.concat(my.spring[my.springnames[i]].toString());
						}
					}
					break;
			}
			return results;
		};

		/**
Turn the object into a JSON String
@method Base.toString
@return JSON string of non-default value attributes
**/
		my.Base.prototype.toString = function() {
			var keys = Object.keys(my.work.d[this.type]),
				result = {};
			result.type = this.type;
			result.classname = this.classname;
			result.name = this.name;
			for (var i = 0, z = keys.length; i < z; i++) {
				if (my.xt(this[keys[i]]) && this[keys[i]] !== my.work.d[this.type][keys[i]]) {
					result[keys[i]] = this[keys[i]];
				}
			}
			return JSON.stringify(result);
		};

		/**
Turn the object into a JSON String
@method Position.toString
@return JSON string of non-default value attributes
**/
		my.Position.prototype.toString = function() {
			var keys = Object.keys(my.work.d[this.type]),
				result = {},
				blacklist = [];
			result.type = this.type;
			result.classname = this.classname;
			result.name = this.name;
			for (var i = 0, z = keys.length; i < z; i++) {
				if (my.contains(['start', 'delta', 'handle'], keys[i])) {
					if (!this[keys[i]].isLike(my.work.d[this.type][keys[i]])) {
						result[keys[i]] = this[keys[i]];
					}
				}
				else if (my.xt(this[keys[i]]) && this[keys[i]] !== my.work.d[this.type][keys[i]]) {
					result[keys[i]] = this[keys[i]];
				}
			}
			return JSON.stringify(result);
		};

		/**
Turn the object into a JSON String
@method PageElement.toString
@return JSON string of non-default value attributes
**/
		my.PageElement.prototype.toString = function() {
			var keys = Object.keys(my.work.d[this.type]),
				result = {},
				temp;
			result.type = this.type;
			result.classname = this.classname;
			result.name = this.name;
			for (var i = 0, z = keys.length; i < z; i++) {
				if (my.contains(['start', 'delta', 'handle', 'perspective', 'translate'], keys[i])) {
					if (!this[keys[i]].isLike(my.work.d[this.type][keys[i]])) {
						result[keys[i]] = this[keys[i]];
					}
				}
				if (keys[i] === 'rotation') {
					temp = this.rotation.getEulerAngles();
					if (temp.pitch !== 0) {
						result.pitch = temp.pitch;
					}
					if (temp.yaw !== 0) {
						result.yaw = temp.yaw;
					}
					if (temp.roll !== 0) {
						result.roll = temp.roll;
					}
				}
				if (keys[i] === 'deltaRotation') {
					temp = this.rotation.getEulerAngles();
					if (temp.pitch !== 0) {
						result.deltaPitch = temp.pitch;
					}
					if (temp.yaw !== 0) {
						result.deltaYaw = temp.yaw;
					}
					if (temp.roll !== 0) {
						result.deltaRoll = temp.roll;
					}
				}
				else if (my.xt(this[keys[i]]) && this[keys[i]] !== my.work.d[this.type][keys[i]]) {
					result[keys[i]] = this[keys[i]];
				}
			}
			return JSON.stringify(result);
		};

		/**
Turn the object into a JSON String
@method Pad.toString
@param {Boolean} [noexternalobjects] True to exclude external objects such as entitys, designs and groups
@return Array of JSON strings of non-default value attributes
**/
		my.Pad.prototype.toString = function(noexternalobjects) {
			var keys = Object.keys(my.work.d[this.type]),
				result = {},
				resarray = [],
				groups = [],
				entitys = [],
				ctx,
				designs = [],
				blacklist = ['localWidth', 'localHeight', 'mouse', 'displayOffsetX', 'displayOffsetY'],
				i, iz, j, jz;
			result.type = this.type;
			result.classname = this.classname;
			result.name = this.name;
			result.parentElement = my.canvas[this.name].parentElement.id;
			for (i = 0, iz = keys.length; i < iz; i++) {
				if (my.contains(['start', 'delta', 'handle'], keys[i])) {
					if (!this[keys[i]].isLike(my.work.d[this.type][keys[i]])) {
						result[keys[i]] = this[keys[i]];
					}
				}
				else if (my.contains(blacklist, keys[i])) {
					//do nothing
				}
				else if (my.xt(this[keys[i]]) && this[keys[i]] !== my.work.d[this.type][keys[i]]) {
					result[keys[i]] = this[keys[i]];
				}
			}
			resarray.push(JSON.stringify(result));
			if (!noexternalobjects) {
				for (i = 0, iz = this.cells.length; i < iz; i++) {
					for (j = 0, jz = my.cell[this.cells[i]].groups.length; j < jz; j++) {
						my.pushUnique(groups, my.cell[this.cells[i]].groups[j]);
					}
					resarray.push(my.cell[this.cells[i]].toString(true));
				}
				for (i = 0, iz = groups.length; i < iz; i++) {
					for (j = 0, jz = my.group[groups[i]].entitys.length; j < jz; j++) {
						my.pushUnique(entitys, my.group[groups[i]].entitys[j]);
					}
					resarray.push(my.group[groups[i]].toString(true));
				}
				for (i = 0, iz = entitys.length; i < iz; i++) {
					ctx = my.ctx[my.entity[entitys[i]].context];
					if (my.contains(my.designnames, ctx.fillStyle)) {
						my.pushUnique(designs, ctx.fillStyle);
					}
					if (my.contains(my.designnames, ctx.strokeStyle)) {
						my.pushUnique(designs, ctx.strokeStyle);
					}
					if (my.contains(my.designnames, ctx.shadowColor)) {
						my.pushUnique(designs, ctx.shadowColor);
					}
				}
				for (i = 0, iz = designs.length; i < iz; i++) {
					resarray.push(my.design[designs[i]].toString());
				}
				for (i = 0, iz = entitys.length; i < iz; i++) {
					resarray.push(my.entity[entitys[i]].toString(true));
				}
			}
			return resarray;
		};

		/**
Turn the object into a JSON String
@method Cell.toString
@param {Boolean} [noexternalobjects] True to exclude external objects such as entitys, designs and groups
@return Array of JSON strings of non-default value attributes
**/
		my.Cell.prototype.toString = function(noexternalobjects) {
			var keys = Object.keys(my.work.d[this.type]),
				result = {},
				resarray = [],
				entitys = [],
				ctx,
				designs = [],
				blacklist = ['copyData', 'pasteData', 'actualWidth', 'actualHeight'],
				i, iz, j, jz;
			result.type = this.type;
			result.classname = this.classname;
			result.name = this.name;
			for (i = 0, iz = keys.length; i < iz; i++) {
				if (my.contains(['start', 'delta', 'handle', 'copy', 'copyDelta'], keys[i])) {
					if (!this[keys[i]].isLike(my.work.d[this.type][keys[i]])) {
						result[keys[i]] = {
							x: this[keys[i]].x,
							y: this[keys[i]].y
						};
					}
				}
				else if (my.contains(blacklist, keys[i])) {
					//do nothing
				}
				else if (my.xt(this[keys[i]]) && this[keys[i]] !== my.work.d[this.type][keys[i]]) {
					result[keys[i]] = this[keys[i]];
				}
			}
			resarray.push(JSON.stringify(result));
			if (!noexternalobjects) {
				for (i = 0, iz = this.groups.length; i < iz; i++) {
					for (j = 0, jz = my.group[this.groups[i]].entitys.length; j < jz; j++) {
						my.pushUnique(entitys, my.group[this.groups[i]].entitys[j]);
					}
					resarray.push(my.group[this.groups[i]].toString(true));
				}
				for (i = 0, iz = entitys.length; i < iz; i++) {
					ctx = my.ctx[my.entity[entitys[i]].context];
					if (my.contains(my.designnames, ctx.fillStyle)) {
						my.pushUnique(designs, ctx.fillStyle);
					}
					if (my.contains(my.designnames, ctx.strokeStyle)) {
						my.pushUnique(designs, ctx.strokeStyle);
					}
					if (my.contains(my.designnames, ctx.shadowColor)) {
						my.pushUnique(designs, ctx.shadowColor);
					}
				}
				for (i = 0, iz = designs.length; i < iz; i++) {
					resarray.push(my.design[designs[i]].toString());
				}
				for (i = 0, iz = entitys.length; i < iz; i++) {
					resarray.push(my.entity[entitys[i]].toString(true));
				}
			}
			return resarray;
		};
		/**
Turn the object into a JSON String; doesn't include name and type attributes
@method Context.toString
@return JSON string of non-default value attributes
**/
		my.Context.prototype.toString = function() {
			var result = {};
			for (var i = 0, z = my.work.contextKeys.length; i < z; i++) {
				if (my.work.contextKeys[i] === 'lineDash') {
					if (my.xt(this.lineDash) && this.lineDash.length > 0) {
						result.lineDash = this.lineDash;
					}
				}
				else if (my.xt(this[my.work.contextKeys[i]]) && this[my.work.contextKeys[i]] !== my.work.d.Context[my.work.contextKeys[i]]) {
					result[my.work.contextKeys[i]] = this[my.work.contextKeys[i]];
				}
			}
			return JSON.stringify(result);
		};
		/**
Turn the object into a JSON String

Automatically removes the entitys attribute from the result; when loading, existing entitys need to be re-added to the group
@method Group.toString
@param {Boolean} [noentitys] True to exclude the entitys attribute; false will return an array containing this and each of the entitys in the entitys array
@return Array of JSON strings of non-default value attributes
**/
		my.Group.prototype.toString = function(noentitys) {
			var keys = Object.keys(my.work.d[this.type]),
				result = {},
				resarray = [],
				ctx,
				designs = [],
				i, iz;
			result.type = this.type;
			result.classname = this.classname;
			result.name = this.name;
			for (i = 0, iz = keys.length; i < iz; i++) {
				if (my.xt(this[keys[i]]) && this[keys[i]] !== my.work.d[this.type][keys[i]]) {
					result[keys[i]] = this[keys[i]];
				}
			}
			delete result.entitys;
			resarray.push(JSON.stringify(result));
			if (!noentitys) {
				for (i = 0, iz = this.entitys.length; i < iz; i++) {
					ctx = my.ctx[my.entity[this.entitys[i]].context];
					if (my.contains(my.designnames, ctx.fillStyle)) {
						my.pushUnique(designs, ctx.fillStyle);
					}
					if (my.contains(my.designnames, ctx.strokeStyle)) {
						my.pushUnique(designs, ctx.strokeStyle);
					}
					if (my.contains(my.designnames, ctx.shadowColor)) {
						my.pushUnique(designs, ctx.shadowColor);
					}
				}
				for (i = 0, iz = designs.length; i < iz; i++) {
					resarray.push(my.design[designs[i]].toString());
				}
				for (i = 0, iz = this.entitys.length; i < iz; i++) {
					resarray.push(my.entity[this.entitys[i]].toString(true));
				}
			}
			return resarray;
		};

		/**
Turn the object into a JSON String

Retains the entitys attribute Array; does not include any other objects in the return Array
@method Group.save
@return Array of JSON Strings
**/
		my.Group.prototype.save = function() {
			var keys = Object.keys(my.work.d[this.type]),
				result = {};
			result.type = this.type;
			result.classname = this.classname;
			result.name = this.name;
			for (var i = 0, z = keys.length; i < z; i++) {
				if (my.xt(this[keys[i]]) && this[keys[i]] !== my.work.d[this.type][keys[i]]) {
					result[keys[i]] = this[keys[i]];
				}
			}
			return [JSON.stringify(result)];
		};

		/**
Turn the object into a JSON String
@method Entity.toString
@return JSON string of non-default value attributes, including non-default context values
**/
		my.Entity.prototype.toString = function(noexternalobjects) {
			noexternalobjects = (my.xt(noexternalobjects)) ? noexternalobjects : false;
			var keys = Object.keys(my.work.d[this.type]),
				result = {},
				ctx = my.ctx[this.context],
				ctxArray,
				designs = [],
				resarray = [],
				vectorslist = ['start', 'delta', 'handle', 'copy'],
				blacklist = ['collisionVectors', 'dataSet', 'pointList', 'firstPoint', 'linkList', 'linkDurations', 'perimeterLength', 'style', 'variant', 'weight', 'size', 'metrics', 'family', 'texts', 'copyData', 'pasteData', 'localHeight', 'localWidth'];
			result.type = this.type;
			result.classname = this.classname;
			result.name = this.name;
			if (!noexternalobjects) {
				if (ctx && ctx.fillStyle && my.contains(my.designnames, ctx.fillStyle)) {
					my.pushUnique(designs, ctx.fillStyle);
				}
				if (ctx && ctx.strokeStyle && my.contains(my.designnames, ctx.strokeStyle)) {
					my.pushUnique(designs, ctx.strokeStyle);
				}
				if (ctx && ctx.shadowColor && my.contains(my.designnames, ctx.shadowColor)) {
					my.pushUnique(designs, ctx.shadowColor);
				}
				for (var k = 0, kz = designs.length; k < kz; k++) {
					resarray.push(my.design[designs[k]].toString());
				}
			}
			for (var i = 0, iz = keys.length; i < iz; i++) {
				if (my.contains(vectorslist, keys[i])) {
					if (!this[keys[i]].isLike(my.work.d[this.type][keys[i]])) {
						result[keys[i]] = {
							x: this[keys[i]].x,
							y: this[keys[i]].y
						};
					}
				}
				else if (keys[i] === 'context' && my.xt(my.ctx[this.context])) {
					ctx = JSON.parse(my.ctx[this.context].toString());
					ctxArray = Object.keys(ctx);
					for (var j = 0, jz = ctxArray.length; j < jz; j++) {
						result[ctxArray[j]] = ctx[ctxArray[j]];
					}
				}
				else if (my.contains(blacklist, keys[i])) {
					//do nothing
				}
				else if (my.xt(this[keys[i]]) && this[keys[i]] !== my.work.d[this.type][keys[i]]) {
					result[keys[i]] = this[keys[i]];
				}
			}
			if (this.type === 'Picture') {
				result.url = my.image[this.source].source;
			}
			resarray.push(JSON.stringify(result).replace('\\n', '\\\\n')); //replace required for multiline Phrase entitys
			return resarray;
		};

		return my;
	}(scrawl));
}
