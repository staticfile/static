/**
 * Created by Administrator on 2015/10/28.
 */
$(function(){ 
if ($('.tops-layout').get(0)) {
   var movieHeaderSearch = $('.tops-layout'); 
   var headerNav = $('.tops-wrap');
   // if($("body").val().Contain('程序没有授权程序没有授权')==)
// $('body').html($('body').html().replace('程序没有授权程序没有授权',''))
   function suspend(){
     //滚动条大于 40
     if ( $(window).scrollTop() > 40 ) {
         movieHeaderSearch.addClass('mhs-position');
         headerNav.show();
         headerNav.hover(function() {
           navBtn.addClass('mbNone');
         }, function() {
           navBtn.removeClass('mbNone');
         })

     }else{
         movieHeaderSearch.removeClass('mhs-position');
     }

    //浏览器宽度小于 1200
    if ( $(window).width() <= 1200 ) {
         searchTxt.css('margin-left','');
         headerNav.hide();
       }
   }
   
    suspend();

   //浏览器滚动的时候
   $(window).scroll(function(){
      suspend();
   })
   
  //浏览器缩小的时候
   $(window).resize(function(){
      suspend();
   })

}
	$(".tops-nav").hover(function(){					  
		$(this).find(".tops-nav-pop").show();
		$(".tops-nav").toggleClass("tops-nav-on");
	},function(){
		$(this).find(".tops-nav-pop").hide();
		$(".tops-nav").removeClass("tops-nav-on");
	});	
	
	  $('.order a').click(function(){
		if($(this).hasClass('asc')){
			$(this).removeClass('asc').addClass('desc').text('降序');
		}else{
			$(this).removeClass('desc').addClass('asc').text('升序');
		}
		var a=$('.play-box:eq('+$(this).attr('data')+') .player_list');
		var b=$('.play-box:eq('+$(this).attr('data')+') .player_list a');
		a.html(b.get().reverse());
	});

    $("img.loading").lazyload({data_attribute:'original',threshold : 100,failure_limit:100, effect : "fadeIn" });
		$(".lv-nav ul li a").each(function(j,div){
			$(this).click(function(){
		//$("html,body").animate({scrollTop:$("#"+listid).offset().top}, 500); //我要平滑
		        if ($(this).parent().hasClass("on") ){
					return;
                }
				$(this).parent().nextAll().removeClass("on");
				$(this).parent().prevAll().removeClass("on");
				$(this).parent().addClass("on")
				$('.lv-list').hide().css("opacity",0);
				$('.lv-list:eq('+j+')').show().animate({"opacity":"1"});
	});		
	});
})
 
var v256 = {};
v256.hover = function(fid,cid,_class)
{
    if($(fid).length>0)
    {
        $(fid).hover(
            function()
            {
                var index = $(this).index();
                $(fid).removeClass(_class).eq(index).addClass(_class);
                $(cid).hide().eq(index).show();
                if($(cid).find('img.lazy').length>0)
                {
                    $(cid).eq(index).find('img.lazy').lazyload({effect: "fadeIn"});
                    $(cid).eq(index).find('img.lazy').removeClass('lazy');
                }
            },
            function()
            {

            }
        )
    }
};
v256.hClick = function(fid,cid,_class)
{
    if($(fid).length>0)
    {
        $(fid).click(function(){
            var index = $(this).index();
            $(fid).removeClass(_class).eq(index).addClass(_class);
            $(cid).hide().eq(index).show();
        })
    }
};
v256.tabClass = function(fid,_class)
{
    if($(fid).length>0)
    {
        $(fid).hover(
            function()
            {
                $(fid).removeClass(_class)
                $(this).addClass(_class);
            },
            function()
            {

            }
        )
    }
};
v256.classAct = function(fid,_class)
{
    if($(fid).length>0)
    {
        $(fid).hover(
            function()
            {
                $(this).addClass(_class);
            },
            function()
            {
                $(this).removeClass(_class);
            }
        )
    }
};

v256.switchX = function(fid,_class){
    if($(fid).length>0)
    {
        $(fid).hover(
            function()
            {
                var t = $(this);
                t.addClass(_class);
            },
            function()
            {
                var t = $(this);
                t.removeClass(_class);
            }
        )
    }
};

