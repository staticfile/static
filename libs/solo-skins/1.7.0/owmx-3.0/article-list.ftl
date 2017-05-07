<#list articles as article>
<h1>
    <a rel="bookmark" href="${servePath}${article.articlePermalink}">
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
</h1>
<div class="article-body">${article.articleAbstract}</div>
<section class="meta">
    <p>
        ${author1Label}<a rel="nofollow" href="${servePath}/authors/${article.authorId}">${article.authorName}</a> |
        <#if article.hasUpdated>
        ${updateDateLabel}:
	    ${article.articleUpdateDate?string("yyyy-MM-dd HH:mm")}
        <#else>
        ${createDateLabel}:
	    ${article.articleCreateDate?string("yyyy-MM-dd HH:mm")}
        </#if> | ${viewCount1Label} <a rel="nofollow" href="${servePath}${article.articlePermalink}">
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
            <a rel="tag" href="${servePath}/tags/${articleTag?url('UTF-8')}">
	            ${articleTag}
            </a><#if articleTag_has_next>,</#if>
        </span>
        </#list>
    </p>
</section>
</#list>
<#if 0 != paginationPageCount>
<div>
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