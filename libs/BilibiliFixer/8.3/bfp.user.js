// ==UserScript==
// @name                   Bilibili Fixer - Perfect!
// @namespace          FireAway-剑仙乘仙剑
// @version                8.3
// @description          吧啦吧啦 喵~ 对乐视宝具升级 理论上可无压力看所有乐视番
// @require                 http://code.jquery.com/jquery-1.11.0.min.js
// @require        http://firebfplite.duapp.com/BFP/JS/hmac-sha1.js
// @require    http://firebfplite.duapp.com/BFP/JS/enc-base64-min.js
// @updateURL          http://userscripts.org/scripts/source/165424.meta.js
// @downloadURL      https://firebfplite.duapp.com/BFP/bfp.user.js
// @include     *://*.bilibili.tv/*
// @include     *://*.bilibili.tv
// @include     *://*.bilibili.*
// @include     *://bilibili.*/*
// @include     *://comic.letv.com/*
// @include      *//api.bilibili.tv/*
// @copyright             FireAway~
// @run-at                  document-start
// @grant                   GM_xmlhttpRequest
// ==/UserScript==
//https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/sha1-min.js
//https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/enc-base64-min.js
var isLetv = (location.origin == "http://comic.letv.com");
var isAPI = /api/.exec(location.origin);
var isVideo = /\/video\/av(\d+)(?:\/index_(\d+))?/.exec(location.pathname);
var aid, date, cid, vid, restxt, O_Player, mode, selector, spid, page, spMode
	urltype = "download",
	videoPlay = "videoPlay1",
	version = "8.3",
	client = navigator.userAgent.toLowerCase();
var bili_inner = "<img src='https://secure.bilibili.tv/images/grey.gif' id='img_ErrCheck' style='display:none'><script type='text/javascript' src='http://static.hdslb.com/js/page.player_error.js'></script>";
var thisDate = Date();
var isSP = /sp/.exec(location.pathname);
var isHome = (location.pathname == "/");
var isBangumi1 = /bangumi.html/.exec(location.pathname);
var isBangumiA = /bangumi-/.exec(location.pathname);
var isBangumiB = /part-twoelement-1.html/.exec(location.pathname);
var isBangumi2 = isBangumiA || isBangumiB;
var pos = isVideo ? "video" : (isSP ? "sp" : (isHome ? "home" : (isBangumi1 ? "bangumi1" : (isBangumi2 ? "bangumi2" : isLetv ? "letv" : isAPI ? "api" : "other"))));
if (localStorage.getItem("isNotify") == null) {
	localStorage.setItem("isNotify", "true");
}

var GFT = function(func) {
	return FT.getFunTxt(func);
};

//Ajax_Tools
var AT = {
	setResTxt: function(newrt) {
		restxt = newrt;
	},
	getResTxt: function() {
		return restxt;
	},
	BFP_xmlhttpRequest: function(details) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			var responseState = {
				responseXML: (xmlhttp.readyState == 4 ? xmlhttp.responseXML : ''),
				responseText: (xmlhttp.readyState == 4 ? xmlhttp.responseText : ''),
				readyState: xmlhttp.readyState,
				responseHeaders: (xmlhttp.readyState == 4 ? xmlhttp.getAllResponseHeaders() : ''),
				status: (xmlhttp.readyState == 4 ? xmlhttp.status : 0),
				statusText: (xmlhttp.readyState == 4 ? xmlhttp.statusText : '')
			}
			if (details["onreadystatechange"]) {
				details["onreadystatechange"](responseState);
			}
			if (xmlhttp.readyState == 4) {
				if (details["onload"] && xmlhttp.status >= 200 && xmlhttp.status < 300) {
					details["onload"](responseState);
				}
				if (details["onerror"] && (xmlhttp.status < 200 || xmlhttp.status >= 300)) {
					details["onerror"](responseState);
				}
			}
		}
		try {
			xmlhttp.open(details.method, details.url);
		} catch (e) {
			if (details["onerror"]) {
				details["onerror"]({
					responseXML: '',
					responseText: '',
					readyState: 4,
					responseHeaders: '',
					status: 403,
					statusText: 'Forbidden'
				});
			}
			return;
		}
		if (details.headers) {
			for (var prop in details.headers) {
				xmlhttp.setRequestHeader(prop, details.headers[prop]);
			}
		}
		xmlhttp.send((typeof(details.data) != 'undefined') ? details.data : null);
	},
	//Default_Ajax_Function
	DAF: function(ajaxUrl, func) {
		if (mode == "full") {
			GM_xmlhttpRequest({
				method: "GET",
				url: ajaxUrl,
				onerror: function(response) {
					if (response.status == 0) {
						localStorage.setItem("BFP.Mode", "compatible." + thisDate);
					} else {
						console.log(response)
					}
				},
				onload: function(response) {
					AT.evalAjaxFun(response, func);
				}
			});
		} else {
			AT.BFP_xmlhttpRequest({
				method: "GET",
				url: ajaxUrl,
				onerror: function(response) {
					try {
						var xx = notify("BFP目前通信基本靠吼", "兼容模式下无法检测视频可用性 16s请自行翻墙 无限电视请点此查看提速教程", 20000, mode);
						xx.onclick = function() {
							window.open("http://firebfplite.duapp.com/?index=1#boost_iqiyi");
						}
					} catch (e) {}
				},
				onload: function(response) {
					console.log(response);
					AT.evalAjaxFun(response, func);
				}
			});
		}
	},
	evalAjaxFun: function(r, f) {
		if (r.status == 200) {
			AT.setResTxt(r.responseText);
			eval(f);
		} else {
			console.log(r);
		}
	}
};

