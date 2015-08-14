/**
 * Created by Administrator on 2015/6/9.
 */
var contact ={
    initPage : function(){
        contact.initStyle();
        contact.initOperation();
        contact.initLoad();
    },
    initStyle : function(){

    },
    initOperation : function(){
        $('#contact-form-submit').click(function(){
            contact.sendMail();
        });

        $("#modal-close-btn").click(function() {
            window.location.reload()
        });
    },
    initLoad : function(){

    },

    validateData : function(){
        var name= $.trim($('#contact-name-first').val());
        var email=$.trim($('#contact-email-address').val());
        var subject = $.trim($('#contact-subject').val());
        var message = $.trim($('#contact-message').val());
        var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;

        $('#err_name').hide();
        $('#err_email').hide();
        $('#err_subject').hide();
        $('#err_message').hide();

        if(name == ''){
            $('#err_name').show();
            return false;
        }

        if(!reg.test(email)){
            $('#err_email').show();
            return false;
        }

        if(subject == ''){
            $('#err_subject').show();
            return false;
        }

        if(message == ''){
            $('#err_message').show();
            return false;
        }
        return true;
    },

    sendMail : function(){
        if(!contact.validateData()){
            return false;
        }

        var params={};
        params['name'] = $.trim($('#contact-name-first').val());
        params['email'] = $.trim($('#contact-email-address').val());
        params['company'] = $.trim($('#contact-company').val());
        params['subject'] = $.trim($('#contact-subject').val());
        params['message'] = $.trim($('#contact-message').val());

        $.ajax({
            url: 'http://dev-bss.qhzinger.com/bss//home/connect',
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
};
