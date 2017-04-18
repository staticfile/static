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
# scrawlPhysics

## Purpose and features

Adds an (experimental) physics engine to the core

* Adds Particle, Spring and Force objects to the mix
* Defines a number of engines for calculating interactions between these objects

@module scrawlPhysics
**/

if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'physics')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlPhysics extension adaptions to the scrawl-canvas library object

## New library sections

* scrawl.force - for Force objects
* scrawl.spring - for Spring objects
* scrawl.physics - an area for storing physics constants and variables that affect multiple particles

Particle objects are treated like entitys, and stored in the scrawl.entity section of the library

@class window.scrawl_Physics
**/

		/**
An Object containing parameter:value pairs representing the physical parameters within which a physics model operates
@property physics
@type {Object}
**/
		my.physics = {
			/**
Gravity - positive values are assumed to act downwards from the top of the &lt;canvas&gt; element. Measured in meters per second squared
@property physics.gravity
@type Number
@default 9.8
**/
			gravity: 9.8,
			/**
Air density, measured in kilograms per cubic meter; default is air density at seal level
@property physics.airDensity
@type Number
@default 1.23
**/
			airDensity: 1.23,
			/**
Change in time since last update, measured in seconds
@property physics.deltaTime
@type Number
@default 0
**/
			deltaTime: 0,
		};
		/**
Object containing a set of vectors, for physics calculations
@property scrawl.work.workphys
@type {Object}
@private
**/
		my.work.workphys = {
			v1: my.makeVector(),
			v2: my.makeVector(),
			v3: my.makeVector(),
			v4: my.makeVector(),
			v5: my.makeVector(),
		};
		/**
A __general__ function to undertake a round of calculations for Spring objects
@method updateSprings
@param {Array} [items] Array of SPRINGNAMES; defaults to all Spring objects
@return True on success; false otherwise
**/
		my.updateSprings = function(items) {
			var i, iz,
				spring,
				springnames = my.springnames,
				temp;
			if (springnames.length > 0) {
				spring = my.spring;
				items = (Array.isArray(items)) ? items : springnames;
				for (i = 0, iz = items.length; i < iz; i++) {
					temp = items[i];
					if (temp.substring) {
						temp = spring[temp];
					}
					if (temp.type === 'Spring') {
						temp.update();
					}
				}
				return true;
			}
			return false;
		};
		/**
A __general__ function to update Physics elapsed deltaTime
@method updateDeltaTime
@param {Number} [item] new time
@return True on success; false otherwise
**/
		my.updateDeltaTime = function(item) {
			if (my.xt(item)) {
				my.physics.deltaTime = item;
				return true;
			}
			return false;
		};
		/**
scrawl.init hook function - modified by physics module

Initiates two forces:

* force.gravity() - gravity force at sea level
* force.drag() - air drag force at sea level
@method physicsInit
**/
		my.physicsInit = function() {
			my.makeForce({
				name: 'gravity',
				fn: function(ball) {
					ball.load.vectorAdd({
						y: ball.mass * my.physics.gravity
					});
				}
			});
			my.makeForce({
				name: 'drag',
				fn: function(ball) {
					var d, s, df;
					ball.currentVelocity.set(ball.velocity);
					d = ball.currentVelocity.reverse().normalize();
					s = ball.velocity.getMagnitude();
					df = 0.5 * my.physics.airDensity * s * s * ball.area * ball.drag;
					d.scalarMultiply(df);
					ball.load.vectorAdd(d);
				}
			});
		};
		/**
Alias for makeParticle()
@method newParticle
@deprecated
**/
		my.newParticle = function(items) {
			return my.makeParticle(items);
		};
		/**
Alias for makeSpring()
@method newSpring
@deprecated
**/
		my.newSpring = function(items) {
			return my.makeSpring(items);
		};
		/**
Alias for makeForce()
@method newForce
@deprecated
**/
		my.newForce = function(items) {
			return my.makeForce(items);
		};
		/**
A __factory__ function to generate new Particle objects
@method makeParticle
@param {Object} items Key:value Object argument for setting attributes
@return Particle object
**/
		my.makeParticle = function(items) {
			return new my.Particle(items);
		};
		/**
A __factory__ function to generate new Spring objects
@method makeSpring
@param {Object} items Key:value Object argument for setting attributes
@return Spring object
**/
		my.makeSpring = function(items) {
			return new my.Spring(items);
		};
		/**
A __factory__ function to generate new Force objects
@method makeForce
@param {Object} items Key:value Object argument for setting attributes
@return Force object
**/
		my.makeForce = function(items) {
			return new my.Force(items);
		};

		/**
# Particle

## Instantiation

* scrawl.makeParticle()

## Purpose

* Defines Particle object, for physics simulations

## Access

* scrawl.entity.PARTICLENAME - for the Animation object

@class Particle
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Particle = function(items) {
			var vec = my.makeVector,
				d = my.work.d.Particle,
				r,
				get = my.xtGet;
			my.Base.call(this, items);
			items = my.safeObject(items);
			this.place = vec();
			this.currentPlace = vec();
			this.velocity = vec();
			this.currentVelocity = vec();
			this.set(items);
			this.priorPlace = vec(this.place);
			this.engine = get(items.engine, 'euler');
			this.userVar = get(items.userVar, {});
			this.mobile = (my.isa_bool(items.mobile)) ? items.mobile : true;
			this.forces = get(items.forces, []);
			this.springs = get(items.springs, []);
			this.mass = get(items.mass, d.mass);
			this.elasticity = get(items.elasticity, d.elasticity);
			this.radius = get(items.radius, d.radius);
			this.area = get(items.area, d.area);
			if (my.xto(items.radius, items.area)) {
				r = this.radius;
				this.area = items.area || 2 * Math.PI * r * r || d.area;
			}
			this.drag = get(items.drag, d.drag);
			this.load = vec();
			my.entity[this.name] = this;
			my.pushUnique(my.entitynames, this.name);
			this.group = my.Entity.prototype.getGroup.call(this, items);
			my.group[this.group].addEntitysToGroup(this.name);
			return this;
		};
		my.Particle.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Particle'
@final
**/
		my.Particle.prototype.type = 'Particle';
		my.Particle.prototype.classname = 'entitynames';
		my.Particle.prototype.order = 0; //included to allow normal entitys to sort themselves properly
		my.work.d.Particle = {
			/**
Current group
@property group
@type String
@default ''
**/
			group: '',
			/**
Current order
@property order
@type Number
@default 0
**/
			order: 0,
			/**
Mobility flag; when false, particle is fixed to the Cell at its position attribute coordinate vector
@property mobile
@type Boolean
@default true
**/
			mobile: true,
			/**
Particle mass value, in kilograms
@property mass
@type Number
@default 1
**/
			mass: 1,
			/**
Particle radius, in meters
@property radius
@type Number
@default 0.1
**/
			radius: 0.1,
			/**
Projected surface area - assumed to be of a sphere - in square meters
@property area
@type Number
@default 0.03
**/
			area: 0.03,
			/**
Air drag coefficient - assumed to be operating on a smooth sphere
@property drag
@type Number
@default 0.42
**/
			drag: 0.42,
			/**
Elasticity coefficient, where 0.0 = 100% elastic and 1.0 is 100% inelastic
@property elasticity
@type Number
@default 1
**/
			elasticity: 1,
			/**
Object in which user key:value pairs can be stored - clonable

@property userVar
@type Object
@default {}
**/
			userVar: {},
			/**
Position vector - assume 1 pixel = 1 meter

Vector attributes can be set using the following alias attributes:

* place.x - __startX__ or __start.x__
* place.y - __startY__ or __start.y__
@property place
@type Vector
@default Zero values vector
**/
			place: {
				x: 0,
				y: 0,
				z: 0
			},
			/**
Velocity vector - assume 1 pixel = 1 meter per second

Vector attributes can be set using the following alias attributes:

* velocity.x - __deltaX__ or __delta.x__
* velocity.y - __deltaY__ or __delta.y__
@property velocity
@type Vector
@default Zero values vector
**/
			velocity: {
				x: 0,
				y: 0,
				z: 0
			},
			/**
Particle calculator engine - a String value. 

Current engines include: 'rungeKutter' (most accurate), 'improvedEuler', 'euler' (default)
@property engine
@type String
@default 'euler'
**/
			engine: 'euler',
			/**
An Array containing FORCENAME Strings and/or force Functions
@property forces
@type Array
@default []
**/
			forces: [],
			/**
An Array containing SPRINGNAME Strings
@property springs
@type Array
@default []
**/
			springs: [],
			/**
Load Vector - recreated at the start of every calculation cycle iteration
@property load
@type Vector
@default Zero vector
@private
**/
			load: my.makeVector(),
		};
		my.mergeInto(my.work.d.Particle, my.work.d.Scrawl);
		/**
Particle.getStartValues
@method getStartValues
@return Object containing x and y Number attributes representing the particle's current position with respect to its Cell's top left hand corner
**/
		my.Particle.prototype.getStartValues = function() {
			var start = this.place;
			return {
				x: start.x,
				y: start.y
			};
		};
		/**
Augments Base.set()

Allows users to set the Particle's position and velocity attributes using startX, startY, start, deltaX, deltaY, delta or velocity, velocityX, velocityY values (delta and velocity are synonyms for each other)
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Particle.prototype.set = function(items) {
			var temp, temp2,
				xto = my.xto,
				vec = my.makeVector,
				get = my.xtGet,
				velocity,
				place,
				so = my.safeObject;
			items = so(items);
			temp = this.velocity;
			my.Base.prototype.set.call(this, items);
			this.velocity = temp;
			if (!this.place.type || this.place.type !== 'Vector') {
				this.place = vec(items.place || this.place);
			}
			if (xto(items.start, items.startX, items.startY)) {
				temp = so(items.start);
				place = this.place;
				place.x = get(items.startX, temp.x, place.x);
				place.y = get(items.startY, temp.y, place.y);
			}
			if (!this.velocity.type || this.velocity.type !== 'Vector') {
				this.velocity = vec(items.velocity || this.velocity);
			}
			if (xto(items.delta, items.deltaX, items.deltaY, items.velocity, items.velocityX, items.velocityY)) {
				temp = so(items.delta);
				temp2 = so(items.velocity);
				velocity = this.velocity;
				velocity.x = get(items.velocityX, items.deltaX, temp.x, temp2.x, velocity.x);
				velocity.y = get(items.velocityY, items.deltaY, temp.y, temp2.y, velocity.y);
			}
			return this;
		};
		/**
Augments Base.clone()
@method clone
@param {Object} items Object consisting of key:value attributes
@return Cloned Particle object
@chainable
**/
		my.Particle.prototype.clone = function(items) {
			var a,
				i,
				iz;
			a = my.Base.prototype.clone.call(this, items);
			a.place = my.makeVector(a.place);
			a.velocity = my.makeVector(a.velocity);
			a.forces = [];
			for (i = 0, iz = this.forces.length; i < iz; i++) {
				a.forces.push(this.forces[i]);
			}
			return a;
		};
		/**
Add a force to the forces array
@method addForce
@param {Object} item Anonymous Function, or FORCENAME String
@return This
@chainable
**/
		my.Particle.prototype.addForce = function(item) {
			if (my.xt(item)) {
				this.forces.push(item);
			}
			return this;
		};
		my.Particle.prototype.revert = function() {
			this.place.set(this.priorPlace);
			return this;
		};
		/**
Undertake a calculation cycle iteration
@method stamp
@return This
@chainable
**/
		my.Particle.prototype.stamp = function() {
			var actions = this.stampActions;
			if (this.mobile) {
				this.calculateLoads();
				actions[this.engine](this);
			}
			return this;
		};
		/**
stamp helper object
@method stampActions (not a function)
@return This
@chainable
**/
		my.Particle.prototype.stampActions = {
			improvedEuler: function(item) {
				item.updateImprovedEuler();
			},
			rungeKutter: function(item) {
				item.updateRungeKutter();
			},
			euler: function(item) {
				item.updateEuler();
			}
		};
		/**
Alias for Particle.stamp()
@method forceStamp
@return This
@chainable
**/
		my.Particle.prototype.forceStamp = function() {
			return this.stamp();
		};
		/**
Alias for Particle.stamp()
@method update
@return This
@chainable
**/
		my.Particle.prototype.update = function() {
			return this.stamp();
		};
		/**
Calculate the loads (via forces) acting on the particle for this calculation cycle iteration
@method calculateLoads
@return This
@chainable
@private
**/
		my.Particle.prototype.calculateLoads = function() {
			var i,
				iz,
				force = my.force,
				forces = this.forces,
				spring = my.spring,
				springs = this.springs,
				load = this.load,
				temp;
			load.zero();
			for (i = 0, iz = forces.length; i < iz; i++) {
				temp = forces[i];
				if (temp.substring && force[temp]) {
					force[temp].run(this);
				}
				else {
					temp(this);
				}
			}
			for (i = 0, iz = springs.length; i < iz; i++) {
				temp = spring[springs[i]];
				if (temp.start === this.name) {
					load.vectorAdd(temp.force);
				}
				else if (temp.end === this.name) {
					load.vectorSubtract(temp.force);
				}
			}
			return this;
		};
		/**
Calculation cycle engine
@method updateEuler
@return This
@chainable
@private
**/
		my.Particle.prototype.updateEuler = function() {
			var dtime = my.physics.deltaTime,
				v1 = my.work.workphys.v1,
				vel = this.currentVelocity,
				v = this.velocity;
			vel.set(v);
			v1.set(this.load).scalarDivide(this.mass).scalarMultiply(dtime);
			vel.vectorAdd(v1);
			v.set(vel);
			this.priorPlace.set(this.place);
			this.place.vectorAdd(vel.scalarMultiply(dtime));
			return this;
		};
		/**
Calculation cycle engine
@method updateImprovedEuler
@return This
@chainable
@private
**/
		my.Particle.prototype.updateImprovedEuler = function() {
			var v1,
				v2,
				v3,
				w = this.currentVelocity,
				v = this.velocity,
				wp = my.work.workphys,
				dtime = my.physics.deltaTime;
			w.set(v);
			v1 = wp.v1.set(this.load).scalarDivide(this.mass).scalarMultiply(dtime);
			v2 = wp.v2.set(this.load).vectorAdd(v1).scalarDivide(this.mass).scalarMultiply(dtime);
			v3 = v1.vectorAdd(v2).scalarDivide(2);
			w.vectorAdd(v3);
			v.set(w);
			this.priorPlace.set(this.place);
			this.place.vectorAdd(w.scalarMultiply(dtime));
			return this;
		};
		/**
Calculation cycle engine
@method updateRungeKutter
@return This
@chainable
@private
**/
		my.Particle.prototype.updateRungeKutter = function() {
			var v1,
				v2,
				v3,
				v4,
				v5,
				v = this.velocity,
				w = this.currentVelocity,
				wp = my.work.workphys,
				dtime = my.physics.deltaTime;
			w.set(v);
			v1 = wp.v1.set(this.load).scalarDivide(this.mass).scalarMultiply(dtime).scalarDivide(2);
			v2 = wp.v2.set(this.load).vectorAdd(v1).scalarDivide(this.mass).scalarMultiply(dtime).scalarDivide(2);
			v3 = wp.v3.set(this.load).vectorAdd(v2).scalarDivide(this.mass).scalarMultiply(dtime);
			v4 = wp.v4.set(this.load).vectorAdd(v3).scalarDivide(this.mass).scalarMultiply(dtime);
			v5 = wp.v5;
			v2.scalarMultiply(2);
			v3.scalarMultiply(2);
			v5.set(v1).vectorAdd(v2).vectorAdd(v3).vectorAdd(v4).scalarDivide(6);
			w.vectorAdd(v5);
			v.set(w);
			this.priorPlace.set(this.place);
			this.place.vectorAdd(w.scalarMultiply(dtime));
			return this;
		};
		/**
Calculation cycle engine - linear particle collisions
@method linearCollide
@return This
@chainable
@private
**/
		my.Particle.prototype.linearCollide = function(b) {
			var normal,
				relVelocity,
				impactScalar,
				impact,
				wp = my.work.workphys,
				v = this.velocity,
				m = this.mass;
			normal = wp.v1.set(this.place).vectorSubtract(b.place).normalize();
			relVelocity = wp.v2.set(v).vectorSubtract(b.velocity);
			impactScalar = relVelocity.getDotProduct(normal);
			impact = wp.v3;
			impactScalar = -impactScalar * (1 + ((this.elasticity + b.elasticity) / 2));
			impactScalar /= ((1 / m) + (1 / b.mass));
			impact.set(normal).scalarMultiply(impactScalar);
			v.vectorAdd(impact.scalarDivide(m));
			b.velocity.vectorAdd(impact.scalarDivide(b.mass).reverse());
			return this;
		};
		/**
Create a new Spring object and add it to this, and another, Particle objects' springs array

Argument can be either a PARTICLENAME String, or an Object which includes an __end__ attribute set to a PARTICLENAME String
@method addSpring
@param {Object} items Object consisting of key:value attributes; alternatively, use a PARTICLENAME String
@return This
@chainable
**/
		my.Particle.prototype.addSpring = function(items) {
			var mySpring,
				end,
				arg = {
					start: null,
					end: null
				},
				e = my.entity,
				pu = my.pushUnique,
				makeSpring = my.makeSpring;
			if (items.substring && e[items]) {
				end = items;
				arg.start = this.name;
				arg.end = items;
				mySpring = makeSpring(arg);
			}
			else {
				items = my.safeObject(items);
				end = items.end || false;
				if (end && e[end]) {
					items.start = this.name;
					mySpring = makeSpring(items);
				}
			}
			if (mySpring) {
				pu(this.springs, mySpring.name);
				pu(e[end].springs, mySpring.name);
			}
			return this;
		};
		/**
Delete all springs associated with this Particle
@method removeSprings
@return This
@chainable
**/
		my.Particle.prototype.removeSprings = function() {
			var i,
				iz,
				temp,
				spring = my.spring;
			temp = this.springs.slice(0);
			for (i = 0, iz = temp.length; i < iz; i++) {
				spring[temp[i]].kill();
			}
			return this;
		};
		/**
Delete a named Spring object from this Particle
@method removeSpringsTo
@param {String} item SPRINGNAME String
@return This
@chainable
**/
		my.Particle.prototype.removeSpringsTo = function(item) {
			var i,
				iz,
				temp = [],
				s,
				spring = my.spring,
				springs = this.springs;
			if (my.xt(item) && my.entity[item]) {
				for (i = 0, iz = springs.length; i < iz; i++) {
					s = spring[springs[i]];
					if (s.start === this.name || s.end === this.name) {
						temp.push(springs[i]);
					}
				}
				for (i = 0, iz = temp.length; i < iz; i++) {
					spring[temp[i]].kill();
				}
			}
			return this;
		};
		//the following dummy functions allow Particle objects to play nicely as part of a wider entity Group object
		/**
Dummy function - required to allow Particles to be processed alongside Entity objects
@method pickupEntity
@return This
@chainable
**/
		my.Particle.prototype.pickupEntity = function(item) {
			return this;
		};
		/**
Dummy function - required to allow Particles to be processed alongside Entity objects
@method dropEntity
@return This
@chainable
**/
		my.Particle.prototype.dropEntity = function(item) {
			return this;
		};
		/**
Dummy function - required to allow Particles to be processed alongside Entity objects
@method updateStart
@return This
@chainable
**/
		my.Particle.prototype.updateStart = function() {
			return this;
		};

		my.pushUnique(my.work.sectionlist, 'spring');
		my.pushUnique(my.work.nameslist, 'springnames');
		/**
# Spring

## Instantiation

* scrawl.makeSpring()
* Particle.addSpring()

## Purpose

* Defines a Spring object connecting two Particle objects

## Access

* scrawl.spring.SPRINGNAME - for the Spring object

@class Spring
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Spring = function Spring(items) {
			var b1,
				b2,
				r,
				vec = my.makeVector,
				e = my.entity;
			items = my.safeObject(items);
			if (my.xta(items.start, items.end)) {
				b1 = e[items.start];
				b2 = e[items.end];
				my.Base.call(this, items);
				this.start = items.start;
				this.end = items.end;
				this.springConstant = items.springConstant || 1000;
				this.damperConstant = items.damperConstant || 100;
				if (my.xt(items.restLength)) {
					this.restLength = items.restLength;
				}
				else {
					r = my.work.workphys.v1.set(b2.place);
					r.vectorSubtract(b1.place);
					this.restLength = r.getMagnitude();
				}
				this.currentLength = items.currentLength || this.restLength;
				this.force = vec();
				this.currentForce = vec();
				my.spring[this.name] = this;
				my.pushUnique(my.springnames, this.name);
				return this;
			}
			return false;
		};
		my.Spring.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Spring'
@final
**/
		my.Spring.prototype.type = 'Spring';
		my.Spring.prototype.classname = 'springnames';
		my.work.d.Spring = {
			/**
First Particle PARTICLENAME
@property start
@type String
@default ''
**/
			start: '',
			/**
Second Particle PARTICLENAME
@property end
@type String
@default ''
**/
			end: '',
			/**
Spring constant
@property springConstant
@type Number
@default 1000
**/
			springConstant: 1000,
			/**
Spring damper constant
@property damperConstant
@type Number
@default 100
**/
			damperConstant: 100,
			/**
Rest length, in pixels, between the Spring object's two Particle objects
@property restLength
@type Number
@default 1
**/
			restLength: 1,
			/**
Current length, in pixels, between the Spring object's two Particle objects

Recalculated as part of each  calculation cycle iteration
@property currentLength
@type Number
@default 1
@private
**/
			currentLength: 1,
			/**
Vector representing the Spring object's current force on its Particles

Recalculated as part of each  calculation cycle iteration
@property force
@type Vector
@default Zero value vector
@private
**/
			force: {
				x: 0,
				y: 0,
				z: 0
			},
		};
		my.mergeInto(my.work.d.Spring, my.work.d.Scrawl);
		/**
Calculate the force exerted by the spring for this calculation cycle iteration
@method update
@return This
@chainable
@private
**/
		my.Spring.prototype.update = function() {
			var vr,
				r,
				r_norm,
				r_norm2,
				wp = my.work.workphys,
				e = my.entity,
				eStart = e[this.start],
				eEnd = e[this.end];
			vr = wp.v1.set(eEnd.velocity).vectorSubtract(eStart.velocity);
			r = wp.v2.set(eEnd.place).vectorSubtract(eStart.place);
			r_norm = wp.v3.set(r).normalize();
			r_norm2 = wp.v4.set(r_norm);
			this.force.set(r_norm.scalarMultiply(this.springConstant * (r.getMagnitude() - this.restLength)).vectorAdd(vr.vectorMultiply(r_norm2).scalarMultiply(this.damperConstant).vectorMultiply(r_norm2)));
			return this;
		};
		/**
Remove this Spring from its Particle objects, and from the scrawl-canvas library
@method kill
@return Always true
**/
		my.Spring.prototype.kill = function() {
			var ri = my.removeItem,
				e = my.entity,
				name = this.name;
			ri(e[this.start].springs, name);
			ri(e[this.end].springs, name);
			delete my.spring[name];
			ri(my.springnames, name);
			return true;
		};

		my.pushUnique(my.work.sectionlist, 'force');
		my.pushUnique(my.work.nameslist, 'forcenames');
		/**
# Force

## Instantiation

* scrawl.makeForce()

## Purpose

* Defines a Force function that can calculate forces on Particle objects

Two forces are pre-defined by scrawl-canvas:

* __scrawl.force.gravity__ - calculates the gravitational force acting on a Particle, as determined by the _scrawl.physics.gravity_ value and the Particle's _mass_
* __scrawl.force.drag__ - calculates the air drag force acting on a Particle, as determined by the scrawl.physics.airDensity value, and the Particle's _area_ and _drag_ attribute values
@class Force
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Force = function Force(items) {
			my.Base.call(this, items);
			items = my.safeObject(items);
			this.fn = items.fn || function() {};
			my.force[this.name] = this;
			my.pushUnique(my.forcenames, this.name);
			return this;
		};
		my.Force.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Force'
@final
**/
		my.Force.prototype.type = 'Force';
		my.Force.prototype.classname = 'forcenames';
		my.work.d.Force = {
			/**
Anonymous function for calculating a force on a Particle

Functions need to be in the form:

	function(ball){
		//get or build a Vector object to hold the result
		var result = scrawl.makeVector();	//creating the vector
		var result = scrawl.work.workphys.v1;	//using an existing work vector: scrawl.work.workphys.v1 to v5

		//calculate the force - Particle attributes are available via the _ball_ argument
		
		//add the force to the Particle's load Vector
		ball.load.vectorAdd(result);
		}

@property fn
@type Function
@default function(){}
**/
			fn: function() {},
		};
		my.mergeInto(my.work.d.Force, my.work.d.Scrawl);
		/**
Calculate the force for this calculation cycle iteration
@method run
@return force Vector, as defined in the force function
**/
		my.Force.prototype.run = function(item) {
			return this.fn(item);
		};
		/**
Remove this Force from the scrawl-canvas library
@method kill
@return Always true
**/
		my.Force.prototype.kill = function() {
			delete my.force[this.name];
			my.removeItem(my.forcenames, this.name);
			return true;
		};

		return my;
	}(scrawl));
}
