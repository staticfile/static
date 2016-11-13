<#include "macro-head.ftl">
<!DOCTYPE html>
<html>
    <head>
        <@head title="${tag.tagTitle} - ${blogTitle}">
        <meta name="keywords" content="${metaKeywords},${tag.tagTitle}"/>
        <meta name="description" content="<#list articles as article>${article.articleTitle}<#if article_has_next>,</#if></#list>"/>
        </@head>
    </head>
    <body>
        ${topBarReplacement}
        <div class="bg">
            <div class="wrapper">
                <div class="content">
                    <#include "header.ftl">
                    <div class="body">
                        <div class="left main">
                            <div class="kind-title">
                                ${tag1Label}
                            </div>
                            <div class="kind-panel">
                                <a rel="alternate" href="${servePath}/tag-articles-feed.do?oId=${tag.oId}"><span id="tagArticlesTag">
                                    ${tag.tagTitle}
                                </span>(${tag.tagPublishedRefCount})</a>
                            </div>
                            <#include "article-list.ftl">
                        </div>
                        <div class="right">
                            <#include "side.ftl">
                        </div>
                        <div class="clear"></div>
                    </div>
                    <div class="footer">
                        <#include "footer.ftl">
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