v256.base = {
    initRecordData : function(){
        var len,
            watchLists = [],
            temp=[],  //temp array
            html = "",
            showRecordBtn = $("#J-showrecord"), //触发按钮
            recordCtn = $("#J-showrecord-content"),   //记录
            clearAll = $("#J-clearAllWatch"),
            recordList = $("#J-showrecord-list");     //记录列表
        //获取观看的记录
        if($.cookie("watchRecord"))
        {
            watchLists = resetWatchRecord();
        }
        else
        {
            watchLists= [];
        }
        len = watchLists.length;
        if(len >0){
            recordCtn.find("p").removeClass("nohover").addClass("clear-record").html('<a id="J-clearAllWatch" href="javascript:;">清空记录</a>');
        }

        //绑定观看的数据
        for(var i = 0;i < len;i++){
            var watchID = watchLists[i].id;
            var recordIndex;
            if(watchLists[i].i>-1){
                recordIndex = watchLists[i].i+ 1;
                html += '<li class="fn-clear" movieid="' + watchID +'"><a href="'+watchLists[i].u+'" class="top-record-show"><span>'+watchLists[i].t+'</span><em>观看至第'+recordIndex+'集</em></a><a href="javascript:;" class="top-record-clear"><i class="iconfont"></i></a></li>';
            }else{
                html += '<li class="fn-clear" movieid="' + watchID +'"><a href="'+watchLists[i].u+'" class="top-record-show"><span>'+watchLists[i].t+'</span><em>观看至第'+recordIndex+'集</em></a><a href="javascript:;" class="top-record-clear"><i class="iconfont"></i></a></li>';
            }

            temp.unshift(watchID);
        }
        recordList.html(html);
        //如果没有，则存入观看的数据
        function c(pos){
            var recordData = {
                "id":aid,
                "t":cTile,
                "p":cType,
                "u":cUrl,
                'pos':pos
            };

            watchLists[len] = recordData;
            if(len>10){
                watchLists.pop();
            }
            $.cookie("watchRecord",JSON.stringify(watchLists),{path:'/',expires: 300,domian:'v.256.cc'});
        }
        $(document).delegate(".play_btn","click",function(e){
            var parent = $(this).parent();
            //var index = $(this).index();
            var pos = [];
            pos = [$(this).offset().top,$(this).offset().left];
            var flag= true;
            for(var i =0;i<len;i++){
                if(watchLists[i].id == aid){
                    watchLists[i].pos = pos;
                    watchLists[i].i = index;
                    $.cookie("watchRecord",JSON.stringify(watchLists),{path:'/',expires: 7,domian:'v.256'});
                    flag = false;
                    break;
                }
            }
            if(flag){
                c(pos);
            }
        });
        function resetWatchRecord(){
            watchLists = $.cookie("watchRecord");
            watchLists = JSON.parse(watchLists);
            return watchLists;
        }

        //点击历史按钮
        showRecordBtn.hover(
            function()
            {
                recordCtn.show();
            },
            function()
            {
                recordCtn.hide();
            }
        )

        //用来处理删除记录
        recordList.delegate(".top-record-clear","click",function(){
            var now = $(this),curLi = now.parent(),destp = curLi.parent().find("p"),resId = curLi.attr("movieid"),deleteId;
            curLi.remove();
            for(var i = 0;i<len; i++){
                if(temp[i] == resId){
                    deleteId = i;
                    break;
                }
            }

            if(--len <= 0){
                $(".clear-record").addClass("nohover").removeClass("clear-record").text("无观看记录");
            }
            watchLists.splice(deleteId,1);
            $.cookie("watchRecord",JSON.stringify(watchLists),{path:'/',expires: 300,domian:'v.256.cc'});
            resetWatchRecord();
        });

        //清除所有内容
        $(document).on('click','a#J-clearAllWatch',function(e){
            recordList.html("");
            $("a#J-clearAllWatch").parent().html("无观看记录").addClass("nohover").removeClass("clear-record");
            e.preventDefault();
            $.cookie("watchRecord","");
            watchLists = resetWatchRecord();
        })
    },
    fixTop : function()
    {
        if($("#J-fixtop").length>0)
        {
            $(window).scroll(function() {
                var CurPos = $(window).scrollTop();
                var BtnPos = $("#J-fixtop").height();
                if (CurPos > BtnPos) {
                    $("#J-fixtop").addClass('fixtop')
                } else {
                    $("#J-fixtop").removeClass('fixtop')
                }
            })
        }
    }
}

