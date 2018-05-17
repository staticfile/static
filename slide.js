(function($){
    $.fn.ckSlide = function(opts){
        opts = $.extend({}, $.fn.ckSlide.opts, opts);
        this.each(function(){
            var slidewrap = $(this).find('.banner');
            var slide = slidewrap.find('.banner-b-img');
            var count = slide.length;
            var that = this;
            var index = 0;
            var time = null;
            $(this).data('opts', opts);
            // next
            $(this).find('.ck-next').on('click', function(){
                if(opts['isAnimate'] == true){
                    return;
                }
                
                var old = index;
                if(index >= count - 1){
                    index = 0;
                }else{
                    index++;
                }
                change.call(that, index, old);
            });
            // prev
            $(this).find('.ck-prev').on('click', function(){
                if(opts['isAnimate'] == true){
                    return;
                }
                
                var old = index;
                if(index <= 0){
                    index = count - 1;
                }else{                                      
                    index--;
                }
                change.call(that, index, old);
            });
            $(this).find('.banner-smile a,.banner-s-s a').each(function(cindex){
                $(this).on('mouseover.slidebox', function(){
                    change.call(that, cindex, index);
                    index = cindex;
                });
            });
            
            // focus clean auto play
            $(this).on('mouseover', function(){
                if(opts.autoPlay){
                    clearInterval(time);
                }
                $(this).find('.ctrl-slide').css({opacity:0.6});
            });
            //  leave
            $(this).on('mouseleave', function(){
                if(opts.autoPlay){
                    startAtuoPlay();
                }
                $(this).find('.ctrl-slide').css({opacity:0.15});
            });
            startAtuoPlay();
            // auto play
            function startAtuoPlay(){
                if(opts.autoPlay){
                    time  = setInterval(function(){
                        var old = index;
                        if(index >= count - 1){
                            index = 0;
                        }else{
                            index++;
                        }
                        change.call(that, index, old);
                    }, 4000);
                }
            }
            // 修正box
            var box = $(this).find('.banner-smile,.banner-s-s');
            box.css({
                'margin-left':-(box.width() / 2)
            })
            // dir
            switch(opts.dir){
                case "x":
                    opts['width'] = $(this).width();
                    slidewrap.css({
                        'width':count * opts['width']
                    });
                    slide.css({
                        'float':'left',
                        'position':'relative'
                    });
                    slidewrap.wrap('<div class="ck-slide-dir"></div>');
                    slide.show();
                    break;
            }
        });
    };
    function change(show, hide){
        var opts = $(this).data('opts');
        if(opts.dir == 'x'){
            var x = show * opts['width'];
            $(this).find('.banner').stop().animate({'margin-left':-x}, function(){opts['isAnimate'] = false;});
            opts['isAnimate'] = true
        }else{
            $(this).find('.banner .banner-b-img').eq(hide).hide();
            $(this).find('.banner .banner-b-img').eq(show).show();
            //css({opacity:0}).stop().animate({opacity:1})
        }

        if(opts.mt)
        {
            $(this).find('.banner-smile a,.banner-s-s a').removeClass('on');
            $(this).find('.banner-smile a,.banner-s-s a').stop().animate({'margin-top':0});
            $(this).find('.banner-smile a,.banner-s-s a').eq(show).stop().animate({'margin-top':-22});
            $(this).find('.banner-smile a,.banner-s-s a').eq(show).addClass('on');
            $(this).find('.banner-s-tit .banner-s-t,.mov-smile .banner-s-t').eq(hide).hide();
            $(this).find('.banner-s-tit .banner-s-t,.mov-smile .banner-s-t').eq(show).show();
        }
        else
        {
            $(this).find('.banner-s-tit .banner-s-t,.mov-smile .banner-s-t').eq(hide).hide();
            $(this).find('.banner-s-tit .banner-s-t,.mov-smile .banner-s-t').eq(show).show();
            $(this).find('.banner-smile a,.banner-s-s a').removeClass('on');
            $(this).find('.banner-smile a,.banner-s-s a').eq(show).addClass('on');
        }
    }
    $.fn.ckSlide.opts = {
        autoPlay: false,
        dir: null,
        isAnimate: false
    };
})(jQuery);