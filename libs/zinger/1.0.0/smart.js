/**
 * Created by Administrator on 2015/6/11.
 */
smart={
    initPage : function(){
        smart.initStyle();
        smart.initOperation();
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
    }
};