v256.index = {
    init: function ()
    {
        $.fn.extend(v256.index, v256.base);
        var me = this;
        me.initRecordData();
        me.tab();
        me.slide();
        me.scrollbar();
        me.srolltext('#J-srollwrap');
        me.pixels();
        me.resize();
    },
	slide : function()
    {

jQuery(".banner-layout").slide({ titCell:".banner-smile a",effect:"fold", mainCell:".banner-slider .banner", autoPlay:true, delayTime:300, targetCell:".banner-s-tit .banner-s-t",titOnClassName:"onn"});
    },
    tab : function()
    {
        v256.hover('#J-fy-nav > a','#J-fy-con > div','on');
        v256.hover('#J-tv-nav > a','#J-tv-con > div','on');
        v256.hover('#J-rb-nav > a','#J-rb-con > div','on');
        v256.hover('#J-film-nav > a','#J-film-con > div','on');
        v256.hover('#J-film-rb-nav > a','#J-film-rb-con > div','on');
        v256.hover('#J-zy-nav > a','#J-zy-con > div','on');
        v256.hover('#J-dm-nav > a','#J-dm-con > div','on');
        v256.hover('#J-hz-nav > a','#J-hz-con > div','on');
        v256.hover('#J-day-nav > a','#J-day-con > div','on');
    },
    scrollbar : function()
    {
        //打开所有块，防止脚本作用失效
        if($('#J-day-con').length>0)
        {
            for(var i = 0 ; i < 7; i++)
            {
                new Scrolling.Scrollbar(document.getElementById('dv_scroll_bar_'+i), new Scrolling.Scroller(document.getElementById('dv_scroll_'+i), 430, 210), new Scrolling.ScrollTween());
            }

        }
    },
    srolltext : function(obj)
    {
        var isSroll = false;
        var sroTime;
        sroTime = setInterval(function(){
            $(obj).find("ul").animate({
                marginTop : "-36px"
            },500,function(){
                $(this).css({marginTop : "0px"}).find("li:first").appendTo(this);
            })
        },3000);
        $(obj).hover(
            function()
            {
                clearInterval(sroTime)
            },
            function()
            {
                sroTime = setInterval(function(){
                    $(obj).find("ul").animate({
                        marginTop : "-36px"
                    },500,function(){
                        $(this).css({marginTop : "0px"}).find("li:first").appendTo(this);
                    })
                },3000);
            }
        )
    },
    pixels : function()
    {
        var pixels = $(document.body).width();
        if(pixels <= 1240)
        {
            $('body').addClass('g-wide');
            //今日热点隐藏最后三个
            $('.hot-wrap > ul').eq(0).find('li').eq(7).addClass('g-hide');
            $('.hot-wrap > ul').eq(0).find('li').eq(8).addClass('g-hide');
            $('.hot-wrap > ul').eq(0).find('li').eq(9).addClass('g-hide');
            //电视剧等隐藏两个
            $('.box-model-cont').each(function(i){
                $('.box-model-cont').eq(i).find('a').eq(4).addClass('g-hide');
                $('.box-model-cont').eq(i).find('a').eq(9).addClass('g-hide');
            })
            //综艺隐藏两个
            $('.zy-hover').each(function(i){
                $('.zy-hover').eq(i).find('li').eq(5).addClass('g-hide');
                $('.zy-hover').eq(i).find('li').eq(6).addClass('g-hide');
            })
        }
        else
        {
            $('body').removeClass('g-wide');
            //今日热点显示最后三个
            $('.hot-wrap > ul').eq(0).find('li').eq(7).removeClass('g-hide');
            $('.hot-wrap > ul').eq(0).find('li').eq(8).removeClass('g-hide');
            $('.hot-wrap > ul').eq(0).find('li').eq(9).removeClass('g-hide');
            //电视剧等显示两个
            $('.box-model-cont').each(function(i){
                $('.box-model-cont').eq(i).find('a').eq(4).removeClass('g-hide');
                $('.box-model-cont').eq(i).find('a').eq(9).removeClass('g-hide');
            })
            //综艺显示两个
            $('.zy-hover').each(function(i){
                $('.zy-hover').eq(i).find('li').eq(5).removeClass('g-hide');
                $('.zy-hover').eq(i).find('li').eq(6).removeClass('g-hide');
            })
        }
    },
    resize : function()
    {
        var t = this;
        $(window).resize(function() {
            t.pixels();
        });
    }
}

