<#list articles as article>
<div class="article">
    <h2>
        <span class="left">
        <a rel="bookmark" class="article-title" href="${servePath}${article.articlePermalink}">
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
        </span>
        <span class="expand-ico" onclick="getArticle(this, '${article.oId}');"></span>
        <span class="clear"></span>
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
        <div id="abstract${article.oId}">
            ${article.articleAbstract}
        </div>
        <div id="content${article.oId}" class="none"></div>
    </div>
    <div class="article-element">
        <span class="tag-ico" title="${tagsLabel}">
            <#list article.articleTags?split(",") as articleTag>
            <a rel="tag" href="${servePath}/tags/${articleTag?url('UTF-8')}">
                ${articleTag}</a><#if articleTag_has_next>,</#if>
            </#list>
        </span>
    </div>
</div>
</#list>
<#if 0 != paginationPageCount>
<div class="pagination">
    <#if 1 != paginationPageNums?first>
    <a href="${servePath}${path}/1" title="${firstPageLabel}"><</a>
    <a href="${servePath}${path}/${paginationPreviousPageNum}" title="${previousPageLabel}"><<</a>
    </#if>
    <#list paginationPageNums as paginationPageNum>
    <#if paginationPageNum == paginationCurrentPageNum>
    <a href="${servePath}${path}/${paginationPageNum}" class="current">${paginationPageNum}</a>
    <#else>
    <a href="${servePath}${path}/${paginationPageNum}">${paginationPageNum}</a>
    </#if>
    </#list>
    <#if paginationPageNums?last != paginationPageCount>
    <a href="${servePath}${path}/${paginationNextPageNum}" title="${nextPagePabel}">></a>
    <a href="${servePath}${path}/${paginationPageCount}" title="${lastPageLabel}">>></a>
    </#if>
    &nbsp;&nbsp;${sumLabel} ${paginationPageCount} ${pageLabel}
</div>
</#if>