<div class="footer">
    &copy; ${year} - <a href="${servePath}">${blogTitle}</a>${footerContent} Powered by <a href="http://b3log.org" target="_blank">B3log 开源</a> • <a href="http://b3log.org/services/#solo" target="_blank">Solo</a> ${version}
    <div><em>All rights reserved.</em></div>
</div>

<script type="text/javascript">
    var latkeConfig = {
        "servePath": "${servePath}",
        "staticServePath": "${staticServePath}"
    };

    var Label = {
        "tag1Label": "${tag1Label}",
        "viewLabel": "${viewLabel}",
        "commentLabel": "${commentLabel}",
        "topArticleLabel": "${topArticleLabel}",
        "updatedLabel": "${updatedLabel}",
        "contentLabel": "${fullContentLabel}",
        "abstractLabel": "${abstractLabel}",
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
</script>
<script type="text/javascript" src="${staticServePath}/js/lib/jquery/jquery.min.js" charset="utf-8"></script>
<script type="text/javascript" src="${staticServePath}/js/common${miniPostfix}.js?${staticResourceVersion}" charset="utf-8"></script>
<script type="text/javascript" src="${staticServePath}/skins/${skinDirName}/js/bootstrap${miniPostfix}.js?${staticResourceVersion}" charset="utf-8"></script>
<script>
    Util.setTopBar();
</script>
${plugins}
