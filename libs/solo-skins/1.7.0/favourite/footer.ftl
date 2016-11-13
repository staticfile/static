<div class="info">
    <div class="copyright">
        <span style="color:white;">&copy; ${year}</span> - <a style="color:white;" href="${servePath}">${blogTitle}</a>${footerContent}<br/>
        Powered by <a href="http://b3log.org" target="_blank">B3log 开源</a> • <a href="http://b3log.org/services/#solo" target="_blank">Solo</a> ${version}&nbsp;&nbsp;
        Theme by <a style="color:white;" rel="friend" href="http://www.iprimidieci.com/" target="_blank">Primi</a> & <a rel="friend" style="color:white;" href="http://lamb.b3log.org" target="_blank">Lamb</a>.
    </div>
    <div class="right goTop">
        <span onclick="Util.goTop();">${goTopLabel}</span>
    </div>
</div>
<script type="text/javascript" src="${staticServePath}/js/lib/jquery/jquery.min.js" charset="utf-8"></script>
<script type="text/javascript" src="${staticServePath}/js/common${miniPostfix}.js?${staticResourceVersion}" charset="utf-8"></script>
<script type="text/javascript">
    var latkeConfig = {
        "servePath": "${servePath}",
        "staticServePath": "${staticServePath}"
    };
    
    var Label = {
        "adminLabel": "${adminLabel}",
        "logoutLabel": "${logoutLabel}",
        "skinDirName": "${skinDirName}",
        "loginLabel": "${loginLabel}",
        "em00Label": "${em00Label}",
        "em01Label": "${em01Label}",
        "em02Label": "${em02Label}",
        "em03Label": "${em03Label}",
        "em04Label": "${em04Label}",
        "em05Label": "${em05Label}",
        "em06Label": "${em06Label}",
        "em07Label": "${em07Label}",
        "em08Label": "${em08Label}",
        "em09Label": "${em09Label}",
        "em10Label": "${em10Label}",
        "em11Label": "${em11Label}",
        "em12Label": "${em12Label}",
        "em13Label": "${em13Label}",
        "em14Label": "${em14Label}"
    };
    
    $(document).ready(function () {
        Util.init();
        Util.replaceSideEm($(".side-navi .navi-comments .side-comment"));
    });    
</script>
${plugins}