/**
 * jquery\u7684\u4e00\u4e9b\u5e38\u7528\u65b9\u6cd5
 * 1.qser
 * 2.qdata
 */
$.fn.qser = function(){
	var obj = {};
	
	var objs = $(this).serializeArray();
	if(objs.length != 0){
		for(var i=0; i<objs.length; i++){
			obj[objs[i].name] = objs[i].value;
		}
	}

	return obj;
};
$.fn.qdata = function(){
	var res = {};
	
	var data = $(this).attr('data');
	if(data){
		var options = data.split(';');
		for(var i=0; i<options.length; i++){
			if(options[i]){
				var opt = options[i].split(':');
				res[opt[0]] = opt[1];
			}
		}
	}
	
	return res;
};

/**
 * \u5c01\u88c5\u4e00\u4e9b\u5e38\u7528\u65b9\u6cd5
 * 1.ajax
 * 2.on
 */
var qiao = {};

qiao.ajaxoptions = {
	url 	: '',
	data 	: {},
	type 	: 'post',
	dataType: 'json',
	async 	: false
};
qiao.ajaxopt = function(options){
	var opt = $.extend({}, qiao.ajaxoptions);
	if(typeof options == 'string'){
		opt.url = options;
	}else{
		$.extend(opt, options);
	}
	
	return opt;
};
qiao.ajax = function(options){
	if(!options){
		alert('need options');
	}else{
		var res;
		$.ajax(qiao.ajaxopt(options)).done(function(obj){res = obj;});
		
		return res;
	}
};
qiao.on = function(obj, event, func){
	$(document).off(event, obj).on(event, obj, func);
};

/**
 * \u5bf9bootstrap\u7684\u5c01\u88c5
 * 1.alert
 * 2.confirm
 * 3.dialog
 * 4.msg
 * 5.tooltip
 * 6.popover
 * 7.bstree
 * 8.bstro
 */
