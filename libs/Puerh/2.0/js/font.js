/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {

    function addIcon(el, entity) {
        var html = el.innerHTML;
        el.innerHTML = '<span style="font-family: \'icomoon\';padding-right:3px;">' + entity + '</span>' + html;
    }

    var icons = {
        'icon-pencil' : '&#xe000;',
        'icon-bullhorn' : '&#xe001;',
        'icon-camera' : '&#xe002;',
        'icon-image' : '&#xe003;',
        'icon-location' : '&#xe005;',
        'icon-clock' : '&#xe006;',
        'icon-phone' : '&#xe007;',
        'icon-mobile' : '&#xe008;',
        'icon-bubble' : '&#xe009;',
        'icon-user' : '&#xe00a;',
        'icon-users' : '&#xe00b;',
        'icon-cog' : '&#xe00c;',
        'icon-remove' : '&#xe00d;',
        'icon-eye' : '&#xe00e;',
        'icon-star' : '&#xe00f;',
        'icon-heart' : '&#xe010;',
        'icon-info' : '&#xe011;',
        'icon-cancel-circle' : '&#xe012;',
        'icon-checkmark-circle' : '&#xe013;',
        'icon-close' : '&#xe014;',
        'icon-checkmark' : '&#xe015;',
        'icon-minus' : '&#xe016;',
        'icon-blocked' : '&#xe018;',
        'icon-loop' : '&#xe019;',
        'icon-share' : '&#xe01a;',
        'icon-pinToTop' : '&#xe01b;',
        'icon-envelope' : '&#xe01d;',
        'icon-bars' : '&#xe01e;',
        'icon-search' : '&#xe01f;',
        'icon-user-2' : '&#xe020;',
        'icon-arrow-up' : '&#xe01c;',
        'icon-apple' : '&#xe021;',
        'icon-android' : '&#xe022;',
        'icon-windows8' : '&#xe023;',
        'icon-cart' : '&#xe004;',
        'icon-flag' : '&#xe024;',
        'icon-post' : '&#xe025;',
        'icon-plus' : '&#xe017;',
        'icon-cashBag' : '&#xe026;',
        'icon-mobile-2' : '&#xe028;',
        'icon-question' : '&#xe029;',
        'icon-arrowDown' : '&#xe02a;',
        'icon-arrowLeft' : '&#xe02b;',
        'icon-arrowRight' : '&#xe02c;',
        'icon-arrowTop' : '&#xe02d;',
        'icon-downTriangle' : '&#xe02e;',
        'icon-renew' : '&#xe027;',
        'icon-fangwu' : '&#xe02f;',
        'icon-cheliang' : '&#xe030;',
        'icon-jiaoyou' : '&#xe031;',
        'icon-jianli' : '&#xe032;',
        'icon-chongwu' : '&#xe033;',
        'icon-jiaoyu' : '&#xe034;',
        'icon-fuwu' : '&#xe035;',
        'icon-jianzhi' : '&#xe036;',
        'icon-quanzhi' : '&#xe037;',
        'icon-ershou' : '&#xe038;'
    };

    $('i').each(function(i,el){
        var attr = el.getAttribute('data-icon')
            , c;
        if (attr) {
            addIcon(el, attr);
        }
        c = el.className;
        c = c.match(/icon-[^\s'"]+/);
        if (c && icons[c[0]]) {
            addIcon(el, icons[c[0]]);
        }
    })
};