var BT = {
	addPlayer: function() {
		var isLetv = VT.getVid();
		if (isLetv != 0) {
			var x = notify("BFP成功获取缓存信息", "判断为乐视新番 优先使用不能发弹幕的播放器以保证观看 可尝试使用[刷新播放器]功能或者点此替换为全功能播放器", 10000, "letv");
			videoPlay = "lebili";
			try {
				x.onclick = function() {
					var refreshPlayer = DT.domFinder("refreshPlayer");
					refreshPlayer.click();
				}
			} catch (e) {}
		} else {
			videoPlay = "videoPlay1";
		}

		var BFP_Player = DT.createPlayer();

		var bofqi = DT.domCreater("div", "newbofqi");
		bofqi.className = "scontent";
		bofqi.id = "bofqi";
		bofqi.setAttribute("CID", VT.getCid());
		bofqi.setAttribute("embed_stack", "true");

		var videobox = DT.domCreater("div", "videobox");
		videobox.className = "videobox";

		DT.domAppender(videobox, bofqi);
		DT.domAppender(bofqi, BFP_Player);

		var biliScr = DT.domCreater("script", "biliScr");
		biliScr.src = "http://static.hdslb.com/js/page.arc.js";

		var scripts = document.querySelectorAll("script");
		for (var i = 0; i < scripts.length; i++) {
			if (scripts[i].src.indexOf("page.arc.js") > -1) {
				biliScr.src = "";
			}
		};
		DT.domAppender(document.head, biliScr);

		var oBFP_Player = DT.domFinder("BFP_Player");

		var target;
		if (pos == "video") {
			var oBofqi = DT.domFinder("bofqi");
			DT.domReplacer(oBofqi, bili_inner, bofqi);
			target = "info";
		} else if (pos == "sp") {
			if (oBFP_Player) {
				DT.domRemover("bofqi");
				oBFP_Player.src = BFP_Player.src;
			} else {
				var bgm_video_container = DT.domFinder("bgm_video_container");
				DT.domBeforer(bgm_video_container, videobox);
			}
			target = "hintLabel";
		}

		AT.DAF(UT.getURL("download"), "VT.checkValidity()");

		var scrolledHeight = document.body.scrollTop || window.scrollY;
		var totalHeight = document.body.scrollHeight;
		var anchor = DT.domFinder(target);
		var absoluteHeight = DT.getAbsTop(anchor);
		FT.pageScroll(absoluteHeight - scrolledHeight - 5);

		DT.addBFPDom();
		DT.addDLDom();
		BT.doBFPAss();
	},
	addPagerSupport: function() {
		var pager1 = document.querySelectorAll(".pagelistbox a");
		for (var i = 0; i < pager1.length; i++) {
			pager1[i].addEventListener("click", function() {
				BT.checkLoaded();
			}, false);
		};

		var pager2 = document.querySelectorAll(".swc li");
		for (var i = 0; i < pager2.length; i++) {
			pager2[i].addEventListener("click", function() {
				BT.checkLoaded();
			}, false);
		};

		var season = document.querySelectorAll("#season_selector li");
		for (var i = 0; i < season.length; i++) {
			season[i].addEventListener("click", function() {
				BT.checkLoaded();
			}, false);
		};
	},
	addListenser: function() {
		if (window.postMessage) {
			var onMessage = function(e) {

				if (e.data.substr(0, 6) == "secJS:") {
					var funVal = e.data.substr(6);
					FT.contentEval(funVal);
					if (funVal.indexOf("fullwin(true)") > -1) {
						DT.domFinder("season_selector").style.display = "none";
					} else {
						DT.domFinder("season_selector").style.display = "block";
					}
				}
				if (typeof(console.log) != "undefined") {
					console.log("BFPLog: " + "Func:addListenser" + ", Obj:" + e.origin + ", Msg:" + e.data);
				}
			};
			if (window.addEventListener) {
				window.addEventListener("message", onMessage, false);
			} else if (window.attachEvent) {
				window.attachEvent("onmessage", onMessage);
			}
		} else {
			setInterval(function() {
				if (evalCode = __GetCookie('__secureJS')) {
					__SetCookie('__secureJS', '');
					eval(evalCode);
				}
			}, 1000);
		}
	},
	checkLoaded: function() {
		var getFlagFun = "document.getElementById('bgm_video_container').innerHTML.indexOf('loading')==-1";
		var callBackFun = GFT(BT.BSPImpl);
		callBackFun += GFT(BT.addPagerSupport);
		FT.checkFlagExist(50, getFlagFun, callBackFun);
	},
	BSPImpl: function() {
		notify("BFP引擎启动 准备突破黑洞引力场", "专题页面功能加载完毕", 3000, "sp");
		DT.domFinder("vidbox").style.width = "auto";

		var video = document.querySelectorAll(".v");
		for (var i = 0; i < video.length; i++) {
			video[i].setAttribute("BFP", "true");
			video[i].addEventListener("click", function(e) {
				var ifReplace = DT.domFinder("ifReplace");
				if (ifReplace.checked) {
					e.preventDefault();
					flag = true;

					var href = this.querySelector("a").href;
					aid = /(\d+)/.exec(href)[0];
					VT.setAid(aid);

					var url = UT.getURL("info");
					AT.DAF(url, GFT(DT.addInfoDom));

					BT.spFun();

					DT.domRemover("sp_r");
					DT.domRemover("sp_r");
					DT.domRemover("sp_r");
					DT.domRemover("zt-i-s");
					DT.domRemover("center");
					DT.domRemover("sp_mgr");
					DT.domFinder("zt_c_sp").style.width = "auto";

					var bgm_list = DT.domFinder("bgm_list");
					bgm_list.style.width = "auto";

					var season_selector = DT.domFinder("season_selector");
					season_selector.style.position = "absolute";
					season_selector.style.top = "-7px";
					season_selector.style.left = "200px";

					var clearfix = bgm_list.querySelector(".clearfix");
					DT.domAppender(clearfix, season_selector);

					try {
						var season_selector2 = document.querySelectorAll("#season_selector")[1];
						bgm_list.removeChild(season_selector2);
					} catch (e) {}

					if (!FT.getAttr("x")) {
						var state = {
							title: "在B看~乐视番请勿直接刷新页面,播放器下方有导航栏!",
							url: "http://www.bilibili.tv/video/av" + aid
						};
						window.history.replaceState(state, state.title, state.url);
						DT.domFinder("hintLabel").innerHTML = state.title;
					}
				}
			}, false);
		};
	},
	spFun: function() {
		var newCid = VT.getCid();
		if (newCid == "Cloud") {
			VT.getCidFromCloud(VT.getAid());
		} else {
			BT.addPlayer();
		}
	},
	getTitle: function() {
		var title = document.querySelector(".info h2").innerHTML;
		return title.replace("&amp;", "&");
	},
	setMode: function(newMode) {
		spMode = newMode;
	},
	getMode: function() {
		return spMode;
	},
	setSelector: function(newSelector) {
		selector = newSelector;
	},
	getSelector: function() {
		return selector;
	},
	doBFPAss: function() {
		var ass_d = DT.domFinder("ass_d");
		var videoURL = "http://www.bilibili.tv/video/av" + VT.getAid();
		var domStr = "<form method='post' action='http://firelove.duapp.com/' id='Fass' target='_blank'> <ul style='display:none' id='settingForm'> <li> <a href='http://firelove.duapp.com/option.html' target='_blank'>选项说明</a>&nbsp;&nbsp;<a href='http://firelove.duapp.com' target='_blank'>转换器主页</a> <br/> <input class='font' type='text' name='font_name' value='微软雅黑' keyev='true' style='background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABHklEQVQ4EaVTO26DQBD1ohQWaS2lg9JybZ+AK7hNwx2oIoVf4UPQ0Lj1FdKktevIpel8AKNUkDcWMxpgSaIEaTVv3sx7uztiTdu2s/98DywOw3Dued4Who/M2aIx5lZV1aEsy0+qiwHELyi+Ytl0PQ69SxAxkWIA4RMRTdNsKE59juMcuZd6xIAFeZ6fGCdJ8kY4y7KAuTRNGd7jyEBXsdOPE3a0QGPsniOnnYMO67LgSQN9T41F2QGrQRRFCwyzoIF2qyBuKKbcOgPXdVeY9rMWgNsjf9ccYesJhk3f5dYT1HX9gR0LLQR30TnjkUEcx2uIuS4RnI+aj6sJR0AM8AaumPaM/rRehyWhXqbFAA9kh3/8/NvHxAYGAsZ/il8IalkCLBfNVAAAAABJRU5ErkJggg==); padding-right: 0px; background-attachment: scroll; cursor: auto; background-position: 100% 50%; background-repeat: no-repeat no-repeat;display:none'> <span class='hint'>字体大小(像素)</span> <input class='integer' type='text' name='font_size' value='36'> </li> <li> <label>分辨率(像素)</label> <input class='integer' type='text' name='video_width' value='1920'>X <input class='integer' type='text' name='video_height' value='1080'> </li> <li> <label>同屏行数</label> <input class='integer' type='text' name='line_count' value='5'> </li> <li> <label>底边距离(像素)</label> <input class='integer' type='text' name='bottom_margin' value='54'> </li> <li> <label>调整秒数：</label> <input class='integer' type='text' name='tune_seconds' value='0'> </li> </ul> <button id='downXml' style='display:none' class='danmuButton'>下载XML档</button> <button id='downAss' type='submit' style='display:none' class='danmuButton'>下载ASS档</button> <button id='setting' style='display:none' class='danmuButton' type='button'>高级</button> <input type='hidden' id='assUrl' name='url' value=" + videoURL + "> </form>";
		var assForm = DT.domCreater("form", "assForm");
		if (DT.domFinder("Fass")) {
			DT.domRemover("Fass");
		}
		DT.domAppender(DT.domFinder("button_container"), assForm);
		assForm.outerHTML = domStr;
		DT.domFinder("setting").setAttribute("onclick", "$('#settingForm').fadeToggle()");

		var downXml = DT.domFinder("downXml");
		var url = "http://comment.bilibili.tv/" + VT.getCid() + ".xml";
		var xml_a = DT.domCreater("a", "xml_a");
		xml_a.href = url;
		xml_a.style.position = "absolute";
		xml_a.style.width = "66px";
		xml_a.style.height = "18px";
		xml_a.style.left = downXml.offsetLeft + "px";
		DT.domAppender(downXml, xml_a);

		if (client.indexOf("firefox") > -1) {
			var url = "http://comment.bilibili.tv/" + VT.getCid() + ".xml";
			var func = function() {
				var restxt = AT.getResTxt();
				var oMyBlob = new Blob([restxt], {
					"type": "text\/xml"
				}); // the blob
				var href = URL.createObjectURL(oMyBlob);
				var xml_a = DT.domFinder("xml_a");
				xml_a.href = href;
			}
			AT.DAF(url, GFT(func));
		}

		ass_d.addEventListener("click", function() {
			$(".danmuButton").fadeToggle();
			$('#settingForm').fadeOut();
			xml_a.setAttribute("download", BT.getTitle() + ".xml");
		}, false);

		//Method 1 自下至上的事件触发机制 冒泡阶段
		// var xml_a = DT.domFinder("xml_a");
		// xml_a.addEventListener("click", function(e) {
		//  e.stopPropagation();
		// }, false);
		// downXml.addEventListener("click", function(e) {
		//  e.preventDefault();
		//  var xml_a = DT.domFinder("xml_a");
		//  xml_a.click();
		// }, false);

		//Method 2 自上至下的事件触发机制 捕获阶段
		xml_a.addEventListener("click", function(e) {
			e.stopPropagation();
		});
		downXml.addEventListener("click", function(e) {
			e.preventDefault();
			var xml_a = DT.domFinder("xml_a");
			xml_a.click();
		});

		//Method 1和Method 2虽然写着差不多
		//个人认为Method 2比较节省资源.
		//Method 1兼容性好
	}
};

