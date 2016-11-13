<div id="sideNavi">
    <div id="statistic">
        <div>
            ${viewCount1Label}
            <span class='error-msg'>
                ${statistic.statisticBlogViewCount}
            </span>
        </div>
        <div>
            ${articleCount1Label}
            <span class='error-msg'>
                ${statistic.statisticPublishedBlogArticleCount}
            </span>
        </div>
        <div>
            ${commentCount1Label}
            <span class='error-msg'>
                ${statistic.statisticPublishedBlogCommentCount}
            </span>
        </div>
    </div>
    <#if "" != noticeBoard>
    <div class="block notice">
        <h3>${noticeBoardLabel}</h3>
        <div>${noticeBoard}</div>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != recentComments?size>
    <div class="block">
        <h3 id="recentCommentsLabel">${recentCommentsLabel}</h3>
        <ul id="recentComments">
            <#list recentComments as comment>
            <li>
                <a rel="nofollow" href="${servePath}${comment.commentSharpURL}" title="${comment.commentContent}">
                    ${comment.commentName}: ${comment.commentContent}
                </a>
            </li>
            </#list>
        </ul>
        <div class='clear'></div>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != mostCommentArticles?size>
    <div class="block mostCommentArticles">
        <h3>${mostCommentArticlesLabel}</h3>
        <ul id="mostCommentArticles">
            <#list mostCommentArticles as article>
            <li>
                <a rel="nofollow" title="${article.articleTitle}" href="${servePath}${article.articlePermalink}">
                    <sup>[${article.articleCommentCount}]</sup>${article.articleTitle}
                </a>
            </li>
            </#list>
        </ul>
        <div class='clear'></div>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != mostViewCountArticles?size>
    <div class="block mostViewCountArticles">
        <h3>${mostViewCountArticlesLabel}</h3>
        <ul id="mostViewCountArticles">
            <#list mostViewCountArticles as article>
            <li>
                <a rel="nofollow" title="${article.articleTitle}" href="${servePath}${article.articlePermalink}">
                    <sup>[${article.articleViewCount}]</sup>${article.articleTitle}
                </a>
            </li>
            </#list>
        </ul>
        <div class='clear'></div>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != mostUsedTags?size>
    <div class="block popTags">
        <h3>${popTagsLabel}</h3>
        <ul>
            <#list mostUsedTags as tag>
            <li>
                <a rel="tag" title="${tag.tagTitle}(${tag.tagPublishedRefCount})" href="${servePath}/tags/${tag.tagTitle?url('UTF-8')}">
                    ${tag.tagTitle}(${tag.tagPublishedRefCount})
                </a>
                <img onclick="window.location='${servePath}/tag-articles-feed.do?oId=${tag.oId}'"
                     alt="${tag.tagTitle}" src="${staticServePath}/images/feed.png"/>
            </li>
            </#list>
        </ul>
        <div class='clear'></div>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != links?size>
    <div class="block popTags">
        <h3>${linkLabel}</h3>
        <ul id="sideLink">
            <#list links as link>
            <li>
                <a rel="friend" href="${link.linkAddress}" title="${link.linkTitle}" target="_blank">
                    ${link.linkTitle}
                </a>
                <img onclick="window.location='${link.linkAddress}'"
                     alt="${link.linkTitle}" 
                     src="${faviconAPI}<#list link.linkAddress?split('/') as x><#if x_index=2>${x}<#break></#if></#list>" width="16" height="16" />
            </li>
            </#list>
        </ul>
        <div class='clear'></div>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != archiveDates?size>
    <div class="block">
        <h3>${archiveLabel}</h3>
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
        <div class='clear'></div>
    </div>
    <div class="line"></div>
    </#if>
    <#if 1 != users?size>
    <div class="block">
        <h3>${authorLabel}</h3>
        <ul>
            <#list users as user>
            <li>
                <a class="star-icon" href="${servePath}/authors/${user.oId}">
                    ${user.userName}
                </a>
            </li>
            </#list>
        </ul>
        <div class='clear'></div>
    </div>
    </#if>
</div>
