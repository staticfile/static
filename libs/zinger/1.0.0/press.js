/**
 * Created by Administrator on 2015/7/1.
 */
press = {
    initPage : function(){
        press.initStyle();
        press.initOperation();
        press.initLoad();
    },
    initStyle : function(){
        var newsCnt=$('.news').length;
        if(newsCnt < 5) {
            $('.load_more').hide();
        }else{
            $('.news:gt(4)').addClass('hide').hide(); //只显示前5个
            $('.load_more').show();
        }
    },
    initOperation : function() {
        $('.load_more').click(function () {
            var hideCnt=$('.hide').length;
            if(hideCnt <= 5){
                $('.hide').show().removeClass('hide');;
                $('.load_more').hide();
            }else{
                $('.hide:lt(4)').show().removeClass('hide');
            }
        });
    },
    initLoad : function(){

    }
};
