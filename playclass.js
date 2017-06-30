islogin=0;
syndomain='';
function checkcookie(){
	if(document.cookie.indexOf('mb_u=')>=0){
	islogin=1;
	return true;
	}
	return false;
}
checkcookie();
function PlayHistoryClass() {
	var cookieStr, nameArray, urlArray, allVideoArray;
	this.getPlayArray = function() {
		cookieStr = document.cookie;
		var start = cookieStr.indexOf("pp_vod_v=") + "pp_vod_v=".length, end = cookieStr
				.indexOf("_$_|", start), allCookieStr = unescape(cookieStr
				.substring(start, end))
		if (end == -1) {
			allCookieStr = "";
			return;
		}
		allVideoArray = allCookieStr.split("_$_");
		nameArray = new Array(), urlArray = new Array();
		for ( var i = 0; i < allVideoArray.length; i++) {
			var singleVideoArray = allVideoArray[i].split("^");
			nameArray[i] = singleVideoArray[0];
			urlArray[i] = singleVideoArray[1];
		}
	}
	this.viewPlayHistory = function(div) {
		var tag = document.getElementById(div), n = 12;
		if(checkcookie()){
			$.get(Root +"index.php?s=User-Comm-getplaylog", function(result){												 
				if(result['rcode']>-1){
					$("#his-todo").hide();
					if(result['r']!=null&&result['r'].length>0){
						innerStr='';
						for(var i in result['r']){
							var data = result['r'][i];
							
							innerStr += "<li><h5><a href=\"" + data['vod_readurl'] 
									 + "\">"+data['vod_name']
							         +"</a><em>/</em><a href='"
							         +data['vod_palyurl']+"' target='_blank'>"
							         +data['url_name']+"</a></h5><label><a class=\"color\" href=\"" 
							         + data['vod_palyurl'] + "\">继续观看</a></label><a href=\"javascript:;\" target='_blank' class='delck' data=\""
							         +data['id']+"\" mtype='ajax'>删除</a></li>" ;
						}
						if (innerStr.length>0){
							$("#emptybt").unbind();
							$("#emptybt").click(function(){
								PlayHistoryObj.emptyhistory('ajax');
								return false;
							});
							tag.innerHTML= innerStr;$(".delck").click(function(e){
								PlayHistoryObj.removeHistory($(this).attr('data'),$(this).attr('mtype'));
								$(this).parent('li').remove();
								return false;
							});
						}
					}else{
						document.getElementById('playhistory').innerHTML="<li class='no-his'><p>暂无播放历史列表...</p></li>";
					}
				}
			},'json');
			$("#his-todo").hide(); 
		}
		
		
		if (navigator.cookieEnabled) {
			var innerStr = "";
			if (nameArray != undefined && nameArray != null) {
				for ( var i = nameArray.length - 1; i >= 0; i--) {
					var vodnames = nameArray[i].split('|');
					var vodlinks = urlArray[i].split('|');
					if (vodnames.length == 2 && vodlinks.length ==2) {
						innerStr += "<li><h5><a href=\""
								+ vodnames[1]
								+ "\">"
								+ vodnames[0]
								+ "</a><em>/</em><a target='_blank' href=\"" 
								+ vodlinks[1]
								+"\">"
								+ vodlinks[0]
								+"</a></h5><label><a class=\"color\" target='_blank' href=\""
								+ vodlinks[1]
								+ "\">继续观看</a></label><a href=\"javascript:;\" class='delck' data='"
								+ i + "' mtype='inck'>删除</a></li>"
					}
				}
			}
			$("#his-todo").show();
			$("#morelog").hide();
			if (innerStr.length > 0) {
				$("#emptybt").unbind();
				$("#emptybt").click(function() {
					PlayHistoryObj.emptyhistory('ck');
					return false;
				});
				tag.innerHTML = innerStr;
				$(".delck").click(
						function(e) {
							if (PlayHistoryObj.removeHistory($(this).attr(
									'data'), $(this).attr('mtype'))) {
								$(this).parent('li').remove();
								return false;
							}
						});
			} else {
				document.getElementById('playhistory').innerHTML = "<li class='no-his'><p>暂无播放历史列表...</p></li>";
			}
		} else {
			set(tag, "您浏览器关闭了cookie功能，不能为您自动保存最近浏览过的网页。")
		}
	}
	this.removeHistory = function(ii, type) {
		this.getPlayArray();
		if (type == 'inck') {
			var count = 10; // 播放历史列表调用条数
			expireTime = new Date(new Date().setDate(new Date().getDate() + 30));
			timeAndPathStr = "|; expires=" + expireTime.toGMTString() + "; path=/";
			if (cookieStr.indexOf("pp_vod_v=") != -1 || cookieStr.indexOf("_$_|") != -1) {
				var newCookieStr = "";
				for (i in allVideoArray) {
					if (i != ii) {
						newCookieStr += escape(nameArray[i]) + "^" + escape(urlArray[i]) + "_$_";
					}
				}
				document.cookie = "pp_vod_v=" + newCookieStr + timeAndPathStr;
				return true;
			}
			return false;
		}else{
			$.get(Root + 'index.php?s=User-Comm-delplaylog',{id:ii},function(r){},'json');
		}
	}
	this.addPlayHistory = function(json,vod_readurl,vod_palyurl) {
		var count = 10; // 播放历史列表调用条数
		if(checkcookie()){
			$.post(Root + "index.php?s=User-Comm-addplaylog",json);
		}
		var name = json.vod_name+"|" + vod_readurl ;
		var url = json.url_name  +"|" + vod_palyurl ;
		
		var code_name = escape(name) + "^", code_url = escape(url) + "_$_",
		expireTime = new Date(new Date().setDate(new Date().getDate() + 30)), timeAndPathStr = "|; expires="+ expireTime.toGMTString() + "; path=/";
		
		
		if ((cookieStr.indexOf("pp_vod_v=") != -1 || cookieStr.indexOf("_$_|") != -1) && allVideoArray != undefined) {
			var newCookieStr = "";
			if (allVideoArray.length < count) {
				for (i in allVideoArray) {
					if(nameArray[i] != name) {
						newCookieStr += escape(nameArray[i]) + "^" + escape(urlArray[i]) + "_$_";
					}
				}
			} else {
				for ( var i = 1; i < count; i++) {
					if (nameArray[i] != name) {
						newCookieStr += escape(nameArray[i]) + "^" + escape(urlArray[i]) + "_$_";
					}
				}
			}
			document.cookie = "pp_vod_v=" + newCookieStr + code_name + code_url + timeAndPathStr;
		} else {
			document.cookie = "pp_vod_v=" + code_name + code_url + timeAndPathStr;
		}
	}
	
	this.emptyhistory = function(type){
		$.showfloatdiv({
			txt : '确定删除？',
			wantclose : 2,
			suredo : function(e) {
				if(type=='ajax'){
					$.get(Root + 'index.php?s=User-Comm-emptyhistory',function(r){document.getElementById('playhistory').innerHTML="<li class='no-his'><p>暂无播放历史列表...</p></li>";});
				}else{
					_GC();
				}
				$.closefloatdiv();
				return true;
			}
		});
		return false;
	}
}

function _GC() {
	document.getElementById('playhistory').innerHTML = "<li class='no-his'><p>暂无播放历史列表...</p></li>";
	var expdate = new Date(1970, 1, 1);
	document.cookie = "pp_vod_v=; path=/";
}


var PlayHistoryObj = new PlayHistoryClass()
PlayHistoryObj.getPlayArray();
function killErrors() {
	return true;
}


var topShow = false;
function showTop(n) {
	if (topShow == true) {
		switchTab('top', n, 2, "history");
	} else {
		// alert("s");
		document.getElementById("Tab_top_" + n).className = "history";
		// document.getElementById("List_top_"+n).className="dropbox_tigger
		// dropbox_tigger_on";
		document.getElementById("List_top_" + n).style.display = "";
		topShow = false;
	}
}
function hideTop() {
	for (i = 0; i < 2; i++) {
		var CurTabObj = document.getElementById("Tab_top_" + i);
		var CurListObj = document.getElementById("List_top_" + i);
		CurTabObj.className = "history";
		CurListObj.style.display = "none";
	}
}