var DT = {
	addInfoDom: function() {
		var json = DT.getJson();
		var Ftitle = unescape(json.title);
		var Fcreated_at = json.created_at;
		var Fplay = json.play;
		var Ffavorites = json.favorites;
		var Fcoin = json.coins;
		var Fcredit = json.credit;
		var Fzuface = "http://i2.hdslb.com/user/3133/313392/myface.jpg";
		var Fzuname = "新番搬运协会";
		var Fupspace = "http://space.bilibili.tv/" + json.mid;
		var Fauthor = json.author;
		var Fupface = "http://i0.hdslb.com/user/" + json.mid.substring(0, 4) + "/" + json.mid + "/myface_s.jpg";
		var Fpages = json.pages;
		var Fpartname = json.partname;
		var alist = "<a class='curPage Fpages' id='1'>P1</a>";

		for (var i = 1; i < Fpages; i++) {
			alist += "<a class='Fpages' id='" + (i + 1) + "' href='javascript:void(0);'>P" + (i + 1) + "</a>";
		};

		var str = "<div class='viewbox' style='width: 100%; position: absolute; top: -194px; right: -265px; z-index: 999;height:10%'> <div class='info' style='border:none;'> <h2 title='" + Ftitle + "'>" + Ftitle + "</h2> <div class='tminfo' xmlns:v='http://rdf.data-vocabulary.org/#'><a href='/' rel='v:url' property='v:title'>主页</a> &gt; <span typeof='v:Breadcrumb'><a href='/video/bangumi.html' rel='v:url' property='v:title'>新番连载</a></span> &gt; <span typeof='v:Breadcrumb'><a href='/video/bangumi-two-1.html' class='on' rel='v:url' property='v:title'>连载动画</a></span> <time itemprop='startDate' datetime='" + Fcreated_at + "'><i>" + Fcreated_at + "</i></time><i id='dianji' title='播放'>" + Fplay + "</i><i id='stow_count' title='收藏'>" + Ffavorites + "</i><i id='pt'><span id='v_ctimes' title='硬币数量'>" + Fcoin + "</span>[<span id='v_cscores'>" + Fcredit + "</span>]</i></div> <div class='sf'>   </div> </div> <div class='zu_play_info' style='top: 3px; position: absolute; left: 550px;'> <img src='" + Fzuface + "' class='zu_face'> <div class='t'><a href='#'>" + Fzuname + "</a></div> <div class='upload_user' style='float:none;'> <li>本视频UP：</li> <li><a href='" + Fupspace + "' card='" + Fauthor + "' target='_blank'><img src='" + Fupface + "'></a></li> <div class='alist' style='position: absolute; top: 50px; left: -545px; '> <div id='alist'>" + alist + "</div></div> </div></div> </div> </div>";

		var dom = DT.domFinder("viewbox");
		if (dom) {
			dom.outerHTML = str;
		} else {
			DT.domFinder("season_position_container").outerHTML += str;
		}

		var BFP_Comment = DT.domCreater("div", "BFP_CommentContainer");
		var bgm_video_container = DT.domFinder("bgm_video_container");
		DT.domAppender(bgm_video_container, BFP_Comment);
		BFP_Comment.innerHTML = "<div style='overflow:hidden;' id='BFP_Comment'> <div class='common'> <div class='sort'><i>评论列表</i> </div> <div class='comm'> <img src='http://static.hdslb.com/images/v2images/morecomm.gif' border='0' class='comm_open_btn' onclick=\"var fb = new bbFeedback(' .comm ', 'arc ');fb.show(" + VT.getAid() + ", 1);\" style='cursor:pointer'> </div> </div> <div class='rat'> <div class='sort'><i>评分&amp;推荐</i> </div> <div class='arc_r_box' id='arc_r_box'> <div class='comm_send'> <div class='v_pts'> <p>硬币 <b class='v_ctimes'>" + Fcoin + "</b> </p> <p>积分 <b class='v_cscores'>" + Fcredit + "</b> </p> </div> <div id='recommend_action' style=''> <a style='cursor: help; display: none;' onclick='goTop();return false;' id='recommend_btnLogin'> <img src='http://static.hdslb.com/images/nologininfo.gif'> </a> <form action='/plus/comment.php' method='post' target='_blank' id='recommend_frmPost'> <input type='hidden' value='1023110' name='aid'> <input type='hidden' value='5' name='rating' id='rating'> <ul class='ratin'> <li id='r100' v='100'>+1 硬币 <a>(强力推荐)</a> </li> <li id='r5' v='5' class='on'>+5</li> <li id='r2' v='2'>赞</li> </ul> <div class='w_c_n' style='display:none;'> <p style='display:none'>推荐次数: <input type='text' name='multiply' id='multiply' value='1'> </p> </div> <input type='submit' class='button' value='确认' id='ratconfirm'> </form> <div class='u_pts'><span id='recommend_mymoney'>我的硬币: <b>{MYB}</b></span><span id='recommend_myscores'>我的积分: <b>{MJF}</b></span> </div> </div> </div> </div> </div> </div>";

		var Fpages = document.querySelectorAll(".Fpages");
		for (var i = 0; i < Fpages.length; i++) {
			Fpages[i].addEventListener("click", function(e) {
				var id = this.id;

				for (var i = 0; i < Fpages.length; i++) {
					Fpages[i].className = "Fpages";
				};

				this.className = "curPage Fpages";
				VT.setPage(id);
				var func = GFT(FT.spFun);
				AT.DAF(UT.getURL("sp"), func);
			}, false);
		};
	},
	addBFPDom: function() {
		var refreshPlayer = DT.domCreater("button", "refreshPlayer");
		refreshPlayer.innerHTML = '刷新播放器';
		var i = 0;
		refreshPlayer.addEventListener("click", function() {
			if (i < 4) {
				++i;
			} else {
				i = 1;
			}
			videoPlay = "videoPlay" + i;
			var O_Player = DT.getPlayerDom();
			var bofqi = O_Player.parentNode;
			bofqi.removeChild(O_Player);
			var BFP_Player = DT.createPlayer();
			var BFP_Container = DT.domFinder("BFP_Container");
			if (BFP_Container) {
				DT.domBeforer(BFP_Container, BFP_Player);
			} else {
				DT.domAppender(bofqi, BFP_Player);
			}
			BT.addListenser();
		}, false);

		var rollBack = DT.domCreater("button", "rollBack");
		rollBack.innerHTML = '版权播放器';
		rollBack.addEventListener("click", function() {
			var BFP_Player = DT.getPlayerDom();
			var O_Player = DT.getO_Player();
			BFP_Player.outerHTML = O_Player.outerHTML;
			BT.addListenser();
		}, false);

		var button_container = DT.domCreater("div", "button_container");
		button_container.style.display = "none";
		button_container.style.padding = "0px";
		button_container.style.marginTop = "5px";

		var show_button_container = DT.domCreater("button", "show_button_container");
		show_button_container.innerHTML = "BFP!";
		show_button_container.className = "ui-button";
		show_button_container.style.marginTop = "10px";
		show_button_container.setAttribute("onclick", "$('#button_container').fadeToggle();");

		var BFP_Container = DT.domCreater("div", "BFP_Container");
		var videobox = DT.domFinder("bofqi");

		DT.domAppender(videobox, BFP_Container);
		DT.domAppender(button_container, refreshPlayer, rollBack);
		DT.domAppender(BFP_Container, show_button_container, button_container);

		var buttons = document.querySelectorAll("#button_container button");
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].style.marginRight = "5px;";
			buttons[i].style.padding = "0px;";
		};
		// if (DT.isBili() > -1) {
		// 	rollBack.style.display = "none";
		// }
	},
	createPlayer: function(type) {
		var BFP_Player;
		if (videoPlay == "lebili" || videoPlay == "videoPlay1") {
			BFP_Player = DT.domCreater("embed", "BFP_Player");
			BFP_Player.setAttribute("quality", "high");
			BFP_Player.setAttribute("allowfullscreeninteractive", "true");
			BFP_Player.setAttribute("allowscriptaccess", "always");
			BFP_Player.setAttribute("allowfullscreen", "true");
			BFP_Player.setAttribute("rel", "noreferrer");
			BFP_Player.setAttribute("wmode", "window");
			BFP_Player.setAttribute("type", "application/x-shockwave-flash");
			BFP_Player.setAttribute("flashvars", VT.getPath() + "&vid=" + VT.getVid());
			BFP_Player.setAttribute("pluginspage", "http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash");
		} else {
			BFP_Player = DT.domCreater("iframe", "BFP_Player");
			BFP_Player.setAttribute("scrolling", "no");
			BFP_Player.setAttribute("border", "0");
			BFP_Player.setAttribute("frameborder", "no");
			BFP_Player.setAttribute("framespacing", "0");
			BFP_Player.setAttribute("onload", "window.securePlayerFrameLoaded=true");
		}
		BFP_Player.src = UT.getURL(videoPlay);
		BFP_Player.className = "player";
		return BFP_Player;
	},
	domAppender: function() {
		var father = arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			father.appendChild(arguments[i]);
		};
	},
	domBeforer: function() {
		var base = arguments[0];
		var father = base.parentNode;
		father.removeChild(base);
		for (var i = 1; i < arguments.length; i++) {
			var beforer = arguments[i];
			DT.domAppender(father, beforer);
		};
		DT.domAppender(father, base);
	},
	domCreater: function(domType, domId) {
		var dom = DT.domFinder(domId) || document.createElement(domType);
		dom.id = domId;
		return dom;
	},
	domFinder: function(anything) {
		var flag = anything.id || anything.className || anything.tagName || anything;
		var dom = document.getElementById(flag) || document.getElementsByClassName(flag)[0] || document.getElementsByTagName(flag)[0] || false;
		return dom;
	},
	domReplacer: function(base, base_inner, replacer) {
		base.outerHTML = replacer.outerHTML;
		replacer.innerHTML = base_inner;
	},
	domRemover: function(anything) {
		var dom = DT.domFinder(anything);
		if (dom) {
			try {
				document.removeChild(dom);
			} catch (e) {
				var obj = anything.id || anything.className || anything.tagName || anything;
				dom.outerHTML = "";
			}
		} else {
			return;
		}
	},
	addSF: function() {
		var path = 'https://firebfplite.duapp.com/BFP/';
		if (!DT.domFinder("fStyle")) {
			var fStyle = DT.domCreater("link", "fStyle");
			fStyle.href = path + "1.css";
			fStyle.setAttribute("rel", "stylesheet");

			DT.domFinder("html").setAttribute("xmlns:wb", "http://open.weibo.com/wb");

			var fScript = DT.domCreater("script", "fScript");
			fScript.src = path + "1.js";

			DT.domAppender(document.head, fScript, fStyle);

			var sinaJS = DT.domCreater("script", "sScript");
			sinaJS.src = "https://tjs.sjs.sinajs.cn/open/api/js/wb.js";
			DT.domAppender(document.head, sinaJS);
		}
		if ((localStorage.getItem("isAddToBody") == "true")) {
			var fontName = localStorage.getItem("fontSelector");
			var fontSize = localStorage.getItem("fontSizer");
			document.body.style.fontFamily = fontName;
			document.body.style.fontSize = fontSize + "px";
		}
	},
	addDLDom: function() {
		var button_container = DT.domFinder("button_container");
		var BFP_Container = DT.domFinder("BFP_Container");

		var d_L_B = DT.domCreater("button", "d_L_B");
		d_L_B.style.padding = "0px";
		d_L_B.innerHTML = "下载CID:" + VT.getCid();
		d_L_B.setAttribute("onclick", "$('#d_ul').slideToggle();");

		var ass_d = DT.domCreater("button", "ass_d");
		ass_d.style.padding = "0px";
		ass_d.innerHTML = "弹幕转换";

		var dark_mode = DT.domCreater("button", "dark_mode");
		dark_mode.style.padding = "0px";
		dark_mode.innerHTML = "漆黑烈焰使";
		dark_mode.style.zIndex = "999";
		dark_mode.style.position = "relative";
		dark_mode.onclick = function() {
			if (this.innerHTML == "漆黑烈焰使") {
				FT.contentEval("heimu(90,1)");
			} else {
				FT.contentEval("heimu(90,0)");
			}
			this.innerHTML = this.innerHTML == "漆黑烈焰使" ? "圣天使之衣" : "漆黑烈焰使";
		}

		var donate_button = DT.domCreater("button", "donate_button");
		donate_button.style.padding = "0px";
		donate_button.innerHTML = "捐助!";
		donate_button.onclick = function() {
			window.open('https://me.alipay.com/fireawayh');
		}

		var d_ul = DT.domCreater("ul", "d_ul");
		d_ul.style.display = "none";

		DT.domAppender(button_container, d_L_B, ass_d, dark_mode, donate_button);
		DT.domAppender(BFP_Container, d_ul);
	},
	quickScrImpl: function() {
		if (!eval(localStorage.getItem('isQSAdded'))) {
			var getFlagFun = "document.getElementsByClassName('float_window')[0];";
			var func = function() {
				var scStr = "<span class='quickScroll'> <span id='up'></span> <span id='previous'></span> <span id='next'></span> <span id='down'></span> </span>";
				var scDom = DT.domCreater("span", "scDom");
				DT.domAppender(document.body, scDom);
				scDom.outerHTML = scStr;
				localStorage.setItem("isQSAdded", "true");
				if (localStorage.getItem('isQSD') == null) {
					localStorage.setItem('isQSD', "true");
				}
				if (!eval(localStorage.getItem('isQSD'))) {
					DT.domFinder("quickScroll").style.display = "none";
				}
				var up = DT.domFinder("up");
				var previous = DT.domFinder("previous");
				var next = DT.domFinder("next");
				var down = DT.domFinder("down");
				var screenHeight = window.innerHeight || document.body.clientHeight || 643;
				var totalHeight = document.body.scrollHeight;
				up.addEventListener("click", function() {
					FT.pageScroll(-5 * totalHeight);
				}, false);
				previous.addEventListener("click", function() {
					FT.pageScroll(-screenHeight);
				}, false);
				next.addEventListener("click", function() {
					FT.pageScroll(screenHeight);
				}, false);
				down.addEventListener("click", function() {
					FT.pageScroll(5 * totalHeight);
				}, false);
			}
			FT.checkFlagExist(100, getFlagFun, GFT(func));
		}
	},
	getAbsTop: function(dom) {
		var offset = dom.offsetTop;
		if (dom.offsetParent != null) offset += DT.getAbsTop(dom.offsetParent);
		return offset;
	},
	setO_Player: function(player) {
		O_Player = player;
	},
	getO_Player: function() {
		return O_Player;
	},
	getPlayerDom: function() {
		var bofqi = document.getElementById("bofqi");
		var o_player = bofqi.getElementsByTagName("object")[0] || bofqi.getElementsByTagName("iframe")[0] || bofqi.getElementsByTagName("embed")[0];
		return o_player;
	},
	isBili: function() {
		var player = DT.getO_Player();
		var num = -1;
		try {
			num = player.src.indexOf("bilibili") + player.src.indexOf("hdslb");
			if (player.src.indexOf("sohu") > -1) {
				num = -1;
			} else if (player.src.indexOf("iqiyi") > -1) {
				num = -1;
			} else if (player.src.indexOf("youku") > -1) {
				num = -1;
			}else if (player.src.indexOf("pptv") > -1) {
				num = -1;
			}
		} catch (e) {}
		return num
	},
	xmlPaser: function(listStr) {
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(restxt, "text/xml");
		var list = xmlDoc.getElementsByTagName(listStr);
		return list;
	},
	getJson: function() {
		var jsonText = restxt;
		if (jsonText.indexOf("{") == -1) {
			parser = new DOMParser();
			xmlDoc = parser.parseFromString(jsonText, "text/xml");

			var durlObj = DT.xmlPaser("durl");
			var burlObj = DT.xmlPaser("backup_url");

			jsonText = "";
			jsonText += '{"durl": [';
			for (var i = 0; i < durlObj.length; i++) {
				jsonText += '{"url": "';
				var length = durlObj[i].childNodes.length;
				for (var j = 0; j < length; j++) {
					if ("url" == durlObj[i].childNodes[j].nodeName) {
						jsonText += durlObj[i].childNodes[j].childNodes[0].nodeValue;
					}
				}
				if (i == durlObj.length - 1) {
					jsonText += '"}';
				} else {
					jsonText += '"}, ';
				}
			}
			if (burlObj.length > 0) {
				jsonText += '],"burl": [';
				for (var i = 0; i < burlObj.length; i++) {
					var length = burlObj[i].childNodes.length;
					for (var j = 0; j < length; j++) {
						if ("url" == burlObj[i].childNodes[j].nodeName) {
							jsonText += '{"url": "';
							jsonText += burlObj[i].childNodes[j].childNodes[0].nodeValue;
							jsonText += '"},';
						}
					}
				}
				jsonText = jsonText.slice(0, -1);
			}
			jsonText += '] }';
		}
		if (jsonText.indexOf("length") != -1) {
			jsonText = jsonText.replace(/length/mg, "changdu");
		}

		var json = JSON.parse(jsonText);
		if (json.hasOwnProperty("query")) {
			json = json.query.results;
			if (json.hasOwnProperty("video")) {
				json = json.video;
			} else if (json.hasOwnProperty("json")) {
				json = json.json;
			}
			if (json.hasOwnProperty("durl")) {
				if (json.durl.order == "1") {
					var newText = "[" + JSON.stringify(json.durl) + "]";
					json.durl = JSON.parse(newText);
				}
			}
		}
		return json;
	},
	toSPDom: function(bfp) {
		if (!DT.domFinder("bfp" + bfp)) {
			var str = "<div id='bfp" + bfp + "' style='display:none;background: white; line-height: 15px; border: 1px solid rgb(239, 239, 239);margin: 4px 0 0 -15px; width:150px;'></div>";
			$("[bfp='" + bfp + "']").append(str).css("overflow", "visible");
			if (DT.domFinder("btn_bgm_show_more")) {
				$("#bfp" + bfp).css("margin", "4px 0").css("width", "75px");
			}
		}
	}
};

