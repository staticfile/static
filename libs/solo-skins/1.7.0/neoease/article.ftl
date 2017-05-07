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
        <#include "header.ftl">
        <div class="body">
            <div class="wrapper">
                <div class="main">
                    <div class="page">
                        <h2>
                            <a class="article-title" href="${servePath}${article.articlePermalink}">
                                ${article.articleTitle}
                            </a>
                            <#if article.hasUpdated>
                            <sup class="tip">
                                ${updatedLabel}
                            </sup>
                            </#if>
                            <#if article.articlePutTop>
                            <sup class="tip">
                                ${topArticleLabel}
                            </sup>
                            </#if>
                        </h2>
                        <div class="left article-element">
                            <span class="date-ico" title="${dateLabel}">  
                                <#if article.hasUpdated>
                                ${article.articleUpdateDate?string("yyyy-MM-dd HH:mm:ss")}
                                <#else>
                                ${article.articleCreateDate?string("yyyy-MM-dd HH:mm:ss")}
                                </#if>
                            </span>
                            <span class="user-ico" title="${authorLabel}">
                                <a rel="nofollow" href="${servePath}/authors/${article.authorId}">${article.authorName}</a>
                            </span>
                        </div>
                        <div class="right article-element">
                            <a rel="nofollow" href="${servePath}${article.articlePermalink}#comments">
                                ${article.articleCommentCount}&nbsp;&nbsp;${commentLabel}
                            </a>&nbsp;&nbsp;
                            <a rel="nofollow" href="${servePath}${article.articlePermalink}">
                                ${article.articleViewCount}&nbsp;&nbsp;${viewLabel}
                            </a>
                        </div>
                        <div class="clear"></div>
                        <div class="article-body">
                            ${article.articleContent}
                            <#if "" != article.articleSign.signHTML?trim>
                            <div>
                                ${article.articleSign.signHTML}
                            </div>
                            </#if>
                        </div>
                        <div class="article-element">
                            <span class="tag-ico" title="${tagsLabel}">
                                <#list article.articleTags?split(",") as articleTag>
                                <a rel="tag" href="${servePath}/tags/${articleTag?url('UTF-8')}">
                                    ${articleTag}</a><#if articleTag_has_next>,</#if>
                                </#list>
                            </span>
                        </div>
                        <div class="article-panel1">
                            <#if nextArticlePermalink??>
                            <div class="right">
                                <a href="${servePath}${nextArticlePermalink}">${nextArticle1Label}${nextArticleTitle}</a>
                            </div><div class="clear"></div>
                            </#if>                            
                            <#if previousArticlePermalink??>
                            <div class="right">
                                <a href="${servePath}${previousArticlePermalink}">${previousArticle1Label}${previousArticleTitle}</a>
                            </div>
                            </#if>
                            <div class="clear"></div>
                        </div>
                        <div class="article-panel2">
                            <div id="relevantArticles" class="left" style="width: 50%;"></div>
                            <div id="randomArticles" class="left"></div>
                            <div class="clear" style="height: 15px;"></div>
                            <div id="externalRelevantArticles"></div>
                        </div>
                    </div>
                    <@comments commentList=articleComments article=article></@comments>
                </div>
                <#include "side.ftl">
                <div class="clear"></div>
            </div>
        </div>
        <#include "footer.ftl">
        <@comment_script oId=article.oId>
        page.tips.externalRelevantArticlesDisplayCount = "${externalRelevantArticlesDisplayCount}";
        <#if 0 != randomArticlesDisplayCount>
        page.loadRandomArticles();
        </#if>
        <#if 0 != relevantArticlesDisplayCount>
        page.loadRelevantArticles('${article.oId}', '<h4>${relevantArticlesLabel}</h4>');
        </#if>
        <#if 0 != externalRelevantArticlesDisplayCount>
        page.loadExternalRelevantArticles("<#list article.articleTags?split(",") as articleTag>${articleTag}<#if articleTag_has_next>,</#if></#list>");
        </#if>
        </@comment_script>    
    </body>
</html>
