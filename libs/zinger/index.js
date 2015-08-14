/**
 * Created by Administrator on 2015/8/12.
 */
/*
var index={
    initPage : function(){
        index.initStyle();
        index.initOperation();
    },
    initStyle:function(){
    },
    initOperation:function(){
        $('.linkboxcontent li').mouseenter(function(){
            $(this).find('.mask-p').css('opacity',1).css('display','block');
        }).click(function(){
            //$('li.lock').removeClass('active').addClass('active');
            var idx=$(this).index();
            //console.log(idx);
            $('.showmain ul li').eq(idx).removeClass('active');
            console.log('1');
            setTimeout(function(){
                $('.showmain ul li').eq(idx).addClass('active');

                if(idx==0){
                    console.log('2');
                    $('.showmain ul li').eq(idx).css('display','block').siblings().css('display','none');
                }else{
                    console.log('3');
                    $('.showmain ul li').eq(idx).css('display','list-item').siblings().css('display','none');
                }

            },100);
        }).mouseleave(function(){
            $(this).find('.mask-p').css('opacity',0).css('display','none');
        });
        $('.photo li').hover(function(){

        })
    }
};
    */
function isSupport(a) {
    for (var b = ["", "webkit", "Moz", "ms", "o"], c = b.length, d = document.createElement("div").style; c--;) if (b[c]) {
        if (b[c] + a.substr(0, 1).toUpperCase() + a.substr(1) in d) return ! 0
    } else if (b[c] + a in d) return ! 0;
    return ! 1
}

