/**
 * Created by Administrator on 2015/6/26.
 */
var joinForm = {
    initPage: function () {
        joinForm.initStyle();
        joinForm.initOperation();
    },
    initStyle: function () {
        common.initPage();
    },
    initOperation: function () {
        $('#joinBtn').click(function () {
            joinForm.saveInfo();
        });
        $('#cancelBtn').click(function () {
            //$('.form-control').val('');
            history.back();
        });
    },
    validateData : function(){
        var name= $.trim($('#name').val());
        var email=$.trim($('#email').val());
        var mobile = $.trim($('#mobile').val());
        var qq = $.trim($('#qq').val());
        var email_reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
        var qq_reg = /^\d{4,10}$/;

        $('#err_name').hide();
        $('#err_email').hide();
        $('#err_mobile').hide();
        $('#err_qq').hide();

        if(name == ''){
            $('#err_name').show();
            return false;
        }

        if(!((/^13\d{9}$/g.test(mobile)) || (/^14\d{9}$/g.test(mobile))
            || (/^15\d{9}$/g.test(mobile)) || (/^16\d{9}$/g.test(mobile))
            || (/^17\d{9}$/g.test(mobile)) || (/^18\d{9}$/g.test(mobile)))
            && !(/^0\d{2,3}-?\d{7,8}$/.test(mobile))) {
            $('#err_mobile').show();
            return false;
        }

        if(!qq_reg.test(qq)){
            $('#err_qq').show();
            return false;
        }
        if(!email_reg.test(email)){
            $('#err_email').show();
            return false;
        }


        return true;
    },

    saveInfo: function(){
        if(!joinForm.validateData()){
            return false;
        }
        var params={};
        params['compeny'] = $.trim($('#company').val());
        params['email'] = $.trim($('#email').val());
        params['connectUser'] = $.trim($('#name').val());
        params['phone'] = $.trim($('#mobile').val());
        params['qq'] = $.trim($('#qq').val());
        $.ajax({
            url: 'http://dev-tsp.qhzinger.com/tsp/channel/api/channelAppy',
            data: params,
            type: 'POST',
            dataType: 'jsonp',
            success: function (data) {
                $("#contact-form-sent").modal("show");
                $('.form-control').val('');
            },
            error: function (errorObj) {

                $("#contact-form-sent").modal("show");
                $('.form-control').val('');
            }
        });
    }
}