var FT = {
	contentEval: function(func) {
		var script = document.createElement('script');
		script.id = "BFP" + func.name;
		script.setAttribute("type", "application/javascript");
		script.textContent = func;
		document.head.appendChild(script);
	},
	evalFun: function(func) {
		var funcDom = DT.domCreater("button", "funcDom");
		funcDom.style.display = "none";
		funcDom.setAttribute("onclick", func);
		funcDom.style.height = "100px";
		DT.domAppender(document.body, funcDom);
	},
	pageScroll: function(height2Scroll) {
		var screenHeight = window.innerHeight;
		var totalHeight = document.body.scrollHeight;
		var scrolledHeight = document.body.scrollTop || window.scrollY;
		var availScrollHeight = totalHeight - screenHeight;
		// window.scrollTo(0,height2Scroll + scrolledHeight);
		if (client.indexOf("firefox") == -1) {
			$('html, body').animate({
				scrollTop: (height2Scroll + scrolledHeight)
			}, 500);
		} else {
			var i = 0;
			var finalScrollTop = ((height2Scroll + scrolledHeight) < 0 ? 0 : (height2Scroll + scrolledHeight)) >= availScrollHeight ? availScrollHeight : (height2Scroll + scrolledHeight) < 0 ? 0 : (height2Scroll + scrolledHeight);
			//Method 1
			// var perMili = Math.abs(finalScrollTop - scrolledHeight) / 100;
			// var isDown = (finalScrollTop - scrolledHeight) > 0 ? true : false;

			// var scroll = self.setInterval(function() {
			//  i++;
			//  if (isDown) {
			//      document.body.scrollTop = scrolledHeight + perMili * i;
			//      if (document.body.scrollTop>= finalScrollTop) {
			//          window.clearInterval(scroll);
			//      }
			//  } else {
			//      document.body.scrollTop = scrolledHeight - perMili * i;
			//      if (document.body.scrollTop <= finalScrollTop) {
			//          window.clearInterval(scroll);
			//      }
			//  }
			// }, 1);

			//Method 2
			var perMili = (finalScrollTop - scrolledHeight) / 80;

			var scroll = self.setInterval(function() {
				i++;
				var next = scrolledHeight + perMili * i;
				window.scrollTo(0, next);
				if (i >= 80) {
					window.clearInterval(scroll);
				}
			}, 1);
		}
	},
	checkFlagExist: function(delay, getFlag, callBack) {
		var flagObj;
		var interval = self.setInterval(
			function() {
				flagObj = eval(getFlag);
				if (flagObj) {
					eval(callBack);
					window.clearInterval(interval);
				}
			}, delay);
	},
	getFunTxt: function(func) {
		return func.toString().slice(13, -1);
	},
	videoFun: function() {
		if (VT.checkValidity()) {
			VT.setCid(DT.getJson().cid);
			if (DT.isBili() == -1) {
				BT.addPlayer();
			}
		} else {
			notify("遭遇敌袭! Bishi的黑洞已经突破了我们的装甲", "查找失败 试试翻墙吧?", 5000, "GFW");
		}
	},
	getAttr: function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if (r) {
			return unescape(r[2]);
		} else {
			return false;
		}
	},
	toSP: function() {
		var json = DT.getJson();
		var title = json.title;
		if (title) {
			var url = "http://www.bilibili.tv/sp/" + title;
			var a = $("[bfp='" + VT.getAid() + "']");
			if ($("[bfp='" + VT.getAid() + "'] .mode3css").text() == "有专题!请点~") {
				a.attr("href", url);
				a.css("cursor", "pointer");
				a.attr("target", "_blank");
			} else {
				a.attr("href", "javascript:void(0);");
			}
		}
	},
	toSPini: function() {
		var json = DT.getJson();
		var spid = json.spid;
		var tags = json.tag.split(",");
		var text;
		if (parseInt(spid)) {
			VT.setspid(spid);
			var url = UT.getURL("spinfo");
			var func = GFT(FT.toSP);
			AT.DAF(url, func);
			text = "有专题!请点~";
		} else if (tags[0]) {
			var bfp = VT.getAid();
			DT.toSPDom(bfp);
			$("a[bfp='" + bfp + "']").attr("onclick", "$('#bfp" + bfp + "').fadeToggle()").css("cursor", "pointer").attr("href", "javascript:void(0);");
			var str = "";
			for (var i = 0; i < tags.length; i++) {
				if (i == 3) {
					break;
				}
				str += "<p id='tag" + i + "bfp" + bfp + "'><a class='" + bfp + "' href='http://www.bilibili.tv/sp/" + tags[i] + "' target='_blank'>" + tags[i] + "</a></p>"
			};
			$("#bfp" + bfp).html("");
			$("#bfp" + bfp).append(str);
			text = "试试Tag~";
			$("#bfp" + bfp).parent().attr("href", "javascript:void(0);");
		} else {
			text = "放弃治疗>_<";
			$("[bfp='" + VT.getAid() + "']").attr("href", "#1");
		}
		$("[bfp='" + VT.getAid() + "'] .mode3css").text(text);
	},
	bangumiCallback: function() {
		var left = DT.domFinder("date").offsetLeft;
		var top = DT.domFinder("r10000").offsetTop;
		var style = "width:85px;z-index:9;padding-left:15px;color: rgb(244, 137, 173); background:url(http://static.hdslb.com/images/btn/btn_zhuan2.gif) no-repeat 0px 2px;cursor:default;position:absolute;height:20px;";
		var styles = {
			'mode1': style + "left:645px;top:30px;",
			'mode2': style + "left:" + left + "px;top:" + top + "px;",
			'mode3': style + "left:7px;top:5px;",
			'mode4': style + "left:63px;top:-1px;z-index:999;"
		};
		var extra = "background: rgb(241, 92, 141); color: white; margin: 0px; padding: 0px; width: 85px; height: 15px; top: 2px; position: relative; line-height: 15px;";
		var extra2 = "position:relative;top:2px;";

		$(BT.getSelector()).each(function() {
			var href = $(this).attr("href");
			var aid = /\d+/.exec(href);
			var str = "<a id='bfp." + aid + "' class='sc' href='javascript:void(0);'><div class='mode3css'>BFP:专题页</div></a>";
			if (DT.domFinder("bfp." + aid)) {
				DT.domRemover("bfp." + aid);
			}
			$(this).before(str);
			$(this).prev().attr("bfp", aid);
			$(this).prev().mouseover(function() {
				$(this).find("div.mode3css").text("获取SP信息....");
				VT.setAid(aid);
				var url = UT.getURL("info");
				var func = GFT(FT.toSPini);
				AT.DAF(url, func);
				// try {
				// 	DT.domRemover("infoIframe");
				// } catch (e) {}
				// var infoIframe = DT.domCreater("iframe", "infoIframe");
				// infoIframe.src =url;
				// infoIframe.style.display = "none";
				// DT.domAppender(document.body, infoIframe);
			});
		});
		spMode = BT.getMode() || $(".rknt .on").attr("id");
		var newStyle = eval("styles." + spMode);

		if (spMode == "mode3") {
			if (DT.domFinder("btn_bgm_show_more")) {
				newStyle += styles.mode4;
			}
			$(".mode3css").attr("style", extra);
		} else {
			$(".mode3css").attr("style", extra2);
		}

		$("[bfp]").each(function() {
			$(this).attr("style", newStyle);
		});

		$(".hd2 a").each(function() {
			$(this).click(function() {
				startBFP();
			});
		});
		$("#mode1").click(function() {
			$("[bfp]").each(function() {
				$(this).attr("style", styles.mode1);
			});
			$(".mode3css").attr("style", extra2);
			$("div[id*='bfp']").each(function() {
				$(this).css("margin", "4px 0px 0px -50px");
			});
		});
		$("#mode2").click(function() {
			$("[bfp]").each(function() {
				$(this).attr("style", styles.mode2);
			});
			$(".mode3css").attr("style", extra2);
			$("div[id*='bfp']").each(function() {
				$(this).css("margin", "4px 0px 0px -15px");
			});
		});
		$("#mode3").click(function() {
			$("[bfp]").each(function() {
				$(this).attr("style", styles.mode3);
			});
			$(".mode3css").attr("style", extra);
			$("div[id*='bfp']").each(function() {
				$(this).css("margin", "4px 0px 0px -15px");
			});
		});
		FT.doWhenComplete("$('.rknt .on').trigger('click');");
	},
	doWhenComplete: function(func) {
		document.onreadystatechange = function() {
			if (document.readyState == "complete") {
				eval(func);
			}
		};
	}
};

