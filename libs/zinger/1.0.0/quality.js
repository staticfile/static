/**
 * Created by Administrator on 2015/6/11.
 */
quality={
    initPage : function(){
        quality.initStyle();
        quality.initOperation();
    },

    initStyle : function(){

        jQuery(function($) {
            $(document).ready( function() {
                $('.navbar-wrapper').stickUp({
                    topMargin: 'auto'
                });
            });
        });

    },

    initOperation : function(){
        $('.menuItem').click(function(){
            $('.navbar-collapse').removeClass('in').addClass('collapse');
            var title = $(this).find('a').text();
            $('#hudFeature').text(title);
        });

        var quality1AnimTag=1;
        var quality2AnimTag=1;

        $(window).scroll(function(){
            var varscroll=$(window).scrollTop();

            var quality1off=$('.qualitySummary1').offset().top;
            var quality2off=$('.qualitySummary2').offset().top;
            var quality1hei=$('.qualitySummary1').height();
            var quality2hei=$('.qualitySummary2').height();

            if(quality1AnimTag &&(varscroll >= (quality1off-500)) && (varscroll < (quality1off+quality1hei))){
                $('.qualitySummaryTitle1').css('opacity',0);
                $('.qualitySummaryTitle1').css('left','-10%');
                $('.qualitySummaryTitle1').animate({left:"0",opacity:"1"}, 2000);

                var temper=0;
                var heatDissipate =0;
                setInterval(function(){
                    if(temper < 80){
                        temper=temper+5;
                        $('#temperVal').text(temper);
                    }
                    if(heatDissipate < 30){
                        heatDissipate=heatDissipate+2;
                        $('#metalBackVal').text(heatDissipate);
                    }
                },100);

                quality1AnimTag=0;

            }else if(quality2AnimTag &&(varscroll >= (quality2off-500)) && (varscroll < (quality2off+quality2hei))) {
                $('.qualitySummaryTitle2').css('opacity',0);
                $('.qualitySummaryTitle2').css('left','-10%');
                $('.qualitySummaryTitle2').animate({left:"0",opacity:"1"}, 2000);

                var opacity=0;
                var screenHei =0;
                setInterval(function(){
                    if(opacity < 80){
                        opacity=opacity+5;
                        $('#opacityVal').text(opacity);
                    }
                    if(screenHei < 60){
                        screenHei=screenHei+5;
                        $('#screenHeightVal').text(screenHei);
                    }
                },100);

                quality2AnimTag=0;
            }
        });
    }
};
