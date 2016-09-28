/**
 * Created by Administrator on 2015/6/11.
 */
zinger={
    initPage : function(){
        zinger.initStyle();
        zinger.initOperation();

    },

    initStyle : function(){

        jQuery(function($) {
            $(document).ready( function() {
                $('.navbar-wrapper').stickUp({
                    topMargin: 'auto'
                });
            });
        });

        var screenWidth_orig=$(window).width();
        //背景图片随着屏幕宽度而裁剪，不会变形（永远取中间部分）
        //从屏幕中间到按钮的距离
        var marginleft_orig=screenWidth_orig*0.5+130;
        var imgMl_orig=screenWidth_orig*0.5-455;
        var slideMl_orig=screenWidth_orig*0.5-420;
        $('.buy').css('marginLeft',marginleft_orig);
        $('.show_params').css('marginLeft',marginleft_orig);
        $('.carousel').css('marginLeft', imgMl_orig);
        //$('.carousel_img').css('marginLeft', imgMl_orig);
        $('.slider-extra').css('marginLeft', slideMl_orig);
        $(window).resize(function(){
            var screenWidth=$(window).width();
            var marginleft=screenWidth*0.5+130;
            var imgMl=screenWidth*0.5-455;
            var slideMl=screenWidth*0.5-420;
            $('.buy').css('marginLeft',marginleft);
            $('.show_params').css('marginLeft',marginleft);
            $('.carousel').css('marginLeft', imgMl);
            //$('.carousel_img').css('marginLeft', imgMl);
            $('.slider-extra').css('marginLeft', slideMl);
        });

    },

    initOperation : function(){
        var timer = null;
        var carousel1;

        var item0=$('.slider-selected').index();
        var carousel0=setInterval(function(){
            item0=(item0+1)%3;

            if(item0 == 1){

                    $('.slider-item').eq(1).addClass('slider-selected').siblings().removeClass('slider-selected');
                    $('.carousel_img').eq(0).animate({"left": 478}, 100,function(){
                        $('.carousel_img').eq(1).css('opacity',1).animate({"left": 0}, 500);
                        $('.carousel_img').eq(2).css("opacity", 0).animate({"left": -478}, 100);
                    });

            }else if(item0 == 2){

                    $('.slider-item').eq(2).addClass('slider-selected').siblings().removeClass('slider-selected');
                    $('.carousel_img').eq(1).animate({"left": 478}, 100, function(){
                        $('.carousel_img').eq(2).css('opacity',1).animate({"left": 0}, 500);
                        $('.carousel_img').eq(0).css("opacity", 0).animate({"left": -478}, 100);
                    });
            }else if(item0 == 0){

                    $('.slider-item').eq(0).addClass('slider-selected').siblings().removeClass('slider-selected');
                    $('.carousel_img').eq(2).animate({"left": 478}, 100, function(){
                        $('.carousel_img').eq(0).css('opacity',1).animate({"left": 0}, 500);
                        $('.carousel_img').eq(1).css("opacity", 0).animate({"left": -478}, 100);
                        $('.carousel_img').eq(2).css("opacity", 0).animate({"left": -956}, 100);
                    });
            }

            /*
            item0=(item0+1)%3;
            $('.slider-item').eq(item0).addClass('slider-selected').siblings().removeClass('slider-selected');
            $('span.carousel_img').eq(item0).animate({'opacity':1}, 1000)
                .siblings().css('opacity', 0);
                */
        },5000);

        $('.slider-item').hover(function() {

            clearInterval(carousel0);
            clearInterval(carousel1);

            clearTimeout(timer);
            var selectItem=$(this).index();
            //var obj=$(this);
            if(!$(this).hasClass('slider-selected')) {
                timer=setTimeout(function(){
                    if(selectItem ==1){
                        var last_selected=$('.slider-selected').index();

                        $('.slider-item').eq(1).addClass('slider-selected').siblings().removeClass('slider-selected');
                        if(last_selected == 2){
                            $('.carousel_img').eq(2).animate({"left": -478}, 500, function(){
                                $('.carousel_img').eq(1).css('opacity',1).animate({"left": 0}, 500);
                                $('.carousel_img').eq(0).css("opacity", 0).animate({"left": 478}, 500);
                            });
                        }else if(last_selected == 0){
                            $('.carousel_img').css('opacity',1).eq(0).animate({"left": 478}, 500, function(){
                                $('.carousel_img').eq(1).css('opacity',1).animate({"left": 0}, 500);
                                $('.carousel_img').eq(2).css('opacity',0).animate({"left": -478}, 500);
                            });
                        }
                    }else if(selectItem == 2){
                        $('.slider-item').eq(2).addClass('slider-selected').siblings().removeClass('slider-selected');

                            $('.carousel_img').eq(0).css("opacity", 1).animate({"left": 956}, 500, function(){
                                $('.carousel_img').eq(1).css('opacity',1).animate({"left": 478}, 500);
                                $('.carousel_img').eq(2).css('opacity',1).animate({"left": 0}, 500);
                                //$('.carousel_img').eq(0).css('opacity',0).animate({"left": -478}, 100);
                                //$('.carousel_img').eq(1).css('opacity',0).animate({"left": -956}, 100);
                            });

                    }else if(selectItem == 0){
                        $('.slider-item').eq(0).addClass('slider-selected').siblings().removeClass('slider-selected');
                        $('.carousel_img').eq(2).css('opacity',1).animate({"left": -956}, 500, function(){
                            $('.carousel_img').eq(1).css('opacity',1).animate({"left": -478}, 500);
                            $('.carousel_img').eq(0).css('opacity',1).animate({"left": 0}, 500);
                        });
                    }
                    /*
                    $(obj).addClass('slider-selected').siblings().removeClass('slider-selected');
                    $('span.carousel_img').eq(selectItem).animate({'opacity':1}, 1000)
                        .siblings().css('opacity', 0);
                     */
                },500);
            }
        },function(){
            clearInterval(carousel0);
            if(timer){
                clearTimeout(timer);
            }
            var item1=$('.slider-selected').index();

            carousel1=setInterval(function(){
                item1=(item1+1)%3;
                if(item1 == 1){
                    $('.slider-item').eq(1).addClass('slider-selected').siblings().removeClass('slider-selected');
                    $('.carousel_img').eq(0).animate({"left": 478}, 500,function(){
                        $('.carousel_img').eq(1).css('opacity',1).animate({"left": 0}, 500);
                        $('.carousel_img').eq(2).css("opacity", 0).animate({"left": -478}, 100);
                    });

                }else if(item1 == 2){
                    $('.slider-item').eq(2).addClass('slider-selected').siblings().removeClass('slider-selected');
                    $('.carousel_img').eq(1).animate({"left": 478}, 500, function(){
                        $('.carousel_img').eq(2).css('opacity',1).animate({"left": 0}, 500);
                        $('.carousel_img').eq(0).css("opacity", 0).animate({"left": -478}, 100);
                    });

                }else if(item1 == 0){
                    $('.slider-item').eq(0).addClass('slider-selected').siblings().removeClass('slider-selected');
                    $('.carousel_img').eq(2).animate({"left": 478}, 500, function(){
                        $('.carousel_img').eq(0).css('opacity',1).animate({"left": 0}, 500);
                        $('.carousel_img').eq(1).css("opacity", 0).animate({"left": -478}, 100);
                        $('.carousel_img').eq(2).css("opacity", 0).animate({"left": -956}, 100);
                    });

                }
                /*
                item1=(item1+1)%3;
                $('.slider-item').eq(item1).addClass('slider-selected').siblings().removeClass('slider-selected');
                $('span.carousel_img').eq(item1).animate({'opacity':1}, 1000)
                    .siblings().css('opacity', 0);
                */
            },5000);

        });

        $('.menuItem').click(function(){
            $('.navbar-collapse').removeClass('in').addClass('collapse');
            var title = $(this).find('a').text();
            $('#hudFeature').text(title);
        });

        $('#safe1').click(function(){
            $('#video').modal('show');
        });
        var safeAnimTag=1;

        $(window).scroll(function(){
            var varscroll=$(window).scrollTop();

            var safeoff=$('.safeSummary').offset().top;
            var safehei=$('.safeSummary').height();


            if(safeAnimTag &&(varscroll >= (safeoff-478)) && (varscroll < (safeoff+safehei))){
                $('.safeSummaryTitle').css('opacity',0);
                $('.safeSummaryTitle').css('left','-10%');
                $('.safeSummaryTitle').animate({left:"0",opacity:"1"}, 2000);

                var cmdCnt=0;
                var recoRate=0;
                setInterval(function(){
                    if(cmdCnt < 100){
                        cmdCnt=cmdCnt+5;
                        $('#voiceVal').text(cmdCnt);
                    }
                    if(recoRate < 90){
                        recoRate=recoRate+5;
                        $('#recoRateVal').text(recoRate);
                    }
                },100);
                safeAnimTag=0;
            }
        });
    }
};
