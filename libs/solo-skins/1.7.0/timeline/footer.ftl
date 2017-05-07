<div class="footer">
    <div class="container fn-clear">
        <div class="left">
            <span>&copy; ${year}</span> - <a href="${servePath}">${blogTitle}</a>${footerContent}
            Powered by <a href="http://b3log.org" target="_blank">B3log 开源</a> • <a href="http://b3log.org/services/#solo" target="_blank">Solo</a> ${version}&nbsp;&nbsp;
            Theme by <a rel="friend" target="_blank" href="http://themify.me/demo/themes/postline/">Postline</a> & <a rel="friend" href="http://vanessa.b3log.org" target="_blank">Vanessa</a>.
        </div>
        <div class="right fn-clear">
            <span class="left">
                <span>
                    ${viewCount1Label}
                    ${statistic.statisticBlogViewCount}
                    &nbsp;&nbsp;
                </span>
                <span>
                    ${articleCount1Label}
                    ${statistic.statisticPublishedBlogArticleCount}
                    &nbsp;&nbsp;
                </span>
                <span>
                    ${commentCount1Label}
                    ${statistic.statisticPublishedBlogCommentCount}
                </span>
            </span>
            <span class="ico-translate" onclick="timeline.translate()"></span>
        </div>
    </div>
</div>
<div class="ico-top none" onclick="Util.goTop()" title="TOP"></div>
<script type="text/javascript">
                var latkeConfig = {
                    "servePath": "${servePath}",
                    "staticServePath": "${staticServePath}"
                };

                var Label = {
                    "tagLabel": "${tagLabel}",
                    "viewLabel": "${viewLabel}",
                    "commentLabel": "${commentLabel}",
                    "noCommentLabel": "${noCommentLabel}",
                    "topArticleLabel": "${topArticleLabel}",
                    "authorLabel": "${authorLabel}",
                    "updatedLabel": "${updatedLabel}",
                    "contentLabel": "${contentLabel}",
                    "abstractLabel": "${abstractLabel}",
                    "moreLabel": "${moreLabel}",
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
                    "em14Label": "${em14Label}",
                    "localeString": "${localeString}",
                    "yearLabel": "${yearLabel}",
                    "monthLabel": "${monthLabel}"
                };
</script>
<script type="text/javascript" src="${staticServePath}/js/lib/jquery/jquery.min.js" charset="utf-8"></script>
<script type="text/javascript" src="${staticServePath}/js/common${miniPostfix}.js?${staticResourceVersion}" charset="utf-8"></script>
<script type="text/javascript" src="${staticServePath}/skins/${skinDirName}/js/${skinDirName}${miniPostfix}.js?${staticResourceVersion}" charset="utf-8"></script>
${plugins}