bootstrapQ 	= {};
bootstrapQ.modaloptions = {
	url 	: '',
	fade	: 'fade',
	close	: true,
	title	: 'title',
	btn		: false,
	okbtn	: '\u786e\u5b9a',
	qubtn	: '\u53d6\u6d88',
	msg		: 'msg',
	big		: false,
	show	: false,
	remote	: false,
	backdrop: 'static',
	keyboard: true,
	style	: ''
};
bootstrapQ.modalstr = function(opt){
	var start = '<div class="modal '+opt.fade+'" id="bsmodal" tabindex="-1" role="dialog" aria-labelledby="bsmodaltitle" aria-hidden="true" style="position:fixed;top:20px;'+opt.style+'">';
	if(opt.big){
		start += '<div class="modal-dialog modal-lg"><div class="modal-content">';
	}else{
		start += '<div class="modal-dialog"><div class="modal-content">';
	}
	var end = '</div></div></div>';
	
	var head = '<div class="modal-header">';
	if(opt.close){
		head += '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>';
	}
	head += '<h3 class="modal-title" id="bsmodaltitle">'+opt.title+'</h3></div>';
	var body = '<div class="modal-body"><p><h4>'+opt.msg+'</h4></p></div>';
	var foot = '<div class="modal-footer"><button type="button" class="btn btn-primary bsok">'+opt.okbtn+'</button>';
	if(opt.btn){
		foot += '<button type="button" class="btn btn-default bscancel">'+opt.qubtn+'</button>';
	}
	foot += '</div>';
	
	return start + head + body + foot + end;
};
bootstrapQ.alert = function(options, func){
	// options
	var opt = $.extend({}, bootstrapQ.modaloptions);
	
	opt.title = '\u63d0\u793a';
	if(typeof options == 'string'){
		opt.msg = options;
	}else{
		$.extend(opt, options);
	}
	
	// add
	$('body').append(bootstrapQ.modalstr(opt));
	
	// init
	var $modal = $('#bsmodal'); 
	$modal.modal(opt);
	
	// bind
	qiao.on('button.bsok', 'click', function(){
		if(func) func();
		$modal.modal('hide');
	});
	qiao.on('#bsmodal', 'hidden.bs.modal', function(){
		$modal.remove();
	});
	
	// show
	$modal.modal('show');
};
bootstrapQ.confirm = function(options, ok, cancel){
	// options
	var opt = $.extend({}, bootstrapQ.modaloptions);

	opt.title = '\u786e\u8ba4\u64cd\u4f5c';
	if(typeof options == 'string'){
		opt.msg = options;
	}else{
		$.extend(opt, options);
	}
	opt.btn = true;
	
	// append
	$('body').append(bootstrapQ.modalstr(opt));
	
	// init
	var $modal = $('#bsmodal'); 
	$modal.modal(opt);
	
	// bind
	qiao.on('button.bsok', 'click', function(){
		if(ok) ok();
		$modal.modal('hide');
	});
	qiao.on('button.bscancel', 'click', function(){
		if(cancel) cancel();
		$modal.modal('hide');
	});
	qiao.on('#bsmodal', 'hidden.bs.modal', function(){
		$modal.remove();
	});
	
	// show
	$modal.modal('show');
};
bootstrapQ.dialog = function(options, func){
	// options
	var opt = $.extend({}, bootstrapQ.modaloptions, options);
	opt.big = true;
	
	// append
	$('body').append(bootstrapQ.modalstr(opt));
	
	// ajax page
	var html = qiao.ajax({url:options.url, dataType:'html'});
	$('#bsmodal div.modal-body').empty().append(html);
	
	// init
	var $modal = $('#bsmodal'); 
	$modal.modal(opt);
	
	// bind
	qiao.on('button.bsok', 'click', function(){
		var flag = true;
		if(func){
			flag = func();
		}
		
		if(flag){
			$modal.modal('hide');
		}
	});
	qiao.on('#bsmodal', 'hidden.bs.modal', function(){
		$modal.remove();
	});
	
	// show
	$modal.modal('show');
};
bootstrapQ.msgoptions = {
	msg  : 'msg',
	type : 'info',
	time : 2000
};
bootstrapQ.msgstr = function(msg, type){
	return '<div class="alert alert-'+type+' alert-dismissible" role="alert" style="display:none;position:fixed;top:0;left:0;width:100%;z-index:2001;margin:0;text-align:center;" id="bsalert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'+msg+'</div>';
};
bootstrapQ.msg = function(options){
	var opt = $.extend({},bootstrapQ.msgoptions);
	
	if(typeof options == 'string'){
		opt.msg = options;
	}else{
		$.extend(opt, options);
	}
	
	$('body').prepend(bootstrapQ.msgstr(opt.msg,opt.type));
	$('#bsalert').slideDown();
	setTimeout(function(){
		$('#bsalert').slideUp(function(){
			$('#bsalert').remove();
		});
	},opt.time);
};
bootstrapQ.popoptions = {
	animation 	: true,
	container 	: 'body',
	content		: 'content',
	html		: true,
	placement	: 'bottom',
	title		: '',
	trigger		: 'hover'//click | hover | focus | manual.
};
$.fn.bstip = function(options){
	var opt = $.extend({}, bootstrapQ.popoptions);
	if(typeof options == 'string'){
		opt.title = options;
	}else{
		$.extend(opt, options);
	}
	
	$(this).data(opt).tooltip();
};
$.fn.bspop = function(options){
	var opt = $.extend({}, bootstrapQ.popoptions);
	if(typeof options == 'string'){
		opt.content = options;
	}else{
		$.extend(opt, options);
	}
	
	$(this).popover(opt);
};
bootstrapQ.tree = {};
bootstrapQ.tree.options = {
	url 	: '/ucenter/menu',
	height 	: '600px',
	open	: true,
	edit	: false,
	checkbox: false,
	showurl	: true
};
$.fn.bstree = function(options){
	var opt = $.extend({}, bootstrapQ.tree.options);
	if(options){
		if(typeof options == 'string'){
			opt.url = options;
		}else{
			$.extend(opt, options);
		}
	}
	
	var res = '\u52a0\u8f7d\u5931\u8d25\uff01';
	var json = qiao.ajax(opt.url + '/tree');
	if(json && json.object){
		var tree = json.object;
		
		var start = '<div class="panel panel-info"><div class="panel-body" ';
		if(opt.height != 'auto') 
			start += 'style="height:600px;overflow-y:auto;"';
			start += '><ul class="nav nav-list sidenav" id="treeul" data="url:' + opt.url +';">';
		var children = bootstrapQ.tree.sub(tree, opt);
		var end = '</ul></div></div>';
		res = start + children + end;
	}
	
	$(this).empty().append(res);
	bootstrapQ.tree.init();
};
bootstrapQ.tree.sub = function(tree, opt){
	var res = '';
	if(tree){
		var res = 
			'<li>' + 
				'<a href="javascript:void(0);" data="id:' + tree.id + ';url:' + tree.url + ';">' + 
					'<span class="glyphicon glyphicon-minus"></span>';
		if(opt.checkbox){
			res += '<input type="checkbox" class="treecheckbox" ';
			if(tree.checked){
				res += 'checked';
			}
			res += '/>';
		}
			res += tree.text;
		if(opt.showurl){
			res += '(' + tree.url + ')';
		}
		if(opt.edit)
			res += 
				'&nbsp;&nbsp;<span class="label label-primary bstreeadd">\u6dfb\u52a0\u5b50\u83dc\u5355</span>' + 
				'&nbsp;&nbsp;<span class="label label-primary bstreeedit">\u4fee\u6539</span>' + 
				'&nbsp;&nbsp;<span class="label label-danger  bstreedel">\u5220\u9664</span>';
			res += '</a>';
		var children = tree.children;
		if(children && children.length > 0){
				res += '<ul style="padding-left:20px;" id="treeid_' + tree.id + '" class="nav collapse ';
			if(opt.open) 
				res += 'in';
				res += '">';
			for(var i=0; i<children.length; i++){
				res += bootstrapQ.tree.sub(children[i], opt);
			}
				res += '</ul>';
		}
		res += '</li>';
	}
	
	return res;
};
bootstrapQ.tree.init = function(){
	qiao.on('#treeul .glyphicon-minus', 'click', function(){
		if($(this).parent().next().length > 0){
			$('#treeid_' + $(this).parents('a').qdata().id).collapse('hide');
			$(this).removeClass('glyphicon-minus').addClass('glyphicon-plus');
		}
	});
	qiao.on('#treeul .glyphicon-plus', 'click', function(){
		if($(this).parent().next().length > 0){
			$('#treeid_' + $(this).parents('a').qdata().id).collapse('show');
			$(this).removeClass('glyphicon-plus').addClass('glyphicon-minus');
		}
	});
	qiao.on('input.treecheckbox', 'change', function(){
		// \u68c0\u6d4b\u5b50\u7ea7\u7684
		var subFlag = $(this).prop('checked');
		$(this).parent().next().find('input.treecheckbox').each(function(){
			$(this).prop('checked', subFlag);
		});
		
		// \u68c0\u6d4b\u7236\u8f88\u7684
		var parentFlag = true;
		var $ul = $(this).parent().parent().parent(); 
		$ul.children().each(function(){
			var checked = $(this).children().children('input').prop('checked');
			if(!checked) parentFlag = false;
		});
		$ul.prev().children('input').prop('checked', parentFlag);
	});
	
	bootstrapQ.tree.url = $('#treeul').qdata().url;
	if(bootstrapQ.tree.url){
		qiao.on('.bstreeadd', 'click', bootstrapQ.tree.addp);
		qiao.on('.bstreedel', 'click', bootstrapQ.tree.del);
		qiao.on('.bstreeedit', 'click', bootstrapQ.tree.editp);
	}
};
bootstrapQ.tree.addp = function(){
	bootstrapQ.dialog({
		url 	: bootstrapQ.tree.url + '/add/' + $(this).parent().qdata().id,
		title 	: '\u6dfb\u52a0\u5b50\u83dc\u5355',
		okbtn 	: '\u4fdd\u5b58'
//	}, bootstrapQ.tree.add);
	}, function(){});
};
//bootstrapQ.tree.add = function(){
//	var res = qiao.ajax({url:bootstrapQ.tree.url + '/save',data:$('#bsmodal').find('form').qser()});
//	bootstrapQ.msg(res);
//
//	if(res && res.type == 'success'){
//		qiao.crud.url = bootstrapQ.tree.url;
//		qiao.crud.reset();
//		return true;
//	}else{
//		return false;
//	}
//};
bootstrapQ.tree.del = function(){
	var res = qiao.ajax({url:bootstrapQ.tree.url + '/del/' + $(this).parent().qdata().id});
	bootstrapQ.msg(res);
	
//	if(res && res.type == 'success'){
//		qiao.crud.url = bootstrapQ.tree.url;
//		qiao.crud.reset();
//	}
};
bootstrapQ.tree.editp = function(){
	bootstrapQ.dialog({
		url 	: bootstrapQ.tree.url + '/savep?id=' + $(this).parent().qdata().id,
		title 	: '\u4fee\u6539\u83dc\u5355',
		okbtn 	: '\u4fdd\u5b58'
//	}, bootstrapQ.tree.edit);
	}, function(){});
};
//bootstrapQ.tree.edit = function(){
//	qiao.crud.url = bootstrapQ.tree.url;
//	return qiao.crud.save();
//};
bootstrapQ.bstrooptions = {
	width 	: '500px',
	html 	: 'true',
	nbtext	: '\u4e0b\u4e00\u6b65',
	place 	: 'bottom',
	title 	: '\u7f51\u7ad9\u4f7f\u7528\u5f15\u5bfc',
	content : 'content'
};
bootstrapQ.bstroinit = function(selector, options, step){
	if(selector){
		var $element = $(selector);
		if($element.length > 0){
			var opt = $.extend({}, bootstrapQ.bstrooptions, options);
			if(typeof options == 'string'){
				opt.content = options;
			}else{
				$.extend(opt, options);
			}
			
			$element.each(function(){
				$(this).attr({
					'data-bootstro-width'			: opt.width, 
					'data-bootstro-title' 			: opt.title, 
					'data-bootstro-html'			: opt.html,
					'data-bootstro-content'			: opt.content, 
					'data-bootstro-placement'		: opt.place,
					'data-bootstro-nextButtonText'	: opt.nbtext,
					'data-bootstro-step'			: step
				}).addClass('bootstro');
			});
		}
	}
};
bootstrapQ.bstroopts = {
	prevButtonText : '\u4e0a\u4e00\u6b65',
	finishButton : '<button class="btn btn-lg btn-success bootstro-finish-btn"><i class="icon-ok"></i>\u5b8c\u6210</button>',
	stopOnBackdropClick : false,
	stopOnEsc : false
};
bootstrapQ.bstro = function(bss, options){
	if(bss && bss.length > 0){
		for(var i=0; i<bss.length; i++){
			bootstrapQ.bstroinit(bss[i][0], bss[i][1], i);
		}
		
		var opt = $.extend({}, bootstrapQ.bstroopts);
		if(options){
			if(options.hasOwnProperty('pbtn')){
				opt.prevButtonText = options.pbtn;
			}
			if(options.hasOwnProperty('obtn')){
				if(options.obtn == ''){
					opt.finishButton = '';
				}else{
					opt.finishButton = '<button class="btn btn-mini btn-success bootstro-finish-btn"><i class="icon-ok"></i>'+options.obtn+'</button>';
				}
			}
			if(options.hasOwnProperty('stop')){
				opt.stopOnBackdropClick = options.stop;
				opt.stopOnEsc = options.stop;
			}
			if(options.hasOwnProperty('exit')){
				opt.onExit = options.exit;
			}
		}
		
		bootstro.start('.bootstro', opt);
	}
};