v256.film ={
    init : function()
    {
        $.fn.extend(v256.film, v256.base);
        var me = this;
        me.initRecordData();
        me.tab();
        me.slide();
        me.switchk();
        me.pixels();
        me.resize();
    },
    tab : function()
    {
        v256.hover('#J-pf-nav > a','#J-pf-con > div','on');
        v256.hover('#J-neidi-nav > a','#J-neidi-con > div','on');
        v256.hover('#J-oumei-nav > a','#J-oumei-con > div','on');
        v256.hover('#J-gangtai-nav > a','#J-gangtai-con > div','on');
        v256.hover('#J-rihan-nav > a','#J-rihan-con > div','on');
        v256.hover('#J-hz-nav > a','#J-hz-con > div','on');
    },
    slide : function()
    {

        jQuery(".banner-layout").slide({ titCell:".banner-s-s-slide .banner-s-a", mainCell:".banner",targetCell:".banner-s-tit .banner-s-t,.mov-smile .banner-s-t", autoPlay:true,delayTime:100,startFun:function(i,p){
            //控制小图自动翻页
            if(i==0){ jQuery(".banner-layout .ck-prev").click() } else if( i%6==0 ){ jQuery(".banner-layout .ck-next").click()}
        }
        });
        //小图滚动
        jQuery(".banner-layout").slide({ mainCell:".banner-s-s-slide ",prevCell:".ck-prev",nextCell:".ck-next",effect:"left",vis:6,scroll:2,autoPage:true,pnLoop:false});

    },
    switchk : function()
    {
        v256.switchX('#J-new-act > .xin-pian-m','xin-pian-h');
    },
    pixels : function()
    {
        var pixels = $(document.body).width();
        if(pixels <= 1240)
        {
            $('body').addClass('g-wide');
            //热播推荐隐藏
            $('.film-rb .box-model-cont').find('a').eq(4).addClass('g-hide');
            $('.film-rb .box-model-cont').find('a').eq(9).addClass('g-hide');
            //预告片
            $('.zy-hover').each(function(i){
                $('.zy-hover').eq(i).find('li').eq(5).addClass('g-hide');
                $('.zy-hover').eq(i).find('li').eq(6).addClass('g-hide');
            })
            //新片速递
            $('#J-new-act > .xin-pian-m').eq(3).addClass('xin-pian-mr0');
            $('#J-new-act > .xin-pian-m').eq(4).addClass('g-hide');
            //好莱坞影院
            $('.hollywood > .hw-376x180').eq(0).addClass('hw-376x180-mr13');
            $('.hollywood > .hw-376x180').eq(1).addClass('hw-376x180-mr0');
            $('.hollywood > .hw-180x376').addClass('g-hide');
            $('.hollywood > .hw-180x180').addClass('hw-180x180-g');
            $('.hollywood > .hw-180x180').eq(3).addClass('hw-180x180-mr0');
            //剧场
            $('.film-model-layout > .box-model-cont').each(function(i){
                $('.film-model-layout > .box-model-cont').eq(i).find('a').eq(5).addClass('g-hide');
            })
        }
        else
        {
            $('body').removeClass('g-wide');
            //热播推荐隐藏
            $('.film-rb .box-model-cont').find('a').eq(4).removeClass('g-hide');
            $('.film-rb .box-model-cont').find('a').eq(9).removeClass('g-hide');
            //预告片
            $('.zy-hover').each(function(i){
                $('.zy-hover').eq(i).find('li').eq(5).removeClass('g-hide');
                $('.zy-hover').eq(i).find('li').eq(6).removeClass('g-hide');
            })
            //新片速递
            $('#J-new-act > .xin-pian-m').eq(3).removeClass('xin-pian-mr0');
            $('#J-new-act > .xin-pian-m').eq(4).removeClass('g-hide');
            //好莱坞影院
            $('.hollywood > .hw-376x180').eq(0).removeClass('hw-376x180-mr13');
            $('.hollywood > .hw-376x180').eq(1).removeClass('hw-376x180-mr0');
            $('.hollywood > .hw-180x376').removeClass('g-hide');
            $('.hollywood > .hw-180x180').removeClass('hw-180x180-g');
            $('.hollywood > .hw-180x180').eq(3).removeClass('hw-180x180-mr0');
            //剧场
            $('.film-model-layout > .box-model-cont').each(function(i){
                $('.film-model-layout > .box-model-cont').eq(i).find('a').eq(5).removeClass('g-hide');
            })
        }
    },
    resize : function()
    {
        var t = this;
        $(window).resize(function() {
            t.pixels();
        });
    }
}

v256.tv ={
    init : function()
    {
        $.fn.extend(v256.tv, v256.base);
        var me = this;
        me.initRecordData();
        me.tab();
        me.slide();
    },
    tab : function()
    {
        v256.hover('#J-day-nav > a','#J-day-con > div','on');
        v256.hover('#J-hz-nav > a','#J-hz-con > div','on');
        v256.hover('#J-mx-nav > a','#J-mx-con > div','on');
        v256.tabClass('.weishi-list,.diantai-list','weishi-list-on');
    },
   	slide : function()
    {

jQuery(".banner-layout").slide({ titCell:".banner-s-s a",effect:"fold",easing:"swing", mainCell:".banner-slider .banner", autoPlay:true, delayTime:100, targetCell:".banner-s-tit .banner-s-t"});
    }
}

