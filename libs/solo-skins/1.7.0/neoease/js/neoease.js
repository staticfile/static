/*
 * Copyright (c) 2010-2016, b3log.org & hacpai.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
* @fileoverview neoease js.
*
* @author <a href="mailto:LLY219@gmail.com">Liyuan Li</a>
* @version 1.0.0.8, Sep 6, 2012
*/
var goTop = function (acceleration) {
    acceleration = acceleration || 0.1;

    var y = $(window).scrollTop();
    var speed = 1 + acceleration;
    window.scrollTo(0, Math.floor(y / speed));

    if (y > 0) {
        var invokeFunction = "goTop(" + acceleration + ")";
        window.setTimeout(invokeFunction, 16);
    }
};

var collapseArchive = function (it, year) {
    var tag = true;
    if (it.className === "collapse-ico") {
        it.className = "expand-ico";
        tag = false;
    } else {
        it.className = "collapse-ico";
    }
    
    $("#archiveSide li").each(function () {
        var $this = $(this);
        // hide other year month archives
        if ($this.data("year") === year) {
            if (tag) {
                $(this).show();
            } else {
                $(this).hide();
            }
        }
    });
};

var getArticle = function (it, id) {
    var $abstract = $("#abstract" + id),
    $content = $("#content" + id);
    
    if ($content.html() === "") {
        $.ajax({
            url: "/get-article-content?id=" + id,
            type: "GET",
            dataType: "html",
            beforeSend: function () {
                $abstract.css("background",
                    "url(/skins/neoease/images/ajax-loader.gif) no-repeat scroll center center transparent");
            },
            success: function(result, textStatus){
                it.className = "collapse-ico";
                $content.html(result);
                $abstract.hide().css("background", "none");
                $content.fadeIn("slow");
            }
        });
    } else {
        if (it.className === "expand-ico") {
            $abstract.hide();
            $content.fadeIn();
            it.className = "collapse-ico";
        } else {
            $content.hide();
            $abstract.fadeIn();
            it.className = "expand-ico";
        }
    }
    
    return false;
};

var goTranslate = function () {
    window.open("http://translate.google.com/translate?sl=auto&tl=auto&u=" + location.href);
};
    
(function () {
    // go top icon show or hide
    $(window).scroll(function () {
        var y = $(window).scrollTop();

        if (y > 182) {
            var bodyH = $(window).height();
            var top = y + bodyH - 21;
            if ($("body").height() - 58 <= y + bodyH) {
                top = $(".footer").offset().top - 21;
            }
            $("#goTop").fadeIn("slow").css("top", top);
        } else {
            $("#goTop").hide();
        }
    });
    
    
    // archive
    var currentYear = (new Date()).getFullYear(),
    year = currentYear;
    $("#archiveSide li").each(function (i) {
        var $this = $(this);
        
        // hide other year month archives
        if ($this.data("year") !== currentYear) {
            $(this).hide()
        }
        
        // append year archive
        if (year !== $this.data("year")) {
            year = $this.data("year");
            $this.before("<li class='archive-year'><div onclick='collapseArchive(this, " +
                year + ")' class='expand-ico'>" + year + "&nbsp;\u5e74</div></li>");
        }
    });
    
    // recent comment mouse click
    $(".recent-comments .expand-ico").click(function () {
        if (this.className === "expand-ico") {
            $(this).parent().next().css({
                "height": "auto",
                "white-space": "normal"
            });
            this.className = "collapse-ico";
        } else {
            $(this).parent().next().animate({
                "height": "18px"
            }, function () {
                $(this).css("white-space", "nowrap");
            });
            this.className = "expand-ico";
        }
    });
    
    // nav current
    $(".nav ul li").each(function () {
        var $a = $(this).find("a");
        if ($a.attr("href") === latkeConfig.servePath + location.pathname) {
            $(this).addClass("current");
        } else if (/\/[0-9]+$/.test(location.pathname)) {
            $(".nav ul li")[0].className = "current";
        }
    });
    
    Util.init();
    Util.replaceSideEm($(".recent-comments-content"));
    Util.buildTags("tagsSide");
    
    // recent comments
    $(".recent-comments .recent-comments-main").each(function () {
        if ($(this).find(".recent-comments-content>a").height() < 30) {
            $(this).find(".expand-ico").remove();
        } else {
            $(this).find(".expand-ico").parent().next().css({
                "white-space": "nowrap"
            });
        }
    });
})();