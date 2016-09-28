/**
 * Created by Administrator on 2015/7/7.
 */
var common = {
    initPage: function () {
        common.initStyle();
    },
    initStyle: function () {
        $(window).resize(function () {
            var clientHeight = document.documentElement.clientHeight;
            var offsetHeight = document.documentElement.offsetHeight;
            //console.log('clientHeight='+clientHeight+" offsetHeight="+offsetHeight);
            if (clientHeight < offsetHeight) {
                $('.contact').removeClass('fixed').addClass('clearfix');
            } else {
                $('.contact').removeClass('clearfix').addClass('fixed');
            }
        });
        $(window).trigger('resize');
    }
};
