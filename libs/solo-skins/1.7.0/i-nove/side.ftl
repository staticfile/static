<div id="sideNavi" class="side-navi">
    <#if "" != noticeBoard>
    <div class="item">
        <h4>${noticeBoardLabel}</h4>
        <div class="marginLeft12 marginTop12">
            ${noticeBoard}
        </div>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != recentComments?size>
    <div class="item navi-comments">
        <h4>${recentCommentsLabel}</h4>
        <ul>
            <#list recentComments as comment>
            <li>
                <img class='left' title='${comment.commentName}'
                     alt='${comment.commentName}'
                     src='${comment.commentThumbnailURL}'/>
                <div class='left'>
                    <div>
                        <a target="_blank" href="${comment.commentURL}">
                            ${comment.commentName}
                        </a>
                    </div>
                    <div>
                        <a rel="nofollow" title="${comment.commentContent}" class='side-comment' href="${servePath}${comment.commentSharpURL}">
                            ${comment.commentContent}
                        </a>
                    </div>
                </div>
                <div class='clear'></div>
            </li>
            </#list>
        </ul>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != mostCommentArticles?size>
    <div class="item">
        <h4>${mostCommentArticlesLabel}</h4>
        <ul id="mostCommentArticles">
            <#list mostCommentArticles as article>
            <li>
                <a rel="nofollow" title="${article.articleTitle}"
                   href="${servePath}${article.articlePermalink}">
                    <sup>[${article.articleCommentCount}]</sup>
                    ${article.articleTitle}
                </a>
            </li>
            </#list>
        </ul>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != mostViewCountArticles?size>
    <div class="item"><h4>${mostViewCountArticlesLabel}</h4>
        <ul id="mostViewCountArticles">
            <#list mostViewCountArticles as article>
            <li>
                <a rel="nofollow" title="${article.articleTitle}"
                   href="${servePath}${article.articlePermalink}">
                    <sup>[${article.articleViewCount}]</sup>
                    ${article.articleTitle}
                </a>
            </li>
            </#list>
        </ul>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != mostUsedTags?size>
    <div class="item">
        <h4>${popTagsLabel}</h4>
        <ul class="navi-tags">
            <#list mostUsedTags as tag>
            <li>
                <a rel="alternate" href="${servePath}/tag-articles-feed.do?oId=${tag.oId}">
                    <img alt="${tag.tagTitle}" src="${staticServePath}/images/feed.png"/>
                </a>
                <a rel="tag" title="${tag.tagTitle}(${tag.tagPublishedRefCount})" href="${servePath}/tags/${tag.tagTitle?url('UTF-8')}">
                    ${tag.tagTitle}</a>(${tag.tagPublishedRefCount})
            </li>
            </#list>
        </ul>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != links?size>
    <div class="item">
        <h4>${linkLabel}</h4>
        <ul id="sideLink" class="navi-tags">
            <#list links as link>
            <li>
                <a rel="friend" href="${link.linkAddress}" title="${link.linkTitle}" target="_blank">
                    <img alt="${link.linkTitle}" 
                         src="${faviconAPI}<#list link.linkAddress?split('/') as x><#if x_index=2>${x}<#break></#if></#list>" width="16" height="16" />
                    ${link.linkTitle}
                </a>
            </li>
            </#list>
        </ul>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != archiveDates?size>
    <div class="item">
        <h4>${archiveLabel}</h4>
        <ul>
            <#list archiveDates as archiveDate>
            <li>
                <#if "en" == localeString?substring(0, 2)>
                <a href="${servePath}/archives/${archiveDate.archiveDateYear}/${archiveDate.archiveDateMonth}"
                   title="${archiveDate.monthName} ${archiveDate.archiveDateYear}(${archiveDate.archiveDatePublishedArticleCount})">
                    ${archiveDate.monthName} ${archiveDate.archiveDateYear}</a>(${archiveDate.archiveDatePublishedArticleCount})
                <#else>
                <a href="${servePath}/archives/${archiveDate.archiveDateYear}/${archiveDate.archiveDateMonth}"
                   title="${archiveDate.archiveDateYear} ${yearLabel} ${archiveDate.archiveDateMonth} ${monthLabel}(${archiveDate.archiveDatePublishedArticleCount})">
                    ${archiveDate.archiveDateYear} ${yearLabel} ${archiveDate.archiveDateMonth} ${monthLabel}</a>(${archiveDate.archiveDatePublishedArticleCount})
                </#if>
            </li>
            </#list>
        </ul>
    </div>
    </#if>
</div>