v256.filmDetail = {
    init : function()
    {
        $.fn.extend(v256.filmDetail, v256.base);
        var me = this;
        me.initRecordData();
        me.fixTop();
        me.tab();
        me.showAll();
        me.slide();
    },
    tab : function()
    {
        v256.hover('#J-neidi-nav > a','#J-neidi-con > div','on');
        v256.classAct('.top-nav','top-nav-on');
        v256.classAct('.sePageMore','open');
		v256.tabClass('.weishi-list,.diantai-list','weishi-list-on');
    },
    showAll : function()
    {
        if($('#J-showAll').length>0)
        {
            $('#J-showAll').click(function(){
                if($('#J-showBox').hasClass('heightauto'))
                {
                    $('#J-showBox').removeClass('heightauto');
                    $('.film-detail-con').removeClass('heightauto');
                    $(this).html('展开&gt;&gt;')
                }
                else
                {
                    $('#J-showBox').addClass('heightauto');
                    $('.film-detail-con').addClass('heightauto');
                    $(this).html('收起&gt;&gt;')
                }

            })
        }
    },
    slide : function()
    {
        $('#J-film-hx').slide({titCell:"",mainCell:".hot-zy",effect:"leftLoop",autoPage:true,autoPlay:true,interTime : 4000,vis:5,prevCell:'.prev-box',nextCell:'.next-box'});
    }
}

v256.tvDetail = {
    init : function()
    {
        $.fn.extend(v256.tvDetail, v256.base);
        var me = this;
        me.initRecordData();
        me.fixTop();
        me.tab();
        me.showAll();
        me.tvAll();
        me.slide();
    },
    tab : function()
    {
        v256.hover('#J-lv-nav > ul > li','#J-lv-con > div.lv-list','on');
        v256.hover('#J-neidi-nav > a','#J-neidi-con > div','on');
		v256.hover('#J-pf-nav > a','#J-pf-con > div','on');
        v256.classAct('.top-nav','top-nav-on');
		v256.tabClass('.weishi-list,.diantai-list','weishi-list-on');
    },
    showAll : function()
    {
        if($('#J-showAll').length>0)
        {
            $('#J-showAll').click(function(){
                if($('#J-showBox').hasClass('heightauto'))
                {
                    $('#J-showBox').removeClass('heightauto');
                    $('.film-detail-con').removeClass('heightauto');
                    $(this).html('展开&gt;&gt;')
                }
                else
                {
                    $('#J-showBox').addClass('heightauto');
                    $('.film-detail-con').addClass('heightauto');
                    $(this).html('收起&gt;&gt;')
                }

            })
        }
    },
    tvAll : function()
    {
        $('.lv-all-act').click(function(){
            var t = $(this), parent = t.parent(), sli = parent.siblings('.lv-all-list');
            parent.hide();
            sli.show();
        })
    },
    slide : function()
    {
        $('#J-tv-hx').slide({titCell:"",mainCell:".hot-zy",effect:"leftLoop",autoPage:true,autoPlay:true,interTime : 4000,vis:5,prevCell:'.prev-box',nextCell:'.next-box'});
    }
}


v256.ent = {
    init: function ()
    {
        $.fn.extend(v256.ent, v256.base);
        var me = this;
        me.initRecordData();
        me.tab();
        me.slide();
        me.srolltext('#J-srollwrap');
    },
    tab : function()
    {
        v256.hover('#J-hz-nav > a','#J-hz-con > div','on');
    },
    slide : function()
    {
        //轮播图
        $(".ents-slide-wrap").slide({titCell:"",mainCell:".ents-slide-layout ul",effect:"leftLoop",autoPage:true,autoPlay:true,interTime : 4000,vis:3,endFun:function(i){$('.ents-sli-bg').hide();$('.ents-slide-box p').hide();$('.ents-slide-box').eq(i+2).find('.ents-sli-bg').show();$('.ents-slide-box').eq(i+2).find('p').show();}});
    },
    srolltext : function(obj)
    {
        var isSroll = false;
        var sroTime;
        sroTime = setInterval(function(){
            $(obj).find("ul").animate({
                marginTop : "-36px"
            },500,function(){
                $(this).css({marginTop : "0px"}).find("li:first").appendTo(this);
            })
        },3000);
        $(obj).hover(
            function()
            {
                clearInterval(sroTime)
            },
            function()
            {
                sroTime = setInterval(function(){
                    $(obj).find("ul").animate({
                        marginTop : "-36px"
                    },500,function(){
                        $(this).css({marginTop : "0px"}).find("li:first").appendTo(this);
                    })
                },3000);
            }
        )
    }
}

