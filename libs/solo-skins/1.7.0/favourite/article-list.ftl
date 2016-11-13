<#list articles as article>
<div class="article">
    <h2 class="article-title">
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
            <div class="substance">
                ${article.articleAbstract}
                <div class="clear"></div>
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
                <a rel="tag" href="${servePath}/tags/${articleTag?url('UTF-8')}">
                    ${articleTag}</a><#if articleTag_has_next>,</#if>
            </span>
            </#list>
        </div>
        <a rel="nofollow" href="${servePath}${article.articlePermalink}#comments" class="left">
            <span class="left articles-commentIcon" title="${commentLabel}"></span>
            <span class="count">${article.articleCommentCount}</span>
        </a>
        <div class="right more">
            <a href="${servePath}${article.articlePermalink}" class="right">
                ${readmoreLabel}
            </a>
        </div>
        <div class="clear"></div>
    </div>
    <div class="footer">
        <div class="clear"></div>
    </div>
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