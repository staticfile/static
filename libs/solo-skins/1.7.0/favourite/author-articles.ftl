<#include "macro-head.ftl">
<!DOCTYPE html>
<html>
    <head>
        <@head title="${authorName} - ${blogTitle}">
        <meta name="keywords" content="${metaKeywords},${authorName}"/>
        <meta name="description" content="<#list articles as article>${article.articleTitle}<#if article_has_next>,</#if></#list>"/>
        </@head>
    </head>
    <body>
        ${topBarReplacement}
        <#include "nav.ftl">
        <div class="wrapper">
            <div class="content">
                <#include "header.ftl">
                <div class="roundtop"></div>
                <div class="body">
                    <div class="left main">
                        <div class="kind-title">
                            ${author1Label}
                        </div>
                        <div class="kind-panel">
                            ${authorName}
                        </div>
                        <#include "article-list.ftl">
                    </div>
                    <div class="right">
                        <#include "side.ftl">
                    </div>
                    <div class="clear"></div>
                </div>
                <div class="roundbottom"></div>
            </div>
        </div>
        <div class="footer">
            <div class="footer-icon"><#include "statistic.ftl"></div>
            <#include "footer.ftl">
        </div>
    </body>
</html>
