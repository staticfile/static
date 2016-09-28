/**
 * Created by Administrator on 2015/6/16.
 */
app = {
    initPage : function(){
        app.initStyle();
        app.initOperation();
    },
    initStyle : function(){
        var fea1AnimateTag=1;
        var fea6AnimateTag=1;

        var screenWidth_orig=$(window).width();
        //背景图片随着屏幕宽度而裁剪，不会变形（永远取中间部分）
        //从屏幕中间到按钮的距离是210px
        var marginleft_orig=screenWidth_orig*0.5+210;
        $('.android').css('marginLeft',marginleft_orig);
        $('.iphone').css('marginLeft',marginleft_orig);

        $(window).resize(function(){
            var screenWidth=$(window).width();
            var marginleft=screenWidth*0.5+210;
            $('.android').css('marginLeft',marginleft);
            $('.iphone').css('marginLeft',marginleft);
        });

        $(window).scroll(function() {

            var varscroll = $(window).scrollTop();
            var fea1off=$('#feature1').offset().top;
            var fea1height=$('#feature1').height();
            var fea6off=$('#feature6').offset().top;
            var fea6height=$('#feature6').height();
            //console.log('fea1off='+fea1off+" fea1height="+fea1height);

            if(fea1AnimateTag && (varscroll > (fea1off-100)) && (varscroll < (fea1off+fea1height+30))){
                $('.fea1_img').css('opacity',0);
                $('.fea1_img').css('left','-30%');
                $('.fea1_img').animate({left:"0%",opacity:"1"}, 2000);
                fea1AnimateTag=0;
            }

            if(fea6AnimateTag && (varscroll > (fea6off-100)) && (varscroll < (fea6off+fea6height+30))){
                $('.fea6_img1').css('opacity',0);
                $('.fea6_img1').css('left','-15%');
                $('.fea6_img1').animate({left:"0",opacity:"1"}, 2000);

                $('.fea6_img2').css('opacity',0);
                $('.fea6_img2').css('left','15%');
                $('.fea6_img2').animate({left:"0",opacity:"1"}, 2000);
                fea6AnimateTag=0;
            }
        });
    },
    initOperation : function(){

    }
};