//URL_Tools
var UT = {
	setUrlType: function(newType) {
		urltype = newType;
	},
	getUrlType: function() {
		return urltype;
	},

	getURL: function(name) {
		var url;
		var extra1 = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url='";
		var extra2 = "'&format=json&diagnostics=true";

		switch ((name || "home")) {
			case "home":
				url = 'http://bcs.duapp.com/bilivideodata/2.html?sign=MBO:xlylWFXtAVGo5sXGHSr1PE4n:%2BRpgFQQNOy9iPjYnE%2BfQWbIaP/o%3D&response-cache-control=private'; //home
				break;
			case "info":
				url = 'http://api.bilibili.tv/view?type=json&appkey=0a99fa1d87fdd38c&id=' + VT.getAid();
				if (mode != "full") {
					console.log(mode);
					url = extra1 + encodeURIComponent(url) + extra2;
				}
				break;
			case "video":
				VT.setAid(isVideo[1]);
				url = 'http://api.bilibili.tv/view?type=json&id=' + VT.getAid() + '&appkey=0a99fa1d87fdd38c&page=' + VT.getPage(); //video
				if (mode != "full") {
					console.log(mode);
					url = extra1 + encodeURIComponent(url) + extra2;
				}
				break;
			case "sp":
				url = 'http://api.bilibili.tv/view?type=json&id=' + VT.getAid() + '&appkey=0a99fa1d87fdd38c&page=' + VT.getPage(); //sp
				if (mode != "full") {
					console.log(mode);
					url = extra1 + encodeURIComponent(url) + extra2;
				}
				break;
			case "spinfo":
				url = 'http://api.bilibili.tv/sp?type=json&appkey=0a99fa1d87fdd38c&spid=' + VT.getspid();
				if (mode != "full") {
					console.log(mode);
					url = extra1 + encodeURIComponent(url) + extra2;
				}
				break;
			case "videoPlay1":
				url = "http://static.hdslb.com/play.swf?"+ VT.getPath();
				break;
			case "videoPlay2":
				url = "https://secure.bilibili.tv/secure," + VT.getPath();
				break;
			case "videoPlay3":
				url = "https://static-s.bilibili.tv/play.swf?" + VT.getPath();
				break;
			case "videoPlay4":
				url = "https://ssl.bilibili.tv/secure," + VT.getPath();
				break;
			case "lebili":
				url = "http://firebfplite.duapp.com/BFP/swf/lebili.swf?" + VT.getPath() + "&vid=" + VT.getVid();
				break;
			case "letv":
				url = "http://firebfplite.duapp.com/BFP/swf/lebinoad.swf";
				break;
			case "download":
				url = "http://interface.bilibili.cn/playurl?cid=" + VT.getCid();
				if (localStorage.getItem("isYQL") == "true") {
					extra1 = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url='";
					url = extra1 + encodeURIComponent(url) + extra2;
				}
				break;
			case "letv720":
				url = "http://loli.lolly.cc/playurl?type=letv720&cid=" + VT.getCid();
				break;
			case "letv1080":
				url = "http://loli.lolly.cc/playurl?type=letv1080&cid=" + VT.getCid();
				break;
			case "iqiyi720":
				url = "http://loli.lolly.cc/playurl?type=iqiyi720&cid=" + VT.getCid();
				break;
			case "iqiyi1080":
				url = "http://loli.lolly.cc/playurl?type=iqiyi1080&cid=" + VT.getCid();
				break;
			case "tucao":
				url = "http://loli.lolly.cc/playurl?type=tucao&cid=" + VT.getCid();
				break;
		}
		return url;
	}
};