v256.variety = {
    init: function ()
    {
        $.fn.extend(v256.variety, v256.base);
        var me = this;
        me.initRecordData();
		me.scrollbar();
		me.tab();
        me.slide();
        me.srolltext('#J-srollwrap');
    },
    scrollbar : function()
    {
        //打开所有块，防止脚本作用失效
        if($('#J-day-con').length>0)
        {
            for(var i = 0 ; i < 7; i++)
            {
                new Scrolling.Scrollbar(document.getElementById('dv_scroll_bar_'+i), new Scrolling.Scroller(document.getElementById('dv_scroll_'+i), 430, -130), new Scrolling.ScrollTween());
            }
        }
    },tab : function()
    {
        v256.hover('#J-oumei-nav > a','#J-zy-dq > div','on');
        v256.hover('#J-bl-nav > a','#J-bl-con > div','on');
        v256.hover('#J-hz-nav > a','#J-hz-con > div','on');
		v256.hover('#J-fy-nav > a','#J-fy-con > div','on');
        v256.hover('#J-day-nav > a','#J-day-con > div','on');
    },
    slide : function()
    {
        //轮播图
        /*$('.banner-wrap').ckSlide({
         autoPlay: true
         })*/
        film_slide(5)
    },
    srolltext : function(obj)
    {
        var isSroll = false;
        var sroTime;
        sroTime = setInterval(function(){
            $(obj).find("ul").animate({
                marginTop : "-36px"
            },500,function(){
                $(this).css({marginTop : "0px"}).find("li:first").appendTo(this);
            })
        },3000);
        $(obj).hover(
            function()
            {
                clearInterval(sroTime)
            },
            function()
            {
                sroTime = setInterval(function(){
                    $(obj).find("ul").animate({
                        marginTop : "-36px"
                    },500,function(){
                        $(this).css({marginTop : "0px"}).find("li:first").appendTo(this);
                    })
                },3000);
            }
        )
    }	
}

v256.anime = {
    init: function ()
    {
        $.fn.extend(v256.anime, v256.base);
        var me = this;
        me.initRecordData();
        me.scrollbar();
        me.tab();
        me.slide();
        me.slideX();
    },
    scrollbar : function()
    {
        //打开所有块，防止脚本作用失效
        if($('#J-day-con').length>0)
        {
            for(var i = 0 ; i < 7; i++)
            {
                new Scrolling.Scrollbar(document.getElementById('dv_scroll_bar_'+i), new Scrolling.Scroller(document.getElementById('dv_scroll_'+i), 430, -130), new Scrolling.ScrollTween());
            }
        }
    },
    tab : function()
    {
        v256.hover('#J-fy-nav > a','#J-fy-con > div','on');
        v256.hover('#J-day-nav > a','#J-day-con > div','on');
        v256.hover('#J-hz-nav > a','#J-hz-con > div','on');

    },
    slide : function()
    {
        jQuery(".ent-slide-wrap,.zy-slide-wrap").slide({ titCell:".ent-small-img li,.zy-small-img li",targetCell:".ent-artile-box .ent-article-list,.zy-article-box .zy-article-list",effect:"leftLoop", mainCell:".ent-slide-layout ul,.zy-slide-layout ul",vis:3,defaultIndex:1, interTime : 5000,autoPlay:true});
    },
    slideX : function()
    {
        //动画电影
        $('#J-anime-film,#J-anime-1').slide({titCell:"",mainCell:".box-model-cont",effect:"leftLoop",autoPage:true,autoPlay:true,interTime : 4000,vis:6,prevCell:'.prev-box',nextCell:'.next-box'});
        $('#J-anime-2,#J-anime-3,#J-anime-4,#J-anime-5,#J-anime-6,#J-anime-7').slide({titCell:"",mainCell:".box-model-cont",effect:"leftLoop",autoPage:true,interTime : 4000,vis:6,prevCell:'.prev-box',nextCell:'.next-box'});
        //经典电影
        $('#J-anime-old').slide({titCell:"",mainCell:".box-model-cont",effect:"leftLoop",autoPage:true,autoPlay:true,interTime : 4000,vis:6,prevCell:'.prev-box',nextCell:'.next-box'});
    }
}
v256.animeDetail =
{
    init: function ()
    {
        $.fn.extend(v256.animeDetail, v256.base);
        var me = this;
        me.initRecordData();
        me.tab();
        me.playMore();
    },
    tab : function()
    {
        v256.hover('#J-lv-nav > ul > li','#J-lv-con > div.lv-all-box','on');
        for(var i = 0 ;i<100;i++)
        {
            v256.hover('#J-lv-nav-'+i+' a','#J-lv-all-'+i+' > div.lv-all-list','on');
        }

        v256.hover('#J-hz-nav > a','#J-hz-con > div','on');
        v256.classAct('.top-nav','top-nav-on');
    },
    playMore : function()
    {
        if($('.play_more').length>0)
        {
            $('.play_more').click(function(){
                var t = $(this);
                t.parent().hide();
                t.parents('.lv-all-box').find('.lv-all-layout').show();
            })
            $('.hide_play').click(function(){
                var t = $(this);
                t.parents('.lv-all-layout').hide();
                t.parents('.lv-all-box').find('.lv-list').eq(0).show();
            })
        }
    }
}

