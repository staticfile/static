<#include "macro-head.ftl">
<#include "macro-comments.ftl">
<!DOCTYPE html>
<html>
    <head>
        <@head title="${article.articleTitle} - ${blogTitle}">
        <meta name="keywords" content="${article.articleTags}" />
        <meta name="description" content="${article.articleAbstract?html}" />
        </@head>
    </head>
    <body>
        ${topBarReplacement}
        <div id="a">
            <#include "header.ftl">
            <div id="b">
                <article>
                    <h1>
                        ${article.articleTitle}
                        <#if article.hasUpdated>
                        <sup class="red">
                            ${updatedLabel}
                        </sup>
                        </#if>
                        <#if article.articlePutTop>
                        <sup class="red">
                            ${topArticleLabel}
                        </sup>
                        </#if>
                    </h1>
                    <section class="meta">
                        <p> 
                            ${author1Label}<a rel="nofollow" href="${servePath}/authors/${article.authorId}">${article.authorName}</a> |
                            <#if article.hasUpdated>
                            ${updateDateLabel}:${article.articleUpdateDate?string("yyyy-MM-dd HH:mm:ss")}
                            <#else>
                            ${createDateLabel}:${article.articleCreateDate?string("yyyy-MM-dd HH:mm:ss")}
                            </#if>
                            ${viewCount1Label}<a rel="nofollow" href="${servePath}${article.articlePermalink}">
                                <span class="left article-browserIcon" title="${viewLabel}"></span>
                                ${article.articleViewCount}
                            </a> | ${commentCount1Label}  
                            <a rel="nofollow" href="${servePath}${article.articlePermalink}#comments">
                                <span class="left articles-commentIcon" title="${commentLabel}"></span>
                                ${article.articleCommentCount}
                            </a>
                        </p>
                        <p>
                            ${tags1Label} 
                            <#list article.articleTags?split(",") as articleTag>
                            <span>
                                <a rel="tag" href="${servePath}/tags/${articleTag?url('UTF-8')}">${articleTag}</a><#if articleTag_has_next>,</#if>
                            </span>
                            </#list>
                        </p>
                    </section>
                    <div class="article-body">
                        ${article.articleContent}
                        <#if "" != article.articleSign.signHTML?trim>
                        <div class="marginTop12">
                            ${article.articleSign.signHTML}
                        </div>
                        </#if>
                    </div>
                    <div class="marginBottom12">
                        <#if nextArticlePermalink??>
                        <div class="right">
                            <a href="${servePath}${nextArticlePermalink}">${nextArticle1Label}${nextArticleTitle}</a>
                        </div><div class="clear"></div>
                        </#if>
                        <#if previousArticlePermalink??>
                        <div class="right">
                            <a href="${servePath}${previousArticlePermalink}" >${previousArticle1Label}${previousArticleTitle}</a>
                        </div>
                        </#if>
                        <div class="clear"></div>
                    </div>
                    <div id="relevantArticles" class="article-relative"></div>
                    <ol id="randomArticles"></ol>
                    <ol id="externalRelevantArticles"></ol>
                    <@comments commentList=articleComments article=article></@comments>
                </article>
                <#include "side.ftl">
                <div class="clear"></div>
            </div>
            <#include "footer.ftl">
        </div>
        <@comment_script oId=article.oId>
        page.tips.externalRelevantArticlesDisplayCount = "${externalRelevantArticlesDisplayCount}";
        <#if 0 != randomArticlesDisplayCount>
        page.loadRandomArticles();
        </#if>
        <#if 0 != relevantArticlesDisplayCount>
        page.loadRelevantArticles('${article.oId}', '<h4>${relevantArticles1Label}</h4>');
        </#if>
        <#if 0 != externalRelevantArticlesDisplayCount>
        page.loadExternalRelevantArticles("<#list article.articleTags?split(",") as articleTag>${articleTag}<#if articleTag_has_next>,</#if></#list>");
        </#if>
        </@comment_script>    
    </body>
</html>