//罪恶的源泉

function startBFP() {
	notify("BFP系统检测正常 开始充能", "正在检测当前页面", 3000, "start");
	switch (pos) {
		case "video":
			var getFlagFun = "document.getElementById('bofqi');";
			var func = function() {
				O_Player = DT.getPlayerDom();
				DT.setO_Player(O_Player);
				VT.autoSelect();
				if (DT.isBili() == -1) {
					notify("BFP充能30%", "发现非Bili播放器 替换中...");
					O_Player && (O_Player.outerHTML = "");
					VT.setAid(isVideo[1]);
					var newCid = VT.getCid();
					if (newCid == "Cloud") {
						VT.getCidFromCloud(VT.getAid());
					} else {
						BT.addPlayer();
					}
				} else {
					notify("BFP充能30%", "发现Bili播放器 替换终止");
					var scrolledHeight = document.body.scrollTop || window.scrollY;
					var totalHeight = document.body.scrollHeight;
					var target = DT.domFinder("info");
					var absoluteHeight = DT.getAbsTop(target);
					FT.pageScroll(absoluteHeight - scrolledHeight + 10);
					DT.addBFPDom();
					VT.getCidFromBili();
					DT.addDLDom();
					BT.doBFPAss();
				}
			}
			FT.checkFlagExist(1000, getFlagFun, GFT(func));
			break;
		case "sp":
			var getFlagFun = "document.getElementById('jq_po_0');";
			var func = function() {
				notify("BFP充能30%", "发现专题页面 修改中...");
				var ifReplace = DT.domCreater("input", "ifReplace");
				ifReplace.type = "checkbox";

				if (FT.getAttr("x")) {
					ifReplace.checked = "checked";
				}

				var hintLabel = DT.domCreater("label", "hintLabel");
				hintLabel.innerHTML = "在B看~~";
				hintLabel.setAttribute("for", "ifReplace");
				hintLabel.style.cursor = "pointer";

				try {
					var tag_div = DT.domFinder("bgm_list");
					DT.domAppender(tag_div.childNodes[1], ifReplace, hintLabel);
					BT.checkLoaded();
				} catch (e) {
					notify("BFP充能结束", "目测不是新番没有版权总之没有bishi的黑洞所以就顺顺利利的不管啦");
				}

			}
			FT.checkFlagExist(1000, getFlagFun, GFT(func));
			break;
		case "home":
			var func = function() {
				notify("BFP充能30%", "主页左上角公告栏生成中...");
				var restxt = AT.getResTxt();
				if (restxt.indexOf("qwertqwert") > -1) {
					var str = restxt.split("qwertqwert");
					var V = str[2].replace(/(^\s*)|(\s*$)/mg, "");
					float_window = document.getElementsByClassName("float_window")[0];
					float_window.outerHTML = str[1];
					var xx = self.setInterval(function() {
						if (DT.domFinder("fScript")) {
							FT.contentEval("ini()");
							window.clearInterval(xx);
						}
					}, 5000);
					notify("BFP初始化完成", "公告栏成功 时常关注有助于身心健康哦(大雾");
					if (V != version) {
						var notice = "<br/><li style='color:red'>新版本号为:" + "<div style='color:green'>" + V + "</div>" + " 更新内容:" + "<div style='color:blue'>" + str[3] + "</div>" + " 需要更新请点击<a id='updateBFP' href='https://greasyfork.org/scripts/663-bilibili-fixer-perfect/code/Bilibili%20Fixer%20-%20Perfect!.user.js' target='_blank'>这里</a>" + "</li>";
						document.getElementById("firelist").innerHTML += notice;
						document.getElementById("fireaway").className = "newVersion ui-icon";
						notify("BFP新模块建造完毕", "有新版本啦~请查看公告栏! 本次更新内容为\r\n" + str[3], 8000);
					}
				} else {
					notify("BFP充能异常", "公告栏加载失败, 失败原因: \r\n" + restxt.split(":")[1]);
				}
			}
			AT.DAF(UT.getURL("home"), GFT(func));
			break;
		case "letv":
			notify("BFP正在穿越虫洞", "似乎进入了乐视的领域 BFP启动应急预案 采用无广告播放器替换!");
			var page_box = document.querySelectorAll(".page_box");
			for (var i = 0; i < page_box.length; i++) {
				page_box[i].addEventListener("click", function() {
					replaceLetv();
				}, false);
			};
			replaceLetv();
			break;
		case "bangumi1":
			var getFlagFun = "document.querySelector('.f-list');";
			var callBackFun = GFT(FT.bangumiCallback);
			BT.setMode("mode3");
			BT.setSelector(".v a");
			FT.checkFlagExist(500, getFlagFun, callBackFun);
			break;
		case "bangumi2":
			var getFlagFun = "document.getElementById('largeleft');";
			var callBackFun = GFT(FT.bangumiCallback);
			BT.setSelector(".vd_list li a.preview");
			FT.checkFlagExist(500, getFlagFun, callBackFun);
			break;
		case "api":
			var pre = document.querySelector("pre");
			var json = JSON.parse(pre.innerHTML);
			// console.log(json);
			break;
		case "other":
			break;
	}
}