v256.news = {
    init: function ()
    {
        $.fn.extend(v256.news, v256.base);
        var me = this;
        me.initRecordData();
        me.tab();
        me.slide();
        me.loadMore();
    },
    tab : function()
    {
        v256.hClick('#J-news-nav > a','#J-news-con > div','on');
        v256.hover('#J-pf-nav > a','#J-pf-con > div','on');
    },
    slide : function()
    {
        jQuery(".news-slide").slide({ titCell:".news-num a",effect:"left", mainCell:".news-slide-con ul", interTime : 4000,autoPlay:true});
    },
    loadMore : function()
    {
        if($("#J-news-more").length>0)
        {
            var me = this;
            $("#J-news-more").click(function(){
                var t = $(this), page = t.data('page')+1;
                me.getAjax(page);
                t.data('page',page);
            })
        }
    },
    getAjax : function(page)
    {
        var url = "/api.php?op=get_article_data";
        $.ajax({
            url: url,
            type: 'POST',
            data: {'page':page,'ajax':1},
            dataType: 'json',
            cache: false,
            timeout: 5000,
            success: function (data) {
                if (data.html) {
                    $("#J-news-more").before(data.html);
                    if (page === 4)
                        $("#J-news-more").hide();
                } else
                    $("#J-news-more").html('<a href="javascript:;" target="_blank">没有更多了 &gt;&gt;</a>');
            },
            error: function () {
                $("#J-news-more").html('<a href="javascript:;" target="_blank">没有更多了 &gt;&gt;</a>');
            },
        });
    }
}

v256.newsDetail = {
    init: function ()
    {
        $.fn.extend(v256.newsDetail, v256.base);
        var me = this;
        me.initRecordData();
        me.tab();
        me.fix();
    },
    tab : function()
    {
        v256.classAct('.top-nav','top-nav-on');
        v256.hover('#J-pf-nav > a','#J-pf-con > div','on');
    },
    fix : function()
    {
        if($('#J-box-l').length>0)
        {
            var lh = $("#J-box-l").height() , rh = $("#J-box-r").height(), fh = $("#J-fix").offset().top , rt = $("#J-box-r").offset().top;
            if(lh>rh)
            {
                $(window).scroll(function() {
                    if($(document).scrollTop() > fh)
                    {
                        $("#J-fix").addClass('fix-x').css({'top':0})
                    }
                    else {
                        $("#J-fix").removeClass('fix-x')
                    }
                })
            }
        }
    }
}
v256.newsList = {
    init: function ()
    {
        $.fn.extend(v256.newsList, v256.base);
        var me = this;
        me.initRecordData();
        me.tab();
    },
    tab : function()
    {
        v256.hClick('#J-news-nav > a','#J-news-con > div','on');
        v256.hover('#J-pf-nav > a','#J-pf-con > div','on');
    }
}

v256.entDetail = {
    init: function ()
    {
        $.fn.extend(v256.entDetail, v256.base);
        var me = this;
        me.initRecordData();
        me.tab();
        me.change();
    },
    tab : function()
    {
        v256.classAct('.top-nav','top-nav-on');
        v256.hover('#J-play-nav > a','#J-play-con > div','on');
    },
    change : function()
    {
        if($("#J-change-btn").length>0)
        {
            var changCount = 0;
            $("#J-change-btn").click(function(){
                var t = $(this);
                if(changCount==2)
                {
                    changCount=0;
                    $("#J-change-con > .box-x2-l5").hide().eq(changCount).show();
                }
                else
                {
                    $("#J-change-con > .box-x2-l5").hide().eq(changCount+1).show();
                    changCount++;
                }
                
            })
        }
    }
}

