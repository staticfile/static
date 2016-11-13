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
        <#include "nav.ftl">
        <div class="wrapper">
            <div class="content">
                <#include "header.ftl">
                <div class="roundtop"></div>
                <div class="body">
                    <div class="left main">
                        <div class="article">
                            <h2 class="article-title">
                                <a class="no-underline" href="${servePath}${article.articlePermalink}">
                                    ${article.articleTitle}
                                </a>
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
                            <div class="posttime-blue">
                                <div class="posttime-MY">
                                    <#if article.hasUpdated>
                                    ${article.articleUpdateDate?string("yyyy-MM")}
                                    <#else>
                                    ${article.articleCreateDate?string("yyyy-MM")}
                                    </#if>
                                </div>
                                <div class="posttime-D">
                                    <#if article.hasUpdated>
                                    ${article.articleUpdateDate?string("dd")}
                                    <#else>
                                    ${article.articleCreateDate?string("dd")}
                                    </#if>
                                </div>
                            </div>
                            <div class="article-abstract">
                                <div class="note">
                                    <div class="corner"></div>
                                    <div class="substance article-body">
                                        ${article.articleContent}
                                        <#if "" != article.articleSign.signHTML?trim>
                                        <div class="marginTop12">
                                            ${article.articleSign.signHTML}
                                        </div>
                                        </#if>
                                    </div>
                                </div>
                            </div>
                            <div class="margin25">
                                <a rel="nofollow" href="${servePath}${article.articlePermalink}" class="left">
                                    <span class="left article-browserIcon" title="${viewLabel}"></span>
                                    <span class="count">${article.articleViewCount}</span>
                                </a>
                                <div class="left">
                                    <span class="tagsIcon" title="${tagLabel}"></span>
                                    <#list article.articleTags?split(",") as articleTag>
                                    <span class="count">
                                        <a rel="tag" href="/tags/${articleTag?url('UTF-8')}">
                                            ${articleTag}</a><#if articleTag_has_next>,</#if>
                                    </span>
                                    </#list>
                                </div>
                                <a rel="nofollow" href="${servePath}${article.articlePermalink}#comments" class="left">
                                    <span class="left articles-commentIcon" title="${commentLabel}"></span>
                                    <span class="count">${article.articleCommentCount}</span>
                                </a>
                                <div class="right">
                                    <a rel="nofollow" href="#comments" class="right">
                                        ${replyLabel}
                                    </a>
                                </div>
                                <div class="clear"></div>
                            </div>

                            <div>
                                <#if nextArticlePermalink??>
                                <div class="right">
                                    <a href="${servePath}${nextArticlePermalink}">${nextArticle1Label}${nextArticleTitle}</a>
                                </div>
                                <div class="clear"></div>
                                </#if>
                                <#if previousArticlePermalink??>
                                <div class="right">
                                    <a href="${servePath}${previousArticlePermalink}">${previousArticle1Label}${previousArticleTitle}</a>
                                </div>
                                </#if>
                                <div class="clear"></div>
                            </div>
                            <div id="relevantArticles" class="article-relative"></div>
                            <div id="randomArticles" class="article-relative"></div>
                            <div id="externalRelevantArticles" class="article-relative"></div>
                        </div>
                        <@comments commentList=articleComments article=article></@comments>
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
