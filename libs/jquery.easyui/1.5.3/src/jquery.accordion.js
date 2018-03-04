/**
 * EasyUI for jQuery 1.5.3
 * 
 * Copyright (c) 2009-2017 www.jeasyui.com. All rights reserved.
 *
 * Licensed under the freeware license: http://www.jeasyui.com/license_freeware.php
 * To use it on other terms please contact us: info@jeasyui.com
 *
 */
/**
 * accordion - EasyUI for jQuery
 * 
 * Dependencies:
 * 	 panel
 * 
 */
(function($){
	
	// function setSize(container, param){
	// 	var state = $.data(container, 'accordion');
	// 	var opts = state.options;
	// 	var panels = state.panels;
	// 	var cc = $(container);
		
	// 	if (param){
	// 		$.extend(opts, {
	// 			width: param.width,
	// 			height: param.height
	// 		});
	// 	}
	// 	cc._size(opts);
	// 	var headerHeight = 0;
	// 	var bodyHeight = 'auto';
	// 	var headers = cc.find('>.panel>.accordion-header');
	// 	if (headers.length){
	// 		headerHeight = $(headers[0]).css('height', '')._outerHeight();
	// 	}
	// 	if (!isNaN(parseInt(opts.height))){
	// 		bodyHeight = cc.height() - headerHeight*headers.length;
	// 	}
		
	// 	_resize(true, bodyHeight - _resize(false) + 1);
		
	// 	function _resize(collapsible, height){
	// 		var totalHeight = 0;
	// 		for(var i=0; i<panels.length; i++){
	// 			var p = panels[i];
	// 			var h = p.panel('header')._outerHeight(headerHeight);
	// 			if (p.panel('options').collapsible == collapsible){
	// 				var pheight = isNaN(height) ? undefined : (height+headerHeight*h.length);
	// 				p.panel('resize', {
	// 					width: cc.width(),
	// 					height: (collapsible ? pheight : undefined)
	// 				});
	// 				totalHeight += p.panel('panel').outerHeight()-headerHeight*h.length;
	// 			}
	// 		}
	// 		return totalHeight;
	// 	}
	// }

	function setSize(container, param){
		var state = $.data(container, 'accordion');
		var opts = state.options;
		var panels = state.panels;
		var cc = $(container);
		var isHorizontal = (opts.halign=='left' || opts.halign=='right');
		cc.children('.panel-last').removeClass('panel-last');
		cc.children('.panel:last').addClass('panel-last');

		if (param){
			$.extend(opts, {
				width: param.width,
				height: param.height
			});
		}
		cc._size(opts);
		var headerHeight = 0;
		var bodyHeight = 'auto';
		var headers = cc.find('>.panel>.accordion-header');
		if (headers.length){
			if (isHorizontal){
				$(panels[0]).panel('resize', {width:cc.width(),height:cc.height()});
				headerHeight = $(headers[0])._outerWidth();
			} else {
				headerHeight = $(headers[0]).css('height', '')._outerHeight();
			}
		}
		if (!isNaN(parseInt(opts.height))){
			if (isHorizontal){
				bodyHeight = cc.width() - headerHeight*headers.length;
			} else {
				bodyHeight = cc.height() - headerHeight*headers.length;
			}
		}
		
		// _resize(true, bodyHeight - _resize(false) + 1);
		_resize(true, bodyHeight - _resize(false));
		
		function _resize(collapsible, height){
			var totalHeight = 0;
			for(var i=0; i<panels.length; i++){
				var p = panels[i];
				if (isHorizontal){
					var h = p.panel('header')._outerWidth(headerHeight);
				} else {
					var h = p.panel('header')._outerHeight(headerHeight);
				}
				if (p.panel('options').collapsible == collapsible){
					var pheight = isNaN(height) ? undefined : (height+headerHeight*h.length);
					if (isHorizontal){
						p.panel('resize', {
							height: cc.height(),
							width: (collapsible ? pheight : undefined)
						});
						totalHeight += p.panel('panel')._outerWidth()-headerHeight*h.length;
					} else {
						p.panel('resize', {
							width: cc.width(),
							height: (collapsible ? pheight : undefined)
						});
						totalHeight += p.panel('panel').outerHeight()-headerHeight*h.length;
					}
				}
			}
			return totalHeight;
		}
	}
	
	/**
	 * find a panel by specified property, return the panel object or panel index.
	 */
	function findBy(container, property, value, all){
		var panels = $.data(container, 'accordion').panels;
		var pp = [];
		for(var i=0; i<panels.length; i++){
			var p = panels[i];
			if (property){
				if (p.panel('options')[property] == value){
					pp.push(p);
				}
			} else {
				if (p[0] == $(value)[0]){
					return i;
				}
			}
		}
		if (property){
			return all ? pp : (pp.length ? pp[0] : null);
		} else {
			return -1;
		}
	}
	
	function getSelections(container){
		return findBy(container, 'collapsed', false, true);
	}
	
	function getSelected(container){
		var pp = getSelections(container);
		return pp.length ? pp[0] : null;
	}
	
	/**
	 * get panel index, start with 0
	 */
	function getPanelIndex(container, panel){
		return findBy(container, null, panel);
	}
	
	/**
	 * get the specified panel.
	 */
	function getPanel(container, which){
		var panels = $.data(container, 'accordion').panels;
		if (typeof which == 'number'){
			if (which < 0 || which >= panels.length){
				return null;
			} else {
				return panels[which];
			}
		}
		return findBy(container, 'title', which);
	}
	
	function setProperties(container){
		var opts = $.data(container, 'accordion').options;
		var cc = $(container);
		if (opts.border){
			cc.removeClass('accordion-noborder');
		} else {
			cc.addClass('accordion-noborder');
		}
	}
	
	function init(container){
		var state = $.data(container, 'accordion');
		var cc = $(container);
		cc.addClass('accordion');
		
		state.panels = [];
		cc.children('div').each(function(){
			var opts = $.extend({}, $.parser.parseOptions(this), {
				selected: ($(this).attr('selected') ? true : undefined)
			});
			var pp = $(this);
			state.panels.push(pp);
			createPanel(container, pp, opts);
		});
		
		cc.bind('_resize', function(e,force){
			if ($(this).hasClass('easyui-fluid') || force){
				setSize(container);
			}
			return false;
		});
	}
	
	function createPanel(container, pp, options){
		var opts = $.data(container, 'accordion').options;
		pp.panel($.extend({}, {
			collapsible: true,
			minimizable: false,
			maximizable: false,
			closable: false,
			doSize: false,
			collapsed: true,
			headerCls: 'accordion-header',
			bodyCls: 'accordion-body',
			halign: opts.halign
		}, options, {
			onBeforeExpand: function(){
				if (options.onBeforeExpand){
					if (options.onBeforeExpand.call(this) == false){return false}
				}
				if (!opts.multiple){
					// get all selected panel
					var all = $.grep(getSelections(container), function(p){
						return p.panel('options').collapsible;
					});
					for(var i=0; i<all.length; i++){
						unselect(container, getPanelIndex(container, all[i]));
					}
				}
				var header = $(this).panel('header');
				header.addClass('accordion-header-selected');
				header.find('.accordion-collapse').removeClass('accordion-expand');
			},
			onExpand: function(){
				$(container).find('>.panel-last>.accordion-header').removeClass('accordion-header-border');
				if (options.onExpand){options.onExpand.call(this)}
				opts.onSelect.call(container, $(this).panel('options').title, getPanelIndex(container, this));
			},
			onBeforeCollapse: function(){
				if (options.onBeforeCollapse){
					if (options.onBeforeCollapse.call(this) == false){return false}
				}
				$(container).find('>.panel-last>.accordion-header').addClass('accordion-header-border');
				var header = $(this).panel('header');
				header.removeClass('accordion-header-selected');
				header.find('.accordion-collapse').addClass('accordion-expand');
			},
			onCollapse: function(){
				if (isNaN(parseInt(opts.height))){
					$(container).find('>.panel-last>.accordion-header').removeClass('accordion-header-border');
				}
				if (options.onCollapse){options.onCollapse.call(this)}
				opts.onUnselect.call(container, $(this).panel('options').title, getPanelIndex(container, this));
			}
		}));
		
		var header = pp.panel('header');
		var tool = header.children('div.panel-tool');
		tool.children('a.panel-tool-collapse').hide();	// hide the old collapse button
		var t = $('<a href="javascript:;"></a>').addClass('accordion-collapse accordion-expand').appendTo(tool);
		t.bind('click', function(){
			togglePanel(pp);
			return false;
		});
		pp.panel('options').collapsible ? t.show() : t.hide();
		if (opts.halign=='left' || opts.halign=='right'){
			t.hide();
		}
		
		header.click(function(){
			togglePanel(pp);
			return false;
		});
		
		function togglePanel(p){
			var popts = p.panel('options');
			if (popts.collapsible){
				var index = getPanelIndex(container, p);
				if (popts.collapsed){
					select(container, index);
				} else {
					unselect(container, index);
				}
			}
		}
	}
	
	/**
	 * select and set the specified panel active
	 */
	function select(container, which){
		var p = getPanel(container, which);
		if (!p){return}
		stopAnimate(container);
		var opts = $.data(container, 'accordion').options;
		p.panel('expand', opts.animate);
	}
	
	function unselect(container, which){
		var p = getPanel(container, which);
		if (!p){return}
		stopAnimate(container);
		var opts = $.data(container, 'accordion').options;
		p.panel('collapse', opts.animate);
	}
	
	function doFirstSelect(container){
		var opts = $.data(container, 'accordion').options;
		$(container).find('>.panel-last>.accordion-header').addClass('accordion-header-border');

		var p = findBy(container, 'selected', true);
		if (p){
			_select(getPanelIndex(container, p));
		} else {
			_select(opts.selected);
		}
		
		function _select(index){
			var animate = opts.animate;
			opts.animate = false;
			select(container, index);
			opts.animate = animate;
		}
	}
	
	/**
	 * stop the animation of all panels
	 */
	function stopAnimate(container){
		var panels = $.data(container, 'accordion').panels;
		for(var i=0; i<panels.length; i++){
			panels[i].stop(true,true);
		}
	}
	
	function add(container, options){
		var state = $.data(container, 'accordion');
		var opts = state.options;
		var panels = state.panels;
		if (options.selected == undefined) options.selected = true;

		stopAnimate(container);
		
		var pp = $('<div></div>').appendTo(container);
		panels.push(pp);
		createPanel(container, pp, options);
		setSize(container);
		
		opts.onAdd.call(container, options.title, panels.length-1);
		
		if (options.selected){
			select(container, panels.length-1);
		}
	}
	
	function remove(container, which){
		var state = $.data(container, 'accordion');
		var opts = state.options;
		var panels = state.panels;
		
		stopAnimate(container);
		
		var panel = getPanel(container, which);
		var title = panel.panel('options').title;
		var index = getPanelIndex(container, panel);
		
		if (!panel){return}
		if (opts.onBeforeRemove.call(container, title, index) == false){return}
		
		panels.splice(index, 1);
		panel.panel('destroy');
		if (panels.length){
			setSize(container);
			var curr = getSelected(container);
			if (!curr){
				select(container, 0);
			}
		}
		
		opts.onRemove.call(container, title, index);
	}
	
	$.fn.accordion = function(options, param){
		if (typeof options == 'string'){
			return $.fn.accordion.methods[options](this, param);
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'accordion');
			if (state){
				$.extend(state.options, options);
			} else {
				$.data(this, 'accordion', {
					options: $.extend({}, $.fn.accordion.defaults, $.fn.accordion.parseOptions(this), options),
					accordion: $(this).addClass('accordion'),
					panels: []
				});
				init(this);
			}
			
			setProperties(this);
			setSize(this);
			doFirstSelect(this);
		});
	};
	
	$.fn.accordion.methods = {
		options: function(jq){
			return $.data(jq[0], 'accordion').options;
		},
		panels: function(jq){
			return $.data(jq[0], 'accordion').panels;
		},
		resize: function(jq, param){
			return jq.each(function(){
				setSize(this, param);
			});
		},
		getSelections: function(jq){
			return getSelections(jq[0]);
		},
		getSelected: function(jq){
			return getSelected(jq[0]);
		},
		getPanel: function(jq, which){
			return getPanel(jq[0], which);
		},
		getPanelIndex: function(jq, panel){
			return getPanelIndex(jq[0], panel);
		},
		select: function(jq, which){
			return jq.each(function(){
				select(this, which);
			});
		},
		unselect: function(jq, which){
			return jq.each(function(){
				unselect(this, which);
			});
		},
		add: function(jq, options){
			return jq.each(function(){
				add(this, options);
			});
		},
		remove: function(jq, which){
			return jq.each(function(){
				remove(this, which);
			});
		}
	};
	
	$.fn.accordion.parseOptions = function(target){
		var t = $(target);
		return $.extend({}, $.parser.parseOptions(target, [
			'width','height','halign',
			{fit:'boolean',border:'boolean',animate:'boolean',multiple:'boolean',selected:'number'}
		]));
	};
	
	$.fn.accordion.defaults = {
		width: 'auto',
		height: 'auto',
		fit: false,
		border: true,
		animate: true,
		multiple: false,
		selected: 0,
		halign: 'top',	// the header alignment: 'top','left','right'
		
		onSelect: function(title, index){},
		onUnselect: function(title, index){},
		onAdd: function(title, index){},
		onBeforeRemove: function(title, index){},
		onRemove: function(title, index){}
	};
})(jQuery);
