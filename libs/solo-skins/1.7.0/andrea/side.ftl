<#if "" != noticeBoard>
<div class="item" style="margin-top: -35px;">
    <h4>${noticeBoardLabel}</h4>
    <div class="marginLeft12 marginTop12">
        ${noticeBoard}
    </div>
</div>
</#if>
<#if 0 != recentComments?size || 0 != mostCommentArticles?size || 0 != mostViewCountArticles?size>
<div class="item">
    <dl>
        <#if 0 != mostCommentArticles?size>
        <dd>
            <h4>${mostCommentArticlesLabel}</h4>
            <ul>
                <#list mostCommentArticles as article>
                <li>
                    <a rel="nofollow" title="${article.articleTitle}" href="${servePath}${article.articlePermalink}">
                        <sup>[${article.articleCommentCount}]</sup>
                        ${article.articleTitle}
                    </a>
                </li>
                </#list>
            </ul>
        </dd>
        </#if>
        <#if 0 != recentComments?size>
        <dd>
            <h4>${recentCommentsLabel}</h4>
            <ul id="naviComments">
                <#list recentComments as comment>
                <li>
                    <a class="author" title="${comment.commentName}" target="_blank" href="${comment.commentURL}">
                        ${comment.commentName}
                    </a>:
                    <a rel="nofollow" title="${comment.commentContent}" class='side-comment' href="${servePath}/${comment.commentSharpURL}">
                        ${comment.commentContent}
                    </a>
                </li>
                </#list>
            </ul>
        </dd>
        </#if>
        <#if 0 != mostViewCountArticles?size>
        <dd>
            <h4>${mostViewCountArticlesLabel}</h4>
            <ul>
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
        </dd>
        </#if>
    </dl>
</div>
</#if>
<#if 0 != mostUsedTags?size>
<div class="item">
    <dl>
        <dd>
            <h4>${popTagsLabel}</h4>
            <ul class="navi-tags">
                <#list mostUsedTags as tag>
                <li>
                    <a rel="tag" title="${tag.tagTitle}(${tag.tagPublishedRefCount})" href="${servePath}/tags/${tag.tagTitle?url('UTF-8')}">
                        ${tag.tagTitle}(${tag.tagPublishedRefCount})</a>
                    <img onclick="window.location='${servePath}/tag-articles-feed.do?oId=${tag.oId}'"
                         alt="${tag.tagTitle}" src="${staticServePath}/images/feed.png"/>
                </li>
                </#list>
            </ul>
        </dd>
    </dl>
</div>
</#if>
<#if 0 != links?size>
<div class="item">
    <dl>
        <dd>
            <h4>${linkLabel}</h4>
            <ul class="navi-tags">
                <#list links as link>
                <li>
                    <a rel="friend" href="${link.linkAddress}" title="${link.linkTitle}" target="_blank">
                        ${link.linkTitle}</a>
                     <img onclick="window.location='${link.linkAddress}'"
                         alt="${link.linkTitle}" 
                         src="${faviconAPI}<#list link.linkAddress?split('/') as x><#if x_index=2>${x}<#break></#if></#list>" width="16" height="16" />
                </li>
                </#list>
            </ul>
        </dd>
    </dl>
</div>
</#if>
<#if 0 != archiveDates?size>
<div class="item">
    <dl>
        <dd>
            <h4>${archiveLabel}</h4>
            <ul>
                <#list archiveDates as archiveDate>
                <li>
                    <#if "en" == localeString?substring(0, 2)>
                    <a href="${servePath}/archives/${archiveDate.archiveDateYear}/${archiveDate.archiveDateMonth}"
                       title="${archiveDate.monthName} ${archiveDate.archiveDateYear}(${archiveDate.archiveDatePublishedArticleCount})">
                        ${archiveDate.monthName} ${archiveDate.archiveDateYear}(${archiveDate.archiveDatePublishedArticleCount})</a>
                    <#else>
                    <a href="${servePath}/archives/${archiveDate.archiveDateYear}/${archiveDate.archiveDateMonth}"
                       title="${archiveDate.archiveDateYear} ${yearLabel} ${archiveDate.archiveDateMonth} ${monthLabel}(${archiveDate.archiveDatePublishedArticleCount})">
                        ${archiveDate.archiveDateYear} ${yearLabel} ${archiveDate.archiveDateMonth} ${monthLabel}(${archiveDate.archiveDatePublishedArticleCount})</a>
                    </#if>
                </li>
                </#list>
            </ul>
        </dd>
    </dl>
</div>
</#if>