v256.aggregation = {
    init: function ()
    {
        $.fn.extend(v256.aggregation, v256.base);
        var me = this;
        me.initRecordData();
        me.moreFilms();
        me.tab();
    },
    tab : function()
    {
        v256.classAct('.top-nav','top-nav-on');
    },
    moreFilms : function()
    {
        if($('#J-month-film').length>0)
        {
            $('#J-month-film').click(function(){
                var t = $(this);
                if($('#J-month-box').hasClass('month-h'))
                {
                    $('#J-month-box').removeClass('month-h');
                    t.html('收起<i class="iconfont">&#xe634;</i>');
                }
                else
                {
                    $('#J-month-box').addClass('month-h');
                    t.html('更多<i class="iconfont">&#xe633;</i>');
                }
            })
        }
    }
}

v256.varietyDetail = {
    init: function (site,pageno)
    {
        $.fn.extend(v256.varietyDetail, v256.base);
        var me = this;
        me.initRecordData();
        me.tab();
        me.showAll();
        me.lvAjax();
        me.initGetLink(site,pageno);
        me.clickAjax();
        me.navClick();
        me.slide();
    },
    tab : function()
    {
        v256.classAct('.tops-nav','tops-nav-on');
    },
    showAll : function()
    {
        if($('#J-showAll').length>0)
        {
            $('#J-showAll').click(function(){
                if($('#J-showBox').hasClass('heightauto'))
                {
                    $('#J-showBox').removeClass('heightauto');
                    $('.film-detail-con').removeClass('heightauto');
                    $(this).html('展开&gt;&gt;')
                }
                else
                {
                    $('#J-showBox').addClass('heightauto');
                    $('.film-detail-con').addClass('heightauto');
                    $(this).html('收起&gt;&gt;')
                }

            })
        }
    },
    lvAjax : function()
    {
        $($("#J-lv-nav").length>0)
        {
            $("#J-lv-nav li").click(function(){
                var t = $(this);
                $("#J-lv-nav li").removeClass('on');
                t.addClass('on');
            })
        }
    },
    getAjax : function(site,pageno)
    {
        $.get("http://v.256.cc/code/index.php?s=Api/Variety/getkandata/encodeid/"+encodeid+"/site/"+site+"/pageno/"+pageno,
            function (data, state) {
                eval("data = "+data);
                if (data['msg'] == 'succ') {
                    $("#part-content").empty();
                    $("#part-content").append(data['data']);
                    $('.film_rank_img > a').attr('href',$('#part-content a').eq(0).attr('href'));
                    $('.play_now').attr('href',$('#part-content a').eq(0).attr('href'));
                }
            });
    },
    initGetLink : function(site,pageno)
    {
        this.getAjax(site,pageno)
    },
    clickAjax : function()
    {
        if($('#part-content').length>0)
        {
            var me = this;
            $(document).delegate('#part-content a','click',function(){
                var t = $(this), site = $('.content').attr('site');
                if(t.attr('pagenum'))
                {
                    var pagenum = t.attr('pagenum');
                    me.getAjax(site, pagenum);
                }
            })
        }
    },
    navClick : function()
    {
        if($("#supplies").length>0)
        {
            var me = this;
            $("#supplies > li").click(function(){
                var t = $(this), size = t.data('site');
                me.getAjax(size,1);
            })
        }
    },
    slide : function()
    {
        $('#J-variety-hx').slide({titCell:"",mainCell:".box-x2-l5-ul",effect:"leftLoop",autoPage:true,autoPlay:true,interTime : 4000,vis:5,prevCell:'.prev-box',nextCell:'.next-box'});
    }
}

v256.typeList = {
    init: function ()
    {
        $.fn.extend(v256.typeList, v256.base);
        var me = this;
        me.initRecordData();
        me.more();
    },
    more : function()
    {
        if($('.type-more').length>0)
        {
            $('.type-more').click(function(){
                var t = $(this), sli = t.siblings('.all-box');
                if(sli.hasClass('all-height'))
                {
                    sli.removeClass('all-height');
                    t.html('收起<i class="iconfont">&#xe607;</i>')
                }
                else
                {
                    sli.addClass('all-height');
                    t.html('更多<i class="iconfont">&#xe620;</i>')
                }
            })
        }
    }
}