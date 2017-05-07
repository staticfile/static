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
        <h3 id="tag" style="cursor: pointer" class="nav-abs" 
            onclick="window.location.href='${servePath}/tag-articles-rss.do?oId=${tag.oId}'"> 
            ${tag.tagTitle}
            (${tag.tagPublishedRefCount})
            <img src="${staticServePath}/images/feed.png" alt="RSS"/>
        </h3>
        <#include "article-list.ftl">
        <#include "footer.ftl">
    </body>
</html>
