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
        <div id="a">
            <#include "header.ftl">
            <div id="b">
                <article>
                    <cite>${tag1Label}</cite>
                    <blockquote>
                        <a rel="alternate" href="${servePath}/tag-articles-feed.do?oId=${tag.oId}"><span id="tagArticlesTag">
                            ${tag.tagTitle}
                        </span>(${tag.tagPublishedRefCount})</a>
                    </blockquote>
                    <#include "article-list.ftl">
                </article>
                <#include "side.ftl">
                <div class="clear"></div>
            </div>
            <#include "footer.ftl">
        </div>
    </body>
</html>
