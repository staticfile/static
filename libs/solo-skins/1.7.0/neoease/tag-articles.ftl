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
        <#include "header.ftl">
        <div class="body">
            <div class="wrapper">
                <div class="main">
                    <h2>
                        <a rel="alternate" href="${servePath}/tag-articles-feed.do?oId=${tag.oId}" class="feed-ico">
                            ${tag1Label}
                            ${tag.tagTitle}
                            (${tag.tagPublishedRefCount})
                        </a>
                    </h2>
                    <#include "article-list.ftl">
                </div>
                <#include "side.ftl">
                <div class="clear"></div>
            </div>
        </div>
        <#include "footer.ftl">
    </body>
</html>
