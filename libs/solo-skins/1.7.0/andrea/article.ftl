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
        <#include "side-tool.ftl">
        <div class="wrapper">
            <#include "header.ftl">
            <div>
                <div class="main">
                    <div class="main-content">
                        <div class="article">
                            <div class="date">
                                <div class="month">${article.articleCreateDate?string("MM")}</div>
                                <div class="day">${article.articleCreateDate?string("dd")}</div>
                            </div>
                            <div class="left">
                                <h2 class="article-title">
                                    <a class="no-underline" href="${servePath}${article.articlePermalink}">${article.articleTitle}</a>
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
                                </h2>
                                <div class="article-date">
                                    <#if article.hasUpdated>
                                    ${article.articleUpdateDate?string("yyyy HH:mm:ss")}
                                    <#else>
                                    ${article.articleCreateDate?string("yyyy HH:mm:ss")}
                                    </#if>
                                    by
                                    <a rel="nofollow" title="${article.authorName}" href="${servePath}/authors/${article.authorId}">
                                        ${article.authorName}</a> |
                                    <a rel="nofollow" href="${servePath}${article.articlePermalink}#comments">
                                        ${article.articleCommentCount}${commentLabel}
                                    </a>
                                </div>
                            </div>
                            <div class="clear"></div>
                            <div class="article-body">
                                ${article.articleContent}
                                <#if "" != article.articleSign.signHTML?trim>
                                <div class="marginTop12">
                                    ${article.articleSign.signHTML}
                                </div>
                                </#if>
                            </div>
                            <div class="right">
                                ${tag1Label}
                                <#list article.articleTags?split(",") as articleTag>
                                <span>
                                    <a rel="tag" href="${servePath}/tags/${articleTag?url('UTF-8')}">
                                        ${articleTag}</a><#if articleTag_has_next>,</#if>
                                </span>
                                </#list>
                                &nbsp;&nbsp;${viewCount1Label}
                                <a rel="nofollow" href="${servePath}${article.articlePermalink}">
                                    ${article.articleViewCount}
                                </a>
                            </div>
                            <div class="clear"></div>
                            <div>
                                <#if nextArticlePermalink??>
                                <a href="${servePath}${nextArticlePermalink}">${nextArticle1Label}${nextArticleTitle}</a>
                                <br>
                                </#if>
                                <#if previousArticlePermalink??>
                                <a href="${servePath}${previousArticlePermalink}">${previousArticle1Label}${previousArticleTitle}</a>
                                </#if>
                            </div>
                            <div id="relevantArticles" class="article-relative left relevantArticles"></div>
                            <div id="randomArticles"  class="article-relative left"></div>
                            <div class="clear"></div>
                            <div id="externalRelevantArticles" class="article-relative"></div>
                        </div>
                        <@comments commentList=articleComments article=article></@comments>
                    </div>
                    <div class="main-footer"></div>
                </div>
                <div class="side-navi">
                    <#include "side.ftl">
                </div>
                <div class="clear"></div>
                <div class="brush">
                    <div class="brush-icon"></div>
                    <div id="brush"></div>
                </div>
                <div class="footer">
                    <#include "footer.ftl">
                </div>
            </div>
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
