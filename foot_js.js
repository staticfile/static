pp = null;
function checkAll(a) {
	var b;
	if (objEvent = getEvent(), id = objEvent.srcElement ? objEvent.srcElement : objEvent.target, "" != a) for (b = document.getElementsByName(a), i = 0; i < b.length; i++)"checkbox" == b[i].type && (b[i].checked = id.checked);
	else for (b = document.getElementsByTagName("input"), i = 0; i < b.length; i++)"checkbox" == b[i].type && (b[i].checked = id.checked)
}
function getEvent() {
	if (document.all) return window.event;
	for (func = getEvent.caller; null != func;) {
		var a = func.arguments[0];
		if (a && (a.constructor == Event || a.constructor == MouseEvent || "object" == typeof a && a.preventDefault && a.stopPropagation)) return a;
		func = func.caller
	}
	return null
}
function qireuser() {}
function gqq() {
	qr.ucenter()
}
function timetodate(a, b) {
	return new Date(1e3 * parseInt(a)).pattern(b)
}
function fav() {
	var a = window.location.href;
	try {
		window.external.addFavorite(a, document.title)
	} catch (b) {
		try {
			window.sidebar.addPanel(document.title, a, "")
		} catch (b) {
			alert("请使用Ctrl+D为您的浏览器添加书签！")
		}
	}
}
function clearcookie() {
	document.cookie = "qy_username=; path=/;domain=zanpian.com;expires=" + new Date(1970, 1, 1).toGMTString(), document.cookie = "qy_userpwd=; path=/;domain=zanpian.com;expires=" + new Date(1970, 1, 1).toGMTString(), document.cookie = "qy_userid=; path=/;domain=zanpian.com;expires=" + new Date(1970, 1, 1).toGMTString()
}
function userreg() {
	if ("Email" == $("#email").val()) $.showfloatdiv({
		txt: "请输入正确的Emial"
	}), $("#email").focus(), $.hidediv({});
	else {
		if ("" != $("#pwd").val()) return $("#regform").qiresub({
			curobj: $("#register"),
			txt: "数据提交中,请稍后...",
			onsucc: function(a) {
				if ($.hidediv(a), parseInt(a["rcode"]) > 0) {
					qr.gu({
						ubox: "unm",
						rbox: "innermsg",
						h3: "h3",
						logo: "userlogo"
					});
					try {
						PlayHistoryObj.viewPlayHistory("playhistory")
					} catch (b) {}
					$("#cboxClose").trigger("click")
				} else - 3 == parseInt(a["rcode"])
			}
		}).post({
			url: Root + "index.php?s=user-reg-index"
		}), !1;
		$.showfloatdiv({
			txt: "请输入密码"
		}), $("#pwd").focus(), $.hidediv({})
	}
}
function userlogin() {
	if ("用户名" == $("#username").val()) $.showfloatdiv({
		txt: "请输入正确的用户名"
	}), $("#username").focus(), $.hidediv({});
	else {
		if ("" != $("#password").val()) return $("#loginform").qiresub({
			curobj: $("#loginbt"),
			txt: "数据提交中,请稍后...",
			onsucc: function(a) {
				if ($.hidediv(a), parseInt(a["rcode"]) > 0) {
					qr.gu({
						ubox: "unm",
						rbox: "innermsg",
						h3: "h3",
						logo: "userlogo"
					});
					try {
						PlayHistoryObj.viewPlayHistory("playhistory")
					} catch (b) {}
					$("#cboxClose").trigger("click")
				} else - 3 == parseInt(a["rcode"])
			}
		}).post({
			url: Root + "index.php?s=user-login-index"
		}), !1;
		$.showfloatdiv({
			txt: "请输入密码"
		}), $("#password").focus(), $.hidediv({})
	}
}
var qruser, loginhtml, qr;
pp = null, $.extend({
	refresh: function(a) {
		window.location.href = a
	}
}), jQuery.showfloatdiv = function(a) {
	var c, d, b = {
		txt: "数据加载中,请稍后...",
		classname: "progressBar",
		left: 410,
		top: 210,
		wantclose: 1,
		suredo: function() {
			return !1
		},
		succdo: function() {},
		completetxt: "操作成功!",
		autoclose: 1,
		ispost: 0,
		cssname: "alert",
		isajax: 0,
		intvaltime: 1e3,
		redirurl: "/"
	};
	a = a || {}, $.extend(b, a), $("#tbmovbox_overlay").remove(), $("#tbmovbox").remove(), 1 == b.wantclose ? (c = $('<div class="tbmovbox-overlayBG" id="tbmovbox_overlay"></div><div id="tbmovbox" class="tbmovbox png-img"><iframe frameborder="0" class="ui-iframe"></iframe><table class="ui-dialog-box"><tr><td><div class="ui-dialog"><div class="ui-dialog-cnt" id="ui-dialog-cnt"><div class="ui-dialog-tip alert" id="ui-cnt"><span id="xtip">' + b.txt + '</span></div></div><div class="ui-dialog-close"><span class="close">关闭</span></div></div></td></tr></table></div>'), $("body").append(c), $("#tbmovbox_overlay").fadeIn(500), $("#tbmovbox").fadeIn(500), $("#ui-cnt").removeClass("succ error alert loading").addClass(b.cssname), $(".ui-dialog-close").click(function() {
		$.closefloatdiv()
	}), 1 == b.isajax && (objEvent = getEvent(), id = objEvent.srcElement ? objEvent.srcElement : objEvent.target, d = null != id.attributes["data"].nodeValue && void 0 != id.attributes["data"].nodeValue ? id.attributes["data"].nodeValue : id.data, $.ajax({
		url: d,
		async: !0,
		type: "get",
		cache: !0,
		dataType: "json",
		success: function(a) {
			null != a.msg && void 0 != a.msg ? $("#xtip").html(a.msg) : $("#xtip").html(b.completetxt), b.succdo(a), null != a.wantclose && void 0 != a.wantclose ? $.hidediv(a) : 1 == b.autoclose && $.hidediv(a), (void 0 != a.wantredir || null != a.wantredir) && (void 0 != a.redir || null != a.redir ? setTimeout("$.refresh('" + a.redir + "')", b.intvaltime) : setTimeout("$.refresh('" + b.redirurl + "')", b.intvaltime))
		},
		error: function() {
			$("#xtip").html("系统繁忙,请稍后再试...")
		}
	}))) : 2 == b.wantclose ? (objEvent = getEvent(), id = objEvent.srcElement ? objEvent.srcElement : objEvent.target, d = null != id.attributes["data"].nodeValue && void 0 != id.attributes["data"].nodeValue ? id.attributes["data"].nodeValue : id.data, c = $('<div class="tbmovbox-overlayBG" id="tbmovbox_overlay"></div><div id="tbmovbox" class="tbmovbox png-img"><iframe frameborder="0" class="ui-iframe"></iframe><table class="ui-dialog-box"><tr><td><div class="ui-dialog"><div class="ui-dialog-cnt" id="ui-dialog-cnt"><div class="ui-dialog-tip alert" id="ui-cnt"><span id="xtip">' + b.txt + '</span></div></div><div class="ui-dialog-todo"><a class="ui-link ui-link-small" href="javascript:void(0);" id="surebt">确定</a><a class="ui-link ui-link-small cancelbt"  id="cancelbt">取消</a><input type="hidden" id="hideval" value=""/></div><div class="ui-dialog-close"><span class="close">关闭</span></div></div></td></tr></table></div>'), $("body").append(c), $("#tbmovbox_overlay").fadeIn(500), $("#tbmovbox").fadeIn(500), $(".ui-dialog-close").click(function() {
		$.closefloatdiv()
	}), $(".cancelbt").click(function() {
		$.closefloatdiv()
	}), $("#surebt").click(function(a) {
		if (b.suredo(a)) b.succdo(a);
		else if ($(".ui-dialog-todo").remove(), $("#ui-cnt").removeClass("succ error alert").addClass("loading"), 0 == b.ispost) {
			if ("1" == d) return !0;
			$.ajax({
				url: d,
				async: !0,
				type: "get",
				cache: !0,
				dataType: "json",
				success: function(a) {
					null != a.msg && void 0 != a.msg ? $("#xtip").html(a.msg) : $("#xtip").html(b.completetxt), b.succdo(a), null != a.wantclose && void 0 != a.wantclose ? $.hidediv(a) : 1 == b.autoclose && $.hidediv(a)
				},
				error: function() {
					$("#xtip").html("系统繁忙,请稍后再试...")
				}
			})
		} else $("#" + b.formid).qiresub({
			curobj: $("#surebt"),
			txt: "数据提交中,请稍后...",
			onsucc: function(a) {
				b.succdo(a), $.hidediv(a)
			}
		}).post({
			url: b.url
		})
	})) : (c = $('<div class="tbmovbox_overlayBG" id="tbmovbox_overlay"></div><div id="tbmovbox" class="tbmovbox"><iframe frameborder="0" class="ui-iframe"></iframe><div class="ui-dialog"><div class="ui-dialog-cnt" id="ui-dialog-cnt"><div class="ui-dialog-box"<div class="ui-cnt" id="ui-cnt">' + b.txt + "</div></div></div></div></div>"), $("body").append(c), $("#tbmovbox_overlay").fadeIn(500), $("#tbmovbox").fadeIn(500)), $("#tbmovbox_overlay").bind("click", function(a) {
		$.closefloatdiv(a), null != pp && clearTimeout(pp)
	})
}, jQuery.closefloatdiv = function() {
	$("#tbmovbox_overlay").remove(), $("#tbmovbox").remove()
}, jQuery.hidediv = function(a) {
	var b = {
		intvaltime: 1e3
	};
	a = a || {}, $.extend(b, a), null != a.msg && void 0 != a.msg && $("#ui-cnt").html(a.msg), 1 == parseInt(a.rcode) ? $("#ui-cnt").removeClass("loading error alert").addClass("succ") : parseInt(a.rcode) < 1 && $("#ui-cnt").removeClass("loading alert succ").addClass("error"), pp = setTimeout("$.closefloatdiv()", b.intvaltime)
}, function(a) {
	a.fn.qiresub = function(b) {
		var d, e, f, c = {
			txt: "数据提交中,请稍后...",
			redirurl: window.location.href,
			dataType: "json",
			onsucc: function() {},
			onerr: function() {
				a.hidediv({
					msg: "系统繁忙"
				})
			},
			oncomplete: function() {},
			intvaltime: 1e3
		};
		return b.curobj.attr("disabled", !0), d = b.curobj.offset(), b = a.extend(c, b), a.showfloatdiv({
			offset: d,
			txt: c.txt
		}), e = a(this), f = e.attr("id"), {
			post: function(d) {
				a("#ui-cnt").removeClass("succ error alert").addClass("loading"), a.post(d.url, e.serializeArray(), function(d) {
					b.curobj.attr("disabled", !1), c.onsucc(d), (void 0 != d.closediv || null != d.closediv) && a.closefloatdiv(), (void 0 != d.wantredir || null != d.wantredir) && (void 0 != d.redir || null != d.redir ? setTimeout("$.refresh('" + d.redir + "')", b.intvaltime) : setTimeout("$.refresh('" + b.redirurl + "')", b.intvaltime))
				}, b.dataType).error(function() {
					b.curobj.attr("disabled", !1), c.onerr()
				}).complete(function() {
					c.oncomplete(), b.curobj.attr("disabled", !1)
				})
			},
			implodeval: function() {
				return val = a("#" + f + " :input").map(function() {
					return "" != a(this).attr("name") && void 0 != a(this).attr("name") ? a(this).attr("name") + "-" + a(this).val() : void 0
				}).get().join("-")
			},
			get: function(d) {
				a(".ui-dialog-todo").remove(), a("#ui-cnt").removeClass("succ error alert").addClass("loading");
				var e = this.implodeval();
				a.get(d.url + "-" + e, "", function(a) {
					b.curobj.attr("disabled", !1), c.onsucc(a), (void 0 != a.wantredir || null != a.wantredir) && (void 0 != a.redir || null != a.redir ? setTimeout("$.refresh(" + a.redir + ")", b.intvaltime) : setTimeout("$.refresh(" + b.redirurl + ")", b.intvaltime))
				}, b.dataType).error(function() {
					b.curobj.attr("disabled", !1), c.onerr()
				}).complete(function() {
					c.oncomplete(), b.curobj.attr("disabled", !1)
				})
			}
		}
	}, a.fn.ajaxdel = function(b) {
		var d, c = {
			txt: "数据提交中,请稍后...",
			redirurl: window.location.href,
			dataType: "json",
			onsucc: function() {},
			onerr: function() {},
			oncomplete: function() {},
			intvaltime: 3e3
		};
		a(".ui-dialog-todo").remove(), a("#ui-cnt").removeClass("succ error alert").addClass("loading"), b = a.extend(c, b), d = a(this).attr("url"), a.ajax({
			url: d,
			success: function(a) {
				b.onsucc(a)
			},
			error: function() {
				b.onerr()
			},
			complete: function() {
				b.oncomplete()
			},
			dataType: "json"
		})
	}
}(jQuery), qireuser.prototype.urls = new Array(Root + "index.php?s=user-home-flushinfo", Root + "index.php?s=user-center-flushinfo"), qireuser.prototype.gu = function() {
	$.get(Root + "index.php?s=user-home-flushinfo", "", function(a) {
		return -7 == parseInt(a.rcode) ? ($.showfloatdiv({
			txt: a.msg,
			classname: "error"
		}), $.hidediv({
			rcode: -1,
			msg: a.msg
		}), !1) : (a.uid > 0 && (qruser = a, parseInt(a.history) > 5 ? ($("#morelog").html('<a target="_blank" href="index.php?s=user-center-playlog">进入会员中心完整播放记录&gt;&gt;</a>'), $("#morelog").show()) : ($("#morelog").html(""), $("#morelog").hide()), loginhtml = $("#loginbarx").html(), $("#loginbarx").html(a.html), $("#loginbar").hide(), $(".logoutbt").unbind(), $(".logoutbt").click(function() {
			return $.showfloatdiv({
				txt: "正在退出...",
				cssname: "loading",
				isajax: 1,
				succdo: function(a) {
					clearcookie();
					try {
						PlayHistoryObj.viewPlayHistory("playhistory")
					} catch (b) {}
					a.wantredir = null, $("#loged").html(""), $("#innermsg").html("登录"), $("#loginbar").show(), $("#loginbarx").html(loginhtml), $("#loginform #loginbt").click(function() {
						try {
							userlogin()
						} catch (a) {}
					})
				}
			}), !1
		})), void 0)
	}, "json")
}, qireuser.prototype.gr = function() {
	$.get(this.urls[1] + "-" + this.parms[1], "", function(a) {
		this.r = a, parseInt(a[0]) && $("#" + e.rbox).html("订阅更新<strong>(" + a[0] + ")</strong>")
	}, "jsonp")
}, qireuser.prototype.ucenter = function() {}, qr = new qireuser, checkcookie() && qr.gu({
	ubox: "unm",
	rbox: "innermsg",
	h3: "h3",
	logo: "userlogo"
}), Date.prototype.pattern = function(a) {
	var d, b = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": 0 == this.getHours() ? 12 : this.getHours(),
		"H+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		S: this.getMilliseconds()
	},
		c = {
			0: "日",
			1: "一",
			2: "二",
			3: "三",
			4: "四",
			5: "五",
			6: "六"
		};
	/(y+)/.test(a) && (a = a.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))), /(E+)/.test(a) && (a = a.replace(RegExp.$1, (RegExp.$1.length > 1 ? RegExp.$1.length > 2 ? "星期" : "周" : "") + c[this.getDay() + ""]));
	for (d in b) new RegExp("(" + d + ")").test(a) && (a = a.replace(RegExp.$1, 1 == RegExp.$1.length ? b[d] : ("00" + b[d]).substr(("" + b[d]).length)));
	return a
}, function(a, b, c) {
	function d(c, d, e) {
		var f = b.createElement(c);
		return d && (f.id = p + d), e && (f.style.cssText = e), a(f)
	}
	function e(a) {
		var b = I.length,
			c = ($ + a) % b;
		return 0 > c ? b + c : c
	}
	function f(a, b) {
		return Math.round((/%/.test(a) ? ("x" === b ? J.width() : J.height()) / 100 : 1) * parseInt(a, 10))
	}
	function g(a) {
		return U.photo || /\.(gif|png|jpe?g|bmp|ico)((#|\?).*)?$/i.test(a)
	}
	function h() {
		var b;
		U = a.extend({}, a.data(Z, o));
		for (b in U) a.isFunction(U[b]) && "on" !== b.slice(0, 2) && (U[b] = U[b].call(Z));
		U.rel = U.rel || Z.rel || "nofollow", U.href = U.href || a(Z).attr("href"), U.title = U.title || Z.title, "string" == typeof U.href && (U.href = a.trim(U.href))
	}
	function i(b, c) {
		a.event.trigger(b), c && c.call(Z)
	}
	function j() {
		var a, d, e, b = p + "Slideshow_",
			c = "click." + p;
		U.slideshow && I[1] ? (d = function() {
			P.text(U.slideshowStop).unbind(c).bind(t, function() {
				(U.loop || I[$ + 1]) && (a = setTimeout(eb.next, U.slideshowSpeed))
			}).bind(s, function() {
				clearTimeout(a)
			}).one(c + " " + u, e), B.removeClass(b + "off").addClass(b + "on"), a = setTimeout(eb.next, U.slideshowSpeed)
		}, e = function() {
			clearTimeout(a), P.text(U.slideshowStart).unbind([t, s, u, c].join(" ")).one(c, function() {
				eb.next(), d()
			}), B.removeClass(b + "on").addClass(b + "off")
		}, U.slideshowAuto ? d() : e()) : B.removeClass(b + "off " + b + "on")
	}
	function k(b) {
		cb || (Z = b, h(), I = a(Z), $ = 0, "nofollow" !== U.rel && (I = a("." + q).filter(function() {
			var b = a.data(this, o).rel || this.rel;
			return b === U.rel
		}), $ = I.index(Z), -1 === $ && (I = I.add(Z), $ = I.length - 1)), ab || (ab = bb = !0, B.show(), U.returnFocus && a(Z).blur().one(v, function() {
			a(this).focus()
		}), A.css({
			opacity: +U.opacity,
			cursor: U.overlayClose ? "pointer" : "auto"
		}).show(), U.w = f(U.initialWidth, "x"), U.h = f(U.initialHeight, "y"), eb.position(), y && J.bind("resize." + z + " scroll." + z, function() {
			A.css({
				width: J.width(),
				height: J.height(),
				top: J.scrollTop(),
				left: J.scrollLeft()
			})
		}).trigger("resize." + z), i(r, U.onOpen), T.add(N).hide(), S.html(U.close).show()), eb.load(!0))
	}
	function l() {
		!B && b.body && (gb = !1, J = a(c), B = d(fb).attr({
			id: o,
			"class": x ? p + (y ? "IE6" : "IE") : ""
		}).hide(), A = d(fb, "Overlay", y ? "position:absolute" : "").hide(), C = d(fb, "Wrapper"), D = d(fb, "Content").append(K = d(fb, "LoadedContent", "width:0; height:0; overflow:hidden"), M = d(fb, "LoadingOverlay").add(d(fb, "LoadingGraphic")), N = d(fb, "Title"), O = d(fb, "Current"), Q = d(fb, "Next"), R = d(fb, "Previous"), P = d(fb, "Slideshow").bind(r, j), S = d(fb, "Close")), C.append(d(fb).append(d(fb, "TopLeft"), E = d(fb, "TopCenter"), d(fb, "TopRight")), d(fb, !1, "clear:left").append(F = d(fb, "MiddleLeft"), D, G = d(fb, "MiddleRight")), d(fb, !1, "clear:left").append(d(fb, "BottomLeft"), H = d(fb, "BottomCenter"), d(fb, "BottomRight"))).find("div div").css({
			"float": "left"
		}), L = d(fb, !1, "position:absolute; width:9999px; visibility:hidden; display:none"), T = Q.add(R).add(O).add(P), a(b.body).append(A, B.append(C, L)))
	}
	function m() {
		return B ? (gb || (gb = !0, V = E.height() + H.height() + D.outerHeight(!0) - D.height(), W = F.width() + G.width() + D.outerWidth(!0) - D.width(), X = K.outerHeight(!0), Y = K.outerWidth(!0), B.css({
			"padding-bottom": V,
			"padding-right": W
		}), Q.click(function() {
			eb.next()
		}), R.click(function() {
			eb.prev()
		}), S.click(function() {
			eb.close()
		}), A.click(function() {
			U.overlayClose && eb.close()
		}), a(b).bind("keydown." + p, function(a) {
			var b = a.keyCode;
			ab && U.escKey && 27 === b && (a.preventDefault(), eb.close()), ab && U.arrowKey && I[1] && (37 === b ? (a.preventDefault(), R.click()) : 39 === b && (a.preventDefault(), Q.click()))
		}), a("." + q, b).live("click", function(a) {
			a.which > 1 || a.shiftKey || a.altKey || a.metaKey || (a.preventDefault(), k(this))
		})), !0) : !1
	}
	var A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, $, _, ab, bb, cb, db, eb, gb, n = {
		transition: "elastic",
		speed: 300,
		width: !1,
		initialWidth: "600",
		innerWidth: !1,
		maxWidth: !1,
		height: !1,
		initialHeight: "450",
		innerHeight: !1,
		maxHeight: !1,
		scalePhotos: !0,
		scrolling: !0,
		inline: !1,
		html: !1,
		iframe: !1,
		fastIframe: !0,
		photo: !1,
		href: !1,
		title: !1,
		rel: !1,
		opacity: .6,
		preloading: !0,
		current: "image {current} of {total}",
		previous: "previous",
		next: "next",
		close: "close",
		open: !1,
		returnFocus: !0,
		reposition: !0,
		loop: !0,
		slideshow: !1,
		slideshowAuto: !0,
		slideshowSpeed: 2500,
		slideshowStart: "start slideshow",
		slideshowStop: "stop slideshow",
		onOpen: !1,
		onLoad: !1,
		onComplete: !1,
		onCleanup: !1,
		onClosed: !1,
		overlayClose: !0,
		escKey: !0,
		arrowKey: !0,
		top: !1,
		bottom: !1,
		left: !1,
		right: !1,
		fixed: !1,
		data: void 0
	},
		o = "colorbox",
		p = "cbox",
		q = p + "Element",
		r = p + "_open",
		s = p + "_load",
		t = p + "_complete",
		u = p + "_cleanup",
		v = p + "_closed",
		w = p + "_purge",
		x = !a.support.opacity && !a.support.style,
		y = x && !c.XMLHttpRequest,
		z = p + "_IE6",
		fb = "div";
	a.colorbox || (a(l), eb = a.fn[o] = a[o] = function(b, c) {
		var d = this;
		if (b = b || {}, l(), m()) {
			if (!d[0]) {
				if (d.selector) return d;
				d = a("<a/>"), b.open = !0
			}
			c && (b.onComplete = c), d.each(function() {
				a.data(this, o, a.extend({}, a.data(this, o) || n, b))
			}).addClass(q), (a.isFunction(b.open) && b.open.call(d) || b.open) && k(d[0])
		}
		return d
	}, eb.position = function(a, b) {
		function c(a) {
			E[0].style.width = H[0].style.width = D[0].style.width = a.style.width, D[0].style.height = F[0].style.height = G[0].style.height = a.style.height
		}
		var d = 0,
			e = 0,
			g = B.offset(),
			h = J.scrollTop(),
			i = J.scrollLeft();
		J.unbind("resize." + p), B.css({
			top: -9e4,
			left: -9e4
		}), U.fixed && !y ? (g.top -= h, g.left -= i, B.css({
			position: "fixed"
		})) : (d = h, e = i, B.css({
			position: "absolute"
		})), e += U.right !== !1 ? Math.max(J.width() - U.w - Y - W - f(U.right, "x"), 0) : U.left !== !1 ? f(U.left, "x") : Math.round(Math.max(J.width() - U.w - Y - W, 0) / 2), d += U.bottom !== !1 ? Math.max(J.height() - U.h - X - V - f(U.bottom, "y"), 0) : U.top !== !1 ? f(U.top, "y") : Math.round(Math.max(J.height() - U.h - X - V, 0) / 2), B.css({
			top: g.top,
			left: g.left
		}), a = B.width() === U.w + Y && B.height() === U.h + X ? 0 : a || 0, C[0].style.width = C[0].style.height = "9999px", B.dequeue().animate({
			width: U.w + Y,
			height: U.h + X,
			top: d,
			left: e
		}, {
			duration: a,
			complete: function() {
				c(this), bb = !1, C[0].style.width = U.w + Y + W + "px", C[0].style.height = U.h + X + V + "px", U.reposition && setTimeout(function() {
					J.bind("resize." + p, eb.position)
				}, 1), b && b()
			},
			step: function() {
				c(this)
			}
		})
	}, eb.resize = function(a) {
		ab && (a = a || {}, a.width && (U.w = f(a.width, "x") - Y - W), a.innerWidth && (U.w = f(a.innerWidth, "x")), K.css({
			width: U.w
		}), a.height && (U.h = f(a.height, "y") - X - V), a.innerHeight && (U.h = f(a.innerHeight, "y")), !a.innerHeight && !a.height && (K.css({
			height: "auto"
		}), U.h = K.height()), K.css({
			height: U.h
		}), eb.position("none" === U.transition ? 0 : U.speed))
	}, eb.prep = function(b) {
		function c() {
			return U.w = U.w || K.width(), U.w = U.mw && U.mw < U.w ? U.mw : U.w, U.w
		}
		function f() {
			return U.h = U.h || K.height(), U.h = U.mh && U.mh < U.h ? U.mh : U.h, U.h
		}
		if (ab) {
			var h, j = "none" === U.transition ? 0 : U.speed;
			K.remove(), K = d(fb, "LoadedContent").append(b), K.hide().appendTo(L.show()).css({
				width: c(),
				overflow: U.scrolling ? "auto" : "hidden"
			}).css({
				height: f()
			}).prependTo(D), L.hide(), a(_).css({
				"float": "none"
			}), y && a("select").not(B.find("select")).filter(function() {
				return "hidden" !== this.style.visibility
			}).css({
				visibility: "hidden"
			}).one(u, function() {
				this.style.visibility = "inherit"
			}), h = function() {
				function b() {
					x && B[0].style.removeAttribute("filter")
				}
				var c, f, k, n, q, r, h = I.length,
					l = "frameBorder",
					m = "allowTransparency";
				if (ab) {
					if (n = function() {
						clearTimeout(db), M.hide(), i(t, U.onComplete)
					}, x && _ && K.fadeIn(100), N.html(U.title).add(K).show(), h > 1) {
						if ("string" == typeof U.current && O.html(U.current.replace("{current}", $ + 1).replace("{total}", h)).show(), Q[U.loop || h - 1 > $ ? "show" : "hide"]().html(U.next), R[U.loop || $ ? "show" : "hide"]().html(U.previous), U.slideshow && P.show(), U.preloading) for (c = [e(-1), e(1)]; f = I[c.pop()];) q = a.data(f, o).href || f.href, a.isFunction(q) && (q = q.call(f)), g(q) && (r = new Image, r.src = q)
					} else T.hide();
					U.iframe ? (k = d("iframe")[0], l in k && (k[l] = 0), m in k && (k[m] = "true"), k.name = p + +new Date, U.fastIframe ? n() : a(k).one("load", n), k.src = U.href, U.scrolling || (k.scrolling = "no"), a(k).addClass(p + "Iframe").appendTo(K).one(w, function() {
						k.src = "//about:blank"
					})) : n(), "fade" === U.transition ? B.fadeTo(j, 1, b) : b()
				}
			}, "fade" === U.transition ? B.fadeTo(j, 0, function() {
				eb.position(0, h)
			}) : eb.position(j, h)
		}
	}, eb.load = function(b) {
		var c, e, j = eb.prep;
		bb = !0, _ = !1, Z = I[$], b || h(), i(w), i(s, U.onLoad), U.h = U.height ? f(U.height, "y") - X - V : U.innerHeight && f(U.innerHeight, "y"), U.w = U.width ? f(U.width, "x") - Y - W : U.innerWidth && f(U.innerWidth, "x"), U.mw = U.w, U.mh = U.h, U.maxWidth && (U.mw = f(U.maxWidth, "x") - Y - W, U.mw = U.w && U.w < U.mw ? U.w : U.mw), U.maxHeight && (U.mh = f(U.maxHeight, "y") - X - V, U.mh = U.h && U.h < U.mh ? U.h : U.mh), c = U.href, db = setTimeout(function() {
			M.show()
		}, 100), U.inline ? (d(fb).hide().insertBefore(a(c)[0]).one(w, function() {
			a(this).replaceWith(K.children())
		}), j(a(c))) : U.iframe ? j(" ") : U.html ? j(U.html) : g(c) ? (a(_ = new Image).addClass(p + "Photo").error(function() {
			U.title = !1, j(d(fb, "Error").text("This image could not be loaded"))
		}).load(function() {
			var a;
			_.onload = null, U.scalePhotos && (e = function() {
				_.height -= _.height * a, _.width -= _.width * a
			}, U.mw && _.width > U.mw && (a = (_.width - U.mw) / _.width, e()), U.mh && _.height > U.mh && (a = (_.height - U.mh) / _.height, e())), U.h && (_.style.marginTop = Math.max(U.h - _.height, 0) / 2 + "px"), I[1] && (U.loop || I[$ + 1]) && (_.style.cursor = "pointer", _.onclick = function() {
				eb.next()
			}), x && (_.style.msInterpolationMode = "bicubic"), setTimeout(function() {
				j(_)
			}, 1)
		}), setTimeout(function() {
			_.src = c
		}, 1)) : c && L.load(c, U.data, function(b, c, e) {
			j("error" === c ? d(fb, "Error").text("Request unsuccessful: " + e.statusText) : a(this).contents())
		})
	}, eb.next = function() {
		!bb && I[1] && (U.loop || I[$ + 1]) && ($ = e(1), eb.load())
	}, eb.prev = function() {
		!bb && I[1] && (U.loop || $) && ($ = e(-1), eb.load())
	}, eb.close = function() {
		ab && !cb && (cb = !0, ab = !1, i(u, U.onCleanup), J.unbind("." + p + " ." + z), A.fadeTo(200, 0), B.stop().fadeTo(300, 0, function() {
			B.add(A).css({
				opacity: 1,
				cursor: "auto"
			}).hide(), i(w), K.remove(), setTimeout(function() {
				cb = !1, i(v, U.onClosed)
			}, 1)
		}))
	}, eb.remove = function() {
		a([]).add(B).add(A).remove(), B = null, a("." + q).removeData(o).removeClass(q).die()
	}, eb.element = function() {
		return a(Z)
	}, eb.settings = n)
}(jQuery, document, this), $("#loginform #loginbt").click(function() {
	userlogin()
}), $(".logoutbt").click(function() {
	return $.showfloatdiv({
		txt: "正在退出...",
		cssname: "loading",
		isajax: 1,
		succdo: function() {
			setTimeout("$.refresh('index.php?s=user-login-index')", 500)
		}
	}), !1
}), $(document).ready(function() {
	$("#cmt-input-tip .ui-input").focus(function() {
		$("#cmt-input-tip").hide(), $("#cmt-input-bd").show(), $("#cmt-input-bd .ui-textarea").focus()
	}), $(".play-mode-list").each(function(a, b) {
		$(b).find("a").each(function() {
			var c = $(this).attr("title");
			$(this).hover(function() {
				var a = $(this).offset().left + 3,
					b = $(this).offset().top - 28,
					d = $(this).parent().parent(".play-mode-list");
				$("<div></div>").addClass("play-mode-tip").css({
					left: a + "px",
					top: b + "px"
				}).html(c).appendTo(d), this.myTitle = this.title, this.title = ""
			}, function() {
				this.title = this.myTitle, $(".play-mode-tip").remove()
			})
		})
	}), $(".user-bt").each(function() {
		var a = $(this).find(".sect-btn"),
			b = $(this).find(".cancel"),
			c = $(this).find(".sect-show");
		a.click(function() {
			if (!checkcookie()) return login_form(), !1;
			$.showfloatdiv({
				txt: "数据提交中...",
				cssname: "loading"
			});
			var d = $(this);
			$.get(a.attr("data"), function(a) {
				$.hidediv(a), parseInt(a.rcode) > 0 ? (d.hide(), c.show(), b.show()) : parseInt(a["yjdy"]) > 0 && 1 == parseInt(a["yjdy"]) && (d.hide(a), c.show(), b.show())
			}, "json")
		}), b.click(function() {
			$.showfloatdiv({
				txt: "数据提交中...",
				cssname: "loading"
			}), $.get(b.attr("data"), function(b) {
				$.hidediv(b), parseInt(b.rcode) > 0 && (a.show(), c.hide())
			}, "json")
		})
	}), $(".ui-form-item").each(function() {
		var a = $(this).find(".ui-button"),
			b = $(this).find(".cancel"),
			c = $(this).find(".sect-show");
		$("#loginbt2").click(function() {
			if (!checkcookie()) return login_form(), !1;
			$.showfloatdiv({
				txt: "数据提交中...",
				cssname: "loading"
			});
			var d = $(this);
			$.get(a.attr("data"), function(a) {
				$.hidediv(a), parseInt(a.rcode) > 0 ? (d.hide(), c.show(), b.show()) : parseInt(a["yjdy"]) > 0 && 1 == parseInt(a["yjdy"]) && (d.hide(a), c.show(), b.show())
			}, "json")
		}), b.click(function() {
			$.showfloatdiv({
				txt: "数据提交中...",
				cssname: "loading"
			}), $.get(b.attr("data"), function(b) {
				$.hidediv(b), parseInt(b.rcode) > 0 && (a.show(), c.hide())
			}, "json")
		})
	}), $("ul.rating li").each(function() {
		var b = $(this).attr("title"),
			c = $("ul.rating li"),
			d = $(this).index(),
			e = d + 1;
		$(this).click(function() {
			hadpingfen > 0 ? ($.showfloatdiv({
				txt: "已经评分,请务重复评分"
			}), $.hidediv({})) : ($.showfloatdiv({
				txt: "数据提交中...",
				cssname: "loading"
			}), c.removeClass("active"), $("ul.rating li:lt(" + e + ")").addClass("active"), $("#ratewords").html(b), $.post(Root + "index.php?s=user-comm-mark", {
				val: $(this).attr("val"),
				id: $("#_void_id").val()
			}, function(a) {
				if(parseInt(a.rcode) == 1) {
				$.ajax({type: 'get',cache: false,url: Root + "index.php?s=user-comm-get-id-"+$("#_void_id").val()+"-sid-"+Sid,success:function(data){stars(data.star);}});
				}
				parseInt(a.rcode) > 0 ? ($.hidediv(a), loadstat(), hadpingfen = 1) : -2 == parseInt(a.rcode) ? (hadpingfen = 1, $.showfloatdiv({
					txt: "已经评分,请务重复评分"
				}), $.hidediv({})) : ($.closefloatdiv(), $("#innermsg").trigger("click"))
				   
			}, "json"))	
		}).hover(function() {
			this.myTitle = this.title, this.title = "", $(this).nextAll().removeClass("active"), $(this).prevAll().addClass("active"), $(this).addClass("active"), $("#ratewords").html(b)
		}, function() {
			this.title = this.myTitle, $("ul.rating li:lt(" + e + ")").removeClass("hover")
			
		})
	}), $(".rating-panle").hover(function() {
		$(this).find(".rating-show").show()
	}, function() {
		$(this).find(".rating-show").hide()
	})
}), $("#loginform #loginbt").click(function() {
	userlogin()
}), $(".focus,.ated").click(function() {
	$.showfloatdiv({
		txt: "数据提交中...",
		cssname: "loading"
	});
	var b = $(this);
	$.ajax({
		url: b.attr("data"),
		success: function(a) {
			$.hidediv(a), parseInt(a.rcode) > 0 && (2 == a.docode ? b.removeClass("ated").addClass("focus").html("+关注").attr("data", "/user-userdo-focususer-uid-" + b.attr("val")) : b.removeClass("focus").addClass("ated").html("已关注").attr("data", "/user-userdo-delfocus-uid-" + b.attr("val")), "function" == typeof getfocusuid && getfocusuid())
		},
		dataType: "json"
	})
}), document.writeln('<div data-type="4" data-plugin="aroundbox" data-plugin-aroundbox-x="left" data-plugin-aroundbox-y="bottom" data-plugin-aroundbox-iconSize="60x60"  data-plugin-aroundbox-fixed="1" data-plugin-aroundbox-offsetX="10"></div>');