function gestureCenter() {
    var a, b, c, d, e = $(window).width(),
        f = $(window).height(),
        g = 0,
        h = $("#subNav");
    1920 / 1080 > e / f ? $("#beauty-before img, #beauty-after img").width("").height(f) : $("#beauty-before img, #beauty-after img").height("").width(e),
        $("#beauty-after").css("width", "0%"),
        $("#beautyBtn").attr("style", ""),
        a = h.height() + parseInt(h.css("paddingTop")) + parseInt(h.css("paddingBottom")),
        b = $(".showmain").height(),
        $(".showmain").css("top", a + (f - a - b) / 2),
        $(".showmain").css("left", $("#showbox").width() - $("#showbox .showbg").height() * (375 / 725)),
        $("#showbox ul").width($("#showbox .showbg").height() * (375 / 725)).height($("#showbox .showbg").height()),
        $(".lock .outCenter").width(40.26 * $("#showbox ul").width() / 100),
        $(".lock .outCenter").height($(".lock .outCenter").width()),
        $(".lock .outCenter1").width(30.66 * $("#showbox ul").width() / 100),
        $(".lock .outCenter1").height($(".lock .outCenter1").width()),
        $(".screenshot .outCenter").width(69),
        $(".screenshot .outCenter").height(54),
        $(".screenshot .lightbox, .screenshot .mask").height(563 / 317 * (84.53 * $("#showbox").width() / 100)),
        $(".flashlight .line").width(46.93 * $("#showbox ul").width() / 100),
        $(".flashlight .line").height($(".flashlight .line").width()),
        $(".flashlight .line img").width($(".flashlight .line").width()),
        $(".camera .outCenter").width(38.93 * $("#showbox ul").width() / 100),
        $(".camera .outCenter").height($(".camera .outCenter").width() * (145 / 73) / 2),
        $(".music .outCenter").width(31.46 * $("#showbox ul").width() / 100),
        $(".music .outCenter").height($(".music .outCenter").width() * (250 / 118)),
        $.each($(".linkboxcontent"),
            function() {
                g += $(this).height()
            }),
        c = (f - a - g) / 2,
        d = 0 > c ? a: c + a,
        $(".linkbox .per1").height(d)
}
$(function() {
    gestureCenter();
    var a; !
        function() {
            isSupport("transition") && (a = !0)
        } (),
        function() {
            function b() {
                window.isDeploy || (a ? ($(".photo li").width("10%"), $(this).prev().width("9%"), $(this).next().width("9%"), $(this).width(0 == $(this).index() || $(this).index() == $(".photo li").length - 1 ? "11%": "12%")) : ($(".photo li").stop().animate({
                    width: "10%"
                }), $(this).prev().stop().animate({
                    width: "9%"
                }), $(this).next().stop().animate({
                    width: "9%"
                }), $(this).stop().animate(0 == $(this).index() || $(this).index() == $(".photo li").length - 1 ? {
                    width: "11%"
                }: {
                    width: "12%"
                })), $(this).siblings().find(".photo-mask").stop().fadeTo(300, .5), $(this).find(".photo-mask").stop().fadeTo(300, 0))
            }
            function c() {
                window.isDeploy || $(this).find(".photo-mask").stop().fadeTo(300, .5)
            }
            function d(a) {
                var a = $(a);
                $(".changespan").removeClass("curr"),
                    a.addClass("curr"),
                    $(".photo-bottom dt").html(a.attr("data-title")),
                    $(".photo-bottom .subtitle").html(a.attr("data-subtitle")),
                    $(".photo-bottom .info").html(a.attr("data-info"))
            }
            window.liHover1 = b,
                window.liHover2 = c,
                $(".photo li").hover(b, c),
                $(".photo li").on("click",
                    function() {
                        var b = this;
                        return $(this).find(".photo-mask").css("opacity", 0),
                            window.isDeploy ? ($("#photoGoBack").click(), !1) : (a ? ($(".photo li").width("0%"), $(this).width("50%")) : ($(".photo li").stop().animate({
                                width: "0%"
                            }), $(this).stop().animate({
                                width: "50%"
                            })), $(this).closest("ul").addClass("big"), $(".photo li").css("backgroundSize", Math.max(1920 * $(window).height() / 1080, 50 * $(".photo > ul").width() / 100) + "px auto"), $(".photo-text").fadeOut(), window.isDeploy = !0, setTimeout(function() {
                                    d($(".changespan").eq($(b).index())),
                                        $("#photo-nav").animate({
                                            left: 0
                                        })
                                },
                                500), !1)
                    }),
                $("#photoGoBack").on("click",
                    function() {
                        $("#photo-nav").animate({
                                left: -465
                            },
                            function() {
                                window.isDeploy = !1,
                                    $(".photo li").width("10%"),
                                    $(".photo .big li").css("backgroundSize", ""),
                                    $(".photo .big").removeClass("big"),
                                    $(".photo-text").fadeIn(),
                                    $(".photo-mask").show().css("opacity", "0.5")
                            })
                    }),
                $(".changespan").on("click",
                    function() {
                        d(this),
                            $(".photo-mask").hide(),
                        4 == $(this).index(),
                            a ? $(".photo li").width("0%").eq($(this).index() - 1).width("50%") : $(".photo li").stop().animate({
                                width: "0%"
                            }).eq($(this).index() - 1).stop().animate({
                                width: "50%"
                            })
                    }),
                $(".photo").hover(function() {},
                    function() {
                        window.isDeploy || (a ? $(".photo li").width("10%") : $(".photo li").stop().animate({
                            width: "10%"
                        }))
                    }),
                $(document).on("mousewheel",
                    function(a) {
                        window.temp_clientX = a.clientX
                    }),
                $(document).on("mousemove",
                    function(a) {
                        window.temp_clientX = a.clientX
                    })
        } (),

        function() {
            function b(a, b) {
                function c() {
                    $(a).css({
                        display: "inline",
                        opacity: 1,
                        width: "0%",
                        top: "50%"
                    }).animate({
                            width: "50%",
                            top: "25%"
                        },
                        200).animate({
                            width: "100%",
                            top: "0%",
                            opacity: 0
                        },
                        200,
                        function() {
                            return window.isTwo ? ("function" == typeof b && b(), !1) : (window.isTwo = !0, void c())
                        })
                }
                window.isTwo = !1,
                    a = a || ".lock .ripple",
                    c()
            }
            $(".linkbox li").hover(function() {
                    $(this).find(".mask-p").stop().fadeTo(300, 1)
                },
                function() {
                    $(this).find(".mask-p").stop().fadeTo(300, 0),
                    navigator.userAgent.indexOf("MSIE 8.0") > 0 && $(this).find(".mask-p").hide()
                }),
                $(".mask-p").on("click",
                    function() {
                        var c, d = $(this).closest("li").index();
                        $("#showbox li").hide().eq(d).show();
                        var e = active = $("#showbox li").eq(d);
                        if (a) c = active.hasClass("active") ? 20 : 300,
                            active.removeClass("active"),
                            setTimeout(function() {
                                    active.addClass("active")
                                },
                                c);
                        else {
                            if (window.isStarting) return ! 1;
                            window.isStarting = !0,
                            e.hasClass("camera") && (e.find(".line").show(), e.find(".light").attr("style", ""), e.find(".cover-right").attr("style", ""), e.find(".cover-left").attr("style", "").animate({
                                    height: 0
                                },
                                250,
                                function() {
                                    $(this).hide(),
                                        e.find(".cover-right").animate({
                                                height: 0,
                                                top: 332
                                            },
                                            250,
                                            function() {
                                                e.find(".line").hide(),
                                                    e.find(".light").animate({
                                                            opacity: 1
                                                        },
                                                        function() {
                                                            window.isStarting = !1
                                                        })
                                            })
                                })),
                            e.hasClass("music") && (e.find(".light").attr("style", ""), e.find(".innerCenter").attr("style", "").animate({
                                    height: "100%"
                                },
                                function() {
                                    $(this).hide(),
                                        e.find(".light").animate({
                                                opacity: 1
                                            },
                                            function() {
                                                window.isStarting = !1
                                            })
                                })),
                            e.hasClass("flashlight") && (e.find(".light").attr("style", ""), e.find(".line .innerCenter").attr("style", "").animate({
                                    width: "100%"
                                },
                                function() {
                                    $(this).hide(),
                                        e.find(".light").animate({
                                                opacity: 1
                                            },
                                            function() {
                                                window.isStarting = !1
                                            })
                                })),
                            e.hasClass("lock") && ($(".lock .light").attr("style", ""), $(".lock .hand").attr("style", ""), $(".lock .hand").css("opacity", 1).animate({
                                    top: "47%"
                                },
                                600,
                                function() {
                                    b("",
                                        function() {
                                            $(".lock .light").stop().animate({
                                                opacity: 1
                                            })
                                        }),
                                        $(".lock .hand").delay(1400).animate({
                                                top: "89%"
                                            },
                                            function() {
                                                b(".lock .line",
                                                    function() {
                                                        $(".lock .light").stop().animate({
                                                            opacity: 0
                                                        })
                                                    }),
                                                    $(".lock .hand").delay(1400).animate({
                                                            top: "100%",
                                                            opacity: "0"
                                                        },
                                                        300,
                                                        function() {
                                                            window.isStarting = !1
                                                        })
                                            })
                                })),
                            e.hasClass("screenshot") && ($(".screenshot .line").attr("style", ""), $(".screenshot .light1").attr("style", ""), $(".screenshot .hand").attr("style", ""), $(".screenshot .hand").css("opacity", 1).animate({
                                    top: "40%"
                                },
                                function() {
                                    $(".screenshot .line").animate({
                                        height: 54
                                    }).animate({
                                        opacity: 0
                                    })
                                }).animate({
                                    top: "60%"
                                },
                                function() {
                                    $(".screenshot .mask").animate({
                                            opacity: 1
                                        },
                                        350,
                                        function() {
                                            $(".screenshot .mask").animate({
                                                    opacity: 0
                                                },
                                                350,
                                                function() {
                                                    $(".screenshot .light1").css({
                                                        border: "5px solid #fff"
                                                    }).animate({
                                                            width: 182,
                                                            height: 341,
                                                            top: 73,
                                                            left: 39
                                                        },
                                                        350,
                                                        function() {
                                                            $(".screenshot .light1").animate({
                                                                    top: 500,
                                                                    opacity: 0
                                                                },
                                                                200,
                                                                function() {
                                                                    $(".screenshot .hand").animate({
                                                                            top: "100%",
                                                                            opacity: 0
                                                                        },
                                                                        function() {
                                                                            window.isStarting = !1
                                                                        })
                                                                })
                                                        })
                                                })
                                        })
                                })),
                            e.hasClass("volume") && ($(".volume .line").attr("style", ""), $(".volume .hand").attr("style", ""), $(".volume .hand").css("opacity", 1).animate({
                                    top: "40%"
                                },
                                600).animate({
                                    top: "60%"
                                },
                                600,
                                function() {
                                    $(".volume .hand").animate({
                                        top: "100%",
                                        opacity: "0"
                                    })
                                }), $(".volume .soundbg").animate({
                                    opacity: 1
                                },
                                200), $(".volume .sound").css("height", 0).animate({
                                    height: 66
                                },
                                600).animate({
                                    height: 0
                                },
                                600,
                                function() {
                                    $(".volume .soundbg").animate({
                                            opacity: 0
                                        },
                                        200)
                                }), $(".volume .line-up").animate({
                                    height: 54
                                },
                                600,
                                function() {
                                    $(".volume .line-up").animate({
                                        opacity: 0
                                    }),
                                        $(".volume .line-down").animate({
                                                height: 54
                                            },
                                            600,
                                            function() {
                                                $(".volume .line-down").animate({
                                                        opacity: 0
                                                    },
                                                    function() {
                                                        window.isStarting = !1
                                                    })
                                            })
                                }))
                        }
                    })
        } ()
});
