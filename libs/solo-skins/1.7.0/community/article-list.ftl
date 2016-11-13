<#list articles as article>
<div class="marginBottom40">
    <div class="article-header">
        <div class="article-date">
            <#if article.hasUpdated>
            ${article.articleUpdateDate?string("yyyy-MM-dd HH:mm")}
            <#else>
            ${article.articleCreateDate?string("yyyy-MM-dd HH:mm")}
            </#if>
        </div>
        <div class="arrow-right"></div>
        <div class="clear"></div>
        <ul>
            <li>
                <span class="left">
                    by&nbsp;
                </span>
                <a rel="nofollow" class="left" title="${article.authorName}" href="${servePath}/authors/${article.authorId}">
                    ${article.authorName}
                </a>
                <span class="clear"></span>
            </li>
            <li>
                <a rel="nofollow" href="${servePath}${article.articlePermalink}" title="${viewLabel}">
                    ${viewLabel} (${article.articleViewCount})
                </a>
            </li>
            <li>
                <a rel="nofollow" title="${commentLabel}" href="${servePath}${article.articlePermalink}#comments">
                    ${commentLabel} (${article.articleCommentCount})
                </a>
            </li>
        </ul>
    </div>
    <div class="article-main">
        <h2 class="title">
            <a rel="bookmark" class="no-underline" href="${servePath}${article.articlePermalink}">
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
        <div class="article-body">
            ${article.articleAbstract}
        </div>
        <div class="read-more">
            <a href="${servePath}${article.articlePermalink}">
                <span class="left">${readmore2Label}</span>
                <span class="read-more-icon"></span>
                <span class="clear"></span>
            </a>
            <div class="clear"></div>
        </div>
    </div>
    <div class="article-footer">
        <h3>${tagsLabel}</h3>
        <ul>
            <#list article.articleTags?split(",") as articleTag>
            <li>
                <a rel="tag" href="${servePath}/tags/${articleTag?url('UTF-8')}">
                    ${articleTag}
                </a>
            </li>
            </#list>
            <li>
                <a href="${servePath}${article.articlePermalink}">
                    ${createDateLabel}:${article.articleCreateDate?string("yyyy-MM-dd HH:mm")}
                </a>
            </li>
        </ul>
    </div>
    <div class="clear"></div>
</div>
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
</#if>