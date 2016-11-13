<#list articles as article>
<div class="row article">
    <h2 class="row article-title">
        <a rel="bookmark" href="${servePath}${article.articlePermalink}">
            ${article.articleTitle}
        </a>
    </h2>

    <div class="row article-tags">
        <#list article.articleTags?split(",") as articleTag>
        <a rel="tag" href="${servePath}/tags/${articleTag?url('UTF-8')}">
            ${articleTag}</a><#if articleTag_has_next>, </#if>
        </#list>
    </div>

    <div class="row article-date">
        <#setting locale="en_US">
        ${article.articleCreateDate?string("MMMM d, yyyy")}
        <#setting locale=localeString>
    </div>

    <div class="row article-content">
        <div class="col-sm-12" id="abstract${article.oId}">
            ${article.articleAbstract}
        </div>
    </div>
</div>
</#list>

<div class="row">
    <div class="col-sm-2"></div>
    
    <div class="col-sm-4">
    <#if 1 < paginationCurrentPageNum>
    <#assign prePage = paginationCurrentPageNum - 1>
    <a class="btn btn-success" href="${servePath}${path}/${prePage}">Newer</a>
    </#if>
    </div>
    
    <div class="col-sm-4 text-right">
    <#if paginationCurrentPageNum < paginationPageCount>
    <#assign nextPage = paginationCurrentPageNum + 1>
    <a class="btn btn-success" href="${servePath}${path}/${nextPage}">Older</a>
    </#if>
    </div>
    
    <div class="col-sm-2"></div>
</div>