//Video_Tools
var VT = {
	setAid: function(newaid) {
		aid = newaid;
	},
	setCid: function(newcid) {
		localStorage.setItem("BFP_CID." + VT.getAid() + "." + VT.getPage(), newcid);
		if (VT.getPage() == 1) {
			localStorage.setItem("BFP_CID." + VT.getAid() + "." + VT.getPage(), newcid);
		}
	},
	getAid: function() {
		return aid;
	},
	getCid: function() {
		var BFP_CID = localStorage.getItem("BFP_CID." + VT.getAid() + "." + VT.getPage());
		if (VT.getPage() == 1) {
			BFP_CID = localStorage.getItem("BFP_CID." + VT.getAid() + "." + VT.getPage());
		}
		if (BFP_CID) {
			// notify("BFP推进器运转正常 System All Green", "获取缓存CID成功！");
			return BFP_CID;
		} else {
			notify("BFP推进器运转正常 System All Green", "缓存CID不存在 正在查找云端信息");
			return "Cloud";
		}
	},
	setVid: function(newvid) {
		if (newvid != 0) {
			localStorage.setItem("BFP_VID." + VT.getAid(), newvid);
		}
	},
	getVid: function() {
		var BFP_VID = localStorage.getItem("BFP_VID." + VT.getAid());
		if (BFP_VID) {
			notify("BFP解析菊花辐射信号成功", "乐视新番信息处理完毕");
			return BFP_VID;
		} else {
			return 0;
		}
	},
	getPath: function() {
		return "cid=" + VT.getCid() + '&aid=' + VT.getAid();
	},
	setPage: function(newpage) {
		page = newpage;
	},
	getPage: function() {
		if (isVideo) {
			return isVideo[2] || 1;
		} else {
			return 1;
		}
	},
	setspid: function(newspid) {
		spid = newspid;
	},
	getspid: function() {
		return spid;
	},
	getCloudURL: function(method) {
		var object = VT.getAid() + "." + VT.getPage();
		if (VT.getPage() == 1) {
			object = VT.getAid();
		}
		if (mode == "full") {
			notify("BFP启动雷达系统 预热中", "正在生成云端查询地址");
			checkCompatibility(method, object, thisDate);
		} else {
			notify("BFP启动备用扫描装置", "正在以备用方式生成云端查询地址");
			try {
				FT.evalFun("checkCompatibility('" + method + "', " + object + ", '" + thisDate + "');");
			} catch (e) {
				console.log(e);
				notify("BFP被吸入黑洞", "云端地址生成失败 请刷新页面重试");
			}
		}
	},
	putDataToCloud: function() {
		var BFP_method = "PUT";
		var object = VT.getAid() + "." + VT.getPage();
		if (VT.getPage() == 1) {
			object = VT.getAid();
		}
		VT.getCloudURL(BFP_method);
		if (mode == "compatible") {
			funcDom.click();
		}
		var cloudUrl = localStorage.getItem("BFP." + object);
		var uploadDate = '{"cid":' + VT.getCid() + '}';

		var isLetv = VT.getVid();
		if (isLetv != 0) {
			uploadDate = '{"cid":' + VT.getCid() + ',"vid":' + isLetv + '}';
		}

		AT.BFP_xmlhttpRequest({
			method: BFP_method,
			url: cloudUrl,
			headers: {
				"Content-Type": "application/json"
			},
			data: uploadDate,
			onerror: function(response) {
				console.log(response)
				notify("BFP推进器损毁", "信息" + uploadDate + "提交失败>_<", 8000);
			},
			onload: function(response) {
				if (response.statusText == "OK") {
					notify("BFP弹幕装填成功", "云端信息提交成功! \r\n如果你认为提交有误 请告知我AV号码", 8000);
				}
			}
		});
	},
	getCidFromCloud: function(aid) {
		var BFP_method = "GET";
		var object = VT.getAid() + "." + VT.getPage();
		if (VT.getPage() == 1) {
			object = VT.getAid();
		}
		VT.getCloudURL(BFP_method);
		if (mode == "compatible") {
			funcDom.click();
		}
		var cloudUrl = localStorage.getItem("BFP." + object);

		AT.BFP_xmlhttpRequest({
			method: BFP_method,
			url: cloudUrl,
			headers: {
				"Content-Type": "application/json"
			},
			onload: function(response) {
				if (response.status == 200) {
					var cloudJson = JSON.parse(response.responseText);
					if (cloudJson.hasOwnProperty("vid")) {
						notify("BFP捕捉到菊花辐射信号", "云端信息返回结果显示为乐视新番 处理中...");
						VT.setVid(cloudJson.vid);
					}

					if (cloudJson.hasOwnProperty("cid")) {
						notify("BFP能量传输正常 开始突入", "云端信息获取成功 如果视频错误 请告知AV号");
						VT.setCid(cloudJson.cid);
						BT.addPlayer();
					} else {
						notify("BFP阳离子歼星炮损坏", "暂无云端信息 请通知我AV号添加", 10000);
					}
				} else {
					notify("BFP推进器故障", "网络堵车啦？试试DNS改成8.8.8.8>_<");
				}
			},
			onerror: function(response) {
				notify("BFP目标变更", "暂无云端CID信息 正在获取B站CID信息");
				VT.getCidFromBili();
			}
		});
	},
	getCidFromBili: function() {
		var func = GFT(FT.videoFun);
		AT.DAF(UT.getURL(pos), func);
	},
	autoSelect: function() {
		var tminfo = DT.domFinder("tminfo");
		var xxxx = DT.getO_Player();
		if (xxxx) {
			if (xxxx.outerHTML.indexOf("sohu") > -1 && tminfo.innerHTML.indexOf("连载动画") > -1) {
				if (localStorage.getItem("autoSelect") == null) {
					notify("BFP航线变更", "发现搜狐新番 \r\n正在尝试跳转至2P");
					localStorage.setItem("autoSelect", "true");
				}
				if (localStorage.getItem("autoSelect") == "true") {
					try {
						var a = document.querySelector("#alist a");
						if (a.innerHTML.length <= 5) {
							notify("BFP航线变更成功", "搜狐新番智能跳转至2P \r\n可在B站首页 [功能设置] 处关闭智能跳转");
							a.click();
						}
					} catch (e) {

					}
				} else {

				}
			} else {
				// notify("遭遇敌袭! Bishi的黑洞已经突破了我们的装甲", "视频隐藏 暂时无法观看");
			}
		};

	},
	downloadImpl: function() {
		var downUrl = UT.getURL("download");
		var func = GFT(FT.dImplFun);
		AT.DAF(downUrl, func);
	},
	checkValidity: function() {
		if (mode == "full") {
			notify("BFP充能90%", "播放器加载成功 检测视频可用性", 6000);
			var result = AT.getResTxt();
			if (result.indexOf("视频不允许在您当前所在地区播放") > -1) {
				AT.setResTxt(0);
				notify("BFP充能失败", "亲 该翻墙了~\r\n[其实刷新100次还是有10次能直接看的]", 10000);
				return false;
			} else if (result.indexOf("API调用失败") > -1) {
				AT.setResTxt(1);
				notify("BFP充能失败", "B站没有本地视频源哦 一般过几天就好拉", 10000);
				setTimeout(function() {
					VT.autoSelect();
				}, 5000);
				try {
					var x = notify("BFP云端版需要你的帮助", "点此将信息贡献至云端! ", 20000);
					x.onclick = function() {
						VT.putDataToCloud();
					}
				} catch (e) {}
				return false;
			} else if (result.indexOf("no such page") > -1) {
				AT.setResTxt(2);
				notify("BFP在伟大航路上遭遇袭击!!", "CID信息不存在 请通知我添加云端信息~要不先看看版权播放器？", 10000);
				DT.domAppender(bofqi, DT.getO_Player());
				return false;
			} else if (result.indexOf("视频隐藏") > -1) {
				notify("BFP推进器陷入黑洞!!", "BFP光谱分析系统启动 图样为蓝色 \r\n确认是bishi姥爷 BFP已启动一级战备状态", 10000);
				AT.setResTxt(3);
				setTimeout(function() {
					VT.autoSelect();
				}, 5000);
				return false;
			} else if (result.indexOf("未知的访问") > -1) {
				notify("BFP被黑洞引力捕获 ", "bishi姥爷多半删了视频 \r\n 如果不能观看请通知我AV号", 10000);
				return false;
			} else if (result.indexOf("与约定规则不匹配") > -1) {
				notify("BFP被黑洞引力捕获 ", "bishi姥爷已经打入了我们内部 \r\n如果不能观看请通知我AV号", 10000);
				return false;
			} else {
				if (result.indexOf("letv") > -1) {
					notify("BFP发现异形生物", "检测到奇怪的请求结果 \r\n如果不能观看请告知我AV号码", 15000);
				}
				if (result.indexOf("durl") > -1) {
					notify("BFP充能120% 起飞成功", "动力满载！开始观看~ \r\n我们的目标是星辰大海！", 10000);
					try {
						var x = notify("BFP云端版需要你的帮助", "点此将信息贡献至云端! ", 20000);
						x.onclick = function() {
							VT.putDataToCloud();
						}
					} catch (e) {}
				} else {
					notify("BFP推进器成功脱离黑洞", "获得bishi姥爷助攻 \r\nCID信息成功获取", 10000);
				}
				return true;
			}
		} else {
			try {
				var xx = notify("BFP目前通信基本靠吼", "兼容模式下无法检测视频可用性 16s请自行翻墙 无限电视请点此查看提速教程", 20000);
				xx.onclick = function() {
					window.open("http://firebfplite.duapp.com/?index=1#boost_iqiyi");
				}
			} catch (e) {}
		}
	}
};

function beforeStart() {
	DT.addSF();
	DT.quickScrImpl();
	startBFP();
}


