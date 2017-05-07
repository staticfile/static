<#list articles as article>
<div class="article">
    <div class="article-header">
        <h2>
            <a rel="bookmark" class="no-underline" href="${servePath}${article.articlePermalink}">
                ${article.articleTitle}
                <#if article.hasUpdated>
                <sup>
                    ${updatedLabel}
                </sup>
                </#if>
                <#if article.articlePutTop>
                <sup>
                    ${topArticleLabel}
                </sup>
                </#if>
            </a>
        </h2>
    </div>
    <div class="left article-info">
        <div class="article-date">
            <#if article.hasUpdated>
            ${article.articleUpdateDate?string("yyyy-MM-dd HH:mm:ss")}
            <#else>
            ${article.articleCreateDate?string("yyyy-MM-dd HH:mm:ss")}
            </#if>
        </div>
        <div class="article-comment">
            <a rel="nofollow" href="${servePath}${article.articlePermalink}#comments">
                ${commentLabel}(${article.articleCommentCount})
            </a>
        </div>
    </div>
    <div class="right article-main">
        <#list article.articleTags?split(",") as articleTag>
        <a rel="tag" class="article-tags" href="${servePath}/tags/${articleTag?url('UTF-8')}">
            ${articleTag}</a>
        </#list>
        <div class="clear"></div>
        <div class="article-abstract">
            ${article.articleAbstract}
        </div>
    </div>
    <div class="clear"></div>
</div>
<div class="line right"></div>
<div class="clear"></div>
</#list>
<#if 0 != paginationPageCount>
<div class="pagination">
    <#if 1 != paginationPageNums?first>
    <a href="${servePath}${path}/1">${firstPageLabel}</a>
    <a id="previousPage" href="${servePath}${path}/${paginationPreviousPageNum}">${previousPageLabel}</a>
    </#if>
    <#list paginationPageNums as paginationPageNum>
    <#if paginationPageNum == paginationCurrentPageNum>
    <a href="${servePath}${path}/${paginationPageNum}" class="selected">${paginationPageNum}</a>
    <#else>
    <a href="${servePath}${path}/${paginationPageNum}">${paginationPageNum}</a>
    </#if>
    </#list>
    <#if paginationPageNums?last != paginationPageCount>
    <a id="nextPage" href="${servePath}${path}/${paginationNextPageNum}">${nextPagePabel}</a>
    <a href="${servePath}${path}/${paginationPageCount}">${lastPageLabel}</a>
    </#if>
    &nbsp;&nbsp;${sumLabel} ${paginationPageCount} ${pageLabel}
</div>
<#else>
&nbsp;
</#if>