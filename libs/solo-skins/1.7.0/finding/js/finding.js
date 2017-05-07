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
 * @fileoverview util and every page should be used.
 *
 * @author <a href="http://vanessa.b3log.org">Liyuan Li</a>
 * @version 1.1.0.0, Oct 13, 2016
 */

/**
 * @description Finding 皮肤脚本
 * @static
 */
var Finding = {
    /**
     * @description 页面初始化
     */
    init: function () {
        Util.killIE();
        this._initToc();
        $(".scroll-down").click(function (event) {
            event.preventDefault();

            var $this = $(this),
                    $htmlBody = $('html, body'),
                    offset = ($this.attr('data-offset')) ? $this.attr('data-offset') : false,
                    toMove = parseInt(offset);

            $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top + toMove)}, 500);
        });

        $('body').click(function (event) {
            if ($(event.target).closest('.nav').length === 0
                    && $("body").hasClass('nav-opened')
                    && !$(event.target).hasClass('icon-gotop')) {
                $("body").removeClass('nav-opened').addClass('nav-closed');
            }
        });

        $(".menu-button").click(function (event) {
            event.stopPropagation();
            $("body").toggleClass("nav-opened nav-closed");
        });

        $('body').append('<a class="icon-gotop fn-none" href="javascript:Util.goTop()"></a>');
        $(window).scroll(function () {
            if ($(window).scrollTop() > $(window).height()) {
                $(".icon-gotop").show();
            } else {
                $(".icon-gotop").hide();
            }
        });
    },
    /**
     * 文章目录
     * @returns {undefined}
     */
    _initToc: function () {
        if ($('.b3-solo-list').length === 0) {
            $('.nav .icon-sitemap, .nav .icon-list').show();
            return false;
        }

        $('.nav .icon-sitemap, .nav .icon-list').show();
        $('.nav ul:first').hide();
        $('.nav ul:first').after($('.b3-solo-list'));
        
        $("body").toggleClass("nav-opened nav-closed");
    },
    tabNav: function (type) {
        $('.nav .current').removeClass('current');
        if (type === 'toc') {
            $('.nav ul:first').hide();
            $('.nav ul:last').show();
            $('.icon-list').addClass('current');
        } else {
            $('.nav ul:first').show();
            $('.nav ul:last').hide();
            $('.icon-sitemap').addClass('current');
        }
    },
    /**
     * 分享
     * @returns {undefined}
     */
    share: function () {
        $(".share span").click(function () {
            var key = $(this).data("type");
            var title = encodeURIComponent($("title").text()),
                    url = $(".post-title a").attr('href') ? $(".post-title a").attr('href') : location,
                    pic = $(".post-content img:eq(0)").attr("src");
            var urls = {};
            urls.tencent = "http://share.v.t.qq.com/index.php?c=share&a=index&title=" + title +
                    "&url=" + url + "&pic=" + pic;
            urls.weibo = "http://v.t.sina.com.cn/share/share.php?title=" +
                    title + "&url=" + url + "&pic=" + pic;
            urls.google = "https://plus.google.com/share?url=" + url;
            urls.twitter = "https://twitter.com/intent/tweet?status=" + title + " " + url;
            window.open(urls[key], "_blank", "top=100,left=200,width=648,height=618");
        });
    }
};

Finding.init();