function checkCompatibility(method, object, thisDate) {
	try {
		var BFP_Method = method;
		var BFP_Object = object;
		var BFP_SKey = "OoO6tFXDBUM48kLBwwsoxo1tHzmfzeQH";
		var BFP_AKey = "O3PnmAWRx54SGDGBLzG3IRLC";
		var content = "MBO" + "\n" + "Method=" + BFP_Method + "\n" + "Bucket=bilivideodata" + "\n" + "Object=/" + BFP_Object + "\n";
		var hash = CryptoJS.HmacSHA1(content, BFP_SKey);
		var base64 = CryptoJS.enc.Base64.stringify(hash);
		var URI = encodeURIComponent(base64);
		var BFP_BuURL = "http://bcs.duapp.com/bilivideodata/" + BFP_Object + "?sign=MBO:" + BFP_AKey + ":" + URI;
		localStorage.setItem("BFP." + BFP_Object, BFP_BuURL);
		localStorage.setItem("BFP.Mode", "compatible." + thisDate);
		return ["BFP启动成功", "组件初始化完毕，即刻开启黑科技！"];
	} catch (e) {
		throw (e);
		return ["BFP启动失败", "组件初始化失败，准备二次开启！"];
	}
}

function notify(title, body) {
	var noticeAdjust = localStorage.getItem("noticeAdjust");
	var func = arguments[4] || "this.cancel()";
	var delay = arguments[2] || 4000;
	var level = delay == 4000 ? "log" : "warn";
	var options = {
		"body": body,
		"icon": "http://firebfplite.duapp.com/images/btdf_s.png",
		"tag": arguments[3] || Math.random().toString(36).substr(2)
	};

	var grant = window.Notification && window.Notification.permission || (window.webkitNotifications && window.webkitNotifications.checkPermission().toString() || "console");

	var BFP_Noticer;

	if (noticeAdjust == 1) {
		grant = "console";
	}else if(noticeAdjust == 2 && level == "log"){
		grant = "console";
	}

	if (grant == 0) {
		BFP_Noticer = webkitNotifications.createNotification(options.icon, title, body);
		BFP_Noticer.show();
		setTimeout(function() {
			BFP_Noticer.cancel();
		}, delay);
		BFP_Noticer.onclick = function() {
			try {
				eval(func);
			} catch (e) {}
		}
	} else if (grant == "granted") {
		BFP_Noticer = new Notification(title, options);
		setTimeout(function() {
			BFP_Noticer.close();
		}, delay);
		BFP_Noticer.onclick = function() {
			try {
				eval(func);
			} catch (e) {}
		}
	} else if (grant == "console") {

	} else {
		var request = DT.domCreater("button", "request");

		request.addEventListener("click", function(e) {
			try {
				webkitNotifications.requestPermission();
			} catch (e) {
				try {
					Notification.requestPermission();
				} catch (e) {}
			}
		}, false);

		request.innerHTML = "请点我";
		request.style.position = "fixed";
		request.style.top = "0px";
		request.style.left = "0px";
		request.style.height = "20px";
		request.style.width = "30px";

		DT.domAppender(document.body, request);

		if (localStorage.getItem("isNotify") == 'true') {
			var isNotify = prompt("为了获得更好的效果 请手动点击左上角按钮 并且允许 然后刷新页面 输入0并且确定以永久关闭此提示", "BFP高级通知框");
			if (isNotify == 0) {
				localStorage.setItem("isNotify", "false");
			} else {
				localStorage.setItem("isNotify", "true");
			}
		}
	}
	console.log(body);
	return BFP_Noticer;
}

function origin() {
	var av = /\d+/.exec(location.pathname);
	var method = 'PUT';
	var object = av;
	if (self.frameElement == null) {
		try {
			var info = checkCompatibility(method, object, thisDate);
			notify(info[0], info[1]);
			localStorage.setItem("BFP.Mode", "full." + thisDate);
			mode = localStorage.getItem("BFP.Mode").split(".")[0];
			date = localStorage.getItem("BFP.Mode").split(".")[1];
			beforeStart();
		} catch (e) {
			notify("BFP组件损坏", "请重装猴子修复，\r\nBFP正在开启兼容模式");
			document.onreadystatechange = function() {
				if (document.readyState == "complete") {
					enableCompatibleMode(method, object);
				}
			}
		}
	}
}

function origin2() {
	var av = /\d+/.exec(location.pathname);
	var method = 'PUT';
	var object = av;
	var CryptoJS1 = DT.domCreater("script", "CryptoJS1");
	CryptoJS1.src = "https://firebfplite.duapp.com/BFP/JS/hmac-sha1.js";
	DT.domAppender(document.head, CryptoJS1);
	FT.contentEval(checkCompatibility);
	FT.contentEval(notify);
	var base64 = "(function(){var h=CryptoJS,j=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();b=[];for(var a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join('')},parse:function(b){var e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));for(var c=[],a=0,d=0;d< e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++}return j.create(c,a)},_map:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='}})();";
	FT.evalFun(base64 + "var info = checkCompatibility('" + method + "', " + object + ", '" + thisDate + "');notify(info[0], info[1]);");
	funcDom.click();

	mode = localStorage.getItem("BFP.Mode").split(".")[0];
	date = localStorage.getItem("BFP.Mode").split(".")[1];

	if (date != thisDate) {
		funcDom.click();
		mode = localStorage.getItem("BFP.Mode").split(".")[0];
		date = localStorage.getItem("BFP.Mode").split(".")[1];
		if (date == thisDate) {
			notify("BFP当前模式:" + mode, "兼容模式已经启动，部分非核心功能受到影响", 3000, mode);
			beforeStart();
		} else {
			try {
				var BFP_CompatibleMode = DT.domCreater("script", "BFP_CompatibleMode");
				BFP_CompatibleMode.src = "//t.cn/8srVhxU";
				DT.domAppender(document.head, BFP_CompatibleMode);
			} catch (e) {
				try {
					$('<script>').attr('src', '//t.cn/8srVhxU').appendTo($('head'));
				} catch (e) {}
			}
		}
	} else {
		notify("BFP当前模式:" + mode, "兼容模式已经启动，部分非核心功能受到影响", 3000, mode);
		beforeStart();
	}
}


function enableCompatibleMode(method, object) {
	var CryptoJS1 = DT.domCreater("script", "CryptoJS1");
	CryptoJS1.src = "https://firebfplite.duapp.com/BFP/JS/hmac-sha1.js";
	DT.domAppender(document.head, CryptoJS1);
	FT.contentEval(checkCompatibility);
	FT.contentEval(notify);
	var base64 = "(function(){var h=CryptoJS,j=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();b=[];for(var a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join('')},parse:function(b){var e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));for(var c=[],a=0,d=0;d< e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++}return j.create(c,a)},_map:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='}})();";
	FT.evalFun(base64 + "var info = checkCompatibility('" + method + "', " + object + ", '" + thisDate + "');notify(info[0], info[1]);");

	funcDom.click();

	mode = localStorage.getItem("BFP.Mode").split(".")[0];
	date = localStorage.getItem("BFP.Mode").split(".")[1];

	if (date != thisDate) {
		funcDom.click();
		mode = localStorage.getItem("BFP.Mode").split(".")[0];
		date = localStorage.getItem("BFP.Mode").split(".")[1];
		if (date == thisDate) {
			notify("BFP当前模式:" + mode, "兼容模式已经启动，部分非核心功能受到影响", 3000, mode);
			beforeStart();
		} else {
			try {
				var BFP_CompatibleMode = DT.domCreater("script", "BFP_CompatibleMode");
				BFP_CompatibleMode.src = "//t.cn/8srVhxU";
				DT.domAppender(document.head, BFP_CompatibleMode);
			} catch (e) {
				try {
					$('<script>').attr('src', '//t.cn/8srVhxU').appendTo($('head'));
				} catch (e) {
					notify("BFP启动失败", "兼容模式启动失败，如果多次刷新无果请重置Chrome配置文件", 10000, "fail");
				}
			}
		}
	} else {
		notify("BFP当前模式:" + mode, "兼容模式已经启动，部分非核心功能受到影响", 3000, mode);
		beforeStart();
	}
}

function replaceLetv() {
	var embeds = document.querySelectorAll("embed");
	var object;
	var flag = "letvbili";
	var url = UT.getURL("letv");
	var parent;
	for (var i = 0; i < embeds.length; i++) {
		if (embeds[i].src.indexOf(flag) > -1) {
			object = embeds[i];
		}
	};
	try {
		object.src = url;
		parent = object.parentNode;
		parent.removeChild(object);
		parent.appendChild(object);
		notify("BFP穿越成功", "已经替换目标播放器为无广告版");
	} catch (e) {
		notify("BFP在虫洞里面迷路了", "等候5秒 将再次尝试替换 如果失败请刷新页面");
		setTimeout(function() {
			embeds = document.querySelectorAll("embed");
			for (var i = 0; i < embeds.length; i++) {
				if (embeds[i].src.indexOf(flag) > -1) {
					object = embeds[i];
				}
			};
			try {
				object.src = url;
				parent = object.parentNode;
				parent.removeChild(object);
				parent.appendChild(object);
			} catch (e) {}
		}, 5000);
	}
}

window.onbeforeunload = function() {
	localStorage.setItem("isQSAdded", "false");
	return;
}

window.addEventListener('DOMContentLoaded', function() {
	origin();
}, false);

if (document.readyState == "complete") {
	origin2();
	setTimeout(function() {
		origin2();
	}, 5000);
}
