$('body').contents()[0].remove();
var FF = {
    'Home': {
        'Url': document.URL,
        'Tpl': 'defalut',
        'Channel': '',
        'GetChannel': function($sid) {
            if ($sid == '1') return 'vod';
            if ($sid == '2') return 'vod';
            if ($sid == '3') return 'special';
        },
		'Js': function() {
			//获取频道名
			this.Channel = this.GetChannel(Sid);
			if($("#wd").length>0){
               $key = '输入影片名称或主演名称';
				//默认搜索框关键字
				if($('#wd').val() == ''){
					$('#wd').val($key);
				}
				//搜索框获得焦点
				$('#wd').focus(function(){
					if($('#wd').val() == $key){
						$('#wd').val('');
					}
				});
				//搜索框失去焦点
				$('#wd').blur(function(){
					if($('#wd').val() == ''){
						$('#wd').val($key);
					}
				});
			}
            $("#fav").click(function() {
                var url = window.location.href;
                try {
                    window.external.addFavorite(url, document.title);
                } catch(err) {
                    try {
                        window.sidebar.addPanel(document.title, url, "");
                    } catch(err) {
                        alert("请使用Ctrl+D为您的浏览器添加书签！");
                    }
                }
            });
        }
    },
    //
    'UpDown': {
        'Vod': function($ajaxurl) {
            if ($("#Up").length || $("#Down").length) {
                this.Ajax($ajaxurl, 'vod', '');
            }
            $('.Up').click(function() {
                FF.UpDown.Ajax($ajaxurl, 'vod', 'up');
            });
            $('.Down').click(function() {
                FF.UpDown.Ajax($ajaxurl, 'vod', 'down');
            });
        },
        'News': function($ajaxurl) {
            if ($("#Digup").length || $("#Digdown").length) {
                this.Ajax($ajaxurl, 'news', '');
            } else {
                FF.UpDown.Show($("#Digup_val").html() + ':' + $("#Digdown_val").html(), 'news');
            }
            $('.Digup').click(function() {
                FF.UpDown.Ajax($ajaxurl, 'news', 'up');
            });
            $('.Digdown').click(function() {
                FF.UpDown.Ajax($ajaxurl, 'news', 'down');
            });
        },
        'Ajax': function($ajaxurl, $model, $ajaxtype) {
            $.ajax({
                type: 'get',
                url: $ajaxurl + '-type-' + $ajaxtype,
                timeout: 5000,
                dataType: 'json',
                success: function($html) {
                    if (!$html.status) {
                        alert($html.info);
                    } else {
                        FF.UpDown.Show($html.data, $model);
                    }
                }
            });
        },
        'Show': function($html, $model) {
            if ($model == 'vod') {
                $(".Up>span").html($html.split(':')[0]);
                $(".Down>span").html($html.split(':')[1]);
            } else if ($model = 'news') {
                var Digs = $html.split(':');
                var sUp = parseInt(Digs[0]);
                var sDown = parseInt(Digs[1]);
                var sTotal = sUp + sDown;
                var spUp = (sUp / sTotal) * 100;
                spUp = Math.round(spUp * 10) / 10;
                var spDown = 100 - spUp;
                spDown = Math.round(spDown * 10) / 10;
                if (sTotal != 0) {
                    $('#Digup_val').html(sUp);
                    $('#Digdown_val').html(sDown);
                    $('#Digup_sp').html(spUp + '%');
                    $('#Digdown_sp').html(spDown + '%');
                    $('#Digup_img').width(parseInt((sUp / sTotal) * 55));
                    $('#Digdown_img').width(parseInt((sDown / sTotal) * 55));
                }
            }
        }
    },

    'Playlist': {
        'Show': function() {
            var $title = $("#playlistit a");
            var $content = $("#playlist .playlist");
            $title.mousemove(function() {
                var index = $title.index($(this));
                $(this).addClass("on").siblings().removeClass("on");
                $content.hide();
                $($content.get(index)).show();
                return false;
            });
        }
    },
    'Suggest': {
        'Show': function($id, $limit, $ajaxurl, $jumpurl) {
            $("#" + $id).autocomplete($ajaxurl, {
				width: 228,
                scrollHeight: 320,
                minChars: 1,
                matchSubset: 1,
                max: $limit,
                cacheLength: 10,
                multiple: true,
                matchContains: true,
                autoFill: false,
                dataType: "json",
                parse: function(obj) {
                    if (obj.status) {
                        var parsed = [];
                        for (var i = 0; i < obj.data.length; i++) {
                            parsed[i] = {
                                data: obj.data[i],
                                value: obj.data[i].vod_name,
                                result: obj.data[i].vod_name
                            };
                        }
                        return parsed;
                    } else {
                        return {
                            data: '',
                            value: '',
                            result: ''
                        };
                    }
                },
                formatItem: function(row, i, max) {
                    return row.vod_name;
                },
                formatResult: function(row, i, max) {
                    return row.vod_name;
                }
            }).result(function(event, data, formatted) {
//                location.href = $jumpurl + encodeURIComponent(data.vod_name);
				  location.href = data.vod_url;
				  location.href = info;
            });
        }
    },
    'Cookie': {
        'Set': function(name, value, days) {
            var exp = new Date();
            exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            document.cookie = name + "=" + escape(value) + ";path=/;expires=" + exp.toUTCString();
        },
        'Get': function(name) {
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            if (arr != null) {
                return unescape(arr[2]);
                return null;
            }
        },
        'Del': function(name) {
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = this.Get(name);
            if (cval != null) {
                document.cookie = name + "=" + escape(cval) + ";path=/;expires=" + exp.toUTCString();
            }
        }
    },
    'History': {
        'Json': '',
        'Display': true,
        'List': function($id) {
            this.Create($id);
            $('#' + $id).hover(function() {
                FF.History.Show();
            },
            function() {
                FF.History.FlagHide();
            });
        },

        'Create': function($id) {
            var jsondata = [];
            if (this.Json) {
                jsondata = this.Json;
            } else {
                var jsonstr = FF.Cookie.Get('FF_Cookie');
                if (jsonstr != undefined) {
                    jsondata = eval(jsonstr);
                }
            };
            html = '<table class="history_list sr0" id="hishow" cellpadding="0" cellspacing="0">';
            html += '<thead><tr><th colspan="2"><b id="clearall"><a href="javascript:void(0)" onclick="FF.History.Clear();">清空</a></b></th></tr></thead>';
            if (jsondata.length > 0) {
                html += '<tbody>';
                for ($i = 0; $i < jsondata.length; $i++) {
                    html += '<tr class="r' + [$i] + ' hisitem"><td class="op"><b class="del"></b></td><td class="tt"><a href="' + jsondata[$i].vodlink + '" title="' + jsondata[$i].vodname + '">' + jsondata[$i].vodname + '</a></td></tr>';
                }
                html += '</tbody>';
            } else {
                html += '<tfoot><tr class="emptied"><th colspan="2">暂无浏览记录</th></tr></tfoot>';
            };
			html += '</table>';
            $('#history_layer').html(html);
        },
        'Insert': function(vodname, vodlink, limit, days, cidname, vodpic) {
            var jsondata = FF.Cookie.Get('FF_Cookie');
            if (jsondata != undefined) {
                this.Json = eval(jsondata);
                for ($i = 0; $i < this.Json.length; $i++) {
                    if (this.Json[$i].vodlink == vodlink) {
                        return false;
                    }
                };
                if (!vodlink) {
                    vodlink = document.URL;
                }
                jsonstr = '{video:[{"vodname":"' + vodname + '","vodlink":"' + vodlink + '","cidname":"' + cidname + '","vodpic":"' + vodpic + '"},';
                for ($i = 0; $i <= limit; $i++) {
                    if (this.Json[$i]) {
                        jsonstr += '{"vodname":"' + this.Json[$i].vodname + '","vodlink":"' + this.Json[$i].vodlink + '","cidname":"' + this.Json[$i].cidname + $i + '","vodpic":"' + this.Json[$i].vodpic + '"},';
                    } else {
                        break;
                    }
                };
                jsonstr = jsonstr.substring(0, jsonstr.lastIndexOf(','));
                jsonstr += "]}";
            } else {
                jsonstr = '{video:[{"vodname":"' + vodname + '","vodlink":"' + vodlink + '","cidname":"' + cidname + '","vodpic":"' + vodpic + '"}]}';
            };
            this.Json = eval(jsonstr);
            FF.Cookie.Set('FF_Cookie', jsonstr, days);
        }
    },
	'Comment': {
		'Default': function($ajaxurl) {
			if($("#Comment").length>0){
				FF.Comment.Show($ajaxurl);
			}
		},
		'Show': function($ajaxurl) {
			$.ajax({
				type: 'get',
				url: $ajaxurl,
				timeout: 5000,
				error: function(){
					$("#Comment").html('评论加载失败...');
				},
				success:function($html){	
					$("#Comment").html($html);
				}
			});
		},
		'Post':function CommentPost(){
			if($("#comment_content").val() == '请在这里发表您的个人看法，最多200个字。'){
				$('#comment_tips').html('请发表您的评论观点！');
				return false;
			}
			var $data = "cm_sid="+Sid+"&cm_cid="+Id+"&cm_content="+$("#comment_content").val();
			$.ajax({
				type: 'post',
				url: Root+'index.php?s=Cm-insert',
				data: $data,
				dataType:'json',
				success:function($string){
					if($string.status == 1){
						FF.Comment.Show(Root+"index.php?s=Cm-Show-sid-"+Sid+"-id-"+Id+"-p-1");
					}
					alert($string.info);
				}
			});
		}
	}
}
$(document).ready(function() {
	FF.Home.Js();
	FF.UpDown.Vod(Root + 'index.php?s=Updown-' + FF.Home.Channel + '-id-' + Id);
	FF.UpDown.News(Root + 'index.php?s=Updown-' + FF.Home.Channel + '-id-' + Id);
	FF.Comment.Default(Root+"index.php?s=Cm-Show-sid-"+Sid+"-id-"+Id+"-p-1");

});
